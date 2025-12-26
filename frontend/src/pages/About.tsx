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

const UPCOMING_FEATURES = [
    {
        title: 'Self-Healing Storage',
        description: 'Automatic monitoring and repair of file replicas. If a node goes offline, the network automatically creates new replicas to maintain availability.',
    },
    {
        title: 'Multi-Replication',
        description: 'Every file is stored across multiple nodes (≥3 replicas) to ensure high availability and fault tolerance.',
    },
    {
        title: 'Community Storage Nodes',
        description: 'Anyone can run a storage node and contribute to the network. Earn rewards for providing reliable storage.',
    },
    {
        title: 'Chrome Extension Uploads',
        description: 'Quick file uploads directly from your browser with drag-and-drop support. Seamlessly syncs with your dashboard.',
    },
    {
        title: 'Wallet-Only Identity',
        description: 'No accounts, no passwords, no email. Your wallet is your identity. Connect and start storing immediately.',
    },
    {
        title: 'Metadata-Only AI Assistant',
        description: 'AI-powered search and organization using only encrypted metadata. Never accesses your file contents.',
    },
    {
        title: 'Automatic Replica Repair',
        description: 'Continuous background monitoring detects and repairs failed replicas without user intervention.',
    },
    {
        title: 'Node Health Monitoring',
        description: 'Real-time tracking of node status, capacity, and reliability scores to ensure optimal file placement.',
    },
    {
        title: 'Decentralized Availability',
        description: 'No single point of failure. Files remain accessible even if multiple nodes go offline.',
    },
    {
        title: 'User-Owned Infrastructure',
        description: 'You control your data and can run your own nodes. No dependency on corporate infrastructure.',
    },
    {
        title: 'No Vendor Lock-In',
        description: 'Open protocols and standards. Export your data anytime. Switch providers without losing access.',
    },
];

export function About() {
    return (
        <div className="about-page">
            {/* What CipherVault Is */}
            <section className="about-section section">
                <div className="container">
                    <h1>What is CipherVault?</h1>
                    <p className="about-lead">
                        CipherVault is a decentralized, user-owned cloud storage system that combines the
                        familiarity of Google Drive with the security of client-side encryption and the
                        resilience of distributed storage.
                    </p>
                    <p>
                        Unlike traditional cloud storage providers, CipherVault never has access to your
                        unencrypted files. Everything is encrypted in your browser before upload, distributed
                        across IPFS and community nodes, and protected by self-healing replication.
                    </p>
                </div>
            </section>

            {/* Why Decentralized Storage Matters */}
            <section className="about-section section">
                <div className="container">
                    <h2>Why Decentralized Storage Matters</h2>
                    <p>
                        Centralized cloud storage creates single points of failure, vendor lock-in, and
                        privacy concerns. When one company controls your data:
                    </p>
                    <ul className="about-list">
                        <li>They can read your files (even if they promise not to)</li>
                        <li>They can lose your data in outages or breaches</li>
                        <li>They can change pricing or terms at any time</li>
                        <li>They can be compelled to hand over your data</li>
                    </ul>
                    <p>
                        Decentralized storage solves these problems by distributing data across many
                        independent nodes, encrypting everything client-side, and giving you full control.
                    </p>
                </div>
            </section>

            {/* Core Architecture Overview */}
            <section className="about-section section">
                <div className="container">
                    <h2>Core Architecture</h2>
                    <div className="architecture-grid">
                        <div className="architecture-item">
                            <h3>Client-Side Encryption</h3>
                            <p>
                                All files are encrypted in your browser using the Web Crypto API (AES-256-GCM)
                                before upload. Your wallet controls the encryption keys.
                            </p>
                        </div>
                        <div className="architecture-item">
                            <h3>IPFS Storage</h3>
                            <p>
                                Encrypted files are stored on IPFS, a content-addressed distributed file system.
                                Files are identified by their cryptographic hash (CID).
                            </p>
                        </div>
                        <div className="architecture-item">
                            <h3>Community Nodes</h3>
                            <p>
                                Storage nodes run by community members store encrypted file replicas and report
                                health status to the network.
                            </p>
                        </div>
                        <div className="architecture-item">
                            <h3>Self-Healing Network</h3>
                            <p>
                                The network continuously monitors replica health and automatically repairs failures
                                to maintain ≥3 replicas per file.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Features - ANCHOR TARGET */}
            <section id="upcoming-features" className="about-section section upcoming-features-section">
                <div className="container">
                    <h2>Upcoming Features</h2>
                    <p className="about-lead">
                        CipherVault is under active development. Here&apos;s what&apos;s coming next:
                    </p>

                    <div className="features-grid">
                        {UPCOMING_FEATURES.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
