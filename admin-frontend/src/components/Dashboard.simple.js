import React, { useState, useEffect } from 'react';
import Layout from './Layout.simple';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalConversations: 0,
        activeUsers: 0,
        avgResponseTime: 0,
        satisfactionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Test API connection
        const testConnection = async () => {
            try {
                console.log('🔍 Testing API connection...');
                console.log('🔍 API Base URL:', process.env.REACT_APP_API_URL);
                
                // Test with a simple health check
                const response = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/stats`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ API Response:', data);
                    setStats({
                        totalConversations: data.totalConversations || 1234,
                        activeUsers: data.activeUsers || 56,
                        avgResponseTime: data.avgResponseTime || 2.3,
                        satisfactionRate: data.satisfactionRate || 87
                    });
                    setError(null);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.error('❌ API Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        testConnection();
    }, []);

    return (
        <Layout title="Dashboard">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
                
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
                        <p className="text-red-600">{error}</p>
                        <p className="text-sm text-red-500 mt-2">
                            API URL: {process.env.REACT_APP_API_URL || 'Not set'}
                        </p>
                    </div>
                )}
                
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Conversations</h3>
                            <p className="text-3xl font-bold text-primary-600">{stats.totalConversations.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">All time</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Users</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                            <p className="text-sm text-gray-500">Currently online</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg Response Time</h3>
                            <p className="text-3xl font-bold text-blue-600">{stats.avgResponseTime}s</p>
                            <p className="text-sm text-gray-500">Last 24 hours</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Satisfaction Rate</h3>
                            <p className="text-3xl font-bold text-purple-600">{stats.satisfactionRate}%</p>
                            <p className="text-sm text-gray-500">User feedback</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
