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
//   { type: 'prose',   text: '...' }   add `link: { url, label }` to show a
//                                     link to its source beneath the paragraph.
//       Wrap a phrase as [[affinity diagram]] to show it bold, in the accent
//       colour, with an asterisk that jumps to that source link.
//   { type: 'rows',   items: [{ icon, label, text }] }
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
// either a public https page or a PDF imported from assets (it opens in the
// browser's own PDF viewer),
// shown as a button after the last section.
//
// Mix them in any order. The sidebar in the overlay is built from the section
// list, so every section needs a unique `id` within its case study.

import retailBankPreview from '../assets/retail-bank-onboarding-preview.jpg';
import paymentCheckerPreview from '../assets/payment-checker-preview.jpg';
import communityFridgePreview from '../assets/community-fridge-preview.jpg';
import communityFridgeReport from '../assets/community-fridge-design-report.pdf';

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
        // A UBC HCI course project. Results come from the final design report:
        // 12 think aloud sessions plus a questionnaire, and the class vote.
        id: 'community-fridge',
        title: 'Community Fridge (Komu)',
        preview: communityFridgePreview,
        previewBackground: '#f4f4f5',
        tagline: 'Why groceries go to waste before anyone cooks them',
        tech: ['Figma', 'Qualtrics', 'FigJam'],
        role: 'Product Design',
        timeframe: '2025',
        tags: ['PRODUCT DESIGN', 'RESEARCH', 'HCI', 'SUSTAINABILITY'],
        stats: [
            { value: '21', label: 'surveyed' },
            { value: '12', label: 'usability tests' },
        ],
        note: 'A UBC HCI course project with a team of six. I designed the community experience.',
        process: {
            url: communityFridgeReport,
            label: 'Read our full design report',
        },
        sections: [
            {
                id: 'overview',
                icon: '📖',
                title: 'Overview',
                blocks: [
                    {
                        type: 'prose',
                        text: 'In my HCI course, our team set out to help home cooks waste less food. We first pitched an app that suggests meals from leftovers, but our research changed that: most people weren\'t stuck on what to cook, they forgot what they had until it expired. We designed Community Fridge, a mobile app where you scan ingredients into a digital fridge, find recipes that use them, and borrow what you\'re missing from friends. I designed the community side. After testing it with 12 people, our class voted it the People\'s Choice Award for the best and most polished app.',
                    },
                ],
            },
            {
                id: 'research',
                icon: '🔍',
                title: 'Research',
                blocks: [
                    { type: 'prose', text: 'We surveyed 21 home cooks in UBC Qualtrics, interviewed about 20, and sorted what we heard into an [[affinity diagram]].' },
                    {
                        type: 'rows',
                        items: [
                            { icon: '🗓️', label: 'Expired, not uninspired', text: 'Asked why they threw food away in the last month, 44% said it expired and 13% said they forgot they bought it. Only 5% said they didn\'t know what to make with it.' },
                            { icon: '🗑️', label: 'Waste happens every week', text: '82% threw away unused or expired food once or twice a week, most often about one meal\'s worth.' },
                            { icon: '🔁', label: 'They cook what they know', text: 'Most saved leftovers hoping to use them later, or made the same dish again. Searching online for a new recipe came lower on the list.' },
                            { icon: '📱', label: 'They care, but have no tools', text: 'People rated food waste 4 out of 5 in importance on average, yet few used an app to manage it.' },
                        ],
                    },
                    {
                        type: 'prose',
                        text: 'We also compared Supercook and a physical cookbook. Both made people enter or flip through ingredients by hand, and neither knew how much of each one they had.',
                        link: {
                            url: 'https://www.figma.com/board/8ysuZlDuuEV4OT2pryk439/Affinity-Diagram?node-id=0-1',
                            label: 'See the affinity diagram in FigJam',
                        },
                    },
                ],
            },
            {
                id: 'recommendation',
                icon: '🧭',
                title: 'Design',
                blocks: [
                    {
                        type: 'steps',
                        items: [
                            { icon: '📸', label: 'Scan your fridge', text: 'Take a photo instead of typing every ingredient. The app lists what it found, and you check the quantities before anything goes into your fridge.' },
                            { icon: '🍝', label: 'Cook from what you have', text: 'Explore shows recipes that fit your dietary needs and allergies, split into what\'s already in your fridge and what you\'d need.' },
                            { icon: '🤝', label: 'Borrow the rest from a friend', text: 'Join a community fridge with friends, look inside their fridges, and request the missing ingredient in a couple of taps.' },
                        ],
                    },
                    { type: 'prose', text: 'We started with three concepts and merged the two that got the best feedback at our pitch: scanning ingredients with your camera, and sharing them through a community fridge. Requesting from a friend became our answer to substitutions. Instead of skipping a recipe because one item is missing, you cook it with what your friends already have, and their food gets used before it expires.' },
                ],
            },
            {
                id: 'prototype',
                icon: '📱',
                title: 'Prototype',
                blocks: [
                    {
                        type: 'prototype',
                        url: 'https://www.figma.com/proto/9OxSPnbnGerGK10Mpr4Zk2/CPSC-344--Community-Fridge-Design-documents?node-id=17-108&p=f&t=atqr66NMIDghDzmB-1&scaling=min-zoom&content-scaling=fixed&page-id=1%3A2&starting-point-node-id=17%3A108',
                        label: 'Open your fridge',
                        frame: { width: 402, height: 874 },
                        caption: 'Tap get started to set your dietary needs, then scan ingredients into your fridge. From there, open Explore to find a recipe, or Community to request an ingredient from a friend.',
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
                        text: 'We ran 12 think aloud sessions, each followed by a questionnaire, as people set their preferences, added ingredients, picked a recipe, and requested from a friend\'s fridge. At our final demo, classmates and instructors tried every team\'s app from start to finish, and ours won the most votes.',
                    },
                    {
                        type: 'metrics',
                        items: [
                            { value: '1st', label: 'People\'s Choice', caption: 'most class votes for the best, most polished app' },
                            { value: '52s', label: 'Scan to fridge', caption: 'average time to add ingredients, under our 60 second bar' },
                            { value: '50%', label: 'Zero misclicks', caption: 'of testers made none, and the average was under two' },
                            { value: '75%', label: 'Felt intuitive', caption: 'strongly agreed the app was easy to navigate' },
                        ],
                    },
                    { type: 'prose', text: 'We sorted what testers said into an [[affinity diagram]], and it showed where we fell short. 10 of 12 people didn\'t realize the face icons on recipe cards meant a recipe matched their fridge, and many wanted filters for cuisine and spice level. Recipes didn\'t feel personal yet, so we recommended showing a clear match, like "100% of ingredients on hand", and adding those filters.' },
                ],
            },
            {
                id: 'learnings',
                icon: '🎓',
                title: 'Learnings',
                blocks: [
                    { type: 'prose', text: 'We came in sure the problem was inspiration, and only 5% of people said it was. Most simply forgot what they had until it was too late. I didn\'t expect our own pitch to carry that much of an assumption, and it taught me to hear from people before deciding what to build.' },
                    { type: 'prose', text: 'Testing taught me something else I didn\'t expect: because each of us designed different screens, the story didn\'t always connect. Testers scanned tomatoes into their fridge, then met a recipe asking them to request tomatoes from a friend. Next time, I\'d agree on one storyline as a team before designing, and show expiry dates right in the fridge, since expiring food was the top reason anything got thrown away. In the end, it\'s about helping home cooks feel good about the food they already have, and making it easy to share before it goes to waste.' },
                ],
            },
        ],
    },
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
