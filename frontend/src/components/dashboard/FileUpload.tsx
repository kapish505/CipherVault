/**
 * File Upload Component - Premium Multi-File Upload
 */

import { useState, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { ClassificationSelector } from './ClassificationSelector';
import { UploadButton3D } from './UploadButton3D';
import './FileUpload.css';
import { toast } from 'sonner';

interface FileUploadProps {
    onUploadComplete: () => void;
    currentFolderId?: string | null;
}

const CLASSIFICATIONS = {
    public: {
        icon: '🌐',
        label: 'Public',
        color: '#10b981',
        description: 'Anyone can access',
        details: 'Files marked as Public can be shared freely with anyone. Best for non-sensitive documents, public reports, or content meant for distribution.',
        examples: 'Public reports, marketing materials, open-source documentation'
    },
    private: {
        icon: '🔒',
        label: 'Private',
        color: '#3b82f6',
        description: 'Personal files only',
        details: 'Private files are accessible only to you. This is the default classification for most personal documents and files.',
        examples: 'Personal photos, notes, general documents'
    },
    confidential: {
        icon: '🔐',
        label: 'Highly Confidential',
        color: '#ef4444',
        description: 'Maximum security',
        details: 'Highly Confidential files have the strictest access controls. Use for sensitive data like financial records, legal documents, or private keys.',
        examples: 'Financial records, legal contracts, medical documents, private keys'
    }
};

export function FileUpload({ onUploadComplete, currentFolderId }: FileUploadProps) {
    const { address, isConnected } = useWallet();
    const { addToQueue, processQueue } = useUploadQueue();
    const [isDragging, setIsDragging] = useState(false);
    const [classification, setClassification] = useState<'public' | 'private' | 'confidential'>('private');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        if (!address) {
            toast.error('Please connect your wallet first');
            return;
        }

        const fileArray = Array.from(files);

        // Set uploading state
        setIsUploading(true);
        toast.info(`Starting upload for ${fileArray.length} file(s)...`);

        try {
            // Add files to queue
            const newTasks = addToQueue(fileArray, currentFolderId || undefined, classification);

            // Start processing in background with explicit tasks
            processQueue(address, newTasks).finally(() => {
                setIsUploading(false);
            });

            // Reset file inputs immediately
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (folderInputRef.current) folderInputRef.current.value = '';

            // Refresh file list after a delay
            setTimeout(() => {
                onUploadComplete();
                toast.success('Files uploaded successfully');
            }, 2000);

        } catch (error: any) {
            console.error('Upload error:', error);
            setIsUploading(false);
            toast.error(`Upload error: ${error.message || 'Unknown error'}`);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFolderClick = () => {
        folderInputRef.current?.click();
    };

    if (!isConnected) {
        return (
            <div className="file-upload-placeholder">
                <div className="placeholder-icon">🔐</div>
                <h3>Connect Your Wallet</h3>
                <p>Connect your wallet to start uploading encrypted files</p>
            </div>
        );
    }

    const currentClassification = CLASSIFICATIONS[classification];

    return (
        <div className="file-upload-premium">
            {/* Header */}
            <div className="upload-header">
                <h2>Upload Files</h2>
                <p className="upload-subtitle">Select classification level and upload your files securely</p>
                {isUploading && (
                    <div className="upload-status-badge">
                        <span className="status-icon">⟳</span>
                        <span>Processing uploads...</span>
                    </div>
                )}
            </div>

            {/* Classification Selection */}
            {/* Classification Selection */}
            <div className="classification-selector-container">
                <ClassificationSelector
                    value={classification}
                    onChange={setClassification}
                />
            </div>

            {/* Classification Details */}
            <div className="classification-details" style={{ borderLeftColor: currentClassification.color }}>
                <div className="details-header">
                    <span className="details-icon">{currentClassification.icon}</span>
                    <strong>{currentClassification.label}</strong>
                </div>
                <p className="details-text">{currentClassification.details}</p>
                <div className="details-examples">
                    <strong>Examples:</strong> {currentClassification.examples}
                </div>
            </div>

            {/* Upload Dropzone */}
            <div
                className={`upload-dropzone-premium ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    /* @ts-ignore */
                    webkitdirectory=""
                    // eslint-disable-next-line react/no-unknown-property
                    directory=""
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />

                <div className="dropzone-icon">📁</div>
                <h3 className="dropzone-title">Drag and drop files here</h3>
                <p className="dropzone-subtitle">or choose from options below</p>

                <div className="upload-actions">
                    <UploadButton3D
                        label="Select Files"
                        onClick={handleFileClick}
                        icon="📄"
                        variant="blue"
                    />
                    <UploadButton3D
                        label="Select Folder"
                        onClick={handleFolderClick}
                        icon="📂"
                        variant="green"
                    />
                </div>

                <div className="upload-features">
                    <div className="feature-item">
                        <span className="feature-icon">🔒</span>
                        <span>Client-side encryption</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🌐</span>
                        <span>IPFS storage</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Zero-knowledge</span>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="upload-info-note">
                <div className="info-icon">ℹ️</div>
                <div className="info-content">
                    <strong>Upload Progress</strong>
                    <p>Files will be added to the upload queue. You can continue uploading more files while previous uploads are processing. Check the bottom-right panel for upload progress.</p>
                </div>
            </div>
        </div>
    );
}
