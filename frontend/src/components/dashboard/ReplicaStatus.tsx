import { useEffect, useState } from 'react';
import './ReplicaStatus.css';

interface ReplicaStatusProps {
    fileId: string;
}

interface ReplicaData {
    replicaCount: number;
    health: 'healthy' | 'degraded';
}

export function ReplicaStatus({ fileId }: ReplicaStatusProps) {
    const [data, setData] = useState<ReplicaData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReplicaStatus = async () => {
            try {
                // Try API first
                const res = await fetch(`/api/replica?cid=${encodeURIComponent(fileId)}`);

                if (res.ok) {
                    const json: ReplicaData = await res.json();
                    setData(json);
                    return;
                }

                // Fallback: Check IPFS Gateway directly (Client-side verification)
                // This confirms at least 1 replica exists (on the gateway/IPFS network)
                const gatewayRes = await fetch(`https://gateway.pinata.cloud/ipfs/${fileId}`, { method: 'HEAD' });
                if (gatewayRes.ok) {
                    setData({
                        replicaCount: 1, // At least one confirmed
                        health: 'healthy'
                    });
                } else {
                    setData({
                        replicaCount: 0,
                        health: 'degraded'
                    });
                }

            } catch (err: any) {
                // Even if fetch fails (e.g. network error), try gateway if not already tried
                // Simple fallback for now
                try {
                    const gatewayRes = await fetch(`https://gateway.pinata.cloud/ipfs/${fileId}`, { method: 'HEAD' });
                    if (gatewayRes.ok) {
                        setData({ replicaCount: 1, health: 'healthy' });
                        return;
                    }
                } catch (e) {
                    // Ignore
                }
                // Don't show error text to user, just show degraded state if check fails
                // setError(err.message || 'Failed to load replica status');
                setData({ replicaCount: 0, health: 'degraded' });
            } finally {
                setLoading(false);
            }
        };
        fetchReplicaStatus();
    }, [fileId]);

    if (loading) {
        return <div className="replica-status">Loading replica status...</div>;
    }
    if (error) {
        return <div className="replica-status error">{error}</div>;
    }
    if (!data) return null;

    const { replicaCount, health } = data;
    return (
        <div className="replica-status" title="x402 self-healing status">
            <div className="replica-count">
                <span className="replica-icon">🔄</span>
                <span className="replica-number">{replicaCount}</span>
            </div>
            <div className={`health-badge health-${health}`}>
                {health === 'healthy' ? '✓ Healthy' : '⚠ Degraded'}
            </div>
            {/* Real badge removed for cleaner UI */}
        </div>
    );
}
