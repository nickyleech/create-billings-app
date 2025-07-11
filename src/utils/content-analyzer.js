export const analyzeContent = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      length: 0,
      wordCount: 0,
      sentenceCount: 0,
      readabilityScore: 0,
      qualityScore: 0,
      issues: ['Empty or invalid content'],
      strengths: [],
      suggestions: []
    };
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Basic metrics
  const length = cleanText.length;
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  
  // Calculate readability (Flesch Reading Ease approximation)
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgSyllablesPerWord = calculateAvgSyllables(words);
  const readabilityScore = Math.max(0, Math.min(100, 
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  ));

  // PA TV Style Guide compliance checks
  const styleIssues = checkPATVCompliance(cleanText);
  
  // Quality scoring
  const qualityScore = calculateQualityScore({
    length,
    wordCount,
    sentenceCount,
    readabilityScore,
    styleIssues: styleIssues.length
  });

  // Identify strengths and suggestions
  const { strengths, suggestions } = generateFeedback({
    length,
    wordCount,
    sentenceCount,
    readabilityScore,
    styleIssues,
    text: cleanText
  });

  // Enhanced quality assessments
  const semanticRichness = calculateSemanticRichness(cleanText, words);
  const professionalTone = calculateProfessionalTone(cleanText, words);
  const broadcastingStandards = calculateBroadcastingStandards(cleanText);
  const contentCompleteness = calculateContentCompleteness(cleanText);
  const efficiency = calculateEfficiency(cleanText, words);
  
  // Enhanced quality score (170 points total)
  const enhancedQualityScore = calculateEnhancedQualityScore({
    length,
    wordCount,
    sentenceCount,
    readabilityScore,
    styleIssues: styleIssues.length,
    semanticRichness,
    professionalTone,
    broadcastingStandards,
    contentCompleteness,
    efficiency
  });

  return {
    length,
    wordCount,
    sentenceCount,
    readabilityScore: Math.round(readabilityScore),
    qualityScore: Math.round(qualityScore), // Keep original for backward compatibility
    enhancedQualityScore: Math.round(enhancedQualityScore),
    issues: styleIssues,
    strengths,
    suggestions,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    // Enhanced scoring breakdown
    scoreBreakdown: {
      basic: {
        length: Math.round(calculateLengthScore(length)),
        wordCount: Math.round(calculateWordCountScore(wordCount)),
        readability: Math.round(calculateReadabilityScore(readabilityScore)),
        styleCompliance: Math.round(calculateStyleComplianceScore(styleIssues.length))
      },
      enhanced: {
        semanticRichness: Math.round(semanticRichness),
        professionalTone: Math.round(professionalTone),
        broadcastingStandards: Math.round(broadcastingStandards),
        contentCompleteness: Math.round(contentCompleteness),
        efficiency: Math.round(efficiency)
      }
    }
  };
};

const calculateAvgSyllables = (words) => {
  if (words.length === 0) return 0;
  
  const totalSyllables = words.reduce((sum, word) => {
    return sum + countSyllables(word);
  }, 0);
  
  return totalSyllables / words.length;
};

const countSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let syllables = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllables++;
    }
    previousWasVowel = isVowel;
  }
  
  if (word.endsWith('e')) syllables--;
  if (word.endsWith('le') && word.length > 2) syllables++;
  
  return Math.max(1, syllables);
};

const checkPATVCompliance = (text) => {
  const issues = [];
  
  // Check for common PA TV style issues
  if (text.match(/\b(very|really|quite|rather|pretty)\b/gi)) {
    issues.push('Contains unnecessary qualifying words (very, really, quite, etc.)');
  }
  
  if (text.match(/\b(amazing|fantastic|incredible|awesome)\b/gi)) {
    issues.push('Contains subjective adjectives - use factual descriptions');
  }
  
  if (text.match(/[.!?]\s*[a-z]/g)) {
    issues.push('Sentences should start with capital letters');
  }
  
  if (text.match(/\s{2,}/g)) {
    issues.push('Contains multiple consecutive spaces');
  }
  
  if (text.match(/\b(is|are|was|were)\s+(going\s+to|about\s+to)\b/gi)) {
    issues.push('Use active voice instead of passive constructions');
  }
  
  if (text.match(/\b(there\s+is|there\s+are|there\s+was|there\s+were)\b/gi)) {
    issues.push('Avoid "there is/are" constructions for more direct writing');
  }
  
  if (text.length > 700) {
    issues.push('Content exceeds 700 character limit for longest version');
  }
  
  if (text.match(/\b(can|could|may|might|should|would)\b/gi)) {
    issues.push('Consider using more definitive language where appropriate');
  }
  
  return issues;
};

const calculateQualityScore = ({ length, wordCount, sentenceCount, readabilityScore, styleIssues }) => {
  let score = 0;
  
  // Length appropriateness (0-25 points)
  if (length >= 50 && length <= 200) score += 25;
  else if (length >= 30 && length <= 300) score += 20;
  else if (length >= 20 && length <= 400) score += 15;
  else if (length > 0) score += 10;
  
  // Word count appropriateness (0-20 points)
  if (wordCount >= 10 && wordCount <= 50) score += 20;
  else if (wordCount >= 5 && wordCount <= 75) score += 15;
  else if (wordCount >= 3 && wordCount <= 100) score += 10;
  else if (wordCount > 0) score += 5;
  
  // Readability (0-30 points)
  if (readabilityScore >= 60) score += 30;
  else if (readabilityScore >= 50) score += 25;
  else if (readabilityScore >= 40) score += 20;
  else if (readabilityScore >= 30) score += 15;
  else if (readabilityScore >= 20) score += 10;
  else if (readabilityScore > 0) score += 5;
  
  // Style compliance (0-25 points)
  const styleScore = Math.max(0, 25 - (styleIssues * 3));
  score += styleScore;
  
  return Math.min(100, score);
};

const generateFeedback = ({ length, wordCount, sentenceCount, readabilityScore, styleIssues, text }) => {
  const strengths = [];
  const suggestions = [];
  
  // Identify strengths
  if (readabilityScore >= 60) {
    strengths.push('High readability score - easy to understand');
  }
  
  if (length >= 50 && length <= 200) {
    strengths.push('Good length for concise, informative content');
  }
  
  if (styleIssues.length === 0) {
    strengths.push('Follows PA TV style guidelines');
  }
  
  if (sentenceCount > 0 && wordCount / sentenceCount <= 15) {
    strengths.push('Good sentence length - not too complex');
  }
  
  if (text.match(/\b(who|what|when|where|why|how)\b/gi)) {
    strengths.push('Contains key information words');
  }
  
  // Generate suggestions
  if (readabilityScore < 50) {
    suggestions.push('Try shorter sentences and simpler words to improve readability');
  }
  
  if (length < 30) {
    suggestions.push('Content might be too brief - consider adding more detail');
  }
  
  if (length > 300) {
    suggestions.push('Content is quite long - consider condensing key points');
  }
  
  if (styleIssues.length > 0) {
    suggestions.push('Address PA TV style issues for better compliance');
  }
  
  if (sentenceCount > 0 && wordCount / sentenceCount > 20) {
    suggestions.push('Consider breaking up long sentences for better flow');
  }
  
  if (!text.match(/[.!?]$/)) {
    suggestions.push('Ensure content ends with proper punctuation');
  }
  
  return { strengths, suggestions };
};

export const compareContent = (content1, content2) => {
  const analysis1 = analyzeContent(content1);
  const analysis2 = analyzeContent(content2);
  
  const comparison = {
    winner: null,
    scoreDifference: Math.abs(analysis1.qualityScore - analysis2.qualityScore),
    improvements: [],
    keyDifferences: []
  };
  
  // Determine winner
  if (analysis1.qualityScore > analysis2.qualityScore) {
    comparison.winner = 'version1';
  } else if (analysis2.qualityScore > analysis1.qualityScore) {
    comparison.winner = 'version2';
  } else {
    comparison.winner = 'tie';
  }
  
  // Identify key differences
  if (Math.abs(analysis1.length - analysis2.length) > 50) {
    comparison.keyDifferences.push(`Significant length difference: ${analysis1.length} vs ${analysis2.length} characters`);
  }
  
  if (Math.abs(analysis1.readabilityScore - analysis2.readabilityScore) > 10) {
    comparison.keyDifferences.push(`Readability difference: ${analysis1.readabilityScore} vs ${analysis2.readabilityScore}`);
  }
  
  if (analysis1.issues.length !== analysis2.issues.length) {
    comparison.keyDifferences.push(`Style issues: ${analysis1.issues.length} vs ${analysis2.issues.length}`);
  }
  
  // Generate improvement suggestions
  const loser = comparison.winner === 'version1' ? analysis2 : analysis1;
  
  if (comparison.winner !== 'tie') {
    comparison.improvements = [
      ...loser.suggestions,
      `Consider adopting the ${comparison.winner === 'version1' ? 'first' : 'second'} version's approach`
    ];
  }
  
  return {
    analysis1,
    analysis2,
    comparison
  };
};

export const generateContentReport = (analyses) => {
  const totalItems = analyses.length;
  const avgQualityScore = analyses.reduce((sum, a) => sum + a.qualityScore, 0) / totalItems;
  const avgLength = analyses.reduce((sum, a) => sum + a.length, 0) / totalItems;
  const avgReadability = analyses.reduce((sum, a) => sum + a.readabilityScore, 0) / totalItems;
  
  const commonIssues = {};
  const commonStrengths = {};
  
  analyses.forEach(analysis => {
    analysis.issues.forEach(issue => {
      commonIssues[issue] = (commonIssues[issue] || 0) + 1;
    });
    
    analysis.strengths.forEach(strength => {
      commonStrengths[strength] = (commonStrengths[strength] || 0) + 1;
    });
  });
  
  const topIssues = Object.entries(commonIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count, percentage: Math.round((count / totalItems) * 100) }));
  
  const topStrengths = Object.entries(commonStrengths)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([strength, count]) => ({ strength, count, percentage: Math.round((count / totalItems) * 100) }));
  
  return {
    summary: {
      totalItems,
      avgQualityScore: Math.round(avgQualityScore),
      avgLength: Math.round(avgLength),
      avgReadability: Math.round(avgReadability)
    },
    topIssues,
    topStrengths,
    recommendations: generateRecommendations(avgQualityScore, avgLength, avgReadability, topIssues)
  };
};

const generateRecommendations = (avgQuality, avgLength, avgReadability, topIssues) => {
  const recommendations = [];
  
  if (avgQuality < 60) {
    recommendations.push('Focus on improving overall content quality through better structure and clarity');
  }
  
  if (avgLength > 300) {
    recommendations.push('Consider creating more concise versions of content');
  }
  
  if (avgReadability < 50) {
    recommendations.push('Simplify language and sentence structure to improve readability');
  }
  
  if (topIssues.length > 0 && topIssues[0].percentage > 50) {
    recommendations.push(`Address the most common issue: ${topIssues[0].issue}`);
  }
  
  return recommendations;
};

// Enhanced Quality Assessment Functions

// 1. Semantic Richness Score (0-15 points)
const calculateSemanticRichness = (text, words) => {
  let score = 0;
  
  // Unique Words Ratio (0-8 points)
  const uniqueWords = new Set(words.map(word => word.toLowerCase()));
  const uniqueRatio = words.length > 0 ? uniqueWords.size / words.length : 0;
  
  if (uniqueRatio > 0.8) score += 8;
  else if (uniqueRatio > 0.6) score += 6;
  else if (uniqueRatio > 0.4) score += 4;
  else score += 2;
  
  // Information Density (0-4 points)
  const properNouns = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const numbersAndDates = text.match(/\b\d+\b/g) || [];
  const technicalTerms = text.match(/\b(HD|BBC|ITV|Channel|programme|series|episode|broadcast|transmission)\b/gi) || [];
  
  if (properNouns.length > 0) score += 2;
  if (numbersAndDates.length > 0) score += 1;
  if (technicalTerms.length > 0) score += 1;
  
  // Descriptive Language (0-3 points)
  const adjectives = text.match(/\b(new|old|big|small|great|good|bad|interesting|exciting|dramatic|comedy|news|sport|music|documentary)\b/gi) || [];
  const adverbs = text.match(/\b\w+ly\b/g) || [];
  const descriptiveRatio = words.length > 0 ? (adjectives.length + adverbs.length) / words.length : 0;
  
  if (descriptiveRatio >= 0.1 && descriptiveRatio <= 0.2) score += 3;
  else if ((descriptiveRatio >= 0.05 && descriptiveRatio < 0.1) || (descriptiveRatio > 0.2 && descriptiveRatio <= 0.3)) score += 2;
  else if (descriptiveRatio > 0 && descriptiveRatio < 0.05) score += 1;
  
  return Math.min(15, score);
};

// 2. Professional Tone Score (0-15 points)
const calculateProfessionalTone = (text, words) => {
  let score = 0;
  
  // Formality Level (0-8 points)
  const informalWords = text.match(/\b(gonna|wanna|yeah|ok|cool|awesome|stuff|things|guy|guys)\b/gi) || [];
  const formalWords = text.match(/\b(programme|series|documentary|broadcast|transmission|presenter|featuring|including)\b/gi) || [];
  const contractions = text.match(/\b\w+[''](?:re|ve|ll|d|t|s)\b/gi) || [];
  
  if (informalWords.length === 0 && formalWords.length > 0) score += 8;
  else if (informalWords.length <= 1 && formalWords.length > 0) score += 6;
  else if (informalWords.length <= 2) score += 3;
  
  // Clarity Indicators (0-4 points)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const clearStructure = sentences.filter(s => s.match(/\b(who|what|when|where|why|how|featuring|starring|about|follows)\b/gi));
  if (clearStructure.length > sentences.length * 0.5) score += 2;
  
  const specificTerms = text.match(/\b(at|on|in|from|featuring|starring|with|including|about|follows|explores|reveals|presents)\b/gi) || [];
  if (specificTerms.length > words.length * 0.1) score += 2;
  
  // Engagement Factor (0-3 points)
  const passiveVoice = text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || [];
  const activeVoiceRatio = words.length > 0 ? Math.max(0, 1 - (passiveVoice.length / words.length * 10)) : 0;
  
  if (activeVoiceRatio > 0.7) score += 3;
  else if (activeVoiceRatio > 0.5) score += 2;
  else if (activeVoiceRatio > 0.3) score += 1;
  
  return Math.min(15, score);
};

// 3. Broadcasting Standards Score (0-10 points)
const calculateBroadcastingStandards = (text) => {
  let score = 0;
  
  // Time/Date Formatting (0-3 points)
  const timeFormats = text.match(/\b(\d{1,2}:\d{2}|\d{1,2}pm|\d{1,2}am|\d{1,2}\.\d{2})\b/gi) || [];
  const dateFormats = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december))\b/gi) || [];
  
  if (timeFormats.length > 0 || dateFormats.length > 0) score += 3;
  
  // Programme Terminology (0-4 points)
  const correctTerms = text.match(/\b(programme|series|episode|documentary|drama|comedy|news|sport|music|film|show|broadcast|transmission|presenter|featuring|starring)\b/gi) || [];
  const incorrectTerms = text.match(/\b(program|tv show|movie)\b/gi) || [];
  
  if (correctTerms.length > 0 && incorrectTerms.length === 0) score += 4;
  else if (correctTerms.length > incorrectTerms.length) score += 3;
  else if (correctTerms.length > 0) score += 2;
  
  // Accessibility Language (0-3 points)
  const accessibilityTerms = text.match(/\b(subtitles|sign language|audio description|accessible|inclusive)\b/gi) || [];
  const excludingLanguage = text.match(/\b(only|just|simply|merely)\b/gi) || [];
  
  if (accessibilityTerms.length > 0 || excludingLanguage.length === 0) score += 3;
  else if (excludingLanguage.length <= 1) score += 2;
  
  return Math.min(10, score);
};

// 4. Content Completeness Score (0-10 points)
const calculateContentCompleteness = (text) => {
  let score = 0;
  
  // Essential Information (0-6 points)
  const whoElements = text.match(/\b(featuring|starring|with|presenter|host|guests?|cast|actor|actress|comedian|musician|artist|expert|chef|doctor|professor)\b/gi) || [];
  const whatElements = text.match(/\b(drama|comedy|documentary|news|sport|music|film|series|episode|programme|show|report|interview|performance|competition|game|quiz)\b/gi) || [];
  const whenElements = text.match(/\b(\d{1,2}:\d{2}|\d{1,2}pm|\d{1,2}am|today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi) || [];
  const whereElements = text.match(/\b(from|in|at|live|location|studio|theatre|arena|stadium|london|manchester|cardiff|edinburgh|glasgow|birmingham|bristol|leeds|liverpool|newcastle|belfast)\b/gi) || [];
  
  const elementCount = [whoElements, whatElements, whenElements, whereElements].filter(arr => arr.length > 0).length;
  
  if (elementCount >= 4) score += 6;
  else if (elementCount >= 3) score += 4;
  else if (elementCount >= 2) score += 3;
  else if (elementCount >= 1) score += 2;
  
  // Context Appropriateness (0-4 points)
  const contextWords = text.match(/\b(about|follows|explores|reveals|presents|examines|investigates|discovers|uncovers|features|includes|contains|offers|provides)\b/gi) || [];
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  if (contextWords.length > 0 && wordCount >= 10 && wordCount <= 100) score += 4;
  else if (contextWords.length > 0 && wordCount >= 5) score += 3;
  else if (wordCount >= 5) score += 2;
  
  return Math.min(10, score);
};

// 5. Efficiency Score (0-10 points)
const calculateEfficiency = (text, words) => {
  let score = 0;
  
  // Character Economy (0-5 points)
  const informationWords = text.match(/\b(who|what|when|where|why|how|featuring|starring|about|follows|explores|reveals|presents|includes|with|from|in|at|on|during|after|before)\b/gi) || [];
  const fillerWords = text.match(/\b(very|really|quite|rather|pretty|somewhat|actually|basically|literally|obviously|clearly|simply|just|only|even|also|too|still|yet|however|therefore|thus|hence|moreover|furthermore|additionally|consequently|accordingly|meanwhile|nevertheless|nonetheless|otherwise|instead|alternatively|specifically|particularly|especially|notably|significantly|importantly|surprisingly|interestingly|fortunately|unfortunately|hopefully|presumably|apparently|seemingly|arguably|possibly|probably|definitely|certainly|surely|indeed|naturally|obviously|clearly|undoubtedly|unquestionably|admittedly|granted|frankly|honestly|personally|generally|typically|usually|normally|commonly|frequently|often|sometimes|occasionally|rarely|seldom|hardly|scarcely|barely|merely|simply|purely|solely|exclusively|entirely|completely|totally|absolutely|perfectly|exactly|precisely|specifically|particularly|especially|notably|significantly|importantly|surprisingly|interestingly|fortunately|unfortunately|hopefully|presumably|apparently|seemingly|arguably|possibly|probably|definitely|certainly|surely|indeed|naturally|obviously|clearly|undoubtedly|unquestionably|admittedly|granted|frankly|honestly|personally|generally|typically|usually|normally|commonly|frequently|often|sometimes|occasionally|rarely|seldom|hardly|scarcely|barely|merely|simply|purely|solely|exclusively|entirely|completely|totally|absolutely|perfectly|exactly|precisely)\b/gi) || [];
  
  const informationRatio = words.length > 0 ? informationWords.length / words.length : 0;
  const fillerRatio = words.length > 0 ? fillerWords.length / words.length : 0;
  
  if (informationRatio > 0.2 && fillerRatio < 0.1) score += 5;
  else if (informationRatio > 0.15 && fillerRatio < 0.15) score += 4;
  else if (informationRatio > 0.1 && fillerRatio < 0.2) score += 3;
  else if (informationRatio > 0.05) score += 2;
  
  // Redundancy Check (0-5 points)
  const wordFrequency = {};
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
  });
  
  const repeatedWords = Object.values(wordFrequency).filter(count => count > 1);
  const redundancyRatio = words.length > 0 ? repeatedWords.length / words.length : 0;
  
  if (redundancyRatio < 0.1) score += 5;
  else if (redundancyRatio < 0.2) score += 4;
  else if (redundancyRatio < 0.3) score += 3;
  else if (redundancyRatio < 0.4) score += 2;
  
  return Math.min(10, score);
};

// Individual scoring functions for breakdown
const calculateLengthScore = (length) => {
  if (length >= 50 && length <= 200) return 25;
  else if (length >= 30 && length <= 300) return 20;
  else if (length >= 20 && length <= 400) return 15;
  else if (length > 0) return 10;
  return 0;
};

const calculateWordCountScore = (wordCount) => {
  if (wordCount >= 10 && wordCount <= 50) return 20;
  else if (wordCount >= 5 && wordCount <= 75) return 15;
  else if (wordCount >= 3 && wordCount <= 100) return 10;
  else if (wordCount > 0) return 5;
  return 0;
};

const calculateReadabilityScore = (readabilityScore) => {
  if (readabilityScore >= 60) return 30;
  else if (readabilityScore >= 50) return 25;
  else if (readabilityScore >= 40) return 20;
  else if (readabilityScore >= 30) return 15;
  else if (readabilityScore >= 20) return 10;
  else if (readabilityScore > 0) return 5;
  return 0;
};

const calculateStyleComplianceScore = (styleIssues) => {
  return Math.max(0, 25 - (styleIssues * 3));
};

// Enhanced Quality Score Calculator (170 points total)
const calculateEnhancedQualityScore = ({
  length,
  wordCount,
  sentenceCount,
  readabilityScore,
  styleIssues,
  semanticRichness,
  professionalTone,
  broadcastingStandards,
  contentCompleteness,
  efficiency
}) => {
  // Basic scoring (100 points)
  const basicScore = calculateQualityScore({
    length,
    wordCount,
    sentenceCount,
    readabilityScore,
    styleIssues
  });
  
  // Enhanced scoring (70 points)
  const enhancedScore = semanticRichness + professionalTone + broadcastingStandards + contentCompleteness + efficiency;
  
  return basicScore + enhancedScore;
};