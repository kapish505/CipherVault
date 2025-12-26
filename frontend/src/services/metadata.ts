/**
 * Metadata Service
 * 
 * Manages file metadata storage using IndexedDB.
 * 
 * Purpose:
 * - Store encrypted file metadata locally
 * - Retrieve file list for dashboard
 * - Update file metadata
 * - Delete file metadata
 * 
 * Security:
 * - Stores encrypted keys (never plaintext)
 * - Metadata is encrypted
 * - Wallet-specific storage (isolated by address)
 * 
 * Data Model:
 * - id: unique file ID
 * - name: encrypted file name
 * - size: file size in bytes
 * - mimeType: encrypted MIME type
 * - uploadedAt: timestamp
 * - cid: IPFS Content Identifier
 * - encryptedKey: encrypted file encryption key (Base64)
 * - keyIV: IV for key encryption (Base64)
 * - fileIV: IV for file encryption (Base64)
 * - walletAddress: owner wallet address
 * 
 * Integration:
 * - Used by dashboard for file list
 * - Works with encryption and IPFS services
 */

const DB_NAME = 'ciphervault';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * File metadata interface
 */
export interface FileMetadata {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    uploadedAt: number;
    cid: string;
    encryptedKey: string; // Base64
    keyIV: string; // Base64
    fileIV: string; // Base64
    walletAddress: string;
    folderId?: string | null;
    classification?: string;
    // New fields for File Explorer features
    isTrashed?: boolean;
    isStarred?: boolean;
    sharedWith?: string[]; // List of wallet addresses or emails (simulated)
    accessedAt?: number;
    path?: string[]; // Breadcrumb path IDs
    trashedAt?: number;
    // Replica Health (Layer 1)
    targetReplicas?: number;
    currentReplicas?: number;
    healthStatus?: 'Healthy' | 'Degraded' | 'Recovering';
    lastHealed?: number;
}

/**
 * Folder interface (stored in the same object store as files, but with distinct type)
 */
export interface FolderMetadata {
    id: string;
    name: string;
    createdAt: number;
    walletAddress: string;
    parentId?: string | null;
    path?: string[];
    isTrashed?: boolean;
    trashedAt?: number;
    isStarred?: boolean;
}

/**
 * Open IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open database'));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

                // Create indexes
                objectStore.createIndex('walletAddress', 'walletAddress', { unique: false });
                objectStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }
        };
    });
}

/**
 * Save file metadata
 */
export async function saveFileMetadata(metadata: FileMetadata): Promise<void> {
    // Normalize wallet address
    if (metadata.walletAddress) {
        metadata.walletAddress = metadata.walletAddress.toLowerCase();
    }
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(metadata);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error('Failed to save file metadata'));
        };
    });
}

/**
 * Get all files for a wallet address
 */
export async function getFilesByWallet(walletAddress: string): Promise<FileMetadata[]> {
    const normalizedAddress = walletAddress.toLowerCase();
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('walletAddress');
        const request = index.getAll(normalizedAddress);

        request.onsuccess = () => {
            const files = request.result as FileMetadata[];

            // Demo: Initialize replica state if missing
            files.forEach(f => {
                if (f.targetReplicas === undefined) {
                    f.targetReplicas = 3;
                    // Randomize current for demo variety: 3 (60%), 2 (30%), 1 (10%)
                    const rand = Math.random();
                    if (rand > 0.4) f.currentReplicas = 3;
                    else if (rand > 0.1) f.currentReplicas = 2;
                    else f.currentReplicas = 1;

                    f.healthStatus = f.currentReplicas === 3 ? 'Healthy' : 'Degraded';
                    // We don't await save here to avoid mass writes on read, 
                    // but in a real app this would be in DB. 
                    // For now, let's just mutate the object returned. 
                    // Ideally we should persist this initialization.
                    // Let's persist it async to keep UI fast.
                    if (f.mimeType !== 'application/folder') {
                        saveFileMetadata(f).catch(console.error);
                    }
                }
            });

            // Sort by upload date (newest first)
            files.sort((a, b) => b.uploadedAt - a.uploadedAt);
            resolve(files);
        };

        request.onerror = () => {
            reject(new Error('Failed to retrieve files'));
        };
    });
}

/**
 * Move file to a folder
 */
export async function moveFileToFolder(fileId: string, folderId: string | null): Promise<void> {
    const file = await getFileById(fileId);
    if (!file) return;

    file.folderId = folderId;
    await saveFileMetadata(file);
}

/**
 * Get file metadata by ID
 */
export async function getFileById(id: string): Promise<FileMetadata | null> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(new Error('Failed to retrieve file'));
        };
    });
}

export async function deleteFileMetadata(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error('Failed to delete file'));
        };
    });
}

/**
 * Move file to trash (Soft Delete)
 */
export async function moveToTrash(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    file.isTrashed = true;
    file.trashedAt = Date.now();
    await saveFileMetadata(file);
}

/**
 * Restore file from trash
 */
export async function restoreFromTrash(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    file.isTrashed = false;
    file.trashedAt = undefined;
    await saveFileMetadata(file);
}

/**
 * Permanently delete files in trash older than 30 days
 */
export async function cleanupTrash(walletAddress: string): Promise<void> {
    const normalizedAddress = walletAddress.toLowerCase();
    const files = await getFilesByWallet(normalizedAddress);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    for (const file of files) {
        if (file.isTrashed && file.trashedAt && file.trashedAt < thirtyDaysAgo) {
            await deleteFileMetadata(file.id);
        }
    }
}

/**
 * Toggle Star status
 */
export async function toggleStar(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    file.isStarred = !file.isStarred;
    await saveFileMetadata(file);
}

/**
 * Update access time (for Recent view)
 */
export async function updateAccessTime(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    file.accessedAt = Date.now();
    await saveFileMetadata(file);
}

/**
 * Create a new folder
 */
export async function createFolder(name: string, walletAddress: string, parentId?: string | null): Promise<string> {
    const normalizedAddress = walletAddress.toLowerCase();
    const id = crypto.randomUUID();
    const folder: any = {
        id,
        name,
        size: 0,
        mimeType: 'application/folder', // Special type for folders
        uploadedAt: Date.now(),
        cid: '', // Folders don't have CIDs initially
        encryptedKey: '',
        keyIV: '',
        fileIV: '',
        walletAddress: normalizedAddress,
        folderId: parentId,
        isTrashed: false,
        isStarred: false
    };

    await saveFileMetadata(folder);
    return id;
}


/**
 * Share a file (Simulate by setting sharedWith)
 */
export async function shareFile(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    if (!file.sharedWith) file.sharedWith = [];
    if (!file.sharedWith.includes('public')) {
        file.sharedWith.push('public');
    }
    await saveFileMetadata(file);
}

/**
 * Clear all files for a wallet (used on disconnect)
 */
export async function clearWalletFiles(walletAddress: string): Promise<void> {
    const normalizedAddress = walletAddress.toLowerCase();
    const files = await getFilesByWallet(normalizedAddress);
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        let completed = 0;
        const total = files.length;

        if (total === 0) {
            resolve();
            return;
        }

        files.forEach((file) => {
            const request = store.delete(file.id);

            request.onsuccess = () => {
                completed++;
                if (completed === total) {
                    resolve();
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to clear files'));
            };
        });
    });
}

/**
 * Export all metadata as JSON string (for backup/sync)
 */
export async function exportDatabase(walletAddress: string): Promise<string> {
    const files = await getFilesByWallet(walletAddress);

    // Folders are included in getFilesByWallet as they are stored in the same object store

    const exportData = {
        version: 1,
        timestamp: Date.now(),
        walletAddress,
        items: files
    };

    return JSON.stringify(exportData);
}

/**
 * Import metadata from JSON string (merge strategy)
 */
export async function importDatabase(json: string, walletAddress: string): Promise<void> {
    try {
        const data = JSON.parse(json);

        // Basic validation
        if (!data.items || !Array.isArray(data.items)) {
            throw new Error('Invalid backup format');
        }

        for (const item of data.items) {
            // Ensure it belongs to this wallet (security check)
            if (item.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                continue;
            }
            await saveFileMetadata(item);
        }

    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
}

/**
 * Heal a file (Simulation)
 */
export async function healFile(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    // 1. Set status to Recovering
    file.healthStatus = 'Recovering';
    await saveFileMetadata(file);

    // 2. Simulate delay (2 seconds)
    return new Promise((resolve) => {
        setTimeout(async () => {
            // Re-fetch to ensure no concurrent updates
            const freshFile = await getFileById(id);
            if (freshFile) {
                // Increment replicas
                freshFile.currentReplicas = (freshFile.currentReplicas || 0) + 1;
                freshFile.lastHealed = Date.now();

                // Update status
                const target = freshFile.targetReplicas || 3;
                if (freshFile.currentReplicas >= target) {
                    freshFile.currentReplicas = target; // Cap it
                    freshFile.healthStatus = 'Healthy';
                } else {
                    freshFile.healthStatus = 'Degraded';
                }

                await saveFileMetadata(freshFile);
            }
            resolve();
        }, 2000);
    });
}
