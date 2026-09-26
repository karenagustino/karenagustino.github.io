import React from 'react';
import PlotStage from './works/PlotStage';
import caseStudies from '../data/caseStudies';

const Works = () => (
    <section id="works-section" style={{
        margin: '0 auto',
        maxWidth: 1200,
        padding: '2.5rem 0 4rem 0',
        background: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        position: 'relative',
    }}>
        <h2 style={{ textAlign: 'center', color: 'var(--color-text-primary)', fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: 0 }}>
            <span role="img" aria-label="potted plant">🪴</span> the garden of case studies
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-sage)', fontFamily: 'Roboto, sans-serif', fontStyle: 'italic', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            deeper roots behind the garden
        </p>
        <PlotStage caseStudies={caseStudies} />
    </section>
);

export default Works;
