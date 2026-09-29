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

/** Click/hover radius around a stem, in px. Shared by the hint and the click,
 *  so the "click to grow" label only ever promises what a click delivers. */
export const GROW_REACH = 80;

/** A plant may never grow past this, ceiling or no ceiling. */
export const MAX_PLANT_SCALE = 1.75;

export const DROPLET_GRAVITY = 0.42;

// Anchors are percentages of the band width; these margins keep a plant's
// sprite from being clipped by the band's edge.
export const ANCHOR_MIN_PCT = 2;
export const ANCHOR_MAX_PCT = 98;

/**
 * Horizontal positions for a bed of plants, in percent. Plants are bunched
 * around a handful of clump centres rather than scattered uniformly — an even
 * spread reads as a planted row, whereas clumps read as something that seeded
 * itself.
 */
export function clumpAnchors(count, clumpCount, rng) {
    const centers = [];
    for (let c = 0; c < clumpCount; c++) {
        centers.push(clamp(((c + 0.5) / clumpCount) * 100 + (rng() * 10 - 5), 7, 93));
    }
    const anchors = [];
    for (let i = 0; i < count; i++) {
        anchors.push(
            clamp(centers[i % clumpCount] + (rng() * 12 - 6), ANCHOR_MIN_PCT, ANCHOR_MAX_PCT)
        );
    }
    return anchors;
}

/**
 * The point on a plant's stem closest to the pointer. Measuring to the stem
 * rather than to the plant's base means a tall plant is reachable along its
 * whole height, not only down at the soil.
 */
export function nearestStemPoint(pointer, plant) {
    const tipY = plant.baseY - plant.fullHeight * plant.scale - 8;
    return { x: plant.xPx, y: clamp(pointer.y, Math.min(tipY, plant.baseY), plant.baseY) };
}

export function withinReach(pointer, plant, reach = GROW_REACH) {
    const point = nearestStemPoint(pointer, plant);
    return Math.hypot(pointer.x - point.x, pointer.y - point.y) < reach;
}

/**
 * The growth ceiling. Plants stop just under the footer's text block instead of
 * climbing over it, so watering can never make the copy unreadable.
 *
 * Returns the CURRENT scale unchanged when the plant is already capped — the
 * caller reads that as "pulse the bloom instead of growing".
 */
export function cappedGrowth(plant, delta, ceilingY) {
    const maxScale = plant.maxScale ?? MAX_PLANT_SCALE;
    const headroom = Number.isFinite(ceilingY)
        ? (plant.baseY - ceilingY) / plant.fullHeight
        : Infinity;
    const cap = Math.min(maxScale, headroom);
    if (plant.scale >= cap) return plant.scale;
    return Math.min(cap, plant.scale + delta);
}

/**
 * One integration step for a water droplet. Mutates `drop` in place: these run
 * ~90 at a time every frame, and allocating a replacement object per droplet
 * per frame is churn the GC doesn't need.
 *
 * `ridgeYAtX` maps a band-local x to the soil height there, so droplets splash
 * on the actual terrain rather than at a flat line. A droplet born BELOW the
 * ridge — every click in the soil itself, roughly the bottom 22% of the band —
 * has already landed at spawn: `drop.y0` (set by the caller at emit time)
 * floors the ground at the droplet's own birth height, so it splashes and
 * fades where it was born instead of snapping up to the ridge line.
 */
export function stepDroplet(drop, gravity, ridgeYAtX) {
    drop.vy += gravity;
    drop.x += drop.vx;
    drop.y += drop.vy;
    const ground = Math.max(ridgeYAtX(drop.x), drop.y0);
    if (drop.y >= ground) {
        drop.y = ground;
        drop.alpha -= 0.16;
        drop.vx *= 0.7;
    }
    drop.dead = drop.alpha <= 0;
    return drop;
}
