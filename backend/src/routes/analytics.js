const express = require('express');
const router = express.Router();
const dbService = require('../database/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = {};

        // Total conversations
        const conversationsResult = await dbService.pool.query('SELECT COUNT(*) as total FROM conversations');
        stats.total_conversations = parseInt(conversationsResult.rows[0].total);

        // Total messages
        const messagesResult = await dbService.pool.query('SELECT COUNT(*) as total FROM messages');
        stats.total_messages = parseInt(messagesResult.rows[0].total);

        // Active conversations today
        const todayResult = await dbService.pool.query(`
            SELECT COUNT(*) as total FROM conversations 
            WHERE DATE(started_at) = CURRENT_DATE
        `);
        stats.active_conversations_today = parseInt(todayResult.rows[0].total);

        // Average response time
        const responseTimeResult = await dbService.query(`
            SELECT AVG(response_time_ms) as avg_time FROM messages 
            WHERE response_time_ms IS NOT NULL
        `);
        stats.average_response_time = Math.round(responseTimeResult.rows[0].avg_time || 0);

        // Top questions
        const topQuestionsResult = await dbService.pool.query(`
            SELECT question, ask_count, language 
            FROM top_questions 
            ORDER BY ask_count DESC 
            LIMIT 10
        `);
        stats.top_questions = topQuestionsResult.rows;

        // Language distribution
        const languageResult = await dbService.pool.query(`
            SELECT language, COUNT(*) as count 
            FROM conversations 
            GROUP BY language
        `);
        stats.language_distribution = languageResult.rows;

        // Daily message count for last 7 days
        const dailyMessagesResult = await dbService.pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM messages 
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        stats.daily_messages = dailyMessagesResult.rows;

        // FAQ count
        const faqResult = await dbService.pool.query('SELECT COUNT(*) as total FROM faqs WHERE is_active = true');
        stats.total_faqs = parseInt(faqResult.rows[0].total);

        // User count
        const userResult = await dbService.pool.query('SELECT COUNT(*) as total FROM users');
        stats.total_users = parseInt(userResult.rows[0].total);

        res.json({
            stats,
            last_updated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get conversation analytics
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const language = req.query.language;

        let query = `
            SELECT c.*, 
                   COUNT(m.id) as message_count,
                   MAX(m.created_at) as last_message_at,
                   AVG(m.response_time_ms) as avg_response_time,
                   AVG(m.confidence_score) as avg_confidence,
                   CASE 
                       WHEN c.ended_at IS NOT NULL THEN 
                           EXTRACT(EPOCH FROM (c.ended_at - c.started_at))
                       ELSE NULL 
                   END as duration_seconds
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            WHERE 1=1
        `;
        let queryParams = [];
        let paramIndex = 1;

        if (dateFrom) {
            query += ` AND c.started_at >= $${paramIndex++}`;
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            query += ` AND c.started_at <= $${paramIndex++}`;
            queryParams.push(dateTo);
        }

        if (language) {
            query += ` AND c.language = $${paramIndex++}`;
            queryParams.push(language);
        }

        query += `
            GROUP BY c.id
            ORDER BY c.started_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        queryParams.push(limit, offset);

        const result = await dbService.pool.query(query, queryParams);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM conversations WHERE 1=1';
        let countParams = [];
        let countParamIndex = 1;

        if (dateFrom) {
            countQuery += ` AND started_at >= $${countParamIndex++}`;
            countParams.push(dateFrom);
        }

        if (dateTo) {
            countQuery += ` AND started_at <= $${countParamIndex++}`;
            countParams.push(dateTo);
        }

        if (language) {
            countQuery += ` AND language = $${countParamIndex++}`;
            countParams.push(language);
        }

        const countResult = await dbService.pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            conversations: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get conversations analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get message analytics
router.get('/messages', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;
        const language = req.query.language;
        const flagged = req.query.flagged;

        let query = `
            SELECT m.*, c.session_id, c.language as conversation_language
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE 1=1
        `;
        let queryParams = [];
        let paramIndex = 1;

        if (dateFrom) {
            query += ` AND m.created_at >= $${paramIndex++}`;
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            query += ` AND m.created_at <= $${paramIndex++}`;
            queryParams.push(dateTo);
        }

        if (language) {
            query += ` AND c.language = $${paramIndex++}`;
            queryParams.push(language);
        }

        if (flagged !== undefined) {
            query += ` AND m.flagged = $${paramIndex++}`;
            queryParams.push(flagged === 'true');
        }

        query += `
            ORDER BY m.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        queryParams.push(limit, offset);

        const result = await dbService.pool.query(query, queryParams);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE 1=1
        `;
        let countParams = [];
        let countParamIndex = 1;

        if (dateFrom) {
            countQuery += ` AND m.created_at >= $${countParamIndex++}`;
            countParams.push(dateFrom);
        }

        if (dateTo) {
            countQuery += ` AND m.created_at <= $${countParamIndex++}`;
            countParams.push(dateTo);
        }

        if (language) {
            countQuery += ` AND c.language = $${countParamIndex++}`;
            countParams.push(language);
        }

        if (flagged !== undefined) {
            countQuery += ` AND m.flagged = $${countParamIndex++}`;
            countParams.push(flagged === 'true');
        }

        const countResult = await dbService.pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            messages: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get messages analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get top questions analytics
router.get('/top-questions', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const language = req.query.language;

        let query = `
            SELECT question, question_normalized, language, ask_count, last_asked
            FROM top_questions
            WHERE 1=1
        `;
        let queryParams = [];
        let paramIndex = 1;

        if (language) {
            query += ` AND language = $${paramIndex++}`;
            queryParams.push(language);
        }

        query += `
            ORDER BY ask_count DESC, last_asked DESC
            LIMIT $${paramIndex++}
        `;
        queryParams.push(limit);

        const result = await dbService.pool.query(query, queryParams);

        res.json({
            top_questions: result.rows
        });

    } catch (error) {
        console.error('Get top questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get response quality metrics
router.get('/response-quality', authenticateToken, async (req, res) => {
    try {
        const dateFrom = req.query.date_from;
        const dateTo = req.query.date_to;

        let dateFilter = '';
        let queryParams = [];
        let paramIndex = 1;

        if (dateFrom) {
            dateFilter = ` AND m.created_at >= $${paramIndex++}`;
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            dateFilter += ` AND m.created_at <= $${paramIndex++}`;
            queryParams.push(dateTo);
        }

        // Average confidence score
        const confidenceResult = await dbService.pool.query(`
            SELECT AVG(confidence_score) as avg_confidence,
                   COUNT(*) as total_responses
            FROM messages 
            WHERE confidence_score IS NOT NULL ${dateFilter}
        `, queryParams);

        // Response time distribution
        const responseTimeResult = await dbService.query(`
            SELECT 
                CASE 
                    WHEN response_time_ms < 500 THEN 'Fast (< 500ms)'
                    WHEN response_time_ms < 1000 THEN 'Normal (500-1000ms)'
                    WHEN response_time_ms < 2000 THEN 'Slow (1000-2000ms)'
                    ELSE 'Very Slow (> 2000ms)'
                END as category,
                COUNT(*) as count
            FROM messages 
            WHERE response_time_ms IS NOT NULL ${dateFilter}
            GROUP BY category
            ORDER BY count DESC
        `, queryParams);

        // Flagged messages
        const flaggedResult = await dbService.pool.query(`
            SELECT 
                COUNT(*) as total_flagged,
                COUNT(*) * 100.0 / (SELECT COUNT(*) FROM messages WHERE 1=1 ${dateFilter}) as percentage
            FROM messages 
            WHERE flagged = true ${dateFilter}
        `, queryParams);

        // Language performance
        const languagePerformanceResult = await dbService.pool.query(`
            SELECT c.language,
                   AVG(m.confidence_score) as avg_confidence,
                   AVG(m.response_time_ms) as avg_response_time,
                   COUNT(*) as total_messages
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE 1=1 ${dateFilter}
            GROUP BY c.language
        `, queryParams);

        res.json({
            confidence_metrics: confidenceResult.rows[0],
            response_time_distribution: responseTimeResult.rows,
            flagged_messages: flaggedResult.rows[0],
            language_performance: languagePerformanceResult.rows
        });

    } catch (error) {
        console.error('Get response quality error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export analytics data
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const { type, format = 'json', date_from, date_to } = req.query;

        let data = [];
        let filename = '';
        let contentType = 'application/json';

        switch (type) {
            case 'conversations':
                const conversationsQuery = `
                    SELECT c.session_id, c.language, c.started_at, c.ended_at, c.total_messages,
                           COUNT(m.id) as actual_message_count
                    FROM conversations c
                    LEFT JOIN messages m ON c.id = m.conversation_id
                    WHERE 1=1
                    ${date_from ? `AND c.started_at >= '${date_from}'` : ''}
                    ${date_to ? `AND c.started_at <= '${date_to}'` : ''}
                    GROUP BY c.id
                    ORDER BY c.started_at DESC
                `;
                const conversationsResult = await dbService.pool.query(conversationsQuery);
                data = conversationsResult.rows;
                filename = `conversations_${new Date().toISOString().split('T')[0]}.${format}`;
                break;

            case 'messages':
                const messagesQuery = `
                    SELECT m.user_message, m.ai_response, m.confidence_score, m.response_time_ms,
                           m.language, m.created_at, c.session_id
                    FROM messages m
                    JOIN conversations c ON m.conversation_id = c.id
                    WHERE 1=1
                    ${date_from ? `AND m.created_at >= '${date_from}'` : ''}
                    ${date_to ? `AND m.created_at <= '${date_to}'` : ''}
                    ORDER BY m.created_at DESC
                `;
                const messagesResult = await dbService.pool.query(messagesQuery);
                data = messagesResult.rows;
                filename = `messages_${new Date().toISOString().split('T')[0]}.${format}`;
                break;

            case 'top_questions':
                const topQuestionsQuery = `
                    SELECT question, language, ask_count, last_asked
                    FROM top_questions
                    ORDER BY ask_count DESC
                `;
                const topQuestionsResult = await dbService.pool.query(topQuestionsQuery);
                data = topQuestionsResult.rows;
                filename = `top_questions_${new Date().toISOString().split('T')[0]}.${format}`;
                break;

            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }

        if (format === 'csv') {
            contentType = 'text/csv';
            // Convert to CSV (simplified)
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
                ].join('\n');
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                return res.send(csvContent);
            }
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(data);

    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
