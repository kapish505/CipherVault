import React from 'react';
import { formatFileSize } from '@/utils/format';
import { NodeStatus } from '@/hooks/useStorage';

interface StoragePanelProps {
    usedBytes: number;
    totalLimit: number;
    baseLimit: number;
    earnedLimit: number;
    nodeStatus: NodeStatus;
    onToggleStatus: () => void;
}

export function StoragePanel({
    usedBytes,
    totalLimit,
    baseLimit,
    earnedLimit,
    nodeStatus,
    onToggleStatus
}: StoragePanelProps) {
    const percent = Math.min(100, (usedBytes / totalLimit) * 100);
    const isOffline = nodeStatus === 'offline';
    const isOverLimit = usedBytes > totalLimit;

    return (
        <div className="mt-auto p-5 border-t border-white/5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
            {/* Header: Node Status */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">
                    Network Node
                </span>
                <button
                    onClick={onToggleStatus}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all duration-300 font-medium tracking-wide flex items-center gap-1.5 ${isOffline
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]'
                        }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                    {isOffline ? 'OFFLINE' : 'ONLINE'}
                </button>
            </div>

            {/* Hero Metric: Storage Used */}
            <div className="mb-3">
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold tracking-tight ${isOverLimit ? 'text-red-400' : 'text-gray-100'}`}>
                        {formatFileSize(usedBytes)}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        used
                    </span>
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                    of {formatFileSize(totalLimit)} capacity
                </div>
            </div>

            {/* Progress Bar - Premium Glow */}
            <div className="h-2.5 bg-gray-800/50 rounded-full overflow-hidden mb-5 ring-1 ring-white/5 shadow-inner relative">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out relative ${isOverLimit ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        percent > 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                    style={{ width: `${percent}%` }}
                >
                    {/* Inner Shine/Glow Effect */}
                    <div className="absolute top-0 right-0 bottom-0 w-[20px] bg-gradient-to-r from-transparent to-white/20 blur-[2px]" />
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold">Base Plan</span>
                    <span className="text-xs font-mono text-gray-300">{formatFileSize(baseLimit)}</span>
                </div>
                <div className="flex flex-col gap-0.5 relative group cursor-help">
                    <span className={`text-[9px] uppercase tracking-wider font-semibold ${isOffline ? 'text-red-500/50' : 'text-purple-400/80'
                        }`}>
                        Earned {isOffline && '!'}
                    </span>
                    <span className={`text-xs font-mono transition-colors ${isOffline ? 'text-red-500/50 line-through' : 'text-purple-300'
                        }`}>
                        +{formatFileSize(earnedLimit)}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 border border-gray-700 rounded shadow-xl text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {isOffline
                            ? "Go Online to reclaim earned storage."
                            : "Bonus storage from network contribution."}
                    </div>
                </div>
            </div>

            {isOverLimit && (
                <div className="mt-4 text-xs text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center font-medium shadow-sm animate-pulse">
                    ⚠️ limit Exceeded
                </div>
            )}
        </div>
    );
}
