/**
 * Share API Service
 * 
 * Frontend service for file sharing operations
 */

import { signMessage } from './wallet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Share {
    id: string;
    file_id: string;
    owner_wallet: string;
    shared_with_wallet: string;
    encrypted_key_for_recipient: string;
    permissions: 'read' | 'write';
    created_at: number;
    revoked_at: number | null;
    file?: any; // Enriched file metadata
}

/**
 * Create a file share
 */
export async function createShare(
    walletAddress: string,
    fileId: string,
    sharedWithWallet: string,
    encryptedKeyForRecipient: string,
    permissions: 'read' | 'write' = 'read'
): Promise<Share> {
    const timestamp = Date.now().toString();
    const message = `CipherVault Authentication\nTimestamp: ${timestamp}`;
    const signature = await signMessage(message);

    const response = await fetch(`${API_URL}/api/shares`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Wallet-Address': walletAddress,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
        },
        body: JSON.stringify({
            fileId,
            sharedWithWallet,
            encryptedKeyForRecipient,
            permissions,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create share');
    }

    const data = await response.json();
    return data.share;
}

/**
 * Get shares received by current user
 */
export async function getReceivedShares(walletAddress: string): Promise<Share[]> {
    const timestamp = Date.now().toString();
    const message = `CipherVault Authentication\nTimestamp: ${timestamp}`;
    const signature = await signMessage(message);

    const response = await fetch(`${API_URL}/api/shares/received`, {
        headers: {
            'X-Wallet-Address': walletAddress,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get received shares');
    }

    const data = await response.json();
    return data.shares;
}

/**
 * Get shares sent by current user
 */
export async function getSentShares(walletAddress: string): Promise<Share[]> {
    const timestamp = Date.now().toString();
    const message = `CipherVault Authentication\nTimestamp: ${timestamp}`;
    const signature = await signMessage(message);

    const response = await fetch(`${API_URL}/api/shares/sent`, {
        headers: {
            'X-Wallet-Address': walletAddress,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get sent shares');
    }

    const data = await response.json();
    return data.shares;
}

/**
 * Revoke a share
 */
export async function revokeShare(walletAddress: string, shareId: string): Promise<void> {
    const timestamp = Date.now().toString();
    const message = `CipherVault Authentication\nTimestamp: ${timestamp}`;
    const signature = await signMessage(message);

    const response = await fetch(`${API_URL}/api/shares/${shareId}`, {
        method: 'DELETE',
        headers: {
            'X-Wallet-Address': walletAddress,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke share');
    }
}
