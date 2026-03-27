const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ai_assistant_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Post0908',
});

async function fixSchema() {
    try {
        console.log('🔧 Fixing database schema...');
        
        // Add missing columns
        await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)');
        await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
        
        console.log('✅ Columns added successfully');
        
        // Update existing records
        await pool.query('UPDATE conversations SET user_name = COALESCE(user_name, \'Guest User\') WHERE user_name IS NULL OR user_name = \'\'');
        await pool.query('UPDATE conversations SET email = COALESCE(email, \'guest@example.com\') WHERE email IS NULL OR email = \'\'');
        
        console.log('✅ Existing records updated');
        
        // Check table structure
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'conversations' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Conversations table structure:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
    } catch (error) {
        console.error('❌ Schema fix failed:', error.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
