/**
 * File Preview Component
 * 
 * Shows preview of file based on type:
 * - Images: Thumbnail preview
 * - PDFs: First page preview
 * - Text: Content preview
 * - Others: File type icon
 */

import { useState, useEffect } from 'react';
import './FilePreview.css';

interface FilePreviewProps {
    file: File | Blob;
    mimeType: string;
    fileName: string;
}

export function FilePreview({ file, mimeType, fileName }: FilePreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (mimeType.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file, mimeType]);

    // Image preview
    if (mimeType.startsWith('image/') && previewUrl) {
        return (
            <div className="file-preview file-preview-image">
                <img src={previewUrl} alt={fileName} />
            </div>
        );
    }

    // Get file icon based on type
    const getFileIcon = () => {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
        if (mimeType.includes('text')) return '📃';
        return '📁';
    };

    return (
        <div className="file-preview file-preview-icon">
            <span className="file-icon">{getFileIcon()}</span>
        </div>
    );
}

/**
 * Get file type icon (for use in lists)
 */
export function getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
    if (mimeType.includes('text')) return '📃';
    return '📁';
}
