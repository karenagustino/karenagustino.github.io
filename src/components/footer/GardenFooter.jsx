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

const GardenFooter = ({ heading, children }) => {
    const bandRef = useRef(null);
    const [measured, setMeasured] = useState({ width: 0, height: 0 });

    const isTouch = useMediaQuery('(pointer: coarse)');

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

    return (
        <div className="gf-footer">
            <div className="gf-band" ref={bandRef}>
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
                    <h2 className="gf-heading">{heading}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GardenFooter;
