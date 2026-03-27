import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.enterprise';
import { knowledgeAPI } from '../services/api';
import {
    BookOpen,
    Upload,
    Search,
    Plus,
    Edit,
    Trash2,
    Download,
    FileText,
    HelpCircle,
    Filter,
    Eye,
    Calendar,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Knowledge = () => {
    const [activeTab, setActiveTab] = useState('documents');
    const [documents, setDocuments] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'documents') {
                const response = await knowledgeAPI.getDocuments();
                setDocuments(response.data || []);
            } else {
                const response = await knowledgeAPI.getFAQs();
                setFaqs(response.data || []);
            }
        } catch (error) {
            toast.error(`Failed to fetch ${activeTab}`);
            // Mock data for demo
            if (activeTab === 'documents') {
                setDocuments([
                    {
                        id: 1,
                        filename: 'amharic-phrases.pdf',
                        original_name: 'Common Amharic Phrases.pdf',
                        file_type: 'pdf',
                        file_size: 2048576,
                        upload_date: '2026-03-15T10:30:00Z',
                        status: 'active',
                        processed: true
                    },
                    {
                        id: 2,
                        filename: 'customer-service.pdf',
                        original_name: 'Customer Service Guide.pdf',
                        file_type: 'pdf',
                        file_size: 1024000,
                        upload_date: '2026-03-16T14:20:00Z',
                        status: 'active',
                        processed: true
                    }
                ]);
            } else {
                setFaqs([
                    {
                        id: 1,
                        question_am: 'እንዴት አለታይት',
                        question_en: 'How can I help you today?',
                        answer_am: 'እኔንዴት ለመልስጥ ይችላል።',
                        answer_en: 'I can help you with various tasks in Amharic and English.',
                        category: 'General',
                        priority: 1,
                        is_active: true
                    },
                    {
                        id: 2,
                        question_am: 'የደራሮች ጊዜያ አለታ?',
                        question_en: 'What are your working hours?',
                        answer_am: 'እኔንዴት 24/7 እየሰራል።',
                        answer_en: 'I am available 24/7 to assist you.',
                        category: 'General',
                        priority: 2,
                        is_active: true
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        try {
            await knowledgeAPI.uploadDocument(formData);
            toast.success('Document uploaded successfully');
            setShowUploadModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to upload document');
        }
    };

    const handleFAQSubmit = async (faqData) => {
        try {
            if (editingFAQ) {
                await knowledgeAPI.updateFAQ(editingFAQ.id, faqData);
                toast.success('FAQ updated successfully');
            } else {
                await knowledgeAPI.createFAQ(faqData);
                toast.success('FAQ created successfully');
            }
            setShowFAQModal(false);
            setEditingFAQ(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to save FAQ');
        }
    };

    const handleDeleteDocument = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await knowledgeAPI.deleteDocument(id);
                toast.success('Document deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete document');
            }
        }
    };

    const handleDeleteFAQ = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await knowledgeAPI.deleteFAQ(id);
                toast.success('FAQ deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete FAQ');
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <Layout title="Knowledge Base">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Knowledge Base">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-800">Knowledge Base</h1>

                            {/* Tab Navigation */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'documents'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Documents</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('faqs')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'faqs'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <HelpCircle className="w-4 h-4" />
                                        <span>FAQs</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm w-64"
                                />
                            </div>

                            {/* Add Buttons */}
                            {activeTab === 'documents' ? (
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Document</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowFAQModal(true)}
                                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add FAQ</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {documents
                            .filter(doc =>
                                doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((document) => (
                                <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* File Icon */}
                                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                                            <FileText className="w-8 h-8 text-white" />
                                        </div>

                                        {/* Document Info */}
                                        <h3 className="font-semibold text-gray-800 mb-2 truncate" title={document.original_name}>
                                            {document.original_name}
                                        </h3>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Type</span>
                                                <span className="font-medium text-gray-800 uppercase">
                                                    {document.file_type}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Size</span>
                                                <span className="font-medium text-gray-800">
                                                    {formatFileSize(document.file_size)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Uploaded</span>
                                                <span className="font-medium text-gray-800">
                                                    {formatDate(document.upload_date)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${document.processed
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {document.processed ? 'Processed' : 'Processing'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                <div className="flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
                                                </div>
                                            </button>

                                            <div className="flex items-center space-x-2">
                                                <button className="text-gray-500 hover:text-gray-700 p-1">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDocument(document.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                    <div className="space-y-4">
                        {faqs
                            .filter(faq =>
                                faq.question_am.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                faq.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                faq.answer_am.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                faq.answer_en.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((faq) => (
                                <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                                        {faq.category}
                                                    </span>
                                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                                        Priority: {faq.priority}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm text-gray-500">Question (Amharic)</span>
                                                        <p className="font-medium text-gray-800 amharic-text">
                                                            {faq.question_am}
                                                        </p>
                                                    </div>

                                                    {faq.question_en && (
                                                        <div>
                                                            <span className="text-sm text-gray-500">Question (English)</span>
                                                            <p className="font-medium text-gray-800">
                                                                {faq.question_en}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingFAQ(faq);
                                                        setShowFAQModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 p-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFAQ(faq.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <span className="text-sm text-gray-500">Answer (Amharic)</span>
                                                <p className="text-gray-800 amharic-text">
                                                    {faq.answer_am}
                                                </p>
                                            </div>

                                            {faq.answer_en && (
                                                <div>
                                                    <span className="text-sm text-gray-500">Answer (English)</span>
                                                    <p className="text-gray-800">
                                                        {faq.answer_en}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Empty States */}
                {((activeTab === 'documents' && documents.length === 0) ||
                    (activeTab === 'faqs' && faqs.length === 0)) && (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                No {activeTab} found
                            </h3>
                            <p className="text-gray-600">
                                {activeTab === 'documents'
                                    ? 'Upload your first document to get started'
                                    : 'Create your first FAQ to get started'
                                }
                            </p>
                        </div>
                    )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">Upload Document</h2>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Click to upload or drag and drop
                                </p>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer"
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Modal */}
            {showFAQModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowFAQModal(false);
                                        setEditingFAQ(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <FAQForm
                                onSubmit={handleFAQSubmit}
                                initialData={editingFAQ}
                                onCancel={() => {
                                    setShowFAQModal(false);
                                    setEditingFAQ(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

// FAQ Form Component
const FAQForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        question_am: initialData?.question_am || '',
        question_en: initialData?.question_en || '',
        answer_am: initialData?.answer_am || '',
        answer_en: initialData?.answer_en || '',
        category: initialData?.category || 'General',
        priority: initialData?.priority || 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question (Amharic)
                    </label>
                    <textarea
                        value={formData.question_am}
                        onChange={(e) => setFormData({ ...formData, question_am: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none amharic-text"
                        rows={3}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question (English)
                    </label>
                    <textarea
                        value={formData.question_en}
                        onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        rows={3}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer (Amharic)
                    </label>
                    <textarea
                        value={formData.answer_am}
                        onChange={(e) => setFormData({ ...formData, answer_am: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none amharic-text"
                        rows={4}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer (English)
                    </label>
                    <textarea
                        value={formData.answer_en}
                        onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        rows={4}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="General">General</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Account">Account</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                    </label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value={1}>High</option>
                        <option value={2}>Medium</option>
                        <option value={3}>Low</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    {initialData ? 'Update FAQ' : 'Create FAQ'}
                </button>
            </div>
        </form>
    );
};

export default Knowledge;
