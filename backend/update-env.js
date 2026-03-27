const fs = require('fs');
const path = require('path');

// Correct .env content
const envContent = `DB_HOST=localhost
DB_NAME=ai_assistant_db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Post0908
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
GROQ_API_KEY=your-groq-api-key
PORT=5000
NODE_ENV=development`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully!');
    console.log('📁 File location:', envPath);
    console.log('🔧 Database credentials configured');
} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
}
