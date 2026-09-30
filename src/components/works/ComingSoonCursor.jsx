import React, { useEffect, useRef } from 'react';
import './ComingSoonCursor.css';

// Pixel padlock, written as a legible little picture rather than coordinates:
//   h = shackle, b = body, k = keyhole
const LOCK_ROWS = [
    '....hhhh....',
    '...h....h...',
    '...h....h...',
    '...h....h...',
    '.bbbbbbbbbb.',
    '.bbbbbbbbbb.',
    '.bbbbkkbbbb.',
    '.bbbbkkbbbb.',
    '.bbbbbbbbbb.',
    '.bbbbbbbbbb.',
];
const LOCK_FILL = {
    h: 'var(--color-panel-frame)',
    b: 'var(--color-panel-accent)',
    k: 'var(--color-panel)',
};
const UNIT = 3;

const LOCK_CELLS = LOCK_ROWS.flatMap((row, y) =>
    row.split('').flatMap((ch, x) => (LOCK_FILL[ch] ? [{ x, y, fill: LOCK_FILL[ch] }] : []))
);

// Where the sprite sits relative to the pointer, in rendered px. Up and left of
// the cursor, so the label to its right stays clear of the card's own text.
const OFFSET_X = 6;
const OFFSET_Y = 4;

/**
 * Follows the pointer while `active`, standing in for the native cursor over a
 * case study whose content is not written yet.
 *
 * Position is written straight to the DOM through a ref: this updates on every
 * pointermove, and routing it through state would re-render the whole coverflow
 * at frame rate for decoration nothing else reads.
 */
const ComingSoonCursor = ({ active }) => {
    const rootRef = useRef(null);

    useEffect(() => {
        if (!active) return undefined;
        const move = (event) => {
            const el = rootRef.current;
            if (!el) return;
            el.style.transform = `translate(${event.clientX + OFFSET_X}px, ${event.clientY + OFFSET_Y}px)`;
        };
        window.addEventListener('pointermove', move, { passive: true });
        return () => window.removeEventListener('pointermove', move);
    }, [active]);

    if (!active) return null;

    return (
        <div className="coming-soon-cursor" ref={rootRef} aria-hidden="true">
            <svg
                width={LOCK_ROWS[0].length * UNIT}
                height={LOCK_ROWS.length * UNIT}
                viewBox={`0 0 ${LOCK_ROWS[0].length} ${LOCK_ROWS.length}`}
                shapeRendering="crispEdges"
            >
                {LOCK_CELLS.map((c) => (
                    <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.fill} />
                ))}
            </svg>
            <span className="coming-soon-cursor-label">COMING SOON</span>
        </div>
    );
};

export default ComingSoonCursor;
