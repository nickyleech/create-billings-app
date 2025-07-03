const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app' 
  : 'http://localhost:3000';

export const generateContent = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
