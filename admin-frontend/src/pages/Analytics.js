import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, MessageSquare, Clock, Brain, Activity } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const [analyticsData, setAnalyticsData] = useState({
        metrics: {
            totalConversations: 0,
            activeUsers: 0,
            avgResponseTime: 0,
            satisfactionRate: 0,
            aiAccuracy: 0
        },
        languageDistribution: [],
        userGrowth: [],
        responseTimeData: [],
        confidenceTrends: [],
        topQuestions: []
    });
    const [loading, setLoading] = useState(true);

    // Fetch analytics data from API
    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const response = await dashboardAPI.getStats({ timeRange });
            setAnalyticsData(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            toast.error('Failed to fetch analytics data');
            // Keep mock data as fallback
        } finally {
            setLoading(false);
        }
    };

    const metricCards = [
        {
            title: 'Total Conversations',
            value: analyticsData?.metrics?.totalConversations?.toLocaleString() || '0',
            change: '+12.5%',
            changeType: 'increase',
            icon: MessageSquare,
            color: 'from-blue-600 to-blue-700',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Active Users',
            value: analyticsData?.metrics?.activeUsers?.toLocaleString() || '0',
            change: '+8.2%',
            changeType: 'increase',
            icon: Users,
            color: 'from-green-600 to-green-700',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Avg Response Time',
            value: `${analyticsData?.metrics?.avgResponseTime || 0}s`,
            change: '-0.3s',
            changeType: 'decrease',
            icon: Clock,
            color: 'from-teal-600 to-teal-700',
            bgColor: 'bg-teal-50'
        },
        {
            title: 'AI Accuracy',
            value: `${analyticsData?.metrics?.aiAccuracy || 0}%`,
            change: '+2.1%',
            changeType: 'increase',
            icon: TrendingUp,
            color: 'from-orange-600 to-orange-700',
            bgColor: 'bg-orange-50'
        }
    ];

    const COLORS = ['#3B82F6', '#10B981'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">📈 Analytics</h2>
                        <p className="text-gray-500 font-medium">Detailed analytics and insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/90 backdrop-blur-sm"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                        <button className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metricCards.map((metric, index) => (
                        <div key={index} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.bgColor === 'bg-blue-50' ? 'from-blue-100 to-blue-200' : metric.bgColor === 'bg-green-50' ? 'from-green-100 to-green-200' : metric.bgColor === 'bg-teal-50' ? 'from-teal-100 to-teal-200' : 'from-orange-100 to-orange-200'}`}>
                                    <metric.icon className={`w-6 h-6 ${metric.color.split(' ')[0].replace('from-', '')}-600`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${metric.changeType === 'increase'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {metric.changeType === 'increase' ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {metric.change}
                                </div>
                            </div>
                            <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.title}</h3>
                            <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{metric.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Conversation Volume */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">📊 Conversation Volume</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.conversationStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="conversations" fill="#3B82F6" name="Conversations" />
                                <Bar dataKey="users" fill="#10B981" name="Active Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* User Growth */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData?.userGrowth || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Language Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Language Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData?.languageDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(analyticsData?.languageDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Response Time */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Response Time Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData?.responseTimeData || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avgTime" stroke="#8B5CF6" strokeWidth={2} name="Avg Response Time" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Confidence Trends */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Confidence Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.confidenceTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="confidence" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Questions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Questions</h3>
                        <div className="space-y-3">
                            {analyticsData.topQuestions.map((question, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{question.question}</p>
                                        <p className="text-sm text-gray-500">Asked {question.count} times</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">
                                            {question.confidence}% confidence
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${question.confidence >= 90 ? 'bg-green-500' :
                                            question.confidence >= 80 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
