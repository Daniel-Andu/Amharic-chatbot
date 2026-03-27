const express = require('express');
const router = express.Router();

router.get('/version', (req, res) => {
    res.json({ 
        version: '2e2a3f2',
        timestamp: new Date().toISOString(),
        message: 'Backend with fixed notifications endpoint'
    });
});

module.exports = router;
