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
import { FileUpload } from '@/components/dashboard/FileUpload';
import { FileList } from '@/components/dashboard/FileList';
import { UploadManager } from '@/components/dashboard/UploadManager';
import { AIAssistantPlaceholder } from '@/components/dashboard/AIAssistantPlaceholder';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Dialog } from '@/components/shared/Dialog';
// import { syncFiles } from '@/services/sync'; // Disabled
import * as metadata from '@/services/metadata';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // const [isSyncing, setIsSyncing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<metadata.FileMetadata | null>(null);
    const [showContextPanel, setShowContextPanel] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{
        title: string;
        description?: string;
        variant: 'prompt' | 'alert' | 'confirm';
        onConfirm: (value?: string) => void;
    }>({
        title: '',
        variant: 'alert',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (isConnected && address) {
            // handleSync(); // Backend sync disabled
        }
    }, [isConnected, address]);

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
            <aside className="dashboard-sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-group">
                        <button
                            className={`sidebar-item ${activeSection === 'my-files' ? 'active' : ''}`}
                            onClick={() => { setActiveSection('my-files'); setCurrentFolderId(null); }}
                        >
                            <span className="sidebar-icon">📁</span>
                            <span className="sidebar-label">My Files</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'shared' ? 'active' : ''}`}
                            onClick={() => setActiveSection('shared')}
                        >
                            <span className="sidebar-icon">👥</span>
                            <span className="sidebar-label">Shared</span>
                        </button>
                    </div>

                    <div className="sidebar-divider"></div>

                    {/* Pinned Folders Section */}
                    {pinnedFolders.length > 0 && (
                        <>
                            <div className="sidebar-group-label">Pinned Folders</div>
                            <div className="sidebar-group">
                                {pinnedFolders.map(folder => (
                                    <button
                                        key={folder.id}
                                        className={`sidebar-item ${currentFolderId === folder.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveSection('my-files');
                                            setCurrentFolderId(folder.id);
                                        }}
                                    >
                                        <span className="sidebar-icon">📌</span>
                                        <span className="sidebar-label">{folder.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="sidebar-divider"></div>
                        </>
                    )}

                    {/* Starred Files Section */}
                    {starredFiles.length > 0 && (
                        <>
                            <div className="sidebar-group-label">Starred Files</div>
                            <div className="sidebar-group">
                                {starredFiles.filter(f => f.mimeType !== 'application/folder').map(file => (
                                    <button
                                        key={file.id}
                                        className={`sidebar-item`}
                                        onClick={() => {
                                            // TODO: What should happen when clicking a starred file in sidebar?
                                            // Probably select it or preview it.
                                            // For now, let's navigate to its folder and select it?
                                            // Or simplified: select file if we have a way to highlight it.
                                            // Easier: Just handle it like handleFileSelect from Dashboard if possible,
                                            // but we don't have direct access here easily without context.
                                            // Actually, sidebar items usually navigate.
                                            // If we just want to VIEW them, maybe 'starred' section is enough?
                                            // User said: "if i star a folder it automatically appears on left sidebar but this doesnt work for a normal file"
                                            // They likely just want to see it there for quick access.
                                            // Let's implement basic selection if possible, otherwise just a visual list.
                                            // But standard sidebar items are usually "filters" or "locations".
                                            // Individual files in sidebar is unusual unless they are "shortcuts".
                                            // Let's at least show them.
                                            setActiveSection('starred');
                                        }}
                                    >
                                        <span className="sidebar-icon">📄</span>
                                        <span className="sidebar-label">{file.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="sidebar-divider"></div>
                        </>
                    )}

                    <div className="sidebar-group">
                        <button
                            className={`sidebar-item ${activeSection === 'recent' ? 'active' : ''}`}
                            onClick={() => setActiveSection('recent')}
                        >
                            <span className="sidebar-icon">🕐</span>
                            <span className="sidebar-label">Recent</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'starred' ? 'active' : ''}`}
                            onClick={() => setActiveSection('starred')}
                        >
                            <span className="sidebar-icon">⭐</span>
                            <span className="sidebar-label">Starred</span>
                        </button>
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-group">
                        <button
                            className={`sidebar-item ${activeSection === 'trash' ? 'active' : ''}`}
                            onClick={() => setActiveSection('trash')}
                        >
                            <span className="sidebar-icon">🗑️</span>
                            <span className="sidebar-label">Trash</span>
                        </button>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="storage-info">
                        <div className="storage-header">
                            <span className="storage-label">Storage</span>
                            <span className="storage-badge">Unlimited</span>
                        </div>
                        <div className="storage-bar">
                            <div className="storage-used" style={{ width: '0%' }}></div>
                        </div>
                        <div className="storage-text">Zero-knowledge encrypted</div>
                    </div>
                </div>
            </aside>

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
                        <button
                            className="btn-sync"
                            onClick={() => handleSync()}
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
                    />

                    <FileList
                        refreshTrigger={refreshTrigger}
                        viewMode={viewMode}
                        searchQuery={searchQuery}
                        onFileSelect={handleFileSelect}
                        onFolderSelect={(id) => setCurrentFolderId(id)}
                        selectedFileId={selectedFile?.id}
                        activeSection={activeSection}
                        folderId={currentFolderId}
                        onFileChange={reloadFolders}
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
