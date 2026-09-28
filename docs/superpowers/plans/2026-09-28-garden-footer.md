# Interactive Pixel Garden Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain footer with an interactive pixel-art garden — plants rooted on a soil ridge that sway, a watering-can cursor that mists, and click-to-grow with a bloom pulse — while keeping the existing footer copy and contact link intact.

**Architecture:** Geometry and physics live in pure, DOM-free modules (`gardenMath.js`, `pixelPlants.js`) that are unit-tested in isolation, mirroring the existing `src/components/works/coverflowMath.js` pattern. The soil ridge is a *function*, and the drawn soil path is generated from that same function, so art and rooting geometry cannot drift. In the component, React state owns only per-plant growth (changes on click); the watering can, droplets and scroll-scrubbed heading are written directly to the DOM through refs because they update at frame rate.

**Tech Stack:** React 18.2, react-scripts 5.0.1, Jest + @testing-library/react. **No new dependencies.** No new image assets — every plant, the soil and the can are drawn in code.

**Spec:** [`docs/superpowers/specs/2026-09-28-garden-footer-design.md`](../specs/2026-09-28-garden-footer-design.md)

## Global Constraints

- **No new npm dependencies.** No new files in `src/assets/`.
- **Test command:** `CI=true npx react-scripts test --watchAll=false --testPathPattern=<pattern>`. Full suite: `CI=true npx react-scripts test --watchAll=false`. Baseline before this work: 8 suites, 63 tests, all passing.
- **Commit style follows this repo**, not conventional commits. Recent examples: `Draw the case study panel as a game window, in both themes`. Imperative, sentence case, **no `feat:`/`fix:` prefixes.**
- **Every commit ends with:** `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (blank line before it).
- **Existing footer copy is preserved verbatim:** the line `thank you for making it this far ♡`, and `contact me ` + a link with text `here` + ` ! i'm always happy to chat ~`, where the link is `href="mailto:karenagustino20@gmail.com"` styled `color: var(--color-accent-orange)` with `text-decoration: underline`.
- **Heading text:** `let's grow something` (lowercase, exactly this string).
- **Pixel font** comes from the existing `var(--font-pixel)` token. **Theme colours** come from `src/index.css` tokens; dark mode is selected by `[data-theme="dark"]` on an ancestor.
- **Tuning constants** (use these exact values): `GROW_REACH = 80`, `MAX_PLANT_SCALE = 1.75`, `DROPLET_GRAVITY = 0.42`, `DROPLET_CAP = 90`, `GARDEN_SEED = 20260928`, growth delta `0.14`–`0.24`, growth transition `1.15s cubic-bezier(0.22, 1, 0.36, 1)`, bloom `0.7s cubic-bezier(0.34, 1.56, 0.64, 1)`, mist interval `120ms`, click burst `16` droplets (`5` under reduced motion), `20` plants on desktop / `12` on touch.
- **Band height:** `clamp(320px, 38vw, 460px)`; at `max-width: 640px`, `clamp(240px, 56vw, 320px)`.
- **Palette** (sampled from this project's own assets — do not substitute):
  `leafDeep #014734`, `leafMid #1A6F5D`, `leafBright #22C55E`, `leafShadow #00402D`, `soil #B2875F`, `petal #FFFDF7`, `petalEdge #E7DFC9`, `centre #C46A13`, `sage #B6BFA6`, `lavender #8F7BC0`, `lavenderDeep #6E5A9E`.
- **jsdom has no layout.** `getBoundingClientRect()` returns zeros and `clientWidth`/`clientHeight` are `0`. `IntersectionObserver` and `ResizeObserver` are **undefined**. Every use of these must be guarded, and the component must render correctly at zero measured size. `src/setupTests.js` already polyfills `window.matchMedia` (always `matches: false`) and `window.PointerEvent`.

## Review Focus

These are the failure modes the spec implies that no task's happy-path tests would otherwise exercise. Each has a test assigned to the task that owns the code.

1. **Zero-size band** (jsdom, pre-layout, or a hidden footer) must not produce `NaN` in any style value or divide by zero in the ridge/droplet math. → Task 5, Step 1.
2. **Pointer activity on the contact link must never water or grow the garden**, or the link becomes hard to click as plants shove around under it. → Task 10, Step 1.
3. **Repeated clicks on an already-maxed plant** must keep pulsing without growing past the ceiling and without accumulating state. → Task 10, Step 1.
4. **Unmounting while droplets are in flight** must cancel the rAF loop and detach droplet nodes — otherwise the loop runs forever against a dead ref. → Task 9, Step 1.
5. **A held or continuously moving pointer** must not grow the droplet array without bound; the cap is 90. → Task 9, Step 1.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/footer/gardenMath.js` | **Create.** Pure ridge geometry, reach tests, growth cap, droplet physics |
| `src/components/footer/gardenMath.test.js` | **Create.** Unit tests for the above |
| `src/components/footer/pixelPlants.js` | **Create.** Seeded RNG, sprite builders, bed generation |
| `src/components/footer/pixelPlants.test.js` | **Create.** Unit tests for the above |
| `src/components/footer/GardenFooter.jsx` | **Create.** Band, soil, bed, cursor, droplets, growth |
| `src/components/footer/GardenFooter.css` | **Create.** Keyframes, cursor, droplets, theme tokens |
| `src/components/footer/GardenFooter.test.js` | **Create.** Component behaviour tests |
| `src/hooks/useMediaQuery.js` | **Create.** Small shared hook, alongside the existing `useTheme.js` |
| `src/components/Footer.jsx` | **Modify.** Becomes the composition |
| `src/components/Footer.test.js` | **Create.** Regression guard on the existing copy |

`src/App.js` is **not** modified — it keeps rendering `<Footer />`.

> Note: `useMediaQuery.js` is one file beyond the spec's list. Reduced-motion and touch detection are needed by several effects in `GardenFooter.jsx`, and `src/hooks/` already exists for exactly this.

---

## Task 1: Ridge geometry

**Files:**
- Create: `src/components/footer/gardenMath.js`
- Test: `src/components/footer/gardenMath.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `RIDGE_AMPLITUDE: number`, `RIDGE_BASE_FRACTION: number`, `clamp(v, a, b): number`, `ridgeY(xFrac: number, bandHeight: number): number` (pixels from the top of the band), `ridgePath(bandWidth: number, bandHeight: number, steps?: number): string` (an SVG path `d`), `ridgeDither(bandWidth: number, bandHeight: number, cell: number): Array<{x, y, w, h}>`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/footer/gardenMath.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=gardenMath`
Expected: FAIL — `Cannot find module './gardenMath'`.

- [ ] **Step 3: Write the implementation**

Create `src/components/footer/gardenMath.js`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=gardenMath`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/gardenMath.js src/components/footer/gardenMath.test.js
git commit -m "$(cat <<'EOF'
Define the garden's soil ridge as a function

Two out-of-sync sines rather than a sampled terrain image, so the drawn soil
and the geometry the plants root against come from one source and cannot
drift apart.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Reach, growth cap and droplet physics

**Files:**
- Modify: `src/components/footer/gardenMath.js` (append)
- Test: `src/components/footer/gardenMath.test.js` (append)

**Interfaces:**
- Consumes: `clamp` from Task 1.
- Produces: `GROW_REACH: 80`, `MAX_PLANT_SCALE: 1.75`, `DROPLET_GRAVITY: 0.42`, `ANCHOR_MIN_PCT: 2`, `ANCHOR_MAX_PCT: 98`, `clumpAnchors(count, clumpCount, rng): number[]`, `nearestStemPoint(pointer, plant): {x, y}`, `withinReach(pointer, plant, reach?): boolean`, `cappedGrowth(plant, delta, ceilingY): number`, `stepDroplet(drop, gravity, ridgeYAtX): drop`.
  - `pointer` is `{x, y}` in band-local pixels.
  - `plant` is `{xPx, baseY, fullHeight, scale, maxScale?}`.
  - `drop` is `{x, y, vx, vy, alpha, dead}` and is **mutated in place**.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/gardenMath.test.js`:

```js
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
    const drop = { x: 10, y: 0, vx: 1, vy: 0, alpha: 1, dead: false };
    stepDroplet(drop, 0.42, () => 1000);
    expect(drop.vy).toBeCloseTo(0.42);
    expect(drop.y).toBeCloseTo(0.42);
    expect(drop.x).toBeCloseTo(11);
    expect(drop.dead).toBe(false);
});

test('stepDroplet settles a droplet onto the ridge and fades it there', () => {
    const drop = { x: 10, y: 99, vx: 1, vy: 5, alpha: 1, dead: false };
    stepDroplet(drop, 0.42, () => 100);
    expect(drop.y).toBe(100);
    expect(drop.alpha).toBeLessThan(1);
});

test('stepDroplet reports dead once it has fully faded', () => {
    const drop = { x: 10, y: 200, vx: 0, vy: 0, alpha: 0.1, dead: false };
    stepDroplet(drop, 0.42, () => 100);
    expect(drop.dead).toBe(true);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=gardenMath`
Expected: FAIL — the new exports are `undefined` / not a function.

- [ ] **Step 3: Write the implementation**

Append to `src/components/footer/gardenMath.js`:

```js
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
 * on the actual terrain rather than at a flat line.
 */
export function stepDroplet(drop, gravity, ridgeYAtX) {
    drop.vy += gravity;
    drop.x += drop.vx;
    drop.y += drop.vy;
    const ground = ridgeYAtX(drop.x);
    if (drop.y >= ground) {
        drop.y = ground;
        drop.alpha -= 0.16;
        drop.vx *= 0.7;
    }
    drop.dead = drop.alpha <= 0;
    return drop;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=gardenMath`
Expected: PASS, 24 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/gardenMath.js src/components/footer/gardenMath.test.js
git commit -m "$(cat <<'EOF'
Add reach, growth-ceiling and droplet maths for the garden

The reach test measures to the nearest point on a stem so tall plants are
reachable along their whole height, and the growth cap keeps watered plants
from ever climbing over the footer's text.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Seeded RNG and pixel sprite builders

**Files:**
- Create: `src/components/footer/pixelPlants.js`
- Test: `src/components/footer/pixelPlants.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `CELL: 4`, `PALETTE: object`, `mulberry32(seed): () => number`, `buildDaisy(rng)`, `buildLavender(rng)`, `buildSprout(rng)`, `buildPlant(rng)`.
  - Each builder returns `{ cells, width, height }`; `buildPlant` returns that plus `kind: 'daisy' | 'lavender' | 'sprout'`.
  - A cell is `{ x, y, w, h, fill, part }` where `part` is `'stem'` or `'head'`. Coordinates are in px, already multiplied by `CELL`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/footer/pixelPlants.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=pixelPlants`
Expected: FAIL — `Cannot find module './pixelPlants'`.

- [ ] **Step 3: Write the implementation**

Create `src/components/footer/pixelPlants.js`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=pixelPlants`
Expected: PASS, 19 tests (3 RNG + 5 shared × 3 builders + 1 kinds).

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/pixelPlants.js src/components/footer/pixelPlants.test.js
git commit -m "$(cat <<'EOF'
Generate the garden's flowers as pixel sprites

Daisies, lavender and ground sprouts laid out on a 4px grid from a seeded
generator, so every plant differs in height, bend and colour and a flower
head can pulse independently of its stem.

Palette sampled from leaf-pixel.png and patch.png.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Bed generation

**Files:**
- Modify: `src/components/footer/pixelPlants.js` (append)
- Test: `src/components/footer/pixelPlants.test.js` (append)

**Interfaces:**
- Consumes: `clumpAnchors`, `ANCHOR_MIN_PCT`, `ANCHOR_MAX_PCT` from `gardenMath.js` (Task 2); `mulberry32`, `buildPlant` from Task 3.
- Produces: `GARDEN_SEED: 20260928`, `buildBed(count, seed?): Plant[]` where a `Plant` is
  `{ id, xPct, kind, cells, width, height, sink, startScale, swayAmplitude, swayPeriod, swayDelay }`.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/pixelPlants.test.js`:

```js
import { buildBed, GARDEN_SEED } from './pixelPlants';
import { ANCHOR_MIN_PCT, ANCHOR_MAX_PCT } from './gardenMath';

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=pixelPlants`
Expected: FAIL — `buildBed is not a function`.

- [ ] **Step 3: Write the implementation**

Add this import at the **top** of `src/components/footer/pixelPlants.js`:

```js
import { clumpAnchors } from './gardenMath';
```

Then append to the same file:

```js
/**
 * Fixed seed. The bed is therefore identical on every visit — this is one
 * recognisable garden rather than a fresh scattering each load — and identical
 * in tests.
 */
export const GARDEN_SEED = 20260928;

/** Number of clump centres the plants bunch around. */
const CLUMP_COUNT = 5;

/**
 * Everything the component needs to place and animate one bed of plants. All
 * randomness is drawn from a single seeded stream, so the whole bed is one
 * reproducible arrangement.
 */
export function buildBed(count, seed = GARDEN_SEED) {
    const rng = mulberry32(seed);
    return clumpAnchors(count, CLUMP_COUNT, rng).map((xPct, id) => {
        const built = buildPlant(rng);
        return {
            id,
            xPct,
            kind: built.kind,
            cells: built.cells,
            width: built.width,
            height: built.height,
            // Sunk a few px below the ridge so stems emerge FROM the soil
            // instead of standing on top of it.
            sink: 2 + rng() * 4,
            startScale: 0.55 + rng() * 0.4,
            swayAmplitude: Number((1.4 + rng() * 2).toFixed(1)),
            swayPeriod: Number((4 + rng() * 3).toFixed(1)),
            // Negative delays start each plant partway through its sway, so the
            // bed isn't caught mid-salute on load.
            swayDelay: Number((-rng() * 3).toFixed(1)),
        };
    });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=pixelPlants`
Expected: PASS, 28 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/pixelPlants.js src/components/footer/pixelPlants.test.js
git commit -m "$(cat <<'EOF'
Grow a reproducible bed from a fixed seed

One seeded stream drives placement, sink depth, starting height and sway, so
the garden is the same arrangement on every visit rather than reshuffling
itself on each render.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: The garden band — soil and bed

**Files:**
- Create: `src/components/footer/GardenFooter.jsx`
- Create: `src/components/footer/GardenFooter.css`
- Create: `src/hooks/useMediaQuery.js`
- Test: `src/components/footer/GardenFooter.test.js`

**Interfaces:**
- Consumes: `buildBed`, `CELL` (Tasks 3–4), `ridgeY`, `ridgePath`, `ridgeDither` (Task 1).
- Produces: default export `GardenFooter({ heading, children })` plus named exports `FALLBACK_WIDTH: 1024` and `FALLBACK_HEIGHT: 360`. Renders `.gf-footer > [.gf-band > .gf-soil, .gf-bed, .gf-fx, .gf-content]`. `useMediaQuery(query): boolean` from `src/hooks/useMediaQuery.js`. The test file also produces the shared helpers `renderGarden()` and `pointerAtPlant(index, count)`, which Tasks 10 and 11 reuse.

- [ ] **Step 1: Write the failing tests**

Create `src/components/footer/GardenFooter.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: FAIL — `Cannot find module './GardenFooter'`.

- [ ] **Step 3: Write the media-query hook**

Create `src/hooks/useMediaQuery.js`:

```js
import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query. Used for the garden's reduced-motion and touch
 * branches, which have to react to a change mid-session rather than only being
 * read once at mount.
 *
 * Guarded for environments without matchMedia and for Safari versions that only
 * expose the deprecated addListener/removeListener pair.
 */
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches
    );

    useEffect(() => {
        if (!window.matchMedia) return undefined;
        const list = window.matchMedia(query);
        const onChange = (event) => setMatches(event.matches);
        setMatches(list.matches);
        if (list.addEventListener) list.addEventListener('change', onChange);
        else list.addListener(onChange);
        return () => {
            if (list.removeEventListener) list.removeEventListener('change', onChange);
            else list.removeListener(onChange);
        };
    }, [query]);

    return matches;
}
```

- [ ] **Step 4: Write the component**

Create `src/components/footer/GardenFooter.jsx`:

```jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';
import { buildBed, CELL } from './pixelPlants';
import { ridgePath, ridgeDither, ridgeY } from './gardenMath';
import './GardenFooter.css';

const DESKTOP_PLANT_COUNT = 20;
const TOUCH_PLANT_COUNT = 12;

// jsdom, a hidden footer and the first paint before layout all report 0x0.
// Falling back to a plausible band keeps the ridge maths finite and the markup
// free of NaN, rather than scattering broken transforms through the DOM.
// Exported so tests can compute coordinates that actually land on a plant
// under jsdom, where nothing has a real size.
export const FALLBACK_WIDTH = 1024;
export const FALLBACK_HEIGHT = 360;

const GardenFooter = ({ heading, children }) => {
    const bandRef = useRef(null);
    const [measured, setMeasured] = useState({ width: 0, height: 0 });

    const isTouch = useMediaQuery('(pointer: coarse)');

    const width = measured.width || FALLBACK_WIDTH;
    const height = measured.height || FALLBACK_HEIGHT;

    const plants = useMemo(
        () => buildBed(isTouch ? TOUCH_PLANT_COUNT : DESKTOP_PLANT_COUNT),
        [isTouch]
    );

    // Measure the band so plants can be rooted against the ridge at whatever
    // width the viewport happens to be.
    useEffect(() => {
        const band = bandRef.current;
        if (!band) return undefined;
        const measure = () =>
            setMeasured({ width: band.clientWidth, height: band.clientHeight });
        measure();
        if (typeof ResizeObserver !== 'function') {
            window.addEventListener('resize', measure, { passive: true });
            return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(band);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="gf-footer">
            <div className="gf-band" ref={bandRef}>
                <svg
                    className="gf-soil"
                    aria-hidden="true"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                >
                    <path d={ridgePath(width, height)} fill="var(--gf-soil)" />
                    {/* Dithered rim, drawn over the fill so the soil's top edge
                        reads as pixel art instead of a smooth vector curve. */}
                    <g shapeRendering="crispEdges">
                        {ridgeDither(width, height, CELL).map((c) => (
                            <rect
                                key={`${c.x}-${c.y}`}
                                x={c.x}
                                y={c.y}
                                width={c.w}
                                height={c.h}
                                fill="var(--gf-soil-edge)"
                            />
                        ))}
                    </g>
                </svg>

                <div className="gf-bed" aria-hidden="true">
                    {plants.map((plant, index) => {
                        const baseY = ridgeY(plant.xPct / 100, height) + plant.sink;
                        return (
                            <div
                                key={plant.id}
                                className="gf-plant"
                                style={{
                                    left: `${plant.xPct}%`,
                                    bottom: `${(height - baseY).toFixed(1)}px`,
                                    zIndex: 1 + (index % 3),
                                    '--gf-scale': plant.startScale.toFixed(3),
                                }}
                            >
                                <div
                                    className="gf-sway"
                                    style={{
                                        '--gf-sway-a': `${plant.swayAmplitude}deg`,
                                        '--gf-sway-t': `${plant.swayPeriod}s`,
                                        '--gf-sway-d': `${plant.swayDelay}s`,
                                    }}
                                >
                                    <svg
                                        width={plant.width}
                                        height={plant.height}
                                        viewBox={`0 0 ${plant.width} ${plant.height}`}
                                        shapeRendering="crispEdges"
                                    >
                                        {plant.cells
                                            .filter((c) => c.part === 'stem')
                                            .map((c, i) => (
                                                <rect key={`s${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
                                            ))}
                                        <g className="gf-head">
                                            {plant.cells
                                                .filter((c) => c.part === 'head')
                                                .map((c, i) => (
                                                    <rect key={`h${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
                                                ))}
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="gf-fx" aria-hidden="true" />

                <div className="gf-content">
                    <h2 className="gf-heading">{heading}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GardenFooter;
```

- [ ] **Step 5: Write the stylesheet**

Create `src/components/footer/GardenFooter.css`:

```css
/* Garden footer. All tokens live on .gf-footer rather than on .gf-band, because
   the watering can and its hint are fixed-position siblings of the band and
   still need to read them. */
.gf-footer {
    position: relative;
    --gf-soil: #B2875F;
    --gf-soil-edge: #8E6A48;
    --gf-drop: #6CC2EE;
    --gf-can-body: #C08663;
    --gf-can-rim: #8E5F3F;
}

[data-theme="dark"] .gf-footer {
    --gf-soil: #4A3B2C;
    --gf-soil-edge: #33291E;
    --gf-drop: #7FD4FF;
    --gf-can-body: #D8A07C;
    --gf-can-rim: #A06E4C;
}

.gf-band {
    position: relative;
    width: 100%;
    height: clamp(320px, 38vw, 460px);
    overflow: hidden;
}

@media (max-width: 640px) {
    .gf-band { height: clamp(240px, 56vw, 320px); }
}

.gf-soil {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}

.gf-bed { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.gf-fx  { position: absolute; inset: 0; z-index: 4; pointer-events: none; overflow: hidden; }

.gf-content {
    position: relative;
    z-index: 5;
    text-align: center;
    padding: clamp(1.5rem, 4vw, 3rem) 1rem 0;
    color: var(--color-text-navy);
}

.gf-heading {
    font-family: var(--font-pixel);
    font-weight: 400;
    font-size: clamp(0.95rem, 2.4vw, 1.4rem);
    letter-spacing: 0.04em;
    color: var(--color-text-primary);
    margin: 0 0 1.1rem 0;
    /* Scroll-scrubbed by JS (Task 7); starts collapsed. */
    transform: scale(var(--gf-grow, 0));
    transform-origin: center;
    will-change: transform;
}

.gf-plant {
    position: absolute;
    transform: translateX(-50%) scale(var(--gf-scale, 0.7));
    transform-origin: bottom center;
    transition: transform 1.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.gf-plant svg { display: block; overflow: visible; }

/* Sway lives on a wrapper so the plant's own growth transform and its idle
   rotation never fight over the same property. */
.gf-sway {
    transform-origin: bottom center;
    animation: gf-sway var(--gf-sway-t, 5s) ease-in-out infinite alternate;
    animation-delay: var(--gf-sway-d, 0s);
}

@keyframes gf-sway {
    from { transform: rotate(calc(var(--gf-sway-a, 2deg) * -1)); }
    to   { transform: rotate(var(--gf-sway-a, 2deg)); }
}

.gf-head { transform-box: fill-box; transform-origin: center; }

.gf-head.is-blooming {
    animation: gf-bloom 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes gf-bloom {
    0%   { transform: scale(0.92); }
    45%  { transform: scale(1.22); }
    100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
    .gf-sway { animation: none; }
    .gf-plant { transition: none; }
    .gf-head.is-blooming { animation: none; }
    .gf-heading { transform: none; }
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: PASS, 6 tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/footer/GardenFooter.jsx src/components/footer/GardenFooter.css src/components/footer/GardenFooter.test.js src/hooks/useMediaQuery.js
git commit -m "$(cat <<'EOF'
Plant the footer garden on its drawn soil ridge

The soil path and each plant's rooting depth are both generated from ridgeY,
so the bed sits on the terrain at any viewport width. Falls back to a
plausible band size when nothing has been measured yet, which keeps the
markup free of NaN before first layout.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Compose the real footer

**Files:**
- Modify: `src/components/Footer.jsx` (replace entirely)
- Test: `src/components/Footer.test.js` (create)

**Interfaces:**
- Consumes: `GardenFooter` (Task 5).
- Produces: default export `Footer`. `src/App.js` is unchanged.

- [ ] **Step 1: Write the failing test**

Create `src/components/Footer.test.js`:

```js
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// This suite is the regression guard on an explicit requirement: the garden was
// added AROUND the existing footer, and the original copy and contact link have
// to survive every change to it.

test('keeps the existing thank-you line', () => {
    render(<Footer />);
    expect(screen.getByText(/thank you for making it this far/i)).toBeInTheDocument();
});

test('keeps the contact link pointing at the same mailbox', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'here' });
    expect(link).toHaveAttribute('href', 'mailto:karenagustino20@gmail.com');
});

test('keeps the invitation to chat', () => {
    render(<Footer />);
    expect(screen.getByText(/i'm always happy to chat/i)).toBeInTheDocument();
});

test('shows the garden heading', () => {
    render(<Footer />);
    expect(screen.getByText("let's grow something")).toBeInTheDocument();
});

test('renders inside a footer landmark', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=Footer.test`
Expected: FAIL — `let's grow something` is not found (the other assertions already pass against the current footer).

- [ ] **Step 3: Rewrite Footer.jsx**

Replace the entire contents of `src/components/Footer.jsx`:

```jsx
import React from 'react';
import GardenFooter from './footer/GardenFooter';

// The garden wraps the original footer copy rather than replacing it: the
// plants grow up toward this text block and stop just below it.
const Footer = () => (
    <footer style={{ color: 'var(--color-text-navy)' }}>
        <GardenFooter heading="let's grow something">
            <div>thank you for making it this far ♡</div>
            <div>
                contact me <a href="mailto:karenagustino20@gmail.com" style={{ color: 'var(--color-accent-orange)', textDecoration: 'underline' }}>here</a>! i'm always happy to chat ~
            </div>
        </GardenFooter>
    </footer>
);

export default Footer;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=Footer`
Expected: PASS — both `Footer.test.js` (5 tests) and `GardenFooter.test.js` (6 tests).

- [ ] **Step 5: Run the whole suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS, all suites. Nothing outside the footer should have changed.

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.jsx src/components/Footer.test.js
git commit -m "$(cat <<'EOF'
Wrap the existing footer copy in the garden

The thank-you line and contact link are unchanged and now sit inside the
garden band, with a test pinning them so the garden work can't quietly drop
them.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Scroll-scrubbed heading

**Files:**
- Modify: `src/components/footer/GardenFooter.jsx`
- Test: `src/components/footer/GardenFooter.test.js` (append)

**Interfaces:**
- Consumes: `useMediaQuery` (Task 5).
- Produces: the heading element carries a `--gf-grow` custom property between `0` and `1`. No new exports.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/GardenFooter.test.js`:

```js
import { fireEvent } from '@testing-library/react';

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: FAIL — `--gf-grow` is `''`, not `'1.0000'`.

- [ ] **Step 3: Add the heading ref and effect**

In `src/components/footer/GardenFooter.jsx`, add a ref alongside `bandRef`:

```jsx
    const headingRef = useRef(null);
```

Add the reduced-motion query next to `isTouch`:

```jsx
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
```

Add this effect after the measuring effect:

```jsx
    // Scroll-scrubbed heading: scales 0 -> 1 as its centre travels from the
    // bottom of the viewport to the middle. Written straight to the element as
    // a custom property rather than held in state — this fires on every scroll
    // frame, and a setState here would re-render the whole bed each time.
    useEffect(() => {
        const heading = headingRef.current;
        if (!heading) return undefined;
        if (reducedMotion) {
            heading.style.setProperty('--gf-grow', '1');
            return undefined;
        }
        let last = null;
        const update = () => {
            const viewportHeight = window.innerHeight || 1;
            const rect = heading.getBoundingClientRect();
            const centre = (rect.top + rect.bottom) / 2;
            const progress = Math.min(
                1,
                Math.max(0, (viewportHeight - centre) / (viewportHeight * 0.5))
            );
            const value = progress.toFixed(4);
            if (value !== last) {
                heading.style.setProperty('--gf-grow', value);
                last = value;
            }
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [reducedMotion]);
```

Attach the ref to the heading:

```jsx
                    <h2 className="gf-heading" ref={headingRef}>{heading}</h2>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/GardenFooter.jsx src/components/footer/GardenFooter.test.js
git commit -m "$(cat <<'EOF'
Scrub the footer heading's scale from scroll position

Written to the element as a custom property rather than held in state: this
runs on every scroll frame, and a re-render there would repaint the whole bed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Watering-can cursor and hint

**Files:**
- Modify: `src/components/footer/GardenFooter.jsx`
- Modify: `src/components/footer/GardenFooter.css`
- Test: `src/components/footer/GardenFooter.test.js` (append)

**Interfaces:**
- Consumes: `useMediaQuery` (Task 5).
- Produces: `.gf-can` and `.gf-hint` elements rendered as siblings of `.gf-band` inside `.gf-footer`, toggled by `.is-on`. Band gains `.is-live` on pointer enter.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/GardenFooter.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: FAIL — `.gf-can` is `null`.

- [ ] **Step 3: Add the can sprite**

At the top of `src/components/footer/GardenFooter.jsx`, below the existing constants:

```jsx
// Pixel watering can, tilted to pour down-right. Rows are written out as a
// legible little picture rather than a list of coordinates:
//   h = handle, d = rim/shadow, b = body, s = spout, r = spout rose
const CAN_ROWS = [
    '...hhhh.........',
    '..h....h........',
    '..dddddd........',
    '..dbbbbd........',
    '..dbbbbd........',
    '..dbbbbdss......',
    '..dbbbbd.sss....',
    '..dbbbbd...srr..',
    '..dbbbbd....rr..',
    '...dddd.........',
];
const CAN_FILL = {
    h: 'var(--gf-can-rim)',
    d: 'var(--gf-can-rim)',
    b: 'var(--gf-can-body)',
    s: 'var(--gf-can-body)',
    r: 'var(--gf-can-rim)',
};
const CAN_UNIT = 3;
// Where water leaves the rose, in rendered px from the sprite's top-left. The
// can is positioned so this point sits on the pointer.
const CAN_TIP_X = 13.5 * CAN_UNIT;
const CAN_TIP_Y = 9 * CAN_UNIT;

const canCells = () => {
    const cells = [];
    CAN_ROWS.forEach((row, y) => {
        row.split('').forEach((ch, x) => {
            if (CAN_FILL[ch]) cells.push({ x, y, fill: CAN_FILL[ch] });
        });
    });
    return cells;
};
```

- [ ] **Step 4: Add the pointer state and elements**

Add refs alongside the others:

```jsx
    const canRef = useRef(null);
    const hintRef = useRef(null);
```

Add the handlers above the `return`:

```jsx
    // The can replaces the native cursor, so it is desktop-only: a touch device
    // has no hover state to reveal it with, and it would just be a sprite stuck
    // to the screen.
    const showCan = !isTouch;

    const handlePointerEnter = () => {
        if (!showCan) return;
        bandRef.current?.classList.add('is-live');
        canRef.current?.classList.add('is-on');
    };

    const handlePointerLeave = () => {
        bandRef.current?.classList.remove('is-live');
        canRef.current?.classList.remove('is-on');
        hintRef.current?.classList.remove('is-on');
    };

    const handlePointerMove = (event) => {
        if (canRef.current) {
            canRef.current.style.transform =
                `translate(${event.clientX - CAN_TIP_X}px, ${event.clientY - CAN_TIP_Y}px)`;
        }
        if (hintRef.current) {
            // Sits to the pointer's lower right: the can's art hangs up and to
            // the left of the tip, so that is the one side always left clear.
            hintRef.current.style.transform =
                `translate(${event.clientX + 16}px, ${event.clientY + 4}px)`;
        }
    };
```

Wire them onto the band element:

```jsx
            <div
                className="gf-band"
                ref={bandRef}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerMove={handlePointerMove}
            >
```

And render the can and hint as siblings of the band, immediately after `</div>` closing `.gf-band` and before `</div>` closing `.gf-footer`:

```jsx
            {showCan && (
                <>
                    <svg
                        className="gf-can"
                        ref={canRef}
                        aria-hidden="true"
                        width={16 * CAN_UNIT}
                        height={10 * CAN_UNIT}
                        viewBox="0 0 16 10"
                        shapeRendering="crispEdges"
                    >
                        {canCells().map((c) => (
                            <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.fill} />
                        ))}
                    </svg>
                    <div className="gf-hint" ref={hintRef} aria-hidden="true">click to grow</div>
                </>
            )}
```

- [ ] **Step 5: Add the styles**

Append to `src/components/footer/GardenFooter.css`:

```css
/* The native cursor is hidden only over the garden itself — never over the
   contact link, so a pointer user can't lose track of the one thing here that
   is actually clickable. */
.gf-band.is-live { cursor: none; }
.gf-band.is-live a { cursor: pointer; }

.gf-can,
.gf-hint {
    position: fixed;
    left: 0;
    top: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s ease;
}

.gf-can {
    z-index: 41;
    filter: drop-shadow(0 3px 4px rgba(40, 60, 40, 0.28));
}

.gf-hint {
    z-index: 42;
    font-family: var(--font-pixel);
    font-size: 10px;
    letter-spacing: 0.12em;
    white-space: nowrap;
    color: var(--color-text-primary);
    /* No plate behind it: the label crosses pale sky and dark soil, so
       legibility comes from a halo in the page's own ground colour. */
    text-shadow:
        0 0 3px var(--color-bg),
        0 0 7px var(--color-bg),
        0 0 12px var(--color-bg);
}

.gf-can.is-on,
.gf-hint.is-on { opacity: 1; }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: PASS, 13 tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/footer/GardenFooter.jsx src/components/footer/GardenFooter.css src/components/footer/GardenFooter.test.js
git commit -m "$(cat <<'EOF'
Hand the visitor a pixel watering can over the garden

The can replaces the native cursor inside the band only, so the contact link
keeps a normal pointer. It lives outside the scaled heading, whose transform
would otherwise capture its fixed positioning.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Droplet particle system

**Files:**
- Modify: `src/components/footer/GardenFooter.jsx`
- Modify: `src/components/footer/GardenFooter.css`
- Test: `src/components/footer/GardenFooter.test.js` (append)

**Interfaces:**
- Consumes: `stepDroplet`, `DROPLET_GRAVITY`, `ridgeY` from `gardenMath.js`.
- Produces: `.gf-drop` elements appended imperatively into `.gf-fx`. No new exports.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/GardenFooter.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: FAIL — no `.gf-drop` elements exist.

- [ ] **Step 3: Add the particle system**

Extend the imports in `src/components/footer/GardenFooter.jsx`:

```jsx
import { ridgePath, ridgeDither, ridgeY, stepDroplet, DROPLET_GRAVITY } from './gardenMath';
```

Add constants near the others:

```jsx
const DROPLET_CAP = 90;
const MIST_INTERVAL_MS = 120;
const CLICK_BURST = 16;
const REDUCED_CLICK_BURST = 5;
```

Add refs and the loop above the handlers:

```jsx
    const fxRef = useRef(null);
    const dropsRef = useRef([]);
    const rafRef = useRef(0);
    const lastMistRef = useRef(0);

    // Droplets are written straight to the DOM and never enter React state.
    // Up to 90 of them move every frame; reconciling that through the component
    // tree would re-render the whole bed 60 times a second for decoration
    // nothing else reads.
    const tickRef = useRef(null);
    tickRef.current = () => {
        const band = bandRef.current;
        const drops = dropsRef.current;
        if (!band) {
            rafRef.current = 0;
            return;
        }
        const bandWidth = band.clientWidth || FALLBACK_WIDTH;
        const bandHeight = band.clientHeight || FALLBACK_HEIGHT;
        const groundAt = (x) => ridgeY(x / bandWidth, bandHeight);
        for (let i = drops.length - 1; i >= 0; i--) {
            const drop = stepDroplet(drops[i], DROPLET_GRAVITY, groundAt);
            if (drop.dead) {
                drop.el.remove();
                drops.splice(i, 1);
                continue;
            }
            drop.el.style.transform = `translate(${drop.x.toFixed(1)}px, ${drop.y.toFixed(1)}px)`;
            drop.el.style.opacity = drop.alpha.toFixed(2);
        }
        rafRef.current = drops.length
            ? requestAnimationFrame(() => tickRef.current())
            : 0;
    };

    const emit = (x, y, count, spread, vy0) => {
        const layer = fxRef.current;
        if (!layer) return;
        const drops = dropsRef.current;
        for (let i = 0; i < count && drops.length < DROPLET_CAP; i++) {
            const radius = 2.4 + Math.random() * 2.2;
            const el = document.createElement('div');
            el.className = 'gf-drop';
            el.style.width = `${radius.toFixed(1)}px`;
            el.style.height = `${radius.toFixed(1)}px`;
            layer.appendChild(el);
            drops.push({
                el,
                x: x + (Math.random() * 8 - 4),
                y: y + (Math.random() * 6 - 3),
                vx: (Math.random() * 2 - 1) * spread,
                vy: vy0 + Math.random() * 1.6,
                alpha: 1,
                dead: false,
            });
        }
        if (!rafRef.current && drops.length) {
            rafRef.current = requestAnimationFrame(() => tickRef.current());
        }
    };

    // Band-local coordinates. getBoundingClientRect is zero in jsdom, which
    // simply puts every droplet at the pointer's raw position — harmless.
    const toBand = (event) => {
        const rect = bandRef.current?.getBoundingClientRect();
        return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
    };

    useEffect(() => () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        dropsRef.current.forEach((drop) => drop.el.remove());
        dropsRef.current = [];
    }, []);
```

> Note: `tickRef` is assigned on every render rather than memoised. The loop always calls through the ref, so it never closes over a stale `bandRef` or stale constants, and no dependency array can go wrong.

Extend `handlePointerMove` with the mist trail, at the end of the existing body:

```jsx
        if (reducedMotion) return;
        const now = performance.now();
        if (now - lastMistRef.current > MIST_INTERVAL_MS) {
            lastMistRef.current = now;
            const point = toBand(event);
            emit(point.x, point.y + 6, 1, 0.5, 0.4);
        }
```

Add a pointer-down handler:

```jsx
    const handlePointerDown = (event) => {
        const point = toBand(event);
        emit(point.x, point.y + 6, reducedMotion ? REDUCED_CLICK_BURST : CLICK_BURST, 2.6, 0.6);
    };
```

Wire it onto the band, and attach `fxRef` to the FX layer:

```jsx
                onPointerDown={handlePointerDown}
```

```jsx
                <div className="gf-fx" ref={fxRef} aria-hidden="true" />
```

- [ ] **Step 4: Add the droplet style**

Append to `src/components/footer/GardenFooter.css`:

```css
.gf-drop {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    background: var(--gf-drop);
    box-shadow: 0 0 4px rgba(80, 180, 230, 0.5);
    will-change: transform, opacity;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: PASS, 17 tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/footer/GardenFooter.jsx src/components/footer/GardenFooter.css src/components/footer/GardenFooter.test.js
git commit -m "$(cat <<'EOF'
Water the garden with a droplet particle system

Droplets fall under gravity and dissolve where they meet the ridge. They are
written straight to the DOM and capped at 90, so a held pointer can neither
flood the array nor drag the whole bed through a re-render each frame.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Click to grow, and bloom at full height

**Files:**
- Modify: `src/components/footer/GardenFooter.jsx`
- Test: `src/components/footer/GardenFooter.test.js` (append)

**Interfaces:**
- Consumes: `withinReach`, `cappedGrowth`, `GROW_REACH` from `gardenMath.js`.
- Produces: per-plant `scales` and `bloomTicks` state; `.gf-head` gains `is-blooming` when a capped plant is watered. No new exports.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/GardenFooter.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: FAIL — scales never change and no `.is-blooming` appears.

- [ ] **Step 3: Add growth state and the reach helpers**

Extend the imports:

```jsx
import {
    ridgePath, ridgeDither, ridgeY, stepDroplet, withinReach, cappedGrowth,
    DROPLET_GRAVITY, MAX_PLANT_SCALE,
} from './gardenMath';
```

Add constants:

```jsx
const GROWTH_DELTA_MIN = 0.14;
const GROWTH_DELTA_MAX = 0.24;
// Plants stop this far below the text block rather than climbing over it.
const CEILING_PADDING = 18;
```

Add state, seeded from the bed and reset whenever the bed changes. This must go **after** the `plants` `useMemo` from Task 5 (it reads `plants`) and **before** the handlers:

```jsx
    const [scales, setScales] = useState(() => plants.map((p) => p.startScale));
    const [bloomTicks, setBloomTicks] = useState(() => plants.map(() => 0));
    const contentRef = useRef(null);

    useEffect(() => {
        setScales(plants.map((p) => p.startScale));
        setBloomTicks(plants.map(() => 0));
    }, [plants]);
```

Add a helper that describes each plant in band coordinates — the shape
`withinReach` and `cappedGrowth` expect. Place it directly above the pointer
handlers, since both of them call it:

```jsx
    // The plant record the maths module works in: band-local pixels, current
    // scale included, so reach is measured against the plant as it looks now.
    const plantGeometry = (plant, index) => ({
        xPx: (plant.xPct / 100) * width,
        baseY: ridgeY(plant.xPct / 100, height) + plant.sink,
        fullHeight: plant.height,
        scale: scales[index] ?? plant.startScale,
        maxScale: MAX_PLANT_SCALE,
    });

    // Real controls are clicks, not waterings: pressing the contact link must
    // never spray or shove the plants around underneath it.
    const onControl = (target) => !!(target?.closest && target.closest('a, button'));
```

- [ ] **Step 4: Grow plants on pointer down**

Replace `handlePointerDown` with:

```jsx
    const handlePointerDown = (event) => {
        if (onControl(event.target)) return;
        const point = toBand(event);
        emit(point.x, point.y + 6, reducedMotion ? REDUCED_CLICK_BURST : CLICK_BURST, 2.6, 0.6);

        const bandRect = bandRef.current?.getBoundingClientRect();
        const contentRect = contentRef.current?.getBoundingClientRect();
        const ceilingY = bandRect && contentRect
            ? contentRect.bottom - bandRect.top + CEILING_PADDING
            : -Infinity;

        const bloomed = [];
        setScales((current) =>
            current.map((scale, index) => {
                const plant = plants[index];
                if (!plant) return scale;
                const geometry = { ...plantGeometry(plant, index), scale };
                if (!withinReach(point, geometry)) return scale;
                const delta = GROWTH_DELTA_MIN + Math.random() * (GROWTH_DELTA_MAX - GROWTH_DELTA_MIN);
                const grown = cappedGrowth(geometry, delta, ceilingY);
                if (grown === scale) bloomed.push(index);
                return grown;
            })
        );
        if (bloomed.length) {
            setBloomTicks((current) =>
                current.map((tick, index) => (bloomed.includes(index) ? tick + 1 : tick))
            );
        }
    };
```

- [ ] **Step 5: Show the hint only within reach**

Inside `handlePointerMove`, **replace** the `if (hintRef.current) { ... }` block added in Task 8 (the one that only sets `transform`) with the version below. It must sit *before* the `if (reducedMotion) return;` line added in Task 9 — otherwise the hint would stop updating for reduced-motion users, who can still grow plants and so still need to be told where.

```jsx
        if (hintRef.current) {
            // Sits to the pointer's lower right: the can's art hangs up and to
            // the left of the tip, so that is the one side always left clear.
            hintRef.current.style.transform =
                `translate(${event.clientX + 16}px, ${event.clientY + 4}px)`;
            // Shown only where a click would actually do something, so the
            // label never promises growth over empty sky or over the link.
            const point = toBand(event);
            const inReach =
                !onControl(event.target) &&
                plants.some((plant, index) => withinReach(point, plantGeometry(plant, index)));
            hintRef.current.classList.toggle('is-on', inReach);
        }
```

- [ ] **Step 6: Drive the plant elements from state**

In the bed's `map`, replace the `--gf-scale` value and the head group:

```jsx
                                    '--gf-scale': (scales[index] ?? plant.startScale).toFixed(3),
```

```jsx
                                        {/* Remounting the group on each tick is
                                            what restarts the CSS animation — a
                                            plant at full height pulses again
                                            every time it is watered. */}
                                        <g
                                            key={bloomTicks[index]}
                                            className={bloomTicks[index] > 0 ? 'gf-head is-blooming' : 'gf-head'}
                                        >
```

Attach `contentRef` to the content block:

```jsx
                <div className="gf-content" ref={contentRef}>
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: PASS, 23 tests.

- [ ] **Step 8: Commit**

```bash
git add src/components/footer/GardenFooter.jsx src/components/footer/GardenFooter.test.js
git commit -m "$(cat <<'EOF'
Grow the flowers where the watering can pours

Plants within reach of a click gain height until they meet either their own
limit or the footer text above them, and then pulse their bloom instead of
growing on. Pressing the contact link stays an ordinary click.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Degradation — reduced motion, touch, and off-screen

**Files:**
- Modify: `src/components/footer/GardenFooter.jsx`
- Test: `src/components/footer/GardenFooter.test.js` (append)

**Interfaces:**
- Consumes: `useMediaQuery` (Task 5).
- Produces: `.gf-idle` on the band while off-screen. No new exports.

- [ ] **Step 1: Write the failing tests**

Append to `src/components/footer/GardenFooter.test.js`:

```js
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
    const { container } = renderGarden();
    expect(container.querySelectorAll('.gf-plant')).toHaveLength(12);
    restore();
});

test('leaves out the watering can on touch devices', () => {
    const restore = withMediaQuery((q) => q.includes('coarse'));
    const { container } = renderGarden();
    expect(container.querySelector('.gf-can')).toBeNull();
    expect(container.querySelector('.gf-hint')).toBeNull();
    restore();
});

test('still grows plants when tapped on a touch device', () => {
    const restore = withMediaQuery((q) => q.includes('coarse'));
    const { container } = renderGarden();
    const before = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    fireEvent.pointerDown(bandOf(container), pointerAtPlant(0, 12));
    const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    expect(after.some((scale, i) => scale > before[i])).toBe(true);
    restore();
});

test('pins the heading open and skips the mist under reduced motion', () => {
    const restore = withMediaQuery((q) => q.includes('reduced-motion'));
    const { container } = renderGarden();
    expect(screen.getByText("let's grow something").style.getPropertyValue('--gf-grow')).toBe('1');
    fireEvent.pointerEnter(bandOf(container));
    fireEvent.pointerMove(bandOf(container), { clientX: 200, clientY: 200 });
    expect(container.querySelectorAll('.gf-drop')).toHaveLength(0);
    restore();
});

test('still grows plants under reduced motion', () => {
    const restore = withMediaQuery((q) => q.includes('reduced-motion'));
    const { container } = renderGarden();
    const before = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    fireEvent.pointerDown(bandOf(container), pointerAtPlant());
    const after = [...container.querySelectorAll('.gf-plant')].map(scaleOf);
    expect(after.some((scale, i) => scale > before[i])).toBe(true);
    restore();
});

test('parks the sway animations while the footer is off screen', () => {
    const observers = [];
    window.IntersectionObserver = class {
        constructor(callback) { this.callback = callback; observers.push(this); }
        observe() {}
        disconnect() {}
    };
    const { container } = renderGarden();
    const band = bandOf(container);
    observers[0].callback([{ isIntersecting: false }]);
    expect(band).toHaveClass('gf-idle');
    observers[0].callback([{ isIntersecting: true }]);
    expect(band).not.toHaveClass('gf-idle');
    delete window.IntersectionObserver;
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: FAIL — the touch bed is still 20 plants and `gf-idle` is never applied.

> If the touch-count test already passes, that is expected: `showCan` and the plant count were wired in Tasks 5 and 8. The failures that matter here are the reduced-motion heading value and `gf-idle`.

- [ ] **Step 3: Add the off-screen observer**

Add this effect in `src/components/footer/GardenFooter.jsx`, after the scroll effect:

```jsx
    // Around twenty sway animations run forever once the bed is mounted. Park
    // them while the footer is off screen: it is a play-state toggle only, so
    // nothing about the animations themselves changes.
    useEffect(() => {
        const band = bandRef.current;
        if (!band || typeof IntersectionObserver !== 'function') return undefined;
        const observer = new IntersectionObserver(
            ([entry]) => band.classList.toggle('gf-idle', !entry.isIntersecting),
            { rootMargin: '120px 0px' }
        );
        observer.observe(band);
        return () => observer.disconnect();
    }, []);
```

- [ ] **Step 4: Add the idle style**

Append to `src/components/footer/GardenFooter.css`:

```css
.gf-idle,
.gf-idle * { animation-play-state: paused !important; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false --testPathPattern=GardenFooter`
Expected: PASS, 29 tests.

- [ ] **Step 6: Run the whole suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS. Expect 12 suites and ~149 tests (63 pre-existing + 86 new: 24 gardenMath, 28 pixelPlants, 29 GardenFooter, 5 Footer). Exact totals may differ by a test or two; what matters is that nothing that passed before now fails.

- [ ] **Step 7: Verify the build compiles**

Run: `CI=true npx react-scripts build`
Expected: `Compiled successfully.` — no ESLint warnings-as-errors from the new files.

- [ ] **Step 8: Commit**

```bash
git add src/components/footer/GardenFooter.jsx src/components/footer/GardenFooter.css src/components/footer/GardenFooter.test.js
git commit -m "$(cat <<'EOF'
Keep the garden usable without motion, hover, or a viewport

Reduced motion keeps click-to-grow but drops the sway, mist and scroll-scrub;
touch drops the watering can but keeps tap-to-grow on a smaller bed; and the
sway animations park themselves while the footer is off screen.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Manual verification

Automated tests can't see pixels. After Task 11, run `npm start` and check:

- [ ] Plants sit **on** the soil ridge, not floating above or buried — at 1440px, 1024px and 390px wide.
- [ ] The watering can follows the pointer with its spout tip on the cursor, and the native arrow is gone over the garden but present over `here`.
- [ ] `click to grow` appears near plants and not over empty sky or the contact link.
- [ ] Clicking grows nearby plants smoothly; they stop below the text and pulse instead of overlapping it.
- [ ] Droplets fall and dissolve at the soil line rather than at a flat height.
- [ ] Toggling the theme re-colours soil, plants and can with no flash or re-layout.
- [ ] macOS System Settings → Accessibility → Display → Reduce Motion: the garden goes still but clicking still grows.
- [ ] The page does not scroll sideways at 390px.
