const express = require('express');
const router = express.Router();
const dbService = require('../database/database');

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

// Get all company info
router.get('/', async (req, res) => {
    try {
        const language = req.query.language || 'en';
        const infoType = req.query.type;

        let query = `
            SELECT ci.*, u.username as created_by_name 
            FROM company_info ci 
            LEFT JOIN users u ON ci.created_by = u.id 
            WHERE ci.is_active = true
        `;
        let queryParams = [];
        let paramIndex = 1;

        if (infoType) {
            query += ` AND ci.info_type = $${paramIndex++}`;
            queryParams.push(infoType);
        }

        query += ` ORDER BY ci.info_type, ci.created_at DESC`;

        const result = await dbService.query(query, queryParams);

        // Format response based on language
        const companyInfo = result.rows.map(info => ({
            id: info.id,
            info_type: info.info_type,
            title: language === 'am' ? info.title_am : info.title_en,
            content: language === 'am' ? info.content_am : info.content_en,
            title_am: info.title_am,
            title_en: info.title_en,
            content_am: info.content_am,
            content_en: info.content_en,
            created_by: info.created_by_name,
            created_at: info.created_at,
            updated_at: info.updated_at
        }));

        res.json({
            company_info: companyInfo
        });

    } catch (error) {
        console.error('Get company info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get company info by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const language = req.query.language || 'en';

        const result = await dbService.query(
            `SELECT ci.*, u.username as created_by_name 
             FROM company_info ci 
             LEFT JOIN users u ON ci.created_by = u.id 
             WHERE ci.id = $1 AND ci.is_active = true`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company info not found' });
        }

        const info = result.rows[0];

        res.json({
            id: info.id,
            info_type: info.info_type,
            title_am: info.title_am,
            title_en: info.title_en,
            content_am: info.content_am,
            content_en: info.content_en,
            title: language === 'am' ? info.title_am : info.title_en,
            content: language === 'am' ? info.content_am : info.content_en,
            created_by: info.created_by_name,
            created_at: info.created_at,
            updated_at: info.updated_at
        });

    } catch (error) {
        console.error('Get company info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new company info (admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            info_type,
            title_am,
            title_en,
            content_am,
            content_en
        } = req.body;

        // Validate required fields
        if (!info_type || !title_am || !content_am) {
            return res.status(400).json({ error: 'Info type, Amharic title, and Amharic content are required' });
        }

        const result = await dbService.query(
            `INSERT INTO company_info (info_type, title_am, title_en, content_am, content_en, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [info_type, title_am, title_en, content_am, content_en, req.user.id]
        );

        const info = result.rows[0];

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['company_info', 'info', `Company info created: ${info_type} - ${title_am.substring(0, 30)}...`, req.user.id, req.ip]
        );

        res.status(201).json({
            message: 'Company info created successfully',
            info
        });

    } catch (error) {
        console.error('Create company info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update company info (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            info_type,
            title_am,
            title_en,
            content_am,
            content_en
        } = req.body;

        // Check if info exists
        const existingInfo = await dbService.query('SELECT id FROM company_info WHERE id = $1', [id]);

        if (existingInfo.rows.length === 0) {
            return res.status(404).json({ error: 'Company info not found' });
        }

        // Build update query
        let updateFields = [];
        let updateValues = [];
        let paramIndex = 1;

        if (info_type !== undefined) {
            updateFields.push(`info_type = $${paramIndex++}`);
            updateValues.push(info_type);
        }

        if (title_am !== undefined) {
            updateFields.push(`title_am = $${paramIndex++}`);
            updateValues.push(title_am);
        }

        if (title_en !== undefined) {
            updateFields.push(`title_en = $${paramIndex++}`);
            updateValues.push(title_en);
        }

        if (content_am !== undefined) {
            updateFields.push(`content_am = $${paramIndex++}`);
            updateValues.push(content_am);
        }

        if (content_en !== undefined) {
            updateFields.push(`content_en = $${paramIndex++}`);
            updateValues.push(content_en);
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const updateQuery = `UPDATE company_info SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

        await dbService.query(updateQuery, updateValues);

        // Get updated info
        const result = await dbService.query('SELECT * FROM company_info WHERE id = $1', [id]);
        const info = result.rows[0];

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['company_info', 'info', `Company info updated: ${info.info_type} - ${info.title_am.substring(0, 30)}...`, req.user.id, req.ip]
        );

        res.json({
            message: 'Company info updated successfully',
            info
        });

    } catch (error) {
        console.error('Update company info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete company info (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if info exists
        const existingInfo = await dbService.query('SELECT info_type, title_am FROM company_info WHERE id = $1', [id]);

        if (existingInfo.rows.length === 0) {
            return res.status(404).json({ error: 'Company info not found' });
        }

        // Soft delete (set is_active to false)
        await dbService.query('UPDATE company_info SET is_active = false WHERE id = $1', [id]);

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['company_info', 'warning', `Company info deleted: ${existingInfo.rows[0].info_type} - ${existingInfo.rows[0].title_am.substring(0, 30)}...`, req.user.id, req.ip]
        );

        res.json({ message: 'Company info deleted successfully' });

    } catch (error) {
        console.error('Delete company info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get company info types
router.get('/types/list', async (req, res) => {
    try {
        const result = await dbService.query(
            'SELECT DISTINCT info_type, COUNT(*) as count FROM company_info WHERE is_active = true GROUP BY info_type ORDER BY info_type'
        );

        res.json({
            types: result.rows
        });

    } catch (error) {
        console.error('Get types error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
