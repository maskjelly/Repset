// components/ChatWidget.tsx
import React, { useState, ChangeEvent } from 'react';

export interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatWidgetProps {
  apiKey: string;
  backendUrl: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ apiKey, backendUrl }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add the user message
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
      // Append the bot response
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { text: 'Error: Unable to send message.', sender: 'bot' },
      ]);
    } finally {
      setInput('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="chat-widget-container">
      <div className="chat-header">ChatBot</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <style jsx>{`
        .chat-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 300px;
          height: 400px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          background: #0070f3;
          color: white;
          padding: 10px;
          text-align: center;
        }
        .chat-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
        }
        .chat-input {
          display: flex;
          border-top: 1px solid #ccc;
        }
        .chat-input input {
          flex: 1;
          padding: 10px;
          border: none;
          outline: none;
        }
        .chat-input button {
          padding: 10px;
          border: none;
          background: #0070f3;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
