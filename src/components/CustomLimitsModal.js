import React, { useState } from 'react';
import { X, Plus, Trash2, Info } from 'lucide-react';

const CustomLimitsModal = ({ isOpen, onClose, onSave, initialLimits = [] }) => {
  const [limits, setLimits] = useState(
    initialLimits.length > 0 ? initialLimits : [{ label: '', value: '', type: 'characters' }]
  );

  const addLimit = () => {
    setLimits([...limits, { label: '', value: '', type: 'characters' }]);
  };

  const removeLimit = (index) => {
    if (limits.length > 1) {
      setLimits(limits.filter((_, i) => i !== index));
    }
  };

  const updateLimit = (index, field, value) => {
    const newLimits = [...limits];
    newLimits[index][field] = value;
    setLimits(newLimits);
  };

  const handleSave = () => {
    const validLimits = limits.filter(limit => 
      limit.label.trim() && limit.value && parseInt(limit.value) > 0
    );
    
    if (validLimits.length === 0) {
      alert('Please add at least one valid limit');
      return;
    }

    onSave(validLimits);
    onClose();
  };

  const presetLimits = [
    { label: 'Twitter', value: '280', type: 'characters' },
    { label: 'Instagram Caption', value: '2200', type: 'characters' },
    { label: 'LinkedIn Post', value: '3000', type: 'characters' },
    { label: 'Facebook Post', value: '63206', type: 'characters' },
    { label: 'SMS', value: '160', type: 'characters' },
    { label: 'Email Subject', value: '50', type: 'characters' },
    { label: 'Meta Description', value: '160', type: 'characters' },
    { label: 'YouTube Title', value: '100', type: 'characters' },
    { label: 'Headline Short', value: '30', type: 'words' },
    { label: 'Headline Medium', value: '60', type: 'words' },
    { label: 'Blog Excerpt', value: '150', type: 'words' }
  ];

  const addPreset = (preset) => {
    setLimits([...limits, { ...preset }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Custom Character Limits</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <div className="flex items-start space-x-2 mb-4">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Define custom character or word limits for different platforms and use cases. 
                The AI will generate versions within these constraints.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-900">Your Custom Limits</h3>
            {limits.map((limit, index) => (
              <div key={index} className="flex space-x-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={limit.label}
                    onChange={(e) => updateLimit(index, 'label', e.target.value)}
                    placeholder="e.g., Twitter, Email Subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Limit
                  </label>
                  <input
                    type="number"
                    value={limit.value}
                    onChange={(e) => updateLimit(index, 'value', e.target.value)}
                    placeholder="280"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={limit.type}
                    onChange={(e) => updateLimit(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="characters">Characters</option>
                    <option value="words">Words</option>
                  </select>
                </div>
                <button
                  onClick={() => removeLimit(index)}
                  disabled={limits.length === 1}
                  className="p-2 text-red-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addLimit}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Limit</span>
          </button>

          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Add Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {presetLimits.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => addPreset(preset)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{preset.label}</div>
                  <div className="text-xs text-gray-600">
                    {preset.value} {preset.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Limits
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomLimitsModal;