/**
 * Breadcrumb Navigation
 * 
 * Shows current folder path
 */

import './Breadcrumb.css';
import * as metadata from '@/services/metadata';

interface BreadcrumbProps {
    path: metadata.FileMetadata[];
    onNavigate: (folderId: string | null) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
    return (
        <div className="breadcrumb">
            <button
                className="breadcrumb-item"
                onClick={() => onNavigate(null)}
            >
                <span className="breadcrumb-icon">🏠</span>
                <span>My Files</span>
            </button>

            {path.map((folder) => (
                <div key={folder.id} className="breadcrumb-segment">
                    <span className="breadcrumb-separator">/</span>
                    <button
                        className="breadcrumb-item"
                        onClick={() => onNavigate(folder.id)}
                    >
                        <span className="breadcrumb-icon">📁</span>
                        <span>{folder.name}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
