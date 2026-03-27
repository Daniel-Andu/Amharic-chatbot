const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
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
        version: 'FINAL-FIX-999-UPDATED',
        message: 'Minimal server - guaranteed to work - UPDATED'
    });
});

// Chat endpoints - SIMPLE and DIRECT
app.post('/api/chat/start', (req, res) => {
    console.log('🔥 CHAT START HIT!');
    res.json({
        conversation: {
            session_id: 'test-session-' + Date.now(),
            language: req.body.language || 'en',
            started_at: new Date(),
            status: 'active'
        }
    });
});

app.post('/api/chat/message', (req, res) => {
    console.log('🔥 CHAT MESSAGE HIT!');
    console.log('🔥 Body:', req.body);

    const { sessionId, message, language = 'en' } = req.body;

    if (!message || !sessionId) {
        return res.status(400).json({ error: 'Message and session ID required' });
    }

    // Simple AI response
    const responses = {
        'hello': 'Hello! How can I help you today?',
        'hi': 'Hi there! What would you like to know?',
        'default': 'Thank you for your message. I am here to help!'
    };

    const response = responses[message.toLowerCase()] || responses.default;

    res.json({
        message: {
            id: Date.now(),
            conversation_id: sessionId,
            message_type: 'text',
            user_message: message,
            ai_response: response,
            confidence: 0.95,
            language: language,
            response_time_ms: 500,
            created_at: new Date()
        },
        response: response,
        confidence: 0.95,
        responseTime: 500
    });
});

// Admin endpoints - SIMPLE
app.get('/api/dashboard/stats', (req, res) => {
    console.log('🔥 DASHBOARD STATS HIT!');
    res.json({
        totalConversations: 150,
        totalMessages: 1250,
        avgConfidence: 0.87,
        todayChats: 25,
        escalatedChats: 3,
        languageDistribution: [
            { language: 'en', count: 80 },
            { language: 'am', count: 70 }
        ]
    });
});

app.get('/api/dashboard/notifications', (req, res) => {
    console.log('🔥 NOTIFICATIONS HIT!');
    res.json({
        notifications: [
            {
                id: 'system_1',
                type: 'system',
                message: 'System is running normally',
                time: 'Just now',
                unread: false,
                priority: 'low',
                actionUrl: '/dashboard'
            }
        ]
    });
});

// Auth endpoints - SIMPLE
app.post('/api/auth/login', (req, res) => {
    console.log('🔥 LOGIN HIT!');
    const { email, password } = req.body;

    if (email === 'admin@aiassistant.com' && password === 'admin123') {
        res.json({
            token: 'simple-jwt-token-' + Date.now(),
            user: {
                id: 1,
                email: 'admin@aiassistant.com',
                username: 'Admin User',
                role: 'admin'
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Test endpoint
app.post('/api/test', (req, res) => {
    console.log('🔥 TEST HIT!');
    res.json({ message: 'Test working', body: req.body });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404:', req.method, req.path);
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Version: FINAL-FIX-999`);
});
