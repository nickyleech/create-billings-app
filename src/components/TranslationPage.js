import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Languages, Loader, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseDocument, reconstructDocument } from '../utils/parseDocument';
import { identifyMultiLanguageSegments, detectLanguage, getConfidenceColor, getConfidenceDescription } from '../utils/languageDetection';
import { generateStyleAwarePrompt, validateTranslation, generateQualityReport } from '../utils/styleGuide';
import { getLanguageByCode } from '../utils/languageConfig';
import LanguagePicker from './LanguagePicker';
import DefaultStyleGuideCreator from './DefaultStyleGuideCreator';

const TranslationPage = ({ user, generateContent, onNavigateBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const [translationResults, setTranslationResults] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('cy'); // Default to Welsh
  const [targetLanguage, setTargetLanguage] = useState('en-gb'); // Default to British English
  const [selectedStyleGuide] = useState('bbc'); // Default to BBC style guide
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [showStyleGuideCreator, setShowStyleGuideCreator] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setOriginalContent('');
      setTranslatedContent('');
      setTranslationResults([]);
      
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a valid Excel file: XLSX or XLS');
        setSelectedFile(null);
        return;
      }
      
      // Read file content
      readFileContent(file);
    }
  };

  const readFileContent = async (file) => {
    try {
      const parsedDocument = await parseDocument(file);
      setOriginalContent(parsedDocument.text);
      
      // Detect language automatically
      const detection = detectLanguage(parsedDocument.text);
      setDetectedLanguage(detection);
      
      // Auto-set source language if detection is confident
      if (detection.confidence > 0.6) {
        setSourceLanguage(detection.language);
      }
    } catch (error) {
      setError(`Failed to parse file: ${error.message}`);
    }
  };

  const translateContent = async () => {
    if (!originalContent || !user || !sourceLanguage || !targetLanguage) return;
    
    setIsProcessing(true);
    setError('');
    setProcessingStep('Identifying content to translate...');
    
    try {
      // Identify segments that need translation
      const segments = identifyMultiLanguageSegments(originalContent, targetLanguage);
      
      if (segments.length === 0) {
        setError('No content requiring translation detected in the uploaded file.');
        setIsProcessing(false);
        return;
      }
      
      setProcessingStep(`Translating ${segments.length} segments...`);
      
      // Translate each segment
      const translatedSegments = [];
      const sourceLang = getLanguageByCode(sourceLanguage);
      const targetLang = getLanguageByCode(targetLanguage);
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        setProcessingStep(`Translating segment ${i + 1} of ${segments.length}...`);
        
        try {
          const translationPrompt = generateStyleAwarePrompt(
            segment.originalText,
            sourceLang?.name || sourceLanguage,
            targetLang?.name || targetLanguage,
            selectedStyleGuide
          );
          
          const translation = await generateContent(translationPrompt, user.id);
          const cleanTranslation = translation.trim();
          
          // Validate translation quality
          const validation = validateTranslation(cleanTranslation, selectedStyleGuide);
          
          translatedSegments.push({
            ...segment,
            translatedText: cleanTranslation,
            validation: validation,
            qualityScore: validation.score
          });
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (translationError) {
          console.error('Translation error for segment:', segment.originalText, translationError);
          translatedSegments.push({
            ...segment,
            translatedText: '[Translation failed]',
            validation: { valid: false, errors: ['Translation failed'], score: 0 }
          });
        }
      }
      
      setTranslationResults(translatedSegments);
      
      // Create translated document using utility function
      const translatedDocument = reconstructDocument(originalContent, translatedSegments);
      
      setTranslatedContent(translatedDocument);
      
      // Generate quality report
      const qualityReport = generateQualityReport(originalContent, translatedDocument, selectedStyleGuide);
      setQualityReport(qualityReport);
      
      setProcessingStep('Translation complete!');
      
    } catch (error) {
      console.error('Translation process failed:', error);
      setError('Translation failed. Please try again.');
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
    setOriginalContent('');
    setTranslatedContent('');
    setTranslationResults([]);
    setError('');
    setProcessingStep('');
    setDetectedLanguage(null);
    setQualityReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    try {
      // Create generic template data for translation
      const templateData = [
        {
          'Programme ID': 'PROG_001',
          'Description': 'Sample content for translation - replace with your content'
        },
        {
          'Programme ID': 'PROG_002',
          'Description': 'Another sample entry for translation purposes'
        },
        {
          'Programme ID': 'PROG_003',
          'Description': 'Third sample content entry for translation'
        }
      ];

      // Check if XLSX is available
      if (!XLSX || !XLSX.utils) {
        throw new Error('XLSX library not loaded properly');
      }

      console.log('Creating translation template...');
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // Programme ID
        { wch: 80 }  // Description
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Translation Template');
      
      const filename = 'translation-template.xlsx';
      console.log('Downloading translation template:', filename);
      
      XLSX.writeFile(workbook, filename);
      console.log('Translation template download completed successfully');
    } catch (error) {
      console.error('Error downloading translation template:', error);
      alert(`Error downloading template: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onNavigateBack}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Languages className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-medium text-gray-900">Translation Tool</h1>
                  <p className="text-sm text-gray-500">Professional translation workflow for all language pairs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* File Upload Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-green-600" />
                Upload Document for Translation
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload Excel schedules or documents containing content for translation
              </p>
            </div>
            
            <div className="p-6">
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
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2 text-lg">
                      Click to select a document or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Supported formats: XLSX, XLS
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                      >
                        Choose File
                      </button>
                      <button
                        onClick={downloadTemplate}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                      >
                        Download Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <FileText className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2 text-lg">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                      >
                        Change File
                      </button>
                      <button
                        onClick={translateContent}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          'Start Translation'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Translation Template Format
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  Use the downloaded template as a reference for the correct format when uploading documents for translation. 
                  This template demonstrates the expected structure for content that requires translation.
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> The template shows the format that the system can identify and translate automatically between language pairs.
                </p>
              </div>
            </div>
          </section>

          {/* Language Settings and Style Guide */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Language Settings */}
            {(originalContent || !selectedFile) && (
              <div className="xl:col-span-2">
                <section className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <Languages className="w-5 h-5 mr-2 text-blue-600" />
                      Language Settings
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure source and target languages for translation
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <LanguagePicker
                      sourceLanguage={sourceLanguage}
                      targetLanguage={targetLanguage}
                      onSourceLanguageChange={setSourceLanguage}
                      onTargetLanguageChange={setTargetLanguage}
                    />
                  </div>
                </section>
              </div>
            )}

            {/* Style Guide Manager */}
            <div className="xl:col-span-1">
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Style Guide Manager</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Create and manage translation rules
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Create comprehensive style guides with language pairs, training samples, and translation rules.
                    </p>
                    <button
                      onClick={() => setShowStyleGuideCreator(true)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                    >
                      Open Style Guide Manager
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Language Detection Results */}
          {detectedLanguage && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Language Detection Results
                </h2>
              </div>
              
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Detected Language: {getLanguageByCode(detectedLanguage.language)?.name || detectedLanguage.language}
                      </p>
                      <p className="text-sm text-green-700">
                        Confidence: {getConfidenceDescription(detectedLanguage.confidence)} ({Math.round(detectedLanguage.confidence * 100)}%)
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded text-sm font-medium ${getConfidenceColor(detectedLanguage.confidence)}`}>
                      {Math.round(detectedLanguage.confidence * 100)}%
                    </div>
                  </div>
                  
                  {detectedLanguage.candidates && detectedLanguage.candidates.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm font-medium text-green-900 mb-2">Other Candidates:</p>
                      <div className="space-y-1">
                        {detectedLanguage.candidates.slice(1).map((candidate, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-green-700">
                              {candidate.languageInfo?.name || candidate.language}
                            </span>
                            <span className="text-green-600">
                              {Math.round(candidate.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <Loader className="w-6 h-6 text-blue-600 mr-4 animate-spin" />
                    <div>
                      <p className="text-blue-900 font-medium text-lg">Processing Translation</p>
                      <p className="text-blue-700">{processingStep}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Error Display */}
          {error && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <p className="text-red-900">{error}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Translation Results */}
          {translationResults.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-purple-600" />
                  Translation Results
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {translationResults.map((result, index) => (
                  <div key={result.id} className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-900">
                        Translation #{index + 1}
                      </h3>
                      {result.validation && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.validation.score >= 80 ? 'bg-green-100 text-green-800' :
                          result.validation.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Quality: {result.validation.score}%
                        </span>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          Original ({getLanguageByCode(sourceLanguage)?.name || sourceLanguage})
                        </h4>
                        <div className="text-sm text-gray-700 bg-white p-4 rounded border min-h-[100px] leading-relaxed">
                          {result.originalText}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Translation ({getLanguageByCode(targetLanguage)?.name || targetLanguage})
                        </h4>
                        <div className="text-sm text-gray-700 bg-white p-4 rounded border min-h-[100px] leading-relaxed">
                          {result.translatedText}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quality Report */}
          {qualityReport && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Quality Report
                </h2>
              </div>
              
              <div className="p-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-orange-900 mb-3">Style Guide Compliance</h3>
                      <div className="space-y-2 text-sm text-orange-800">
                        <p><strong>Guide:</strong> {qualityReport.styleGuide.name}</p>
                        <p><strong>Overall Score:</strong> {qualityReport.validation.score}/100</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                          qualityReport.validation.score >= 80 ? 'bg-green-100 text-green-800' :
                          qualityReport.validation.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {qualityReport.validation.score >= 80 ? 'Excellent' :
                           qualityReport.validation.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-orange-900 mb-3">Translation Metrics</h3>
                      <div className="space-y-2 text-sm text-orange-800">
                        <p><strong>Word Count:</strong> {qualityReport.metrics.wordCount}</p>
                        <p><strong>Length Ratio:</strong> {qualityReport.metrics.lengthRatio.toFixed(2)}</p>
                        <p><strong>Readability:</strong> {qualityReport.metrics.readabilityScore}/100</p>
                      </div>
                    </div>
                  </div>
                  
                  {qualityReport.validation.errors.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-orange-200">
                      <h3 className="font-medium text-orange-900 mb-3">Issues Found:</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                        {qualityReport.validation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {qualityReport.validation.suggestions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-orange-200">
                      <h3 className="font-medium text-orange-900 mb-3">Suggestions:</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                        {qualityReport.validation.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Download Section */}
          {translatedContent && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  Download Translated Document
                </h2>
              </div>
              
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-green-900 mb-4 text-lg">
                    Translation complete! Your document has been translated from {getLanguageByCode(sourceLanguage)?.name || sourceLanguage} to {getLanguageByCode(targetLanguage)?.name || targetLanguage}.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={downloadTranslatedDocument}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Translated Document</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Translation powered by AI • Professional workflow for all language pairs
            </div>
            <button
              onClick={onNavigateBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </footer>
      
      {/* Style Guide Creator Modal */}
      <DefaultStyleGuideCreator 
        isOpen={showStyleGuideCreator}
        onClose={() => setShowStyleGuideCreator(false)}
      />
    </div>
  );
};

export default TranslationPage;