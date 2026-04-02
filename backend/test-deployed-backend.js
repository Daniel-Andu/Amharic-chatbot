const fetch = require('node-fetch');

const testDeployedBackend = async () => {
  try {
    console.log('🧪 Testing Deployed Backend...');
    
    const baseUrl = 'https://amharic-chatbot-49ki.onrender.com';
    
    // Test 1: Health check
    console.log('\n1️⃣ Testing Health Endpoint:');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log('   Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Response:', healthData);
    }
    
    // Test 2: Chat start
    console.log('\n2️⃣ Testing Chat Start:');
    const sessionId = 'test-' + Date.now();
    const startResponse = await fetch(`${baseUrl}/api/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        language: 'en'
      })
    });
    console.log('   Status:', startResponse.status);
    if (startResponse.ok) {
      const startData = await startResponse.json();
      console.log('   Response:', startData);
    } else {
      const errorText = await startResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 3: English message
    console.log('\n3️⃣ Testing English Message:');
    const messageResponse = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        message: 'What is artificial intelligence?',
        language: 'en'
      })
    });
    console.log('   Status:', messageResponse.status);
    if (messageResponse.ok) {
      const messageData = await messageResponse.json();
      console.log('   Response:', messageData);
    } else {
      const errorText = await messageResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 4: Amharic message
    console.log('\n4️⃣ Testing Amharic Message:');
    const amharicResponse = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'am-test-' + Date.now(),
        message: 'ኢትዮጵያ በተወለደችው የመጀመሪያ',
        language: 'am'
      })
    });
    console.log('   Status:', amharicResponse.status);
    if (amharicResponse.ok) {
      const amharicData = await amharicResponse.json();
      console.log('   Response:', amharicData);
    } else {
      const errorText = await amharicResponse.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testDeployedBackend();
