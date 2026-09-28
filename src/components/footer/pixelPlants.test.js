import {
    mulberry32, buildDaisy, buildLavender, buildSprout, buildPlant, CELL, PALETTE, buildBed, GARDEN_SEED,
} from './pixelPlants';
import { ANCHOR_MIN_PCT, ANCHOR_MAX_PCT } from './gardenMath';

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

test('buildBed returns the requested number of plants', () => {
    expect(buildBed(20)).toHaveLength(20);
});

test('buildBed is deterministic, so the garden is the same on every visit', () => {
    expect(buildBed(20)).toEqual(buildBed(20));
    expect(buildBed(20, GARDEN_SEED)).toEqual(buildBed(20));
});

test('buildBed gives a different arrangement for a different seed', () => {
    expect(buildBed(20, 1)).not.toEqual(buildBed(20, 2));
});

test('buildBed gives every plant a unique id', () => {
    const ids = buildBed(20).map((p) => p.id);
    expect(new Set(ids).size).toBe(20);
});

test('buildBed keeps every plant on screen', () => {
    for (const plant of buildBed(20)) {
        expect(plant.xPct).toBeGreaterThanOrEqual(ANCHOR_MIN_PCT);
        expect(plant.xPct).toBeLessThanOrEqual(ANCHOR_MAX_PCT);
    }
});

test('buildBed sinks every plant into the soil rather than resting it on top', () => {
    for (const plant of buildBed(20)) {
        expect(plant.sink).toBeGreaterThanOrEqual(2);
        expect(plant.sink).toBeLessThanOrEqual(6);
    }
});

test('buildBed starts plants below full height so there is room to grow', () => {
    for (const plant of buildBed(20)) {
        expect(plant.startScale).toBeGreaterThanOrEqual(0.55);
        expect(plant.startScale).toBeLessThanOrEqual(0.95);
    }
});

test('buildBed gives each plant its own sway so the bed does not move as one', () => {
    const periods = new Set(buildBed(20).map((p) => p.swayPeriod));
    expect(periods.size).toBeGreaterThan(1);
});

test('buildBed produces no NaN in any numeric field', () => {
    for (const plant of buildBed(20)) {
        for (const key of ['xPct', 'width', 'height', 'sink', 'startScale']) {
            expect(Number.isFinite(plant[key])).toBe(true);
        }
    }
});
