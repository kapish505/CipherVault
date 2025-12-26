/**
 * Database Connection
 * 
 * SQLite database initialization and connection management.
 * 
 * Security:
 * - Database file stored securely
 * - Prepared statements prevent SQL injection
 * - Foreign keys enforced
 */

import Database from 'better-sqlite3';
import { SCHEMA } from './schema.js';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'ciphervault.db');

let db: Database.Database | null = null;

/**
 * Initialize database
 */
export function initDatabase(): Database.Database {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Open database
    db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Create tables
    db.exec(SCHEMA);

    console.log('✅ Database initialized:', DB_PATH);

    return db;
}

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}
