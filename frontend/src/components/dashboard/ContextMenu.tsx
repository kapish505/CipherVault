import React, { useEffect } from 'react';
import { toast } from 'sonner';
import './ContextMenu.css';

interface ContextMenuProps {
    fileId: string;
    fileName: string;
    position: { x: number; y: number };
    onClose: () => void;
    // Optional callbacks for integration
    onDownload?: (fileId: string) => void;
    onShare?: (fileId: string) => void;
    onDelete?: (fileId: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    fileId,
    fileName,
    position,
    onClose,
    onDownload,
    onShare,
    onDelete,
}) => {
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.context-menu')) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleDownload = () => {
        if (onDownload) {
            onDownload(fileId);
        }
        toast.success(`Downloading ${fileName}`);
        onClose();
    };

    const handleShare = () => {
        if (onShare) {
            onShare(fileId);
        }
        toast.info(`Sharing ${fileName}`);
        onClose();
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(fileId);
        }
        toast.error(`Deleted ${fileName}`);
        onClose();
    };

    return (
        <div
            className="context-menu"
            style={{ top: position.y, left: position.x }}
        >
            <ul>
                <li onClick={handleDownload}>Download</li>
                <li onClick={handleShare}>Share</li>
                <li onClick={handleDelete}>Delete</li>
            </ul>
        </div>
    );
};
