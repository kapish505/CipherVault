import './UploadButton3D.css';

interface UploadButton3DProps {
    label: string;
    onClick: () => void;
    icon?: string;
    variant?: 'blue' | 'purple' | 'green';
}

export function UploadButton3D({ label, onClick, icon = '📄', variant = 'blue' }: UploadButton3DProps) {
    // Dynamic styling for variants if needed, for now using CSS variables or classes could enhance this
    const containerStyle = variant === 'green' ? {
        '--color-folder-main': '#10b981',
        '--color-folder-dark': '#059669',
        '--color-folder-light': '#34d399',
    } as React.CSSProperties : {};

    return (
        <div className="upload-3d-container" onClick={onClick} style={containerStyle}>
            <div className="upload-3d-folder">
                <div className="front-side">
                    <div className="tip"></div>
                    <div className="cover"></div>
                </div>
                <div className="back-side"></div>
            </div>
            <button className="upload-3d-btn" type="button">
                {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
                {label}
            </button>
        </div>
    );
}
