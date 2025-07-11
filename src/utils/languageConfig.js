// Language configuration for multi-language translation support
// Supports European languages commonly used in broadcasting

export const LANGUAGES = {
  // Celtic Languages
  'cy': {
    name: 'Welsh',
    nativeName: 'Cymraeg',
    flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    family: 'Celtic',
    region: 'Wales',
    iso639: 'cy',
    broadcasting: ['S4C', 'BBC Cymru Wales']
  },
  'ga': {
    name: 'Irish',
    nativeName: 'Gaeilge',
    flag: '🇮🇪',
    family: 'Celtic',
    region: 'Ireland',
    iso639: 'ga',
    broadcasting: ['RTÉ', 'TG4']
  },
  'gd': {
    name: 'Scottish Gaelic',
    nativeName: 'Gàidhlig',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    family: 'Celtic',
    region: 'Scotland',
    iso639: 'gd',
    broadcasting: ['BBC Alba']
  },
  
  // Germanic Languages
  'en-gb': {
    name: 'English (British)',
    nativeName: 'English (British)',
    flag: '🇬🇧',
    family: 'Germanic',
    region: 'United Kingdom',
    iso639: 'en',
    variant: 'gb',
    broadcasting: ['BBC', 'ITV', 'Channel 4', 'Sky']
  },
  'en-us': {
    name: 'English (American)',
    nativeName: 'English (American)',
    flag: '🇺🇸',
    family: 'Germanic',
    region: 'United States',
    iso639: 'en',
    variant: 'us',
    broadcasting: ['CNN', 'NBC', 'CBS', 'ABC']
  },
  'de': {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    family: 'Germanic',
    region: 'Germany',
    iso639: 'de',
    broadcasting: ['ARD', 'ZDF', 'RTL']
  },
  'nl': {
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    family: 'Germanic',
    region: 'Netherlands',
    iso639: 'nl',
    broadcasting: ['NPO', 'RTL Nederland']
  },
  'sv': {
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    family: 'Germanic',
    region: 'Sweden',
    iso639: 'sv',
    broadcasting: ['SVT', 'TV4']
  },
  'no': {
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    family: 'Germanic',
    region: 'Norway',
    iso639: 'no',
    broadcasting: ['NRK', 'TV 2']
  },
  'da': {
    name: 'Danish',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    family: 'Germanic',
    region: 'Denmark',
    iso639: 'da',
    broadcasting: ['DR', 'TV 2 Danmark']
  },
  
  // Romance Languages
  'fr': {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    family: 'Romance',
    region: 'France',
    iso639: 'fr',
    broadcasting: ['France Télévisions', 'TF1', 'M6']
  },
  'es': {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    family: 'Romance',
    region: 'Spain',
    iso639: 'es',
    broadcasting: ['RTVE', 'Antena 3', 'Telecinco']
  },
  'it': {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    family: 'Romance',
    region: 'Italy',
    iso639: 'it',
    broadcasting: ['RAI', 'Mediaset']
  },
  'pt': {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    family: 'Romance',
    region: 'Portugal',
    iso639: 'pt',
    broadcasting: ['RTP', 'SIC', 'TVI']
  }
};

// Common language pairs for broadcasting
export const POPULAR_LANGUAGE_PAIRS = [
  { source: 'cy', target: 'en-gb', name: 'Welsh → British English' },
  { source: 'ga', target: 'en-gb', name: 'Irish → British English' },
  { source: 'gd', target: 'en-gb', name: 'Scottish Gaelic → British English' },
  { source: 'fr', target: 'en-gb', name: 'French → British English' },
  { source: 'de', target: 'en-gb', name: 'German → British English' },
  { source: 'es', target: 'en-gb', name: 'Spanish → British English' },
  { source: 'en-gb', target: 'cy', name: 'British English → Welsh' },
  { source: 'en-gb', target: 'ga', name: 'British English → Irish' },
  { source: 'en-gb', target: 'fr', name: 'British English → French' }
];

// Language detection patterns and keywords
export const LANGUAGE_PATTERNS = {
  'cy': {
    // Welsh patterns
    commonWords: ['mae', 'ydy', 'yw', 'bod', 'mynd', 'dod', 'gwneud', 'cael', 'gallu', 'eisiau', 'hoffi', 'gwybod', 'meddwl', 'deall', 'siarad', 'gweithio', 'rhaglen', 'newyddion', 'cymru', 'cymraeg'],
    patterns: [/\b[a-z]*ch[a-z]*\b/i, /\b[a-z]*dd[a-z]*\b/i, /\b[a-z]*ff[a-z]*\b/i, /\b[a-z]*ll[a-z]*\b/i, /\b[a-z]*ng[a-z]*\b/i, /\b[a-z]*rh[a-z]*\b/i],
    diacritics: ['â', 'ê', 'î', 'ô', 'û', 'ŵ', 'ŷ']
  },
  'ga': {
    // Irish patterns
    commonWords: ['is', 'tá', 'agus', 'le', 'ar', 'sa', 'an', 'na', 'do', 'go', 'mar', 'féin', 'seo', 'sin', 'siúd', 'chuig', 'ó', 'faoi', 'roimh', 'tar', 'éis'],
    patterns: [/\b[a-z]*bh[a-z]*\b/i, /\b[a-z]*ch[a-z]*\b/i, /\b[a-z]*dh[a-z]*\b/i, /\b[a-z]*fh[a-z]*\b/i, /\b[a-z]*gh[a-z]*\b/i, /\b[a-z]*mh[a-z]*\b/i, /\b[a-z]*ph[a-z]*\b/i, /\b[a-z]*sh[a-z]*\b/i, /\b[a-z]*th[a-z]*\b/i],
    diacritics: ['á', 'é', 'í', 'ó', 'ú']
  },
  'gd': {
    // Scottish Gaelic patterns
    commonWords: ['tha', 'agus', 'air', 'ann', 'aig', 'le', 'do', 'gu', 'mar', 'fhèin', 'seo', 'sin', 'siud', 'chun', 'bho', 'fo', 'ro', 'às', 'dèidh'],
    patterns: [/\b[a-z]*bh[a-z]*\b/i, /\b[a-z]*ch[a-z]*\b/i, /\b[a-z]*dh[a-z]*\b/i, /\b[a-z]*fh[a-z]*\b/i, /\b[a-z]*gh[a-z]*\b/i, /\b[a-z]*mh[a-z]*\b/i, /\b[a-z]*ph[a-z]*\b/i, /\b[a-z]*sh[a-z]*\b/i, /\b[a-z]*th[a-z]*\b/i],
    diacritics: ['à', 'è', 'ì', 'ò', 'ù']
  },
  'fr': {
    // French patterns
    commonWords: ['le', 'de', 'et', 'à', 'un', 'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'vouloir', 'venir', 'falloir', 'devoir', 'croire', 'trouver', 'donner'],
    patterns: [/\b[a-z]*tion\b/i, /\b[a-z]*ment\b/i, /\b[a-z]*eur\b/i, /\b[a-z]*ique\b/i, /\b[a-z]*eux\b/i],
    diacritics: ['à', 'â', 'ç', 'è', 'é', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ']
  },
  'de': {
    // German patterns
    commonWords: ['der', 'die', 'das', 'und', 'ist', 'ich', 'nicht', 'sie', 'es', 'ein', 'zu', 'haben', 'für', 'auf', 'mit', 'als', 'sich', 'an', 'werden', 'aus'],
    patterns: [/\b[a-z]*ung\b/i, /\b[a-z]*keit\b/i, /\b[a-z]*schaft\b/i, /\b[a-z]*lich\b/i, /\bge[a-z]*\b/i],
    diacritics: ['ä', 'ö', 'ü', 'ß']
  },
  'es': {
    // Spanish patterns
    commonWords: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para'],
    patterns: [/\b[a-z]*ción\b/i, /\b[a-z]*idad\b/i, /\b[a-z]*mente\b/i, /\b[a-z]*ando\b/i, /\b[a-z]*endo\b/i],
    diacritics: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü']
  },
  'it': {
    // Italian patterns
    commonWords: ['il', 'di', 'che', 'è', 'e', 'a', 'in', 'un', 'per', 'non', 'con', 'da', 'su', 'del', 'la', 'al', 'lo', 'si', 'le', 'questo'],
    patterns: [/\b[a-z]*zione\b/i, /\b[a-z]*mente\b/i, /\b[a-z]*ando\b/i, /\b[a-z]*endo\b/i, /\b[a-z]*ità\b/i],
    diacritics: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú']
  }
};

// Style guide configurations
export const STYLE_GUIDES = {
  'bbc': {
    name: 'BBC Style Guide',
    description: 'British Broadcasting Corporation style standards',
    region: 'UK',
    rules: {
      britishSpelling: true,
      noFullStops: true,
      timeFormat: '24h',
      dateFormat: 'DD/MM/YYYY',
      terminology: {
        'program': 'programme',
        'realize': 'realise',
        'organize': 'organise',
        'color': 'colour',
        'center': 'centre'
      }
    }
  },
  'itv': {
    name: 'ITV Style Guide',
    description: 'Independent Television style standards',
    region: 'UK',
    rules: {
      britishSpelling: true,
      commercialTone: true,
      timeFormat: '12h',
      dateFormat: 'DD/MM/YYYY'
    }
  },
  's4c': {
    name: 'S4C Style Guide',
    description: 'Sianel Pedwar Cymru Welsh broadcasting standards',
    region: 'Wales',
    rules: {
      bilingualSupport: true,
      welshPriority: true,
      culturalSensitivity: true,
      britishSpelling: true
    }
  },
  'rte': {
    name: 'RTÉ Style Guide',
    description: 'Raidió Teilifís Éireann Irish broadcasting standards',
    region: 'Ireland',
    rules: {
      irishSpelling: true,
      bilingualSupport: true,
      culturalSensitivity: true,
      timeFormat: '24h'
    }
  },
  'european': {
    name: 'European Broadcasting',
    description: 'European broadcasting standards and terminology',
    region: 'Europe',
    rules: {
      multilingual: true,
      culturalNeutral: true,
      timeFormat: '24h',
      dateFormat: 'DD/MM/YYYY'
    }
  }
};

// Utility functions
export const getLanguageByCode = (code) => LANGUAGES[code] || null;

export const getLanguagesByFamily = (family) => {
  return Object.entries(LANGUAGES)
    .filter(([_, lang]) => lang.family === family)
    .map(([code, lang]) => ({ code, ...lang }));
};

export const getLanguagesByRegion = (region) => {
  return Object.entries(LANGUAGES)
    .filter(([_, lang]) => lang.region === region)
    .map(([code, lang]) => ({ code, ...lang }));
};

export const getSourceLanguages = () => {
  return Object.entries(LANGUAGES)
    .map(([code, lang]) => ({ code, ...lang }));
};

export const getTargetLanguages = () => {
  return Object.entries(LANGUAGES)
    .map(([code, lang]) => ({ code, ...lang }));
};

export const getStyleGuideByCode = (code) => STYLE_GUIDES[code] || null;

export const getAllStyleGuides = () => {
  return Object.entries(STYLE_GUIDES)
    .map(([code, guide]) => ({ code, ...guide }));
};

export default {
  LANGUAGES,
  POPULAR_LANGUAGE_PAIRS,
  LANGUAGE_PATTERNS,
  STYLE_GUIDES,
  getLanguageByCode,
  getLanguagesByFamily,
  getLanguagesByRegion,
  getSourceLanguages,
  getTargetLanguages,
  getStyleGuideByCode,
  getAllStyleGuides
};