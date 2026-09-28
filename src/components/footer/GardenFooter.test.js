import { render, screen } from '@testing-library/react';
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
