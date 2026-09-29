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

    return (
        <div className="gf-footer">
            <div
                className="gf-band"
                ref={bandRef}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onPointerMove={handlePointerMove}
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
