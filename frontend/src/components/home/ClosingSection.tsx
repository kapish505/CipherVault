/**
 * Closing Section - Strong Closure
 */

import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import './ClosingSection.css';

export function ClosingSection() {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.5 });

    return (
        <section className="closing-section">
            <div ref={ref} className={`closing-container ${isVisible ? 'visible' : ''}`}>
                <h2 className="closing-statement">
                    You own your files. Always.
                </h2>
                <div className="closing-actions">
                    <Link to="/app" className="btn btn-primary-large">
                        Launch App
                    </Link>
                    <Link to="/about" className="btn btn-secondary-large">
                        Learn More →
                    </Link>
                </div>
            </div>
        </section>
    );
}
