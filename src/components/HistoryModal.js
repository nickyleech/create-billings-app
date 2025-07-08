import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Trash2, Archive, Calendar, User, Type } from 'lucide-react';

const HistoryModal = ({ isOpen, onClose, user }) => {
  const [history, setHistory] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = JSON.parse(localStorage.getItem('billingHistory') || '[]');
        const userHistory = savedHistory.filter(item => item.userId === user.id);
        setHistory(userHistory);
      } catch (error) {
        console.error('Error loading history:', error);
        setHistory([]);
      }
    };
    
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);


  const copyToClipboard = async (text, itemId, version) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = `${itemId}_${version}`;
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const deleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this history item?')) {
      try {
        const savedHistory = JSON.parse(localStorage.getItem('billingHistory') || '[]');
        const updatedHistory = savedHistory.filter(item => item.id !== itemId);
        localStorage.setItem('billingHistory', JSON.stringify(updatedHistory));
        // Refresh history
        const userHistory = updatedHistory.filter(item => item.userId === user.id);
        setHistory(userHistory);
        if (selectedItem?.id === itemId) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      try {
        const savedHistory = JSON.parse(localStorage.getItem('billingHistory') || '[]');
        const otherUsersHistory = savedHistory.filter(item => item.userId !== user.id);
        localStorage.setItem('billingHistory', JSON.stringify(otherUsersHistory));
        setHistory([]);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const countContent = (text, type) => {
    if (type === 'words') {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return text.length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Generation History</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{history.length} items</span>
            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <Archive className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* History List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Calendar className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No history yet</p>
                <p className="text-sm text-center px-4">Generated content will appear here</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItem?.id === item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.originalText.substring(0, 80)}
                        {item.originalText.length > 80 && '...'}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {item.style && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.style}
                          </span>
                        )}
                        {item.preset && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {item.preset}
                          </span>
                        )}
                        <span>{Object.keys(item.versions).length} versions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail View */}
          <div className="flex-1 overflow-y-auto">
            {selectedItem ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated Content</h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(selectedItem.timestamp)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Original Copy</h4>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedItem.originalText}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    {selectedItem.style && (
                      <div className="flex items-center space-x-1">
                        <Type className="w-4 h-4" />
                        <span>Style: {selectedItem.style}</span>
                      </div>
                    )}
                    {selectedItem.preset && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Preset: {selectedItem.preset}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {selectedItem.limits.map((limit, index) => {
                    const key = `version${index + 1}`;
                    const content = selectedItem.versions[key] || '';
                    const count = countContent(content, limit.type);
                    const maxCount = parseInt(limit.value);
                    const isOverLimit = count > maxCount;
                    const copyKey = `${selectedItem.id}_${key}`;
                    
                    return (
                      <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-900">{limit.label}</h4>
                          <span className="text-xs text-gray-500">
                            ≤{limit.value} {limit.type === 'words' ? 'words' : 'chars'}
                          </span>
                        </div>
                        
                        <div className="relative">
                          <div className="min-h-20 p-3 bg-gray-50 rounded-md text-sm text-gray-900 whitespace-pre-wrap">
                            {content || `${limit.label} was empty`}
                          </div>
                          {content && (
                            <button
                              onClick={() => copyToClipboard(content, selectedItem.id, key)}
                              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedStates[copyKey] ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {content && (
                          <div className="mt-2 text-right">
                            <span className={`text-xs ${
                              isOverLimit ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {count}/{maxCount} {limit.type === 'words' ? 'words' : 'chars'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mb-4 text-gray-400 mx-auto" />
                  <p className="text-lg font-medium">Select a history item</p>
                  <p className="text-sm">Click on an item from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;