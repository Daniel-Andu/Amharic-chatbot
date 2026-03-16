import React from 'react';
import { Bell, Search, User, X } from 'lucide-react';

const Layout = ({ children, title }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-sm h-screen">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    </div>
                    <nav className="mt-6">
                        <a href="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-gray-50">
                            Dashboard
                        </a>
                        <a href="/conversations" className="block px-6 py-3 text-gray-700 hover:bg-gray-50">
                            Conversations
                        </a>
                        <a href="/knowledge" className="block px-6 py-3 text-gray-700 hover:bg-gray-50">
                            Knowledge Base
                        </a>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <header className="bg-white shadow-sm px-8 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <Search className="w-5 h-5 text-gray-500" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <Bell className="w-5 h-5 text-gray-500" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Admin</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
