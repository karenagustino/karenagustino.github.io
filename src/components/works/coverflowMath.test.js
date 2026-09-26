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
        z: -300, rotate: 38, x: 54, scale: 0.86, opacity: 0.55, zIndex: 99,
    });
});

test('interpolateSlot(-1) mirrors x and rotate but keeps z/scale/opacity/zIndex unsigned', () => {
    expect(interpolateSlot(-1)).toEqual({
        z: -300, rotate: -38, x: -54, scale: 0.86, opacity: 0.55, zIndex: 99,
    });
});

test('interpolateSlot(1.5) is the midpoint between SLOTS[1] and SLOTS[2]', () => {
    const result = interpolateSlot(1.5);
    expect(result.z).toBeCloseTo(-450);
    expect(result.rotate).toBeCloseTo(57);
    expect(result.x).toBeCloseTo(81);
    expect(result.scale).toBeCloseTo(0.79);
    expect(result.opacity).toBeCloseTo(0.385);
});

test('interpolateSlot clamps beyond the last slot, in both directions', () => {
    expect(interpolateSlot(5)).toEqual({
        z: -900, rotate: 38, x: 162, scale: 0.5, opacity: 0, zIndex: 98,
    });
    expect(interpolateSlot(-5)).toEqual({
        z: -900, rotate: -38, x: -162, scale: 0.5, opacity: 0, zIndex: 98,
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
