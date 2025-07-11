import React, { useState } from 'react';
import { ChevronDown, Search, Globe, Star } from 'lucide-react';
import { getSourceLanguages, getTargetLanguages, POPULAR_LANGUAGE_PAIRS } from '../utils/languageConfig';

const LanguagePicker = ({ 
  sourceLanguage, 
  targetLanguage, 
  onSourceLanguageChange, 
  onTargetLanguageChange,
  showPopularPairs = true,
  className = ''
}) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');

  const sourceLanguages = getSourceLanguages();
  const targetLanguages = getTargetLanguages();

  // Filter languages based on search
  const filteredSourceLanguages = sourceLanguages.filter(lang =>
    lang.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredTargetLanguages = targetLanguages.filter(lang =>
    lang.name.toLowerCase().includes(targetSearch.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(targetSearch.toLowerCase())
  );

  const handlePopularPairSelect = (pair) => {
    onSourceLanguageChange(pair.source);
    onTargetLanguageChange(pair.target);
  };

  const getLanguageDisplay = (langCode) => {
    const lang = sourceLanguages.find(l => l.code === langCode) || 
                 targetLanguages.find(l => l.code === langCode);
    return lang ? `${lang.flag} ${lang.name}` : 'Select language';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Popular Language Pairs */}
      {showPopularPairs && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Popular Language Pairs
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {POPULAR_LANGUAGE_PAIRS.map((pair, index) => (
              <button
                key={index}
                onClick={() => handlePopularPairSelect(pair)}
                className="text-left p-2 text-sm bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                {pair.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Language Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Language */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Source Language
          </label>
          <button
            onClick={() => setSourceOpen(!sourceOpen)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{getLanguageDisplay(sourceLanguage)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${sourceOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {sourceOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredSourceLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSourceLanguageChange(lang.code);
                      setSourceOpen(false);
                      setSourceSearch('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-sm text-gray-500">{lang.nativeName}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Target Language */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Target Language
          </label>
          <button
            onClick={() => setTargetOpen(!targetOpen)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{getLanguageDisplay(targetLanguage)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${targetOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {targetOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredTargetLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onTargetLanguageChange(lang.code);
                      setTargetOpen(false);
                      setTargetSearch('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-sm text-gray-500">{lang.nativeName}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Languages Display */}
      {sourceLanguage && targetLanguage && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Translation Pair</h4>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl mb-1">
                {sourceLanguages.find(l => l.code === sourceLanguage)?.flag}
              </div>
              <div className="text-sm font-medium">
                {sourceLanguages.find(l => l.code === sourceLanguage)?.name}
              </div>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <div className="text-2xl mb-1">
                {targetLanguages.find(l => l.code === targetLanguage)?.flag}
              </div>
              <div className="text-sm font-medium">
                {targetLanguages.find(l => l.code === targetLanguage)?.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguagePicker;