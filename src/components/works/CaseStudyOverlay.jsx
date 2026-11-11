import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './CaseStudyOverlay.css';

// How far below the content's top edge a heading has to sit before the section
// counts as the one being read. Without the offset the sidebar lags a heading
// behind while scrolling down.
const SPY_OFFSET = 96;

// Cells in the progress meter. A segmented bar reads as a game HUD where a
// smooth one reads as a loading spinner.
const PROGRESS_CELLS = 12;

const pad = (value) => String(value).padStart(2, '0');

// Figma's Embed API, which reports when a prototype has drawn and which
// screen it is on, only talks to embeds that carry a registered client id.
// Leave this empty and the prototype still plays: the loader falls back to the
// iframe's own load event, and replay reloads the embed. Fill it in (and add
// the site's origin to the app's allowed embed origins) and the loader waits
// for the prototype itself, and the replay prompt appears on the last screen.
// The id is public by design; it travels in every embed URL.
export const FIGMA_CLIENT_ID = '';

const FIGMA_ORIGIN = 'https://www.figma.com';

// Without the Embed API the iframe's load event is the only signal, and it
// fires when Figma's page arrives, a moment before the prototype has drawn.
const LOAD_GRACE_MS = 1200;

// Turns a Figma prototype share link into its embeddable form. The share link
// is what Figma's Share button hands out, so that is what the data holds; the
// embed host serves the same prototype without Figma's own toolbar and
// sidebar, which would crowd a phone sized frame.
export const toFigmaEmbedUrl = (shareUrl, clientId = FIGMA_CLIENT_ID) => {
    const url = new URL(shareUrl);
    url.hostname = 'embed.figma.com';
    url.searchParams.delete('show-proto-sidebar');
    url.searchParams.delete('t');
    url.searchParams.set('hide-ui', '1');
    // Actual size. Figma's fit modes leave a margin of its own background
    // around the frame, so the frame is played at 100% and PrototypeScreen
    // below does the fitting instead, where the edges can be controlled.
    url.searchParams.set('scaling', 'min-zoom');
    url.searchParams.set('embed-host', 'karenagustino-portfolio');
    if (clientId) url.searchParams.set('client-id', clientId);
    return url.toString();
};

// Mobile frames are drawn at this size unless a block says otherwise.
const DEFAULT_FRAME = { width: 375, height: 812 };

// Room left around the frame inside the embed, so Figma has space for its own
// margin and never shrinks the frame to make it fit. All of it is cropped off.
const EMBED_MARGIN = 120;

// Cells in the loader's bar, echoing the reading progress meter.
const LOADER_CELLS = 5;

// The phone's screen. The embed is drawn larger than the screen, with the
// frame at 100% in its centre, then shrunk so the frame exactly covers the
// screen and the margin around it falls outside, where overflow hides it.
// Clicks still land in the right place: a transformed iframe maps pointer
// positions through its transform.
const PrototypeScreen = ({
    url, label, frame = DEFAULT_FRAME, iframeRef, run, loaded, atEnd, onLoad, onReplay,
}) => {
    const screenRef = useRef(null);
    const [scale, setScale] = useState(null);

    useLayoutEffect(() => {
        const screen = screenRef.current;
        if (!screen) return undefined;
        const measure = () => {
            if (screen.clientWidth > 0) setScale(screen.clientWidth / frame.width);
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(screen);
        return () => observer.disconnect();
    }, [frame.width]);

    return (
        <div
            className="case-study-phone-screen"
            ref={screenRef}
            style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
        >
            {/* Keyed by run, so a replay without the Embed API mounts a fresh
                embed, which starts again from the first screen. */}
            <iframe
                key={run}
                ref={iframeRef}
                className="case-study-phone-embed"
                title={label}
                src={toFigmaEmbedUrl(url)}
                loading="lazy"
                allowFullScreen
                onLoad={onLoad}
                style={{
                    width: frame.width + EMBED_MARGIN * 2,
                    height: frame.height + EMBED_MARGIN * 2,
                    // Hidden until measured, so the first paint never shows
                    // the full size embed spilling out of the phone.
                    visibility: scale ? 'visible' : 'hidden',
                    transform: `translate(-50%, -50%) scale(${scale || 1})`,
                }}
            />
            {!loaded && (
                <div className="case-study-phone-loader" role="status">
                    <span className="case-study-phone-loader-bar" aria-hidden="true">
                        {Array.from({ length: LOADER_CELLS }, (unused, cell) => (
                            <span
                                key={cell}
                                className="case-study-phone-loader-cell"
                                style={{ animationDelay: `${cell * 0.15}s` }}
                            />
                        ))}
                    </span>
                    <span className="case-study-phone-loader-label">Loading prototype</span>
                </div>
            )}
            {atEnd && (
                <div className="case-study-phone-end">
                    <button type="button" className="case-study-phone-replay" onClick={onReplay}>
                        ↺ Replay
                    </button>
                </div>
            )}
        </div>
    );
};

// A live prototype, played as the screen of a drawn phone, with a caption and
// the way out to Figma beside it. Holds the playback state the phone and the
// caption share: whether it has loaded, whether it has reached its last
// screen, and the replay both of them can trigger.
const PrototypeBlock = ({ block }) => {
    const iframeRef = useRef(null);
    const graceTimer = useRef(null);
    const [run, setRun] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [atEnd, setAtEnd] = useState(false);
    // True once the embed has spoken through the Embed API, which only happens
    // with a client id. Until then nothing can be sent to it either.
    const [apiReady, setApiReady] = useState(false);

    useEffect(() => {
        const handleMessage = (event) => {
            // The embed lives on embed.figma.com but posts from www.figma.com.
            // The source check keeps two prototypes on one page apart.
            const frameWindow = iframeRef.current && iframeRef.current.contentWindow;
            if (event.origin !== FIGMA_ORIGIN || !frameWindow || event.source !== frameWindow) return;
            const { type, data } = event.data || {};
            if (type === 'INITIAL_LOAD') {
                setApiReady(true);
                setLoaded(true);
            } else if (type === 'PRESENTED_NODE_CHANGED' && data) {
                setAtEnd(Boolean(block.endNodeId) && data.presentedNodeId === block.endNodeId);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(graceTimer.current);
        };
    }, [block.endNodeId]);

    const handleLoad = () => {
        if (apiReady) return;
        clearTimeout(graceTimer.current);
        graceTimer.current = setTimeout(() => setLoaded(true), LOAD_GRACE_MS);
    };

    const replay = () => {
        setAtEnd(false);
        const frameWindow = iframeRef.current && iframeRef.current.contentWindow;
        if (apiReady && frameWindow) {
            frameWindow.postMessage({ type: 'RESTART' }, FIGMA_ORIGIN);
            return;
        }
        clearTimeout(graceTimer.current);
        setLoaded(false);
        setRun((current) => current + 1);
    };

    return (
        <figure className="case-study-prototype">
            <div className="case-study-phone">
                <PrototypeScreen
                    url={block.url}
                    label={block.label}
                    frame={block.frame}
                    iframeRef={iframeRef}
                    run={run}
                    loaded={loaded}
                    atEnd={atEnd}
                    onLoad={handleLoad}
                    onReplay={replay}
                />
            </div>
            <figcaption className="case-study-prototype-caption">
                <span className="case-study-row-label">{block.label}</span>
                {block.caption && <span className="case-study-row-text">{block.caption}</span>}
                <span className="case-study-prototype-actions">
                    <button type="button" className="case-study-prototype-link" onClick={replay}>
                        ↺ Start over
                    </button>
                    <a
                        className="case-study-prototype-link"
                        href={block.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open in Figma ↗
                    </a>
                </span>
            </figcaption>
        </figure>
    );
};

// Blocks are keyed by index on purpose: the data is static and never reordered,
// and placeholder entries legitimately repeat the same label and value, which
// would collide if the content were used as the key.
const renderBlock = (block, index) => {
    // Rows and steps share one shape: an icon tile in front, then the label over
    // its text. Steps add their number to the label, in an `<ol>` so the order
    // is real to assistive technology and not only drawn. An item without an
    // icon gets a plain square, so a list never loses its markers halfway down.
    if (block.type === 'rows' || block.type === 'steps') {
        const List = block.type === 'steps' ? 'ol' : 'ul';
        return (
            <List className={`case-study-rows case-study-${block.type}`} key={index}>
                {block.items.map((item, itemIndex) => (
                    <li className="case-study-row" key={itemIndex}>
                        <span className="case-study-row-icon" aria-hidden="true">{item.icon || '\u25AA'}</span>
                        <span className="case-study-row-body">
                            <span className="case-study-row-label">
                                {block.type === 'steps' && (
                                    <span className="case-study-step-number" aria-hidden="true">{pad(itemIndex + 1)}</span>
                                )}
                                {item.label}
                            </span>
                            <span className="case-study-row-text">{item.text}</span>
                        </span>
                    </li>
                ))}
            </List>
        );
    }

    if (block.type === 'metrics') {
        return (
            <div className="case-study-metrics" key={index}>
                {block.items.map((item, itemIndex) => (
                    <div className="case-study-metric" key={itemIndex}>
                        <span className="case-study-metric-value">{item.value}</span>
                        <span className="case-study-metric-label">{item.label}</span>
                        {item.caption && <span className="case-study-metric-caption">{item.caption}</span>}
                    </div>
                ))}
            </div>
        );
    }

    // The Figma file's prototype device must be set to None, or Figma draws a
    // second phone inside this one. `frame` is only needed for a prototype not
    // drawn at 375 by 812. Lazy so the overlay opens without waiting on Figma.
    if (block.type === 'prototype') {
        return <PrototypeBlock block={block} key={index} />;
    }

    return (
        <p className="case-study-prose" key={index}>
            {block.text}
        </p>
    );
};

const CaseStudyOverlay = ({ caseStudy, index = 0, total = 0, closing, onClose, onExited }) => {
    const sections = caseStudy.sections || [];
    const [activeSection, setActiveSection] = useState(sections.length ? sections[0].id : null);
    const [progress, setProgress] = useState(0);
    const contentRef = useRef(null);
    const sectionRefs = useRef({});

    // The panel stays mounted while it fades out; the parent unmounts it once
    // that animation reports back here. Guarded on the event's own target so an
    // animation on a child can't end the exit early by bubbling up.
    const handleAnimationEnd = (event) => {
        if (closing && event.target === event.currentTarget) {
            onExited();
        }
    };

    // Measured as the gap between the two elements' current positions rather
    // than from `offsetTop`: the sections aren't positioned, so their offsetTop
    // is relative to the panel (header included), not to the scrolling box.
    // The smooth easing comes from scroll-behavior in the stylesheet.
    const jumpToSection = (sectionId) => {
        setActiveSection(sectionId);
        const target = sectionRefs.current[sectionId];
        const container = contentRef.current;
        if (target && container) {
            const gap = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
            container.scrollTop += gap - 16;
        }
    };

    // Keeps the sidebar and the meter in step with the reader: the last heading
    // to have passed the threshold is the section they're in.
    const handleScroll = () => {
        const container = contentRef.current;
        if (!container || !sections.length) return;

        const containerTop = container.getBoundingClientRect().top;
        let current = sections[0].id;
        sections.forEach((section) => {
            const node = sectionRefs.current[section.id];
            if (node && node.getBoundingClientRect().top - containerTop <= SPY_OFFSET) {
                current = section.id;
            }
        });
        setActiveSection(current);

        const scrollable = container.scrollHeight - container.clientHeight;
        setProgress(scrollable > 0 ? Math.min(1, container.scrollTop / scrollable) : 1);
    };

    const percent = Math.round(progress * 100);
    const filledCells = Math.round(progress * PROGRESS_CELLS);

    return (
        <>
            {/* A sibling rather than a parent of the panel: wrapping the dialog in
                an aria-hidden element would hide it from assistive tech, and the
                click-outside handler in PlotStage keys off not being inside
                .case-study-overlay, which the backdrop deliberately isn't. */}
            <div
                className={`case-study-backdrop${closing ? ' case-study-backdrop--closing' : ''}`}
                aria-hidden="true"
            />
            <div
                className={`case-study-overlay${closing ? ' case-study-overlay--closing' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={caseStudy.title}
                onAnimationEnd={handleAnimationEnd}
            >
                <header className="case-study-header">
                    <div className="case-study-header-top">
                        <div className="case-study-header-identity">
                            <span className="case-study-eyebrow">
                                CASE FILE {pad(index + 1)}{total > 0 && ` / ${pad(total)}`}
                            </span>
                            <h2 className="case-study-title">{caseStudy.title}</h2>
                            <p className="case-study-subtitle">
                                {caseStudy.role} · {caseStudy.timeframe}
                            </p>
                            {caseStudy.tags && caseStudy.tags.length > 0 && (
                                <div className="case-study-tags">
                                    {caseStudy.tags.map((tag, tagIndex) => (
                                        <span className="case-study-tag" key={tagIndex}>{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {caseStudy.stats && caseStudy.stats.length > 0 && (
                            <div className="case-study-header-stats">
                                {caseStudy.stats.map((stat, statIndex) => (
                                    <div className="case-study-stat" key={statIndex}>
                                        <span className="case-study-stat-value">{stat.value}</span>
                                        <span className="case-study-stat-label">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            type="button"
                            className="case-study-overlay-close"
                            aria-label="Close case study"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    <div className="case-study-progress">
                        <span className="case-study-progress-label">PROGRESS</span>
                        <span
                            className="case-study-progress-track"
                            role="progressbar"
                            aria-label="Reading progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                        >
                            {Array.from({ length: PROGRESS_CELLS }, (unused, cell) => (
                                <span
                                    key={cell}
                                    className={`case-study-progress-cell${cell < filledCells ? ' case-study-progress-cell--filled' : ''}`}
                                />
                            ))}
                        </span>
                        <span className="case-study-progress-value">{pad(percent)}%</span>
                    </div>
                </header>

                <div className="case-study-body">
                    <nav className="case-study-nav" aria-label="Case study sections">
                        <span className="case-study-nav-heading">CHAPTERS</span>
                        <ul>
                            {sections.map((section, sectionIndex) => {
                                const isActive = section.id === activeSection;
                                return (
                                    <li key={section.id}>
                                        <button
                                            type="button"
                                            className={`case-study-nav-item${isActive ? ' case-study-nav-item--active' : ''}`}
                                            aria-current={isActive ? 'true' : undefined}
                                            onClick={() => jumpToSection(section.id)}
                                        >
                                            <span className="case-study-nav-index" aria-hidden="true">{pad(sectionIndex + 1)}</span>
                                            <span className="case-study-nav-icon" aria-hidden="true">{section.icon}</span>
                                            <span className="case-study-nav-label">{section.title}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="case-study-content" ref={contentRef} onScroll={handleScroll}>
                        {sections.map((section, sectionIndex) => {
                            const headingId = `${caseStudy.id}-${section.id}`;
                            return (
                                <section
                                    key={section.id}
                                    className="case-study-section"
                                    aria-labelledby={headingId}
                                    ref={(node) => { sectionRefs.current[section.id] = node; }}
                                >
                                    <h3 className="case-study-section-heading" id={headingId}>
                                        <span className="case-study-section-index" aria-hidden="true">{pad(sectionIndex + 1)}</span>
                                        <span className="case-study-section-icon" aria-hidden="true">{section.icon}</span>
                                        {section.title}
                                    </h3>
                                    <div className="case-study-section-body">
                                        {(section.blocks || []).map(renderBlock)}
                                    </div>
                                </section>
                            );
                        })}
                        {caseStudy.note && <p className="case-study-note">{caseStudy.note}</p>}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CaseStudyOverlay;
