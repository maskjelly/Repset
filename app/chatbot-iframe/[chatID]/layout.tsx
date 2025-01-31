import { Geist, Geist_Mono } from "next/font/google";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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