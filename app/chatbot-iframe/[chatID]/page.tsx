'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MessageCircleIcon } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const newUserMessage = { text: inputMessage, sender: 'user' as const };
    const newBotMessage = { text: `Echo (${params.chatID}): ${inputMessage}`, sender: 'bot' as const };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage, newBotMessage]);
    setInputMessage('');
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 ease-in-out ${
        isExpanded ? 'h-[500px]' : 'h-16'
      }`}
    >
      {/* Chat Header */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <MessageCircleIcon className="w-6 h-6" />
          <h3 className="font-bold">Chat Support</h3>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="w-6 h-6" />
        ) : (
          <ChevronUpIcon className="w-6 h-6" />
        )}
      </div>

      {/* Messages Container - Only show when expanded */}
      {isExpanded && (
        <>
          <div className="flex-grow overflow-y-auto p-3 space-y-2 h-[calc(100%-160px)]">
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
              className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
            />
            <button 
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}