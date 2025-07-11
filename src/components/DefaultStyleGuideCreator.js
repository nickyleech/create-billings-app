import React, { useState } from 'react';
import { X, Download, Eye, BookOpen, Save, Plus, Trash2, Edit3, ChevronUp, ChevronDown, Languages } from 'lucide-react';

const DefaultStyleGuideCreator = ({ isOpen, onClose }) => {
  const [styleGuide, setStyleGuide] = useState({
    name: 'Default Style Guide',
    description: 'A universal style guide for all language pairs',
    version: '1.0',
    language: 'British English',
    rules: {
      spelling: 'British English',
      punctuation: 'Oxford comma optional',
      capitalization: 'Sentence case for titles',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24-hour',
      numberFormat: 'European (1.234,56)',
      quotationMarks: 'Single quotes primary',
      abbreviations: 'Spell out on first use',
      tone: 'Professional and neutral',
      formality: 'Formal',
      inclusivity: 'Use inclusive language',
      culturalSensitivity: 'Adapt content for target culture'
    },
    guidelines: {
      consistency: 'Maintain consistent terminology throughout',
      clarity: 'Prefer clear, concise language',
      accuracy: 'Ensure factual accuracy in translations',
      localization: 'Adapt cultural references appropriately',
      brandVoice: 'Maintain original brand voice where possible'
    },
    examples: [
      {
        category: 'Spelling',
        original: 'color, organization, realize',
        corrected: 'colour, organisation, realise'
      },
      {
        category: 'Date Format',
        original: '12/25/2023',
        corrected: '25/12/2023'
      },
      {
        category: 'Time Format',
        original: '3:30 PM',
        corrected: '15:30'
      }
    ],
    languagePairSamples: [
      {
        id: 'sample-1',
        sourceLanguage: 'Welsh',
        targetLanguage: 'British English',
        category: 'News Content',
        sourceText: 'Mae\'r rhaglen newyddion yn dechrau am saith o\'r gloch.',
        targetText: 'The news programme begins at seven o\'clock.',
        notes: 'Note the use of "programme" (British spelling) and formal tone'
      },
      {
        id: 'sample-2',
        sourceLanguage: 'Welsh',
        targetLanguage: 'British English',
        category: 'Cultural Content',
        sourceText: 'Eisteddfod Genedlaethol Cymru',
        targetText: 'National Eisteddfod of Wales',
        notes: 'Keep proper nouns like "Eisteddfod" untranslated as culturally significant'
      }
    ],
    languagePairs: [
      {
        id: 'pair-1',
        sourceLanguage: 'Welsh',
        targetLanguage: 'British English',
        description: 'Welsh to British English translation'
      },
      {
        id: 'pair-2',
        sourceLanguage: 'French',
        targetLanguage: 'British English',
        description: 'French to British English translation'
      },
      {
        id: 'pair-3',
        sourceLanguage: 'Spanish',
        targetLanguage: 'British English',
        description: 'Spanish to British English translation'
      }
    ]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [newSample, setNewSample] = useState({
    sourceLanguage: '',
    targetLanguage: '',
    category: '',
    sourceText: '',
    targetText: '',
    notes: ''
  });
  const [newLanguagePair, setNewLanguagePair] = useState({
    sourceLanguage: '',
    targetLanguage: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (section, field, value) => {
    setStyleGuide(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBasicChange = (field, value) => {
    setStyleGuide(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSample = () => {
    if (!newSample.sourceLanguage || !newSample.targetLanguage || !newSample.sourceText || !newSample.targetText) {
      alert('Please fill in all required fields (Source Language, Target Language, Source Text, Target Text)');
      return;
    }
    
    const sample = {
      ...newSample,
      id: 'sample-' + Date.now()
    };
    
    setStyleGuide(prev => ({
      ...prev,
      languagePairSamples: [...prev.languagePairSamples, sample]
    }));
    
    setNewSample({
      sourceLanguage: '',
      targetLanguage: '',
      category: '',
      sourceText: '',
      targetText: '',
      notes: ''
    });
  };

  const editSample = (sample) => {
    setEditingSample(sample);
    setNewSample({ ...sample });
  };

  const updateSample = () => {
    if (!newSample.sourceLanguage || !newSample.targetLanguage || !newSample.sourceText || !newSample.targetText) {
      alert('Please fill in all required fields (Source Language, Target Language, Source Text, Target Text)');
      return;
    }
    
    setStyleGuide(prev => ({
      ...prev,
      languagePairSamples: prev.languagePairSamples.map(sample =>
        sample.id === editingSample.id ? newSample : sample
      )
    }));
    
    setEditingSample(null);
    setNewSample({
      sourceLanguage: '',
      targetLanguage: '',
      category: '',
      sourceText: '',
      targetText: '',
      notes: ''
    });
  };

  const deleteSample = (sampleId) => {
    if (window.confirm('Are you sure you want to delete this sample?')) {
      setStyleGuide(prev => ({
        ...prev,
        languagePairSamples: prev.languagePairSamples.filter(sample => sample.id !== sampleId)
      }));
    }
  };

  const cancelEdit = () => {
    setEditingSample(null);
    setNewSample({
      sourceLanguage: '',
      targetLanguage: '',
      category: '',
      sourceText: '',
      targetText: '',
      notes: ''
    });
  };

  const addLanguagePair = () => {
    if (!newLanguagePair.sourceLanguage || !newLanguagePair.targetLanguage) {
      alert('Please fill in both source and target languages');
      return;
    }
    
    // Check if pair already exists
    const exists = styleGuide.languagePairs.some(pair => 
      pair.sourceLanguage.toLowerCase() === newLanguagePair.sourceLanguage.toLowerCase() &&
      pair.targetLanguage.toLowerCase() === newLanguagePair.targetLanguage.toLowerCase()
    );
    
    if (exists) {
      alert('This language pair already exists');
      return;
    }
    
    const pair = {
      ...newLanguagePair,
      id: 'pair-' + Date.now(),
      description: newLanguagePair.description || `${newLanguagePair.sourceLanguage} to ${newLanguagePair.targetLanguage} translation`
    };
    
    setStyleGuide(prev => ({
      ...prev,
      languagePairs: [...prev.languagePairs, pair]
    }));
    
    setNewLanguagePair({
      sourceLanguage: '',
      targetLanguage: '',
      description: ''
    });
  };

  const removeLanguagePair = (pairId) => {
    if (window.confirm('Are you sure you want to remove this language pair? This will also remove all associated samples.')) {
      // Remove the language pair
      setStyleGuide(prev => ({
        ...prev,
        languagePairs: prev.languagePairs.filter(pair => pair.id !== pairId),
        // Also remove samples that use this language pair
        languagePairSamples: prev.languagePairSamples.filter(sample => {
          const pair = prev.languagePairs.find(p => p.id === pairId);
          return !(pair && sample.sourceLanguage === pair.sourceLanguage && sample.targetLanguage === pair.targetLanguage);
        })
      }));
    }
  };

  const moveLanguagePair = (pairId, direction) => {
    const currentIndex = styleGuide.languagePairs.findIndex(pair => pair.id === pairId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= styleGuide.languagePairs.length) return;
    
    const newPairs = [...styleGuide.languagePairs];
    const [movedPair] = newPairs.splice(currentIndex, 1);
    newPairs.splice(newIndex, 0, movedPair);
    
    setStyleGuide(prev => ({
      ...prev,
      languagePairs: newPairs
    }));
  };

  const downloadStyleGuide = () => {
    const styleGuideData = {
      ...styleGuide,
      createdAt: new Date().toISOString(),
      id: 'default-style-guide-' + Date.now()
    };

    const blob = new Blob([JSON.stringify(styleGuideData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${styleGuide.name.toLowerCase().replace(/\s+/g, '-')}-style-guide.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadStyleGuideText = () => {
    const textContent = `
# ${styleGuide.name}

**Version:** ${styleGuide.version}
**Language:** ${styleGuide.language}
**Description:** ${styleGuide.description}

## Rules

${Object.entries(styleGuide.rules).map(([key, value]) => 
  `- **${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
).join('\n')}

## Guidelines

${Object.entries(styleGuide.guidelines).map(([key, value]) => 
  `- **${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
).join('\n')}

## Examples

${styleGuide.examples.map(example => 
  `### ${example.category}
- Original: ${example.original}
- Corrected: ${example.corrected}`
).join('\n\n')}

## Configured Language Pairs

${styleGuide.languagePairs.length > 0 ? styleGuide.languagePairs.map((pair, index) => 
  `${index + 1}. ${pair.sourceLanguage} → ${pair.targetLanguage}${pair.description ? ` - ${pair.description}` : ''}`
).join('\n') : 'No language pairs configured yet.'}

## Language Pair Training Samples

${styleGuide.languagePairSamples.length > 0 ? styleGuide.languagePairSamples.map(sample => 
  `### ${sample.sourceLanguage} → ${sample.targetLanguage}${sample.category ? ` (${sample.category})` : ''}
**Source:** ${sample.sourceText}
**Target:** ${sample.targetText}${sample.notes ? `\n**Notes:** ${sample.notes}` : ''}`
).join('\n\n') : 'No language pair samples added yet.'}

---
Generated on: ${new Date().toLocaleDateString('en-GB')}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${styleGuide.name.toLowerCase().replace(/\s+/g, '-')}-style-guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Create Default Style Guide
            </h2>
            <p className="text-sm text-gray-500">Create a universal style guide for all language pairs</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style Guide Name
                    </label>
                    <input
                      type="text"
                      value={styleGuide.name}
                      onChange={(e) => handleBasicChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={styleGuide.version}
                      onChange={(e) => handleBasicChange('version', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Language
                    </label>
                    <input
                      type="text"
                      value={styleGuide.language}
                      onChange={(e) => handleBasicChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={styleGuide.description}
                      onChange={(e) => handleBasicChange('description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </section>

              {/* Style Rules */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Style Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(styleGuide.rules).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange('rules', key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Guidelines */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Translation Guidelines</h3>
                <div className="space-y-4">
                  {Object.entries(styleGuide.guidelines).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                      <textarea
                        value={value}
                        onChange={(e) => handleInputChange('guidelines', key, e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Language Pairs Management */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Language Pairs Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage the language pairs that will be available for translation samples. You can add custom pairs, reorder them, and remove pairs as needed.
                </p>
                
                {/* Add New Language Pair */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-green-900 mb-3">Add New Language Pair</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source Language *
                      </label>
                      <input
                        type="text"
                        value={newLanguagePair.sourceLanguage}
                        onChange={(e) => setNewLanguagePair(prev => ({ ...prev, sourceLanguage: e.target.value }))}
                        placeholder="e.g., German, Italian, Portuguese"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Language *
                      </label>
                      <input
                        type="text"
                        value={newLanguagePair.targetLanguage}
                        onChange={(e) => setNewLanguagePair(prev => ({ ...prev, targetLanguage: e.target.value }))}
                        placeholder="e.g., British English, American English"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newLanguagePair.description}
                      onChange={(e) => setNewLanguagePair(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description for this language pair"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <button
                    onClick={addLanguagePair}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Language Pair</span>
                  </button>
                </div>
                
                {/* Existing Language Pairs */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Configured Language Pairs</h4>
                  {styleGuide.languagePairs.map((pair, index) => (
                    <div key={pair.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Languages className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {pair.sourceLanguage} → {pair.targetLanguage}
                          </p>
                          <p className="text-sm text-gray-600">{pair.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveLanguagePair(pair.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveLanguagePair(pair.id, 'down')}
                          disabled={index === styleGuide.languagePairs.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeLanguagePair(pair.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Remove language pair"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {styleGuide.languagePairs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No language pairs configured yet.</p>
                      <p className="text-sm">Add language pairs above to start creating translation samples.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Language Pair Samples */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Language Pair Training Samples</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add sample translations for specific language pairs to help train the AI and ensure consistent quality.
                </p>
                
                {/* Sample Form */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-3">
                    {editingSample ? 'Edit Sample' : 'Add New Sample'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language Pair *
                      </label>
                      <select
                        value={newSample.sourceLanguage && newSample.targetLanguage ? `${newSample.sourceLanguage}|${newSample.targetLanguage}` : ''}
                        onChange={(e) => {
                          const [sourceLanguage, targetLanguage] = e.target.value.split('|');
                          setNewSample(prev => ({ ...prev, sourceLanguage, targetLanguage }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a language pair</option>
                        {styleGuide.languagePairs.map((pair) => (
                          <option key={pair.id} value={`${pair.sourceLanguage}|${pair.targetLanguage}`}>
                            {pair.sourceLanguage} → {pair.targetLanguage}
                          </option>
                        ))}
                      </select>
                      {styleGuide.languagePairs.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          Please add language pairs in the Language Pairs Management section first.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Languages
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newSample.sourceLanguage}
                          onChange={(e) => setNewSample(prev => ({ ...prev, sourceLanguage: e.target.value }))}
                          placeholder="Source language"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={newSample.targetLanguage}
                          onChange={(e) => setNewSample(prev => ({ ...prev, targetLanguage: e.target.value }))}
                          placeholder="Target language"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Use custom languages if your desired pair isn't in the dropdown above.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={newSample.category}
                        onChange={(e) => setNewSample(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., News Content, Cultural Content, Technical Terms"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source Text *
                      </label>
                      <textarea
                        value={newSample.sourceText}
                        onChange={(e) => setNewSample(prev => ({ ...prev, sourceText: e.target.value }))}
                        placeholder="Original text in source language"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Text *
                      </label>
                      <textarea
                        value={newSample.targetText}
                        onChange={(e) => setNewSample(prev => ({ ...prev, targetText: e.target.value }))}
                        placeholder="Correct translation in target language"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translation Notes
                    </label>
                    <textarea
                      value={newSample.notes}
                      onChange={(e) => setNewSample(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notes about the translation approach, cultural considerations, etc."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    {editingSample ? (
                      <>
                        <button
                          onClick={updateSample}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                          <Save className="w-4 h-4" />
                          <span>Update Sample</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={addSample}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Sample</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Existing Samples */}
                <div className="space-y-3">
                  {styleGuide.languagePairSamples.map((sample) => (
                    <div key={sample.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {sample.sourceLanguage} → {sample.targetLanguage}
                          </h5>
                          {sample.category && (
                            <p className="text-sm text-gray-600">{sample.category}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editSample(sample)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSample(sample.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Source:</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {sample.sourceText}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Target:</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {sample.targetText}
                          </p>
                        </div>
                      </div>
                      
                      {sample.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{sample.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {styleGuide.languagePairSamples.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No language pair samples added yet.</p>
                      <p className="text-sm">Add samples above to help train the AI for specific language pairs.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Style Guide Preview</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Basic Information</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p><strong>Name:</strong> {styleGuide.name}</p>
                      <p><strong>Version:</strong> {styleGuide.version}</p>
                      <p><strong>Language:</strong> {styleGuide.language}</p>
                      <p><strong>Description:</strong> {styleGuide.description}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Style Rules</h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                      {Object.entries(styleGuide.rules).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {value}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Translation Guidelines</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      {Object.entries(styleGuide.guidelines).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {value}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Examples</h4>
                    <div className="mt-2 space-y-2 text-sm text-gray-700">
                      {styleGuide.examples.map((example, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <p className="font-medium">{example.category}</p>
                          <p className="text-red-600">Original: {example.original}</p>
                          <p className="text-green-600">Corrected: {example.corrected}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Configured Language Pairs</h4>
                    <div className="mt-2 space-y-2 text-sm text-gray-700">
                      {styleGuide.languagePairs.map((pair, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div className="flex items-center space-x-2">
                            <Languages className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">
                              {pair.sourceLanguage} → {pair.targetLanguage}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs">#{index + 1}</span>
                        </div>
                      ))}
                      {styleGuide.languagePairs.length === 0 && (
                        <p className="text-gray-500 italic">No language pairs configured yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Language Pair Training Samples</h4>
                    <div className="mt-2 space-y-3 text-sm text-gray-700">
                      {styleGuide.languagePairSamples.map((sample, index) => (
                        <div key={index} className="bg-white p-4 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-blue-900">
                              {sample.sourceLanguage} → {sample.targetLanguage}
                            </p>
                            {sample.category && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {sample.category}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <p className="font-medium text-gray-700">Source:</p>
                              <p className="text-gray-900 bg-gray-50 p-2 rounded">{sample.sourceText}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Target:</p>
                              <p className="text-gray-900 bg-gray-50 p-2 rounded">{sample.targetText}</p>
                            </div>
                          </div>
                          {sample.notes && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="font-medium text-gray-700">Notes:</p>
                              <p className="text-gray-600">{sample.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {styleGuide.languagePairSamples.length === 0 && (
                        <p className="text-gray-500 italic">No language pair samples added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadStyleGuideText}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download TXT</span>
              </button>
              <button
                onClick={downloadStyleGuide}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultStyleGuideCreator;