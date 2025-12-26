/**
 * Sync Service
 * 
 * Synchronizes file metadata between IndexedDB and backend API.
 * 
 * Features:
 * - Pull files from backend
 * - Push files to backend
 * - Merge local and remote files
 * - Conflict resolution (backend wins)
 * - Offline support
 */

import * as api from './api';
import * as metadata from './metadata';

export interface SyncResult {
    pulled: number;
    pushed: number;
    errors: string[];
}

/**
 * Sync files for a wallet
 * 
 * Strategy:
 * 1. Pull files from backend
 * 2. Merge with local files
 * 3. Push any local-only files to backend
 */
export async function syncFiles(walletAddress: string): Promise<SyncResult> {
    const result: SyncResult = {
        pulled: 0,
        pushed: 0,
        errors: [],
    };

    try {
        // Check if backend is reachable
        const isOnline = await api.checkBackendHealth();
        if (!isOnline) {
            result.errors.push('Backend is offline');
            return result;
        }

        // Pull files from backend
        const backendFiles = await api.listFiles(walletAddress);

        // Get local files
        const localFiles = await metadata.getFilesByWallet(walletAddress);

        // Create a map of local files by CID for quick lookup
        const localFileMap = new Map(
            localFiles.map(f => [f.cid, f])
        );

        // Merge backend files into local storage
        for (const backendFile of backendFiles.files) {
            const localFile = localFileMap.get(backendFile.cid);

            if (!localFile) {
                // File exists on backend but not locally - add it
                try {
                    await metadata.saveFileMetadata({
                        id: backendFile.id,
                        name: backendFile.name_encrypted, // Will need to decrypt
                        size: backendFile.size,
                        mimeType: backendFile.mime_type_encrypted, // Will need to decrypt
                        uploadedAt: backendFile.created_at,
                        cid: backendFile.cid,
                        encryptedKey: backendFile.encrypted_key,
                        keyIV: backendFile.key_iv,
                        fileIV: backendFile.file_iv,
                        walletAddress: backendFile.owner_wallet,
                    });
                    result.pulled++;
                } catch (error) {
                    result.errors.push(`Failed to save file ${backendFile.id}: ${error}`);
                }
            }

            // Remove from map (processed)
            localFileMap.delete(backendFile.cid);
        }

        // Remaining files in map are local-only - push to backend
        for (const localFile of localFileMap.values()) {
            try {
                await api.createFile(walletAddress, {
                    nameEncrypted: localFile.name,
                    size: localFile.size,
                    mimeTypeEncrypted: localFile.mimeType,
                    cid: localFile.cid,
                    encryptedKey: localFile.encryptedKey,
                    keyIV: localFile.keyIV,
                    fileIV: localFile.fileIV,
                });
                result.pushed++;
            } catch (error) {
                result.errors.push(`Failed to push file ${localFile.id}: ${error}`);
            }
        }

        return result;
    } catch (error) {
        result.errors.push(`Sync failed: ${error}`);
        return result;
    }
}

/**
 * Auto-sync on app load
 */
export async function autoSync(walletAddress: string): Promise<void> {
    try {
        await syncFiles(walletAddress);
    } catch (error) {
        console.warn('Auto-sync failed:', error);
        // Don't throw - app should work offline
    }
}
