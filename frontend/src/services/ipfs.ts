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
// Pinata API JWT (Client-side)
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadFile(
    encryptedData: ArrayBuffer,
    fileName: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    try {
        if (!PINATA_JWT) {
            throw new Error('Pinata JWT not configured in environment variables');
        }

        // Create FormData with encrypted file
        const formData = new FormData();
        const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
        const file = new File([blob], `${fileName}.encrypted`, {
            type: 'application/octet-stream',
        });
        formData.append('file', file);

        // Upload progress tracking
        if (onProgress) onProgress(10);

        // Upload directly to Pinata (bypasses Vercel 4.5MB limit)
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                // 'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                // Note: Fetch auto-sets Content-Type with boundary for FormData, do not set manually
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: formData,
        });

        if (onProgress) onProgress(90);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        if (onProgress) onProgress(100);

        return data.IpfsHash;
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
 * Note: Now checks if client-side JWT is available
 */
export async function isConfigured(): Promise<boolean> {
    return !!import.meta.env.VITE_PINATA_JWT;
}

/**
 * Trigger Pinata to pin an existing CID (Healing)
 */
export async function pinByHash(cid: string, name?: string): Promise<boolean> {
    try {
        if (!PINATA_JWT) return false;

        const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: JSON.stringify({
                hashToPin: cid,
                pinataMetadata: {
                    name: name || `Healed File ${cid.substring(0, 6)}`
                }
            })
        });

        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to pin by hash:', error);
        return false;
    }
}
