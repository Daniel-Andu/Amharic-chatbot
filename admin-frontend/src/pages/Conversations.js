import React, { useState, useEffect } from 'react';
import { conversationsAPI } from '../services/api';
import {
    MessageSquare,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Eye,
    Trash2,
    Search,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Conversations = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await dashboardAPI.getConversations();
            setConversations(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch conversations');
            // Mock data for demo
            setConversations([
                {
                    id: 1,
                    session_id: 'session-001',
                    user_ip: '192.168.1.100',
                    language: 'am',
                    started_at: '2026-03-17T10:30:00Z',
                    ended_at: '2026-03-17T10:45:00Z',
                    status: 'ended',
                    total_messages: 12,
                    avg_confidence: 0.85
                },
                {
                    id: 2,
                    session_id: 'session-002',
                    user_ip: '192.168.1.101',
                    language: 'en',
                    started_at: '2026-03-17T11:15:00Z',
                    ended_at: null,
                    status: 'active',
                    total_messages: 8,
                    avg_confidence: 0.92
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'ended':
                return <XCircle className="w-4 h-4 text-gray-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800 border-green-200',
            ended: 'bg-gray-100 text-gray-800 border-gray-200',
            escalated: 'bg-red-100 text-red-800 border-red-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.ended}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.user_ip.includes(searchTerm);
        const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleViewDetails = async (conversation) => {
        setSelectedConversation(conversation);
        setShowDetails(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-6">
                {/* Conversations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredConversations.map((conversation) => (
                        <div key={conversation.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(conversation.status)}
                                        <span className="text-sm font-medium text-gray-600">
                                            {conversation.session_id}
                                        </span>
                                    </div>
                                    {getStatusBadge(conversation.status)}
                                </div>

                                {/* Info Grid */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Language</span>
                                        <span className="text-sm font-medium text-gray-800">
                                            {conversation.language === 'am' ? 'Amharic (አማርኛ)' : 'English'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Messages</span>
                                        <span className="text-sm font-medium text-gray-800">
                                            {conversation.total_messages || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Confidence</span>
                                        <span className="text-sm font-medium text-gray-800">
                                            {((conversation.avg_confidence || 0) * 100).toFixed(1)}%
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">IP Address</span>
                                        <span className="text-sm font-medium text-gray-800">
                                            {conversation.user_ip}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Started</span>
                                        <span className="text-sm font-medium text-gray-800">
                                            {formatDate(conversation.started_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleViewDetails(conversation)}
                                            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>

                                        <div className="flex items-center space-x-2">
                                            <button className="text-gray-500 hover:text-gray-700 p-1">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredConversations.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No conversations found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'No conversations have been recorded yet'
                            }
                        </p>
                    </div>
                )}

                {/* Details Modal */}
                {showDetails && selectedConversation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800">Conversation Details</h2>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="text-gray-500 hover:text-gray-700 p-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-4">Session Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm text-gray-500">Session ID</span>
                                                <p className="font-medium text-gray-800">{selectedConversation.session_id}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500">Status</span>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {getStatusIcon(selectedConversation.status)}
                                                    {getStatusBadge(selectedConversation.status)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500">Language</span>
                                                <p className="font-medium text-gray-800">
                                                    {selectedConversation.language === 'am' ? 'Amharic (አማርኛ)' : 'English'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-4">Statistics</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm text-gray-500">Total Messages</span>
                                                <p className="font-medium text-gray-800">{selectedConversation.total_messages || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500">Average Confidence</span>
                                                <p className="font-medium text-gray-800">
                                                    {((selectedConversation.avg_confidence || 0) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-500">IP Address</span>
                                                <p className="font-medium text-gray-800">{selectedConversation.user_ip}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Export Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Conversations;
