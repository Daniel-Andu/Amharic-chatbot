const { Pool } = require('pg');

// Use environment variables directly (bypass .env file issues)
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'ai_assistant_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Post0908',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000,
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
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connection test successful');
        client.release();
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        console.log('⚠️ Check database connection parameters');
    }
}

// Run connection test
testConnection();

module.exports = pool;
