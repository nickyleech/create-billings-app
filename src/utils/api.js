export const generateContent = async (prompt, userId) => {
  try {
    // Get user's API key from localStorage
    const apiKey = localStorage.getItem(`anthropic_api_key_${userId}`);
    
    if (!apiKey) {
      throw new Error('No API key found. Please set your Anthropic API key in Admin settings.');
    }

    // Call the server-side API endpoint which handles the Anthropic API
    const response = await fetch('http://localhost:3001/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Pass the user's API key to the server
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key in Admin settings.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error('Invalid request. Please check your input and try again.');
      } else {
        throw new Error(`API error: ${errorData?.error || response.statusText}`);
      }
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};