import { useState, useEffect } from 'react';

export type NodeStatus = 'online' | 'offline';

const BASE_STORAGE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
const EARNED_STORAGE_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB

export function useStorage(refreshTrigger: number) {
    const [nodeStatus, setNodeStatus] = useState<NodeStatus>('online');
    const [usedBytes, setUsedBytes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder for future logic where we might fetch storage stats
        // independent of the dashboard components.
        setLoading(false);
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
