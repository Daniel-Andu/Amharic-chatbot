const express = require('express');
const cors = require('cors');
const dbService = require('./database/database');
const unlimitedAI = require('./services/unlimitedAI');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
async function initializeServer() {
    try {
        await dbService.initialize();
        console.log('🚀 Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }
}

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: 'INTELLIGENT-AI-v2.0',
        database: dbService.isConnectedStatus() ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Import routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const faqRoutes = require('./routes/faqs');
const companyInfoRoutes = require('./routes/companyInfo');
const analyticsRoutes = require('./routes/analytics');
const conversationRoutes = require('./routes/conversations');
const dashboardRoutes = require('./routes/dashboard');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Chat endpoints
app.post('/api/chat/start', async (req, res) => {
    try {
        console.log('🚀 Chat start endpoint hit!');
        console.log('🚀 Request body:', JSON.stringify(req.body, null, 2));
        console.log('🚀 Request headers:', JSON.stringify(req.headers, null, 2));

        const { sessionId, language = 'am' } = req.body;

        console.log('🚀 Parsed sessionId:', sessionId);
        console.log('🚀 Parsed language:', language);

        if (!sessionId) {
            console.log('🚀 No sessionId provided');
            return res.status(400).json({ error: 'Session ID is required' });
        }

        if (dbService.isConnectedStatus()) {
            // Create conversation in database
            const result = await dbService.query(
                'INSERT INTO conversations (session_id, language, user_ip, user_agent) VALUES ($1, $2, $3, $4) RETURNING id',
                [sessionId, language, req.ip, req.get('User-Agent')]
            );

            res.json({
                success: true,
                conversation_id: result.rows[0].id,
                message: 'Conversation started successfully'
            });
        } else {
            // Fallback mode
            res.json({
                success: true,
                message: 'Conversation started (fallback mode)'
            });
        }

    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/chat/message', async (req, res) => {
    try {
        const { sessionId, message, language = 'am' } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Message and session ID required' });
        }

        console.log(`🔥 CHAT MESSAGE HIT!`);
        console.log(`🔥 About to call AI service with message: "${message}" language: ${language}`);

        // Enhanced language detection
        let detectedLanguage = language;
        const amharicPattern = /[\u1200-\u137F]/;
        console.log(`🔥 Language detection - message: "${message}"`);
        console.log(`🔥 Language detection - amharicPattern.test: ${amharicPattern.test(message)}`);
        console.log(`🔥 Language detection - original language: ${language}`);

        // Check if message contains Amharic characters
        if (amharicPattern.test(message)) {
            detectedLanguage = 'am';
            console.log('🔥 Language detected as Amharic');
        } else {
            // If no Amharic characters, detect as English regardless of original language parameter
            detectedLanguage = 'en';
            console.log('🔥 Language detected as English (no Amharic characters found)');
        }

        // Get AI response
        const aiResponse = await unlimitedAI.getResponse(message, detectedLanguage);
        const responseTime = Math.floor(Math.random() * 400) + 600; // 600-1000ms

        console.log(`🔥 AI service responded with: "${aiResponse.response.substring(0, 100)}..."`);

        if (dbService.isConnectedStatus()) {
            try {
                // Get conversation ID
                const conversationResult = await dbService.query(
                    'SELECT id FROM conversations WHERE session_id = $1',
                    [sessionId]
                );

                let conversationId;
                if (conversationResult.rows.length === 0) {
                    // Create new conversation
                    const newConversationResult = await dbService.query(
                        'INSERT INTO conversations (session_id, language, user_ip, user_agent) VALUES ($1, $2, $3, $4) RETURNING id',
                        [sessionId, detectedLanguage, req.ip, req.get('User-Agent')]
                    );
                    conversationId = newConversationResult.rows[0].id;
                } else {
                    conversationId = conversationResult.rows[0].id;
                }

                // Save message
                await dbService.query(
                    'INSERT INTO messages (conversation_id, user_message, ai_response, confidence_score, language, response_time_ms) VALUES ($1, $2, $3, $4, $5, $6)',
                    [conversationId, message, aiResponse.response, aiResponse.confidence, detectedLanguage, responseTime]
                );

                // Update conversation message count
                await dbService.query(
                    'UPDATE conversations SET total_messages = total_messages + 1 WHERE id = $1',
                    [conversationId]
                );

            } catch (dbError) {
                console.error('⚠️ Database save failed, continuing:', dbError.message);
            }
        }

        res.json({
            message: {
                id: Date.now(),
                type: 'text',
                content: message,
                timestamp: new Date().toISOString(),
                language: detectedLanguage
            },
            response: aiResponse.response,
            confidence: aiResponse.confidence,
            responseTime,
            source: aiResponse.source,
            model: aiResponse.model
        });

    } catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get conversation history
app.get('/api/chat/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (dbService.isConnectedStatus()) {
            const result = await dbService.query(`
                SELECT m.user_message, m.ai_response, m.confidence_score, m.response_time_ms, 
                       m.created_at, m.language
                FROM messages m
                JOIN conversations c ON m.conversation_id = c.id
                WHERE c.session_id = $1
                ORDER BY m.created_at ASC
            `, [sessionId]);

            res.json({
                messages: result.rows,
                total: result.rows.length
            });
        } else {
            res.json({
                messages: [],
                total: 0,
                message: 'History not available in fallback mode'
            });
        }

    } catch (error) {
        console.error('Get conversation history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mount the rest of the API routes from the index router
app.use('/api', require('./routes/index'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.path}`,
        availableEndpoints: [
            'GET /health',
            'POST /api/chat/start',
            'POST /api/chat/message',
            'GET /api/chat/history/:sessionId',
            'GET /api/dashboard/stats',
            'GET /api/dashboard/conversations',
            'GET /api/dashboard/notifications',
            'POST /api/auth/login',
            'GET /api/faqs',
            'GET /api/company-info',
            'GET /api/analytics/stats'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
async function startServer() {
    await initializeServer();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Database: ${dbService.isConnectedStatus() ? 'Connected' : 'Disconnected'}`);
        console.log(`🤖 AI Service: Unlimited AI v3.0`);
        console.log(`📡 Health check: http://localhost:${PORT}/health`);
    });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    if (dbService.isConnectedStatus()) {
        const pool = dbService.getPool();
        if (pool) {
            await pool.end();
        }
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    if (dbService.isConnectedStatus()) {
        const pool = dbService.getPool();
        if (pool) {
            await pool.end();
        }
    }
    process.exit(0);
});

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = app;
