const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Simple test route for generate-content
app.post('/api/generate-content', (req, res) => {
  // Mock response for testing
  const mockResponse = {
    content: JSON.stringify({
      version1: "Mock short version for testing the UI",
      version2: "Mock medium version for testing the enhanced Create Billings Pro interface with all features",
      version3: "Mock long version for testing the Create Billings Pro platform which now includes custom character limits, style presets, batch processing, and export functionality. This demonstrates the complete professional copy versioning system built with React and modern architecture."
    })
  };
  
  setTimeout(() => {
    res.json(mockResponse);
  }, 1000); // Simulate API delay
});

// Auth routes (mock for testing)
app.post('/api/auth', (req, res) => {
  const { action } = req.query;
  
  if (action === 'register' || action === 'login') {
    res.json({
      message: 'Success',
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      },
      token: 'mock-jwt-token-for-testing'
    });
  } else if (action === 'profile') {
    res.json({
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      }
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Projects routes (mock)
app.get('/api/projects', (req, res) => {
  const { action } = req.query;
  
  if (action === 'list') {
    res.json({
      projects: [
        {
          id: 1,
          name: 'BBC News Style',
          description: 'News and current affairs content',
          client_name: 'BBC',
          copy_count: 15,
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Social Media Campaign',
          description: 'Multi-platform social content',
          client_name: 'Digital Agency',
          copy_count: 8,
          updated_at: new Date().toISOString()
        }
      ]
    });
  } else {
    res.json({ message: 'Mock response' });
  }
});

// Style presets routes (mock)
app.get('/api/style-presets', (req, res) => {
  const { action } = req.query;
  
  if (action === 'list') {
    res.json({
      presets: [
        {
          id: 1,
          name: 'BBC News Style',
          description: 'Professional news format',
          character_limits: [
            { label: 'Headline', value: '60', type: 'characters' },
            { label: 'Summary', value: '150', type: 'characters' },
            { label: 'Full', value: '500', type: 'characters' }
          ],
          style_rules: {
            britishEnglish: true,
            noFullStops: true,
            includeDescriptors: true
          },
          brand_keywords: ['BBC', 'breaking', 'exclusive'],
          forbidden_words: ['click here', 'amazing']
        }
      ]
    });
  } else {
    res.json({ message: 'Mock response' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n✨ Your enhanced Create Billings Pro platform is ready for testing!`);
});

module.exports = app;