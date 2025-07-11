import React, { useState, useRef } from 'react';
import { Download, FileText, Languages, Loader, CheckCircle, AlertCircle, Home, Upload, Edit3 } from 'lucide-react';
import { parseDocument, reconstructDocument } from '../utils/parseDocument';
import { identifyMultiLanguageSegments } from '../utils/languageDetection';
import { generateStyleAwarePrompt } from '../utils/styleGuide';
import TranslationTable from './TranslationTable';
import TranslationResults from './TranslationResults';

const SimpleTranslationPage = ({ user, generateContent, onNavigateBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [translatedContent, setTranslatedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [languagePair, setLanguagePair] = useState('welsh-english');
  const [inputMode, setInputMode] = useState('paste'); // 'paste' or 'upload'
  const [tableData, setTableData] = useState([]);
  const [translationResults, setTranslationResults] = useState([]);
  const fileInputRef = useRef(null);

  // Simple language pair options
  const languagePairs = [
    { value: 'welsh-english', label: 'Welsh to English', source: 'cy', target: 'en-gb' },
    { value: 'irish-english', label: 'Irish to English', source: 'ga', target: 'en-gb' },
    { value: 'english-welsh', label: 'English to Welsh', source: 'en-gb', target: 'cy' },
    { value: 'english-irish', label: 'English to Irish', source: 'en-gb', target: 'ga' },
    { value: 'french-english', label: 'French to English', source: 'fr', target: 'en-gb' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setTranslatedContent('');
      
      const allowedTypes = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select an Excel file (.xlsx or .xls)');
        setSelectedFile(null);
        return;
      }
    }
  };

  const translateContent = async () => {
    if (!user) return;
    
    // Validate input based on mode
    if (inputMode === 'upload' && !selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    if (inputMode === 'paste') {
      const validRows = tableData.filter(row => row.content.trim().length > 0);
      if (validRows.length === 0) {
        setError('Please add content to translate.');
        return;
      }
    }
    
    setIsProcessing(true);
    setError('');
    setTranslationResults([]);
    
    try {
      const pair = languagePairs.find(p => p.value === languagePair);
      
      if (inputMode === 'upload') {
        // File upload mode (existing logic)
        const parsedDocument = await parseDocument(selectedFile);
        const segments = identifyMultiLanguageSegments(parsedDocument.text, pair.target);
        
        if (segments.length === 0) {
          setError('No content found that needs translation.');
          setIsProcessing(false);
          return;
        }
        
        const translatedSegments = [];
        for (const segment of segments) {
          const translationPrompt = generateStyleAwarePrompt(
            segment.originalText,
            pair.source === 'cy' ? 'Welsh' : 
            pair.source === 'ga' ? 'Irish' : 
            pair.source === 'fr' ? 'French' : 'English',
            pair.target === 'cy' ? 'Welsh' : 
            pair.target === 'ga' ? 'Irish' : 'English',
            'bbc'
          );
          
          const translation = await generateContent(translationPrompt, user.id);
          translatedSegments.push({
            ...segment,
            translatedText: translation.trim()
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const finalTranslation = reconstructDocument(parsedDocument.text, translatedSegments);
        setTranslatedContent(finalTranslation);
        
      } else {
        // Paste mode (new logic)
        const validRows = tableData.filter(row => row.content.trim().length > 0);
        const results = [];
        
        for (const row of validRows) {
          try {
            const translationPrompt = generateStyleAwarePrompt(
              row.content,
              pair.source === 'cy' ? 'Welsh' : 
              pair.source === 'ga' ? 'Irish' : 
              pair.source === 'fr' ? 'French' : 'English',
              pair.target === 'cy' ? 'Welsh' : 
              pair.target === 'ga' ? 'Irish' : 'English',
              'bbc'
            );
            
            const translation = await generateContent(translationPrompt, user.id);
            results.push({
              id: row.id,
              originalText: row.content,
              translatedText: translation.trim()
            });
            
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error('Translation error for row:', row.id, error);
            results.push({
              id: row.id,
              originalText: row.content,
              translatedText: null
            });
          }
        }
        
        setTranslationResults(results);
      }
      
    } catch (error) {
      setError('Translation failed. Please try again.');
      console.error('Translation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTranslatedDocument = () => {
    if (!translatedContent || !selectedFile) return;
    
    const blob = new Blob([translatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_${selectedFile.name.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTranslatedContent('');
    setTranslationResults([]);
    setTableData([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTableDataChange = (newData) => {
    setTableData(newData);
  };

  const downloadResults = () => {
    if (inputMode === 'paste' && translationResults.length > 0) {
      const csvContent = translationResults
        .filter(result => result.translatedText)
        .map(result => `"${result.id}","${result.translatedText.replace(/"/g, '""')}"`)
        .join('\n');
      
      const blob = new Blob([`"Programme ID","Translation"\n${csvContent}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (inputMode === 'upload' && translatedContent) {
      downloadTranslatedDocument();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onNavigateBack}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <Home className="w-4 h-4" />
                <span>🏠 Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Languages className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-medium text-gray-900">Quick Translation</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Step 1: Choose Language */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium mr-3">1</div>
              <h2 className="text-lg font-medium text-gray-900">Choose Language Pair</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {languagePairs.map((pair) => (
                <button
                  key={pair.value}
                  onClick={() => setLanguagePair(pair.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    languagePair === pair.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{pair.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Add Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium mr-3">2</div>
              <h2 className="text-lg font-medium text-gray-900">Add Your Content</h2>
            </div>
            
            {/* Input Mode Toggle */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    inputMode === 'paste' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Paste Content</span>
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    inputMode === 'upload' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Paste Mode */}
            {inputMode === 'paste' && (
              <TranslationTable
                onDataChange={handleTableDataChange}
                isProcessing={isProcessing}
                error={error}
              />
            )}

            {/* Upload Mode */}
            {inputMode === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <div>
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Click to select your Excel file</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                      Choose File
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-4">{selectedFile.name}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Translate Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={translateContent}
                disabled={isProcessing}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Translating...
                  </span>
                ) : (
                  'Translate Now'
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <Loader className="w-6 h-6 text-blue-600 mr-4 animate-spin" />
                <div>
                  <p className="text-blue-900 font-medium">Translating your document...</p>
                  <p className="text-blue-700 text-sm">This usually takes 1-2 minutes</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {(translatedContent || translationResults.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-medium mr-3">3</div>
                <h2 className="text-lg font-medium text-gray-900">Your Translations</h2>
              </div>
              
              {inputMode === 'paste' && translationResults.length > 0 && (
                <TranslationResults
                  results={translationResults}
                  languagePair={languagePair}
                  onDownload={downloadResults}
                  onCopyAll={() => {
                    // Handle copy all callback if needed
                  }}
                />
              )}
              
              {inputMode === 'upload' && translatedContent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <p className="text-green-900 font-medium">Translation completed successfully!</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={downloadTranslatedDocument}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Translation</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                    >
                      Translate Another File
                    </button>
                  </div>
                </div>
              )}
              
              {/* Reset Button for Paste Mode */}
              {inputMode === 'paste' && translationResults.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                  >
                    Start New Translation
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default SimpleTranslationPage;