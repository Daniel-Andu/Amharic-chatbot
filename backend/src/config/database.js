const dbService = require('../database/database');

module.exports = {
    query: async (text, params) => {
        return await dbService.query(text, params);
    },
    connect: async () => {
        const pool = await dbService.getPool();
        if (pool) {
            return pool.connect();
        }
        throw new Error('Database pool not initialized');
    },
    on: (event, handler) => {
        console.log(`[Config DB Proxy] Event listener registered: ${event}`);
    }
};
