import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { Send, Mic, Bot, User, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatWidget = ({ embedded = false }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [language, setLanguage] = useState('am');
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        // Restart conversation with new language
        if (sessionId) {
            // Clear current session and start new one
            setSessionId(null);
            setMessages([]);
            // Start conversation will be called by useEffect
        }
    };

    const startConversation = useCallback(async () => {
        console.log('ChatWidget.js:19  Starting conversation...');
        try {
            // Generate or use existing sessionId
            const currentSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const response = await chatAPI.startConversation(language, currentSessionId);
            console.log('ChatWidget.js:22  Conversation started:', response);
            setSessionId(currentSessionId);

            // Welcome message
            setMessages([{
                type: 'ai',
                content: language === 'am'
                    ? 'ምን ልርዳዎት!'
                    : 'Ask any questions!',
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error(' Failed to start conversation:', error);
            toast.error('Failed to start conversation');
            // Set a temporary session ID to allow testing
            setSessionId('temp-session-' + Date.now());
        }
    }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!sessionId) {
            startConversation();
        }
    }, [language, sessionId, startConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatRelativeTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

        // Handle very recent messages (within 30 seconds)
        if (diffInSeconds < 30) {
            return language === 'am' ? 'አሁን' : 'just now';
        } else if (diffInSeconds < 60) {
            return language === 'am' ? 'አሁን' : 'just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return language === 'am' ? `${minutes} ደቂቃዎች በፊት` : `${minutes} minutes ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return language === 'am' ? `${hours} ሰዓታት በፊት` : `${hours} hours ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return language === 'am' ? `${days} ቀናት በፊት` : `${days} days ago`;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const messageText = inputMessage.trim();
        console.log(' Debug - messageText:', messageText);
        console.log(' Debug - sessionId:', sessionId);
        console.log(' Debug - language:', language);

        if (!messageText || !sessionId) {
            console.log(' Debug - Early return: no message or session');
            return;
        }

        const userMessage = {
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        console.log('📝 Adding user message:', userMessage);
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            console.log('🌐 Sending API request...');
            const response = await chatAPI.sendMessage({
                sessionId,
                message: messageText,
                messageType: 'text',
                language
            });

            console.log('✅ API Response:', response);

            const aiMessage = {
                type: 'ai',
                content: response.data.response,
                confidence: response.data.confidence,
                timestamp: new Date()
            };

            console.log(' Adding AI message:', aiMessage);
            setMessages(prev => [...prev, aiMessage]);

            // Auto-speak if voice enabled
            if (voiceEnabled) {
                speakMessage(response.data.response);
            }
        } catch (error) {
            console.error(' Send message error:', error);

            let errorMessage = language === 'am'
                ? 'ይቅርታ፣ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።'
                : 'Sorry, something went wrong. Please try again.';

            // Handle timeout specifically
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = language === 'am'
                    ? 'ጊዜ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
                    : 'Request timed out. Please try again.';
            }

            toast.error(errorMessage);
            setMessages(prev => [...prev, {
                type: 'ai',
                content: errorMessage,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (!isRecording) {
            // Start browser speech recognition
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                if (!SpeechRecognition) {
                    toast.error(language === 'am'
                        ? 'የድምጽ ማወቂያ በዚህ አሳሽ አይደገፍም። Chrome ወይም Edge ይጠቀሙ።'
                        : 'Speech recognition not supported. Please use Chrome or Edge.');
                    return;
                }

                const recognition = new SpeechRecognition();
                recognition.lang = language === 'am' ? 'am-ET' : 'en-US';
                recognition.continuous = false;
                recognition.interimResults = true; // Changed to true for better feedback
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    setIsRecording(true);
                    toast.success(language === 'am' ? ' እያዳመጥኩ ነው...' : ' Recording... ', {
                        duration: 15000, // Increased to 15 seconds
                        icon: '🔴'
                    });
                    console.log(' Recording started - Speak now!');
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    const isFinal = event.results[0].isFinal;

                    if (isFinal) {
                        setInputMessage(transcript);
                        setIsRecording(false);
                        toast.success(language === 'am'
                            ? `✅ ተቀርጿል! "${transcript}"`
                            : `✅ Recorded! "${transcript}"`, {
                            duration: 4000,
                            icon: '✅'
                        });
                        console.log('✅ Final transcript:', transcript);
                    } else {
                        // Show interim results
                        console.log('⏳ Interim:', transcript);
                    }
                };

                recognition.onerror = (event) => {
                    setIsRecording(false);
                    console.error('❌ Speech recognition error:', event.error);

                    // Don't show error for network issues (common and not critical)
                    if (event.error === 'network') {
                        console.log('ℹ️ Network error in speech recognition - this is normal');
                        return;
                    }

                    if (event.error === 'no-speech') {
                        toast.error(language === 'am'
                            ? ' ምንም ድምጽ አልተሰማም'
                            : ' No speech detected.', {
                            duration: 5000
                        });
                        console.log('⚠️ No speech detected - Tips:');
                        console.log('1. Check microphone permissions in browser');
                        console.log('2. Speak LOUDER and CLEARER');
                        console.log('3. Check Windows Sound Settings → Input → Microphone volume');
                        console.log('4. Make sure microphone is not muted');
                    } else if (event.error === 'not-allowed') {
                        toast.error(language === 'am'
                            ? ' ማይክሮፎን ፈቃድ ተከልክሏል። በአሳሽ ቅንብሮች ውስጥ ይፍቀዱ።'
                            : ' Microphone permission denied. Please allow in browser settings.', {
                            duration: 6000
                        });
                    } else if (event.error === 'aborted') {
                        // User stopped recording - don't show error
                        console.log('ℹ️ Recording aborted by user');
                    } else if (event.error === 'audio-capture') {
                        toast.error(language === 'am'
                            ? '🎤 ማይክሮፎን ችግር። መሳሪያው ተሰክቷል እና እየሰራ እንደሆነ ያረጋግጡ।'
                            : '🎤 Microphone problem. Check if device is plugged in and working.', {
                            duration: 6000
                        });
                    } else {
                        // Show error for unexpected issues
                        console.log('❌ Unexpected speech recognition error:', event.error);
                        toast.error(language === 'am'
                            ? `ስህተት: ${event.error}`
                            : `Error: ${event.error}`, {
                            duration: 4000
                        });
                    }
                };

                recognition.onend = () => {
                    setIsRecording(false);
                    console.log(' Recording ended');
                };

                // Request microphone permission first
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        console.log('✅ Microphone permission granted');
                        recognition.start();
                        recognitionRef.current = recognition;
                    })
                    .catch((error) => {
                        console.error('❌ Microphone permission error:', error);
                        toast.error(language === 'am'
                            ? ' ማይክሮፎን መዳረሻ ተከልክሏል። እባክዎ በአሳሽ ቅንብሮች ውስጥ ይፍቀዱ።'
                            : ' Microphone access denied. Please allow in browser settings.', {
                            duration: 6000
                        });
                    });

            } catch (error) {
                console.error('Speech recognition error:', error);
                toast.error(language === 'am'
                    ? 'የድምጽ ማወቂያ ስህተት'
                    : 'Speech recognition error');
            }
        } else {
            // Stop recording
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                setIsRecording(false);
                console.log(' Recording stopped by user');
            }
        }
    }

    const speakMessage = (text) => {
        if (isSpeaking) {
            // Stop speaking
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        try {
            // Check if browser supports speech synthesis
            if (!window.speechSynthesis) {
                toast.error(language === 'am'
                    ? 'የድምጽ ማጫወት በዚህ አሳሽ አይደገፍም'
                    : 'Text-to-speech not supported in this browser');
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Small delay to ensure cancellation completes
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);

                // Get voices
                let voices = window.speechSynthesis.getVoices();

                // Ensure voices are loaded
                if (voices.length === 0) {
                    window.speechSynthesis.getVoices();
                    voices = window.speechSynthesis.getVoices();
                }

                // If no voices yet, wait for them
                if (voices.length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        voices = window.speechSynthesis.getVoices();
                        setupAndSpeak(utterance, voices, text);
                    };
                } else {
                    setupAndSpeak(utterance, voices, text);
                }
            }, 250); // Increased delay to prevent interruption

            const setupAndSpeak = (utterance, voices, text) => {
                let selectedVoice = null;
                let selectedLang = 'en-US';

                // Detect if text is Amharic (contains Ethiopic script)
                const isAmharicText = /[\u1200-\u137F]/.test(text);

                if (isAmharicText || language === 'am') {
                    // Try to find Amharic voice
                    selectedVoice = voices.find(voice =>
                        voice.lang.startsWith('am') ||
                        voice.lang.includes('am-ET') ||
                        voice.name.includes('Amharic') ||
                        voice.name.includes('መቅደስ')
                    );

                    if (selectedVoice) {
                        selectedLang = 'am-ET';
                        console.log(' Using Amharic voice:', selectedVoice.name);
                    } else {
                        // Use default English voice for Amharic text but show notification
                        selectedVoice = voices.find(voice =>
                            voice.lang.includes('en-US') ||
                            voice.lang.includes('en-GB') ||
                            voice.lang.startsWith('en')
                        );
                        selectedLang = 'en-US';
                        console.log('⚠️ Amharic voice not found, using English voice for Amharic text');

                        // Only show toast once per session
                        if (!window.amharicVoiceNotified) {
                            toast('Amharic voice not available - using English voice pronunciation', {
                                duration: 3000,
                                icon: '🔊'
                            });
                            window.amharicVoiceNotified = true;
                        }
                    }
                } else {
                    // Use English voice
                    selectedVoice = voices.find(voice =>
                        voice.lang.includes('en-US') ||
                        voice.lang.includes('en-GB') ||
                        voice.lang.startsWith('en')
                    );
                    console.log('🎤 Using English voice:', selectedVoice?.name || 'default');
                }

                // Set voice if found
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                utterance.lang = selectedLang;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onstart = () => {
                    setIsSpeaking(true);
                    console.log('✅ Speaking:', text.substring(0, 50));
                };

                utterance.onend = () => {
                    setIsSpeaking(false);
                    console.log('✅ Finished speaking');
                };

                utterance.onerror = (event) => {
                    setIsSpeaking(false);

                    // Don't log or show errors for interrupted/canceled (happens when clicking multiple times)
                    if (event.error === 'interrupted' || event.error === 'canceled') {
                        return;
                    }

                    console.error('❌ Speech error:', event.error);
                    toast.error(language === 'am'
                        ? 'ድምጽ ማጫወት አልተቻለም'
                        : 'Failed to play audio');
                };

                // Speak!
                window.speechSynthesis.speak(utterance);
                console.log('🔊 Speech command sent');
            };
        } catch (error) {
            console.error('Text-to-speech error:', error);
            setIsSpeaking(false);
            toast.error(language === 'am'
                ? 'ድምጽ ማጫወት አልተቻለም'
                : 'Failed to play audio');
        }
    };

    return (
        <div className={`flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${embedded ? 'rounded-lg shadow-2xl' : ''}`}>
            {/* Header - Responsive */}
            <div className="bg-black/30 backdrop-blur-md border-b border-white/10 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                            <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h3 className="text-white font-semibold text-sm sm:text-base">AI Assistant</h3>
                            <p className="text-white/70 text-xs sm:text-sm">Powered by Groq AI</p>
                        </div>
                        <div className="sm:hidden">
                            <h3 className="text-white font-semibold text-sm">AI</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        >
                            <option value="am" className="text-gray-800">አማርኛ</option>
                            <option value="en" className="text-gray-800">English</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.type === 'ai' && (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                        )}

                        <div
                            className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl ${msg.type === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30'
                                : 'bg-white/90 text-gray-800 border border-gray-200/50'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className={`text-sm flex-1 leading-relaxed ${language === 'am' ? 'amharic-text' : ''}`}>
                                    {msg.content}
                                </p>
                                {msg.type === 'ai' && (
                                    <button
                                        onClick={() => speakMessage(msg.content)}
                                        className="flex-shrink-0 p-2 hover:bg-blue-50 rounded-lg transition-all group"
                                        title={language === 'am' ? 'ድምጽ ያድምጡ' : 'Listen to response'}
                                    >
                                        {isSpeaking ? (
                                            <VolumeX className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                                        ) : (
                                            <Volume2 className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {formatRelativeTime(msg.timestamp)}
                            </div>
                        </div>

                        {msg.type === 'user' && (
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg border border-gray-200/50">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input - Mobile Responsive */}
            <div className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 p-3 sm:p-4 shadow-2xl">
                {/* Voice Status - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                        <input
                            type="checkbox"
                            checked={voiceEnabled}
                            onChange={(e) => setVoiceEnabled(e.target.checked)}
                            className="rounded w-3 h-3 sm:w-4 sm:h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium">
                            {language === 'am' ? '🔊 ድምጽ አንቃ (ራስ-ሰር)' : '🔊 Enable Voice (Auto-speak)'}
                        </span>
                    </label>
                    {isRecording && (
                        <span className="text-xs sm:text-sm text-red-500 animate-pulse flex items-center gap-1 sm:gap-2 font-medium">
                            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping"></span>
                            {language === 'am' ? 'እያዳመጥኩ...' : '🎤 Listening...'}
                        </span>
                    )}
                </div>

                {/* Voice recording tip - Mobile Optimized */}
                {!isRecording && (
                    <div className="mb-2 sm:mb-3 text-xs text-gray-500 flex items-center gap-1 sm:gap-2 bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                        <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="font-medium text-xs sm:text-sm">
                            {language === 'am'
                                ? 'የማይክሮፎን ቁልፍን ጠቅ በማድረግ የድምጽ መልእክት ይላኩ'
                                : '🎤 Click microphone button to send voice message'}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`p-3 sm:p-4 rounded-xl transition-all transform hover:scale-105 ${isRecording
                            ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white animate-pulse shadow-lg'
                            : 'bg-gradient-to-r from-blue-500 to-teal-600 text-white hover:from-blue-600 hover:to-teal-700 shadow-lg'
                            }`}
                        title={language === 'am' ? 'የድምጽ መልእክት ይቅዱ' : 'Record voice message'}
                    >
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={language === 'am' ? '💬 መልእክት ይጻፉ...' : '💬 Type a message...'}
                        className={`flex-1 px-3 py-3 sm:px-5 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/90 backdrop-blur-sm shadow-inner transition-all text-sm sm:text-base ${language === 'am' ? 'amharic-text' : ''
                            }`}
                        disabled={loading || isRecording}
                    />

                    <button
                        type="submit"
                        disabled={loading || !inputMessage.trim() || isRecording}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </form>
            </div>
        </div >
    );
};

export default ChatWidget;
