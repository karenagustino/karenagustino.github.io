import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import './Resume.css';
import { buildDaisy, buildLavender, mulberry32 } from './footer/pixelPlants';

const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: '1.6rem',
    marginBottom: 12,
    color: 'var(--color-text-primary)',
    letterSpacing: 1,
};

const sectionBlockStyle = {
    marginBottom: 30,
};

const education = [
    {
        school: 'The University of British Columbia',
        detail: 'Sauder School of Business',
        degree: "Bachelor's in Combined Major in Business and Computer Science (BUCS)",
        grad: 'Expected graduation in May 2027',
    },
];

const experiences = [
    {
        title: 'Business Analyst Co-op',
        company: 'RBCx (Royal Bank of Canada)',
        dates: 'Sep 2026 – Present',
    },
    {
        title: 'Product Analyst Co-op',
        company: 'Simplii Financial (CIBC)',
        dates: 'Jan 2026 – Aug 2026',
    },
    {
        title: 'HR Information Systems Data Analyst Co-op',
        company: 'Elk Valley Resources Ltd. (Glencore)',
        dates: 'Sep 2024 – Aug 2025',
    },
    {
        title: 'Hackathon Organizer',
        company: 'nwPlus',
        dates: 'May 2025 – Apr 2026',
    },
    {
        title: 'Community Operations Intern',
        company: 'Minivillage',
        dates: 'May 2024 – Aug 2024',
    },
    {
        title: 'Software Developer',
        company: 'UBC Product Management Club',
        dates: 'May 2024 – Aug 2024',
    },
    {
        title: 'Project Manager',
        company: 'Google Developer Student Club',
        dates: 'Oct 2023 – Apr 2024',
    },
    {
        title: 'Product Manager (Experiences Lead)',
        company: 'UBC Business Technology (BizTech) Network',
        dates: 'Sep 2023 – Apr 2024',
    },
    {
        title: 'Internal Lead',
        company: 'UBC Business Technology (BizTech) Network',
        dates: 'May 2023 – Sep 2023',
    },
    {
        title: 'Events Director',
        company: 'UBC Business Technology (BizTech) Network',
        dates: 'May 2022 – Apr 2023',
    },
    {
        title: 'Co-Vice Chair & VP Internal',
        company: 'Sauder International Student Association',
        dates: 'Sep 2021 – May 2022',
    },
    {
        title: 'Founder',
        company: 'Carelabel',
        dates: 'Apr 2016 – Aug 2021',
    },
];

const skills = [
    {
        category: 'Languages',
        items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'HTML/CSS', 'SQL'],
    },
    {
        category: 'Frameworks',
        items: ['React', 'Flask', 'Node.js', 'jQuery'],
    },
    {
        category: 'Tools',
        items: ['Git & GitHub', 'Postman', 'Firebase', 'Azure DevOps', 'ServiceNow', 'Jira', 'Tableau', 'Power Apps'],
    },
    {
        category: 'Product',
        items: ['Figma', 'Prototyping/Wireframing', 'User Testing'],
    },
    {
        category: 'Methodologies',
        items: ['Scrum', 'Agile', 'Kanban', 'Design Thinking'],
    },
];

// How far the page scrolls, as a share of the receipt's height, while the
// printer is pinned and feeding. Capped so a very tall receipt (on a phone)
// doesn't need endless scrolling.
const FEED_SCROLL_SHARE = 0.7;
const MAX_FEED_SCROLL = 1400;
// Smallest gap kept between the navbar and the pinned printer on short screens.
const PIN_GAP = 16;
// How long the printer's button takes to reel the paper back in, and to
// print it out.
const REWIND_MS = 1000;
const PRINT_MS = 1600;

// Two plants from the footer's garden, grown from a fixed seed so they are the
// same on every visit, sitting on top of the printer.
const FLOWER_SEED = 344;
const FLOWER_SCALE = 1;

const PrinterFlowers = React.forwardRef((props, ref) => {
    const plants = useMemo(() => {
        const rng = mulberry32(FLOWER_SEED);
        return [buildDaisy(rng), buildLavender(rng)];
    }, []);
    return (
        <div ref={ref} className="resume-printer-flowers" aria-hidden="true">
            {plants.map((plant, index) => (
                <svg
                    key={index}
                    width={plant.width * FLOWER_SCALE}
                    height={plant.height * FLOWER_SCALE}
                    viewBox={`0 0 ${plant.width} ${plant.height}`}
                    shapeRendering="crispEdges"
                    style={{ '--flower-delay': `${index * -1.3}s` }}
                >
                    {plant.cells.map((c, i) => (
                        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
                    ))}
                </svg>
            ))}
        </div>
    );
});

// "click to print!" note with a hand-drawn arrow to the printer's button.
// On wide screens it sits to the right of the printer with the arrow curling
// left into the button; where there's no room beside it (phones, narrower
// windows) it sits above the printer's right end with the arrow pointing down.
//
// PLACEHOLDER for Karen's handwriting: the text uses the Gaegu font, and both
// arrows are drawn paths, roughened by the #resume-marker filter to look like
// felt-tip marker. To use the real thing, export the note and each arrow as
// transparent PNGs or SVGs, import them here, and swap the span and the two
// arrow <svg>s for <img>s with the same class names.
const PrintHint = React.forwardRef(({ visible }, ref) => (
    <div ref={ref} className={`resume-print-hint${visible ? '' : ' is-hidden'}`} aria-hidden="true">
        <svg className="resume-print-hint-defs" width="0" height="0">
            <filter id="resume-marker" x="-10%" y="-10%" width="120%" height="120%">
                {/* Wobbly marker edges. */}
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="4" result="grain" />
                <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.3" result="rough" />
                {/* Faint streaks where the ink runs thin, like the hero underline. */}
                <feTurbulence type="fractalNoise" baseFrequency="0.05 0.9" numOctaves="1" seed="9" result="streaks" />
                <feColorMatrix
                    in="streaks"
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.45 1.15"
                    result="ink"
                />
                <feComposite in="rough" in2="ink" operator="in" />
            </filter>
        </svg>
        <span className="resume-print-hint-text">click to print!</span>
        <svg className="resume-print-hint-arrow resume-print-hint-arrow--side" width="84" height="70" viewBox="0 0 84 70" fill="none">
            <path d="M66 4 C 80 16, 78 38, 60 42 C 48 45, 46 31, 56 32 C 66 33, 60 52, 42 56 C 32 58, 20 57, 8 55" />
            <path d="M19 46 L 7 55 L 20 63" />
        </svg>
        <svg className="resume-print-hint-arrow resume-print-hint-arrow--top" width="44" height="72" viewBox="0 0 44 72" fill="none">
            <path d="M34 4 C 14 8, 8 26, 20 32 C 30 37, 34 26, 26 25 C 16 24, 14 46, 21 64" />
            <path d="M12 55 L 21 65 L 29 54" />
        </svg>
    </div>
));

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// The receipt is tied to scroll position, in three modes:
// - "feeding": once the printer reaches the middle of the screen it stays
//   pinned there while scrolling feeds the paper out (scrolling up pulls it
//   back in). The pinning itself is position: sticky, so the browser holds the
//   printer still in step with the scroll; script only sets where it pins and
//   how far the paper is out. Moving the printer from script instead always
//   landed a frame late, and on a fast scroll it slid and snapped back.
// - "printed": the whole receipt is out and stays out, whichever way the page
//   scrolls, until the visitor is back at the top of the page with the printer
//   off screen, or presses the printer's button.
// - "rewinding": the button was pressed once printed; the page glides back up
//   while the paper reels in, ending exactly where feeding starts.
// - "printing": the button was pressed before the paper was fully out (for
//   anyone who'd rather click than scroll); the page glides so the printer
//   settles in the middle while the rest of the paper feeds out.
const Resume = () => {
    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const printerRef = useRef(null);
    const receiptRef = useRef(null);
    const roomRef = useRef(null);
    const flowersRef = useRef(null);
    const hintRef = useRef(null);
    const pressRef = useRef(() => {});
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const [moving, setMoving] = useState(false);
    const [mode, setMode] = useState('feeding');
    const printed = mode === 'printed';

    useEffect(() => {
        const section = sectionRef.current;
        const stage = stageRef.current;
        const printer = printerRef.current;
        const receipt = receiptRef.current;
        const room = roomRef.current;
        if (!section || !stage || !printer || !receipt || !room) return undefined;

        // room: how far the printer can stay pinned while the page scrolls.
        // top: where on screen it pins, or null to leave it in the page.
        const pin = (roomHeight, top) => {
            room.style.height = roomHeight ? `${roomHeight}px` : '';
            stage.style.top = top == null ? '' : `${top}px`;
        };

        const reset = () => {
            pin(0, null);
            receipt.style.transform = 'none';
            receipt.style.transition = '';
        };

        if (reducedMotion) {
            reset();
            return undefined;
        }

        let mode = 'feeding';
        let frame = 0;
        let glideFrame = 0;
        let idleTimer = 0;
        let lastProgress = -1;

        const enterMode = (next) => {
            mode = next;
            setMode(next);
        };

        const geometry = () => {
            const height = receipt.offsetHeight;
            const nav = document.querySelector('nav');
            const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
            // Pin the printer in the middle of whatever screen this is, leaving
            // the flowers and the "click to print" note on top of it clear of
            // the navbar.
            const middle = (window.innerHeight - printer.offsetHeight) / 2;
            const flowers = flowersRef.current ? flowersRef.current.offsetHeight : 0;
            const hint = hintRef.current ? hintRef.current.offsetHeight : 0;
            return {
                height,
                runway: Math.min(height * FEED_SCROLL_SHARE, MAX_FEED_SCROLL),
                pinTop: Math.max(navBottom + PIN_GAP + Math.max(flowers, hint), middle),
            };
        };

        // progress: 0 = paper inside the printer, 1 = fully out.
        const feed = (progress) => {
            receipt.style.transform = `translateY(calc(${(progress - 1) * 100}% - ${(1 - progress) * 40}px))`;
        };

        const shake = () => {
            setMoving(true);
            window.clearTimeout(idleTimer);
            idleTimer = window.setTimeout(() => setMoving(false), 160);
        };

        const update = () => {
            frame = 0;
            if (mode === 'rewinding' || mode === 'printing') return;
            const { height, runway, pinTop } = geometry();
            if (!height) {
                reset();
                return;
            }
            const sectionTop = section.getBoundingClientRect().top;

            if (mode === 'printed') {
                // Back on the first screen with the printer out of sight:
                // quietly load the paper back in for next time.
                if (sectionTop > window.innerHeight) {
                    enterMode('feeding');
                } else {
                    pin(0, null);
                    feed(1);
                    return;
                }
            }

            pin(runway, pinTop);
            // How far the printer has been held while the page scrolled on.
            const pinned = Math.min(runway, Math.max(0, pinTop - sectionTop));
            const progress = pinned / runway;
            feed(progress);

            if (lastProgress !== -1 && progress !== lastProgress && progress > 0) shake();
            lastProgress = progress;
            if (progress >= 1) {
                // Fully printed: drop the pinning room so scrolling back up
                // doesn't reveal an empty gap above the printer. The page and
                // the scroll position shift by the same amount, so nothing on
                // screen moves.
                pin(0, null);
                feed(1);
                window.scrollTo({ top: window.scrollY - runway, behavior: 'instant' });
                enterMode('printed');
            }
        };

        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        // Glides the page from where it is to `targetScroll` while the paper
        // goes from `fromProgress` to `toProgress`, then hands over to `done`.
        const glide = (duration, targetScroll, fromProgress, toProgress, done) => {
            const startScroll = window.scrollY;
            const started = performance.now();
            setMoving(true);
            receipt.style.transition = 'none';

            const step = (now) => {
                const t = Math.min(1, (now - started) / duration);
                const eased = easeInOut(t);
                window.scrollTo({ top: startScroll + (targetScroll - startScroll) * eased, behavior: 'instant' });
                feed(fromProgress + (toProgress - fromProgress) * eased);
                if (t < 1) {
                    glideFrame = window.requestAnimationFrame(step);
                    return;
                }
                receipt.style.transition = '';
                setMoving(false);
                lastProgress = -1;
                done();
            };
            glideFrame = window.requestAnimationFrame(step);
        };

        const rewind = () => {
            const { runway, pinTop } = geometry();
            // Scroll position where the printer sits in the middle with no paper out.
            const targetScroll = Math.max(0, section.getBoundingClientRect().top + window.scrollY - pinTop);
            enterMode('rewinding');
            // Put the pinning room back (below the receipt, so nothing on screen
            // moves), but don't pin while the page glides back up.
            pin(runway, null);
            // The page glides so the printer lands at the pin point just as the
            // last of the paper goes in.
            glide(REWIND_MS, targetScroll, 1, 0, () => {
                enterMode('feeding');
                update();
            });
        };

        const print = () => {
            const { runway, pinTop } = geometry();
            const sectionTop = section.getBoundingClientRect().top;
            const fromProgress = Math.min(runway, Math.max(0, pinTop - sectionTop)) / runway;
            enterMode('printing');
            // Swap to the printed layout (no pinning room) without anything on
            // screen moving: unpinning drops the printer back to its spot in the
            // page, and the scroll follows it by the same amount.
            const before = stage.getBoundingClientRect().top;
            pin(0, null);
            const after = stage.getBoundingClientRect().top;
            window.scrollTo({ top: window.scrollY + (after - before), behavior: 'instant' });
            // Then glide so the printer settles in the middle while the rest of
            // the paper feeds out.
            const targetScroll = Math.max(0, window.scrollY + (before - pinTop));
            glide(PRINT_MS, targetScroll, fromProgress, 1, () => {
                enterMode('printed');
                update();
            });
        };

        pressRef.current = () => {
            if (mode === 'printed') rewind();
            else if (mode === 'feeding') print();
        };

        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            window.cancelAnimationFrame(frame);
            window.cancelAnimationFrame(glideFrame);
            window.clearTimeout(idleTimer);
            pressRef.current = () => {};
            reset();
        };
    }, [reducedMotion]);

    return (
        <section id="resume-section" ref={sectionRef} className="resume-section">
            <div className="resume-stage" ref={stageRef}>
                <div ref={printerRef} className={`resume-printer${moving ? ' is-printing' : ''}`}>
                    <PrinterFlowers ref={flowersRef} />
                    <PrintHint ref={hintRef} visible={mode === 'feeding' && !reducedMotion} />
                    <div className="resume-printer-body">
                        <span className="resume-printer-label">RESUME</span>
                        <span className="resume-printer-led" aria-hidden="true" />
                        <button
                            type="button"
                            className="resume-printer-button"
                            onClick={() => pressRef.current()}
                            disabled={reducedMotion || (mode !== 'feeding' && !printed)}
                            aria-label={printed ? 'Rewind the resume back into the printer' : 'Print the resume'}
                            title={printed ? 'Rewind' : 'Print'}
                        />
                    </div>
                    <div className="resume-printer-slot" aria-hidden="true" />
                </div>
                <div className="resume-feed">
                    <div className="resume-receipt" ref={receiptRef}>
                        <div className="resume-receipt-header" aria-hidden="true">
                            <span>* * * RESUME * * *</span>
                        </div>
                        <div className="resume-content">
                            <h2 style={sectionTitleStyle}>EDUCATION</h2>
                            <div style={sectionBlockStyle}>
                                {education.map((edu, idx) => (
                                    <div key={idx} style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.08rem', textAlign: 'left' }}>{edu.school} <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--color-text-muted)' }}>· {edu.detail}</span></div>
                                        <div style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 3, marginTop: 3, textAlign: 'left' }}>{edu.degree}</div>
                                        <div style={{ fontSize: '0.97rem', color: 'var(--color-text-muted)', textAlign: 'left' }}>{edu.grad}</div>
                                    </div>
                                ))}
                            </div>
                            <h2 style={sectionTitleStyle}>EXPERIENCE</h2>
                            <div style={sectionBlockStyle}>
                                {experiences.map((exp, idx) => (
                                    <div key={idx} style={{ marginBottom: 22, textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.08rem', textAlign: 'left' }}>{exp.title} <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--color-text-muted)' }}> - {exp.company}</span></div>
                                        <div style={{ fontSize: '0.97rem', color: 'var(--color-text-muted)', marginBottom: 3, marginTop: 3, textAlign: 'left' }}>{exp.dates}</div>
                                    </div>
                                ))}
                            </div>
                            <h2 style={sectionTitleStyle}>SKILLS</h2>
                            <div className="resume-skills-section">
                                {skills.map((skill, idx) => (
                                    <div key={idx} style={{ minWidth: 120, textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{skill.category}</div>
                                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '1rem', lineHeight: 1.5 }}>
                                            {skill.items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="resume-receipt-footer" aria-hidden="true">
                            <span>THANKS FOR READING</span>
                            <div className="resume-barcode" />
                        </div>
                        <div className="resume-zigzag-edge" aria-hidden="true" />
                    </div>
                </div>
            </div>
            <div ref={roomRef} className="resume-pin-room" aria-hidden="true" />
        </section>
    );
};

export default Resume;
