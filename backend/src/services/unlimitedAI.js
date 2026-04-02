require('dotenv').config({ path: '.env.local' });

class UnlimitedAIService {
    constructor() {
        this.dbService = require('../database/database');
        this.apiKey = process.env.GROQ_API_KEY;
        if (this.apiKey) {
            const Groq = require('groq-sdk');
            this.groqService = new Groq({ apiKey: this.apiKey });
        }

        console.log('🧠 Unlimited AI Service Configuration (Groq Llama 3):');
        console.log('   API Key exists:', !!this.apiKey);
        console.log('   Environment:', process.env.NODE_ENV || 'development');
    }

    async getResponse(userMessage, language = 'am') {
        try {
            console.log(`🤖 Unlimited AI - Processing: "${userMessage}" in ${language}`);

            // Normalize message for better matching
            const normalizedMessage = this.normalizeMessage(userMessage);

            // First try to find answer in FAQs (for instant responses)
            const faqResponse = await this.searchFAQs(normalizedMessage, language);
            if (faqResponse) {
                console.log('✅ FAQ response found');
                await this.trackQuestion(userMessage, language);
                return {
                    response: faqResponse,
                    confidence: 0.95,
                    model: 'faq-knowledge',
                    language: language,
                    source: 'faq'
                };
            }

            // Try to find answer in company info
            const companyResponse = await this.searchCompanyInfo(normalizedMessage, language);
            if (companyResponse) {
                console.log('✅ Company info response found');
                await this.trackQuestion(userMessage, language);
                return {
                    response: companyResponse,
                    confidence: 0.90,
                    model: 'company-knowledge',
                    language: language,
                    source: 'company'
                };
            }

            // If no local knowledge found, use Groq AI for unlimited, fast responses
            const aiResponse = await this.callGroqAI(userMessage, language);
            if (aiResponse) {
                console.log('✅ Groq AI response generated');
                await this.trackQuestion(userMessage, language);
                return {
                    response: aiResponse,
                    confidence: 0.85,
                    model: 'llama-3.3-70b-versatile',
                    language: language,
                    source: 'ai'
                };
            }

            // Ultimate fallback (should rarely happen)
            console.log('⚠️ Using ultimate fallback');
            return {
                response: this.getUltimateFallback(language),
                confidence: 0.2,
                model: 'ultimate-fallback',
                language: language,
                source: 'fallback'
            };

        } catch (error) {
            console.error('❌ Unlimited AI Service Error:', error);
            return {
                response: this.getUltimateFallback(language),
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
                console.log('⚠️ No Groq API key, using intelligent fallback');
                return this.generateIntelligentFallback(message, language);
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
                return aiResponse;
            }

            console.log('⚠️ Invalid Groq response, using intelligent fallback');
            return this.generateIntelligentFallback(message, language);

        } catch (error) {
            console.error('❌ Groq API error:', error.message);
            return this.generateIntelligentFallback(message, language);
        }
    }

    getSystemPrompt(language) {
        const prompts = {
            am: `You are a helpful, professional AI customer support assistant. The user is communicating in Amharic. You MUST respond EXCLUSIVELY in native, natural, and grammatically correct Amharic (አማርኛ). Be polite and helpful. Do not use English words unless referring to specific technical terms.`,
            en: `You are a helpful AI assistant for a company's customer support system. You provide intelligent, helpful, and accurate responses to customer questions. You can answer questions about various topics including science, geography, history, technology, and general knowledge. Be conversational and friendly. If you don't know something, admit it politely. Provide detailed and informative answers.`
        };

        return prompts[language] || prompts.en;
    }

    async translateToAmharic(text) {
        try {
            // Simple translation using common patterns
            const translations = {
                'hello': 'ሰላም',
                'thank you': 'አመስግለዎታለሁ',
                'goodbye': 'ደህናችል',
                'how are you': 'እንዴት ነህ',
                'welcome': 'እንኳን ደህናችል',
                'i don\'t know': 'አላታደል',
                'please': 'እባክዎ',
                'sorry': 'ይቅርባል',
                'help': 'እርዳዎት',
                'information': 'መረጃ',
                'question': 'ጥያቄ',
                'answer': 'መልስ',
                'customer': 'ደንበኛ',
                'service': '��ገልግሎት',
                'company': 'ድርጅት',
                'ethiopia': 'ኢትዮጵያ',
                'addis ababa': 'አዲስ አበባ',
                'bahir dar': 'ባህር ዳር'
            };

            let translatedText = text;
            for (const [english, amharic] of Object.entries(translations)) {
                translatedText = translatedText.replace(new RegExp(english, 'gi'), amharic);
            }

            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }

    isEnglishResponse(text) {
        // Simple check if response is primarily English
        const englishPattern = /^[a-zA-Z0-9\s\.,!?'"-]+$/;
        return englishPattern.test(text.trim());
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
        }
        if (lowerMessage.includes('እንዴት') || lowerMessage.includes('how')) {
            return 'እኔ የተማማ መረጃዎችን ለመልስ ይችላል።';
        }
        return 'እኔ ማንግግዎታለሁ።';
    } else {
    // English intelligent responses
    if (lowerMessage.includes('who')) {
        return 'I am an AI assistant designed to help answer your questions and provide support for our company services. I can assist with various topics including science, geography, history, and general knowledge.';
    }
    if (lowerMessage.includes('where')) {
        if (lowerMessage.includes('capital') && lowerMessage.includes('ethiopia')) {
            return 'The capital city of Ethiopia is Addis Ababa.';
        }
        if (lowerMessage.includes('bahir dar')) {
            return 'Bahir Dar is located in northwestern Ethiopia, situated on the southern shore of Lake Tana.';
        }
        if (lowerMessage.includes('ethiopia')) {
            return 'Ethiopia is a country located in the Horn of Africa, with Addis Ababa as its capital city. It is known for its rich history, diverse culture, and being the origin of coffee.';
        }
        return 'That\'s a great question about location! I can help you with geographical information about various places.';
    }
    if (lowerMessage.includes('what')) {
        if (lowerMessage.includes('artificial intelligence') || lowerMessage.includes('ai')) {
            return 'Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think and learn. It includes machine learning, neural networks, and deep learning. AI systems can perform tasks like understanding language, recognizing images, making decisions, and solving problems. Modern AI uses large language models and algorithms to process information and provide intelligent responses.';
        }
        if (lowerMessage.includes('ethiopia')) {
            return 'Ethiopia is a fascinating country in East Africa with a history spanning thousands of years. It\'s known as the cradle of humanity, home to ancient civilizations, the origin of coffee, and has never been colonized. Its capital is Addis Ababa, and it\'s famous for landmarks like Lalibela\'s rock churches and the Simien Mountains.';
        }
        if (lowerMessage.includes('company') && lowerMessage.includes('doing')) {
            return 'Our company provides AI-powered customer support solutions. We specialize in creating intelligent conversation systems that help businesses provide 24/7 support to their customers. Our platform supports multiple languages including Amharic and English, and we use advanced AI technology to ensure accurate and helpful responses.';
        }
        if (lowerMessage.includes('how can i improve') && (lowerMessage.includes('programming') || lowerMessage.includes('coding'))) {
            return 'To improve your programming skills: 1) Practice daily with coding challenges on platforms like LeetCode, HackerRank, or CodeWars. 2) Build real projects - start small and gradually increase complexity. 3) Learn data structures and algorithms thoroughly. 4) Read clean code by Robert C. Martin. 5) Join coding communities and contribute to open source. 6) Master version control (Git). 7) Learn multiple programming languages. 8) Study computer science fundamentals. Consistency is key - code every day!';
        }
        if (lowerMessage.includes('biology')) {
            return 'Biology is the scientific study of life and living organisms. It encompasses various fields including genetics, evolution, ecology, microbiology, and more.';
        }
        if (lowerMessage.includes('physics')) {
            return 'Physics is the natural science that studies matter, energy, and their interactions in the universe. It seeks to understand how the universe behaves at every scale.';
        }
        if (lowerMessage.includes('chemistry')) {
            return 'Chemistry is the scientific study of matter, its properties, composition, structure, and the changes it undergoes during chemical reactions.';
        }
        if (lowerMessage.includes('mathematics')) {
            return 'Mathematics is the abstract science of number, quantity, and space. It provides the foundation for understanding patterns, structures, and relationships in the world around us.';
        }
        return 'That\'s an excellent question! I can provide information about various topics including science, technology, geography, history, and general knowledge. What specific topic would you like to learn about?';
    }
    if (lowerMessage.includes('how')) {
        if (lowerMessage.includes('work') || lowerMessage.includes('function')) {
            return 'I work by analyzing your questions and providing relevant answers based on my training and available knowledge. I use advanced AI technology to understand your queries and generate helpful responses.';
        }
        return 'That\'s a practical question! I can explain processes and procedures. To give you the most helpful guidance, could you tell me more about what specific process or method you\'d like to understand?';
    }
    if (lowerMessage.includes('why')) {
        return 'That\'s a thoughtful question! I can explain reasons and causes. To provide you with the most comprehensive explanation, could you specify what phenomenon or situation you\'d like me to explain?';
    }
    if (lowerMessage.includes('advice') || lowerMessage.includes('advise')) {
        return 'I\'d be happy to provide some helpful advice! Here are a few key areas: 1) Continuous learning - always seek to expand your knowledge and skills. 2) Stay curious - ask questions and explore new ideas. 3) Take care of your health - both physical and mental well-being are crucial. 4) Build meaningful relationships - connect with others and nurture your social bonds. 5) Set clear goals - having direction helps you stay focused and motivated. What specific area would you like advice about?';
    }
    return 'I\'m here to help you with information and assistance! I can answer questions about various topics including science, geography, history, technology, and general knowledge. What would you like to know more about?';
}
    }

normalizeMessage(message) {
    return message.toLowerCase()
        .trim()
        .replace(/[^\w\s\u1200-\u137F]/g, '') // Keep letters, numbers, spaces, and Amharic characters
        .replace(/\s+/g, ' ');
}

    async searchFAQs(message, language) {
    try {
        if (!this.dbService.isConnectedStatus()) {
            return null;
        }

        // Try exact match first (most accurate)
        const exactQuery = language === 'am'
            ? `SELECT question_am, answer_am FROM faqs WHERE is_active = true AND LOWER(question_am) = LOWER($1) LIMIT 1`
            : `SELECT question_en, answer_en FROM faqs WHERE is_active = true AND LOWER(question_en) = LOWER($1) LIMIT 1`;

        const exactResult = await this.dbService.query(exactQuery, [message]);

        if (exactResult.rows.length > 0) {
            const faq = exactResult.rows[0];
            return language === 'am' ? faq.answer_am : faq.answer_en;
        }

        // Try phrase matching (more specific than keyword)
        const messageWords = message.toLowerCase().split(' ').filter(w => w.length > 2);
        if (messageWords.length > 0) {
            const phraseConditions = messageWords.map((_, index) => `LOWER(question_${language}) LIKE $${index + 1}`).join(' AND ');
            const phraseQuery = language === 'am'
                ? `SELECT question_am, answer_am FROM faqs WHERE is_active = true AND (${phraseConditions}) LIMIT 1`
                : `SELECT question_en, answer_en FROM faqs WHERE is_active = true AND (${phraseConditions}) LIMIT 1`;

            const phraseParams = messageWords.map(word => `%${word}%`);
            const phraseResult = await this.dbService.query(phraseQuery, phraseParams);

            if (phraseResult.rows.length > 0) {
                const faq = phraseResult.rows[0];
                return language === 'am' ? faq.answer_am : faq.answer_en;
            }
        }

        return null;
    } catch (error) {
        console.error('FAQ search error:', error);
        return null;
    }
}

    async searchCompanyInfo(message, language) {
    try {
        if (!this.dbService.isConnectedStatus()) {
            return null;
        }

        const keywords = this.extractKeywords(message);

        for (const keyword of keywords) {
            const query = language === 'am'
                ? `SELECT content_am FROM company_info WHERE is_active = true AND $1 ~* (title_am || ' ' || content_am) LIMIT 1`
                : `SELECT content_en FROM company_info WHERE is_active = true AND $1 ~* (title_en || ' ' || content_en) LIMIT 1`;

            const result = await this.dbService.query(query, [keyword]);

            if (result.rows.length > 0) {
                return language === 'am' ? result.rows[0].content_am : result.rows[0].content_en;
            }
        }

        return null;
    } catch (error) {
        console.error('Company info search error:', error);
        return null;
    }
}

extractKeywords(message) {
    // Extract meaningful keywords from message
    const words = message.split(' ').filter(word => word.length > 2);
    return words;
}

    async trackQuestion(message, language) {
    try {
        if (!this.dbService.isConnectedStatus()) {
            return;
        }

        const normalizedMessage = this.normalizeMessage(message);

        await this.dbService.query(`
                INSERT INTO top_questions (question, question_normalized, language, ask_count, last_asked)
                VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)
                ON CONFLICT (question_normalized, language)
                DO UPDATE SET 
                    ask_count = top_questions.ask_count + 1,
                    last_asked = CURRENT_TIMESTAMP
            `, [message, normalizedMessage, language]);

    } catch (error) {
        console.error('Error tracking question:', error);
    }
}

getUltimateFallback(language) {
    const responses = {
        am: [
            'እኔ ማንግግዎታለሁ! ይህ የተማማ መረጃ ለመልስ ይችላል። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?',
            'ሰምአች እንደሚገት ነው! ይህ የተማማ መረጃ ለመልስ ይችላል። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?',
            'ይቅርባል! እኔ የተማማ መረጃ ለመልስ ይችላል። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?'
        ],
        en: [
            'I apologize, but I\'m having technical difficulties at the moment. Please try again in a few moments.',
            'Thank you for your message! I\'m here to help with information and assistance. I can answer questions about various topics including science, geography, history, and general knowledge. What would you like to know more about?',
            'I\'m experiencing some technical issues right now, but I\'m still here to help! Could you please rephrase your question or try again?'
        ]
    };

    const randomIndex = Math.floor(Math.random() * responses[language].length);
    return responses[language][randomIndex];
}
}

module.exports = new UnlimitedAIService();
