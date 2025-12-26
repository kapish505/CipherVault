/**
 * Batch Operations Hook
 * 
 * Manages multi-select and batch operations
 */

import { useState, useCallback } from 'react';
import * as metadata from '@/services/metadata';

export function useBatchOperations() {
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const toggleSelection = useCallback((fileId: string) => {
        setSelectedFiles(prev => {
            const next = new Set(prev);
            if (next.has(fileId)) {
                next.delete(fileId);
            } else {
                next.add(fileId);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback((files: metadata.FileMetadata[]) => {
        setSelectedFiles(new Set(files.map(f => f.id)));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
    }, []);

    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode(prev => !prev);
        if (isSelectionMode) {
            setSelectedFiles(new Set());
        }
    }, [isSelectionMode]);

    return {
        selectedFiles,
        isSelectionMode,
        toggleSelection,
        selectAll,
        clearSelection,
        toggleSelectionMode,
        selectedCount: selectedFiles.size,
    };
}
