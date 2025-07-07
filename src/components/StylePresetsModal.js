import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://create-billings.vercel.app' 
  : 'http://localhost:3001';

const StylePresetsModal = ({ isOpen, onClose, onApplyPreset }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    characterLimits: [
      { label: 'Short', value: '90', type: 'characters' },
      { label: 'Medium', value: '180', type: 'characters' },
      { label: 'Long', value: '700', type: 'characters' }
    ],
    styleRules: {
      tone: 'professional',
      britishEnglish: true,
      noFullStops: true,
      includeDescriptors: true,
      avoidRepetition: true,
      customInstructions: ''
    },
    brandKeywords: [],
    forbiddenWords: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchPresets();
    }
  }, [isOpen]);

  const fetchPresets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/style-presets?action=list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets || []);
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    try {
      const url = editingPreset 
        ? `${API_BASE_URL}/api/style-presets?action=update&id=${editingPreset.id}`
        : `${API_BASE_URL}/api/style-presets?action=create`;
      
      const method = editingPreset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPresets();
        resetForm();
      } else {
        throw new Error('Failed to save preset');
      }
    } catch (error) {
      alert('Error saving preset: ' + error.message);
    }
  };

  const handleDeletePreset = async (presetId) => {
    if (!window.confirm('Are you sure you want to delete this style preset?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/style-presets?action=delete&id=${presetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchPresets();
      } else {
        throw new Error('Failed to delete preset');
      }
    } catch (error) {
      alert('Error deleting preset: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      characterLimits: [
        { label: 'Short', value: '90', type: 'characters' },
        { label: 'Medium', value: '180', type: 'characters' },
        { label: 'Long', value: '700', type: 'characters' }
      ],
      styleRules: {
        tone: 'professional',
        britishEnglish: true,
        noFullStops: true,
        includeDescriptors: true,
        avoidRepetition: true,
        customInstructions: ''
      },
      brandKeywords: [],
      forbiddenWords: []
    });
    setShowCreateForm(false);
    setEditingPreset(null);
  };

  const handleEditPreset = (preset) => {
    setFormData({
      name: preset.name,
      description: preset.description || '',
      characterLimits: preset.character_limits || [],
      styleRules: preset.style_rules || {},
      brandKeywords: preset.brand_keywords || [],
      forbiddenWords: preset.forbidden_words || []
    });
    setEditingPreset(preset);
    setShowCreateForm(true);
  };

  const addKeyword = (type) => {
    const keyword = prompt(`Add ${type === 'brand' ? 'brand keyword' : 'forbidden word'}:`);
    if (keyword) {
      if (type === 'brand') {
        setFormData(prev => ({
          ...prev,
          brandKeywords: [...prev.brandKeywords, keyword.trim()]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          forbiddenWords: [...prev.forbiddenWords, keyword.trim()]
        }));
      }
    }
  };

  const removeKeyword = (type, index) => {
    if (type === 'brand') {
      setFormData(prev => ({
        ...prev,
        brandKeywords: prev.brandKeywords.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        forbiddenWords: prev.forbiddenWords.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Style Presets</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Presets List */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Your Presets</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No presets yet</p>
                <p className="text-gray-500 text-xs">Create your first style preset</p>
              </div>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{preset.name}</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditPreset(preset)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {preset.description && (
                      <p className="text-xs text-gray-600 mb-2">{preset.description}</p>
                    )}
                    <button
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                      className="w-full text-left text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                    >
                      Apply Preset
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create/Edit Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            {showCreateForm ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingPreset ? 'Edit Preset' : 'Create New Preset'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preset Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., BBC News Style"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of this style"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style Rules
                  </label>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.styleRules.britishEnglish}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styleRules: { ...prev.styleRules, britishEnglish: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">British English spelling</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.styleRules.noFullStops}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styleRules: { ...prev.styleRules, noFullStops: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">No trailing full stops</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.styleRules.includeDescriptors}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styleRules: { ...prev.styleRules, includeDescriptors: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Include descriptors</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.styleRules.avoidRepetition}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styleRules: { ...prev.styleRules, avoidRepetition: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Avoid repetition</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Instructions
                      </label>
                      <textarea
                        value={formData.styleRules.customInstructions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          styleRules: { ...prev.styleRules, customInstructions: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Additional style guidelines and instructions..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Brand Keywords
                      </label>
                      <button
                        onClick={() => addKeyword('brand')}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md min-h-20">
                      {formData.brandKeywords.length === 0 ? (
                        <p className="text-gray-500 text-sm">No keywords added</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.brandKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {keyword}
                              <button
                                onClick={() => removeKeyword('brand', index)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Forbidden Words
                      </label>
                      <button
                        onClick={() => addKeyword('forbidden')}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md min-h-20">
                      {formData.forbiddenWords.length === 0 ? (
                        <p className="text-gray-500 text-sm">No forbidden words</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.forbiddenWords.map((word, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                            >
                              {word}
                              <button
                                onClick={() => removeKeyword('forbidden', index)}
                                className="ml-1 text-red-600 hover:text-red-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreset}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingPreset ? 'Update' : 'Create'} Preset</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Style Presets</h3>
                  <p className="text-gray-600 mb-4">Create custom style presets for different brands and clients</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create Your First Preset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylePresetsModal;