/**
 * Classification Selector
 * 
 * Dropdown for selecting file classification during upload
 */

import { useState } from 'react';
import './ClassificationSelector.css';

interface ClassificationSelectorProps {
    value: 'public' | 'private' | 'confidential';
    onChange: (value: 'public' | 'private' | 'confidential') => void;
}

const OPTIONS = [
    {
        value: 'public' as const,
        label: 'Public',
        icon: '🌐',
        description: 'Can be shared freely with anyone'
    },
    {
        value: 'private' as const,
        label: 'Private',
        icon: '🔒',
        description: 'Personal files, default privacy'
    },
    {
        value: 'confidential' as const,
        label: 'Highly Confidential',
        icon: '🔐',
        description: 'Sensitive data with restricted access'
    }
];

export function ClassificationSelector({ value, onChange }: ClassificationSelectorProps) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="classification-selector">
            <label className="selector-label">
                File Classification
                <button
                    className="info-btn"
                    onClick={() => setShowInfo(!showInfo)}
                    type="button"
                    title="Learn about classifications"
                >
                    ℹ️
                </button>
            </label>

            <select
                className="classification-select"
                value={value}
                onChange={(e) => onChange(e.target.value as any)}
            >
                {OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                    </option>
                ))}
            </select>

            {showInfo && (
                <div className="classification-info">
                    <div className="info-header">
                        <strong>Classification Levels</strong>
                        <button onClick={() => setShowInfo(false)} className="close-info">✕</button>
                    </div>
                    {OPTIONS.map(option => (
                        <div key={option.value} className="info-item">
                            <span className="info-icon">{option.icon}</span>
                            <div>
                                <div className="info-title">{option.label}</div>
                                <div className="info-desc">{option.description}</div>
                            </div>
                        </div>
                    ))}
                    <div className="info-footer">
                        <em>Classification determines future sharing policies and replication strategies.</em>
                    </div>
                </div>
            )}
        </div>
    );
}
