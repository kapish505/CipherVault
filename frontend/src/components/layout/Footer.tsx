/**
 * Footer Component - Polished
 */

import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <div className="footer-logo">CipherVault</div>
                        <p className="footer-tagline">
                            Zero-knowledge cloud storage.
                            <br />
                            Your files, your keys, your control.
                        </p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h4 className="footer-heading">Product</h4>
                            <Link to="/app" className="footer-link">Files</Link>
                            <Link to="/about" className="footer-link">About</Link>
                            <a href="#" className="footer-link">Docs</a>
                        </div>

                        <div className="footer-column">
                            <h4 className="footer-heading">Resources</h4>
                            <a href="https://github.com" className="footer-link" target="_blank" rel="noopener noreferrer">
                                GitHub
                            </a>
                            <a href="#" className="footer-link">Security</a>
                            <a href="#" className="footer-link">Privacy</a>
                        </div>

                        <div className="footer-column">
                            <h4 className="footer-heading">Technology</h4>
                            <a href="https://ipfs.io" className="footer-link" target="_blank" rel="noopener noreferrer">
                                IPFS
                            </a>
                            <a href="https://metamask.io" className="footer-link" target="_blank" rel="noopener noreferrer">
                                MetaMask
                            </a>
                            <a href="#" className="footer-link">Encryption</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2025 CipherVault. Built for privacy.
                    </p>
                    <div className="footer-badges">
                        <span className="footer-badge">🔐 Zero-Knowledge</span>
                        <span className="footer-badge">🌐 Decentralized</span>
                        <span className="footer-badge">💎 Open Source</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
