import React, { useState } from 'react';
import { Upload, X, Download, BarChart3, FileText, AlertCircle, TrendingUp, Award, Target, Star } from 'lucide-react';
import * as XLSX from 'xlsx';
import { compareContent, compareThreeContent, generateContentReport } from '../utils/content-analyzer';

const ExcelAnalysisModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    version1: '',
    version2: '',
    version3: '',
    identifier: ''
  });
  const [compareMode, setCompareMode] = useState('two'); // 'two' or 'three'
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper function to get quality grade
  const getQualityGrade = (enhancedScore) => {
    const percentage = (enhancedScore / 170) * 100;
    if (percentage >= 90) return { grade: 'Excellent', color: 'text-green-600 bg-green-100' };
    else if (percentage >= 80) return { grade: 'Very Good', color: 'text-blue-600 bg-blue-100' };
    else if (percentage >= 70) return { grade: 'Good', color: 'text-indigo-600 bg-indigo-100' };
    else if (percentage >= 60) return { grade: 'Fair', color: 'text-yellow-600 bg-yellow-100' };
    else if (percentage >= 50) return { grade: 'Poor', color: 'text-orange-600 bg-orange-100' };
    else return { grade: 'Needs Revision', color: 'text-red-600 bg-red-100' };
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          setColumns(headers);
          setData(jsonData);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    }
  };

  const [overallReport, setOverallReport] = useState(null);

  const performAnalysis = () => {
    if (!data.length || !columnMapping.version1 || !columnMapping.version2) {
      alert('Please upload a file and map version columns');
      return;
    }

    if (compareMode === 'three' && !columnMapping.version3) {
      alert('Please map the third version column for three-column comparison');
      return;
    }

    setIsAnalyzing(true);
    
    const results = data.map((row, index) => {
      const version1Text = row[columnMapping.version1] || '';
      const version2Text = row[columnMapping.version2] || '';
      const version3Text = compareMode === 'three' ? (row[columnMapping.version3] || '') : '';
      const identifier = row[columnMapping.identifier] || `Row ${index + 1}`;
      
      let comparison;
      if (compareMode === 'three') {
        comparison = compareThreeContent(version1Text, version2Text, version3Text);
        return {
          identifier,
          version1: version1Text,
          version2: version2Text,
          version3: version3Text,
          analysis1: comparison.analysis1,
          analysis2: comparison.analysis2,
          analysis3: comparison.analysis3,
          comparison: comparison.comparison,
          winner: comparison.comparison.winner
        };
      } else {
        comparison = compareContent(version1Text, version2Text);
        return {
          identifier,
          version1: version1Text,
          version2: version2Text,
          analysis1: comparison.analysis1,
          analysis2: comparison.analysis2,
          comparison: comparison.comparison,
          winner: comparison.comparison.winner
        };
      }
    });

    // Generate overall report
    const allAnalyses = compareMode === 'three' 
      ? results.flatMap(r => [r.analysis1, r.analysis2, r.analysis3])
      : results.flatMap(r => [r.analysis1, r.analysis2]);
    const report = generateContentReport(allAnalyses);
    
    setAnalysisResults(results);
    setOverallReport(report);
    setIsAnalyzing(false);
  };

  const downloadTemplate = () => {
    try {
      const templateData = compareMode === 'three' ? [
        {
          'Item ID': 'ITEM_001',
          'Version 1': 'This is the first version of content that needs to be analyzed for quality metrics.',
          'Version 2': 'This is the second version of content that will be compared against the first version.',
          'Version 3': 'This is the third version of content for comprehensive three-way comparison.',
          'Notes': 'Optional notes about the content'
        },
        {
          'Item ID': 'ITEM_002',
          'Version 1': 'Another example of content that could be shorter and more concise.',
          'Version 2': 'Shorter, more concise content example.',
          'Version 3': 'Even more concise version for comparison.',
          'Notes': 'Example showing length optimization across three versions'
        }
      ] : [
        {
          'Item ID': 'ITEM_001',
          'Version 1': 'This is the first version of content that needs to be analyzed for quality metrics.',
          'Version 2': 'This is the second version of content that will be compared against the first version.',
          'Notes': 'Optional notes about the content'
        },
        {
          'Item ID': 'ITEM_002',
          'Version 1': 'Another example of content that could be shorter and more concise.',
          'Version 2': 'Shorter, more concise content example.',
          'Notes': 'Example showing length optimization'
        }
      ];

      // Check if XLSX is available
      if (!XLSX || !XLSX.utils) {
        throw new Error('XLSX library not loaded properly');
      }

      console.log('Creating worksheet with data:', templateData);
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      console.log('Creating workbook...');
      const workbook = XLSX.utils.book_new();
      
      console.log('Adding worksheet to workbook...');
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      
      const filename = `content-analysis-template-${compareMode}-column.xlsx`;
      console.log('Writing file:', filename);
      
      XLSX.writeFile(workbook, filename);
      console.log('Template download completed successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      alert(`Error downloading template: ${error.message}`);
    }
  };

  const exportResults = () => {
    if (!analysisResults) return;

    try {
      const exportData = analysisResults.map(result => {
        const baseData = {
          'Identifier': result.identifier,
          'Version 1': result.version1,
          'Version 2': result.version2,
          'V1 Length': result.analysis1.length,
          'V2 Length': result.analysis2.length,
          'V1 Word Count': result.analysis1.wordCount,
          'V2 Word Count': result.analysis2.wordCount,
          'V1 Readability': result.analysis1.readabilityScore,
          'V2 Readability': result.analysis2.readabilityScore,
          'V1 Quality Score': result.analysis1.qualityScore,
          'V2 Quality Score': result.analysis2.qualityScore,
          'V1 Enhanced Score': result.analysis1.enhancedQualityScore,
          'V2 Enhanced Score': result.analysis2.enhancedQualityScore,
          'Winner': result.winner,
          'V1 Issues': result.analysis1.issues.join('; '),
          'V2 Issues': result.analysis2.issues.join('; '),
          'V1 Strengths': result.analysis1.strengths.join('; '),
          'V2 Strengths': result.analysis2.strengths.join('; ')
        };

        if (compareMode === 'three' && result.analysis3) {
          return {
            ...baseData,
            'Version 3': result.version3,
            'V3 Length': result.analysis3.length,
            'V3 Word Count': result.analysis3.wordCount,
            'V3 Readability': result.analysis3.readabilityScore,
            'V3 Quality Score': result.analysis3.qualityScore,
            'V3 Enhanced Score': result.analysis3.enhancedQualityScore,
            'V3 Issues': result.analysis3.issues.join('; '),
            'V3 Strengths': result.analysis3.strengths.join('; ')
          };
        }

        return baseData;
      });

      // Check if XLSX is available
      if (!XLSX || !XLSX.utils) {
        throw new Error('XLSX library not loaded properly');
      }

      console.log('Creating export worksheet...');
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Results');
      
      const filename = `content-analysis-results-${compareMode}-column-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log('Exporting results to:', filename);
      
      XLSX.writeFile(workbook, filename);
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Error exporting results:', error);
      alert(`Error exporting results: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Excel Content Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-4">Upload Excel file with {compareMode === 'two' ? 'two' : 'three'} content columns to compare</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer inline-block"
              >
                Choose File
              </label>
              <button
                onClick={downloadTemplate}
                className="ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <Download size={16} className="inline mr-2" />
                Download Template
              </button>
            </div>

            {file && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <FileText className="inline mr-2" size={16} />
                  {file.name} ({data.length} rows)
                </p>
              </div>
            )}

            {/* Mode Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comparison Mode</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="compareMode"
                    value="two"
                    checked={compareMode === 'two'}
                    onChange={(e) => {
                      setCompareMode(e.target.value);
                      setColumnMapping({...columnMapping, version3: ''});
                    }}
                    className="mr-2"
                  />
                  Two Columns
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="compareMode"
                    value="three"
                    checked={compareMode === 'three'}
                    onChange={(e) => setCompareMode(e.target.value)}
                    className="mr-2"
                  />
                  Three Columns
                </label>
              </div>
            </div>

            {/* Column Mapping */}
            {columns.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Map Your Columns</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version 1 Column
                    </label>
                    <select
                      value={columnMapping.version1}
                      onChange={(e) => setColumnMapping({...columnMapping, version1: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select column...</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version 2 Column
                    </label>
                    <select
                      value={columnMapping.version2}
                      onChange={(e) => setColumnMapping({...columnMapping, version2: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select column...</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  {compareMode === 'three' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Version 3 Column
                      </label>
                      <select
                        value={columnMapping.version3}
                        onChange={(e) => setColumnMapping({...columnMapping, version3: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select column...</option>
                        {columns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identifier Column (Optional)
                    </label>
                    <select
                      value={columnMapping.identifier}
                      onChange={(e) => setColumnMapping({...columnMapping, identifier: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select column...</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={performAnalysis}
                  disabled={!columnMapping.version1 || !columnMapping.version2 || (compareMode === 'three' && !columnMapping.version3) || isAnalyzing}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
                  <BarChart3 className="inline ml-2" size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {analysisResults && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  <button
                    onClick={exportResults}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                  >
                    <Download size={16} className="inline mr-2" />
                    Export Results
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className={`grid gap-4 text-center mb-4 ${compareMode === 'three' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {analysisResults.filter(r => r.winner === 'version1').length}
                      </p>
                      <p className="text-sm text-gray-600">Version 1 Wins</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {analysisResults.filter(r => r.winner === 'version2').length}
                      </p>
                      <p className="text-sm text-gray-600">Version 2 Wins</p>
                    </div>
                    {compareMode === 'three' && (
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {analysisResults.filter(r => r.winner === 'version3').length}
                        </p>
                        <p className="text-sm text-gray-600">Version 3 Wins</p>
                      </div>
                    )}
                    <div>
                      <p className="text-2xl font-bold text-gray-600">
                        {analysisResults.filter(r => r.winner === 'tie').length}
                      </p>
                      <p className="text-sm text-gray-600">Ties</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Star className="mr-2 text-yellow-500" size={16} />
                      Quality Grade Distribution
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {(() => {
                        const grades = { 'Excellent (90-100%)': 0, 'Very Good (80-89%)': 0, 'Good (70-79%)': 0, 'Fair (60-69%)': 0, 'Poor (50-59%)': 0, 'Needs Revision (<50%)': 0 };
                        analysisResults.forEach(result => {
                          const analyses = compareMode === 'three' 
                            ? [result.analysis1, result.analysis2, result.analysis3]
                            : [result.analysis1, result.analysis2];
                          analyses.forEach(analysis => {
                            if (analysis) {
                              const percentage = (analysis.enhancedQualityScore / 170) * 100;
                              if (percentage >= 90) grades['Excellent (90-100%)']++;
                              else if (percentage >= 80) grades['Very Good (80-89%)']++;
                              else if (percentage >= 70) grades['Good (70-79%)']++;
                              else if (percentage >= 60) grades['Fair (60-69%)']++;
                              else if (percentage >= 50) grades['Poor (50-59%)']++;
                              else grades['Needs Revision (<50%)']++;
                            }
                          });
                        });
                        return Object.entries(grades).map(([grade, count]) => (
                          <div key={grade} className="flex justify-between">
                            <span className="text-gray-600">{grade}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {overallReport && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <TrendingUp className="mr-2" size={16} />
                      Overall Report
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Average Quality Score:</strong> {overallReport.summary.avgQualityScore}/100</p>
                        <p><strong>Average Length:</strong> {overallReport.summary.avgLength} chars</p>
                        <p><strong>Average Readability:</strong> {overallReport.summary.avgReadability}/100</p>
                      </div>
                      <div>
                        <p><strong>Total Items:</strong> {overallReport.summary.totalItems}</p>
                        {overallReport.topIssues.length > 0 && (
                          <p><strong>Most Common Issue:</strong> {overallReport.topIssues[0].issue} ({overallReport.topIssues[0].percentage}%)</p>
                        )}
                      </div>
                    </div>
                    {overallReport.recommendations.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h5 className="font-medium text-sm mb-2">📋 Recommendations:</h5>
                        <ul className="text-xs space-y-1">
                          {overallReport.recommendations.map((rec, i) => (
                            <li key={i} className="text-gray-700">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analysisResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{result.identifier}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${
                          result.winner === 'version1' ? 'bg-blue-100 text-blue-800' :
                          result.winner === 'version2' ? 'bg-green-100 text-green-800' :
                          result.winner === 'version3' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.winner === 'tie' ? 'Tie' : `Version ${result.winner.slice(-1)} Wins`}
                        </span>
                      </div>
                      
                      <div className={`grid gap-4 text-sm ${compareMode === 'three' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className="space-y-2">
                          <p className="font-medium">Version 1</p>
                          <div className="text-xs space-y-1">
                            <p className="text-gray-600">
                              {result.analysis1.length} chars, {result.analysis1.wordCount} words, 
                              {result.analysis1.readabilityScore}% readable
                            </p>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-blue-600 font-medium">Basic: {result.analysis1.qualityScore}/100</span>
                              <span className="text-purple-600 font-medium">Enhanced: {result.analysis1.enhancedQualityScore}/170</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getQualityGrade(result.analysis1.enhancedQualityScore).color}`}>
                                {getQualityGrade(result.analysis1.enhancedQualityScore).grade}
                              </span>
                            </div>
                            {result.analysis1.scoreBreakdown && (
                              <div className="bg-gray-50 p-2 rounded text-xs">
                                <p className="font-medium mb-1">Score Breakdown:</p>
                                <div className="grid grid-cols-2 gap-1">
                                  <span>Length: {result.analysis1.scoreBreakdown.basic.length}/25</span>
                                  <span>Words: {result.analysis1.scoreBreakdown.basic.wordCount}/20</span>
                                  <span>Readability: {result.analysis1.scoreBreakdown.basic.readability}/30</span>
                                  <span>Style: {result.analysis1.scoreBreakdown.basic.styleCompliance}/25</span>
                                  <span>Semantic: {result.analysis1.scoreBreakdown.enhanced.semanticRichness}/15</span>
                                  <span>Tone: {result.analysis1.scoreBreakdown.enhanced.professionalTone}/15</span>
                                  <span>Broadcast: {result.analysis1.scoreBreakdown.enhanced.broadcastingStandards}/10</span>
                                  <span>Complete: {result.analysis1.scoreBreakdown.enhanced.contentCompleteness}/10</span>
                                  <span>Efficiency: {result.analysis1.scoreBreakdown.enhanced.efficiency}/10</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {result.analysis1.strengths.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-green-600 flex items-center">
                                <Award size={12} className="mr-1" /> Strengths:
                              </p>
                              <ul className="text-gray-600 ml-4">
                                {result.analysis1.strengths.slice(0, 2).map((strength, i) => (
                                  <li key={i}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.analysis1.issues.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-red-600 flex items-center">
                                <AlertCircle size={12} className="mr-1" /> Issues:
                              </p>
                              <ul className="text-gray-600 ml-4">
                                {result.analysis1.issues.slice(0, 2).map((issue, i) => (
                                  <li key={i}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium">Version 2</p>
                          <div className="text-xs space-y-1">
                            <p className="text-gray-600">
                              {result.analysis2.length} chars, {result.analysis2.wordCount} words, 
                              {result.analysis2.readabilityScore}% readable
                            </p>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-blue-600 font-medium">Basic: {result.analysis2.qualityScore}/100</span>
                              <span className="text-purple-600 font-medium">Enhanced: {result.analysis2.enhancedQualityScore}/170</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getQualityGrade(result.analysis2.enhancedQualityScore).color}`}>
                                {getQualityGrade(result.analysis2.enhancedQualityScore).grade}
                              </span>
                            </div>
                            {result.analysis2.scoreBreakdown && (
                              <div className="bg-gray-50 p-2 rounded text-xs">
                                <p className="font-medium mb-1">Score Breakdown:</p>
                                <div className="grid grid-cols-2 gap-1">
                                  <span>Length: {result.analysis2.scoreBreakdown.basic.length}/25</span>
                                  <span>Words: {result.analysis2.scoreBreakdown.basic.wordCount}/20</span>
                                  <span>Readability: {result.analysis2.scoreBreakdown.basic.readability}/30</span>
                                  <span>Style: {result.analysis2.scoreBreakdown.basic.styleCompliance}/25</span>
                                  <span>Semantic: {result.analysis2.scoreBreakdown.enhanced.semanticRichness}/15</span>
                                  <span>Tone: {result.analysis2.scoreBreakdown.enhanced.professionalTone}/15</span>
                                  <span>Broadcast: {result.analysis2.scoreBreakdown.enhanced.broadcastingStandards}/10</span>
                                  <span>Complete: {result.analysis2.scoreBreakdown.enhanced.contentCompleteness}/10</span>
                                  <span>Efficiency: {result.analysis2.scoreBreakdown.enhanced.efficiency}/10</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {result.analysis2.strengths.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-green-600 flex items-center">
                                <Award size={12} className="mr-1" /> Strengths:
                              </p>
                              <ul className="text-gray-600 ml-4">
                                {result.analysis2.strengths.slice(0, 2).map((strength, i) => (
                                  <li key={i}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.analysis2.issues.length > 0 && (
                            <div className="text-xs">
                              <p className="font-medium text-red-600 flex items-center">
                                <AlertCircle size={12} className="mr-1" /> Issues:
                              </p>
                              <ul className="text-gray-600 ml-4">
                                {result.analysis2.issues.slice(0, 2).map((issue, i) => (
                                  <li key={i}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {compareMode === 'three' && result.analysis3 && (
                          <div className="space-y-2">
                            <p className="font-medium">Version 3</p>
                            <div className="text-xs space-y-1">
                              <p className="text-gray-600">
                                {result.analysis3.length} chars, {result.analysis3.wordCount} words, 
                                {result.analysis3.readabilityScore}% readable
                              </p>
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-blue-600 font-medium">Basic: {result.analysis3.qualityScore}/100</span>
                                <span className="text-purple-600 font-medium">Enhanced: {result.analysis3.enhancedQualityScore}/170</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getQualityGrade(result.analysis3.enhancedQualityScore).color}`}>
                                  {getQualityGrade(result.analysis3.enhancedQualityScore).grade}
                                </span>
                              </div>
                              {result.analysis3.scoreBreakdown && (
                                <div className="bg-gray-50 p-2 rounded text-xs">
                                  <p className="font-medium mb-1">Score Breakdown:</p>
                                  <div className="grid grid-cols-2 gap-1">
                                    <span>Length: {result.analysis3.scoreBreakdown.basic.length}/25</span>
                                    <span>Words: {result.analysis3.scoreBreakdown.basic.wordCount}/20</span>
                                    <span>Readability: {result.analysis3.scoreBreakdown.basic.readability}/30</span>
                                    <span>Style: {result.analysis3.scoreBreakdown.basic.styleCompliance}/25</span>
                                    <span>Semantic: {result.analysis3.scoreBreakdown.enhanced.semanticRichness}/15</span>
                                    <span>Tone: {result.analysis3.scoreBreakdown.enhanced.professionalTone}/15</span>
                                    <span>Broadcast: {result.analysis3.scoreBreakdown.enhanced.broadcastingStandards}/10</span>
                                    <span>Complete: {result.analysis3.scoreBreakdown.enhanced.contentCompleteness}/10</span>
                                    <span>Efficiency: {result.analysis3.scoreBreakdown.enhanced.efficiency}/10</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {result.analysis3.strengths.length > 0 && (
                              <div className="text-xs">
                                <p className="font-medium text-green-600 flex items-center">
                                  <Award size={12} className="mr-1" /> Strengths:
                                </p>
                                <ul className="text-gray-600 ml-4">
                                  {result.analysis3.strengths.slice(0, 2).map((strength, i) => (
                                    <li key={i}>• {strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {result.analysis3.issues.length > 0 && (
                              <div className="text-xs">
                                <p className="font-medium text-red-600 flex items-center">
                                  <AlertCircle size={12} className="mr-1" /> Issues:
                                </p>
                                <ul className="text-gray-600 ml-4">
                                  {result.analysis3.issues.slice(0, 2).map((issue, i) => (
                                    <li key={i}>• {issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {result.comparison.improvements.length > 0 && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <p className="font-medium flex items-center">
                            <Target size={12} className="mr-1" /> Improvement Suggestions:
                          </p>
                          <ul className="text-gray-600 ml-4 mt-1">
                            {result.comparison.improvements.slice(0, 3).map((improvement, i) => (
                              <li key={i}>• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelAnalysisModal;