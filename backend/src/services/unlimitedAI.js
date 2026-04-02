const { DatabaseService } = require('../database/database');
const Groq = require('groq-sdk');

class UnlimitedAIService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        if (this.apiKey) {
            this.groqService = new Groq({ apiKey: this.apiKey });
        }

        console.log('🧠 Unlimited AI Service Configuration (Groq Llama 3):');
        console.log('   API Key exists:', !!this.apiKey);
        console.log('   Environment:', process.env.NODE_ENV || 'development');
    }

    normalizeMessage(message) {
        return message.toLowerCase()
            .trim()
            .replace(/[^\w\s\u1200-\u137F]/g, '') // Keep letters, numbers, spaces, and Amharic characters
            .replace(/\s+/g, ' ');
    }

    async getResponse(userMessage, language = 'am') {
        try {
            console.log(`🤖 Unlimited AI - Processing: "${userMessage}" in ${language}`);

            // Normalize message for better matching
            const normalizedMessage = this.normalizeMessage(userMessage);

            // Use intelligent fallbacks directly (no external APIs)
            return this.generateIntelligentFallback(userMessage, language);

        } catch (error) {
            console.error('❌ Unlimited AI Service Error:', error);
            return 'I apologize, but I am having technical difficulties at the moment. Please try again in a few moments.';
        }
    }
}

module.exports = new UnlimitedAIService();
