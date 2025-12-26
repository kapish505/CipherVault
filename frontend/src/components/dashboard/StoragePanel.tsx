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
        <div className="mt-auto p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">Node Status</span>
                <button
                    onClick={onToggleStatus}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${isOffline
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}
                >
                    {isOffline ? '● Offline' : '● Online'}
                </button>
            </div>

            <div className="mb-2 flex justify-between text-xs items-baseline">
                <span className={isOverLimit ? 'text-red-400 font-bold' : 'text-gray-200 font-medium'}>
                    {formatFileSize(usedBytes)}
                </span>
                <span className="text-gray-500 text-[11px]">
                    &nbsp;of {formatFileSize(totalLimit)}
                </span>
            </div>

            {/* Progress Bar - Thicker & Premium */}
            <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4 ring-1 ring-white/5">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        percent > 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-gray-400" title="Fixed quota provided to all users.">
                    <span>Base Plan</span>
                    <span className="font-mono text-gray-300">{formatFileSize(baseLimit)}</span>
                </div>
                <div
                    className={`flex justify-between text-[11px] transition-colors cursor-help ${isOffline ? 'text-red-400/60 line-through decoration-red-400/50' : 'text-purple-400'
                        }`}
                    title={isOffline
                        ? "Earned storage is unavailable because your node is Offline. Go Online to restore it."
                        : "Bonus storage earned by keeping your node online and contributing to the network."}
                >
                    <span className="flex items-center gap-1">
                        Earned {isOffline && '(Offline)'}
                    </span>
                    <span className="font-mono">+{formatFileSize(earnedLimit)}</span>
                </div>
            </div>

            {isOverLimit && (
                <div className="mt-3 text-[10px] text-red-300 bg-red-500/10 p-2 rounded-md border border-red-500/20 text-center font-medium">
                    ⚠️ Storage Limit Exceeded!
                    <br />
                    Bring node online to restore access.
                </div>
            )}
        </div>
    );
}
