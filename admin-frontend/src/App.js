import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout.enterprise';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login.enterprise';
import Analytics from './pages/Analytics';
import AITraining from './pages/AITraining';
import KnowledgeBase from './pages/KnowledgeBase';
import Conversations from './pages/Conversations';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return token !== null && user !== null;
    };

    const ProtectedRoute = ({ children }) => {
        const [isChecking, setIsChecking] = React.useState(true);
        const [isAuth, setIsAuth] = React.useState(false);

        React.useEffect(() => {
            const checkAuth = () => {
                const token = localStorage.getItem('token');
                const user = localStorage.getItem('user');
                const isValid = token !== null && user !== null;

                // Check if it's a demo token or real token
                const isDemoToken = token && token.startsWith('demo-token-');

                console.log('🔍 Checking authentication:');
                console.log('  Token exists:', !!token);
                console.log('  User exists:', !!user);
                console.log('  Is demo token:', isDemoToken);
                console.log('  Is valid:', isValid);

                setIsAuth(isValid);
                setIsChecking(false);
            };

            checkAuth();

            // Listen for storage changes
            const handleStorageChange = () => {
                checkAuth();
            };

            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }, []);

        if (isChecking) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-600 via-teal-600 to-indigo-700 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>
                        <p className="text-center text-gray-700 font-medium">Loading...</p>
                    </div>
                </div>
            );
        }

        return isAuth ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Toaster position="top-right" />
                <Routes>
                    {/* Login Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout title="Dashboard">
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout title="Dashboard">
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/conversations"
                        element={
                            <ProtectedRoute>
                                <Layout title="Conversation Logs">
                                    <Conversations />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/knowledge"
                        element={
                            <ProtectedRoute>
                                <Layout title="Knowledge Base">
                                    <KnowledgeBase />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/training"
                        element={
                            <ProtectedRoute>
                                <Layout title="AI Training">
                                    <AITraining />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <Layout title="Analytics">
                                    <Analytics />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute>
                                <Layout title="User Management">
                                    <Users />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Layout title="Settings">
                                    <Settings />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
