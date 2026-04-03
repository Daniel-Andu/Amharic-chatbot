import React, { useState, useEffect } from 'react';
import { Brain, Play, Pause, RefreshCw, CheckCircle, AlertCircle, Clock, Zap, Database, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AITraining = () => {
    const [trainingStatus, setTrainingStatus] = useState('idle'); // idle, training, completed, error
    const [trainingProgress, setTrainingProgress] = useState(0);
    const [trainingHistory, setTrainingHistory] = useState([
        {
            id: 1,
            date: '2024-03-20 14:30',
            status: 'completed',
            duration: '45 min',
            accuracy: 87.3,
            samples: 1250,
            model: 'GPT-3.5-Turbo-v2'
        },
        {
            id: 2,
            date: '2024-03-15 10:15',
            status: 'completed',
            duration: '52 min',
            accuracy: 85.7,
            samples: 1180,
            model: 'GPT-3.5-Turbo-v1'
        },
        {
            id: 3,
            date: '2024-03-10 16:45',
            status: 'failed',
            duration: '12 min',
            accuracy: 0,
            samples: 950,
            model: 'GPT-3.5-Turbo-v1',
            error: 'Insufficient training data'
        }
    ]);
    const [showTrainingDataModal, setShowTrainingDataModal] = useState(false);
    const [trainingConfig, setTrainingConfig] = useState({
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        modelType: 'gpt-3.5-turbo',
        useKnowledgeBase: true,
        useConversations: true,
        useFAQs: true
    });

    const startTraining = async () => {
        setTrainingStatus('training');
        setTrainingProgress(0);

        toast.success('AI training started! This may take 30-60 minutes.');

        // Simulate training progress
        const progressInterval = setInterval(() => {
            setTrainingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTrainingStatus('completed');
                    toast.success('AI training completed successfully!');

                    // Add to history
                    const newTraining = {
                        id: trainingHistory.length + 1,
                        date: new Date().toLocaleString(),
                        status: 'completed',
                        duration: '48 min',
                        accuracy: 89.2,
                        samples: 1350,
                        model: trainingConfig.modelType
                    };
                    setTrainingHistory(prev => [newTraining, ...prev]);
                    return 100;
                }
                return prev + Math.random() * 10;
            });
        }, 2000);
    };

    const stopTraining = () => {
        setTrainingStatus('idle');
        setTrainingProgress(0);
        toast.info('AI training stopped');
    };

    const viewTrainingData = () => {
        setShowTrainingDataModal(true);
        toast.success('Loading training data...');
        console.log('View Training Data clicked');
    };

    const modelOptions = [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
        { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model for complex tasks' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Balance of speed and capability' },
        { value: 'claude-3', label: 'Claude 3', description: 'Advanced reasoning capabilities' }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'training':
                return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'training':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">AI Training</h2>
                    <p className="text-gray-500">Retrain and improve AI model performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={viewTrainingData}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <Database className="w-4 h-4" />
                        View Training Data
                    </button>
                </div>
            </div>

            {/* Training Status Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Training Status</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(trainingStatus)}`}>
                        {trainingStatus.charAt(0).toUpperCase() + trainingStatus.slice(1)}
                    </div>
                </div>

                {trainingStatus === 'training' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Training Progress</span>
                            <span className="text-sm font-bold text-blue-600">{Math.round(trainingProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${trainingProgress}%` }}
                            ></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Brain className="w-4 h-4" />
                                <span>Processing neural networks...</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Database className="w-4 h-4" />
                                <span>Optimizing parameters...</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Zap className="w-4 h-4" />
                                <span>Improving accuracy...</span>
                            </div>
                        </div>
                    </div>
                )}

                {trainingStatus === 'completed' && (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">Training Completed Successfully!</h4>
                        <p className="text-gray-600 mb-6">AI model has been updated with improved performance</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-sm text-green-600 font-medium">Accuracy Improved</p>
                                <p className="text-2xl font-bold text-green-700">+3.2%</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-sm text-blue-600 font-medium">Response Time</p>
                                <p className="text-2xl font-bold text-blue-700">1.1s</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <p className="text-sm text-purple-600 font-medium">Training Samples</p>
                                <p className="text-2xl font-bold text-purple-700">1,350</p>
                            </div>
                        </div>
                    </div>
                )}

                {trainingStatus === 'idle' && (
                    <div className="text-center py-8">
                        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">Ready to Train AI Model</h4>
                        <p className="text-gray-600 mb-6">Configure training parameters and start improving your AI assistant</p>
                        <button
                            onClick={startTraining}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                        >
                            <Play className="w-5 h-5" />
                            Start Training
                        </button>
                    </div>
                )}
            </div>

            {/* Training Configuration */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Training Configuration</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                            <select
                                value={trainingConfig.modelType}
                                onChange={(e) => setTrainingConfig(prev => ({ ...prev, modelType: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={trainingStatus === 'training'}
                            >
                                {modelOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} - {option.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Training Epochs</label>
                            <input
                                type="number"
                                value={trainingConfig.epochs}
                                onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={trainingStatus === 'training'}
                                min="1"
                                max="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                            <input
                                type="number"
                                value={trainingConfig.batchSize}
                                onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={trainingStatus === 'training'}
                                min="1"
                                max="128"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Learning Rate</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={trainingConfig.learningRate}
                                onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                disabled={trainingStatus === 'training'}
                                min="0.0001"
                                max="0.1"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Training Data Sources</label>
                            {[
                                { key: 'useKnowledgeBase', label: 'Knowledge Base Documents' },
                                { key: 'useConversations', label: 'Conversation History' },
                                { key: 'useFAQs', label: 'FAQ Database' }
                            ].map(source => (
                                <label key={source.key} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={trainingConfig[source.key]}
                                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, [source.key]: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        disabled={trainingStatus === 'training'}
                                    />
                                    <span className="text-sm text-gray-700">{source.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Training History */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Training History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Samples</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trainingHistory.map((training) => (
                                <tr key={training.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.model}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(training.status)}
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(training.status)}`}>
                                                {training.status.charAt(0).toUpperCase() + training.status.slice(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.duration}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.samples.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {training.accuracy > 0 ? (
                                            <span className="text-green-600 font-medium">{training.accuracy}%</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Failed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Training Data Modal
    if (showTrainingDataModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Database className="w-6 h-6 text-blue-600" />
                                Training Data History
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                View and analyze all AI training sessions
                            </p>
                        </div>
                        <button
                            onClick={() => setShowTrainingDataModal(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Samples</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trainingHistory.map((training, index) => (
                                    <tr key={training.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{training.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {training.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {training.model}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(training.status)}
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(training.status)}`}>
                                                    {training.status.charAt(0).toUpperCase() + training.status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {training.duration}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {training.samples.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {training.accuracy > 0 ? (
                                                <span className="text-green-600">{training.accuracy}%</span>
                                            ) : (
                                                <span className="text-red-600">Failed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Showing {trainingHistory.length} training records
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Export CSV
                            </button>
                            <button
                                onClick={() => setShowTrainingDataModal(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (

export default AITraining;
