import type { CaseStudy } from '@/lib/types';

// Case studies batch 2 (Task 2-d): pulsefit, brewpoint, skillforge, crema-coffee, urban-bloom.
export const caseStudiesBatch2: CaseStudy[] = [
  {
    slug: 'pulsefit',
    title: 'PulseFit: A Flutter Fitness App With 120K Downloads',
    client: 'PulseFit',
    category: 'apps',
    industry: 'Fitness',
    services: ['mobile-app-development', 'ui-ux-design'],
    summary:
      'A cross-platform Flutter fitness app that hit 120k downloads, a 4.8★ rating, and 68% 30-day retention within six months of launch.',
    coverImage: '/images/portfolio/pulsefit.png',
    coverAlt:
      'PulseFit Flutter fitness app displayed on two smartphones showing workout tracking screens, heart-rate charts, and wearable health integration stats',
    challenge: [
      'PulseFit built its reputation on high-energy boutique studio classes, but its members were tracking workouts in paper notebooks, spreadsheets, and three different consumer apps. The brand had no digital product of its own, so it couldn’t see how members trained between sessions, and every promotion relied on email that most members ignored. Competitors were launching polished apps with streaks, leaderboards, and wearable sync, and PulseFit was losing younger members to gyms that met them where they already were: on their phones.',
      'The leadership team wanted one codebase that could ship to both the App Store and Google Play without doubling costs, yet still feel native and fast during workouts. Members expected offline access in basement gyms and outdoor parks with poor signal, seamless Apple Health and Google Fit integration, and subscription billing that could handle monthly, annual, and class-pack plans. Any solution had to launch before the January rush to capture the seasonal surge in fitness sign-ups.',
    ],
    solution: [
      'We designed and built the PulseFit app in Flutter, giving iOS and Android users a single, pixel-consistent experience from one codebase. Firebase handles authentication, realtime workout sync, and analytics, while a GraphQL layer shapes training data for dashboards without over-fetching on mobile connections. Our UX team prototyped the workout flow with real members, trimming the log-a-session journey from nine taps to four and designing large, glove-friendly controls that work mid-workout when attention and dexterity are limited.',
      'Offline mode caches the full workout library and logs sessions locally, syncing automatically the moment connectivity returns. HealthKit and Google Fit integrations pull heart-rate and step data straight into member profiles, while Stripe powers flexible in-app billing for monthly, annual, and class-pack plans. OneSignal drives behavior-based campaigns — streak reminders, waitlist openings, and milestone celebrations — and we shipped to both stores with staged rollouts, crash monitoring, and App Store optimization ahead of the January surge.',
    ],
    techStack: ['Flutter', 'Firebase', 'GraphQL', 'Stripe', 'OneSignal', 'App Store', 'Google Play'],
    results: [
      { metric: '120k', label: 'App downloads in the first 6 months' },
      { metric: '4.8★', label: 'Average App Store rating' },
      { metric: '+68%', label: '30-day user retention' },
      { metric: '22 min', label: 'Average in-app session length' },
    ],
    showcase: [
      {
        title: 'Unified Workout Logging',
        blurb:
          'Members log sets, reps, and rest times in four taps, with offline caching that keeps every session recorded even in basement gyms with no signal.',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: 'Wearable & Health Sync',
        blurb:
          'Apple Health and Google Fit streams flow into each member profile, turning heart-rate and step data into progress rings, recovery hints, and weekly training insights.',
        gradient: 'from-teal-500 to-emerald-700',
      },
      {
        title: 'Streaks, Leaderboards & Push',
        blurb:
          'Gamified streaks and studio leaderboards keep members competing, while OneSignal campaigns time streak reminders and class openings to each member’s actual training rhythm.',
        gradient: 'from-amber-400 to-orange-500',
      },
      {
        title: 'One Codebase, Two Stores',
        blurb:
          'A single Flutter codebase ships pixel-consistent releases to the App Store and Google Play, cutting maintenance effort roughly in half versus separate native builds.',
        gradient: 'from-lime-400 to-emerald-500',
      },
    ],
    testimonialId: 't5',
    metaTitle: 'PulseFit — Mobile App Development Case Study | Developers3',
    metaDescription:
      'How Developers3 built PulseFit, a cross-platform Flutter fitness app with 120k downloads, a 4.8★ App Store rating, and 68% 30-day retention in six months.',
  },
  {
    slug: 'brewpoint',
    title: 'BrewPoint Coffee: An Order-Ahead App With 22K Monthly Orders',
    client: 'BrewPoint Coffee',
    category: 'apps',
    industry: 'Food & Beverage',
    services: ['mobile-app-development'],
    summary:
      'A Flutter order-ahead and loyalty app that now processes 22k monthly orders and lifted BrewPoint’s average order value by 29%.',
    coverImage: '/images/portfolio/brewpoint.png',
    coverAlt:
      'BrewPoint Coffee order-ahead app on a smartphone showing the drink menu, loyalty rewards card, and pickup status next to a takeaway coffee cup',
    challenge: [
      'BrewPoint Coffee grew from a single espresso bar to a 14-location chain, but morning rush lines were costing it sales. Regulars waited six to eight minutes for hand-crafted drinks, queues spilled toward the street, and staff juggled phone orders between steaming milk. Third-party delivery apps took up to 30% commission and owned the customer relationship, so BrewPoint’s margins and its loyalty data leaked away with every order placed through them.',
      'Paper punch cards couldn’t track visits across locations, so the marketing team had no way to identify lapsed regulars or reward their best customers. The company needed an own-brand ordering app that synced live with Square POS at every café, handled prepaid and pay-in-store payment, and supported timed pickup slots that baristas could actually honor during peak hours. It also had to feel as fast as the big coffee chains’ apps to win daily habit.',
    ],
    solution: [
      'We built the BrewPoint app in Flutter and connected it directly to Square POS through a lightweight middleware service, so menu items, modifier availability, and pricing stay in sync across all 14 cafés in real time. Customers reorder their usual in three taps, choose a pickup window, and watch live status updates from ‘order received’ to ‘ready at the bar’. Firebase handles auth and analytics, while Stripe processes card payments and saved wallets.',
      'The loyalty engine replaces punch cards with points earned per dollar, double-point happy hours, and a free-drink reward at every 100 points. OneSignal powers segmented push campaigns — win-back offers for regulars quiet for 14 days, seasonal drink launches, and location-specific promos — which marketing schedules from a simple dashboard. Baristas got a tablet-friendly ticket queue that accepts orders and marks them ready, and we trained staff across all locations in two short sessions.',
    ],
    techStack: ['Flutter', 'Firebase', 'Stripe', 'Square POS', 'OneSignal'],
    results: [
      { metric: '22k', label: 'Monthly orders placed in the app' },
      { metric: '+29%', label: 'Average order value uplift' },
      { metric: '4.7★', label: 'Google Play Store rating' },
      { metric: '71%', label: 'Repeat order rate' },
    ],
    showcase: [
      {
        title: 'Three-Tap Reordering',
        blurb:
          'Favorites, recent orders, and location-aware menus put a regular’s usual drink three taps from the home screen, driving a 71% repeat order rate.',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: 'Live Square POS Sync',
        blurb:
          'A middleware layer keeps items, modifiers, and prices identical across 14 cafés, while pickup windows flow straight into the barista ticket queue.',
        gradient: 'from-teal-500 to-emerald-700',
      },
      {
        title: 'Points-Based Loyalty',
        blurb:
          'Digital points replace paper punch cards, with double-point happy hours and free-drink milestones that nudge customers toward their next visit.',
        gradient: 'from-amber-400 to-orange-500',
      },
      {
        title: 'Segmented Push Campaigns',
        blurb:
          'OneSignal win-back flows, seasonal launches, and location promos reach the right regulars at the right hour, lifting average order value by 29%.',
        gradient: 'from-rose-400 to-orange-400',
      },
    ],
    testimonialId: 't6',
    metaTitle: 'BrewPoint Coffee — Mobile App Development Case Study | Developers3',
    metaDescription:
      'How Developers3 built BrewPoint’s Flutter order-ahead app: 22k monthly orders, 29% higher average order value, and a 71% repeat order rate across 14 cafés.',
  },
  {
    slug: 'skillforge',
    title: 'SkillForge Academy: A Custom LMS With 18K Active Learners',
    client: 'SkillForge Academy',
    category: 'web',
    industry: 'Education',
    services: ['custom-website-development', 'ui-ux-design'],
    summary:
      'A custom Next.js LMS that lifted course completion 40%, drove 2.3x video watch time, and now serves 18k active learners.',
    coverImage: '/images/portfolio/skillforge.png',
    coverAlt:
      'SkillForge Academy custom LMS dashboard on a laptop showing course progress, segmented video lessons, and learner analytics in a clean Next.js interface',
    challenge: [
      'SkillForge Academy sells cohort-based tech courses to working professionals, but its off-the-shelf LMS was working against it. Course creators fought a rigid plugin stack to build lessons, students bounced between a clunky portal and YouTube for supplementary video, and completion rates sat at 31% — far below the 60% the team promised partners. Every feature request meant buying another add-on, and the platform’s per-seat pricing climbed as enrollment grew.',
      'Video was the biggest leak: long, unbroken lectures averaged under four minutes of watch time before students dropped off. The academy needed adaptive dashboards that showed each learner exactly what to do next, a video pipeline that could handle 4K lessons without buffering, and assessment tooling that instructors could actually configure. Critically, the new platform had to migrate 12,000 existing students mid-semester with zero downtime and no lost progress.',
    ],
    solution: [
      'We architected a custom LMS on Next.js and Node.js with PostgreSQL as the source of truth, designing the data model around cohorts, mastery tracking, and prerequisite-aware learning paths. Each learner lands on an adaptive dashboard that surfaces the next lesson, pending assignments, and streak progress, while instructors get cohort heatmaps that flag struggling students days before they churn. Tailwind CSS kept the interface consistent as our team shipped weekly.',
      'We rebuilt the video experience on Mux: lessons are split into 6-10 minute segments with chapter markers, auto-generated transcripts, and playback at up to 2x speed, all behind an adaptive-bitrate player that survives poor connections. Stripe powers course subscriptions and team seats, and we migrated all 12,000 students over two weekends with dry-run rehearsals and dual-write verification. The platform has held 99.95% uptime across its first year in production.',
    ],
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'Mux', 'Tailwind CSS'],
    results: [
      { metric: '18k', label: 'Active learners on the platform' },
      { metric: '+40%', label: 'Course completion rate' },
      { metric: '2.3x', label: 'Average video watch time' },
      { metric: '99.95%', label: 'Uptime over 12 months' },
    ],
    showcase: [
      {
        title: 'Adaptive Learner Dashboards',
        blurb:
          'Every student sees the next lesson, pending assignments, and streak progress on one screen, removing the ‘what do I do now?’ drop-off point.',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: 'Segmented Video on Mux',
        blurb:
          'Lessons broken into 6-10 minute chapters with transcripts and adaptive bitrate playback more than doubled average watch time to 2.3x baseline.',
        gradient: 'from-teal-500 to-emerald-700',
      },
      {
        title: 'Instructor Cohort Heatmaps',
        blurb:
          'Cohort heatmaps flag struggling students days before they churn, letting instructors intervene with targeted feedback while a course is still running.',
        gradient: 'from-amber-400 to-orange-500',
      },
      {
        title: 'Zero-Downtime Migration',
        blurb:
          'Dual-write rehearsals moved 12,000 enrolled students mid-semester over two weekends with no lost progress and no visible interruption for learners.',
        gradient: 'from-lime-400 to-emerald-500',
      },
    ],
    testimonialId: 't8',
    metaTitle: 'SkillForge Academy — Custom Website Development Case Study | Developers3',
    metaDescription:
      'How Developers3 replaced SkillForge Academy’s off-the-shelf LMS with a custom Next.js platform: 18k active learners, 40% more completions, 99.95% uptime.',
  },
  {
    slug: 'crema-coffee',
    title: 'Crema Coffee Co.: A WooCommerce Subscription Store With 92% Revenue Growth',
    client: 'Crema Coffee Co.',
    category: 'ecommerce',
    industry: 'Food & Beverage (D2C)',
    services: ['ecommerce-development', 'seo-services'],
    summary:
      'A WooCommerce replatform with flavor quiz and subscription UX that grew Crema’s subscription revenue 92% and conversion to 5.8%.',
    coverImage: '/images/portfolio/crema-coffee.png',
    coverAlt:
      'Crema Coffee Co. WooCommerce subscription store on a laptop showing single-origin coffee bags, the flavor finder quiz, and a streamlined checkout',
    challenge: [
      'Crema Coffee Co. roasts single-origin beans for a direct-to-consumer audience, but its aging WooCommerce store was throttling growth. The theme took six seconds to load on mobile, the checkout buried shipping costs until the final step, and subscriptions ran through a plugin that customers found impossible to pause, skip, or edit. Support inboxes filled with cancellation requests that were really just cries for flexibility.',
      'New visitors faced a wall of 40+ coffee bags with no guidance, so first-time conversion sat at 3.1% while paid traffic costs rose. There was no email lifecycle beyond a receipt, no SEO structure targeting ‘best coffee subscription’ queries, and no way to know which blends drove repeat purchases. Crema needed a storefront that could sell subscriptions confidently without sacrificing the one-time gift shoppers who fed its top of funnel.',
    ],
    solution: [
      'We rebuilt the store on WooCommerce with a performance-first WordPress theme, cutting mobile load times to 1.9 seconds and surfacing shipping costs from the first step of checkout. A flavor finder quiz matches drinkers to blends through five questions about roast, brew method, and taste preferences, then drops them into a pre-filled subscription recommendation. Stripe handles billing with saved cards, and every subscription now ships with a self-service portal.',
      'Subscribers can skip, swap, pause, or delay in two clicks — flexibility that cut involuntary churn and turned cancellations into schedule changes. Klaviyo flows now welcome, educate, and win back: a post-purchase brewing guide series, a replenishment reminder tuned to each plan’s cadence, and a lapsed-subscriber offer. On the acquisition side, our SEO team built collection and brewing-guide content targeting subscription and origin keywords, tracked end to end in GA4.',
    ],
    techStack: ['WooCommerce', 'WordPress', 'Stripe', 'Klaviyo', 'Mailchimp', 'GA4'],
    results: [
      { metric: '+92%', label: 'Subscription revenue growth' },
      { metric: '+45%', label: 'Repeat purchase rate' },
      { metric: '5.8%', label: 'Conversion rate, up from 3.1%' },
      { metric: '+12%', label: 'Average order value' },
    ],
    showcase: [
      {
        title: 'Flavor Finder Quiz',
        blurb:
          'Five questions on roast, brew method, and tasting notes match each visitor to a blend and pre-fill a subscription recommendation with the right grind and cadence.',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: 'Self-Service Subscriptions',
        blurb:
          'Skip, swap, pause, and delay take two clicks in a customer portal, turning would-be cancellations into schedule changes and lifting repeat purchases 45%.',
        gradient: 'from-teal-500 to-emerald-700',
      },
      {
        title: 'Lifecycle Email in Klaviyo',
        blurb:
          'Welcome, brewing-guide, replenishment, and win-back flows run on autopilot in Klaviyo, with Mailchimp archives and GA4 events tying email to revenue.',
        gradient: 'from-amber-400 to-orange-500',
      },
      {
        title: '1.9-Second Mobile Store',
        blurb:
          'A performance-first WooCommerce theme cut mobile load times to 1.9 seconds and pushed conversion from 3.1% to 5.8% across the whole catalog.',
        gradient: 'from-lime-400 to-emerald-500',
      },
    ],
    metaTitle: 'Crema Coffee Co. — Ecommerce Development Case Study | Developers3',
    metaDescription:
      'How Developers3 rebuilt Crema Coffee Co.’s WooCommerce store for subscriptions: 92% subscription revenue growth, 5.8% conversion, and 45% repeat purchases.',
  },
  {
    slug: 'urban-bloom',
    title: 'Urban Bloom: A Full-Funnel Growth Engine With 5.2x ROAS',
    client: 'Urban Bloom',
    category: 'marketing',
    industry: 'Home & Garden (D2C)',
    services: ['seo-services', 'google-ads-management', 'social-media-marketing'],
    summary:
      'Full-funnel SEO, Google Shopping, and UGC social campaigns that took Urban Bloom to 5.2x ROAS and cut CPA by 38%.',
    coverImage: '/images/portfolio/urban-bloom.png',
    coverAlt:
      'Urban Bloom D2C plant store marketing dashboard showing Google Ads ROAS, organic traffic growth, and an Instagram UGC content grid',
    challenge: [
      'Urban Bloom sells houseplants, planters, and care kits direct to consumers, and it was burning cash trying to grow. Google Ads returned just 2.1x ROAS with costs per acquisition climbing past profitable levels, while the website ranked for almost nothing beyond its own brand name. The Instagram account posted sporadically — product photos on white backgrounds — and had stalled at 9,000 followers, generating neither community nor sales.',
      'The category is crowded: big-box retailers and VC-funded startups bid on the same ‘buy plants online’ terms, so paid-only growth was a losing race. Urban Bloom needed an organic engine — care guides, plant-finder content, and collection pages that could rank — plus tightly structured Shopping campaigns that fed search demand instead of fighting it. Everything had to be measured properly in GA4, because the team couldn’t tell which channels actually drove subscriptions to its plant club.',
    ],
    solution: [
      'We started with an Ahrefs-driven keyword and gap analysis, then built an SEO content engine: 60 care guides and plant-finder pages targeting ‘low light plants’, ‘pet safe plants’, and similar high-intent queries, all interlinked with optimized collection pages. On the paid side, we restructured Google Ads into intent-matched Shopping and Performance Max campaigns with feed optimization, negative keywords, and bid strategies tied to margin rather than revenue alone.',
      'For social, we built a UGC-driven content calendar in Meta Business Suite — styling videos, repotting demos, and customer shelf tours — produced with creators and templated in Canva for daily posting. GA4 events tie every channel to revenue, so budget shifts weekly toward what converts, and Klaviyo captures organic and social traffic into post-purchase flows. Within 90 days organic sessions had tripled and paid efficiency had flipped from 2.1x to 5.2x ROAS.',
    ],
    techStack: ['Google Ads', 'GA4', 'Ahrefs', 'Meta Business Suite', 'Klaviyo', 'Canva'],
    results: [
      { metric: '5.2x', label: 'Return on ad spend' },
      { metric: '-38%', label: 'Cost per acquisition' },
      { metric: '+270%', label: 'Organic session growth' },
      { metric: '14k', label: 'New Instagram followers in 90 days' },
    ],
    showcase: [
      {
        title: 'SEO Content Engine',
        blurb:
          'Sixty interlinked care guides and plant-finder pages target high-intent queries like ‘pet safe plants’ and ‘low light plants’, driving 270% organic session growth.',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: 'Restructured Shopping Campaigns',
        blurb:
          'Feed optimization, margin-aware bidding, and intent-matched campaign structure lifted return on ad spend from 2.1x to 5.2x while cutting CPA by 38%.',
        gradient: 'from-teal-500 to-emerald-700',
      },
      {
        title: 'UGC Social Calendar',
        blurb:
          'Creator styling videos, repotting demos, and shelf tours templated in Canva keep daily posts flowing, adding 14k Instagram followers in 90 days.',
        gradient: 'from-amber-400 to-orange-500',
      },
      {
        title: 'Revenue-Tracked GA4 Reporting',
        blurb:
          'GA4 events tie every channel to real revenue, so budgets shift weekly toward what converts and the plant club keeps a filled funnel.',
        gradient: 'from-rose-400 to-orange-400',
      },
    ],
    testimonialId: 't7',
    metaTitle: 'Urban Bloom — SEO, Google Ads & Social Case Study | Developers3',
    metaDescription:
      'How Developers3 grew Urban Bloom with SEO, Google Shopping, and UGC social: 5.2x return on ad spend, 38% lower CPA, and 270% more organic sessions.',
  },
];
