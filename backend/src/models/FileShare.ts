/**
 * File Share Model
 * 
 * Manages file sharing between users
 */

import { getDatabase } from '../db/index.js';

export interface FileShare {
  id: string;
  file_id: string;
  owner_wallet: string;
  shared_with_wallet: string;
  encrypted_key_for_recipient: string;
  permissions: 'read' | 'write';
  created_at: number;
  revoked_at: number | null;
}

export function createShare(
  share: Omit<FileShare, 'created_at' | 'revoked_at'>
): FileShare {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO file_shares (
      id, file_id, owner_wallet, shared_with_wallet,
      encrypted_key_for_recipient, permissions, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  stmt.run(
    share.id,
    share.file_id,
    share.owner_wallet.toLowerCase(),
    share.shared_with_wallet.toLowerCase(),
    share.encrypted_key_for_recipient,
    share.permissions,
    now
  );

  return {
    ...share,
    created_at: now,
    revoked_at: null,
  };
}

export function getSharesByFile(fileId: string): FileShare[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM file_shares
    WHERE file_id = ? AND revoked_at IS NULL
    ORDER BY created_at DESC
  `);

  return stmt.all(fileId) as FileShare[];
}

export function getSharesForUser(walletAddress: string): FileShare[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM file_shares
    WHERE shared_with_wallet = ? AND revoked_at IS NULL
    ORDER BY created_at DESC
  `);

  return stmt.all(walletAddress.toLowerCase()) as FileShare[];
}

export function getSharesByOwner(walletAddress: string): FileShare[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM file_shares
    WHERE owner_wallet = ? AND revoked_at IS NULL
    ORDER BY created_at DESC
  `);

  return stmt.all(walletAddress.toLowerCase()) as FileShare[];
}

export function revokeShare(shareId: string, ownerWallet: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE file_shares
    SET revoked_at = ?
    WHERE id = ? AND owner_wallet = ? AND revoked_at IS NULL
  `);

  const result = stmt.run(Date.now(), shareId, ownerWallet.toLowerCase());
  return result.changes > 0;
}

export function getShareById(shareId: string): FileShare | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM file_shares WHERE id = ?');
  return stmt.get(shareId) as FileShare | null;
}
