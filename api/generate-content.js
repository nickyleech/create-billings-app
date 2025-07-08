async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Get API key from Authorization header
  const authHeader = req.headers.authorization;
  let apiKey;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else {
    // Fallback to environment variable if no user key provided
    apiKey = process.env.ANTHROPIC_API_KEY;
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'No API key provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    res.status(200).json({ content });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}

module.exports = handler;
