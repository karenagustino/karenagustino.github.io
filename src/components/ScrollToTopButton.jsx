import React, { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
    const [show, setShow] = useState(false);
    const [bounce, setBounce] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const hero = document.getElementById('hero-section');
            if (hero) {
                const heroBottom = hero.getBoundingClientRect().bottom;
                setShow(heroBottom < 0);
            } else {
                setShow(window.scrollY > 200);
            }
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (show) {
            setBounce(false);
            setTimeout(() => setBounce(true), 10);
        }
    }, [show]);

    return show ? (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={bounce ? 'scroll-bounce' : ''}
            style={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                width: 48,
                height: 48,
                cursor: 'pointer',
                fontSize: 24,
                zIndex: 1000,
                opacity: 0.65,
                transition: 'opacity 0.3s',
            }}
            aria-label="Scroll to top"
        >
            ↑
            <style>{`
                .scroll-bounce {
                    animation: scrollBounce 0.7s cubic-bezier(.4,2,.6,1);
                }
                @keyframes scrollBounce {
                    0% { transform: scale(0.7) translateY(30px); opacity: 0; }
                    40% { transform: scale(1.08) translateY(-8px); opacity: 1; }
                    70% { transform: scale(0.98) translateY(2px); }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </button>
    ) : null;
};

export default ScrollToTopButton; 