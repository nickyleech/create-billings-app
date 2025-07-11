// Document parsing utilities for Welsh-English translation
// Handles Excel (.xlsx, .xls) files

import * as XLSX from 'xlsx';

export const parseDocument = async (file) => {
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  try {
    switch (fileExtension) {
      case '.xlsx':
      case '.xls':
        return await parseExcelFile(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error(`Failed to parse ${fileExtension} file: ${error.message}`);
  }
};

// Parse Excel files
const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convert the Excel data to text by joining all cells
        const allText = jsonData
          .map(row => row.join(' '))
          .join('\n')
          .trim();
        
        resolve({
          text: allText,
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type,
            sheets: workbook.SheetNames,
            rows: jsonData.length
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsBinaryString(file);
  });
};


// Welsh text identification utility
export const identifyWelshSegments = (text) => {
  // Common Welsh words and patterns for identification
  const welshIndicators = [
    // Common Welsh words
    'a', 'ac', 'am', 'ar', 'at', 'dan', 'dros', 'drwy', 'gan', 'gyda', 'heb',
    'hyd', 'i', 'mewn', 'o', 'rhwng', 'trwy', 'wrth', 'y', 'yn', 'yr',
    
    // Welsh-specific letter combinations
    'ch', 'dd', 'ff', 'll', 'ng', 'ph', 'rh', 'th',
    
    // Common Welsh words
    'mae', 'ydy', 'yw', 'bod', 'mynd', 'dod', 'gwneud', 'cael', 'gallu',
    'eisiau', 'hoffi', 'gwybod', 'meddwl', 'deall', 'siarad', 'gweithio',
    
    // Welsh place names and terms
    'cymru', 'cymraeg', 'gogledd', 'deheudir', 'canolbarth', 'sir', 'dinas',
    'tref', 'pentref', 'afon', 'mynydd', 'mor', 'llyn',
    
    // TV/Media Welsh terms
    'rhaglen', 'newyddion', 'chwaraeon', 'cerddoriaeth', 'drama', 'comedi',
    'ffilm', 'dogfen', 'teledu', 'radio', 'sianel', 'darlledu',
    
    // Time and date Welsh terms
    'heddiw', 'ddoe', 'yfory', 'wythnos', 'mis', 'blwyddyn', 'diwrnod',
    'bore', 'prynhawn', 'noson', 'nos',
    
    // Numbers in Welsh
    'un', 'dau', 'tri', 'pedwar', 'pump', 'chwech', 'saith', 'wyth', 'naw', 'deg'
  ];
  
  // Welsh-specific patterns
  const welshPatterns = [
    /\b[a-z]*ch[a-z]*\b/i,    // Words containing 'ch'
    /\b[a-z]*dd[a-z]*\b/i,    // Words containing 'dd'
    /\b[a-z]*ff[a-z]*\b/i,    // Words containing 'ff'
    /\b[a-z]*ll[a-z]*\b/i,    // Words containing 'll'
    /\b[a-z]*ng[a-z]*\b/i,    // Words containing 'ng'
    /\b[a-z]*rh[a-z]*\b/i,    // Words containing 'rh'
    /\b[a-z]*th[a-z]*\b/i,    // Words containing 'th'
    /\b[a-z]*wr[a-z]*\b/i,    // Words containing 'wr'
    /\b[a-z]*wy[a-z]*\b/i,    // Words containing 'wy'
    /\b[a-z]*ydd[a-z]*\b/i,   // Words containing 'ydd'
  ];
  
  // Split text into meaningful segments (sentences, paragraphs, or logical chunks)
  const segments = text.split(/(?<=[.!?])\s+|(?:\n\s*\n)/);
  const welshSegments = [];
  
  segments.forEach((segment, index) => {
    const cleanSegment = segment.trim();
    if (cleanSegment.length < 10) return; // Skip very short segments
    
    const words = cleanSegment.toLowerCase().split(/\s+/);
    let welshScore = 0;
    
    // Check for Welsh indicator words
    const welshWordCount = words.filter(word => 
      welshIndicators.some(indicator => word.includes(indicator))
    ).length;
    
    // Check for Welsh-specific patterns
    const patternMatches = welshPatterns.filter(pattern => 
      pattern.test(cleanSegment)
    ).length;
    
    // Calculate Welsh likelihood score
    welshScore += (welshWordCount / words.length) * 0.7; // 70% weight for word matching
    welshScore += (patternMatches / welshPatterns.length) * 0.3; // 30% weight for pattern matching
    
    // Consider it Welsh if score is above threshold
    if (welshScore > 0.3) { // 30% threshold
      welshSegments.push({
        id: index,
        originalText: cleanSegment,
        translatedText: '',
        isWelsh: true,
        confidence: welshScore,
        wordCount: words.length
      });
    }
  });
  
  return welshSegments;
};

// Generate translation prompt for Welsh to English
export const generateTranslationPrompt = (welshText) => {
  return `You are a professional Welsh to English translator specializing in British television and media content.

Your task is to translate the following Welsh text to British English while maintaining the professional tone and style appropriate for TV metadata and broadcasting.

IMPORTANT REQUIREMENTS:
- Use British English spelling and terminology throughout (e.g., "programme" not "program", "realise" not "realize")
- Maintain the professional broadcasting style and tone
- Preserve any technical terms, proper names, and broadcasting conventions
- Keep the same register and formality level as the original Welsh text
- Ensure the translation is natural and fluent in British English
- Preserve any time references, dates, and technical broadcasting information
- Maintain the structure and flow of the original text

Welsh text to translate:
"${welshText}"

Provide only the English translation without any additional text, explanations, or formatting.`;
};

// Utility to reconstruct document with translations
export const reconstructDocument = (originalText, translationResults) => {
  let reconstructedText = originalText;
  
  // Sort by position to avoid offset issues
  const sortedResults = translationResults.sort((a, b) => 
    originalText.indexOf(a.originalText) - originalText.indexOf(b.originalText)
  );
  
  // Replace Welsh segments with English translations
  sortedResults.forEach(result => {
    if (result.translatedText && result.translatedText !== '[Translation failed]') {
      reconstructedText = reconstructedText.replace(result.originalText, result.translatedText);
    }
  });
  
  return reconstructedText;
};

// Export utility functions
const parseDocumentUtils = {
  parseDocument,
  identifyWelshSegments,
  generateTranslationPrompt,
  reconstructDocument
};

export default parseDocumentUtils;