// Script to create a new PostgreSQL user
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function createNewUser() {
    console.log('🔧 Creating new PostgreSQL user...');
    
    try {
        // Try to create a new user with a simple password
        const command = `psql -U postgres -c "CREATE USER ai_assistant WITH PASSWORD 'ai123456';"`;
        await execPromise(command);
        console.log('✅ Created new user: ai_assistant');
        
        // Grant permissions
        await execPromise('psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ai_assistant_db TO ai_assistant;"');
        console.log('✅ Granted permissions to ai_assistant user');
        
        console.log('\n🎯 Use these credentials in your .env file:');
        console.log('DB_USER=ai_assistant');
        console.log('DB_PASSWORD=ai123456');
        
    } catch (error) {
        console.error('❌ Failed to create user:', error.message);
        console.log('\n💡 Try these manual steps:');
        console.log('1. Open pgAdmin (if installed)');
        console.log('2. Connect with postgres user (leave password blank)');
        console.log('3. Run: CREATE USER ai_assistant WITH PASSWORD \'ai123456\';');
        console.log('4. Run: GRANT ALL PRIVILEGES ON DATABASE ai_assistant_db TO ai_assistant;');
    }
}

createNewUser();
