// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

if (typeof window.PointerEvent === 'undefined') {
    class PointerEvent extends MouseEvent {
        constructor(type, params = {}) {
            super(type, params);
            this.pointerId = params.pointerId ?? 0;
            this.pointerType = params.pointerType ?? '';
            this.width = params.width ?? 1;
            this.height = params.height ?? 1;
            this.isPrimary = params.isPrimary ?? true;
        }
    }
    window.PointerEvent = PointerEvent;
}
