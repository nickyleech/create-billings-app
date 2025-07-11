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

  return {
    length,
    wordCount,
    sentenceCount,
    readabilityScore: Math.round(readabilityScore),
    qualityScore: Math.round(qualityScore),
    issues: styleIssues,
    strengths,
    suggestions,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
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