import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { knowledgeAPI } from '../services/api';
import {
    BookOpen,
    FileText,
    Search,
    Upload,
    Eye,
    Trash2,
    Download,
    Plus,
    Filter,
    CheckCircle,
    Clock,
    AlertCircle,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';

const KnowledgeBase = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await knowledgeAPI.getDocuments();
            setDocuments(response.data);
        } catch (error) {
            toast.error('Failed to fetch documents');
            // Mock data for demo
            setDocuments([
                {
                    id: 1,
                    title: 'Common Amharic Phrases.pdf',
                    type: 'pdf',
                    size: '1.95 MB',
                    uploaded: '3/15/2026',
                    status: 'processed'
                },
                {
                    id: 2,
                    title: 'Customer Service Guide.pdf',
                    type: 'pdf',
                    size: '1000 KB',
                    uploaded: '3/16/2026',
                    status: 'processed'
                },
                {
                    id: 3,
                    title: 'Product Documentation.pdf',
                    type: 'pdf',
                    size: '2.3 MB',
                    uploaded: '3/14/2026',
                    status: 'processed'
                },
                {
                    id: 4,
                    title: 'FAQ Collection.pdf',
                    type: 'pdf',
                    size: '500 KB',
                    uploaded: '3/13/2026',
                    status: 'processing'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'processing':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processed':
                return 'text-green-600 bg-green-100';
            case 'processing':
                return 'text-yellow-600 bg-yellow-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <FileText className="w-5 h-5 text-red-500" />;
            case 'doc':
                return <FileText className="w-5 h-5 text-blue-500" />;
            case 'txt':
                return <FileText className="w-5 h-5 text-gray-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || doc.type === filterType;
        return matchesSearch && matchesType;
    });

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
                            <h2 className="text-xl font-semibold text-gray-800">Knowledge Base</h2>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF</option>
                                <option value="doc">DOC</option>
                                <option value="txt">TXT</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-6">
                            {/* Document Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getTypeIcon(doc.type)}
                                    <div>
                                        <h3 className="font-semibold text-gray-800 line-clamp-2">{doc.title}</h3>
                                        <p className="text-sm text-gray-500">{doc.type.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Document Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Size</span>
                                    <span className="font-medium text-gray-800">{doc.size}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Uploaded</span>
                                    <span className="font-medium text-gray-800">{doc.uploaded}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                        {getStatusIcon(doc.status)}
                                        <span>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    <Eye className="w-4 h-4" />
                                    <span>View</span>
                                </button>
                                <button className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredDocuments.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No documents found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || filterType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Upload your first document to get started'
                        }
                    </p>
                    {(!searchTerm && filterType === 'all') && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Upload Document</span>
                        </button>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Upload Document</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">Drop your document here</p>
                                <p className="text-sm text-gray-500 mb-4">or</p>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Browse Files
                                </button>
                            </div>

                            <div className="mt-4 text-sm text-gray-500">
                                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBase;
