# Works page — routing + browsing-row shell (sub-project 1 of the Works page PRD)

## Context

The `works` nav link currently opens `WorksModal`, which just renders the generic
`UnderConstruction` placeholder. The full "Works page — mini PRD (v2)" (provided by Karen,
verified against the live repo) replaces this with a farm-themed, horizontally scrolling set of
case studies, a leaf-token collectible loop, and a downloadable "harvest card" reward.

That full PRD is too large for one spec/plan/implementation cycle, so it's being decomposed into
sub-projects, each getting its own spec → plan → implementation cycle. This spec covers only the
first sub-project — the routing foundation and the browsing-row shell (the PRD's own §6 rollout
plan and §8 "suggested first task" already draw this same line). Card-to-detail expansion (PRD
§4.4), the leaf-token collectible loop (§4.5), and the harvest-card reward (§4.6) are explicitly
out of scope here and will each get their own spec later.

All "existing component" and "new file" claims below were checked directly against the repo before
writing this spec: `react-router-dom` is not currently installed; `App.js`, `Navbar.jsx`,
`index.css`, and `useTheme.js` match the descriptions used below; every asset referenced
(`patch.png`, `leaf-pixel.png`, etc.) exists in `src/assets`; none of the proposed new file paths
collide with anything already in the repo.

## Goals

- Replace the `works` modal with a real `/works` route, without breaking the existing home page,
  theme system, or `gh-pages -d build` deploy process.
- Ship a working horizontal browsing row of case-study cards (placeholder content) with drag,
  touch, keyboard, and button navigation.
- Fix the two places `Navbar.jsx` assumes it's always rendered on the home page (garden click,
  logo click) so they work correctly from `/works` too.

## Non-goals (this sub-project)

- Card-to-detail expansion, leaf-token collection, harvest-card reward, gesture ("wave to browse")
  control, parallax/depth polish — all deferred to later sub-projects per the PRD's own §6 rollout
  plan.
- Real case-study copy — `caseStudies.js` ships with clearly-labeled placeholder entries only.
- Editing `Projects.jsx`, `Resume.jsx`, `Footer.jsx`, `Hero.jsx`, `WorksModal.jsx`,
  `UnderConstruction.jsx`, `useTheme.js`, or the `index.css` color tokens (read from, never
  redefined).

## Spec note: resolving a PRD inconsistency

The source PRD's §4.3 describes a sky/hills parallax background as part of the *baseline* browsing
interaction, but its own §6 rollout plan lists "parallax/depth polish" under Phase 2 stretch. This
spec follows §6: **no parallax in this sub-project.** The browsing row ships as a flat, static
background — parallax can be added later as a purely visual enhancement without touching the
interaction logic built here.

## Architecture

`App.js` changes from directly rendering the page to:

```jsx
function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
```

`AppContent` (a component defined inline in `App.js` — not a new file) renders `Navbar`, a
`<Routes>` block, and `ScrollToTopButton`, all once at the top level:

```jsx
function AppContent() {
  // route-aware scroll effect lives here (see below)
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<><Hero /><Resume /><Projects /><Footer /></>} />
        <Route path="/works" element={<WorksPage />} />
      </Routes>
      <ScrollToTopButton />
    </>
  );
}
```

No new `HomePage.jsx` file — the home route's element is the existing four components inlined
directly, matching the PRD's file list (which doesn't add one) and its non-goal of not touching
those four components' own source.

`HashRouter` (not `BrowserRouter`) because this site deploys via `gh-pages -d build` straight to a
GitHub Pages user site with no server-side routing config — a `BrowserRouter` `/works` URL 404s on
refresh or direct link. `HashRouter` URLs (`.../#/works`) need no server config. Revisiting
`BrowserRouter` + a `public/404.html` redirect is explicitly a Phase 2 item in the source PRD, not
this sub-project.

## The route-aware scroll fix

This is the trickiest piece of logic in this sub-project. Today, `handleGardenClick` and
`handleLogoClick` in `Navbar.jsx` assume `#projects-section` / `#hero-section` already exist in the
DOM — true only when already on `/`. From `/works`, they need to navigate home *and then* scroll,
but the target element doesn't exist until after the route change commits and the home route's
children mount.

Mechanism:

1. `Navbar.jsx` gets `useNavigate()` and `useLocation()` from `react-router-dom`.
2. `handleGardenClick`: if `location.pathname !== '/'`, call
   `navigate('/', { state: { scrollTarget: 'projects-section' } })` and return. Otherwise, keep
   today's immediate `scrollIntoView` behavior unchanged.
3. `handleLogoClick`: same route-aware branch, targeting `'hero-section'`, before falling through to
   the existing "already at top → bounce, else scroll" logic (which only makes sense once already
   on `/`).
4. `AppContent` has one `useEffect` keyed on `location` (from `useLocation()`) that:
   - reads `location.state?.scrollTarget`,
   - if present, polls for `document.getElementById(scrollTarget)` via a bounded number of
     `requestAnimationFrame` retries (handles the brief gap between route commit and child mount —
     a fixed `setTimeout` would be a race),
   - once found, calls `scrollIntoView({ behavior: 'smooth' })`,
   - then calls `navigate(location.pathname, { replace: true, state: null })` to clear the state so
     browser back/forward doesn't re-trigger the scroll.

## New files (this sub-project only)

- **`src/pages/WorksPage.jsx`** — page shell: a real `<h1>` (placeholder title, e.g. "works" —
  the PRD's own open question #5 about the page's final name/voice is unresolved and doesn't block
  this sub-project) and a `PlotRow`.
- **`src/components/works/PlotRow.jsx`** — the horizontally scrollable container.
  - `overflow-x: auto; overflow-y: hidden` on a fixed-width div — this scopes scrolling to itself;
    since `App.css` sets no overflow rule at the `body`/`#root`/`.App` level, this can't leak into
    page-level horizontal scroll.
  - Touch/trackpad scrolling works natively via the browser's own overflow handling — no custom
    touch-event code needed.
  - Mouse drag-to-scroll: `pointerdown`/`pointermove`/`pointerup` on the track, adjusting
    `scrollLeft` by the pointer delta (native overflow scrolling doesn't respond to mouse
    click-drag, so this is the one thing that needs real JS).
  - Visible prev/next arrow buttons call `scrollBy({ left: ±cardWidth, behavior: 'smooth' })`, each
    with an `aria-label` ("Previous case study" / "Next case study").
  - The container is `tabIndex={0}` with `onKeyDown` handling `ArrowLeft`/`ArrowRight`, and an
    `aria-label` describing it as a scrollable list of case studies.
- **`src/components/works/CaseStudyCard.jsx`** — one plot card: title, tagline, tech tags, styled
  in the same visual family as `Projects.jsx`'s soil-patch cards (reuses `patch.png`), but with its
  own independent style objects — `Projects.jsx` itself is not imported from or modified. No
  click-to-expand behavior yet (that's sub-project 2, PRD §4.4).
- **`src/data/caseStudies.js`** — 4 placeholder entries matching the PRD §4.2 schema:
  `{ id, title, tagline, tech[], role, timeframe, problem, process[], outcome, heroImage, gallery[] }`.
  Entries are clearly labeled placeholders (e.g. `title: "Case Study Placeholder 1"`) rather than
  guessing which real projects make the final cut — that's the PRD's own open question #1, not
  resolved here.

## Modified files

- **`App.js`** — restructured per Architecture above; `worksOpen` state and the `<WorksModal>`
  render are removed.
- **`Navbar.jsx`** — the three scoped changes above. `onWorksClick` prop is removed entirely (only
  `App.js` passes it today, so this has no other call sites to update).
- **`package.json`** — add `react-router-dom` as a dependency.

## Untouched (per the source PRD's non-goals)

`Projects.jsx`, `Resume.jsx`, `Footer.jsx`, `Hero.jsx`, `WorksModal.jsx`, `UnderConstruction.jsx`,
`useTheme.js` (including its `'theme'` localStorage key), and the color tokens defined in
`index.css` (read via `var(...)`, never redefined). `useLeafTokens.js`, `CaseStudyDetail.jsx`,
`HarvestHud.jsx`, and `HarvestCard.jsx` are not created in this sub-project.

## Testing

- **`Navbar.test.js`** (new) — RTL tests for the two behaviors most likely to regress silently:
  1. Clicking "works" navigates to `/works` and `WorksPage` content renders.
  2. Clicking "garden" while on `/works` navigates back to `/` and the projects section becomes
     reachable (asserts on the resulting route/DOM, not on real scroll position — `jsdom` doesn't
     implement layout, so `scrollIntoView` is a no-op stub there; the test verifies the navigation
     and element-presence side of the mechanism, not actual pixel scrolling).
- **Manual verification** (dev server): mouse drag-to-scroll on `PlotRow`, arrow-button scroll,
  arrow-key scroll while the row is focused, confirming no page-level horizontal scroll appears,
  and confirming the garden/logo route-aware fixes work when clicked from `/works`.
- **Production build**: `CI=true npm run build` must compile clean, matching the verification
  pattern already used for every other change in this project this session.

## Rollout

This sub-project ships on its own — it's a complete, working (if content-placeholder) `/works`
route. The PRD's later sub-projects (card-to-detail expansion, leaf tokens, harvest card) each get
their own spec and build on top of `WorksPage.jsx`, `PlotRow.jsx`, `CaseStudyCard.jsx`, and
`caseStudies.js` as they exist after this one lands.
