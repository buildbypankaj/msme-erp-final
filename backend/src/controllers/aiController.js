const Groq = require('groq-sdk');

const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `You are VyaparSathi AI, a helpful business assistant for small and medium businesses in India. 
    You help with GST calculations, inventory management, billing, accounting, business advice, and general queries.
    Always respond in a mix of Hindi and English (Hinglish) to make it friendly for Indian business owners.
    Keep responses concise and practical. Use ₹ for currency.`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content;

    res.status(200).json({ content: responseText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'AI service error' });
  }
};

module.exports = { chat };