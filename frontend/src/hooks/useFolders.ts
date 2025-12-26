/**
 * Folders Hook
 * 
 * Manages folder state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import * as metadata from '@/services/metadata';

export interface Folder extends metadata.FolderMetadata {
    // Extend or alias if needed, but for now we map directly
}

export function useFolders(walletAddress: string | null) {
    const [folders, setFolders] = useState<metadata.FileMetadata[]>([]);
    const [starredFiles, setStarredFiles] = useState<metadata.FileMetadata[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Load folders from IndexedDB
    const loadFolders = useCallback(async () => {
        if (!walletAddress) {
            setFolders([]);
            setStarredFiles([]);
            return;
        }

        setLoading(true);
        try {
            const allFiles = await metadata.getFilesByWallet(walletAddress);
            const folderList = allFiles.filter(f => f.mimeType === 'application/folder' && !f.isTrashed);
            const starred = allFiles.filter(f => f.isStarred && !f.isTrashed);

            setFolders(folderList);
            setStarredFiles(starred);
        } catch (error) {
            console.error('Failed to load folders:', error);
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    const createFolder = useCallback(async (name: string, parentId: string | null = null) => {
        if (!walletAddress) return null;

        try {
            // Create via metadata service
            const folderId = await metadata.createFolder(name, walletAddress, parentId);
            // Refresh local list
            await loadFolders();
            return folderId;
        } catch (error) {
            console.error('Failed to create folder:', error);
            return null;
        }
    }, [walletAddress, loadFolders]);

    const deleteFolder = useCallback(async (folderId: string) => {
        try {
            await metadata.moveToTrash(folderId);
            const allFiles = await metadata.getFilesByWallet(walletAddress!);

            // Re-filter to update both lists
            setFolders(allFiles.filter(f => f.mimeType === 'application/folder' && !f.isTrashed));
            setStarredFiles(allFiles.filter(f => f.isStarred && !f.isTrashed));
        } catch (error) {
            console.error('Failed to delete folder:', error);
        }
    }, [walletAddress]);

    // ... (getFolderPath and getSubfolders remain unchanged)

    const getFolderPath = useCallback((folderId: string | null): metadata.FileMetadata[] => {
        if (!folderId) return [];

        const path: metadata.FileMetadata[] = [];
        let currentId: string | null = folderId;

        // Safety break to prevent infinite loops in malformed trees
        let depth = 0;
        const maxDepth = 20;

        while (currentId && depth < maxDepth) {
            const folder = folders.find(f => f.id === currentId);
            if (!folder) break;
            path.unshift(folder);
            currentId = folder.folderId || null;
            depth++;
        }

        return path;
    }, [folders]);

    const getSubfolders = useCallback((parentId: string | null) => {
        return folders.filter(f => (f.folderId || null) === parentId);
    }, [folders]);

    const getPinnedFolders = useCallback(() => {
        return folders.filter(f => f.isStarred);
    }, [folders]);

    return {
        folders,
        starredFiles,
        currentFolderId,
        setCurrentFolderId,
        loading,
        createFolder,
        deleteFolder,
        getFolderPath,
        getSubfolders,
        getPinnedFolders,
        reload: loadFolders,
    };
}
