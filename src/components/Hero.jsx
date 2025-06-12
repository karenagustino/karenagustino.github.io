import React, { useState, useEffect, useRef } from 'react';
import underline from '../assets/underline.png';
import apron from '../assets/apron.png';
import leafPixel from '../assets/leaf-pixel.png';
import music from '../assets/cafe-music.mp3';
import './Hero.css';

const FallingLeaves = ({ show }) => (
    <div
        style={{
            position: 'absolute',
            bottom: 44, // exactly matches the apron
            right: 44, // exactly matches the apron
            width: 90, // match apron width
            height: 90,
            pointerEvents: 'none',
            zIndex: 21,
            overflow: 'visible',
        }}
    >
        {/* Leaf 1 */}
        <img
            src={leafPixel}
            alt="leaf pixel"
            style={{
                position: 'absolute',
                left: 0,
                width: 58,
                height: 58,
                opacity: show ? 1 : 0,
                animation: show ? 'leafFall1 1.3s linear' : 'none',
                pointerEvents: 'none',
            }}
        />
        {/* Leaf 2 */}
        <img
            src={leafPixel}
            alt="leaf pixel"
            style={{
                position: 'absolute',
                left: 20,
                width: 54,
                height: 54,
                opacity: show ? 1 : 0,
                animation: show ? 'leafFall2 1.4s linear' : 'none',
                pointerEvents: 'none',
            }}
        />
        {/* Leaf 3 */}
        <img
            src={leafPixel}
            alt="leaf pixel"
            style={{
                position: 'absolute',
                left: 45,
                width: 60,
                height: 60,
                opacity: show ? 1 : 0,
                animation: show ? 'leafFall3 1.2s linear' : 'none',
                pointerEvents: 'none',
            }}
        />
        <style>{`
            @keyframes leafFall1 {
                0% { transform: translateY(0) rotate(-10deg); opacity: 1; }
                40% { transform: translateY(30px) translateX(-10px) rotate(8deg); }
                80% { transform: translateY(60px) translateX(-18px) rotate(-12deg); }
                100% { transform: translateY(80px) translateX(-22px) rotate(0deg); opacity: 0; }
            }
            @keyframes leafFall2 {
                0% { transform: translateY(0) rotate(8deg); opacity: 1; }
                30% { transform: translateY(20px) translateX(8px) rotate(-8deg); }
                70% { transform: translateY(60px) translateX(18px) rotate(12deg); }
                100% { transform: translateY(80px) translateX(22px) rotate(0deg); opacity: 0; }
            }
            @keyframes leafFall3 {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                50% { transform: translateY(40px) translateX(-6px) rotate(-10deg); }
                100% { transform: translateY(80px) translateX(-12px) rotate(8deg); opacity: 0; }
            }
        `}</style>
    </div>
);

const Hero = () => {
    const [wind, setWind] = useState(false);
    const [showApron, setShowApron] = useState(true);
    const [musicPlaying, setMusicPlaying] = useState(false);
    const audioRef = useRef(null);

    const triggerWind = () => {
        setWind(false);
        setTimeout(() => setWind(true), 10);
        setTimeout(() => setWind(false), 1200);
        if (audioRef && audioRef.current) {
            if (musicPlaying) {
                audioRef.current.pause();
                setMusicPlaying(false);
            } else {
                audioRef.current.play()
                setMusicPlaying(true);
            }
        }
    };

    useEffect(() => {
        const onScroll = () => {
            const hero = document.getElementById('hero-section');
            if (hero) {
                const heroBottom = hero.getBoundingClientRect().bottom;
                setShowApron(heroBottom > 0);
            }
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const descriptions = ["product", "software", "matcha", "muay thai"]


    return (
        <section id="hero-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', background: 'transparent', position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginTop: '10vh', marginBottom: '7vh', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', flexWrap: 'wrap' }}>
                    <h1 id="hero-title" style={{ fontWeight: 400, fontSize: '2.7rem', margin: 0, color: '#49523A', fontFamily: 'Roboto, sans-serif', letterSpacing: '-1px', textAlign: 'left', lineHeight: 1.1, display: 'inline' }}>
                        hello, i'm
                    </h1>
                    <span style={{ fontWeight: 700, color: '#425066', fontSize: '4.5rem', letterSpacing: '-3px', margin: 0, textAlign: 'left', lineHeight: 1, display: 'inline-block' }}>
                        KAREN
                    </span>
                </div>
                <div style={{ fontSize: '1.5rem', marginTop: '1.2rem', color: '#49523A', fontFamily: 'Roboto, sans-serif', position: 'relative', fontWeight: 400, textAlign: 'left', maxWidth: 900, display: 'inline-flex', alignItems: 'center' }}>
                    a {" "} <div className="my-descriptions">
                        <span>
                            {descriptions.map((desc) => (
                                <div className="description">
                                    {desc}
                                    <img src={underline} alt="underline" className='underline' />
                                </div>
                            ))}
                        </span>
                    </div>
                    enthusiast with a love for building.
                </div>
            </div>
            <div style={{ position: 'fixed', bottom: 44, right: 44, zIndex: 10, opacity: showApron ? 1 : 0, pointerEvents: showApron ? 'auto' : 'none', transition: 'opacity 0.4s' }}>
                <img
                    src={apron}
                    alt="apron"
                    style={{ width: 90, cursor: 'pointer', display: 'block', filter: 'drop-shadow(0 2px 6px #b6bfa655)' }}
                    onClick={triggerWind}
                />
                <audio ref={audioRef} src={music} type='audio/mp3' loop />
                <FallingLeaves show={wind} />
            </div>
            <style>{`
                .bounce-up {
                    animation: bounceUp 0.6s cubic-bezier(.4,2,.6,1);
                }
                @keyframes bounceUp {
                    0% { transform: translateY(0); }
                    30% { transform: translateY(-18px) scale(1.08); }
                    60% { transform: translateY(2px) scale(0.98); }
                    100% { transform: translateY(0) scale(1); }
                }
            `}</style>
        </section>
    );
};

export default Hero; 