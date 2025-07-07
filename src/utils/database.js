const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../../data/billings.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Projects table
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        client_name TEXT,
        brand_guidelines TEXT,
        organization_type TEXT DEFAULT 'none', -- 'channel', 'genre', 'none'
        organization_value TEXT, -- Channel name or genre name
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Copy entries table
      `CREATE TABLE IF NOT EXISTS copy_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        user_id INTEGER,
        user_name TEXT, -- For anonymous users
        title TEXT,
        original_text TEXT NOT NULL,
        version_90 TEXT,
        version_180 TEXT,
        version_700 TEXT,
        custom_versions TEXT, -- JSON array for custom character limits
        custom_limits TEXT, -- JSON array of the limits used
        style_preset TEXT, -- Name of style preset used
        status TEXT DEFAULT 'draft', -- draft, review, approved, archived
        tags TEXT, -- JSON array of tags
        is_public BOOLEAN DEFAULT 1, -- Make content public by default
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,

      // Version history table
      `CREATE TABLE IF NOT EXISTS version_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        copy_entry_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        version_data TEXT NOT NULL, -- JSON containing all versions at this point
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (copy_entry_id) REFERENCES copy_entries (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Comments table for collaboration
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        copy_entry_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        version_target TEXT, -- which version this comment is about
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (copy_entry_id) REFERENCES copy_entries (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Analytics table
      `CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        copy_entry_id INTEGER,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL, -- generate, copy, export, etc.
        metadata TEXT, -- JSON with additional data
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (copy_entry_id) REFERENCES copy_entries (id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Style presets table
      `CREATE TABLE IF NOT EXISTS style_presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        character_limits TEXT NOT NULL, -- JSON array of limits
        style_rules TEXT, -- JSON object with style guidelines
        brand_keywords TEXT, -- JSON array of required keywords
        forbidden_words TEXT, -- JSON array of words to avoid
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`
    ];

    for (const sql of tables) {
      await this.run(sql);
    }

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_copy_entries_project_id ON copy_entries(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_copy_entries_user_id ON copy_entries(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_copy_entries_status ON copy_entries(status)',
      'CREATE INDEX IF NOT EXISTS idx_version_history_copy_entry_id ON version_history(copy_entry_id)',
      'CREATE INDEX IF NOT EXISTS idx_comments_copy_entry_id ON comments(copy_entry_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)'
    ];

    for (const sql of indexes) {
      await this.run(sql);
    }

    // Run migrations for existing databases
    await this.runMigrations();
  }

  async runMigrations() {
    try {
      // Check if organization columns exist in projects table
      const projectTableInfo = await this.all("PRAGMA table_info(projects)");
      const hasOrganizationType = projectTableInfo.some(col => col.name === 'organization_type');
      const hasOrganizationValue = projectTableInfo.some(col => col.name === 'organization_value');

      if (!hasOrganizationType) {
        await this.run("ALTER TABLE projects ADD COLUMN organization_type TEXT DEFAULT 'none'");
      }
      if (!hasOrganizationValue) {
        await this.run("ALTER TABLE projects ADD COLUMN organization_value TEXT");
      }

      // Check if new columns exist in copy_entries table
      const copyTableInfo = await this.all("PRAGMA table_info(copy_entries)");
      const hasUserName = copyTableInfo.some(col => col.name === 'user_name');
      const hasCustomLimits = copyTableInfo.some(col => col.name === 'custom_limits');
      const hasStylePreset = copyTableInfo.some(col => col.name === 'style_preset');
      const hasIsPublic = copyTableInfo.some(col => col.name === 'is_public');

      if (!hasUserName) {
        await this.run("ALTER TABLE copy_entries ADD COLUMN user_name TEXT");
      }
      if (!hasCustomLimits) {
        await this.run("ALTER TABLE copy_entries ADD COLUMN custom_limits TEXT");
      }
      if (!hasStylePreset) {
        await this.run("ALTER TABLE copy_entries ADD COLUMN style_preset TEXT");
      }
      if (!hasIsPublic) {
        await this.run("ALTER TABLE copy_entries ADD COLUMN is_public BOOLEAN DEFAULT 1");
      }

      // Make user_id and project_id nullable for anonymous users
      // SQLite doesn't support modifying foreign key constraints, so we'll handle this in application logic
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();