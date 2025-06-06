import React, { useEffect, useState } from 'react';
import UnderConstruction from './UnderConstruction';

const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(60, 70, 80, 0.18)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s',
};

const modalContentStyle = {
    background: 'white',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    minWidth: 340,
    minHeight: 220,
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'modalFadeIn 0.4s cubic-bezier(.4,2,.6,1)',
};

const closeBtnStyle = {
    position: 'absolute',
    top: 18,
    right: 18,
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#425066',
    cursor: 'pointer',
    zIndex: 2,
    transition: 'opacity 0.3s, transform 0.3s',
};

const WorksModal = ({ open, onClose }) => {
    const [visible, setVisible] = useState(open);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setClosing(false);
            document.body.style.overflow = 'hidden';
        } else if (visible) {
            setClosing(true);
            setTimeout(() => {
                setVisible(false);
                setClosing(false);
                document.body.style.overflow = '';
            }, 350);
        }
        return () => { document.body.style.overflow = ''; };
        // eslint-disable-next-line
    }, [open]);

    if (!visible) return null;

    return (
        <div style={{ ...modalBackdropStyle, opacity: closing ? 0 : 1, pointerEvents: closing ? 'none' : 'auto' }} onClick={onClose}>
            <div style={{ ...modalContentStyle, animation: closing ? 'modalFadeOut 0.35s cubic-bezier(.4,2,.6,1)' : 'modalFadeIn 0.4s cubic-bezier(.4,2,.6,1)' }} onClick={e => e.stopPropagation()}>
                <button
                    style={{
                        ...closeBtnStyle,
                        opacity: closing ? 0 : 1,
                        transform: closing ? 'translateY(-16px) scale(0.8)' : 'none',
                        pointerEvents: closing ? 'none' : 'auto',
                        animation: closing ? 'closeBtnFadeOut 0.35s cubic-bezier(.4,2,.6,1)' : 'closeBtnFadeIn 0.4s cubic-bezier(.4,2,.6,1)',
                    }}
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                <UnderConstruction isModal />
            </div>
            <style>{`
        @keyframes modalFadeIn {
          from { transform: translateY(40px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes modalFadeOut {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(40px) scale(0.98); opacity: 0; }
        }
        @keyframes closeBtnFadeIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.8); }
          to { opacity: 1; transform: none; }
        }
        @keyframes closeBtnFadeOut {
          from { opacity: 1; transform: none; }
          to { opacity: 0; transform: translateY(-16px) scale(0.8); }
        }
      `}</style>
        </div>
    );
};

export default WorksModal; 