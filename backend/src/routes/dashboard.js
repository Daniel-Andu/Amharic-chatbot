const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

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

// Dashboard routes
router.get('/stats', authenticateToken, dashboardController.getStats);
router.get('/conversations', authenticateToken, dashboardController.getConversations);
router.get('/users', authenticateToken, dashboardController.getUsers);
router.get('/top-questions', authenticateToken, dashboardController.getTopQuestions);
router.get('/notifications', authenticateToken, dashboardController.getNotifications);
router.get('/conversation/:id', authenticateToken, dashboardController.getConversationDetails);

module.exports = router;
