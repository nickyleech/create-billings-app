// Style guide utility for translation quality and consistency
// Implements broadcasting standards and terminology guidelines

import { STYLE_GUIDES } from './languageConfig';

// Generate style-aware translation prompt
export const generateStyleAwarePrompt = (sourceText, sourceLanguage, targetLanguage, styleGuide = 'bbc') => {
  const guide = STYLE_GUIDES[styleGuide];
  if (!guide) {
    throw new Error(`Style guide '${styleGuide}' not found`);
  }

  // Base prompt structure
  let prompt = `You are a professional translator specializing in broadcast media content. Your task is to translate from ${sourceLanguage} to ${targetLanguage} while adhering to the ${guide.name} standards.\n\n`;

  // Add style-specific instructions
  prompt += `STYLE GUIDE REQUIREMENTS (${guide.name}):\n`;

  // British spelling rules
  if (guide.rules.britishSpelling) {
    prompt += `- Use British English spelling throughout (e.g., "programme" not "program", "realise" not "realize", "organise" not "organise", "colour" not "color", "centre" not "center")\n`;
  }

  // Irish spelling rules
  if (guide.rules.irishSpelling) {
    prompt += `- Use Irish English spelling and terminology where appropriate\n`;
  }

  // Commercial tone
  if (guide.rules.commercialTone) {
    prompt += `- Maintain a professional commercial broadcasting tone\n`;
  }

  // Bilingual support
  if (guide.rules.bilingualSupport) {
    prompt += `- Respect bilingual broadcasting context and cultural sensitivity\n`;
  }

  // Welsh priority
  if (guide.rules.welshPriority) {
    prompt += `- Prioritize Welsh cultural context and terminology when appropriate\n`;
  }

  // Cultural sensitivity
  if (guide.rules.culturalSensitivity) {
    prompt += `- Maintain cultural sensitivity and local context\n`;
  }

  // Time format
  if (guide.rules.timeFormat) {
    prompt += `- Use ${guide.rules.timeFormat} time format\n`;
  }

  // Date format
  if (guide.rules.dateFormat) {
    prompt += `- Use ${guide.rules.dateFormat} date format\n`;
  }

  // No full stops rule
  if (guide.rules.noFullStops) {
    prompt += `- Do NOT end translations with full stops\n`;
  }

  // Terminology replacements
  if (guide.rules.terminology) {
    prompt += `- Use preferred terminology:\n`;
    Object.entries(guide.rules.terminology).forEach(([from, to]) => {
      prompt += `  • "${from}" → "${to}"\n`;
    });
  }

  // General broadcasting standards
  prompt += `\nGENERAL BROADCASTING STANDARDS:\n`;
  prompt += `- Maintain professional broadcasting tone and style\n`;
  prompt += `- Preserve any technical terms, proper names, and broadcasting conventions\n`;
  prompt += `- Keep the same register and formality level as the source text\n`;
  prompt += `- Ensure the translation is natural and fluent\n`;
  prompt += `- Preserve time references, dates, and technical broadcasting information\n`;
  prompt += `- Maintain the structure and flow of the original text\n`;
  prompt += `- Follow ${guide.region} broadcasting conventions\n`;

  // Add source text
  prompt += `\nSOURCE TEXT TO TRANSLATE:\n"${sourceText}"\n\n`;
  prompt += `Provide only the translated text without any additional explanations, formatting, or commentary.`;

  return prompt;
};

// Validate translation against style guide
export const validateTranslation = (translation, styleGuide = 'bbc') => {
  const guide = STYLE_GUIDES[styleGuide];
  if (!guide) {
    return { valid: false, errors: ['Invalid style guide'] };
  }

  const errors = [];
  const warnings = [];
  const suggestions = [];

  // Check British spelling
  if (guide.rules.britishSpelling) {
    const americanSpellings = {
      'program': 'programme',
      'realize': 'realise',
      'organize': 'organise',
      'color': 'colour',
      'center': 'centre',
      'theater': 'theatre',
      'meter': 'metre',
      'fiber': 'fibre',
      'defense': 'defence',
      'offense': 'offence'
    };

    Object.entries(americanSpellings).forEach(([american, british]) => {
      if (translation.toLowerCase().includes(american)) {
        errors.push(`Use British spelling: "${american}" should be "${british}"`);
      }
    });
  }

  // Check for full stops at end
  if (guide.rules.noFullStops && translation.endsWith('.')) {
    errors.push('Remove full stop at end of translation');
  }

  // Check terminology
  if (guide.rules.terminology) {
    Object.entries(guide.rules.terminology).forEach(([incorrect, correct]) => {
      if (translation.toLowerCase().includes(incorrect.toLowerCase())) {
        errors.push(`Use preferred terminology: "${incorrect}" should be "${correct}"`);
      }
    });
  }

  // Check for common broadcasting terms
  const broadcastingTerms = {
    'tv show': 'programme',
    'tv series': 'series',
    'episode': 'episode',
    'season': 'series',
    'channel': 'channel'
  };

  Object.entries(broadcastingTerms).forEach(([term, preferred]) => {
    if (translation.toLowerCase().includes(term) && term !== preferred) {
      suggestions.push(`Consider using "${preferred}" instead of "${term}"`);
    }
  });

  // Check length and structure
  if (translation.length < 10) {
    warnings.push('Translation seems very short');
  }

  if (translation.length > 1000) {
    warnings.push('Translation is very long - consider breaking into segments');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
  };
};

// Get style guide recommendations
export const getStyleGuideRecommendations = (sourceLanguage, targetLanguage, region = 'UK') => {
  const recommendations = [];

  // Recommend based on language pair and region
  if (sourceLanguage === 'cy' && targetLanguage === 'en-gb') {
    recommendations.push({
      styleGuide: 's4c',
      reason: 'Specialized in Welsh-English bilingual broadcasting',
      priority: 'high'
    });
    recommendations.push({
      styleGuide: 'bbc',
      reason: 'British broadcasting standards',
      priority: 'medium'
    });
  } else if (sourceLanguage === 'ga' && targetLanguage === 'en-gb') {
    recommendations.push({
      styleGuide: 'rte',
      reason: 'Irish broadcasting standards',
      priority: 'high'
    });
    recommendations.push({
      styleGuide: 'bbc',
      reason: 'British broadcasting standards',
      priority: 'medium'
    });
  } else if (targetLanguage === 'en-gb' && region === 'UK') {
    recommendations.push({
      styleGuide: 'bbc',
      reason: 'British broadcasting standards',
      priority: 'high'
    });
    recommendations.push({
      styleGuide: 'itv',
      reason: 'Commercial broadcasting alternative',
      priority: 'medium'
    });
  } else if (region === 'Europe') {
    recommendations.push({
      styleGuide: 'european',
      reason: 'European broadcasting standards',
      priority: 'high'
    });
  }

  // Default fallback
  if (recommendations.length === 0) {
    recommendations.push({
      styleGuide: 'bbc',
      reason: 'Industry standard for professional broadcasting',
      priority: 'medium'
    });
  }

  return recommendations;
};

// Generate quality report for translation
export const generateQualityReport = (originalText, translation, styleGuide = 'bbc') => {
  const validation = validateTranslation(translation, styleGuide);
  const guide = STYLE_GUIDES[styleGuide];

  return {
    styleGuide: {
      name: guide.name,
      code: styleGuide,
      description: guide.description
    },
    validation,
    metrics: {
      originalLength: originalText.length,
      translationLength: translation.length,
      lengthRatio: translation.length / originalText.length,
      wordCount: translation.split(/\s+/).length,
      readabilityScore: calculateReadabilityScore(translation)
    },
    recommendations: validation.suggestions,
    overallScore: validation.score
  };
};

// Simple readability score calculation
const calculateReadabilityScore = (text) => {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple readability formula (higher is better)
  const score = Math.max(0, 100 - (avgWordsPerSentence * 2));
  return Math.min(100, score);
};

// Apply style guide transformations
export const applyStyleGuideTransformations = (text, styleGuide = 'bbc') => {
  const guide = STYLE_GUIDES[styleGuide];
  if (!guide) return text;

  let transformedText = text;

  // Apply terminology replacements
  if (guide.rules.terminology) {
    Object.entries(guide.rules.terminology).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      transformedText = transformedText.replace(regex, to);
    });
  }

  // Remove full stops if required
  if (guide.rules.noFullStops && transformedText.endsWith('.')) {
    transformedText = transformedText.slice(0, -1);
  }

  return transformedText;
};

// Get all available style guides
export const getAllStyleGuides = () => {
  return Object.entries(STYLE_GUIDES)
    .map(([code, guide]) => ({ code, ...guide }));
};

export default {
  generateStyleAwarePrompt,
  validateTranslation,
  getStyleGuideRecommendations,
  generateQualityReport,
  applyStyleGuideTransformations,
  getAllStyleGuides
};