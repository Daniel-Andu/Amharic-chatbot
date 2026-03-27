const pool = require('./src/config/database');

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');
        
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        
        // Check conversations
        const convResult = await client.query('SELECT COUNT(*) as count FROM conversations');
        console.log('💬 Total conversations:', convResult.rows[0].count);
        
        // Check messages
        const msgResult = await client.query('SELECT COUNT(*) as count FROM messages');
        console.log('📨 Total messages:', msgResult.rows[0].count);
        
        // Check sample conversation with messages
        const sampleResult = await client.query(`
            SELECT c.session_id, c.user_name, 
                   (SELECT COUNT(*) FROM messages WHERE conversation_id = c.session_id) as msg_count
            FROM conversations c 
            LIMIT 5
        `);
        
        console.log('📊 Sample conversations:');
        sampleResult.rows.forEach(row => {
            console.log(`  - ${row.session_id}: ${row.user_name} (${row.msg_count} messages)`);
        });
        
        client.release();
        await pool.end();
        console.log('✅ Database test completed');
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        await pool.end();
    }
}

testDatabase();
