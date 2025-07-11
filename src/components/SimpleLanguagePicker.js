import React from 'react';
import { Languages } from 'lucide-react';

const SimpleLanguagePicker = ({ languagePair, onLanguagePairChange }) => {
  // Only the most common language pairs
  const commonPairs = [
    { value: 'welsh-english', label: 'Welsh → English', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿 → 🇬🇧' },
    { value: 'irish-english', label: 'Irish → English', flag: '🇮🇪 → 🇬🇧' },
    { value: 'english-welsh', label: 'English → Welsh', flag: '🇬🇧 → 🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { value: 'english-irish', label: 'English → Irish', flag: '🇬🇧 → 🇮🇪' },
    { value: 'french-english', label: 'French → English', flag: '🇫🇷 → 🇬🇧' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Languages className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Select Languages</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {commonPairs.map((pair) => (
          <button
            key={pair.value}
            onClick={() => onLanguagePairChange(pair.value)}
            className={`p-4 border rounded-lg text-left transition-colors ${
              languagePair === pair.value
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{pair.label}</div>
              </div>
              <div className="text-2xl">{pair.flag}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> These are the most commonly used language pairs. 
          The system will automatically detect the best translation approach for your content.
        </p>
      </div>
    </div>
  );
};

export default SimpleLanguagePicker;