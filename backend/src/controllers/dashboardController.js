const dbService = require('../database/database');
const memoryStore = require('../services/memoryStore');

exports.getStats = async (req, res) => {
    try {
        console.log('🔢 Fetching dashboard stats...');

        // Total conversations
        const totalChats = await dbService.pool.query(
            'SELECT COUNT(*) as count FROM conversations'
        );
        console.log(`💬 Total conversations found: ${totalChats.rows[0].count}`);

        // Total messages
        const totalMessages = await dbService.pool.query(
            'SELECT COUNT(*) as count FROM messages'
        );
        console.log(`📨 Total messages found: ${totalMessages.rows[0].count}`);

        // Average confidence score
        let avgConfidence = { rows: [{ avg: 0 }] };
        try {
            avgConfidence = await dbService.pool.query(
                'SELECT AVG(confidence_score) as avg FROM messages WHERE confidence_score IS NOT NULL'
            );
            console.log(`📊 Average confidence: ${avgConfidence.rows[0].avg}`);
        } catch (confError) {
            console.log('⚠️ Confidence query failed:', confError.message);
        }

        // Today's stats
        const todayChats = await dbService.pool.query(
            `SELECT COUNT(*) as count FROM conversations 
       WHERE DATE(started_at) = CURRENT_DATE`
        );
        console.log(`📅 Today's conversations: ${todayChats.rows[0].count}`);

        // Escalation rate
        const escalated = await dbService.pool.query(
            'SELECT COUNT(*) as count FROM conversations WHERE escalated = true'
        );
        console.log(`🚨 Escalated conversations: ${escalated.rows[0].count}`);

        // Language distribution
        let languageStats = { rows: [] };
        try {
            languageStats = await dbService.pool.query(
                'SELECT language, COUNT(*) as count FROM conversations GROUP BY language'
            );
            console.log('🌐 Language distribution:', languageStats.rows);
        } catch (langError) {
            console.log('⚠️ Language stats query failed:', langError.message);
        }

        const totalConversations = parseInt(totalChats.rows[0].count);
        const escalatedCount = parseInt(escalated.rows[0].count);
        const escalationRate = totalConversations > 0
            ? (escalatedCount / totalConversations * 100).toFixed(2)
            : 0;

        console.log('✅ Stats fetched successfully');

        res.json({
            metrics: {
                totalConversations: totalConversations,
                activeUsers: parseInt(todayChats.rows[0].count),
                avgResponseTime: 2.5,
                satisfactionRate: 94.2,
                aiAccuracy: parseFloat(avgConfidence.rows[0].avg || 0) * 100,
                totalMessages: parseInt(totalMessages.rows[0].count),
                escalationRate: parseFloat(escalationRate)
            },
            languageDistribution: languageStats.rows,
            userGrowth: [],
            responseTimeData: [],
            confidenceTrends: [],
            topQuestions: [
                { question: 'What is the capital city of Ethiopia?', count: 15 },
                { question: 'What services do you offer?', count: 12 },
                { question: 'How can I help you today?', count: 8 }
            ],
            languageStats: languageStats.rows,
            todayChats: parseInt(todayChats.rows[0].count)
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

exports.getTopQuestions = async (req, res) => {
    try {
        const { limit = 10, language } = req.query;

        let query = `SELECT question, ask_count, last_asked, language 
                 FROM top_questions`;
        const params = [];

        if (language) {
            query += ' WHERE language = $1';
            params.push(language);
        }

        query += ' ORDER BY ask_count DESC LIMIT $' + (params.length + 1);
        params.push(limit);

        const result = await dbService.pool.query(query, params);

        res.json({ topQuestions: result.rows });
    } catch (error) {
        console.error('Get top questions error:', error);
        res.status(500).json({ error: 'Failed to fetch top questions' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        console.log('👥 Fetching users with params:', req.query);
        const { page = 1, limit = 20, language } = req.query;
        const offset = (page - 1) * limit;

        // Get unique users from conversations (including Guest Users)
        let query = `
      SELECT DISTINCT 
        c.session_id as username,
        'guest@example.com' as email,
        MIN(c.started_at) as created_at,
        MAX(c.started_at) as last_conversation,
        COUNT(c.id) as conversation_count,
        COUNT(CASE WHEN c.started_at > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_conversations,
        AVG(m.confidence_score) as avg_confidence,
        STRING_AGG(DISTINCT c.language, ', ' ORDER BY c.language) as languages,
        BOOL_OR(c.escalated) as has_escalated
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.session_id IS NOT NULL
    `;

        const params = [];
        let paramIndex = 1;

        if (language && language !== 'all') {
            query += ` AND c.language = $${paramIndex}`;
            params.push(language);
            paramIndex++;
        }

        query += ` 
      GROUP BY c.session_id
      ORDER BY last_conversation DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit, offset);

        console.log('📝 Users query:', query);
        console.log('📝 Users params:', params);

        const result = await dbService.pool.query(query, params);
        console.log(`👥 Found ${result.rows.length} users`);

        // Get total count
        const countQuery = `
      SELECT COUNT(DISTINCT c.session_id) as count 
      FROM conversations c 
      WHERE c.session_id IS NOT NULL
    `;

        if (language && language !== 'all') {
            countQuery += ` AND c.language = $1`;
        }

        const countResult = await dbService.pool.query(countQuery, language && language !== 'all' ? [language] : []);
        const total = parseInt(countResult.rows[0].count);

        console.log(`📊 Total users: ${total}`);

        // Format user data for frontend and calculate status
        const formattedUsers = result.rows.map(user => {
            const lastConversation = new Date(user.last_conversation);
            const now = new Date();
            const daysSinceLast = Math.floor((now - lastConversation) / (1000 * 60 * 60 * 24));

            let status = 'inactive';
            if (daysSinceLast <= 1) status = 'active';
            else if (daysSinceLast <= 7) status = 'recent';

            return {
                id: user.username,
                username: user.username,
                email: user.email || 'guest@example.com',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff`,
                status: status,
                languages: user.languages || 'Unknown',
                conversationCount: parseInt(user.conversation_count) || 1,
                recentConversations: parseInt(user.recent_conversations) || 0,
                avgConfidence: user.avg_confidence ? Math.round(parseFloat(user.avg_confidence) * 100) : 0,
                satisfaction: 4, // Default satisfaction
                lastSeen: user.last_conversation,
                registeredAt: user.created_at,
                hasEscalated: user.has_escalated,
                location: 'Addis Ababa, Ethiopia', // Simulated location
                device: 'Web Browser', // Simulated device
                timezone: 'GMT+3' // Simulated timezone
            };
        });

        console.log('✅ Users fetched successfully');
        res.json({
            users: formattedUsers,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('❌ Get users error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        console.log('🔍 Fetching conversations with params:', req.query);
        const { page = 1, limit = 20, startDate, endDate, keyword, escalated } = req.query;
        const offset = (page - 1) * limit;

        // Simple query without subqueries to avoid type issues
        let query = `
      SELECT c.*, c.id as conversation_id,
             (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as actual_message_count
      FROM conversations c
      WHERE 1=1
    `;

        const params = [];
        let paramIndex = 1;

        if (startDate && endDate) {
            query += ` AND c.started_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            params.push(startDate, endDate);
            paramIndex += 2;
        }

        if (keyword) {
            query += ` AND c.session_id ILIKE $${paramIndex}`;
            params.push(`%${keyword}%`);
            paramIndex++;
        }

        if (escalated === 'true') {
            query += ` AND c.escalated = true`;
        }

        query += `
      ORDER BY c.started_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit, offset);

        console.log('📝 Final query:', query);
        console.log('📝 Parameters:', params);

        const result = await dbService.pool.query(query, params);

        // Get message data separately for each conversation - simplified approach
        const conversationsWithDetails = result.rows.map(conv => {
            // Return basic conversation info without complex subqueries
            return {
                ...conv,
                id: conv.session_id, // Frontend expects 'id'
                user: 'Guest User', // Frontend expects 'user'
                email: 'guest@example.com',
                language: conv.language === 'am' ? 'amharic' : 'english', // Frontend expects 'amharic'/'english'
                status: conv.escalated ? 'escalated' : 'active', // Frontend expects status
                duration: conv.ended_at ?
                    Math.max(0, Math.round((new Date(conv.ended_at + 'Z') - new Date(conv.started_at + 'Z')) / (1000 * 60))) :
                    Math.max(0, Math.round((Date.now() - new Date(conv.started_at + 'Z').getTime()) / (1000 * 60))),
                messageCount: conv.actual_message_count || conv.total_messages || 0, // Use actual message count
                avgConfidence: 75, // Default confidence - will be calculated separately
                satisfaction: 4 // Default satisfaction
            };
        });

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM conversations c WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (startDate && endDate) {
            countQuery += ` AND c.started_at BETWEEN $${countParamIndex} AND $${countParamIndex + 1}`;
            countParams.push(startDate, endDate);
            countParamIndex += 2;
        }

        if (keyword) {
            countQuery += ` AND c.session_id ILIKE $${countParamIndex}`;
            countParams.push(`%${keyword}%`);
            countParamIndex++;
        }

        if (escalated === 'true') {
            countQuery += ` AND c.escalated = true`;
        }

        const countResult = await dbService.pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        console.log(`💬 Found ${conversationsWithDetails.length} conversations, total: ${total}`);

        res.json({
            conversations: conversationsWithDetails,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

exports.getConversationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching conversation details for:', id);

        // First get the conversation by session_id to find the integer ID
        const convQuery = 'SELECT * FROM conversations WHERE session_id = $1';
        const convResult = await dbService.pool.query(convQuery, [id]);

        if (convResult.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const convData = convResult.rows[0];
        const conversationId = convData.id; // This is the integer ID

        // Get conversation details using the integer ID
        const conversationQuery = `
            SELECT c.*, 
                   (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
                   (SELECT AVG(confidence_score) FROM messages WHERE conversation_id = c.id AND confidence_score IS NOT NULL) as avg_confidence
            FROM conversations c
            WHERE c.session_id = $1
        `;
        const conversationResult = await dbService.pool.query(conversationQuery, [id]);

        // Get actual messages using the integer ID
        const messagesQuery = `
            SELECT m.*
            FROM messages m
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC
        `;
        const messagesResult = await dbService.pool.query(messagesQuery, [conversationId]);

        const conversation = conversationResult.rows[0];

        // Format response for frontend
        const formattedConversation = {
            sessionId: conversation.session_id,
            id: conversation.session_id,
            user: 'Guest User',
            email: 'guest@example.com',
            language: conversation.language === 'am' ? 'amharic' : 'english',
            status: conversation.escalated ? 'escalated' : 'active',
            duration: conversation.ended_at ?
                Math.max(0, Math.round((new Date(conversation.ended_at + 'Z') - new Date(conversation.started_at + 'Z')) / (1000 * 60))) :
                Math.max(0, Math.round((Date.now() - new Date(conversation.started_at + 'Z').getTime()) / (1000 * 60))),
            messageCount: parseInt(conversation.message_count) || 0,
            avgConfidence: conversation.avg_confidence ? Math.round(parseFloat(conversation.avg_confidence) * 100) : 0,
            satisfaction: 4,
            started_at: conversation.started_at,
            ended_at: conversation.ended_at,
            messages: messagesResult.rows.map(msg => {
                // Determine message type and content based on message_type
                let type, content;
                if (msg.message_type === 'text') {
                    // For text messages, we need to determine if this is user or AI
                    // Since we store both user_message and ai_response in the same row,
                    // we'll create separate entries for each
                    return [
                        {
                            id: msg.id + '_user',
                            type: 'user',
                            content: msg.user_message || 'No content available',
                            confidence: null,
                            timestamp: new Date(msg.created_at).toString()
                        },
                        {
                            id: msg.id + '_ai',
                            type: 'ai',
                            content: msg.ai_response || 'No content available',
                            confidence: msg.confidence_score ? Math.round(parseFloat(msg.confidence_score) * 100) : null,
                            timestamp: new Date(msg.created_at).toString()
                        }
                    ];
                } else {
                    // For other message types
                    return {
                        id: msg.id,
                        type: msg.message_type,
                        content: msg.user_message || msg.ai_response || 'No content available',
                        confidence: msg.confidence_score ? Math.round(parseFloat(msg.confidence_score) * 100) : null,
                        timestamp: new Date(msg.created_at).toString()
                    };
                }
            }).flat() // Flatten the array to handle dual entries
        };

        console.log(`💬 Found conversation with ${formattedConversation.messages.length} messages`);

        res.json(formattedConversation);
    } catch (error) {
        console.error('Get conversation details error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation details' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        console.log('🔔 Fetching notifications...');

        const notifications = [];

        // Add simple fallback notifications
        notifications.push({
            id: 'system_1',
            type: 'system',
            message: 'System is running normally',
            time: 'Just now',
            unread: false,
            priority: 'low',
            actionUrl: '/dashboard'
        });

        res.json({ notifications });

    } catch (error) {
        console.error('Notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
