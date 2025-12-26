/**
 * Wallet Service
 * 
 * Handles MetaMask wallet connection, disconnection, and signing.
 * 
 * Purpose:
 * - Detect MetaMask installation
 * - Connect to user's wallet
 * - Get wallet address and chain ID
 * - Sign messages for authentication
 * - Handle wallet events (account change, disconnect)
 * 
 * Security:
 * - Never stores private keys (handled by MetaMask)
 * - Uses wallet signatures for authentication
 * - Validates all wallet responses
 * 
 * Integration:
 * - Used by useWallet hook for state management
 * - Provides wallet functionality to entire app
 */

import { Eip1193Provider } from 'ethers';

// Extend Window interface to include ethereum
declare global {
    interface Window {
        ethereum?: Eip1193Provider & {
            isMetaMask?: boolean;
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
        };
    }
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' &&
        typeof window.ethereum !== 'undefined' &&
        window.ethereum.isMetaMask === true;
}

/**
 * Connect to MetaMask wallet
 * 
 * Returns the connected wallet address and chain ID.
 * Throws error if MetaMask is not installed or user rejects connection.
 */
export async function connectWallet(): Promise<{
    address: string;
    chainId: number;
}> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
        // Request account access
        const accounts = await window.ethereum!.request({
            method: 'eth_requestAccounts',
        }) as string[];

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Please unlock MetaMask.');
        }

        // Get chain ID
        const chainId = await window.ethereum!.request({
            method: 'eth_chainId',
        }) as string;

        return {
            address: accounts[0],
            chainId: parseInt(chainId, 16),
        };
    } catch (error) {
        if (error instanceof Error) {
            // User rejected the connection
            if (error.message.includes('User rejected')) {
                throw new Error('Connection rejected. Please approve the connection in MetaMask.');
            }
            throw error;
        }
        throw new Error('Failed to connect wallet. Please try again.');
    }
}

/**
 * Request account switch in MetaMask
 * 
 * Opens MetaMask to allow user to select a different account
 */
export async function requestAccountSwitch(): Promise<{
    address: string;
    chainId: number;
}> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed.');
    }

    try {
        // Request accounts with explicit permission request
        // This will show MetaMask popup even if already connected
        await window.ethereum!.request({
            method: 'wallet_requestPermissions',
            params: [{
                eth_accounts: {}
            }]
        });

        // After permissions, get the accounts
        const newAccounts = await window.ethereum!.request({
            method: 'eth_requestAccounts',
        }) as string[];

        if (!newAccounts || newAccounts.length === 0) {
            throw new Error('No accounts found.');
        }

        const chainId = await window.ethereum!.request({
            method: 'eth_chainId',
        }) as string;

        return {
            address: newAccounts[0],
            chainId: parseInt(chainId, 16),
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to switch account');
    }
}

/**
 * Get current wallet address (if already connected)
 * 
 * Returns null if not connected.
 */
export async function getCurrentAddress(): Promise<string | null> {
    if (!isMetaMaskInstalled()) {
        return null;
    }

    try {
        const accounts = await window.ethereum!.request({
            method: 'eth_accounts',
        }) as string[];

        return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
        console.error('Failed to get current address:', error);
        return null;
    }
}

/**
 * Get current chain ID
 */
export async function getChainId(): Promise<number | null> {
    if (!isMetaMaskInstalled()) {
        return null;
    }

    try {
        const chainId = await window.ethereum!.request({
            method: 'eth_chainId',
        }) as string;

        return parseInt(chainId, 16);
    } catch (error) {
        console.error('Failed to get chain ID:', error);
        return null;
    }
}

/**
 * Listen for account changes
 * 
 * Callback is called when user switches accounts in MetaMask.
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
    if (!isMetaMaskInstalled()) {
        return () => { };
    }

    const handler = (accounts: unknown) => {
        callback(accounts as string[]);
    };

    window.ethereum!.on('accountsChanged', handler);

    // Return cleanup function
    return () => {
        window.ethereum!.removeListener('accountsChanged', handler);
    };
}

/**
 * Listen for chain changes
 * 
 * Callback is called when user switches networks in MetaMask.
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
    if (!isMetaMaskInstalled()) {
        return () => { };
    }

    const handler = (chainId: unknown) => {
        callback(chainId as string);
    };

    window.ethereum!.on('chainChanged', handler);

    // Return cleanup function
    return () => {
        window.ethereum!.removeListener('chainChanged', handler);
    };
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
    // MetaMask doesn't have a disconnect method
    // We just clear our local state
    // The user can revoke permissions in MetaMask settings
}

/**
 * Sign message with wallet
 * 
 * Used for backend API authentication.
 * 
 * @param message - Message to sign
 * @returns Signature
 */
export async function signMessage(message: string): Promise<string> {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
    }

    try {
        const provider = window.ethereum as Eip1193Provider;
        if (!provider) {
            throw new Error('Ethereum provider not found');
        }

        const accounts = await provider.request({
            method: 'eth_accounts',
        }) as string[];

        if (accounts.length === 0) {
            throw new Error('No wallet connected');
        }

        const signature = await provider.request({
            method: 'personal_sign',
            params: [message, accounts[0]],
        }) as string;

        return signature;
    } catch (error) {
        console.error('Failed to sign message:', error);
        throw new Error('Failed to sign message');
    }
}
