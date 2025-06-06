import React from 'react';
import Navbar from './Navbar';
import apron from '../assets/apron.png';

const UnderConstruction = ({ isSection, isModal }) => {
    if (isModal) {
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#425066', minHeight: '30vh', background: 'none' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: 10 }}>oops...this page is under progression 🚧</h2>
                <p style={{ fontSize: '1.08rem' }}>come back soon!</p>
            </div>
        );
    }
    if (isSection) {
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#425066', minHeight: '40vh' }}>
                <h2>oops...this page is under progression 🚧</h2>
                <p>come back soon!</p>
            </div>
        );
    }
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', color: '#425066', position: 'relative' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <h2>oops...this page is under progression 🚧</h2>
                <p>come back soon!</p>
            </div>
            <img src={apron} alt="apron" style={{ position: 'fixed', bottom: 24, right: 24, width: 80, zIndex: 10 }} />
        </div>
    );
};

export default UnderConstruction; 