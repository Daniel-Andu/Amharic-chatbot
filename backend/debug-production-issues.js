const fetch = require('node-fetch');

const debugProductionIssues = async () => {
  try {
    console.log('🔍 Testing Production Backend Issues...');
    
    // Test 1: Health check
    console.log('\n1️⃣ Testing Backend Health:');
    const healthResponse = await fetch('https://amharic-chatbot-backend.onrender.com/health');
    console.log('   Health Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Health Data:', healthData);
    }
    
    // Test 2: Chat start endpoint
    console.log('\n2️⃣ Testing Chat Start:');
    const chatStartResponse = await fetch('https://amharic-chatbot-backend.onrender.com/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-test-' + Date.now(),
        language: 'en'
      })
    });
    console.log('   Chat Start Status:', chatStartResponse.status);
    if (chatStartResponse.ok) {
      const chatData = await chatStartResponse.json();
      console.log('   Chat Start Data:', chatData);
    } else {
      const errorText = await chatStartResponse.text();
      console.log('   Chat Start Error:', errorText);
    }
    
    // Test 3: Message endpoint
    console.log('\n3️⃣ Testing Message Endpoint:');
    const messageResponse = await fetch('https://amharic-chatbot-backend.onrender.com/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-test-' + Date.now(),
        message: 'What is artificial intelligence?',
        language: 'en'
      })
    });
    console.log('   Message Status:', messageResponse.status);
    if (messageResponse.ok) {
      const messageData = await messageResponse.json();
      console.log('   Message Response:', messageData);
    } else {
      const errorText = await messageResponse.text();
      console.log('   Message Error:', errorText);
    }
    
    // Test 4: Amharic message
    console.log('\n4️⃣ Testing Amharic Message:');
    const amharicResponse = await fetch('https://amharic-chatbot-backend.onrender.com/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-test-am-' + Date.now(),
        message: 'ኢትዮጵያ በተወለደችው',
        language: 'am'
      })
    });
    console.log('   Amharic Status:', amharicResponse.status);
    if (amharicResponse.ok) {
      const amharicData = await amharicResponse.json();
      console.log('   Amharic Response:', amharicData);
    } else {
      const errorText = await amharicResponse.text();
      console.log('   Amharic Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

debugProductionIssues();
