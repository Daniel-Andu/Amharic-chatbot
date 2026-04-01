const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dbService = require('../database/database');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Register new user (admin only)
router.post('/register', authenticateToken, async (req, res) => {
    try {
        const { username, email, password, role = 'admin' } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await dbService.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await dbService.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
            [username, email, hashedPassword, role]
        );

        const user = result.rows[0];

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['user_management', 'info', `User ${username} registered by ${req.user.username}`, req.user.id, req.ip]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const loginIdentifier = username || email;

        if (!loginIdentifier || !password) {
            return res.status(400).json({ error: 'Username/Email and password are required' });
        }

        // Find user
        const result = await dbService.query(
            'SELECT id, username, email, password_hash, role FROM users WHERE username = $1 OR email = $1',
            [loginIdentifier]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log the login
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['auth', 'info', `User ${user.username} logged in`, user.id, req.ip]
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await dbService.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const countResult = await dbService.query('SELECT COUNT(*) as total FROM users');
        const total = parseInt(countResult.rows[0].total);

        res.json({
            users: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID (admin only)
router.get('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await dbService.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user (admin only or own profile)
router.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, password } = req.body;

        // Check if user can update this profile
        if (req.user.role !== 'system_admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Check if user exists
        const existingUser = await dbService.query('SELECT id FROM users WHERE id = $1', [id]);

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build update query
        let updateFields = [];
        let updateValues = [];
        let paramIndex = 1;

        if (username) {
            updateFields.push(`username = $${paramIndex++}`);
            updateValues.push(username);
        }

        if (email) {
            updateFields.push(`email = $${paramIndex++}`);
            updateValues.push(email);
        }

        if (role && req.user.role === 'system_admin') {
            updateFields.push(`role = $${paramIndex++}`);
            updateValues.push(role);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password_hash = $${paramIndex++}`);
            updateValues.push(hashedPassword);
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

        await dbService.query(updateQuery, updateValues);

        // Get updated user
        const result = await dbService.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['user_management', 'info', `User ${result.rows[0].username} updated by ${req.user.username}`, req.user.id, req.ip]
        );

        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Check if user exists
        const existingUser = await dbService.query('SELECT username FROM users WHERE id = $1', [id]);

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await dbService.query('DELETE FROM users WHERE id = $1', [id]);

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['user_management', 'warning', `User ${existingUser.rows[0].username} deleted by ${req.user.username}`, req.user.id, req.ip]
        );

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await dbService.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update current user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body;

        // Get current user
        const currentUser = await dbService.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        if (currentUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to change password' });
            }

            const validPassword = await bcrypt.compare(currentPassword, currentUser.rows[0].password_hash);

            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        // Build update query
        let updateFields = [];
        let updateValues = [];
        let paramIndex = 1;

        if (username) {
            updateFields.push(`username = $${paramIndex++}`);
            updateValues.push(username);
        }

        if (email) {
            updateFields.push(`email = $${paramIndex++}`);
            updateValues.push(email);
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateFields.push(`password_hash = $${paramIndex++}`);
            updateValues.push(hashedPassword);
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(req.user.id);

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

        await dbService.query(updateQuery, updateValues);

        // Get updated user
        const result = await dbService.query(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
            [req.user.id]
        );

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get system logs (admin only)
router.get('/logs', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const logType = req.query.type;
        const logLevel = req.query.level;

        let query = `
            SELECT sl.*, u.username 
            FROM system_logs sl 
            LEFT JOIN users u ON sl.user_id = u.id 
            WHERE 1=1
        `;
        let queryParams = [];
        let paramIndex = 1;

        if (logType) {
            query += ` AND sl.log_type = $${paramIndex++}`;
            queryParams.push(logType);
        }

        if (logLevel) {
            query += ` AND sl.log_level = $${paramIndex++}`;
            queryParams.push(logLevel);
        }

        query += ` ORDER BY sl.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        queryParams.push(limit, offset);

        const result = await dbService.query(query, queryParams);

        const countQuery = `SELECT COUNT(*) as total FROM system_logs WHERE 1=1`;
        const countParams = [];
        let countParamIndex = 1;

        if (logType) {
            countQuery += ` AND log_type = $${countParamIndex++}`;
            countParams.push(logType);
        }

        if (logLevel) {
            countQuery += ` AND log_level = $${countParamIndex++}`;
            countParams.push(logLevel);
        }

        const countResult = await dbService.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            logs: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
