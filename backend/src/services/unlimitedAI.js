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
            if (lowerMessage.includes('ሰላም') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return 'ሰላም! እንኳን ደህና መጡ። ማንኛውንም ጥያቄ ይጠይቁኝ።';
            }
            if (lowerMessage.includes('ማን') || lowerMessage.includes('who')) {
                return 'እኔ የAI እርሳኛ ነኝ፣ የኩባንያችን ደንበኛ ጥያቄዎችን ለመለስ እና ድጋፍ ማገኘያ ነኝ።';
            }
            if (lowerMessage.includes('የት') || lowerMessage.includes('where')) {
                return 'የኢትዮጵያ ዋና ከተማ አዲስ አበባ ናት።';
            }
            if (lowerMessage.includes('ምን') || lowerMessage.includes('what')) {
                if (lowerMessage.includes('ኩባንያ')) {
                    return 'እኛ የኩባንያው AI እርሳኛ ልክ ደንበኞችን ለመለስ እና ድጋፍ ማገኘያ ነኝ።';
                }
                if (lowerMessage.includes('አማርኛ') || lowerMessage.includes('language')) {
                    return 'አማርኛ በሰማይ ነጋጽር ነው። እስ የሴማቲክ ተውምር ነው፣ሲ ሲምጊ ነው።';
                }
                return 'ይህ ጥሩ ጥያቄ ነው። ለመልስ እየማገድጋፍ ነኝ።';
            }
            if (lowerMessage.includes('እንዴት') || lowerMessage.includes('how')) {
                return 'እኔ የተማማ መረጃዎችን ለመልስ ይችላል።';
            }
            return 'እኔ ማንግግዎታለሁ።';
        } else {
            // English intelligent responses
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
                return 'Hello! Welcome! How can I help you today?';
            }
            if (lowerMessage.includes('how many continents')) {
                return 'There are 7 continents in the world: Africa, Asia, Europe, North America, South America, Australia (Oceania), and Antarctica.';
            }
            if (lowerMessage.includes('how many countries')) {
                return 'There are 195 recognized countries in the world today.';
            }
            if (lowerMessage.includes('how many oceans')) {
                return 'There are 5 oceans in the world: Pacific, Atlantic, Indian, Southern (Antarctic), and Arctic.';
            }
            if (lowerMessage.includes('what is artificial intelligence') || lowerMessage.includes('ai')) {
                return 'Artificial Intelligence (AI) is the simulation of human intelligence in machines. It includes machine learning, neural networks, and deep learning. AI systems can perform tasks like understanding language, recognizing images, making decisions, and solving problems.';
            }
            if (lowerMessage.includes('how can i improve') && (lowerMessage.includes('programming') || lowerMessage.includes('coding'))) {
                return 'To improve your programming skills: 1) Practice daily with coding challenges. 2) Build real projects. 3) Learn data structures and algorithms. 4) Read clean code. 5) Join coding communities. 6) Master version control (Git). 7) Learn multiple languages. 8) Study computer science fundamentals.';
            }
            if (lowerMessage.includes('tell me about ethiopia') || lowerMessage.includes('ethiopia history')) {
                return 'Ethiopia is a fascinating country in East Africa with a history spanning thousands of years. It is known as the cradle of humanity, home to ancient civilizations, the origin of coffee, and has never been colonized. Its capital is Addis Ababa, and it is famous for landmarks like Lalibela rock churches and the Simien Mountains.';
            }
            if (lowerMessage.includes('capital') && lowerMessage.includes('ethiopia')) {
                return 'The capital city of Ethiopia is Addis Ababa.';
            }
            if (lowerMessage.includes('what time') || lowerMessage.includes('current time')) {
                return 'I cannot provide the current time as I don\'t have access to real-time data. Please check your device\'s clock or search online for the current time.';
            }
            if (lowerMessage.includes('weather')) {
                return 'I cannot provide weather information as I don\'t have access to real-time weather data. Please check a weather app or website for current weather conditions.';
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
            const response = this.generateIntelligentFallback(userMessage, language);

            return {
                response: response,
                confidence: 0.95,
                model: 'intelligent-fallback',
                language: language,
                source: 'fallback'
            };

        } catch (error) {
            console.error('❌ Unlimited AI Service Error:', error);
            return {
                response: 'I apologize, but I am having technical difficulties at the moment. Please try again in a few moments.',
                confidence: 0.1,
                model: 'error',
                language: language,
                source: 'error'
            };
        }
    }
}

module.exports = new UnlimitedAIService();
