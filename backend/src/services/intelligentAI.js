require('dotenv').config({ path: '.env.local' });

class IntelligentAIService {
    constructor() {
        this.dbService = require('../database/database');
        this.apiKey = process.env.HUGGINGFACE_API_KEY;

        console.log('🧠 Intelligent AI Service Configuration:');
        console.log('   API Key exists:', !!this.apiKey);
        console.log('   Environment:', process.env.NODE_ENV || 'development');
    }

    async getResponse(userMessage, language = 'am') {
        try {
            console.log(`🤖 Intelligent AI - Processing: "${userMessage}" in ${language}`);

            // Normalize message for better matching
            const normalizedMessage = this.normalizeMessage(userMessage);

            // Try to find answer in FAQs first
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

            // Generate intelligent response for common questions
            const intelligentResponse = this.generateIntelligentResponse(userMessage, language);
            if (intelligentResponse) {
                console.log('✅ Intelligent response generated');
                await this.trackQuestion(userMessage, language);
                return {
                    response: intelligentResponse,
                    confidence: 0.85,
                    model: 'intelligent-ai',
                    language: language,
                    source: 'intelligent'
                };
            }

            // Fallback response
            console.log('⚠️ Using fallback response');
            return {
                response: this.getFallbackResponse(language),
                confidence: 0.3,
                model: 'fallback',
                language: language,
                source: 'fallback'
            };

        } catch (error) {
            console.error('❌ Intelligent AI Service Error:', error);
            return {
                response: this.getFallbackResponse(language),
                confidence: 0.1,
                model: 'error',
                language: language,
                source: 'error'
            };
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

            // Try exact match first
            const query = language === 'am'
                ? `SELECT question_am, answer_am FROM faqs WHERE is_active = true AND $1 ~* question_am LIMIT 1`
                : `SELECT question_en, answer_en FROM faqs WHERE is_active = true AND $1 ~* question_en LIMIT 1`;

            const result = await this.dbService.query(query, [message]);

            if (result.rows.length > 0) {
                const faq = result.rows[0];
                return language === 'am' ? faq.answer_am : faq.answer_en;
            }

            // Try keyword matching
            const keywords = this.extractKeywords(message);
            if (keywords.length > 0) {
                const keywordConditions = keywords.map((_, index) => `question_${language} ILIKE $${index + 1}`).join(' OR ');
                const finalQuery = language === 'am'
                    ? `SELECT question_am, answer_am FROM faqs WHERE is_active = true AND (${keywordConditions}) LIMIT 1`
                    : `SELECT question_en, answer_en FROM faqs WHERE is_active = true AND (${keywordConditions}) LIMIT 1`;

                const keywordResult = await this.dbService.query(finalQuery, keywords.map(keyword => `%${keyword}%`));

                if (keywordResult.rows.length > 0) {
                    const faq = keywordResult.rows[0];
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
        // Extract meaningful keywords from the message
        const words = message.split(' ').filter(word => word.length > 2);
        return words;
    }

    generateIntelligentResponse(message, language) {
        const lowerMessage = message.toLowerCase();

        if (language === 'am') {
            // Amharic intelligent responses
            if (lowerMessage.includes('ማን') || lowerMessage.includes('who')) {
                return this.generateWhoResponse(lowerMessage, 'am');
            }
            if (lowerMessage.includes('የት') || lowerMessage.includes('where')) {
                return this.generateWhereResponse(lowerMessage, 'am');
            }
            if (lowerMessage.includes('ምን') || lowerMessage.includes('what')) {
                return this.generateWhatResponse(lowerMessage, 'am');
            }
            if (lowerMessage.includes('እንዴት') || lowerMessage.includes('how')) {
                return this.generateHowResponse(lowerMessage, 'am');
            }
            if (lowerMessage.includes('ስንት') || lowerMessage.includes('when')) {
                return this.generateWhenResponse(lowerMessage, 'am');
            }
        } else {
            // English intelligent responses
            if (lowerMessage.includes('who')) {
                return this.generateWhoResponse(lowerMessage, 'en');
            }
            if (lowerMessage.includes('where')) {
                return this.generateWhereResponse(lowerMessage, 'en');
            }
            if (lowerMessage.includes('what')) {
                return this.generateWhatResponse(lowerMessage, 'en');
            }
            if (lowerMessage.includes('how')) {
                return this.generateHowResponse(lowerMessage, 'en');
            }
            if (lowerMessage.includes('when')) {
                return this.generateWhenResponse(lowerMessage, 'en');
            }
        }

        return null;
    }

    generateWhoResponse(message, language) {
        const responses = {
            am: {
                'who am i': 'እርስዎ የኩባንያችን የተማከለ ደንበኛ ናችል። እናንተ ጥሩ አገልግሎት ለማግኘት ይገባዎታል።',
                'who are you': 'እኔ AI አስተኛው እርሳኛ ነኝ፣ የኩባንያዎን ጥያቄዎች ለመመለስ እና ድጋፍ ለመስጠዝ ተዘጋጅቻለሁ።',
                default: 'ስለ ሰው ማንኛውንም መረጃ ለመስጠዝ አልችልም፣ ግን ስለ ኩባንያችን እና አገልግሎቶቻችን መረጃ ልለው።'
            },
            en: {
                'who am i': 'You are a valued customer of our company. You deserve the best service we can provide.',
                'who are you': 'I am an AI assistant designed to help answer your questions and provide support for our company services.',
                default: 'I cannot provide personal information about individuals, but I can help you with information about our company and services.'
            }
        };

        // Check for specific patterns
        if (message.includes('who am i')) return responses[language]['who am i'];
        if (message.includes('who are you')) return responses[language]['who are you'];

        return responses[language].default;
    }

    generateWhereResponse(message, language) {
        const locations = {
            am: {
                'bahir dar': 'ባህር ዳር የኢትዮጵያ ሰሜን ምዕራባዊ ክልል ነው፣ ከታናሳ ሀይቅ ጎማ ይገኛል።',
                'addis ababa': 'አዲስ አበባ የኢትዮጵያ ዋና ከተማ ናት።',
                'ethiopia': 'ኢትዮጵያ በምስራቅ አፍሪካ የምትገኘው ሀገር ናት።',
                default: 'ይቅርታ! ይህ ቦታ ስለ ማንኛውም መረጃ የለኝ። ተጨማማ መረጃ ይስጡ።'
            },
            en: {
                'bahir dar': 'Bahir Dar is located in northwestern Ethiopia, situated on the southern shore of Lake Tana.',
                'addis ababa': 'Addis Ababa is the capital city of Ethiopia.',
                'ethiopia': 'Ethiopia is located in the Horn of Africa.',
                default: 'I apologize, but I don\'t have specific information about that location. Could you provide more details?'
            }
        };

        // Check for known locations
        for (const [location, response] of Object.entries(locations[language])) {
            if (location !== 'default' && message.includes(location)) {
                return response;
            }
        }

        return locations[language].default;
    }

    generateWhatResponse(message, language) {
        const responses = {
            am: {
                'mathematics': 'ሂሳብ ቁጥር፣ መጠን፣ እና ኅዋስ ጥናት ነው። ይህ ዓለምን በሚያረጋጋ ንድፍ፣ ንዑስ እና ግንዛቤ ለመረዳት የሚያስችል ነው።',
                'biology': 'ቢዮሎጂ የህይወትና የህያዊ ነገሮች ሳይንታዊ ጥናት ነው።',
                'physics': 'ፊዚክስ የተፈጥሮ ሳይንስ ነው፣ ጉሮሮ፣ ነገር፣ ኃይል እና እነዚህ እንዴት እንደሚገናኙና እንደሚተገባበቱን ይገልጻል።',
                'chemistry': 'ኬሚስትሪ የነገር ጥናት ነው። ነገሮችን፣ ንጥረኞቻቸውን፣ አንድተኞቻቸውን እና እነዚህ እንደሚለወጡ የሚለወጡበትን መንገዶች ይገልጻል።',
                'capital city ethiopia': 'የኢትዮጵያ ዋና ከተማ አዲስ አበባ ናት።',
                'capital ethiopia': 'የኢትዮጵያ ዋና ከተማ አዲስ አበባ ናት።',
                'addis ababa': 'አዲስ አበባ የኢትዮጵያ ዋና ከተማ ናት፣ ከ1886 ዓ.ም ጀምሮ የተመሠረተው ሲሆን በአፍሪካ ውስጥ ትልቅዓት አለት፣ የተባባው ማዕከራት፣ የአለታው መንግስና የዩኔስኮ ማዕከር ነው።',
                default: 'ይህ ጥሩ ጥያቄ ነው! ለመልስ ማገድጋድ ይፈልግዎታለሁ። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?'
            },
            en: {
                'mathematics': 'Mathematics is the abstract science of number, quantity, and space. It provides the foundation for understanding patterns, structures, and relationships in the world around us.',
                'biology': 'Biology is the scientific study of life and living organisms. It encompasses various fields including genetics, evolution, ecology, microbiology, and more.',
                'physics': 'Physics is the natural science that studies matter, energy, and their interactions in the universe. It seeks to understand how the universe behaves at every scale.',
                'chemistry': 'Chemistry is the scientific study of matter, its properties, composition, structure, and the changes it undergoes during chemical reactions.',
                'capital city ethiopia': 'The capital city of Ethiopia is Addis Ababa.',
                'capital ethiopia': 'The capital city of Ethiopia is Addis Ababa.',
                'addis ababa': 'Addis Ababa is the capital city of Ethiopia. Founded in 1886, it is the largest city in Ethiopia and serves as the political, economic, and cultural center of the country, as well as the headquarters of the African Union and United Nations Economic Commission for Africa.',
                default: 'That\'s a great question! I\'d be happy to help explain that concept. Could you provide more details about what specific aspect you\'d like to know about?'
            }
        };

        // Check for specific subjects with more flexible matching
        const messageLower = message.toLowerCase();

        for (const [subject, response] of Object.entries(responses[language])) {
            if (subject !== 'default' && messageLower.includes(subject)) {
                return response;
            }
        }

        return responses[language].default;
    }

    generateHowResponse(message, language) {
        const responses = {
            am: 'ይህ ጥሩ ጥያቄ ነው! ለመልስ ማገድጋድ ይፈልግዎታለሁ። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?',
            en: 'That\'s a great question! I can help you with that. To give you the best guidance, could you tell me more about what specific aspect you\'d like to learn about?'
        };
        return responses[language];
    }

    generateWhenResponse(message, language) {
        const responses = {
            am: 'ይህ ጥሩ ጥያቄ ነው! ለመልስ ማገድጋድ ይፈልግዎታለሁ። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ክስተት ማወቅ ይፈልጉታለሁ?',
            en: 'That\'s a good question about timing! I can help you with time-related questions. Could you provide more specifics about what event or timeframe you\'re asking about?'
        };
        return responses[language];
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

    getFallbackResponse(language) {
        const responses = {
            am: [
                'እባነህ። ይበለል፡ ስረታም እንደገፈት።',
                'ሰምአች እንደገፈት። ይመልሳል።',
                'ይበለል፡ አስተማምኝ የሆነ ለመልስ ዝግጅት ያለ ሙሉ መረጃ ይስጡ',
                'ጠለፈተይታል። ይበለል፡ ስረታም እንደገፈት።'
            ],
            en: [
                'I apologize, but I am experiencing technical difficulties. Please try again later.',
                'Thank you for your message. Our system is currently experiencing issues.',
                'I am unable to process your request at moment. Please try again.',
                'Sorry, I am having trouble connecting to my AI services. Please contact support.'
            ]
        };

        const randomIndex = Math.floor(Math.random() * responses[language].length);
        return responses[language][randomIndex];
    }
}

module.exports = new IntelligentAIService();
