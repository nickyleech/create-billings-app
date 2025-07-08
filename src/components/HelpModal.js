import React from 'react';
import { X, Palette, Sliders, History, Layers, Download, HelpCircle } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Help & User Guide</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Getting Started */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                Getting Started
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                  <li>Get your API key from <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-800">Anthropic Console</a></li>
                  <li>Click "Settings" in the top navigation and enter your API key</li>
                  <li>Start creating professional content variations!</li>
                </ol>
              </div>
            </section>

            {/* Main Features */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Main Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Content Generation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Content Generation</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Paste your original content</li>
                    <li>• Select a style (Drama, Documentary, etc.)</li>
                    <li>• Click "Generate" for 3 professional versions</li>
                    <li>• Each version follows PA TV style guide</li>
                  </ul>
                </div>

                {/* Custom Limits */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Sliders className="w-4 h-4 mr-1" />
                    Custom Limits
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Modify character/word limits</li>
                    <li>• Add/remove versions (1-6 supported)</li>
                    <li>• Quick presets for social media</li>
                    <li>• Adapts layout automatically</li>
                  </ul>
                </div>

                {/* Style Presets */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    Style Presets
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create custom style rules</li>
                    <li>• Add forbidden words to avoid</li>
                    <li>• Set custom character limits</li>
                    <li>• Saved per user account</li>
                  </ul>
                </div>

                {/* History */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <History className="w-4 h-4 mr-1" />
                    History
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View all generated content</li>
                    <li>• Timestamps and style used</li>
                    <li>• Delete individual items</li>
                    <li>• Clear all history option</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Advanced Features */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Advanced Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Batch Processing */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Layers className="w-4 h-4 mr-1" />
                    Batch Processing
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Process multiple items at once</li>
                    <li>• Import text lists or add manually</li>
                    <li>• Apply same style to all items</li>
                    <li>• Progress tracking for large batches</li>
                  </ul>
                </div>

                {/* Export Options */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Export Options
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• CSV for spreadsheets</li>
                    <li>• JSON for technical use</li>
                    <li>• HTML formatted reports</li>
                    <li>• Social media formats</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Built-in Styles */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Built-in Content Styles</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'Drama', desc: 'Dramatic storytelling style' },
                  { name: 'Documentary', desc: 'Factual and informative' },
                  { name: 'Soap', desc: 'Soap opera style' },
                  { name: 'Sitcom', desc: 'Situational comedy' },
                  { name: 'Quiz', desc: 'Quiz show format' },
                  { name: 'Movie', desc: 'Feature film style' },
                  { name: 'Music', desc: 'Music program style' },
                  { name: 'Sport', desc: 'Sports coverage style' },
                  { name: 'Default', desc: 'Standard PA TV style' }
                ].map((style) => (
                  <div key={style.name} className="bg-purple-50 rounded-lg p-3">
                    <h4 className="font-medium text-purple-900 text-sm">{style.name}</h4>
                    <p className="text-xs text-purple-700">{style.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips & Best Practices */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tips & Best Practices</h3>
              <div className="bg-yellow-50 rounded-lg p-4">
                <ul className="text-sm text-yellow-900 space-y-2">
                  <li>• <strong>Quality Input:</strong> Provide clear, well-written original content for best results</li>
                  <li>• <strong>Style Selection:</strong> Choose the style that matches your content type</li>
                  <li>• <strong>Character Limits:</strong> Set realistic limits - too short may truncate important information</li>
                  <li>• <strong>Forbidden Words:</strong> Use style presets to avoid specific terms in your content</li>
                  <li>• <strong>Batch Processing:</strong> Great for consistent formatting across multiple items</li>
                  <li>• <strong>Export Early:</strong> Save your work in multiple formats for different uses</li>
                </ul>
              </div>
            </section>

            {/* Privacy & Security */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy & Security</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data Storage</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• All data stored locally in your browser</li>
                      <li>• No external servers or databases</li>
                      <li>• History and presets tied to your account</li>
                      <li>• Consider manual backups for important data</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">API Key Security</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Your API key never leaves your device</li>
                      <li>• Direct connection to Anthropic</li>
                      <li>• You control your API usage and costs</li>
                      <li>• Can be changed anytime in Settings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Common Issues</h3>
              <div className="space-y-3">
                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="font-medium text-red-900 text-sm mb-1">Content generation fails</h4>
                  <p className="text-xs text-red-700">Check your API key is valid and you have available credits</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="font-medium text-red-900 text-sm mb-1">Versions are too short</h4>
                  <p className="text-xs text-red-700">Increase character limits or provide more detailed input content</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="font-medium text-red-900 text-sm mb-1">History not saving</h4>
                  <p className="text-xs text-red-700">Check browser local storage permissions and available space</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Need more help? Contact support or check the documentation.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;