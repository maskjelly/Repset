// pages/chatbot-iframe/[chatId].tsx
import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotIframePage: React.FC = () => {
  const router = useRouter();
  const { chatId } = router.query; // You can use this id to load configuration or history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  // This example uses a dummy fetch; replace with your real API endpoint.
  const sendMessage = async () => {
    if (!input.trim()) return;
    // Update local UI
    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);

    try {
      // Example API call (use your backend)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, chatId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (err) {
      console.error('Error sending message', err);
      setMessages((prev) => [
        ...prev,
        { text: 'Error: unable to send message', sender: 'bot' },
      ]);
    } finally {
      setInput('');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Chatbot {chatId && `(${chatId})`}</h2>
      <div style={messagesContainerStyle}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.sender === 'user' ? userMsgStyle : botMsgStyle}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={inputContainerStyle}>
        <input
          style={inputStyle}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button style={buttonStyle} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotIframePage;

// Inline styles for simplicity. You can extract these to CSS modules or styled components.
const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
  boxSizing: 'border-box',
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  marginBottom: '10px',
  border: '1px solid #ccc',
  padding: '10px',
  borderRadius: '4px',
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  marginLeft: '5px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: 'white',
};

const userMsgStyle: React.CSSProperties = {
  textAlign: 'right',
  margin: '5px 0',
};

const botMsgStyle: React.CSSProperties = {
  textAlign: 'left',
  margin: '5px 0',
};
