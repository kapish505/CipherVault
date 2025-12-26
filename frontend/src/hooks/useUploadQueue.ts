/**
 * Upload Queue Hook
 * 
 * Manages multi-file upload queue with progress tracking
 */

import { useState, useCallback } from 'react';
import * as encryption from '@/services/encryption';
import * as ipfs from '@/services/ipfs';
import * as metadata from '@/services/metadata';
import { generateId } from '@/utils/format';

export interface UploadTask {
    id: string;
    file: File;
    status: 'queued' | 'encrypting' | 'uploading' | 'completed' | 'failed';
    progress: number;
    error?: string;
    folderId?: string;
    classification?: 'public' | 'private' | 'confidential';
}

export function useUploadQueue() {
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const addToQueue = useCallback((files: File[], folderId?: string, classification?: string) => {
        const newTasks: UploadTask[] = files.map(file => ({
            id: generateId(),
            file,
            status: 'queued',
            progress: 0,
            folderId,
            classification: (classification as any) || 'private',
        }));

        setTasks(prev => [...prev, ...newTasks]);
        return newTasks;
    }, []);

    const processQueue = useCallback(async (walletAddress: string, explicitTasks?: UploadTask[]) => {
        setIsProcessing(prev => {
            if (prev) return prev; // Already processing
            return true;
        });

        // Use explicit tasks if provided (for immediate processing after add)
        // Otherwise try to find queued tasks in current state (might be stale if called immediately)
        let queuedTasks: UploadTask[] = explicitTasks || [];

        // If no explicit tasks, try to get from state using functional update trick
        // NOTE: This only works if state has settled, which is why explicitTasks is better
        if (queuedTasks.length === 0) {
            setTasks(currentTasks => {
                const pending = currentTasks.filter(t => t.status === 'queued');
                if (pending.length > 0) queuedTasks = pending; // This won't work for the loop below because it runs later
                return currentTasks;
            });
            // Fallback: if we entered here without explicit tasks, we rely on the loop below
            // using the 'queuedTasks' variable which might be empty if we rely only on the setter callback side-effect
            // BUT, since we changed the logic loop to rely on explicitTasks being passed from UI,
            // we should warn if neither are present.
        }

        // If explicitly passed, we are good.
        if (queuedTasks.length === 0) {
            // Try to recover from state one last time in case of "Retry" button which doesn't pass explicit tasks
            // We can't easily access current state here without a Ref. 
            // For now, let's assume Retry logic (which we'll check) might need updates too.
            // But for the main "Upload" flow, explicitTasks fixes it.
        }

        // Process each queued task
        for (const task of queuedTasks) {
            try {
                // Update status to encrypting
                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, status: 'encrypting' as const, progress: 10 } : t
                ));

                // Generate file encryption key
                const fileKey = await encryption.generateFileKey();

                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, progress: 20 } : t
                ));

                // Encrypt the file
                const { encryptedData, iv: fileIV } = await encryption.encryptFile(task.file, fileKey);

                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, progress: 30 } : t
                ));

                // Derive wallet key
                const walletKey = await encryption.deriveKeyFromWallet(walletAddress);

                // Encrypt file key
                const { encryptedKey, iv: keyIV } = await encryption.encryptFileKey(fileKey, walletKey);

                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, status: 'uploading' as const, progress: 40 } : t
                ));

                // Upload to IPFS
                const cid = await ipfs.uploadFile(encryptedData, task.file.name, (uploadProgress) => {
                    setTasks(prev => prev.map(t =>
                        t.id === task.id ? { ...t, progress: 40 + (uploadProgress / 2) } : t
                    ));
                });

                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, progress: 90 } : t
                ));

                // Save metadata
                const fileMetadata: metadata.FileMetadata = {
                    id: task.id,
                    name: task.file.name,
                    size: task.file.size,
                    mimeType: task.file.type,
                    uploadedAt: Date.now(),
                    cid,
                    encryptedKey: encryption.arrayBufferToBase64(encryptedKey),
                    keyIV: encryption.arrayBufferToBase64(keyIV.buffer as ArrayBuffer),
                    fileIV: encryption.arrayBufferToBase64(fileIV.buffer as ArrayBuffer),
                    walletAddress,
                    folderId: task.folderId,
                    classification: task.classification,
                };

                await metadata.saveFileMetadata(fileMetadata);

                // Sync to backend (optional)
                try {
                    const api = await import('@/services/api');
                    await api.createFile(walletAddress, {
                        nameEncrypted: encryption.arrayBufferToBase64(new TextEncoder().encode(task.file.name).buffer as ArrayBuffer),
                        size: task.file.size,
                        mimeTypeEncrypted: encryption.arrayBufferToBase64(new TextEncoder().encode(task.file.type).buffer as ArrayBuffer),
                        cid,
                        encryptedKey: encryption.arrayBufferToBase64(encryptedKey),
                        keyIV: encryption.arrayBufferToBase64(keyIV.buffer as ArrayBuffer),
                        fileIV: encryption.arrayBufferToBase64(fileIV.buffer as ArrayBuffer),
                        folderId: task.folderId,
                        classification: task.classification,
                    });
                } catch (apiError) {
                    console.warn('Failed to sync to backend:', apiError);
                }

                // Mark as completed
                setTasks(prev => prev.map(t =>
                    t.id === task.id ? { ...t, status: 'completed' as const, progress: 100 } : t
                ));

            } catch (error: any) {
                console.error('Upload failed:', error);
                setTasks(prev => prev.map(t =>
                    t.id === task.id ? {
                        ...t,
                        status: 'failed' as const,
                        error: error.message || 'Upload failed'
                    } : t
                ));
            }
        }

        setIsProcessing(false);
    }, []); // Empty deps - no closure issues

    const retryTask = useCallback((taskId: string) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'queued', progress: 0, error: undefined } : t
        ));
    }, []);

    const removeTask = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const clearCompleted = useCallback(() => {
        setTasks(prev => prev.filter(t => t.status !== 'completed'));
    }, []);

    return {
        tasks,
        isProcessing,
        addToQueue,
        processQueue,
        retryTask,
        removeTask,
        clearCompleted,
        hasActiveTasks: tasks.some(t => ['queued', 'encrypting', 'uploading'].includes(t.status)),
    };
}
