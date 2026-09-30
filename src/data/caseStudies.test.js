import caseStudies from './caseStudies';

// Keys the card face and the overlay header read directly.
const REQUIRED_KEYS = [
    'id', 'title', 'tagline', 'tech', 'role', 'timeframe',
    'tags', 'stats', 'note', 'sections',
];

// A study that is written and openable, versus one whose card is on the shelf
// with its content still to be filled in. The two carry different obligations,
// so every structural test below picks the group it applies to.
const published = caseStudies.filter((entry) => !entry.comingSoon);
const comingSoon = caseStudies.filter((entry) => entry.comingSoon);

// An unwritten study shows a title and nothing else: no invented tagline, no
// invented tech line. These are all it owes.
const CARD_FACE_KEYS = ['id', 'title'];

const BLOCK_TYPES = ['prose', 'rows', 'metrics'];

test('exports exactly 4 case studies', () => {
    expect(caseStudies).toHaveLength(4);
});

test('there is at least one of each kind, so neither group is vacuous', () => {
    expect(published.length).toBeGreaterThan(0);
    expect(comingSoon.length).toBeGreaterThan(0);
});

test('every coming soon study carries what the card face reads', () => {
    comingSoon.forEach((entry) => {
        CARD_FACE_KEYS.forEach((key) => expect(entry).toHaveProperty(key));
        expect(entry.title.length).toBeGreaterThan(0);
    });
});

// Nothing invented sits on an unwritten card: no stand in tagline, no stand in
// tech list. A title and the badge are the whole face.
test('no coming soon study carries placeholder copy', () => {
    comingSoon.forEach((entry) => {
        expect(entry.tagline).toBeUndefined();
        expect(entry.tech).toBeUndefined();
    });
});

test('no coming soon title says placeholder', () => {
    comingSoon.forEach((entry) => {
        expect(entry.title.toLowerCase()).not.toContain('placeholder');
    });
});

// The guard that matters: the overlay renders from `sections`, so an unwritten
// study that still carried them could be opened onto invented content.
test('no coming soon study carries sections', () => {
    comingSoon.forEach((entry) => {
        expect(entry.sections).toBeUndefined();
    });
});

test('every published case study has the full required shape', () => {
    published.forEach((entry) => {
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
    published.forEach((entry) => {
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
    published.forEach((entry) => {
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

// Scoped to published studies. With only one published today this passes
// vacuously; it re-arms the moment a second study is filled in and published.
test('every published study follows the same section structure as the first', () => {
    const [first, ...rest] = published;
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
