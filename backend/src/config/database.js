const { Pool } = require('pg');
require('dotenv').config();

// Check if PostgreSQL is available, fallback to in-memory storage
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'amharic_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
    console.log('⚠️ Running without database - using fallback mode');
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connection verified'))
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.log('⚠️ Application will run in limited mode');
    });

module.exports = pool;
