/**
 * Dashboard - Premium Evolution
 * 
 * Improvements over Drive:
 * - Context panel for file details
 * - Better privacy indicators
 * - More informative status
 * - Improved information density
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useFolders } from '@/hooks/useFolders';
import { useStorage } from '@/hooks/useStorage';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { FileList } from '@/components/dashboard/FileList';
import { Sidebar } from '@/components/dashboard/Sidebar'; // Added
import { UploadManager } from '@/components/dashboard/UploadManager';
import { AIAssistantPlaceholder } from '@/components/dashboard/AIAssistantPlaceholder';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Dialog } from '@/components/shared/Dialog';
// import { syncFiles } from '@/services/sync'; // Disabled
import * as metadata from '@/services/metadata';
import * as cloudSync from '@/services/cloud_sync';
import { isFirebaseConfigured } from '@/config/firebase';
import { formatFileSize, formatDate } from '@/utils/format';
import './Dashboard.css';

type SidebarSection = 'my-files' | 'shared' | 'recent' | 'starred' | 'trash';
type ViewMode = 'list' | 'grid';

export function Dashboard() {
    const { address, isConnected, connect } = useWallet();
    const {
        starredFiles,
        currentFolderId,
        setCurrentFolderId,
        getFolderPath,
        getPinnedFolders,
        createFolder,
        reload: reloadFolders
    } = useFolders(address);
    const [activeSection, setActiveSection] = useState<SidebarSection>('my-files');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentFolder, setCurrentFolder] = useState<metadata.FileMetadata | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const {
        nodeStatus,
        setNodeStatus,
        usedBytes,
        setUsedBytes,
        baseLimit,
        earnedLimit,
        totalLimit
    } = useStorage(refreshTrigger);
    // Sync State
    const [syncStatus, setSyncStatus] = useState<cloudSync.SyncStatus>({
        loading: false,
        lastSynced: null,
        error: null
    });
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);

    const [selectedFile, setSelectedFile] = useState<metadata.FileMetadata | null>(null);
    const [showContextPanel, setShowContextPanel] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{
        title: string;
        description?: string;
        variant: 'prompt' | 'alert' | 'confirm';
        placeholder?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        onConfirm: (value?: string) => void;
    }>({
        title: '',
        variant: 'alert',
        onConfirm: () => { }
    });

    // Multi-select & Drag State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [draggedItems, setDraggedItems] = useState<metadata.FileMetadata[]>([]);

    const handleBreadcrumbDrop = async (targetFolderId: string | null) => {
        if (draggedItems.length === 0) return;

        try {
            // Move all dragged items
            for (const file of draggedItems) {
                // Skip if dropping onto itself or its own parent (redundant)
                if (file.folderId === targetFolderId) continue;
                // Skip if dropping folder into itself (prevent cycle)
                if (file.id === targetFolderId) continue;

                await metadata.moveFileToFolder(file.id, targetFolderId);
            }

            setRefreshTrigger(p => p + 1);
            reloadFolders();
            setDraggedItems([]);
        } catch (error) {
            console.error('Failed to move files via breadcrumb:', error);
        }
    };



    useEffect(() => {
        if (isConnected && address) {
            // Check for expired trash items on load
            metadata.cleanupTrash(address).catch(console.error);

            // Initial Sync Check
            if (isFirebaseConfigured()) {
                cloudSync.hasRemoteBackup(address).then(async (hasBackup) => {
                    if (hasBackup) {
                        const localFiles = await metadata.getFilesByWallet(address);
                        if (localFiles.length === 0) {
                            setShowRestorePrompt(true);
                        }
                    }
                }).catch(err => console.error('Remote check failed', err));
            }
        }
    }, [isConnected, address]);

    // Auto-Save Effect (Debounced)
    useEffect(() => {
        if (!isConnected || !address || !isFirebaseConfigured()) return;

        const saveTimeout = setTimeout(async () => {
            setSyncStatus(prev => ({ ...prev, loading: true, error: null }));
            try {
                await cloudSync.saveEncryptedBackup(address);
                setSyncStatus({ loading: false, lastSynced: Date.now(), error: null });
            } catch (err) {
                console.error('Auto-save failed', err);
                setSyncStatus(prev => ({ ...prev, loading: false, error: 'Sync failed' }));
            }
        }, 2000); // 2s debounce

        return () => clearTimeout(saveTimeout);
    }, [refreshTrigger, address, isConnected]);

    useEffect(() => {
        const loadInitial = async () => {
            if (address) {
                // ... sync checks ...
                // Calculate storage usage
                try {
                    const files = await metadata.getFilesByWallet(address);
                    const totalSize = files.filter(f => !f.isTrashed).reduce((acc, f) => acc + f.size, 0);
                    setUsedBytes(totalSize);
                } catch (e) {
                    console.error("Failed to calculate storage", e);
                }
            }
        };
        loadInitial();
    }, [address, refreshTrigger]); // Added refreshTrigger to recalc on file changes

    // Restore Prompt Handler
    useEffect(() => {
        if (showRestorePrompt && address) {
            setDialogConfig({
                title: 'Restore from Cloud?',
                description: 'Found an encrypted backup in the cloud. Restore it now?',
                variant: 'confirm',
                confirmLabel: 'Restore Backup',
                cancelLabel: 'Use Local Only',
                onConfirm: async () => {
                    setSyncStatus(prev => ({ ...prev, loading: true }));
                    try {
                        await cloudSync.restoreEncryptedBackup(address);
                        setRefreshTrigger(p => p + 1);
                        reloadFolders();
                        setSyncStatus({ loading: false, lastSynced: Date.now(), error: null });
                        setDialogOpen(false);
                    } catch (err) {
                        setDialogOpen(false);
                        console.error(err);
                        // Alert failure
                        setDialogConfig({
                            title: 'Restore Failed',
                            description: 'Decryption failed. Ensure you are using the correct wallet.',
                            variant: 'alert',
                            onConfirm: () => setDialogOpen(false)
                        });
                        setTimeout(() => setDialogOpen(true), 100);
                    }
                }
            });
            setDialogOpen(true);
            setShowRestorePrompt(false);
        }
    }, [showRestorePrompt, address]);

    // ... (handleBreadcrumbDrop)

    const handleDeleteFile = (file: metadata.FileMetadata) => {
        if (activeSection === 'trash') {
            setDialogConfig({
                title: 'Delete Forever?',
                description: `Are you sure you want to permanently delete "${file.name}"? This action cannot be undone.`,
                variant: 'confirm',
                confirmLabel: 'Delete Forever',
                cancelLabel: 'Cancel',
                onConfirm: async () => {
                    await metadata.deleteFileMetadata(file.id);
                    setRefreshTrigger(p => p + 1);
                    reloadFolders();
                    setDialogOpen(false);
                }
            });
            setDialogOpen(true);
        } else {
            // Soft delete warning
            setDialogConfig({
                title: 'Move to Trash?',
                description: `"${file.name}" will be moved to Trash. Items in Trash are permanently deleted after 30 days.`,
                variant: 'confirm',
                confirmLabel: 'Yes, Move to Trash',
                cancelLabel: 'Cancel',
                onConfirm: async () => {
                    await metadata.moveToTrash(file.id);
                    setRefreshTrigger(p => p + 1);
                    reloadFolders();
                    setDialogOpen(false);
                }
            });
            setDialogOpen(true);
        }
    };

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        reloadFolders();
    };

    const handleSync = async () => {
        setRefreshTrigger(prev => prev + 1);
        reloadFolders();
    };

    const handleFileSelect = (file: metadata.FileMetadata) => {
        setSelectedFile(file);
        setShowContextPanel(true);
    };

    const handleFileDeselect = () => {
        setSelectedFile(null);
        setShowContextPanel(false);
    };

    const handleCreateFolder = () => {
        setDialogConfig({
            title: 'Create New Folder',
            description: 'Enter a name for your new encrypted folder.',
            variant: 'prompt',
            onConfirm: async (name) => {
                if (name) {
                    await createFolder(name, currentFolderId);
                    setRefreshTrigger(prev => prev + 1);
                    setDialogOpen(false);
                }
            }
        });
        setDialogOpen(true);
    };

    const handleShare = () => {
        if (selectedFile) {
            setDialogConfig({
                title: 'File Shared Successfully',
                description: `Link generated! ${selectedFile.name} is now available in your Shared folder.`,
                variant: 'alert',
                onConfirm: () => {
                    metadata.shareFile(selectedFile.id).then(() => {
                        setRefreshTrigger(prev => prev + 1);
                        setDialogOpen(false);
                    });
                }
            });
            // Optimization: Call the share function immediately or changing logic to "Confirm Share" if desired.
            // Based on previous code: alert came AFTER sharing? 
            // Previous code: await share; alert();
            // Let's adapt:

            metadata.shareFile(selectedFile.id).then(() => {
                // Show success dialog
                setDialogConfig({
                    title: 'File Shared',
                    description: `${selectedFile.name} has been shared successfully.`,
                    variant: 'alert',
                    onConfirm: () => setDialogOpen(false)
                });
                setDialogOpen(true);
                setRefreshTrigger(prev => prev + 1);
            });
        }
    };

    const pinnedFolders = getPinnedFolders();

    if (!isConnected) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-empty-state">
                    <div className="empty-icon">🔐</div>
                    <h1>Secure File Storage</h1>
                    <p>Connect your wallet to access your encrypted files.</p>
                    <p className="empty-hint">Zero-knowledge • Client-side encryption • Decentralized storage</p>
                    <button
                        className="btn-primary"
                        onClick={connect}
                        style={{
                            marginTop: '24px',
                            minWidth: '200px',
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Left Sidebar */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                pinnedFolders={pinnedFolders}
                starredFiles={starredFiles}
                currentFolderId={currentFolderId}
                onFolderSelect={setCurrentFolderId}
                storageProps={{
                    usedBytes,
                    totalLimit,
                    baseLimit,
                    earnedLimit,
                    nodeStatus,
                    onToggleStatus: () => setNodeStatus(prev => prev === 'online' ? 'offline' : 'online')
                }}
            />

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="action-bar">
                    <div className="action-group">
                        <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
                            <span className="upload-icon">↑</span>
                            Upload
                        </button>
                        <button className="btn-secondary" onClick={handleCreateFolder}>
                            <span className="icon">📁</span>
                            New Folder
                        </button>
                    </div>

                    {/* Neuromorphic Search Bar */}
                    <div className="search-wrapper-neu">
                        <div className="search-container-neu">
                            <input
                                className="search-input-neu"
                                placeholder="Search files..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="search-icon-neu">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="action-bar-right">
                        {/* Sync Status Indicator */}
                        {address && isFirebaseConfigured() && (
                            <div className="sync-status text-xs text-gray-500 mr-4 flex items-center">
                                {syncStatus.loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin">↻</span> Syncing...
                                    </span>
                                ) : syncStatus.error ? (
                                    <span className="text-red-400" title={syncStatus.error}>
                                        ⚠ Sync Error
                                    </span>
                                ) : syncStatus.lastSynced ? (
                                    <span className="text-green-500 flex items-center gap-1">
                                        <span>✓</span> Synced
                                    </span>
                                ) : (
                                    <span>Waiting...</span>
                                )}
                            </div>
                        )}

                        <button
                            className="btn-sync"
                            onClick={() => {
                                setRefreshTrigger(p => p + 1);
                                reloadFolders();
                            }}
                            title="Refresh"
                        >
                            🔄
                        </button>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List view"
                            >
                                ☰
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                ▦
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-area">
                    {/* AI Assistant Placeholder */}
                    <AIAssistantPlaceholder />

                    {/* Breadcrumb Navigation - Now Controlled */}
                    <Breadcrumb
                        path={getFolderPath(currentFolderId)}
                        onNavigate={setCurrentFolderId}
                        onDrop={handleBreadcrumbDrop}
                    />

                    <FileList
                        refreshTrigger={refreshTrigger}
                        viewMode={viewMode}
                        searchQuery={searchQuery}
                        onFileSelect={handleFileSelect}
                        onFolderSelect={(id) => setCurrentFolderId(id)}
                        selectedFileId={selectedFile?.id} // Deprecated singular, kept for now
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        draggedItems={draggedItems}
                        onDragItemsChange={setDraggedItems}
                        activeSection={activeSection}
                        folderId={currentFolderId}
                        onFileChange={reloadFolders}
                        onDelete={handleDeleteFile}
                    />
                </div>
            </main>

            {/* Global Dialog */}
            <Dialog
                isOpen={dialogOpen}
                title={dialogConfig.title}
                description={dialogConfig.description}
                variant={dialogConfig.variant}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogOpen(false)}
            />

            {/* Context Panel */}
            {showContextPanel && selectedFile && (
                <aside className="context-panel">
                    <div className="context-header">
                        <h3>File Details</h3>
                        <button className="context-close" onClick={handleFileDeselect}>✕</button>
                    </div>

                    <div className="context-content">
                        <div className="context-preview">
                            <div className="preview-icon">📄</div>
                            <div className="preview-name">{selectedFile.name}</div>
                        </div>

                        <div className="context-actions">
                            <button className="context-action-btn" onClick={handleShare}>
                                <span className="btn-icon">🔗</span>
                                Share File
                            </button>
                            <button
                                className="context-action-btn"
                                onClick={() => metadata.toggleStar(selectedFile.id).then(() => {
                                    setRefreshTrigger(p => p + 1);
                                    reloadFolders();
                                    // Optimistic update
                                    setSelectedFile({ ...selectedFile, isStarred: !selectedFile.isStarred });
                                })}
                            >
                                <span className="btn-icon">⭐</span>
                                {selectedFile.isStarred ? 'Unstar' : 'Star'}
                            </button>
                        </div>

                        <div className="context-section">
                            <div className="context-label">Properties</div>
                            <div className="property-list">
                                <div className="property-item">
                                    <span className="property-key">Size</span>
                                    <span className="property-value">{formatFileSize(selectedFile.size)}</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-key">Type</span>
                                    <span className="property-value">{selectedFile.mimeType}</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-key">Uploaded</span>
                                    <span className="property-value">{formatDate(selectedFile.uploadedAt)}</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-key">Location</span>
                                    <span className="property-value">{selectedFile.folderId ? 'Folder' : 'My Files'}</span>
                                </div>
                                <div className="property-item">
                                    <span className="property-key">CID</span>
                                    <span className="property-value property-mono">{selectedFile.cid.slice(0, 12)}...</span>
                                </div>
                            </div>
                        </div>

                        <div className="context-section">
                            <div className="context-label">Security</div>
                            <div className="security-status">
                                <div className="security-item">
                                    <span className="security-icon">🔒</span>
                                    <span className="security-text">Client-side encrypted</span>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">✓</span>
                                    <span className="security-text">Zero-knowledge storage</span>
                                </div>
                                <div className="security-item">
                                    <span className="security-icon">🌐</span>
                                    <span className="security-text">Decentralized (IPFS)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal">
                        <div className="upload-modal-header">
                            <h2>Upload Files</h2>
                            <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
                        </div>
                        <FileUpload
                            onUploadComplete={handleUploadComplete}
                            currentFolderId={currentFolderId}
                        />
                    </div>
                </div>
            )}

            {/* Upload Manager - Fixed Bottom Panel */}
            <UploadManager />
        </div>
    );
}
