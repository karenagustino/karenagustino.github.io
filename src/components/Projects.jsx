import React from 'react';
import plantPixel from '../assets/plant-pixel.png';
import leafPixel from '../assets/leaf-pixel.png';
import pmcIcon from '../assets/pmc.png';
import eyedropperIcon from '../assets/eyedropper.png';
import shirtIcon from '../assets/shirt.png';
import vendingIcon from '../assets/vending.png';
import mapIcon from '../assets/map.png';
import checkIcon from '../assets/check.png';
import vrIcon from '../assets/vr.png';
import snapIcon from '../assets/snap.png';
import soilBg from '../assets/soil-bg.png';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 210;
const ICON_SIZE = 70;
const CIRCLE_SIZE = 120;

const projects = [
    {
        title: "UBC Product Management Club's First Membership Portal",
        tech: "React, TypeScript, Google Firebase",
        icon: pmcIcon,
    },
    {
        title: "Colorpal",
        tech: "Python, React, JavaScript, Figma, OpenAI API",
        icon: eyedropperIcon,
    },
    {
        title: "Enspo Lookbook Generator",
        tech: "Python, React, JavaScript, JSON, Express.js",
        icon: shirtIcon,
    },
    {
        title: "Vending Machine for Business",
        tech: "Java, JSON, Swing for GUI, Git",
        icon: vendingIcon,
    },
    {
        title: "Shanghai Virtual Guide",
        tech: "Python, Flask, HTML, CSS, MySQL",
        icon: mapIcon,
    },
    {
        title: "Vitae-C",
        tech: "React, JavaScript, HTML, CSS, REST API",
        icon: checkIcon,
    },
    {
        title: "VirtualPrep",
        tech: "Python, Flask, HTML, CSS, MySQL",
        icon: vrIcon,
    },
    {
        title: "Shanghai Virtual Guide",
        tech: "Python, Flask, HTML, CSS, MySQL",
        icon: snapIcon,
    },
];

const cardStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    background: `url(${soilBg}) center/cover no-repeat`,
    borderRadius: 36,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 500,
    fontSize: '1.1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    overflow: 'hidden',
    padding: '2.2rem 1.2rem 1.2rem 1.2rem',
    margin: '0 auto',
    transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
    cursor: 'pointer',
};

const cardHoverStyle = {
    transform: 'translateY(-8px) scale(1.03)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
};

const iconCircleStyle = {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: '50%',
    background: '#6B715C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

const Projects = () => {
    const [hovered, setHovered] = React.useState(-1);
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
            <h2 style={{ textAlign: 'center', color: '#49523A', fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>
                <span role="img" aria-label="sunflower">🌻</span> the garden of projects
            </h2>
            <p style={{ textAlign: 'center', color: '#B6BFA6', fontFamily: 'Roboto, sans-serif', fontStyle: 'italic', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                where my technical experiments grow
            </p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_WIDTH}px, 1fr))`,
                gap: '2.5rem',
                justifyItems: 'center',
                margin: '0 auto',
                maxWidth: 1100,
            }}>
                {projects.map((proj, idx) => {
                    // Randomize leaf corners for each card
                    const leafCorners = [
                        { bottom: 10, left: 10 },
                        { bottom: 10, right: 10 },
                        { top: 10, left: 10 },
                        { top: 10, right: 10 },
                    ];
                    // Shuffle and pick 2-3 corners for each card
                    const shuffled = leafCorners.sort(() => 0.5 - Math.random());
                    const leaves = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
                    return (
                        <div
                            key={idx}
                            style={hovered === idx ? { ...cardStyle, ...cardHoverStyle } : cardStyle}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(-1)}
                        >
                            <div style={iconCircleStyle}>
                                {proj.icon && <img src={proj.icon} alt="icon" style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', display: 'block' }} />}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', textAlign: 'center', marginBottom: 6, lineHeight: 1.2 }}>
                                {proj.title}
                            </div>
                            <div style={{ fontWeight: 400, fontSize: '1rem', color: '#F3E9D2', textAlign: 'center', lineHeight: 1.1 }}>
                                {proj.tech}
                            </div>
                            {/* Pixel decor: randomized corners */}
                            {leaves.map((pos, i) => (
                                <img key={i} src={leafPixel} alt="leaf pixel" style={{ position: 'absolute', width: 38, height: 38, pointerEvents: 'none', ...pos }} />
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Projects; 