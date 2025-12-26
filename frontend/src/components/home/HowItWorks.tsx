/**
 * How It Works - With Visuals
 */

import { useScrollReveal } from '@/hooks/useScrollReveal';
import './HowItWorks.css';

const STEPS = [
    {
        number: '01',
        title: 'Encrypt & Decentralize',
        description: 'Your files are encrypted client-side and sharded across the IPFS network.',
        visual: (
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="step-visual">
                <rect x="60" y="60" width="80" height="80" rx="4" stroke="currentColor" strokeWidth="2" />
                <path d="M100 85v30" stroke="currentColor" strokeWidth="2" />
                <path d="M85 100h30" stroke="currentColor" strokeWidth="2" />
                <circle cx="150" cy="50" r="20" stroke="currentColor" strokeWidth="2" className="float-anim-1" />
                <circle cx="50" cy="150" r="15" stroke="currentColor" strokeWidth="2" className="float-anim-2" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Replication & Healing',
        description: 'The network automatically replicates data to ensuring redundancy and recovers lost shards.',
        visual: (
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="step-visual">
                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2" />
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="spin-anim" />
                <circle cx="160" cy="100" r="10" fill="currentColor" opacity="0.5" />
                <circle cx="40" cy="100" r="10" fill="currentColor" opacity="0.5" />
                <circle cx="100" cy="40" r="10" fill="currentColor" opacity="0.5" />
                <path d="M100 60v-20M100 140v20M60 100H40M160 100h-20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Participation-Based',
        description: 'Nodes earn trust and storage credits by participating in the network\'s health.',
        visual: (
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="step-visual">
                <path d="M100 40L160 160H40L100 40Z" stroke="currentColor" strokeWidth="2" />
                <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="2" />
                <path d="M100 85L110 115H90L100 85Z" fill="currentColor" opacity="0.8" />
                <circle cx="40" cy="160" r="5" fill="currentColor" />
                <circle cx="160" cy="160" r="5" fill="currentColor" />
                <circle cx="100" cy="40" r="5" fill="currentColor" />
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
