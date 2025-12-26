/**
 * Theme Toggle Component
 * 
 * Renders a button to toggle between dark and light themes.
 * Shows moon icon (🌙) for dark mode, sun icon (☀️) for light mode.
 * 
 * Requirements:
 * - Visible in navbar
 * - ≤150ms fade transition
 * - Persists preference via useTheme hook
 * 
 * Security: None (client-side UI only)
 */

import { useTheme } from '@/hooks/useTheme';
import './ThemeToggle.css';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <span className="theme-toggle-icon" aria-hidden="true">
                {theme === 'light' ? '🌙' : '☀️'}
            </span>
        </button>
    );
}
