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
import { EmptyState } from '@/components/shared/EmptyState';
import './FileList.css';

interface FileListProps {
    refreshTrigger: number;
    viewMode?: 'list' | 'grid';
    searchQuery?: string;
    onFileSelect?: (file: metadata.FileMetadata) => void;
    onFolderSelect?: (folderId: string) => void;
    selectedFileId?: string; // Legacy support
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    draggedItems?: metadata.FileMetadata[];
    onDragItemsChange?: (items: metadata.FileMetadata[]) => void;
    activeSection?: 'my-files' | 'shared' | 'recent' | 'starred' | 'trash';
    folderId?: string | null;
    onFileChange?: () => void;
    onDelete?: (file: metadata.FileMetadata) => void;
}

export function FileList({
    refreshTrigger,
    viewMode = 'list',
    searchQuery = '',
    onFileSelect,
    onFolderSelect,
    selectedFileId,
    selectedIds,
    onSelectionChange,
    draggedItems,
    onDragItemsChange,
    activeSection = 'my-files',
    folderId = null,
    onFileChange,
    onDelete
}: FileListProps) {
    const { address, isConnected } = useWallet();
    const [files, setFiles] = useState<metadata.FileMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

    // Sort State
    const [sortConfig, setSortConfig] = useState<{
        key: 'name' | 'size' | 'uploadedAt' | 'type';
        direction: 'asc' | 'desc';
    }>({ key: 'uploadedAt', direction: 'desc' });

    const handleSort = (key: 'name' | 'size' | 'uploadedAt' | 'type') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const handleDragStart = (e: React.DragEvent, file: metadata.FileMetadata) => {
        // If dragging a file that is not selected, select it (and deselect others)
        // Unless it is part of the existing selection
        if (selectedIds && !selectedIds.has(file.id)) {
            if (onSelectionChange) onSelectionChange(new Set([file.id]));
            if (onDragItemsChange) onDragItemsChange([file]);
        } else if (selectedIds && selectedIds.has(file.id)) {
            // Dragging a selection
            // Ensure dragItems are set correctly in parent if not already
            if (onDragItemsChange) {
                const selectedFiles = files.filter(f => selectedIds.has(f.id));
                onDragItemsChange(selectedFiles);
            }
        }

        setDraggedFileId(file.id); // Internal tracking for drop target validation
        e.dataTransfer.effectAllowed = 'move';

        // Custom Ghost
        const count = selectedIds && selectedIds.has(file.id) ? selectedIds.size : 1;
        const label = count > 1 ? `${count} items` : file.name;

        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost-item';
        ghost.innerHTML = `
            <span class="ghost-icon">${count > 1 ? '📚' : (file.mimeType === 'application/folder' ? '📁' : '📄')}</span>
            <span class="ghost-name">${label}</span>
        `;
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 20, 20);

        setTimeout(() => { if (document.body.contains(ghost)) document.body.removeChild(ghost); }, 0);
    };

    const handleDragOver = (e: React.DragEvent, targetFile: metadata.FileMetadata) => {
        if (!draggedFileId || draggedFileId === targetFile.id) return;

        // Only allow dropping on folders
        if (targetFile.mimeType === 'application/folder') {
            e.preventDefault(); // allow drop
            e.dataTransfer.dropEffect = 'move';
            e.currentTarget.classList.add('drag-over');
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = async (e: React.DragEvent, targetFolder: metadata.FileMetadata) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (!draggedFileId || targetFolder.mimeType !== 'application/folder') return;

        try {
            await metadata.moveFileToFolder(draggedFileId, targetFolder.id);
            // Refresh list or optimistic update
            setFiles(prev => prev.filter(f => f.id !== draggedFileId));
            onFileChange?.();
        } catch (error) {
            console.error('Failed to move file:', error);
            alert('Failed to move file');
        }

        setDraggedFileId(null);
    };

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
    }, [address, isConnected, refreshTrigger, folderId]); // Added folderId dependency

    const getDaysLeft = (trashedAt?: number) => {
        if (!trashedAt) return '30 days';
        const daysPassed = (Date.now() - trashedAt) / (1000 * 60 * 60 * 24);
        const daysLeft = Math.max(0, 30 - daysPassed);
        return `${Math.ceil(daysLeft)} days`;
    };

    const filteredFiles = useMemo(() => {
        let result = files;

        // 1. Filter by Section
        switch (activeSection) {
            case 'trash':
                result = result.filter(f => f.isTrashed);
                break;
            case 'starred':
                result = result.filter(f => !f.isTrashed && f.isStarred);
                break;
            case 'recent':
                result = result.filter(f => !f.isTrashed);
                // Recent uses accessedAt sort specifically
                result.sort((a, b) => (b.accessedAt || b.uploadedAt) - (a.accessedAt || a.uploadedAt));
                return result; // Return early for recent to avoid override
            case 'shared':
                // For now, shared is just a placeholder unless we implement link sharing tracking
                result = result.filter(f => !f.isTrashed && (f.sharedWith && f.sharedWith.length > 0));
                break;
            case 'my-files':
            default:
                // Filter by Folder ID (null for root)
                result = result.filter(f => !f.isTrashed && (f.folderId === folderId || (!f.folderId && !folderId)));
                break;
        }

        // 2. Filter by Search (global search)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            // If searching, ignore folder structure and search everything (except trash)
            // Restore full list for search if we were restricted by folder
            let searchBase = activeSection === 'trash' ? files.filter(f => f.isTrashed) : files.filter(f => !f.isTrashed);

            result = searchBase.filter(file =>
                file.name.toLowerCase().includes(query)
            );
        }

        // 3. Sorting (Dynamic)
        result.sort((a, b) => {
            // Always keep folders on top for name/size/date sorts if we want standard File Explorer behavior
            // Or we can let them sort normally. Standard behavior: Folders first.
            const isFolderA = a.mimeType === 'application/folder';
            const isFolderB = b.mimeType === 'application/folder';

            if (isFolderA !== isFolderB) {
                return isFolderA ? -1 : 1;
            }

            // Sort implementation
            let comparison = 0;
            switch (sortConfig.key) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'type':
                    comparison = a.mimeType.localeCompare(b.mimeType);
                    break;
                case 'uploadedAt':
                default:
                    comparison = a.uploadedAt - b.uploadedAt;
                    break;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [files, searchQuery, activeSection, folderId, sortConfig]);

    const handleDownload = async (file: metadata.FileMetadata) => {
        if (!address) return;
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
        if (onDelete) {
            onDelete(file);
            return;
        }

        /* Fallback for safety */
        if (activeSection === 'trash') {
            if (!confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) {
                return;
            }

            try {
                await metadata.deleteFileMetadata(file.id);
                setFiles(files.filter(f => f.id !== file.id));
                onFileChange?.();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete file.');
            }
        } else {
            // Soft delete (Move to Trash)
            try {
                await metadata.moveToTrash(file.id);
                // Remove from current view
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isTrashed: true } : f));
                onFileChange?.();
            } catch (error) {
                console.error('Trash error:', error);
            }
        }
    };

    const handleRestore = async (file: metadata.FileMetadata) => {
        try {
            await metadata.restoreFromTrash(file.id);
            // Remove from trash view (or update status)
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isTrashed: false } : f));
            onFileChange?.();
        } catch (error) {
            console.error('Restore error:', error);
        }
    };

    const handleToggleStar = async (file: metadata.FileMetadata) => {
        try {
            await metadata.toggleStar(file.id);
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isStarred: !f.isStarred } : f));
            onFileChange?.();
        } catch (error) {
            console.error('Star error:', error);
        }
    };

    const handleItemClick = async (file: metadata.FileMetadata, e?: React.MouseEvent) => {
        // Multi-select logic
        if (onSelectionChange && selectedIds) {
            const isMultiSelect = e?.metaKey || e?.ctrlKey;

            if (isMultiSelect) {
                const newSelection = new Set(selectedIds);
                if (newSelection.has(file.id)) {
                    newSelection.delete(file.id);
                } else {
                    newSelection.add(file.id);
                }
                onSelectionChange(newSelection);

                // If dragging state exists, update it too
                if (onDragItemsChange) {
                    // Filter files that are in the new selection
                    // This requires 'files' state to be available. 'filteredFiles' is better.
                    const selectedFiles = files.filter(f => newSelection.has(f.id));
                    onDragItemsChange(selectedFiles);
                }
                // Don't open context panel on multi-select
                if (newSelection.size > 1) {
                    onFileSelect?.(null as any); // Clear single file selection
                } else if (newSelection.size === 1) {
                    onFileSelect?.(files.find(f => f.id === Array.from(newSelection)[0])!);
                }
                return;
            }
        }

        if (file.mimeType === 'application/folder') {
            if (activeSection === 'trash') {
                // Select it
                if (onSelectionChange) onSelectionChange(new Set([file.id]));
                onFileSelect?.(file);
                return;
            }
            onFolderSelect?.(file.id);
            return;
        }

        // Single select (default)
        if (onSelectionChange) {
            onSelectionChange(new Set([file.id]));
        }

        // Update interaction time
        metadata.updateAccessTime(file.id).catch(console.error);

        onFileSelect?.(file);
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
        if (searchQuery) {
            return (
                <div className="file-list-empty">
                    <span className="empty-icon">🔍</span>
                    <h3>No files found</h3>
                    <p>No files match &quot;{searchQuery}&quot;</p>
                </div>
            );
        }

        switch (activeSection) {
            case 'trash':
                return (
                    <EmptyState
                        icon="🗑️"
                        title="Trash is Empty"
                        description="Deleted files will appear here"
                    />
                );
            case 'starred':
                return (
                    <EmptyState
                        icon="⭐"
                        title="No Starred Files"
                        description="Star files to find them quickly"
                    />
                );
            case 'recent':
                return (
                    <EmptyState
                        icon="🕐"
                        title="No Recent Files"
                        description="Recently accessed files will appear here"
                    />
                );
            case 'shared':
                return (
                    <EmptyState
                        icon="👥"
                        title="No Shared Files"
                        description="Files shared with you will appear here"
                    />
                );
            case 'my-files':
            default:
                return (
                    <div className="file-list-empty">
                        <span className="empty-icon">📁</span>
                        <h3>No files yet</h3>
                        <p>Upload your first encrypted file to get started.</p>
                        <p className="empty-hint">Files are encrypted in your browser before upload. Only you can decrypt them.</p>
                    </div>
                );
        }
    }

    if (viewMode === 'grid') {
        return (
            <div className="file-grid">
                {filteredFiles.map((file) => (
                    <div
                        key={file.id}
                        className={`file-grid-item ${file.mimeType === 'application/folder' ? 'is-folder' : ''}`}
                        draggable={activeSection === 'my-files'}
                        onDragStart={(e) => handleDragStart(e, file)}
                        onDragOver={(e) => handleDragOver(e, file)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, file)}
                    >
                        <div className="file-grid-preview" onClick={() => handleItemClick(file)}>
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
                                className={`action-btn-small ${file.isStarred ? 'active' : ''}`}
                                onClick={() => handleToggleStar(file)}
                                title={file.isStarred ? "Unstar" : "Star"}
                            >
                                {file.isStarred ? '⭐' : '☆'}
                            </button>
                            <button
                                className="action-btn-small"
                                onClick={() => handleDownload(file)}
                                disabled={downloadingId === file.id}
                                title="Download"
                            >
                                ⬇️
                            </button>
                            {activeSection === 'trash' && (
                                <button
                                    className="action-btn-small"
                                    onClick={() => handleRestore(file)}
                                    disabled={downloadingId === file.id}
                                    title="Restore"
                                >
                                    ♻️
                                </button>
                            )}
                            <button
                                className="action-btn-small"
                                onClick={() => handleDelete(file)}
                                disabled={downloadingId === file.id}
                                title={activeSection === 'trash' ? 'Delete Forever' : 'Move to Trash'}
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
                        <th className="col-name" onClick={() => handleSort('name')}>
                            Name {getSortIcon('name')}
                        </th>
                        <th className="col-classification">Classification</th>
                        <th className="col-type" onClick={() => handleSort('type')}>
                            Type {getSortIcon('type')}
                        </th>
                        <th className="col-size" onClick={() => handleSort('size')}>
                            Size {getSortIcon('size')}
                        </th>
                        <th className="col-modified" onClick={() => handleSort('uploadedAt')}>
                            {activeSection === 'trash' ? 'Days Left' : 'Modified'} {getSortIcon('uploadedAt')}
                        </th>
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
                ${selectedFileId === file.id || (selectedIds && selectedIds.has(file.id)) ? 'selected' : ''}
                ${draggedItems && draggedItems.some(i => i.id === file.id) ? 'opacity-50' : ''}
              `}
                            draggable={activeSection === 'my-files'}
                            onDragStart={(e) => handleDragStart(e, file)}
                            onDragOver={(e) => handleDragOver(e, file)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, file)}
                            onClick={(e) => handleItemClick(file, e)}
                        >
                            <td className="col-name">
                                <div className="file-name-cell">
                                    <button
                                        className={`star-btn ${file.isStarred ? 'starred' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleStar(file);
                                        }}
                                    >
                                        {file.isStarred ? '⭐' : '☆'}
                                    </button>
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
                            <td className="col-modified">
                                {activeSection === 'trash' ? (
                                    <span className="text-warning">
                                        {getDaysLeft(file.trashedAt)}
                                    </span>
                                ) : (
                                    formatDate(file.uploadedAt)
                                )}
                            </td>
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
                                    {activeSection === 'trash' && (
                                        <button
                                            className="action-btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore(file);
                                            }}
                                            title="Restore file"
                                        >
                                            ♻️
                                        </button>
                                    )}
                                    <button
                                        className="action-btn-icon action-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(file);
                                        }}
                                        disabled={downloadingId === file.id}
                                        title={activeSection === 'trash' ? 'Delete Forever' : 'Move to Trash'}
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
