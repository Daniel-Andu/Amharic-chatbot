const fetch = require('node-fetch');

const debug500Error = async () => {
  try {
    console.log('🔍 Debugging 500 Error...');
    
    // Test the exact request that's failing
    const response = await fetch('https://amharic-chatbot-49ki.onrender.com/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-test-' + Date.now(),
        message: 'hello',
        language: 'en'
      })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', response.headers.raw());
    
    if (response.status === 500) {
      const errorText = await response.text();
      console.log('❌ 500 Error Body:', errorText);
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Success Response:', data);
    } else {
      console.log('⚠️ Other Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  }
};

debug500Error();
