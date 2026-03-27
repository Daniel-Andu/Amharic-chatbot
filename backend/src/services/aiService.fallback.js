const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy-key'
});

class FallbackAIService {
    async getResponse(userMessage, language = 'am') {
        try {
            console.log(`🤖 AI Service - Processing: "${userMessage}" in ${language}`);

            // Enhanced system prompts with better context
            const systemPrompt = language === 'am'
                ? `አንተ የኩባንያ AI ረዳት ነህ። እርዳቶችን በስልጠና በማቅለጥ ይመልሳል።

መምርሆች:
- ለመልስ ዝግጅት ያለ ሙሉ መረጃ ይስጡ
- አስተማማኝ የሆነ ለሰው ድጋፍ ያሳር቉
- በአፍሪካ ብቻ ያልተደገፈ መረጃ አይሰጡ
- የኩባንያውን አገልግሎት ይገልጹ
- እንደ አስፈላጊ ተጨማማ ጥያቄዎችን ይጠይቁ

የኩባንያው ስለ ምንድር:
- የAI አስተማማኝ አገልግሎቶችን ይሰጣል
- የደንበኛ ድጋፍ አገልግሎቶችን ያቀርታል
- በርካታ ቋንቋዎች (አማርኛ፣ እንግሊዝ) ይሰራል
- 24/7 የደንበኛ አገልግሎት`
                : `You are a professional company AI assistant. Provide detailed, helpful responses based on your training.

Guidelines:
- Provide comprehensive, detailed answers
- When you don't know something, direct to human support
- Do not make up unsupported information
- Explain the company's services clearly
- Ask follow-up questions when appropriate

About the company:
- Provides AI-powered customer support solutions
- Offers multilingual support (Amharic, English)
- 24/7 customer service availability
- Specializes in intelligent conversation systems`;

            // ALWAYS try Groq API first if key is available
            if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && process.env.GROQ_API_KEY !== 'gsk_your_groq_api_key_here') {
                try {
                    console.log('🌐 Using Groq API for response...');
                    const completion = await groq.chat.completions.create({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userMessage }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    });

                    const response = completion.choices[0].message.content;
                    const confidence = this.calculateConfidence(completion);

                    console.log('✅ Groq API Response:', response);
                    return {
                        response,
                        confidence
                    };
                } catch (groqError) {
                    console.error('❌ Groq API failed:', groqError.message);
                    console.log('🔄 Falling back to enhanced responses...');
                }
            } else {
                console.log('⚠️ No valid Groq API key found, using enhanced responses');
            }

            // Enhanced rule-based responses as fallback ONLY
            console.log('📚 Using enhanced rule-based responses...');
            return this.getEnhancedRuleBasedResponse(userMessage, language);

        } catch (error) {
            console.error('❌ AI Service error:', error);
            return this.getEnhancedRuleBasedResponse(userMessage, language);
        }
    }

    getEnhancedRuleBasedResponse(userMessage, language = 'am') {
        const lowerMessage = userMessage.toLowerCase().trim();

        // Enhanced responses with more detail
        const responses = {
            'am': {
                'who are you': 'እኔ የኩባንያ AI ረዳት ነኝ። የአስተማማኝ አገልግሎቶችን ይሰጣል፣ በአማርኛና በእንግሊዝኛ እርዳቶችን ይሰጣል፣ 24/7 የደንበኛ አገልግሎት ይሰጣል።',
                'what are you': 'እኔ AI ረዳት ነኝ የሚያስተማማኝና የሚያስገድድ ስርዓት ነው። የኩባንያውን አገልግሎት እንደሚያቀርብ እርዳቶችን በተለያዩ ቋንቋዎች እሰጣል።',
                'how many countries in africa': 'አፍሪካ ውስጥ 54 ነገደቛታት አሉ። እነዚህ አህጉረኞች ከፍተኛ የምድብርት እና የባህር ዳርቻዎች የተለያዩ ና፣ ከፍተኛ የባህር ዳርቻ ረጅም አላቸው።',
                'what is biology': 'ባዮሎጂ የህይወት ምንጭና የህይወት ፍጥረቶችን የሚያገለጽ የሳይንስ ዘርፍ ነው። ይህ ዘርፍ ህይወቶች እንዴት እንደሚሠሩ፣ እንዴት እንደሚያድጉ፣ እና እንዴት እንደሚተላለፉን ይገልጻል።',
                'what is human': 'ሰው የብልች አስተሳች ዝርያ ነው። ሰው የሚያስችል የሚያስተምር፣ የሚያስባ እና የሚያስማማ አካል ነው። ሰው በሳይንስ፣ በቴክኖሎጂ እና በባህል ዓለምን የሚለወጥ ልዩ ፍጥረት ነው።',
                'ሰው ምንድን ነው': 'ሰው የብልች አስተሳች ዝርያ ነው። ሰው የሚያስችል የሚያስተምር፣ የሚያስባ እና የሚያስማማ አካል ነው። ሰው በሳይንስ፣ በቴክኖሎጂ እና በባህል ዓለምን የሚለወጥ ልዩ ፍጥረት ነው።',
                'ድርጅታችሁ ምን ይሰራል': 'እኛ የAI አስተማማኝ አገልግሎቶችን የምንሰጣ ኩባንያ ነን። ይህ የሚያካትት፡\n\n1. የደንበኛ ድጋፍ አገልግሎቶች\n2. በርካታ ቋንቋዎች (አማርኛ፣ እንግሊዝኛ)\n3. 24/7 የደንበኛ አገልግሎት\n4. የንግጓኛ እና የጽሑፍ ድጋፍ\n5. የተማማዝኛ መረጃ እና መረጃ ማስተላለፍ\n\nእኛ ዓላማችን የደንበኞችን ችግሮች በፍጥነት እና በትክክል መፍታት ነው።',
                'default': 'ሰላም! እንደት ልርዳዎት እችላለሁ። የኩባንያውን አገልግሎት፣ የAI አስተማማኝ መፍትሄያዎች፣ ወይም ሌላ ማንኛውንም ጥያቄ እርዳዎት እሰጣለሁ።'
            },
            'en': {
                'who are you': 'I am a professional AI assistant for customer support. I provide intelligent responses, multilingual support (Amharic and English), and 24/7 service availability.',
                'what are you': 'I am an AI-powered assistant designed to provide intelligent customer support. I help users with information, answer questions, and assist with company services.',
                'how many countries in africa': 'Africa has 54 recognized countries. These nations have diverse cultures, languages, and geographical features, with the longest coastline belonging to Somalia.',
                'what is biology': 'Biology is the scientific study of life and living organisms. It explores how living things function, grow, reproduce, and interact with their environment.',
                'what is human': 'Humans are highly intelligent primates belonging to the species Homo sapiens. They are characterized by complex language, advanced reasoning, tool use, and sophisticated social structures.',
                'default': 'Hello! How can I help you today? I\'m here to assist with information, answer questions, and provide support for our services.'
            }
        };

        const langResponses = responses[language] || responses['en'];

        // Check for exact matches first
        if (langResponses[lowerMessage]) {
            return {
                response: langResponses[lowerMessage],
                confidence: 0.95
            };
        }

        // Check for partial matches
        for (const [key, response] of Object.entries(langResponses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                return {
                    response,
                    confidence: 0.85
                };
            }
        }

        // Return default response
        return {
            response: langResponses['default'],
            confidence: 0.75
        };
    }

    calculateConfidence(completion) {
        // Simple confidence calculation based on response characteristics
        const response = completion.choices[0].message.content;
        let confidence = 0.85; // Base confidence

        // Increase confidence for longer, more detailed responses
        if (response.length > 100) confidence += 0.05;
        if (response.length > 200) confidence += 0.05;

        // Increase confidence for structured responses
        if (response.includes('\n') || response.includes('.')) confidence += 0.05;

        return Math.min(confidence, 0.95);
        if (lowerMessage.includes('about your company') || lowerMessage.includes('about campany') || lowerMessage.includes('ስርጅ ኩባንያ')) {
            return {
                response: langResponses['company'] || 'Our company provides AI-powered solutions.',
                confidence: 0.90
            };
        }

        if (lowerMessage.includes('about you') || lowerMessage.includes('ስርጅህ')) {
            return {
                response: language === 'am'
                    ? 'እኛ AI ረዳት ነህ። የሚከተለውን መረጃ በመጠቀም ጥያቄዎችን መልስ።'
                    : 'I am an AI assistant designed to help customers with information and support.',
                confidence: 0.90
            };
        }

        // Then check for single keywords
        if (lowerMessage.includes('who') || lowerMessage.includes('ማን')) {
            return {
                response: langResponses['who'] || 'I am an AI assistant designed to help you.',
                confidence: 0.85
            };
        }

        if (lowerMessage.includes('what') || lowerMessage.includes('ምን')) {
            return {
                response: langResponses['what'] || 'I am here to assist you with your questions.',
                confidence: 0.85
            };
        }

        if (lowerMessage.includes('how') || lowerMessage.includes('እንደ')) {
            return {
                response: langResponses['how'] || 'I work by processing your questions and providing responses.',
                confidence: 0.85
            };
        }

        if (lowerMessage.includes('company') || lowerMessage.includes('campany') || lowerMessage.includes('ኩባንያ')) {
            return {
                response: langResponses['company'] || 'Our company provides AI-powered solutions.',
                confidence: 0.85
            };
        }

        // Find partial match
        for (const [key, response] of Object.entries(langResponses)) {
            if (lowerMessage.includes(key)) {
                return {
                    response: response,
                    confidence: 0.85
                };
            }
        }

        // Default response
        return {
            response: langResponses['default'],
            confidence: 0.70
        };
    }

    calculateConfidence(completion) {
        const finishReason = completion.choices[0].finish_reason;
        if (finishReason === 'stop') {
            return 0.85;
        }
        return 0.60;
    }
}

module.exports = new FallbackAIService();
