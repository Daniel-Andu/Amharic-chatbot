const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Memory storage for conversations
const conversations = new Map();
const messages = new Map();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));

app.use(express.json());

// Simple test endpoint
app.post('/api/chat/start', (req, res) => {
    const sessionId = uuidv4();
    const { language = 'am' } = req.body;

    console.log('🚀 Test conversation started:', sessionId, 'Language:', language);

    // Save conversation to memory
    conversations.set(sessionId, {
        session_id: sessionId,
        language,
        started_at: new Date(),
        status: 'active',
        user_ip: req.ip || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'Unknown'
    });

    res.json({
        conversation: {
            session_id: sessionId,
            language,
            started_at: new Date(),
            status: 'active'
        }
    });
});

// Knowledge base endpoints
app.get('/api/knowledge/faqs', (req, res) => {
    // Mock FAQ data - in production this would come from database
    const faqs = [
        {
            id: 1,
            question: 'List some known cities in Ethiopia',
            answer: 'Ethiopia has many major cities including: Addis Ababa (the capital), Dire Dawa, Mekelle, Gondar, Bahir Dar, Hawassa, Jimma, and Adama. Each city has its own unique culture and attractions.',
            category: 'Geography',
            language: 'en'
        },
        {
            id: 2,
            question: 'የትነው የትኖር',
            answer: 'የትነው የትኖር ፣ነት። ይህ የኢትዮጵያ ዋናር ነው።',
            category: 'ጊዜ',
            language: 'am'
        },
        {
            id: 3,
            question: 'What services do you offer?',
            answer: 'We offer AI-powered customer support, multilingual assistance, knowledge base management, and real-time conversation analytics.',
            category: 'Services',
            language: 'en'
        }
    ];

    res.json({ faqs });
});

app.post('/api/chat/message', (req, res) => {
    const { sessionId, message, messageType = 'text', language = 'am' } = req.body;

    console.log('📝 Test message received:', message, 'Language:', language);

    // Check if message matches any FAQ
    const faqs = [
        {
            question: 'list some known cities in ethiopia',
            answer: 'Ethiopia has many major cities including: Addis Ababa (the capital), Dire Dawa, Mekelle, Gondar, Bahir Dar, Hawassa, Jimma, and Adama. Each city has its own unique culture and attractions.',
            language: 'en'
        },
        {
            question: 'የትነው የትኖር',
            answer: 'የትነው የትኖር ፣ነት። ይህ የኢትዮጵያ ዋናር ነው።',
            language: 'am'
        }
    ];

    // Better rule-based responses with Amharic support
    let response;
    const lowerMessage = message.toLowerCase().trim();

    // Check FAQ matches first
    const matchedFAQ = faqs.find(faq =>
        lowerMessage.includes(faq.question) &&
        (faq.language === language || language === 'en')
    );

    if (matchedFAQ) {
        response = matchedFAQ.answer;
    } else if (language === 'am') {
        // Amharic responses
        if (lowerMessage.includes('ሰላም')) {
            response = 'ሰላም! እንደት ልርዳዎት እችላለሁ። የትክክን ምን ይረዳታል?';
        } else if (lowerMessage.includes('ማን') || lowerMessage.includes('ነኝ')) {
            response = 'እኛ AI ረዳት ነን። የሚከተለውን መረጃ በመጠቀም ጥያቄዎችን እናመልስ።';
        } else if (lowerMessage.includes('ምን') || lowerMessage.includes('ነኝ')) {
            response = 'እኔ የኩባንያ AI ረዳት ነኝ። የተለያዩ ጥያቄዎችን መልስ እችላለሁ።';
        } else if (lowerMessage.includes('ኩባንያ') || lowerMessage.includes('ድርጅት')) {
            response = 'ድርጅታችሁ የተለያዩ AI ኩባንያ ነው። የደንበኛ አገልግጎችን፣ የንግጓኛ ድጋፋ፣ እና የተማማዝኛ እርዳቶችን ይሰጣል።';
        } else if (lowerMessage.includes('እንደ')) {
            response = 'እኔ ጥያቄዎችን በመተቀቋው እና ተዛማዝኛ መልስ በመስጠት እሰራለሁ።';
        } else if (lowerMessage.includes('የትነው') || lowerMessage.includes('ዋናር') || lowerMessage.includes('ከተር') || lowerMessage.includes('አዲስ')) {
            response = 'የትነው የትኖር ፣ነት። ይህ የኢትዮጵያ ዋናር ነው።';
        } else if (lowerMessage.includes('ምን ይሰራል')) {
            response = 'እኔ የተለያዩ AI ረዳት ነኝ። እንደት ልርዳዎት እችላለሁ።';
        } else {
            response = 'ሰላም! እንደት ልርዳዎት እችላለሁ። የትክክን ምን ይረዳታል?';
        }
    } else {
        // English responses
        if (lowerMessage.includes('who are you')) {
            response = 'I am an AI assistant designed to help you with information and support.';
        } else if (lowerMessage.includes('what are you')) {
            response = 'I am here to assist you with your questions and provide helpful information.';
        } else if (lowerMessage.includes('company')) {
            response = 'Our company provides AI-powered solutions and customer support services.';
        } else if (lowerMessage.includes('how do you')) {
            response = 'I work by processing your questions and providing relevant responses based on my training.';
        } else if (lowerMessage.includes('capital') && lowerMessage.includes('ethiopia')) {
            response = 'The capital city of Ethiopia is Addis Ababa (አዲስ አበባ). It is the largest city in Ethiopia and serves as the political and administrative center of the country.';
        } else if (lowerMessage.includes('capital') && lowerMessage.includes('ትነው')) {
            response = 'የትነው የትኖር ፣ነት። ይህ የኢትዮጵያ ዋናር ነው።';
        } else if (lowerMessage.includes('addis')) {
            response = 'Addis Ababa (አዲስ አበባ) is the capital and largest city of Ethiopia. It was founded in 1886 and has a population of over 4 million people.';
        } else if (lowerMessage.includes('አዲስ')) {
            response = 'አዲስ አበባ የትነው ዋናር ነው። በ1886 ዓ.ም. ተመሰረተ እና ከ4 ሚልዮን በላይ የሚኖር ከተማሪያ ነው።';
        } else {
            response = 'Hello! How can I help you today?';
        }
    }

    // Save message to memory
    if (!messages.has(sessionId)) {
        messages.set(sessionId, []);
    }

    const messageData = {
        id: messages.get(sessionId).length + 1,
        conversation_id: sessionId,
        message_type: messageType,
        user_message: message,
        ai_response: response,
        confidence_score: 0.85,
        language,
        created_at: new Date()
    };

    messages.get(sessionId).push(messageData);

    res.json({
        response,
        confidence: 0.85,
        sessionId,
        timestamp: new Date()
    });
});

// Simple auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
    // Simple mock login for testing
    res.json({
        token: 'mock-admin-token',
        user: {
            id: 1,
            username: 'admin',
            email: 'admin@aiassistant.com',
            role: 'admin'
        }
    });
});

app.get('/api/auth/profile', (req, res) => {
    // Mock profile
    res.json({
        id: 1,
        username: 'admin',
        email: 'admin@aiassistant.com',
        role: 'admin'
    });
});

// Admin dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
    const totalConversations = conversations.size;
    let totalMessages = 0;
    const languageStats = {};

    for (const conv of conversations.values()) {
        const lang = conv.language || 'am';
        languageStats[lang] = (languageStats[lang] || 0) + 1;
    }

    for (const msgList of messages.values()) {
        totalMessages += msgList.length;
    }

    res.json({
        totalChats: totalConversations,
        totalMessages,
        avgConfidence: 0.85,
        todayChats: totalConversations,
        escalationRate: 5.2,
        languageStats: Object.entries(languageStats).map(([lang, count]) => ({
            language: lang,
            count
        }))
    });
});

app.get('/api/dashboard/conversations', (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conversationList = Array.from(conversations.values())
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
        .slice(offset, offset + parseInt(limit))
        .map(conv => ({
            ...conv,
            message_count: messages.get(conv.session_id)?.length || 0,
            escalated: false
        }));

    res.json({
        conversations: conversationList,
        total: conversations.size,
        page: parseInt(page),
        totalPages: Math.ceil(conversations.size / limit)
    });
});

app.get('/api/dashboard/conversations/:id', (req, res) => {
    const { id } = req.params;
    const conversation = conversations.get(id);

    if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversationMessages = messages.get(id) || [];

    res.json({
        conversation,
        messages: conversationMessages
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📝 Environment: development`);
    console.log(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001, http://localhost:3002`);
});
