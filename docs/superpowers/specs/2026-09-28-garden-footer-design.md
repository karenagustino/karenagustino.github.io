# Interactive garden footer — design

Date: 2026-09-28
Status: approved, ready for planning

## Intent

Replace the plain footer with an interactive pixel-art garden, modelled on the
footer at <https://zainabkabira.com/#work>, while keeping the existing footer
copy intact. The reference's behaviours we are reproducing:

1. A bed of procedurally generated plants rooted along a soil ridge, each with
   an independent idle sway.
2. A watering-can cursor that replaces the native pointer over the footer and
   mists water droplets as it moves.
3. Clicking near a plant grows it; a plant already at full height pulses its
   bloom instead.
4. A heading whose scale is scrubbed by scroll position as the footer enters
   the viewport.

Success means: the footer reads as part of *this* site's pixel-garden language
rather than as a transplant from the reference; the existing "thank you for
making it this far" copy and the `mailto:` contact link are untouched and still
keyboard-accessible; and the whole thing degrades to something calm and usable
under reduced-motion, on touch, and in dark mode.

### Decisions taken during brainstorming

| Question | Decision |
|---|---|
| Visual language | **Pixel art**, not the reference's painted gouache — matches Silkscreen and `leaf-pixel.png` |
| Layout | Existing footer copy sits **inside** the garden band; plants grow up toward it and stop |
| Heading | `let's grow something`, small (Silkscreen, ~1.4–2rem), scroll-scrubbed scale 0 → 1 |
| Cursor | **Pixel watering can**, native cursor hidden over the garden only |
| Rendering | **Procedural SVG + code-defined ridge** (approach A), not canvas-sampled PNG terrain |

### Why not mirror the reference's technique

The reference finds its terrain by drawing a painted land PNG to a canvas and
scanning each column for the first opaque dark pixel. That is the right call
*there*, because their ground is an illustration no formula describes. Ours is a
shape we draw ourselves, so sampling a picture of it would be a round trip
through a canvas that returns information we already had — while adding
image-decode timing, a re-sample on every theme swap, and geometry that cannot
be tested in jsdom. We define the ridge as a function and draw the soil *from*
that function, so art and geometry cannot drift apart.

## Architecture

### Files

| File | Responsibility |
|---|---|
| `src/components/footer/gardenMath.js` | Pure, DOM-free geometry and physics |
| `src/components/footer/gardenMath.test.js` | Unit tests for the above |
| `src/components/footer/pixelPlants.js` | Seeded sprite builders → cell arrays |
| `src/components/footer/pixelPlants.test.js` | Unit tests for the above |
| `src/components/footer/GardenFooter.jsx` | Refs, effects, pointer wiring, rendering |
| `src/components/footer/GardenFooter.css` | Keyframes, cursor, droplets, theme tokens |
| `src/components/Footer.jsx` | Composition: garden band + heading + existing copy |
| `src/components/Footer.test.js` | Regression guard on the existing copy |

`src/App.js` is unchanged — it keeps rendering `<Footer />`.

This mirrors the existing `src/components/works/` layout, where `coverflowMath.js`
holds pure geometry with its own focused test file and the component consumes it.

### Ownership split: React state vs. direct DOM writes

The single architectural call that governs performance. Split by update
frequency:

- **React state** — per-plant growth scale. Changes only on click, across ~20
  elements. A re-render at that rate costs nothing.
- **Direct DOM writes through refs** — watering-can position, mist droplets, and
  the scroll-scrubbed heading scale. These update at frame rate; routing them
  through `setState` would re-render the footer 60 times a second.

Droplets live in a `<div>` layer the effect owns outright and React never
reconciles. This matches how `ScrollToTopButton.jsx` already listens to scroll,
except the heading writes a CSS custom property rather than setting state.

## Components

### gardenMath.js

Pure functions, no DOM access, all exported for test:

- `ridgeY(xFrac, bandHeight)` — soil surface height at a horizontal position.
  A compound two-sine profile (two out-of-sync periods, ~10px total amplitude)
  so the ground undulates organically rather than metronomically. Returns pixels
  from the top of the band. Deterministic.
- `ridgePath(bandWidth, bandHeight, steps)` — the same profile emitted as an SVG
  path `d` string, so the drawn soil and the rooting geometry come from one
  source.
- `clumpAnchors(count, clumpCount, rng)` — horizontal positions in percent,
  bunched around 5–6 clump centres at ±6%, clamped to `[2, 98]` so no plant is
  clipped by the band edge.
- `nearestStemPoint(pointer, plant)` — the closest point on a plant's stem
  segment to the pointer, used by both the reach test and the hint.
- `withinReach(pointer, plant, reach)` — distance test against that point.
  `reach` is `GROW_REACH = 80`, shared by hint and click so the label only ever
  promises what a click delivers.
- `cappedGrowth(plant, delta, ceilingY)` — the growth ceiling. `plant` carries
  `{ scale, fullHeight, baseY, maxScale }`. Returns the new scale, never letting
  a plant's top rise above `ceilingY` (the text block's bottom edge plus 18px)
  nor past `maxScale` (1.75). Returns the current scale unchanged when already
  capped, which is the signal to pulse-bloom instead. Taking the plant as one
  object rather than five positional numbers keeps call sites readable and makes
  the argument order impossible to get wrong.
- `stepDroplet(drop, gravity, ridgeYAtX)` — one integration step: gravity on
  `vy`, position update, and splash-dissolve once `y` reaches the ridge.
  Returns the mutated drop plus a `dead` flag.

### pixelPlants.js

- `mulberry32(seed)` — small deterministic PRNG, so tests are repeatable and the
  bed does not reshuffle between renders.
- `buildDaisy(rng)`, `buildLavender(rng)`, `buildSprout(rng)` — each returns
  `{ cells, width, height }` where `cells` is `{ x, y, w, h, fill, part }` on a
  fixed pixel grid. `part` is `'stem'` or `'head'`.
- `buildPlant(rng)` — picks a builder by weighted roll (50% daisy, 28%
  lavender, 22% sprout, matching the reference's mix).

Head cells are tagged so the bloom pulse can scale the flower head
independently of its stem, via `transform-box: fill-box` on the head group.

The bed is generated from a **fixed seed constant**. The garden is therefore the
same on every visit — recognisable rather than random — and identical in tests.

Palette, sampled from the project's own assets:

| Role | Colour | Source |
|---|---|---|
| Deep foliage | `#014734` | `leaf-pixel.png` dominant |
| Mid foliage | `#1A6F5D` | `leaf-pixel.png` |
| Highlight leaf | `#22C55E` | `leaf-pixel.png` |
| Shadow leaf | `#00402D` | `leaf-pixel.png` |
| Soil | `#B2875F` | `patch.png` / `soil-bg.png` |
| Petal cream | `#FFFDF7` | `--color-panel` |
| Flower centre | `#C46A13` | `--color-accent-orange` |
| Sage accent | `#B6BFA6` | `--color-sage` |

### GardenFooter.jsx

Renders, back to front:

1. `<svg class="gf-soil">` — the ridge path filled with the soil token, plus a
   dithered pixel band along its top edge.
2. `<div class="gf-bed">` — one absolutely positioned `.gf-plant` per plant,
   rooted at `bottom: bandHeight - ridgeY(x) - sink` where `sink` is 2–6px so
   stems emerge *from* the soil rather than resting on it. Each plant holds a
   `.gf-sway` wrapper (composited, carries the idle animation) around its SVG.
3. `<div class="gf-fx">` — the droplet layer, owned imperatively.
4. The content block: pixel heading, then the existing footer copy.

The watering can and the hint label are `position: fixed` siblings appended to
the component's own root, not to `document.body`, so React unmounts them
cleanly. They must stay outside the heading's subtree: a transformed ancestor
becomes the containing block for `position: fixed`, and the heading carries a
`scale()`, so nesting the can under it would make it track the heading's scaling
instead of the viewport.

### Band dimensions

The garden band is the footer's full width and `clamp(320px, 38vw, 460px)` tall
— enough that a plant at `maxScale` still clears the text block, and short
enough that it does not dominate a laptop viewport. On phones
(`max-width: 640px`) it drops to `clamp(240px, 56vw, 320px)`, which is what the
reduced plant count and smaller starting scale are proportioned against. The
existing footer's `margin: 3rem 0 5rem 0` is replaced by the band's own
spacing; the content block sits in the upper portion with the soil along the
bottom edge.

### Footer.jsx

Becomes the composition. The existing copy moves inside the garden band
**verbatim** — same wording, same `mailto:karenagustino20@gmail.com` link, same
accent styling. Nothing about the contact link's behaviour changes.

## Data flow

```
mount
  └─ seeded rng ──► buildPlant × N ──► plants[] (useMemo, stable)
                                          │
resize / mount ─► measure band ──► ridgeY ─┴─► each plant's bottom offset

pointermove ──► ref write: can transform
            ├─► every 120ms: emit 1 mist droplet ──► fx layer (rAF loop)
            └─► withinReach? ──► toggle hint label

pointerdown ──► emit 16 droplets
            └─► for each plant withinReach:
                   cappedGrowth ──► changed? setState(scale)   [CSS transition]
                                 └─ unchanged? toggle .bloomed [pulse]

scroll ──────► ref write: --gf-grow on the heading (0 → 1)
```

The rAF loop runs only while droplets exist and stops itself when the array
empties.

## Interaction detail

| Event | Behaviour |
|---|---|
| `pointerenter` | Add `gf-live` (hides native cursor), show the can |
| `pointerleave` | Remove `gf-live`, hide can and hint |
| `pointermove` | Move can; mist one droplet per 120ms; toggle hint within 80px |
| `pointerdown` | Burst 16 droplets; grow every plant within 80px by 0.14–0.24 |
| At growth cap | Retrigger `.bloomed` for a 0.7s overshoot pulse |
| On the contact link | **No watering, no growth** — it stays an ordinary link |

Growth transitions over `1.15s cubic-bezier(0.22, 1, 0.36, 1)`.

## Error handling and degradation

- **Reduced motion** (`prefers-reduced-motion: reduce`): no sway, no mist trail,
  no scroll-scrub (heading pinned at scale 1), growth applies with no transition,
  click burst reduced to 5 droplets. Clicking still grows plants — the feature
  survives, the motion does not.
- **Touch** (`pointer: coarse`): no can sprite, no hint label; tapping still
  grows. 12 plants instead of 20, smaller starting scale, so the bed stays
  proportionate to a shorter band.
- **Off-screen**: an `IntersectionObserver` toggles `animation-play-state:
  paused` on the band, so ~20 infinite sway animations stop costing frames when
  the footer is not visible.
- **Resize / orientation change**: a rAF-coalesced handler re-measures the band
  and re-roots every plant, so the bed stays glued to the ridge at any width.
- **Dark mode**: CSS custom properties only — soil deepens, foliage and petals
  shift to the dark-theme sage and orange. No second art asset and no
  re-sampling, which is a direct benefit of defining the ridge in code.
- **Droplet cap**: 90 concurrent droplets, so a held-down pointer cannot grow the
  particle array without bound.

## Accessibility

- The soil, bed, droplet layer, can and hint are all `aria-hidden="true"`. The
  garden is decoration and is never announced as a control.
- The heading is a real heading element; the existing copy and contact link keep
  their semantics and full keyboard access.
- `cursor: none` applies only inside the garden band, never to the contact link,
  so a pointer user never loses the cursor over something clickable.
- Focus styling on the contact link is unchanged.

## Testing

**`gardenMath.test.js`**
- `ridgeY` stays within the band at sampled positions across `[0, 1]`
- `ridgeY` is continuous: adjacent samples differ by less than a small bound
- `ridgeY` is deterministic: same input, same output
- `clumpAnchors` returns the requested count, all within `[2, 98]`
- `withinReach` is true just inside 80px and false just outside
- `cappedGrowth` never returns a scale whose top breaches the ceiling
- `cappedGrowth` returns its input unchanged when already at the cap
- `stepDroplet` accelerates downward and reports `dead` at the ridge

**`pixelPlants.test.js`**
- Same seed produces byte-identical plant output twice
- Every cell lies inside its sprite's declared width and height
- Every plant has at least one `head` cell and at least one `stem` cell
- `buildPlant` produces all three plant kinds across a run of seeds

**`Footer.test.js`** — the regression guard on the explicit requirement that the
existing footer survives:
- "thank you for making it this far" still renders
- The contact link is present with `href="mailto:karenagustino20@gmail.com"`
- The garden decoration is `aria-hidden`
- The component mounts without error under jsdom (no layout APIs assumed)

## Out of scope

- Any change to the nav, hero, resume, works or projects sections
- New image assets — every plant, the soil and the can are drawn in code
- Persisting grown plants across reloads
- A contact form or drawer (the reference has one; we keep the `mailto:` link)
