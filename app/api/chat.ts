// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  // Replace this dummy logic with your chatbot's logic.
  const botResponse = `Echo: ${message}`;

  res.status(200).json({ response: botResponse });
}
