import React from 'react';
import leafPixel from '../assets/leaf-pixel.png';
import pmcIcon from '../assets/pmc.png';
import eyedropperIcon from '../assets/dropper.png';
import shirtIcon from '../assets/dress.png';
import vendingIcon from '../assets/vending.png';
import mapIcon from '../assets/address.png';
import checkIcon from '../assets/check.png';
import vrIcon from '../assets/vr.png';
import snapIcon from '../assets/snap.png';
import soilBg from '../assets/patch.png';
import komoIcon from '../assets/komo.svg';
import './Projects.css';

// patch.png is 558x375. The card used to be 380x210 (a wider ratio), so
// `center/cover` scaled the artwork to fill the box and cropped roughly 45px
// off the top and bottom — cutting the hand-drawn rough edges that give the
// patch its shape. Driving the card off the artwork's own ratio keeps the
// whole patch visible, and doing it with aspect-ratio rather than a fixed
// height keeps that true at every width, not just the widest one.
const PATCH_WIDTH = 558;
const PATCH_HEIGHT = 375;
const CARD_WIDTH = 440;
// Fluid so the content still fits inside the patch's proportions on a phone.
// aspect-ratio yields to content that doesn't fit, so fixed sizes here would
// stretch the card taller than the artwork and bring the cropping back.
const ICON_SIZE = 'clamp(50px, 14vw, 82px)';
const CIRCLE_SIZE = 'clamp(84px, 23vw, 140px)';
// The leaves used to hang 45px clear of the patch, which read as floating
// below it. Dipping only slightly past the edge makes them look like they're
// resting on the soil. Raising them does put them at the same height as the
// tech line, so they sit a layer behind it (see LEAF_Z / CONTENT_LAYER) and
// hug the outer corners rather than covering the text.
const LEAF_SIZE = 'clamp(82px, 26vw, 118px)';
// Expressed as a share of the leaf rather than a fixed pixel drop, so the patch
// edge cuts through the same point of the leaf at every size: roughly a third
// of it below the line, the rest resting on the soil.
const LEAF_DIP = `calc(${LEAF_SIZE} * -0.4)`;
const LEAF_INSET = -4;
const LEAF_Z = 0;
// Keeps the title and tech line painted above the leaves.
const CONTENT_LAYER = { position: 'relative', zIndex: 1 };

const projects = [
    {
        id: 'komo',
        title: "Komo",
        tech: "React, TypeScript, Node.js, Express, Gemini API, Slack & Notion APIs",
        href: "https://devpost.com/software/komo-4lrjdg",
        icon: komoIcon,
        // Freshest planting: shown first and announced by the "new sprout"
        // popup above the garden.
        isNew: true,
        // Pinned to the patch's top-left as a ribbon. Any project can have one.
        award: "Winner",
    },
    {
        title: "UBC Product Management Club's First Membership Portal",
        tech: "React, TypeScript, Google Firebase",
        href: "https://ubcpmc.com/",
        icon: pmcIcon,
        // Still live and maintained by a tech team, with a real user base:
        // green, not prize-orange.
        award: "500+ users",
        awardTone: 'evergreen',
    },
    {
        title: "Colorpal",
        tech: "Python, React, JavaScript, Figma, OpenAI API",
        href: "https://github.com/karenagustino/colorpal",
        icon: eyedropperIcon,
        award: "Winner",
    },
    {
        title: "Enspo Lookbook Generator",
        tech: "Python, React, JavaScript, JSON, Express.js",
        href: "https://github.com/karenagustino/Enspo",
        icon: shirtIcon,
    },
    {
        title: "Vending Machine for Business",
        tech: "Java, JSON, Swing for GUI, Git",
        href: "https://github.com/karenagustino/VendingMachine",
        icon: vendingIcon,
    },
    {
        title: "Shanghai Virtual Guide",
        tech: "Python, Flask, HTML, CSS, MySQL",
        href: "https://github.com/karenagustino/ShanghaiVirtualGuide",
        icon: mapIcon,
    },
    {
        title: "Vitae-C",
        tech: "React, JavaScript, HTML, CSS, REST API",
        href: "https://github.com/karenagustino/Vitae-C",
        icon: checkIcon,
    },
    {
        title: "VirtualPrep",
        tech: "Python, Flask, HTML, CSS, MySQL",
        href: "https://github.com/karenagustino/nwhacks-project",
        icon: vrIcon,
    },
    {
        title: "LingoSnap",
        tech: "JavaScript, TypeScript, Lens Studio",
        icon: snapIcon,
    },
];

const cardStyle = {
    // Fluid rather than a hard 380px: on a phone a fixed width pushed the card
    // (and its leaf decorations) past the viewport and scrolled the whole page
    // sideways.
    width: '100%',
    maxWidth: CARD_WIDTH,
    // Without border-box the 1.2rem side padding is added on top of width:100%,
    // so the card renders wider than its own grid column.
    boxSizing: 'border-box',
    aspectRatio: `${PATCH_WIDTH} / ${PATCH_HEIGHT}`,
    overflow: 'visible',
    background: `url(${soilBg}) center/cover no-repeat`,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 500,
    fontSize: '1.1rem',
    // Symmetric: the old 2.2rem top against a 1.2rem bottom pushed the centred
    // content half a rem below the patch's actual middle.
    padding: 'clamp(1rem, 3vw, 1.6rem)',
    margin: '0 auto',
    transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
    cursor: 'pointer',
};

const cardHoverStyle = {
    transform: 'translateY(-8px) scale(1.03)',
};

const iconCircleStyle = {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: '50%',
    background: '#6B715C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto clamp(10px, 2.5vw, 20px) auto',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

// A tiny pixel sprout for the popup, drawn in cells like the footer's plants.
const SPROUT_CELLS = [
    [5, 0, '#8FB36A'], [6, 0, '#8FB36A'],
    [1, 1, '#8FB36A'], [2, 1, '#8FB36A'], [4, 1, '#8FB36A'], [5, 1, '#6E9450'], [6, 1, '#8FB36A'],
    [1, 2, '#6E9450'], [2, 2, '#8FB36A'], [3, 2, '#8FB36A'], [4, 2, '#6E9450'],
    [3, 3, '#6E9450'],
    [3, 4, '#6E9450'],
    [2, 5, '#9A6B45'], [3, 5, '#9A6B45'], [4, 5, '#9A6B45'],
    [1, 6, '#7A5234'], [2, 6, '#9A6B45'], [3, 6, '#9A6B45'], [4, 6, '#9A6B45'], [5, 6, '#7A5234'],
];

const Sprout = () => (
    <svg className="garden-new__sprout" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
        {SPROUT_CELLS.map(([x, y, fill]) => (
            <rect key={`${x}-${y}`} x={x} y={y + 1} width={1} height={1} fill={fill} />
        ))}
    </svg>
);

// Pixel star for the award ribbon: 1 = star, drawn in 1x1 cells.
const STAR_ROWS = [
    '...1...',
    '...1...',
    '1111111',
    '.11111.',
    '..111..',
    '.11.11.',
    '1.....1',
];

const PixelStar = ({ x }) => (
    // Centred on (x, 0) in the sash's own rotated frame, 2.2 units per cell.
    <g transform={`translate(${x - 7.7} -7.7) scale(2.2)`} shapeRendering="crispEdges">
        {STAR_ROWS.flatMap((row, y) =>
            row.split('').map((ch, cx) =>
                ch === '1' ? <rect key={`${cx}-${y}`} x={cx} y={y} width={1} height={1} /> : null
            )
        )}
    </g>
);

// Sash across the patch's top-left corner. Drawn in the patch artwork's own
// 558x375 space and stretched over the whole card, so it scales uniformly with
// the card (whose aspect-ratio is locked to the artwork).
//   outer edge: (0,205) -> (222,0)    inner edge: (0,139) -> (150.6,0)
// The band deliberately overshoots the card box; it is then masked by the
// patch artwork itself (see AWARD_MASK), so both ends stop exactly on the
// soil's torn, painted edge rather than on the invisible box around it.
const SASH_ANGLE = -42.67;
const SASH_CENTRE = 'translate(93.3 86)';

const AWARD_MASK = {
    WebkitMaskImage: `url(${soilBg})`,
    maskImage: `url(${soilBg})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
};

// The label has to fit between the stars (about 148 units, less some breathing
// room either side). Longer labels first tighten their letter-spacing, then
// step down from the default 24, rather than running into the stars. Widths
// are rough Roboto Black caps measurements in em: spaces and figures are
// narrower than letters, and counting them as letters undersized "500+ users".
const LABEL_ROOM = 128;
const charWidth = (ch) => (ch === ' ' ? 0.3 : /[0-9+]/.test(ch) ? 0.6 : 0.7);
const labelSpacing = (label) => (label.length > 7 ? 1.5 : 3);
const labelSize = (label) => {
    const ems = label.split('').reduce((sum, ch) => sum + charWidth(ch), 0);
    const spacing = labelSpacing(label) * (label.length - 1);
    return Math.min(24, (LABEL_ROOM - spacing) / ems);
};

const AwardRibbon = ({ label, tone = 'prize' }) => (
    <svg
        className={`garden-award garden-award--${tone}`}
        style={AWARD_MASK}
        viewBox={`0 0 ${PATCH_WIDTH} ${PATCH_HEIGHT}`}
        role="img"
        aria-label={label}
    >
        <polygon className="garden-award__band" points="-6 144.5 -6 210.5 228.9 -6 156.2 -6" />
        {/* Stitching just inside each edge, in keeping with the hand-made patch. */}
        <path className="garden-award__stitch" d="M-6 152.5 L165.9 -6 M-6 202.5 L220.2 -6" />
        <g transform={`${SASH_CENTRE} rotate(${SASH_ANGLE})`}>
            <g className="garden-award__star">
                <PixelStar x={-82} />
                <PixelStar x={82} />
            </g>
            <text
                className="garden-award__label"
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={labelSize(label).toFixed(1)}
                letterSpacing={labelSpacing(label)}
            >
                {label}
            </text>
        </g>
    </svg>
);

const newProject = projects.find((p) => p.isNew);

const Projects = () => {
    const [hovered, setHovered] = React.useState(-1);
    const [wiggling, setWiggling] = React.useState(false);
    const newCardRef = React.useRef(null);

    const showNewProject = () => {
        const card = newCardRef.current;
        if (!card) return;
        card.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        // Restart the wiggle even if the popup is clicked twice in a row.
        setWiggling(false);
        requestAnimationFrame(() => setWiggling(true));
    };
    // Shuffle leaf positions only once
    const leafPositions = React.useMemo(() => {
        const leafCorners = [
            { bottom: LEAF_DIP, left: LEAF_INSET },
            { bottom: LEAF_DIP, right: LEAF_INSET },
        ];
        return projects.map(() => {
            // Pick one random bottom corner for each card
            const pos = leafCorners[Math.floor(Math.random() * 2)];
            return [pos];
        });
    }, []);
    return (
        <section id="projects-section" style={{
            margin: '0 auto',
            maxWidth: 1200,
            padding: '2.5rem 0 4rem 0',
            background: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            position: 'relative',
        }}>
            <h2 style={{ textAlign: 'center', color: 'var(--color-text-primary)', fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>
                <span role="img" aria-label="sunflower">🌻</span> the garden of projects
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--color-sage)', fontFamily: 'Roboto, sans-serif', fontStyle: 'italic', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                where my technical experiments grow
            </p>
            {newProject && (
                <div className="garden-new">
                    <button type="button" className="garden-new__bubble" onClick={showNewProject}>
                        <Sprout />
                        <span className="garden-new__tag">new</span>
                        <span className="garden-new__text">
                            fresh sprout: <strong>{newProject.title}</strong> just bloomed
                        </span>
                    </button>
                </div>
            )}
            <div style={{
                display: 'grid',
                // `min(CARD_WIDTH, 100%)` lets a column shrink below the card's
                // design width on narrow screens; a bare minmax(380px, ...)
                // forces a 380px track even in a 390px viewport, which is what
                // pushed the page into horizontal scroll.
                gridTemplateColumns: `repeat(auto-fit, minmax(min(${CARD_WIDTH}px, 100%), 1fr))`,
                // Rows get the extra room: the leaf decorations hang ~45px below
                // each patch, so a tighter row gap crowds them into the next row.
                gap: '4rem 3.25rem',
                justifyItems: 'center',
                margin: '0 auto',
                maxWidth: 1100,
                paddingLeft: '1rem',
                paddingRight: '1rem',
                boxSizing: 'border-box'
            }}>
                {projects.map((proj, idx) => {
                    // Use precomputed leaf positions
                    const leaves = leafPositions[idx];
                    return (
                        <div
                            key={idx}
                            ref={proj.isNew ? newCardRef : undefined}
                            className={proj.isNew && wiggling ? 'garden-card--wiggle' : undefined}
                            onAnimationEnd={proj.isNew ? () => setWiggling(false) : undefined}
                            style={hovered === idx ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
                            onClick={() => proj.href && window.open(proj.href, '_blank')}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(-1)}
                        >
                            {proj.award && <AwardRibbon label={proj.award} tone={proj.awardTone} />}
                            <div style={iconCircleStyle}>
                                {proj.icon && <img src={proj.icon} alt="icon" style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', display: 'block' }} />}
                            </div>
                            <div style={{ ...CONTENT_LAYER, fontWeight: 700, fontSize: 'clamp(0.95rem, 3vw, 1.25rem)', color: '#fff', textAlign: 'center', marginBottom: 8, lineHeight: 1.2 }}>
                                {proj.title}
                            </div>
                            <div style={{ ...CONTENT_LAYER, fontWeight: 400, fontSize: 'clamp(0.82rem, 2.6vw, 1.05rem)', color: '#F3E9D2', textAlign: 'center', lineHeight: 1.15 }}>
                                {proj.tech}
                            </div>
                            {/* Pixel decor: randomized corners */}
                            {leaves.map((pos, i) => (
                                <img key={i} src={leafPixel} alt="leaf pixel" style={{ position: 'absolute', width: LEAF_SIZE, height: LEAF_SIZE, zIndex: LEAF_Z, pointerEvents: 'none', ...pos }} />
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Projects; 