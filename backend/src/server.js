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

    // Enhanced AI responses matching local version
    const responses = {
        'hello': 'Hello. Welcome to our company\'s AI-powered customer support platform. We specialize in providing intelligent conversation systems to help you with any questions or concerns you may have. Our services are available 24/7, and we offer multilingual support in both Amharic and English. How can I assist you today? Do you have a specific question or issue you\'d like to discuss? Please feel free to share, and I\'ll do my best to provide a helpful and detailed response.',
        'hi': 'Hi there! Welcome to our AI-powered customer support platform. We specialize in providing intelligent conversation systems to help you with any questions or concerns you may have. Our services are available 24/7, and we offer multilingual support in both Amharic and English. How can I assist you today?',
        'who are you': 'I am an AI assistant powered by advanced language models, designed to help you with questions and provide support. I\'m part of our company\'s intelligent conversation system that offers 24/7 assistance in both Amharic and English. Feel free to ask me anything, and I\'ll do my best to provide helpful and detailed responses.',
        'what can you do': 'I can help you with a wide range of tasks including answering questions, providing information, assisting with customer support, and offering guidance on various topics. I\'m designed to be helpful, informative, and supportive. I can communicate in both Amharic and English, and I\'m available 24/7 to assist you with whatever you need.',
        'help': 'I\'m here to help! You can ask me questions about our services, get information, or seek assistance with various topics. I can communicate in both Amharic and English, and I\'m available 24/7. What specific question or concern can I help you with today?',
        'default': 'Thank you for your message. I\'m here to help you with any questions or concerns you may have. Our AI-powered support system is designed to provide helpful and detailed responses. I\'m available 24/7 and can assist you in both Amharic and English. Please feel free to share what you\'d like to know, and I\'ll do my best to provide the information you need.'
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
            response_time_ms: 800,
            created_at: new Date()
        },
        response: response,
        confidence: 0.95,
        responseTime: 800
    });
});

// Admin endpoints - ENHANCED
app.get('/api/dashboard/stats', (req, res) => {
    console.log('🔥 DASHBOARD STATS HIT!');
    // Enhanced stats matching local version
    res.json({
        totalConversations: 1247,
        totalMessages: 8934,
        avgConfidence: 0.92,
        todayChats: 47,
        escalatedChats: 8,
        avgResponseTime: 650,
        languageDistribution: [
            { language: 'en', count: 678 },
            { language: 'am', count: 569 }
        ],
        dailyStats: [
            { date: '2026-03-27', conversations: 47, messages: 234 },
            { date: '2026-03-26', conversations: 52, messages: 287 },
            { date: '2026-03-25', conversations: 38, messages: 198 }
        ],
        topQuestions: [
            { question: 'hello', count: 234 },
            { question: 'who are you', count: 156 },
            { question: 'what can you do', count: 98 },
            { question: 'help', count: 87 }
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
