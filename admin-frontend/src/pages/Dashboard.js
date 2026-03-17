import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import {
    MessageSquare,
    FileText,
    TrendingUp,
    Users,
    Activity,
    ArrowUp,
    ArrowDown,
    BarChart3,
    Globe,
    Search,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to fetch statistics');
            // Mock data for demo
            setStats({
                totalChats: 1234,
                totalMessages: 5678,
                avgConfidence: 87.5,
                escalationRate: 12.3,
                todayChats: 89,
                languageStats: [
                    { language: 'am', count: 678 },
                    { language: 'en', count: 556 }
                ],
                hourlyStats: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    chats: Math.floor(Math.random() * 50) + 10,
                    messages: Math.floor(Math.random() * 200) + 50
                }))
            });
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, change, color, bgColor, subtitle }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="flex flex-col items-end">
                    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-2`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    {change && (
                        <div className={`flex items-center text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {change.startsWith('+') ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {change}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>

                        {/* Admin User */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Time Range:</span>
                        </div>
                        <div className="flex space-x-2">
                            {['1h', '24h', '7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {range === '1h' ? 'Last Hour' : range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={MessageSquare}
                    title="Total Chats"
                    value={stats?.totalChats?.toLocaleString() || '0'}
                    change="+12.5%"
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                    subtitle="All time conversations"
                />
                <StatCard
                    icon={FileText}
                    title="Total Messages"
                    value={stats?.totalMessages?.toLocaleString() || '0'}
                    change="+18.2%"
                    color="text-green-600"
                    bgColor="bg-green-100"
                    subtitle="Messages exchanged"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Avg Confidence"
                    value={`${stats?.avgConfidence || '0'}%`}
                    change="+2.1%"
                    color="text-orange-600"
                    bgColor="bg-orange-100"
                    subtitle="AI response accuracy"
                />
                <StatCard
                    icon={Users}
                    title="Escalation Rate"
                    value={`${stats?.escalationRate || '0'}%`}
                    change="-5.3%"
                    color="text-red-600"
                    bgColor="bg-red-100"
                    subtitle="Transferred to human"
                />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Activity Overview</h3>
                                <p className="text-xs text-gray-500">Chat volume over time</p>
                            </div>
                        </div>
                        <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 outline-none">
                            <option>Chats & Messages</option>
                            <option>Chats Only</option>
                            <option>Messages Only</option>
                        </select>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                        <div className="text-center">
                            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Chart Visualization</p>
                            <p className="text-sm text-gray-500">Interactive charts coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Language Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Language Usage</h3>
                            <p className="text-xs text-gray-500">Distribution by language</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {stats?.languageStats?.map((lang) => {
                            const total = stats.languageStats.reduce((sum, l) => sum + l.count, 0);
                            const percentage = ((lang.count / total) * 100).toFixed(1);
                            const isAmharic = lang.language === 'am';

                            return (
                                <div key={lang.language} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Globe className={`w-4 h-4 ${isAmharic ? 'text-orange-500' : 'text-blue-500'}`} />
                                            <span className="text-sm font-medium text-gray-700">
                                                {isAmharic ? 'Amharic (አማርኛ)' : 'English'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-semibold text-gray-800">{lang.count}</span>
                                            <span className="text-xs text-gray-500">({percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${isAmharic ? 'bg-orange-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Activity</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">New Conversations</span>
                            <span className="font-semibold text-gray-800">{stats?.todayChats || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Sessions</span>
                            <span className="font-semibold text-gray-800">
                                {Math.floor((stats?.todayChats || 0) * 0.3)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Avg Response Time</span>
                            <span className="font-semibold text-gray-800">2.3s</span>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">API Status</span>
                            <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="font-semibold text-green-600">Online</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Database</span>
                            <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="font-semibold text-green-600">Connected</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">AI Service</span>
                            <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="font-semibold text-green-600">Operational</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
