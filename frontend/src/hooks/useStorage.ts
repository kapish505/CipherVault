// State only - logic driven by Dashboard
// In a real app, this might fetch from a context or global store
useEffect(() => {
    // Placeholder for future logic
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
