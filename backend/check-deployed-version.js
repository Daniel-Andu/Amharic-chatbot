const fetch = require('node-fetch');

const checkDeployedVersion = async () => {
  try {
    console.log('🔍 Checking deployed version...');
    
    // Test a specific AI question that should trigger our new response
    const response = await fetch('https://amharic-chatbot-49ki.onrender.com/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'version-test-' + Date.now(),
        message: 'What is artificial intelligence?',
        language: 'en'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📝 Deployed Response:', data.response);
      
      // Check if it's using our new response
      if (data.response && data.response.includes('simulation of human intelligence')) {
        console.log('✅ Using NEW AI responses (deployed correctly)');
      } else if (data.response && data.response.includes('excellent question')) {
        console.log('❌ Using OLD AI responses (needs redeploy)');
      } else {
        console.log('⚠️ Unknown response type');
      }
    } else {
      console.log('❌ Failed to get response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkDeployedVersion();
