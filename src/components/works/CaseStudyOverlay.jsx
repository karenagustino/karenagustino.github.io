import React, { useRef, useState } from 'react';
import './CaseStudyOverlay.css';

// How far below the content's top edge a heading has to sit before the section
// counts as the one being read. Without the offset the sidebar lags a heading
// behind while scrolling down.
const SPY_OFFSET = 96;

// Blocks are keyed by index on purpose: the data is static and never reordered,
// and placeholder entries legitimately repeat the same label and value, which
// would collide if the content were used as the key.
const renderBlock = (block, index) => {
    if (block.type === 'rows') {
        return (
            <ul className="case-study-rows" key={index}>
                {block.items.map((item, itemIndex) => (
                    <li className="case-study-row" key={itemIndex}>
                        <span className="case-study-row-label">{item.label}</span>
                        <span className="case-study-row-text">{item.text}</span>
                    </li>
                ))}
            </ul>
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

    return (
        <p className="case-study-prose" key={index}>
            {block.text}
        </p>
    );
};

const CaseStudyOverlay = ({ caseStudy, closing, onClose, onExited }) => {
    const sections = caseStudy.sections || [];
    const [activeSection, setActiveSection] = useState(sections.length ? sections[0].id : null);
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

    // Keeps the sidebar in step with the reader: the last heading to have passed
    // the threshold is the section they're in.
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
    };

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
                    <div className="case-study-header-identity">
                        <h2 className="case-study-title">{caseStudy.title}</h2>
                        <p className="case-study-subtitle">
                            {caseStudy.role} · {caseStudy.timeframe}
                        </p>
                        {caseStudy.tags && caseStudy.tags.length > 0 && (
                            <div className="case-study-tags">
                                {caseStudy.tags.map((tag, index) => (
                                    <span className="case-study-tag" key={index}>{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    {caseStudy.stats && caseStudy.stats.length > 0 && (
                        <div className="case-study-header-stats">
                            {caseStudy.stats.map((stat, index) => (
                                <div className="case-study-stat" key={index}>
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
                </header>

                <div className="case-study-body">
                    <nav className="case-study-nav" aria-label="Case study sections">
                        <ul>
                            {sections.map((section) => {
                                const isActive = section.id === activeSection;
                                return (
                                    <li key={section.id}>
                                        <button
                                            type="button"
                                            className={`case-study-nav-item${isActive ? ' case-study-nav-item--active' : ''}`}
                                            aria-current={isActive ? 'true' : undefined}
                                            onClick={() => jumpToSection(section.id)}
                                        >
                                            <span className="case-study-nav-icon" aria-hidden="true">{section.icon}</span>
                                            <span className="case-study-nav-label">{section.title}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="case-study-content" ref={contentRef} onScroll={handleScroll}>
                        {sections.map((section) => {
                            const headingId = `${caseStudy.id}-${section.id}`;
                            return (
                                <section
                                    key={section.id}
                                    className="case-study-section"
                                    aria-labelledby={headingId}
                                    ref={(node) => { sectionRefs.current[section.id] = node; }}
                                >
                                    <h3 className="case-study-section-heading" id={headingId}>
                                        <span className="case-study-section-icon" aria-hidden="true">{section.icon}</span>
                                        {section.title}
                                    </h3>
                                    {(section.blocks || []).map(renderBlock)}
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
