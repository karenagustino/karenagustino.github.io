import React, { useRef, useState } from 'react';
import CaseStudyCard from './CaseStudyCard';
import CaseStudyOverlay from './CaseStudyOverlay';
import { cardTransformStyle } from './coverflowMath';
import './PlotStage.css';

const STAGE_HEIGHT = 340;
const PIXELS_PER_CARD = 160;
const DRAG_THRESHOLD = 5;

const PlotStage = ({ caseStudies }) => {
    const total = caseStudies.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const dragStateRef = useRef({ startX: 0, wasDrag: false });

    const goToPrevious = () => {
        if (overlayOpen) return;
        setActiveIndex((current) => (current - 1 + total) % total);
    };

    const goToNext = () => {
        if (overlayOpen) return;
        setActiveIndex((current) => (current + 1) % total);
    };

    const handleCardClick = (index) => {
        if (overlayOpen) return;
        if (index === activeIndex) {
            setOverlayOpen(true);
        } else {
            setActiveIndex(index);
        }
    };

    const handlePointerDown = (event) => {
        dragStateRef.current = { startX: event.clientX, wasDrag: false };
        setDragging(true);
        setDragOffset(0);
    };

    const handlePointerMove = (event) => {
        if (!dragging) return;
        const delta = dragStateRef.current.startX - event.clientX;
        if (Math.abs(delta) > DRAG_THRESHOLD) {
            dragStateRef.current.wasDrag = true;
        }
        const rawOffset = delta / PIXELS_PER_CARD;
        const minOffset = -0.5 - activeIndex;
        const maxOffset = total - 1 + 0.5 - activeIndex;
        setDragOffset(Math.max(minOffset, Math.min(maxOffset, rawOffset)));
    };

    const handlePointerUp = () => {
        if (dragging) {
            const nextIndex = Math.max(0, Math.min(total - 1, Math.round(activeIndex + dragOffset)));
            setActiveIndex(nextIndex);
        }
        setDragging(false);
        setDragOffset(0);
    };

    const handleTrackClickCapture = (event) => {
        if (dragStateRef.current.wasDrag) {
            event.preventDefault();
            event.stopPropagation();
            dragStateRef.current.wasDrag = false;
        }
    };

    const handleKeyDown = (event) => {
        if (overlayOpen) {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOverlayOpen(false);
            }
            return;
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToNext();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToPrevious();
        }
    };

    return (
        <div className="plot-stage" style={{ position: 'relative', width: '100%', height: STAGE_HEIGHT }}>
            <button
                type="button"
                className="plot-stage-arrow plot-stage-arrow-left"
                aria-label="Previous case study"
                onClick={goToPrevious}
            >
                &#8249;
            </button>
            <ul
                className={`plot-stage-track${dragging ? ' plot-stage-track--dragging' : ''}`}
                aria-label="Case studies — drag, click a card, or use arrow keys to browse"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClickCapture={handleTrackClickCapture}
            >
                {caseStudies.map((caseStudy, index) => {
                    const distance = index - activeIndex - dragOffset;
                    const isActive = index === activeIndex;
                    return (
                        <li key={caseStudy.id} style={{ listStyle: 'none' }}>
                            <CaseStudyCard
                                caseStudy={caseStudy}
                                positionStyle={cardTransformStyle(distance, isActive)}
                                isActive={isActive}
                                onClick={() => handleCardClick(index)}
                            />
                        </li>
                    );
                })}
            </ul>
            <button
                type="button"
                className="plot-stage-arrow plot-stage-arrow-right"
                aria-label="Next case study"
                onClick={goToNext}
            >
                &#8250;
            </button>
            {overlayOpen && (
                <CaseStudyOverlay
                    caseStudy={caseStudies[activeIndex]}
                    onClose={() => setOverlayOpen(false)}
                />
            )}
        </div>
    );
};

export default PlotStage;
