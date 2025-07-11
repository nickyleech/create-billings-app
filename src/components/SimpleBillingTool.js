import React, { useState } from 'react';
import { Copy, Check, FileText, Zap, RefreshCw } from 'lucide-react';

const SimpleBillingTool = ({ user, generateContent }) => {
  const [inputText, setInputText] = useState('');
  const [versions, setVersions] = useState({
    short: '',
    medium: '',
    long: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    short: false,
    medium: false,
    long: false
  });
  const [error, setError] = useState('');

  // Fixed character limits with friendly labels
  const versionLimits = {
    short: { label: 'Short', value: 90, description: 'Perfect for social media posts' },
    medium: { label: 'Medium', value: 180, description: 'Great for TV listings' },
    long: { label: 'Long', value: 700, description: 'Detailed descriptions' }
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
    setError('');
    
    try {
      const prompt = `You are a professional content editor specialising in British television metadata. Your task is to create 3 different versions of the provided copy following PA TV style guide.

STYLE RULES:
1. Use British English spelling throughout
2. Do NOT end any version with a full stop
3. Only use content from the original copy - do not add AI-generated content to fill character limits
4. Follow the PA TV style guide for locations, people, repetition, and general formatting
5. Avoid repetition within billings and echoes from titles
6. Include descriptors for people when relevant
7. Use proper compass point capitalisation
8. Include accented characters where appropriate

INPUT TEXT: "${inputText}"

Create exactly 3 versions:
- Short: ABSOLUTE MAXIMUM 90 characters including spaces and punctuation - NEVER EXCEED THIS LIMIT
- Medium: ABSOLUTE MAXIMUM 180 characters including spaces and punctuation - NEVER EXCEED THIS LIMIT  
- Long: ABSOLUTE MAXIMUM 700 characters including spaces and punctuation - NEVER EXCEED THIS LIMIT

ABSOLUTELY CRITICAL: Each version must be STRICTLY under the specified character limit. COUNT EVERY CHARACTER INCLUDING SPACES AND PUNCTUATION. If a version would exceed the limit by even 1 character, make it shorter. NEVER EXCEED THE LIMITS UNDER ANY CIRCUMSTANCES.

If there is insufficient original content to meaningfully fill a longer version, leave it blank.

Respond with a JSON object in this exact format:
{
  "short": "Short version under 90 characters",
  "medium": "Medium version under 180 characters", 
  "long": "Long version under 700 characters"
}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;

      const response = await generateContent(prompt, user.id);
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse API response:', error);
        throw new Error('Invalid response format from API');
      }
      
      // Validate and set versions
      const newVersions = {};
      const newCopiedStates = {};
      
      Object.keys(versionLimits).forEach(key => {
        let content = parsedResponse[key] || '';
        
        // Validate character limits
        const maxLength = versionLimits[key].value;
        if (content.length > maxLength) {
          console.warn(`${key} version exceeded limit (${content.length}/${maxLength}), truncating...`);
          // Smart truncation: try to preserve word boundaries
          let truncated = content.substring(0, maxLength);
          if (content[maxLength] && content[maxLength] !== ' ') {
            const lastSpaceIndex = truncated.lastIndexOf(' ');
            if (lastSpaceIndex > maxLength * 0.8) {
              truncated = truncated.substring(0, lastSpaceIndex);
            }
          }
          content = truncated.trim();
        }
        
        newVersions[key] = content;
        newCopiedStates[key] = false;
      });
      
      setVersions(newVersions);
      setCopiedStates(newCopiedStates);
      
    } catch (error) {
      console.error('Error generating versions:', error);
      setError('Failed to generate versions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setVersions({ short: '', medium: '', long: '' });
    setCopiedStates({ short: false, medium: false, long: false });
    setError('');
  };

  const countCharacters = (text) => text.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Quick Content Generator</h2>
        <p className="text-gray-600">Create professional TV content in three perfect sizes</p>
      </div>

      <div className="space-y-6">
        
        {/* Step 1: Input Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium mr-3">1</div>
            <h3 className="text-lg font-medium text-gray-900">Paste Your Content</h3>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            placeholder="Paste your original content here..."
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">
              {inputText.length} characters entered
            </span>
            <button
              onClick={clearAll}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Step 2: Generate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium mr-3">2</div>
            <h3 className="text-lg font-medium text-gray-900">Generate Versions</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <button
              onClick={generateVersions}
              disabled={!inputText.trim() || isGenerating}
              className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              <Zap className="w-6 h-6" />
              <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
            </button>
          </div>
          
          {isGenerating && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-900 font-medium">Creating your content versions...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900">{error}</p>
            </div>
          )}
        </div>

        {/* Step 3: Results */}
        {(versions.short || versions.medium || versions.long) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-medium mr-3">3</div>
              <h3 className="text-lg font-medium text-gray-900">Your Content Versions</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(versionLimits).map(([key, limit]) => {
                const content = versions[key] || '';
                const count = countCharacters(content);
                const isOverLimit = count > limit.value;
                
                return (
                  <div key={key} className={`border rounded-lg p-4 ${isOverLimit ? 'border-red-300' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{limit.label}</h4>
                        <p className="text-xs text-gray-500">{limit.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                          {count}/{limit.value}
                        </span>
                        {isOverLimit && (
                          <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-1">
                            OVER LIMIT
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={content}
                        readOnly
                        className="w-full h-20 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm resize-none"
                        placeholder={`${limit.label} version will appear here...`}
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Short (90 chars):</strong> Perfect for social media and quick summaries</p>
                <p>• <strong>Medium (180 chars):</strong> Ideal for TV listings and program guides</p>
                <p>• <strong>Long (700 chars):</strong> Detailed descriptions for websites and promotional materials</p>
                <p className="mt-3 text-xs text-blue-700">
                  All versions follow PA TV style guide with British English spelling and professional formatting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBillingTool;