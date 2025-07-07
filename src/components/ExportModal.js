import React, { useState } from 'react';
import { X, Download, FileText, Check } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, inputText, versions, customLimits, activePreset }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exported, setExported] = useState(false);

  const exportFormats = [
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      description: 'For Excel, Google Sheets, or database import',
      icon: FileText,
      extension: '.csv'
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'For APIs and technical integrations',
      icon: FileText,
      extension: '.json'
    }
  ];

  const generateExportData = () => {
    const data = {
      original_text: inputText,
      generated_at: new Date().toISOString(),
      character_limits: customLimits,
      style_preset: activePreset?.name || null,
      versions: {}
    };

    customLimits.forEach((limit, index) => {
      const key = `version${index + 1}`;
      data.versions[limit.label] = {
        content: versions[key] || '',
        limit: `${limit.value} ${limit.type}`,
        actual_count: countContent(versions[key] || '', limit.type)
      };
    });

    return data;
  };

  const countContent = (text, type) => {
    if (type === 'words') {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return text.length;
  };

  const exportCSV = () => {
    const data = generateExportData();
    
    const headers = ['Original Text'];
    customLimits.forEach(limit => {
      headers.push(limit.label);
      if (includeMetadata) {
        headers.push(`${limit.label} Count`);
        headers.push(`${limit.label} Limit`);
      }
    });
    
    if (includeMetadata) {
      headers.push('Style Preset', 'Generated At');
    }

    const row = [data.original_text];
    customLimits.forEach(limit => {
      const versionData = data.versions[limit.label];
      row.push(versionData.content);
      if (includeMetadata) {
        row.push(versionData.actual_count);
        row.push(versionData.limit);
      }
    });
    
    if (includeMetadata) {
      row.push(data.style_preset || 'Default');
      row.push(new Date(data.generated_at).toLocaleString());
    }

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    downloadFile(csvContent, 'copy_versions.csv', 'text/csv');
  };

  const exportJSON = () => {
    const data = generateExportData();
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'copy_versions.json', 'application/json');
  };


  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportCSV();
        break;
      case 'json':
        exportJSON();
        break;
      default:
        exportCSV();
    }
  };

  const hasContent = inputText.trim() && Object.keys(versions).some(key => versions[key]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Export Copy Variations</h2>
            <p className="text-sm text-gray-600">Download your generated content in various formats</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!hasContent ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content to Export</h3>
              <p className="text-gray-600">Generate some copy variations first, then come back to export them.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Export Format</h3>
                <div className="grid gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <label
                        key={format.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          exportFormat === format.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.id}
                          checked={exportFormat === format.id}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="sr-only"
                        />
                        <Icon className={`w-5 h-5 mr-3 ${
                          exportFormat === format.id ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{format.name}</span>
                            <span className="text-xs text-gray-500">{format.extension}</span>
                          </div>
                          <p className="text-sm text-gray-600">{format.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Include metadata (timestamps, limits, counts)</span>
                </label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Original:</strong> {inputText.slice(0, 100)}{inputText.length > 100 ? '...' : ''}</p>
                  <p><strong>Versions:</strong> {customLimits.length} variations will be exported</p>
                  {activePreset && <p><strong>Style:</strong> {activePreset.name}</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {hasContent && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {exported ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;