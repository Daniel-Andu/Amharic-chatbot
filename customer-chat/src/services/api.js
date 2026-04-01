import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://amharic-chatbot-49ki.onrender.com/api'
        : 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 25000, // 25 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // For customer chat, just clear token - don't redirect to admin
            console.log('Authentication failed - token cleared');
        }
        return Promise.reject(error);
    }
);

// Chat API
export const chatAPI = {
    startConversation: (language = 'am', sessionId = null) => {
        const data = sessionId ? { language, sessionId } : { language };
        return api.post('/chat/start', data);
    },
    sendMessage: (data) => api.post('/chat/message', data),
    getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
    endConversation: (sessionId) => api.post(`/chat/end/${sessionId}`),
};

export default api;
