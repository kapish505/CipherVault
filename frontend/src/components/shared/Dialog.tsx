import React, { useEffect, useRef, useState } from 'react';
import './Dialog.css';

interface DialogProps {
    isOpen: boolean;
    title: string;
    description?: string;
    variant: 'prompt' | 'alert' | 'confirm';
    placeholder?: string;
    defaultValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

export function Dialog({
    isOpen,
    title,
    description,
    variant,
    placeholder = '',
    defaultValue = '',
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel
}: DialogProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue);
            // Focus input on mount if prompt
            if (variant === 'prompt') {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    }, [isOpen, defaultValue, variant]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (variant === 'prompt') {
            onConfirm(inputValue);
        } else {
            onConfirm();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="dialog-overlay" onMouseDown={onCancel}>
            <div
                className="dialog-container"
                onMouseDown={e => e.stopPropagation()}
            >
                <h3 className="dialog-title">{title}</h3>

                {description && (
                    <p className="dialog-description">{description}</p>
                )}

                {variant === 'prompt' && (
                    <input
                        ref={inputRef}
                        type="text"
                        className="dialog-input"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                )}

                <div className="dialog-actions">
                    {variant !== 'alert' && (
                        <button
                            className="dialog-btn dialog-btn-secondary"
                            onClick={onCancel}
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        className="dialog-btn dialog-btn-primary"
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
