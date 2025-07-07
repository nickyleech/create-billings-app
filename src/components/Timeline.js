import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, Monitor, Tag, Folder, User, Calendar } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://create-billings.vercel.app' 
  : 'http://localhost:3001';

const Timeline = () => {
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timeline`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      setTimelineItems(data.items || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getOrganizationIcon = (organizationType) => {
    switch (organizationType) {
      case 'channel':
        return <Monitor className="w-3 h-3 text-blue-500" />;
      case 'genre':
        return <Tag className="w-3 h-3 text-purple-500" />;
      default:
        return <Folder className="w-3 h-3 text-gray-500" />;
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchTimeline}
          className="mt-2 text-red-700 hover:text-red-900 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">Public Timeline</h2>
        <p className="text-gray-600">See what content creators are working on</p>
      </div>

      {timelineItems.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
          <p className="text-gray-600">Be the first to create some content variations!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timelineItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {item.user_name || 'Anonymous'}
                    </span>
                  </div>
                  
                  {item.project_name && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center space-x-1">
                        {getOrganizationIcon(item.organization_type)}
                        <span className="text-sm text-gray-600">{item.project_name}</span>
                      </div>
                    </>
                  )}

                  {item.organization_value && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {item.organization_value}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>

              {/* Original Text */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Original Content:</h4>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p className="text-sm text-gray-800">{truncateText(item.original_text)}</p>
                </div>
              </div>

              {/* Generated Versions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Generated Versions:</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {item.versions && Object.entries(item.versions).map(([versionKey, versionData]) => {
                    if (!versionData.content) return null;
                    
                    const copyId = `${item.id}-${versionKey}`;
                    
                    return (
                      <div key={versionKey} className="bg-white border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            {versionData.label || versionKey}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {versionData.actual_count}/{versionData.limit}
                            </span>
                            <button
                              onClick={() => copyToClipboard(versionData.content, copyId)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedStates[copyId] ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded border">
                          {truncateText(versionData.content, 100)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Style Preset Info */}
              {item.style_preset && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Style preset:</span>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {item.style_preset}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-center py-8">
        <button
          onClick={fetchTimeline}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh Timeline
        </button>
      </div>
    </div>
  );
};

export default Timeline;