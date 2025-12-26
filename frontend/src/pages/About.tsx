/**
 * About Page
 * 
 * Information about CipherVault, architecture, and upcoming features.
 * 
 * Sections:
 * - What CipherVault Is
 * - Why Decentralized Storage Matters
 * - Core Architecture Overview
 * - Upcoming Features (anchor target: #upcoming-features)
 * 
 * The Upcoming Features section is the target for the scrolling bar click.
 * 
 * Security: None (client-side UI only)
 */

import './About.css';

/**
 * About Page - The Sovereign Web
 */

import { useEffect } from 'react';
import './About.css';

const CORE_PILLARS = [
    {
        title: 'The x402 Protocol',
        icon: '⚡',
        description: 'Inspired by HTTP 402 "Payment Required", this protocol layer introduces native economic metering to the web. It coordinates storage requests, incentivizes node operators, and manages resource allocation trustlessly.',
        wide: true
    },
    {
        title: 'Immutable Storage',
        icon: '🧊',
        description: 'Built on IPFS (InterPlanetary File System), files are content-addressed. This means data is retrieved by "what it is", not "where it is", creating a permanent, censorship-resistant web.',
        wide: false
    },
    {
        title: 'Zero-Knowledge',
        icon: '🛡️',
        description: 'Client-side AES-256-GCM encryption ensures that you alone hold the keys. The protocol proofs verify storage content without ever revealing the underlying data.',
        wide: false
    },
    {
        title: 'Self-Healing Mesh',
        icon: '🕸️',
        description: 'The network is alive. It actively monitors replica health, automatically repairing data entropy by re-pinning files to new nodes when older ones go offline. A true biological approach to data persistence.',
        wide: true
    }
];

const UPCOMING_ROADMAP = [
    {
        tag: 'Q2 2026',
        title: 'Autonomous Data Guardians',
        description: 'Local, private AI agents that organize, tag, and summarize your encrypted vault without the data ever leaving your device.'
    },
    {
        tag: 'Experimental',
        title: 'Data Sovereignty Markets',
        description: 'Selectively decrypt and monetize your datasets. Offer your storage credits or unique data to the x402 network in exchange for tokens.'
    },
    {
        tag: 'Protocol',
        title: 'Governance DAO',
        description: 'Protocol upgrades, fee structures, and storage parameters controlled directly by x402 utility token holders.'
    },
    {
        tag: 'Client',
        title: 'OS-Level Integration',
        description: 'Native file system drivers for macOS and Windows. Mount your CipherVault directly as a local drive.'
    },
    {
        tag: 'Network',
        title: 'Offline-First Mesh',
        description: 'Sync encrypted shards via Bluetooth LE and WiFi Direct when internet access is unavailable.'
    }
];

export function About() {
    // Scroll to section handling
    useEffect(() => {
        if (window.location.hash) {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    return (
        <div className="about-page">
            {/* Nav is global, but we ensure layout spacing in CSS */}

            {/* Hero Section */}
            <section className="about-section">
                <div className="about-container">
                    <h1 className="section-title">The Sovereign Web.</h1>
                    <p className="section-subtitle">
                        We are building the storage layer for a new internet. <br />
                        Where data is owned by users, not corporations. Where privacy is mathematical, not promised.
                    </p>

                    {/* Architecture Bento Grid */}
                    <div className="bento-grid">
                        {CORE_PILLARS.map((item, idx) => (
                            <div key={idx} className="bento-item">
                                <div className="glow-bg" />
                                <div className="bento-icon">{item.icon}</div>
                                <div className="bento-title">{item.title}</div>
                                <div className="bento-desc">{item.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Manifesto / Why */}
            <section className="about-section">
                <div className="about-container text-center">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="section-title" style={{ fontSize: '2rem' }}>Why We Build</h2>
                        <p className="bento-desc" style={{ fontSize: '1.1rem' }}>
                            The legacy internet was built on fragile assumptions: centralized servers, trusted third parties, and data rent-seeking.
                            CipherVault demonstrates a new possibility. By combining the <strong>x402 protocol</strong> for economic coordination
                            with cryptographic proofs, we create a system that can run forever, without any single owner.
                        </p>
                    </div>
                </div>
            </section>

            {/* Upcoming Roadmap */}
            <section id="upcoming-features" className="about-section roadmap-section">
                <div className="about-container">
                    <h2 className="section-title">The Horizon</h2>
                    <p className="section-subtitle">
                        Our roadmap for the next generation of decentralized infrastructure.
                    </p>

                    <div className="roadmap-grid">
                        {UPCOMING_ROADMAP.map((item, idx) => (
                            <div key={idx} className="roadmap-card">
                                <span className="roadmap-tag">{item.tag}</span>
                                <h3 className="bento-title" style={{ fontSize: '1.2rem' }}>{item.title}</h3>
                                <p className="bento-desc">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
