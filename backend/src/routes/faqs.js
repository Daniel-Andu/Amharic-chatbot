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

// Get all FAQs
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const language = req.query.language || 'en';
        const search = req.query.search;

        let query = `
            SELECT f.*, u.username as created_by_name 
            FROM faqs f 
            LEFT JOIN users u ON f.created_by = u.id 
            WHERE f.is_active = true
        `;
        let queryParams = [];
        let paramIndex = 1;

        if (category) {
            query += ` AND f.category = $${paramIndex++}`;
            queryParams.push(category);
        }

        if (search) {
            if (language === 'am') {
                query += ` AND (f.question_am ILIKE $${paramIndex++} OR f.answer_am ILIKE $${paramIndex++})`;
                queryParams.push(`%${search}%`, `%${search}%`);
            } else {
                query += ` AND (f.question_en ILIKE $${paramIndex++} OR f.answer_en ILIKE $${paramIndex++})`;
                queryParams.push(`%${search}%`, `%${search}%`);
            }
        }

        query += ` ORDER BY f.priority DESC, f.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        queryParams.push(limit, offset);

        const result = await dbService.query(query, queryParams);

        // Format response based on language
        const faqs = result.rows.map(faq => ({
            id: faq.id,
            question: language === 'am' ? faq.question_am : faq.question_en,
            answer: language === 'am' ? faq.answer_am : faq.answer_en,
            category: faq.category,
            priority: faq.priority,
            created_by: faq.created_by_name,
            created_at: faq.created_at,
            updated_at: faq.updated_at
        }));

        const countQuery = `SELECT COUNT(*) as total FROM faqs WHERE is_active = true`;
        const countResult = await dbService.query(countQuery);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            faqs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get FAQs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get FAQ by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const language = req.query.language || 'en';

        const result = await dbService.query(
            `SELECT f.*, u.username as created_by_name 
             FROM faqs f 
             LEFT JOIN users u ON f.created_by = u.id 
             WHERE f.id = $1 AND f.is_active = true`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }

        const faq = result.rows[0];

        res.json({
            id: faq.id,
            question_am: faq.question_am,
            question_en: faq.question_en,
            answer_am: faq.answer_am,
            answer_en: faq.answer_en,
            question: language === 'am' ? faq.question_am : faq.question_en,
            answer: language === 'am' ? faq.answer_am : faq.answer_en,
            category: faq.category,
            priority: faq.priority,
            created_by: faq.created_by_name,
            created_at: faq.created_at,
            updated_at: faq.updated_at
        });

    } catch (error) {
        console.error('Get FAQ error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new FAQ (admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            question_am,
            question_en,
            answer_am,
            answer_en,
            category = 'general',
            priority = 0
        } = req.body;

        // Validate required fields
        if (!question_am || !answer_am) {
            return res.status(400).json({ error: 'Amharic question and answer are required' });
        }

        const result = await dbService.query(
            `INSERT INTO faqs (question_am, question_en, answer_am, answer_en, category, priority, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [question_am, question_en, answer_am, answer_en, category, priority, req.user.id]
        );

        const faq = result.rows[0];

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['faq_management', 'info', `FAQ created: ${question_am.substring(0, 50)}...`, req.user.id, req.ip]
        );

        res.status(201).json({
            message: 'FAQ created successfully',
            faq
        });

    } catch (error) {
        console.error('Create FAQ error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update FAQ (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            question_am,
            question_en,
            answer_am,
            answer_en,
            category,
            priority
        } = req.body;

        // Check if FAQ exists
        const existingFAQ = await dbService.query('SELECT id FROM faqs WHERE id = $1', [id]);

        if (existingFAQ.rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }

        // Build update query
        let updateFields = [];
        let updateValues = [];
        let paramIndex = 1;

        if (question_am !== undefined) {
            updateFields.push(`question_am = $${paramIndex++}`);
            updateValues.push(question_am);
        }

        if (question_en !== undefined) {
            updateFields.push(`question_en = $${paramIndex++}`);
            updateValues.push(question_en);
        }

        if (answer_am !== undefined) {
            updateFields.push(`answer_am = $${paramIndex++}`);
            updateValues.push(answer_am);
        }

        if (answer_en !== undefined) {
            updateFields.push(`answer_en = $${paramIndex++}`);
            updateValues.push(answer_en);
        }

        if (category !== undefined) {
            updateFields.push(`category = $${paramIndex++}`);
            updateValues.push(category);
        }

        if (priority !== undefined) {
            updateFields.push(`priority = $${paramIndex++}`);
            updateValues.push(priority);
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const updateQuery = `UPDATE faqs SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;

        await dbService.query(updateQuery, updateValues);

        // Get updated FAQ
        const result = await dbService.query('SELECT * FROM faqs WHERE id = $1', [id]);
        const faq = result.rows[0];

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['faq_management', 'info', `FAQ updated: ${faq.question_am.substring(0, 50)}...`, req.user.id, req.ip]
        );

        res.json({
            message: 'FAQ updated successfully',
            faq
        });

    } catch (error) {
        console.error('Update FAQ error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete FAQ (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if FAQ exists
        const existingFAQ = await dbService.query('SELECT question_am FROM faqs WHERE id = $1', [id]);

        if (existingFAQ.rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }

        // Soft delete (set is_active to false)
        await dbService.query('UPDATE faqs SET is_active = false WHERE id = $1', [id]);

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['faq_management', 'warning', `FAQ deleted: ${existingFAQ.rows[0].question_am.substring(0, 50)}...`, req.user.id, req.ip]
        );

        res.json({ message: 'FAQ deleted successfully' });

    } catch (error) {
        console.error('Delete FAQ error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get FAQ categories
router.get('/categories/list', async (req, res) => {
    try {
        const result = await dbService.query(
            'SELECT DISTINCT category, COUNT(*) as count FROM faqs WHERE is_active = true GROUP BY category ORDER BY category'
        );

        res.json({
            categories: result.rows
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk import FAQs (admin only)
router.post('/bulk-import', authenticateToken, async (req, res) => {
    try {
        const { faqs } = req.body;

        if (!Array.isArray(faqs) || faqs.length === 0) {
            return res.status(400).json({ error: 'FAQs array is required' });
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const faqData of faqs) {
            try {
                const { question_am, question_en, answer_am, answer_en, category = 'general', priority = 0 } = faqData;

                if (!question_am || !answer_am) {
                    results.push({ error: 'Amharic question and answer are required', data: faqData });
                    errorCount++;
                    continue;
                }

                const result = await dbService.query(
                    `INSERT INTO faqs (question_am, question_en, answer_am, answer_en, category, priority, created_by) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     RETURNING id`,
                    [question_am, question_en, answer_am, answer_en, category, priority, req.user.id]
                );

                results.push({ success: true, id: result.rows[0].id, data: faqData });
                successCount++;

            } catch (error) {
                results.push({ error: error.message, data: faqData });
                errorCount++;
            }
        }

        // Log the action
        await dbService.query(
            'INSERT INTO system_logs (log_type, log_level, message, user_id, ip_address) VALUES ($1, $2, $3, $4, $5)',
            ['faq_management', 'info', `Bulk FAQ import: ${successCount} successful, ${errorCount} failed`, req.user.id, req.ip]
        );

        res.json({
            message: `Bulk import completed: ${successCount} successful, ${errorCount} failed`,
            summary: {
                total: faqs.length,
                success: successCount,
                errors: errorCount
            },
            results
        });

    } catch (error) {
        console.error('Bulk import error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
