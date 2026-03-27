import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, X, Home, Users, MessageSquare, BookOpen, Brain, BarChart3, Settings, LogOut, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Layout = ({ children, title }) => {
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Load real-time notifications
    useEffect(() => {
        fetchNotifications();
        // Set up real-time updates every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await dashboardAPI.getNotifications();
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Fallback to empty notifications on error
            setNotifications([]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/conversations?search=${encodeURIComponent(searchQuery)}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ));
    };

    const getNotificationIcon = (type, priority) => {
        switch (type) {
            case 'conversation':
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'escalation':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'confidence':
                return <Info className="w-4 h-4 text-yellow-500" />;
            case 'milestone':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'border-red-500 bg-red-50';
            case 'high': return 'border-blue-500 bg-blue-50';
            case 'medium': return 'border-yellow-500 bg-yellow-50';
            case 'low': return 'border-green-500 bg-green-50';
            default: return 'border-gray-500 bg-gray-50';
        }
    };

    const handleNotificationClick = (notification) => {
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setShowNotifications(false);
        }
        markAsRead(notification.id);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard', active: window.location.pathname === '/dashboard' },
        { icon: Users, label: 'Users', path: '/users', active: window.location.pathname === '/users' },
        { icon: MessageSquare, label: 'Conversations', path: '/conversations', active: window.location.pathname === '/conversations' },
        { icon: BookOpen, label: 'Knowledge Base', path: '/knowledge', active: window.location.pathname === '/knowledge' },
        { icon: Brain, label: 'AI Training', path: '/training', active: window.location.pathname === '/training' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', active: window.location.pathname === '/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings', active: window.location.pathname === '/settings' },
        { icon: LogOut, label: 'Logout', action: handleLogout, active: false },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/90 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 border-r border-white/20`}>
                <div className="p-6 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">AI</span>
                            </div>
                            {sidebarOpen && (
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Dashboard</h1>
                                    <p className="text-sm text-gray-500 font-medium">Admin Panel</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 rounded-lg transition-all group"
                        >
                            <Menu className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                    </div>
                </div>

                <nav className="p-4 pb-32 min-h-screen flex flex-col">
                    {menuItems.map((item, index) => (
                        item.action ? (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 transform hover:scale-105 ${item.active
                                    ? 'bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-lg border border-white/20'
                                    : 'hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 text-red-700 hover:text-red-600 border border-transparent hover:border-red-200'
                                    }`}
                                title={sidebarOpen ? '' : item.label}
                            >
                                <item.icon className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'} transition-colors`} />
                                {sidebarOpen && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </button>
                        ) : (
                            <a
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 transform hover:scale-105 ${item.active
                                    ? 'bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 text-white shadow-lg border border-white/20'
                                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 text-gray-700 hover:text-blue-600 border border-transparent hover:border-blue-200'
                                    }`}
                                title={sidebarOpen ? '' : item.label}
                            >
                                <item.icon className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'} transition-colors`} />
                                {sidebarOpen && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </a>
                        )
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-lg px-8 py-4 border-b border-gray-200/50 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{title}</h2>
                            <p className="text-sm text-gray-500 font-medium">Welcome back, Admin </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                            >
                                <Search className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 rounded-xl transition-all duration-200 transform hover:scale-105 relative"
                                >
                                    <Bell className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                                    {notifications.filter(n => n.unread).length > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 z-50">
                                        <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-teal-50">
                                            <h3 className="font-semibold text-gray-800">🔔 Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                    <p>No new notifications</p>
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${notification.unread ? 'bg-white' : 'bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <div className="mt-1">
                                                                    {getNotificationIcon(notification.type, notification.priority)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                                </div>
                                                            </div>
                                                            {notification.unread && (
                                                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile */}
                            <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Admin User</p>
                                    <p className="text-xs text-gray-500">admin@aiassistant.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Search Modal */}
                {showSearch && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Search</h3>
                                <button
                                    onClick={() => setShowSearch(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search conversations, users, or knowledge base..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
