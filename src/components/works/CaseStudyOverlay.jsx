import React from 'react';
import './CaseStudyOverlay.css';

const CaseStudyOverlay = ({ caseStudy, closing, onClose, onExited }) => {
    const handleBodyClick = (event) => {
        event.stopPropagation();
        onClose();
    };

    // The panel stays mounted while it fades out; the parent unmounts it once
    // that animation reports back here. Guarded on the event's own target so a
    // future animation on a child can't end the exit early by bubbling up.
    const handleAnimationEnd = (event) => {
        if (closing && event.target === event.currentTarget) {
            onExited();
        }
    };

    return (
        <div
            className={`case-study-overlay${closing ? ' case-study-overlay--closing' : ''}`}
            role="dialog"
            aria-modal="true"
            onClick={handleBodyClick}
            onAnimationEnd={handleAnimationEnd}
        >
            <button
                type="button"
                className="case-study-overlay-close"
                aria-label="Close case study"
                onClick={handleBodyClick}
            >
                ×
            </button>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
                {caseStudy.title}
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.9rem', color: '#A9B8D6', marginBottom: 12 }}>
                {caseStudy.role} · {caseStudy.timeframe}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: 10 }}>
                {caseStudy.problem}
            </div>
            <ul style={{ margin: '0 0 10px 0', paddingLeft: 18, fontSize: '0.88rem', color: '#A9B8D6' }}>
                {caseStudy.process.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ul>
            <div style={{ fontSize: '0.95rem', color: '#fff' }}>
                {caseStudy.outcome}
            </div>
        </div>
    );
};

export default CaseStudyOverlay;
