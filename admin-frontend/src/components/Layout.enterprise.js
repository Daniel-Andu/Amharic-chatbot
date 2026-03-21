import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, X, Home, Users, MessageSquare, BookOpen, Brain, BarChart3, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, title }) => {
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Load notifications
    useEffect(() => {
        setNotifications([
            { id: 1, message: 'New conversation started', time: '5 min ago', unread: true },
            { id: 2, message: 'FAQ updated successfully', time: '1 hour ago', unread: true },
            { id: 3, message: 'System backup completed', time: '2 hours ago', unread: false },
        ]);
    }, []);

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
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 ease-in-out h-screen fixed left-0 top-0 z-40`}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">AI</span>
                            </div>
                            {sidebarOpen && (
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                                    <p className="text-sm text-gray-500">Admin Panel</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <nav className="p-4">
                    {menuItems.map((item, index) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                                item.active
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
                            {sidebarOpen && (
                                <span className="font-medium">{item.label}</span>
                            )}
                        </a>
                    ))}
                </nav>

                {sidebarOpen && (
                    <div className="absolute bottom-6 left-6 right-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
                {/* Top Header */}
                <header className="bg-white shadow-sm px-8 py-4 border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                            <p className="text-sm text-gray-500">Welcome back, Admin</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <Search className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors relative"
                                >
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    {notifications.filter(n => n.unread).length > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                                                        notification.unread ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-800">{notification.message}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                        </div>
                                                        {notification.unread && (
                                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
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
