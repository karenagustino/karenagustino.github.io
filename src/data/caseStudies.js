// Each case study renders itself from `sections`, so adding or reordering
// content is a data edit rather than a component change.
//
// An entry marked `comingSoon: true` is a card on the shelf whose content is
// not written yet. It carries a title and nothing else: no stand in tagline or
// tech list, since inventing copy only to label it as invented reads worse than
// an honest blank. Its full template sits commented out beneath it, and it
// deliberately has no `sections`, so the overlay can never open onto content
// that was never meant to be read. A section is an icon,
// a title, and an ordered list of blocks. Five block types exist:
//
//   { type: 'prose',   text: '...' }
//   { type: 'rows',    items: [{ icon, label, text }] }
//   { type: 'steps',   items: [{ icon, label, text }] }   numbered, in order
//
// `icon` is an emoji shown in a tile in front of the item. It is optional; an
// item without one gets a plain square.
//   { type: 'metrics', items: [{ value, label, caption }] }
//   { type: 'prototype', url, label, caption }   a Figma prototype share link,
//                                                played inside a phone frame.
//       Add `frame: { width, height }` if the screens are not 375 by 812.
//
// A written study can also carry a `preview` image, shown on its card above
// the title.
//
// Mix them in any order. The sidebar in the overlay is built from the section
// list, so every section needs a unique `id` within its case study.

import retailBankPreview from '../assets/retail-bank-onboarding-preview.jpg';

const caseStudies = [
    {
        id: 'retail-bank-onboarding',
        title: 'Retail bank onboarding',
        preview: retailBankPreview,
        tagline: 'Why prospects quit before they ever opened the app',
        tech: ['Figma', 'Maze', 'Adobe Analytics', 'AI research agents'],
        role: 'Product Management',
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
                        text: 'Most people who started onboarding never finished. I was curious why, and found two problems hiding behind one drop off: signing in asked for details people didn\'t have on hand, and prospects couldn\'t see what they\'d get before committing. I validated both, wrote the PRD, and saw it adopted into the roadmap.',
                    },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'I built three AI agents, each looking at a different source, so no single view could steer the answer.' },
                    {
                        type: 'rows',
                        items: [
                            { icon: '📊', label: 'Funnel agent', text: 'Read funnel analytics and Contact Centre complaints to find where people left, and why.' },
                            { icon: '📝', label: 'Survey agent', text: 'Drafted survey questions, which I refined with the UX research team and ran with 250+ clients in Maze.' },
                            { icon: '🏁', label: 'Market agent', text: 'Compared how direct and indirect competitors handle sign in, and how early they show value.' },
                        ],
                    },
                    { type: 'prose', text: 'The complaints surprised me: on top of being stuck, a lot of people were hesitant. That changed what I recommended.' },
                ],
            },
            {
                id: 'recommendation',
                icon: '🧭',
                title: 'Recommendation',
                blocks: [
                    {
                        type: 'steps',
                        items: [
                            { icon: '🖥️', label: 'Preview dashboard', text: 'Let prospects explore a preview of online banking, so they can see the features and value before they commit.' },
                            { icon: '🔑', label: 'Username sign in', text: 'Sign in with a username and password, instead of a card that can take days to arrive by mail or an account number people have to dig up and copy.' },
                            { icon: '🛤️', label: 'Simpler journey', text: 'Make the whole onboarding journey simpler and smoother, from start to finish.' },
                        ],
                    },
                    { type: 'prose', text: 'I sequenced them so the cheaper fix ships and gets measured first, before anyone commits to the larger build.' },
                ],
            },
            {
                id: 'prototype',
                icon: '📱',
                title: 'Prototype',
                blocks: [
                    {
                        type: 'prototype',
                        url: 'https://www.figma.com/proto/inDoas65kctyHR8F3T9U1z/Onboarding-Prototype?node-id=332-6612&p=f&t=HqRktiYgi6tKvLun-9&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=332%3A6612&show-proto-sidebar=1',
                        label: 'Explore banking',
                        caption: 'Tap Explore the app to look around the preview dashboard, or Open an account to try the new username sign in. Click anywhere on the screen to see what you can press.',
                    },
                ],
            },
            {
                id: 'impact',
                icon: '💥',
                title: 'Impact',
                blocks: [
                    {
                        type: 'prose',
                        text: 'I wrote the PRD, aligned the teams it touched, and prototyped the flow in Figma. It\'s now on the roadmap and being built, so new clients can see what they\'re signing up for and get in without the wait.',
                    },
                    {
                        type: 'metrics',
                        items: [
                            { value: '250+', label: 'Clients surveyed', caption: 'phase two validation' },
                            { value: '3', label: 'Research agents', caption: 'internal, survey, market' },
                            { value: '2', label: 'Validation phases', caption: 'problem, then customer' },
                            { value: '1', label: 'PRD adopted', caption: 'now in build' },
                        ],
                    },
                    { type: 'prose', text: 'Peers preparing for a case competition picked up my research approach, and I ended up mentoring them.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    {
                        type: 'prose',
                        text: 'I learned not to trust a single source. Funnel data, complaints, surveys, and market research each told part of the story, and only together did they show what was really happening.',
                    },
                    {
                        type: 'prose',
                        text: 'Asking for feedback is how I learned to build the business case behind a recommendation. What I didn\'t expect was how much the work would ask me to speak up, for the recommendation and for where the team was going.',
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
    // come in four kinds:
    //   { type: 'prose',     text: '...' }
    //   { type: 'rows',      items: [{ label, text }] }
    //   { type: 'metrics',   items: [{ value, label, caption }] }
    //   { type: 'prototype', url, label, caption }   paste the link from
    //       Figma's Share button, and set the file's prototype device to None
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
    //             id: 'prototype',
    //             icon: '📱',
    //             title: 'Prototype',
    //             blocks: [
    //                 {
    //                     type: 'prototype',
    //                     url: '#TODO Figma prototype share link',
    //                     label: '#TODO short, obvious action, e.g. Explore banking',
    //                     caption: '#TODO what to tap first and what they will see',
    //                 },
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
    // come in four kinds:
    //   { type: 'prose',     text: '...' }
    //   { type: 'rows',      items: [{ label, text }] }
    //   { type: 'metrics',   items: [{ value, label, caption }] }
    //   { type: 'prototype', url, label, caption }   paste the link from
    //       Figma's Share button, and set the file's prototype device to None
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
    //             id: 'prototype',
    //             icon: '📱',
    //             title: 'Prototype',
    //             blocks: [
    //                 {
    //                     type: 'prototype',
    //                     url: '#TODO Figma prototype share link',
    //                     label: '#TODO short, obvious action, e.g. Explore banking',
    //                     caption: '#TODO what to tap first and what they will see',
    //                 },
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
    // come in four kinds:
    //   { type: 'prose',     text: '...' }
    //   { type: 'rows',      items: [{ label, text }] }
    //   { type: 'metrics',   items: [{ value, label, caption }] }
    //   { type: 'prototype', url, label, caption }   paste the link from
    //       Figma's Share button, and set the file's prototype device to None
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
    //             id: 'prototype',
    //             icon: '📱',
    //             title: 'Prototype',
    //             blocks: [
    //                 {
    //                     type: 'prototype',
    //                     url: '#TODO Figma prototype share link',
    //                     label: '#TODO short, obvious action, e.g. Explore banking',
    //                     caption: '#TODO what to tap first and what they will see',
    //                 },
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
