import { __rest } from "tslib";
// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from '@/components/ChatWidget';
/**
 * Initializes the chat widget inside the provided container.
 */
export function initChatWidget(config) {
    const { containerId } = config, widgetProps = __rest(config, ["containerId"]);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found.`);
        return;
    }
    // Create a root and render the ChatWidget
    const root = createRoot(container);
    root.render(<ChatWidget {...widgetProps}/>);
}
// Expose the initialization method on the global window object
if (typeof window !== 'undefined') {
    window.ChatbotWidget = { init: initChatWidget };
}
//# sourceMappingURL=index.jsx.map