const projectService = require('../src/utils/projects.js');
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

    const { action, id } = req.query;

    // Handle anonymous creation for timeline
    if (req.method === 'POST' && !action) {
      return await handleAnonymousCreate(req, res);
    }

    // Authenticate user for all other operations
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);

    switch (action) {
      case 'get':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleGetCopyEntry(req, res, user.id, id);

      case 'update':
        if (req.method !== 'PUT') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleUpdateCopyEntry(req, res, user.id, id);

      case 'delete':
        if (req.method !== 'DELETE') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleDeleteCopyEntry(req, res, user.id, id);

      case 'history':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleGetVersionHistory(req, res, user.id, id);

      case 'duplicate':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleDuplicateCopyEntry(req, res, user.id, id);

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Copy entries API error:', error);
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function handleAnonymousCreate(req, res) {
  const {
    original_text,
    custom_versions,
    custom_limits,
    style_preset,
    user_name,
    project_id,
    is_public = true
  } = req.body;

  if (!original_text || !original_text.trim()) {
    return res.status(400).json({ error: 'Original text is required' });
  }

  try {
    // Insert the copy entry directly into database for anonymous users
    const result = await database.run(
      `INSERT INTO copy_entries 
       (project_id, user_name, original_text, custom_versions, custom_limits, style_preset, is_public) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id || null,
        user_name || 'Anonymous',
        original_text,
        custom_versions ? JSON.stringify(custom_versions) : null,
        custom_limits ? JSON.stringify(custom_limits) : null,
        style_preset,
        is_public ? 1 : 0
      ]
    );

    // Get the created entry
    const entry = await database.get(
      'SELECT * FROM copy_entries WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      entry: {
        ...entry,
        custom_versions: entry.custom_versions ? JSON.parse(entry.custom_versions) : null,
        custom_limits: entry.custom_limits ? JSON.parse(entry.custom_limits) : null
      }
    });
  } catch (error) {
    console.error('Anonymous creation error:', error);
    throw error;
  }
}

async function handleGetCopyEntry(req, res, userId, entryId) {
  if (!entryId) {
    return res.status(400).json({ error: 'Copy entry ID is required' });
  }

  const entry = await projectService.getCopyEntryById(entryId);
  
  // Verify ownership through project
  const project = await projectService.getProjectById(entry.project_id);
  if (project.user_id !== userId) {
    return res.status(404).json({ error: 'Copy entry not found' });
  }

  res.status(200).json({ entry });
}

async function handleUpdateCopyEntry(req, res, userId, entryId) {
  if (!entryId) {
    return res.status(400).json({ error: 'Copy entry ID is required' });
  }

  const { 
    title, 
    originalText, 
    version90, 
    version180, 
    version700, 
    customVersions,
    status,
    tags 
  } = req.body;

  const entry = await projectService.updateCopyEntry(entryId, userId, {
    title,
    originalText,
    version90,
    version180,
    version700,
    customVersions,
    status,
    tags
  });

  res.status(200).json({
    message: 'Copy entry updated successfully',
    entry
  });
}

async function handleDeleteCopyEntry(req, res, userId, entryId) {
  if (!entryId) {
    return res.status(400).json({ error: 'Copy entry ID is required' });
  }

  await projectService.deleteCopyEntry(entryId, userId);

  res.status(200).json({
    message: 'Copy entry deleted successfully'
  });
}

async function handleGetVersionHistory(req, res, userId, entryId) {
  if (!entryId) {
    return res.status(400).json({ error: 'Copy entry ID is required' });
  }

  const history = await projectService.getVersionHistory(entryId, userId);

  res.status(200).json({ history });
}

async function handleDuplicateCopyEntry(req, res, userId, entryId) {
  if (!entryId) {
    return res.status(400).json({ error: 'Copy entry ID is required' });
  }

  // Get original entry
  const originalEntry = await projectService.getCopyEntryById(entryId);
  
  // Verify ownership through project
  const project = await projectService.getProjectById(originalEntry.project_id);
  if (project.user_id !== userId) {
    return res.status(404).json({ error: 'Copy entry not found' });
  }

  // Create duplicate with modified title
  const { newTitle, projectId } = req.body;
  const targetProjectId = projectId || originalEntry.project_id;

  const duplicateEntry = await projectService.createCopyEntry(targetProjectId, userId, {
    title: newTitle || `${originalEntry.title} (Copy)`,
    originalText: originalEntry.original_text,
    version90: originalEntry.version_90,
    version180: originalEntry.version_180,
    version700: originalEntry.version_700,
    customVersions: originalEntry.custom_versions,
    tags: originalEntry.tags
  });

  res.status(201).json({
    message: 'Copy entry duplicated successfully',
    entry: duplicateEntry
  });
}

module.exports = handler;