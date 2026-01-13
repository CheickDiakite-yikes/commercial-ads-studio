import Database from 'better-sqlite3';
import path from 'path';

// Create database file in server directory
const dbPath = path.join(__dirname, '../../data/adstudio.db');
const db = new Database(dbPath);

// Initialize tables
export const initDb = () => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      concept TEXT,
      settings TEXT DEFAULT '{}',
      current_phase TEXT DEFAULT 'planning',
      music_url TEXT,
      voiceover_url TEXT,
      full_script TEXT,
      music_mood TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scenes (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      character TEXT,
      environment TEXT,
      camera TEXT,
      action_blocking TEXT,
      visual_summary_prompt TEXT,
      text_overlay TEXT,
      overlay_config TEXT,
      storyboard_url TEXT,
      video_url TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
    console.log('SQLite database initialized');
};

export default db;
