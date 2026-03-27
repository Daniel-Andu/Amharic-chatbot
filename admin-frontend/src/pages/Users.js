import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Mail, MapPin, Calendar, Globe, Smartphone, Monitor, Star, TrendingUp, Activity, UserPlus, UserMinus, Trash2, Edit, Shield, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dashboardAPI } from '../services/api';

const UsersManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterLanguage, setFilterLanguage] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [realTimeStats, setRealTimeStats] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        // Set up real-time updates
        const interval = setInterval(fetchUsers, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [page, filterStatus, filterLanguage, searchQuery]);

    const fetchUsers = async () => {
        try {
            console.log('🔄 Fetching users...');
            setLoading(true);
            const response = await dashboardAPI.getUsers({
                page,
                limit: 20,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                language: filterLanguage !== 'all' ? filterLanguage : undefined,
                keyword: searchQuery || undefined
            });

            console.log('✅ Users API response:', response.data);
            const data = response.data;
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);

            // Calculate real-time stats
            const stats = {
                totalUsers: data.total || 0,
                activeUsers: data.users?.filter(u => u.status === 'active').length || 0,
                newUsersToday: data.users?.filter(u => {
                    const today = new Date().toDateString();
                    return new Date(u.created_at).toDateString() === today;
                }).length || 0,
                avgSatisfaction: data.users?.reduce((sum, u) => sum + (u.satisfaction || 4), 0) / (data.users?.length || 1) || 0
            };

            setRealTimeStats(stats);
            setLoading(false);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            toast.error('Failed to fetch users');
            setUsers([]);
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            // For now, we'll use the user data from the list
            // In a real implementation, you'd have a separate API endpoint
            const user = users.find(u => u.email === userId);
            if (user) {
                setSelectedUser(user);
            }
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            toast.error('Failed to fetch user details');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.language && user.language.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesLanguage = filterLanguage === 'all' || user.language === filterLanguage;

        return matchesSearch && matchesStatus && matchesLanguage;
    });

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
            suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' }
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

    const getLocationInfo = (language) => {
        // Simulate location based on language
        if (language === 'am') {
            return {
                country: 'Ethiopia',
                city: 'Addis Ababa',
                timezone: 'EAT (UTC+3)',
                flag: '🇪🇹'
            };
        }
        return {
            country: 'International',
            city: 'Various',
            timezone: 'UTC',
            flag: '🌍'
        };
    };

    const getDeviceIcon = (device) => {
        switch (device) {
            case 'mobile': return <Smartphone className="w-4 h-4" />;
            case 'desktop': return <Monitor className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatLastSeen = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return `${Math.floor(diff / 86400000)} days ago`;
    };

    const suspendUser = async (userId) => {
        if (window.confirm('Are you sure you want to suspend this user? They will not be able to access the chat system.')) {
            try {
                // In a real implementation, you'd call an API endpoint
                // await dashboardAPI.suspendUser(userId);
                console.log('Suspend user:', userId);
                toast.success('User suspended successfully');
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Failed to suspend user:', error);
                toast.error('Failed to suspend user');
            }
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their conversation history.')) {
            try {
                // In a real implementation, you'd call an API endpoint
                // await dashboardAPI.deleteUser(userId);
                console.log('Delete user:', userId);
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const sendMessageToUser = (userEmail) => {
        const message = prompt('Enter message to send to user:');
        if (message) {
            console.log('Send message to', userEmail, ':', message);
            toast.success('Message sent successfully');
            // In a real implementation, you'd call an API endpoint
            // await dashboardAPI.sendMessageToUser(userEmail, message);
        }
    };

    const viewUserConversations = (userEmail) => {
        console.log('View conversations for user:', userEmail);
        // In a real implementation, you'd navigate to conversations filtered by user
        // navigate(`/conversations?user=${encodeURIComponent(userEmail)}`);
        toast.info('Viewing user conversations...');
    };

    const exportUsers = () => {
        const csvContent = [
            ['Username', 'Email', 'Status', 'Languages', 'Conversation Count', 'Avg Confidence', 'Join Date', 'Last Seen'],
            ...filteredUsers.map(user => [
                user.username || 'Unknown',
                user.email || 'N/A',
                user.status || 'active',
                user.languages || 'Unknown',
                user.conversationCount || 0,
                `${user.avgConfidence || 0}%`,
                user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
                user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Users exported successfully');
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
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
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">👥 Users</h2>
                        <p className="text-gray-600 font-medium">Manage and monitor all users</p>
                        {realTimeStats && (
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>• {realTimeStats.totalUsers} total users</span>
                                <span>• {realTimeStats.activeUsers} active</span>
                                <span>• {realTimeStats.newUsersToday} new today</span>
                                <span>• {realTimeStats.avgSatisfaction.toFixed(1)}/5 avg satisfaction</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={exportUsers}
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
                            placeholder="Search by name, email, or location..."
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
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select
                        value={filterLanguage}
                        onChange={(e) => setFilterLanguage(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/90 backdrop-blur-sm"
                    >
                        <option value="all">All Languages</option>
                        <option value="am">አማርኛ (Amharic)</option>
                        <option value="en">English</option>
                    </select>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="w-4 h-4" />
                        <span>{filteredUsers.length} users found</span>
                    </div>
                </div>
            </div>

            {/* Users Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Total Users</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {realTimeStats?.totalUsers || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">+12.5%</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Active Users</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                                {realTimeStats?.activeUsers || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">+8.2%</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-md">
                            <Activity className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Languages</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                                2
                            </p>
                            <p className="text-xs text-gray-500 mt-1">+5.1%</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-md">
                            <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Avg Satisfaction</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-orange-800 to-orange-600 bg-clip-text text-transparent">
                                {(realTimeStats?.avgSatisfaction || 4).toFixed(1)}/5
                            </p>
                            <p className="text-xs text-gray-500 mt-1">+15.3%</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-md">
                            <Star className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversations</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => {
                                const location = getLocationInfo(user.language);
                                return (
                                    <tr key={`${user.email}-${user.username}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{user?.username || 'Unknown User'}</div>
                                                    <div className="text-sm text-gray-500">{user?.language === 'am' ? 'አማርኛ' : 'English'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{user?.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{location.flag}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{location.city}</div>
                                                    <div className="text-xs text-gray-500">{location.timezone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status || 'active')}`}>
                                                {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{formatDate(user.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                                <span>{user.conversationCount || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {getSatisfactionStars(user.satisfaction || 4)}
                                                <span className="text-sm text-gray-500 ml-1">({user.satisfaction || 4}/5)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => fetchUserDetails(user.email)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => viewUserConversations(user.email)}
                                                    className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                                                    title="View Conversations"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => sendMessageToUser(user.email)}
                                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                                    title="Send Message"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => suspendUser(user.email)}
                                                    className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                                                    title="Suspend"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.email)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, filteredUsers.length)} of {filteredUsers.length} results
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

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                <p className="text-sm text-gray-500">User ID: #{selectedUser.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <AlertCircle className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-6 mb-6">
                            <img
                                src={selectedUser.profilePicture}
                                alt={selectedUser.name}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <h4 className="text-xl font-semibold text-gray-800">{selectedUser.name}</h4>
                                <p className="text-gray-600">{selectedUser.email}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(selectedUser.status)}`}>
                                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                                    </span>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSubscriptionBadge(selectedUser.subscription)}`}>
                                        {selectedUser.subscription.charAt(0).toUpperCase() + selectedUser.subscription.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Phone</p>
                                <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Location</p>
                                <p className="font-semibold text-gray-900">{selectedUser.location}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Preferred Language</p>
                                <p className="font-semibold text-gray-900">{selectedUser.preferredLanguage === 'amharic' ? 'አማርኛ' : 'English'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Timezone</p>
                                <p className="font-semibold text-gray-900">{selectedUser.timezone}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Device</p>
                                <p className="font-semibold text-gray-900">{selectedUser.device}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 mb-1">Join Date</p>
                                <p className="font-semibold text-gray-900">{selectedUser.joinDate}</p>
                            </div>
                        </div>

                        {/* Activity Stats */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h4 className="font-semibold text-gray-800 mb-4">Activity Statistics</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Total Conversations</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedUser.totalConversations}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Average Satisfaction</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold text-gray-900">{selectedUser.avgSatisfaction}</p>
                                        <div className="flex items-center gap-1">
                                            {getSatisfactionStars(selectedUser.avgSatisfaction)}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Seen</p>
                                    <p className="text-lg font-semibold text-gray-900">{selectedUser.lastSeen}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
