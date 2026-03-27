const pool = require('../config/database');
const memoryStore = require('../services/memoryStore');

exports.getStats = async (req, res) => {
    try {
        console.log('🔢 Fetching dashboard stats...');

        // Total conversations
        const totalChats = await pool.query(
            'SELECT COUNT(*) as count FROM conversations'
        );
        console.log(`💬 Total conversations found: ${totalChats.rows[0].count}`);

        // Total messages
        const totalMessages = await pool.query(
            'SELECT COUNT(*) as count FROM messages'
        );
        console.log(`📨 Total messages found: ${totalMessages.rows[0].count}`);

        // Average confidence score
        let avgConfidence = { rows: [{ avg: 0 }] };
        try {
            avgConfidence = await pool.query(
                'SELECT AVG(confidence_score) as avg FROM messages WHERE confidence_score IS NOT NULL'
            );
            console.log(`📊 Average confidence: ${avgConfidence.rows[0].avg}`);
        } catch (confError) {
            console.log('⚠️ Confidence query failed:', confError.message);
        }

        // Today's stats
        const todayChats = await pool.query(
            `SELECT COUNT(*) as count FROM conversations 
       WHERE DATE(started_at) = CURRENT_DATE`
        );
        console.log(`📅 Today's conversations: ${todayChats.rows[0].count}`);

        // Escalation rate
        const escalated = await pool.query(
            'SELECT COUNT(*) as count FROM conversations WHERE escalated = true'
        );
        console.log(`🚨 Escalated conversations: ${escalated.rows[0].count}`);

        // Language distribution
        let languageStats = { rows: [] };
        try {
            languageStats = await pool.query(
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

        const result = await pool.query(query, params);

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
        c.user_name as username,
        c.email,
        MIN(c.started_at) as created_at,
        MAX(c.started_at) as last_conversation,
        COUNT(c.id) as conversation_count,
        COUNT(CASE WHEN c.started_at > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_conversations,
        AVG(m.confidence_score) as avg_confidence,
        STRING_AGG(DISTINCT c.language, ', ' ORDER BY c.language) as languages,
        BOOL_OR(c.escalated) as has_escalated
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.user_name IS NOT NULL AND c.user_name != ''
    `;

        const params = [];
        let paramIndex = 1;

        if (language && language !== 'all') {
            query += ` AND c.language = $${paramIndex}`;
            params.push(language);
            paramIndex++;
        }

        query += ` 
      GROUP BY c.user_name, c.email
      ORDER BY last_conversation DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit, offset);

        console.log('📝 Users query:', query);
        console.log('📝 Users params:', params);

        const result = await pool.query(query, params);
        console.log(`👥 Found ${result.rows.length} users`);

        // Get total count
        const countQuery = `
      SELECT COUNT(DISTINCT c.user_name) as count 
      FROM conversations c 
      WHERE c.user_name IS NOT NULL AND c.user_name != ''
    `;

        const countResult = await pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count);

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
                conversationCount: parseInt(user.conversation_count) || 0,
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

        res.json({
            users: formattedUsers,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        console.log('🔍 Fetching conversations with params:', req.query);
        const { page = 1, limit = 20, startDate, endDate, keyword, escalated } = req.query;
        const offset = (page - 1) * limit;

        // Simple query without subqueries to avoid type issues
        let query = `
      SELECT c.*, c.id as conversation_id
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
            query += ` AND (c.user_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
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

        const result = await pool.query(query, params);

        // Get message data separately for each conversation
        const conversationsWithDetails = await Promise.all(result.rows.map(async (conv) => {
            try {
                console.log(`🔍 Processing conversation: ${conv.session_id} (ID: ${conv.conversation_id})`);

                // Get message count with proper parameter binding using integer ID
                const messageCountQuery = {
                    text: 'SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1',
                    values: [conv.conversation_id] // Use integer ID instead of UUID
                };
                const messageCountResult = await pool.query(messageCountQuery);
                const messageCount = parseInt(messageCountResult.rows[0].count) || 0;
                console.log(`📨 Messages for ${conv.session_id}: ${messageCount}`);

                // Get average confidence with proper parameter binding using integer ID
                const confidenceQuery = {
                    text: 'SELECT AVG(confidence_score) as avg_confidence FROM messages WHERE conversation_id = $1 AND confidence_score IS NOT NULL',
                    values: [conv.conversation_id] // Use integer ID instead of UUID
                };
                const confidenceResult = await pool.query(confidenceQuery);
                const avgConfidence = confidenceResult.rows[0].avg_confidence ? Math.round(parseFloat(confidenceResult.rows[0].avg_confidence) * 100) : 0;
                console.log(`📊 Confidence for ${conv.session_id}: ${avgConfidence}%`);

                return {
                    ...conv,
                    id: conv.session_id, // Frontend expects 'id'
                    user: conv.user_name || 'Guest User', // Frontend expects 'user'
                    email: conv.email || 'guest@example.com',
                    language: conv.language === 'am' ? 'amharic' : 'english', // Frontend expects 'amharic'/'english'
                    status: conv.escalated ? 'escalated' : 'active', // Frontend expects status
                    duration: conv.ended_at ?
                        Math.round((new Date(conv.ended_at) - new Date(conv.started_at)) / 1000) :
                        Math.round((new Date() - new Date(conv.started_at)) / 1000),
                    messageCount: messageCount, // Real message count from database
                    avgConfidence: avgConfidence, // Real confidence from database
                    satisfaction: 4 // Default satisfaction - could be calculated from feedback later
                };
            } catch (error) {
                console.error('Error processing conversation:', conv.session_id, error);
                return {
                    ...conv,
                    id: conv.session_id,
                    user: conv.user_name || 'Guest User',
                    email: conv.email || 'guest@example.com',
                    language: conv.language === 'am' ? 'amharic' : 'english',
                    status: 'active',
                    duration: null,
                    messageCount: 0,
                    avgConfidence: 0,
                    satisfaction: 4
                };
            }
        }));

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
            countQuery += ` AND (c.user_name ILIKE $${countParamIndex} OR c.email ILIKE $${countParamIndex})`;
            countParams.push(`%${keyword}%`);
            countParamIndex++;
        }

        if (escalated === 'true') {
            countQuery += ` AND c.escalated = true`;
        }

        const countResult = await pool.query(countQuery, countParams);
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
        const convResult = await pool.query(convQuery, [id]);

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
        const conversationResult = await pool.query(conversationQuery, [id]);

        // Get actual messages using the integer ID
        const messagesQuery = `
            SELECT m.*, 
                   EXTRACT(EPOCH FROM (m.created_at)) as timestamp
            FROM messages m
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC
        `;
        const messagesResult = await pool.query(messagesQuery, [conversationId]);

        const conversation = conversationResult.rows[0];

        // Format response for frontend
        const formattedConversation = {
            sessionId: conversation.session_id,
            id: conversation.session_id,
            user: conversation.user_name,
            email: conversation.email,
            language: conversation.language === 'am' ? 'amharic' : 'english',
            status: conversation.escalated ? 'escalated' : 'active',
            duration: conversation.ended_at ?
                Math.round((new Date(conversation.ended_at) - new Date(conversation.started_at)) / 1000) :
                Math.round((new Date() - new Date(conversation.started_at)) / 1000),
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
                            timestamp: new Date(msg.created_at).toLocaleString()
                        },
                        {
                            id: msg.id + '_ai',
                            type: 'ai',
                            content: msg.ai_response || 'No content available',
                            confidence: msg.confidence_score ? Math.round(parseFloat(msg.confidence_score) * 100) : null,
                            timestamp: new Date(msg.created_at).toLocaleString()
                        }
                    ];
                } else {
                    // For other message types
                    return {
                        id: msg.id,
                        type: msg.message_type,
                        content: msg.user_message || msg.ai_response || 'No content available',
                        confidence: msg.confidence_score ? Math.round(parseFloat(msg.confidence_score) * 100) : null,
                        timestamp: new Date(msg.created_at).toLocaleString()
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

        // Get recent conversations (last 5 minutes)
        const recentConversations = await pool.query(`
            SELECT session_id, user_name, language, started_at 
            FROM conversations 
            WHERE started_at > NOW() - INTERVAL '5 minutes'
            ORDER BY started_at DESC 
            LIMIT 5
        `);

        recentConversations.rows.forEach(conv => {
            notifications.push({
                id: `conv_${conv.session_id}`,
                type: 'conversation',
                message: `New conversation started by ${conv.user_name || 'Guest User'} (${conv.language === 'am' ? 'አማርኛ' : 'English'})`,
                time: 'Just now',
                unread: true,
                priority: 'high',
                actionUrl: `/conversations?session=${conv.session_id}`
            });
        });

        // Get escalated conversations (last hour)
        const escalatedConversations = await pool.query(`
            SELECT session_id, user_name, started_at 
            FROM conversations 
            WHERE escalated = true AND started_at > NOW() - INTERVAL '1 hour'
            ORDER BY started_at DESC 
            LIMIT 3
        `);

        escalatedConversations.rows.forEach(conv => {
            notifications.push({
                id: `escal_${conv.session_id}`,
                type: 'escalation',
                message: `Conversation escalated by ${conv.user_name || 'Guest User'}`,
                time: 'Recently',
                unread: true,
                priority: 'urgent',
                actionUrl: `/conversations?session=${conv.session_id}`
            });
        });

        // Get low confidence conversations (below 50%)
        const lowConfidenceConversations = await pool.query(`
            SELECT DISTINCT c.session_id, c.user_name, AVG(m.confidence_score) as avg_confidence
            FROM conversations c
            JOIN messages m ON c.id = m.conversation_id
            WHERE m.confidence_score < 0.5 
            AND c.started_at > NOW() - INTERVAL '30 minutes'
            GROUP BY c.session_id, c.user_name
            ORDER BY avg_confidence ASC
            LIMIT 3
        `);

        lowConfidenceConversations.rows.forEach(conv => {
            notifications.push({
                id: `confidence_${conv.session_id}`,
                type: 'confidence',
                message: `Low confidence (${Math.round(conv.avg_confidence * 100)}%) in conversation with ${conv.user_name || 'Guest User'}`,
                time: 'Recently',
                unread: true,
                priority: 'medium',
                actionUrl: `/conversations?session=${conv.session_id}`
            });
        });

        // System notifications
        const totalConversations = await pool.query('SELECT COUNT(*) as count FROM conversations WHERE DATE(started_at) = CURRENT_DATE');
        const todayCount = parseInt(totalConversations.rows[0].count);

        if (todayCount > 0 && todayCount % 10 === 0) {
            notifications.push({
                id: `milestone_${Date.now()}`,
                type: 'milestone',
                message: `Milestone: ${todayCount} conversations today!`,
                time: 'Just now',
                unread: true,
                priority: 'low',
                actionUrl: '/dashboard'
            });
        }

        // Sort by priority and time
        const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
        notifications.sort((a, b) => {
            if (a.priority !== b.priority) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
        });

        console.log(`🔔 Found ${notifications.length} notifications`);

        res.json({
            notifications: notifications.slice(0, 20), // Limit to 20 most recent
            total: notifications.length,
            unreadCount: notifications.filter(n => n.unread).length
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
