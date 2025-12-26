/**
 * Folders Hook
 * 
 * Manages folder state and operations
 */

import { useState, useEffect, useCallback } from 'react';

export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: number;
}

export function useFolders(walletAddress: string | null) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Load folders from API
    const loadFolders = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        try {
            // TODO: Implement API call when backend is ready
            // For now, use mock data
            const mockFolders: Folder[] = [];
            setFolders(mockFolders);
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

        const newFolder: Folder = {
            id: `folder_${Date.now()}`,
            name,
            parent_id: parentId,
            created_at: Date.now(),
        };

        setFolders(prev => [...prev, newFolder]);
        return newFolder;
    }, [walletAddress]);

    const deleteFolder = useCallback((folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
    }, []);

    const getFolderPath = useCallback((folderId: string | null): Folder[] => {
        if (!folderId) return [];

        const path: Folder[] = [];
        let currentId: string | null = folderId;

        while (currentId) {
            const folder = folders.find(f => f.id === currentId);
            if (!folder) break;
            path.unshift(folder);
            currentId = folder.parent_id;
        }

        return path;
    }, [folders]);

    const getSubfolders = useCallback((parentId: string | null) => {
        return folders.filter(f => f.parent_id === parentId);
    }, [folders]);

    return {
        folders,
        currentFolderId,
        setCurrentFolderId,
        loading,
        createFolder,
        deleteFolder,
        getFolderPath,
        getSubfolders,
        reload: loadFolders,
    };
}
