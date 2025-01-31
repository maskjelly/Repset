// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget, { ChatWidgetProps } from '../../components/ChatWidget';

export interface WidgetConfig extends ChatWidgetProps {
  containerId: string;
}

/**
 * Initializes the chat widget inside the provided container.
 */
export function initChatWidget(config: WidgetConfig): void {
  const { containerId, ...widgetProps } = config;
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found.`);
    return;
  }
  // Create a root and render the ChatWidget
  const root = createRoot(container);
  root.render(<ChatWidget {...widgetProps} />);
}

// Expose the initialization method on the global window object
if (typeof window !== 'undefined') {
  (window as any).ChatbotWidget = { init: initChatWidget };
}
