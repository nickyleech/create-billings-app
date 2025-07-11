import React, { useState } from 'react';
import { Eye, EyeOff, Info, Code, Lightbulb, Target, AlertCircle } from 'lucide-react';
import { generateStyleInstructions, generatePromptPreview } from '../utils/style-instructions';

const StyleInstructionsPreview = ({ styleRules, forbiddenWords = [], customLimits = [], className = '' }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sampleInput, setSampleInput] = useState('Comedy drama series following the lives of a group of friends in Manchester as they navigate relationships, careers, and unexpected challenges.');

  const instructions = generateStyleInstructions(styleRules, forbiddenWords);
  const promptPreview = generatePromptPreview(styleRules, forbiddenWords, customLimits, sampleInput);

  const activeRuleCount = instructions.length;

  return (
    <div className={`bg-blue-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Info className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-blue-900">AI Style Instructions Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {activeRuleCount} rules active
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>
        </div>
      </div>

      <div className="text-sm text-blue-700 mb-4">
        This shows exactly what instructions the AI receives to shape your content. 
        Use this to understand and fine-tune how your style preset influences the output.
      </div>

      {showDetails && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Target className="mr-2" size={16} />
              Active Style Rules ({activeRuleCount})
            </h4>
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={instruction.id} className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1">{instruction.rule}</p>
                      <p className="text-sm text-gray-600 mb-2">{instruction.description}</p>
                      
                      {instruction.examples && instruction.examples.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Examples:</p>
                          <div className="flex flex-wrap gap-1">
                            {instruction.examples.map((example, i) => (
                              <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Lightbulb className="text-yellow-500" size={12} />
                        <p className="text-xs text-gray-600">{instruction.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeRuleCount === 0 && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <AlertCircle size={16} />
                <p>No specific style rules active - using default PA TV guidelines only</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <Code className="mr-2" size={16} />
                Full AI Prompt Preview
              </h4>
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                {showPrompt ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showPrompt ? 'Hide' : 'Show'} Prompt</span>
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Input (edit to test):
              </label>
              <textarea
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows="2"
                placeholder="Enter sample text to preview how it will be processed..."
              />
            </div>

            {showPrompt && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap">{promptPreview}</pre>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="text-amber-600" size={16} />
              <h4 className="font-semibold text-amber-800">Pro Tips for Style Tweaking</h4>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>More rules = more constraints:</strong> Each rule limits AI creativity but increases consistency</li>
              <li>• <strong>Custom instructions are powerful:</strong> Use them for specific editorial requirements</li>
              <li>• <strong>Test with sample content:</strong> Use the preview to see how rules affect your typical content</li>
              <li>• <strong>Forbidden words are absolute:</strong> The AI will completely avoid these terms</li>
              <li>• <strong>Character limits are enforced:</strong> The AI will prioritize staying within limits</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleInstructionsPreview;