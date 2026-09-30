// Each case study renders itself from `sections`, so adding or reordering
// content is a data edit rather than a component change.
//
// An entry marked `comingSoon: true` is a card on the shelf whose content is
// not written yet. It carries a title and nothing else: no stand in tagline or
// tech list, since inventing copy only to label it as invented reads worse than
// an honest blank. Its full template sits commented out beneath it, and it
// deliberately has no `sections`, so the overlay can never open onto content
// that was never meant to be read. A section is an icon,
// a title, and an ordered list of blocks. Three block types exist:
//
//   { type: 'prose',   text: '...' }
//   { type: 'rows',    items: [{ label, text }] }
//   { type: 'metrics', items: [{ value, label, caption }] }
//
// Mix them in any order. The sidebar in the overlay is built from the section
// list, so every section needs a unique `id` within its case study.

const caseStudies = [
    {
        id: 'retail-bank-onboarding',
        title: 'Retail bank onboarding',
        tagline: 'Why prospects quit before they ever opened the app',
        tech: ['Figma', 'Maze', 'Adobe Analytics', 'AI research agents'],
        role: 'Product Management Co op',
        timeframe: '2025',
        tags: ['PRODUCT', 'RESEARCH', 'FINTECH', 'STRATEGY'],
        stats: [
            { value: '250+', label: 'surveyed' },
            { value: '3', label: 'agents built' },
        ],
        note: 'Details generalized to respect confidentiality.',
        sections: [
            {
                id: 'overview',
                icon: '📖',
                title: 'Overview',
                blocks: [
                    {
                        type: 'prose',
                        text: 'Most people who started onboarding never finished it. Signing in asked for an identifier most people do not carry, and prospects could not see what they would actually get before committing. Two separate problems that looked like one. I validated both, wrote the PRD, and got it into the roadmap.',
                    },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'Three agents, each pointed at a different source of truth.' },
                    {
                        type: 'rows',
                        items: [
                            { label: 'Funnel agent', text: 'Read internal funnel analytics and Contact Centre complaints to find where people left and why.' },
                            { label: 'Survey agent', text: 'Drafted survey questions, refined with the UX research team, ran past 250+ clients in Maze.' },
                            { label: 'Market agent', text: 'Compared direct and indirect competitors on how they authenticate and how early they show value.' },
                        ],
                    },
                    { type: 'prose', text: 'The complaints pointed at hesitancy, not just friction. That changed the shape of the recommendation.' },
                ],
            },
            {
                id: 'recommendation',
                icon: '🧭',
                title: 'Recommendation',
                blocks: [
                    {
                        type: 'prose',
                        text: 'Wrote the PRD and took it through Onboarding, Growth, and the other teams it touched, so it fit the roadmap for the next 18 months. Sequenced so the cheaper fix could be measured before anyone committed to the larger build. Prototyped the proposed flow in Figma.',
                    },
                ],
            },
            {
                id: 'impact',
                icon: '💥',
                title: 'Impact',
                blocks: [
                    {
                        type: 'metrics',
                        items: [
                            { value: '250+', label: 'Clients surveyed', caption: 'phase two validation' },
                            { value: '3', label: 'Research agents', caption: 'internal, survey, market' },
                            { value: '2', label: 'Validation phases', caption: 'problem, then customer' },
                            { value: '18mo', label: 'Roadmap', caption: 'PRD adopted into plan' },
                        ],
                    },
                    { type: 'prose', text: 'Peers building for a case competition picked up the research approach, which turned into a mentoring role.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    {
                        type: 'prose',
                        text: 'Do not trust one source on a problem. Funnel data, complaint summaries, direct surveys, and outside research each told a partial story. Only together did they tell a true one.',
                    },
                    {
                        type: 'prose',
                        text: 'Asking for feedback is how I learned to build the business case behind the recommendation. The skill I did not expect to need was speaking up, for the work and for where the team was going.',
                    },
                ],
            },
        ],
    },
    {
        id: 'case-study-02',
        title: 'Case Study 02',
        comingSoon: true,
    },
    // ========================================================================
    // TODO: Case Study 02. Fill this in, uncomment it, delete the stub above,
    // and drop `comingSoon`. The card then becomes clickable and opens this.
    //
    // Every `#TODO` below is a gap to fill. Keep the section ids and block
    // shapes; they are what the overlay's sidebar and renderer read. Blocks
    // come in three kinds:
    //   { type: 'prose',   text: '...' }
    //   { type: 'rows',    items: [{ label, text }] }
    //   { type: 'metrics', items: [{ value, label, caption }] }
    // Sections and blocks can be added, removed or reordered freely.
    //
    // One house rule: no dashes of any width in the copy. Write "student led" rather than
    // the hyphenated form. A test enforces it.
    // ========================================================================
    // {
    //     id: '#TODO slug, lowercase with hyphens, e.g. ubc-pm-club',
    //     title: '#TODO the real title',
    //     tagline: '#TODO one line hook, the question this work answered',
    //     tech: ['#TODO tool', '#TODO tool'],
    //     role: '#TODO your role',
    //     timeframe: '#TODO e.g. 2025',
    //     tags: ['#TODO TAG', '#TODO TAG'],
    //     stats: [
    //         { value: '#TODO', label: '#TODO' },   // shown in the overlay header
    //         { value: '#TODO', label: '#TODO' },
    //     ],
    //     note: '#TODO closing note, or delete this line',
    //     sections: [
    //         {
    //             id: 'overview',
    //             icon: '📖',
    //             title: 'Overview',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what the project was, what was going wrong, what you set out to change' },
    //             ],
    //         },
    //         {
    //             id: 'research',
    //             icon: '🔍',
    //             title: 'Research',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO how you found out what was actually true' },
    //                 {
    //                     type: 'rows',
    //                     items: [
    //                         { label: '#TODO', text: '#TODO' },
    //                         { label: '#TODO', text: '#TODO' },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             id: 'recommendation',
    //             icon: '🧭',
    //             title: 'Recommendation',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what you proposed and why that over the alternatives' },
    //             ],
    //         },
    //         {
    //             id: 'impact',
    //             icon: '💥',
    //             title: 'Impact',
    //             blocks: [
    //                 {
    //                     type: 'metrics',
    //                     items: [
    //                         { value: '#TODO', label: '#TODO', caption: '#TODO' },
    //                         { value: '#TODO', label: '#TODO', caption: '#TODO' },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             id: 'learnings',
    //             icon: '🌱',
    //             title: 'Learnings',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what you would do differently' },
    //             ],
    //         },
    //     ],
    // },
    {
        id: 'case-study-03',
        title: 'Case Study 03',
        comingSoon: true,
    },
    // ========================================================================
    // TODO: Case Study 03. Fill this in, uncomment it, delete the stub above,
    // and drop `comingSoon`. The card then becomes clickable and opens this.
    //
    // Every `#TODO` below is a gap to fill. Keep the section ids and block
    // shapes; they are what the overlay's sidebar and renderer read. Blocks
    // come in three kinds:
    //   { type: 'prose',   text: '...' }
    //   { type: 'rows',    items: [{ label, text }] }
    //   { type: 'metrics', items: [{ value, label, caption }] }
    // Sections and blocks can be added, removed or reordered freely.
    //
    // One house rule: no dashes of any width in the copy. Write "student led" rather than
    // the hyphenated form. A test enforces it.
    // ========================================================================
    // {
    //     id: '#TODO slug, lowercase with hyphens, e.g. ubc-pm-club',
    //     title: '#TODO the real title',
    //     tagline: '#TODO one line hook, the question this work answered',
    //     tech: ['#TODO tool', '#TODO tool'],
    //     role: '#TODO your role',
    //     timeframe: '#TODO e.g. 2025',
    //     tags: ['#TODO TAG', '#TODO TAG'],
    //     stats: [
    //         { value: '#TODO', label: '#TODO' },   // shown in the overlay header
    //         { value: '#TODO', label: '#TODO' },
    //     ],
    //     note: '#TODO closing note, or delete this line',
    //     sections: [
    //         {
    //             id: 'overview',
    //             icon: '📖',
    //             title: 'Overview',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what the project was, what was going wrong, what you set out to change' },
    //             ],
    //         },
    //         {
    //             id: 'research',
    //             icon: '🔍',
    //             title: 'Research',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO how you found out what was actually true' },
    //                 {
    //                     type: 'rows',
    //                     items: [
    //                         { label: '#TODO', text: '#TODO' },
    //                         { label: '#TODO', text: '#TODO' },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             id: 'recommendation',
    //             icon: '🧭',
    //             title: 'Recommendation',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what you proposed and why that over the alternatives' },
    //             ],
    //         },
    //         {
    //             id: 'impact',
    //             icon: '💥',
    //             title: 'Impact',
    //             blocks: [
    //                 {
    //                     type: 'metrics',
    //                     items: [
    //                         { value: '#TODO', label: '#TODO', caption: '#TODO' },
    //                         { value: '#TODO', label: '#TODO', caption: '#TODO' },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             id: 'learnings',
    //             icon: '🌱',
    //             title: 'Learnings',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what you would do differently' },
    //             ],
    //         },
    //     ],
    // },
    {
        id: 'case-study-04',
        title: 'Case Study 04',
        comingSoon: true,
    },
    // ========================================================================
    // TODO: Case Study 04. Fill this in, uncomment it, delete the stub above,
    // and drop `comingSoon`. The card then becomes clickable and opens this.
    //
    // Every `#TODO` below is a gap to fill. Keep the section ids and block
    // shapes; they are what the overlay's sidebar and renderer read. Blocks
    // come in three kinds:
    //   { type: 'prose',   text: '...' }
    //   { type: 'rows',    items: [{ label, text }] }
    //   { type: 'metrics', items: [{ value, label, caption }] }
    // Sections and blocks can be added, removed or reordered freely.
    //
    // One house rule: no dashes of any width in the copy. Write "student led" rather than
    // the hyphenated form. A test enforces it.
    // ========================================================================
    // {
    //     id: '#TODO slug, lowercase with hyphens, e.g. ubc-pm-club',
    //     title: '#TODO the real title',
    //     tagline: '#TODO one line hook, the question this work answered',
    //     tech: ['#TODO tool', '#TODO tool'],
    //     role: '#TODO your role',
    //     timeframe: '#TODO e.g. 2025',
    //     tags: ['#TODO TAG', '#TODO TAG'],
    //     stats: [
    //         { value: '#TODO', label: '#TODO' },   // shown in the overlay header
    //         { value: '#TODO', label: '#TODO' },
    //     ],
    //     note: '#TODO closing note, or delete this line',
    //     sections: [
    //         {
    //             id: 'overview',
    //             icon: '📖',
    //             title: 'Overview',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what the project was, what was going wrong, what you set out to change' },
    //             ],
    //         },
    //         {
    //             id: 'research',
    //             icon: '🔍',
    //             title: 'Research',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO how you found out what was actually true' },
    //                 {
    //                     type: 'rows',
    //                     items: [
    //                         { label: '#TODO', text: '#TODO' },
    //                         { label: '#TODO', text: '#TODO' },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             id: 'recommendation',
    //             icon: '🧭',
    //             title: 'Recommendation',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what you proposed and why that over the alternatives' },
    //             ],
    //         },
    //         {
    //             id: 'impact',
    //             icon: '💥',
    //             title: 'Impact',
    //             blocks: [
    //                 {
    //                     type: 'metrics',
    //                     items: [
    //                         { value: '#TODO', label: '#TODO', caption: '#TODO' },
    //                         { value: '#TODO', label: '#TODO', caption: '#TODO' },
    //                     ],
    //                 },
    //             ],
    //         },
    //         {
    //             id: 'learnings',
    //             icon: '🌱',
    //             title: 'Learnings',
    //             blocks: [
    //                 { type: 'prose', text: '#TODO what you would do differently' },
    //             ],
    //         },
    //     ],
    // },
];

export default caseStudies;
