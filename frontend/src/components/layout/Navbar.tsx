/**
 * Navigation Bar Component
 * 
 * Global top navigation - always visible, clear hierarchy
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletSwitcher } from '@/components/shared/WalletSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import './Navbar.css';

export function Navbar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Threshold can be adjusted (e.g., 600 for hero height)
            setIsScrolled(window.scrollY > 600);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    CipherVault
                </Link>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`navbar-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
                    >
                        About
                    </Link>
                    <Link
                        to="/app"
                        className={`navbar-link ${isActive('/app') ? 'active' : ''}`}
                    >
                        Files
                    </Link>
                    <a
                        href="#"
                        className="navbar-link navbar-link-disabled"
                        onClick={(e) => e.preventDefault()}
                    >
                        Docs
                    </a>
                </div>

                {/* Right Side Actions */}
                <div className="navbar-actions">
                    <WalletSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
