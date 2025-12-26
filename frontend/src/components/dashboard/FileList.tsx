/**
 * File List Component - Structured Table View
 * 
 * Drive-inspired file list with:
 * - Table layout (name, type, size, modified, status)
 * - Grid layout option
 * - Empty state
 * - Encryption indicators
 */

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';
import * as encryption from '@/services/encryption';
import * as ipfs from '@/services/ipfs';
import * as metadata from '@/services/metadata';
import { formatFileSize, formatDate } from '@/utils/format';
import { getFileTypeIcon } from './FilePreview';
import { ClassificationBadge } from './ClassificationBadge';
import { ReplicaStatus } from './ReplicaStatus';
import './FileList.css';

interface FileListProps {
    refreshTrigger: number;
    viewMode?: 'list' | 'grid';
    searchQuery?: string;
    onFileSelect?: (file: metadata.FileMetadata) => void;
    selectedFileId?: string;
}

export function FileList({
    refreshTrigger,
    viewMode = 'list',
    searchQuery = '',
    onFileSelect,
    selectedFileId
}: FileListProps) {
    const { address, isConnected } = useWallet();
    const [files, setFiles] = useState<metadata.FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const loadFiles = async () => {
            if (!isConnected || !address) {
                setFiles([]);
                setLoading(false);
                return;
            }

            try {
                const userFiles = await metadata.getFilesByWallet(address);
                setFiles(userFiles);
            } catch (error) {
                console.error('Failed to load files:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFiles();
    }, [address, isConnected, refreshTrigger]);

    const filteredFiles = useMemo(() => {
        if (!searchQuery) return files;

        const query = searchQuery.toLowerCase();
        return files.filter(file =>
            file.name.toLowerCase().includes(query)
        );
    }, [files, searchQuery]);

    const handleDownload = async (file: metadata.FileMetadata) => {
        if (!address) return;
        setDownloadingId(file.id);

        try {
            const encryptedData = await ipfs.downloadFile(file.cid);
            const walletKey = await encryption.deriveKeyFromWallet(address);
            const keyIV = encryption.base64ToArrayBuffer(file.keyIV);
            const encryptedKey = encryption.base64ToArrayBuffer(file.encryptedKey);
            const fileKey = await encryption.decryptFileKey(encryptedKey, new Uint8Array(keyIV), walletKey);
            const fileIV = encryption.base64ToArrayBuffer(file.fileIV);
            const decryptedData = await encryption.decryptFile(
                encryptedData,
                new Uint8Array(fileIV),
                fileKey
            );

            const blob = new Blob([decryptedData], { type: file.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (file: metadata.FileMetadata) => {
        if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            await metadata.deleteFileMetadata(file.id);
            setFiles(files.filter(f => f.id !== file.id));
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file.');
        }
    };

    if (!isConnected) {
        return null;
    }

    if (loading) {
        return (
            <div className="file-list-loading">
                <div className="spinner-large"></div>
                <p>Loading files...</p>
            </div>
        );
    }

    if (filteredFiles.length === 0) {
        return (
            <div className="file-list-empty">
                {searchQuery ? (
                    <>
                        <span className="empty-icon">🔍</span>
                        <h3>No files found</h3>
                        <p>No files match "{searchQuery}"</p>
                    </>
                ) : (
                    <>
                        <span className="empty-icon">📁</span>
                        <h3>No files yet</h3>
                        <p>Upload your first encrypted file to get started.</p>
                        <p className="empty-hint">Files are encrypted in your browser before upload. Only you can decrypt them.</p>
                    </>
                )}
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="file-grid">
                {filteredFiles.map((file) => (
                    <div key={file.id} className="file-grid-item">
                        <div className="file-grid-preview">
                            <span className="file-type-icon-large">{getFileTypeIcon(file.mimeType)}</span>
                        </div>
                        <div className="file-grid-name" title={file.name}>
                            {file.name}
                        </div>
                        <div className="file-grid-meta">
                            {formatFileSize(file.size)}
                        </div>
                        <div className="file-grid-actions">
                            <button
                                className="action-btn-small"
                                onClick={() => handleDownload(file)}
                                disabled={downloadingId === file.id}
                                title="Download"
                            >
                                ⬇️
                            </button>
                            <button
                                className="action-btn-small"
                                onClick={() => handleDelete(file)}
                                disabled={downloadingId === file.id}
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="file-table-container">
            <table className="file-table">
                <thead>
                    <tr>
                        <th className="col-name">Name</th>
                        <th className="col-classification">Classification</th>
                        <th className="col-type">Type</th>
                        <th className="col-size">Size</th>
                        <th className="col-modified">Modified</th>
                        <th className="col-replica">Replicas</th>
                        <th className="col-status">Status</th>
                        <th className="col-actions"></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFiles.map((file) => (
                        <tr
                            key={file.id}
                            className={`
                ${downloadingId === file.id ? 'downloading' : ''}
                ${selectedFileId === file.id ? 'selected' : ''}
              `}
                            onClick={() => onFileSelect?.(file)}
                        >
                            <td className="col-name">
                                <div className="file-name-cell">
                                    <span className="file-icon">{getFileTypeIcon(file.mimeType)}</span>
                                    <span className="file-name" title={file.name}>{file.name}</span>
                                </div>
                            </td>
                            <td className="col-classification">
                                <ClassificationBadge
                                    classification={(file.classification as any) || 'private'}
                                    showLabel={false}
                                />
                            </td>
                            <td className="col-type">
                                <span className="file-type">{file.mimeType.split('/')[0]}</span>
                            </td>
                            <td className="col-size">{formatFileSize(file.size)}</td>
                            <td className="col-modified">{formatDate(file.uploadedAt)}</td>
                            <td className="col-replica">
                                <ReplicaStatus fileId={file.id} />
                            </td>
                            <td className="col-status">
                                <div className="status-badges">
                                    <span className="status-badge status-encrypted" title="Client-side encrypted">
                                        <span className="badge-icon">🔒</span>
                                        <span className="badge-text">Encrypted</span>
                                    </span>
                                </div>
                            </td>
                            <td className="col-actions">
                                <div className="file-actions">
                                    <button
                                        className="action-btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(file);
                                        }}
                                        disabled={downloadingId === file.id}
                                        title="Download and decrypt"
                                    >
                                        {downloadingId === file.id ? '⟳' : '⬇️'}
                                    </button>
                                    <button
                                        className="action-btn-icon action-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(file);
                                        }}
                                        disabled={downloadingId === file.id}
                                        title="Delete file"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
