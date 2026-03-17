import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import {
    Bell,
    Search,
    User,
    Menu,
    X,
    Home,
    MessageSquare,
    BookOpen,
    Settings,
    LogOut,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/conversations', icon: MessageSquare, label: 'Conversations' },
        { path: '/knowledge', icon: BookOpen, label: 'Knowledge Base' },
        { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static lg:translate-x-0 -translate-x-full z-50 lg:z-auto
                inset-y-0 left-0 w-64 bg-white shadow-xl flex-shrink-0
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : ''}
            `}>
                {/* Sidebar Header */}
                <div className="bg-blue-600 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                            <p className="text-xs text-blue-100">AI Assistant System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.path) && (
                                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-screen">
                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8 h-full">
                    <div className="max-w-none h-full">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
