// Calibrated against a real 3D render (perspective: 1200px on .plot-stage-track,
// transform-style: preserve-3d on the <li> wrappers), not the flat orthographic
// projection the first pass was accidentally tuned against.
//
// `x` is a percentage of the card's own 380px width, and a card at negative z is
// pulled toward the vanishing point by P / (P - z), so the apparent offsets are
// much smaller than the raw percentages suggest.
//
// The old `rotate: 76` at distance 2 could not be rescued by re-spacing alone: a
// card is edge-on when tan(rotate) = (P + |z|) / translateX, which at that depth
// happens at ~77deg. Its widest possible projection was 44px even at x: 0, and it
// inverted (projected inside-out) past x: ~122. Rotations here stay well clear of
// that limit, so every side card reads as a trapezoid rather than a sliver.
//
// Measured in Chrome 154 at a 1440px viewport, active card spanning 530..910:
//   distance 1 -> 915.9..1084.3 (168.5px wide)
//   distance 2 -> 1094.1..1157.8 (63.7px wide)
//   distance 3 -> 1168.6..1187.0 (18.4px wide, opacity 0)
// i.e. no overlap with the active card or with each other.
export const SLOTS = [
    { z: 0, rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 100 },
    { z: -300, rotate: 38, x: 94, scale: 0.86, opacity: 0.55, zIndex: 99 },
    { z: -600, rotate: 52, x: 161, scale: 0.72, opacity: 0.22, zIndex: 98 },
    { z: -900, rotate: 60, x: 211, scale: 0.5, opacity: 0, zIndex: 98 },
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
