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

            <div className="mb-1 flex justify-between text-xs">
                <span className={isOverLimit ? 'text-red-400 font-bold' : 'text-gray-300'}>
                    {formatFileSize(usedBytes)}
                </span>
                <span className="text-gray-500">
                    of {formatFileSize(totalLimit)}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' :
                        percent > 80 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* Breakdown */}
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500" title="Fixed quota provided to all users.">
                    <span>Base Plan</span>
                    <span>{formatFileSize(baseLimit)}</span>
                </div>
                <div
                    className={`flex justify-between text-[10px] transition-colors cursor-help ${isOffline ? 'text-red-400/60 line-through decoration-red-400/50' : 'text-purple-400'
                        }`}
                    title={isOffline
                        ? "Earned storage is unavailable because your node is Offline. Go Online to restore it."
                        : "Bonus storage earned by keeping your node online and contributing to the network."}
                >
                    <span className="flex items-center gap-1">
                        Earned {isOffline && '(Node Offline)'}
                    </span>
                    <span>+{formatFileSize(earnedLimit)}</span>
                </div>
            </div>

            {isOverLimit && (
                <div className="mt-2 text-[10px] text-red-400 bg-red-500/10 p-1.5 rounded border border-red-500/20 text-center">
                    ⚠️ Storage Limit Exceeded!
                    <br />
                    Bring node online to restore access.
                </div>
            )}
        </div>
    );
}
