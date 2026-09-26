import caseStudies from './caseStudies';

const REQUIRED_KEYS = [
    'id', 'title', 'tagline', 'tech', 'role', 'timeframe',
    'problem', 'process', 'outcome', 'heroImage', 'gallery',
];

test('exports exactly 4 placeholder case studies', () => {
    expect(caseStudies).toHaveLength(4);
});

test('every case study has the full required shape', () => {
    caseStudies.forEach((entry) => {
        REQUIRED_KEYS.forEach((key) => {
            expect(entry).toHaveProperty(key);
        });
        expect(Array.isArray(entry.tech)).toBe(true);
        expect(Array.isArray(entry.process)).toBe(true);
        expect(Array.isArray(entry.gallery)).toBe(true);
    });
});

test('every case study has a unique id', () => {
    const ids = caseStudies.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
});
