import React from 'react';
import PlotRow from '../components/works/PlotRow';
import caseStudies from '../data/caseStudies';

const WorksPage = () => (
    <section
        id="works-page"
        style={{
            minHeight: '100vh',
            paddingTop: '3rem',
            paddingBottom: '4rem',
            boxSizing: 'border-box',
            color: 'var(--color-text-primary)',
            fontFamily: 'Roboto, sans-serif',
        }}
    >
        <h1
            style={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '2rem',
                marginBottom: '2rem',
                color: 'var(--color-text-primary)',
            }}
        >
            works
        </h1>
        <PlotRow caseStudies={caseStudies} />
    </section>
);

export default WorksPage;
