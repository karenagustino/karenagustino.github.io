import { ridgeY, ridgePath, ridgeDither, RIDGE_AMPLITUDE, RIDGE_BASE_FRACTION } from './gardenMath';

const BAND = 400;

test('ridgeY stays within one amplitude of the mean across the whole band', () => {
    const mean = BAND * RIDGE_BASE_FRACTION;
    for (let i = 0; i <= 100; i++) {
        const y = ridgeY(i / 100, BAND);
        expect(y).toBeGreaterThanOrEqual(mean - RIDGE_AMPLITUDE - 0.001);
        expect(y).toBeLessThanOrEqual(mean + RIDGE_AMPLITUDE + 0.001);
    }
});

test('ridgeY is continuous: neighbouring samples never jump', () => {
    let previous = ridgeY(0, BAND);
    for (let i = 1; i <= 100; i++) {
        const current = ridgeY(i / 100, BAND);
        expect(Math.abs(current - previous)).toBeLessThan(3);
        previous = current;
    }
});

test('ridgeY is deterministic', () => {
    expect(ridgeY(0.37, BAND)).toBe(ridgeY(0.37, BAND));
});

test('ridgeY clamps positions outside 0..1 instead of running off', () => {
    expect(ridgeY(-2, BAND)).toBe(ridgeY(0, BAND));
    expect(ridgeY(5, BAND)).toBe(ridgeY(1, BAND));
});

test('ridgeY returns a finite number for a zero-height band', () => {
    expect(Number.isFinite(ridgeY(0.5, 0))).toBe(true);
});

test('ridgePath is a closed path with one point per step plus the two base corners', () => {
    const d = ridgePath(1000, BAND, 8);
    expect(d.startsWith('M ')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    // 9 ridge samples (steps + 1) + 2 corners = 11 coordinate pairs
    expect(d.match(/\d+\.\d\d,/g)).toHaveLength(11);
});

test('ridgePath samples the same heights ridgeY reports', () => {
    const d = ridgePath(100, BAND, 4);
    expect(d).toContain(`0.00,${ridgeY(0, BAND).toFixed(2)}`);
    expect(d).toContain(`100.00,${ridgeY(1, BAND).toFixed(2)}`);
});

test('ridgeDither snaps every cell to the pixel grid', () => {
    for (const c of ridgeDither(400, BAND, 4)) {
        expect(c.w).toBe(4);
        expect(c.h).toBe(4);
        expect(c.x % 4).toBe(0);
        expect(c.y % 4).toBe(0);
    }
});

test('ridgeDither follows the ridge, one covering cell per column', () => {
    const cells = ridgeDither(400, BAND, 4);
    for (let col = 0; col < 400 / 4; col++) {
        const x = col * 4;
        const snapped = Math.floor(ridgeY((x + 2) / 400, BAND) / 4) * 4;
        const inColumn = cells.filter((c) => c.x === x);
        expect(inColumn.map((c) => c.y)).toContain(snapped);
    }
});

test('ridgeDither doubles up on alternate columns so the edge reads as a dither', () => {
    const cells = ridgeDither(400, BAND, 4);
    const countAt = (x) => cells.filter((c) => c.x === x).length;
    expect(countAt(0)).toBe(2);
    expect(countAt(4)).toBe(1);
    expect(countAt(8)).toBe(2);
});

import {
    clumpAnchors, nearestStemPoint, withinReach, cappedGrowth, stepDroplet,
    GROW_REACH, MAX_PLANT_SCALE, ANCHOR_MIN_PCT, ANCHOR_MAX_PCT,
} from './gardenMath';

// A deterministic stand-in for the seeded RNG, so anchor tests don't depend on
// the generator's internals.
const sequenceRng = (values) => {
    let i = 0;
    return () => values[i++ % values.length];
};

const plantAt = (overrides = {}) => ({
    xPx: 500, baseY: 300, fullHeight: 100, scale: 1, ...overrides,
});

test('clumpAnchors returns the requested number of anchors', () => {
    expect(clumpAnchors(20, 5, sequenceRng([0.5]))).toHaveLength(20);
});

test('clumpAnchors keeps every anchor inside the visible band', () => {
    const rng = sequenceRng([0, 0.25, 0.5, 0.75, 1]);
    for (const anchor of clumpAnchors(40, 5, rng)) {
        expect(anchor).toBeGreaterThanOrEqual(ANCHOR_MIN_PCT);
        expect(anchor).toBeLessThanOrEqual(ANCHOR_MAX_PCT);
    }
});

test('clumpAnchors bunches plants rather than spreading them evenly', () => {
    // With a mid-range rng the clump centres are evenly spaced, so anchors
    // should repeat those centres rather than march across in even steps.
    const anchors = clumpAnchors(10, 5, sequenceRng([0.5]));
    expect(anchors[0]).toBeCloseTo(anchors[5], 5);
});

test('nearestStemPoint clamps to the stem base when the pointer is below it', () => {
    expect(nearestStemPoint({ x: 500, y: 9999 }, plantAt()).y).toBe(300);
});

test('nearestStemPoint clamps to the stem tip when the pointer is above it', () => {
    // baseY 300, fullHeight 100, scale 1 -> tip at 200, minus the 8px of slack
    expect(nearestStemPoint({ x: 500, y: -9999 }, plantAt()).y).toBe(192);
});

test('withinReach is true just inside the radius and false just outside', () => {
    const plant = plantAt();
    expect(withinReach({ x: 500 + GROW_REACH - 1, y: 300 }, plant)).toBe(true);
    expect(withinReach({ x: 500 + GROW_REACH + 1, y: 300 }, plant)).toBe(false);
});

test('cappedGrowth grows a short plant by the full delta', () => {
    expect(cappedGrowth(plantAt({ scale: 0.6 }), 0.2, -Infinity)).toBeCloseTo(0.8);
});

test('cappedGrowth never lets a plant top breach the ceiling', () => {
    const plant = plantAt({ scale: 0.9 });
    const ceilingY = 200;
    const scale = cappedGrowth(plant, 0.9, ceilingY);
    expect(plant.baseY - plant.fullHeight * scale).toBeGreaterThanOrEqual(ceilingY);
});

test('cappedGrowth never exceeds MAX_PLANT_SCALE even with headroom', () => {
    expect(cappedGrowth(plantAt({ scale: 1.7 }), 5, -Infinity)).toBe(MAX_PLANT_SCALE);
});

test('cappedGrowth returns the current scale unchanged once capped', () => {
    const plant = plantAt({ scale: MAX_PLANT_SCALE });
    expect(cappedGrowth(plant, 0.2, -Infinity)).toBe(MAX_PLANT_SCALE);
});

test('cappedGrowth never shrinks a plant that is already past a tight ceiling', () => {
    const plant = plantAt({ scale: 1.5 });
    // ceiling sits below the plant's current tip: headroom is smaller than scale
    expect(cappedGrowth(plant, 0.2, 280)).toBe(1.5);
});

test('stepDroplet accelerates downward while it is in the air', () => {
    const drop = { x: 10, y: 0, y0: 0, vx: 1, vy: 0, alpha: 1, dead: false };
    stepDroplet(drop, 0.42, () => 1000);
    expect(drop.vy).toBeCloseTo(0.42);
    expect(drop.y).toBeCloseTo(0.42);
    expect(drop.x).toBeCloseTo(11);
    expect(drop.dead).toBe(false);
});

test('stepDroplet settles a droplet onto the ridge and fades it there', () => {
    const drop = { x: 10, y: 99, y0: 99, vx: 1, vy: 5, alpha: 1, dead: false };
    stepDroplet(drop, 0.42, () => 100);
    expect(drop.y).toBe(100);
    expect(drop.alpha).toBeLessThan(1);
});

test('stepDroplet reports dead once it has fully faded', () => {
    const drop = { x: 10, y: 200, y0: 200, vx: 0, vy: 0, alpha: 0.1, dead: false };
    stepDroplet(drop, 0.42, () => 100);
    expect(drop.dead).toBe(true);
});

// Review Focus — a click in the soil itself (roughly the bottom 22% of the
// band) spawns a droplet BELOW the ridge. Treating `ridgeYAtX` as the only
// floor would snap it up to the ridge line, rendering the burst well above
// where the cursor actually was.
test('stepDroplet born below the ridge splashes at its own position, not the ridge', () => {
    const drop = { x: 10, y: 400, y0: 400, vx: 1, vy: 0, alpha: 1, dead: false };
    stepDroplet(drop, 0.42, () => 359);
    expect(drop.y).toBe(400);
    expect(drop.alpha).toBeLessThan(1);
});
