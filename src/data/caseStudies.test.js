import caseStudies from './caseStudies';

// Keys the card face and the overlay header read directly.
const REQUIRED_KEYS = [
    'id', 'title', 'tagline', 'tech', 'role', 'timeframe',
    'tags', 'stats', 'note', 'sections',
];

const BLOCK_TYPES = ['prose', 'rows', 'metrics'];

test('exports exactly 4 case studies', () => {
    expect(caseStudies).toHaveLength(4);
});

test('every case study has the full required shape', () => {
    caseStudies.forEach((entry) => {
        REQUIRED_KEYS.forEach((key) => {
            expect(entry).toHaveProperty(key);
        });
        expect(Array.isArray(entry.tech)).toBe(true);
        expect(Array.isArray(entry.tags)).toBe(true);
        expect(Array.isArray(entry.stats)).toBe(true);
        expect(Array.isArray(entry.sections)).toBe(true);
        expect(entry.sections.length).toBeGreaterThan(0);
    });
});

test('every case study has a unique id', () => {
    const ids = caseStudies.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
});

// The overlay's sidebar is built from the section list and scrolls to a section
// by id, so a duplicate id inside one case study would break navigation.
test('sections carry an icon, a title, and an id unique within their case study', () => {
    caseStudies.forEach((entry) => {
        const sectionIds = entry.sections.map((section) => section.id);
        expect(new Set(sectionIds).size).toBe(sectionIds.length);
        entry.sections.forEach((section) => {
            expect(typeof section.id).toBe('string');
            expect(section.icon).toBeTruthy();
            expect(section.title).toBeTruthy();
            expect(Array.isArray(section.blocks)).toBe(true);
            expect(section.blocks.length).toBeGreaterThan(0);
        });
    });
});

test('every block is one of the renderable types, with the fields that type needs', () => {
    caseStudies.forEach((entry) => {
        entry.sections.forEach((section) => {
            section.blocks.forEach((block) => {
                expect(BLOCK_TYPES).toContain(block.type);
                if (block.type === 'prose') {
                    expect(typeof block.text).toBe('string');
                    expect(block.text.length).toBeGreaterThan(0);
                } else {
                    expect(Array.isArray(block.items)).toBe(true);
                    expect(block.items.length).toBeGreaterThan(0);
                    block.items.forEach((item) => {
                        expect(item.label).toBeTruthy();
                        expect(block.type === 'rows' ? item.text : item.value).toBeTruthy();
                    });
                }
            });
        });
    });
});

// A standing instruction on this content: the copy must not contain dashes, of
// any width. Ids are excluded because they are slugs rather than prose.
const COPY_FIELDS = ['title', 'tagline', 'role', 'timeframe', 'note', 'text', 'label', 'value', 'caption'];
const DASH = /[\u002D\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/;

const collectCopy = (value, key) => {
    if (typeof value === 'string') {
        return COPY_FIELDS.includes(key) ? [value] : [];
    }
    if (Array.isArray(value)) {
        return value.flatMap((item) => collectCopy(item, key));
    }
    if (value && typeof value === 'object') {
        return Object.entries(value).flatMap(([childKey, child]) => collectCopy(child, childKey));
    }
    return [];
};

test('no case study copy contains a dash', () => {
    const strings = caseStudies.flatMap((entry) => collectCopy(entry, 'root'));
    expect(strings.length).toBeGreaterThan(0);
    strings.forEach((string) => {
        expect(string).not.toMatch(DASH);
    });
});

test('the placeholders follow the same section structure as the first case study', () => {
    const [first, ...rest] = caseStudies;
    const shapeOf = (entry) => entry.sections.map((section) => ({
        id: section.id,
        blockTypes: section.blocks.map((block) => block.type),
    }));

    // Block for block, not just section for section: filling a placeholder in
    // should be editing text, never restructuring data.
    rest.forEach((entry) => {
        expect(shapeOf(entry)).toEqual(shapeOf(first));
    });
});
