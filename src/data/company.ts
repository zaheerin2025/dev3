import type { FAQ, LegalSection, ProcessStep, TimelineEntry } from '@/lib/types';

export const homeFaqs: FAQ[] = [
  {
    question: 'How much does a new website cost?',
    answer:
      'Most marketing websites we build range from $1,499 for a starter site to $6,000+ for custom, conversion-focused builds with e-commerce or booking functionality. Every quote is fixed-price and itemized, so you know exactly what you are paying for before we start. Visit our pricing page for a detailed breakdown.',
  },
  {
    question: 'How long does it take to build a website?',
    answer:
      'A typical business website takes 2–4 weeks from kickoff to launch. E-commerce projects usually take 4–8 weeks, while custom software and mobile apps run 8–16 weeks depending on scope. You get a detailed timeline after our discovery call, and we keep you updated at every milestone.',
  },
  {
    question: 'Do you work with small businesses and startups?',
    answer:
      'Absolutely. Around 70% of our clients are small businesses, startups, and local service companies. We scope projects to your budget and stage — from a lean first website to a full digital platform — and we will always tell you honestly what you do and do not need yet.',
  },
  {
    question: 'Will my website be SEO-friendly?',
    answer:
      'Yes — every site we ship follows SEO best practices by default: semantic HTML, fast Core Web Vitals, mobile-first design, schema markup, optimized meta tags, and a clean URL structure. We also offer dedicated SEO services for businesses that want to grow rankings and traffic aggressively.',
  },
  {
    question: 'What happens after my website launches?',
    answer:
      'You get 30 days of free post-launch support on every project. After that, most clients join our website maintenance plan (from $99/month) covering updates, backups, security monitoring, and small content changes. You always own your code, design files, and accounts.',
  },
  {
    question: 'Can you redesign or fix my existing website?',
    answer:
      'Yes. We start with a free audit of your current site covering performance, SEO, UX, and conversion issues. Then we recommend either a targeted redesign of key pages or a full rebuild — whichever gives you the best return on your budget.',
  },
];

export const whyChooseUs: { title: string; description: string }[] = [
  {
    title: 'Senior team, no hand-offs',
    description:
      'Your project is built by experienced engineers and designers. The people on the discovery call are the people who ship your product — never passed to juniors.',
  },
  {
    title: 'SEO-first development',
    description:
      'Every page is built to rank: clean code, fast Core Web Vitals, schema markup, and search-friendly architecture from day one, not bolted on later.',
  },
  {
    title: 'Fixed, transparent pricing',
    description:
      'Itemized quotes with no surprises. You approve the exact scope and price before we write a single line of code.',
  },
  {
    title: 'On-time, on-scope delivery',
    description:
      '98% of our projects ship on schedule thanks to weekly demos, a proven discovery-to-launch process, and honest scoping.',
  },
  {
    title: 'You own everything',
    description:
      'Code, design files, hosting accounts, and domains are 100% yours. No lock-in, no ransom situations when you want to make a change.',
  },
  {
    title: 'Support after launch',
    description:
      'Every build includes 30 days of free post-launch support, plus maintenance plans that keep your site fast, secure, and up to date.',
  },
];

export const homeProcess: ProcessStep[] = [
  {
    title: 'Discover',
    description:
      'We learn your business, goals, and audience in a free strategy call, then define scope, timeline, and a fixed quote — no obligation.',
  },
  {
    title: 'Design',
    description:
      'You review wireframes and a polished visual design, with revision rounds until every screen feels right for your brand.',
  },
  {
    title: 'Develop',
    description:
      'Our engineers build fast, responsive, SEO-ready pages and share weekly demo links so you can watch progress live.',
  },
  {
    title: 'Deploy',
    description:
      'We test across devices, migrate content, launch, and monitor performance — then support you free for 30 days.',
  },
];

export const clientNames: string[] = [
  'NorthPay',
  'Lumina Boutique',
  'Meridian Dental',
  'Atlas Logistics',
  'PulseFit',
  'BrewPoint',
  'SkillForge',
  'Urban Bloom',
];

export const companyValues: { title: string; description: string }[] = [
  {
    title: 'Craft over shortcuts',
    description:
      'We would rather quote a proper build than ship something that breaks in six months. Quality is cheaper than rework — for us and for you.',
  },
  {
    title: 'Radical transparency',
    description:
      'Itemized quotes, weekly demos, honest timelines. If something goes wrong, you hear it from us first, together with the fix.',
  },
  {
    title: 'Partners, not vendors',
    description:
      'Most of our clients have been with us for years because we treat their business goals as our own — and say "you do not need that" when it is true.',
  },
  {
    title: 'Results you can measure',
    description:
      'Pretty is not enough. We define success metrics before we start — leads, sales, speed, rankings — and report against them.',
  },
];

export const timeline: TimelineEntry[] = [
  {
    year: '2017',
    title: 'Two developers, one mission',
    description:
      'Developers3 is founded by Alex Morgan and Priya Sharma after years of watching small businesses get overcharged by agencies and underserved by template mills.',
  },
  {
    year: '2019',
    title: 'First e-commerce success',
    description:
      'Our WooCommerce build for a local retailer passes $1M in online revenue. Referrals start flowing and the team grows to five.',
  },
  {
    year: '2021',
    title: 'Apps & full product builds',
    description:
      'We launch our mobile practice with Flutter, ship our first custom SaaS platform, and move into a proper studio office.',
  },
  {
    year: '2023',
    title: 'SEO & growth division',
    description:
      'Clients kept asking "now get us found" — so we built a dedicated SEO and paid media team. We deliver our 50th project.',
  },
  {
    year: '2025',
    title: '12 specialists, 30+ happy clients',
    description:
      'Today we cover the full digital journey: design, development, apps, SEO, ads, and maintenance — with a 98% client satisfaction rate.',
  },
];

export const aboutStory: string[] = [
  'Developers3 started in 2017 with a simple frustration: small businesses were stuck choosing between bloated agencies that charged five figures for a brochure site, and cheap template mills that left them with something slow, generic, and invisible on Google. Our founders — Alex Morgan and Priya Sharma — had spent years fixing both inside larger companies, and believed there was a better way: agency-quality work, senior people doing the actual building, and honest prices published up front.',
  'The first clients came through referrals, and most of them are still with us today. That early base — a dental clinic, a boutique retailer, a logistics company — shaped how we work. We learned that a website is never just a website: it is a booking engine, a sales channel, a hiring tool. So every project starts with a business goal, not a design trend, and we measure our success in leads generated, orders processed, and hours saved — not in awards.',
  'Today Developers3 is a team of 12+ specialists covering the full digital journey: UI/UX design, custom web and software development, WordPress and e-commerce, mobile apps, SEO, paid media, and ongoing maintenance. Having design, engineering, and marketing under one roof changes the conversation — our marketers review every build for search visibility, and our engineers keep every campaign landing page fast enough to convert.',
  'We have delivered 50+ projects for 30+ active clients across healthcare, finance, retail, logistics, and education, and we hold ourselves to a 98% satisfaction rate. If you are weighing your next digital move — a rebuild, a new store, an app idea, or simply "we are not showing up on Google" — start with a free quote. You will get straightforward advice about what you actually need, even if the answer is less than you expected.',
];

export const privacySections: LegalSection[] = [
  {
    heading: 'Overview',
    paragraphs: [
      'This Privacy Policy explains how Developers3 ("we", "us", "our") collects, uses, and protects personal information when you visit developers3.com or contact us about our services. We keep this policy short and readable on purpose — if anything is unclear, email us at hello@developers3.com.',
      'By using this website you agree to the practices described below. If you do not agree, please do not use the site.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'Contact details you give us voluntarily: your name, email address, phone number, service and budget preferences, and message content when you submit a quote form, newsletter signup, or WhatsApp message.',
      'Usage data collected automatically: pages visited, approximate location (country/city level), device and browser type, and referral source. This is gathered via cookies and analytics tools and is used in aggregate to improve the site.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'We use contact information to respond to your inquiry, prepare quotes, and deliver services you request. We use aggregate usage data to improve website content, performance, and marketing.',
      'We do not sell, rent, or trade your personal information to third parties. We only share data with service providers that help us operate (for example email delivery or analytics), under agreements that require them to protect it.',
    ],
  },
  {
    heading: 'Cookies and analytics',
    paragraphs: [
      'We use essential cookies for site functionality and analytics cookies (such as Google Analytics 4) to understand how visitors use the site. Analytics data is stored by Google according to their privacy terms.',
      'You can disable cookies in your browser settings at any time. The site will continue to work, though some features may be limited.',
    ],
  },
  {
    heading: 'Data retention and security',
    paragraphs: [
      'Inquiry data is retained for up to 24 months so we can follow up on quotes, unless you ask us to delete it sooner. Client project data is retained per the terms of our service agreements.',
      'We apply industry-standard safeguards including encrypted connections (HTTPS), access controls, and least-privilege storage. No method of transmission is 100% secure, but we work hard to protect your information.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      'Depending on your jurisdiction (including GDPR and CCPA regions), you may request access to, correction of, or deletion of your personal data, and you may opt out of marketing communications at any time via the unsubscribe link or by emailing us.',
      'To exercise any right, email hello@developers3.com. We respond to verified requests within 30 days.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as our services evolve. The "last updated" date below reflects the current version. Material changes will be highlighted on this page.',
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'These Terms & Conditions govern your use of developers3.com and any quotes, proposals, or services provided by Developers3. By using the site or engaging our services, you agree to these terms.',
    ],
  },
  {
    heading: 'Services and quotes',
    paragraphs: [
      'All project quotes are itemized and fixed for 30 days from the date of issue unless stated otherwise. Work begins after a signed agreement and the agreed deposit are received.',
      'Quotes include the scope described in writing. Requests outside that scope are handled as change requests with a written estimate before any extra work is performed.',
    ],
  },
  {
    heading: 'Payments',
    paragraphs: [
      'Standard payment terms are 40% deposit, 40% at design approval, and 20% at launch, unless a different schedule is agreed in writing. Invoices are due within 7 days.',
      'Late payments may pause work and accrue interest at 1.5% per month. Delivered work remains our property until paid in full.',
    ],
  },
  {
    heading: 'Client responsibilities',
    paragraphs: [
      'You agree to provide timely feedback, content, images, and access credentials needed for the project, and to confirm that you own or have licensed all materials you supply.',
      'Delays in feedback or materials may shift the timeline accordingly.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'Upon full payment, you own the final deliverables — source code, design files, and content created specifically for your project. We retain the right to showcase non-confidential work in our portfolio.',
      'Third-party components (themes, plugins, fonts, libraries) remain under their original licenses.',
    ],
  },
  {
    heading: 'Warranties and liability',
    paragraphs: [
      'We warrant deliverables against defects for 30 days after launch and will fix reported issues at no charge. This warranty excludes changes made by third parties or issues arising from external services.',
      'To the maximum extent permitted by law, our total liability for any claim is limited to the amount paid for the affected deliverable. We are not liable for indirect or consequential damages.',
    ],
  },
  {
    heading: 'General',
    paragraphs: [
      'These terms are governed by the laws of the State of California. If any provision is found unenforceable, the remainder stays in effect. Questions? Email hello@developers3.com.',
    ],
  },
];

export const legalLastUpdated = 'January 15, 2025';
