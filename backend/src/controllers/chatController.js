const pool = require('../config/database');
const aiService = require('../services/aiService.fallback'); // Use fallback AI service
const memoryStore = require('../services/memoryStore'); // Use memory store
const { v4: uuidv4 } = require('uuid');

exports.startConversation = async (req, res) => {
    try {
        const sessionId = uuidv4();
        const { language = 'am' } = req.body;

        // Try database first, fallback to memory mode
        try {
            const result = await pool.query(
                `INSERT INTO conversations (session_id, user_ip, user_agent, language, user_name, email)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [sessionId, req.ip, req.headers['user-agent'], language, 'Guest User', 'guest@example.com']
            );
            res.json({ conversation: result.rows[0] });
        } catch (dbError) {
            console.log('⚠️ Database unavailable, using memory mode');
            // Fallback: save to memory store
            memoryStore.saveConversation(sessionId, {
                session_id: sessionId,
                language,
                started_at: new Date(),
                status: 'active',
                user_ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            res.json({
                conversation: {
                    session_id: sessionId,
                    language,
                    started_at: new Date(),
                    status: 'active'
                }
            });
        }
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { sessionId, message, messageType = 'text', language = 'am' } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Message and session ID required' });
        }

        const startTime = Date.now();

        // Get AI response using original service
        const aiResponse = await aiService.getResponse(message, language);
        const responseTime = Date.now() - startTime;

        // Try database operations, fallback to memory mode
        try {
            // Get conversation
            const convResult = await pool.query(
                'SELECT * FROM conversations WHERE session_id = $1',
                [sessionId]
            );

            if (convResult.rows.length === 0) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            const conversation = convResult.rows[0];

            // Track top questions
            await pool.query(
                `INSERT INTO top_questions (question, question_normalized, language, ask_count, last_asked)
         VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (question_normalized, language) 
         DO UPDATE SET ask_count = top_questions.ask_count + 1, last_asked = CURRENT_TIMESTAMP`,
                [message, message.toLowerCase().trim(), language]
            );

            // Save message
            const messageResult = await pool.query(
                `INSERT INTO messages (conversation_id, message_type, user_message, ai_response, 
       confidence_score, language, response_time_ms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [conversation.id, messageType, message, aiResponse.response,
                aiResponse.confidence, language, responseTime]
            );

            // Update conversation
            await pool.query(
                'UPDATE conversations SET total_messages = total_messages + 1 WHERE id = $1',
                [conversation.id]
            );

            res.json({
                message: messageResult.rows[0],
                response: aiResponse.response,
                confidence: aiResponse.confidence,
                responseTime: responseTime
            });
        } catch (dbError) {
            console.log('⚠️ Database unavailable, using memory mode');

            // Use memory store
            const conversation = memoryStore.getConversation(sessionId);
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            // Track top questions in memory
            memoryStore.trackQuestion(message, language);

            // Save message to memory
            const savedMessage = memoryStore.saveMessage({
                conversation_id: sessionId,
                message_type: messageType,
                user_message: message,
                ai_response: aiResponse.response,
                confidence_score: aiResponse.confidence,
                language,
                response_time_ms: responseTime
            });

            res.json({
                response: aiResponse.response,
                confidence: aiResponse.confidence,
                sessionId,
                timestamp: new Date()
            });
        }
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

exports.getConversationHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await pool.query(
            `SELECT m.*, c.language 
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.session_id = $1
       ORDER BY m.created_at ASC`,
            [sessionId]
        );

        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
};

exports.endConversation = async (req, res) => {
    try {
        const { sessionId } = req.params;

        await pool.query(
            'UPDATE conversations SET ended_at = CURRENT_TIMESTAMP WHERE session_id = $1',
            [sessionId]
        );

        res.json({ message: 'Conversation ended' });
    } catch (error) {
        console.error('End conversation error:', error);
        res.status(500).json({ error: 'Failed to end conversation' });
    }
};
