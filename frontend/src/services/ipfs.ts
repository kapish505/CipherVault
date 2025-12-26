/**
 * IPFS Service
 * 
 * Handles file upload and download via backend API proxy.
 * 
 * Purpose:
 * - Upload encrypted files to IPFS through backend
 * - Download files from IPFS by CID
 * - Track upload progress
 * 
 * Security:
 * - Web3.Storage API token kept server-side only
 * - Frontend never has access to the token
 * - Only encrypted files are uploaded
 * - Backend performs zero-knowledge storage
 * 
 * Architecture:
 * - Frontend → Backend API → Web3.Storage → IPFS
 * - Backend proxies uploads to keep token secure
 * 
 * Integration:
 * - Works with encryption service
 * - Used by file upload/download flows
 */

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Upload encrypted file to IPFS via backend proxy
 * 
 * @param encryptedData - Encrypted file data
 * @param fileName - Original file name (for metadata)
 * @param onProgress - Optional progress callback (0-100)
 * @returns CID (Content Identifier) of uploaded file
 * 
 * Security:
 * - Only encrypted data is sent
 * - Backend never sees plaintext
 * - API token stays server-side
 */
export async function uploadFile(
    encryptedData: ArrayBuffer,
    fileName: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    try {
        // Create FormData with encrypted file
        const formData = new FormData();
        const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
        const file = new File([blob], `${fileName}.encrypted`, {
            type: 'application/octet-stream',
        });
        formData.append('file', file);

        // Upload progress tracking
        if (onProgress) onProgress(10);

        // Send to backend API
        const response = await fetch(`${API_URL}/api/ipfs/upload`, {
            method: 'POST',
            body: formData,
        });

        if (onProgress) onProgress(90);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();

        if (onProgress) onProgress(100);

        return data.cid;
    } catch (error) {
        console.error('Failed to upload file to IPFS:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to upload file. Please check your internet connection and try again.');
    }
}

/**
 * Download file from IPFS by CID
 * 
 * Uses Pinata gateway to retrieve file.
 * No backend proxy needed for downloads (public IPFS data).
 * 
 * @param cid - Content Identifier
 * @returns Encrypted file data
 */
export async function downloadFile(cid: string): Promise<ArrayBuffer> {
    try {
        // Use Pinata gateway for downloads
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

        const response = await fetch(gatewayUrl);

        if (!response.ok) {
            throw new Error('File not found on IPFS');
        }

        const arrayBuffer = await response.arrayBuffer();

        return arrayBuffer;
    } catch (error) {
        console.error('Failed to download file from IPFS:', error);
        throw new Error('Failed to download file. The file may not be available on IPFS.');
    }
}

/**
 * Check if backend IPFS service is configured
 */
export async function isConfigured(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/ipfs/status`);

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.configured === true;
    } catch (error) {
        console.error('Failed to check IPFS status:', error);
        return false;
    }
}
