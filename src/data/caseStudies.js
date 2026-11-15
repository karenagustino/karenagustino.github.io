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
//                                                or a live web app built for a
//                                                phone, played inside a phone frame.
//       Add `frame: { width, height }` if the screens are not 375 by 812, and
//       `endNodeId: '123:456'` (the last screen's node id, colon not dash) to
//       offer a replay there. That prompt needs FIGMA_CLIENT_ID, in
//       CaseStudyOverlay.jsx; without it a Start over button still works.
//
// A written study can also carry a `preview` image, shown on its card above
// the title. Give it a `previewBackground` colour (the image's own edge colour)
// to show the whole image instead of cropping it to fill the card. A study can
// also carry a `process: { url, label }` link to the working notes behind it,
// shown as a button after the last section.
//
// Mix them in any order. The sidebar in the overlay is built from the section
// list, so every section needs a unique `id` within its case study.

import retailBankPreview from '../assets/retail-bank-onboarding-preview.jpg';
import paymentCheckerPreview from '../assets/payment-checker-preview.jpg';

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
                        endNodeId: '341:3912',
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
        // In progress: the usability study is still running, so Impact holds
        // the bars each assumption has to clear rather than results, and
        // Learnings covers what building the prototype taught so far. Swap
        // both once the study wraps up.
        id: 'payment-checker',
        title: 'Marketplace payment checker',
        preview: paymentCheckerPreview,
        previewBackground: '#f4f4f5',
        tagline: 'Is the payment real, or just a convincing screenshot?',
        tech: ['Supabase', 'Claude Code', 'Vercel', 'Notion'],
        role: 'Product Management',
        timeframe: '2026',
        tags: ['PRODUCT', 'PAYMENTS', 'TRUST & SAFETY', 'PROTOTYPE'],
        stats: [
            { value: '8', label: 'scams mapped' },
            { value: '4', label: 'assumptions tested' },
        ],
        note: 'Usability study in progress. More learnings to come.',
        process: {
            url: 'https://equable-phalange-f6d.notion.site/Design-a-payment-checker-40b0f56bd0d180e58a3efc13601fb79b',
            label: 'See how I broke this problem down in Notion',
        },
        sections: [
            {
                id: 'overview',
                icon: '📖',
                title: 'Overview',
                blocks: [
                    {
                        type: 'prose',
                        text: 'At 14, I sold items online in Indonesia, and buyers would send fake transfer screenshots to get me to hand things over. Sellers on Facebook Marketplace and Kijiji in Canada still face the same trick. I designed a payment checker that shows a payment\'s real status right in the chat, so a screenshot can\'t fake it, and I\'m now testing it with sellers and buyers.',
                    },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'I started with how much sellers lose, then mapped every way a buyer can trick one.' },
                    {
                        type: 'rows',
                        items: [
                            { icon: '💸', label: 'Losses go unreported', text: 'In the first half of 2021, 925 Canadians reported losing about $4.5M while selling online. Only 5 to 10% of victims report, so the real number is much higher.' },
                            { icon: '😟', label: 'Sellers feel uneasy', text: '74% of Ontarians feel uneasy about marketplace meetups, and 78% of them would feel safer if the other person\'s identity were verified.' },
                            { icon: '🧾', label: 'Eight ways to scam a seller', text: 'Fake pending payments, phishing deposit emails, reverse transfers, and overpayment are four of them. All four come down to one moment: the seller believing the money has arrived.' },
                            { icon: '🎯', label: 'Who it hurts most', text: 'New sellers, and older or less tech savvy sellers. They often want to sell fast, which makes them easier to pressure.' },
                        ],
                    },
                    { type: 'prose', text: 'My biggest constraint was that I couldn\'t see into the buyer\'s bank account. So I focused on the one place every deal already happens: the chat between buyer and seller.' },
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
                            { icon: '🔗', label: 'Seller requests payment', text: 'The seller sends an Interac payment link in the chat, with the amount and their email filled in and locked.' },
                            { icon: '🏦', label: 'Buyer pays in their bank', text: 'The link opens the buyer\'s own banking app, so the amount and recipient can\'t be changed.' },
                            { icon: '✅', label: 'Chat shows the real status', text: 'A system card in the chat only confirms payment once the buyer reaches the bank\'s confirmation page. A screenshot can\'t imitate it.' },
                        ],
                    },
                    { type: 'prose', text: 'In the strongest version, Interac or the banks confirm the money actually landed. It\'s also the riskiest: the partnership may never happen, and a payment from a stolen account can still be reversed after the card says received. A fallback shows Sent once the buyer reaches the bank\'s confirmation page and lets the seller confirm, but that still leaves sellers checking their own bank. In the study, I compare the bank verified card against a chat with no card, to see whether the card itself changes what sellers do.' },
                ],
            },
            {
                id: 'prototype',
                icon: '📱',
                title: 'Prototype',
                blocks: [
                    {
                        type: 'prototype',
                        url: 'https://marketplace-pay.vercel.app/',
                        label: 'Try it as a seller',
                        caption: 'Start as the seller and decide whether to hand over the headphones, or switch to the buyer and pay with your bank. No real money or login is used.',
                    },
                ],
            },
            {
                id: 'impact',
                icon: '🎯',
                title: 'What I\'m measuring',
                blocks: [
                    {
                        type: 'prose',
                        text: 'The usability study is still running, so there are no results yet. Before testing, I set the bar each assumption has to clear.',
                    },
                    {
                        type: 'metrics',
                        items: [
                            { value: '80%', label: 'Spot the fake', caption: 'sellers turn down fake payments and phishing links' },
                            { value: '80%', label: 'Trust the real one', caption: 'sellers hand over to honest buyers once the card says Received' },
                            { value: '75%', label: 'Hold the item', caption: 'sellers wait for Received, even under pressure' },
                            { value: '70%', label: 'Buyers pay in app', caption: 'pay with Marketplace Pay, even after asking about other ways' },
                            { value: '60s', label: 'Tap to sent', caption: 'median time from tapping Pay to sending it in the bank' },
                        ],
                    },
                    { type: 'prose', text: 'The one I\'m most curious about is the buyer. The feature protects the seller, but the buyer does the work. If buyers just say "I\'ll send it to your email," sellers never get the benefit.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    { type: 'prose', text: 'I expected the scam scenarios to teach me the most. Instead, the one that made me stop was where nobody was lying: the buyer really paid, but the seller\'s bank held the deposit for review while the buyer waited outside. As a seller myself, my first instinct was to hand the item over or cancel. Neither felt right. The fair answer was to reschedule the pickup, and my prototype didn\'t offer it.' },
                    { type: 'prose', text: 'That became a new hypothesis I\'m saving for its own case study: if sellers can see why their money is on hold and roughly how long it may take, they\'ll feel less pressure to hand over early, and honest buyers won\'t be turned away. I\'m holding my other learnings until the study is done, so they come from real sellers and buyers. In the end, it\'s all about helping both sides feel safe when the money isn\'t in either of their hands.' },
                ],
            },
        ],
    },
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
