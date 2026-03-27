const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔐 Auth header:', authHeader);

        const token = authHeader?.split(' ')[1];
        console.log('🔑 Token extracted:', token ? 'present' : 'missing');

        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Special handling for demo tokens
        if (token.startsWith('demo-token-')) {
            console.log('🎭 Demo token detected, granting admin access');
            req.user = {
                id: 1,
                email: 'admin@aiassistant.com',
                username: 'Admin User',
                role: 'admin'
            };
            next();
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        console.log('✅ Token decoded for user:', decoded.email);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authMiddleware, adminOnly };
