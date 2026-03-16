import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

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
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversation Logs</h3>
                                        <p className="text-gray-600">Conversation logs will appear here.</p>
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
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Knowledge Base</h3>
                                        <p className="text-gray-600">Knowledge base management will appear here.</p>
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
