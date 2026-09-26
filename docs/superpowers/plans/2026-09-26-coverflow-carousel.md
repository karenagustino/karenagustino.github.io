# Coverflow Carousel & Overlay Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the horizontal-scroll case-study row with a 3D coverflow carousel (centered active
card, receding side cards) and replace the expand-in-place text reveal with a floating overlay
positioned over the active card.

**Architecture:** A new pure math module (`coverflowMath.js`) computes each card's 3D transform as a
function of its distance from the active card. `PlotRow` is renamed to `PlotStage` and becomes the
sole owner of carousel state (`activeIndex`, live drag offset, whether the overlay is open).
`CaseStudyCard` loses all internal state and becomes a pure presentational tile that renders
whatever position style it's handed. A new `CaseStudyOverlay` component renders the case study's
text detail as a floating panel, mounted by `PlotStage` only while a card is "open."

**Tech Stack:** React 18.2.0, CRA/react-scripts 5 (Jest + React Testing Library), the existing
`window.PointerEvent` polyfill and `window.matchMedia` mock already in `src/setupTests.js`.

**Spec:** `docs/superpowers/specs/2026-09-26-coverflow-carousel-design.md`

## Global Constraints

- No new styling architecture: inline style objects, with a companion `.css` file only for
  hover/transition/keyframes/pseudo-class states inline styles can't express — matches every other
  component in this codebase.
- Card and overlay colors are fixed hex, not CSS custom properties (deliberately independent of the
  site's light/dark toggle, same reasoning as the current code's existing `#fff`/`#F3E9D2`
  exception): background `linear-gradient(135deg, #1B1F2A 0%, #262B36 100%)`, title text `#fff`,
  tagline/tech/role/process text `#A9B8D6`.
- Arrow buttons keep reusing existing CSS custom properties (`--color-surface`, `--color-text-navy`)
  — unchanged from the current `PlotRow.css`, just renamed selectors.
- Do not modify: `Hero.jsx`, `Resume.jsx`, `Footer.jsx`, `useTheme.js`, any `index.css` color token
  definition, `WorksModal.jsx`, `UnderConstruction.jsx`, `src/data/caseStudies.js` (schema/content
  unchanged).
- Exact constants (use these values verbatim, they are referenced by name across tasks):
  `CARD_WIDTH = 380`, `CARD_HEIGHT = 260` (in `CaseStudyCard.jsx`); `STAGE_HEIGHT = 340`,
  `PIXELS_PER_CARD = 160`, `DRAG_THRESHOLD = 5` (in `PlotStage.jsx`); `OVERLAY_WIDTH = 480`,
  `OVERLAY_HEIGHT = 320` (in `CaseStudyOverlay.jsx`).
- The `SLOTS` table in `coverflowMath.js` is exactly 4 rows (distances 0, 1, 2, 3) — see Task 1.
- Every task's tests run via `CI=true npx react-scripts test <path> --watchAll=false`; Task 4's
  final build check runs via `CI=true npm run build`.

---

## Task 1: Coverflow transform math

**Files:**
- Create: `src/components/works/coverflowMath.js`
- Test: `src/components/works/coverflowMath.test.js`

**Interfaces:**
- Produces: `export const SLOTS` (array of 4 `{z, rotate, x, scale, opacity, zIndex}` rows),
  `export function interpolateSlot(distance)` returning `{z, rotate, x, scale, opacity, zIndex}` for
  any real-numbered `distance`, and `export function cardTransformStyle(distance, isActive)`
  returning `{transform, opacity, zIndex, pointerEvents}`. Task 4 (`PlotStage`) imports and calls
  `cardTransformStyle` once per case study on every render.

- [ ] **Step 1: Write the failing tests**

Create `src/components/works/coverflowMath.test.js`:

```js
import { SLOTS, interpolateSlot, cardTransformStyle } from './coverflowMath';

test('SLOTS has exactly 4 rows', () => {
    expect(SLOTS).toHaveLength(4);
});

test('interpolateSlot(0) returns the identity slot', () => {
    expect(interpolateSlot(0)).toEqual({
        z: 0, rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 100,
    });
});

test('interpolateSlot(1) matches SLOTS[1] exactly', () => {
    expect(interpolateSlot(1)).toEqual({
        z: -300, rotate: 38, x: 54, scale: 0.86, opacity: 0.55, zIndex: 99,
    });
});

test('interpolateSlot(-1) mirrors x and rotate but keeps z/scale/opacity/zIndex unsigned', () => {
    expect(interpolateSlot(-1)).toEqual({
        z: -300, rotate: -38, x: -54, scale: 0.86, opacity: 0.55, zIndex: 99,
    });
});

test('interpolateSlot(1.5) is the midpoint between SLOTS[1] and SLOTS[2]', () => {
    const result = interpolateSlot(1.5);
    expect(result.z).toBeCloseTo(-450);
    expect(result.rotate).toBeCloseTo(57);
    expect(result.x).toBeCloseTo(81);
    expect(result.scale).toBeCloseTo(0.79);
    expect(result.opacity).toBeCloseTo(0.385);
});

test('interpolateSlot clamps beyond the last slot, in both directions', () => {
    expect(interpolateSlot(5)).toEqual({
        z: -900, rotate: 38, x: 162, scale: 0.5, opacity: 0, zIndex: 98,
    });
    expect(interpolateSlot(-5)).toEqual({
        z: -900, rotate: -38, x: -162, scale: 0.5, opacity: 0, zIndex: 98,
    });
});

test('cardTransformStyle produces a ready-to-use style object for the active card', () => {
    const style = cardTransformStyle(0, true);
    expect(style.transform).toBe('translate3d(0%, 0, 0px) rotateY(0deg) scale(1)');
    expect(style.opacity).toBe(1);
    expect(style.zIndex).toBe(100);
    expect(style.pointerEvents).toBe('auto');
});

test('cardTransformStyle marks far-away cards as non-interactive', () => {
    const style = cardTransformStyle(3, false);
    expect(style.opacity).toBe(0);
    expect(style.pointerEvents).toBe('none');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/coverflowMath.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './coverflowMath'`

- [ ] **Step 3: Write the module**

Create `src/components/works/coverflowMath.js`:

```js
export const SLOTS = [
    { z: 0, rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 100 },
    { z: -300, rotate: 38, x: 54, scale: 0.86, opacity: 0.55, zIndex: 99 },
    { z: -600, rotate: 76, x: 108, scale: 0.72, opacity: 0.22, zIndex: 98 },
    { z: -900, rotate: 38, x: 162, scale: 0.5, opacity: 0, zIndex: 98 },
];

const MAX_SLOT_INDEX = SLOTS.length - 1;

export function interpolateSlot(distance) {
    const sign = distance < 0 ? -1 : 1;
    const abs = Math.abs(distance);
    const clamped = Math.min(abs, MAX_SLOT_INDEX);
    const lowerIndex = Math.floor(clamped);
    const upperIndex = Math.min(lowerIndex + 1, MAX_SLOT_INDEX);
    const frac = clamped - lowerIndex;

    const lower = SLOTS[lowerIndex];
    const upper = SLOTS[upperIndex];
    const lerp = (a, b) => a + (b - a) * frac;

    const nearestIndex = Math.min(Math.round(clamped), MAX_SLOT_INDEX);

    return {
        z: lerp(lower.z, upper.z),
        rotate: sign * lerp(lower.rotate, upper.rotate),
        x: sign * lerp(lower.x, upper.x),
        scale: lerp(lower.scale, upper.scale),
        opacity: lerp(lower.opacity, upper.opacity),
        zIndex: SLOTS[nearestIndex].zIndex,
    };
}

export function cardTransformStyle(distance, isActive) {
    const { z, rotate, x, scale, opacity, zIndex } = interpolateSlot(distance);
    return {
        transform: `translate3d(${x}%, 0, ${z}px) rotateY(${rotate}deg) scale(${scale})`,
        opacity,
        zIndex: isActive ? 100 : zIndex,
        pointerEvents: opacity <= 0.02 ? 'none' : 'auto',
    };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/coverflowMath.test.js --watchAll=false`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/works/coverflowMath.js src/components/works/coverflowMath.test.js
git commit -m "Add coverflow transform math module"
```

---

## Task 2: CaseStudyCard — presentational rewrite

**Files:**
- Modify: `src/components/works/CaseStudyCard.jsx`
- Modify: `src/components/works/CaseStudyCard.test.js`
- Modify: `src/components/works/CaseStudyCard.css`

**Interfaces:**
- Consumes: nothing from Task 1 directly (the caller computes `positionStyle` and passes it in).
- Produces: `export default CaseStudyCard` — a component taking
  `{ caseStudy, positionStyle, isActive, onClick }`. `caseStudy` needs only `title`, `tagline`,
  `tech` (matching `src/data/caseStudies.js`'s schema — other fields are ignored by this
  component). `positionStyle` is spread onto the card's root element (its shape matches
  `cardTransformStyle`'s return value from Task 1, but this component doesn't need to know that —
  it just spreads whatever object it's given). Task 4 (`PlotStage`) renders one of these per case
  study and supplies `positionStyle`/`isActive`/`onClick`.

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
};

const samplePositionStyle = {
    transform: 'translate3d(0%, 0, 0px) rotateY(0deg) scale(1)',
    opacity: 1,
    zIndex: 100,
    pointerEvents: 'auto',
};

test('renders the title, tagline, and tech list', () => {
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={() => {}}
        />
    );
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.getByText('React · Flask')).toBeInTheDocument();
});

test('has an accessible label and is keyboard-focusable when active', () => {
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={() => {}}
        />
    );
    expect(screen.getByLabelText('Sample Project — open full screen')).toHaveAttribute('tabindex', '0');
});

test('is not keyboard-focusable when not active', () => {
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive={false}
            onClick={() => {}}
        />
    );
    expect(screen.getByLabelText('Sample Project — open full screen')).toHaveAttribute('tabindex', '-1');
});

test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={handleClick}
        />
    );
    fireEvent.click(screen.getByText('Sample Project'));
    expect(handleClick).toHaveBeenCalledTimes(1);
});

test('calls onClick when Enter is pressed', () => {
    const handleClick = jest.fn();
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={handleClick}
        />
    );
    fireEvent.keyDown(screen.getByText('Sample Project'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyCard.test.js --watchAll=false`
Expected: FAIL — the current component has no `positionStyle`/`isActive` props and a different
aria-label, so several assertions fail.

- [ ] **Step 3: Rewrite the stylesheet**

Replace the entire contents of `src/components/works/CaseStudyCard.css`:

```css
.case-study-card {
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
}
```

- [ ] **Step 4: Rewrite the component**

Replace the entire contents of `src/components/works/CaseStudyCard.jsx`:

```jsx
import React from 'react';
import './CaseStudyCard.css';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 260;

const cardBackground = 'linear-gradient(135deg, #1B1F2A 0%, #262B36 100%)';

const CaseStudyCard = ({ caseStudy, positionStyle, isActive, onClick }) => {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    const cardStyle = {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -CARD_WIDTH / 2,
        background: cardBackground,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1.2rem',
        boxSizing: 'border-box',
        fontFamily: 'Roboto, sans-serif',
        cursor: 'pointer',
        ...positionStyle,
    };

    return (
        <div
            className="case-study-card"
            style={cardStyle}
            role="button"
            tabIndex={isActive ? 0 : -1}
            aria-label={`${caseStudy.title} — open full screen`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
                {caseStudy.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.95rem', color: '#A9B8D6', marginBottom: 8 }}>
                {caseStudy.tagline}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#A9B8D6' }}>
                {caseStudy.tech.join(' · ')}
            </div>
        </div>
    );
};

export default CaseStudyCard;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyCard.test.js --watchAll=false`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/works/CaseStudyCard.jsx src/components/works/CaseStudyCard.test.js src/components/works/CaseStudyCard.css
git commit -m "Rewrite CaseStudyCard as a presentational coverflow tile"
```

---

## Task 3: CaseStudyOverlay

**Files:**
- Create: `src/components/works/CaseStudyOverlay.jsx`
- Create: `src/components/works/CaseStudyOverlay.css`
- Test: `src/components/works/CaseStudyOverlay.test.js`

**Interfaces:**
- Consumes: nothing from Tasks 1-2.
- Produces: `export default CaseStudyOverlay` — a component taking `{ caseStudy, onClose }`.
  `caseStudy` needs `title`, `role`, `timeframe`, `problem`, `process` (array), `outcome` — matching
  `src/data/caseStudies.js`'s schema. Task 4 (`PlotStage`) renders this conditionally, passing the
  currently-active case study and a callback that closes it.

- [ ] **Step 1: Write the failing tests**

Create `src/components/works/CaseStudyOverlay.test.js`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import CaseStudyOverlay from './CaseStudyOverlay';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    role: 'Lead Developer',
    timeframe: 'Jan 2025 - Mar 2025',
    problem: 'Users could not find the checkout button.',
    process: ['Interviewed 5 users', 'Redesigned the checkout flow'],
    outcome: 'Checkout completion rate rose by 20%.',
};

test('renders the case study detail text', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.problem)).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[0])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[1])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.outcome)).toBeInTheDocument();
});

test('clicking the close button calls onClose', () => {
    const handleClose = jest.fn();
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Close case study'));
    expect(handleClose).toHaveBeenCalledTimes(1);
});

test('clicking the overlay body calls onClose', () => {
    const handleClose = jest.fn();
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={handleClose} />);
    fireEvent.click(screen.getByText(sampleCaseStudy.outcome));
    expect(handleClose).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyOverlay.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './CaseStudyOverlay'`

- [ ] **Step 3: Write the stylesheet**

Create `src/components/works/CaseStudyOverlay.css`:

```css
.case-study-overlay {
    animation: case-study-overlay-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes case-study-overlay-in {
    from {
        opacity: 0;
        transform: scale(0.85);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.case-study-overlay-close {
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

- [ ] **Step 4: Write the component**

Create `src/components/works/CaseStudyOverlay.jsx`:

```jsx
import React from 'react';
import './CaseStudyOverlay.css';

const OVERLAY_WIDTH = 480;
const OVERLAY_HEIGHT = 320;

const CaseStudyOverlay = ({ caseStudy, onClose }) => {
    const handleBodyClick = (event) => {
        event.stopPropagation();
        onClose();
    };

    return (
        <div
            className="case-study-overlay"
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: OVERLAY_WIDTH,
                height: OVERLAY_HEIGHT,
                marginLeft: -OVERLAY_WIDTH / 2,
                marginTop: -OVERLAY_HEIGHT / 2,
                zIndex: 200,
                background: 'linear-gradient(135deg, #1B1F2A 0%, #262B36 100%)',
                borderRadius: 12,
                padding: '1.5rem',
                boxSizing: 'border-box',
                overflowY: 'auto',
                cursor: 'pointer',
                fontFamily: 'Roboto, sans-serif',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
            }}
            onClick={handleBodyClick}
        >
            <button
                type="button"
                className="case-study-overlay-close"
                aria-label="Close case study"
                onClick={handleBodyClick}
            >
                ×
            </button>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
                {caseStudy.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.9rem', color: '#A9B8D6', marginBottom: 12 }}>
                {caseStudy.role} · {caseStudy.timeframe}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: 10 }}>
                {caseStudy.problem}
            </div>
            <ul style={{ margin: '0 0 10px 0', paddingLeft: 18, fontSize: '0.88rem', color: '#A9B8D6' }}>
                {caseStudy.process.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ul>
            <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                {caseStudy.outcome}
            </div>
        </div>
    );
};

export default CaseStudyOverlay;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/CaseStudyOverlay.test.js --watchAll=false`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/works/CaseStudyOverlay.jsx src/components/works/CaseStudyOverlay.css src/components/works/CaseStudyOverlay.test.js
git commit -m "Add CaseStudyOverlay floating detail panel"
```

---

## Task 4: PlotStage — carousel state, integration, and cleanup

This is the integration task: renames `PlotRow` to `PlotStage`, gives it `activeIndex`/drag/overlay
state, wires in Tasks 1-3, updates `Works.jsx`'s import, and deletes the old `PlotRow` files.

**Files:**
- Create: `src/components/works/PlotStage.jsx`
- Create: `src/components/works/PlotStage.css`
- Create: `src/components/works/PlotStage.test.js`
- Modify: `src/components/Works.jsx`
- Delete: `src/components/works/PlotRow.jsx`
- Delete: `src/components/works/PlotRow.css`
- Delete: `src/components/works/PlotRow.test.js`

**Interfaces:**
- Consumes: `cardTransformStyle` (Task 1), `CaseStudyCard` default export (Task 2),
  `CaseStudyOverlay` default export (Task 3).
- Produces: `export default PlotStage` — a component taking `{ caseStudies }` (identical prop shape
  to the old `PlotRow`, so `Works.jsx` only needs its import path and JSX tag name updated, nothing
  else).

- [ ] **Step 1: Write the failing tests**

Create `src/components/works/PlotStage.test.js`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import PlotStage from './PlotStage';

const sampleCaseStudies = [
    { id: 'a', title: 'A', tagline: 'Tagline A', tech: ['React'], role: 'Dev', timeframe: '2024', problem: 'Problem A', process: ['Step A1'], outcome: 'Outcome A' },
    { id: 'b', title: 'B', tagline: 'Tagline B', tech: ['Flask'], role: 'Dev', timeframe: '2024', problem: 'Problem B', process: ['Step B1'], outcome: 'Outcome B' },
    { id: 'c', title: 'C', tagline: 'Tagline C', tech: ['Vue'], role: 'Dev', timeframe: '2024', problem: 'Problem C', process: ['Step C1'], outcome: 'Outcome C' },
    { id: 'd', title: 'D', tagline: 'Tagline D', tech: ['Node'], role: 'Dev', timeframe: '2024', problem: 'Problem D', process: ['Step D1'], outcome: 'Outcome D' },
];

test('renders one card per case study', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
});

test('the first card starts active', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '-1');
});

test('clicking a side card makes it active', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('C'));
    expect(screen.getByLabelText('C — open full screen')).toHaveAttribute('tabindex', '0');
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '-1');
});

test('the next arrow advances the active card', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Next case study'));
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '0');
});

test('the previous arrow wraps from the first card to the last', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Previous case study'));
    expect(screen.getByLabelText('D — open full screen')).toHaveAttribute('tabindex', '0');
});

test('the next arrow wraps from the last card back to the first', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Next case study'));
    fireEvent.click(screen.getByLabelText('Next case study'));
    fireEvent.click(screen.getByLabelText('Next case study'));
    fireEvent.click(screen.getByLabelText('Next case study'));
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
});

test('clicking the active card opens the overlay with its detail text', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();
});

test('pressing Escape while the overlay is open closes it', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('list'), { key: 'Escape' });
    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

test('a drag past the midpoint between two cards changes the active card', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    const track = screen.getByRole('list');
    fireEvent.pointerDown(track, { pointerType: 'mouse', clientX: 200 });
    fireEvent.pointerMove(track, { clientX: 200 - 161 });
    fireEvent.pointerUp(track);
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '0');
});

test('a drag that does not cross the midpoint snaps back to the original card', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    const track = screen.getByRole('list');
    fireEvent.pointerDown(track, { pointerType: 'mouse', clientX: 200 });
    fireEvent.pointerMove(track, { clientX: 200 - 50 });
    fireEvent.pointerUp(track);
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true npx react-scripts test src/components/works/PlotStage.test.js --watchAll=false`
Expected: FAIL — `Cannot find module './PlotStage'`

- [ ] **Step 3: Write the stylesheet**

Create `src/components/works/PlotStage.css`:

```css
.plot-stage-track {
    position: relative;
    height: 100%;
    perspective: 1200px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.plot-stage-track--dragging .case-study-card {
    transition: none !important;
}

.plot-stage-arrow {
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
    z-index: 250;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.plot-stage-arrow-left {
    left: 0.5rem;
}

.plot-stage-arrow-right {
    right: 0.5rem;
}
```

- [ ] **Step 4: Write the component**

Create `src/components/works/PlotStage.jsx`:

```jsx
import React, { useRef, useState } from 'react';
import CaseStudyCard from './CaseStudyCard';
import CaseStudyOverlay from './CaseStudyOverlay';
import { cardTransformStyle } from './coverflowMath';
import './PlotStage.css';

const STAGE_HEIGHT = 340;
const PIXELS_PER_CARD = 160;
const DRAG_THRESHOLD = 5;

const PlotStage = ({ caseStudies }) => {
    const total = caseStudies.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const dragStateRef = useRef({ startX: 0, wasDrag: false });

    const goToPrevious = () => {
        if (overlayOpen) return;
        setActiveIndex((current) => (current - 1 + total) % total);
    };

    const goToNext = () => {
        if (overlayOpen) return;
        setActiveIndex((current) => (current + 1) % total);
    };

    const handleCardClick = (index) => {
        if (overlayOpen) return;
        if (index === activeIndex) {
            setOverlayOpen(true);
        } else {
            setActiveIndex(index);
        }
    };

    const handlePointerDown = (event) => {
        dragStateRef.current = { startX: event.clientX, wasDrag: false };
        setDragging(true);
        setDragOffset(0);
    };

    const handlePointerMove = (event) => {
        if (!dragging) return;
        const delta = dragStateRef.current.startX - event.clientX;
        if (Math.abs(delta) > DRAG_THRESHOLD) {
            dragStateRef.current.wasDrag = true;
        }
        const rawOffset = delta / PIXELS_PER_CARD;
        const minOffset = -0.5 - activeIndex;
        const maxOffset = total - 1 + 0.5 - activeIndex;
        setDragOffset(Math.max(minOffset, Math.min(maxOffset, rawOffset)));
    };

    const handlePointerUp = () => {
        if (dragging) {
            const nextIndex = Math.max(0, Math.min(total - 1, Math.round(activeIndex + dragOffset)));
            setActiveIndex(nextIndex);
        }
        setDragging(false);
        setDragOffset(0);
    };

    const handleTrackClickCapture = (event) => {
        if (dragStateRef.current.wasDrag) {
            event.preventDefault();
            event.stopPropagation();
            dragStateRef.current.wasDrag = false;
        }
    };

    const handleKeyDown = (event) => {
        if (overlayOpen) {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOverlayOpen(false);
            }
            return;
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToNext();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToPrevious();
        }
    };

    return (
        <div className="plot-stage" style={{ position: 'relative', width: '100%', height: STAGE_HEIGHT }}>
            <button
                type="button"
                className="plot-stage-arrow plot-stage-arrow-left"
                aria-label="Previous case study"
                onClick={goToPrevious}
            >
                &#8249;
            </button>
            <ul
                className={`plot-stage-track${dragging ? ' plot-stage-track--dragging' : ''}`}
                aria-label="Case studies — drag, click a card, or use arrow keys to browse"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClickCapture={handleTrackClickCapture}
            >
                {caseStudies.map((caseStudy, index) => {
                    const distance = index - activeIndex - dragOffset;
                    const isActive = index === activeIndex;
                    return (
                        <li key={caseStudy.id} style={{ listStyle: 'none' }}>
                            <CaseStudyCard
                                caseStudy={caseStudy}
                                positionStyle={cardTransformStyle(distance, isActive)}
                                isActive={isActive}
                                onClick={() => handleCardClick(index)}
                            />
                        </li>
                    );
                })}
            </ul>
            <button
                type="button"
                className="plot-stage-arrow plot-stage-arrow-right"
                aria-label="Next case study"
                onClick={goToNext}
            >
                &#8250;
            </button>
            {overlayOpen && (
                <CaseStudyOverlay
                    caseStudy={caseStudies[activeIndex]}
                    onClose={() => setOverlayOpen(false)}
                />
            )}
        </div>
    );
};

export default PlotStage;
```

- [ ] **Step 5: Update Works.jsx**

In `src/components/Works.jsx`, change the import from `PlotRow` to `PlotStage` and update the JSX
tag to match — everywhere the file currently says `PlotRow`, change it to `PlotStage` (import path
`./works/PlotStage`, component tag `<PlotStage caseStudies={caseStudies} />`). No other change to
this file — the header/subtitle/section markup is untouched.

- [ ] **Step 6: Run tests to verify they pass**

Run: `CI=true npx react-scripts test src/components/works/PlotStage.test.js --watchAll=false`
Expected: PASS (10 tests)

Also run: `CI=true npx react-scripts test src/components/Works.test.js --watchAll=false`
Expected: PASS (1 test, unaffected by the rename since `Works.test.js` only asserts the heading and
card count, not which component renders them)

- [ ] **Step 7: Delete the old PlotRow files**

```bash
rm src/components/works/PlotRow.jsx src/components/works/PlotRow.css src/components/works/PlotRow.test.js
```

- [ ] **Step 8: Run the full test suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: All test suites pass. There should be 8 suites now: `App`, `Works`, `PlotStage`,
`CaseStudyCard`, `CaseStudyOverlay`, `coverflowMath`, `caseStudies`, `useTheme` (the old `PlotRow`
suite is gone, replaced by `PlotStage`; `coverflowMath` and `CaseStudyOverlay` are new).

- [ ] **Step 9: Run the production build**

Run: `CI=true npm run build`
Expected: `Compiled successfully.` with no new ESLint warnings (in particular, no
`no-unused-vars` warning for anything left over from the deleted `PlotRow` files — there should be
none, since nothing outside `Works.jsx` imported `PlotRow`).

- [ ] **Step 10: Commit**

```bash
git add src/components/works/PlotStage.jsx src/components/works/PlotStage.css src/components/works/PlotStage.test.js src/components/Works.jsx
git rm src/components/works/PlotRow.jsx src/components/works/PlotRow.css src/components/works/PlotRow.test.js
git commit -m "Replace PlotRow with PlotStage: coverflow carousel + overlay integration"
```

---

## Task 5: End-to-end manual verification

No new files — this task confirms the interaction details that can't be meaningfully asserted in
jsdom (real 3D rendering, real drag feel, real hover/click timing), and that the four prior tasks
integrate correctly as a whole.

- [ ] **Step 1: Start the dev server**

Run: `npm start`

Wait for it to report the local URL (typically `http://localhost:3000`).

- [ ] **Step 2: Verify the coverflow layout**

In a browser, scroll to "🪴 the garden of case studies." Confirm one card sits centered and at full
size, with the other three receding to the sides — rotated, scaled down, and progressively faded the
farther they are from center, matching the visual depth of the referenced design.

- [ ] **Step 3: Verify navigation**

Click the left/right arrow buttons — confirm the active card changes smoothly, with every card's
position animating (not jumping). Click a receded side card directly — confirm it becomes the new
active (centered) card. Use `ArrowLeft`/`ArrowRight` with the stage focused — confirm the same
behavior. Click "next" repeatedly past the last card — confirm it loops back to the first (and
similarly for "previous" past the first card).

- [ ] **Step 4: Verify drag**

Click-and-drag the stage left and right with a mouse — confirm the whole arrangement rotates
continuously and smoothly in sync with the cursor while dragging, then settles cleanly onto the
nearest card when released. Confirm dragging past the first or last card resists (rubber-bands)
rather than continuing indefinitely. On a touch device (or Chrome DevTools' touch emulation), confirm
the same drag behavior works with a finger, since this layout has no native scroll fallback.

- [ ] **Step 5: Verify the overlay**

Click the centered (active) card — confirm a text panel appears floating over it, showing the case
study's role/timeframe, problem, process steps, and outcome, with a brief scale/fade entrance.
Confirm clicking the `×`, clicking elsewhere on the panel, and pressing `Escape` all close it.
Confirm that while the overlay is open, the arrow buttons and keyboard arrows do nothing (don't
change the carousel behind it).

- [ ] **Step 6: Stop the dev server**

Press `Ctrl+C` in the terminal running `npm start`.

This plan is complete once Steps 2–5 all check out.
