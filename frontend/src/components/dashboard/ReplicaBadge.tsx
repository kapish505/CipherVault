import React from 'react';

interface ReplicaBadgeProps {
    current: number;
    target: number;
    status: 'Healthy' | 'Degraded' | 'Recovering';
    lastHealed?: number;
    onHeal?: () => void;
}

export function ReplicaBadge({ current, target, status, lastHealed, onHeal }: ReplicaBadgeProps) {
    // Colors based on status
    const getColors = () => {
        switch (status) {
            case 'Healthy':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Recovering':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse';
            case 'Degraded':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400';
        }
    };

    const getTooltip = () => {
        let text = `Network Replicas: ${current}/${target}\n`;
        text += "Files are stored across multiple nodes for durability.\n";

        if (status === 'Healthy') text += "✓ File is fully replicated and safe.";
        if (status === 'Degraded') text += "⚠ Replica count is low. Click 'Heal' to restore redundancy.";
        if (status === 'Recovering') text += "⟳ Network is currently replicating this file.";

        if (lastHealed) {
            text += `\n• Last Healed: ${new Date(lastHealed).toLocaleString()}`;
        }
        return text;
    };

    return (
        <div className="flex items-center gap-2" title={getTooltip()}>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getColors()}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Healthy' ? 'bg-green-400' :
                    status === 'Recovering' ? 'bg-blue-400' : 'bg-orange-400'
                    }`} />
                {current}/{target} Replicas
            </div>

            {status === 'Degraded' && onHeal && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onHeal();
                    }}
                    className="ml-1 p-1 hover:bg-white/10 rounded-full text-xs text-blue-400 transition-colors"
                    title="Heal Network (Restore Replicas)"
                >
                    🏥 Heal
                </button>
            )}

            {status === 'Recovering' && (
                <span className="text-xs text-blue-400/70 italic">
                    Healing...
                </span>
            )}
        </div>
    );
}
