import type { TeamMember } from '@/lib/types';

// Developers3 team profiles — Task 2-e.
export const teamMembers: TeamMember[] = [
  {
    id: 'alex-morgan',
    name: 'Alex Morgan',
    role: 'Founder & CEO',
    photo: '/images/team/alex-morgan.png',
    initials: 'AM',
    bio: 'Alex has spent twelve years building for the web, from scrappy landing pages for first-time founders to multi-region platforms serving millions of requests a day. He founded Developers3 in 2018 after watching too many businesses get burned by vague quotes and invisible scope creep, and he still personally reviews every proposal that leaves the studio. Clients know him as the person who tells them what they don’t need to spend money on — sometimes that advice saves a project, occasionally it saves a company.',
    funFact: 'He once debugged a production outage from a campsite in the Dolomites, and now travels with a spare mobile hotspot.',
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    role: 'Lead Engineer',
    photo: '/images/team/priya-sharma.png',
    initials: 'PS',
    bio: 'Priya leads engineering at Developers3 and has shipped over sixty production builds across Next.js, WordPress, Flutter, and React Native. She started as a WordPress plugin developer, moved into headless architecture, and now decides which platform a project actually deserves — not which one is fashionable. Her superpower is saying the quiet part out loud: honest trade-off analysis, realistic timelines, and code reviews that make junior developers better. If Priya tells you a plugin stack won’t survive your growth plans, believe her.',
    funFact: 'She contributes to open-source plugins on weekends and once had a pull request merged into a tool she now recommends to clients.',
  },
  {
    id: 'daniel-reeves',
    name: 'Daniel Reeves',
    role: 'Head of Design',
    photo: '/images/team/daniel-reeves.png',
    initials: 'DR',
    bio: 'Daniel is the reason Developers3 sites don’t just work but feel considered. Fifteen years in product and brand design — including three years at a fintech where every pixel was audited — taught him that design is a commercial instrument, not decoration. He builds design systems that survive contact with real content, obsesses over accessibility and Core Web Vitals, and runs every new project through a conversion review before a single component is drawn. He has redesigned more ‘temporary’ websites than he can count.',
    funFact: 'His grid obsession extends to his kitchen spice rack, which is alphabetised by cuisine.',
  },
  {
    id: 'sofia-alvarez',
    name: 'Sofia Alvarez',
    role: 'Digital Marketing Lead',
    photo: '/images/team/sofia-alvarez.png',
    initials: 'SA',
    bio: 'Sofia runs digital marketing at Developers3 and has managed north of four million dollars in combined SEO, paid media, and email spend. She cut her teeth on e-commerce growth — scaling a DTC skincare brand from $200k to $2.4m in annual revenue — and now builds the measurement layer behind every website we launch. Sofia’s rule: if a page can’t answer why it deserves the click, no amount of ad budget will save it. She reports the numbers clients need, not the vanity metrics agencies love.',
    funFact: 'She A/B tested her own wedding seating chart and still claims the data justified every decision.',
  },
];
