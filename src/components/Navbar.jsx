import React, { useRef, useEffect, useState } from 'react';
import logo from '../assets/logo.png'; // Make sure the logo is named logo.png in assets

const Navbar = ({ onWorksClick }) => {
    const logoRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleGardenClick = () => {
        document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogoClick = () => {
        const hero = document.getElementById('hero-section');
        if (hero) {
            const top = hero.getBoundingClientRect().top + window.scrollY;
            if (window.scrollY <= top + 10) {
                // Already at top, trigger bounce
                const title = document.getElementById('hero-title');
                if (title) {
                    title.classList.remove('bounce-up');
                    void title.offsetWidth; // force reflow
                    title.classList.add('bounce-up');
                }
            } else {
                hero.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 80,
            padding: '2rem 0 1.2rem 0',
            fontSize: '1.1rem',
            background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
            boxShadow: scrolled ? '0 2px 12px rgba(60,70,80,0.07)' : 'none',
            width: '100vw',
            left: 0,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background 0.3s, box-shadow 0.3s',
            backdropFilter: scrolled ? 'blur(4px)' : 'none',
        }}>
            <span style={{ cursor: 'pointer', color: '#49523A', fontWeight: 700, fontFamily: 'Roboto, sans-serif' }} onClick={onWorksClick}>works</span>
            <img ref={logoRef} src={logo} alt="Karen Agustino Logo" style={{ height: 54, margin: '0 18px', cursor: 'pointer' }} onClick={handleLogoClick} />
            <span style={{ cursor: 'pointer', color: '#49523A', fontWeight: 700, fontFamily: 'Roboto, sans-serif' }} onClick={handleGardenClick}>garden</span>
        </nav>
    );
};

export default Navbar; 