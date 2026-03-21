import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout.enterprise';
import Dashboard from './components/Dashboard.enterprise';
import Login from './pages/Login.enterprise';

function App() {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated() ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="App">
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
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversation Logs</h3>
                                        <p className="text-gray-600">View and analyze all conversation history.</p>
                                    </div>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/knowledge"
                        element={
                            <ProtectedRoute>
                                <Layout title="Knowledge Base">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Knowledge Base</h3>
                                        <p className="text-gray-600">Manage documents and FAQs for AI training.</p>
                                    </div>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/training"
                        element={
                            <ProtectedRoute>
                                <Layout title="AI Training">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Training</h3>
                                        <p className="text-gray-600">Retrain and improve AI model performance.</p>
                                    </div>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <Layout title="Analytics">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analytics</h3>
                                        <p className="text-gray-600">Detailed analytics and insights.</p>
                                    </div>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Layout title="Settings">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                                        <p className="text-gray-600">Configure system settings and preferences.</p>
                                    </div>
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
