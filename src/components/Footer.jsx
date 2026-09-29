import React from 'react';
import GardenFooter from './footer/GardenFooter';

// The garden wraps the original footer copy rather than replacing it: the
// plants grow up toward this text block and stop just below it.
const Footer = () => (
    <footer style={{ color: 'var(--color-text-navy)' }}>
        <GardenFooter heading="let's grow something">
            <div>thank you for making it this far ♡</div>
            <div>
                contact me <a href="mailto:karenagustino20@gmail.com" style={{ color: 'var(--color-accent-orange)', textDecoration: 'underline' }}>here</a>! i'm always happy to chat ~
            </div>
        </GardenFooter>
    </footer>
);

export default Footer; 