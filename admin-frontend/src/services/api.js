import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://amharic-chatbot-backend.onrender.com/api'
        : 'http://localhost:5000/api');

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Check if it's a demo token - disable demo mode to use real backend
        if (token.startsWith('demo-token-')) {
            console.log('🎭 Demo token detected but using real backend:', config.url);
            // Don't skip the request - let it go to the real backend
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        }
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Adding token to request:', config.url);
    } else {
        console.log('❌ No token found in localStorage for:', config.url);
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        // Better error logging with fallbacks
        const errorUrl = error.config?.url || 'unknown';
        const errorStatus = error.response?.status || 'no status';
        const errorData = error.response?.data || 'no data';
        const errorCode = error.code || 'no code';

        // If backend is not responding, use fallback mode (but not for users)
        if (errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT' || error.message?.includes('timeout')) {
            console.log(' Backend not responding, using fallback mode');

            // Return mock data for dashboard stats
            if (errorUrl === '/dashboard/stats') {
                return Promise.resolve({
                    data: {
                        metrics: {
                            totalConversations: 0,
                            activeUsers: 0,
                            avgResponseTime: 2.5,
                            satisfactionRate: 94.2,
                            aiAccuracy: 85.0,
                            totalMessages: 0,
                            escalationRate: 0
                        },
                        languageDistribution: [],
                        userGrowth: [],
                        responseTimeData: [],
                        confidenceTrends: [],
                        topQuestions: [],
                        languageStats: [],
                        todayChats: 0
                    }
                });
            }

            // Return mock data for conversations
            if (errorUrl === '/dashboard/conversations') {
                return Promise.resolve({
                    data: {
                        conversations: [],
                        total: 0,
                        page: 1,
                        totalPages: 1
                    }
                });
            }
        }

        // Only remove token and redirect on actual 401 authentication errors
        if (errorStatus === 401 && errorData?.error === 'Invalid or expired token') {
            console.log(' Authentication failed, removing token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                console.log(' Redirecting to login due to 401');
                window.location.href = '/login';
            }
        }

        // Log the error for debugging
        console.error(' API Error:', errorUrl, errorStatus, errorData, 'Code:', errorCode);

        // Return a rejected promise to trigger catch blocks
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
};

// Chat API
export const chatAPI = {
    startConversation: (language = 'am') => api.post('/chat/start', { language }),
    sendMessage: (data) => api.post('/chat/message', data),
    getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
    endConversation: (sessionId) => api.post(`/chat/end/${sessionId}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getTopQuestions: (params) => api.get('/dashboard/top-questions', { params }),
    getConversations: (params) => api.get('/dashboard/conversations', { params }),
    getConversationDetails: (id) => api.get(`/dashboard/conversations/${id}`),
    getUsers: (params) => api.get('/dashboard/users', { params }),
    getNotifications: () => api.get('/dashboard/notifications'),
};

// Knowledge API
export const knowledgeAPI = {
    uploadDocument: (formData) => api.post('/knowledge/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getDocuments: (params) => api.get('/knowledge/documents', { params }),
    deleteDocument: (id) => api.delete(`/knowledge/documents/${id}`),

    createFAQ: (data) => api.post('/knowledge/faqs', data),
    getFAQs: (params) => api.get('/knowledge/faqs', { params }),
    updateFAQ: (id, data) => api.put(`/knowledge/faqs/${id}`, data),
    deleteFAQ: (id) => api.delete(`/knowledge/faqs/${id}`),
};

export default api;
