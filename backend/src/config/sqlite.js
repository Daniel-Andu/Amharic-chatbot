const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database connection
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Conversations table
    db.run(`CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_ip TEXT,
        user_agent TEXT,
        language TEXT DEFAULT 'am',
        status TEXT DEFAULT 'active',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        total_messages INTEGER DEFAULT 0
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        message_type TEXT DEFAULT 'text',
        user_message TEXT,
        ai_response TEXT,
        confidence_score REAL,
        language TEXT DEFAULT 'am',
        response_time_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id)
    )`);

    // Top questions table
    db.run(`CREATE TABLE IF NOT EXISTS top_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        question_normalized TEXT NOT NULL,
        language TEXT DEFAULT 'am',
        ask_count INTEGER DEFAULT 1,
        last_asked DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_normalized, language)
    )`);

    // FAQs table
    db.run(`CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_am TEXT,
        question_en TEXT,
        answer_am TEXT,
        answer_en TEXT,
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Company info table
    db.run(`CREATE TABLE IF NOT EXISTS company_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title_am TEXT,
        title_en TEXT,
        content_am TEXT,
        content_en TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin user
    db.get('SELECT * FROM users WHERE email = ?', ['admin@aiassistant.com'], (err, row) => {
        if (!row) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            
            db.run('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                ['admin', 'admin@aiassistant.com', hashedPassword, 'system_admin']);
        }
    });

    console.log('✅ SQLite database initialized successfully');
});

module.exports = db;
