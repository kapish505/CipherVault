/**
 * Theme Hook
 * 
 * Custom React hook for managing dark/light theme.
 * 
 * Features:
 * - Persists theme preference to localStorage
 * - Respects system preference on first visit
 * - Provides toggle function
 * - Updates document data-theme attribute
 * 
 * Security: None (client-side UI only)
 */

import { useState, useEffect } from 'react';
import type { Theme } from '@/types';

const STORAGE_KEY = 'ciphervault-theme';

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    // Apply theme on mount and when it changes
    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if user hasn't set a preference
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
}
