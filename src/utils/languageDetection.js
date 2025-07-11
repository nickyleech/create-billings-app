// Enhanced language detection utility with confidence scoring
// Supports multiple European languages commonly used in broadcasting

import { LANGUAGES, LANGUAGE_PATTERNS } from './languageConfig';

// Language detection with confidence scoring
export const detectLanguage = (text) => {
  if (!text || text.trim().length < 10) {
    return { language: null, confidence: 0, candidates: [] };
  }

  const results = [];
  const cleanText = text.toLowerCase().trim();
  const words = cleanText.split(/\s+/);
  const totalWords = words.length;

  // Test each language pattern
  Object.entries(LANGUAGE_PATTERNS).forEach(([langCode, patterns]) => {
    let score = 0;
    let matchDetails = {
      wordMatches: 0,
      patternMatches: 0,
      diacriticMatches: 0,
      totalScore: 0
    };

    // Check common words (40% of score)
    const wordMatches = words.filter(word => 
      patterns.commonWords.some(commonWord => 
        word.includes(commonWord) || commonWord.includes(word)
      )
    ).length;
    
    const wordScore = (wordMatches / totalWords) * 0.4;
    matchDetails.wordMatches = wordMatches;
    score += wordScore;

    // Check language-specific patterns (40% of score)
    let patternMatches = 0;
    patterns.patterns.forEach(pattern => {
      const matches = (cleanText.match(pattern) || []).length;
      patternMatches += matches;
    });
    
    const patternScore = Math.min(patternMatches / words.length, 0.4);
    matchDetails.patternMatches = patternMatches;
    score += patternScore;

    // Check for diacritics (20% of score)
    let diacriticMatches = 0;
    if (patterns.diacritics) {
      patterns.diacritics.forEach(diacritic => {
        const matches = (text.match(new RegExp(diacritic, 'g')) || []).length;
        diacriticMatches += matches;
      });
    }
    
    const diacriticScore = Math.min(diacriticMatches / text.length, 0.2);
    matchDetails.diacriticMatches = diacriticMatches;
    score += diacriticScore;

    matchDetails.totalScore = score;

    if (score > 0.1) { // Only include languages with reasonable confidence
      results.push({
        language: langCode,
        confidence: Math.min(score, 1.0),
        details: matchDetails,
        languageInfo: LANGUAGES[langCode]
      });
    }
  });

  // Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence);

  // Return top detection with candidate list
  return {
    language: results.length > 0 ? results[0].language : null,
    confidence: results.length > 0 ? results[0].confidence : 0,
    candidates: results.slice(0, 3), // Top 3 candidates
    allResults: results
  };
};

// Batch language detection for multiple text segments
export const detectLanguageBatch = (textSegments) => {
  return textSegments.map((text, index) => ({
    index,
    text,
    detection: detectLanguage(text)
  }));
};

// Language detection with text segmentation
export const detectLanguageSegments = (text) => {
  // Split text into meaningful segments
  const segments = text.split(/(?<=[.!?])\s+|(?:\n\s*\n)/);
  const detectionResults = [];

  segments.forEach((segment, index) => {
    const cleanSegment = segment.trim();
    if (cleanSegment.length < 10) return;

    const detection = detectLanguage(cleanSegment);
    if (detection.confidence > 0.3) {
      detectionResults.push({
        id: index,
        text: cleanSegment,
        detection: detection,
        needsTranslation: detection.language !== 'en-gb' && detection.language !== 'en-us'
      });
    }
  });

  return detectionResults;
};

// Confidence level descriptions
export const getConfidenceDescription = (confidence) => {
  if (confidence >= 0.8) return 'Very High';
  if (confidence >= 0.6) return 'High';
  if (confidence >= 0.4) return 'Medium';
  if (confidence >= 0.2) return 'Low';
  return 'Very Low';
};

// Language confidence color coding for UI
export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-100';
  if (confidence >= 0.6) return 'text-blue-600 bg-blue-100';
  if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-100';
  if (confidence >= 0.2) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

// Enhanced Welsh text identification (backwards compatibility)
export const identifyWelshSegments = (text) => {
  const segments = detectLanguageSegments(text);
  return segments
    .filter(segment => segment.detection.language === 'cy')
    .map(segment => ({
      id: segment.id,
      originalText: segment.text,
      translatedText: '',
      isWelsh: true,
      confidence: segment.detection.confidence,
      wordCount: segment.text.split(/\s+/).length,
      detection: segment.detection
    }));
};

// Multi-language segment identification
export const identifyMultiLanguageSegments = (text, targetLanguage = 'en-gb') => {
  const segments = detectLanguageSegments(text);
  return segments
    .filter(segment => segment.detection.language !== targetLanguage)
    .map(segment => ({
      id: segment.id,
      originalText: segment.text,
      translatedText: '',
      sourceLanguage: segment.detection.language,
      targetLanguage: targetLanguage,
      confidence: segment.detection.confidence,
      wordCount: segment.text.split(/\s+/).length,
      detection: segment.detection,
      needsTranslation: true
    }));
};

// Language statistics for document analysis
export const analyzeLanguageDistribution = (text) => {
  const segments = detectLanguageSegments(text);
  const languageStats = {};
  let totalSegments = 0;

  segments.forEach(segment => {
    const lang = segment.detection.language;
    if (!languageStats[lang]) {
      languageStats[lang] = {
        language: lang,
        languageInfo: LANGUAGES[lang],
        segments: 0,
        totalWords: 0,
        averageConfidence: 0,
        confidenceSum: 0
      };
    }
    
    languageStats[lang].segments++;
    languageStats[lang].totalWords += segment.text.split(/\s+/).length;
    languageStats[lang].confidenceSum += segment.detection.confidence;
    totalSegments++;
  });

  // Calculate averages and percentages
  Object.values(languageStats).forEach(stats => {
    stats.averageConfidence = stats.confidenceSum / stats.segments;
    stats.percentage = (stats.segments / totalSegments) * 100;
  });

  return {
    totalSegments,
    languages: Object.values(languageStats),
    primaryLanguage: Object.values(languageStats).sort((a, b) => b.segments - a.segments)[0]
  };
};

const languageDetection = {
  detectLanguage,
  detectLanguageBatch,
  detectLanguageSegments,
  getConfidenceDescription,
  getConfidenceColor,
  identifyWelshSegments,
  identifyMultiLanguageSegments,
  analyzeLanguageDistribution
};

export default languageDetection;