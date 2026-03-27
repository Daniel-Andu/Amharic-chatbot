import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, Clock, Brain, BookOpen, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalConversations: 8439,
        activeUsers: 127,
        avgResponseTime: 1.2,
        satisfactionRate: 94.2,
        totalUsers: 2847,
        knowledgeBase: 156,
        aiAccuracy: 87.3,
        systemHealth: 98.7
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        // Simulate loading for demo
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const statCards = [
        {
            title: 'Total Conversations',
            value: stats.totalConversations.toLocaleString(),
            change: '+12.5%',
            changeType: 'increase',
            icon: MessageSquare,
            color: 'from-blue-600 to-blue-700',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers.toLocaleString(),
            change: '+8.2%',
            changeType: 'increase',
            icon: Users,
            color: 'from-green-600 to-green-700',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Avg Response Time',
            value: `${stats.avgResponseTime}s`,
            change: '-0.3s',
            changeType: 'decrease',
            icon: Clock,
            color: 'from-purple-600 to-purple-700',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Satisfaction Rate',
            value: `${stats.satisfactionRate}%`,
            change: '+2.1%',
            changeType: 'increase',
            icon: TrendingUp,
            color: 'from-orange-600 to-orange-700',
            bgColor: 'bg-orange-50'
        }
    ];

    const detailCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Knowledge Base',
            value: stats.knowledgeBase.toLocaleString(),
            icon: BookOpen,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'AI Accuracy',
            value: `${stats.aiAccuracy}%`,
            icon: Brain,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            title: 'System Health',
            value: `${stats.systemHealth}%`,
            icon: Activity,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                    <p className="text-gray-500">Monitor your AI assistant performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {stat.changeType === 'increase' ? (
                                    <ArrowUp className="w-4 h-4" />
                                ) : (
                                    <ArrowDown className="w-4 h-4" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">User Analytics</h3>
                    <div className="space-y-4">
                        {detailCards.slice(0, 2).map((card, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">{card.title}</p>
                                        <p className="text-xl font-bold text-gray-800">{card.value}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">vs last month</p>
                                    <p className="text-sm font-medium text-green-600">+15.3%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">System Performance</h3>
                    <div className="space-y-4">
                        {detailCards.slice(2, 4).map((card, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                                        <card.icon className={`w-5 h-5 ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">{card.title}</p>
                                        <p className="text-xl font-bold text-gray-800">{card.value}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">vs last month</p>
                                    <p className="text-sm font-medium text-green-600">+5.7%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left group">
                        <Brain className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-gray-800 mb-1">Retrain AI Model</h4>
                        <p className="text-sm text-gray-600">Update AI with latest knowledge base</p>
                    </button>
                    <button className="p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left group">
                        <BookOpen className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-gray-800 mb-1">Update Knowledge Base</h4>
                        <p className="text-sm text-gray-600">Add new documents and FAQs</p>
                    </button>
                    <button className="p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left group">
                        <Users className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-gray-800 mb-1">User Management</h4>
                        <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {[
                        { action: 'New conversation started', user: 'John Doe', time: '2 minutes ago', type: 'conversation' },
                        { action: 'Knowledge base updated', user: 'Admin', time: '15 minutes ago', type: 'knowledge' },
                        { action: 'AI model retrained', user: 'System', time: '1 hour ago', type: 'training' },
                        { action: 'New user registered', user: 'Jane Smith', time: '2 hours ago', type: 'user' }
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                    activity.type === 'conversation' ? 'bg-blue-500' :
                                    activity.type === 'knowledge' ? 'bg-green-500' :
                                    activity.type === 'training' ? 'bg-purple-500' : 'bg-orange-500'
                                }`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                                    <p className="text-xs text-gray-500">by {activity.user}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
