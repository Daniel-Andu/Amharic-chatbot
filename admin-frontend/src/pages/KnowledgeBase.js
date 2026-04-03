import React, { useState } from 'react';
import { FileText, HelpCircle, Database, Clock, Upload, X, Eye, Download, Trash2, Plus, Edit2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const KnowledgeBase = () => {
    const [activeTab, setActiveTab] = useState('documents');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showUploadDoc, setShowUploadDoc] = useState(false);
    const [documentReader, setDocumentReader] = useState({ isOpen: false, document: null });
    const [showAddFAQ, setShowAddFAQ] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState(null);

    const [documents] = useState([
        {
            id: 1,
            name: 'Amharic Language Guide.pdf',
            type: 'pdf',
            category: 'language',
            status: 'processed',
            uploadDate: '2024-03-20',
            size: '2.4 MB',
            description: 'Comprehensive guide to Amharic language basics and pronunciation'
        },
        {
            id: 2,
            name: 'Customer Support Manual.docx',
            type: 'docx',
            category: 'support',
            status: 'processed',
            uploadDate: '2024-03-19',
            size: '1.8 MB',
            description: 'Step-by-step guide for handling customer support scenarios'
        },
        {
            id: 3,
            name: 'Product Catalog.xlsx',
            type: 'xlsx',
            category: 'products',
            status: 'processing',
            uploadDate: '2024-03-18',
            size: '3.2 MB',
            description: 'Complete product catalog with pricing and specifications'
        }
    ]);

    const [faqs, setFaqs] = useState([
        {
            id: 1,
            question: 'How do I change the language?',
            answer: 'Click the language selector in the top right corner and choose between English and Amharic.',
            category: 'general',
            language: 'english'
        },
        {
            id: 2,
            question: 'ቋንዛኛ አማርኛ መቀየት እትያለሁ?',
            answer: 'በላይ ክፍለት ያለው የቋንዛኛ መምረጽያን ጥቅል በመጠቀለል ከእንግሊሽ አማርኛና አማርኛ መካከል ይችላል።',
            category: 'general',
            language: 'amharic'
        },
        {
            id: 3,
            question: 'What are the supported file formats?',
            answer: 'We support PDF, DOC, DOCX, TXT, and XLSX files for document upload.',
            category: 'technical',
            language: 'english'
        }
    ]);

    const [newDoc, setNewDoc] = useState({
        name: '',
        category: 'general',
        description: '',
        file: null
    });

    const [newFAQ, setNewFAQ] = useState({
        question: '',
        answer: '',
        category: 'general',
        language: 'english'
    });

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'general', label: 'General' },
        { value: 'language', label: 'Language' },
        { value: 'technical', label: 'Technical' },
        { value: 'support', label: 'Support' },
        { value: 'products', label: 'Products' }
    ];

    const tabs = [
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle }
    ];

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const viewDocument = (doc) => {
        setDocumentReader({ isOpen: true, document: doc });
        toast.success(`Opening: ${doc.name}`);
    };

    const downloadDocument = (doc) => {
        toast.success(`Downloading: ${doc.name}`);
    };

    const deleteDocument = (docId) => {
        toast.success('Document deleted successfully');
    };

    const uploadDocument = () => {
        if (!newDoc.name || !newDoc.file) {
            toast.error('Please fill all required fields');
            return;
        }
        toast.success('Document uploaded successfully');
        setNewDoc({ name: '', category: 'general', description: '', file: null });
        setShowUploadDoc(false);
    };

    const addFAQ = () => {
        if (!newFAQ.question || !newFAQ.answer) {
            toast.error('Please fill all required fields');
            return;
        }
        const newId = Math.max(...faqs.map(f => f.id)) + 1;
        setFaqs([...faqs, { ...newFAQ, id: newId }]);
        setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
        setShowAddFAQ(false);
        toast.success('FAQ added successfully');
    };

    const updateFAQ = () => {
        if (!newFAQ.question || !newFAQ.answer) {
            toast.error('Please fill all required fields');
            return;
        }
        setFaqs(faqs.map(f => f.id === editingFAQ.id ? { ...newFAQ, id: editingFAQ.id } : f));
        setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
        setEditingFAQ(null);
        setShowAddFAQ(false);
        toast.success('FAQ updated successfully');
    };

    const deleteFAQ = (faqId) => {
        setFaqs(faqs.filter(f => f.id !== faqId));
        toast.success('FAQ deleted successfully');
    };

    const editFAQ = (faq) => {
        setEditingFAQ(faq);
        setNewFAQ({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            language: faq.language
        });
        setShowAddFAQ(true);
    };

    const StatCard = ({ title, value, change, changeType, icon: Icon, color, bgColor }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className={`text-sm font-medium ${
                    changeType === 'increase' ? 'text-green-600' :
                    changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                    {change}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-600">{title}</p>
        </div>
    );

    const renderTabContent = () => {
        if (activeTab === 'documents') {
            return (
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
                                            'bg-gray-100'
                                    }`}>
                                        <FileText className={`w-6 h-6 ${doc.type === 'pdf' ? 'text-red-600' :
                                            doc.type === 'docx' ? 'text-blue-600' :
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
                                <div className="flex items-center gap-2 mt-4">
                                    <button
                                        onClick={() => viewDocument(doc)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Read document"
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
            );
        }

        if (activeTab === 'faqs') {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                            />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddFAQ(true);
                                setEditingFAQ(null);
                                setNewFAQ({ question: '', answer: '', category: 'general', language: 'english' });
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add FAQ
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredFAQs.map((faq) => (
                            <div key={faq.id} className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        faq.language === 'amharic' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {faq.language === 'amharic' ? 'አማርኛ' : 'English'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => editFAQ(faq)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit FAQ"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteFAQ(faq.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete FAQ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                                <p className="text-sm text-gray-600">{faq.answer}</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                        {faq.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Documents"
                    value={documents.length}
                    change="+12%"
                    changeType="increase"
                    icon={FileText}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Total FAQs"
                    value={faqs.length}
                    change="+8%"
                    changeType="increase"
                    icon={HelpCircle}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Processing Queue"
                    value="3"
                    change="0%"
                    changeType="neutral"
                    icon={Clock}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    title="Knowledge Base Size"
                    value="2.4 GB"
                    change="+15%"
                    changeType="increase"
                    icon={Database}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>

            {/* Upload Document Modal */}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                                <input
                                    type="text"
                                    value={newDoc.name}
                                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter document name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={newDoc.category}
                                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={newDoc.description}
                                    onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    placeholder="Enter document description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowUploadDoc(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadDocument}
                                disabled={!newDoc.name || !newDoc.file}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Reader Modal */}
            {documentReader.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    📄 {documentReader.document.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {documentReader.document.type.toUpperCase()} • {documentReader.document.size} • {documentReader.document.uploadDate}
                                </p>
                            </div>
                            <button
                                onClick={() => setDocumentReader({ isOpen: false, document: null })}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-sm font-medium text-gray-600">Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    documentReader.document.status === 'processed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {documentReader.document.status}
                                </span>
                            </div>
                            
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <h4 className="font-medium text-gray-800 mb-3">Document Content</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    This is a {documentReader.document.type} document named "{documentReader.document.name}".
                                    <br /><br />
                                    <strong>Description:</strong> {documentReader.document.description}
                                    <br /><br />
                                    <strong>Category:</strong> {documentReader.document.category}
                                    <br /><br />
                                    <em>In a real application, this would display actual document content, preview, or provide options to edit, annotate, or export document.</em>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => downloadDocument(documentReader.document)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={() => setDocumentReader({ isOpen: false, document: null })}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add FAQ Modal */}
            {showAddFAQ && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
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
        </>
    );
};

export default KnowledgeBase;
