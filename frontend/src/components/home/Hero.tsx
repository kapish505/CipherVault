/**
 * Hero Section - Scroll-Responsive
 */

import { useEffect, useState } from 'react';
import './Hero.css';

export function Hero() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Subtle scale effect based on scroll (max 300px scroll)
    const scale = Math.max(0.95, 1 - scrollY / 3000);
    const opacity = Math.max(0.3, 1 - scrollY / 400);

    return (
        <section className="hero">
            <div className="hero-container">
                <h1
                    className="hero-title"
                    style={{
                        transform: `scale(${scale})`,
                        opacity: opacity,
                    }}
                >
                    Decentralized Storage.
                    <br />
                    Replication & Self-Healing.
                </h1>

                <p
                    className="hero-subtitle"
                    style={{
                        opacity: Math.max(0, opacity - 0.1),
                    }}
                >
                    Experience the future of participation-based storage.
                    <br />
                    Resilient, encrypted, and distributed across the network.
                </p>
            </div>
        </section>
    );
}
