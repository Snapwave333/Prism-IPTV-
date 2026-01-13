import { db } from './database';

export const initSchema = () => {
  const createChannelsTable = `
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      group_title TEXT,
      logo_url TEXT,
      stream_url TEXT NOT NULL,
      is_favorite BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  // Potential future table for thumbnails/cache
  const createCacheTable = `
    CREATE TABLE IF NOT EXISTS thumbnail_cache (
      url TEXT PRIMARY KEY,
      local_path TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(createChannelsTable);
  db.exec(createCacheTable);
  console.log('Database schema initialized.');
};
