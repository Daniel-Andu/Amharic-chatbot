require('dotenv').config({ path: '.env.local' });

class ComprehensiveAIService {
    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY;

        console.log('🔧 Comprehensive AI Service Configuration:');
        console.log('   API Key exists:', !!this.apiKey);
        console.log('   Environment:', process.env.NODE_ENV || 'development');
    }

    async getResponse(userMessage, language = 'am') {
        try {
            console.log(`🤖 Comprehensive AI - Processing: "${userMessage}" in ${language}`);
            console.log(`   Detected language: ${language}`);

            // Generate comprehensive response
            const response = this.generateComprehensiveResponse(userMessage, language);

            console.log(`✅ Generated response:`, response);

            return {
                response: response,
                confidence: 0.9,
                model: 'comprehensive-ai',
                language: language
            };

        } catch (error) {
            console.error('❌ Comprehensive AI Service Error:', error);
            return {
                response: this.getFallbackResponse(language),
                confidence: 0.1,
                model: 'error',
                language: language
            };
        }
    }

    generateComprehensiveResponse(message, language) {
        const lowerMessage = message.toLowerCase();

        if (language === 'am') {
            // Amharic responses - check specific questions first
            if (lowerMessage.includes('ድርጅት') || lowerMessage.includes('ድርጅታችሁ') || lowerMessage.includes('company')) {
                return 'እኛ የAI የደንበኛ ድጋፍ መፍትሔዎችን የምንሰጣ ኩባንያ ነን። እኛ በርካታ ቋንቋቋች የሚሰራ የ24/7 ድጋፍ እናል። እኛ የኩባንያዎችን የሚያግዙ ብልህትዊ የውይይት ስርዓቶችን እንፈጥራለን።';
            }
            if (lowerMessage.includes('ሰላም') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return 'ሰላም! እንኳን እንደሚሰል ይሆናል። ምን ልርዳዎት ነው? እኔ የኩባንያ AI አገልግሎት ነኝ።';
            }
            if (lowerMessage.includes('አፍሪካ') || lowerMessage.includes('africa')) {
                return 'አፍሪካ በ54 ተቋማጮች ይከፈላል። እነዚህ በተጨማማ የአፍሪካ ሀገራት መረጃ ይፈልግዎታለሁ። አልጄሪያ ትልቁዋ ሀገር ሲሆን ናይጄሪያ ደግሞ በህዝብ ቁጥር ትልቅዋ ናት።';
            }
            if (lowerMessage.includes('ቢዮሎጂ') || lowerMessage.includes('biology')) {
                return 'ቢዮሎጂ የህይወትና የህያዊ ነገሮች ሳይንታዊ ጥናት ነው። ይህ የምርምር መስኮቶች እንደ ጂኔቲክስ፣ ኤቮሉሽን፣ ኢኮሎጂ፣ ማይክሮቢዮሎጂ እና ሌሎችንም ያካትታል። ቢዮሎጂ ህይወት እንዴት እንደሚሠራ፣ እንደሚገናኝ እና እንደሚለወጥ ያሳውቃል።';
            }
            if (lowerMessage.includes('ፊዚክስ') || lowerMessage.includes('physics')) {
                return 'ፊዚክስ የተፈጥሮ ሳይንስ ነው። እሱ እንደ ጉሮሮ፣ ነገር፣ ኃይል እና እነዚህ በዓለም ውስጥ እንዴት እንደሚገናኙና እንደሚተገባበቱን ይገልጻል። ይህ ከትንሽ ንዑስ አቶማዊ እስከ ታላላይ ኮስሞስ ድረስ በእያኛው ሂደት ያለውን ዓለም ይመረምራል።';
            }
            if (lowerMessage.includes('ኬሚስትሪ') || lowerMessage.includes('chemistry')) {
                return 'ኬሚስትሪ የነገር ጥናት ነው። እሱ ነገሮችን፣ ንጥረኞቻቸውን፣ አንድተኞቻቸውን እና እነዚህ እንደሚለወጡ የሚለወጡበትን መንገዶች ይገልጻል። ኬሚስትሪ ከሂደተ ህይወት ጀምሮ እስከ ኢንዱስትሪ ተግባራት ድረስ ነገሮችን ማለምና ማረዝ ይረዳል።';
            }
            if (lowerMessage.includes('ስለ') || lowerMessage.includes('about')) {
                return 'እኛ የኩባንያ AI አገልግሎታ ነኝ። በርካታ ቋንቋቋች ይሰራል፣ እና 24/7 ድጋፍ እናል። እኛ የዘመኑ ቴክኖሎጂ ያለውን የደንበኛ ድጋፍ ስርዓት እንደምን እንሰጣለን።';
            }
            // Check for "what" patterns that are not part of other questions
            if ((lowerMessage.includes('ምን') || lowerMessage.includes('what')) && !lowerMessage.includes('ድርጅት') && !lowerMessage.includes('ድርጅታችሁ') && !lowerMessage.includes('company')) {
                return 'ይህ ጥሩ ጥያቄ ነው! ለመልስ ማገድጋድ ይፈልግዎታለሁ። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?';
            }
            if (lowerMessage.includes('እንዴት') || lowerMessage.includes('how')) {
                return 'ይህ ጥሩ ጥያቄ ነው! ለመልስ ማገድጋድ ይፈልግዎታለሁ። እባክዎን ተጨማማ መረጃ ይስጡ - በተለይ ምንኛውን ነገር ማወቅ ይፈልጉታለሁ?';
            }
            return 'እባነህ። ጥያቄን በተለይ ይመልሳል። እባክዎን ምን ልርዳዎት ነው? እኔ የኩባንያ AI አገልግሎት ነኝ።';
        } else {
            // English responses - check specific questions first
            if (lowerMessage.includes('population') || lowerMessage.includes('world population')) {
                return 'The current world population is approximately 8.1 billion people as of 2024. This number has been growing steadily over the past century due to advances in medicine, agriculture, and technology. China and India are the two most populous countries, each with over 1.4 billion people. The global population is expected to reach around 9.7 billion by 2050.';
            }
            if (lowerMessage.includes('company') || lowerMessage.includes('your company') || lowerMessage.includes('say something about your company')) {
                return 'We are a leading provider of AI-powered customer support solutions. Our company specializes in creating intelligent conversation systems that help businesses provide 24/7 support to their customers. We support multiple languages including Amharic and English, and use advanced AI technology to ensure accurate and helpful responses.';
            }
            if (lowerMessage.includes('how are you')) {
                return 'I\'m functioning perfectly, thank you for asking! As an AI assistant, I\'m designed to be helpful and ready to assist you with any questions or tasks you might have. I\'m available 24/7 and can communicate in both English and Amharic. How can I help you today?';
            }
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return 'Hello! Welcome to our AI customer support service. How can I help you today?';
            }
            if (lowerMessage.includes('africa') || lowerMessage.includes('countries')) {
                return 'Africa has 54 recognized countries. This is the largest number of countries on any continent. Each country has its own unique culture, languages, and geography. Is there a specific African country you would like to know more about?';
            }
            if (lowerMessage.includes('biology')) {
                return 'Biology is the scientific study of life and living organisms. It encompasses various fields including genetics, evolution, ecology, microbiology, and more. Biology helps us understand how living things function, interact, and evolve. From the smallest microorganisms to complex ecosystems, biology explores the fascinating world of life in all its forms.';
            }
            if (lowerMessage.includes('physics')) {
                return 'Physics is the natural science that studies matter, energy, and their interactions in the universe. It seeks to understand how the universe behaves at every scale, from subatomic particles to entire galaxies. Key areas include mechanics, thermodynamics, electromagnetism, quantum mechanics, and relativity.';
            }
            if (lowerMessage.includes('chemistry')) {
                return 'Chemistry is the scientific study of matter, its properties, composition, structure, and the changes it undergoes during chemical reactions. It explores the atoms, molecules, and ions that make up matter and how they interact with each other. Chemistry is central to understanding everything from biological processes to industrial applications.';
            }
            if (lowerMessage.includes('mathematics') || lowerMessage.includes('math')) {
                return 'Mathematics is the abstract science of number, quantity, and space. It provides the foundation for understanding patterns, structures, and relationships in the world around us. Mathematics includes arithmetic, algebra, geometry, calculus, and many other branches that help us solve problems and describe natural phenomena.';
            }
            if (lowerMessage.includes('computer') || lowerMessage.includes('programming')) {
                return 'Computer science is the study of computation, information processing, and the design of computer systems. It encompasses programming, algorithms, data structures, artificial intelligence, machine learning, and many other areas. Computer science drives innovation in nearly every field of modern technology.';
            }
            if (lowerMessage.includes('history')) {
                return 'History is the study of past events, civilizations, and human societies. It helps us understand how we got to where we are today by examining political, social, economic, and cultural developments over time. History provides valuable lessons and context for understanding current events and making informed decisions about the future.';
            }
            if (lowerMessage.includes('population') || lowerMessage.includes('world population')) {
                return 'The current world population is approximately 8.1 billion people as of 2024. This number has been growing steadily over the past century due to advances in medicine, agriculture, and technology. China and India are the two most populous countries, each with over 1.4 billion people. The global population is expected to reach around 9.7 billion by 2050.';
            }
            if (lowerMessage.includes('company') || lowerMessage.includes('your company') || lowerMessage.includes('say something about your company')) {
                return 'We are a leading provider of AI-powered customer support solutions. Our company specializes in creating intelligent conversation systems that help businesses provide 24/7 support to their customers. We support multiple languages including Amharic and English, and use advanced AI technology to ensure accurate and helpful responses.';
            }
            if (lowerMessage.includes('how are you')) {
                return 'I\'m functioning perfectly, thank you for asking! As an AI assistant, I\'m designed to be helpful and ready to assist you with any questions or tasks you might have. I\'m available 24/7 and can communicate in both English and Amharic. How can I help you today?';
            }
            if (lowerMessage.includes('about') || lowerMessage.includes('service')) {
                return 'We provide AI-powered customer support solutions with multilingual capabilities. Our service is available 24/7 and supports both English and Amharic languages. We specialize in intelligent conversation systems for businesses.';
            }
            if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
                return 'I\'m here to help! You can ask me questions about our services, or I can assist you with general information. What specific assistance do you need today?';
            }

            // General question patterns
            if (lowerMessage.includes('what is') || lowerMessage.includes('define')) {
                return 'That\'s a great question! I\'d be happy to help explain that concept. Based on what you\'ve asked, I can provide information on various topics including science, mathematics, history, and more. Could you tell me which specific subject you\'re interested in learning about?';
            }
            if (lowerMessage.includes('how to') || lowerMessage.includes('how do')) {
                return 'I can help you with that! To give you the best guidance, could you tell me more about what specific aspect you\'d like to learn about or what you\'re trying to accomplish? I can assist with educational content, explanations, and step-by-step guidance.';
            }
            if (lowerMessage.includes('why') || lowerMessage.includes('why does')) {
                return 'That\'s an interesting question about causation and reasoning. I can help explain the "why" behind many phenomena in science, nature, and human behavior. What specific topic would you like me to explain the reasons for?';
            }
            if (lowerMessage.includes('when') || lowerMessage.includes('where')) {
                return 'I can help you with time and location questions. To give you accurate information, could you provide more specifics about what event, place, or timeframe you\'re asking about?';
            }

            return 'Thank you for your message. I\'m here to assist you with any questions or concerns you may have. I can help with educational topics, general information, and customer support. What would you like to know more about?';
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

module.exports = new ComprehensiveAIService();
