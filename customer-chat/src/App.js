import React from 'react';
import { Toaster } from 'react-hot-toast';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      <ChatWidget />
    </div>
  );
}

export default App;
