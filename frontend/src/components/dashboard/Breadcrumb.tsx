import { useState } from 'react';
import './Breadcrumb.css';
import * as metadata from '@/services/metadata';

interface BreadcrumbProps {
    path: metadata.FileMetadata[];
    onNavigate: (folderId: string | null) => void;
    onDrop?: (targetFolderId: string | null) => void;
}

export function Breadcrumb({ path, onNavigate, onDrop }: BreadcrumbProps) {
    const [dragOverId, setDragOverId] = useState<string | 'root' | null>(null);

    const handleDragOver = (e: React.DragEvent, id: string | 'root') => {
        if (!onDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverId(id);
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, id: string | 'root') => {
        e.preventDefault();
        setDragOverId(null);
        if (onDrop) {
            onDrop(id === 'root' ? null : id);
        }
    };

    return (
        <div className="breadcrumb">
            <button
                className={`breadcrumb-item ${dragOverId === 'root' ? 'drag-over' : ''}`}
                onClick={() => onNavigate(null)}
                onDragOver={(e) => handleDragOver(e, 'root')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'root')}
            >
                <span className="breadcrumb-icon">🏠</span>
                <span>My Files</span>
            </button>

            {path.map((folder) => (
                <div key={folder.id} className="breadcrumb-segment">
                    <span className="breadcrumb-separator">/</span>
                    <button
                        className={`breadcrumb-item ${dragOverId === folder.id ? 'drag-over' : ''}`}
                        onClick={() => onNavigate(folder.id)}
                        onDragOver={(e) => handleDragOver(e, folder.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, folder.id)}
                    >
                        <span className="breadcrumb-icon">📁</span>
                        <span>{folder.name}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
