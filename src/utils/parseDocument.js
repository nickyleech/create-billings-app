// Document parsing utilities for Welsh-English translation
// Handles RTF, DOC, DOCX, and TXT files

import mammoth from 'mammoth';

export const parseDocument = async (file) => {
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  try {
    switch (fileExtension) {
      case '.txt':
        return await parseTxtFile(file);
      case '.rtf':
        return await parseRtfFile(file);
      case '.doc':
      case '.docx':
        return await parseDocFile(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error(`Failed to parse ${fileExtension} file: ${error.message}`);
  }
};

// Parse plain text files
const parseTxtFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        resolve({
          text: content,
          metadata: {
            filename: file.name,
            size: file.size,
            type: 'text/plain'
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file, 'utf-8');
  });
};

// Parse RTF files
const parseRtfFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const rtfContent = e.target.result;
        const plainText = extractTextFromRTF(rtfContent);
        
        resolve({
          text: plainText,
          metadata: {
            filename: file.name,
            size: file.size,
            type: 'application/rtf',
            originalRtf: rtfContent
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read RTF file'));
    reader.readAsText(file, 'utf-8');
  });
};

// Parse DOC/DOCX files using mammoth
const parseDocFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        resolve({
          text: result.value,
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type,
            messages: result.messages
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read DOC/DOCX file'));
    reader.readAsArrayBuffer(file);
  });
};

// RTF text extraction utility
const extractTextFromRTF = (rtfContent) => {
  try {
    let text = rtfContent;
    
    // Remove RTF header and control words
    text = text.replace(/\\rtf\d+/g, '');
    text = text.replace(/\\ansi/g, '');
    text = text.replace(/\\deff\d+/g, '');
    text = text.replace(/\\deflang\d+/g, '');
    
    // Remove font table
    text = text.replace(/\{\\fonttbl[^}]*\}/g, '');
    
    // Remove color table
    text = text.replace(/\{\\colortbl[^}]*\}/g, '');
    
    // Remove style sheet
    text = text.replace(/\{\\stylesheet[^}]*\}/g, '');
    
    // Remove generator information
    text = text.replace(/\{\\\\generator[^}]*\}/g, '');
    
    // Remove control words with parameters
    text = text.replace(/\\[a-z]+\d*\s?/gi, '');
    
    // Remove control symbols
    text = text.replace(/\\[^a-z]/gi, '');
    
    // Remove braces
    text = text.replace(/[{}]/g, '');
    
    // Clean up multiple spaces and newlines
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');
    
    // Trim whitespace
    text = text.trim();
    
    return text;
  } catch (error) {
    console.error('Error extracting text from RTF:', error);
    // Fallback: return original content with basic cleanup
    return rtfContent.replace(/[{}\\]/g, '').replace(/\s+/g, ' ').trim();
  }
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