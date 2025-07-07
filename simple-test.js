const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API routes
  if (pathname === '/api/generate-content' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      // Mock response
      const mockResponse = {
        content: JSON.stringify({
          version1: "Mock short version for testing the UI",
          version2: "Mock medium version for testing the enhanced Create Billings Pro interface with all features",
          version3: "Mock long version for testing the Create Billings Pro platform which now includes custom character limits, style presets, batch processing, and export functionality. This demonstrates the complete professional copy versioning system built with React and modern architecture."
        })
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockResponse));
    });
    return;
  }

  if (pathname.startsWith('/api/auth')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const mockResponse = {
        message: 'Success',
        user: {
          id: 1,
          email: 'nicky.leech@pa.media',
          first_name: 'Nicky',
          last_name: 'Leech'
        },
        token: 'mock-jwt-token-for-testing'
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockResponse));
    });
    return;
  }

  if (pathname.startsWith('/api/projects')) {
    const mockResponse = {
      projects: [
        {
          id: 1,
          name: 'BBC News Style',
          description: 'News and current affairs content',
          client_name: 'BBC',
          copy_count: 15,
          updated_at: new Date().toISOString()
        }
      ]
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockResponse));
    return;
  }

  if (pathname.startsWith('/api/style-presets')) {
    const mockResponse = {
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
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockResponse));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
  console.log(`\n✨ Your enhanced Create Billings Pro platform is ready for testing!`);
  console.log(`\n📋 Test Features:`);
  console.log(`   • User authentication (mock)`);
  console.log(`   • Content generation (mock responses)`);
  console.log(`   • Custom character limits`);
  console.log(`   • Style presets`);
  console.log(`   • Batch processing`);
  console.log(`   • Export functionality`);
  console.log(`\n🔑 To add real AI generation:`);
  console.log(`   1. Add your Anthropic API key to .env`);
  console.log(`   2. Use the full server.js instead`);
});

module.exports = server;