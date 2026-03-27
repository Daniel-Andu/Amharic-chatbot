import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Bot, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('🔐 Attempting login with:', email);

            // First check if backend is responding by trying to connect
            try {
                const response = await authAPI.login({ email, password });
                console.log('✅ Login response received:', response.data);

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                console.log('💾 Token stored:', response.data.token.substring(0, 20) + '...');
                console.log('👤 User stored:', response.data.user);

                toast.success('Login successful!');
                navigate('/dashboard');
            } catch (apiError) {
                // If backend is not responding, use demo mode
                if (apiError.code === 'ECONNREFUSED' || apiError.code === 'NETWORK_ERROR' || apiError.message.includes('timeout')) {
                    console.log('🔄 Backend not responding, using demo mode');

                    if (email === 'admin@aiassistant.com' && password === 'admin123') {
                        const fakeToken = 'demo-token-' + Date.now();
                        const fakeUser = {
                            id: 1,
                            username: 'admin',
                            email: 'admin@aiassistant.com',
                            role: 'admin'
                        };

                        localStorage.setItem('token', fakeToken);
                        localStorage.setItem('user', JSON.stringify(fakeUser));

                        console.log('💾 Demo token stored:', fakeToken);
                        console.log('👤 Demo user stored:', fakeUser);

                        toast.success('Demo login successful!');
                        navigate('/dashboard');
                        return;
                    } else {
                        toast.error('Invalid demo credentials');
                    }
                } else {
                    throw apiError; // Re-throw other errors
                }
            }
        } catch (error) {
            console.error('❌ Login error details:', error);
            console.error('Response data:', error.response?.data);
            console.error('Error code:', error.code);
            console.error('Error status:', error.response?.status);

            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-600 to-indigo-700 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    AI Assistant System
                </h1>
                <p className="text-center text-gray-600 font-medium mb-8">
                    Admin Dashboard Login
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/90 backdrop-blur-sm"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/90 backdrop-blur-sm"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
