import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { generateContent } from './utils/api';

const CreateBillingsApp = () => {
  const [inputText, setInputText] = useState('');
  const [versions, setVersions] = useState({
    version1: '',
    version2: '',
    version3: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    version1: false,
    version2: false,
    version3: false
  });

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
      const prompt = `You are a professional content editor specialising in British television metadata. Your task is to create three different versions of the provided copy following the PA TV metadata style guide.

IMPORTANT RULES:
1. Use British English spelling throughout
2. Do NOT end any version with a full stop
3. Only use content from the original copy - do not add AI-generated content to fill character limits
4. Follow the PA TV style guide for locations, people, repetition, and general formatting
5. Avoid repetition within billings and echoes from titles
6. Include descriptors for people when relevant
7. Use proper compass point capitalisation
8. Include accented characters where appropriate

INPUT TEXT: "${inputText}"

Create exactly three versions:
- Version 1: Maximum 90 characters including spaces
- Version 2: Maximum 180 characters including spaces  
- Version 3: Maximum 700 characters including spaces (leave blank if insufficient original content beyond 180 characters)

Respond with a JSON object in this exact format:
{
  "version1": "shortened version under 90 chars",
  "version2": "medium version under 180 chars",
  "version3": "long version under 700 chars or empty string if insufficient content"
}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;

      const response = await generateContent(prompt);
      const parsedResponse = JSON.parse(response);
      
      setVersions({
        version1: parsedResponse.version1 || '',
        version2: parsedResponse.version2 || '',
        version3: parsedResponse.version3 || ''
      });
    } catch (error) {
      console.error('Error generating versions:', error);
      setVersions({
        version1: 'Error generating content',
        version2: 'Error generating content',
        version3: 'Error generating content'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setVersions({
      version1: '',
      version2: '',
      version3: ''
    });
    setCopiedStates({
      version1: false,
      version2: false,
      version3: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Create Billings</h1>
          <p className="text-gray-600">Professional content versioning tool</p>
        </header>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-3">
            Original Copy
          </label>
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

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { key: 'version1', title: 'Version 1', limit: 90 },
            { key: 'version2', title: 'Version 2', limit: 180 },
            { key: 'version3', title: 'Version 3', limit: 700 }
          ].map(({ key, title, limit }) => (
            <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <span className="text-xs text-gray-500">≤{limit} chars</span>
              </div>
              
              <div className="relative">
                <textarea
                  value={versions[key]}
                  readOnly
                  className="w-full h-24 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm resize-none"
                  placeholder={`${title} will appear here...`}
                />
                {versions[key] && (
                  <button
                    onClick={() => copyToClipboard(versions[key], key)}
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
                  versions[key].length > limit ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {versions[key].length}/{limit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Following PA TV metadata style guide • British English • No trailing full stops</p>
        </div>
      </div>
    </div>
  );
};

export default CreateBillingsApp;
