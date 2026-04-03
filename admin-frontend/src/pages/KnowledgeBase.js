import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Upload, FileText, Edit, Trash2, Eye, Download, Globe, MessageSquare, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const KnowledgeBase = () => {
    const [activeTab, setActiveTab] = useState('faqs');
    const [searchQuery, setSearchQuery] = useState('');
    const [faqs, setFaqs] = useState([
        {
            id: 1,
            question: 'ሰላም! እንዴት ልርዳዎት እችላለሁ?',
            answer: 'ሰላም! እኔ አማርክ AI አስቲዮን ነኝ። እንዴት ልርዳዎት ማንም፣ መረጃ መማረክ፣ እና እርሳተኞብ ማስተከል እችላለሁ።',
            category: 'greetings',
            language: 'amharic',
            status: 'published',
            views: 342,
            helpful: 89
        },
        {
            id: 2,
            question: 'Hello! How can you help me today?',
            answer: 'Hello! I am your AI assistant designed to help with various tasks. I can answer questions, provide information, assist with problem-solving, and communicate in both English and Amharic. Feel free to ask me anything!',
            category: 'greetings',
            language: 'english',
            status: 'published',
            views: 289,
            helpful: 94
        },
        {
            id: 3,
            question: 'የንግጓኛ መረጃ በማን ይችላል?',
            answer: 'እኔ የንግጓኛ መረጃን ማስተከል እችላለሁ። ይህል፣ የሚፈለጉትን ይግለጥብኝ እና በቅርብታኝ እንመልሳል።',
            category: 'services',
            language: 'amharic',
            status: 'published',
            views: 198,
            helpful: 87
        },
        {
            id: 4,
            question: 'What services do you offer?',
            answer: 'I offer a wide range of services including: answering questions, providing information, assisting with research, language translation between English and Amharic, helping with problem-solving, and providing educational support. I continuously learn to improve my responses.',
            category: 'services',
            language: 'english',
            status: 'published',
            views: 167,
            helpful: 91
        }
    ]);
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: 'Amharic Language Guide.pdf',
            type: 'pdf',
            size: '2.4 MB',
            uploadDate: '2024-03-20',
            status: 'processed',
            category: 'language',
            description: 'Comprehensive guide to Amharic language patterns and common phrases'
        },
        {
            id: 2,
            name: 'Customer Service Manual.docx',
            type: 'docx',
            size: '1.8 MB',
            uploadDate: '2024-03-19',
            status: 'processed',
            category: 'support',
            description: 'Standard operating procedures for customer service interactions'
        },
        {
            id: 3,
            name: 'Product Catalog.xlsx',
            type: 'xlsx',
            size: '3.2 MB',
            uploadDate: '2024-03-18',
            status: 'processing',
            category: 'products',
            description: 'Complete product listing with specifications and pricing'
        }
    ]);
    const [showAddFAQ, setShowAddFAQ] = useState(false);
    const [showUploadDoc, setShowUploadDoc] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState(null);
    const [newFAQ, setNewFAQ] = useState({
        question: '',
        answer: '',
        category: 'general',
        language: 'english'
    });

    const categories = [
        { value: 'general', label: 'General' },
        { value: 'greetings', label: 'Greetings' },
        { value: 'services', label: 'Services' },
        { value: 'support', label: 'Support' },
        { value: 'technical', label: 'Technical' }
    ];

    const addFAQ = () => {
        if (!newFAQ.question || !newFAQ.answer) {
            toast.error('Please fill in both question and answer');
            return;
        }

        const faq = {
            id: faqs.length + 1,
            ...newFAQ,
            status: 'published',
            views: 0,
            helpful: 0
        };

        setFaqs(prev => [faq, ...prev]);
        setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
        setShowAddFAQ(false);
        toast.success('FAQ added successfully!');
    };

    const updateFAQ = () => {
        if (!newFAQ.question || !newFAQ.answer) {
            toast.error('Please fill in both question and answer');
            return;
        }

        setFaqs(prev => prev.map(faq =>
            faq.id === editingFAQ.id
                ? { ...faq, ...newFAQ }
                : faq
        ));

        setEditingFAQ(null);
        setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
        toast.success('FAQ updated successfully!');
    };

    const deleteFAQ = (id) => {
        setFaqs(prev => prev.filter(faq => faq.id !== id));
        toast.success('FAQ deleted successfully!');
    };

    const uploadDocument = (file) => {
        const newDoc = {
            id: documents.length + 1,
            name: file.name,
            type: file.name.split('.').pop(),
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'processing',
            category: 'general',
            description: 'Uploaded document'
        };

        setDocuments(prev => [newDoc, ...prev]);
        setShowUploadDoc(false);
        toast.success('Document uploaded successfully! Processing will complete shortly.');

        setTimeout(() => {
            setDocuments(prev => prev.map(doc =>
                doc.id === newDoc.id
                    ? { ...doc, status: 'processed' }
                    : doc
            ));
            toast.success('Document processed and added to knowledge base!');
        }, 3000);
    };

    const deleteDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully!');
    };

    const viewDocument = (doc) => {
        // In a real app, this would open the document
        toast.success(`Viewing: ${doc.name}`);
        console.log('View document:', doc);
    };

    const downloadDocument = (doc) => {
        // In a real app, this would download the document
        toast.success(`Downloading: ${doc.name}`);
        console.log('Download document:', doc);

        // Create a mock download link
        const link = document.createElement('a');
        link.href = '#'; // In real app, this would be the actual file URL
        link.download = doc.name;
        link.click();
    };

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Knowledge Base</h2>
                    <p className="text-gray-500">Manage documents and FAQs for AI training</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs and documents..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('faqs')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'faqs'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            FAQs ({faqs.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Documents ({documents.length})
                        </div>
                    </button>
                </nav>
            </div>

            {activeTab === 'faqs' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowAddFAQ(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add FAQ
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helpful</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredFAQs.map((faq) => (
                                        <tr key={faq.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="max-w-md">
                                                    <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{faq.answer.substring(0, 100)}...</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${faq.language === 'amharic'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    <Globe className="w-3 h-3 mr-1" />
                                                    {faq.language === 'amharic' ? 'አማርኛ' : 'English'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {faq.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${faq.status === 'published'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    {faq.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {faq.views}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {faq.helpful}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingFAQ(faq);
                                                            setNewFAQ({
                                                                question: faq.question,
                                                                answer: faq.answer,
                                                                category: faq.category,
                                                                language: faq.language
                                                            });
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteFAQ(faq.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'documents' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowUploadDoc(true)}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Document
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocs.map((doc) => (
                            <div key={doc.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${doc.type === 'pdf' ? 'bg-red-100' :
                                        doc.type === 'docx' ? 'bg-blue-100' :
                                            doc.type === 'xlsx' ? 'bg-green-100' :
                                                'bg-gray-100'
                                        }`}>
                                        <FileText className={`w-6 h-6 ${doc.type === 'pdf' ? 'text-red-600' :
                                            doc.type === 'docx' ? 'text-blue-600' :
                                                doc.type === 'xlsx' ? 'text-green-600' :
                                                    'text-gray-600'
                                            }`} />
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${doc.status === 'processed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {doc.status}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2 truncate">{doc.name}</h4>
                                <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{doc.size}</span>
                                    <span>{doc.uploadDate}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <button
                                        onClick={() => viewDocument(doc)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="View document"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => downloadDocument(doc)}
                                        className="text-green-600 hover:text-green-900"
                                        title="Download document"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteDocument(doc.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete document"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(showAddFAQ || editingFAQ) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddFAQ(false);
                                    setEditingFAQ(null);
                                    setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                <select
                                    value={newFAQ.language}
                                    onChange={(e) => setNewFAQ(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="english">English</option>
                                    <option value="amharic">አማርኛ (Amharic)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={newFAQ.category}
                                    onChange={(e) => setNewFAQ(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                <textarea
                                    value={newFAQ.question}
                                    onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder={newFAQ.language === 'amharic' ? 'ጥያቄው ያስገልግ...' : 'Enter your question...'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                <textarea
                                    value={newFAQ.answer}
                                    onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                                    placeholder={newFAQ.language === 'amharic' ? 'መልሳትያሽ ያስገልግ...' : 'Enter your answer...'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={5}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddFAQ(false);
                                    setEditingFAQ(null);
                                    setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingFAQ ? updateFAQ : addFAQ}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                            >
                                {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUploadDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Upload Document</h3>
                            <button
                                onClick={() => setShowUploadDoc(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">Drop your document here or click to browse</p>
                                <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, XLSX, TXT files (Max 10MB)</p>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            uploadDocument(file);
                                        }
                                    }}
                                    accept=".pdf,.doc,.docx,.xlsx,.txt"
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer inline-block"
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBase;
