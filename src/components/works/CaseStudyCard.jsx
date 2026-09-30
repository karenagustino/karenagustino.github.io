import React from 'react';
import './CaseStudyCard.css';

const pad = (value) => String(value).padStart(2, '0');

const CaseStudyCard = ({
    caseStudy, positionStyle, isActive, index = 0, onClick,
    onLockedEnter, onLockedLeave,
}) => {
    // A study whose content is not written yet. Its card stays on the shelf and
    // scrolls with the rest, but it opens nothing: no button role, no tab stop,
    // no handlers. The overlay renders from `sections`, which these entries
    // deliberately lack, so this is the second of two locks rather than the only
    // one.
    const comingSoon = Boolean(caseStudy.comingSoon);

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

    const interaction = comingSoon
        ? {
            'aria-disabled': true,
            // pointerenter/leave do not bubble, so these belong on the card
            // itself rather than on a wrapper.
            onPointerEnter: onLockedEnter,
            onPointerLeave: onLockedLeave,
        }
        : {
            role: 'button',
            tabIndex: isActive ? 0 : -1,
            'aria-label': `${caseStudy.title} — open full screen`,
            onClick,
            onKeyDown: handleKeyDown,
        };

    return (
        <div
            className={`case-study-card${comingSoon ? ' case-study-card--coming-soon' : ''}`}
            style={cardStyle}
            {...interaction}
        >
            <span className="case-study-card-eyebrow" aria-hidden="true">CASE FILE {pad(index + 1)}</span>
            <div className="case-study-card-title">{caseStudy.title}</div>
            <div className="case-study-card-tagline">{caseStudy.tagline}</div>
            <div className="case-study-card-tech">{caseStudy.tech.join(' · ')}</div>
            {/* Stated on the card itself, not only in the hover cursor: a touch
                visitor gets no hover, and would otherwise meet a card that
                simply does nothing when tapped. */}
            {comingSoon && <span className="case-study-card-lock">COMING SOON</span>}
        </div>
    );
};

export default CaseStudyCard;
