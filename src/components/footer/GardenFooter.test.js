import { render, screen, fireEvent, act } from '@testing-library/react';
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

const bandOf = (container) => container.querySelector('.gf-band');

test('mists droplets as the pointer moves across the garden', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    fireEvent.pointerEnter(band);
    fireEvent.pointerMove(band, { clientX: 200, clientY: 200 });
    expect(container.querySelectorAll('.gf-drop').length).toBeGreaterThan(0);
});

test('bursts a spray of droplets on click', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    fireEvent.pointerDown(band, { clientX: 200, clientY: 200 });
    expect(container.querySelectorAll('.gf-drop').length).toBeGreaterThanOrEqual(16);
});

// Review Focus 5 — a held or fast-dragged pointer must not grow the array
// without bound.
test('never exceeds the droplet cap however many bursts are fired', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    for (let i = 0; i < 40; i++) {
        fireEvent.pointerDown(band, { clientX: 100 + i, clientY: 150 });
    }
    expect(container.querySelectorAll('.gf-drop').length).toBeLessThanOrEqual(90);
});

// Review Focus 4 — the rAF loop holds a ref to the band; unmounting mid-flight
// must stop it rather than leave it spinning against a dead node.
test('cancels the droplet loop and clears droplets on unmount', () => {
    const cancel = jest.spyOn(window, 'cancelAnimationFrame');
    const { container, unmount } = renderGarden();
    fireEvent.pointerDown(bandOf(container), { clientX: 200, clientY: 200 });
    unmount();
    expect(cancel).toHaveBeenCalled();
    cancel.mockRestore();
});

const scaleOf = (plantEl) => Number(plantEl.style.getPropertyValue('--gf-scale'));

test('growing a plant raises its scale', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    const plants = [...container.querySelectorAll('.gf-plant')];
    const before = plants.map(scaleOf);
    fireEvent.pointerDown(band, pointerAtPlant());
    const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    expect(after.some((scale, i) => scale > before[i])).toBe(true);
});

test('shows the hint when the pointer is within reach of a plant', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    fireEvent.pointerEnter(band);
    fireEvent.pointerMove(band, pointerAtPlant());
    expect(container.querySelector('.gf-hint')).toHaveClass('is-on');
});

// Review Focus 3 — watering an already-maxed plant must pulse, not creep past
// the cap, however many times it happens.
test('caps growth and pulses the bloom instead once a plant is full', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    for (let i = 0; i < 30; i++) {
        fireEvent.pointerDown(band, pointerAtPlant());
    }
    for (const plant of container.querySelectorAll('.gf-plant')) {
        expect(scaleOf(plant)).toBeLessThanOrEqual(1.75);
    }
    expect(container.querySelector('.gf-head.is-blooming')).toBeInTheDocument();
});

test('does not shrink plants that are already at the cap', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    for (let i = 0; i < 30; i++) fireEvent.pointerDown(band, pointerAtPlant());
    const settled = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    fireEvent.pointerDown(band, pointerAtPlant());
    const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    expect(after).toEqual(settled);
});

// Review Focus 2 — clicking the contact link must be an ordinary click.
test('does not water or grow when the contact link is clicked', () => {
    const { container } = render(
        <GardenFooter heading="let's grow something">
            <a href="mailto:someone@example.com">here</a>
        </GardenFooter>
    );
    const link = screen.getByRole('link', { name: 'here' });
    const before = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    fireEvent.pointerDown(link, { clientX: 0, clientY: 0, bubbles: true });
    const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    expect(after).toEqual(before);
    expect(container.querySelectorAll('.gf-drop')).toHaveLength(0);
});

test('does not show the grow hint while over the contact link', () => {
    const { container } = render(
        <GardenFooter heading="let's grow something">
            <a href="mailto:someone@example.com">here</a>
        </GardenFooter>
    );
    const band = bandOf(container);
    fireEvent.pointerEnter(band);
    fireEvent.pointerMove(screen.getByRole('link', { name: 'here' }), {
        clientX: 0, clientY: 0, bubbles: true,
    });
    expect(container.querySelector('.gf-hint')).not.toHaveClass('is-on');
});

// Two fingers landing near-simultaneously on a phone can dispatch two
// pointerdown events in the same React batch, with no render in between.
// Growth must compound rather than the second event overwriting the first's
// result with a stale base.
test('compounds growth from two pointerDown events fired without a render between them', () => {
    const { container } = renderGarden();
    const band = bandOf(container);
    const before = scaleOf(container.querySelectorAll('.gf-plant')[0]);
    act(() => {
        fireEvent.pointerDown(band, pointerAtPlant());
        fireEvent.pointerDown(band, pointerAtPlant());
    });
    const after = scaleOf(container.querySelectorAll('.gf-plant')[0]);
    // Each step grows by at most 0.24 (GROWTH_DELTA_MAX) and at least 0.14
    // (GROWTH_DELTA_MIN); two compounded steps are always > 0.24, while a
    // clobbered second write would leave the total at a single step's size.
    expect(after - before).toBeGreaterThan(0.24);
});

// Overrides the setupTests polyfill, which answers false to everything.
const withMediaQuery = (matcher) => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({
        matches: matcher(query),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
    return () => { window.matchMedia = original; };
};

test('plants a smaller bed on touch devices', () => {
    const restore = withMediaQuery((q) => q.includes('coarse'));
    try {
        const { container } = renderGarden();
        expect(container.querySelectorAll('.gf-plant')).toHaveLength(12);
    } finally {
        restore();
    }
});

test('leaves out the watering can on touch devices', () => {
    const restore = withMediaQuery((q) => q.includes('coarse'));
    try {
        const { container } = renderGarden();
        expect(container.querySelector('.gf-can')).toBeNull();
        expect(container.querySelector('.gf-hint')).toBeNull();
    } finally {
        restore();
    }
});

test('still grows plants when tapped on a touch device', () => {
    const restore = withMediaQuery((q) => q.includes('coarse'));
    try {
        const { container } = renderGarden();
        const before = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
        fireEvent.pointerDown(bandOf(container), pointerAtPlant(0, 12));
        const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
        expect(after.some((scale, i) => scale > before[i])).toBe(true);
    } finally {
        restore();
    }
});

test('pins the heading open and skips the mist under reduced motion', () => {
    const restore = withMediaQuery((q) => q.includes('reduced-motion'));
    try {
        const { container } = renderGarden();
        expect(screen.getByText("let's grow something").style.getPropertyValue('--gf-grow')).toBe('1');
        fireEvent.pointerEnter(bandOf(container));
        fireEvent.pointerMove(bandOf(container), { clientX: 200, clientY: 200 });
        expect(container.querySelectorAll('.gf-drop')).toHaveLength(0);
    } finally {
        restore();
    }
});

test('still grows plants under reduced motion', () => {
    const restore = withMediaQuery((q) => q.includes('reduced-motion'));
    try {
        const { container } = renderGarden();
        const before = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
        fireEvent.pointerDown(bandOf(container), pointerAtPlant());
        const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
        expect(after.some((scale, i) => scale > before[i])).toBe(true);
    } finally {
        restore();
    }
});

test('parks the sway animations while the footer is off screen', () => {
    const originalIO = window.IntersectionObserver;
    const observers = [];
    window.IntersectionObserver = class {
        constructor(callback) { this.callback = callback; observers.push(this); }
        observe() {}
        disconnect() {}
    };
    try {
        const { container } = renderGarden();
        const band = bandOf(container);
        observers[0].callback([{ isIntersecting: false }]);
        expect(band).toHaveClass('gf-idle');
        observers[0].callback([{ isIntersecting: true }]);
        expect(band).not.toHaveClass('gf-idle');
    } finally {
        if (originalIO === undefined) {
            delete window.IntersectionObserver;
        } else {
            window.IntersectionObserver = originalIO;
        }
    }
});
