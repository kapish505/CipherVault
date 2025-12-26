/**
 * How It Works - With Visuals
 */

import { useScrollReveal } from '@/hooks/useScrollReveal';
import './HowItWorks.css';

const STEPS = [
    {
        number: '01',
        title: 'Connect Wallet',
        description: 'Use MetaMask to authenticate. Your wallet is your identity—no passwords, no accounts.',
        visual: (
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="step-visual">
                <rect x="40" y="60" width="120" height="80" rx="8" stroke="currentColor" strokeWidth="2" />
                <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M100 90v20M90 100h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M60 60l-10-20M140 60l10-20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Upload & Encrypt',
        description: 'Files are encrypted in your browser with AES-256-GCM before leaving your device.',
        visual: (
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="step-visual">
                <rect x="50" y="50" width="100" height="100" rx="4" stroke="currentColor" strokeWidth="2" />
                <path d="M70 80h60M70 100h60M70 120h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="160" cy="60" r="30" fill="currentColor" opacity="0.1" />
                <path d="M160 50v20M150 60h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M140 100l20 20 20-20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Store on IPFS',
        description: 'Encrypted files are stored on IPFS. Only you hold the keys to decrypt them.',
        visual: (
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="step-visual">
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="15" fill="currentColor" />
                <circle cx="60" cy="80" r="10" fill="currentColor" opacity="0.6" />
                <circle cx="140" cy="80" r="10" fill="currentColor" opacity="0.6" />
                <circle cx="80" cy="130" r="10" fill="currentColor" opacity="0.6" />
                <circle cx="120" cy="130" r="10" fill="currentColor" opacity="0.6" />
                <path d="M100 100L60 80M100 100L140 80M100 100L80 130M100 100L120 130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </svg>
        ),
    },
];

function Step({ step, index }: { step: typeof STEPS[0]; index: number }) {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className={`step ${isVisible ? 'visible' : ''} ${isEven ? 'step-left' : 'step-right'}`}
            style={{ transitionDelay: `${index * 0.1}s` }}
        >
            <div className="step-content">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
            </div>
            <div className="step-visual-container">
                {step.visual}
            </div>
        </div>
    );
}

export function HowItWorks() {
    const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.5 });

    return (
        <section className="how-it-works">
            <div className="how-it-works-container">
                <h2
                    ref={headerRef}
                    className={`section-title ${headerVisible ? 'visible' : ''}`}
                >
                    How it works
                </h2>

                <div className="steps-list">
                    {STEPS.map((step, index) => (
                        <Step key={step.number} step={step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
