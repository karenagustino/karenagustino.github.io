// Each case study renders itself from `sections`, so adding or reordering
// content is a data edit rather than a component change. A section is an icon,
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
        id: 'placeholder-2',
        title: 'Case Study Placeholder 2',
        tagline: 'Real narrative content coming soon',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        tags: ['PLACEHOLDER'],
        stats: [
            { value: '00', label: 'placeholder' },
            { value: '00', label: 'placeholder' },
        ],
        note: 'Placeholder closing note.',
        sections: [
            {
                id: 'overview',
                icon: '📖',
                title: 'Overview',
                blocks: [
                    { type: 'prose', text: 'Placeholder overview. What the project was, what was going wrong, and what you set out to change.' },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'Placeholder lead in to how you learned what was actually true.' },
                    {
                        type: 'rows',
                        items: [
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                        ],
                    },
                    { type: 'prose', text: 'Placeholder closing line. The one finding that changed your thinking.' },
                ],
            },
            {
                id: 'recommendation',
                icon: '🧭',
                title: 'Recommendation',
                blocks: [
                    { type: 'prose', text: 'Placeholder description of what you designed, built, or recommended, and how you got it agreed.' },
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
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                        ],
                    },
                    { type: 'prose', text: 'Placeholder line for the outcome a number cannot carry.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    { type: 'prose', text: 'Placeholder learning about the work itself.' },
                    { type: 'prose', text: 'Placeholder learning about how you want to work next time.' },
                ],
            },
        ],
    },
    {
        id: 'placeholder-3',
        title: 'Case Study Placeholder 3',
        tagline: 'Real narrative content coming soon',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        tags: ['PLACEHOLDER'],
        stats: [
            { value: '00', label: 'placeholder' },
            { value: '00', label: 'placeholder' },
        ],
        note: 'Placeholder closing note.',
        sections: [
            {
                id: 'overview',
                icon: '📖',
                title: 'Overview',
                blocks: [
                    { type: 'prose', text: 'Placeholder overview. What the project was, what was going wrong, and what you set out to change.' },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'Placeholder lead in to how you learned what was actually true.' },
                    {
                        type: 'rows',
                        items: [
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                        ],
                    },
                    { type: 'prose', text: 'Placeholder closing line. The one finding that changed your thinking.' },
                ],
            },
            {
                id: 'recommendation',
                icon: '🧭',
                title: 'Recommendation',
                blocks: [
                    { type: 'prose', text: 'Placeholder description of what you designed, built, or recommended, and how you got it agreed.' },
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
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                        ],
                    },
                    { type: 'prose', text: 'Placeholder line for the outcome a number cannot carry.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    { type: 'prose', text: 'Placeholder learning about the work itself.' },
                    { type: 'prose', text: 'Placeholder learning about how you want to work next time.' },
                ],
            },
        ],
    },
    {
        id: 'placeholder-4',
        title: 'Case Study Placeholder 4',
        tagline: 'Real narrative content coming soon',
        tech: ['Placeholder Tech'],
        role: 'Placeholder Role',
        timeframe: 'Placeholder Timeframe',
        tags: ['PLACEHOLDER'],
        stats: [
            { value: '00', label: 'placeholder' },
            { value: '00', label: 'placeholder' },
        ],
        note: 'Placeholder closing note.',
        sections: [
            {
                id: 'overview',
                icon: '📖',
                title: 'Overview',
                blocks: [
                    { type: 'prose', text: 'Placeholder overview. What the project was, what was going wrong, and what you set out to change.' },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'Placeholder lead in to how you learned what was actually true.' },
                    {
                        type: 'rows',
                        items: [
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                            { label: 'Placeholder method', text: 'Placeholder description of what this method surfaced.' },
                        ],
                    },
                    { type: 'prose', text: 'Placeholder closing line. The one finding that changed your thinking.' },
                ],
            },
            {
                id: 'recommendation',
                icon: '🧭',
                title: 'Recommendation',
                blocks: [
                    { type: 'prose', text: 'Placeholder description of what you designed, built, or recommended, and how you got it agreed.' },
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
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                            { value: '00', label: 'Placeholder metric', caption: 'placeholder caption' },
                        ],
                    },
                    { type: 'prose', text: 'Placeholder line for the outcome a number cannot carry.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    { type: 'prose', text: 'Placeholder learning about the work itself.' },
                    { type: 'prose', text: 'Placeholder learning about how you want to work next time.' },
                ],
            },
        ],
    },
];

export default caseStudies;
