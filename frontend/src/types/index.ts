/**
 * Type Definitions
 * 
 * Shared TypeScript types and interfaces for the CipherVault frontend.
 */

// Theme types
export type Theme = 'light' | 'dark';

// File types (for future use)
export interface FileMetadata {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    uploadedAt: number;
    replicaCount: number;
    status: 'encrypted' | 'replicated' | 'pinned';
    tags?: string[];
    folderPath?: string;
}

// Wallet types (for future use)
export interface WalletState {
    address: string | null;
    isConnected: boolean;
    chainId: number | null;
}
