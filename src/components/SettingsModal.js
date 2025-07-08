import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, user }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  
  // Define loadApiKey inside useEffect dependency to fix warning
  useEffect(() => {
    const loadApiKey = () => {
      try {
        const savedKey = localStorage.getItem(`anthropic_api_key_${user.id}`);
        if (savedKey) {
          setApiKey(savedKey);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };
    
    if (isOpen && user) {
      loadApiKey();
    }
  }, [isOpen, user]);


  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      setMessage({ type: 'error', text: 'Invalid API key format. Anthropic API keys start with "sk-ant-"' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Save the API key - validation will happen during actual usage
      localStorage.setItem(`anthropic_api_key_${user.id}`, apiKey);
      setMessage({ type: 'success', text: 'API key saved successfully! It will be validated when you generate content.' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage({ type: 'error', text: 'Failed to save API key. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const clearApiKey = () => {
    if (window.confirm('Are you sure you want to remove the API key? This will disable content generation.')) {
      localStorage.removeItem(`anthropic_api_key_${user.id}`);
      setApiKey('');
      setMessage({ type: 'success', text: 'API key removed successfully!' });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Account Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                  <span className="font-medium">User ID:</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
              </div>
            </div>

            {/* API Key Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Anthropic API Key</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Why do you need an API key?</p>
                    <p>
                      This application uses your personal Anthropic API key to generate content. 
                      Your key is stored locally on your device and is never shared with others.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="sk-ant-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://console.anthropic.com/account/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Anthropic Console
                    </a>
                  </p>
                </div>

                {message.text && (
                  <div className={`flex items-center space-x-2 p-3 rounded-md ${
                    message.type === 'error' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {message.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={clearApiKey}
                    disabled={!apiKey}
                    className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Clear API Key
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveApiKey}
                      disabled={saving || !apiKey.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <Key className="w-4 h-4" />
                      <span>{saving ? 'Testing...' : 'Save API Key'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Settings</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Data Storage:</strong> All your data is stored locally in your browser.
                  </p>
                  <p className="mb-2">
                    <strong>Privacy:</strong> Your API key and generated content never leave your device.
                  </p>
                  <p>
                    <strong>Backup:</strong> Consider backing up your API key and history manually.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;