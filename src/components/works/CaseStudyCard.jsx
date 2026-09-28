import React from 'react';
import './CaseStudyCard.css';

const pad = (value) => String(value).padStart(2, '0');

const CaseStudyCard = ({ caseStudy, positionStyle, isActive, index = 0, onClick }) => {
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
            <span className="case-study-card-eyebrow" aria-hidden="true">CASE FILE {pad(index + 1)}</span>
            <div className="case-study-card-title">{caseStudy.title}</div>
            <div className="case-study-card-tagline">{caseStudy.tagline}</div>
            <div className="case-study-card-tech">{caseStudy.tech.join(' · ')}</div>
        </div>
    );
};

export default CaseStudyCard;
