import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, FileText, AlertCircle } from 'lucide-react';

const TranslationTable = ({ 
  onDataChange, 
  initialData = [], 
  isProcessing = false,
  error = '' 
}) => {
  const [tableData, setTableData] = useState(
    initialData.length > 0 ? initialData : [
      { id: 'Programme 1', content: '' },
      { id: 'Programme 2', content: '' },
      { id: 'Programme 3', content: '' }
    ]
  );
  const [pasteDetected, setPasteDetected] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(tableData);
    }
  }, [tableData, onDataChange]);

  const handleCellChange = (index, field, value) => {
    const newData = [...tableData];
    newData[index][field] = value;
    setTableData(newData);
  };

  const addRow = () => {
    const newRow = {
      id: `Programme ${tableData.length + 1}`,
      content: ''
    };
    setTableData([...tableData, newRow]);
  };

  const removeRow = (index) => {
    if (tableData.length > 1) {
      const newData = tableData.filter((_, i) => i !== index);
      setTableData(newData);
    }
  };

  const clearAll = () => {
    setTableData([
      { id: 'Programme 1', content: '' },
      { id: 'Programme 2', content: '' },
      { id: 'Programme 3', content: '' }
    ]);
    setPasteDetected(false);
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it looks like tabular data (contains tabs or multiple lines)
    if (pastedText.includes('\t') || pastedText.includes('\n')) {
      e.preventDefault();
      setPasteDetected(true);
      
      // Parse the pasted content
      const lines = pastedText.split('\n').filter(line => line.trim());
      const parsedData = [];
      
      lines.forEach((line, index) => {
        const columns = line.split('\t');
        
        if (columns.length >= 2) {
          // Two columns: ID and Content
          parsedData.push({
            id: columns[0].trim() || `Programme ${index + 1}`,
            content: columns[1].trim()
          });
        } else if (columns.length === 1 && line.trim()) {
          // Single column: treat as content with auto-generated ID
          parsedData.push({
            id: `Programme ${index + 1}`,
            content: line.trim()
          });
        }
      });
      
      if (parsedData.length > 0) {
        setTableData(parsedData);
        
        // Show paste detection message briefly
        setTimeout(() => {
          setPasteDetected(false);
        }, 3000);
      }
    }
  };

  const getValidRowCount = () => {
    return tableData.filter(row => row.content.trim().length > 0).length;
  };

  const hasEmptyRows = () => {
    return tableData.some(row => row.content.trim().length === 0);
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">How to add content:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Type directly:</strong> Click in the cells below and type your content</p>
              <p>• <strong>Paste from Excel:</strong> Copy rows from Excel and paste here (Ctrl+V)</p>
              <p>• <strong>Paste from Word:</strong> Copy table rows from Word documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Paste Detection Message */}
      {pasteDetected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Copy className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Content pasted successfully! {getValidRowCount()} items ready for translation.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Programme ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content to Translate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.id}
                      onChange={(e) => handleCellChange(index, 'id', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Programme ID"
                      disabled={isProcessing}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      value={row.content}
                      onChange={(e) => handleCellChange(index, 'content', e.target.value)}
                      onPaste={handlePaste}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Paste or type content to translate..."
                      rows={2}
                      disabled={isProcessing}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeRow(index)}
                      disabled={tableData.length <= 1 || isProcessing}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={addRow}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row</span>
          </button>
          
          <button
            onClick={clearAll}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {getValidRowCount()} of {tableData.length} rows have content
          {hasEmptyRows() && (
            <span className="ml-2 text-orange-600">
              (Empty rows will be skipped)
            </span>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Copy and paste directly from Excel or Word tables</li>
          <li>• Each row should contain one programme or content item</li>
          <li>• Empty rows will be automatically skipped during translation</li>
          <li>• Use descriptive Programme IDs to easily identify your content</li>
        </ul>
      </div>
    </div>
  );
};

export default TranslationTable;