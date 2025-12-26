/**
 * Upload Manager - Premium Bottom Panel
 * 
 * Features:
 * - Shows all active uploads
 * - Progress bars for each file
 * - Collapsible panel
 * - Auto-hide when no uploads
 * - Premium animations
 */

import React from 'react';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import './UploadManager.css';

export function UploadManager() {
    const { tasks, retryTask, removeTask, clearCompleted } = useUploadQueue();
    const [isExpanded, setIsExpanded] = React.useState(true);

    // Don't show if no tasks
    if (tasks.length === 0) {
        return null;
    }

    const activeTasks = tasks.filter(t => ['queued', 'encrypting', 'uploading'].includes(t.status));
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const failedTasks = tasks.filter(t => t.status === 'failed');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'queued': return '⏳';
            case 'encrypting': return '🔒';
            case 'uploading': return '⬆️';
            case 'completed': return '✓';
            case 'failed': return '✕';
            default: return '•';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'failed': return '#ef4444';
            case 'uploading': return '#3b82f6';
            case 'encrypting': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'queued': return 'Queued';
            case 'encrypting': return 'Encrypting...';
            case 'uploading': return 'Uploading...';
            case 'completed': return 'Completed';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    return (
        <div className={`upload-manager ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {/* Header */}
            <div className="upload-manager-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="header-left">
                    <span className="header-icon">📤</span>
                    <div className="header-text">
                        <strong>Upload Manager</strong>
                        <span className="header-count">
                            {activeTasks.length > 0 && `${activeTasks.length} uploading`}
                            {completedTasks.length > 0 && ` • ${completedTasks.length} completed`}
                            {failedTasks.length > 0 && ` • ${failedTasks.length} failed`}
                        </span>
                    </div>
                </div>
                <div className="header-right">
                    {completedTasks.length > 0 && (
                        <button
                            className="btn-clear"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearCompleted();
                            }}
                            title="Clear completed"
                        >
                            Clear
                        </button>
                    )}
                    <button className="btn-toggle" title={isExpanded ? 'Collapse' : 'Expand'}>
                        {isExpanded ? '▼' : '▲'}
                    </button>
                </div>
            </div>

            {/* Upload List */}
            {isExpanded && (
                <div className="upload-manager-content">
                    {tasks.map((task) => (
                        <div key={task.id} className={`upload-task upload-task-${task.status}`}>
                            <div className="task-header">
                                <div className="task-info">
                                    <span
                                        className="task-status-icon"
                                        style={{ color: getStatusColor(task.status) }}
                                    >
                                        {getStatusIcon(task.status)}
                                    </span>
                                    <div className="task-details">
                                        <div className="task-name" title={task.file.name}>
                                            {task.file.name}
                                        </div>
                                        <div className="task-meta">
                                            <span className="task-size">
                                                {(task.file.size / 1024).toFixed(1)} KB
                                            </span>
                                            <span className="task-separator">•</span>
                                            <span
                                                className="task-status"
                                                style={{ color: getStatusColor(task.status) }}
                                            >
                                                {getStatusText(task.status)}
                                            </span>
                                            {task.classification && (
                                                <>
                                                    <span className="task-separator">•</span>
                                                    <span className="task-classification">
                                                        {task.classification}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="task-actions">
                                    {task.status === 'failed' && (
                                        <button
                                            className="btn-retry"
                                            onClick={() => retryTask(task.id)}
                                            title="Retry upload"
                                        >
                                            ↻
                                        </button>
                                    )}
                                    {(task.status === 'completed' || task.status === 'failed') && (
                                        <button
                                            className="btn-remove"
                                            onClick={() => removeTask(task.id)}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {['queued', 'encrypting', 'uploading'].includes(task.status) && (
                                <div className="task-progress">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${task.progress}%`,
                                            backgroundColor: getStatusColor(task.status)
                                        }}
                                    />
                                </div>
                            )}

                            {/* Error Message */}
                            {task.error && (
                                <div className="task-error">
                                    {task.error}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
