import './ClassificationSelector.css';

interface ClassificationSelectorProps {
    value: 'public' | 'private' | 'confidential';
    onChange: (value: 'public' | 'private' | 'confidential') => void;
}

export function ClassificationSelector({ value, onChange }: ClassificationSelectorProps) {
    // We use unique IDs to prevent conflicts if multiple instances existed, though only 1 is used now
    return (
        <div className="glass-radio-group">
            <input
                type="radio"
                id="glass-public"
                name="classification-selector"
                checked={value === 'public'}
                onChange={() => onChange('public')}
            />
            <label htmlFor="glass-public">Public</label>

            <input
                type="radio"
                id="glass-private"
                name="classification-selector"
                checked={value === 'private'}
                onChange={() => onChange('private')}
            />
            <label htmlFor="glass-private">Private</label>

            <input
                type="radio"
                id="glass-confidential"
                name="classification-selector"
                checked={value === 'confidential'}
                onChange={() => onChange('confidential')}
            />
            <label htmlFor="glass-confidential">Highly Confidential</label>

            <div className="glass-glider"></div>
        </div>
    );
}
