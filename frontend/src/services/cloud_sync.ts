import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import * as metadata from './metadata';
import * as encryption from './encryption';

const COLLECTION_NAME = 'backups';

export interface SyncStatus {
    loading: boolean;
    lastSynced: number | null;
    error: string | null;
}

/**
 * Save Encrypted Backup to Cloud
 * 
 * 1. Export local DB -> JSON
 * 2. Get wallet-derived key
 * 3. Encrypt JSON -> Ciphertext
 * 4. Upload Ciphertext to Firestore
 */
export async function saveEncryptedBackup(walletAddress: string): Promise<void> {
    if (!isFirebaseConfigured() || !db) {
        throw new Error('Firebase not configured');
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 1. Export
    const json = await metadata.exportDatabase(normalizedAddress);

    // 2. Derive Key
    // In production, signature should be passed in or cached. 
    // For MVP, we derive from address (less secure against keylogging, but OK for proof of concept if we assume local machine integrity)
    // Ideally user signs a message "Unlock Vault" and we use that signature.
    const key = await encryption.deriveKeyFromWallet(normalizedAddress);

    // 3. Encrypt
    const { cipherText, iv } = await encryption.encryptString(json, key);

    // 4. Upload
    const backupRef = doc(db, COLLECTION_NAME, normalizedAddress);
    await setDoc(backupRef, {
        data: cipherText,
        iv: iv,
        updatedAt: Timestamp.now(),
        version: 1
    });
}

/**
 * Restore Encrypted Backup from Cloud
 * 
 * 1. Download Ciphertext from Firestore
 * 2. Get wallet-derived key
 * 3. Decrypt Ciphertext -> JSON
 * 4. Import JSON -> Local DB
 */
export async function restoreEncryptedBackup(walletAddress: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !db) {
        console.warn('Firebase not configured, skipping restore');
        return false;
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 1. Download
    const backupRef = doc(db, COLLECTION_NAME, normalizedAddress);
    const snap = await getDoc(backupRef);

    if (!snap.exists()) {
        return false; // No backup found
    }

    const { data: cipherText, iv } = snap.data();

    // 2. Derive Key
    const key = await encryption.deriveKeyFromWallet(normalizedAddress);

    // 3. Decrypt
    try {
        const json = await encryption.decryptString(cipherText, iv, key);

        // 4. Import
        await metadata.importDatabase(json, normalizedAddress);
        return true;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt backup. Key mismatch or data corruption.');
    }
}

/**
 * Check if remote backup exists
 */
export async function hasRemoteBackup(walletAddress: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !db) return false;

    const normalizedAddress = walletAddress.toLowerCase();
    const backupRef = doc(db, COLLECTION_NAME, normalizedAddress);
    const snap = await getDoc(backupRef);
    return snap.exists();
}
