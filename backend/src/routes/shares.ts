/**
 * File Shares Routes
 * 
 * API endpoints for file sharing
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as FileShare from '../models/FileShare.js';
import * as File from '../models/File.js';
import { verifyWalletAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Create a new file share
 * POST /api/shares
 */
router.post('/', verifyWalletAuth, (req, res) => {
    try {
        const { fileId, sharedWithWallet, encryptedKeyForRecipient, permissions = 'read' } = req.body;
        const ownerWallet = req.walletAddress!;

        // Validate input
        if (!fileId || !sharedWithWallet || !encryptedKeyForRecipient) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify file exists and user owns it
        const file = File.getFileById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        if (file.owner_wallet.toLowerCase() !== ownerWallet.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized to share this file' });
        }

        // Create share
        const share = FileShare.createShare({
            id: uuidv4(),
            file_id: fileId,
            owner_wallet: ownerWallet,
            shared_with_wallet: sharedWithWallet,
            encrypted_key_for_recipient: encryptedKeyForRecipient,
            permissions: permissions as 'read' | 'write',
        });

        res.status(201).json({ share });
    } catch (error) {
        console.error('Create share error:', error);
        res.status(500).json({ error: 'Failed to create share' });
    }
});

/**
 * Get shares for current user (received shares)
 * GET /api/shares/received
 */
router.get('/received', verifyWalletAuth, (req, res) => {
    try {
        const walletAddress = req.walletAddress!;

        const shares = FileShare.getSharesForUser(walletAddress);

        // Enrich with file metadata
        const enrichedShares = shares.map(share => {
            const file = File.getFileById(share.file_id);
            return {
                ...share,
                file: file || null,
            };
        });

        res.json({ shares: enrichedShares });
    } catch (error) {
        console.error('Get received shares error:', error);
        res.status(500).json({ error: 'Failed to get shares' });
    }
});

/**
 * Get shares created by current user (sent shares)
 * GET /api/shares/sent
 */
router.get('/sent', verifyWalletAuth, (req, res) => {
    try {
        const walletAddress = req.walletAddress!;

        const shares = FileShare.getSharesByOwner(walletAddress);

        // Enrich with file metadata
        const enrichedShares = shares.map(share => {
            const file = File.getFileById(share.file_id);
            return {
                ...share,
                file: file || null,
            };
        });

        res.json({ shares: enrichedShares });
    } catch (error) {
        console.error('Get sent shares error:', error);
        res.status(500).json({ error: 'Failed to get shares' });
    }
});

/**
 * Get shares for a specific file
 * GET /api/shares/file/:fileId
 */
router.get('/file/:fileId', verifyWalletAuth, (req, res) => {
    try {
        const { fileId } = req.params;
        const walletAddress = req.walletAddress!;

        // Verify user owns the file
        const file = File.getFileById(fileId);
        if (!file || file.owner_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const shares = FileShare.getSharesByFile(fileId);
        res.json({ shares });
    } catch (error) {
        console.error('Get file shares error:', error);
        res.status(500).json({ error: 'Failed to get shares' });
    }
});

/**
 * Revoke a share
 * DELETE /api/shares/:shareId
 */
router.delete('/:shareId', verifyWalletAuth, (req, res) => {
    try {
        const { shareId } = req.params;
        const walletAddress = req.walletAddress!;

        const success = FileShare.revokeShare(shareId, walletAddress);

        if (!success) {
            return res.status(404).json({ error: 'Share not found or already revoked' });
        }

        res.json({ message: 'Share revoked successfully' });
    } catch (error) {
        console.error('Revoke share error:', error);
        res.status(500).json({ error: 'Failed to revoke share' });
    }
});

export default router;
