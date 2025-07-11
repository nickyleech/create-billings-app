import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, Languages, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseDocument, identifyWelshSegments, generateTranslationPrompt, reconstructDocument } from '../utils/parseDocument';

const TranslationModal = ({ isOpen, onClose, user, generateContent }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const [translationResults, setTranslationResults] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

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
    } catch (error) {
      setError(`Failed to parse file: ${error.message}`);
    }
  };

  const translateToEnglish = async () => {
    if (!originalContent || !user) return;
    
    setIsProcessing(true);
    setError('');
    setProcessingStep('Identifying Welsh content...');
    
    try {
      // Identify Welsh segments
      const welshSegments = identifyWelshSegments(originalContent);
      
      if (welshSegments.length === 0) {
        setError('No Welsh content detected in the uploaded file.');
        setIsProcessing(false);
        return;
      }
      
      setProcessingStep(`Translating ${welshSegments.length} Welsh segments...`);
      
      // Translate each Welsh segment
      const translatedSegments = [];
      
      for (let i = 0; i < welshSegments.length; i++) {
        const segment = welshSegments[i];
        setProcessingStep(`Translating segment ${i + 1} of ${welshSegments.length}...`);
        
        try {
          const translationPrompt = generateTranslationPrompt(segment.originalText);
          const translation = await generateContent(translationPrompt, user.id);
          
          translatedSegments.push({
            ...segment,
            translatedText: translation.trim()
          });
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (translationError) {
          console.error('Translation error for segment:', segment.originalText, translationError);
          translatedSegments.push({
            ...segment,
            translatedText: '[Translation failed]'
          });
        }
      }
      
      setTranslationResults(translatedSegments);
      
      // Create translated document using utility function
      const translatedDocument = reconstructDocument(originalContent, translatedSegments);
      
      setTranslatedContent(translatedDocument);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    try {
      // Create simplified template data with only Programme ID and Description Welsh
      const templateData = [
        {
          'Programme ID': 'PROG_001',
          'Description Welsh': 'Rhaglen newyddion ddyddiol sy\'n cyflwyno\'r digwyddiadau diweddaraf o Gymru a\'r byd.'
        },
        {
          'Programme ID': 'PROG_002',
          'Description Welsh': 'Rhaglen am fywyd cefn gwlad Cymru, yn cynnwys ffermio, natur, a thraddodiadau lleol.'
        },
        {
          'Programme ID': 'PROG_003',
          'Description Welsh': 'Opera sebon Gymraeg am fywyd pobl mewn pentref dychmygol yng Nghymru.'
        }
      ];

      // Check if XLSX is available
      if (!XLSX || !XLSX.utils) {
        throw new Error('XLSX library not loaded properly');
      }

      console.log('Creating Welsh translation template...');
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // Programme ID
        { wch: 80 }  // Description Welsh
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Welsh Translation Template');
      
      const filename = 'welsh-translation-template.xlsx';
      console.log('Downloading Welsh translation template:', filename);
      
      XLSX.writeFile(workbook, filename);
      console.log('Welsh translation template download completed successfully');
    } catch (error) {
      console.error('Error downloading Welsh translation template:', error);
      alert(`Error downloading template: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-gray-900 flex items-center">
              <Languages className="w-5 h-5 mr-2 text-blue-600" />
              Welsh to English Translation
            </h2>
            <p className="text-sm text-gray-500">Upload Excel schedules or documents containing Welsh text for translation to British English</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            
            {/* File Upload Section */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-green-600" />
                Upload Excel Schedule
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                    <p className="text-gray-600 mb-2">
                      Click to select an Excel schedule or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supported formats: XLSX, XLS
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        Choose File
                      </button>
                      <button
                        onClick={downloadTemplate}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Download Template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                      >
                        Change File
                      </button>
                      <button
                        onClick={translateToEnglish}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          'Translate'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Welsh Template Format
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  Use the "Excel Welsh Template.xlsx" file as a reference for the correct format when uploading Welsh schedules. 
                  This template demonstrates the expected structure for Welsh content that requires translation to British English.
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> The template shows the format with Welsh information that the system can identify and translate automatically.
                </p>
              </div>
            </section>

            {/* Processing Status */}
            {isProcessing && (
              <section>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Loader className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
                    <div>
                      <p className="text-blue-900 font-medium">Processing Translation</p>
                      <p className="text-blue-700 text-sm">{processingStep}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Error Display */}
            {error && (
              <section>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900">{error}</p>
                </div>
              </section>
            )}

            {/* Translation Results */}
            {translationResults.length > 0 && (
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-purple-600" />
                  Translation Results
                </h3>
                
                <div className="space-y-4">
                  {translationResults.map((result, index) => (
                    <div key={result.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Welsh (Original)</h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {result.originalText}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">English (Translation)</h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {result.translatedText}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Download Section */}
            {translatedContent && (
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  Download Translated Document
                </h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-900 mb-3">
                    Translation complete! Your document has been translated from Welsh to British English.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadTranslatedDocument}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Translated Document</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Translation powered by AI • Optimized for British English
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;