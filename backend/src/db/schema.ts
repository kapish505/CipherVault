/**
 * Database Schema
 * 
 * SQLite schema for CipherVault metadata storage.
 * 
 * Security:
 * - Stores encrypted metadata only
 * - Never stores plaintext file content
 * - Wallet addresses as user identifiers
 */

export const SCHEMA = `
-- Users table (wallet addresses)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL
);

-- Files table (encrypted metadata)
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  name_encrypted TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type_encrypted TEXT NOT NULL,
  cid TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_iv TEXT NOT NULL,
  file_iv TEXT NOT NULL,
  folder_id TEXT,
  classification TEXT DEFAULT 'private',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (owner_wallet) REFERENCES users(wallet_address),
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- File shares table
CREATE TABLE IF NOT EXISTS file_shares (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  owner_wallet TEXT NOT NULL,
  shared_with_wallet TEXT NOT NULL,
  encrypted_key_for_recipient TEXT NOT NULL,
  permissions TEXT NOT NULL DEFAULT 'read',
  created_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_files_created ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_deleted ON files(deleted_at);
CREATE INDEX IF NOT EXISTS idx_shares_recipient ON file_shares(shared_with_wallet);
CREATE INDEX IF NOT EXISTS idx_shares_file ON file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_folders_owner ON folders(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
`;
