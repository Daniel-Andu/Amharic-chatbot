// Database setup script for PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ai_assistant_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
});

async function setupDatabase() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful!');
        
        // Check if tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('📋 Existing tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // Check if faqs table exists
        const faqsTableExists = tablesResult.rows.some(row => row.table_name === 'faqs');
        
        if (faqsTableExists) {
            // Check FAQs in database
            const faqsResult = await pool.query('SELECT COUNT(*) as count FROM faqs');
            console.log(`📚 Found ${faqsResult.rows[0].count} FAQs in database`);
            
            // Show sample FAQs
            const sampleFAQs = await pool.query('SELECT question, answer, language FROM faqs LIMIT 3');
            console.log('📝 Sample FAQs:');
            sampleFAQs.rows.forEach((faq, index) => {
                console.log(`  ${index + 1}. [${faq.language}] ${faq.question}`);
                console.log(`     Answer: ${faq.answer.substring(0, 100)}...`);
            });
        } else {
            console.log('⚠️ FAQs table not found');
        }
        
        console.log('\n🎯 To use PostgreSQL instead of test server:');
        console.log('1. Make sure PostgreSQL is running');
        console.log('2. Update your .env file with correct database credentials');
        console.log('3. Run: npm start (instead of node test-connection.js)');
        console.log('4. The system will automatically use PostgreSQL when available');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n💡 Solutions:');
        console.log('1. Make sure PostgreSQL is installed and running');
        console.log('2. Check your .env file database credentials');
        console.log('3. Create database: CREATE DATABASE ai_assistant_db;');
        console.log('4. Run migration: npm run migrate');
        
        console.log('\n🔄 For now, using test server with mock data...');
    } finally {
        await pool.end();
    }
}

setupDatabase();
