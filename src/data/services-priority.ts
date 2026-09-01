import type { Service } from '@/lib/types';

// Task 2-a — Priority service pages (development category, batch 1 of 2).
// Copy written for SEO depth: primary keyword in H1 + meta, secondary keywords
// woven through offerings and FAQs. Cross-references per worklog contract.

export const servicesPriority: Service[] = [
  {
    slug: 'custom-website-development',
    name: 'Custom Website Development',
    shortName: 'Custom Websites',
    icon: 'code',
    category: 'development',
    tagline: 'Bespoke websites built to convert — engineered for speed, SEO and measurable growth from day one.',
    primaryKeyword: 'custom website development services',
    secondaryKeywords: [
      'bespoke website design',
      'next.js development agency',
      'react website development',
      'website development for startups',
      'custom landing page development',
    ],
    metaTitle: 'Custom Website Development Services | Developers3',
    metaDescription: 'Custom website development services that turn traffic into revenue. Senior team, fixed quotes, on-time delivery. Get a free, no-pressure quote today.',
    heroTitle: 'Custom Website Development Services That Turn Visitors Into Customers',
    heroSub: 'We design and build bespoke websites for companies that outgrow templates. Senior developers, fixed quotes, weekly demos and launch dates we actually hit — that is how Developers3 delivers websites that earn their keep.',
    idealFor: 'Ideal for growing businesses that need a website tailored to their sales process, not a template squeezed to fit.',
    offerings: [
      {
        title: 'Custom Design & Front-End Build',
        description: 'Pixel-accurate builds from approved Figma designs: responsive layouts, motion and micro-interactions, accessible components and a design system your team can extend. Every page ships at 90+ Lighthouse scores on mobile, so speed never costs you rankings or leads.',
      },
      {
        title: 'Next.js & React Engineering',
        description: 'Server-side rendering, static generation and edge deployment on a modern stack. We structure your site around clean component architecture and typed APIs, so new pages, integrations and A/B tests ship in days rather than sprint-sized projects.',
      },
      {
        title: 'CMS & Content Editing',
        description: 'A headless or lightweight CMS wired to your content model, so marketing publishes landing pages and case studies without developer tickets. Roles, previews, scheduling and reusable blocks come standard — no more begging engineering to change a headline.',
      },
      {
        title: 'Integrations & Automation',
        description: 'CRMs, payment gateways, booking systems, analytics and marketing tools connected end to end. We map each lead from first click to closed deal, then automate the handoffs — form fills that route, score and notify the right person instantly.',
      },
      {
        title: 'Technical SEO & Performance Pass',
        description: 'Schema markup, semantic HTML, Core Web Vitals tuning, XML sitemaps and redirect maps launched alongside your site. We bake search visibility into the build instead of bolting it on later, so rankings start compounding from launch week.',
      },
    ],
    whyTitle: 'Why Businesses Choose Custom Development Over Templates',
    whyIntro: 'Templates are fast to install and slow to grow with. The moment you need custom logic, better speed or a checkout that matches your sales process, you pay for workarounds instead of progress. A custom build costs more up front and less over its lifetime: no plugin licences, no theme bloat, no rebuild every two years. Our clients typically see faster load times, higher conversion rates and lower maintenance bills within the first quarter after launch.',
    whyBenefits: [
      {
        title: 'Conversion-first architecture',
        description: 'Every layout decision starts from your conversion goal, not from a theme demo. Wireframes are tested against real user paths before a single component is coded, and clients typically lift enquiry rates by 25-60% after relaunch because the site finally guides visitors instead of merely displaying information.',
      },
      {
        title: 'Speed that search engines reward',
        description: 'We ship 90+ Lighthouse scores as standard: code-split bundles, optimised images, edge caching and font loading tuned on real devices, not lab tools. Sub-second loads cut mobile bounce rates sharply, and Core Web Vitals stop being the reason your Google rankings plateau while competitors climb past you.',
      },
      {
        title: 'Code you actually own',
        description: 'Full source code, documentation and infrastructure access transfer to you at handover — no proprietary page builder, no licence renewals, no hostage situations. Any competent developer can extend what we build, which keeps your future quotes honest and your maintenance bills predictable year after year, guaranteed by contract.',
      },
      {
        title: 'Security and stability by default',
        description: 'Typed code, automated tests, dependency scanning and staging-to-production pipelines are part of every engagement, not a premium tier. You receive uptime reports, scheduled patches and a documented recovery plan, so a traffic spike or a failed update never turns into a Monday morning emergency for your team again.',
      },
      {
        title: 'A build that scales with the business',
        description: 'Adding a pricing calculator, a second language or a partner portal should be a sprint, not a re-platform. Our component architecture and clean data layer mean new capabilities bolt on cleanly, so the website you launch today still fits where the company lands in three years.',
      },
    ],
    process: [
      {
        title: 'Discovery & Fixed Quote',
        description: 'A structured workshop maps your goals, users and content, then we price the whole build as a fixed sum with a written scope. No hourly guesswork: you approve one number, one timeline and one accountable senior team before work begins.',
      },
      {
        title: 'UX & Interface Design',
        description: 'Wireframes validate structure, then high-fidelity designs are produced in Figma and reviewed on real devices. Two structured revision rounds are included, so stakeholders sign off confident about exactly what the finished site will look like before development starts.',
      },
      {
        title: 'Development in Weekly Sprints',
        description: 'Engineers build in one-week sprints with a live staging link from day one. You review progress every Friday, test features as they land and give feedback where it is cheapest to act on — never in a big reveal at the end.',
      },
      {
        title: 'QA, SEO & Hardening',
        description: 'Cross-browser testing, accessibility checks, Core Web Vitals audits, schema markup and 301 redirect maps happen before launch, not after. We load-test forms and integrations too, so the first real visitor gets the same flawless experience the staging site did.',
      },
      {
        title: 'Launch, Training & Handover',
        description: 'We deploy on your domain, monitor the first 30 days of analytics and train your team on the CMS with recorded sessions. Full documentation, source code and credentials hand over with the final invoice — you own everything, outright.',
      },
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Vercel', 'Figma'],
    caseStudySlugs: ['meridian-dental', 'vantage-realty', 'skillforge'],
    startingPrice: '$1,499',
    pricingNote: 'Starting prices cover a five-page bespoke design and build with CMS, on-page SEO and analytics; visit our pricing page for full package inclusions, tiers and monthly care plans.',
    testimonialIds: ['t2', 't8'],
    faqs: [
      {
        question: 'How much does a custom website cost?',
        answer: 'Most custom builds at Developers3 start at $1,499 for a focused marketing site and range to $8,500+ for large, integration-heavy platforms. The price is fixed after a discovery workshop and covers design, development, CMS, on-page SEO and launch support. You approve the number before we write a line of code, and mid-project invoices never change — that is the point of a fixed quote.',
      },
      {
        question: 'How long does a custom website take to build?',
        answer: 'A typical five-to-ten page site goes live in four to six weeks; larger platforms with integrations run eight to twelve. The clock starts at the design kickoff and includes two revision rounds, QA and launch. Weekly Friday demos mean you see real progress every week rather than waiting months for a reveal — and if anything threatens the date, you hear it from us first.',
      },
      {
        question: 'Do I own the website and source code?',
        answer: 'Completely. Every engagement ends with a handover pack containing full source code, design files, documentation and all account credentials. There is no proprietary page builder or licence holding you to us — the stack is industry-standard Next.js and React, so any competent developer can maintain or extend the site. Some clients keep us on a care plan; it is a choice, never a lock-in.',
      },
      {
        question: 'What technology do you build websites with?',
        answer: 'Our default stack is Next.js and React with TypeScript, styled with Tailwind CSS and deployed to Vercel for speed and reliability. Content is managed through a headless CMS chosen to fit your team — headless WordPress, Sanity or a lightweight option. We pick tools per project, not per habit, and we will tell you plainly if WordPress or Shopify suits your needs better than a custom build.',
      },
      {
        question: 'How involved do I need to be during the build?',
        answer: 'Plan on roughly two to three hours a week. That covers a kickoff workshop, one Friday demo call and async feedback on staging. We handle the rest — copy polish, image optimisation, technical SEO and testing. Clients who skip feedback weeks still get the full demo recording and a consolidated decision list, so momentum never stalls waiting on a calendar slot.',
      },
      {
        question: 'Why choose Developers3 over a freelance developer or a template?',
        answer: 'You get a senior team — strategist, designer, two engineers and a QA lead — for a fixed price and a date we commit to in writing. Freelancers are brilliant for small jobs but rarely cover design, SEO, testing and support in one pair of hands. And unlike templates, everything is built around your sales process. Our case studies show the difference in numbers: faster loads, higher conversion, fewer maintenance surprises.',
      },
    ],
    relatedServiceSlugs: ['ui-ux-design', 'seo-services', 'website-maintenance'],
  },
  {
    slug: 'wordpress-development',
    name: 'WordPress Development',
    shortName: 'WordPress',
    icon: 'wordpress',
    category: 'development',
    tagline: 'Custom WordPress builds, WooCommerce stores and care plans — fast, secure and genuinely easy for your team to edit.',
    primaryKeyword: 'wordpress development company',
    secondaryKeywords: [
      'woocommerce development services',
      'custom wordpress theme',
      'wordpress maintenance and support',
      'headless wordpress',
      'wordpress speed optimization',
    ],
    metaTitle: 'WordPress Development Company | Developers3',
    metaDescription: 'A WordPress development company that builds custom themes, WooCommerce stores and care plans — fast, secure, easy to edit. Get a fixed quote today.',
    heroTitle: 'A WordPress Development Company That Builds Sites You Can Actually Run',
    heroSub: 'We build custom WordPress themes, WooCommerce stores and headless front-ends that load fast and stay secure. Fixed quotes, no plugin bloat, and a dashboard your marketing team will genuinely enjoy using every day.',
    idealFor: 'Ideal for content-driven businesses, publishers and stores that want the world’s most popular CMS without the typical mess of plugins and page bloat.',
    offerings: [
      {
        title: 'Custom Theme Development',
        description: 'Hand-coded themes built on Timber or classic PHP — no bloated multi-purpose frameworks. Each template maps to your design exactly, passes Core Web Vitals and gives editors reusable, locked-down blocks so pages stay on-brand even when three different people publish weekly.',
      },
      {
        title: 'WooCommerce Stores',
        description: 'Product catalogues, variable pricing, shipping zones, tax rules and payment gateways configured end to end. We optimise checkout for conversions, connect your ERP or fulfilment tools and make sure a thousand-product store still loads in under two seconds on mobile.',
      },
      {
        title: 'Headless WordPress',
        description: 'Keep the editor your team knows; serve the front end from Next.js for app-level speed. We wire the WP REST or GraphQL API into a modern front end, so you get WordPress content workflows with static-site performance and none of the theme overhead.',
      },
      {
        title: 'Migrations & Rescue Projects',
        description: 'Moving from Wix, Squarespace, Drupal or an abandoned agency build? We migrate content, preserve URLs and rankings, then rebuild on a clean, documented stack. Rescue projects get a full audit first, so you know exactly what to keep and what to retire.',
      },
      {
        title: 'WordPress Care Plans',
        description: 'Monthly updates, uptime monitoring, daily off-site backups, malware scanning and a monthly performance report with real human commentary. Emergency response is included: if something breaks, a senior engineer is on it within hours, not after a ticket queue and a questionnaire.',
      },
    ],
    whyTitle: 'Why Our WordPress Sites Outperform Off-the-Shelf Themes',
    whyIntro: 'Anyone can install a theme; far fewer can make WordPress genuinely fast, secure and pleasant to run. We build lean: a curated plugin list, version-controlled code, staging deployments and caching tuned per site — not a generic optimisation plugin. The result is a site your team can edit confidently, Google can crawl easily and your budget can sustain. Most care-plan clients spend less per year than they previously paid for a single emergency rescue.',
    whyBenefits: [
      {
        title: 'Speed scores that survive updates',
        description: 'We hand-tune caching, image pipelines and database queries per site, then re-test after every major WordPress release. Clients commonly hold 90+ PageSpeed scores on mobile for years after launch, which keeps bounce rates low, lifts ad Quality Scores and protects the Google rankings you have already invested in building.',
      },
      {
        title: 'Editors who do not need us',
        description: 'Custom Gutenberg blocks match your design system exactly, with sensible defaults and guardrails against off-brand layouts. Marketing publishes landing pages, posts and case studies without touching a developer, which typically cuts content turnaround from days to under an hour — and removes the maintenance ticket queue entirely.',
      },
      {
        title: 'Security that is boring, on purpose',
        description: 'Hardened logins, two-factor authentication, role-based access, a minimal plugin footprint and daily off-site backups come standard on every site we ship. Our managed sites have run for years without a single successful intrusion, because most WordPress hacks target exactly the sloppy configurations and abandoned plugins we refuse to install in the first place.',
      },
      {
        title: 'SEO-ready from the database up',
        description: 'Clean semantic templates, schema markup, fast server responses and disciplined URL structures give SEO teams everything they ask for. Clients migrating from bloated page-builder sites routinely recover lost rankings within eight weeks, then go on to outrank their previous best positions because crawl budget and load speed finally work in their favour.',
      },
      {
        title: 'Costs that stay predictable',
        description: 'Fewer plugins mean fewer licence renewals, fewer conflicts and fewer surprise repair bills. Care-plan clients pay one flat monthly fee covering updates, backups, monitoring and small improvements, so budgeting is trivial and the average annual spend lands well below a single emergency rescue project with a previous agency.',
      },
    ],
    process: [
      {
        title: 'Audit & Roadmap',
        description: 'For new builds we audit your goals, content and competitors; for rescue projects we run a full technical teardown — plugins, database, security, speed. Either way you get a written scope with a fixed price before anyone writes code.',
      },
      {
        title: 'Design & Template Mapping',
        description: 'Designs are produced in Figma against your brand, then mapped screen by screen onto WordPress templates and custom blocks. You approve every template on real devices before development, so surprises at handover simply cannot happen.',
      },
      {
        title: 'Build & Content Load-In',
        description: 'We code the theme, configure WooCommerce if needed and migrate your existing content with redirects intact. Staging links go live in week one, and you test real pages — not screenshots — while changes are still cheap to make.',
      },
      {
        title: 'Hardening & Performance',
        description: 'Security hardening, caching layers, CDN setup, image pipelines and database optimisation happen before launch. We run penetration basics, load tests and a full PageSpeed audit, then hand you the before-and-after numbers in plain language.',
      },
      {
        title: 'Launch & Editor Training',
        description: 'We deploy, submit sitemaps and monitor search console for the first month. Your editors get a recorded training session plus a written guide to the custom blocks, so publishing stays consistent long after launch day is forgotten.',
      },
    ],
    technologies: ['WordPress', 'WooCommerce', 'ACF Pro', 'PHP', 'MySQL', 'Cloudflare', 'Yoast SEO', 'Elementor'],
    caseStudySlugs: ['vantage-realty', 'crema-coffee'],
    startingPrice: '$649',
    pricingNote: 'Starting prices cover a lean custom WordPress build with up to five templates, core SEO setup and editor training; see the pricing page for WooCommerce, care-plan and migration package details.',
    testimonialIds: ['t3'],
    faqs: [
      {
        question: 'How much does a custom WordPress website cost?',
        answer: 'Custom WordPress builds start at $649 for a lean marketing site with up to five templates. WooCommerce stores and headless builds typically range from $2,000 to $6,000 depending on catalogue size and integrations. Every quote is fixed after a scoping call and includes design, development, SEO setup and editor training — no hourly meter running in the background.',
      },
      {
        question: 'How long does a WordPress build take?',
        answer: 'A standard five-template site ships in three to four weeks. WooCommerce stores usually take five to eight weeks depending on product count, shipping complexity and migration work. You will see a staging link in the first week and review progress weekly, so the timeline never depends on one big reveal at the end.',
      },
      {
        question: 'Can you work with my existing WordPress site?',
        answer: 'Often, yes — it depends on what is underneath. We start with a paid audit covering plugins, database health, security and speed. If the foundation is sound we rebuild or extend in place; if it is beyond saving we migrate content and rankings to a clean rebuild. Either way you get the findings in writing before committing to the bigger project.',
      },
      {
        question: 'Will my team be able to edit the site themselves?',
        answer: 'That is the whole point of choosing WordPress, so yes. We build custom Gutenberg blocks matched to your design, with locked layouts and sensible defaults that make off-brand pages impossible. Editors get a recorded training session and a written guide. Most of our clients publish everything — pages, posts, products and landing pages — without ever filing a developer ticket.',
      },
      {
        question: 'Is WordPress actually secure and scalable?',
        answer: 'WordPress powers over forty percent of the web, and the horror stories come from abandoned plugins and lazy hosting — not the core. We ship hardened logins, two-factor authentication, curated plugin lists, daily backups and managed updates on every project. That configuration has kept our managed clients intrusion-free for years, and caching plus CDN keeps sites stable under real traffic spikes.',
      },
      {
        question: 'What is the difference between you and a cheap theme developer?',
        answer: 'Cheap theme work means installing a $60 template, changing logos and leaving you with slow, bloated code you cannot safely modify. We hand-code custom themes around your brand and content model, keep the plugin list lean, and stand behind the result with care plans and SLAs. The upfront difference pays for itself within the first year of lower maintenance and better conversion.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'ecommerce-development', 'website-maintenance'],
  },
  {
    slug: 'ecommerce-development',
    name: 'E-commerce Website Development',
    shortName: 'E-commerce',
    icon: 'cart',
    category: 'development',
    tagline: 'Online stores engineered to sell — fast catalogues, frictionless checkout and integrations that keep orders flowing to fulfilment.',
    primaryKeyword: 'ecommerce website development company',
    secondaryKeywords: [
      'shopify development services',
      'woocommerce store design',
      'ecommerce seo',
      'stripe payment integration',
      'online store redesign',
    ],
    metaTitle: 'E-commerce Website Development Company | Developers3',
    metaDescription: 'An ecommerce website development company building fast, conversion-focused Shopify and WooCommerce stores. Fixed quotes, senior team — ask for yours today.',
    heroTitle: 'An E-commerce Website Development Company Built Around Your Revenue',
    heroSub: 'We build Shopify, WooCommerce and headless stores that load in under two seconds, check out in three taps and plug straight into your shipping, payments and email tools. Fixed quotes, senior engineers, revenue-first thinking.',
    idealFor: 'Ideal for retailers and D2C brands that need a store which converts traffic profitably and scales through peak season without melting down.',
    offerings: [
      {
        title: 'Shopify & Shopify Plus Builds',
        description: 'Theme development, app integrations, subscription logic, B2B pricing and multi-market setup on Shopify and Plus. We customise Liquid to match your brand exactly, keep third-party apps to a disciplined minimum and protect checkout speed, so the platform serves you instead of charging you for bloat.',
      },
      {
        title: 'WooCommerce & Headless Commerce',
        description: 'For teams needing full control of data and margins, we build WooCommerce stores or headless Next.js front-ends over commerce APIs. You get custom checkout flows, complex product rules and lightning-fast category pages that stock themes simply cannot deliver.',
      },
      {
        title: 'Conversion-Focused UX',
        description: 'Product pages, category filtering, search and checkout are designed from real shopping behaviour, not guesswork. We instrument analytics from day one, run structured A/B tests on the biggest revenue levers and typically lift conversion rates 30-80% within the first two quarters.',
      },
      {
        title: 'Payments, Shipping & Fulfilment Integrations',
        description: 'Stripe, PayPal, Apple Pay and BNPL providers wired in cleanly, with shipping carriers, 3PLs, tax automation and inventory syncing behind them. Orders flow to fulfilment without manual rekeying, refunds reconcile automatically and reconciliation reports land in your inbox without an accountant chasing them.',
      },
      {
        title: 'E-commerce SEO & Data Layer',
        description: 'Structured product schema, crawlable faceted navigation, clean URL logic and a GA4 event layer that shows revenue per channel and per product. These foundations compound: clients routinely see organic revenue become their largest channel within a year of relaunch.',
      },
    ],
    whyTitle: 'Why Stores Built by Developers3 Sell More',
    whyIntro: 'Most stores do not lose money on marketing; they lose it between the product page and the thank-you page. Slow category grids, clunky mobile checkouts and missing integrations quietly tax every session you paid for. We build stores where the revenue path is engineered deliberately: speed budgets on every template, checkout tested with real cards and real addresses, and analytics granular enough to show exactly which change moved the number. That discipline is the difference between a pretty shop and a profitable one.',
    whyBenefits: [
      {
        title: 'Higher conversion per session',
        description: 'Every template is built against a revenue hypothesis: what the visitor should feel, read and click. Post-launch clients typically convert 30-80% more of the same traffic, which means your ad budget finally works at the efficiency your media buyer promised in the pitch deck, not less.',
      },
      {
        title: 'Sub-two-second storefronts',
        description: 'We enforce speed budgets on every template and test on throttled mid-range phones, because that is where most of your revenue happens. Stores loading in under two seconds consistently show lower bounce, higher pages per session and materially better paid-traffic Quality Scores across Google and Meta.',
      },
      {
        title: 'Operations that run themselves',
        description: 'Orders, inventory, shipping, refunds and email flows connect automatically to the tools you already use. Clients typically save fifteen to twenty hours a week of copy-paste admin in the first month alone — hours that go into buying, content and customer care instead of spreadsheets and sticky notes.',
      },
      {
        title: 'Peak-season reliability',
        description: 'Black Friday is a load test you cannot skip, so we rehearse it: caching strategies, queue protection, load testing and a rollback plan before traffic arrives. Our stores have taken ten-times-normal traffic without a minute of downtime, which is why several clients came to us after one crashed holiday.',
      },
      {
        title: 'Data you can act on',
        description: 'A proper GA4 event layer and clean product analytics show revenue by channel, product and cohort — not vanity sessions. That visibility typically reveals one or two quick wins worth thousands per month, and it makes every future marketing dollar easier to justify to whoever signs the cheques.',
      },
    ],
    process: [
      {
        title: 'Commerce Audit & Fixed Quote',
        description: 'We review your catalogue, unit economics, current platform and analytics, then map the gaps against revenue. You receive a fixed-price proposal with a launch date — and an honest answer about whether Shopify, WooCommerce or a headless build fits best.',
      },
      {
        title: 'UX & Revenue Mapping',
        description: 'We wireframe the core journey — landing, category, product, cart, checkout — and define the metrics each step must move. Designs are signed off in Figma with real product data, so you approve a store, not a mood board.',
      },
      {
        title: 'Build & Migration',
        description: 'Templates, apps and integrations are built while your products, customers and order history migrate with URLs preserved. Weekly staging reviews let you shop the real store as it grows, and catalogue integrity is verified line by line before launch.',
      },
      {
        title: 'Payments & Load Testing',
        description: 'We run every payment method through live-mode transactions, test refunds and failed-card paths, then load-test checkout against a simulated Black Friday spike. Nothing goes live until the edge cases — address mismatches, 3D Secure, partial refunds — behave exactly as designed.',
      },
      {
        title: 'Launch, Training & Growth Loop',
        description: 'We launch, monitor search console and revenue dashboards daily for the first month, then hand over documented training for your team. Optional growth sprints keep testing conversion levers each month, so the store keeps compounding instead of freezing on launch day.',
      },
    ],
    technologies: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Klaviyo', 'Next.js', 'Algolia', 'ShipStation'],
    caseStudySlugs: ['lumina-boutique', 'crema-coffee'],
    startingPrice: '$1,999',
    pricingNote: 'Starting prices cover a complete storefront build with design, product catalogue setup, payment and shipping integrations; see the pricing page for platform options, migration packages and growth sprint details.',
    testimonialIds: ['t1'],
    faqs: [
      {
        question: 'How much does an ecommerce website cost?',
        answer: 'Complete stores start at $1,999 on Shopify or WooCommerce. The biggest price drivers are catalogue size, migration complexity, custom checkout logic and integrations with ERP, 3PL or subscription tools. Most projects land between $2,500 and $8,000, and every quote is fixed after an audit — including design, build, migration, QA and launch, with no per-hour surprises afterwards.',
      },
      {
        question: 'Should I choose Shopify, WooCommerce or a custom build?',
        answer: 'It depends on where your margin lives. Shopify wins on speed to launch, app ecosystem and low operations overhead; WooCommerce wins on data ownership, content flexibility and zero transaction fees; headless wins when you need custom experiences at serious scale. We model the three-year cost of each option against your catalogue and team, then recommend one with the reasoning in writing.',
      },
      {
        question: 'Will my SEO rankings survive a platform migration?',
        answer: 'They should, if the migration is done properly — and this is where cheap rebuilds destroy businesses. We map every existing URL, preserve or redirect all of them, migrate metadata and structured data, and monitor Search Console daily for six weeks after launch. Recent migrations have recovered pre-launch rankings within four to eight weeks, and most go on to beat them.',
      },
      {
        question: 'Can you integrate with my existing systems?',
        answer: 'Almost certainly. We have connected stores to shipping carriers, 3PL warehouses, inventory systems, accounting tools, subscription engines and marketing platforms like Klaviyo. Where an off-the-shelf connector exists we use it; where none does, we build one. During scoping we list every integration, its cost and its risk, so nothing surfaces as a surprise invoice halfway through the project.',
      },
      {
        question: 'How do you improve conversion rates?',
        answer: 'First we measure: heatmaps, session recordings, funnel analytics and a checkout audit against current best practice. Then we fix the structural leaks — speed, mobile UX, trust signals, friction in shipping and payment steps — before micro-optimising with A/B tests. This sequence typically lifts conversion 30-80% on the same traffic, which is why we start with the store before touching your ad spend.',
      },
      {
        question: 'Who hosts and maintains the store after launch?',
        answer: 'Shopify handles hosting; self-hosted WooCommerce sites run on managed cloud infrastructure we configure, with staging environments and daily backups. Most clients take a care plan covering updates, security patches, monitoring and a monthly improvement budget. You own the store, the data and the customer records outright — our job is to keep the machine profitable, not to hold it hostage.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'wordpress-development', 'seo-services'],
  },
  {
    slug: 'software-development',
    name: 'Custom Software Development',
    shortName: 'Custom Software',
    icon: 'cpu',
    category: 'development',
    tagline: 'Web applications, internal tools and platforms built to replace the spreadsheets that are quietly running your business.',
    primaryKeyword: 'custom software development company',
    secondaryKeywords: [
      'web application development',
      'saas product development',
      'api development services',
      'legacy system modernization',
      'business process automation software',
    ],
    metaTitle: 'Custom Software Development Company | Developers3',
    metaDescription: 'Custom software development company for web apps, portals and internal platforms. Senior engineers, fixed milestones, code you own. Book a scoping call.',
    heroTitle: 'A Custom Software Development Company That Ships Working Products',
    heroSub: 'We design, build and maintain web applications, customer portals and internal platforms with senior engineers and fixed milestones. You get working software every two weeks, transparent pricing and documentation that outlives the project.',
    idealFor: 'Ideal for operations-heavy companies and funded startups whose off-the-shelf tools have become the bottleneck instead of the solution.',
    offerings: [
      {
        title: 'SaaS Product Development',
        description: 'Multi-tenant architecture, subscription billing, role-based access and usage analytics — the unglamorous foundations that decide whether a SaaS product can scale. We build the first version you can sell, then iterate against real customer behaviour rather than a static specification.',
      },
      {
        title: 'Customer & Partner Portals',
        description: 'Secure portals for orders, documents, support and self-service account management, integrated with your existing CRM and ERP. Clients typically deflect 40-60% of routine support and order-status enquiries within three months of launch — and their customers notice the difference immediately.',
      },
      {
        title: 'Internal Tools & Workflow Automation',
        description: 'We replace spreadsheet-and-email processes with purpose-built tools: approval chains, scheduling engines, quoting calculators, reporting dashboards. The measurable outcome is usually the same — thousands of staff hours a year reclaimed from copy-paste work that software should have done a decade ago.',
      },
      {
        title: 'API Development & Integrations',
        description: 'Well-documented REST and GraphQL APIs that connect your product to payment providers, logistics networks, marketplaces and AI services. Versioning, authentication, rate limiting and monitoring are designed in from the start, so partners integrate once and stay integrated.',
      },
      {
        title: 'Legacy Modernisation',
        description: 'We strangle old systems safely: audit the codebase, carve out modules incrementally and migrate data with zero-downtime cutovers. You keep the business running during the rebuild, retire the mainframe-era stack on your schedule and finally get features shipped in weeks, not quarters.',
      },
    ],
    whyTitle: 'Why Companies Build Software With Developers3',
    whyIntro: 'Off-the-shelf software optimises for the average customer; your operation is not average. The result is licence fees for features you never use and manual workarounds for the ones you actually need. We build the software your process deserves: scoped tightly, priced transparently, delivered in fortnightly increments you can see and tested against the metrics that made you commission it. Every codebase ships documented and owned outright by you — because a system nobody can leave safely is not an asset.',
    whyBenefits: [
      {
        title: 'Payback you can calculate',
        description: 'Before we write code we model the return: hours saved, error rates reduced, revenue unlocked. Most internal tools pay for themselves within twelve to eighteen months, and we put those assumptions in the proposal so you can hold the project to its numbers long after launch.',
      },
      {
        title: 'Software that fits the process',
        description: 'We map how your team actually works — exceptions, edge cases and all — before designing anything. The finished system matches reality instead of forcing staff into a generic workflow, which is why adoption rates on our internal tools routinely exceed ninety percent in the first month.',
      },
      {
        title: 'Senior engineers, not a bench',
        description: 'The people in the scoping call are the people who write the code — typically eight-plus years each. That continuity means fewer bugs, faster decisions and no knowledge lost to staff rotation, and it is why our projects rarely need the rescue phase other agencies quietly budget for.',
      },
      {
        title: 'Architecture that avoids lock-in',
        description: 'Standard frameworks, clean separation between product logic and infrastructure, and exportable data by design. You can host on AWS, switch providers or hand the codebase to another team without a rewrite — which keeps every future negotiation, with us or with anyone else, honest and anchored to delivered value.',
      },
      {
        title: 'Security and compliance built in',
        description: 'Role-based access, encrypted data at rest and in transit, audit logs and automated backups are default, not extras. For clients in finance, health and logistics we align builds with SOC 2 and GDPR requirements, and provide the documentation your auditors will actually ask for, not boilerplate.',
      },
    ],
    process: [
      {
        title: 'Scoping & Fixed Estimate',
        description: 'A structured discovery week maps workflows, users, integrations and success metrics. You receive an architecture outline, a phased roadmap and a fixed price for phase one — enough detail to start, without pretending we can foresee every requirement eighteen months out.',
      },
      {
        title: 'Architecture & Prototypes',
        description: 'We design the data model, system boundaries and integration contracts, then clickable prototypes validate flows with real users. Catching a wrong assumption at prototype stage costs hours; catching it after launch costs quarters — we have seen both, and only build the first way.',
      },
      {
        title: 'Fortnightly Build Sprints',
        description: 'Development runs in two-week sprints with demo sessions at the end of each. Every sprint ships tested, deployable software to a staging environment, so progress is measured in working features you can click — never in status reports you have to interpret.',
      },
      {
        title: 'Hardening & Pilot Launch',
        description: 'Load testing, penetration basics, access audits and a pilot group of real users before company-wide rollout. We instrument error tracking and performance monitoring from day one, so issues surface to us — with stack traces attached — before they surface to your staff.',
      },
      {
        title: 'Handover & Evolution',
        description: 'Full documentation, architecture decision records, runbooks and source code transfer to you. Most clients continue with a maintenance retainer and quarterly roadmap sessions, but the system is built so that any competent team can take it over — and we mean that.',
      },
    ],
    technologies: ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'Docker', 'AWS'],
    caseStudySlugs: ['northpay', 'atlas-logistics'],
    startingPrice: '$8,500',
    pricingNote: 'Starting prices cover a discovery workshop, architecture blueprint and the first build phase of a scoped web application; visit the pricing page for phase structures, retainers and support plan details.',
    testimonialIds: ['t2', 't4'],
    faqs: [
      {
        question: 'How much does custom software development cost?',
        answer: 'Scoped web applications and portals start at $8,500; multi-phase SaaS platforms typically range from $25,000 to $80,000 across a year. We price phase one as a fixed sum after a paid discovery week, then plan subsequent phases against what the first release taught us. You always know the cost of the next step before approving it — no open-ended hourly billing.',
      },
      {
        question: 'How long does a custom software project take?',
        answer: 'A focused internal tool typically reaches its first production release in six to ten weeks. Customer portals and SaaS MVPs run three to five months; complex platform modernisations are phased across quarters by design. Either way, you see working, testable software every two weeks from sprint three — long before the final release date arrives.',
      },
      {
        question: 'Who owns the intellectual property and source code?',
        answer: 'You do, fully and contractually. All code is written as work-for-hire under your engagement, stored in your repositories from day one, and handed over with documentation and architecture records. We use standard open-source components under permissive licences and disclose every third-party dependency, so there are no hidden licences, no proprietary runtimes and no exit barriers later.',
      },
      {
        question: 'Can you take over or fix our existing system?',
        answer: 'Usually, yes. We begin with a code audit — architecture quality, test coverage, security posture and deployment health — delivered as a written report with a remediation plan and fixed pricing. Some codebases are worth extending; some are honestly cheaper to rebuild around. We will tell you which, with evidence, even when the honest answer loses us the larger contract.',
      },
      {
        question: 'What technology stack do you use?',
        answer: 'TypeScript end to end: Node.js and NestJS or Express on the server, React on the front end, PostgreSQL with Prisma for data, Redis for caching and queues, Docker for portability and AWS for hosting. It is a deliberately boring, hiring-friendly stack — thousands of engineers know it, hosting is commodity-priced, and nothing depends on a single vendor staying in business.',
      },
      {
        question: 'How do you handle requirements that change mid-project?',
        answer: 'They always change — pretending otherwise is how software projects fail. Fixed-price phases absorb normal discovery; genuine scope changes are priced as small written change orders with time and cost impact stated before approval. Because you see working software fortnightly, course corrections happen at sprint boundaries while they are still cheap, not in a painful renegotiation at the end.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'mobile-app-development', 'ui-ux-design'],
  },
  {
    slug: 'mobile-app-development',
    name: 'Mobile App Development',
    shortName: 'Mobile Apps',
    icon: 'smartphone',
    category: 'development',
    tagline: 'iOS and Android apps built on one codebase — shipped to both stores, measured against retention, not just downloads.',
    primaryKeyword: 'mobile app development company',
    secondaryKeywords: [
      'flutter app development',
      'ios and android app development',
      'mvp app development',
      'app store optimization',
      'cross-platform app development',
    ],
    metaTitle: 'Mobile App Development Company | Developers3',
    metaDescription: 'A mobile app development company shipping iOS and Android apps from one Flutter codebase. Fixed milestones, store launch included. Get a free scoping call.',
    heroTitle: 'A Mobile App Development Company That Designs for Retention',
    heroSub: 'We design and build Flutter apps that feel native on iOS and Android, ship to both stores in one release cycle and come with analytics that show what users do next. Fixed milestones, senior engineers.',
    idealFor: 'Ideal for product teams and founders who need one codebase delivering a polished app on both app stores, without doubling the budget.',
    offerings: [
      {
        title: 'Flutter Cross-Platform Apps',
        description: 'One Dart codebase, native performance, pixel-consistent UI on iOS and Android. We use Flutter for most clients because it cuts build and maintenance costs roughly in half while still delivering the smooth sixty-frame-per-second feel users expect from fully native applications.',
      },
      {
        title: 'Native iOS & Android',
        description: 'When hardware access, platform-specific design or maximum performance demands it, we build native Swift and Kotlin apps. Typical cases: advanced camera pipelines, background processing, wearable integrations and fintech-grade security requirements that cross-platform frameworks handle awkwardly at best.',
      },
      {
        title: 'UX Design for Small Screens',
        description: 'Mobile UX is ruthless: one thumb, three seconds, zero patience. We prototype flows in Figma, test them with real users on real devices and cut every step that survives only on a designer’s monitor. The result is onboarding that finishes, not abandons.',
      },
      {
        title: 'Backend, APIs & Real-Time Features',
        description: 'Authentication, push notifications, offline sync, payments and chat — the server side that actually makes an app useful. We build scalable GraphQL or REST backends with Firebase or Node.js, so feature one ships as solidly as feature fifty will later.',
      },
      {
        title: 'Store Launch & ASO',
        description: 'We handle Apple and Google submissions, review guidelines, screenshots, metadata and release trains — including the rejections most first-time publishers hit. After launch, store optimization and crash monitoring keep ratings high while we tune keywords, creatives and conversion to installs.',
      },
    ],
    whyTitle: 'Why Clients Launch Apps With Developers3',
    whyIntro: 'The app stores are littered with beautifully designed apps that nobody opened a second time. Downloads are easy; retention is engineering. We build mobile products around the habit you want to create: onboarding measured in seconds, cold starts under two, offline behaviour that forgives bad connections and analytics that reveal the exact screen where users hesitate. That is how our clients’ apps keep thirty, sixty and ninety-day retention curves above the category norms their investors expect.',
    whyBenefits: [
      {
        title: 'One codebase, half the cost',
        description: 'Flutter lets one senior team ship iOS and Android simultaneously instead of funding two native squads. Clients typically save 30-40% on the initial build and far more across years of updates, because every feature change is written once, tested once and released to both platforms in the same cycle.',
      },
      {
        title: 'Retention engineered from sprint one',
        description: 'We instrument funnels, cohort retention and session depth before the first store submission, then keep tuning. Clients routinely see day-30 retention twenty to forty percent above their category baseline, because friction was removed where users actually dropped — not where a dashboard screenshot looked pretty in the deck.',
      },
      {
        title: 'Store approvals without the drama',
        description: 'We have shipped dozens of releases through Apple review and know its unwritten rules: privacy manifests, data-collection disclosures, account-deletion requirements and payment rules. First submissions from our team pass far more often than the industry average, which means your launch date survives contact with the review queue.',
      },
      {
        title: 'Performance users can feel',
        description: 'Cold starts under two seconds, sixty-frame scrolling and app sizes under fifty megabytes are engineering targets we set per project, not aspirations. Apps that feel instant earn better reviews, and better reviews drive the organic install growth that makes your user-acquisition spend go further every month.',
      },
      {
        title: 'A stack that scales past the MVP',
        description: 'Firebase gets you to market fast; we design the data layer so migrating to dedicated infrastructure is a planned sprint, not a rewrite. Clients who start with an MVP on our architecture have scaled past a million monthly sessions without throwing away the first line of code.',
      },
    ],
    process: [
      {
        title: 'Product Scoping & Estimate',
        description: 'A focused workshop defines the core job your app does, the audience and the smallest feature set worth paying for. You leave with user stories, a phased roadmap, a fixed price for phase one and an honest view of what v2 should wait for.',
      },
      {
        title: 'UX Prototyping & Testing',
        description: 'We design the critical flows in Figma and test clickable prototypes with five to eight target users before development starts. This week of testing reliably removes the onboarding dead-ends that otherwise surface in reviews — after the public has already downloaded the app.',
      },
      {
        title: 'Agile Build Sprints',
        description: 'Development runs in two-week sprints with builds you can install on your own phone from week one. TestFlight and Play Console betas let stakeholders use real features early, and sprint demos replace progress reports you would have to take on faith.',
      },
      {
        title: 'QA on Real Devices',
        description: 'Automated test suites plus manual testing across a physical device lab — small Androids, old iPhones, tablets — because emulators lie. We test offline modes, interrupted payments, permission denials and push notifications, so launch week reports bugs from users, not from QA.',
      },
      {
        title: 'Launch, Monitoring & Iteration',
        description: 'We manage both store submissions, configure crash reporting and analytics, then monitor the first release closely for four weeks. From there, monthly iteration sprints work down the retention backlog — the steady loop that turns a launched app into a growing product.',
      },
    ],
    technologies: ['Flutter', 'Firebase', 'Swift', 'Kotlin', 'GraphQL', 'Stripe', 'OneSignal', 'App Store & Google Play'],
    caseStudySlugs: ['pulsefit', 'brewpoint'],
    startingPrice: '$4,500',
    pricingNote: 'Starting prices cover a scoped MVP with design, Flutter build for iOS and Android, backend integration and both store submissions; see the pricing page for native, scale-up and retainer options.',
    testimonialIds: ['t5', 't6'],
    faqs: [
      {
        question: 'How much does mobile app development cost?',
        answer: 'A focused MVP for both platforms starts at $4,500; apps with custom backends, payments or hardware integrations typically run $8,000-$30,000. The price is fixed per phase after scoping, and it includes UX design, development, QA on real devices and full store submission — the number you approve is the number you pay, in writing.',
      },
      {
        question: 'How long until my app is live on the stores?',
        answer: 'Most MVPs reach both app stores in ten to fourteen weeks: two for design and prototyping, six to eight for build sprints, two for QA and submission. Apple review adds a few days of variables we plan for. You will have an installable build on your own phone by week three, so progress is something you hold, not something you read about.',
      },
      {
        question: 'Should I build native or cross-platform?',
        answer: 'For most products, Flutter is the right call: one codebase, both platforms, near-native performance at 30-40% lower cost. Native Swift or Kotlin earns its premium when you need deep hardware access, platform-specific interfaces or absolute maximum performance. We make this recommendation during scoping with the trade-offs costed — and we will tell you plainly when the cheaper option is the right one.',
      },
      {
        question: 'Do you publish the app to the App Store and Google Play for us?',
        answer: 'Yes, submissions are included. We prepare screenshots, metadata, privacy declarations and review notes, manage the release trains and handle the rejection-resubmission loop that catches out most first-time publishers. Your developer accounts stay in your name and your control — we work inside them, but Apple and Google always know the app belongs to you, not to us.',
      },
      {
        question: 'What happens after launch — who fixes bugs and adds features?',
        answer: 'Every project includes a warranty window for defects, and most clients continue with a monthly iteration retainer covering monitoring, OS-update compatibility and a roadmap of new features. You receive crash and retention dashboards, a prioritised backlog and a senior team that already knows the codebase — which makes every future feature faster and cheaper to build.',
      },
      {
        question: 'How do you measure whether the app is succeeding?',
        answer: 'Downloads flatter; retention tells the truth. We define success metrics at scoping — activation rate, week-four retention, session frequency or revenue per user — then wire analytics so those numbers arrive in a dashboard you and we both read. Sprint decisions after launch are made against those metrics, which is how product decisions stay honest instead of opinion-driven.',
      },
    ],
    relatedServiceSlugs: ['custom-website-development', 'ui-ux-design', 'software-development'],
  },
];
