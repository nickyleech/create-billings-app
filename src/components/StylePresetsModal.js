import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, BookOpen, Upload, Download, FileText } from 'lucide-react';
import { useAuth } from './AuthProvider';
import mammoth from 'mammoth';

const StylePresetsModal = ({ isOpen, onClose, onApplyPreset, onPresetsChange }) => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [uploadingStyleGuide, setUploadingStyleGuide] = useState(false);
  const [styleGuideContent, setStyleGuideContent] = useState('');
  const [showStyleGuidePreview, setShowStyleGuidePreview] = useState(false);
  const { user } = useAuth();

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
    forbiddenWords: []
  });

  useEffect(() => {
    const fetchPresets = async () => {
      setLoading(true);
      try {
        const savedPresets = JSON.parse(localStorage.getItem(`style_presets_${user.id}`) || '[]');
        
        // Add default style if it doesn't exist
        const hasDefaultStyle = savedPresets.some(preset => preset.id === 'default');
        if (!hasDefaultStyle) {
          const defaultStyle = {
            id: 'default',
            name: 'Default Style',
            description: 'Standard PA TV style guide formatting',
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
            forbiddenWords: [],
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: true
          };
          savedPresets.unshift(defaultStyle);
          localStorage.setItem(`style_presets_${user.id}`, JSON.stringify(savedPresets));
        }
        
        setPresets(savedPresets);
      } catch (error) {
        console.error('Error fetching presets:', error);
        setPresets([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && user) {
      fetchPresets();
    }
  }, [isOpen, user]);


  const handleSavePreset = async () => {
    try {
      const savedPresets = JSON.parse(localStorage.getItem(`style_presets_${user.id}`) || '[]');
      
      if (editingPreset) {
        // Update existing preset
        const updatedPresets = savedPresets.map(preset => 
          preset.id === editingPreset.id 
            ? { ...formData, id: editingPreset.id, userId: user.id, updatedAt: new Date().toISOString() }
            : preset
        );
        localStorage.setItem(`style_presets_${user.id}`, JSON.stringify(updatedPresets));
      } else {
        // Create new preset
        const newPreset = {
          ...formData,
          id: Date.now().toString(),
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        savedPresets.push(newPreset);
        localStorage.setItem(`style_presets_${user.id}`, JSON.stringify(savedPresets));
      }
      
      // Refresh presets by calling the effect again
      const refreshedPresets = JSON.parse(localStorage.getItem(`style_presets_${user.id}`) || '[]');
      setPresets(refreshedPresets);
      resetForm();
      
      // Notify parent component that presets have changed
      if (onPresetsChange) {
        onPresetsChange();
      }
    } catch (error) {
      alert('Error saving preset: ' + error.message);
    }
  };

  const handleDeletePreset = async (presetId) => {
    // Prevent deletion of default style
    const preset = presets.find(p => p.id === presetId);
    if (preset?.isDefault) {
      alert('Cannot delete the default style preset.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this style preset?')) {
      return;
    }

    try {
      const savedPresets = JSON.parse(localStorage.getItem(`style_presets_${user.id}`) || '[]');
      const updatedPresets = savedPresets.filter(preset => preset.id !== presetId);
      localStorage.setItem(`style_presets_${user.id}`, JSON.stringify(updatedPresets));
      // Refresh presets
      setPresets(updatedPresets);
      
      // Notify parent component that presets have changed
      if (onPresetsChange) {
        onPresetsChange();
      }
    } catch (error) {
      alert('Error deleting preset: ' + error.message);
    }
  };

  const handleExportPresets = () => {
    try {
      const exportData = {
        version: '1.0',
        exported: new Date().toISOString(),
        presets: presets.filter(preset => !preset.isDefault) // Don't export default style
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `style-presets-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting presets: ' + error.message);
    }
  };

  const handleImportPresets = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.presets || !Array.isArray(importData.presets)) {
          throw new Error('Invalid file format');
        }

        const currentPresets = JSON.parse(localStorage.getItem(`style_presets_${user.id}`) || '[]');
        const newPresets = [...currentPresets];

        let importedCount = 0;
        importData.presets.forEach(importedPreset => {
          // Generate new ID and update metadata
          const preset = {
            ...importedPreset,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            userId: user.id,
            importedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          newPresets.push(preset);
          importedCount++;
        });

        localStorage.setItem(`style_presets_${user.id}`, JSON.stringify(newPresets));
        setPresets(newPresets);
        alert(`Successfully imported ${importedCount} style preset(s)`);
        
        // Notify parent component that presets have changed
        if (onPresetsChange) {
          onPresetsChange();
        }
      } catch (error) {
        alert('Error importing presets: ' + error.message);
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleStyleGuideUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Please upload a Word document (.docx file)');
      return;
    }

    setUploadingStyleGuide(true);
    
    try {
      // Convert Word document to HTML
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      // Extract text content and parse style rules
      const textContent = result.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      setStyleGuideContent(textContent);
      setShowStyleGuidePreview(true);
      
      // Try to extract style rules automatically
      const extractedRules = extractStyleRules(textContent);
      
      if (extractedRules) {
        const confirmed = window.confirm(
          `Style guide uploaded successfully!\n\nFound ${Object.keys(extractedRules).length} style rules.\nWould you like to update the default style preset with these rules?`
        );
        
        if (confirmed) {
          await updateDefaultStyleWithGuide(extractedRules);
        }
      }
      
    } catch (error) {
      console.error('Error processing Word document:', error);
      alert('Error processing Word document: ' + error.message);
    } finally {
      setUploadingStyleGuide(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const extractStyleRules = (content) => {
    const rules = {};
    const lowerContent = content.toLowerCase();
    
    // Look for common style guide patterns
    if (lowerContent.includes('british english') || lowerContent.includes('british spelling')) {
      rules.britishEnglish = true;
    }
    
    if (lowerContent.includes('no full stop') || lowerContent.includes('no period') || lowerContent.includes('avoid full stops')) {
      rules.noFullStops = true;
    }
    
    if (lowerContent.includes('include descriptor') || lowerContent.includes('use descriptor')) {
      rules.includeDescriptors = true;
    }
    
    if (lowerContent.includes('avoid repetition') || lowerContent.includes('no repetition')) {
      rules.avoidRepetition = true;
    }
    
    // Extract forbidden words if there's a section about them
    const forbiddenWordsMatch = content.match(/(?:forbidden|banned|avoid|prohibited)[\s\w]*words?[\s:]*([^.]+)/i);
    if (forbiddenWordsMatch) {
      const words = forbiddenWordsMatch[1].split(/[,;]/).map(w => w.trim()).filter(w => w.length > 0);
      if (words.length > 0) {
        rules.forbiddenWords = words;
      }
    }
    
    return Object.keys(rules).length > 0 ? rules : null;
  };

  const updateDefaultStyleWithGuide = async (extractedRules) => {
    try {
      const currentPresets = JSON.parse(localStorage.getItem(`style_presets_${user.id}`) || '[]');
      const updatedPresets = currentPresets.map(preset => {
        if (preset.id === 'default') {
          return {
            ...preset,
            styleRules: {
              ...preset.styleRules,
              ...extractedRules,
              customInstructions: preset.styleRules.customInstructions + 
                (preset.styleRules.customInstructions ? '\n' : '') + 
                'Updated from PA Style Guide: ' + new Date().toLocaleDateString()
            },
            forbiddenWords: [
              ...(preset.forbiddenWords || []),
              ...(extractedRules.forbiddenWords || [])
            ],
            updatedAt: new Date().toISOString()
          };
        }
        return preset;
      });
      
      localStorage.setItem(`style_presets_${user.id}`, JSON.stringify(updatedPresets));
      setPresets(updatedPresets);
      alert('Default style preset updated with new PA Style Guide rules!');
    } catch (error) {
      console.error('Error updating default style:', error);
      alert('Error updating default style: ' + error.message);
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
      forbiddenWords: preset.forbidden_words || []
    });
    setEditingPreset(preset);
    setShowCreateForm(true);
  };

  const addForbiddenWord = () => {
    const word = prompt('Add forbidden word:');
    if (word) {
      setFormData(prev => ({
        ...prev,
        forbiddenWords: [...prev.forbiddenWords, word.trim()]
      }));
    }
  };

  const removeForbiddenWord = (index) => {
    setFormData(prev => ({
      ...prev,
      forbiddenWords: prev.forbiddenWords.filter((_, i) => i !== index)
    }));
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
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportPresets}
                    className="hidden"
                  />
                  <span className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                  </span>
                </label>
                <button
                  onClick={handleExportPresets}
                  disabled={presets.filter(p => !p.isDefault).length === 0}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 disabled:text-gray-400 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-yellow-800">PA Style Guide Update</h4>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                Upload the latest PA TV Style Guide Word document to automatically update style rules
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleStyleGuideUpload}
                  className="hidden"
                  disabled={uploadingStyleGuide}
                />
                <span className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  uploadingStyleGuide 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}>
                  <FileText className="w-4 h-4" />
                  <span>{uploadingStyleGuide ? 'Processing...' : 'Upload Style Guide (.docx)'}</span>
                </span>
              </label>
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
                    className={`p-3 border rounded-md hover:bg-gray-50 ${
                      preset.isDefault ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm">{preset.name}</h4>
                        {preset.isDefault && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {!preset.isDefault && (
                          <>
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
                          </>
                        )}
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
                      className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-blue-100 ${
                        preset.isDefault ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-700'
                      }`}
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
                      Programme Genre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Drama"
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
                      placeholder="e.g., Dramatic storytelling for television"
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

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Forbidden Words
                    </label>
                    <button
                      onClick={addForbiddenWord}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md min-h-20">
                    {formData.forbiddenWords.length === 0 ? (
                      <p className="text-gray-500 text-sm">No forbidden words added</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.forbiddenWords.map((word, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                          >
                            {word}
                            <button
                              onClick={() => removeForbiddenWord(index)}
                              className="ml-1 text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Words that should never appear in generated content
                  </p>
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

      {/* Style Guide Preview Modal */}
      {showStyleGuidePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">PA Style Guide Preview</h2>
              <button
                onClick={() => setShowStyleGuidePreview(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Extracted Content</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is the content extracted from your PA Style Guide document. 
                  The system will automatically identify style rules and update the default preset.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                  {styleGuideContent}
                </pre>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStyleGuidePreview(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePresetsModal;