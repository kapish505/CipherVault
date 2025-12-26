/**
 * User Model
 * 
 * Database operations for users (wallet addresses).
 */

import { getDatabase } from '../db/index.js';

export interface User {
    id: number;
    wallet_address: string;
    created_at: number;
    last_seen: number;
}

/**
 * Create or update user
 */
export function upsertUser(walletAddress: string): User {
    const db = getDatabase();
    const now = Date.now();

    const stmt = db.prepare(`
    INSERT INTO users (wallet_address, created_at, last_seen)
    VALUES (?, ?, ?)
    ON CONFLICT(wallet_address) 
    DO UPDATE SET last_seen = ?
    RETURNING *
  `);

    return stmt.get(
        walletAddress.toLowerCase(),
        now,
        now,
        now
    ) as User;
}

/**
 * Get user by wallet address
 */
export function getUserByWallet(walletAddress: string): User | null {
    const db = getDatabase();

    const stmt = db.prepare(`
    SELECT * FROM users WHERE wallet_address = ?
  `);

    return stmt.get(walletAddress.toLowerCase()) as User | null;
}
