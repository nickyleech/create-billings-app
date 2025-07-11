import React from 'react';
import { FileText, Languages, ArrowRight, Palette, Layers, BarChart3 } from 'lucide-react';

const HomePage = ({ onSelectSection }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Billings Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional content management and translation tools for media professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div 
            onClick={() => onSelectSection('billing')}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-blue-300"
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Billing Tool</h3>
                  <p className="text-gray-600">Content versioning & metadata</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Generate professional TV metadata billings following PA TV style guide. 
                Create multiple versions with custom character limits and export options.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Palette className="w-4 h-4 mr-2" />
                  <span>Custom style presets</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Layers className="w-4 h-4 mr-2" />
                  <span>Batch processing</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span>Excel analysis</span>
                </div>
              </div>
              
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                <span>Start creating billings</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => onSelectSection('translation')}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-green-300"
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Languages className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Translation</h3>
                  <p className="text-gray-600">Multi-language content</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Translate content into multiple languages with professional quality. 
                Supports various style guides and maintains formatting consistency.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Languages className="w-4 h-4 mr-2" />
                  <span>Multiple language support</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Palette className="w-4 h-4 mr-2" />
                  <span>Style guide compliance</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Format preservation</span>
                </div>
              </div>
              
              <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                <span>Start translating</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Professional tools for British media industry workflows
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;