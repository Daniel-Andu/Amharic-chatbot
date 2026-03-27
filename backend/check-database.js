const pool = require('./src/config/database');

async function checkDatabase() {
    try {
        console.log('🔍 Checking database connection...');
        
        // Test basic connection
        const client = await pool.connect();
        console.log('✅ Database connection successful');
        
        // Check if tables exist
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        const tablesResult = await client.query(tablesQuery);
        console.log('📋 Tables in database:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // Check if conversations table has data
        const conversationsQuery = 'SELECT COUNT(*) as count FROM conversations';
        const conversationsResult = await client.query(conversationsQuery);
        console.log(`💬 Conversations in database: ${conversationsResult.rows[0].count}`);
        
        // Check if messages table has data
        const messagesQuery = 'SELECT COUNT(*) as count FROM messages';
        const messagesResult = await client.query(messagesQuery);
        console.log(`📨 Messages in database: ${messagesResult.rows[0].count}`);
        
        // Get recent conversations
        const recentQuery = `
            SELECT session_id, user_name, email, language, started_at, message_count
            FROM conversations 
            ORDER BY started_at DESC 
            LIMIT 5;
        `;
        const recentResult = await client.query(recentQuery);
        console.log('📊 Recent conversations:');
        recentResult.rows.forEach(row => {
            console.log(`  - ${row.session_id}: ${row.user_name} (${row.email}) - ${row.message_count} messages`);
        });
        
        client.release();
        console.log('✅ Database check completed');
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    }
}

checkDatabase();
