'use client';
import React, { useState } from 'react';

type ChatbotIframeProps = {
  params: {
    chatID: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function ChatbotIframe({ 
  params,
}: ChatbotIframeProps) {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    // Add user message
    const newUserMessage = { text: inputMessage, sender: 'user' as const };
    const newBotMessage = { text: `Echo (${params.chatID}): ${inputMessage}`, sender: 'bot' as const };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage, newBotMessage]);
    setInputMessage('');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header with Chat ID */}
      <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold">Chat Widget (ID: {params.chatID})</h3>
      </div>
      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-lg max-w-[80%] ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white self-end ml-auto' 
                : 'bg-gray-200 text-black self-start mr-auto'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      {/* Input Area */}
      <div className="p-3 border-t flex">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-grow p-2 border rounded-l-lg"
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}