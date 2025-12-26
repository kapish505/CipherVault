import React, { useState } from 'react';
import { StoragePanel } from './StoragePanel';
import { NodeStatus } from '@/hooks/useStorage';
import { NetworkInfoPanel } from './NetworkInfoPanel';

export type SidebarSection = 'my-files' | 'shared' | 'recent' | 'starred' | 'trash';

interface SidebarProps {
    activeSection: SidebarSection;
    onSectionChange: (section: SidebarSection) => void;
    // We can also pass pinned/starred if needed, but let's keep it simple or allow children
    // Actually, the previous inline sidebar had Pinned and Starred logic. 
    // To cleanly extract, we need those props if we want to preserve functionality.
    // However, looking at the previous code, it had `pinnedFolders` and `starredFiles`. 
    // I need to accept those as props or fetch them here. 
    // Fetching here makes it independent? No, useFolders is in Dashboard.
    // Let's make it accept them.
    pinnedFolders?: any[];
    starredFiles?: any[];
    currentFolderId?: string | null;
    onFolderSelect?: (id: string | null) => void;
    storageProps: {
        usedBytes: number;
        totalLimit: number;
        baseLimit: number;
        earnedLimit: number;
        nodeStatus: NodeStatus;
        onToggleStatus: () => void;
    };
}

export function Sidebar({
    activeSection,
    onSectionChange,
    pinnedFolders = [],
    starredFiles = [],
    currentFolderId = null,
    onFolderSelect,
    storageProps
}: SidebarProps) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <aside className="dashboard-sidebar relative">
            <div className="sidebar-section">
                <div className="sidebar-group">
                    <button
                        className="sidebar-item text-blue-400/80 hover:text-blue-400 hover:bg-blue-500/10 mb-2"
                        onClick={() => setShowInfo(true)}
                    >
                        <span className="sidebar-icon">ℹ️</span>
                        <span className="sidebar-label">Network Info</span>
                    </button>
                    <button
                        className={`sidebar - item ${activeSection === 'my-files' ? 'active' : ''} `}
                        onClick={() => {
                            onSectionChange('my-files');
                            onFolderSelect?.(null);
                        }}
                    >
                        <span className="sidebar-icon">📁</span>
                        <span className="sidebar-label">My Files</span>
                    </button>
                    <button
                        className={`sidebar - item ${activeSection === 'shared' ? 'active' : ''} `}
                        onClick={() => onSectionChange('shared')}
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
                                    className={`sidebar - item ${currentFolderId === folder.id ? 'active' : ''} `}
                                    onClick={() => {
                                        onSectionChange('my-files');
                                        onFolderSelect?.(folder.id);
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
                                    className={`sidebar - item`}
                                    onClick={() => onSectionChange('starred')}
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
                        className={`sidebar - item ${activeSection === 'recent' ? 'active' : ''} `}
                        onClick={() => onSectionChange('recent')}
                    >
                        <span className="sidebar-icon">🕐</span>
                        <span className="sidebar-label">Recent</span>
                    </button>
                    <button
                        className={`sidebar - item ${activeSection === 'starred' ? 'active' : ''} `}
                        onClick={() => onSectionChange('starred')}
                    >
                        <span className="sidebar-icon">⭐</span>
                        <span className="sidebar-label">Starred</span>
                    </button>
                </div>

                <div className="sidebar-divider"></div>

                <div className="sidebar-group">
                    <button
                        className={`sidebar - item ${activeSection === 'trash' ? 'active' : ''} `}
                        onClick={() => onSectionChange('trash')}
                    >
                        <span className="sidebar-icon">🗑️</span>
                        <span className="sidebar-label">Trash</span>
                    </button>
                </div>
            </div>

            <div className="sidebar-footer p-0 border-t-0">
                <StoragePanel {...storageProps} />
                <div className="pb-4 text-[9px] text-center text-gray-700 font-mono select-none tracking-widest uppercase opacity-50">
                    Prototype Simulation
                </div>
            </div>

            <NetworkInfoPanel isOpen={showInfo} onClose={() => setShowInfo(false)} />
        </aside>
    );
}
