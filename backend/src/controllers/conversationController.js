// Get conversation details with all messages
exports.getConversationDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Get conversation details
        const conversationResult = await dbService.pool.query(
            'SELECT * FROM conversations WHERE session_id = $1',
            [sessionId]
        );
        
        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        // Get all messages for this conversation
        const messagesResult = await dbService.pool.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [conversationResult.rows[0].id]
        );
        
        res.json({
            conversation: conversationResult.rows[0],
            messages: messagesResult.rows
        });
        
    } catch (error) {
        console.error('Get conversation details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Export conversation as JSON
exports.exportConversation = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Get conversation details
        const conversationResult = await dbService.pool.query(
            'SELECT * FROM conversations WHERE session_id = $1',
            [sessionId]
        );
        
        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        // Get all messages for this conversation
        const messagesResult = await dbService.pool.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [conversationResult.rows[0].id]
        );
        
        const exportData = {
            conversation: conversationResult.rows[0],
            messages: messagesResult.rows,
            exported_at: new Date().toISOString(),
            total_messages: messagesResult.rows.length
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="conversation-${sessionId}.json"`);
        res.json(exportData);
        
    } catch (error) {
        console.error('Export conversation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
