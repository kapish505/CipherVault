/**
 * Wallet Connect Component
 * 
 * Displays wallet connection button or connected wallet address.
 * 
 * States:
 * - MetaMask not installed: Shows install message
 * - Not connected: Shows "Connect Wallet" button
 * - Connecting: Shows loading state
 * - Connected: Shows shortened address with disconnect option
 * - Error: Shows error message
 * 
 * Security: Uses useWallet hook for all wallet operations
 */

import { useWallet } from '@/hooks/useWallet';
import { isMetaMaskInstalled } from '@/services/wallet';
import './WalletConnect.css';

/**
 * Shorten wallet address for display
 * Example: 0x1234...5678
 */
function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnect() {
    const { address, isConnected, isConnecting, error, connect, disconnect } = useWallet();

    // Check if MetaMask is installed
    const hasMetaMask = isMetaMaskInstalled();

    // MetaMask not installed - show install link
    if (!hasMetaMask) {
        return (
            <div className="wallet-connect">
                <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >
                    Install MetaMask
                </a>
            </div>
        );
    }

    // Not connected - show connect button
    if (!isConnected) {
        return (
            <div className="wallet-connect">
                <button
                    className="btn btn-primary"
                    onClick={connect}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <>
                            <span className="spinner"></span>
                            Connecting...
                        </>
                    ) : (
                        'Connect Wallet'
                    )}
                </button>
                {error && (
                    <div className="wallet-error">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // Connected - show address and disconnect
    return (
        <div className="wallet-connect wallet-connected">
            <div className="wallet-address" title={address || ''}>
                {address && shortenAddress(address)}
            </div>
            <button
                className="btn btn-ghost btn-sm"
                onClick={disconnect}
                title="Disconnect wallet"
            >
                Disconnect
            </button>
        </div>
    );
}
