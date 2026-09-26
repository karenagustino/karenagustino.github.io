# Works Home-Page Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold the standalone `/works` route into a new home-page section styled like "the garden of projects," redesign its cards as hero-image tiles that expand in place to show text, and remove the now-unnecessary `react-router-dom` routing.

**Architecture:** The existing `PlotRow`/`CaseStudyCard` browsing row is reused and upgraded in place (wider cards, click-to-expand). A new `Works.jsx` section (sibling to `Projects.jsx`) composes it with a Garden-styled header. `App.js` and `Navbar.jsx` revert to the pre-routing single-page pattern (no `HashRouter`), since nothing else needs a second route once `/works` folds into the home page.

**Tech Stack:** React 18.2.0, CRA/react-scripts 5 (Jest + React Testing Library), existing CSS-custom-property theme system (`index.css`). Removes `react-router-dom` (no longer needed).

**Spec:** `docs/superpowers/specs/2026-09-26-works-home-section-design.md`

## Global Constraints

- No new styling architecture: inline style objects, with a companion `.css` file only for hover/transition/pseudo-class states inline styles can't express — matching `Hero.css`, `Resume.css`, `ThemeToggle.css`, `PlotRow.css`.
- Reuse existing CSS custom properties (`--color-text-primary`, `--color-sage`, `--color-surface`, `--color-text-navy`, `--color-nav-scrolled-bg`) for anything theme-sensitive — no new hardcoded colors beyond what's already established in `CaseStudyCard.jsx` (`#fff` / `#F3E9D2` on the fixed photo background, matching `Projects.jsx`'s own precedent).
- Do not modify: `Hero.jsx`, `Resume.jsx`, `Footer.jsx`, `useTheme.js`, any `index.css` color token definition, `WorksModal.jsx`, `UnderConstruction.jsx` (all stay untouched/unused, as they've been since the previous branch).
- `PlotRow.jsx`/`PlotRow.css`/`CaseStudyCard.jsx` stay at their current path (`src/components/works/`) — not moved.
- Card dimensions: collapsed `380×260`, expanded width `min(640px, 90vw)` (height stays `260`, `overflow-y: auto` if content overflows).
- Remove `react-router-dom` entirely; `App.js`/`Navbar.jsx` revert to a plain single-page composition (no `HashRouter`, no route-awareness).
- Every task's tests run via `CI=true npx react-scripts test <path> --watchAll=false`; Task 4's final checks also run the full suite and `CI=true npm run build`.

---

## Task 1: CaseStudyCard redesign — hero tile + click-to-expand

**Files:**
- Modify: `src/components/works/CaseStudyCard.jsx`
- Modify: `src/components/works/CaseStudyCard.test.js`
- Create: `src/components/works/CaseStudyCard.css`

**Interfaces:**
- Consumes: a `caseStudy` prop shaped `{ id, title, tagline, tech[], role, timeframe, problem, process[], outcome }` (matches `src/data/caseStudies.js`'s existing schema — no schema changes).
- Produces: `export default CaseStudyCard` — same shape as before (`{ caseStudy }` prop), now `380×260` collapsed / `min(640px, 90vw)×260` expanded, with internal click-to-expand state. Task 2 (`PlotRow`) renders one of these per case study, unchanged from how it already does.

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/components/works/CaseStudyCard.test.js`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import CaseStudyCard from './CaseStudyCard';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    tagline: 'A sample tagline',
    tech: ['React', 'Flask'],
    role: 'Lead Developer',
    timeframe: 'Jan 2025 - Mar 2025',
    problem: 'Users could not find the checkout button.',
    process: ['Interviewed 5 users', 'Redesigned the checkout flow'],
    outcome: 'Checkout completion rate rose by 20%.',
};

test('renders the title, tagline, and tech list when collapsed', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.getByText('React · Flask')).toBeInTheDocument();
});

test('clicking the card expands it to show problem, process, and outcome text', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    fireEvent.click(screen.getByText('Sample Project'));

    expect(screen.getByText(sampleCaseStudy.problem)).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[0])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[1])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.outcome)).toBeInTheDocument();
    expect(screen.queryByText('A sample tagline')).not.toBeInTheDocument();
});

test('clicking the expanded card body collapses it again', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    fireEvent.click(screen.getByText('Sample Project'));
    fireEvent.click(screen.getByText(sampleCaseStudy.outcome));

    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.queryByText(sampleCaseStudy.problem)).not.toBeInTheDocument();
});

test('clicking the close button collapses the expanded card', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    fireEvent.click(screen.getByText('Sample Project'));
    fireEvent.click(screen.getByLabelText('Collapse case study'));

    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.queryByText(sampleCaseStudy.problem)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyCard.test.js --watchAll=false`
Expected: FAIL — expand/collapse tests fail because the current component has no click behavior or expanded content.

- [ ] **Step 3: Write the stylesheet**

Create `src/components/works/CaseStudyCard.css`:

```css
.case-study-card {
    transition: transform 0.18s cubic-bezier(0.4, 2, 0.6, 1), width 0.3s ease;
}

.case-study-card:hover:not(.case-study-card--expanded) {
    transform: translateY(-8px) scale(1.03);
}

.case-study-card-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #fff;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    padding: 4px 8px;
}
```

- [ ] **Step 4: Rewrite the component**

Replace the entire contents of `src/components/works/CaseStudyCard.jsx`:

```jsx
import React, { useState } from 'react';
import soilBg from '../../assets/patch.png';
import './CaseStudyCard.css';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 260;
const EXPANDED_WIDTH = 640;

const collapsedBackground = `url(${soilBg}) center/cover no-repeat`;
const expandedBackground = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${soilBg}) center/cover no-repeat`;

const CaseStudyCard = ({ caseStudy }) => {
    const [expanded, setExpanded] = useState(false);

    const cardStyle = {
        width: expanded ? `min(${EXPANDED_WIDTH}px, 90vw)` : CARD_WIDTH,
        height: CARD_HEIGHT,
        flexShrink: 0,
        background: expanded ? expandedBackground : collapsedBackground,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: expanded ? 'flex-start' : 'flex-end',
        padding: '1.2rem',
        boxSizing: 'border-box',
        fontFamily: 'Roboto, sans-serif',
        position: 'relative',
        overflowY: expanded ? 'auto' : 'hidden',
        cursor: 'pointer',
    };

    const handleClose = (event) => {
        event.stopPropagation();
        setExpanded(false);
    };

    if (expanded) {
        return (
            <div
                className="case-study-card case-study-card--expanded"
                style={cardStyle}
                onClick={handleClose}
            >
                <button
                    type="button"
                    className="case-study-card-close"
                    aria-label="Collapse case study"
                    onClick={handleClose}
                >
                    ×
                </button>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
                    {caseStudy.title}
                </div>
                <div style={{ fontWeight: 400, fontSize: '0.85rem', color: '#F3E9D2', marginBottom: 10 }}>
                    {caseStudy.role} · {caseStudy.timeframe}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8 }}>
                    {caseStudy.problem}
                </div>
                <ul style={{ margin: '0 0 8px 0', paddingLeft: 18, fontSize: '0.85rem', color: '#F3E9D2' }}>
                    {caseStudy.process.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ul>
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                    {caseStudy.outcome}
                </div>
            </div>
        );
    }

    return (
        <div
            className="case-study-card"
            style={cardStyle}
            onClick={() => setExpanded(true)}
        >
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
                {caseStudy.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.95rem', color: '#F3E9D2', marginBottom: 8 }}>
                {caseStudy.tagline}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#F3E9D2' }}>
                {caseStudy.tech.join(' · ')}
            </div>
        </div>
    );
};

export default CaseStudyCard;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyCard.test.js --watchAll=false`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/works/CaseStudyCard.jsx src/components/works/CaseStudyCard.test.js src/components/works/CaseStudyCard.css
git commit -m "Redesign CaseStudyCard as an expandable hero-tile"
```

---

## Task 2: PlotRow — new card width + drag-vs-click suppression

**Files:**
- Modify: `src/components/works/PlotRow.jsx`
- Modify: `src/components/works/PlotRow.test.js`

**Interfaces:**
- Consumes: `CaseStudyCard` default export (Task 1, now `380×260`).
- Produces: `export default PlotRow` — same `{ caseStudies }` prop shape as before. A real pointer-drag no longer also triggers a card's click-to-expand. Task 3 (`Works`) renders this directly, unchanged from how it will.

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/components/works/PlotRow.test.js`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import PlotRow from './PlotRow';

const sampleCaseStudies = [
    {
        id: 'a', title: 'A', tagline: 'Tagline A', tech: ['React'],
        role: 'Developer', timeframe: '2024', problem: 'Problem A',
        process: ['Step A1'], outcome: 'Outcome A',
    },
    {
        id: 'b', title: 'B', tagline: 'Tagline B', tech: ['Flask'],
        role: 'Developer', timeframe: '2024', problem: 'Problem B',
        process: ['Step B1'], outcome: 'Outcome B',
    },
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
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 404, behavior: 'smooth' });
});

test('clicking the left arrow scrolls the track backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Previous case study'));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -404, behavior: 'smooth' });
});

test('pressing ArrowRight on the track scrolls forward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowRight' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 404, behavior: 'smooth' });
});

test('pressing ArrowLeft on the track scrolls backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowLeft' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -404, behavior: 'smooth' });
});

test('a real drag does not also expand the card underneath', () => {
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    const track = screen.getByRole('list');
    const card = screen.getByText('A');

    fireEvent.pointerDown(card, { pointerType: 'mouse', clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 50, pointerId: 1 });
    fireEvent.pointerUp(card, { pointerId: 1 });
    fireEvent.click(card);

    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/PlotRow.test.js --watchAll=false`
Expected: FAIL — the arrow/keyboard tests expect `left: 404`/`-404` but the current code still computes `304`; the drag test fails because nothing suppresses the click yet (the card expands, so `Problem A` IS in the document).

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `src/components/works/PlotRow.jsx`:

```jsx
import React, { useRef } from 'react';
import CaseStudyCard from './CaseStudyCard';
import './PlotRow.css';

const CARD_WIDTH = 380;
const CARD_GAP = 24;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;
const DRAG_THRESHOLD = 5;

const PlotRow = ({ caseStudies }) => {
    const trackRef = useRef(null);
    const dragState = useRef({ dragging: false, startX: 0, startScrollLeft: 0, wasDrag: false });

    const scrollByAmount = (amount) => {
        trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const handlePointerDown = (event) => {
        if (event.pointerType !== 'mouse') return;
        const track = trackRef.current;
        if (!track) return;
        dragState.current = {
            dragging: true,
            startX: event.clientX,
            startScrollLeft: track.scrollLeft,
            wasDrag: false,
        };
        track.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const track = trackRef.current;
        if (!track || !dragState.current.dragging) return;
        const delta = event.clientX - dragState.current.startX;
        if (Math.abs(delta) > DRAG_THRESHOLD) {
            dragState.current.wasDrag = true;
        }
        track.scrollLeft = dragState.current.startScrollLeft - delta;
    };

    const handlePointerUp = (event) => {
        dragState.current.dragging = false;
        trackRef.current?.releasePointerCapture?.(event.pointerId);
    };

    const handleTrackClickCapture = (event) => {
        if (dragState.current.wasDrag) {
            event.preventDefault();
            event.stopPropagation();
            dragState.current.wasDrag = false;
        }
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
                aria-label="Case studies — scroll, drag, or use arrow keys to browse"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClickCapture={handleTrackClickCapture}
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/PlotRow.test.js --watchAll=false`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/works/PlotRow.jsx src/components/works/PlotRow.test.js
git commit -m "Update PlotRow for the wider cards and suppress click-through after a drag"
```

---

## Task 3: Works section component

**Files:**
- Create: `src/components/Works.jsx`
- Create: `src/components/Works.test.js`

**Interfaces:**
- Consumes: `PlotRow` default export (Task 2, from `./works/PlotRow`), `caseStudies` default export (`../data/caseStudies`, unchanged, 4 entries).
- Produces: `export default Works` — a component with no props. Task 4 renders this in `App.js` between `Resume` and `Projects`.

- [ ] **Step 1: Write the failing test**

Create `src/components/Works.test.js`:

```jsx
import { render, screen } from '@testing-library/react';
import Works from './Works';

test('renders a heading and one card per case study', () => {
    render(<Works />);
    expect(screen.getByRole('heading', { level: 2, name: /the garden of case studies/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/components/Works.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './Works'`

- [ ] **Step 3: Write the component**

Create `src/components/Works.jsx`:

```jsx
import React from 'react';
import PlotRow from './works/PlotRow';
import caseStudies from '../data/caseStudies';

const Works = () => (
    <section id="works-section" style={{
        margin: '0 auto',
        maxWidth: 1200,
        padding: '2.5rem 0 4rem 0',
        background: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        position: 'relative',
    }}>
        <h2 style={{ textAlign: 'center', color: 'var(--color-text-primary)', fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>
            <span role="img" aria-label="potted plant">🪴</span> the garden of case studies
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-sage)', fontFamily: 'Roboto, sans-serif', fontStyle: 'italic', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            deeper roots behind the garden
        </p>
        <PlotRow caseStudies={caseStudies} />
    </section>
);

export default Works;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/components/Works.test.js --watchAll=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Works.jsx src/components/Works.test.js
git commit -m "Add Works section composing PlotRow with case study data"
```

---

## Task 4: Remove routing — App.js/Navbar.jsx revert, wire in Works, delete WorksPage

This is the integration task: installs nothing (it *removes* `react-router-dom`), reverts `App.js`
and `Navbar.jsx` to a single-page composition, wires in the new `Works` section, and deletes the
now-unused `src/pages/` route.

**Files:**
- Modify: `package.json` (via `npm uninstall`)
- Modify: `src/App.js`
- Modify: `src/App.test.js`
- Modify: `src/components/Navbar.jsx`
- Delete: `src/pages/WorksPage.jsx`
- Delete: `src/pages/WorksPage.test.js`
- Delete: `src/pages/` (directory, now empty)

**Interfaces:**
- Consumes: `Works` default export (Task 3, from `./components/Works`).
- Produces: `src/App.js` default export `App` (no props, no longer wraps a router). `Navbar.jsx`
  default export `Navbar` continues to take no props, same as it already does.

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/App.test.js`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page content', () => {
    render(<App />);
    expect(screen.getByText(/hello, i'm/i)).toBeInTheDocument();
});

test('clicking "works" scrolls to the works section', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(<App />);
    fireEvent.click(screen.getByText('works'));
    const worksSection = document.getElementById('works-section');
    expect(worksSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
});

test('clicking "garden" scrolls to the projects section', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(<App />);
    fireEvent.click(screen.getByText('garden'));
    const projectsSection = document.getElementById('projects-section');
    expect(projectsSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/App.test.js --watchAll=false`
Expected: FAIL — clicking "works" currently calls `navigate('/works')`, not `scrollIntoView`, so the
mock is never invoked with the expected argument.

- [ ] **Step 3: Rewrite Navbar.jsx**

Replace the entire contents of `src/components/Navbar.jsx`:

```jsx
import React, { useRef, useEffect, useState } from 'react';
import logo from '../assets/logo.png'; // Make sure the logo is named logo.png in assets
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const logoRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleWorksClick = () => {
        document.getElementById('works-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleGardenClick = () => {
        document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogoClick = () => {
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

- [ ] **Step 4: Rewrite App.js**

Replace the entire contents of `src/App.js`:

```jsx
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Works from './components/Works';
import Projects from './components/Projects';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Resume />
      <Works />
      <Projects />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default App;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/App.test.js --watchAll=false`
Expected: PASS (3 tests)

- [ ] **Step 6: Delete the old /works route files**

```bash
rm src/pages/WorksPage.jsx src/pages/WorksPage.test.js
rmdir src/pages
```

- [ ] **Step 7: Remove react-router-dom**

Run: `npm uninstall react-router-dom`

This updates `package.json` and `package-lock.json` automatically, and removes it from
`node_modules`.

- [ ] **Step 8: Run the full test suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: All test suites pass (Tasks 1-4's tests; `useTheme.test.js` and `caseStudies.test.js` are
unaffected by this plan and should still pass unchanged).

- [ ] **Step 9: Run the production build**

Run: `CI=true npm run build`
Expected: `Compiled successfully.`

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json src/App.js src/App.test.js src/components/Navbar.jsx
git rm src/pages/WorksPage.jsx src/pages/WorksPage.test.js
git commit -m "Remove react-router-dom; fold /works into the home page via the Works section"
```

---

## Task 5: End-to-end manual verification

No new files — this task confirms the interaction details that can't be meaningfully asserted in
jsdom (real hover motion, real click-to-expand feel, real layout at mobile width), and that the
four prior tasks integrate correctly as a whole.

- [ ] **Step 1: Start the dev server**

Run: `npm start`

Wait for it to report the local URL (typically `http://localhost:3000`).

- [ ] **Step 2: Verify the section and navigation**

In a browser, open the dev server URL. Confirm the page order top to bottom is: Hero, Resume, "the
garden of case studies" (Works), "the garden of projects" (Projects), Footer. Click "works" in the
nav — confirm it smooth-scrolls to the new Works section (not a URL change — there is no more
routing). Click "garden" — confirm it still smooth-scrolls to the Projects section, exactly as
before. Click the logo from partway down the page — confirm it smooth-scrolls back to the hero;
click it again while already at the top — confirm the title bounce animation still plays.

- [ ] **Step 3: Verify card hover and expand**

On the Works section: hover over a collapsed card, confirm it lifts/scales per the existing
`Projects.jsx` card hover feel. Click a card — confirm it grows in place and swaps its image for
text (role/timeframe, problem, process steps, outcome), and that neighboring cards are unaffected.
Click the `×` — confirm it collapses back to the image tile. Expand a second card without
collapsing the first — confirm both can be open at once without breaking layout.

- [ ] **Step 4: Verify drag/scroll still works, and doesn't fight the expand click**

Click-and-drag across the row — confirm it scrolls smoothly and does **not** also pop open the card
you started the drag on. Use the arrow buttons and `ArrowLeft`/`ArrowRight` keys — confirm both
still scroll the row. Resize the browser to a narrow (~375px) width — confirm an expanded card's
width shrinks to fit the viewport (no horizontal page overflow) and the row itself still scrolls via
touch/drag.

- [ ] **Step 5: Stop the dev server**

Press `Ctrl+C` in the terminal running `npm start`.

This plan is complete once Steps 2–4 all check out.
