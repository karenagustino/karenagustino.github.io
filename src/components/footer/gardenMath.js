// Geometry and physics for the footer garden. Everything here is pure and
// DOM-free so it can be unit-tested, the way coverflowMath.js is for the works
// carousel.
//
// The soil is defined as a FUNCTION of horizontal position rather than sampled
// out of a painted terrain image (which is how the reference footer this is
// modelled on finds its ground). The drawn soil path is generated from the same
// function the plants root against, so the artwork and the rooting geometry
// cannot drift apart — and none of it depends on an image having decoded.

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** Peak deviation of the soil surface from its mean, in px. */
export const RIDGE_AMPLITUDE = 10;

/** Mean soil height, as a fraction of the band's height from its top. */
export const RIDGE_BASE_FRACTION = 0.78;

// Two out-of-sync periods rather than one. A single sine reads as a machine
// wave; compounding two whose frequencies aren't multiples of each other gives
// the ridge an irregular roll that never visibly repeats across the band. The
// weights sum to 1, so the result stays inside ±RIDGE_AMPLITUDE exactly.
export function ridgeY(xFrac, bandHeight) {
    const x = clamp(xFrac, 0, 1);
    const wobble =
        Math.sin(x * Math.PI * 2 * 1.7) * 0.62 +
        Math.sin(x * Math.PI * 2 * 3.1 + 1.3) * 0.38;
    return bandHeight * RIDGE_BASE_FRACTION + wobble * RIDGE_AMPLITUDE;
}

/**
 * The soil as an SVG path: the ridge line across the top, closed down to the
 * band's bottom corners.
 */
export function ridgePath(bandWidth, bandHeight, steps = 48) {
    const top = [];
    for (let i = 0; i <= steps; i++) {
        const xFrac = i / steps;
        top.push(
            `${(xFrac * bandWidth).toFixed(2)},${ridgeY(xFrac, bandHeight).toFixed(2)}`
        );
    }
    return `M ${top.join(' L ')} L ${bandWidth.toFixed(2)},${bandHeight.toFixed(2)} L ${(0).toFixed(2)},${bandHeight.toFixed(2)} Z`;
}

/**
 * A dithered rim along the top of the soil, as grid-snapped cells.
 *
 * A plain stroke along the ridge would antialias into a soft grey line and
 * undo the pixel look the rest of the garden is built on. Instead every column
 * gets one cell sitting on the surface, and alternate columns get a second one
 * below it — the classic 50% dither, so the soil's edge reads as pixel art
 * rather than as a vector outline.
 */
export function ridgeDither(bandWidth, bandHeight, cell) {
    const cells = [];
    const columns = Math.ceil(bandWidth / cell);
    for (let col = 0; col < columns; col++) {
        const x = col * cell;
        // Sample at the column's centre so the cell represents the ground it
        // actually covers, not the ground at its left edge.
        const surface = ridgeY((x + cell / 2) / bandWidth, bandHeight);
        const snapped = Math.floor(surface / cell) * cell;
        cells.push({ x, y: snapped, w: cell, h: cell });
        if (col % 2 === 0) cells.push({ x, y: snapped + cell, w: cell, h: cell });
    }
    return cells;
}
