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
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('walletAddress');
        const request = index.getAll(walletAddress);

        request.onsuccess = () => {
            const files = request.result as FileMetadata[];
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

/**
 * Delete file metadata
 */
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
 * Clear all files for a wallet (used on disconnect)
 */
export async function clearWalletFiles(walletAddress: string): Promise<void> {
    const files = await getFilesByWallet(walletAddress);
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
