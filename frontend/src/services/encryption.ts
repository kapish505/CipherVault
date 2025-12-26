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
 */

/**
 * Generate a random AES-256-GCM encryption key
 */
export async function generateFileKey(): Promise<CryptoKey> {
    try {
        const key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );
        return key;
    } catch (error) {
        console.error('Failed to generate file key:', error);
        throw new Error('Failed to generate encryption key.');
    }
}

/**
 * Export a CryptoKey to raw bytes
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
 */
export async function encryptFile(
    file: File,
    key: CryptoKey
): Promise<{
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
}> {
    try {
        const fileData = await file.arrayBuffer();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            fileData
        );
        return { encryptedData, iv };
    } catch (error) {
        console.error('Failed to encrypt file:', error);
        throw new Error('Failed to encrypt file.');
    }
}

/**
 * Decrypt a file with AES-256-GCM
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
        throw new Error('Failed to decrypt file. Key may be incorrect.');
    }
}

/**
 * Derive an encryption key from wallet address (PBKDF2)
 */
export async function deriveKeyFromWallet(walletAddress: string): Promise<CryptoKey> {
    try {
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(walletAddress.toLowerCase());
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            passwordData,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        const saltData = encoder.encode(`ciphervault-${walletAddress.toLowerCase()}`);
        const salt = await window.crypto.subtle.digest('SHA-256', saltData);
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
 */
export async function encryptFileKey(
    fileKey: CryptoKey,
    walletKey: CryptoKey
): Promise<{
    encryptedKey: ArrayBuffer;
    iv: Uint8Array;
}> {
    try {
        const fileKeyData = await exportKey(fileKey);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedKey = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            walletKey,
            fileKeyData
        );
        return { encryptedKey, iv };
    } catch (error) {
        console.error('Failed to encrypt file key:', error);
        throw new Error('Failed to encrypt file key.');
    }
}

/**
 * Decrypt a file encryption key with wallet-derived key
 */
export async function decryptFileKey(
    encryptedKey: ArrayBuffer,
    iv: Uint8Array,
    walletKey: CryptoKey
): Promise<CryptoKey> {
    try {
        const fileKeyData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            walletKey,
            encryptedKey
        );
        const fileKey = await importKey(fileKeyData);
        return fileKey;
    } catch (error) {
        console.error('Failed to decrypt file key:', error);
        throw new Error('Failed to decrypt file key.');
    }
}

/**
 * Encrypt a string (metadata) with wallet-derived key
 */
export async function encryptString(
    data: string,
    key: CryptoKey
): Promise<{ cipherText: string; iv: string }> {
    try {
        const enc = new TextEncoder();
        const encodedData = enc.encode(data);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encodedData
        );

        // Convert to Base64 manually to avoid large buffer issues (though unlikely for metadata)
        const cipherText = arrayBufferToBase64(encryptedContent);
        const ivStr = arrayBufferToBase64(iv.buffer);

        return { cipherText, iv: ivStr };
    } catch (error) {
        console.error('Encrypt string failed:', error);
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypt a string (metadata) with wallet-derived key
 */
export async function decryptString(
    cipherText: string,
    ivStr: string,
    key: CryptoKey
): Promise<string> {
    try {
        const iv = base64ToArrayBuffer(ivStr);
        const encryptedData = base64ToArrayBuffer(cipherText);

        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            key,
            encryptedData
        );

        const dec = new TextDecoder();
        return dec.decode(decryptedContent);
    } catch (error) {
        console.error('Decrypt string failed:', error);
        throw new Error('Decryption failed');
    }
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
