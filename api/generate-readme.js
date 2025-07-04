export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('Missing OpenAI API key');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!completion.ok) {
      const errorBody = await completion.text(); // capture raw error for logging
      console.error(`OpenAI error: ${completion.status} - ${errorBody}`);
      return res.status(completion.status).json({ error: 'OpenAI API request failed', details: errorBody });
    }

    const data = await completion.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Something went wrong server-side', details: err.message });
  }
}