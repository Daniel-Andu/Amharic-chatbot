const testAILogic = () => {
  const { unlimitedAI } = require('./src/services/unlimitedAI');
  
  console.log('🧪 Testing AI Logic...');
  
  // Test English questions
  console.log('\n1️⃣ Testing English AI Question:');
  const aiResponse = unlimitedAI.getResponse('What is artificial intelligence?', 'en');
  console.log('   Response:', aiResponse);
  
  console.log('\n2️⃣ Testing English Programming Question:');
  const progResponse = unlimitedAI.getResponse('How can I improve my programming skills?', 'en');
  console.log('   Response:', progResponse);
  
  // Test Amharic questions
  console.log('\n3️⃣ Testing Amharic History Question:');
  const amHistoryResponse = unlimitedAI.getResponse('ኢትዮጵያ በተወለደችው የመጀመሪያ', 'am');
  console.log('   Response:', amHistoryResponse);
  
  console.log('\n4️⃣ Testing Amharic Language Question:');
  const amLangResponse = unlimitedAI.getResponse('አማርኛ ቋን ሰማይ ነጋጽር ነው', 'am');
  console.log('   Response:', amLangResponse);
};

testAILogic();
