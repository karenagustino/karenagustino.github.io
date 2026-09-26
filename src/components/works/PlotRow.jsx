import React, { useRef } from 'react';
import CaseStudyCard from './CaseStudyCard';
import './PlotRow.css';

const CARD_WIDTH = 280;
const CARD_GAP = 24;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

const PlotRow = ({ caseStudies }) => {
    const trackRef = useRef(null);
    const dragState = useRef({ dragging: false, startX: 0, startScrollLeft: 0 });

    const scrollByAmount = (amount) => {
        trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const handlePointerDown = (event) => {
        if (event.pointerType !== 'mouse') return;
        const track = trackRef.current;
        if (!track) return;
        dragState.current = {
            dragging: true,
            startX: event.clientX,
            startScrollLeft: track.scrollLeft,
        };
        track.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const track = trackRef.current;
        if (!track || !dragState.current.dragging) return;
        const delta = event.clientX - dragState.current.startX;
        track.scrollLeft = dragState.current.startScrollLeft - delta;
    };

    const handlePointerUp = (event) => {
        dragState.current.dragging = false;
        trackRef.current?.releasePointerCapture?.(event.pointerId);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollByAmount(SCROLL_AMOUNT);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollByAmount(-SCROLL_AMOUNT);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <button
                type="button"
                className="plot-row-arrow plot-row-arrow-left"
                aria-label="Previous case study"
                onClick={() => scrollByAmount(-SCROLL_AMOUNT)}
            >
                &#8249;
            </button>
            <ul
                className="plot-row-track"
                ref={trackRef}
                aria-label="Case studies — scroll, drag, or use arrow keys to browse"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                {caseStudies.map((caseStudy) => (
                    <li key={caseStudy.id} style={{ listStyle: 'none' }}>
                        <CaseStudyCard caseStudy={caseStudy} />
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="plot-row-arrow plot-row-arrow-right"
                aria-label="Next case study"
                onClick={() => scrollByAmount(SCROLL_AMOUNT)}
            >
                &#8250;
            </button>
        </div>
    );
};

export default PlotRow;
