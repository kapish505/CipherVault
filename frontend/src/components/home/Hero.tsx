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
                    Your files, encrypted.
                    <br />
                    Your keys, your control.
                </h1>

                <p
                    className="hero-subtitle"
                    style={{
                        opacity: Math.max(0, opacity - 0.1),
                    }}
                >
                    Zero-knowledge cloud storage powered by client-side encryption and IPFS.
                    <br />
                    No servers can read your data. Ever.
                </p>
            </div>
        </section>
    );
}
