'use client';
import React, { useState } from 'react';
import { MessageCircle, Minimize2, X } from 'lucide-react';

// Types
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface ChatWidgetProps {
  apiKey: string;
  backendUrl: string;
}

// ChatWidget Component (for iframe content)
const ChatWidget: React.FC<ChatWidgetProps> = ({ apiKey, backendUrl }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    
    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: 'Error: Unable to send message.', sender: 'bot' },
      ]);
    } finally {
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.sender === 'user'
                ? 'ml-auto bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Launcher Component (for websites embedding the iframe)
const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div
          className="bg-transparent rounded-lg shadow-lg overflow-hidden"
          style={{
            width: '350px',
            height: isMinimized ? '60px' : '500px',
            transition: 'height 0.3s ease-in-out',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white">
            <h3 className="font-medium">Chat Support</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-blue-600 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {!isMinimized && <ChatWidget apiKey="YOUR_API_KEY" backendUrl="YOUR_BACKEND_URL" />}
        </div>
      )}
    </div>
  );
};

export default ChatbotLauncher;