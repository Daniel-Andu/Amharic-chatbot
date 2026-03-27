// Simple in-memory storage for conversations when database is not available
class MemoryStore {
    constructor() {
        this.conversations = new Map();
        this.messages = new Map();
        this.topQuestions = new Map();
    }

    // Conversation operations
    saveConversation(sessionId, conversationData) {
        this.conversations.set(sessionId, {
            ...conversationData,
            id: sessionId,
            created_at: new Date()
        });
    }

    getConversation(sessionId) {
        return this.conversations.get(sessionId);
    }

    // Message operations
    saveMessage(messageData) {
        const conversationId = messageData.conversation_id;
        if (!this.messages.has(conversationId)) {
            this.messages.set(conversationId, []);
        }
        
        const messages = this.messages.get(conversationId);
        const message = {
            id: messages.length + 1,
            created_at: new Date(),
            ...messageData
        };
        messages.push(message);
        return message;
    }

    getMessages(conversationId) {
        return this.messages.get(conversationId) || [];
    }

    // Top questions tracking
    trackQuestion(question, language) {
        const key = `${question.toLowerCase().trim()}_${language}`;
        const current = this.topQuestions.get(key) || { count: 0, lastAsked: new Date() };
        
        current.count += 1;
        current.lastAsked = new Date();
        
        this.topQuestions.set(key, current);
        return current;
    }

    getTopQuestions(limit = 10) {
        return Array.from(this.topQuestions.entries())
            .map(([key, data]) => {
                const [question, lang] = key.split('_');
                return {
                    question,
                    ask_count: data.count,
                    last_asked: data.lastAsked,
                    language: lang
                };
            })
            .sort((a, b) => b.ask_count - a.ask_count)
            .slice(0, limit);
    }

    // Admin dashboard data
    getStats() {
        const totalConversations = this.conversations.size;
        let totalMessages = 0;
        
        for (const messages of this.messages.values()) {
            totalMessages += messages.length;
        }

        const languageStats = {};
        for (const conv of this.conversations.values()) {
            const lang = conv.language || 'am';
            languageStats[lang] = (languageStats[lang] || 0) + 1;
        }

        return {
            totalChats: totalConversations,
            totalMessages,
            avgConfidence: 0.85,
            todayChats: totalConversations,
            escalationRate: 5.2,
            languageStats: Object.entries(languageStats).map(([lang, count]) => ({
                language: lang,
                count
            }))
        };
    }

    getConversationLogs(limit = 20, offset = 0) {
        const conversations = Array.from(this.conversations.values())
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit);

        return conversations.map(conv => ({
            ...conv,
            message_count: this.getMessages(conv.id).length,
            escalated: false
        }));
    }

    getConversationDetails(sessionId) {
        const conversation = this.getConversation(sessionId);
        if (!conversation) {
            return null;
        }

        return {
            conversation,
            messages: this.getMessages(sessionId)
        };
    }
}

module.exports = new MemoryStore();
