export const SLOTS = [
    { z: 0, rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 100 },
    { z: -300, rotate: 38, x: 54, scale: 0.86, opacity: 0.55, zIndex: 99 },
    { z: -600, rotate: 76, x: 108, scale: 0.72, opacity: 0.22, zIndex: 98 },
    { z: -900, rotate: 38, x: 162, scale: 0.5, opacity: 0, zIndex: 98 },
];

const MAX_SLOT_INDEX = SLOTS.length - 1;

export function interpolateSlot(distance) {
    const sign = distance < 0 ? -1 : 1;
    const abs = Math.abs(distance);
    const clamped = Math.min(abs, MAX_SLOT_INDEX);
    const lowerIndex = Math.floor(clamped);
    const upperIndex = Math.min(lowerIndex + 1, MAX_SLOT_INDEX);
    const frac = clamped - lowerIndex;

    const lower = SLOTS[lowerIndex];
    const upper = SLOTS[upperIndex];
    const lerp = (a, b) => a + (b - a) * frac;

    const nearestIndex = Math.min(Math.round(clamped), MAX_SLOT_INDEX);

    return {
        z: lerp(lower.z, upper.z),
        rotate: sign * lerp(lower.rotate, upper.rotate),
        x: sign * lerp(lower.x, upper.x),
        scale: lerp(lower.scale, upper.scale),
        opacity: lerp(lower.opacity, upper.opacity),
        zIndex: SLOTS[nearestIndex].zIndex,
    };
}

export function cardTransformStyle(distance, isActive) {
    const { z, rotate, x, scale, opacity, zIndex } = interpolateSlot(distance);
    return {
        transform: `translate3d(${x}%, 0, ${z}px) rotateY(${rotate}deg) scale(${scale})`,
        opacity,
        zIndex: isActive ? 100 : zIndex,
        pointerEvents: opacity <= 0.02 ? 'none' : 'auto',
    };
}
