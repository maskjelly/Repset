'use client';

import React from 'react';
import ChatWidget from '../../../components/ChatWidget';

export default function ChatbotIframePage() {
  return (
    <div style={{ 
      background: 'transparent',
      height: '100vh',
      width: '100%',
      pointerEvents: 'auto' // Re-enable pointer events for the chat content
    }}>
      <ChatWidget 
        // apiKey={process.env.NEXT_PUBLIC_CHAT_API_KEY || ''}
        // backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL || ''}
      />
    </div>
  );
}