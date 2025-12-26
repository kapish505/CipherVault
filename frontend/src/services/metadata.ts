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
    await saveFileMetadata(file);
}

/**
 * Restore file from trash
 */
export async function restoreFromTrash(id: string): Promise<void> {
    const file = await getFileById(id);
    if (!file) return;

    file.isTrashed = false;
    await saveFileMetadata(file);
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
