/**
 * Share Dialog Component
 * 
 * Modal for sharing files with other wallet addresses
 */

import { useState } from 'react';
import * as metadata from '@/services/metadata';
import { createShare } from '@/services/shares';
import './ShareDialog.css';

interface ShareDialogProps {
    file: metadata.FileMetadata;
    walletAddress: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function ShareDialog({ file, walletAddress, onClose, onSuccess }: ShareDialogProps) {
    const [recipientWallet, setRecipientWallet] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState('');

    const handleShare = async () => {
        if (!recipientWallet.trim()) {
            setError('Please enter a wallet address');
            return;
        }

        // Basic validation
        if (!recipientWallet.startsWith('0x') || recipientWallet.length !== 42) {
            setError('Invalid wallet address format');
            return;
        }

        setIsSharing(true);
        setError('');

        try {
            // For now, we'll use the same encrypted key
            // In a real implementation, you'd re-encrypt the key for the recipient
            await createShare(
                walletAddress,
                file.id,
                recipientWallet,
                file.encryptedKey, // Simplified: using same key
                'read'
            );

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to share file');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="share-dialog-overlay" onClick={onClose}>
            <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="share-dialog-header">
                    <h2>Share File</h2>
                    <button className="dialog-close" onClick={onClose}>✕</button>
                </div>

                <div className="share-dialog-content">
                    <div className="share-file-info">
                        <span className="file-icon-large">📄</span>
                        <div>
                            <div className="share-file-name">{file.name}</div>
                            <div className="share-file-meta">Read-only access</div>
                        </div>
                    </div>

                    <div className="share-form">
                        <label className="share-label">
                            Recipient Wallet Address
                        </label>
                        <input
                            type="text"
                            className="share-input"
                            placeholder="0x..."
                            value={recipientWallet}
                            onChange={(e) => setRecipientWallet(e.target.value)}
                            disabled={isSharing}
                        />
                        {error && <div className="share-error">{error}</div>}
                    </div>

                    <div className="share-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isSharing}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleShare}
                            disabled={isSharing}
                        >
                            {isSharing ? 'Sharing...' : 'Share File'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
