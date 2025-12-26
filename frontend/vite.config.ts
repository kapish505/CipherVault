/**
 * Vite Configuration
 * 
 * Build configuration for the CipherVault frontend.
 * Sets up React plugin and path aliases for cleaner imports.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
})
