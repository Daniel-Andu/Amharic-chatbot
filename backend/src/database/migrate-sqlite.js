const fs = require('fs');
const path = require('path');
const db = require('../config/database-sqlite');
const bcrypt = require('bcryptjs');

async function runMigration() {
    try {
        console.log('🚀 Starting SQLite database migration...');

        // Read and execute schema
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'schema-sqlite.sql'),
            'utf8'
        );

        // Execute schema statements
        const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                db.prepare(statement).run();
            }
        }
        console.log('✅ Schema created successfully');

        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const insertUser = db.prepare(`
            INSERT OR IGNORE INTO users (username, email, password_hash, role) 
            VALUES (?, ?, ?, ?)
        `);
        insertUser.run('admin', 'admin@aiassistant.com', hashedPassword, 'system_admin');
        console.log('✅ Default admin user created (email: admin@aiassistant.com, password: admin123)');

        console.log('🎉 SQLite migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Export for use in server.js
module.exports = { runMigration };

// Run migration if called directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('Migration finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}
