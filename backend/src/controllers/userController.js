const pool = require('../config/database');

// Create user from conversation data
exports.createUserFromConversation = async (conversationData) => {
    try {
        const { user_name, email, language } = conversationData;
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length === 0) {
            // Create new user
            const newUser = await pool.query(
                `INSERT INTO users (username, email, role, language, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id, username, email, role, language, created_at`,
                [user_name, email, 'user', language]
            );
            
            console.log('✅ Created new user:', newUser.rows[0]);
            return newUser.rows[0];
        } else {
            console.log('ℹ️ User already exists:', email);
            return existingUser.rows[0];
        }
    } catch (error) {
        console.error('❌ Error creating user from conversation:', error);
        return null;
    }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                u.id,
                u.username,
                u.email,
                u.role,
                u.language,
                u.created_at,
                u.updated_at,
                COUNT(c.id) as conversation_count,
                MAX(c.started_at) as last_conversation
            FROM users u
            LEFT JOIN conversations c ON u.email = c.email
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE u.username ILIKE $1 OR u.email ILIKE $2`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += `
            GROUP BY u.id, u.username, u.email, u.role, u.language, u.created_at, u.updated_at
            ORDER BY u.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM users u';
        if (search) {
            countQuery += ` WHERE u.username ILIKE $1 OR u.email ILIKE $2`;
        }
        
        const countResult = await pool.query(countQuery, search ? [`${search}%`, `${search}%`] : []);
        const total = parseInt(countResult.rows[0].count);
        
        res.json({
            users: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Create new user manually
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role = 'user', language = 'en' } = req.body;
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, role, language, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id, username, email, role, language, created_at`,
            [username, email, hashedPassword, role, language]
        );
        
        console.log('✅ Created new user:', result.rows[0]);
        
        res.status(201).json({
            user: result.rows[0],
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, language } = req.body;
        
        const result = await pool.query(
            `UPDATE users 
             SET username = $1, email = $2, role = $3, language = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, username, email, role, language, updated_at`,
            [username, email, role, language, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('✅ Updated user:', result.rows[0]);
        
        res.json({
            user: result.rows[0],
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, username, email',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('✅ Deleted user:', result.rows[0]);
        
        res.json({
            user: result.rows[0],
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
