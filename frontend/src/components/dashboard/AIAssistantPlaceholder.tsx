/**
 * AI Assistant Placeholder (DISABLED)
 * 
 * Shows AI assistant concept with honest communication
 */

import { useState } from 'react';
import './AIAssistantPlaceholder.css';

export function AIAssistantPlaceholder() {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="ai-assistant-placeholder">
            <div className="ai-input-container">
                <span className="ai-icon">🤖</span>
                <input
                    type="text"
                    className="ai-input"
                    placeholder="AI metadata assistant (coming soon)"
                    disabled
                    onClick={() => setShowInfo(true)}
                />
                <button
                    className="ai-info-btn"
                    onClick={() => setShowInfo(true)}
                    title="Learn about AI assistant"
                >
                    ℹ️
                </button>
            </div>

            {showInfo && (
                <div className="ai-info-modal-overlay" onClick={() => setShowInfo(false)}>
                    <div className="ai-info-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-info-header">
                            <h3>AI Metadata Assistant</h3>
                            <button className="close-btn" onClick={() => setShowInfo(false)}>✕</button>
                        </div>

                        <div className="ai-info-content">
                            <div className="feature-badge coming-soon">Coming Soon</div>

                            <h4>How It Works</h4>
                            <p>
                                The AI assistant analyzes <strong>metadata only</strong> — never file content.
                                It helps you find files faster using natural language queries.
                            </p>

                            <h4>Privacy First</h4>
                            <ul>
                                <li>✓ Only encrypted metadata is analyzed</li>
                                <li>✓ File content remains private</li>
                                <li>✓ Zero-knowledge architecture preserved</li>
                            </ul>

                            <h4>Example Queries</h4>
                            <div className="example-queries">
                                <code>&quot;Show me PDFs from last week&quot;</code>
                                <code>&quot;Find confidential files&quot;</code>
                                <code>&quot;Images larger than 5MB&quot;</code>
                            </div>

                            <div className="ai-footer">
                                <em>Feature in active development — metadata-only approach ensures privacy.</em>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
