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
