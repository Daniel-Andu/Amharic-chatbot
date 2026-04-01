const dbService = require('../database/database');

// Test database connection
exports.testDb = async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');
        const start = Date.now();

        const result = await dbService.pool.query('SELECT 1 as test');

        const end = Date.now();
        console.log(`✅ Database query successful in ${end - start}ms`);

        res.json({
            success: true,
            queryTime: `${end - start}ms`,
            result: result.rows
        });
    } catch (error) {
        console.error('❌ Database test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
