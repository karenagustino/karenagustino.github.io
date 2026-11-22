import { render } from '@testing-library/react';
import Resume from './Resume';

// jsdom does no layout, so give the receipt and printer the heights the scroll
// logic reads. Everything else stays at zero.
const HEIGHTS = { 'resume-receipt': 1000, 'resume-printer': 100 };
let restoreOffsetHeight;

beforeAll(() => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get() {
            const match = Object.keys(HEIGHTS).find((name) => this.classList.contains(name));
            return match ? HEIGHTS[match] : 0;
        },
    });
    restoreOffsetHeight = () => Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original);
});

afterAll(() => restoreOffsetHeight());

// Moving the printer from a scroll handler always lands a frame after the page
// has scrolled, so on a fast scroll it visibly slides and snaps back. The
// browser has to hold it in place instead, with position: sticky.
test('the printer is pinned by the browser, not moved from script', () => {
    const { container } = render(<Resume />);
    const stage = container.querySelector('.resume-stage');
    const room = container.querySelector('.resume-pin-room');

    expect(stage.style.transform).toBe('');
    expect(stage.style.top).toMatch(/^\d+(\.\d+)?px$/);
    // Room to stay pinned for: 70% of the receipt's height.
    expect(room.style.height).toBe('700px');
});

test('a couple of garden flowers sit on top of the printer', () => {
    const { container } = render(<Resume />);
    const flowers = container.querySelectorAll('.resume-printer-flowers svg');
    expect(flowers.length).toBeGreaterThanOrEqual(1);
    expect(flowers.length).toBeLessThanOrEqual(2);
    expect(container.querySelector('.resume-printer-flowers')).toHaveAttribute('aria-hidden', 'true');
});
