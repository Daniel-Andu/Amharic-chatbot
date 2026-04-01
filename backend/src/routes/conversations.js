const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get conversation details
router.get('/details/:sessionId', authenticateToken, conversationController.getConversationDetails);

// Export conversation
router.get('/export/:sessionId', authenticateToken, conversationController.exportConversation);

module.exports = router;
