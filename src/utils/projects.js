const database = require('./database');

class ProjectService {
  // Create a new project
  async createProject(userId, projectData) {
    const { name, description, clientName, brandGuidelines, organizationType, organizationValue } = projectData;

    if (!name) {
      throw new Error('Project name is required');
    }

    const result = await database.run(
      `INSERT INTO projects (user_id, name, description, client_name, brand_guidelines, organization_type, organization_value) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, description, clientName, brandGuidelines, organizationType || 'none', organizationValue]
    );

    return await this.getProjectById(result.id);
  }

  // Get project by ID
  async getProjectById(projectId) {
    const project = await database.get(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  // Get all projects for a user
  async getUserProjects(userId, options = {}) {
    const { limit = 50, offset = 0, sortBy = 'updated_at', sortOrder = 'DESC' } = options;

    const projects = await database.all(
      `SELECT p.*, 
              COUNT(ce.id) as copy_count,
              MAX(ce.updated_at) as last_copy_update
       FROM projects p
       LEFT JOIN copy_entries ce ON p.id = ce.project_id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    return projects;
  }

  // Update project
  async updateProject(projectId, userId, updates) {
    const { name, description, clientName, brandGuidelines, organizationType, organizationValue } = updates;

    // Verify project belongs to user
    const project = await database.get(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    await database.run(
      `UPDATE projects 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           client_name = COALESCE(?, client_name),
           brand_guidelines = COALESCE(?, brand_guidelines),
           organization_type = COALESCE(?, organization_type),
           organization_value = COALESCE(?, organization_value),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, clientName, brandGuidelines, organizationType, organizationValue, projectId]
    );

    return await this.getProjectById(projectId);
  }

  // Delete project
  async deleteProject(projectId, userId) {
    // Verify project belongs to user
    const project = await database.get(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Delete project (cascade will handle related data)
    await database.run(
      'DELETE FROM projects WHERE id = ?',
      [projectId]
    );

    return { success: true };
  }

  // Create copy entry
  async createCopyEntry(projectId, userId, copyData) {
    const { 
      title, 
      originalText, 
      version90, 
      version180, 
      version700, 
      customVersions,
      tags 
    } = copyData;

    if (!originalText) {
      throw new Error('Original text is required');
    }

    // Verify project belongs to user
    const project = await database.get(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const result = await database.run(
      `INSERT INTO copy_entries 
       (project_id, user_id, title, original_text, version_90, version_180, version_700, custom_versions, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId, 
        userId, 
        title, 
        originalText, 
        version90, 
        version180, 
        version700,
        customVersions ? JSON.stringify(customVersions) : null,
        tags ? JSON.stringify(tags) : null
      ]
    );

    return await this.getCopyEntryById(result.id);
  }

  // Get copy entry by ID
  async getCopyEntryById(copyEntryId) {
    const entry = await database.get(
      `SELECT ce.*, p.name as project_name, p.client_name
       FROM copy_entries ce
       JOIN projects p ON ce.project_id = p.id
       WHERE ce.id = ?`,
      [copyEntryId]
    );

    if (!entry) {
      throw new Error('Copy entry not found');
    }

    // Parse JSON fields
    if (entry.custom_versions) {
      entry.custom_versions = JSON.parse(entry.custom_versions);
    }
    if (entry.tags) {
      entry.tags = JSON.parse(entry.tags);
    }

    return entry;
  }

  // Get all copy entries for a project
  async getProjectCopyEntries(projectId, userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      sortBy = 'updated_at', 
      sortOrder = 'DESC',
      status,
      search 
    } = options;

    // Verify project belongs to user
    const project = await database.get(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    let whereClause = 'WHERE ce.project_id = ?';
    let params = [projectId];

    if (status) {
      whereClause += ' AND ce.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (ce.title LIKE ? OR ce.original_text LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    params.push(limit, offset);

    const entries = await database.all(
      `SELECT ce.*, p.name as project_name, p.client_name
       FROM copy_entries ce
       JOIN projects p ON ce.project_id = p.id
       ${whereClause}
       ORDER BY ce.${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      params
    );

    // Parse JSON fields
    return entries.map(entry => {
      if (entry.custom_versions) {
        entry.custom_versions = JSON.parse(entry.custom_versions);
      }
      if (entry.tags) {
        entry.tags = JSON.parse(entry.tags);
      }
      return entry;
    });
  }

  // Update copy entry
  async updateCopyEntry(copyEntryId, userId, updates) {
    const { 
      title, 
      originalText, 
      version90, 
      version180, 
      version700, 
      customVersions,
      status,
      tags 
    } = updates;

    // Verify copy entry belongs to user
    const entry = await database.get(
      `SELECT ce.id FROM copy_entries ce
       JOIN projects p ON ce.project_id = p.id
       WHERE ce.id = ? AND p.user_id = ?`,
      [copyEntryId, userId]
    );

    if (!entry) {
      throw new Error('Copy entry not found or access denied');
    }

    // Save version history before updating
    await this.saveVersionHistory(copyEntryId, userId);

    await database.run(
      `UPDATE copy_entries 
       SET title = COALESCE(?, title),
           original_text = COALESCE(?, original_text),
           version_90 = COALESCE(?, version_90),
           version_180 = COALESCE(?, version_180),
           version_700 = COALESCE(?, version_700),
           custom_versions = COALESCE(?, custom_versions),
           status = COALESCE(?, status),
           tags = COALESCE(?, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, 
        originalText, 
        version90, 
        version180, 
        version700,
        customVersions ? JSON.stringify(customVersions) : undefined,
        status,
        tags ? JSON.stringify(tags) : undefined,
        copyEntryId
      ]
    );

    return await this.getCopyEntryById(copyEntryId);
  }

  // Save version history
  async saveVersionHistory(copyEntryId, userId, comment = null) {
    const currentEntry = await this.getCopyEntryById(copyEntryId);
    
    const versionData = {
      original_text: currentEntry.original_text,
      version_90: currentEntry.version_90,
      version_180: currentEntry.version_180,
      version_700: currentEntry.version_700,
      custom_versions: currentEntry.custom_versions,
      status: currentEntry.status,
      tags: currentEntry.tags,
      timestamp: new Date().toISOString()
    };

    await database.run(
      'INSERT INTO version_history (copy_entry_id, user_id, version_data, comment) VALUES (?, ?, ?, ?)',
      [copyEntryId, userId, JSON.stringify(versionData), comment]
    );
  }

  // Get version history for copy entry
  async getVersionHistory(copyEntryId, userId) {
    // Verify access
    const entry = await database.get(
      `SELECT ce.id FROM copy_entries ce
       JOIN projects p ON ce.project_id = p.id
       WHERE ce.id = ? AND p.user_id = ?`,
      [copyEntryId, userId]
    );

    if (!entry) {
      throw new Error('Copy entry not found or access denied');
    }

    const history = await database.all(
      `SELECT vh.*, u.first_name, u.last_name, u.email
       FROM version_history vh
       JOIN users u ON vh.user_id = u.id
       WHERE vh.copy_entry_id = ?
       ORDER BY vh.created_at DESC`,
      [copyEntryId]
    );

    return history.map(item => ({
      ...item,
      version_data: JSON.parse(item.version_data)
    }));
  }

  // Delete copy entry
  async deleteCopyEntry(copyEntryId, userId) {
    // Verify copy entry belongs to user
    const entry = await database.get(
      `SELECT ce.id FROM copy_entries ce
       JOIN projects p ON ce.project_id = p.id
       WHERE ce.id = ? AND p.user_id = ?`,
      [copyEntryId, userId]
    );

    if (!entry) {
      throw new Error('Copy entry not found or access denied');
    }

    await database.run(
      'DELETE FROM copy_entries WHERE id = ?',
      [copyEntryId]
    );

    return { success: true };
  }

  // Get project statistics
  async getProjectStats(projectId, userId) {
    // Verify project belongs to user
    const project = await database.get(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const stats = await database.get(
      `SELECT 
         COUNT(*) as total_entries,
         COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
         COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
         COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
         COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
         AVG(LENGTH(original_text)) as avg_original_length,
         MAX(updated_at) as last_updated
       FROM copy_entries 
       WHERE project_id = ?`,
      [projectId]
    );

    return stats;
  }
}

module.exports = new ProjectService();