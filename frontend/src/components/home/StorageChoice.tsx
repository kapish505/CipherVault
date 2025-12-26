/**
 * Storage Choice Section - NEW
 * 
 * Explains the two storage options
 */

import { useScrollReveal } from '@/hooks/useScrollReveal';
import './StorageChoice.css';

export function StorageChoice() {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

    return (
        <section className="storage-choice">
            <div className="storage-container">
                <h2 className="storage-title">Choose how you store</h2>

                <div ref={ref} className={`storage-options ${isVisible ? 'visible' : ''}`}>
                    <div className="storage-option">
                        <div className="option-header">
                            <span className="option-icon">🌐</span>
                            <h3 className="option-title">Contribute Storage</h3>
                        </div>
                        <p className="option-description">
                            Run a storage node and earn space by contributing to the network.
                            Help build a truly decentralized cloud.
                        </p>
                        <div className="option-status">Coming soon</div>
                    </div>

                    <div className="storage-option">
                        <div className="option-header">
                            <span className="option-icon">💳</span>
                            <h3 className="option-title">Pay for Storage</h3>
                        </div>
                        <p className="option-description">
                            Simple, predictable pricing for IPFS pinning.
                            No setup required, just upload and go.
                        </p>
                        <div className="option-status">Pricing coming soon</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
