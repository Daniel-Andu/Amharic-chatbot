import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Shield, Mail, Lock } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('🔐 Attempting login with:', email);

            // Call real API
            const response = await authAPI.login({ email, password });

            if (response.data.token && response.data.user) {
                // Store real token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                if (rememberMe) {
                    localStorage.setItem('rememberEmail', email);
                }

                console.log('✅ Real login successful!');
                console.log('🔑 Real token stored:', response.data.token);
                console.log('👤 Real user stored:', response.data.user);

                toast.success('Login successful!');
                window.location.href = '/dashboard';
            } else {
                toast.error('Invalid credentials');
            }
        } catch (error) {
            console.error('❌ Login error:', error);

            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else if (error.message?.includes('timeout')) {
                toast.error('Server timeout - please try again');
            } else {
                toast.error('Login failed - please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-600">
                        Sign in to your Amharic AI Assistant admin dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="admin@aiassistant.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                    onClick={() => console.log('Forgot password clicked')}
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <LogIn className="w-4 h-4" />
                                        <span>Sign in</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Demo Credentials */}


                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                    <p>&copy; 2024 Amharic AI Assistant. All rights reserved.</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-500"
                            onClick={() => console.log('Privacy Policy clicked')}
                        >
                            Privacy Policy
                        </button>
                        <span>&bull;</span>
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-500"
                            onClick={() => console.log('Terms of Service clicked')}
                        >
                            Terms of Service
                        </button>
                        <span>&bull;</span>
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-500"
                            onClick={() => console.log('Support clicked')}
                        >
                            Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
