class SimpleAIService {
    async getResponse(userMessage, language = 'am') {
        const responses = {
            'am': {
                'hello': 'ሰላም! እንደት ልርዳዎት እችላለሁ። የትክክን ምን ይረዳታል?',
                'help': 'እርዳጋል! እኔ ከሚችል አገልጋጎች፡\n1. የኩባንያ መረጃ\n2. እርዳቶችን መስጠን\n3. የንግጓኛ ድጋፋ\n4. ተማማዝኛ እርዳቶች',
                'ሰላም': 'ሰላም! እንደት ልርዳዎት እችላለሁ። የትክክን ምን ይረዳታል?',
                'እንደት': 'እርዳጋል! እኔ ከሚችል አገልጋጎች፡\n1. የኩባንያ መረጃ\n2. እርዳቶችን መስጠን\n3. የንግጓኛ ድጋፋ\n4. ተማማዝኛ እርዳቶች',
                'default': 'ሰላም! እንደት ልርዳዎት እችላለሁ። የትክክን ምን ይረዳታል?'
            },
            'en': {
                'hello': 'Hello! How can I help you today?',
                'help': 'I can help you with:\n1. Company information\n2. Answering questions\n3. Language support\n4. General assistance',
                'hi': 'Hello! How can I assist you today?',
                'default': 'Hello! How can I help you today?'
            }
        };

        const lowerMessage = userMessage.toLowerCase().trim();
        const langResponses = responses[language] || responses['en'];
        
        // Find exact match first
        if (langResponses[lowerMessage]) {
            return {
                response: langResponses[lowerMessage],
                confidence: 0.95
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
}

module.exports = new SimpleAIService();
