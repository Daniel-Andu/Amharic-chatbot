// Test if the new AI service has syntax errors
try {
  const { unlimitedAI } = require('./src/services/unlimitedAI');
  console.log('✅ AI service loaded successfully');
  
  // Test basic functionality
  unlimitedAI.getResponse('hello', 'en').then(response => {
    console.log('✅ Response:', response);
  }).catch(error => {
    console.error('❌ AI service error:', error);
  });
  
} catch (error) {
  console.error('❌ Failed to load AI service:', error.message);
  console.error('Stack:', error.stack);
}
