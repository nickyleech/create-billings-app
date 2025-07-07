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
        return await handleListProjects(req, res, user.id);

      case 'create':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleCreateProject(req, res, user.id);

      case 'get':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleGetProject(req, res, user.id, id);

      case 'update':
        if (req.method !== 'PUT') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleUpdateProject(req, res, user.id, id);

      case 'delete':
        if (req.method !== 'DELETE') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleDeleteProject(req, res, user.id, id);

      case 'stats':
        if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return await handleGetProjectStats(req, res, user.id, id);

      case 'copy-entries':
        if (req.method === 'GET') {
          return await handleListCopyEntries(req, res, user.id, id);
        } else if (req.method === 'POST') {
          return await handleCreateCopyEntry(req, res, user.id, id);
        }
        return res.status(405).json({ error: 'Method not allowed' });

      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function handleListProjects(req, res, userId) {
  const { limit, offset, sortBy, sortOrder } = req.query;
  
  const projects = await projectService.getUserProjects(userId, {
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    sortBy,
    sortOrder
  });

  res.status(200).json({ projects });
}

async function handleCreateProject(req, res, userId) {
  const { name, description, clientName, brandGuidelines } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const project = await projectService.createProject(userId, {
    name,
    description,
    clientName,
    brandGuidelines
  });

  res.status(201).json({
    message: 'Project created successfully',
    project
  });
}

async function handleGetProject(req, res, userId, projectId) {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const project = await projectService.getProjectById(projectId);
  
  // Verify ownership
  if (project.user_id !== userId) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.status(200).json({ project });
}

async function handleUpdateProject(req, res, userId, projectId) {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const { name, description, clientName, brandGuidelines } = req.body;

  const project = await projectService.updateProject(projectId, userId, {
    name,
    description,
    clientName,
    brandGuidelines
  });

  res.status(200).json({
    message: 'Project updated successfully',
    project
  });
}

async function handleDeleteProject(req, res, userId, projectId) {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  await projectService.deleteProject(projectId, userId);

  res.status(200).json({
    message: 'Project deleted successfully'
  });
}

async function handleGetProjectStats(req, res, userId, projectId) {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const stats = await projectService.getProjectStats(projectId, userId);

  res.status(200).json({ stats });
}

async function handleListCopyEntries(req, res, userId, projectId) {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const { limit, offset, sortBy, sortOrder, status, search } = req.query;

  const entries = await projectService.getProjectCopyEntries(projectId, userId, {
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    sortBy,
    sortOrder,
    status,
    search
  });

  res.status(200).json({ entries });
}

async function handleCreateCopyEntry(req, res, userId, projectId) {
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  const { 
    title, 
    originalText, 
    version90, 
    version180, 
    version700, 
    customVersions,
    tags 
  } = req.body;

  if (!originalText) {
    return res.status(400).json({ error: 'Original text is required' });
  }

  const entry = await projectService.createCopyEntry(projectId, userId, {
    title,
    originalText,
    version90,
    version180,
    version700,
    customVersions,
    tags
  });

  res.status(201).json({
    message: 'Copy entry created successfully',
    entry
  });
}

module.exports = handler;