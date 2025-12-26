/**
 * Files API Routes
 * 
 * CRUD operations for file metadata.
 * 
 * All routes require wallet authentication.
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as FileModel from '../models/File.js';
import { verifyWalletAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyWalletAuth);

/**
 * GET /api/files
 * List all files for authenticated wallet
 */
router.get('/', (req: Request, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const files = FileModel.getFilesByOwner(walletAddress, limit, offset);
        const total = FileModel.countFilesByOwner(walletAddress);

        res.json({
            files,
            pagination: {
                limit,
                offset,
                total
            }
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

/**
 * POST /api/files
 * Create file metadata
 */
router.post('/', (req: Request, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;
        const {
            nameEncrypted,
            size,
            mimeTypeEncrypted,
            cid,
            encryptedKey,
            keyIV,
            fileIV,
            folderId,
            classification
        } = req.body;

        // Validate required fields
        if (!nameEncrypted || !size || !mimeTypeEncrypted || !cid || !encryptedKey || !keyIV || !fileIV) {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['nameEncrypted', 'size', 'mimeTypeEncrypted', 'cid', 'encryptedKey', 'keyIV', 'fileIV']
            });
            return;
        }

        const file = FileModel.createFile({
            id: uuidv4(),
            ownerWallet: walletAddress,
            nameEncrypted,
            size: parseInt(size),
            mimeTypeEncrypted,
            cid,
            encryptedKey,
            keyIV,
            fileIV,
            folderId: folderId || null,
            classification: classification || 'private'
        });

        res.status(201).json(file);
    } catch (error) {
        console.error('Create file error:', error);
        res.status(500).json({ error: 'Failed to create file' });
    }
});

/**
 * GET /api/files/:id
 * Get specific file metadata
 */
router.get('/:id', (req: Request, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;
        const { id } = req.params;

        const file = FileModel.getFileById(id);

        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        // Verify ownership
        if (file.owner_wallet !== walletAddress) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        res.json(file);
    } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({ error: 'Failed to get file' });
    }
});

/**
 * PUT /api/files/:id
 * Update file metadata
 */
router.put('/:id', (req: Request, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;
        const { id } = req.params;
        const { nameEncrypted, mimeTypeEncrypted } = req.body;

        // Check file exists and ownership
        const file = FileModel.getFileById(id);

        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        if (file.owner_wallet !== walletAddress) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        // Update file
        const updated = FileModel.updateFile(id, {
            name_encrypted: nameEncrypted,
            mime_type_encrypted: mimeTypeEncrypted
        });

        res.json(updated);
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({ error: 'Failed to update file' });
    }
});

/**
 * DELETE /api/files/:id
 * Soft delete file
 */
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;
        const { id } = req.params;

        // Check file exists and ownership
        const file = FileModel.getFileById(id);

        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        if (file.owner_wallet !== walletAddress) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        // Delete file
        const deleted = FileModel.deleteFile(id);

        if (deleted) {
            res.json({ success: true, message: 'File deleted' });
        } else {
            res.status(500).json({ error: 'Failed to delete file' });
        }
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
