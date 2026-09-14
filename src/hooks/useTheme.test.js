import { act, renderHook } from '@testing-library/react';
import useTheme from './useTheme';

function mockMatchMedia(matches) {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches,
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }));
}

beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
});

test('defaults to light when nothing stored and system prefers light', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});

test('defaults to dark when nothing stored and system prefers dark', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});

test('a previously stored theme wins over system preference', () => {
    window.localStorage.setItem('theme', 'dark');
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe('dark');
});

test('toggleTheme flips the theme, updates the DOM attribute, and persists it', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => {
        result.current[1]();
    });

    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');

    act(() => {
        result.current[1]();
    });

    expect(result.current[0]).toBe('light');
    expect(window.localStorage.getItem('theme')).toBe('light');
});
