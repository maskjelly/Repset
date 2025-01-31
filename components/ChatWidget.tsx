// components/ChatWidget.tsx
import React, { useState, ChangeEvent, CSSProperties } from 'react';

export interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatWidgetProps {
  apiKey: string;
  backendUrl: string;
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '300px',
  height: '400px',
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: CSSProperties = {
  background: '#0070f3',
  color: 'white',
  padding: '10px',
  textAlign: 'center',
};

const messagesStyle: CSSProperties = {
  flex: 1,
  padding: '10px',
  overflowY: 'auto',
};

const inputContainerStyle: CSSProperties = {
  display: 'flex',
  borderTop: '1px solid #ccc',
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: '10px',
  border: 'none',
  outline: 'none',
};

const buttonStyle: CSSProperties = {
  padding: '10px',
  border: 'none',
  background: '#0070f3',
  color: 'white',
  cursor: 'pointer',
};

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
    <div style={containerStyle}>
      <div style={headerStyle}>ChatBot</div>
      <div style={messagesStyle}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Type your message..."
          style={inputStyle}
        />
        <button onClick={sendMessage} style={buttonStyle}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
