// ─────────────────────────────────────────────────────────────
// Developers3 — Extended service pages (batch 2 of 2).
// Satisfies the Service interface in src/lib/types.ts exactly.
// Cross-references: testimonials t1..t8, case studies in src/data,
// related slugs limited to the 10 canonical services.
// ─────────────────────────────────────────────────────────────

import type { Service } from '@/lib/types';

export const servicesExtended: Service[] = [
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    shortName: 'UI/UX Design',
    icon: 'pen-tool',
    category: 'design',
    tagline: 'Research-led UI/UX design services that turn complex user journeys into interfaces people navigate effortlessly.',
    primaryKeyword: 'ui ux design services',
    secondaryKeywords: [
      'ui ux design agency',
      'product design services',
      'user experience audit',
      'wireframing and prototyping',
      'design system',
    ],
    metaTitle: 'UI/UX Design Services | Developers3',
    metaDescription:
      'UI/UX design services that turn complex flows into intuitive products. Research, wireframes, prototypes and design systems from a senior product team.',
    heroTitle: 'UI/UX Design Services That Make Every Click Feel Effortless',
    heroSub:
      'We design digital products people love to use — grounded in user research, validated with prototypes, and delivered as pixel-perfect, developer-ready interfaces. Trusted by startups and enterprises across 12 industries.',
    idealFor:
      'Ideal for SaaS founders, product teams and established businesses that need research-backed interfaces, a measurable UX overhaul, or a scalable design system without hiring an in-house design studio.',
    offerings: [
      {
        title: 'UX Research & Usability Audits',
        description:
          'We interview real users, analyse session recordings and map every journey before a single pixel moves. You receive a scored heuristic audit, personas and a prioritised fix list — typically uncovering 15 to 30 friction points per product.',
      },
      {
        title: 'Wireframes & Interactive Prototypes',
        description:
          'Low-fidelity wireframes settle structure and hierarchy early, when changes cost minutes instead of days. From there we build clickable Figma prototypes that let you test navigation, copy and flows with real users before development begins.',
      },
      {
        title: 'High-Fidelity UI Design',
        description:
          'Our designers craft polished, accessible interfaces in Figma — typography scales, spacing systems and states for every component. Each screen is delivered responsive across breakpoints, with WCAG 2.1 AA contrast and hover, focus, empty and error states included.',
      },
      {
        title: 'Design Systems & Component Libraries',
        description:
          'We document colour tokens, type ramps, spacing scales and reusable components in a single source of truth. Your developers get annotated Figma files plus Zeplin specs, keeping every future release consistent and cutting design-to-code handoff time by up to 40%.',
      },
      {
        title: 'Usability Testing & Iteration',
        description:
          'We run moderated Maze tests and Hotjar-informed reviews with five to eight participants per round, then translate findings into concrete design revisions. Most clients see task completion rates climb 20% or more within two testing cycles.',
      },
    ],
    whyTitle: 'Design That Pays for Itself in Conversions, Retention and Fewer Support Tickets',
    whyIntro:
      'Great interface design is not decoration; it is the cheapest growth lever you own. When users can find what they need in seconds, conversion rates rise, support queues shrink and onboarding costs fall — without a single extra dollar of ad spend. Our UI/UX design services pair senior product designers with researchers who quantify every decision. Over the past six years our design work has helped clients lift checkout completion by up to 38%, cut onboarding drop-off in half, and pass accessibility reviews on the first submission.',
    whyBenefits: [
      {
        title: 'Higher Conversion Rates',
        description:
          'We remove the hesitation points that cost you signups and sales. Clients typically see conversion lift of 18-35% after a redesign, because clearer hierarchy, faster flows and friction-free forms let visitors complete tasks instead of abandoning them halfway. Every recommendation is tied to a metric you can track in analytics from day one.',
      },
      {
        title: 'Evidence Over Opinion',
        description:
          'No more design debates settled by whoever is loudest in the room. We validate wireframes and prototypes with real users through moderated testing and heatmaps, so the interface that ships reflects what your customers actually do. That evidence shortens stakeholder approvals, reduces revision cycles and gives you a defensible rationale for every layout decision.',
      },
      {
        title: 'Faster, Cheaper Development',
        description:
          'Developer-ready files with tokens, components and annotations eliminate the guesswork that bloats engineering estimates. Front-end teams build straight from our specs instead of interpreting static mockups, which routinely cuts implementation time by 25-40% and dramatically reduces the back-and-forth questions that stall sprints. One clear handoff pack replaces weeks of clarification threads.',
      },
      {
        title: 'Accessibility & Compliance Built In',
        description:
          'WCAG 2.1 AA contrast, keyboard navigation and screen-reader semantics are engineered into every component from the start, not patched afterwards. That protects you from legal exposure, widens your addressable audience by up to 15%, and increasingly satisfies the procurement and enterprise security checklists that block deals when accessibility gaps are found.',
      },
      {
        title: 'A System That Scales With You',
        description:
          'Instead of a one-off mockup, you receive a living design system: documented tokens, reusable components and usage guidelines your team can extend. New pages ship in days rather than weeks, contractors stay on-brand without supervision, and your interface stays coherent as the product grows from ten screens to a hundred.',
      },
    ],
    process: [
      {
        title: 'Discover & Audit',
        description:
          'We start with stakeholder interviews, analytics review and a heuristic audit of your current product. Within the first week you get a scored report of friction points, quick wins and the biggest opportunities, so the engagement has direction before any design begins.',
      },
      {
        title: 'Research & Define',
        description:
          'User interviews, competitor teardowns and journey mapping turn assumptions into evidence. We define personas, success metrics and information architecture, then align with you in a working session so everyone agrees on what the redesign must achieve before wireframes start.',
      },
      {
        title: 'Wireframe & Prototype',
        description:
          'Low-fidelity wireframes establish layout and hierarchy quickly, then evolve into clickable Figma prototypes. You review and comment in shared sessions, and we iterate until the flows feel obvious — usually two to three rounds inside a two-week window.',
      },
      {
        title: 'Design & Validate',
        description:
          'High-fidelity screens are designed with your brand system, then tested with real users through moderated Maze sessions. Findings feed directly into revisions, so what ships has already been validated — not merely approved internally — before a line of code is written.',
      },
      {
        title: 'Handoff & Support',
        description:
          'You receive organised Figma files, Zeplin specs, a component library and a recorded walkthrough for your developers. We stay available during implementation for edge cases and QA against the designs, ensuring the built product matches what was approved.',
      },
    ],
    technologies: ['Figma', 'FigJam', 'Maze', 'Hotjar', 'Adobe Creative Cloud', 'Zeplin', 'Framer'],
    caseStudySlugs: ['northpay', 'pulsefit'],
    startingPrice: '$950',
    pricingNote:
      'Starting at $950, this covers a focused UX audit and key-screen redesign for smaller products, while the full pricing page details scoped packages for complete design systems and multi-flow projects.',
    testimonialIds: ['t8'],
    faqs: [
      {
        question: 'How much do your UI/UX design services cost?',
        answer:
          'Projects start at $950, which covers a focused audit and redesign of key screens for a smaller product. A complete web app redesign with research, prototyping and a design system typically lands between $3,000 and $9,000 depending on screen count and complexity. After a short discovery call we provide a fixed quote with a defined deliverable list, so you always know exactly what the budget buys before work starts.',
      },
      {
        question: 'How long does a typical UI/UX project take?',
        answer:
          'A focused audit plus key-screen redesign runs about two to three weeks. A full product redesign — research, wireframes, prototypes, high-fidelity design and a component library — usually takes six to ten weeks. We work in weekly sprints with a shared board, so you see progress every Friday and can steer priorities between milestones instead of waiting for one big reveal at the end.',
      },
      {
        question: 'Do you work with our existing developers or design in isolation?',
        answer:
          'We collaborate with your developers directly. Files are organised with shared libraries, tokens and annotations, and we join your sprint rituals during handoff so engineers can ask questions in real time. For clients without an in-house team, our development studio can implement the designs too, which removes handoff friction entirely and keeps one accountable partner from concept through launch.',
      },
      {
        question: 'What if we already have brand guidelines and a partially built product?',
        answer:
          'That is our most common starting point. We audit what exists, keep what works and extend your brand system into the product rather than reinventing it. Existing components are mapped into the new design system so nothing is discarded unnecessarily, and migration is staged screen by screen so your team can keep shipping while the redesign rolls out.',
      },
      {
        question: 'Can you measure whether the redesign actually worked?',
        answer:
          'Yes. During discovery we agree on baseline metrics — conversion rate, task completion time, support ticket volume or onboarding drop-off — and instrument them in GA4 or Hotjar before launch. Thirty and ninety days after release we deliver a comparison report, so you can see the impact in numbers rather than opinions, and decide where to iterate next.',
      },
      {
        question: 'What are your contract terms if our priorities change mid-project?',
        answer:
          'We work on fixed-scope projects with milestone payments — typically 40% to start, 40% at design approval and 20% at handoff. If priorities shift, unused milestones can be redirected to different screens or flows, and there are no lock-in retainers. Pause or stop at any milestone boundary and you keep everything delivered and documented up to that point, no penalties.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'mobile-app-development', 'ecommerce-development'],
  },
  {
    slug: 'seo-services',
    name: 'SEO Services',
    shortName: 'SEO',
    icon: 'trending-up',
    category: 'marketing',
    tagline: 'Full-service SEO that compounds: technical fixes, on-page optimization, authority links and transparent monthly reporting tied to revenue.',
    primaryKeyword: 'seo services company',
    secondaryKeywords: [
      'technical seo audit',
      'local seo services',
      'on page seo optimization',
      'keyword research strategy',
      'link building agency',
    ],
    metaTitle: 'SEO Services Company — Grow Your Rankings | Developers3',
    metaDescription:
      'An SEO services company focused on rankings that turn into revenue: technical audits, on-page optimization, content and links, with reporting you can read.',
    heroTitle: 'SEO Services Company That Turns Search Into Revenue',
    heroSub:
      'Technical audits, content that answers real search intent and links that move rankings. We report in leads and revenue, not vanity metrics — with strategies proven across healthcare, e-commerce, SaaS and local service businesses.',
    idealFor:
      'Ideal for businesses that depend on organic search for leads or sales and want a specialist seo services company instead of a generalist agency that treats SEO as an afterthought.',
    offerings: [
      {
        title: 'Technical SEO Audits',
        description:
          'We crawl every URL, inspect Core Web Vitals, indexation, schema, internal linking and log files, then deliver a prioritised roadmap. Most audits surface 40 to 60 issues, ranked by revenue impact so your developers always know what to fix first.',
      },
      {
        title: 'On-Page & Content Optimization',
        description:
          'We map keywords to intent, rewrite titles and headings, expand thin pages and structure content so it wins featured snippets. Existing pages are refreshed against current SERPs, which typically lifts organic traffic 25-60% within one quarter of rollout.',
      },
      {
        title: 'Local SEO & Google Business Profile',
        description:
          'For location-based businesses we optimise your Google Business Profile, build consistent citations, manage reviews and create location pages that rank in map results. Local clients commonly reach the top-three map pack for their core services within three to six months.',
      },
      {
        title: 'Authority Link Building',
        description:
          'We earn links through digital PR, guest contributions, resource pages and genuinely linkable assets — never private networks or spam. Every placement is vetted for traffic and relevance, and you receive a monthly report of every link acquired with its live URL.',
      },
      {
        title: 'Analytics, Reporting & Forecasting',
        description:
          'A live Looker Studio dashboard tracks rankings, traffic, conversions and revenue alongside a plain-English monthly commentary. Each quarter we reforecast growth based on actual data, so budgets are justified by numbers instead of agency assurances or screenshots.',
      },
    ],
    whyTitle: 'Rankings Are Only the Beginning — Traffic Should Become Revenue',
    whyIntro:
      'Most SEO reporting hides behind impressions and position charts. We start from the end: how many enquiries, bookings or orders did organic search produce this month, and what will it produce next quarter? That commercial lens shapes everything — which keywords we chase, which pages we fix first and how quickly technical debt gets cleared. Our clients average 3.4× organic traffic growth in the first year, and because we document every change, you always know which work produced which result.',
    whyBenefits: [
      {
        title: 'Compounding Traffic You Own',
        description:
          'Paid ads stop the moment you stop paying. SEO keeps working. Pages we optimise in month one are still sending qualified visitors in year three at no incremental cost, which is why organic typically becomes our clients’ cheapest acquisition channel within 12 to 18 months of consistent work.',
      },
      {
        title: 'Leads With Higher Intent',
        description:
          'Someone searching for an emergency plumber at midnight or comparing CRMs for their dental practice is closer to buying than most social audiences. We target those commercial-intent terms deliberately, so the traffic you gain arrives ready to compare, enquire or check out — often converting two to four times better than paid social visitors.',
      },
      {
        title: 'Technical Health That Protects Everything Else',
        description:
          'Crawl errors, duplicate content and slow Core Web Vitals silently cap your rankings no matter how good the content is. Our audits fix that foundation first, so every article and link you invest in afterwards performs at full strength instead of leaking rankings to fixable problems.',
      },
      {
        title: 'Visibility in Local and AI Search',
        description:
          'Beyond classic rankings we optimise for the map pack and for AI-generated answers that now quote sources directly. Structured data, review velocity and clearly structured content make your business the one search engines and assistants cite — visibility that compounds as more discovery shifts to these surfaces.',
      },
      {
        title: 'Reporting You Can Hand to Your Board',
        description:
          'Every month you receive a live dashboard plus a written summary connecting SEO activity to leads and revenue. No jargon, no screenshots of position graphs. If a channel partner or board member asks what the SEO budget achieved last quarter, you will have the answer in one document.',
      },
    ],
    process: [
      {
        title: 'Audit & Baseline',
        description:
          'Weeks one and two: full technical crawl, backlink profile review, competitor gap analysis and GA4 setup. You receive a prioritised 90-day roadmap with projected impact per fix, so investment is sequenced by return rather than by whatever is easiest to change.',
      },
      {
        title: 'Fix the Foundation',
        description:
          'We clear the technical blockers first: indexation, speed, schema, internal links and duplicate content. Working alongside your developers or handling implementation ourselves, this phase typically completes within 30 days and creates the conditions for content and links to actually pay off.',
      },
      {
        title: 'Optimize & Expand Content',
        description:
          'With the foundation sound, we refresh high-value pages and publish new ones mapped to buying-intent keywords. Each piece follows a brief built from SERP analysis, so it targets a real query with a real chance of ranking rather than adding filler to the blog.',
      },
      {
        title: 'Earn Authority',
        description:
          'Digital PR and outreach earn relevant links from publications your customers actually read. We plan one linkable asset per quarter — original data, tools or guides — then promote it, because links follow value instead of networks that put your domain at risk.',
      },
      {
        title: 'Measure & Compound',
        description:
          'Monthly reporting ties rankings to traffic, leads and revenue, and quarterly reviews reforecast the roadmap against real data. Wins get documented and doubled down on; anything that underperforms gets diagnosed honestly. Over months this loop is what turns initial gains into durable market share.',
      },
    ],
    technologies: ['Ahrefs', 'SEMrush', 'Google Search Console', 'GA4', 'Screaming Frog', 'Surfer SEO'],
    caseStudySlugs: ['meridian-dental', 'urban-bloom'],
    startingPrice: '$350',
    pricingNote:
      'Starting at $350 per month, this covers local SEO or a single-focus campaign with monthly reporting; the pricing page outlines full-service retainers scaled to your market and competition.',
    testimonialIds: ['t7', 't3'],
    faqs: [
      {
        question: 'How much do SEO services cost?',
        answer:
          'Retainers start at $350 per month for local campaigns and typically range from $700 to $2,000 per month for competitive national markets. The price reflects the number of pages, competitors’ strength and how much content production is required. After the audit we quote a fixed monthly fee with a defined scope of deliverables, and that price does not change without your written approval.',
      },
      {
        question: 'How long until we see results?',
        answer:
          'Technical fixes often show measurable improvement in four to eight weeks. Meaningful ranking and traffic movement for competitive keywords usually takes three to six months, and authority builds from there. Anyone promising page one in thirty days is either targeting worthless keywords or taking risks with your domain. We set expectations per keyword in the roadmap and report against them honestly every month.',
      },
      {
        question: 'Do you require long-term contracts?',
        answer:
          'We ask for an initial six-month commitment because SEO compounding genuinely needs that runway, then continue month to month with 30 days’ notice. There are no cancellation penalties and no auto-escalating fees. Roughly 85% of clients stay past the first year, which we believe says more about the results than any contract ever could.',
      },
      {
        question: 'Will you work with our existing developer or CMS?',
        answer:
          'Yes. We regularly implement technical recommendations in WordPress, Shopify, Webflow and custom-built stacks, and we are equally comfortable writing specs your own developers can execute. If your platform makes SEO genuinely hard — some do — we will tell you during the audit and quote migration options separately, rather than billing monthly fees against a foundation that cannot rank.',
      },
      {
        question: 'What makes you different from other SEO agencies?',
        answer:
          'Three things: senior practitioners on every account rather than juniors following playbooks, complete documentation of every change so nothing is a black box, and reporting tied to revenue instead of rankings alone. We also cap our client list per industry so we never compete against ourselves, and every link we build is disclosed with a live URL in your monthly report.',
      },
      {
        question: 'Can you recover a site hit by a Google update or penalty?',
        answer:
          'Frequently, yes. We diagnose whether the cause is technical, content quality or backlink-related, then rebuild against current guidelines with documented timelines. Recoveries typically take two to four months from fix to reinstatement of lost rankings, and we will give you an honest assessment during the audit — including telling you when a site’s history makes recovery unlikely, before you spend anything.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'google-ads-management', 'website-maintenance'],
  },
  {
    slug: 'google-ads-management',
    name: 'Google Ads Management',
    shortName: 'Google Ads',
    icon: 'target',
    category: 'marketing',
    tagline: 'Certified Google Ads management that cuts wasted spend, lowers cost per lead and reports profit, not just clicks.',
    primaryKeyword: 'google ads management services',
    secondaryKeywords: [
      'ppc management agency',
      'google ads agency',
      'google shopping ads',
      'landing page optimization',
      'conversion rate tracking',
    ],
    metaTitle: 'Google Ads Management Services | Developers3',
    metaDescription:
      'Google Ads management services built for profitable ROAS: campaign structure, landing pages, call tracking and weekly optimization by certified specialists.',
    heroTitle: 'Google Ads Management Services That Squeeze Profit From Every Click',
    heroSub:
      'Certified specialists manage search, shopping and Performance Max campaigns with ruthless weekly optimization. You get transparent spend control, honest reporting on ROAS, and landing pages engineered to convert the traffic you already pay for.',
    idealFor:
      'Ideal for businesses spending $2,000 or more per month on ads who want a certified partner accountable for cost per acquisition instead of an account that only ever raises budgets.',
    offerings: [
      {
        title: 'Account Audit & Rebuild',
        description:
          'We dissect search terms, match types, bidding, budget allocation and Quality Scores to find where money leaks. Most accounts we inherit waste 20-35% of spend; the rebuild fixes structure, negatives and bidding so every remaining dollar works harder from week one.',
      },
      {
        title: 'Search & Shopping Campaigns',
        description:
          'Campaigns are structured around intent, with SKAG-style separation where it still helps and tight thematic ad groups elsewhere. For e-commerce we build Merchant Center feeds, optimise product titles and split Shopping campaigns so best-sellers get the budget they deserve.',
      },
      {
        title: 'Conversion Tracking & Attribution',
        description:
          'Accurate data drives every bidding decision, so we implement GA4 events, server-side tagging through Google Tag Manager and CallRail call tracking. You will know which keywords produce phone calls, form fills and sales — not just which ones attract clicks.',
      },
      {
        title: 'Landing Page Optimization',
        description:
          'Clicks only become revenue when pages convert. We build or rework landing pages with message match, fast load times, clear offers and continuous A/B tests. Clients typically see conversion rates improve 30-70% against the pages they were sending traffic to before.',
      },
      {
        title: 'Weekly Optimization & Reporting',
        description:
          'Every week we prune wasteful search terms, adjust bids, test new ad copy and reallocate budget toward what converts. You receive a live Looker Studio dashboard plus a short written summary answering the only question that matters: what did the spend return?',
      },
    ],
    whyTitle: 'Stop Renting Traffic You Cannot Measure — Start Buying Profit',
    whyIntro:
      'Google Ads is the fastest way to buy qualified demand — and one of the fastest ways to burn money. The difference is management discipline: relentless search-term pruning, honest conversion data and landing pages that respect the click. Our certified team manages over $4 million in annual ad spend across e-commerce, B2B services and local businesses, with an average client ROAS of 4.2×. We treat your budget like our own money, because renewals are earned through numbers, not PowerPoint decks.',
    whyBenefits: [
      {
        title: 'Lower Cost Per Acquisition',
        description:
          'Weekly pruning of wasteful search terms, sharper ad-to-page messaging and smarter bidding typically cut cost per lead 25-45% within ninety days. Every dollar saved on junk clicks is a dollar available for the auctions that actually produce customers, which is why account efficiency improves before budgets ever need to grow.',
      },
      {
        title: 'Decisions Based on Real Conversions',
        description:
          'Most accounts optimise against inflated or broken conversion data. We implement server-side tracking, call attribution and offline conversion imports so bidding algorithms learn from true sales signals. When the machine learning is fed honest data, budgets automatically shift toward keywords and audiences that close deals rather than those that merely attract curiosity.',
      },
      {
        title: 'Speed That Organic Channels Cannot Match',
        description:
          'SEO compounds over months; Google Ads puts you in front of buyers this afternoon. We use that immediacy deliberately — validating offers, testing messaging and generating pipeline while longer-term channels mature. For launches and seasonal pushes, paid search delivers measurable demand within days of switching campaigns live.',
      },
      {
        title: 'Full Visibility Into Where Money Goes',
        description:
          'You keep ownership of your ad account and every insight we surface. A live dashboard shows spend, conversions and ROAS by campaign, and a weekly summary explains what changed and why. No hiding behind platform complexity: if performance dips, you will see exactly where, when and what we are doing about it.',
      },
      {
        title: 'Landing Pages That Multiply Results',
        description:
          'Doubling conversion rate halves cost per acquisition without touching bids. Because our studio builds landing pages in-house, optimization happens in days rather than through a separate vendor. Message match, load speed and continuous A/B testing routinely lift conversion rates 30-70%, compounding every other improvement in the account.',
      },
    ],
    process: [
      {
        title: 'Audit Goals & Account',
        description:
          'We begin with your numbers: target cost per lead, margins, average order value and sales capacity. Then we audit the existing account against those goals, quantify wasted spend and agree on realistic targets before a single campaign is rebuilt or launched.',
      },
      {
        title: 'Track Before Spending',
        description:
          'Nothing gets scaled until measurement is trustworthy. We configure GA4, Google Tag Manager, CallRail and enhanced conversions, then verify every form, call and purchase fires correctly. This week of discipline prevents months of optimizing toward numbers that never matched reality in the first place.',
      },
      {
        title: 'Rebuild & Launch',
        description:
          'Campaigns are restructured around intent and margin: tight ad groups, complete negative lists, correct bidding strategies and responsive search ads written in variants for testing. New or fixed campaigns go live with controlled budgets so early data accumulates cleanly without betting the whole monthly budget.',
      },
      {
        title: 'Optimize Weekly',
        description:
          'Every week: search-term mining, negative additions, bid and budget adjustments, ad copy tests and landing page experiments. Small consistent improvements compound aggressively — a 2% weekly gain in efficiency becomes a doubling of results over a year of disciplined management.',
      },
      {
        title: 'Report, Forecast & Scale',
        description:
          'Monthly reviews connect spend to revenue, compare performance against agreed targets and forecast the next quarter. When unit economics hold, we scale budgets deliberately — expanding winning campaigns, adding channels like Performance Max or YouTube — so growth never outruns profitability.',
      },
    ],
    technologies: ['Google Ads', 'GA4', 'Google Tag Manager', 'Looker Studio', 'Merchant Center', 'CallRail'],
    caseStudySlugs: ['urban-bloom'],
    startingPrice: '$299',
    pricingNote:
      'Starting at $299 per month plus ad spend, this covers management of up to two campaign types with weekly optimization; the pricing page details retainers for larger, multi-channel accounts.',
    testimonialIds: ['t7'],
    faqs: [
      {
        question: 'How much do your Google Ads management services cost?',
        answer:
          'Management starts at $299 per month plus your ad spend, which goes directly to Google — we never mark it up. Most clients invest $2,000 to $15,000 monthly in media depending on their market. After the audit we quote a fixed management fee based on campaign complexity, so the total cost of advertising is transparent from the first invoice.',
      },
      {
        question: 'How quickly will we see results?',
        answer:
          'Paid search produces data fast: meaningful click and conversion patterns typically emerge within two to three weeks, and optimization gains compound from there. We expect cost per acquisition to improve visibly by day 45 to 60 once tracking is solid and the first optimization cycles complete. If an account has not improved after ninety days, we will show you precisely why — and whether the market, offer or budget is the constraint.',
      },
      {
        question: 'Do we keep ownership of the ad account?',
        answer:
          'Always. Your campaigns live in your own Google Ads account, funded by your own payment method, and you retain admin access throughout. If we ever part ways, every campaign, audience list and landing page stays with you. We also document account structure and settings so any future manager can pick up where we left off without charging you for a forensic audit.',
      },
      {
        question: 'What size ad budget do we need for this to work?',
        answer:
          'We generally recommend at least $2,000 per month in media for search campaigns, because meaningful optimisation requires enough conversion data each week. Below that, results are possible in small local markets but statistical signal is thin. During the audit we model expected clicks, costs and leads at your realistic budget — and we will tell you honestly if paid search is not yet the right channel for your numbers.',
      },
      {
        question: 'What do you need from our team to get started?',
        answer:
          'Roughly two hours in the first week: access to your Google Ads and analytics accounts, a walkthrough of your sales process and margins, and examples of past leads so we know what a good one looks like. After that, we send a weekly summary and hold a 30-minute call each month. You never need to chase us for updates — the reporting schedule is fixed and automatic.',
      },
      {
        question: 'Can you also build the landing pages?',
        answer:
          'Yes, and we strongly recommend it. Our development studio designs and builds fast, conversion-focused landing pages that message-match each campaign, typically delivering within two weeks. Pages load in under two seconds, include call tracking and A/B testing hooks, and are yours to keep. Clients who pair management with dedicated landing pages usually see conversion rate improvements of 30-70% versus sending paid traffic to their homepage.',
      },
    ],
    relatedServiceSlugs: ['seo-services', 'social-media-marketing', 'custom-website-development'],
  },
  {
    slug: 'social-media-marketing',
    name: 'Social Media Marketing',
    shortName: 'Social Media',
    icon: 'megaphone',
    category: 'marketing',
    tagline: 'Content, community and paid social managed end to end, with reporting that ties engagement to real revenue.',
    primaryKeyword: 'social media marketing services',
    secondaryKeywords: [
      'social media management agency',
      'instagram marketing',
      'paid social campaigns',
      'content calendar planning',
      'tiktok marketing agency',
    ],
    metaTitle: 'Social Media Marketing Services | Developers3',
    metaDescription:
      'Social media marketing services that build audience and drive sales: content calendars, paid social campaigns and monthly reporting across every platform.',
    heroTitle: 'Social Media Marketing Services That Turn Followers Into Customers',
    heroSub:
      'Strategy, daily content and paid social campaigns managed by one accountable team. We grow communities that engage, click and buy — with monthly reporting that connects every post and ad to pipeline, not just likes.',
    idealFor:
      'Ideal for e-commerce brands, local businesses and B2B teams that need a consistent, professional social presence without hiring a full-time in-house content team.',
    offerings: [
      {
        title: 'Strategy & Channel Planning',
        description:
          'We audit your current profiles, analyse where your audience actually spends time and define a channel plan with content pillars, posting cadence and tone. Every platform gets a distinct role — reach, community or conversion — so effort concentrates where it moves the needle.',
      },
      {
        title: 'Content Creation & Calendars',
        description:
          'Monthly content calendars come fully produced: captions, graphics, short-form video scripts and stories, approved in one batch review. Visuals stay on-brand through our in-house design team, and every post includes a call to action tied to a real business objective.',
      },
      {
        title: 'Paid Social Campaigns',
        description:
          'We build and manage Meta, Instagram and TikTok ad campaigns with tested creative, precise audiences and retargeting funnels that recover abandoned carts and warm leads. Clients typically see paid social cost per purchase drop 20-40% after the first optimization quarter.',
      },
      {
        title: 'Community Management',
        description:
          'Comments, DMs and reviews get answered in your brand voice within one business day, turning passive followers into repeat customers. We escalate sales-ready enquiries to your team immediately, and monthly sentiment summaries show what customers love and where friction builds.',
      },
      {
        title: 'Reporting & Growth Reviews',
        description:
          'Monthly reports connect engagement to outcomes: reach, saves, link clicks, leads and revenue attributed by platform. Quarterly growth reviews then reallocate budget toward the formats and channels that performed, so the strategy sharpens with data instead of drifting with trends.',
      },
    ],
    whyTitle: 'Attention Is Earned Daily — Consistency Compounds Into Revenue',
    whyIntro:
      'Social platforms decide which brands stay visible, and their algorithms reward consistency that most in-house teams cannot sustain. Our social media marketing services solve that with an always-on engine: research-backed strategy, professionally produced content and paid campaigns that amplify what already resonates. Across our roster, managed accounts average 3.1× follower growth and 2.4× engagement rate within the first six months — and, more importantly, social became a trackable source of enquiries and orders rather than a decorative feed nobody measures.',
    whyBenefits: [
      {
        title: 'A Presence That Never Goes Quiet',
        description:
          'Inconsistent posting is the silent killer of social accounts: the algorithm deprioritises you and followers drift away. Our production calendar guarantees daily activity on your chosen platforms, so momentum builds instead of resetting every time your team gets busy. Brands on our retainers post 20-30 times per month without their internal staff lifting a finger.',
      },
      {
        title: 'Content People Actually Save and Share',
        description:
          'Generic stock graphics get scrolled past; useful, entertaining and beautifully produced content gets saved, shared and remembered. Our creative team writes hooks in the first two seconds of every video and designs every graphic for the platform it lives on, which is why our clients’ saves and shares grow even faster than follower counts.',
      },
      {
        title: 'Paid Social That Pays for Itself',
        description:
          'Organic reach alone rarely justifies the effort anymore, so we pair it with retargeting and lookalike campaigns that convert. Because creative testing happens weekly and audiences are refined continuously, clients typically see cost per acquisition fall 20-40% within a quarter — turning social ads from an experiment into a dependable acquisition channel.',
      },
      {
        title: 'Community That Converts and Defends You',
        description:
          'Every unanswered comment is a lost sale or a brewing complaint. Our team responds within one business day in your voice, routing hot leads to sales and defusing issues before they become public problems. Clients consistently report that socially engaged customers buy more often, churn less and volunteer the user-generated content that fuels future campaigns.',
      },
      {
        title: 'Numbers Your CFO Will Respect',
        description:
          'Follower counts are not a KPI; pipeline is. Our reporting attributes link clicks, enquiries and revenue by platform, compares paid versus organic performance and benchmarks against your previous quarter. When you walk into a budget meeting, you can show exactly what social media contributed to the business — and defend every dollar of next quarter’s spend.',
      },
    ],
    process: [
      {
        title: 'Discovery & Audit',
        description:
          'We review your profiles, competitors and past performance, then interview your team on goals, offers and capacity. Within two weeks you receive a channel strategy document: which platforms to prioritise, content pillars to own and the KPIs that will define success.',
      },
      {
        title: 'Foundation & Brand System',
        description:
          'Profiles get optimised — bios, highlights, link tracking and cross-platform consistency — and we build a social brand kit of templates, filters and caption guidelines. This one-time setup ensures every future post reinforces the brand instead of improvising a new look each week.',
      },
      {
        title: 'Produce & Approve',
        description:
          'Each month you receive a full content calendar — captions, graphics, video scripts and stories — for one batch approval. Nothing publishes without your sign-off, yet the process is designed so reviewing takes an hour, not a week, keeping momentum high without surrendering control.',
      },
      {
        title: 'Publish & Engage',
        description:
          'Scheduled posts go live across platforms while our team monitors comments and DMs daily, responding within one business day. Meanwhile we watch which formats outperform, flag trending opportunities worth jumping on and route sales enquiries to your inbox the moment they appear.',
      },
      {
        title: 'Amplify & Report',
        description:
          'Top-performing organic content gets promoted through paid campaigns, stretching proven creative further. Monthly reports attribute reach, clicks, leads and revenue by platform, and quarterly strategy sessions reallocate budget so every following month is sharper than the last.',
      },
    ],
    technologies: ['Meta Business Suite', 'Instagram', 'TikTok', 'LinkedIn', 'Buffer', 'Canva'],
    caseStudySlugs: ['urban-bloom', 'lumina-boutique'],
    startingPrice: '$299',
    pricingNote:
      'Starting at $299 per month, this covers strategy and management of two platforms with a full content calendar; the pricing page details packages that add paid social and video.',
    testimonialIds: ['t1'],
    faqs: [
      {
        question: 'How much do social media marketing services cost?',
        answer:
          'Management starts at $299 per month for two platforms, covering strategy, a full content calendar, design and community management. Packages with paid social advertising and short-form video production typically run $600 to $1,800 per month. After a discovery call we quote a fixed monthly fee with the deliverables listed line by line, so you know precisely what each dollar buys.',
      },
      {
        question: 'Which platforms should my business focus on?',
        answer:
          'It depends entirely on where your buyers spend time. We usually recommend mastering two platforms before adding more: Instagram and TikTok for consumer brands, LinkedIn and Instagram for B2B services, Facebook and Instagram for local businesses. The discovery audit confirms this with data on your audience and competitors rather than guesswork, and we would rather run two channels brilliantly than five superficially.',
      },
      {
        question: 'How is this different from hiring an in-house social media manager?',
        answer:
          'One in-house hire costs $45,000 to $65,000 per year, and you still need a designer, a video editor and a paid ads specialist. Our retainer gives you the whole bench for a fraction of that, with documented processes and no recruitment risk. Many clients use us alongside an internal coordinator who handles approvals and brand knowledge — that combination gets agency-quality output with insider context.',
      },
      {
        question: 'How soon will we see growth?',
        answer:
          'Engagement quality usually improves within the first month as content consistency and hook-driven creative take effect. Follower growth becomes visible around month two, and paid campaigns generate trackable conversions from week one if advertising is included. Meaningful revenue attribution typically lands in months three to six, which is why our strategy documents set milestone targets per quarter rather than promising overnight virality.',
      },
      {
        question: 'Who approves the content, and how much of our time does it take?',
        answer:
          'You approve every calendar before anything publishes. We deliver the full month’s content in one batch with a simple approval interface, so review typically takes under an hour. Beyond that, we ask for one 30-minute call per month and occasional access to your team for product photos or expert quotes. Most clients spend two to three hours monthly on social media — total.',
      },
      {
        question: 'Do you require a long-term contract?',
        answer:
          'We ask for an initial three-month term because algorithms and audiences need time to respond to consistency, then continue month to month with 30 days’ notice and no exit penalties. Everything we create — content, templates, calendars, audience data — belongs to you and is handed over in organised folders if we part ways. About 90% of clients renew past the first year.',
      },
    ],
    relatedServiceSlugs: ['google-ads-management', 'seo-services', 'ecommerce-development'],
  },
  {
    slug: 'website-maintenance',
    name: 'Website Maintenance & Support',
    shortName: 'Maintenance',
    icon: 'wrench',
    category: 'support',
    tagline: 'Proactive updates, security monitoring and daily backups that keep your website fast, safe and online around the clock.',
    primaryKeyword: 'website maintenance services',
    secondaryKeywords: [
      'website support plans',
      'wordpress maintenance',
      'website security monitoring',
      'monthly website updates',
      'website backup services',
    ],
    metaTitle: 'Website Maintenance Services & Support | Developers3',
    metaDescription:
      'Website maintenance services with 24/7 uptime monitoring, security patching, daily backups and monthly updates — plus same-day support when things break.',
    heroTitle: 'Website Maintenance Services That Keep Your Site Fast, Secure and Online',
    heroSub:
      'Plans start at $49 per month and cover updates, security, backups and uptime monitoring — with same-day response on urgent issues. Your site stays fast, safe and selling while you focus on running the business.',
    idealFor:
      'Ideal for businesses whose website generates leads or sales and cannot afford downtime, broken forms or a security breach — but lack the in-house developer to prevent them.',
    offerings: [
      {
        title: 'Core, Plugin & Security Updates',
        description:
          'We test and apply platform, plugin and theme updates on a managed schedule, staging critical changes before they touch your live site. Outdated components are the number one cause of hacked websites, and this single routine eliminates the majority of that risk.',
      },
      {
        title: '24/7 Uptime & Performance Monitoring',
        description:
          'Automated checks ping your site every 60 seconds from multiple regions, alerting our team within minutes if anything fails. Monthly PageSpeed audits catch creeping performance problems — bloated scripts, oversized images — before they erode your rankings and conversion rates.',
      },
      {
        title: 'Daily Backups & One-Click Restore',
        description:
          'Full off-site backups run daily and are retained for 30 days, stored separately from your hosting so a compromised server cannot destroy them. If anything goes wrong, we restore a clean version fast — most recovery requests are completed within one hour.',
      },
      {
        title: 'Security Hardening & Malware Response',
        description:
          'Firewall rules, bot filtering and SSL management block the majority of attacks before they reach your site. If malware ever appears, we quarantine, clean and restore from verified backups, then patch the entry point — included in the plan rather than quoted as an emergency.',
      },
      {
        title: 'Content & Small Change Requests',
        description:
          'Need a new banner, a copy fix or a fresh team photo? Every plan includes monthly change requests handled by our developers within one to two business days. It is the practical alternative to chasing a freelance developer for every small task.',
      },
    ],
    whyTitle: 'One Broken Website Can Cost More Than a Decade of Maintenance',
    whyIntro:
      'A hacked or offline website is not an inconvenience; it is lost revenue, lost rankings and lost customer trust arriving all at once. Google de-indexes compromised sites, e-commerce stores watch checkout revenue evaporate, and rebuilding after a breach costs ten times what prevention would have. Our website maintenance services exist so none of that happens: monitored 24/7, patched proactively, backed up daily and supported by developers who already know your stack. Our maintenance plans are built to keep it that way.',
    whyBenefits: [
      {
        title: 'Near-Perfect Uptime, Around the Clock',
        description:
          'Our monitoring pings your site every 60 seconds from multiple regions, so outages are detected in minutes — not discovered days later by a customer. Combined with rapid response, that is the difference between a five-minute blip and a weekend of lost sales.',
      },
      {
        title: 'Security You Do Not Have to Think About',
        description:
          'Firewall configuration, malware scanning, brute-force protection and timely patching run continuously in the background. If an incident ever occurs, cleanup is included in your plan rather than billed as a four-figure emergency. Most clients never experience a breach at all — which is precisely the point.',
      },
      {
        title: 'Faster Pages, Better Rankings',
        description:
          'Speed decays quietly as content accumulates and plugins bloat. Monthly performance audits with PageSpeed Insights catch the drift, and our team fixes what it finds — image compression, script cleanup, caching optimisation. Faster pages rank better and convert better, so maintenance quietly pays for itself in SEO and sales.',
      },
      {
        title: 'Recover From Anything in Hours, Not Weeks',
        description:
          'Daily off-site backups retained for 30 days mean a botched update, a hacker or a hosting failure is an inconvenience rather than a catastrophe. Restoration typically completes within one hour, and because backups live outside your hosting, even a fully compromised server cannot take your site’s history down with it.',
      },
      {
        title: 'A Developer on Call Without the Payroll',
        description:
          'Small changes should not require a project quote. Included change requests get handled by developers who already know your codebase, within one to two business days. Over a year that saves dozens of billable hours and removes the temptation to let your website drift out of date because updating it feels like too much hassle.',
      },
    ],
    process: [
      {
        title: 'Onboarding & Health Audit',
        description:
          'Week one: we audit your site’s code, plugins, hosting, speed and security posture, then fix critical findings immediately. You receive a baseline report and a recommended plan tier, so the service starts from a known, documented state rather than inherited guesswork.',
      },
      {
        title: 'Protect & Monitor',
        description:
          'Backups, firewall rules and uptime monitoring go live within the first week. From that moment your site is checked every 60 seconds, scanned for malware daily and covered by 30-day off-site backups — the safety net exists before we touch anything else.',
      },
      {
        title: 'Update & Optimize',
        description:
          'On a monthly cycle we stage, test and deploy platform and plugin updates, then run performance audits and apply fixes. Changes roll out in low-traffic windows with post-deployment checks, so improvements arrive steadily without ever gambling your live site on an untested update.',
      },
      {
        title: 'Support & Change Requests',
        description:
          'Submit requests through a shared ticket board with response times guaranteed by your plan tier: same-day for urgent issues, one to two business days for routine changes. Every request, fix and decision is logged, so your site’s full maintenance history is always auditable.',
      },
      {
        title: 'Report & Improve',
        description:
          'Each month you receive a report covering uptime, security scans, updates applied, backups verified and performance trends, written in plain language. Quarterly reviews then plan bigger improvements — speed budgets, hosting upgrades, technical debt — so the site gets better every year, not just maintained.',
      },
    ],
    technologies: ['Cloudflare', 'UptimeRobot', 'ManageWP', 'Git', 'PageSpeed Insights', 'Sucuri'],
    caseStudySlugs: ['meridian-dental', 'atlas-logistics'],
    startingPrice: '$49',
    pricingNote:
      'Starting at $49 per month, this covers updates, daily backups, monitoring and one change request; the pricing page compares all plan tiers, response times and included hours.',
    testimonialIds: ['t3', 't4'],
    faqs: [
      {
        question: 'How much do website maintenance services cost?',
        answer:
          'Plans start at $49 per month for essential care: updates, daily backups, uptime monitoring and security scanning. The $129 plan adds priority same-day response and monthly change requests, while the $249 tier covers e-commerce and larger sites with four hours of developer time monthly. There are no setup fees, and you can upgrade, downgrade or cancel with 30 days’ notice.',
      },
      {
        question: 'What exactly is covered — and what is not?',
        answer:
          'Covered: platform and plugin updates, daily off-site backups, 24/7 uptime monitoring, malware scanning, firewall management, SSL upkeep, monthly performance checks and plan-tier change requests. Not covered: redesigns, new feature development and third-party licence fees — we quote those separately and transparently. If a request falls outside your plan, we tell you the cost before any work starts, so invoices never surprise you.',
      },
      {
        question: 'How fast do you respond when something breaks?',
        answer:
          'Uptime monitoring alerts us within minutes of a failure, and urgent tickets receive same-day response on all plans — often within two hours during business time. Routine change requests are completed in one to two business days, and emergency restoration from backups typically finishes within one hour. Response time guarantees are written into the plan description, not buried in a contract’s fine print.',
      },
      {
        question: 'Do you maintain sites you did not build?',
        answer:
          'Yes, roughly half of our maintenance clients came to us with websites built elsewhere. Onboarding begins with a health audit covering code quality, plugins, hosting and security; if we find problems we fix the critical ones immediately and document the rest. We support WordPress, Shopify, Webflow and most custom stacks — and if a platform is genuinely unmaintainable, we will say so and quote an upgrade honestly.',
      },
      {
        question: 'What happens if my site gets hacked while on your plan?',
        answer:
          'Cleanup is included, not invoiced as an emergency. We isolate the infection, remove the malware, restore clean data from verified daily backups and patch whatever vulnerability was exploited — usually within one business day of detection. Afterwards you receive a written incident report explaining what happened, what we changed and how recurrence is prevented. That single policy is why clients stop worrying about security entirely.',
      },
      {
        question: 'Can we cancel, and what happens to our site?',
        answer:
          'Cancel any time with 30 days’ notice — no penalties and no retention games. Your site, hosting and domain always remain in your name, and we hand over all documentation, access credentials and recent backups in organised form. Many clients stay for years, but we would rather earn renewal through reliable uptime and responsive support than trap anyone in a contract they resent.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'wordpress-development', 'seo-services'],
  },
];
