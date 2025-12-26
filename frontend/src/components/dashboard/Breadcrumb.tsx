/**
 * Breadcrumb Navigation
 * 
 * Shows current folder path
 */

import { useFolders } from '@/hooks/useFolders';
import './Breadcrumb.css';

interface BreadcrumbProps {
    walletAddress: string | null;
}

export function Breadcrumb({ walletAddress }: BreadcrumbProps) {
    const { currentFolderId, getFolderPath, setCurrentFolderId } = useFolders(walletAddress);
    const path = getFolderPath(currentFolderId);

    return (
        <div className="breadcrumb">
            <button
                className="breadcrumb-item"
                onClick={() => setCurrentFolderId(null)}
            >
                <span className="breadcrumb-icon">🏠</span>
                <span>My Files</span>
            </button>

            {path.map((folder, index) => (
                <div key={folder.id} className="breadcrumb-segment">
                    <span className="breadcrumb-separator">/</span>
                    <button
                        className="breadcrumb-item"
                        onClick={() => setCurrentFolderId(folder.id)}
                    >
                        <span className="breadcrumb-icon">📁</span>
                        <span>{folder.name}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
