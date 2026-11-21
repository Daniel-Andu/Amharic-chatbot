const assert = require('node:assert/strict');
const test = require('node:test');
delete process.env.GROQ_API_KEY;
const aiService = require('../src/services/unlimitedAI');

test('returns a useful biology answer when Groq is unavailable', async () => {
    aiService.apiKey = null;
    aiService.groqService = null;

    const result = await aiService.getResponse('what is biology', 'en');

    assert.equal(result.source, 'fallback');
    assert.equal(result.model, 'rule-based-fallback');
    assert.match(result.response, /scientific study of life/i);
});

test('uses the Groq response when the provider succeeds', async () => {
    aiService.apiKey = 'test-key';
    aiService.groqService = {
        chat: {
            completions: {
                create: async () => ({
                    choices: [{ message: { content: 'A provider response.' } }]
                })
            }
        }
    };

    const result = await aiService.getResponse('Hello', 'en');

    assert.equal(result.response, 'A provider response.');
    assert.equal(result.source, 'ai');
    assert.equal(result.model, 'llama-3.3-70b-versatile');
});

test('treats placeholder Groq keys as unconfigured', async () => {
    aiService.apiKey = aiService.normalizeApiKey('your_groq_api_key_here');
    aiService.groqService = null;

    assert.equal(aiService.apiKey, null);

    const result = await aiService.getResponse('what is chemistry', 'en');
    assert.equal(result.source, 'fallback');
});
