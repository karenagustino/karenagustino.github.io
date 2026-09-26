import { SLOTS, interpolateSlot, cardTransformStyle } from './coverflowMath';

test('SLOTS has exactly 4 rows', () => {
    expect(SLOTS).toHaveLength(4);
});

test('interpolateSlot(0) returns the identity slot', () => {
    expect(interpolateSlot(0)).toEqual({
        z: 0, rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 100,
    });
});

test('interpolateSlot(1) matches SLOTS[1] exactly', () => {
    expect(interpolateSlot(1)).toEqual({
        z: -300, rotate: 38, x: 94, scale: 0.86, opacity: 0.55, zIndex: 99,
    });
});

test('interpolateSlot(-1) mirrors x and rotate but keeps z/scale/opacity/zIndex unsigned', () => {
    expect(interpolateSlot(-1)).toEqual({
        z: -300, rotate: -38, x: -94, scale: 0.86, opacity: 0.55, zIndex: 99,
    });
});

test('interpolateSlot(1.5) is the midpoint between SLOTS[1] and SLOTS[2]', () => {
    const result = interpolateSlot(1.5);
    expect(result.z).toBeCloseTo(-450);
    expect(result.rotate).toBeCloseTo(45);
    expect(result.x).toBeCloseTo(127.5);
    expect(result.scale).toBeCloseTo(0.79);
    expect(result.opacity).toBeCloseTo(0.385);
});

test('interpolateSlot clamps beyond the last slot, in both directions', () => {
    expect(interpolateSlot(5)).toEqual({
        z: -900, rotate: 60, x: 211, scale: 0.5, opacity: 0, zIndex: 98,
    });
    expect(interpolateSlot(-5)).toEqual({
        z: -900, rotate: -60, x: -211, scale: 0.5, opacity: 0, zIndex: 98,
    });
});

test('every slot pushes further back, further out and turns further away', () => {
    for (let i = 1; i < SLOTS.length; i += 1) {
        expect(SLOTS[i].z).toBeLessThan(SLOTS[i - 1].z);
        expect(SLOTS[i].x).toBeGreaterThan(SLOTS[i - 1].x);
        expect(SLOTS[i].rotate).toBeGreaterThan(SLOTS[i - 1].rotate);
        expect(SLOTS[i].scale).toBeLessThan(SLOTS[i - 1].scale);
        expect(SLOTS[i].opacity).toBeLessThan(SLOTS[i - 1].opacity);
    }
});

// The first pass was tuned against a flat render, which hid the fact that
// `rotate: 76` at distance 2 sat past the angle where the card goes edge-on
// under the real `perspective: 1200px` and projects inside-out. Guard the
// invariant rather than just the numbers.
test('no slot is rotated far enough to collapse or invert under the stage perspective', () => {
    const PERSPECTIVE = 1200;
    const CARD_WIDTH = 380;

    SLOTS.slice(1).forEach((slot, i) => {
        const translate = (slot.x / 100) * CARD_WIDTH;
        const halfWidth = (CARD_WIDTH / 2) * slot.scale;
        const radians = (slot.rotate * Math.PI) / 180;
        const depth = Math.abs(slot.z);

        // The inner edge swings toward the viewer, the outer edge away.
        const inner = ((translate - halfWidth * Math.cos(radians)) * PERSPECTIVE)
            / (PERSPECTIVE + depth - halfWidth * Math.sin(radians));
        const outer = ((translate + halfWidth * Math.cos(radians)) * PERSPECTIVE)
            / (PERSPECTIVE + depth + halfWidth * Math.sin(radians));

        expect(outer - inner).toBeGreaterThan(10); // never a sliver, never inverted

        // The angle at which this slot would go exactly edge-on.
        const edgeOn = (Math.atan2(PERSPECTIVE + depth, translate) * 180) / Math.PI;
        expect(slot.rotate).toBeLessThan(edgeOn - 5);

        // And it must clear the card in front of it rather than overlapping it.
        const previous = SLOTS[i];
        const previousOuter = previous.x === 0
            ? CARD_WIDTH / 2
            : (((previous.x / 100) * CARD_WIDTH + (CARD_WIDTH / 2) * previous.scale
                * Math.cos((previous.rotate * Math.PI) / 180)) * PERSPECTIVE)
                / (PERSPECTIVE + Math.abs(previous.z) + (CARD_WIDTH / 2) * previous.scale
                    * Math.sin((previous.rotate * Math.PI) / 180));
        expect(inner).toBeGreaterThan(previousOuter);
    });
});

test('cardTransformStyle produces a ready-to-use style object for the active card', () => {
    const style = cardTransformStyle(0, true);
    expect(style.transform).toBe('translate3d(0%, 0, 0px) rotateY(0deg) scale(1)');
    expect(style.opacity).toBe(1);
    expect(style.zIndex).toBe(100);
    expect(style.pointerEvents).toBe('auto');
});

test('cardTransformStyle marks far-away cards as non-interactive', () => {
    const style = cardTransformStyle(3, false);
    expect(style.opacity).toBe(0);
    expect(style.pointerEvents).toBe('none');
});
