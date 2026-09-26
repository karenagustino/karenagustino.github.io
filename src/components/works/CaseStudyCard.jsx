import React from 'react';
import soilBg from '../../assets/patch.png';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 340;

const cardStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexShrink: 0,
    background: `url(${soilBg}) center/cover no-repeat`,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1.2rem',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif',
};

const CaseStudyCard = ({ caseStudy }) => (
    <div className="case-study-card" style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
            {caseStudy.title}
        </div>
        <div style={{ fontWeight: 400, fontSize: '0.95rem', color: 'var(--color-sage)', marginBottom: 8 }}>
            {caseStudy.tagline}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#F3E9D2' }}>
            {caseStudy.tech.join(' · ')}
        </div>
    </div>
);

export default CaseStudyCard;
