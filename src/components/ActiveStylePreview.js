import React, { useState } from 'react';
import { Info, Eye, EyeOff, Settings } from 'lucide-react';
import { generateStyleInstructions } from '../utils/style-instructions';

const ActiveStylePreview = ({ activePreset, customLimits, onOpenStyleSettings }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!activePreset) return null;

  const styleRules = activePreset.styleRules || activePreset.style_rules || {};
  const forbiddenWords = activePreset.forbiddenWords || activePreset.forbidden_words || [];
  const instructions = generateStyleInstructions(styleRules, forbiddenWords);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="text-blue-600" size={16} />
          <div>
            <span className="text-sm font-medium text-blue-800">
              Active Style: {activePreset.name}
            </span>
            <span className="text-xs text-blue-600 ml-2">
              ({instructions.length} rules active)
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showPreview ? 'Hide' : 'Show'} AI Instructions</span>
          </button>
          <button
            onClick={onOpenStyleSettings}
            className="text-blue-600 hover:text-blue-800"
            title="Edit style settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      
      {showPreview && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-sm text-blue-700 mb-2">
            <strong>AI Instructions for "{activePreset.name}":</strong>
          </div>
          <div className="space-y-1">
            {instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex items-start space-x-2 text-sm">
                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium min-w-fit">
                  {index + 1}
                </span>
                <span className="text-blue-700">{instruction.rule}</span>
              </div>
            ))}
          </div>
          
          {instructions.length === 0 && (
            <div className="text-sm text-blue-600 italic">
              No specific style rules - using default PA TV guidelines only
            </div>
          )}
          
          <div className="mt-2 text-xs text-blue-600">
            💡 <strong>Tip:</strong> Click "Style Presets" to modify these instructions or create new ones
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveStylePreview;