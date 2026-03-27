import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Download, Eye, User, Bot, Clock, CheckCircle, AlertCircle, TrendingUp, Globe, Calendar, MessageCircle, Zap, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dashboardAPI } from '../services/api';

const Conversations = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterLanguage, setFilterLanguage] = useState('all');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [realTimeStats, setRealTimeStats] = useState(null);

    // Fetch conversations from API
    useEffect(() => {
        fetchConversations();
        // Set up real-time updates
        const interval = setInterval(fetchConversations, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [page, filterStatus, filterLanguage, searchQuery]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getConversations({
                page,
                limit: 20,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                language: filterLanguage !== 'all' ? filterLanguage : undefined,
                keyword: searchQuery || undefined
            });

            const data = response.data;
            setConversations(data.conversations || []);
            setTotalPages(data.totalPages || 1);

            // Calculate real-time stats
            const stats = {
                totalConversations: data.total || 0,
                activeConversations: data.conversations?.filter(c => c.status === 'active').length || 0,
                avgConfidence: data.conversations?.reduce((sum, c) => sum + (c.avgConfidence || 0), 0) / (data.conversations?.length || 1) || 0,
                totalMessages: data.conversations?.reduce((sum, c) => sum + (c.messageCount || 0), 0) || 0
            };

            setRealTimeStats(stats);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            toast.error('Failed to fetch conversations');
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversationDetails = async (sessionId) => {
        try {
            const response = await dashboardAPI.getConversationDetails(sessionId);
            setSelectedConversation(response.data);
        } catch (error) {
            console.error('Failed to fetch conversation details:', error);
            toast.error('Failed to fetch conversation details');
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = (conv.user && conv.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (conv.email && conv.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (conv.summary && conv.summary.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
        const matchesLanguage = filterLanguage === 'all' || conv.language === filterLanguage;

        return matchesSearch && matchesStatus && matchesLanguage;
    });

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
            abandoned: { bg: 'bg-red-100', text: 'text-red-800', label: 'Abandoned' },
            escalated: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Escalated' }
        };

        const config = statusConfig[status] || statusConfig.active;
        return `${config.bg} ${config.text}`;
    };

    const getSatisfactionStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
            </span>
        ));
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'bg-green-500';
        if (confidence >= 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const formatRelativeTime = (dateString, language = 'en') => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const isAmharic = language === 'am' || language === 'amharic';

        if (diff < 60000) return isAmharic ? 'አሁን' : 'Just now';
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return isAmharic ? `${minutes} ደቂቃዎች በፊት` : `${minutes} minutes ago`;
        }
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return isAmharic ? `${hours} ሰዓታት በፊት` : `${hours} hours ago`;
        }
        const days = Math.floor(diff / 86400000);
        return isAmharic ? `${days} ቀናት በፊት` : `${days} days ago`;
    };

    const exportConversations = () => {
        const csvContent = [
            ['Session ID', 'User', 'Email', 'Language', 'Status', 'Start Time', 'Duration', 'Messages', 'Avg Confidence', 'Satisfaction'],
            ...filteredConversations.map(conv => [
                conv.sessionId || conv.id,
                conv.user || 'Unknown',
                conv.email || 'N/A',
                conv.language === 'amharic' ? 'አማርኛ' : 'English',
                conv.status || 'active',
                conv.started_at ? new Date(conv.started_at).toLocaleString() : 'N/A',
                formatDuration(conv.duration),
                conv.messageCount || 0,
                `${conv.avgConfidence || 0}%`,
                `${conv.satisfaction || 4}/5`
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success('Conversations exported successfully!');
    };

    if (loading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">💬 Conversations</h2>
                        <p className="text-gray-600 font-medium">Manage and monitor all conversations</p>
                        {realTimeStats && (
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>• {realTimeStats.totalConversations} total</span>
                                <span>• {realTimeStats.activeConversations} active</span>
                                <span>• {realTimeStats.totalMessages} messages</span>
                                <span>• {Math.round(realTimeStats.avgConfidence)}% avg confidence</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={exportConversations}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by user, email, or summary..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white/90 backdrop-blur-sm"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/90 backdrop-blur-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="abandoned">Abandoned</option>
                        <option value="escalated">Escalated</option>
                    </select>
                    <select
                        value={filterLanguage}
                        onChange={(e) => setFilterLanguage(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/90 backdrop-blur-sm"
                    >
                        <option value="all">All Languages</option>
                        <option value="english">English</option>
                        <option value="amharic">አማርኛ (Amharic)</option>
                    </select>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="w-4 h-4" />
                        <span>{filteredConversations.length} conversations found</span>
                    </div>
                </div>
            </div>

            {/* Conversations Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Confidence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredConversations.map((conv) => (
                                <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{conv.user || 'Unknown User'}</div>
                                            <div className="text-sm text-gray-500">{conv.email || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${conv.language === 'amharic'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {conv.language === 'amharic' ? 'አማርኛ' : 'English'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(conv.status || 'active')}`}>
                                            {(conv.status || 'active').charAt(0).toUpperCase() + (conv.status || 'active').slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>{formatDuration(conv.duration)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4 text-gray-400" />
                                            <span>{conv.messageCount || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(conv.avgConfidence || 0)}`}></div>
                                            <span className="text-sm font-medium">{conv.avgConfidence || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            {getSatisfactionStars(conv.satisfaction || 4)}
                                            <span className="text-sm text-gray-500 ml-1">({conv.satisfaction || 4}/5)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => fetchConversationDetails(conv.sessionId || conv.id)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors" title="Export">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, filteredConversations.length)} of {filteredConversations.length} results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Conversation Details Modal */}
            {selectedConversation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Conversation Details</h3>
                                <p className="text-sm text-gray-500">Session: {selectedConversation.sessionId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <AlertCircle className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">User</p>
                                <p className="font-semibold text-gray-900">{selectedConversation.user}</p>
                                <p className="text-sm text-gray-500">{selectedConversation.email}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Language</p>
                                <p className="font-semibold text-gray-900">{selectedConversation.language === 'amharic' ? 'አማርኛ' : 'English'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Duration</p>
                                <p className="font-semibold text-gray-900">{formatDuration(selectedConversation.duration)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 mb-4">Conversation Messages</h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {(selectedConversation.messages || []).map((message) => (
                                    <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                        }`}>
                                        {message.type === 'user' && (
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        {message.type === 'ai' && (
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div className={`max-w-md rounded-2xl px-4 py-3 ${message.type === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}>
                                            <p className="text-sm mb-2">{message.content}</p>
                                            <p className="text-xs opacity-70">{formatRelativeTime(message.timestamp, selectedConversation.language)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-2">Conversation Summary</h4>
                            <p className="text-sm text-gray-700">{selectedConversation.summary || 'No summary available'}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-gray-600">Total Messages</p>
                                    <p className="font-semibold text-gray-900">{selectedConversation.messageCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Avg Confidence</p>
                                    <p className="font-semibold text-gray-900">{selectedConversation.avgConfidence}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Satisfaction</p>
                                    <div className="flex items-center gap-1">
                                        {getSatisfactionStars(selectedConversation.satisfaction)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Conversations;
