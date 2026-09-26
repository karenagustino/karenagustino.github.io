import React from 'react';
import './CaseStudyOverlay.css';

const OVERLAY_WIDTH = 480;
const OVERLAY_HEIGHT = 320;

const CaseStudyOverlay = ({ caseStudy, onClose }) => {
    const handleBodyClick = (event) => {
        event.stopPropagation();
        onClose();
    };

    return (
        <div
            className="case-study-overlay"
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: OVERLAY_WIDTH,
                height: OVERLAY_HEIGHT,
                marginLeft: -OVERLAY_WIDTH / 2,
                marginTop: -OVERLAY_HEIGHT / 2,
                zIndex: 200,
                background: 'linear-gradient(135deg, #1B1F2A 0%, #262B36 100%)',
                borderRadius: 12,
                padding: '1.5rem',
                boxSizing: 'border-box',
                overflowY: 'auto',
                cursor: 'pointer',
                fontFamily: 'Roboto, sans-serif',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
            }}
            onClick={handleBodyClick}
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
