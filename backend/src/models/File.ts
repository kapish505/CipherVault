/**
 * File Model
 * 
 * Database operations for file metadata.
 * 
 * Security:
 * - All sensitive data is encrypted
 * - Soft deletes (deleted_at)
 * - Owner verification required
 */

import { getDatabase } from '../db/index.js';

export interface FileMetadata {
  id: string;
  owner_wallet: string;
  name_encrypted: string;
  size: number;
  mime_type_encrypted: string;
  cid: string;
  encrypted_key: string;
  key_iv: string;
  file_iv: string;
  folder_id: string | null;
  classification: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface CreateFileInput {
  id: string;
  ownerWallet: string;
  nameEncrypted: string;
  size: number;
  mimeTypeEncrypted: string;
  cid: string;
  encryptedKey: string;
  keyIV: string;
  fileIV: string;
  folderId?: string | null;
  classification?: string;
}

/**
 * Create file metadata
 */
export function createFile(input: CreateFileInput): FileMetadata {
  const db = getDatabase();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO files (
      id, owner_wallet, name_encrypted, size, mime_type_encrypted,
      cid, encrypted_key, key_iv, file_iv, folder_id, classification,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `);

  return stmt.get(
    input.id,
    input.ownerWallet.toLowerCase(),
    input.nameEncrypted,
    input.size,
    input.mimeTypeEncrypted,
    input.cid,
    input.encryptedKey,
    input.keyIV,
    input.fileIV,
    input.folderId || null,
    input.classification || 'private',
    now,
    now
  ) as FileMetadata;
}

/**
 * Get files by owner wallet
 */
export function getFilesByOwner(
  walletAddress: string,
  limit: number = 50,
  offset: number = 0
): FileMetadata[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM files
    WHERE owner_wallet = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(walletAddress.toLowerCase(), limit, offset) as FileMetadata[];
}

/**
 * Get file by ID
 */
export function getFileById(fileId: string): FileMetadata | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM files
    WHERE id = ? AND deleted_at IS NULL
  `);

  return stmt.get(fileId) as FileMetadata | null;
}

/**
 * Update file metadata
 */
export function updateFile(
  fileId: string,
  updates: Partial<Pick<FileMetadata, 'name_encrypted' | 'mime_type_encrypted'>>
): FileMetadata | null {
  const db = getDatabase();
  const now = Date.now();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name_encrypted) {
    fields.push('name_encrypted = ?');
    values.push(updates.name_encrypted);
  }

  if (updates.mime_type_encrypted) {
    fields.push('mime_type_encrypted = ?');
    values.push(updates.mime_type_encrypted);
  }

  if (fields.length === 0) {
    return getFileById(fileId);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(fileId);

  const stmt = db.prepare(`
    UPDATE files
    SET ${fields.join(', ')}
    WHERE id = ? AND deleted_at IS NULL
    RETURNING *
  `);

  return stmt.get(...values) as FileMetadata | null;
}

/**
 * Soft delete file
 */
export function deleteFile(fileId: string): boolean {
  const db = getDatabase();
  const now = Date.now();

  const stmt = db.prepare(`
    UPDATE files
    SET deleted_at = ?
    WHERE id = ? AND deleted_at IS NULL
  `);

  const result = stmt.run(now, fileId);
  return result.changes > 0;
}

/**
 * Count files by owner
 */
export function countFilesByOwner(walletAddress: string): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM files
    WHERE owner_wallet = ? AND deleted_at IS NULL
  `);

  const result = stmt.get(walletAddress.toLowerCase()) as { count: number };
  return result.count;
}
