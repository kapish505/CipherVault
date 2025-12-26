import { useState, useEffect } from 'react';
import * as metadata from '@/services/metadata';

export type NodeStatus = 'online' | 'offline';

const BASE_STORAGE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
const EARNED_STORAGE_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB

export function useStorage(refreshTrigger: number) {
    const [nodeStatus, setNodeStatus] = useState<NodeStatus>('online');
    const [usedBytes, setUsedBytes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateUsage = async () => {
            const files = await metadata.getAllFiles(); // We might need to exposing this or just use getFilesByWallet(currentWallet)
            // But since metadata service is IndexedDB based and scoped to wallet often, let's assume we can get all for current user. 
            // Actually, metadata.getFilesByWallet returns specific wallet files.
            // For now, let's just use a direct DB count or assume the caller passes files.
            // Better: Let's fetch all locally for now as an approximation.

            // Wait, we can't easily get access to "all files" without a wallet address if exclusively filtering.
            // Let's rely on the dashboard passing the current file list or just fetching again for the connected wallet.
            // To keep this hook independent, let's fetch for the current active wallet if we can updates.
            // But hooks usually don't know about wallet context unless passed.
            // Let's make it accept an address.

            // Actually, for MVP, we can just export a function in metadata to getting total size.
            setLoading(false);
        };

        // calculateUsage();
    }, [refreshTrigger]);

    // Derived state
    const totalLimit = nodeStatus === 'online' ? BASE_STORAGE_BYTES + EARNED_STORAGE_BYTES : BASE_STORAGE_BYTES;
    const isOverLimit = usedBytes > totalLimit;
    const percentUsed = Math.min(100, (usedBytes / totalLimit) * 100);

    return {
        nodeStatus,
        setNodeStatus,
        usedBytes,
        setUsedBytes, // Allow setting from outside (e.g. Dashboard calculation)
        baseLimit: BASE_STORAGE_BYTES,
        earnedLimit: EARNED_STORAGE_BYTES,
        totalLimit,
        isOverLimit,
        percentUsed,
        loading
    };
}
