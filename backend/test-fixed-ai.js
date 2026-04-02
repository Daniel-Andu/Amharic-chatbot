const testFixedAI = async () => {
  const { unlimitedAI } = require('./src/services/unlimitedAI');
  
  console.log('🧪 Testing Fixed AI Service...');
  
  // Test English questions
  console.log('\n1️⃣ Testing English AI Question:');
  const aiResponse = await unlimitedAI.getResponse('What is artificial intelligence?', 'en');
  console.log('   Response:', aiResponse);
  
  console.log('\n2️⃣ Testing English Programming Question:');
  const progResponse = await unlimitedAI.getResponse('How can I improve my programming skills?', 'en');
  console.log('   Response:', progResponse);
  
  // Test Amharic questions
  console.log('\n3️⃣ Testing Amharic History Question:');
  const amHistoryResponse = await unlimitedAI.getResponse('ኢትዮጵያ በተወለደችው የመጀመሪያ', 'am');
  console.log('   Response:', amHistoryResponse);
  
  console.log('\n4️⃣ Testing Amharic Language Question:');
  const amLangResponse = await unlimitedAI.getResponse('አማርኛ ቋን ሰማይ ነጋጽር ነው', 'am');
  console.log('   Response:', amLangResponse);
};

testFixedAI();
