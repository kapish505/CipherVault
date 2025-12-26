/**
 * Storage Analytics Component
 * 
 * Displays storage usage statistics
 */

import { useEffect, useState } from 'react';
import * as metadata from '@/services/metadata';
import { useWallet } from '@/hooks/useWallet';
import './StorageAnalytics.css';

interface StorageStats {
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    recentUploads: number;
}

export function StorageAnalytics() {
    const { address } = useWallet();
    const [stats, setStats] = useState<StorageStats>({
        totalFiles: 0,
        totalSize: 0,
        filesByType: {},
        recentUploads: 0,
    });

    useEffect(() => {
        if (!address) return;

        const loadStats = async () => {
            const files = await metadata.getAllFiles(address);

            const filesByType: Record<string, number> = {};
            let totalSize = 0;
            let recentUploads = 0;
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                totalSize += file.size;

                const type = file.mimeType.split('/')[0] || 'other';
                filesByType[type] = (filesByType[type] || 0) + 1;

                if (file.uploadedAt > weekAgo) {
                    recentUploads++;
                }
            });

            setStats({
                totalFiles: files.length,
                totalSize,
                filesByType,
                recentUploads,
            });
        };

        loadStats();
    }, [address]);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <div className="storage-analytics">
            <h3 className="analytics-title">Storage Overview</h3>

            <div className="analytics-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalFiles}</div>
                    <div className="stat-label">Total Files</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{formatSize(stats.totalSize)}</div>
                    <div className="stat-label">Storage Used</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats.recentUploads}</div>
                    <div className="stat-label">This Week</div>
                </div>
            </div>

            <div className="file-types">
                <h4 className="section-title">By File Type</h4>
                <div className="type-list">
                    {Object.entries(stats.filesByType).map(([type, count]) => (
                        <div key={type} className="type-item">
                            <span className="type-name">{type}</span>
                            <span className="type-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
