import React, { useEffect, useRef, useState } from 'react';
import CaseStudyCard from './CaseStudyCard';
import CaseStudyOverlay from './CaseStudyOverlay';
import { cardTransformStyle } from './coverflowMath';
import './PlotStage.css';

const PIXELS_PER_CARD = 160;
const DRAG_THRESHOLD = 5;

const PlotStage = ({ caseStudies }) => {
    const total = caseStudies.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const dragStateRef = useRef({ startX: 0, wasDrag: false, offset: 0 });

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
        if (overlayOpen) return;
        dragStateRef.current = { startX: event.clientX, wasDrag: false, offset: 0 };
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
        const nextOffset = Math.max(minOffset, Math.min(maxOffset, rawOffset));
        dragStateRef.current.offset = nextOffset;
        setDragOffset(nextOffset);
    };

    const handlePointerUp = () => {
        if (dragging) {
            const offset = dragStateRef.current.offset;
            const nextIndex = Math.max(0, Math.min(total - 1, Math.round(activeIndex + offset)));
            setActiveIndex(nextIndex);
        }
        dragStateRef.current.offset = 0;
        setDragging(false);
        setDragOffset(0);
    };

    // A drag can end anywhere on the page (the arrow buttons sit right in the
    // natural overshoot zone), so the move/up/cancel listeners live on `window`
    // for the duration of the drag rather than on the track element itself.
    useEffect(() => {
        if (!dragging) return undefined;
        const onMove = (event) => handlePointerMove(event);
        const onUp = () => handlePointerUp();
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
        // handlePointerMove/handlePointerUp read only `dragging`, `activeIndex`,
        // `total` and the drag ref — never the `dragOffset` state — so the
        // closure captured here stays correct for the whole drag.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragging, activeIndex, total]);

    // The overlay renders as a sibling of the track, so Escape has to be handled
    // at the document level: once focus leaves the track (e.g. Tab to an arrow),
    // the track's own onKeyDown would never see the key press.
    useEffect(() => {
        if (!overlayOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOverlayOpen(false);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [overlayOpen]);

    const handleTrackClickCapture = (event) => {
        if (dragStateRef.current.wasDrag) {
            event.preventDefault();
            event.stopPropagation();
            dragStateRef.current.wasDrag = false;
        }
    };

    const handleKeyDown = (event) => {
        // Escape is handled by the document-level listener above; the track
        // itself stays inert while the overlay is open.
        if (overlayOpen) return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToNext();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToPrevious();
        }
    };

    return (
        <div className="plot-stage">
            <button
                type="button"
                className="plot-stage-arrow plot-stage-arrow-left"
                aria-label="Previous case study"
                onClick={goToPrevious}
                disabled={overlayOpen}
            >
                &#8249;
            </button>
            <ul
                className={`plot-stage-track${dragging ? ' plot-stage-track--dragging' : ''}`}
                aria-label="Case studies — drag, click a card, or use arrow keys to browse"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
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
                disabled={overlayOpen}
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
