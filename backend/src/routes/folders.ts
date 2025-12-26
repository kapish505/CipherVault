/**
 * Folder Routes
 * 
 * API endpoints for folder management
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as Folder from '../models/Folder.js';
import { verifyWalletAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Create a new folder
 * POST /api/folders
 */
router.post('/', verifyWalletAuth, (req, res) => {
    try {
        const { name, parentId } = req.body;
        const ownerWallet = req.walletAddress!;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const folder = Folder.createFolder({
            id: uuidv4(),
            owner_wallet: ownerWallet,
            name: name.trim(),
            parent_id: parentId || null,
        });

        res.status(201).json({ folder });
    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

/**
 * Get all folders for current user
 * GET /api/folders
 */
router.get('/', verifyWalletAuth, (req, res) => {
    try {
        const walletAddress = req.walletAddress!;
        const folders = Folder.getFoldersByWallet(walletAddress);
        res.json({ folders });
    } catch (error) {
        console.error('Get folders error:', error);
        res.status(500).json({ error: 'Failed to get folders' });
    }
});

/**
 * Update folder name
 * PUT /api/folders/:folderId
 */
router.put('/:folderId', verifyWalletAuth, (req, res) => {
    try {
        const { folderId } = req.params;
        const { name } = req.body;
        const walletAddress = req.walletAddress!;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        // Verify ownership
        const folder = Folder.getFolderById(folderId);
        if (!folder || folder.owner_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const success = Folder.updateFolder(folderId, name.trim());
        if (!success) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json({ message: 'Folder updated successfully' });
    } catch (error) {
        console.error('Update folder error:', error);
        res.status(500).json({ error: 'Failed to update folder' });
    }
});

/**
 * Delete folder
 * DELETE /api/folders/:folderId
 */
router.delete('/:folderId', verifyWalletAuth, (req, res) => {
    try {
        const { folderId } = req.params;
        const walletAddress = req.walletAddress!;

        // Verify ownership
        const folder = Folder.getFolderById(folderId);
        if (!folder || folder.owner_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const success = Folder.deleteFolder(folderId);
        if (!success) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

export default router;
