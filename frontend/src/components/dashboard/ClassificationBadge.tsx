/**
 * File Classification Badge
 * 
 * Visual indicator for file classification level
 */

import './ClassificationBadge.css';

interface ClassificationBadgeProps {
    classification: 'public' | 'private' | 'confidential';
    showLabel?: boolean;
}

const CLASSIFICATION_CONFIG = {
    public: {
        label: 'Public',
        icon: '🌐',
        color: '#10b981',
        description: 'Can be shared freely'
    },
    private: {
        label: 'Private',
        icon: '🔒',
        color: '#3b82f6',
        description: 'Personal files'
    },
    confidential: {
        label: 'Highly Confidential',
        icon: '🔐',
        color: '#ef4444',
        description: 'Sensitive data - restricted access'
    }
};

export function ClassificationBadge({ classification, showLabel = true }: ClassificationBadgeProps) {
    const config = CLASSIFICATION_CONFIG[classification] || CLASSIFICATION_CONFIG.private;

    return (
        <div
            className={`classification-badge classification-${classification}`}
            // style={{ borderColor: config.color }} // Removed in CSS
            title={config.description}
        >
            <span className="classification-icon" style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{config.icon}</span>
            {showLabel && <span className="classification-label">{config.label}</span>}
        </div>
    );
}
