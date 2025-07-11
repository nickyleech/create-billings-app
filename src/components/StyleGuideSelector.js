import React, { useState } from 'react';
import { ChevronDown, BookOpen, Award, Info } from 'lucide-react';
import { getAllStyleGuides, getStyleGuideRecommendations } from '../utils/styleGuide';

const StyleGuideSelector = ({ 
  selectedStyleGuide, 
  onStyleGuideChange, 
  sourceLanguage, 
  targetLanguage,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const allStyleGuides = getAllStyleGuides();
  const recommendations = sourceLanguage && targetLanguage 
    ? getStyleGuideRecommendations(sourceLanguage, targetLanguage)
    : [];

  const selectedGuide = allStyleGuides.find(guide => guide.code === selectedStyleGuide);

  const handleStyleGuideSelect = (guideCode) => {
    onStyleGuideChange(guideCode);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Style Guide Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BookOpen className="w-4 h-4 inline mr-2" />
          Style Guide
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div>
            <div className="font-medium">
              {selectedGuide ? selectedGuide.name : 'Select Style Guide'}
            </div>
            {selectedGuide && (
              <div className="text-sm text-gray-500">
                {selectedGuide.description}
              </div>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {allStyleGuides.map((guide) => (
              <button
                key={guide.code}
                onClick={() => handleStyleGuideSelect(guide.code)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">{guide.name}</div>
                <div className="text-sm text-gray-500">{guide.description}</div>
                <div className="text-xs text-gray-400 mt-1">Region: {guide.region}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full text-left flex items-center justify-between"
          >
            <h4 className="text-sm font-medium text-blue-900 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Recommended Style Guides
            </h4>
            <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${showRecommendations ? 'rotate-180' : ''}`} />
          </button>
          
          {showRecommendations && (
            <div className="mt-3 space-y-2">
              {recommendations.map((rec, index) => {
                const guide = allStyleGuides.find(g => g.code === rec.styleGuide);
                return (
                  <button
                    key={index}
                    onClick={() => handleStyleGuideSelect(rec.styleGuide)}
                    className="w-full text-left p-3 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">{guide?.name}</div>
                        <div className="text-sm text-blue-700">{rec.reason}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-green-100 text-green-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.priority}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Style Guide Details */}
      {selectedGuide && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Style Guide Details
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Name:</span>
              <span className="text-sm text-gray-900 ml-2">{selectedGuide.name}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Region:</span>
              <span className="text-sm text-gray-900 ml-2">{selectedGuide.region}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Description:</span>
              <span className="text-sm text-gray-900 ml-2">{selectedGuide.description}</span>
            </div>
            
            {/* Style Rules */}
            <div>
              <span className="text-sm font-medium text-gray-700">Key Rules:</span>
              <div className="mt-2 space-y-1">
                {selectedGuide.rules.britishSpelling && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    British English spelling
                  </div>
                )}
                {selectedGuide.rules.irishSpelling && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Irish English spelling
                  </div>
                )}
                {selectedGuide.rules.noFullStops && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    No trailing full stops
                  </div>
                )}
                {selectedGuide.rules.bilingualSupport && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Bilingual support
                  </div>
                )}
                {selectedGuide.rules.culturalSensitivity && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Cultural sensitivity
                  </div>
                )}
                {selectedGuide.rules.commercialTone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Commercial broadcasting tone
                  </div>
                )}
                {selectedGuide.rules.timeFormat && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {selectedGuide.rules.timeFormat} time format
                  </div>
                )}
                {selectedGuide.rules.dateFormat && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {selectedGuide.rules.dateFormat} date format
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleGuideSelector;