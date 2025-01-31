import React from "react";


export default function ChatbotIframeLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <head>
          <style>{`
            html, body {
              background: transparent !important;
              margin: 0;
              padding: 0;
              height: 100%;
            }
            * {
              background-color: transparent;
            }
          `}</style>
        </head>
        <body>{children}</body>
      </html>
    );
  }