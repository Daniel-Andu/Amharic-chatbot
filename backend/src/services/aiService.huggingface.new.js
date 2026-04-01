const { HfInference } = require('@huggingface/inference');

class HuggingFaceAIService {
    constructor() {
        this.apiKey = process.env.HUGGINGFACE_API_KEY;
        this.hf = this.apiKey ? new HfInference(this.apiKey) : null;
        
        // Debug environment setup
        console.log('🔧 Hugging Face Service Configuration:');
        console.log('   API Key exists:', !!this.apiKey);
        console.log('   Environment:', process.env.NODE_ENV || 'development');
        console.log('   HF Client initialized:', !!this.hf);
    }

    async getResponse(userMessage, language = 'am') {
        try {
            console.log(`🤗 Hugging Face AI - Processing: "${userMessage}" in ${language}`);
            console.log(`   Detected language: ${language}`);
            console.log(`   API Key configured: ${!!this.apiKey}`);

            // Check if API key is configured
            if (!this.apiKey || this.apiKey === 'your_huggingface_api_key_here') {
                console.log('⚠️ Hugging Face API key not configured, using fallback');
                return this.getFallbackResponse(language);
            }

            // System prompts
            const systemPrompt = language === 'am'
                ? 'You are a helpful AI assistant that responds in Amharic language. Provide professional and helpful responses.'
                : 'You are a professional company AI assistant. Provide detailed, helpful responses based on your training.';

            // Try different Hugging Face models for better responses
            const models = [
                'mistralai/Mistral-7B-Instruct-v0.1',
                'meta-llama/Llama-2-7b-chat-hf',
                'google/gemma-7b-it',
                'microsoft/DialoGPT-medium'
            ];

            // Try models in order of preference
            for (const model of models) {
                try {
                    console.log(`🤗 Trying model: ${model}`);
                    console.log(`   HF Client exists: ${!!this.hf}`);
                    console.log(`   API Key valid: ${!!this.apiKey}`);

                    // Use proper Hugging Face API
                    const response = await this.hf.textGeneration({
                        model: model,
                        inputs: userMessage,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            do_sample: true,
                            top_p: 0.9,
                            return_full_text: false
                        }
                    });

                    console.log(`🔍 Raw response from ${model}:`, JSON.stringify(response, null, 2));

                    if (response && response.generated_text) {
                        const aiResponse = response.generated_text.trim();
                        console.log(`✅ Hugging Face response from ${model}:`, aiResponse);

                        return {
                            response: aiResponse,
                            confidence: 0.85,
                            model: model,
                            language: language
                        };
                    } else {
                        console.log(`❌ No generated_text from ${model}, response:`, response);
                    }
                } catch (modelError) {
                    console.log(`❌ Model ${model} failed:`, modelError.message);
                    console.log(`   Error details:`, modelError);
                    continue;
                }
            }

            // If all models fail, try a simple fallback
            console.log('⚠️ All models failed, using fallback response');
            const fallbackResponse = this.getFallbackResponse(language);

            return {
                response: fallbackResponse,
                confidence: 0.3,
                model: 'fallback',
                language: language
            };

        } catch (error) {
            console.error('❌ Hugging Face AI Service Error:', error);
            return {
                response: this.getFallbackResponse(language),
                confidence: 0.1,
                model: 'error',
                language: language
            };
        }
    }

    getFallbackResponse(language) {
        const responses = {
            am: [
                'እባነህ። ይበለል፡ ስረታም እንደገፈት።',
                'ሰምአች እንደገፈት። ይመልሳል።',
                'ይበለል፡ አስተማምኝ የሆነ ለመልስ ዝግጅት ያለ ሙሉ መረጃ ይስጡ',
                'ጠለፈተይታል። ይበለል፡ ስረታም እንደገፈት።'
            ],
            en: [
                'I apologize, but I am experiencing technical difficulties. Please try again later.',
                'Thank you for your message. Our system is currently experiencing issues.',
                'I am unable to process your request at the moment. Please try again.',
                'Sorry, I am having trouble connecting to my AI services. Please contact support.'
            ]
        };

        const randomIndex = Math.floor(Math.random() * responses[language].length);
        return responses[language][randomIndex];
    }
}

module.exports = new HuggingFaceAIService();
