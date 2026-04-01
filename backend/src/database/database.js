const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

class DatabaseService {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async initialize() {
        try {
            // Database connection setup
            if (process.env.DATABASE_URL) {
                const needsSsl = process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require') || process.env.NODE_ENV === 'production';
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: needsSsl ? {
                        rejectUnauthorized: false,
                        sslmode: 'require'
                    } : false
                });
            } else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
                this.pool = new Pool({
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT) || 5432,
                    database: process.env.DB_NAME,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
                });
            } else {
                throw new Error('No database configuration found');
            }

            // Test connection
            await this.pool.query('SELECT NOW()');
            this.isConnected = true;
            console.log('✅ Database connected successfully');

            // Initialize all tables
            await this.initializeTables();
            console.log('✅ All database tables initialized');

            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async initializeTables() {
        const tables = [
            // Users Table
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'system_admin')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Knowledge Base Documents
            `CREATE TABLE IF NOT EXISTS knowledge_documents (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                file_size BIGINT NOT NULL,
                file_path TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploaded_by INTEGER REFERENCES users(id),
                status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
                processed BOOLEAN DEFAULT FALSE
            )`,

            // FAQ Management
            `CREATE TABLE IF NOT EXISTS faqs (
                id SERIAL PRIMARY KEY,
                question_am TEXT NOT NULL,
                question_en TEXT,
                answer_am TEXT NOT NULL,
                answer_en TEXT,
                category VARCHAR(100),
                priority INTEGER DEFAULT 0,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )`,

            // Company Information
            `CREATE TABLE IF NOT EXISTS company_info (
                id SERIAL PRIMARY KEY,
                info_type VARCHAR(100) NOT NULL,
                title_am VARCHAR(255) NOT NULL,
                title_en VARCHAR(255),
                content_am TEXT NOT NULL,
                content_en TEXT,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )`,

            // Conversations
            `CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                user_ip VARCHAR(50),
                user_agent TEXT,
                language VARCHAR(10) DEFAULT 'am',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                total_messages INTEGER DEFAULT 0,
                escalated BOOLEAN DEFAULT FALSE
            )`,

            // Messages
            `CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
                message_type VARCHAR(20) CHECK (message_type IN ('text', 'voice')),
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                confidence_score DECIMAL(3,2),
                language VARCHAR(10) DEFAULT 'am',
                response_time_ms INTEGER,
                flagged BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // AI Training Versions
            `CREATE TABLE IF NOT EXISTS ai_training_versions (
                id SERIAL PRIMARY KEY,
                version_name VARCHAR(100) NOT NULL,
                version_number VARCHAR(50) NOT NULL,
                training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'training' CHECK (status IN ('training', 'completed', 'active', 'inactive')),
                is_active BOOLEAN DEFAULT FALSE,
                trained_by INTEGER REFERENCES users(id),
                notes TEXT
            )`,

            // Top Questions Tracking
            `CREATE TABLE IF NOT EXISTS top_questions (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                question_normalized TEXT NOT NULL,
                language VARCHAR(10) DEFAULT 'am',
                ask_count INTEGER DEFAULT 1,
                last_asked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(question_normalized, language)
            )`,

            // Response Corrections
            `CREATE TABLE IF NOT EXISTS response_corrections (
                id SERIAL PRIMARY KEY,
                message_id INTEGER REFERENCES messages(id),
                original_response TEXT NOT NULL,
                corrected_response TEXT NOT NULL,
                corrected_by INTEGER REFERENCES users(id),
                correction_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // System Logs
            `CREATE TABLE IF NOT EXISTS system_logs (
                id SERIAL PRIMARY KEY,
                log_type VARCHAR(50) NOT NULL,
                log_level VARCHAR(20) CHECK (log_level IN ('info', 'warning', 'error')),
                message TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id),
                ip_address VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        // Create tables
        for (const tableQuery of tables) {
            await this.pool.query(tableQuery);
        }

        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)',
            'CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status ON knowledge_documents(status)',
            'CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active)',
            'CREATE INDEX IF NOT EXISTS idx_top_questions_count ON top_questions(ask_count DESC)',
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)'
        ];

        for (const indexQuery of indexes) {
            await this.pool.query(indexQuery);
        }

        // Insert default data
        await this.insertDefaultData();
    }

    async insertDefaultData() {
        // Check if admin user exists
        const adminCheck = await this.pool.query('SELECT id FROM users WHERE username = $1', ['admin']);

        if (adminCheck.rows.length === 0) {
            // Create default admin user (password: admin123)
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await this.pool.query(`
                INSERT INTO users (username, email, password_hash, role) 
                VALUES ($1, $2, $3, $4)
            `, ['admin', 'admin@company.com', hashedPassword, 'admin']);

            console.log('✅ Default admin user created');
        }

        // Insert default FAQs
        const faqCount = await this.pool.query('SELECT COUNT(*) as count FROM faqs');

        if (parseInt(faqCount.rows[0].count) === 0) {
            const defaultFaqs = [
                {
                    question_am: 'ሰላም',
                    question_en: 'Hello',
                    answer_am: 'ሰላም! እንኳን ደህና መጡ! ምን ልርዳዎት ነው?',
                    answer_en: 'Hello! Welcome! How can I help you today?',
                    category: 'greetings'
                },
                {
                    question_am: 'እባነህ ማን ነህ?',
                    question_en: 'Who are you?',
                    answer_am: 'እኔ AI አስተኛው እርሳኛ ነኝ፣ የኩባንያዎን ጥያቄዎች ለመመለስ እና ድጋፍ ለመስጠዝ ተዘጋጅቻለሁ።',
                    answer_en: 'I am an AI assistant designed to help answer your questions and provide support for our company services.',
                    category: 'about'
                },
                {
                    question_am: 'የኢትዮጵያ ዋና ከተማ ምንድነው?',
                    question_en: 'What is the capital city of Ethiopia?',
                    answer_am: 'የኢትዮጵያ ዋና ከተማ አዲስ አበባ ናት።',
                    answer_en: 'The capital city of Ethiopia is Addis Ababa.',
                    category: 'geography'
                },
                {
                    question_am: 'ባህር ዳር የት ነው?',
                    question_en: 'Where is Bahir Dar?',
                    answer_am: 'ባህር ዳር የኢትዮጵያ ሰሜን ምዕራባዊ ክልል ነው፣ ከታናሳ ሀይቅ ጎማ ይገኛል።',
                    answer_en: 'Bahir Dar is located in northwestern Ethiopia, situated on the southern shore of Lake Tana.',
                    category: 'geography'
                }
            ];

            for (const faq of defaultFaqs) {
                await this.pool.query(`
                    INSERT INTO faqs (question_am, question_en, answer_am, answer_en, category) 
                    VALUES ($1, $2, $3, $4, $5)
                `, [faq.question_am, faq.question_en, faq.answer_am, faq.answer_en, faq.category]);
            }

            console.log('✅ Default FAQs inserted');
        }

        // Insert default company info
        const companyCount = await this.pool.query('SELECT COUNT(*) as count FROM company_info');

        if (parseInt(companyCount.rows[0].count) === 0) {
            const companyInfo = [
                {
                    info_type: 'about',
                    title_am: 'ስለ እኛ',
                    title_en: 'About Us',
                    content_am: 'እኛ የቴክኖሎጂ ኩባንያ ነን፣ የAI የደንበኛ አገልግሎት መፍትሄዎችን እናል።',
                    content_en: 'We are a technology company providing AI-powered customer support solutions.'
                },
                {
                    info_type: 'services',
                    title_am: 'አገልግሎቶቻችን',
                    title_en: 'Our Services',
                    content_am: '24/7 AI ድጋፍ፣ ብዙርካቹ ቋንቋ ድጋፍ፣ ብልህትዊ የውይይት ስርዓቶች።',
                    content_en: '24/7 AI support, multilingual support, intelligent conversation systems.'
                }
            ];

            for (const info of companyInfo) {
                await this.pool.query(`
                    INSERT INTO company_info (info_type, title_am, title_en, content_am, content_en) 
                    VALUES ($1, $2, $3, $4, $5)
                `, [info.info_type, info.title_am, info.title_en, info.content_am, info.content_en]);
            }

            console.log('✅ Default company info inserted');
        }
    }

    async query(text, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        return await this.pool.query(text, params);
    }

    async getPool() {
        return this.pool;
    }

    isConnectedStatus() {
        return this.isConnected;
    }
}

module.exports = new DatabaseService();
