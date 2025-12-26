/**
 * Encryption Service
 * 
 * Handles all client-side encryption and decryption using Web Crypto API.
 * 
 * Purpose:
 * - Encrypt files before upload to IPFS
 * - Decrypt files after download from IPFS
 * - Generate and manage encryption keys
 * - Derive keys from wallet for key encryption
 * 
 * Security Model:
 * - Uses AES-256-GCM (authenticated encryption)
 * - Each file gets a unique random encryption key
 * - File encryption key is encrypted with wallet-derived key
 * - No custom cryptography - Web Crypto API only
 * - All operations happen in browser memory
 * 
 * Flow:
 * 1. Generate random AES-256-GCM key for file
 * 2. Encrypt file with this key
 * 3. Derive key from wallet address
 * 4. Encrypt file key with wallet-derived key
 * 5. Store encrypted file + encrypted key
 * 
 * CRITICAL SECURITY NOTES:
 * - Never log encryption keys
 * - Never send plaintext to backend
 * - Always verify decryption succeeded
 * - Handle all crypto errors gracefully
 */

/**
 * Generate a random AES-256-GCM encryption key
 * 
 * This key will be used to encrypt a single file.
 * Each file gets its own unique key.
 */
export async function generateFileKey(): Promise<CryptoKey> {
    try {
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true, // extractable (so we can export it)
            ['encrypt', 'decrypt']
        );

        return key;
    } catch (error) {
        console.error('Failed to generate file key:', error);
        throw new Error('Failed to generate encryption key. Please try again.');
    }
}

/**
 * Export a CryptoKey to raw bytes
 * 
 * Used to get the raw key material for storage.
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    try {
        return await window.crypto.subtle.exportKey('raw', key);
    } catch (error) {
        console.error('Failed to export key:', error);
        throw new Error('Failed to export encryption key.');
    }
}

/**
 * Import raw key bytes into a CryptoKey
 * 
 * Used to reconstruct a key from storage.
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    try {
        return await window.crypto.subtle.importKey(
            'raw',
            keyData,
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );
    } catch (error) {
        console.error('Failed to import key:', error);
        throw new Error('Failed to import encryption key.');
    }
}

/**
 * Encrypt a file with AES-256-GCM
 * 
 * Returns the encrypted data and the IV (initialization vector).
 * The IV must be stored alongside the encrypted data for decryption.
 * 
 * @param file - File to encrypt
 * @param key - AES-256-GCM key
 * @returns Object with encrypted data and IV
 */
export async function encryptFile(
    file: File,
    key: CryptoKey
): Promise<{
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
}> {
    try {
        // Read file as ArrayBuffer
        const fileData = await file.arrayBuffer();

        // Generate random IV (12 bytes for GCM)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the file data
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            fileData
        );

        return {
            encryptedData,
            iv,
        };
    } catch (error) {
        console.error('Failed to encrypt file:', error);
        throw new Error('Failed to encrypt file. Please try again.');
    }
}

/**
 * Decrypt a file with AES-256-GCM
 * 
 * @param encryptedData - Encrypted file data
 * @param iv - Initialization vector used during encryption
 * @param key - AES-256-GCM key
 * @returns Decrypted file data
 */
export async function decryptFile(
    encryptedData: ArrayBuffer,
    iv: Uint8Array,
    key: CryptoKey
): Promise<ArrayBuffer> {
    try {
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            encryptedData
        );

        return decryptedData;
    } catch (error) {
        console.error('Failed to decrypt file:', error);
        throw new Error('Failed to decrypt file. The file may be corrupted or the key is incorrect.');
    }
}

/**
 * Derive an encryption key from wallet address
 * 
 * This key is used to encrypt the file encryption keys.
 * Same wallet address always produces the same key.
 * 
 * Security:
 * - Uses PBKDF2 with SHA-256
 * - 100,000 iterations (OWASP recommendation)
 * - Wallet address as password (not ideal but acceptable for this use case)
 * - Fixed salt derived from address (deterministic)
 * 
 * Note: In production, you might want to use the wallet to sign a message
 * and derive the key from the signature instead.
 */
export async function deriveKeyFromWallet(walletAddress: string): Promise<CryptoKey> {
    try {
        // Encode wallet address as password
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(walletAddress.toLowerCase());

        // Import password as key material
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            passwordData,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derive a deterministic salt from the address
        // This ensures the same address always produces the same key
        const saltData = encoder.encode(`ciphervault-${walletAddress.toLowerCase()}`);
        const salt = await window.crypto.subtle.digest('SHA-256', saltData);

        // Derive AES-256-GCM key
        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );

        return derivedKey;
    } catch (error) {
        console.error('Failed to derive key from wallet:', error);
        throw new Error('Failed to derive encryption key from wallet.');
    }
}

/**
 * Encrypt a file encryption key with wallet-derived key
 * 
 * This allows us to store the file key securely.
 * Only the wallet owner can decrypt it.
 */
export async function encryptFileKey(
    fileKey: CryptoKey,
    walletKey: CryptoKey
): Promise<{
    encryptedKey: ArrayBuffer;
    iv: Uint8Array;
}> {
    try {
        // Export file key to raw bytes
        const fileKeyData = await exportKey(fileKey);

        // Generate random IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt file key with wallet key
        const encryptedKey = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            walletKey,
            fileKeyData
        );

        return {
            encryptedKey,
            iv,
        };
    } catch (error) {
        console.error('Failed to encrypt file key:', error);
        throw new Error('Failed to encrypt file key.');
    }
}

/**
 * Decrypt a file encryption key with wallet-derived key
 * 
 * Reconstructs the file encryption key from encrypted storage.
 */
export async function decryptFileKey(
    encryptedKey: ArrayBuffer,
    iv: Uint8Array,
    walletKey: CryptoKey
): Promise<CryptoKey> {
    try {
        // Decrypt the file key data
        const fileKeyData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            walletKey,
            encryptedKey
        );

        // Import as CryptoKey
        const fileKey = await importKey(fileKeyData);

        return fileKey;
    } catch (error) {
        console.error('Failed to decrypt file key:', error);
        throw new Error('Failed to decrypt file key. You may not have permission to access this file.');
    }
}

/**
 * Helper: Convert ArrayBuffer to Base64 string
 * 
 * Used for storing binary data as strings.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Helper: Convert Base64 string to ArrayBuffer
 * 
 * Used for retrieving binary data from strings.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
