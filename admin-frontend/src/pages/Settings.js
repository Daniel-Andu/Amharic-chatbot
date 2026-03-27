import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Globe, Bell, Shield, Database, Mail, Phone, Lock, Palette, Volume2, Moon, Sun, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        general: {
            siteName: 'Amharic AI Assistant',
            siteUrl: 'https://amharic-ai-assistant.com',
            adminEmail: 'admin@amharic-ai-assistant.com',
            supportPhone: '+251911234567',
            timezone: 'GMT+3',
            defaultLanguage: 'amharic',
            maintenanceMode: false
        },
        ai: {
            modelProvider: 'openai',
            apiKey: 'sk-...hidden...',
            maxTokens: 2000,
            temperature: 0.7,
            confidenceThreshold: 0.8,
            responseTimeout: 30,
            enableMemory: true,
            enableContext: true,
            enableTranslation: true
        },
        notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            newConversationAlert: true,
            lowConfidenceAlert: true,
            systemErrorAlert: true,
            weeklyReports: true,
            monthlyReports: false
        },
        security: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireTwoFactor: false,
            ipWhitelist: '',
            enableAuditLog: true,
            dataEncryption: true,
            gdprCompliance: true
        },
        appearance: {
            theme: 'light',
            primaryColor: '#3B82F6',
            accentColor: '#8B5CF6',
            fontFamily: 'Inter',
            logoUrl: '/logo.png',
            faviconUrl: '/favicon.ico',
            customCSS: '',
            animationsEnabled: true,
            compactMode: false
        },
        backup: {
            autoBackup: true,
            backupFrequency: 'daily',
            retentionDays: 30,
            backupLocation: 'cloud',
            encryptionEnabled: true,
            lastBackup: '2024-03-21 06:00:00',
            nextBackup: '2024-03-22 06:00:00'
        }
    });

    const [testResults, setTestResults] = useState({
        email: null,
        sms: null,
        api: null,
        database: null
    });

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'ai', label: 'AI Configuration', icon: Database },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'backup', label: 'Backup & Restore', icon: RefreshCw }
    ];

    const saveSettings = async (category) => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
        }, 1500);
    };

    const testConnection = (type) => {
        setTestResults(prev => ({ ...prev, [type]: 'testing' }));

        setTimeout(() => {
            setTestResults(prev => ({ ...prev, [type]: 'success' }));
            toast.success(`${type} connection test successful!`);
        }, 2000);
    };

    const resetToDefaults = (category) => {
        if (window.confirm(`Are you sure you want to reset ${category} settings to defaults?`)) {
            // Reset logic here
            toast.success(`${category} settings reset to defaults!`);
        }
    };

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, siteName: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                    <input
                        type="url"
                        value={settings.general.siteUrl}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, siteUrl: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={settings.general.adminEmail}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                general: { ...prev.general, adminEmail: e.target.value }
                            }))}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={() => testConnection('email')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Test
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                    <div className="flex gap-2">
                        <input
                            type="tel"
                            value={settings.general.supportPhone}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                general: { ...prev.general, supportPhone: e.target.value }
                            }))}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={() => testConnection('sms')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Test
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                        value={settings.general.timezone}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, timezone: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="GMT+3">GMT+3 (Addis Ababa)</option>
                        <option value="GMT+0">GMT+0 (London)</option>
                        <option value="GMT-5">GMT-5 (New York)</option>
                        <option value="GMT-8">GMT-8 (Los Angeles)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                        value={settings.general.defaultLanguage}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, defaultLanguage: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="amharic">አማርኛ (Amharic)</option>
                        <option value="english">English</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            general: { ...prev.general, maintenanceMode: e.target.checked }
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                        Enable Maintenance Mode
                    </label>
                </div>
                <button
                    onClick={() => resetToDefaults('general')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );

    const renderAISettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AI Model Provider</label>
                    <select
                        value={settings.ai.modelProvider}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            ai: { ...prev.ai, modelProvider: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                        <option value="azure">Azure OpenAI</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={settings.ai.apiKey}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                ai: { ...prev.ai, apiKey: e.target.value }
                            }))}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={() => testConnection('api')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Test
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                    <input
                        type="number"
                        value={settings.ai.maxTokens}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            ai: { ...prev.ai, maxTokens: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="100"
                        max="4000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (0-1)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={settings.ai.temperature}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            ai: { ...prev.ai, temperature: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0"
                        max="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Threshold</label>
                    <input
                        type="number"
                        step="0.1"
                        value={settings.ai.confidenceThreshold}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            ai: { ...prev.ai, confidenceThreshold: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0"
                        max="1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response Timeout (seconds)</label>
                    <input
                        type="number"
                        value={settings.ai.responseTimeout}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            ai: { ...prev.ai, responseTimeout: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="5"
                        max="120"
                    />
                </div>
            </div>
            <div className="space-y-4">
                {[
                    { key: 'enableMemory', label: 'Enable Memory (Context Retention)', description: 'Allow AI to remember previous conversations' },
                    { key: 'enableContext', label: 'Enable Context Awareness', description: 'Use conversation context for better responses' },
                    { key: 'enableTranslation', label: 'Enable Auto-Translation', description: 'Automatically translate between Amharic and English' }
                ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.ai[setting.key]}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                ai: { ...prev.ai, [setting.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Notification Channels</h4>
                    {[
                        { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                        { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone },
                        { key: 'pushNotifications', label: 'Push Notifications', icon: Bell }
                    ].map(channel => (
                        <div key={channel.key} className="flex items-center gap-3">
                            <channel.icon className="w-4 h-4 text-gray-400" />
                            <label className="text-sm font-medium text-gray-700">{channel.label}</label>
                            <input
                                type="checkbox"
                                checked={settings.notifications[channel.key]}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, [channel.key]: e.target.checked }
                                }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Alert Types</h4>
                    {[
                        { key: 'newConversationAlert', label: 'New Conversation' },
                        { key: 'lowConfidenceAlert', label: 'Low Confidence Response' },
                        { key: 'systemErrorAlert', label: 'System Errors' }
                    ].map(alert => (
                        <div key={alert.key} className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">{alert.label}</label>
                            <input
                                type="checkbox"
                                checked={settings.notifications[alert.key]}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, [alert.key]: e.target.checked }
                                }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Reports</h4>
                    {[
                        { key: 'weeklyReports', label: 'Weekly Reports' },
                        { key: 'monthlyReports', label: 'Monthly Reports' }
                    ].map(report => (
                        <div key={report.key} className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">{report.label}</label>
                            <input
                                type="checkbox"
                                checked={settings.notifications[report.key]}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, [report.key]: e.target.checked }
                                }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="5"
                        max="480"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="3"
                        max="10"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                    <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="6"
                        max="20"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist (comma separated)</label>
                    <input
                        type="text"
                        value={settings.security.ipWhitelist}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, ipWhitelist: e.target.value }
                        }))}
                        placeholder="192.168.1.1, 10.0.0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
            <div className="space-y-4">
                {[
                    { key: 'requireTwoFactor', label: 'Require Two-Factor Authentication', description: 'Add an extra layer of security to admin accounts' },
                    { key: 'enableAuditLog', label: 'Enable Audit Logging', description: 'Track all admin activities for security monitoring' },
                    { key: 'dataEncryption', label: 'Enable Data Encryption', description: 'Encrypt sensitive data at rest and in transit' },
                    { key: 'gdprCompliance', label: 'GDPR Compliance Mode', description: 'Enable GDPR-compliant data handling' }
                ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.security[setting.key]}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                security: { ...prev.security, [setting.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAppearanceSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                        value={settings.appearance.theme}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={settings.appearance.primaryColor}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                appearance: { ...prev.appearance, primaryColor: e.target.value }
                            }))}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={settings.appearance.primaryColor}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                appearance: { ...prev.appearance, primaryColor: e.target.value }
                            }))}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={settings.appearance.accentColor}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                appearance: { ...prev.appearance, accentColor: e.target.value }
                            }))}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={settings.appearance.accentColor}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                appearance: { ...prev.appearance, accentColor: e.target.value }
                            }))}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                    <select
                        value={settings.appearance.fontFamily}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            appearance: { ...prev.appearance, fontFamily: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Poppins">Poppins</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4">
                {[
                    { key: 'animationsEnabled', label: 'Enable Animations', description: 'Show smooth transitions and animations' },
                    { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing and font sizes for more content' }
                ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.appearance[setting.key]}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                appearance: { ...prev.appearance, [setting.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBackupSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <select
                        value={settings.backup.backupFrequency}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, backupFrequency: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention Days</label>
                    <input
                        type="number"
                        value={settings.backup.retentionDays}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, retentionDays: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="7"
                        max="365"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
                    <select
                        value={settings.backup.backupLocation}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            backup: { ...prev.backup, backupLocation: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="cloud">Cloud Storage</option>
                        <option value="local">Local Server</option>
                        <option value="both">Both Cloud & Local</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4">
                {[
                    { key: 'autoBackup', label: 'Enable Automatic Backups', description: 'Schedule automatic backups at specified intervals' },
                    { key: 'encryptionEnabled', label: 'Enable Backup Encryption', description: 'Encrypt backup files for security' }
                ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.backup[setting.key]}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                backup: { ...prev.backup, [setting.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Backup Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Last Backup</p>
                        <p className="font-semibold text-gray-900">{settings.backup.lastBackup}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Next Scheduled Backup</p>
                        <p className="font-semibold text-gray-900">{settings.backup.nextBackup}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Create Backup Now
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Restore from Backup
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'ai':
                return renderAISettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'security':
                return renderSecuritySettings();
            case 'appearance':
                return renderAppearanceSettings();
            case 'backup':
                return renderBackupSettings();
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
                    <p className="text-gray-500">Configure system settings and preferences</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => saveSettings(activeTab)}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
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
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                {renderTabContent()}
            </div>

            {/* Connection Test Results */}
            {Object.values(testResults).some(result => result) && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Test Results</h3>
                    <div className="space-y-2">
                        {Object.entries(testResults).map(([type, result]) => (
                            result && (
                                <div key={type} className="flex items-center gap-2">
                                    {result === 'testing' ? (
                                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                                    ) : result === 'success' ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className="text-sm text-gray-700 capitalize">{type} connection</span>
                                    <span className={`text-sm font-medium ${result === 'success' ? 'text-green-600' :
                                            result === 'testing' ? 'text-blue-600' : 'text-red-600'
                                        }`}>
                                        {result === 'success' ? 'Connected successfully' :
                                            result === 'testing' ? 'Testing...' : 'Connection failed'}
                                    </span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
