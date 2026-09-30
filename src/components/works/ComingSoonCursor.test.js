import { fireEvent, render } from '@testing-library/react';
import ComingSoonCursor from './ComingSoonCursor';

test('renders nothing while inactive', () => {
    const { container } = render(<ComingSoonCursor active={false} />);
    expect(container.querySelector('.coming-soon-cursor')).toBeNull();
});

test('shows the padlock and its label once active', () => {
    const { container, getByText } = render(<ComingSoonCursor active />);
    expect(container.querySelector('.coming-soon-cursor svg rect')).toBeInTheDocument();
    expect(getByText('COMING SOON')).toBeInTheDocument();
});

test('is hidden from assistive technology', () => {
    const { container } = render(<ComingSoonCursor active />);
    expect(container.querySelector('.coming-soon-cursor')).toHaveAttribute('aria-hidden', 'true');
});

test('follows the pointer', () => {
    const { container } = render(<ComingSoonCursor active />);
    fireEvent.pointerMove(window, { clientX: 300, clientY: 220 });
    const style = container.querySelector('.coming-soon-cursor').style.transform;
    expect(style).toContain('translate(');
    expect(style).not.toContain('NaN');
});

test('stops listening once it goes inactive', () => {
    const remove = jest.spyOn(window, 'removeEventListener');
    const { rerender } = render(<ComingSoonCursor active />);
    rerender(<ComingSoonCursor active={false} />);
    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function));
    remove.mockRestore();
});

// The sprite is drawn from a string-art grid; a ragged row would silently shift
// the padlock's shape.
test('every row of the sprite grid is the same width', () => {
    const { container } = render(<ComingSoonCursor active />);
    const svg = container.querySelector('.coming-soon-cursor svg');
    const [width, height] = svg.getAttribute('viewBox').split(' ').slice(2).map(Number);
    container.querySelectorAll('.coming-soon-cursor svg rect').forEach((rect) => {
        expect(Number(rect.getAttribute('x'))).toBeLessThan(width);
        expect(Number(rect.getAttribute('y'))).toBeLessThan(height);
    });
});
