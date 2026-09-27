import React from 'react';
import './CaseStudyCard.css';

const CaseStudyCard = ({ caseStudy, positionStyle, isActive, onClick }) => {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    // Size, position and skin all live in CaseStudyCard.css so they can follow
    // the fluid --card-* custom properties; only the per-frame coverflow values
    // (transform/opacity/zIndex/pointerEvents) are set inline.
    const cardStyle = { ...positionStyle };

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
