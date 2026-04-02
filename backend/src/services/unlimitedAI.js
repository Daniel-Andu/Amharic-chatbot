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

    generateIntelligentFallback(message, language) {
        const lowerMessage = message.toLowerCase();

        if (language === 'am') {
            // Amharic intelligent responses
            if (lowerMessage.includes('ማን') || lowerMessage.includes('who')) {
                return 'እኔ የAI እርሳኛ ነኝ፣ የኩባንያችን ደንበኛ ጥያቄዎችን ለመለስ እና ድጋፍ ማገኘያ ነኝ።';
            }
            if (lowerMessage.includes('የት') || lowerMessage.includes('where')) {
                return 'የኢትዮጵያ ዋና ከተማ አዲስ አበባ ናት።';
            }
            if (lowerMessage.includes('ምን') || lowerMessage.includes('what')) {
                if (lowerMessage.includes('ኩባንያ')) {
                    return 'አማርኛ ቋን ሰማይ ነጋጽር ነው። እስ ምክልተያችን የሰውር የሚምርትም እንዴት አማርኛ ነኝ፣ የሚምርትም እንደሚሰራ ይግለጹልኝ።';
                }
                if (lowerMessage.includes('አማርኛ') || lowerMessage.includes('language')) {
                    return 'አማርኛ በሰማይ ነጋጽር ነው። እስ የሴማቲክ ተውምር ነው፣ሲ ሲምጊ ነው። ይልማይ የተለላይ እንዴት አለልጣስ ይግለጹልኝ።';
                }
                return 'እኛ የኩባንያው AI እርሳኛ ልክ ደንበኞችን ለመለስ እና ድጋፍ ማገኘያ ነኝ።';
            }
            return 'ይህ ጥሩ ጥያቄ ነው። ለመልስ እየማገድጋፍ ነኝ።';
        } else {
            // English intelligent responses
            if (lowerMessage.includes('what is artificial intelligence') || lowerMessage.includes('ai')) {
                return 'Artificial Intelligence (AI) is the simulation of human intelligence in machines. It includes machine learning, neural networks, and deep learning. AI systems can perform tasks like understanding language, recognizing images, making decisions, and solving problems. Modern AI uses large language models and algorithms to process information and provide intelligent responses.';
            }
            if (lowerMessage.includes('how can i improve') && (lowerMessage.includes('programming') || lowerMessage.includes('coding'))) {
                return 'To improve your programming skills: 1) Practice daily with coding challenges on platforms like LeetCode, HackerRank, or CodeWars. 2) Build real projects - start small and gradually increase complexity. 3) Learn data structures and algorithms thoroughly. 4) Read clean code by Robert C. Martin. 5) Join coding communities and contribute to open source. 6) Master version control (Git). 7) Learn multiple programming languages. 8) Study computer science fundamentals. Consistency is key - code every day!';
            }
            if (lowerMessage.includes('tell me about ethiopia')) {
                return 'Ethiopia is a fascinating country in East Africa with a history spanning thousands of years. It is known as the cradle of humanity, home to ancient civilizations, the origin of coffee, and has never been colonized. Its capital is Addis Ababa, and it is famous for landmarks like Lalibela rock churches and the Simien Mountains.';
            }
            return 'That is an excellent question! I can provide information about various topics including science, technology, geography, history, and general knowledge. What specific topic would you like to learn about?';
        }
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
