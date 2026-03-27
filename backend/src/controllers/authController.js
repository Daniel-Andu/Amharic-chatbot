const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Login attempt for email:', email);

        // Try database first
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                console.log('❌ User not found in database');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];

            // Special handling for admin user (simple password check)
            if (email === 'admin@aiassistant.com' && password === 'admin123') {
                console.log('✅ Admin login successful (simple auth)');

                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET || 'fallback-secret',
                    { expiresIn: process.env.JWT_EXPIRE || '7d' }
                );

                console.log('🔑 Generated token length:', token.length);

                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
                return;
            }

            // For other users, use bcrypt
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                console.log('❌ Invalid password for user:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            console.log('✅ Login successful for:', email);
            console.log('🔑 Generated token length:', token.length);

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            res.status(500).json({ error: 'Authentication service unavailable' });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, role`,
            [username, email, hashedPassword, role || 'admin']
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            token,
            user
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
