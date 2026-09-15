# Works Page Routing & Browsing Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `works` nav link's modal with a real `/works` route containing a horizontally browsable row of (placeholder) case-study cards, and fix `Navbar.jsx`'s two route-unaware click handlers.

**Architecture:** `App.js` wraps everything in `HashRouter` (required because this site deploys to GitHub Pages via `gh-pages -d build` with no server-side routing) and splits into a router-aware `AppContent` (named export, for testability with `MemoryRouter`) containing `Navbar` + `Routes` + `ScrollToTopButton`. The home route (`/`) renders the existing `Hero`/`Resume`/`Projects`/`Footer` inline; `/works` renders a new `WorksPage`. A single `useEffect` in `AppContent`, driven by router `location.state.scrollTarget`, handles the case where `Navbar`'s garden/logo clicks need to navigate home from `/works` and then scroll to a section that doesn't exist in the DOM until after the route change commits.

**Tech Stack:** React 18.2.0, react-router-dom (new dependency, `HashRouter`), CRA/react-scripts 5 (Jest + React Testing Library already configured), existing CSS-custom-property theme system (`index.css`).

**Spec:** `docs/superpowers/specs/2026-09-14-works-page-routing-design.md`

## Global Constraints

- Use `HashRouter`, never `BrowserRouter` (GitHub Pages has no server-side routing; confirmed in spec).
- Install `react-router-dom@^6.26.0` specifically — do not use v7 (bigger migration surface, not needed here).
- No new styling architecture: inline style objects, with a companion `.css` file only for keyframes/hover/pseudo-class states that inline styles can't express (matches `Hero.css`, `Resume.css`, `ThemeToggle.css`).
- Reuse the existing CSS custom properties (`--color-bg`, `--color-surface`, `--color-text-primary`, `--color-text-navy`, `--color-accent-orange`, `--color-sage`) for anything theme-sensitive. The one exception, matching existing precedent in `Projects.jsx`'s own soil-patch cards, is text rendered directly on the `patch.png` photo background (`#fff` title, `#F3E9D2` tech line) — those are intentionally not theme tokens in the existing code, and the new `CaseStudyCard` follows the same precedent for the same reason (fixed-color text over a fixed-color photo, independent of page theme).
- Do not modify: `Projects.jsx`, `Resume.jsx`, `Footer.jsx`, `Hero.jsx`, `WorksModal.jsx`, `UnderConstruction.jsx`, `useTheme.js`, or any `index.css` color token definition.
- Out of scope for this plan entirely (separate future specs): card-to-detail expansion, leaf-token collection, harvest-card reward, gesture ("wave to browse") control, parallax background.
- Every task's tests run via `CI=true npx react-scripts test <path> --watchAll=false`; every task's final build check (Task 6 only, but keep in mind throughout) runs via `CI=true npm run build`.

---

## Task 1: Case study placeholder data

**Files:**
- Create: `src/data/caseStudies.js`
- Test: `src/data/caseStudies.test.js`

**Interfaces:**
- Produces: `export default caseStudies` — an array of exactly 4 objects, each shaped `{ id: string, title: string, tagline: string, tech: string[], role: string, timeframe: string, problem: string, process: string[], outcome: string, heroImage: string|null, gallery: string[] }`. Later tasks (`CaseStudyCard`, `PlotRow`, `WorksPage`) read `id`, `title`, `tagline`, and `tech` from these objects.

- [ ] **Step 1: Write the failing test**

Create `src/data/caseStudies.test.js`:

```js
import caseStudies from './caseStudies';

const REQUIRED_KEYS = [
    'id', 'title', 'tagline', 'tech', 'role', 'timeframe',
    'problem', 'process', 'outcome', 'heroImage', 'gallery',
];

test('exports exactly 4 placeholder case studies', () => {
    expect(caseStudies).toHaveLength(4);
});

test('every case study has the full required shape', () => {
    caseStudies.forEach((entry) => {
        REQUIRED_KEYS.forEach((key) => {
            expect(entry).toHaveProperty(key);
        });
        expect(Array.isArray(entry.tech)).toBe(true);
        expect(Array.isArray(entry.process)).toBe(true);
        expect(Array.isArray(entry.gallery)).toBe(true);
    });
});

test('every case study has a unique id', () => {
    const ids = caseStudies.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/data/caseStudies.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './caseStudies'`

- [ ] **Step 3: Write the data file**

Create `src/data/caseStudies.js`:

```js
const caseStudies = [
    {
        id: 'placeholder-1',
        title: 'Case Study Placeholder 1',
        tagline: 'Real narrative content coming soon.',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        problem: 'Placeholder problem statement.',
        process: ['Placeholder process step 1', 'Placeholder process step 2'],
        outcome: 'Placeholder outcome statement.',
        heroImage: null,
        gallery: [],
    },
    {
        id: 'placeholder-2',
        title: 'Case Study Placeholder 2',
        tagline: 'Real narrative content coming soon.',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        problem: 'Placeholder problem statement.',
        process: ['Placeholder process step 1', 'Placeholder process step 2'],
        outcome: 'Placeholder outcome statement.',
        heroImage: null,
        gallery: [],
    },
    {
        id: 'placeholder-3',
        title: 'Case Study Placeholder 3',
        tagline: 'Real narrative content coming soon.',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        problem: 'Placeholder problem statement.',
        process: ['Placeholder process step 1', 'Placeholder process step 2'],
        outcome: 'Placeholder outcome statement.',
        heroImage: null,
        gallery: [],
    },
    {
        id: 'placeholder-4',
        title: 'Case Study Placeholder 4',
        tagline: 'Real narrative content coming soon.',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        problem: 'Placeholder problem statement.',
        process: ['Placeholder process step 1', 'Placeholder process step 2'],
        outcome: 'Placeholder outcome statement.',
        heroImage: null,
        gallery: [],
    },
];

export default caseStudies;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/data/caseStudies.test.js --watchAll=false`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/caseStudies.js src/data/caseStudies.test.js
git commit -m "Add placeholder case study data model for works page"
```

---

## Task 2: CaseStudyCard component

**Files:**
- Create: `src/components/works/CaseStudyCard.jsx`
- Test: `src/components/works/CaseStudyCard.test.js`

**Interfaces:**
- Consumes: a `caseStudy` prop shaped per Task 1's schema (only `title`, `tagline`, `tech` are rendered in this task).
- Produces: `export default CaseStudyCard` — a component taking `{ caseStudy }`, rendering a fixed-size soil-patch-styled card (280×340, reusing `src/assets/patch.png`). Task 3 (`PlotRow`) renders one of these per case study.

- [ ] **Step 1: Write the failing test**

Create `src/components/works/CaseStudyCard.test.js`:

```jsx
import { render, screen } from '@testing-library/react';
import CaseStudyCard from './CaseStudyCard';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    tagline: 'A sample tagline',
    tech: ['React', 'Flask'],
};

test('renders the title, tagline, and tech list', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.getByText('React · Flask')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyCard.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './CaseStudyCard'`

- [ ] **Step 3: Write the component**

Create `src/components/works/CaseStudyCard.jsx`:

```jsx
import React from 'react';
import soilBg from '../../assets/patch.png';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 340;

const cardStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexShrink: 0,
    background: `url(${soilBg}) center/cover no-repeat`,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1.2rem',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif',
};

const CaseStudyCard = ({ caseStudy }) => (
    <div className="case-study-card" style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
            {caseStudy.title}
        </div>
        <div style={{ fontWeight: 400, fontSize: '0.95rem', color: 'var(--color-sage)', marginBottom: 8 }}>
            {caseStudy.tagline}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#F3E9D2' }}>
            {caseStudy.tech.join(' · ')}
        </div>
    </div>
);

export default CaseStudyCard;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyCard.test.js --watchAll=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/works/CaseStudyCard.jsx src/components/works/CaseStudyCard.test.js
git commit -m "Add CaseStudyCard component for works page"
```

---

## Task 3: PlotRow horizontal browsing row

**Files:**
- Create: `src/components/works/PlotRow.jsx`
- Create: `src/components/works/PlotRow.css`
- Test: `src/components/works/PlotRow.test.js`

**Interfaces:**
- Consumes: `CaseStudyCard` default export (Task 2); a `caseStudies` prop = array shaped per Task 1's schema.
- Produces: `export default PlotRow` — a component taking `{ caseStudies }`, rendering a horizontally scrollable track with one `CaseStudyCard` per entry, prev/next arrow buttons, mouse-drag-to-scroll, and `ArrowLeft`/`ArrowRight` keyboard support. Task 4 (`WorksPage`) renders this directly with the full `caseStudies` data.

- [ ] **Step 1: Write the failing tests**

Create `src/components/works/PlotRow.test.js`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import PlotRow from './PlotRow';

const sampleCaseStudies = [
    { id: 'a', title: 'A', tagline: 'Tagline A', tech: ['React'] },
    { id: 'b', title: 'B', tagline: 'Tagline B', tech: ['Flask'] },
];

test('renders one card per case study', () => {
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
});

test('clicking the right arrow scrolls the track forward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Next case study'));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 304, behavior: 'smooth' });
});

test('clicking the left arrow scrolls the track backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Previous case study'));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -304, behavior: 'smooth' });
});

test('pressing ArrowRight on the track scrolls forward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowRight' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 304, behavior: 'smooth' });
});

test('pressing ArrowLeft on the track scrolls backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowLeft' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -304, behavior: 'smooth' });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/PlotRow.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './PlotRow'`

- [ ] **Step 3: Write the stylesheet**

Create `src/components/works/PlotRow.css`:

```css
.plot-row-track {
    display: flex;
    flex-direction: row;
    gap: 24px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 1rem 3.5rem;
    scroll-behavior: smooth;
    cursor: grab;
    touch-action: pan-x;
    list-style: none;
    margin: 0;
}

.plot-row-track:active {
    cursor: grabbing;
}

.plot-row-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: var(--color-surface);
    color: var(--color-text-navy);
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.plot-row-arrow-left {
    left: 0.5rem;
}

.plot-row-arrow-right {
    right: 0.5rem;
}

@media (max-width: 700px) {
    .plot-row-track {
        padding: 1rem 3rem;
        gap: 16px;
    }
}
```

- [ ] **Step 4: Write the component**

Create `src/components/works/PlotRow.jsx`:

```jsx
import React, { useRef } from 'react';
import CaseStudyCard from './CaseStudyCard';
import './PlotRow.css';

const CARD_WIDTH = 280;
const CARD_GAP = 24;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

const PlotRow = ({ caseStudies }) => {
    const trackRef = useRef(null);
    const dragState = useRef({ dragging: false, startX: 0, startScrollLeft: 0 });

    const scrollByAmount = (amount) => {
        trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const handlePointerDown = (event) => {
        const track = trackRef.current;
        if (!track) return;
        dragState.current = {
            dragging: true,
            startX: event.clientX,
            startScrollLeft: track.scrollLeft,
        };
        track.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const track = trackRef.current;
        if (!track || !dragState.current.dragging) return;
        const delta = event.clientX - dragState.current.startX;
        track.scrollLeft = dragState.current.startScrollLeft - delta;
    };

    const handlePointerUp = (event) => {
        dragState.current.dragging = false;
        trackRef.current?.releasePointerCapture?.(event.pointerId);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollByAmount(SCROLL_AMOUNT);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollByAmount(-SCROLL_AMOUNT);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <button
                type="button"
                className="plot-row-arrow plot-row-arrow-left"
                aria-label="Previous case study"
                onClick={() => scrollByAmount(-SCROLL_AMOUNT)}
            >
                &#8249;
            </button>
            <ul
                className="plot-row-track"
                ref={trackRef}
                role="list"
                aria-label="Case studies — scroll, drag, or use arrow keys to browse"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                {caseStudies.map((caseStudy) => (
                    <li key={caseStudy.id} style={{ listStyle: 'none' }}>
                        <CaseStudyCard caseStudy={caseStudy} />
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="plot-row-arrow plot-row-arrow-right"
                aria-label="Next case study"
                onClick={() => scrollByAmount(SCROLL_AMOUNT)}
            >
                &#8250;
            </button>
        </div>
    );
};

export default PlotRow;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/PlotRow.test.js --watchAll=false`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/works/PlotRow.jsx src/components/works/PlotRow.css src/components/works/PlotRow.test.js
git commit -m "Add PlotRow horizontal browsing row with drag/keyboard/arrow navigation"
```

---

## Task 4: WorksPage

**Files:**
- Create: `src/pages/WorksPage.jsx`
- Test: `src/pages/WorksPage.test.js`

**Interfaces:**
- Consumes: `PlotRow` default export (Task 3), `caseStudies` default export (Task 1).
- Produces: `export default WorksPage` — a component with no props. Task 5 renders this at the `/works` route.

- [ ] **Step 1: Write the failing test**

Create `src/pages/WorksPage.test.js`:

```jsx
import { render, screen } from '@testing-library/react';
import WorksPage from './WorksPage';

test('renders a page heading and one card per case study', () => {
    render(<WorksPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/pages/WorksPage.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './WorksPage'`

- [ ] **Step 3: Write the component**

Create `src/pages/WorksPage.jsx`:

```jsx
import React from 'react';
import PlotRow from '../components/works/PlotRow';
import caseStudies from '../data/caseStudies';

const WorksPage = () => (
    <section
        id="works-page"
        style={{
            minHeight: '100vh',
            paddingTop: '3rem',
            paddingBottom: '4rem',
            boxSizing: 'border-box',
            color: 'var(--color-text-primary)',
            fontFamily: 'Roboto, sans-serif',
        }}
    >
        <h1
            style={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '2rem',
                marginBottom: '2rem',
                color: 'var(--color-text-primary)',
            }}
        >
            works
        </h1>
        <PlotRow caseStudies={caseStudies} />
    </section>
);

export default WorksPage;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/pages/WorksPage.test.js --watchAll=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/WorksPage.jsx src/pages/WorksPage.test.js
git commit -m "Add WorksPage shell composing PlotRow with case study data"
```

---

## Task 5: Routing — App.js restructure and route-aware Navbar

This is the task that wires everything together: install `react-router-dom`, restructure `App.js`
into `HashRouter` + `AppContent` + routes, add the route-aware scroll-fix effect, and update
`Navbar.jsx`'s three click handlers. These three changes are one task because a partial version of
any one of them (e.g. `Navbar` calling `navigate()` before `App.js` provides a `Router`) is broken,
not just incomplete.

**Files:**
- Modify: `package.json` (via `npm install`)
- Modify: `src/App.js`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/App.test.js` (currently the stale, already-failing default CRA boilerplate test —
  being replaced since it tests the exact file this task rewrites)

**Interfaces:**
- Consumes: `WorksPage` default export (Task 4); `react-router-dom`'s `HashRouter`, `Routes`,
  `Route`, `useLocation`, `useNavigate`.
- Produces: `src/App.js` default export `App` (unchanged signature — still no props, still the
  app root) and a new named export `AppContent` (no props) for test use with `MemoryRouter`.
  `Navbar.jsx` default export `Navbar` now takes **no props** (the `onWorksClick` prop is removed
  — its only caller, `App.js`, is updated in this same task).

- [ ] **Step 1: Install react-router-dom**

Run: `npm install react-router-dom@^6.26.0`

This updates `package.json` and `package-lock.json` automatically.

- [ ] **Step 2: Write the failing tests**

Replace the contents of `src/App.test.js` (previously the stale CRA boilerplate test that already
failed before this plan — it asserted `/learn react/i` text that hasn't existed in this app's UI
for a long time):

```jsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContent } from './App';

test('renders the home route by default', () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <AppContent />
        </MemoryRouter>
    );
    expect(screen.getByText(/hello, i'm/i)).toBeInTheDocument();
});

test('clicking "works" navigates to the works page', () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <AppContent />
        </MemoryRouter>
    );
    fireEvent.click(screen.getByText('works'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('works');
});

test('clicking "garden" while on /works navigates home and scrolls to the projects section', async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(
        <MemoryRouter initialEntries={['/works']}>
            <AppContent />
        </MemoryRouter>
    );
    fireEvent.click(screen.getByText('garden'));
    expect(await screen.findByText(/hello, i'm/i)).toBeInTheDocument();
    await waitFor(() => expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled());
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/App.test.js --watchAll=false`
Expected: FAIL — `AppContent` is not exported from `./App` yet, and `Navbar`'s "works" click still
opens the (now-removed-from-this-test) modal flow.

- [ ] **Step 4: Rewrite App.js**

Replace the entire contents of `src/App.js`:

```jsx
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import WorksPage from './pages/WorksPage';
import './App.css';

const MAX_SCROLL_RETRIES = 20;

export function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = location.state?.scrollTarget;
    if (!target) return undefined;

    let attempts = 0;
    let frameId;

    const tryScroll = () => {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        navigate(location.pathname, { replace: true, state: null });
        return;
      }
      attempts += 1;
      if (attempts < MAX_SCROLL_RETRIES) {
        frameId = requestAnimationFrame(tryScroll);
      }
    };

    frameId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={(
            <>
              <Hero />
              <Resume />
              <Projects />
              <Footer />
            </>
          )}
        />
        <Route path="/works" element={<WorksPage />} />
      </Routes>
      <ScrollToTopButton />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 5: Rewrite Navbar.jsx**

Replace the entire contents of `src/components/Navbar.jsx`:

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // Make sure the logo is named logo.png in assets
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const logoRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleWorksClick = () => {
        navigate('/works');
    };

    const handleGardenClick = () => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTarget: 'projects-section' } });
            return;
        }
        document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogoClick = () => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTarget: 'hero-section' } });
            return;
        }
        const hero = document.getElementById('hero-section');
        if (hero) {
            const top = hero.getBoundingClientRect().top + window.scrollY;
            if (window.scrollY <= top + 10) {
                // Already at top, trigger bounce
                const title = document.getElementById('hero-title');
                if (title) {
                    title.classList.remove('bounce-up');
                    void title.offsetWidth; // force reflow
                    title.classList.add('bounce-up');
                }
            } else {
                hero.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 80,
            padding: '2rem 0 1.2rem 0',
            fontSize: '1.1rem',
            background: scrolled ? 'var(--color-nav-scrolled-bg)' : 'transparent',
            width: '100vw',
            left: 0,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background 0.3s, box-shadow 0.3s',
            backdropFilter: scrolled ? 'blur(4px)' : 'none',
        }}>
            <span style={{ cursor: 'pointer', color: 'var(--color-text-primary)', fontWeight: 700, fontFamily: 'Roboto, sans-serif' }} onClick={handleWorksClick}>works</span>
            <img ref={logoRef} src={logo} alt="Karen Agustino Logo" style={{ height: 54, margin: '0 18px', cursor: 'pointer' }} onClick={handleLogoClick} />
            <span style={{ cursor: 'pointer', color: 'var(--color-text-primary)', fontWeight: 700, fontFamily: 'Roboto, sans-serif' }} onClick={handleGardenClick}>garden</span>
            <ThemeToggle />
        </nav>
    );
};

export default Navbar;
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/App.test.js --watchAll=false`
Expected: PASS (3 tests)

- [ ] **Step 7: Run the full test suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: All test suites pass (Task 1–4's tests plus this task's).

- [ ] **Step 8: Run the production build**

Run: `CI=true npm run build`
Expected: `Compiled successfully.`

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/App.js src/App.test.js src/components/Navbar.jsx
git commit -m "Add HashRouter-based /works route and make Navbar route-aware"
```

---

## Task 6: End-to-end manual verification

No new files — this task confirms the interaction details that can't be meaningfully asserted in
jsdom (real mouse drag, real touch scroll, real layout) actually work in a browser, and that the
five prior tasks integrate correctly as a whole.

- [ ] **Step 1: Start the dev server**

Run: `npm start`

Wait for it to report the local URL (typically `http://localhost:3000`).

- [ ] **Step 2: Verify routing**

In a browser, open the dev server URL. Confirm the home page (Hero/Resume/Projects/Footer) loads
at the bare URL. Click "works" in the nav. Confirm the URL becomes `.../#/works` and the works page
(heading "works" + a row of 4 placeholder cards) renders. Reload the page while on `.../#/works` —
confirm it still renders the works page (this is the behavior `HashRouter` gives for free that
`BrowserRouter` would not on GitHub Pages).

- [ ] **Step 3: Verify PlotRow interaction**

On the works page: click and hold the mouse on the card row, drag left and right, confirm the row
scrolls with the drag. Click the left/right arrow buttons, confirm the row scrolls by one card
each time. Click into the row to focus it, press the `ArrowLeft`/`ArrowRight` keys, confirm the row
scrolls. Resize the browser to a narrow (~375px) width and confirm the row is still usable via
touch/drag and that scrolling the row does **not** cause the whole page to scroll horizontally.

- [ ] **Step 4: Verify route-aware Navbar fixes**

While on `.../#/works`, click "garden" in the nav. Confirm it navigates to the home page and
smooth-scrolls down to the "the garden of projects" section. Navigate back to `.../#/works`, click
the logo. Confirm it navigates to the home page and smooth-scrolls to the hero section. From the
home page itself, confirm "garden" and the logo still behave exactly as before (immediate scroll,
logo bounce when already at the top) — this is a regression check on behavior that predates this
plan.

- [ ] **Step 5: Stop the dev server**

Press `Ctrl+C` in the terminal running `npm start`.

This plan is complete once Steps 2–4 all check out.
