# Create Billings Pro - Setup Guide

Your professional copy versioning platform is now ready! Here's how to get it running:

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your API keys
nano .env
```

### 2. Required Environment Variables
Add these to your `.env` file:

```env
# Get your API key from https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Generate a secure random string for production
JWT_SECRET=your_secure_jwt_secret_here

NODE_ENV=development
```

### 3. Start the Application
```bash
# Install all dependencies (already done)
npm install

# Start both backend and frontend in development mode
npm run dev

# OR start them separately:
# Terminal 1: Backend server (port 3001)
npm run dev:server

# Terminal 2: React frontend (port 3000) 
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📋 What's Included

### ✅ Phase 1 - Core Infrastructure (COMPLETED)
- **SQLite Database** - User data, projects, copy entries
- **User Authentication** - Secure login/register with JWT
- **Project Management** - Organize copy by clients/campaigns
- **Enhanced UI** - Professional React components

### ✅ Current Features
- **User Registration & Login** - Secure authentication system
- **Project Organization** - Create and manage client projects
- **Original Billing Tool** - Your existing 90/180/700 character versioning
- **Copy Management** - Save and organize copy variations
- **Version History** - Track changes over time
- **Professional UI** - Clean, responsive design

### ✅ Phase 2 - Advanced Features (COMPLETED)
- **Custom Character Limits** ✨ - Flexible version parameters with preset limits for social media platforms
- **Style Presets** ✨ - Brand-specific guidelines with custom rules and keyword management
- **Batch Processing** ✨ - Handle multiple pieces at once with progress tracking and CSV export
- **Export Options** ✨ - CSV, JSON, HTML reports, and social media formatted exports
- **Word Count Support** ✨ - Generate versions based on word limits as well as character limits

### 🔄 Phase 3 Features (Ready to Implement)
- **Team Collaboration** - Comments, sharing, and approval workflows
- **Analytics Dashboard** - Usage insights, performance tracking, and optimization suggestions
- **Readability Analysis** - Flesch-Kincaid scoring and content analysis
- **API Integrations** - CMS connectors, social media scheduling
- **Advanced AI Features** - A/B testing suggestions, brand compliance checking

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Backend only (for API testing)
npm run dev:server

# Frontend only 
npm start
```

## 📱 Using the Application

### First Time Setup
1. Visit http://localhost:3000
2. Click "Sign up" to create your account
3. Login with your credentials
4. Create your first project
5. Start generating copy variations!

### Core Workflow
1. **Create Project** - Organize by client/campaign
2. **Configure Limits** - Set custom character/word limits for different platforms
3. **Set Style Presets** - Define brand guidelines and style rules
4. **Add Copy** - Paste original content
5. **Generate Versions** - AI creates variations following your specifications
6. **Export Results** - Download in various formats (CSV, HTML, social media)

### Advanced Features

#### Custom Character Limits
- Click "Custom Limits" to modify version parameters
- Add limits for social media platforms (Twitter, LinkedIn, Instagram)
- Support for both character and word count limits
- Quick-add presets for common platforms

#### Style Presets
- Click "Style Presets" to create brand-specific guidelines
- Define custom style rules (British English, descriptors, etc.)
- Add brand keywords to preserve in all versions
- Set forbidden words to avoid
- Save and reuse presets across projects

#### Batch Processing
- Click "Batch Process" to handle multiple copy pieces at once
- Import text from clipboard (one item per line)
- Process all items with progress tracking
- Export results to CSV for spreadsheet analysis

#### Export Options
- **CSV Spreadsheet** - For Excel/Google Sheets import
- **JSON Data** - For API integrations
- **HTML Reports** - Professional formatted reports
- **Social Media** - Pre-formatted for Twitter/LinkedIn posting
- Include metadata (timestamps, counts, style preset info)

### Navigation
- **Projects** - View and manage all your projects
- **Billing Tool** - Enhanced copy generation interface with all new features
- **User Menu** - Profile settings and logout

## 🎯 Key Benefits

### For Professional Writers
- **Organized Workflow** - No more lost copy variations
- **Client Management** - Separate projects by client
- **Quality Assurance** - PA TV style guide compliance
- **Time Saving** - Instant professional variations
- **Version Control** - Track all changes and iterations

### Technical Excellence
- **Modern Architecture** - React 19 + Node.js + SQLite
- **Secure Authentication** - JWT with bcrypt password hashing
- **Responsive Design** - Works on desktop and mobile
- **API-First Design** - Ready for integrations
- **Professional Grade** - Production-ready codebase

## 🔒 Security Notes
- Passwords are securely hashed with bcrypt
- JWT tokens for secure session management
- API endpoints protected with authentication
- Environment variables for sensitive data

## 🆘 Troubleshooting

### Common Issues
1. **Database Errors** - Ensure the `data/` directory exists
2. **API Errors** - Check your ANTHROPIC_API_KEY in .env
3. **Port Conflicts** - Make sure ports 3000 and 3001 are available
4. **Module Errors** - Run `npm install` to ensure all dependencies

### Getting Help
- Check the browser console for frontend errors
- Check terminal output for backend errors
- Ensure .env file is properly configured

## 🚀 Next Steps
Your foundation is complete! You now have a professional-grade copy versioning platform. Ready to add more advanced features like batch processing, custom exports, team collaboration, and analytics?

Let me know which features you'd like to implement next!