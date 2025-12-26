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
                // Note: In a real app, we would look up the CID from the fileId (metadata).
                // For now, if fileId looks like a CID, we use it directly.
                // Or we fetch everything and filter (but that's slow).
                // Let's assume fileId IS the CID for this component usage, 
                // OR we pass `cid` query param properly.
                const res = await fetch(`/api/replica?cid=${encodeURIComponent(fileId)}`);
                if (!res.ok) throw new Error('Network response was not ok');
                const json: ReplicaData = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message || 'Failed to load replica status');
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
            <div className="prototype-label">Real</div>
        </div>
    );
}
