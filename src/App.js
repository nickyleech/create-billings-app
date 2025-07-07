import React, { useState } from 'react';
import { Copy, Check, LogOut, User, Settings, Sliders, Palette, Layers, Download } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProjectList from './components/ProjectList';
import Timeline from './components/Timeline';
import CreateProjectModal from './components/CreateProjectModal';
import CustomLimitsModal from './components/CustomLimitsModal';
import StylePresetsModal from './components/StylePresetsModal';
import BatchProcessingModal from './components/BatchProcessingModal';
import ExportModal from './components/ExportModal';
import { generateContent } from './utils/api';

// Authentication wrapper component - now just passes through to MainApp
const AuthWrapper = () => {
  return <MainApp />;
};

// Main application component
const MainApp = () => {
  const [currentView, setCurrentView] = useState('timeline'); // 'timeline', 'projects', or 'billing-tool'
  const [selectedProject, setSelectedProject] = useState(null);
  const [inputText, setInputText] = useState('');
  const [versions, setVersions] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const [customLimits, setCustomLimits] = useState([
    { label: 'Version 1', value: '90', type: 'characters' },
    { label: 'Version 2', value: '180', type: 'characters' },
    { label: 'Version 3', value: '700', type: 'characters' }
  ]);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Remove auth dependency for now
  const user = null;

  const handleCreateProject = async (projectData) => {
    try {
      // This would typically call an API endpoint
      // For now, we'll just simulate project creation
      console.log('Creating project:', projectData);
      // After successful creation, you might want to refresh the project list
      // or navigate to the new project
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const saveToTimeline = async (originalText, versions, limits, preset) => {
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://create-billings.vercel.app' 
      : 'http://localhost:3001';

    try {
      const response = await fetch(`${API_BASE_URL}/api/copy-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: originalText,
          custom_versions: versions,
          custom_limits: limits,
          style_preset: preset?.name || null,
          user_name: 'Anonymous Creator',
          is_public: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save to timeline');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving to timeline:', error);
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
        `- ${limit.label}: Maximum ${limit.value} ${limit.type} including spaces`
      ).join('\n');

      const resultKeys = customLimits.map((_, index) => `version${index + 1}`);
      const resultFormat = customLimits.reduce((acc, limit, index) => {
        acc[`version${index + 1}`] = `${limit.label} under ${limit.value} ${limit.type}`;
        return acc;
      }, {});

      // Build style rules based on active preset or defaults
      const styleRules = activePreset?.style_rules || {
        britishEnglish: true,
        noFullStops: true,
        includeDescriptors: true,
        avoidRepetition: true
      };

      const brandKeywords = activePreset?.brand_keywords || [];
      const forbiddenWords = activePreset?.forbidden_words || [];

      let styleInstructions = [];
      
      if (styleRules.britishEnglish) {
        styleInstructions.push("1. Use British English spelling throughout");
      }
      
      if (styleRules.noFullStops) {
        styleInstructions.push("2. Do NOT end any version with a full stop");
      }
      
      styleInstructions.push("3. Only use content from the original copy - do not add AI-generated content to fill character limits");
      styleInstructions.push("4. Follow the PA TV style guide for locations, people, repetition, and general formatting");
      
      if (styleRules.avoidRepetition) {
        styleInstructions.push("5. Avoid repetition within billings and echoes from titles");
      }
      
      if (styleRules.includeDescriptors) {
        styleInstructions.push("6. Include descriptors for people when relevant");
      }
      
      styleInstructions.push("7. Use proper compass point capitalisation");
      styleInstructions.push("8. Include accented characters where appropriate");

      if (brandKeywords.length > 0) {
        styleInstructions.push(`9. Try to preserve these important brand keywords: ${brandKeywords.join(', ')}`);
      }

      if (forbiddenWords.length > 0) {
        styleInstructions.push(`10. NEVER use these forbidden words: ${forbiddenWords.join(', ')}`);
      }

      if (styleRules.customInstructions) {
        styleInstructions.push(`11. Additional instructions: ${styleRules.customInstructions}`);
      }

      const presetName = activePreset ? ` using the "${activePreset.name}" style preset` : '';
      
      const prompt = `You are a professional content editor specialising in British television metadata. Your task is to create ${customLimits.length} different versions of the provided copy${presetName}.

STYLE RULES:
${styleInstructions.join('\n')}

INPUT TEXT: "${inputText}"

Create exactly ${customLimits.length} versions:
${limitsText}

For word limits, count individual words separated by spaces.
For character limits, count all characters including spaces and punctuation.
If there is insufficient original content to meaningfully fill a longer version, leave it blank.

Respond with a JSON object in this exact format:
${JSON.stringify(resultFormat, null, 2)}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;

      const response = await generateContent(prompt);
      const parsedResponse = JSON.parse(response);
      
      // Map the response to our version keys
      const newVersions = {};
      const newCopiedStates = {};
      
      customLimits.forEach((limit, index) => {
        const key = `version${index + 1}`;
        newVersions[key] = parsedResponse[key] || '';
        newCopiedStates[key] = false;
      });
      
      setVersions(newVersions);
      setCopiedStates(newCopiedStates);

      // Save to timeline for public viewing
      try {
        await saveToTimeline(inputText, newVersions, customLimits, activePreset);
      } catch (saveError) {
        console.warn('Failed to save to timeline:', saveError);
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

  const handleLimitsSave = (newLimits) => {
    setCustomLimits(newLimits);
    // Clear existing versions when limits change
    const emptyVersions = {};
    const emptyCopiedStates = {};
    
    newLimits.forEach((_, index) => {
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

  const handleApplyPreset = (preset) => {
    // Apply character limits from preset
    if (preset.character_limits && preset.character_limits.length > 0) {
      setCustomLimits(preset.character_limits);
    }
    
    // Set active preset for generating content with its style rules
    setActivePreset(preset);
    
    // Clear existing versions when preset is applied
    const emptyVersions = {};
    const emptyCopiedStates = {};
    
    const limits = preset.character_limits || customLimits;
    limits.forEach((_, index) => {
      const key = `version${index + 1}`;
      emptyVersions[key] = '';
      emptyCopiedStates[key] = false;
    });
    
    setVersions(emptyVersions);
    setCopiedStates(emptyCopiedStates);
  };

  const generateBatchContent = async (inputText, limits, preset) => {
    // This function is used by the batch processor
    const limitsToUse = limits || customLimits;
    const presetToUse = preset || activePreset;
    
    // Build style rules based on active preset or defaults
    const styleRules = presetToUse?.style_rules || {
      britishEnglish: true,
      noFullStops: true,
      includeDescriptors: true,
      avoidRepetition: true
    };

    const brandKeywords = presetToUse?.brand_keywords || [];
    const forbiddenWords = presetToUse?.forbidden_words || [];

    let styleInstructions = [];
    
    if (styleRules.britishEnglish) {
      styleInstructions.push("1. Use British English spelling throughout");
    }
    
    if (styleRules.noFullStops) {
      styleInstructions.push("2. Do NOT end any version with a full stop");
    }
    
    styleInstructions.push("3. Only use content from the original copy - do not add AI-generated content to fill character limits");
    styleInstructions.push("4. Follow the PA TV style guide for locations, people, repetition, and general formatting");
    
    if (styleRules.avoidRepetition) {
      styleInstructions.push("5. Avoid repetition within billings and echoes from titles");
    }
    
    if (styleRules.includeDescriptors) {
      styleInstructions.push("6. Include descriptors for people when relevant");
    }
    
    styleInstructions.push("7. Use proper compass point capitalisation");
    styleInstructions.push("8. Include accented characters where appropriate");

    if (brandKeywords.length > 0) {
      styleInstructions.push(`9. Try to preserve these important brand keywords: ${brandKeywords.join(', ')}`);
    }

    if (forbiddenWords.length > 0) {
      styleInstructions.push(`10. NEVER use these forbidden words: ${forbiddenWords.join(', ')}`);
    }

    if (styleRules.customInstructions) {
      styleInstructions.push(`11. Additional instructions: ${styleRules.customInstructions}`);
    }

    const limitsText = limitsToUse.map((limit, index) => 
      `- ${limit.label}: Maximum ${limit.value} ${limit.type} including spaces`
    ).join('\n');

    const resultFormat = limitsToUse.reduce((acc, limit, index) => {
      acc[`version${index + 1}`] = `${limit.label} under ${limit.value} ${limit.type}`;
      return acc;
    }, {});

    const presetName = presetToUse ? ` using the "${presetToUse.name}" style preset` : '';
    
    const prompt = `You are a professional content editor specialising in British television metadata. Your task is to create ${limitsToUse.length} different versions of the provided copy${presetName}.

STYLE RULES:
${styleInstructions.join('\n')}

INPUT TEXT: "${inputText}"

Create exactly ${limitsToUse.length} versions:
${limitsText}

For word limits, count individual words separated by spaces.
For character limits, count all characters including spaces and punctuation.
If there is insufficient original content to meaningfully fill a longer version, leave it blank.

Respond with a JSON object in this exact format:
${JSON.stringify(resultFormat, null, 2)}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;

    const response = await generateContent(prompt);
    const parsedResponse = JSON.parse(response);
    
    // Map the response to our version keys
    const newVersions = {};
    
    limitsToUse.forEach((limit, index) => {
      const key = `version${index + 1}`;
      newVersions[key] = parsedResponse[key] || '';
    });
    
    return newVersions;
  };

  // Navigation header component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-light text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={() => setCurrentView('projects')}
          >
            Create Billings Pro
          </h1>
          {selectedProject && (
            <div className="flex items-center space-x-2 text-gray-600">
              <span>/</span>
              <span className="font-medium">{selectedProject.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setCurrentView('timeline')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentView === 'timeline' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setCurrentView('projects')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentView === 'projects' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setCurrentView('billing-tool')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentView === 'billing-tool' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Billing Tool
            </button>
          </nav>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'timeline':
        return <Timeline />;
        
      case 'projects':
        return (
          <ProjectList 
            onSelectProject={(project) => {
              setSelectedProject(project);
              setCurrentView('billing-tool');
            }}
            onCreateProject={() => {
              setShowCreateProjectModal(true);
            }}
          />
        );
      
      case 'billing-tool':
        return <BillingTool />;
      
      default:
        return <Timeline />;
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
              onClick={() => setShowBatchModal(true)}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              <Layers className="w-4 h-4" />
              <span>Batch Process</span>
            </button>
            <button
              onClick={() => setShowPresetsModal(true)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              <Palette className="w-4 h-4" />
              <span>Style Presets</span>
            </button>
            <button
              onClick={() => setShowLimitsModal(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Sliders className="w-4 h-4" />
              <span>Custom Limits ({customLimits.length})</span>
            </button>
          </div>
        </div>
        
        {activePreset && (
          <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">
                Active Style: <strong>{activePreset.name}</strong>
              </span>
              <button
                onClick={() => setActivePreset(null)}
                className="text-purple-600 hover:text-purple-800 text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        )}
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
              {Object.keys(versions).some(key => versions[key]) && (
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 transition-colors border border-green-300 rounded-md hover:bg-green-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              )}
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
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{limit.label}</h3>
                  <span className="text-xs text-gray-500">
                    ≤{limit.value} {limit.type === 'words' ? 'words' : 'chars'}
                  </span>
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
      <Header />
      <main className="p-6">
        {renderContent()}
      </main>
      
      <CustomLimitsModal
        isOpen={showLimitsModal}
        onClose={() => setShowLimitsModal(false)}
        onSave={handleLimitsSave}
        initialLimits={customLimits}
      />
      
      <StylePresetsModal
        isOpen={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        onApplyPreset={handleApplyPreset}
      />
      
      <BatchProcessingModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        customLimits={customLimits}
        activePreset={activePreset}
        onGenerate={generateBatchContent}
      />
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inputText={inputText}
        versions={versions}
        customLimits={customLimits}
        activePreset={activePreset}
      />
      
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onCreateProject={handleCreateProject}
      />
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
