import React from 'react';
import useTheme from '../hooks/useTheme';
import './ThemeToggle.css';

const SunIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D9741E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4.5" />
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="4.2" y1="4.2" x2="5.9" y2="5.9" />
        <line x1="18.1" y1="18.1" x2="19.8" y2="19.8" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.2" y1="19.8" x2="5.9" y2="18.1" />
        <line x1="18.1" y1="5.9" x2="19.8" y2="4.2" />
    </svg>
);

const MoonIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354Z" />
    </svg>
);

const ThemeToggle = () => {
    const [theme, toggleTheme] = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? <MoonIcon /> : <SunIcon />}
        </button>
    );
};

export default ThemeToggle;
