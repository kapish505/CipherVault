/**
 * Trust Section - Editorial Style
 */

import { useScrollReveal } from '@/hooks/useScrollReveal';
import './TrustSection.css';

const TRUST_ITEMS = [
    {
        title: 'Client-Side Encryption',
        description: 'Files are encrypted in your browser before upload. Your encryption keys never leave your device.',
    },
    {
        title: 'Decentralized Storage',
        description: 'Files stored on IPFS, a distributed network. No single point of failure or control.',
    },
    {
        title: 'Wallet-Based Identity',
        description: 'Your wallet is your identity. No passwords, no accounts, no data collection.',
    },
    {
        title: 'Zero-Knowledge Architecture',
        description: 'Servers never see your plaintext data. Complete privacy by design, not policy.',
    },
];

function TrustItem({ item, index }: { item: typeof TRUST_ITEMS[0]; index: number }) {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.4 });

    return (
        <div
            ref={ref}
            className={`trust-item ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 0.1}s` }}
        >
            <h3 className="trust-title">{item.title}</h3>
            <p className="trust-description">{item.description}</p>
        </div>
    );
}

export function TrustSection() {
    const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.5 });

    return (
        <section className="trust-section">
            <div className="trust-container">
                <div
                    ref={headerRef}
                    className={`trust-header ${headerVisible ? 'visible' : ''}`}
                >
                    <h2>Built for Privacy</h2>
                    <p>
                        Traditional cloud storage requires you to trust the provider.
                        <br />
                        CipherVault is designed so you don't have to.
                    </p>
                </div>

                <div className="trust-list">
                    {TRUST_ITEMS.map((item, index) => (
                        <TrustItem key={item.title} item={item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
