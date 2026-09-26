# Works home-page section — design spec

## 1. Summary

Fold the standalone `/works` route (added in the previous `works-page-routing` branch) into a
new section on the home page, styled like the existing "the garden of projects" section. The
horizontal browsing row (drag/arrow/keyboard navigation) is reused as-is; the individual cards are
redesigned as wider hero-image tiles (still using the soil-patch texture, matching the farm/matcha
theme) with a new click-to-expand-in-place interaction that swaps the card's image for its case
study's text detail. Since nothing else in the app needs client-side routing once this lands,
`react-router-dom` and the `HashRouter`/`AppContent` split are removed entirely, reverting `App.js`
and `Navbar.jsx` to the simpler single-page pattern that predates the routing work.

This directly reverses part of the previous `works-page-routing` branch (merged into `main` earlier
this session) — the routing infrastructure it added is judged premature now that the feature it was
built for no longer needs a separate page.

## 2. Goals / non-goals

**Goals**
- A home-page section, visually consistent with "the garden of projects," showcasing case studies.
- Reuse the already-built, already-tested horizontal row mechanics (drag, arrow buttons, keyboard
  nav) without re-deriving them.
- Redesign cards as landscape hero tiles, keeping the farm/soil-patch aesthetic.
- Click-to-expand: a card grows in place and swaps its image for text (role/timeframe, problem,
  process, outcome), independent of other cards, without breaking drag-to-scroll.
- Remove now-unnecessary routing infrastructure (YAGNI — nothing else needs a second route).

**Non-goals (unchanged from the original works-page-routing spec)**
- No real case-study content — placeholder data stays placeholder.
- No gesture/camera control, no "leaf token" collectible loop, no harvest-card reward (these were
  always phase-2/out-of-scope; unaffected by this change).
- Not touching `Hero.jsx`, `Resume.jsx`, `Footer.jsx`, `useTheme.js`, or `index.css` color tokens.
- `WorksModal.jsx` and `UnderConstruction.jsx` stay in the repo, untouched and still unused (as
  they've been since the previous branch).

## 3. Current state (post-merge, pre-this-change)

- `src/App.js` wraps everything in `HashRouter`, exports `AppContent` (home route `/` renders
  `Hero`/`Resume`/`Projects`/`Footer`; `/works` renders `WorksPage`) and a route-change scroll-reset
  effect.
- `src/components/Navbar.jsx` uses `useNavigate`/`useLocation`; its three click handlers
  (`works`/`garden`/logo) are route-aware.
- `src/pages/WorksPage.jsx` renders an `<h1>works</h1>` heading plus `PlotRow`.
- `src/components/works/PlotRow.jsx` (+ `.css`, `.test.js`) — horizontal scroll track, prev/next
  arrow buttons, pointer-drag (mouse-only), `ArrowLeft`/`ArrowRight` keyboard nav.
- `src/components/works/CaseStudyCard.jsx` (+ `.test.js`) — a 280×340 soil-patch card rendering
  `title`/`tagline`/`tech` only.
- `src/data/caseStudies.js` (+ `.test.js`) — 4 placeholder objects, schema:
  `{ id, title, tagline, tech[], role, timeframe, problem, process[], outcome, heroImage, gallery[] }`.
- `package.json` depends on `react-router-dom@^6.30.6`.

## 4. Architecture change: remove routing

`App.js` reverts to a single component (no `HashRouter`, no `AppContent`/`App` split, no named
export needed) rendering `Navbar`, `Hero`, `Resume`, the new `Works` section, `Projects`, `Footer`,
`ScrollToTopButton` in that order — a plain single-page composition, matching the file's shape
before the previous branch's Task 5.

`Navbar.jsx` drops `useNavigate`/`useLocation` entirely. Its three handlers revert to the
pre-routing pattern:
- `handleWorksClick`: `document.getElementById('works-section')?.scrollIntoView({ behavior: 'smooth' })`
  — new handler, mirrors `handleGardenClick`'s existing shape exactly.
- `handleGardenClick` / `handleLogoClick`: unchanged from before routing existed (direct
  `getElementById` + `scrollIntoView`, logo's "bounce if already at top" behavior intact) — the
  route-awareness branches (`if (location.pathname !== '/') ...`) are deleted since there's only one
  "page" again.

`react-router-dom` is removed from `package.json` (`npm uninstall react-router-dom`).

`src/pages/WorksPage.jsx`, `src/pages/WorksPage.test.js`, and the now-empty `src/pages/` directory
are deleted. `src/App.test.js` is rewritten to plain `render(<App />)` assertions (no `MemoryRouter`)
— covering: home content renders (`hello, i'm` from Hero), and each of the three nav handlers
scrolls to its target section (mocking `scrollIntoView` as the existing pre-routing tests did).

## 5. The new Works section

New component `src/components/Works.jsx` (+ `Works.test.js`), a sibling to `Projects.jsx`, rendered
in `App.js` between `Resume` and `Projects`:

```jsx
<section id="works-section" style={{ /* same shape as Projects.jsx's <section> */ }}>
  <h2 style={{ /* identical style object to Projects.jsx's h2 */ }}>
    <span role="img" aria-label="potted plant">🪴</span> the garden of case studies
  </h2>
  <p style={{ /* identical style object to Projects.jsx's p */ }}>
    deeper roots behind the garden
  </p>
  <PlotRow caseStudies={caseStudies} />
</section>
```

Header/subtitle style objects are copied verbatim from `Projects.jsx` (same `var(--color-text-primary)`
/ `var(--color-sage)` tokens, same font weights/sizes) so the two sections read as one visual family.
`PlotRow` and `caseStudies` are imported the same way `WorksPage.jsx` did. `PlotRow.jsx`/`.css` and
`CaseStudyCard.jsx`/`.test.js` stay at their current path (`src/components/works/`) — not moved —
to keep this change's diff focused on behavior, not file layout.

## 6. Card redesign

`CaseStudyCard.jsx`'s `CARD_WIDTH` changes from `280` to `380` (matching `Projects.jsx`'s own
`CARD_WIDTH`, for visual rhythm with the section directly below it) and `CARD_HEIGHT` changes from
`340` to `260` (landscape proportions). The card keeps the `soilBg` (`patch.png`) background and the
existing hover treatment — copying `Projects.jsx`'s `cardHoverStyle`
(`transform: translateY(-8px) scale(1.03)`) onto hover/focus, which this card doesn't currently have.

**Expand state:** `CaseStudyCard` gains local state — `const [expanded, setExpanded] = useState(false)`.
- **Collapsed** (current default): soil image background, `title`/`tagline`/`tech` overlay at the
  bottom, exactly as today.
- **Expanded**: a semi-opaque scrim (e.g. `rgba(0,0,0,0.55)`) is layered over the same `soilBg`
  image, keeping the texture visible but dark enough for light text on top — not a hard color swap.
  Over the scrim: `title`, a `role · timeframe` line, `problem`, a bulleted `process` list, `outcome`,
  and a small `×` button (top-right) that collapses back. Card width transitions (CSS
  `transition: width 0.3s`) from 380px to a fixed expanded width of 640px (`min(640px, 90vw)` so it
  never overflows a narrow viewport) to fit the text; height stays fixed at 260px with
  `overflow-y: auto` if content would overflow, rather than growing the row's height per-card.
- Both of these close an expanded card: clicking the `×` button, and clicking anywhere else on the
  expanded card's body. Clicking a collapsed card opens it (there is no separate "collapsed body
  click target" vs "expand button" — the whole card is the toggle in both states).
- No coordination between cards — each manages its own `expanded` boolean independently. Multiple
  cards may be expanded at once; this is intentional (simplest correct behavior, not a defect).

**Drag-vs-click:** `PlotRow.jsx` already gates pointer-drag to mouse input only
(`if (event.pointerType !== 'mouse') return;`). Add a drag-distance guard so a real drag-to-scroll
gesture doesn't also toggle a card open on release: track total pointer movement in
`dragState.current` during `handlePointerMove`; if the cumulative movement exceeds a small threshold
(e.g. 5px) at any point during the gesture, mark `dragState.current.wasDrag = true`. Add an
`onClickCapture` handler on the `<ul className="plot-row-track">` that checks this flag: if true,
call `event.preventDefault()` / `event.stopPropagation()` to suppress the click from reaching the
card underneath, then reset the flag. A plain click (no meaningful movement) passes through
untouched and reaches the card's own `onClick`.

## 7. Testing

- `App.test.js`: rewritten, no router — assert home content renders, and that clicking each of the
  three nav targets (`works`, `garden`, logo) calls `scrollIntoView` on the right element (mock
  `Element.prototype.scrollIntoView`, check `getElementById` targets: `works-section`,
  `projects-section`, `hero-section`).
- `Works.test.js` (new): renders the section heading and 4 `CaseStudyCard`s (via `PlotRow`) — same
  shape as the old `WorksPage.test.js`.
- `PlotRow.test.js`: update the hardcoded scroll-amount assertions from `304` to the new
  `CARD_WIDTH (380) + CARD_GAP (24) = 404`. Add a new test: simulate a drag (pointerdown, pointermove
  past the threshold, pointerup) directly over a card, then assert the card's expanded-only content
  (e.g. its `problem` text) is NOT present — i.e., the drag did not also expand the card.
- `CaseStudyCard.test.js`: add tests for (a) initial render shows collapsed content
  (`title`/`tagline`/`tech`) and not the expanded fields, (b) clicking the card reveals `problem`/
  `outcome` text and hides the soil-image overlay content in a way the test can assert (e.g. the
  collapsed-only tagline text is gone, or an `data-expanded="true"` attribute — implementer's call
  on the exact assertion), (c) clicking the `×`/card again collapses it back.

## 8. Non-functional

- Same CSS-custom-property theming discipline as the rest of the codebase — no new hardcoded colors
  beyond what's already established (reuse `--color-text-primary`, `--color-sage`, `--color-surface`,
  etc.).
- Inline styles + companion `.css` file only for what inline styles can't do (hover/transition/media
  queries) — matches every other component in this codebase; no new styling architecture.
- Mobile: the expanded card's ~640px width needs a narrower fallback on small screens (e.g. expand to
  something like `min(640px, 90vw)` so it doesn't force horizontal overflow past the viewport on a
  phone) — covered by `PlotRow.css`'s existing `@media (max-width: 700px)` block, extended for this.

## 9. Rollout

Single pass — this is a small enough, well-understood change (reusing almost everything already
built) that it doesn't need its own phase-2. All work described above lands together.
