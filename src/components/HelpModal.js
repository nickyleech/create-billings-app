import React from 'react';
import { X, Palette, Sliders, History, Layers, Download, HelpCircle, BarChart3, Eye, Target, Info } from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Help & User Guide</h2>
            <p className="text-sm text-gray-500">Updated with latest features - January 2025</p>
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
                    <li>• <span className="text-blue-600 font-medium">NEW:</span> Preview AI instructions</li>
                    <li>• <span className="text-blue-600 font-medium">NEW:</span> See full AI prompt</li>
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

                {/* Excel Analysis - NEW */}
                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1 text-orange-600" />
                    Excel Analysis <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">NEW</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Compare multiple content versions simultaneously</li>
                    <li>• Comprehensive quality scoring (Basic 0-100 + Enhanced 0-170)</li>
                    <li>• Readability analysis with Flesch Reading Ease scores</li>
                    <li>• PA TV style compliance verification</li>
                    <li>• Detailed improvement suggestions and recommendations</li>
                    <li>• Character/word count analysis with optimal length assessment</li>
                    <li>• Broadcasting standards compliance checking</li>
                    <li>• Export comprehensive analysis results to Excel</li>
                  </ul>
                </div>

                {/* Style Transparency - NEW */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-1 text-blue-600" />
                    Style Transparency <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">NEW</span>
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• See exact AI instructions</li>
                    <li>• Preview full AI prompts</li>
                    <li>• Understand rule impacts</li>
                    <li>• Test with sample content</li>
                    <li>• Optimize style settings</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Recent Updates */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                Recent Updates & New Features
              </h3>
              
              <div className="space-y-4">
                {/* Excel Analysis */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Excel Analysis Tool
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    Compare and analyse multiple versions of content with comprehensive quality metrics, readability scoring, and PA TV style compliance verification.
                  </p>
                  <div className="bg-white rounded-md p-3">
                    <h5 className="font-medium text-gray-900 mb-2">How to Use:</h5>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Click "Excel Analysis" button in the main interface</li>
                      <li>Upload Excel file with Version 1 and Version 2 columns (or use template)</li>
                      <li>Map your columns to the analysis fields (Version 1, Version 2, Identifier)</li>
                      <li>Click "Analyze Content" to generate detailed comparison report</li>
                      <li>Review individual item analysis and overall quality metrics</li>
                      <li>Export comprehensive results or download template for future use</li>
                    </ol>
                  </div>
                  <div className="mt-3 bg-white rounded-md p-3">
                    <h5 className="font-medium text-gray-900 mb-2">What Each Analysis Metric Measures:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                      <div>
                        <strong>Basic Quality Score (0-100):</strong>
                        <ul className="ml-2 mt-1 space-y-1">
                          <li>• Length appropriateness (0-25 points)</li>
                          <li>• Word count optimisation (0-20 points)</li>
                          <li>• Readability score (0-30 points)</li>
                          <li>• PA TV style compliance (0-25 points)</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Enhanced Quality Score (0-170):</strong>
                        <ul className="ml-2 mt-1 space-y-1">
                          <li>• Semantic richness (0-15 points)</li>
                          <li>• Professional tone (0-15 points)</li>
                          <li>• Broadcasting standards (0-10 points)</li>
                          <li>• Content completeness (0-10 points)</li>
                          <li>• Efficiency rating (0-10 points)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-white rounded-md p-3">
                    <h5 className="font-medium text-gray-900 mb-2">Quality Grade System:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div>• <strong>Excellent (90-100%):</strong> Exceptional quality</div>
                      <div>• <strong>Very Good (80-89%):</strong> High standard</div>
                      <div>• <strong>Good (70-79%):</strong> Above average</div>
                      <div>• <strong>Fair (60-69%):</strong> Acceptable quality</div>
                      <div>• <strong>Poor (50-59%):</strong> Below standard</div>
                      <div>• <strong>Needs Revision (&lt;50%):</strong> Requires improvement</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-orange-700">
                    <strong>Advanced Features:</strong> Comparative analysis, strength identification, issue detection, improvement suggestions, overall reporting with recommendations, grade distribution analysis
                  </div>
                </div>

                {/* Style Transparency */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Style Preset Transparency
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    See exactly what instructions the AI receives and how your style presets influence the output.
                  </p>
                  <div className="bg-white rounded-md p-3">
                    <h5 className="font-medium text-gray-900 mb-2">How to Use:</h5>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>In Style Presets, click the 👁️ eye icon next to any preset</li>
                      <li>When creating presets, view live preview of AI instructions</li>
                      <li>On main screen, toggle active preset preview</li>
                      <li>Use sample text to test how rules affect content</li>
                      <li>View the complete AI prompt being sent</li>
                    </ol>
                  </div>
                  <div className="mt-3 text-xs text-blue-700">
                    <strong>Benefits:</strong> Better tweaking, rule understanding, prompt optimization, debugging style issues
                  </div>
                </div>

                {/* Character Limit Enforcement */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Enhanced Character Limit Enforcement
                  </h4>
                  <p className="text-sm text-green-800 mb-3">
                    Version 1 now guaranteed to never exceed 90 characters, with improved AI prompts and client-side validation.
                  </p>
                  <div className="bg-white rounded-md p-3">
                    <h5 className="font-medium text-gray-900 mb-2">Improvements:</h5>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Stricter AI prompt instructions ("MUST NOT exceed" instead of "Maximum")</li>
                      <li>Client-side validation with automatic truncation if needed</li>
                      <li>Real-time character count display with over-limit warnings</li>
                      <li>Visual indicators when content exceeds limits</li>
                    </ul>
                  </div>
                  <div className="mt-3 text-xs text-green-700">
                    <strong>Result:</strong> Version 1 always stays within 90 characters including spaces
                  </div>
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
                  <li>• <strong>Style Transparency:</strong> Use the preview feature to understand how your presets affect AI output</li>
                  <li>• <strong>Excel Analysis:</strong> Compare content versions to identify the best performing variations</li>
                  <li>• <strong>Template Downloads:</strong> Use provided Excel templates for consistent data formatting</li>
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