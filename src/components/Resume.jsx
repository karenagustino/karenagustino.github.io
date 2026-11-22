import React, { useEffect, useRef, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import './Resume.css';

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
// How long the rewind button takes to reel the paper back in.
const REWIND_MS = 1000;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// The receipt is tied to scroll position, in three modes:
// - "feeding": once the printer reaches the middle of the screen it stays
//   pinned there while scrolling feeds the paper out (scrolling up pulls it
//   back in).
// - "printed": the whole receipt is out and stays out, whichever way the page
//   scrolls, until the visitor is back at the top of the page with the printer
//   off screen, or presses the printer's button.
// - "rewinding": the button was pressed; the page glides back up while the
//   paper reels in, ending exactly where feeding starts.
const Resume = () => {
    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const printerRef = useRef(null);
    const receiptRef = useRef(null);
    const rewindRef = useRef(() => {});
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const [moving, setMoving] = useState(false);
    const [printed, setPrinted] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        const stage = stageRef.current;
        const printer = printerRef.current;
        const receipt = receiptRef.current;
        if (!section || !stage || !printer || !receipt) return undefined;

        const reset = () => {
            section.style.paddingBottom = '';
            stage.style.transform = '';
            receipt.style.transform = 'none';
            receipt.style.transition = '';
        };

        if (reducedMotion) {
            reset();
            return undefined;
        }

        let mode = 'feeding';
        let frame = 0;
        let rewindFrame = 0;
        let idleTimer = 0;
        let lastProgress = -1;

        const enterMode = (next) => {
            mode = next;
            setPrinted(next === 'printed');
        };

        const geometry = () => {
            const height = receipt.offsetHeight;
            const nav = document.querySelector('nav');
            const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
            // Pin the printer in the middle of whatever screen this is.
            const middle = (window.innerHeight - printer.offsetHeight) / 2;
            return {
                height,
                runway: Math.min(height * FEED_SCROLL_SHARE, MAX_FEED_SCROLL),
                pinTop: Math.max(navBottom + PIN_GAP, middle),
            };
        };

        // offset: how far the printer and paper are held down from their spot
        // in the page. progress: 0 = paper inside the printer, 1 = fully out.
        const apply = (offset, progress) => {
            stage.style.transform = `translateY(${offset}px)`;
            receipt.style.transform = `translateY(calc(${(progress - 1) * 100}% - ${(1 - progress) * 40}px))`;
        };

        const shake = () => {
            setMoving(true);
            window.clearTimeout(idleTimer);
            idleTimer = window.setTimeout(() => setMoving(false), 160);
        };

        const update = () => {
            frame = 0;
            if (mode === 'rewinding') return;
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
                    section.style.paddingBottom = '';
                    apply(0, 1);
                    return;
                }
            }

            // Extra room at the bottom of the section for the pinned stretch.
            section.style.paddingBottom = `${runway}px`;
            const pinned = Math.min(runway, Math.max(0, pinTop - sectionTop));
            const progress = pinned / runway;
            apply(pinned, progress);

            if (lastProgress !== -1 && progress !== lastProgress && progress > 0) shake();
            lastProgress = progress;
            if (progress >= 1) {
                // Fully printed: drop the pinning room so scrolling back up
                // doesn't reveal an empty gap above the printer. The page and
                // the scroll position shift by the same amount, so nothing on
                // screen moves.
                section.style.paddingBottom = '';
                apply(0, 1);
                window.scrollTo({ top: window.scrollY - runway, behavior: 'instant' });
                enterMode('printed');
            }
        };

        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        rewindRef.current = () => {
            if (mode !== 'printed') return;
            const { runway, pinTop } = geometry();
            const startScroll = window.scrollY;
            // Scroll position where the printer sits in the middle with no paper out.
            const targetScroll = Math.max(0, section.getBoundingClientRect().top + startScroll - pinTop);
            const started = performance.now();
            enterMode('rewinding');
            setMoving(true);
            receipt.style.transition = 'none';
            // Put the pinning room back (below the receipt, so nothing on screen moves).
            section.style.paddingBottom = `${runway}px`;

            const step = (now) => {
                const t = Math.min(1, (now - started) / REWIND_MS);
                const eased = easeInOut(t);
                window.scrollTo({ top: startScroll + (targetScroll - startScroll) * eased, behavior: 'instant' });
                // The page glides so the printer lands at the pin point just as
                // the last of the paper goes in.
                apply(0, 1 - eased);
                if (t < 1) {
                    rewindFrame = window.requestAnimationFrame(step);
                    return;
                }
                receipt.style.transition = '';
                setMoving(false);
                lastProgress = -1;
                enterMode('feeding');
                update();
            };
            rewindFrame = window.requestAnimationFrame(step);
        };

        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            window.cancelAnimationFrame(frame);
            window.cancelAnimationFrame(rewindFrame);
            window.clearTimeout(idleTimer);
            rewindRef.current = () => {};
            reset();
        };
    }, [reducedMotion]);

    return (
        <section id="resume-section" ref={sectionRef} className="resume-section">
            <div className="resume-stage" ref={stageRef}>
                <div ref={printerRef} className={`resume-printer${moving ? ' is-printing' : ''}`}>
                    <div className="resume-printer-body">
                        <span className="resume-printer-label">RESUME</span>
                        <span className="resume-printer-led" aria-hidden="true" />
                        <button
                            type="button"
                            className="resume-printer-button"
                            onClick={() => rewindRef.current()}
                            disabled={!printed || reducedMotion}
                            aria-label="Rewind the resume back into the printer"
                            title={printed ? 'Rewind' : undefined}
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
        </section>
    );
};

export default Resume;
