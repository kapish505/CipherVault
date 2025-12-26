/**
 * IPFS Upload Route
 * 
 * Proxies encrypted file uploads to Pinata (IPFS).
 * 
 * Purpose:
 * - Keep Pinata JWT server-side
 * - Accept encrypted file from frontend
 * - Upload to IPFS via Pinata
 * - Return CID to frontend
 * 
 * Security:
 * - Only accepts encrypted files (application/octet-stream)
 * - File size limits enforced
 * - No file content inspection (zero-knowledge)
 * - CORS restricted to frontend origin
 * 
 * Endpoint: POST /api/ipfs/upload
 * Body: FormData with 'file' field
 * Response: { cid: string }
 */

import { Router, Request, Response } from 'express';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';
import { config } from '../config/index.js';

const router = Router();

/**
 * Get Pinata client
 */
function getPinataClient() {
    return new pinataSDK({ pinataJWTKey: config.pinataJWT });
}

/**
 * POST /api/ipfs/upload
 * 
 * Upload encrypted file to IPFS via Pinata
 */
router.post('/upload', async (req: Request, res: Response) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Verify it's an encrypted file (should be application/octet-stream)
        if (req.file.mimetype !== 'application/octet-stream') {
            return res.status(400).json({
                error: 'Invalid file type. Only encrypted files are accepted.'
            });
        }

        // Check file size
        if (req.file.size > config.maxFileSize) {
            return res.status(400).json({
                error: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`
            });
        }

        // Upload to Pinata
        const pinata = getPinataClient();

        // Convert buffer to readable stream
        const stream = Readable.from(req.file.buffer);

        // Upload to IPFS via Pinata
        const result = await pinata.pinFileToIPFS(stream, {
            pinataMetadata: {
                name: req.file.originalname,
            },
            pinataOptions: {
                cidVersion: 1,
            },
        });

        // Return CID to frontend
        res.json({ cid: result.IpfsHash });

    } catch (error) {
        console.error('IPFS upload error:', error);
        res.status(500).json({
            error: 'Failed to upload file to IPFS. Please try again.'
        });
    }
});

/**
 * GET /api/ipfs/status
 * 
 * Check if IPFS service is configured
 */
router.get('/status', (_req: Request, res: Response) => {
    res.json({
        configured: !!config.pinataJWT,
        maxFileSize: config.maxFileSize,
        provider: 'Pinata',
    });
});

export default router;
