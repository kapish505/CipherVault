/**
 * Wallet Account Switcher
 * 
 * Gmail-style account switcher for multiple wallets
 */

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import './WalletSwitcher.css';

interface SavedAccount {
    address: string;
    nickname?: string;
    lastUsed: number;
}

const ACCOUNTS_KEY = 'ciphervault_accounts';

export function WalletSwitcher() {
    const { address, connect, disconnect } = useWallet();
    const [showDropdown, setShowDropdown] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load saved accounts
    useEffect(() => {
        const stored = localStorage.getItem(ACCOUNTS_KEY);
        if (stored) {
            try {
                const accounts = JSON.parse(stored);
                setSavedAccounts(Array.isArray(accounts) ? accounts : []);
            } catch (e) {
                console.error('Failed to load accounts:', e);
                setSavedAccounts([]);
            }
        }
    }, []);

    // Save current account when connected
    useEffect(() => {
        if (address) {
            setSavedAccounts(prev => {
                const existing = prev.find(
                    acc => acc.address.toLowerCase() === address.toLowerCase()
                );

                let newAccounts;
                if (!existing) {
                    newAccounts = [...prev, { address, lastUsed: Date.now() }];
                } else {
                    newAccounts = prev.map(acc =>
                        acc.address.toLowerCase() === address.toLowerCase()
                            ? { ...acc, lastUsed: Date.now() }
                            : acc
                    );
                }

                localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(newAccounts));
                return newAccounts;
            });
        }
    }, [address]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const handleSwitchAccount = async (targetAddress: string) => {
        if (targetAddress.toLowerCase() === address?.toLowerCase()) {
            setShowDropdown(false);
            return;
        }

        try {
            // Disconnect and reconnect to switch accounts
            await disconnect();
            setTimeout(async () => {
                await connect();
                setShowDropdown(false);
            }, 100);
        } catch (error) {
            console.error('Failed to switch account:', error);
        }
    };

    const handleAddAccount = async () => {
        try {
            // Import the wallet service directly
            const { requestAccountSwitch } = await import('@/services/wallet');

            // Request account switch - this will show MetaMask popup
            const { address: newAddress } = await requestAccountSwitch();

            // Update the wallet state
            if (newAddress && newAddress.toLowerCase() !== address?.toLowerCase()) {
                // The useWallet hook will automatically update via MetaMask events
                setShowDropdown(false);
            }
        } catch (error: any) {
            console.error('Failed to add account:', error);
            // If user cancels, just close the dropdown
            if (error.code === 4001) {
                setShowDropdown(false);
            }
        }
    };

    const handleRemoveAccount = (addressToRemove: string) => {
        const filtered = savedAccounts.filter(
            acc => acc.address.toLowerCase() !== addressToRemove.toLowerCase()
        );
        setSavedAccounts(filtered);
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));

        if (addressToRemove.toLowerCase() === address?.toLowerCase()) {
            disconnect();
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setShowDropdown(false);
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (!address) {
        return (
            <button className="wallet-connect-btn" onClick={connect}>
                Connect Wallet
            </button>
        );
    }

    const sortedAccounts = [...savedAccounts].sort((a, b) => b.lastUsed - a.lastUsed);

    return (
        <div className="wallet-switcher" ref={dropdownRef}>
            <button
                className="wallet-switcher-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
                type="button"
            >
                <div className="wallet-avatar">
                    {address.slice(2, 4).toUpperCase()}
                </div>
                <span className="wallet-address-short">{formatAddress(address)}</span>
                <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
            </button>

            {showDropdown && (
                <div className="wallet-dropdown">
                    <div className="dropdown-header">
                        <span className="dropdown-title">Switch Account</span>
                    </div>

                    <div className="accounts-list">
                        {sortedAccounts.map((account) => (
                            <div
                                key={account.address}
                                className={`account-item ${account.address.toLowerCase() === address.toLowerCase() ? 'active' : ''
                                    }`}
                            >
                                <button
                                    className="account-button"
                                    onClick={() => handleSwitchAccount(account.address)}
                                    type="button"
                                >
                                    <div className="account-avatar">
                                        {account.address.slice(2, 4).toUpperCase()}
                                    </div>
                                    <div className="account-info">
                                        <div className="account-address">{formatAddress(account.address)}</div>
                                        {account.address.toLowerCase() === address.toLowerCase() && (
                                            <div className="account-status">Active</div>
                                        )}
                                    </div>
                                    {account.address.toLowerCase() === address.toLowerCase() && (
                                        <span className="check-icon">✓</span>
                                    )}
                                </button>
                                {sortedAccounts.length > 1 && (
                                    <button
                                        className="remove-account"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveAccount(account.address);
                                        }}
                                        type="button"
                                        title="Remove account"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="dropdown-actions">
                        <button
                            className="add-account-btn"
                            onClick={handleAddAccount}
                            type="button"
                        >
                            <span className="add-icon">+</span>
                            Add Another Wallet
                        </button>
                        <button
                            className="disconnect-btn"
                            onClick={handleDisconnect}
                            type="button"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
