/**
 * Wallet Hook
 * 
 * Custom React hook for managing wallet state and operations.
 * 
 * Purpose:
 * - Manage wallet connection state
 * - Provide wallet address and chain ID
 * - Handle wallet events (account/chain changes)
 * - Provide connect/disconnect functions
 * 
 * Usage:
 * const { address, chainId, isConnected, connect, disconnect, error } = useWallet();
 * 
 * Security:
 * - No private keys stored
 * - State persisted to localStorage for UX
 * - Auto-reconnect on page load if previously connected
 */

import { useState, useEffect, useCallback } from 'react';
import * as walletService from '@/services/wallet';
import type { WalletState } from '@/types';

const STORAGE_KEY = 'ciphervault-wallet';

// Singleton state management
let globalState: WalletState = {
    address: null,
    isConnected: false,
    chainId: null,
};

const listeners = new Set<(state: WalletState) => void>();

function updateGlobalState(newState: WalletState) {
    globalState = newState;
    saveState(newState);
    listeners.forEach(listener => listener(globalState));
}

/**
 * Get initial wallet state from localStorage
 */
function getInitialState(): WalletState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to parse stored wallet state:', error);
    }

    return {
        address: null,
        isConnected: false,
        chainId: null,
    };
}

// Initialize global state
globalState = getInitialState();

/**
 * Save wallet state to localStorage
 */
function saveState(state: WalletState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save wallet state:', error);
    }
}

export function useWallet() {
    const [state, setLocalState] = useState<WalletState>(globalState);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to global state changes
    useEffect(() => {
        const listener = (newState: WalletState) => {
            setLocalState(newState);
        };
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    /**
     * Connect to wallet
     */
    const connect = useCallback(async () => {
        setIsConnecting(true);
        setError(null);

        try {
            const { address, chainId } = await walletService.connectWallet();

            const newState: WalletState = {
                address,
                chainId,
                isConnected: true,
            };

            updateGlobalState(newState);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
            setError(errorMessage);
            console.error('Wallet connection error:', err);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    /**
     * Disconnect wallet
     */
    const disconnect = useCallback(() => {
        const newState: WalletState = {
            address: null,
            chainId: null,
            isConnected: false,
        };

        updateGlobalState(newState);
        walletService.disconnectWallet();
    }, []);

    /**
     * Auto-reconnect on mount if previously connected
     */
    useEffect(() => {
        const autoConnect = async () => {
            // Only auto-connect if we have a stored connection and are not already connected in memory
            // The globalState check prevents redundant checks if another component already triggered it
            if (!state.isConnected) {
                return;
            }

            try {
                // If we are already connected via service (e.g. window.ethereum present), we don't need to do much
                // But we should verify current address matches
                const address = await walletService.getCurrentAddress();
                const chainId = await walletService.getChainId();

                if (address && chainId) {
                    if (address !== state.address) {
                        updateGlobalState({
                            address,
                            chainId,
                            isConnected: true,
                        });
                    }
                } else {
                    // Wallet is no longer connected, clear state
                    disconnect();
                }
            } catch (err) {
                console.error('Auto-connect failed:', err);
                disconnect();
            }
        };

        // We only want to run this once effectively, but since this is a hook, 
        // multiple components mounting shouldn't hurt as operations are idempotent-ish.
        // However, checking globalState.isConnected before running helps.
        if (state.isConnected) {
            autoConnect();
        }
    }, []);

    /**
     * Listen for account changes
     */
    useEffect(() => {
        const cleanup = walletService.onAccountsChanged((accounts) => {
            if (accounts.length === 0) {
                // User disconnected wallet
                disconnect();
            } else if (accounts[0] !== state.address) {
                // User switched accounts
                updateGlobalState({
                    ...state,
                    address: accounts[0],
                });
            }
        });

        return cleanup;
    }, [state.address, disconnect]);

    /**
     * Listen for chain changes
     */
    useEffect(() => {
        const cleanup = walletService.onChainChanged((chainIdHex) => {
            const chainId = parseInt(chainIdHex, 16);

            updateGlobalState({
                ...state,
                chainId,
            });
        });

        return cleanup;
    }, [state]);

    return {
        address: state.address,
        chainId: state.chainId,
        isConnected: state.isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
    };
}
