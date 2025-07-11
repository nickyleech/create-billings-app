import React, { useState } from 'react';
import { Copy, Check, Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const TranslationResults = ({ 
  results = [], 
  languagePair = '', 
  onDownload = null,
  onCopyAll = null 
}) => {
  const [copiedStates, setCopiedStates] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyAllTranslations = async () => {
    try {
      const allTranslations = results
        .filter(result => result.translatedText)
        .map(result => `${result.id}\t${result.translatedText}`)
        .join('\n');
      
      await navigator.clipboard.writeText(allTranslations);
      if (onCopyAll) {
        onCopyAll();
      }
    } catch (err) {
      console.error('Failed to copy all translations: ', err);
    }
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getLanguagePairDisplay = () => {
    const pairs = {
      'welsh-english': 'Welsh → English',
      'irish-english': 'Irish → English',
      'english-welsh': 'English → Welsh',
      'english-irish': 'English → Irish',
      'french-english': 'French → English'
    };
    return pairs[languagePair] || languagePair;
  };

  if (results.length === 0) {
    return null;
  }

  const successfulTranslations = results.filter(result => result.translatedText);
  const failedTranslations = results.filter(result => !result.translatedText);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-green-900">Translation Complete</h3>
            <p className="text-sm text-green-700">
              {successfulTranslations.length} of {results.length} items translated successfully
              {languagePair && ` (${getLanguagePairDisplay()})`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {successfulTranslations.length > 0 && (
              <button
                onClick={copyAllTranslations}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                <span>Copy All</span>
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Programme ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Translation
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900">{result.id}</div>
                      {result.originalText && (
                        <button
                          onClick={() => toggleRowExpansion(index)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          title="Show original text"
                        >
                          {expandedRows[index] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {expandedRows[index] && result.originalText && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <div className="font-medium text-gray-700 mb-1">Original:</div>
                        {result.originalText}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {result.translatedText ? (
                      <div className="text-sm text-gray-900 leading-relaxed">
                        {result.translatedText}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 italic">
                        Translation failed
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {result.translatedText && (
                      <button
                        onClick={() => copyToClipboard(result.translatedText, result.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy translation"
                      >
                        {copiedStates[result.id] ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successfulTranslations.length}</div>
            <div className="text-gray-600">Successful</div>
          </div>
          {failedTranslations.length > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTranslations.length}</div>
              <div className="text-gray-600">Failed</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-gray-600">Total Items</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Next steps:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Copy Individual:</strong> Click the copy button next to each translation</p>
              <p>• <strong>Copy All:</strong> Use "Copy All" to get all translations as tab-separated values</p>
              <p>• <strong>Paste to Excel:</strong> Paste copied results directly into Excel or Word</p>
              <p>• <strong>Download:</strong> Get results as a file for sharing or archiving</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationResults;