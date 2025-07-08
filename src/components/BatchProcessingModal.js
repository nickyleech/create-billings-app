import React, { useState } from 'react';
import { X, Download, FileText, Trash2, Copy, Check, Loader, FileSpreadsheet, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const BatchProcessingModal = ({ isOpen, onClose, customLimits, activePreset, onGenerate }) => {
  const [copyItems, setCopyItems] = useState([{ id: 1, title: '', content: '', versions: {} }]);
  const [processing, setProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);
  const [copiedStates, setCopiedStates] = useState({});

  const addCopyItem = () => {
    const newId = Math.max(...copyItems.map(item => item.id)) + 1;
    setCopyItems([...copyItems, { id: newId, title: '', content: '', versions: {} }]);
  };

  const removeCopyItem = (id) => {
    if (copyItems.length > 1) {
      setCopyItems(copyItems.filter(item => item.id !== id));
    }
  };

  const updateCopyItem = (id, field, value) => {
    setCopyItems(copyItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      importFromExcel(file);
    } else if (fileExtension === 'docx') {
      importFromWord(file);
    } else {
      alert('Please select an Excel file (.xlsx, .xls) or Word document (.docx)');
    }

    // Reset file input
    event.target.value = '';
  };

  const importFromExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process Excel data - assume first column is title, second is content
        const newItems = jsonData
          .filter(row => row.length > 0 && row[0]) // Filter out empty rows
          .map((row, index) => ({
            id: Date.now() + index,
            title: row[0]?.toString().trim() || `Item ${index + 1}`,
            content: row[1]?.toString().trim() || row[0]?.toString().trim() || '',
            versions: {}
          }))
          .filter(item => item.content); // Only include items with content

        if (newItems.length > 0) {
          setCopyItems(newItems);
          alert(`Successfully imported ${newItems.length} items from Excel file`);
        } else {
          alert('No valid content found in Excel file. Make sure your data is in the first two columns.');
        }
      } catch (error) {
        console.error('Error importing Excel file:', error);
        alert('Error reading Excel file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const importFromWord = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        // Extract text content and split by paragraphs
        const textContent = result.value
          .replace(/<[^>]*>/g, '\n') // Replace HTML tags with newlines
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0); // Remove empty lines

        const newItems = textContent.map((content, index) => ({
          id: Date.now() + index,
          title: `Item ${index + 1}`,
          content: content,
          versions: {}
        }));

        if (newItems.length > 0) {
          setCopyItems(newItems);
          alert(`Successfully imported ${newItems.length} items from Word document`);
        } else {
          alert('No content found in Word document.');
        }
      } catch (error) {
        console.error('Error importing Word file:', error);
        alert('Error reading Word document. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processAllItems = async () => {
    setProcessing(true);
    const processedItems = [...copyItems];

    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];
      if (!item.content.trim()) continue;

      setCurrentItem(i);

      try {
        const versions = await onGenerate(item.content, customLimits, activePreset);
        processedItems[i] = { ...item, versions };
      } catch (error) {
        console.error(`Error processing item ${i + 1}:`, error);
        // Create error versions
        const errorVersions = {};
        customLimits.forEach((_, index) => {
          errorVersions[`version${index + 1}`] = 'Error generating content';
        });
        processedItems[i] = { ...item, versions: errorVersions };
      }

      // Small delay to prevent API rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setCopyItems(processedItems);
    setProcessing(false);
    setCurrentItem(0);
  };

  const copyToClipboard = async (text, itemId, versionKey) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = `${itemId}-${versionKey}`;
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const exportResults = () => {
    const results = copyItems.map(item => {
      const row = {
        Title: item.title,
        'Original Content': item.content
      };
      
      customLimits.forEach((limit, index) => {
        const versionKey = `version${index + 1}`;
        row[limit.label] = item.versions[versionKey] || '';
      });
      
      return row;
    });

    const csvContent = convertToCSV(results);
    downloadCSV(csvContent, 'batch_copy_results.csv');
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const countContent = (text, type) => {
    if (type === 'words') {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return text.length;
  };

  const hasResults = copyItems.some(item => Object.keys(item.versions).length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Batch Processing</h2>
            <p className="text-sm text-gray-600">Process multiple copy pieces at once</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              <button
                onClick={addCopyItem}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
              <label className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
              <label className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Import Word</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex space-x-3">
              {hasResults && (
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              )}
              <button
                onClick={processAllItems}
                disabled={processing || copyItems.every(item => !item.content.trim())}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing... ({currentItem + 1}/{copyItems.length})</span>
                  </>
                ) : (
                  <>
                    <span>Process All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing Status */}
          {processing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-blue-800 font-medium">
                    Processing item {currentItem + 1} of {copyItems.length}
                  </p>
                  <p className="text-blue-600 text-sm">
                    {copyItems[currentItem]?.title || `Item ${currentItem + 1}`}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentItem + 1) / copyItems.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Copy Items */}
          <div className="space-y-6">
            {copyItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                  <button
                    onClick={() => removeCopyItem(item.id)}
                    disabled={copyItems.length === 1}
                    className="p-1 text-red-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateCopyItem(item.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Optional title"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={item.content}
                      onChange={(e) => updateCopyItem(item.id, 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      rows="3"
                      placeholder="Enter your copy here..."
                    />
                  </div>
                </div>

                {/* Results */}
                {Object.keys(item.versions).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Generated Versions</h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {customLimits.map((limit, limitIndex) => {
                        const versionKey = `version${limitIndex + 1}`;
                        const content = item.versions[versionKey] || '';
                        const count = countContent(content, limit.type);
                        const maxCount = parseInt(limit.value);
                        const isOverLimit = count > maxCount;
                        const copyKey = `${item.id}-${versionKey}`;

                        return (
                          <div key={versionKey} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{limit.label}</h5>
                              <span className="text-xs text-gray-500">
                                ≤{limit.value} {limit.type === 'words' ? 'words' : 'chars'}
                              </span>
                            </div>
                            
                            <div className="relative">
                              <div className="text-sm text-gray-700 bg-white p-2 rounded border min-h-16">
                                {content || 'No content generated'}
                              </div>
                              {content && (
                                <button
                                  onClick={() => copyToClipboard(content, item.id, versionKey)}
                                  className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Copy to clipboard"
                                >
                                  {copiedStates[copyKey] ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                            
                            <div className="mt-2 text-right">
                              <span className={`text-xs ${
                                isOverLimit ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                {count}/{maxCount} {limit.type === 'words' ? 'words' : 'chars'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessingModal;