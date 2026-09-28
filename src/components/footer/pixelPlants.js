// Pixel-art plant sprites, generated rather than drawn as image assets. Each
// builder lays cells out on a fixed grid and returns them as data; the
// component turns them into <rect>s. Generating them means no two plants in the
// bed are the same height, bend or colour, and it keeps the bloom pulse able to
// animate a flower head on its own — which a flat PNG could not.

/** Size of one art pixel, in CSS px. */
export const CELL = 4;

// Sampled from this project's own artwork: the greens are the dominant colours
// in leaf-pixel.png, the soil is patch.png's fill, and the rest are existing
// theme tokens from index.css.
export const PALETTE = {
    leafDeep: '#014734',
    leafMid: '#1A6F5D',
    leafBright: '#22C55E',
    leafShadow: '#00402D',
    soil: '#B2875F',
    petal: '#FFFDF7',
    petalEdge: '#E7DFC9',
    centre: '#C46A13',
    sage: '#B6BFA6',
    lavender: '#8F7BC0',
    lavenderDeep: '#6E5A9E',
};

/**
 * Small, fast, seedable PRNG. Math.random() can't be seeded, and the bed has to
 * be reproducible: identical in tests, and stable across re-renders so the
 * garden doesn't reshuffle itself every time React repaints.
 */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const cell = (col, row, fill, part) => ({
    x: col * CELL, y: row * CELL, w: CELL, h: CELL, fill, part,
});

const sprite = (cells, colCount, rowCount) => ({
    cells, width: colCount * CELL, height: rowCount * CELL,
});

/** Cream-petalled flower with an orange centre, on a bending stem. */
export function buildDaisy(rng) {
    const rows = 14 + Math.floor(rng() * 7);
    const cells = [];
    const stemCol = 5;
    const bendRow = Math.floor(rows * 0.5);
    const bendDir = rng() < 0.5 ? -1 : 1;
    const stemColour = rng() < 0.5 ? PALETTE.leafMid : PALETTE.leafDeep;

    // The stem steps one column sideways halfway up, so no two plants read as
    // the same ruler-straight line.
    for (let row = 4; row < rows; row++) {
        cells.push(cell(stemCol + (row < bendRow ? bendDir : 0), row, stemColour, 'stem'));
    }

    const leafRow = bendRow + 1;
    cells.push(cell(stemCol - 1, leafRow, PALETTE.leafBright, 'stem'));
    cells.push(cell(stemCol - 2, leafRow, PALETTE.leafDeep, 'stem'));
    cells.push(cell(stemCol + 1, leafRow + 2, PALETTE.leafBright, 'stem'));
    cells.push(cell(stemCol + 2, leafRow + 2, PALETTE.leafDeep, 'stem'));

    // A 5x5 blossom: outer petal ring, inner ring, single centre pixel.
    const petal = rng() < 0.5 ? PALETTE.petal : PALETTE.sage;
    const headRow = 2;
    [[0, -2], [0, 2], [-2, 0], [2, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(
        ([dx, dy]) => cells.push(cell(stemCol + dx, headRow + dy, petal, 'head'))
    );
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) =>
        cells.push(cell(stemCol + dx, headRow + dy, PALETTE.petalEdge, 'head'))
    );
    cells.push(cell(stemCol, headRow, PALETTE.centre, 'head'));

    return sprite(cells, 11, rows);
}

/** Purple floret spike tapering to a point, on a green stem. */
export function buildLavender(rng) {
    const rows = 13 + Math.floor(rng() * 6);
    const cells = [];
    const stemCol = 4;
    const green = rng() < 0.5 ? PALETTE.leafMid : PALETTE.leafDeep;
    const spikeBottom = Math.floor(rows * 0.45);

    for (let row = spikeBottom; row < rows; row++) {
        cells.push(cell(stemCol, row, green, 'stem'));
    }
    cells.push(cell(stemCol - 1, rows - 3, PALETTE.leafBright, 'stem'));
    cells.push(cell(stemCol + 1, rows - 4, PALETTE.leafBright, 'stem'));

    for (let row = 1; row < spikeBottom; row++) {
        const t = (row - 1) / Math.max(1, spikeBottom - 2);
        const halfWidth = t < 0.35 ? 0 : 1;
        for (let dx = -halfWidth; dx <= halfWidth; dx++) {
            const shade = rng() < 0.5 ? PALETTE.lavender : PALETTE.lavenderDeep;
            cells.push(cell(stemCol + dx, row, shade, 'head'));
        }
    }

    return sprite(cells, 9, rows);
}

/** Low fan of leaves — the ground cover between the taller plants. */
export function buildSprout(rng) {
    const rows = 6 + Math.floor(rng() * 4);
    const cells = [];
    const midCol = 4;
    const spread = 2 + Math.floor(rng() * 2);

    for (let row = rows - 2; row < rows; row++) {
        cells.push(cell(midCol, row, PALETTE.leafDeep, 'stem'));
    }
    for (let i = -spread; i <= spread; i++) {
        const top = rows - 3 - (spread - Math.abs(i));
        for (let row = top; row < rows - 2; row++) {
            const shade = i % 2 === 0 ? PALETTE.leafMid : PALETTE.leafDeep;
            cells.push(cell(midCol + i, row, shade, 'head'));
        }
    }

    return sprite(cells, 9, rows);
}

/** Weighted pick across the three kinds, matching the reference bed's mix. */
export function buildPlant(rng) {
    const roll = rng();
    if (roll < 0.5) return { kind: 'daisy', ...buildDaisy(rng) };
    if (roll < 0.78) return { kind: 'lavender', ...buildLavender(rng) };
    return { kind: 'sprout', ...buildSprout(rng) };
}
