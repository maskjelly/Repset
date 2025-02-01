import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: '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', // Replace with your Groq API key
});

export default async function handler({req, res}:any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful sales assistant.' },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
    });

    res.status(200).json({ response: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch response from Groq API' });
  }
}