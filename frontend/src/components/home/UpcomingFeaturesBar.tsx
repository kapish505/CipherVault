/**
 * Upcoming Features Bar - Enhanced with Icons
 */

import { useNavigate } from 'react-router-dom';
import './UpcomingFeaturesBar.css';

const FEATURES = [
    { icon: '👥', text: 'File Sharing' },
    { icon: '📁', text: 'Folder Organization' },
    { icon: '🔍', text: 'Advanced Search' },
    { icon: '📊', text: 'Storage Analytics' },
    { icon: '🔄', text: 'File Versioning' },
    { icon: '⚡', text: 'Batch Operations' },
];

export function UpcomingFeaturesBar() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/about#upcoming-features');
    };

    return (
        <div className="features-bar" onClick={handleClick}>
            <div className="features-bar-container">
                <div className="features-label">
                    What Powers CipherVault →
                </div>
                <div className="features-scroll">
                    <div className="features-track">
                        {[...FEATURES, ...FEATURES, ...FEATURES].map((feature, index) => (
                            <div key={index} className="feature-item">
                                <span className="feature-icon">{feature.icon}</span>
                                <span className="feature-text">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
