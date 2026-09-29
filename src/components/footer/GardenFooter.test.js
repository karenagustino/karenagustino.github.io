import { render, screen, fireEvent } from '@testing-library/react';
import GardenFooter, { FALLBACK_WIDTH, FALLBACK_HEIGHT } from './GardenFooter';
import { buildBed } from './pixelPlants';
import { ridgeY } from './gardenMath';

const renderGarden = () =>
    render(
        <GardenFooter heading="let's grow something">
            <p>thank you for making it this far</p>
        </GardenFooter>
    );

// jsdom has no layout, so the component falls back to a nominal band and roots
// its plants against THAT — not at the origin. Firing pointer events at (0, 0)
// would therefore be ~240px from the nearest stem, outside the 80px reach.
// Compute a coordinate that genuinely lands on a plant instead: the bed is
// seeded, so this is exact and stable.
const pointerAtPlant = (index = 0, count = 20) => {
    const plant = buildBed(count)[index];
    return {
        clientX: (plant.xPct / 100) * FALLBACK_WIDTH,
        clientY: ridgeY(plant.xPct / 100, FALLBACK_HEIGHT) + plant.sink - 10,
    };
};

test('renders the heading and its children', () => {
    renderGarden();
    expect(screen.getByText("let's grow something")).toBeInTheDocument();
    expect(screen.getByText('thank you for making it this far')).toBeInTheDocument();
});

test('plants a full bed', () => {
    const { container } = renderGarden();
    expect(container.querySelectorAll('.gf-plant')).toHaveLength(20);
});

test('draws the soil from the ridge function', () => {
    const { container } = renderGarden();
    const path = container.querySelector('.gf-soil path');
    expect(path).toBeInTheDocument();
    expect(path.getAttribute('d')).toMatch(/^M [\d.]+,[\d.]+/);
});

test('hides the garden decoration from assistive technology', () => {
    const { container } = renderGarden();
    for (const selector of ['.gf-soil', '.gf-bed', '.gf-fx']) {
        expect(container.querySelector(selector)).toHaveAttribute('aria-hidden', 'true');
    }
});

// Review Focus 1 — jsdom reports every element as 0x0, which is also what a
// display:none footer or a pre-layout first paint looks like. Nothing may come
// out as NaN.
test('produces no NaN styles when the band measures zero', () => {
    const { container } = renderGarden();
    expect(container.innerHTML).not.toContain('NaN');
    for (const plant of container.querySelectorAll('.gf-plant')) {
        expect(plant.getAttribute('style')).not.toContain('NaN');
    }
});

test('gives every plant a head group that can pulse on its own', () => {
    const { container } = renderGarden();
    const plants = container.querySelectorAll('.gf-plant');
    for (const plant of plants) {
        expect(plant.querySelector('.gf-head')).toBeInTheDocument();
    }
});

test('drives the heading scale from scroll position', () => {
    renderGarden();
    const heading = screen.getByText("let's grow something");
    // jsdom reports a zero-height rect, which puts the heading's centre at the
    // very top of the viewport — i.e. fully past the scrub's end point.
    expect(heading.style.getPropertyValue('--gf-grow')).toBe('1.0000');
});

test('keeps updating the heading as the page scrolls', () => {
    renderGarden();
    const heading = screen.getByText("let's grow something");
    heading.style.setProperty('--gf-grow', '0');
    fireEvent.scroll(window);
    expect(heading.style.getPropertyValue('--gf-grow')).toBe('1.0000');
});

test('stops listening to scroll once unmounted', () => {
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderGarden();
    unmount();
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    remove.mockRestore();
});

test('shows the watering can only while the pointer is over the garden', () => {
    const { container } = renderGarden();
    const band = container.querySelector('.gf-band');
    const can = container.querySelector('.gf-can');
    expect(can).toBeInTheDocument();
    expect(can).not.toHaveClass('is-on');

    fireEvent.pointerEnter(band);
    expect(can).toHaveClass('is-on');
    expect(band).toHaveClass('is-live');

    fireEvent.pointerLeave(band);
    expect(can).not.toHaveClass('is-on');
    expect(band).not.toHaveClass('is-live');
});

test('moves the can to follow the pointer', () => {
    const { container } = renderGarden();
    const band = container.querySelector('.gf-band');
    const can = container.querySelector('.gf-can');
    fireEvent.pointerEnter(band);
    fireEvent.pointerMove(band, { clientX: 300, clientY: 220 });
    expect(can.style.transform).toContain('translate(');
    expect(can.style.transform).not.toContain('NaN');
});

test('keeps the can and hint out of assistive technology', () => {
    const { container } = renderGarden();
    expect(container.querySelector('.gf-can')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.gf-hint')).toHaveAttribute('aria-hidden', 'true');
});

test('keeps the can outside the heading so its fixed position tracks the viewport', () => {
    const { container } = renderGarden();
    // A transformed ancestor becomes the containing block for position:fixed,
    // and the heading is scaled — so the can must not live inside it.
    expect(container.querySelector('.gf-heading .gf-can')).toBeNull();
    expect(container.querySelector('.gf-footer > .gf-can')).toBeInTheDocument();
});
