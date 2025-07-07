const authService = require('../src/utils/auth.js');
const database = require('../src/utils/database.js');

// Initialize database connection
let dbInitialized = false;

async function initDatabase() {
  if (!dbInitialized) {
    await database.init();
    dbInitialized = true;
  }
}

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await initDatabase();

    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);

    const { action, id } = req.query;

    switch (action) {
      case 'list':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleListPresets(req, res, user.id);

      case 'create':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleCreatePreset(req, res, user.id);

      case 'get':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleGetPreset(req, res, user.id, id);

      case 'update':
        if (req.method !== 'PUT') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleUpdatePreset(req, res, user.id, id);

      case 'delete':
        if (req.method !== 'DELETE') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleDeletePreset(req, res, user.id, id);

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Style presets API error:', error);
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function handleListPresets(req, res, userId) {
  const presets = await database.all(
    `SELECT * FROM style_presets 
     WHERE user_id = ? 
     ORDER BY updated_at DESC`,
    [userId]
  );

  // Parse JSON fields
  const formattedPresets = presets.map(preset => ({
    ...preset,
    character_limits: preset.character_limits ? JSON.parse(preset.character_limits) : [],
    style_rules: preset.style_rules ? JSON.parse(preset.style_rules) : {},
    brand_keywords: preset.brand_keywords ? JSON.parse(preset.brand_keywords) : [],
    forbidden_words: preset.forbidden_words ? JSON.parse(preset.forbidden_words) : []
  }));

  res.status(200).json({ presets: formattedPresets });
}

async function handleCreatePreset(req, res, userId) {
  const { 
    name, 
    description, 
    characterLimits, 
    styleRules, 
    brandKeywords, 
    forbiddenWords 
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Preset name is required' });
  }

  const result = await database.run(
    `INSERT INTO style_presets 
     (user_id, name, description, character_limits, style_rules, brand_keywords, forbidden_words) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      name,
      description || null,
      JSON.stringify(characterLimits || []),
      JSON.stringify(styleRules || {}),
      JSON.stringify(brandKeywords || []),
      JSON.stringify(forbiddenWords || [])
    ]
  );

  const preset = await database.get(
    'SELECT * FROM style_presets WHERE id = ?',
    [result.id]
  );

  res.status(201).json({
    message: 'Style preset created successfully',
    preset: {
      ...preset,
      character_limits: JSON.parse(preset.character_limits),
      style_rules: JSON.parse(preset.style_rules),
      brand_keywords: JSON.parse(preset.brand_keywords),
      forbidden_words: JSON.parse(preset.forbidden_words)
    }
  });
}

async function handleGetPreset(req, res, userId, presetId) {
  if (!presetId) {
    return res.status(400).json({ error: 'Preset ID is required' });
  }

  const preset = await database.get(
    'SELECT * FROM style_presets WHERE id = ? AND user_id = ?',
    [presetId, userId]
  );

  if (!preset) {
    return res.status(404).json({ error: 'Style preset not found' });
  }

  res.status(200).json({
    preset: {
      ...preset,
      character_limits: JSON.parse(preset.character_limits),
      style_rules: JSON.parse(preset.style_rules),
      brand_keywords: JSON.parse(preset.brand_keywords),
      forbidden_words: JSON.parse(preset.forbidden_words)
    }
  });
}

async function handleUpdatePreset(req, res, userId, presetId) {
  if (!presetId) {
    return res.status(400).json({ error: 'Preset ID is required' });
  }

  const { 
    name, 
    description, 
    characterLimits, 
    styleRules, 
    brandKeywords, 
    forbiddenWords 
  } = req.body;

  // Verify preset belongs to user
  const existing = await database.get(
    'SELECT id FROM style_presets WHERE id = ? AND user_id = ?',
    [presetId, userId]
  );

  if (!existing) {
    return res.status(404).json({ error: 'Style preset not found' });
  }

  await database.run(
    `UPDATE style_presets 
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         character_limits = COALESCE(?, character_limits),
         style_rules = COALESCE(?, style_rules),
         brand_keywords = COALESCE(?, brand_keywords),
         forbidden_words = COALESCE(?, forbidden_words),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      name,
      description,
      characterLimits ? JSON.stringify(characterLimits) : undefined,
      styleRules ? JSON.stringify(styleRules) : undefined,
      brandKeywords ? JSON.stringify(brandKeywords) : undefined,
      forbiddenWords ? JSON.stringify(forbiddenWords) : undefined,
      presetId
    ]
  );

  const preset = await database.get(
    'SELECT * FROM style_presets WHERE id = ?',
    [presetId]
  );

  res.status(200).json({
    message: 'Style preset updated successfully',
    preset: {
      ...preset,
      character_limits: JSON.parse(preset.character_limits),
      style_rules: JSON.parse(preset.style_rules),
      brand_keywords: JSON.parse(preset.brand_keywords),
      forbidden_words: JSON.parse(preset.forbidden_words)
    }
  });
}

async function handleDeletePreset(req, res, userId, presetId) {
  if (!presetId) {
    return res.status(400).json({ error: 'Preset ID is required' });
  }

  // Verify preset belongs to user
  const existing = await database.get(
    'SELECT id FROM style_presets WHERE id = ? AND user_id = ?',
    [presetId, userId]
  );

  if (!existing) {
    return res.status(404).json({ error: 'Style preset not found' });
  }

  await database.run(
    'DELETE FROM style_presets WHERE id = ?',
    [presetId]
  );

  res.status(200).json({
    message: 'Style preset deleted successfully'
  });
}

module.exports = handler;