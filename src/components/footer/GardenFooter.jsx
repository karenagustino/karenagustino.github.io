import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';
import { buildBed, CELL } from './pixelPlants';
import {
    ridgePath, ridgeDither, ridgeY, stepDroplet, withinReach, cappedGrowth,
    DROPLET_GRAVITY, MAX_PLANT_SCALE,
} from './gardenMath';
import './GardenFooter.css';

const DESKTOP_PLANT_COUNT = 20;
const TOUCH_PLANT_COUNT = 12;
const DROPLET_CAP = 90;
const MIST_INTERVAL_MS = 120;
const CLICK_BURST = 16;
const REDUCED_CLICK_BURST = 5;
const GROWTH_DELTA_MIN = 0.14;
const GROWTH_DELTA_MAX = 0.24;
// Plants stop this far below the text block rather than climbing over it.
const CEILING_PADDING = 18;

// jsdom, a hidden footer and the first paint before layout all report 0x0.
// Falling back to a plausible band keeps the ridge maths finite and the markup
// free of NaN, rather than scattering broken transforms through the DOM.
// Exported so tests can compute coordinates that actually land on a plant
// under jsdom, where nothing has a real size.
export const FALLBACK_WIDTH = 1024;
export const FALLBACK_HEIGHT = 360;

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

const GardenFooter = ({ heading, children }) => {
    const bandRef = useRef(null);
    const headingRef = useRef(null);
    const canRef = useRef(null);
    const hintRef = useRef(null);
    const [measured, setMeasured] = useState({ width: 0, height: 0 });

    const isTouch = useMediaQuery('(pointer: coarse)');
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    const width = measured.width || FALLBACK_WIDTH;
    const height = measured.height || FALLBACK_HEIGHT;

    const plants = useMemo(
        () => buildBed(isTouch ? TOUCH_PLANT_COUNT : DESKTOP_PLANT_COUNT),
        [isTouch]
    );

    const [scales, setScales] = useState(() => plants.map((p) => p.startScale));
    const [bloomTicks, setBloomTicks] = useState(() => plants.map(() => 0));
    const contentRef = useRef(null);

    // Mirrors `scales` for handlePointerDown to read and write synchronously.
    // A plain assignment during render — the same established pattern
    // `tickRef.current` already uses below — keeps it current on every
    // render without an effect.
    const scalesRef = useRef(scales);
    scalesRef.current = scales;

    useEffect(() => {
        setScales(plants.map((p) => p.startScale));
        setBloomTicks(plants.map(() => 0));
    }, [plants]);

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
        const update = () => {
            const viewportHeight = window.innerHeight || 1;
            const rect = heading.getBoundingClientRect();
            const centre = (rect.top + rect.bottom) / 2;
            const progress = Math.min(
                1,
                Math.max(0, (viewportHeight - centre) / (viewportHeight * 0.5))
            );
            const value = progress.toFixed(4);
            // Compare against the DOM's own current value, not a cached one —
            // that keeps this self-correcting while still skipping the
            // redundant write on every unchanged frame.
            if (heading.style.getPropertyValue('--gf-grow') !== value) {
                heading.style.setProperty('--gf-grow', value);
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

    // The can replaces the native cursor, so it is desktop-only: a touch device
    // has no hover state to reveal it with, and it would just be a sprite stuck
    // to the screen.
    const showCan = !isTouch;

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
            // Shown only where a click would actually do something, so the
            // label never promises growth over empty sky or over the link.
            const point = toBand(event);
            const inReach =
                !onControl(event.target) &&
                plants.some((plant, index) => withinReach(point, plantGeometry(plant, index)));
            hintRef.current.classList.toggle('is-on', inReach);
        }
        if (reducedMotion) return;
        const now = performance.now();
        if (now - lastMistRef.current > MIST_INTERVAL_MS) {
            lastMistRef.current = now;
            const point = toBand(event);
            emit(point.x, point.y + 6, 1, 0.5, 0.4);
        }
    };

    const handlePointerDown = (event) => {
        if (onControl(event.target)) return;
        const point = toBand(event);
        emit(point.x, point.y + 6, reducedMotion ? REDUCED_CLICK_BURST : CLICK_BURST, 2.6, 0.6);

        const bandRect = bandRef.current?.getBoundingClientRect();
        const contentRect = contentRef.current?.getBoundingClientRect();
        const ceilingY = bandRect && contentRect
            ? contentRect.bottom - bandRect.top + CEILING_PADDING
            : -Infinity;

        // Computed synchronously into a plain array, not via the setState-
        // updater form: a functional updater's callback runs later, during
        // React's render phase, so a `bloomed` array only populated in there
        // would still read empty at the check below. Read from `scalesRef`
        // rather than the `scales` closure, and written back to it before
        // `setScales` is even called: two pointerDown events landing in the
        // same batch (two fingers on a phone, with no render between them)
        // would otherwise both read the same stale `scales`, and the second
        // event's write would silently clobber the first's growth. The ref is
        // mutated synchronously here regardless of whether React has
        // re-rendered yet, so the second event picks up the first's result.
        const bloomed = [];
        const nextScales = scalesRef.current.map((scale, index) => {
            const plant = plants[index];
            if (!plant) return scale;
            const geometry = { ...plantGeometry(plant, index), scale };
            if (!withinReach(point, geometry)) return scale;
            const delta = GROWTH_DELTA_MIN + Math.random() * (GROWTH_DELTA_MAX - GROWTH_DELTA_MIN);
            const grown = cappedGrowth(geometry, delta, ceilingY);
            if (grown === scale) bloomed.push(index);
            return grown;
        });
        scalesRef.current = nextScales;
        setScales(nextScales);
        if (bloomed.length) {
            setBloomTicks((current) =>
                current.map((tick, index) => (bloomed.includes(index) ? tick + 1 : tick))
            );
        }
    };

    return (
        <div className="gf-footer">
            <div
                className="gf-band"
                ref={bandRef}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
            >
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
                                    '--gf-scale': (scales[index] ?? plant.startScale).toFixed(3),
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
                                        {/* Remounting the group on each tick is
                                            what restarts the CSS animation — a
                                            plant at full height pulses again
                                            every time it is watered. */}
                                        <g
                                            key={bloomTicks[index]}
                                            className={bloomTicks[index] > 0 ? 'gf-head is-blooming' : 'gf-head'}
                                        >
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

                <div className="gf-fx" ref={fxRef} aria-hidden="true" />

                <div className="gf-content" ref={contentRef}>
                    <h2 className="gf-heading" ref={headingRef}>{heading}</h2>
                    {children}
                </div>
            </div>

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
        </div>
    );
};

export default GardenFooter;
