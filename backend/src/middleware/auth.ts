/**
 * Authentication Middleware
 * 
 * Verifies wallet signatures for API requests.
 * 
 * Security:
 * - Validates wallet ownership via signature
 * - Prevents replay attacks with timestamps
 * - Rejects expired signatures
 * 
 * Headers required:
 * - X-Wallet-Address: Wallet address
 * - X-Signature: Signed message
 * - X-Timestamp: Message timestamp
 */

import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { upsertUser } from '../models/User.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            walletAddress?: string;
        }
    }
}

/**
 * Verify wallet signature
 */
export async function verifyWalletAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const walletAddress = req.headers['x-wallet-address'] as string;
        const signature = req.headers['x-signature'] as string;
        const timestamp = req.headers['x-timestamp'] as string;

        // Check required headers
        if (!walletAddress || !signature || !timestamp) {
            res.status(401).json({
                error: 'Missing authentication headers',
                required: ['X-Wallet-Address', 'X-Signature', 'X-Timestamp']
            });
            return;
        }

        // Check timestamp (reject if older than 5 minutes)
        const now = Date.now();
        const messageTime = parseInt(timestamp);
        const fiveMinutes = 5 * 60 * 1000;

        if (isNaN(messageTime) || Math.abs(now - messageTime) > fiveMinutes) {
            res.status(401).json({
                error: 'Signature expired or invalid timestamp'
            });
            return;
        }

        // Construct message (same format frontend will use)
        const message = `CipherVault Authentication\nTimestamp: ${timestamp}`;

        // Verify signature
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);

            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                res.status(401).json({
                    error: 'Invalid signature'
                });
                return;
            }
        } catch (error) {
            res.status(401).json({
                error: 'Signature verification failed'
            });
            return;
        }

        // Update user's last seen
        upsertUser(walletAddress);

        // Attach wallet address to request
        req.walletAddress = walletAddress.toLowerCase();

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            error: 'Authentication error'
        });
    }
}

/**
 * Optional auth - doesn't fail if no auth provided
 */
export async function optionalWalletAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const walletAddress = req.headers['x-wallet-address'] as string;
    const signature = req.headers['x-signature'] as string;

    if (!walletAddress || !signature) {
        // No auth provided, continue without wallet
        next();
        return;
    }

    // If auth is provided, verify it
    await verifyWalletAuth(req, res, next);
}
