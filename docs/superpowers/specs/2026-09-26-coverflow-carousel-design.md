# Coverflow carousel & overlay detail — design spec

## 1. Summary

Replace the current horizontal-scroll case-study row with a 3D "coverflow" carousel — a centered
active card at full size, with side cards receding in z-space (rotated, scaled down, faded) — based
on the visual/interaction pattern of a referenced site's `.pgf-stage` component. Clicking the active
card opens a floating text overlay positioned over it (not a full-page or full-viewport modal, and
not growing the card itself) showing the case study's detail. Clicking a side card brings it to the
front. Arrow buttons, keyboard, and continuous pointer-drag all move the same underlying "which card
is active" state, with a shared transform math driving every card's screen position.

This supersedes part of last session's `2026-09-26-works-home-section-design.md` spec: that spec's
card visual ("keep the farm aesthetic, reshape only") and expand-in-place interaction are both
replaced here, per explicit direction this session. Everything else from that spec (the section's
position on the home page, its Garden-styled header, the underlying case-study data model) is
unchanged and still applies.

## 2. Goals / non-goals

**Goals**
- A 3D coverflow layout: one active (centered, full-size) card, others receding to the sides with
  depth, rotation, scale and opacity falloff, matching the referenced transform pattern.
- Arrow buttons, keyboard (`ArrowLeft`/`ArrowRight`), clicking a side card, and continuous
  pointer-drag all drive the same "active card" state, with smooth CSS-transitioned settling.
- Looping: moving past the first/last card wraps around, for arrows and side-card clicks.
- Clicking the active card opens a floating overlay (not growing the card, not a full page) showing
  its full text detail; clicking a side card instead brings it to the front.
- Card visuals switch from the soil-patch farm texture to a plain dark placeholder tile (a fixed,
  theme-independent dark gradient), since there's no real photo/video content yet and the reference
  explicitly calls for a cleaner, photo/video-forward look.

**Non-goals**
- Real photo/video assets — cards keep placeholder tiles; swapping in real media is a future pass.
- Continuous drag looping past the dataset boundary mid-gesture — dragging past the first/last card
  rubber-bands/stops instead. Looping is still available via arrows or clicking a side card.
- Anything from the original works-page PRD's "Phase 2" (gesture control, leaf tokens, harvest
  card) — unaffected, still out of scope.
- Changing the section's placement, header, or the underlying `caseStudies.js` data schema — those
  are already correct from the previous spec/plan and are not touched here.

## 3. Current state (before this change)

- `src/components/works/PlotRow.jsx` (+ `.css`, `.test.js`) — a horizontally-scrolling flex row
  (`overflow-x: auto`), pointer-drag-to-scroll (mouse only), arrow buttons calling `scrollBy`,
  `ArrowLeft`/`ArrowRight` keyboard nav. `CARD_WIDTH = 380`, `CARD_GAP = 24`,
  `SCROLL_AMOUNT = 404`.
- `src/components/works/CaseStudyCard.jsx` (+ `.css`, `.test.js`) — owns its own `expanded` boolean
  state. Collapsed: soil-patch (`patch.png`) background, title/tagline/tech overlay text, `380×260`.
  Expanded: same element grows to `min(640px, 90vw)` wide, image replaced by a scrim + full text
  detail (role/timeframe/problem/process/outcome), a `×` close button. Both states have
  `role="button"`, `tabIndex={0}`, `aria-expanded`, `onKeyDown` for Enter/Space.
- `src/components/Works.jsx` — unchanged by this spec; still renders the Garden-styled header then
  `<PlotRow caseStudies={caseStudies} />` (path updates to whatever this spec renames things to).
- `src/data/caseStudies.js` — unchanged, 4 placeholder entries,
  `{ id, title, tagline, tech[], role, timeframe, problem, process[], outcome, heroImage, gallery[] }`.
- `src/setupTests.js` — already has a `window.PointerEvent` polyfill (added for the previous plan's
  drag-vs-click test) and a `window.matchMedia` mock (added even earlier, for the dark-mode toggle).
  Both are reusable as-is for this work's pointer-drag tests.

## 4. Component restructure

**Rename:** `PlotRow.jsx`/`.css`/`.test.js` → `PlotStage.jsx`/`.css`/`.test.js` (it's no longer a
scrolling row). `Works.jsx` updates its import accordingly.

**New file:** `src/components/works/coverflowMath.js` (+ `.test.js`) — a small, framework-free pure
module holding the transform math, so it's unit-testable without rendering React. Exports:

```js
export const SLOTS = [
    { z: 0, rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 100 },
    { z: -300, rotate: 38, x: 54, scale: 0.86, opacity: 0.55, zIndex: 99 },
    { z: -600, rotate: 76, x: 108, scale: 0.72, opacity: 0.22, zIndex: 98 },
    { z: -900, rotate: 38, x: 162, scale: 0.5, opacity: 0, zIndex: 98 },
];

export function interpolateSlot(distance) {
    // distance: any real number (can be fractional during a drag, negative for cards
    // to the left of active). Returns { z, rotate, x, scale, opacity, zIndex } for that exact
    // distance. z/scale/opacity are linearly interpolated between the two bracketing SLOTS rows
    // for Math.abs(distance), clamped beyond the last row. x/rotate use the same interpolated
    // magnitude, sign-mirrored by the sign of `distance`. zIndex is NOT interpolated (it's not
    // meaningful as a fraction) — it's read directly off whichever SLOTS row Math.abs(distance)
    // is closer to (Math.round, clamped to the last index).
}

export function cardTransformStyle(distance, isActive) {
    // Wraps interpolateSlot into a ready-to-use style object:
    // const { z, rotate, x, scale, opacity, zIndex } = interpolateSlot(distance);
    // { transform: `translate3d(${x}%, 0, ${z}px) rotateY(${rotate}deg) scale(${scale})`,
    //   opacity, zIndex: isActive ? 100 : zIndex,
    //   pointerEvents: opacity <= 0.02 ? 'none' : 'auto' }
}
```

`interpolateSlot` mirrors the sign of `distance` onto `x` and `rotate` (left of active = negative
`x`, positive `rotate`; right of active = positive `x`, negative `rotate`) and linearly interpolates
`z`/`scale`/`opacity` (which don't flip sign) between the two bracketing `SLOTS` rows for
`Math.abs(distance)`, clamping to the last row for any `Math.abs(distance) > 3`. `zIndex` is always
one of the four table values (100/99/98/98), never a fraction, chosen by rounding
`Math.abs(distance)` to the nearest slot.

**`PlotStage.jsx`** owns all carousel state:
- `activeIndex` (integer, 0 to `caseStudies.length - 1`)
- `dragOffset` (float, non-zero only during an active pointer-drag)
- `overlayOpen` (boolean)

For each case study at position `i`, its live (possibly fractional) distance from center is
`i - activeIndex - dragOffset`. `PlotStage` computes `cardTransformStyle(distance, i === activeIndex)`
for each and passes the resulting style down to `CaseStudyCard` as a `positionStyle` prop, along with
an `onClick` that either selects that card (`setActiveIndex(i)`, if `i !== activeIndex`) or opens the
overlay (`setOverlayOpen(true)`, if `i === activeIndex`).

**`CaseStudyCard.jsx`** becomes purely presentational — no internal state. Props:
`{ caseStudy, positionStyle, isActive, onClick }`. Renders the dark placeholder tile with the
title/tagline/tech overlay (same text content as today's collapsed view), spreads `positionStyle`
onto its root, sets `tabIndex={isActive ? 0 : -1}` and `aria-label="${caseStudy.title} — open full
screen"` (matching the reference's labeling convention), and calls `onClick` on click or
Enter/Space.

**New file:** `src/components/works/CaseStudyOverlay.jsx` (+ `.css`, `.test.js`) — presentational,
props `{ caseStudy, onClose }`. Renders the same text content the old expanded card used to
(title, role/timeframe, problem, process list, outcome) inside a fixed-size floating panel
(`480×320`, `overflow-y: auto` as a safety net for longer real content later), positioned
`absolute`, centered on the stage, `z-index` above every card (`200`). Enters with a scale+fade
transition (starts at `scale(0.85) / opacity 0`, transitions to `scale(1) / opacity 1`). A `×`
button and clicking the panel body both call `onClose`; so does pressing `Escape` while it's open
(handled by `PlotStage`, which owns `overlayOpen`).

## 5. Interaction detail

**Arrows / keyboard:** `ArrowLeft`/`ArrowRight` (bound to the stage/track container, same as
today's `PlotRow`) move `activeIndex` by ∓1/±1 with wraparound
(`(activeIndex - 1 + N) % N` / `(activeIndex + 1) % N`, `N = caseStudies.length`). Distance is
**always** the raw, unwrapped `i - activeIndex` (never shortest-path-wrapped) — every ordinary step
changes every card's distance by exactly 1, which is what makes the regular case read as a smooth
one-slot "conveyor belt" shift. (A shortest-path/modulo version was considered and rejected: it
would make non-active cards flip which side they render on mid-sequence, whenever their distance
crosses the ±N/2 threshold, even on ordinary non-wrapping steps — a worse artifact than the one it
would fix.) The one deliberate exception is the two wraparound moments themselves (last→first,
first→last): the wrapping card's distance jumps by `N - 1` in that single step (e.g. `-3 → 0`)
instead of `1`, so it animates through a visibly longer sweep — starting from off-stage at
`opacity ≈ 0` and becoming visible only in the last portion of that sweep as it nears center. This
reads as "the new card loops in from the far edge" rather than a discontinuous jump, and only ever
happens at the two loop boundaries, not on every step.

**Side-card click:** sets `activeIndex` to that card's index directly (same no-jump reasoning
applies for any distance).

**Active-card click / Enter-Space:** opens the overlay (`overlayOpen = true`). While the overlay is
open, arrow-key handling on the stage container is suspended (don't let arrows silently rotate the
carousel behind an open overlay) — `Escape`, the `×` button, or clicking the overlay body call
`onClose` (`overlayOpen = false`), restoring arrow-key handling.

**Continuous drag (mouse AND touch — see §9 for why this drops the old mouse-only gate):**
- `pointerdown` on the track: record `dragStartX`, `dragStartOffset = 0`.
- `pointermove`: `dragOffset = (dragStartX - event.clientX) / PIXELS_PER_CARD`, where
  `PIXELS_PER_CARD = 160` (a new constant — roughly 40% of `CARD_WIDTH`, tuned so a full
  card-width-ish drag moves exactly one slot).
  This directly re-renders every card's `positionStyle` via the `i - activeIndex - dragOffset`
  distance formula above — **the CSS transition must be suppressed during this live update**, or
  every pointer-move would itself animate and lag behind the cursor. Add a
  `.plot-stage-track--dragging` class (applied to the track for the duration of the drag) setting
  `transition: none !important` on `.case-study-card` so position tracks the pointer 1:1 with zero
  lag; removing the class on `pointerup` restores the normal transition for the final settle.
  - **Rubber-band clamp:** clamp `activeIndex + dragOffset` to the range
    `[-0.5, N - 1 + 0.5]` (half a card of overdrag past either end) so dragging past the first/last
    card gives a little resistance instead of moving indefinitely.
- `pointerup`: compute `nextIndex = clamp(Math.round(activeIndex + dragOffset), 0, N - 1)`, set
  `activeIndex = nextIndex`, reset `dragOffset = 0`, re-enable the transition — the settle from
  wherever the drag left off to the rounded integer position animates smoothly via the now-restored
  CSS transition.
- The existing drag-vs-click suppression (`wasDrag` flag + `onClickCapture` on the track,
  carried over unchanged from `PlotRow`) still applies: if the pointer moved past the existing
  `DRAG_THRESHOLD` during the gesture, the resulting `click` is suppressed so a drag never also
  triggers a card's `onClick` (select or open).

## 6. Card visual

Both the currently-hardcoded `patch.png` background and its associated colors
(`#fff`/`#F3E9D2` text) are replaced. New fixed (not theme-reactive) values, reusing hex already
established in `index.css`'s dark theme rather than inventing new ones:

```js
const cardBackground = 'linear-gradient(135deg, #1B1F2A 0%, #262B36 100%)';
```

Title/tagline/tech text stays light-on-dark: `#fff` for the title, `#A9B8D6` (the exact hex already
used as `--color-text-navy`'s dark-mode value in `index.css`, reused here as a fixed literal) for
the tagline and tech line. Both are fixed hex, not CSS variables, for the same reason the current
code already fixes text color on the (formerly photo, now gradient) background: independent of the
site's light/dark toggle, matching established precedent.

## 7. Stage layout

The stage container needs `perspective: 1200px` (for `rotateY`/`translateZ` to render with visible
depth) and a fixed height (`340px` — `260px` card height plus room for the hover lift and arrow
buttons to sit vertically centered). Cards are positioned `absolute`, anchored at the stage's
horizontal center (`left: 50%; margin-left: -190px` for the `380px` card width), each then offset by
its own computed `transform`. The arrow buttons keep their current styling/position
(`PlotRow.css`'s `.plot-row-arrow` rules, renamed to `.plot-stage-arrow`), unaffected by this spec
beyond the class rename.

## 8. Testing

- `coverflowMath.test.js`: pure unit tests, no rendering — `interpolateSlot(0)` returns the identity
  row; `interpolateSlot(1)`/`interpolateSlot(-1)` match `SLOTS[1]` with `x`/`rotate` sign-mirrored
  for the negative case; `interpolateSlot(1.5)` is the midpoint between `SLOTS[1]` and `SLOTS[2]`;
  `interpolateSlot(5)` clamps to `SLOTS[3]`'s values with the correct sign.
- `PlotStage.test.js`: renders 4 cards; clicking a side card makes it active (its `aria-label`
  matches, its `tabIndex` becomes `0`); arrow buttons advance/wrap `activeIndex`; clicking the active
  card opens the overlay (its text becomes visible); `Escape` while open closes it; a real
  drag-and-release (via the existing `PointerEvent` polyfill in `setupTests.js`) that crosses the
  midpoint between two cards changes `activeIndex`, one that doesn't snaps back to the original.
- `CaseStudyOverlay.test.js`: renders the given case study's text; `×` and clicking the body both
  call `onClose`.
- `CaseStudyCard.test.js`: much simpler now — renders the given `positionStyle` and text content;
  calls `onClick` on click or Enter/Space; no expand/collapse logic left to test here (that moved to
  `PlotStage`/`CaseStudyOverlay`).

## 9. Non-functional

- No new styling architecture: inline style objects (mostly generated by `coverflowMath.js`) plus a
  companion `.css` file only for what inline styles can't express (the drag-suppressed-transition
  class, hover states, the overlay's entrance transition) — matches the rest of this codebase.
- `PIXELS_PER_CARD`, the `SLOTS` table, and the rubber-band clamp range are the only new "tuning"
  constants; no configuration system, no new dependencies.
- Mobile/touch: this is a deliberate behavior change from the old row, worth calling out plainly.
  The old `PlotRow` gated its custom drag handling to `pointerType === 'mouse'` and let touch users
  scroll the `overflow-x: auto` row natively — a reasonable choice when there was a real scroll
  container to hand off to. The coverflow has no such container (cards are absolutely positioned,
  not laid out in a scrollable strip), so there's nothing native for touch to fall back on. §5's
  drag handling therefore applies to touch and mouse alike; there is no `pointerType` gate on this
  version.

## 10. Rollout

Single pass. This is a full replacement of the existing row/card/expand mechanism built in the
previous plan — no incremental phase-2 needed for the goals stated above.
