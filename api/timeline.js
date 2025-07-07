const database = require('../src/utils/database');

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database if needed
    if (!database.db) {
      await database.init();
    }

    // Get recent public copy entries with project information
    const timelineItems = await database.all(`
      SELECT 
        ce.id,
        ce.original_text,
        ce.version_90,
        ce.version_180,
        ce.version_700,
        ce.custom_versions,
        ce.custom_limits,
        ce.style_preset,
        ce.user_name,
        ce.created_at,
        p.name as project_name,
        p.organization_type,
        p.organization_value,
        u.first_name,
        u.last_name,
        u.email
      FROM copy_entries ce
      LEFT JOIN projects p ON ce.project_id = p.id
      LEFT JOIN users u ON ce.user_id = u.id
      WHERE ce.is_public = 1 AND ce.original_text IS NOT NULL
      ORDER BY ce.created_at DESC
      LIMIT 50
    `);

    // Process the timeline items to format versions properly
    const formattedItems = timelineItems.map(item => {
      const versions = {};
      
      // Parse custom limits to understand version structure
      let customLimits = [];
      try {
        if (item.custom_limits) {
          customLimits = JSON.parse(item.custom_limits);
        } else {
          // Default limits if none specified
          customLimits = [
            { label: 'Version 1', value: '90', type: 'characters' },
            { label: 'Version 2', value: '180', type: 'characters' },
            { label: 'Version 3', value: '700', type: 'characters' }
          ];
        }
      } catch (e) {
        customLimits = [
          { label: 'Version 1', value: '90', type: 'characters' },
          { label: 'Version 2', value: '180', type: 'characters' },
          { label: 'Version 3', value: '700', type: 'characters' }
        ];
      }

      // Parse custom versions or fall back to standard versions
      let customVersions = {};
      try {
        if (item.custom_versions) {
          customVersions = JSON.parse(item.custom_versions);
        }
      } catch (e) {
        customVersions = {};
      }

      // Map versions to the expected format
      customLimits.forEach((limit, index) => {
        const versionKey = `version${index + 1}`;
        let content = '';
        
        if (customVersions[versionKey]) {
          content = customVersions[versionKey];
        } else {
          // Fall back to standard version fields
          if (index === 0) content = item.version_90 || '';
          if (index === 1) content = item.version_180 || '';
          if (index === 2) content = item.version_700 || '';
        }

        if (content) {
          const actualCount = limit.type === 'words' 
            ? content.trim().split(/\s+/).filter(word => word.length > 0).length
            : content.length;

          versions[versionKey] = {
            label: limit.label,
            content: content,
            limit: `${limit.value} ${limit.type}`,
            actual_count: actualCount
          };
        }
      });

      // Determine user name
      let userName = item.user_name;
      if (!userName && item.first_name) {
        userName = `${item.first_name}${item.last_name ? ' ' + item.last_name : ''}`;
      }
      if (!userName && item.email) {
        userName = item.email.split('@')[0];
      }

      return {
        id: item.id,
        original_text: item.original_text,
        versions: versions,
        style_preset: item.style_preset,
        user_name: userName,
        project_name: item.project_name,
        organization_type: item.organization_type,
        organization_value: item.organization_value,
        created_at: item.created_at
      };
    }).filter(item => Object.keys(item.versions).length > 0); // Only include items with at least one version

    res.status(200).json({
      success: true,
      items: formattedItems,
      count: formattedItems.length
    });

  } catch (error) {
    console.error('Timeline API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch timeline',
      details: error.message 
    });
  }
}

module.exports = handler;