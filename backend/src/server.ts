/**
 * Express Backend Server
 * 
 * Provides API endpoints for CipherVault frontend.
 * 
 * Purpose:
 * - Proxy IPFS uploads to Web3.Storage
 * - Keep API tokens server-side
 * - Provide zero-knowledge file storage
 * 
 * Security:
 * - CORS restricted to frontend origin
 * - File size limits enforced
 * - No file content inspection
 * - API token never exposed to frontend
 * 
 * Endpoints:
 * - POST /api/ipfs/upload - Upload encrypted file
 * - GET /api/ipfs/status - Check service status
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config, validateConfig } from './config/index.js';
import { initDatabase, closeDatabase } from './db/index.js';
import ipfsRoutes from './routes/ipfs.js';
import filesRoutes from './routes/files.js';
import sharesRoutes from './routes/shares.js';
import foldersRoutes from './routes/folders.js';

/**
 * Initialize database
 */
try {
    initDatabase();
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

/**
 * Validate configuration
 */
try {
    validateConfig();
} catch (error) {
    console.error('Configuration error:', error);
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));

app.use(express.json());

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.maxFileSize,
    },
});

// Root route
app.get('/', (_req, res) => {
    res.json({
        name: 'CipherVault Backend API',
        version: '0.1.0',
        status: 'running',
        description: 'Zero-knowledge encrypted file storage API',
        endpoints: {
            health: '/health',
            ipfsStatus: '/api/ipfs/status',
            ipfsUpload: 'POST /api/ipfs/upload',
        },
        provider: 'Pinata IPFS',
    });
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// IPFS routes (with file upload middlewar// Routes
app.use('/api/ipfs', upload.single('file'), ipfsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/shares', sharesRoutes);
app.use('/api/folders', foldersRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(config.port, () => {
    console.log(`🚀 CipherVault backend running on port ${config.port}`);
    console.log(`📦 IPFS uploads proxied to Web3.Storage`);
    console.log(`🔒 CORS origin: ${config.corsOrigin}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        closeDatabase();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
        console.log('Server closed');
        closeDatabase();
        process.exit(0);
    });
});
