/**
 * System Diagram Component
 * 
 * Visual representation of CipherVault architecture
 */

import './SystemDiagram.css';

export function SystemDiagram() {
    return (
        <section className="system-diagram-section">
            <div className="system-container">
                <h2 className="system-title">Under the Hood</h2>
                <p className="system-subtitle">
                    A decentralized architecture built for privacy and resilience
                </p>

                <div className="diagram-container">
                    <div className="diagram-flow">
                        {/* Step 1: Client */}
                        <div className="diagram-node">
                            <div className="node-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <path d="M8 21h8M12 17v4" />
                                </svg>
                            </div>
                            <div className="node-label">Your Browser</div>
                            <div className="node-desc">Client-side encryption</div>
                        </div>

                        <div className="diagram-arrow">
                            <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                                <path d="M2 12h56M50 6l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="arrow-label">Encrypted data</span>
                        </div>

                        {/* Step 2: IPFS */}
                        <div className="diagram-node">
                            <div className="node-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2v20M2 12h20" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <div className="node-label">IPFS Network</div>
                            <div className="node-desc">Distributed storage</div>
                        </div>

                        <div className="diagram-arrow">
                            <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                                <path d="M2 12h56M50 6l8 6-8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="arrow-label">Replicated</span>
                        </div>

                        {/* Step 3: Nodes */}
                        <div className="diagram-node">
                            <div className="node-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div className="node-label">Storage Nodes</div>
                            <div className="node-desc">Global distribution</div>
                        </div>
                    </div>

                    <div className="diagram-features">
                        <div className="feature-item">
                            <span className="feature-icon">🔒</span>
                            <span className="feature-text">AES-256-GCM encryption</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🌐</span>
                            <span className="feature-text">Content-addressed storage</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">♾️</span>
                            <span className="feature-text">Self-healing replication</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
