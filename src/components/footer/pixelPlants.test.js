import {
    mulberry32, buildDaisy, buildLavender, buildSprout, buildPlant, CELL, PALETTE,
} from './pixelPlants';

const builders = [
    ['daisy', buildDaisy],
    ['lavender', buildLavender],
    ['sprout', buildSprout],
];

test('mulberry32 produces the same sequence for the same seed', () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});

test('mulberry32 produces a different sequence for a different seed', () => {
    expect(mulberry32(1)()).not.toEqual(mulberry32(2)());
});

test('mulberry32 stays inside [0, 1)', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 500; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
    }
});

describe.each(builders)('%s', (name, build) => {
    test('is deterministic for a given seed', () => {
        expect(build(mulberry32(7))).toEqual(build(mulberry32(7)));
    });

    test('keeps every cell inside its declared sprite box', () => {
        for (let seed = 0; seed < 25; seed++) {
            const { cells, width, height } = build(mulberry32(seed));
            for (const c of cells) {
                expect(c.x).toBeGreaterThanOrEqual(0);
                expect(c.y).toBeGreaterThanOrEqual(0);
                expect(c.x + c.w).toBeLessThanOrEqual(width);
                expect(c.y + c.h).toBeLessThanOrEqual(height);
            }
        }
    });

    test('snaps every cell to the pixel grid', () => {
        const { cells } = build(mulberry32(3));
        for (const c of cells) {
            expect(c.x % CELL).toBe(0);
            expect(c.y % CELL).toBe(0);
            expect(c.w).toBe(CELL);
            expect(c.h).toBe(CELL);
        }
    });

    test('has both a stem and a head so the bloom can pulse independently', () => {
        const { cells } = build(mulberry32(11));
        expect(cells.some((c) => c.part === 'stem')).toBe(true);
        expect(cells.some((c) => c.part === 'head')).toBe(true);
    });

    test('paints only colours from the project palette', () => {
        const allowed = Object.values(PALETTE);
        for (const c of build(mulberry32(5)).cells) {
            expect(allowed).toContain(c.fill);
        }
    });
});

test('buildPlant produces all three kinds across a run of seeds', () => {
    const kinds = new Set();
    for (let seed = 0; seed < 60; seed++) kinds.add(buildPlant(mulberry32(seed)).kind);
    expect(kinds).toEqual(new Set(['daisy', 'lavender', 'sprout']));
});
