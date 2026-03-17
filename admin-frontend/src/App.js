import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Conversations from './pages/Conversations';
import KnowledgeBase from './pages/KnowledgeBase';

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
                    {/* Public Login Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Admin Routes with Single Layout */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Outlet />
                            </Layout>
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="conversations" element={<Conversations />} />
                        <Route path="knowledge" element={<KnowledgeBase />} />
                        <Route path="analytics" element={
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Analytics Dashboard</h3>
                                <p className="text-gray-600">Analytics and reporting features will appear here.</p>
                            </div>
                        } />
                        <Route path="users" element={
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
                                <p className="text-gray-600">User management features will appear here.</p>
                            </div>
                        } />
                        <Route path="settings" element={
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
                                <p className="text-gray-600">System configuration and settings will appear here.</p>
                            </div>
                        } />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
