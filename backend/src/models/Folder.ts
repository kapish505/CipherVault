/**
 * Folder Model
 * 
 * Manages folder organization
 */

import { getDatabase } from '../db/index.js';

export interface Folder {
    id: string;
    owner_wallet: string;
    name: string;
    parent_id: string | null;
    created_at: number;
    updated_at: number;
    deleted_at: number | null;
}

export function createFolder(folder: Omit<Folder, 'created_at' | 'updated_at' | 'deleted_at'>): Folder {
    const db = getDatabase();
    const now = Date.now();

    const stmt = db.prepare(`
    INSERT INTO folders (id, owner_wallet, name, parent_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        folder.id,
        folder.owner_wallet.toLowerCase(),
        folder.name,
        folder.parent_id,
        now,
        now
    );

    return {
        ...folder,
        created_at: now,
        updated_at: now,
        deleted_at: null,
    };
}

export function getFoldersByWallet(walletAddress: string): Folder[] {
    const db = getDatabase();
    const stmt = db.prepare(`
    SELECT * FROM folders
    WHERE owner_wallet = ? AND deleted_at IS NULL
    ORDER BY name ASC
  `);

    return stmt.all(walletAddress.toLowerCase()) as Folder[];
}

export function getFolderById(folderId: string): Folder | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM folders WHERE id = ? AND deleted_at IS NULL');
    return stmt.get(folderId) as Folder | null;
}

export function updateFolder(folderId: string, name: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`
    UPDATE folders
    SET name = ?, updated_at = ?
    WHERE id = ? AND deleted_at IS NULL
  `);

    const result = stmt.run(name, Date.now(), folderId);
    return result.changes > 0;
}

export function deleteFolder(folderId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`
    UPDATE folders
    SET deleted_at = ?
    WHERE id = ? AND deleted_at IS NULL
  `);

    const result = stmt.run(Date.now(), folderId);
    return result.changes > 0;
}
