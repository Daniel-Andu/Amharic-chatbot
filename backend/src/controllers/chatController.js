const dbService = require('../database/database');
const aiService = require('../services/aiService.huggingface'); // Use Hugging Face AI service
const memoryStore = require('../services/memoryStore'); // Use memory store
const { v4: uuidv4 } = require('uuid');

exports.startConversation = async (req, res) => {
    try {
        const sessionId = uuidv4();

        // Enhanced language detection - check if request contains Amharic characters or language parameter
        let detectedLanguage = 'en'; // Default to English
        const amharicPattern = /[\u1200-\u137F]/;
        if (req.body.language) {
            detectedLanguage = req.body.language;
        } else if (req.body.user_name && amharicPattern.test(req.body.user_name)) {
            detectedLanguage = 'am';
        }

        // Try database first, fallback to memory mode
        try {
            const result = await dbService.pool.query(
                `INSERT INTO conversations (session_id, user_ip, user_agent, language, user_name, email)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [sessionId, req.ip, req.headers['user-agent'], detectedLanguage, 'Guest User', 'guest@example.com']
            );
            res.json({ conversation: result.rows[0] });
        } catch (dbError) {
            console.log('⚠️ Database unavailable, using memory mode');
            // Fallback: save to memory store
            memoryStore.saveConversation(sessionId, {
                session_id: sessionId,
                language: detectedLanguage,
                started_at: new Date(),
                status: 'active',
                user_ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            res.json({
                conversation: {
                    session_id: sessionId,
                    language: detectedLanguage,
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
        console.log('🔥 sendMessage called with body:', req.body);
        const { sessionId, message, messageType = 'text' } = req.body;

        // Enhanced language detection - check if message contains Amharic characters
        let detectedLanguage = 'en'; // Default to English
        const amharicPattern = /[\u1200-\u137F]/;
        if (amharicPattern.test(message)) {
            detectedLanguage = 'am';
        } else if (req.body.language) {
            detectedLanguage = req.body.language;
        }

        console.log('🔥 Detected language:', detectedLanguage);

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Message and session ID required' });
        }

        const startTime = Date.now();

        // Get AI response using Hugging Face service
        console.log('🔥 About to call AI service with message:', message, 'language:', detectedLanguage);
        const aiResponse = await aiService.getResponse(message, detectedLanguage);
        console.log('🔥 AI service responded with:', aiResponse.response);
        const responseTime = Date.now() - startTime;

        // Try database operations, fallback to memory mode
        try {
            // Get conversation by session_id
            const convResult = await dbService.pool.query(
                'SELECT * FROM conversations WHERE session_id = $1',
                [sessionId]
            );

            if (convResult.rows.length === 0) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            const conversation = convResult.rows[0];

            // Save message
            const messageResult = await dbService.pool.query(
                `INSERT INTO messages (conversation_id, message_type, user_message, ai_response, 
       confidence_score, language, response_time_ms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [conversation.id, 'text', message, aiResponse.response,
                aiResponse.confidence, detectedLanguage, responseTime]
            );

            // Update conversation message count
            await dbService.pool.query(
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

        const result = await dbService.pool.query(
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

        await dbService.pool.query(
            'UPDATE conversations SET ended_at = CURRENT_TIMESTAMP WHERE session_id = $1',
            [sessionId]
        );

        res.json({ message: 'Conversation ended' });
    } catch (error) {
        console.error('End conversation error:', error);
        res.status(500).json({ error: 'Failed to end conversation' });
    }
};
