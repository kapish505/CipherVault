/**
 * Backend Configuration
 * 
 * Loads environment variables and provides configuration for the backend.
 * 
 * Security:
 * - Pinata JWT kept server-side only
 * - CORS configured for frontend origin
 * - No secrets in code
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3001,

    // Pinata JWT token (server-side only)
    pinataJWT: process.env.PINATA_JWT || '',

    // CORS configuration
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',

    // Max file size (100MB)
    maxFileSize: 100 * 1024 * 1024,
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
    if (!config.pinataJWT) {
        throw new Error('PINATA_JWT environment variable is required');
    }
}
