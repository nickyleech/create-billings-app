import React, { useState, useEffect } from 'react';
import { Copy, Check, LogOut, User, Settings, Sliders, Palette, Layers, Download, ChevronDown, History, HelpCircle, BarChart3, Languages, FileText } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import CustomLimitsModal from './components/CustomLimitsModal';
import StylePresetsModal from './components/StylePresetsModal';
import BatchProcessingModal from './components/BatchProcessingModal';
import ExportModal from './components/ExportModal';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import ExcelAnalysisModal from './components/ExcelAnalysisModal';
import TranslationPage from './components/TranslationPage';
import SimpleTranslationPage from './components/SimpleTranslationPage';
import SimpleBillingTool from './components/SimpleBillingTool';
import ActiveStylePreview from './components/ActiveStylePreview';
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
  const [customLimits, setCustomLimits] = useState([
    { label: 'Version 1', value: '90', type: 'characters' },
    { label: 'Version 2', value: '180', type: 'characters' },
    { label: 'Version 3', value: '700', type: 'characters' }
  ]);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentSection, setCurrentSection] = useState('billing'); // 'billing' or 'translation'
  const [simpleMode, setSimpleMode] = useState(true);
  const [simpleBillingMode, setSimpleBillingMode] = useState(true);
  const [activePreset, setActivePreset] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [hasCustomPresets, setHasCustomPresets] = useState(false);

  // Built-in style presets - only show Default by default
  const defaultStyle = { id: 'default', name: 'Default Style', description: 'Standard PA TV style guide formatting' };
  
  const additionalBuiltInStyles = [
    { id: 'drama', name: 'Drama', description: 'Dramatic storytelling style' },
    { id: 'soap', name: 'Soap', description: 'Soap opera style' },
    { id: 'quiz', name: 'Quiz', description: 'Quiz show style' },
    { id: 'sitcom', name: 'Sitcom', description: 'Situational comedy style' },
    { id: 'movie', name: 'Movie', description: 'Feature film style' },
    { id: 'documentary', name: 'Documentary', description: 'Documentary style' },
    { id: 'music', name: 'Music', description: 'Music program style' },
    { id: 'sport', name: 'Sport', description: 'Sports coverage style' }
  ];

  // Show additional styles only if custom presets exist
  const builtInStyles = hasCustomPresets 
    ? [defaultStyle, ...additionalBuiltInStyles]
    : [defaultStyle];

  // Check for custom presets on component mount and when user changes
  useEffect(() => {
    if (user) {
      try {
        const savedPresets = localStorage.getItem(`style_presets_${user.id}`);
        const presets = savedPresets ? JSON.parse(savedPresets) : [];
        setHasCustomPresets(presets.length > 0);
      } catch (error) {
        console.error('Error checking custom presets:', error);
        setHasCustomPresets(false);
      }
    }
  }, [user]);

  const saveToHistory = async (originalText, versions, limits, preset, style) => {
    try {
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        originalText,
        versions,
        limits,
        preset: preset?.name || null,
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

      // Build style rules based on active preset or defaults
      const styleRules = activePreset?.style_rules || {
        britishEnglish: true,
        noFullStops: true,
        includeDescriptors: true,
        avoidRepetition: true
      };

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

      if (forbiddenWords.length > 0) {
        styleInstructions.push(`9. NEVER use these forbidden words: ${forbiddenWords.join(', ')}`);
      }

      if (styleRules.customInstructions) {
        styleInstructions.push(`10. Additional instructions: ${styleRules.customInstructions}`);
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
        await saveToHistory(inputText, newVersions, customLimits, activePreset, selectedStyle);
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

  // Function to refresh custom presets check
  const refreshCustomPresets = () => {
    if (user) {
      try {
        const savedPresets = localStorage.getItem(`style_presets_${user.id}`);
        const presets = savedPresets ? JSON.parse(savedPresets) : [];
        setHasCustomPresets(presets.length > 0);
      } catch (error) {
        console.error('Error checking custom presets:', error);
        setHasCustomPresets(false);
      }
    }
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
    
    // Refresh the custom presets check in case this was the first preset created
    refreshCustomPresets();
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

    if (forbiddenWords.length > 0) {
      styleInstructions.push(`9. NEVER use these forbidden words: ${forbiddenWords.join(', ')}`);
    }

    if (styleRules.customInstructions) {
      styleInstructions.push(`10. Additional instructions: ${styleRules.customInstructions}`);
    }

    const limitsText = limitsToUse.map((limit, index) => 
      `- ${limit.label}: ABSOLUTE MAXIMUM ${limit.value} ${limit.type} including spaces and punctuation - NEVER EXCEED THIS LIMIT`
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
ABSOLUTELY CRITICAL: Each version must be STRICTLY under the specified character/word limit. COUNT EVERY CHARACTER INCLUDING SPACES AND PUNCTUATION. If a version would exceed the limit by even 1 character, make it shorter. NEVER EXCEED THE LIMITS UNDER ANY CIRCUMSTANCES.
If there is insufficient original content to meaningfully fill a longer version, leave it blank.

Respond with a JSON object in this exact format:
${JSON.stringify(resultFormat, null, 2)}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;

    const response = await generateContent(prompt, user.id);
    const parsedResponse = JSON.parse(response);
    
    // Map the response to our version keys and validate limits
    const newVersions = {};
    
    limitsToUse.forEach((limit, index) => {
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
    });
    
    return newVersions;
  };

  // Navigation header component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-light text-gray-900">
            Create Billings Pro
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentSection('translation')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              currentSection === 'translation' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>Translation</span>
          </button>
          {currentSection === 'translation' && (
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-xs ${
                simpleMode 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{simpleMode ? 'Switch to Advanced' : 'Switch to Simple'}</span>
            </button>
          )}
          <button
            onClick={() => setCurrentSection('billing')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              currentSection === 'billing' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Billing</span>
          </button>
          {currentSection === 'billing' && (
            <button
              onClick={() => setSimpleBillingMode(!simpleBillingMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-xs ${
                simpleBillingMode 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{simpleBillingMode ? 'Switch to Advanced' : 'Switch to Simple'}</span>
            </button>
          )}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
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
    if (currentSection === 'translation') {
      if (simpleMode) {
        return (
          <SimpleTranslationPage 
            user={user}
            generateContent={generateContent}
            onNavigateBack={() => setCurrentSection('billing')}
          />
        );
      } else {
        return (
          <TranslationPage 
            user={user}
            generateContent={generateContent}
            onNavigateBack={() => setCurrentSection('billing')}
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
              onClick={() => setShowBatchModal(true)}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              <Layers className="w-4 h-4" />
              <span>Batch Process</span>
            </button>
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Excel Analysis</span>
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
        
        <div className="mb-4">
          <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Style
          </label>
          <div className="relative">
            <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
            >
              {builtInStyles.map(style => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {selectedStyle && (
            <p className="text-xs text-gray-500 mt-1">
              {builtInStyles.find(s => s.id === selectedStyle)?.description}
            </p>
          )}
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

        <ActiveStylePreview 
          activePreset={activePreset}
          customLimits={customLimits}
          onOpenStyleSettings={() => setShowPresetsModal(true)}
        />

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
      {currentSection === 'billing' && <Header />}
      {currentSection === 'billing' ? (
        <main className="p-6">
          {renderContent()}
        </main>
      ) : (
        renderContent()
      )}
      
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
        onPresetsChange={refreshCustomPresets}
      />
      
      <BatchProcessingModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        customLimits={customLimits}
        activePreset={activePreset}
        onGenerate={generateBatchContent}
      />
      
      <ExcelAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        inputText={inputText}
        versions={versions}
        customLimits={customLimits}
        activePreset={activePreset}
      />
      
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        user={user}
      />
      
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
      />
      
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
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
