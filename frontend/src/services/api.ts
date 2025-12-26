/**
 * Backend API Service
 * 
 * HTTP client for CipherVault backend API.
 * 
 * Features:
 * - Wallet signature authentication
 * - Signature caching (per session)
 * - Automatic signature generation
 * - Error handling
 * - TypeScript types
 * 
 * Security:
 * - Signs all requests with wallet
 * - Includes timestamp to prevent replay attacks
 * - Never sends plaintext data
 */

import { signMessage } from './wallet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Signature cache (in-memory, per session)
interface SignatureCache {
    signature: string;
    timestamp: number;
    walletAddress: string;
}

let cachedSignature: SignatureCache | null = null;
const SIGNATURE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface ApiFileMetadata {
    id: string;
    owner_wallet: string;
    name_encrypted: string;
    size: number;
    mime_type_encrypted: string;
    cid: string;
    encrypted_key: string;
    key_iv: string;
    file_iv: string;
    created_at: number;
    updated_at: number;
    deleted_at: number | null;
}

export interface CreateFileRequest {
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

export interface ListFilesResponse {
    files: ApiFileMetadata[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

/**
 * Generate authentication headers with signature caching
 */
async function getAuthHeaders(walletAddress: string): Promise<HeadersInit> {
    const now = Date.now();

    // Check if we have a valid cached signature
    if (
        cachedSignature &&
        cachedSignature.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
        now - cachedSignature.timestamp < SIGNATURE_CACHE_DURATION
    ) {
        // Reuse cached signature
        return {
            'Content-Type': 'application/json',
            'X-Wallet-Address': walletAddress,
            'X-Signature': cachedSignature.signature,
            'X-Timestamp': cachedSignature.timestamp.toString(),
        };
    }

    // Generate new signature
    const timestamp = now.toString();
    const message = `CipherVault Authentication\nTimestamp: ${timestamp}`;

    const signature = await signMessage(message);

    // Cache the signature
    cachedSignature = {
        signature,
        timestamp: now,
        walletAddress: walletAddress.toLowerCase(),
    };

    return {
        'Content-Type': 'application/json',
        'X-Wallet-Address': walletAddress,
        'X-Signature': signature,
        'X-Timestamp': timestamp,
    };
}

/**
 * Clear signature cache (call on wallet disconnect)
 */
export function clearSignatureCache(): void {
    cachedSignature = null;
}

/**
 * List files for wallet
 */
export async function listFiles(
    walletAddress: string,
    limit: number = 50,
    offset: number = 0
): Promise<ListFilesResponse> {
    const headers = await getAuthHeaders(walletAddress);

    const response = await fetch(
        `${API_URL}/api/files?limit=${limit}&offset=${offset}`,
        { headers }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to list files');
    }

    return response.json();
}

/**
 * Create file metadata
 */
export async function createFile(
    walletAddress: string,
    data: CreateFileRequest
): Promise<ApiFileMetadata> {
    const headers = await getAuthHeaders(walletAddress);

    const response = await fetch(`${API_URL}/api/files`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to create file');
    }

    return response.json();
}

/**
 * Get file by ID
 */
export async function getFile(
    walletAddress: string,
    fileId: string
): Promise<ApiFileMetadata> {
    const headers = await getAuthHeaders(walletAddress);

    const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to get file');
    }

    return response.json();
}

/**
 * Update file metadata
 */
export async function updateFile(
    walletAddress: string,
    fileId: string,
    updates: { nameEncrypted?: string; mimeTypeEncrypted?: string }
): Promise<ApiFileMetadata> {
    const headers = await getAuthHeaders(walletAddress);

    const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to update file');
    }

    return response.json();
}

/**
 * Delete file
 */
export async function deleteFile(
    walletAddress: string,
    fileId: string
): Promise<void> {
    const headers = await getAuthHeaders(walletAddress);

    const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to delete file');
    }
}

/**
 * Check if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
