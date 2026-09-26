import React, { useState } from 'react';
import soilBg from '../../assets/patch.png';
import './CaseStudyCard.css';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 260;
const EXPANDED_WIDTH = 640;

const collapsedBackground = `url(${soilBg}) center/cover no-repeat`;
const expandedBackground = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${soilBg}) center/cover no-repeat`;

const CaseStudyCard = ({ caseStudy }) => {
    const [expanded, setExpanded] = useState(false);

    const cardStyle = {
        width: expanded ? `min(${EXPANDED_WIDTH}px, 90vw)` : CARD_WIDTH,
        height: CARD_HEIGHT,
        flexShrink: 0,
        background: expanded ? expandedBackground : collapsedBackground,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: expanded ? 'flex-start' : 'flex-end',
        padding: '1.2rem',
        boxSizing: 'border-box',
        fontFamily: 'Roboto, sans-serif',
        position: 'relative',
        overflowY: expanded ? 'auto' : 'hidden',
        cursor: 'pointer',
    };

    const handleClose = (event) => {
        event.stopPropagation();
        setExpanded(false);
    };

    if (expanded) {
        return (
            <div
                className="case-study-card case-study-card--expanded"
                style={cardStyle}
                onClick={handleClose}
            >
                <button
                    type="button"
                    className="case-study-card-close"
                    aria-label="Collapse case study"
                    onClick={handleClose}
                >
                    ×
                </button>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
                    {caseStudy.title}
                </div>
                <div style={{ fontWeight: 400, fontSize: '0.85rem', color: '#F3E9D2', marginBottom: 10 }}>
                    {caseStudy.role} · {caseStudy.timeframe}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 8 }}>
                    {caseStudy.problem}
                </div>
                <ul style={{ margin: '0 0 8px 0', paddingLeft: 18, fontSize: '0.85rem', color: '#F3E9D2' }}>
                    {caseStudy.process.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ul>
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                    {caseStudy.outcome}
                </div>
            </div>
        );
    }

    return (
        <div
            className="case-study-card"
            style={cardStyle}
            onClick={() => setExpanded(true)}
        >
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
                {caseStudy.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.95rem', color: '#F3E9D2', marginBottom: 8 }}>
                {caseStudy.tagline}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#F3E9D2' }}>
                {caseStudy.tech.join(' · ')}
            </div>
        </div>
    );
};

export default CaseStudyCard;
