export const generateStyleInstructions = (styleRules, forbiddenWords = []) => {
  const instructions = [];
  
  if (styleRules.britishEnglish) {
    instructions.push({
      id: 'britishEnglish',
      rule: "Use British English spelling throughout",
      description: "Ensures colour (not color), programme (not program), centre (not center), etc.",
      examples: ["colour, programme, centre, realise, organisation"],
      impact: "Maintains consistency with PA TV style guide and British broadcasting standards"
    });
  }
  
  if (styleRules.noFullStops) {
    instructions.push({
      id: 'noFullStops',
      rule: "Do NOT end any version with a full stop",
      description: "Prevents trailing periods at the end of content versions",
      examples: ["'Drama series' not 'Drama series.'"],
      impact: "Follows PA TV metadata formatting conventions"
    });
  }
  
  instructions.push({
    id: 'originalContent',
    rule: "Only use content from the original copy - do not add AI-generated content to fill character limits",
    description: "Ensures all content comes from the source material",
    examples: ["Condense existing text rather than adding new information"],
    impact: "Maintains editorial integrity and accuracy"
  });
  
  instructions.push({
    id: 'patvGuide',
    rule: "Follow the PA TV style guide for locations, people, repetition, and general formatting",
    description: "Adheres to established broadcast metadata standards",
    examples: ["Proper location formatting, person titles, etc."],
    impact: "Ensures industry standard compliance"
  });
  
  if (styleRules.avoidRepetition) {
    instructions.push({
      id: 'avoidRepetition',
      rule: "Avoid repetition within billings and echoes from titles",
      description: "Prevents redundant information across different versions",
      examples: ["Don't repeat show title in the description"],
      impact: "Creates more varied and informative content"
    });
  }
  
  if (styleRules.includeDescriptors) {
    instructions.push({
      id: 'includeDescriptors',
      rule: "Include descriptors for people when relevant",
      description: "Adds context about who people are",
      examples: ["'Actor John Smith' rather than just 'John Smith'"],
      impact: "Provides better context for viewers"
    });
  }
  
  instructions.push({
    id: 'compassPoints',
    rule: "Use proper compass point capitalisation",
    description: "Standardizes geographical direction formatting",
    examples: ["North London, South West England"],
    impact: "Maintains consistent geographical references"
  });
  
  instructions.push({
    id: 'accents',
    rule: "Include accented characters where appropriate",
    description: "Preserves proper spelling of foreign names and words",
    examples: ["José, café, naïve"],
    impact: "Maintains accuracy and respect for proper names"
  });
  
  if (forbiddenWords.length > 0) {
    instructions.push({
      id: 'forbiddenWords',
      rule: `NEVER use these forbidden words: ${forbiddenWords.join(', ')}`,
      description: "Completely avoids specified words or phrases",
      examples: forbiddenWords.map(word => `Avoid: "${word}"`),
      impact: "Ensures content meets specific editorial requirements"
    });
  }
  
  if (styleRules.customInstructions) {
    instructions.push({
      id: 'customInstructions',
      rule: `Additional instructions: ${styleRules.customInstructions}`,
      description: "Custom editorial requirements specific to this preset",
      examples: ["Varies based on custom instructions"],
      impact: "Addresses specific editorial needs"
    });
  }
  
  return instructions;
};

export const generatePromptPreview = (styleRules, forbiddenWords = [], customLimits = [], inputText = '[Your input text]') => {
  const instructions = generateStyleInstructions(styleRules, forbiddenWords);
  const styleInstructionsText = instructions.map((inst, index) => `${index + 1}. ${inst.rule}`).join('\n');
  
  const limitsText = customLimits.map((limit, index) => 
    `- ${limit.label}: MUST NOT exceed ${limit.value} ${limit.type} including spaces and punctuation`
  ).join('\n');

  const resultFormat = customLimits.reduce((acc, limit, index) => {
    acc[`version${index + 1}`] = `${limit.label} under ${limit.value} ${limit.type}`;
    return acc;
  }, {});

  return `You are a professional content editor specialising in British television metadata. Your task is to create ${customLimits.length} different versions of the provided copy.

STYLE RULES:
${styleInstructionsText}

INPUT TEXT: "${inputText}"

Create exactly ${customLimits.length} versions:
${limitsText}

For word limits, count individual words separated by spaces.
For character limits, count all characters including spaces and punctuation.
CRITICAL: Each version must be exactly under the specified character/word limit. Never exceed the limits.
If there is insufficient original content to meaningfully fill a longer version, leave it blank.

Respond with a JSON object in this exact format:
${JSON.stringify(resultFormat, null, 2)}

Your entire response must be valid JSON only. Do not include any other text or formatting.`;
};

export const getStyleRuleExplanations = () => {
  return {
    britishEnglish: {
      title: "British English Spelling",
      description: "Uses British spelling conventions throughout all content",
      examples: ["colour (not color)", "programme (not program)", "centre (not center)", "realise (not realize)"],
      impact: "Maintains consistency with PA TV style guide and British broadcasting standards"
    },
    noFullStops: {
      title: "No Trailing Full Stops",
      description: "Prevents periods at the end of content versions",
      examples: ["'Drama series about family life' not 'Drama series about family life.'"],
      impact: "Follows PA TV metadata formatting conventions"
    },
    includeDescriptors: {
      title: "Include Person Descriptors",
      description: "Adds context about who people are in the content",
      examples: ["'Actor John Smith' rather than 'John Smith'", "'Director Sarah Jones' not just 'Sarah Jones'"],
      impact: "Provides better context and clarity for viewers"
    },
    avoidRepetition: {
      title: "Avoid Repetition",
      description: "Prevents redundant information within and across versions",
      examples: ["Don't repeat show title in description", "Vary language between versions"],
      impact: "Creates more varied and informative content"
    },
    customInstructions: {
      title: "Custom Instructions",
      description: "Additional specific requirements for this style preset",
      examples: ["Varies based on your custom instructions"],
      impact: "Addresses specific editorial needs and requirements"
    }
  };
};