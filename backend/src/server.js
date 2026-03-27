const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Set environment variables directly (for development)
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'ai_assistant_db';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'Post0908';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5000';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://localhost:3002';
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-groq-api-key';

console.log('🔧 Server configuration loaded:');
console.log('📊 Database:', process.env.DB_NAME);
console.log('👤 User:', process.env.DB_USER);
console.log('🔌 Host:', process.env.DB_HOST);
console.log('🔌 Port:', process.env.DB_PORT);
console.log('🌐 Server Port:', process.env.PORT);

const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// CORS configuration - Allow all origins for development
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

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Global error:', err);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS policy violation',
            message: 'This origin is not allowed'
        });
    }

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const startServer = async () => {
    try {
        const { runMigration } = require('./database/migrate');

        // Run database migration if enabled
        if (process.env.RUN_MIGRATION === 'true') {
            console.log('🔄 Running database migration...');
            await runMigration();
            console.log('✅ Database migration completed');
        }

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
