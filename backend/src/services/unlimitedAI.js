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

            // Always use Groq AI for intelligent responses
            return await this.callGroqAI(userMessage, language);

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

    async callGroqAI(message, language) {
        try {
            if (!this.apiKey || !this.groqService) {
                throw new Error('Groq API not configured');
            }

            const systemPrompt = this.getSystemPrompt(language);

            console.log('🤖 Calling Groq API...');

            const completion = await this.groqService.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.9,
            });

            if (completion.choices && completion.choices[0] && completion.choices[0].message) {
                let aiResponse = completion.choices[0].message.content.trim();
                return {
                    response: aiResponse,
                    confidence: 0.85,
                    model: 'llama-3.3-70b-versatile',
                    language: language,
                    source: 'ai'
                };
            }

            throw new Error('Invalid Groq response');

        } catch (error) {
            console.error('❌ Groq API error:', error.message);
            throw error;
        }
    }

    getSystemPrompt(language) {
        const prompts = {
            am: `You are a helpful, professional AI customer support assistant. The user is communicating in Amharic. You MUST respond EXCLUSIVELY in native, natural, and grammatically correct Amharic (አማርኛ). Be polite and helpful. Provide direct, specific answers to questions. Do not use English words unless referring to specific technical terms. Keep responses concise but informative.`,
            en: `You are a helpful AI assistant for a company's customer support system. You provide intelligent, helpful, and accurate responses to customer questions. You can answer questions about various topics including science, geography, history, technology, and general knowledge. Be conversational and friendly. Provide direct, specific answers. If you don't know something, admit it politely. Keep responses concise but informative.`
        };

        return prompts[language] || prompts.en;
    }
}

module.exports = new UnlimitedAIService();
