import React, { useState } from 'react';
import { Copy, Check, LogOut, User, BarChart3 } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import ExcelAnalysisPage from './components/ExcelAnalysisPage';
import TranslationPage from './components/TranslationPage';
import SimpleTranslationPage from './components/SimpleTranslationPage';
import SimpleBillingTool from './components/SimpleBillingTool';
import { generateContent } from './utils/api';

// Authentication wrapper component
const AuthWrapper = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <MainApp />;
};

// Main application component
const MainApp = () => {
  const { user, logout } = useAuth();
  const [inputText, setInputText] = useState('');
  const [versions, setVersions] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [customLimits] = useState([
    { label: 'Version 1', value: '90', type: 'characters' },
    { label: 'Version 2', value: '180', type: 'characters' },
    { label: 'Version 3', value: '700', type: 'characters' }
  ]);
  const [currentSection, setCurrentSection] = useState('dashboard'); // 'dashboard', 'billing' or 'translation'
  const [simpleMode, setSimpleMode] = useState(true);
  const [simpleBillingMode, setSimpleBillingMode] = useState(true);
  const [selectedStyle] = useState('default');

  const saveToHistory = async (originalText, versions, limits, style) => {
    try {
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        originalText,
        versions,
        limits,
        style: style || null,
        userId: user.id
      };
      
      // Save to localStorage for now
      const existingHistory = JSON.parse(localStorage.getItem('billingHistory') || '[]');
      existingHistory.unshift(historyItem);
      localStorage.setItem('billingHistory', JSON.stringify(existingHistory));
      
      return historyItem;
    } catch (error) {
      console.error('Error saving to history:', error);
      throw error;
    }
  };


  const copyToClipboard = async (text, version) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [version]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [version]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateVersions = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Create dynamic prompts based on custom limits
      const limitsText = customLimits.map((limit, index) => 
        `- ${limit.label}: ABSOLUTE MAXIMUM ${limit.value} ${limit.type} including spaces and punctuation - NEVER EXCEED THIS LIMIT`
      ).join('\n');

      const resultFormat = customLimits.reduce((acc, limit, index) => {
        acc[`version${index + 1}`] = `${limit.label} under ${limit.value} ${limit.type}`;
        return acc;
      }, {});

      // Build style rules
      const styleInstructions = [
        "1. Use British English spelling throughout",
        "2. Do NOT end any version with a full stop",
        "3. Only use content from the original copy - do not add AI-generated content to fill character limits",
        "4. Follow the PA TV style guide for locations, people, repetition, and general formatting",
        "5. Avoid repetition within billings and echoes from titles",
        "6. Include descriptors for people when relevant",
        "7. Use proper compass point capitalisation",
        "8. Include accented characters where appropriate"
      ];
      
      const prompt = `You are a professional content editor specialising in British television metadata. Your task is to create ${customLimits.length} different versions of the provided copy.

STYLE RULES:
${styleInstructions.join('\n')}

INPUT TEXT: "${inputText}"

Create exactly ${customLimits.length} versions:
${limitsText}

For word limits, count individual words separated by spaces.
For character limits, count all characters including spaces and punctuation.
ABSOLUTELY CRITICAL: Each version must be STRICTLY under the specified character/word limit. COUNT EVERY CHARACTER INCLUDING SPACES AND PUNCTUATION. If a version would exceed the limit by even 1 character, make it shorter. NEVER EXCEED THE LIMITS UNDER ANY CIRCUMSTANCES.
If there is insufficient original content to meaningfully fill a longer version, leave it blank.

Respond with a JSON object in this exact format:
${JSON.stringify(resultFormat, null, 2)}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;

      const response = await generateContent(prompt, user.id);
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse API response:', error);
        throw new Error('Invalid response format from API');
      }
      
      // Map the response to our version keys and validate limits
      const newVersions = {};
      const newCopiedStates = {};
      
      customLimits.forEach((limit, index) => {
        const key = `version${index + 1}`;
        let content = parsedResponse[key] || '';
        
        // Validate and truncate if necessary with smart word boundary preservation
        if (content && limit.type === 'characters' && content.length > parseInt(limit.value)) {
          console.warn(`${limit.label} exceeded limit (${content.length}/${limit.value}), truncating...`);
          // Smart truncation: try to preserve word boundaries
          const maxLength = parseInt(limit.value);
          if (content.length > maxLength) {
            let truncated = content.substring(0, maxLength);
            // If we cut in the middle of a word, back up to the last complete word
            if (content[maxLength] && content[maxLength] !== ' ') {
              const lastSpaceIndex = truncated.lastIndexOf(' ');
              if (lastSpaceIndex > maxLength * 0.8) { // Only if we don't lose too much content
                truncated = truncated.substring(0, lastSpaceIndex);
              }
            }
            content = truncated.trim();
          }
        } else if (content && limit.type === 'words') {
          const words = content.trim().split(/\s+/).filter(word => word.length > 0);
          if (words.length > parseInt(limit.value)) {
            console.warn(`${limit.label} exceeded word limit (${words.length}/${limit.value}), truncating...`);
            content = words.slice(0, parseInt(limit.value)).join(' ');
          }
        }
        
        newVersions[key] = content;
        newCopiedStates[key] = false;
      });
      
      setVersions(newVersions);
      setCopiedStates(newCopiedStates);

      // Save to history
      try {
        await saveToHistory(inputText, newVersions, customLimits, selectedStyle);
      } catch (saveError) {
        console.warn('Failed to save to history:', saveError);
        // Don't show error to user as this is non-critical
      }
    } catch (error) {
      console.error('Error generating versions:', error);
      const errorVersions = {};
      customLimits.forEach((_, index) => {
        errorVersions[`version${index + 1}`] = 'Error generating content';
      });
      setVersions(errorVersions);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    const emptyVersions = {};
    const emptyCopiedStates = {};
    
    customLimits.forEach((_, index) => {
      const key = `version${index + 1}`;
      emptyVersions[key] = '';
      emptyCopiedStates[key] = false;
    });
    
    setVersions(emptyVersions);
    setCopiedStates(emptyCopiedStates);
  };

  const countContent = (text, type) => {
    if (type === 'words') {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return text.length; // characters
  };

  // Navigation header component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentSection('dashboard')}
            className="flex items-center space-x-2 text-2xl font-light text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span>Create Billings Pro</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {(currentSection === 'translation' || currentSection === 'billing') && (
            <button
              onClick={() => {
                if (currentSection === 'translation') {
                  setSimpleMode(!simpleMode);
                } else if (currentSection === 'billing') {
                  setSimpleBillingMode(!simpleBillingMode);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                (currentSection === 'translation' && simpleMode) || (currentSection === 'billing' && simpleBillingMode)
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg'
              }`}
            >
              <span>
                {(currentSection === 'translation' && simpleMode) || (currentSection === 'billing' && simpleBillingMode)
                  ? '✨ Switch to Advanced' 
                  : '🔄 Switch to Simple'
                }
              </span>
            </button>
          )}
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    if (currentSection === 'dashboard') {
      return <HomePage onSelectSection={setCurrentSection} />;
    }
    if (currentSection === 'analysis') {
      return <ExcelAnalysisPage onNavigateBack={() => setCurrentSection('dashboard')} />;
    }
    if (currentSection === 'translation') {
      if (simpleMode) {
        return (
          <SimpleTranslationPage 
            user={user}
            generateContent={generateContent}
            onNavigateBack={() => setCurrentSection('dashboard')}
          />
        );
      } else {
        return (
          <TranslationPage 
            user={user}
            generateContent={generateContent}
            onNavigateBack={() => setCurrentSection('dashboard')}
          />
        );
      }
    }
    if (simpleBillingMode) {
      return (
        <SimpleBillingTool 
          user={user}
          generateContent={generateContent}
        />
      );
    } else {
      return <BillingTool />;
    }
  };

  // Billing tool component (the original functionality)
  const BillingTool = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Content Versioning Tool</h2>
        <p className="text-gray-600">Generate professional copy variations following PA TV style guide</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <label htmlFor="input-text" className="block text-sm font-medium text-gray-700">
            Original Copy
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentSection('analysis')}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Excel Analysis</span>
            </button>
          </div>
        </div>
        
        
        <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            placeholder="Paste your content here..."
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              {inputText.length} characters
            </span>
            <div className="space-x-3">
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={generateVersions}
                disabled={!inputText.trim() || isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>


        <div className={`grid gap-6 ${
          customLimits.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          customLimits.length === 2 ? 'md:grid-cols-2' :
          customLimits.length <= 3 ? 'md:grid-cols-3' :
          customLimits.length <= 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {customLimits.map((limit, index) => {
            const key = `version${index + 1}`;
            const content = versions[key] || '';
            const count = countContent(content, limit.type);
            const maxCount = parseInt(limit.value);
            const isOverLimit = count > maxCount;
            
            return (
              <div key={key} className={`bg-white rounded-lg shadow-sm border p-4 ${isOverLimit ? 'border-red-300' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{limit.label}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                      {count}/{limit.value} {limit.type === 'words' ? 'words' : 'chars'}
                    </span>
                    {isOverLimit && (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                        OVER LIMIT
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    value={content}
                    readOnly
                    className="w-full h-24 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm resize-none"
                    placeholder={`${limit.label} will appear here...`}
                  />
                  {content && (
                    <button
                      onClick={() => copyToClipboard(content, key)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedStates[key] ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                <div className="mt-2 text-right">
                  <span className={`text-xs ${
                    isOverLimit ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {count}/{maxCount} {limit.type === 'words' ? 'words' : 'chars'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Following PA TV metadata style guide • British English • No trailing full stops</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentSection !== 'dashboard' && <Header />}
      {currentSection === 'dashboard' ? (
        renderContent()
      ) : currentSection === 'billing' ? (
        <main className="p-6">
          {renderContent()}
        </main>
      ) : currentSection === 'analysis' ? (
        renderContent()
      ) : (
        renderContent()
      )}
      
    </div>
  );
};

// Root App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;
