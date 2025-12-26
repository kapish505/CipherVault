/**
 * Replica Status Component (SIMULATED)
 * 
 * Shows x402 self-healing status - prototype simulation
 */

import './ReplicaStatus.css';

interface ReplicaStatusProps {
    fileId: string;
}

export function ReplicaStatus({ fileId: _fileId }: ReplicaStatusProps) {
    // Mock data for demo - in real implementation, this would come from backend
    const replicaCount = 3;
    const health: 'healthy' | 'degraded' = Math.random() > 0.8 ? 'degraded' : 'healthy';

    return (
        <div className="replica-status" title="x402 self-healing status (prototype simulation)">
            <div className="replica-count">
                <span className="replica-icon">🔄</span>
                <span className="replica-number">{replicaCount}</span>
            </div>
            <div className={`health-badge health-${health}`}>
                {health === 'healthy' ? '✓ Healthy' : '⚠ Degraded'}
            </div>
            <div className="prototype-label">Prototype</div>
        </div>
    );
}
