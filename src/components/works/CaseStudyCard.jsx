import React from 'react';
import './CaseStudyCard.css';

const CARD_WIDTH = 380;
const CARD_HEIGHT = 260;

const cardBackground = 'linear-gradient(135deg, #1B1F2A 0%, #262B36 100%)';

const CaseStudyCard = ({ caseStudy, positionStyle, isActive, onClick }) => {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    const cardStyle = {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: -CARD_WIDTH / 2,
        background: cardBackground,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1.2rem',
        boxSizing: 'border-box',
        fontFamily: 'Roboto, sans-serif',
        cursor: 'pointer',
        ...positionStyle,
    };

    return (
        <div
            className="case-study-card"
            style={cardStyle}
            role="button"
            tabIndex={isActive ? 0 : -1}
            aria-label={`${caseStudy.title} — open full screen`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
                {caseStudy.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.95rem', color: '#A9B8D6', marginBottom: 8 }}>
                {caseStudy.tagline}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#A9B8D6' }}>
                {caseStudy.tech.join(' · ')}
            </div>
        </div>
    );
};

export default CaseStudyCard;
