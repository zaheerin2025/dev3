'use client';

/**
 * Batch: guided form → document/output GENERATORS (task 23-b) — 22 tools, all on the
 * shared GeneratorTool engine. Each tool is a pure GeneratorConfig: fields in, document out.
 * Slugs MUST match src/data/tools/registry.ts exactly.
 */

import * as React from 'react';
import { GeneratorTool, type GeneratorConfig } from '../engines/generator-tool';
import type { BatchTool } from '../batch-types';

/* ═══════════════════════════════════════════════════════════════
   1. META TAG GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const MetaTags = makeGen({
  fields: [
    { kind: 'text', id: 'title', label: 'Page title', half: true, placeholder: 'e.g. Handmade Leather Wallets | Acme Goods', help: 'Keep the important phrase inside the first 50–60 characters — Google truncates around there.' },
    { kind: 'text', id: 'author', label: 'Author', half: true, placeholder: 'e.g. Acme Goods editorial team' },
    { kind: 'textarea', id: 'description', label: 'Meta description', rows: 3, placeholder: 'A 150–160 character summary of the page that makes a searcher want to click.', help: '155–160 characters displays in full on desktop; mobile cuts earlier.' },
    { kind: 'textarea', id: 'keywords', label: 'Keywords (optional)', rows: 2, placeholder: 'leather wallets, handmade gifts, full-grain leather', help: 'Comma-separated. Google has ignored this tag since 2009 — include it only for niche engines.' },
    { kind: 'text', id: 'canonical', label: 'Canonical URL', placeholder: 'https://example.com/shop/wallets', help: 'Absolute URL of the preferred version of this page.' },
    {
      kind: 'select', id: 'robots', label: 'Robots directive', half: true, default: 'index, follow',
      options: [
        { value: 'index, follow', label: 'index, follow — normal public page' },
        { value: 'noindex, follow', label: 'noindex, follow — hide from results, keep passing links' },
        { value: 'index, nofollow', label: 'index, nofollow — rank page, ignore its links' },
        { value: 'noindex, nofollow', label: 'noindex, nofollow — hide page entirely' },
      ],
    },
    { kind: 'toggle', id: 'viewport', label: 'Include responsive viewport tag', default: true, help: 'Required for mobile-friendly rendering — leave on for every public page.' },
  ],
  template: (v) => {
    const t = txt(v.title);
    const d = txt(v.description);
    const k = txt(v.keywords);
    const a = txt(v.author);
    const c = txt(v.canonical);
    const r = txt(v.robots) || 'index, follow';
    const out: string[] = ['<!-- Paste inside the <head> of your page -->'];
    if (t) out.push('<title>' + escapeHtml(t) + '</title>');
    if (d) out.push('<meta name="description" content="' + escapeHtml(d) + '" />');
    if (k) out.push('<meta name="keywords" content="' + escapeHtml(k) + '" />');
    if (a) out.push('<meta name="author" content="' + escapeHtml(a) + '" />');
    out.push('<meta name="robots" content="' + escapeHtml(r) + '" />');
    if (c) out.push('<link rel="canonical" href="' + escapeHtml(c) + '" />');
    if (bl(v.viewport)) out.push('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    return out.join('\n');
  },
  outputLabel: 'Meta tag block',
  downloadName: 'meta-tags',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   2. ROBOTS.TXT GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const RobotsTxt = makeGen({
  fields: [
    {
      kind: 'select', id: 'policy', label: 'Default policy', default: 'allow',
      options: [
        { value: 'allow', label: 'Allow everything (live site)' },
        { value: 'block', label: 'Block everything (staging / private)' },
        { value: 'custom', label: 'Custom — allow all except my Disallow list' },
      ],
    },
    { kind: 'list', id: 'disallow', label: 'Paths to Disallow (custom mode)', placeholder: '/admin\n/private/*\n/cart', help: 'One path per line. A leading slash is added if missing; wildcards (*) are allowed.' },
    {
      kind: 'select', id: 'crawlDelay', label: 'Crawl-delay', half: true, default: 'none',
      options: [
        { value: 'none', label: 'No crawl-delay (recommended)' },
        { value: '5', label: '5 seconds' },
        { value: '10', label: '10 seconds' },
        { value: '30', label: '30 seconds' },
        { value: '60', label: '60 seconds' },
      ],
    },
    { kind: 'text', id: 'sitemap', label: 'Sitemap URL', half: true, placeholder: 'https://example.com/sitemap.xml', help: 'Absolute URL — crawlers read it straight from robots.txt.' },
  ],
  template: (v) => {
    const policy = txt(v.policy) || 'allow';
    const disallow = ls(v.disallow);
    const delay = txt(v.crawlDelay);
    const sm = txt(v.sitemap);
    const out: string[] = ['# robots.txt — upload to your site root: https://yourdomain.com/robots.txt', '', 'User-agent: *'];
    if (policy === 'block') {
      out.push('Disallow: /');
    } else if (policy === 'custom' && disallow.length > 0) {
      out.push('Allow: /');
      for (const p of disallow) {
        const norm = p.startsWith('/') || p.startsWith('http') || p.includes('*') || p.endsWith(':') ? p : '/' + p;
        out.push('Disallow: ' + norm);
      }
    } else {
      out.push('Allow: /');
    }
    if (delay !== 'none' && delay !== '') {
      out.push('', 'Crawl-delay: ' + delay);
    }
    if (sm) {
      out.push('', 'Sitemap: ' + sm);
    }
    return out.join('\n') + '\n';
  },
  outputLabel: 'robots.txt',
  downloadName: 'robots',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   3. SITEMAP XML GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const SitemapXml = makeGen({
  fields: [
    { kind: 'list', id: 'urls', label: 'URLs', placeholder: 'https://example.com/\nhttps://example.com/about\nhttps://example.com/blog/post-1', help: 'One canonical, indexable URL per line — homepage first, then sections, then individual pages.' },
    {
      kind: 'select', id: 'changefreq', label: 'Change frequency', half: true, default: 'weekly',
      options: [
        { value: 'always', label: 'always' },
        { value: 'hourly', label: 'hourly' },
        { value: 'daily', label: 'daily' },
        { value: 'weekly', label: 'weekly' },
        { value: 'monthly', label: 'monthly' },
        { value: 'yearly', label: 'yearly' },
        { value: 'never', label: 'never (archived pages)' },
      ],
    },
    {
      kind: 'select', id: 'priority', label: 'Priority', half: true, default: '0.8',
      options: [
        { value: '1.0', label: '1.0 — homepage / flagship' },
        { value: '0.9', label: '0.9' },
        { value: '0.8', label: '0.8 — key landing pages' },
        { value: '0.7', label: '0.7' },
        { value: '0.6', label: '0.6 — regular content' },
        { value: '0.5', label: '0.5 — secondary pages' },
      ],
    },
  ],
  template: (v) => {
    const urls = ls(v.urls);
    const freq = txt(v.changefreq) || 'weekly';
    const pri = txt(v.priority) || '0.8';
    const head = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const entries = urls.map((u) =>
      '  <url>\n    <loc>' + escapeHtml(u) + '</loc>\n    <changefreq>' + freq + '</changefreq>\n    <priority>' + pri + '</priority>\n  </url>'
    );
    return head + (entries.length ? '\n' + entries.join('\n') + '\n' : '\n') + '</urlset>\n';
  },
  outputLabel: 'sitemap.xml',
  downloadName: 'sitemap',
  downloadExt: 'xml',
});

/* ═══════════════════════════════════════════════════════════════
   4. EMAIL SIGNATURE GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const EmailSignature = makeGen({
  fields: [
    { kind: 'text', id: 'name', label: 'Full name', half: true, placeholder: 'Jane Rivera', default: 'Jane Rivera' },
    { kind: 'text', id: 'role', label: 'Role / title', half: true, placeholder: 'Account Director' },
    { kind: 'text', id: 'company', label: 'Company', half: true, placeholder: 'Northlight Studio' },
    { kind: 'text', id: 'color', label: 'Accent color (hex)', half: true, placeholder: '#0f766e', default: '#0f766e', help: 'Six-digit hex. Invalid values fall back to teal.' },
    { kind: 'text', id: 'phone', label: 'Phone', half: true, placeholder: '+1 (555) 210-4477' },
    { kind: 'text', id: 'email', label: 'Email', half: true, placeholder: 'jane@northlight.co' },
    { kind: 'text', id: 'website', label: 'Website', placeholder: 'northlight.co', help: 'Domain or full URL — the link is made https:// automatically.' },
    {
      kind: 'select', id: 'style', label: 'Layout style', default: 'bar',
      options: [
        { value: 'bar', label: 'Accent bar — vertical color stripe on the left' },
        { value: 'center', label: 'Centered — top rule, centered stack' },
        { value: 'rule', label: 'Rule line — horizontal line, uppercase name' },
      ],
    },
  ],
  template: (v) => {
    const name = txt(v.name) || 'Your Name';
    const role = txt(v.role);
    const company = txt(v.company);
    const phone = txt(v.phone);
    const email = txt(v.email);
    const site = txt(v.website);
    const style = txt(v.style) || 'bar';
    let color = txt(v.color) || '#0f766e';
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) color = '#0f766e';

    const siteUrl = site ? (site.startsWith('http') ? site : 'https://' + site) : '';
    const siteLabel = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const parts: string[] = [];
    if (phone) parts.push('<span style="color:#6b7280;white-space:nowrap;">' + escapeHtml(phone) + '</span>');
    if (email) parts.push('<a href="mailto:' + escapeHtml(email) + '" style="color:#6b7280;text-decoration:none;">' + escapeHtml(email) + '</a>');
    if (siteUrl) parts.push('<a href="' + escapeHtml(siteUrl) + '" style="color:#6b7280;text-decoration:none;">' + escapeHtml(siteLabel) + '</a>');
    const contactLine = parts.length
      ? '<div style="font-size:12px;line-height:1.7;color:#6b7280;padding-top:6px;">' + parts.join('<span style="color:' + color + ';">&nbsp;&nbsp;|&nbsp;&nbsp;</span>') + '</div>'
      : '';

    let sig = '';
    if (style === 'center') {
      sig =
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="font-family:Arial,Helvetica,sans-serif;text-align:center;">\n' +
        '  <tr><td style="padding:12px 32px 14px;border-top:3px solid ' + color + ';">\n' +
        '    <div style="font-size:17px;font-weight:bold;color:' + color + ';letter-spacing:1px;">' + escapeHtml(name) + '</div>\n' +
        (role || company ? '    <div style="font-size:12px;color:#4b5563;padding-top:3px;">' + escapeHtml([role, company].filter(Boolean).join(' · ')) + '</div>\n' : '') +
        contactLine.replace('padding-top:6px;', 'padding-top:8px;') +
        '  </td></tr>\n</table>';
    } else if (style === 'rule') {
      sig =
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">\n' +
        '  <tr><td style="padding:10px 4px 6px;border-top:2px solid ' + color + ';">\n' +
        '    <div style="font-size:14px;font-weight:bold;color:#111827;letter-spacing:2px;text-transform:uppercase;">' + escapeHtml(name) + '</div>\n' +
        (role || company ? '    <div style="font-size:12px;color:' + color + ';padding-top:3px;">' + escapeHtml([role, company].filter(Boolean).join(', ')) + '</div>\n' : '') +
        contactLine +
        '  </td></tr>\n</table>';
    } else {
      sig =
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">\n' +
        '  <tr>\n' +
        '    <td width="4" bgcolor="' + color + '" style="width:4px;background:' + color + ';"></td>\n' +
        '    <td style="padding:8px 18px;">\n' +
        '      <div style="font-size:16px;font-weight:bold;color:#111827;">' + escapeHtml(name) + '</div>\n' +
        (role ? '      <div style="font-size:12px;font-weight:bold;color:' + color + ';padding-top:2px;">' + escapeHtml(role) + '</div>\n' : '') +
        (company ? '      <div style="font-size:12px;color:#4b5563;">' + escapeHtml(company) + '</div>\n' : '') +
        contactLine +
        '    </td>\n  </tr>\n</table>';
    }

    const body =
      '<p class="hint">Email signature — open this file in a browser, press Ctrl/Cmd+A to select, copy, then paste into Gmail or Outlook signature settings.</p>\n<hr />\n' +
      sig;
    return htmlDoc(name + ' — email signature', body, '');
  },
  outputLabel: 'HTML signature',
  previewHtml: true,
  downloadName: 'email-signature',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   5. PRIVACY POLICY GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const PrivacyPolicy = makeGen({
  fields: [
    { kind: 'text', id: 'company', label: 'Company name', half: true, placeholder: 'Acme Goods Ltd.' },
    { kind: 'text', id: 'website', label: 'Website', half: true, placeholder: 'https://acmegoods.com' },
    { kind: 'text', id: 'email', label: 'Privacy contact email', half: true, placeholder: 'privacy@acmegoods.com', help: 'Blank = auto-derived from your domain.' },
    { kind: 'text', id: 'effective', label: 'Effective date', half: true, placeholder: 'e.g. 1 January 2026', help: 'Blank = today.' },
    {
      kind: 'select', id: 'jurisdiction', label: 'Jurisdiction (drives the rights section)', default: 'us',
      options: [
        { value: 'us', label: 'United States — CCPA/CPRA framing' },
        { value: 'eu', label: 'European Union — GDPR' },
        { value: 'uk', label: 'United Kingdom — UK GDPR / ICO' },
        { value: 'ca', label: 'Canada — PIPEDA' },
        { value: 'au', label: 'Australia — Privacy Act 1988' },
        { value: 'other', label: 'Other / general' },
      ],
    },
    { kind: 'toggle', id: 'analytics', label: 'We use analytics tools (GA4, Plausible, etc.)', default: true },
    { kind: 'toggle', id: 'marketing', label: 'We send marketing emails / newsletters' },
    { kind: 'toggle', id: 'ads', label: 'We run advertising pixels / ad partnerships' },
  ],
  template: (v) => {
    const co = txt(v.company) || 'Our Company';
    const site = txt(v.website) || 'our website';
    const domain = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const email = txt(v.email) || (domain ? 'privacy@' + domain : 'privacy@example.com');
    const eff = txt(v.effective) || todayStr();
    const j = txt(v.jurisdiction) || 'us';
    const analytics = bl(v.analytics);
    const marketing = bl(v.marketing);
    const ads = bl(v.ads);

    const jName: Record<string, string> = {
      us: 'the United States', eu: 'the European Economic Area', uk: 'the United Kingdom',
      ca: 'Canada', au: 'Australia', other: 'the jurisdictions where we operate',
    };
    const rights: Record<string, string> = {
      us: 'Depending on your state of residence, you may have the right to know what personal information we collect, request access to it or its deletion, correct inaccuracies, and opt out of the “sale” or “sharing” of personal information — which we do not engage in. California residents may exercise CCPA/CPRA rights by emailing us; we verify requests before acting on them and will not discriminate against anyone for making a request.',
      eu: 'Under the GDPR you have the right to access, rectify or erase your personal data, restrict or object to processing, receive a portable copy of your data, and withdraw consent at any time without affecting prior processing. You may also lodge a complaint with your national supervisory authority.',
      uk: 'Under the UK GDPR and the Data Protection Act 2018 you have the right to access, rectify or erase your personal data, restrict or object to processing, receive a portable copy of your data, and withdraw consent at any time. You may also complain to the Information Commissioner’s Office at ico.org.uk.',
      ca: 'Under PIPEDA you may request access to the personal information we hold about you, ask us to correct it, and — if you are unsatisfied with our response — complain to the Office of the Privacy Commissioner of Canada.',
      au: 'Under the Australian Privacy Act 1988 you may request access to the personal information we hold about you and ask us to correct it where it is inaccurate, incomplete or out of date. Complaints may also be made to the Office of the Australian Information Commissioner (OAIC).',
      other: 'You may ask what personal information we hold about you, request a copy, ask us to correct or delete it, and withdraw any consent you have previously given. Contact us using the details below and we will respond within a reasonable timeframe.',
    };

    const collect = [
      '<li><strong>Information you give us.</strong> Contact details and anything else you choose to send us by email or through forms on ' + esc(site) + '.</li>',
      '<li><strong>Technical data.</strong> IP address, browser and device type, and the pages you visit, recorded automatically as you use the site.</li>',
      analytics ? '<li><strong>Usage analytics.</strong> Aggregated statistics about sessions, page views, referrers and approximate location, collected through analytics tools so we can improve the site.</li>' : '',
      marketing ? '<li><strong>Marketing preferences.</strong> Your email address and communication choices, kept if you subscribe to updates or newsletters from us.</li>' : '',
      ads ? '<li><strong>Advertising data.</strong> Cookie identifiers and similar technologies used to measure campaigns and, where permitted, to tailor the advertising you see.</li>' : '',
    ].filter(Boolean).join('\n    ');

    const share = [
      'We do not sell your personal information. We share data only with service providers who process it on our behalf — hosting, email delivery' +
      (analytics ? ', analytics providers' : '') + (ads ? ' and advertising partners' : '') +
      ' — under contracts that limit their use of the data to our instructions.',
    ].join('');

    const body =
      '<h1>Privacy Policy</h1>\n' +
      '<p class="meta">' + esc(co) + ' · Effective ' + esc(eff) + '</p>\n' +
      '<p>This Privacy Policy explains what information ' + esc(co) + ' (“we”, “us”) collects when you visit ' + esc(site) +
      ', how we use it, and the choices available to you. We keep this document in plain language and update it whenever our practices change.</p>\n' +

      '<h2>Information we collect</h2>\n' +
      '    <ul>\n    ' + collect + '\n    </ul>\n' +

      '<h2>How we use information</h2>\n' +
      '<p>We use the information above to operate and secure ' + esc(site) + ', respond to enquiries, understand how the site is used, and' +
      (marketing ? ' — only with your consent — send you updates we believe are relevant' : '') +
      (marketing && ads ? ';' : '') +
      (ads && !marketing ? ' — where permitted — to measure the performance of our advertising' : '') +
      (ads && marketing ? ' measure the performance of our advertising' : '') +
      '. We do not use your data for purposes that are incompatible with those described here without telling you first.</p>\n' +

      '<h2>Cookies &amp; similar technologies</h2>\n' +
      '<p>' + esc(site) + ' uses cookies: small files stored by your browser. Strictly necessary cookies keep the site working and cannot be switched off.' +
      (analytics ? ' Analytics cookies help us count visits and see which content is useful.' : '') +
      (ads ? ' Advertising cookies may be set by our partners to measure campaigns and, where you have consented, tailor the ads you see.' : '') +
      ' You can clear or block cookies in your browser settings at any time; blocking strictly necessary cookies may affect how parts of the site function.</p>\n' +

      (ads
        ? '<h2>Advertising opt-outs</h2>\n<p>If you prefer not to receive personalised advertising, you can opt out through your browser or device settings and through industry opt-out pages such as the DAA’s aboutads.info or the NAI’s opt-out page. Opting out does not mean you will stop seeing ads — only that they will be less relevant to you.</p>\n'
        : '') +

      '<h2>Sharing</h2>\n<p>' + esc(share) + '</p>\n' +

      (j === 'eu' || j === 'uk'
        ? '<h2>Legal bases for processing</h2>\n<p>Where the GDPR applies we rely on: your consent (analytics, marketing emails and advertising cookies); performance of a contract (responding to your enquiries); our legitimate interests (site security, service improvement); and legal obligations (record-keeping where required).</p>\n'
        : '') +

      '<h2>Your rights</h2>\n<p>' + (rights[j] || rights.other) + '</p>\n' +

      '<h2>Data retention &amp; security</h2>\n' +
      '<p>We keep personal information only as long as needed for the purposes above or as required by law, then delete or anonymise it. We apply reasonable technical and organisational measures to protect it — no method of transmission over the internet is perfectly secure, but we treat your data with the same care we expect from the services we use.</p>\n' +

      '<h2>Children</h2>\n<p>' + esc(site) + ' is not directed at children under 13 (or under 16 in the EEA/UK), and we do not knowingly collect their personal information. If you believe a child has provided us data, contact us and we will delete it.</p>\n' +

      '<h2>Changes to this policy</h2>\n<p>We may update this policy as our practices evolve. Material changes will be announced on this page with a new effective date.</p>\n' +

      '<h2>Contact</h2>\n<p>Questions or requests: <strong>' + esc(email) + '</strong> — ' + esc(co) + '. We aim to respond within 30 days.</p>\n';

    return htmlDoc('Privacy Policy — ' + co, body);
  },
  outputLabel: 'Privacy policy (HTML)',
  previewHtml: true,
  downloadName: 'privacy-policy',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   6. TERMS & CONDITIONS GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const TermsConditions = makeGen({
  fields: [
    { kind: 'text', id: 'company', label: 'Company name', half: true, placeholder: 'Acme Goods Ltd.' },
    { kind: 'text', id: 'website', label: 'Website', half: true, placeholder: 'https://acmegoods.com' },
    { kind: 'text', id: 'email', label: 'Contact email (legal notices)', half: true, placeholder: 'legal@acmegoods.com' },
    { kind: 'text', id: 'law', label: 'Governing law', half: true, placeholder: 'e.g. the State of Delaware, USA', help: 'Names the jurisdiction whose law interprets this agreement.' },
    { kind: 'toggle', id: 'accounts', label: 'Site has user accounts / registration', default: true },
    { kind: 'toggle', id: 'payments', label: 'We sell products or subscriptions' },
    { kind: 'toggle', id: 'usercontent', label: 'Users can post content (reviews, comments, uploads)' },
  ],
  template: (v) => {
    const co = txt(v.company) || 'Our Company';
    const site = txt(v.website) || 'our website';
    const email = txt(v.email) || 'legal@example.com';
    const law = txt(v.law) || 'the jurisdiction where ' + co + ' is registered';
    const accounts = bl(v.accounts);
    const payments = bl(v.payments);
    const userContent = bl(v.usercontent);

    const body =
      '<h1>Terms &amp; Conditions</h1>\n' +
      '<p class="meta">' + esc(co) + ' · ' + esc(site) + '</p>\n' +
      '<p>These Terms &amp; Conditions (“Terms”) govern your use of ' + esc(site) + ' and any related services provided by ' + esc(co) +
      '. By accessing or using the site you agree to be bound by these Terms. If you do not agree, please do not use the site.</p>\n' +

      '<h2>1. Eligibility &amp; acceptable use</h2>\n' +
      '<p>You must be at least 13 years old (or the age of digital consent in your region, if higher) to use the site. You agree not to misuse the site: no interfering with its operation, no scraping at volumes that degrade service, no unlawful activity, and no attempts to access systems or accounts you are not authorised to use.</p>\n' +

      (accounts
        ? '<h2>2. Accounts</h2>\n<p>You are responsible for the accuracy of your registration details, for keeping your password confidential, and for all activity that happens under your account. Notify us immediately at ' + esc(email) + ' if you suspect unauthorised access. We may suspend or close accounts that violate these Terms.</p>\n'
        : '') +

      (payments
        ? '<h2>' + (accounts ? '3' : '2') + '. Orders, pricing &amp; payment</h2>\n<p>Prices are shown before checkout and include any taxes required by law. You authorise us (or our payment processor) to charge your chosen payment method for the total at checkout. Digital purchases are licensed, not sold, and — to the extent permitted by law — are non-refundable once access is delivered, except where mandatory consumer law provides otherwise. Subscriptions renew automatically until cancelled and may be cancelled any time before the next billing date.</p>\n'
        : '') +

      (userContent
        ? '<h2>' + (accounts ? (payments ? '4' : '3') : (payments ? '3' : '2')) + '. User content</h2>\n<p>You keep ownership of anything you post — reviews, comments, uploads. By posting you grant ' + esc(co) + ' a worldwide, royalty-free licence to display, moderate and distribute that content in connection with operating and promoting the site. You are responsible for having the rights to what you post, and you must not post content that is unlawful, defamatory, or infringes anyone’s rights. We may remove content that breaches these rules.</p>\n'
        : '') +

      '<h2>' + ((accounts ? 1 : 0) + (payments ? 1 : 0) + (userContent ? 1 : 0) + 1) + '. Intellectual property</h2>\n' +
      '<p>All site content — text, design, logos, code and imagery — is owned by ' + esc(co) + ' or its licensors and protected by intellectual property laws. You may view and print pages for personal, non-commercial use; anything beyond that requires our written permission.</p>\n' +

      '<h2>' + ((accounts ? 1 : 0) + (payments ? 1 : 0) + (userContent ? 1 : 0) + 2) + '. Disclaimers &amp; limitation of liability</h2>\n' +
      '<p>The site is provided “as is” and “as available” without warranties of any kind, to the maximum extent permitted by law. To the fullest extent permitted by applicable law, ' + esc(co) + ' is not liable for indirect, incidental or consequential damages arising from your use of the site. Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud or for death or personal injury caused by negligence.</p>\n' +

      '<h2>' + ((accounts ? 1 : 0) + (payments ? 1 : 0) + (userContent ? 1 : 0) + 3) + '. Termination</h2>\n' +
      '<p>We may suspend or terminate access to the site at our discretion, with or without notice, for conduct that we believe violates these Terms or is harmful to other users or to us. Sections that by their nature should survive termination (intellectual property, disclaimers, governing law) will survive.</p>\n' +

      '<h2>' + ((accounts ? 1 : 0) + (payments ? 1 : 0) + (userContent ? 1 : 0) + 4) + '. Governing law &amp; disputes</h2>\n' +
      '<p>These Terms are governed by the laws of ' + esc(law) + ', without regard to conflict-of-law rules. The courts of that jurisdiction have exclusive authority over any dispute arising from these Terms or your use of the site.</p>\n' +

      '<h2>' + ((accounts ? 1 : 0) + (payments ? 1 : 0) + (userContent ? 1 : 0) + 5) + '. Changes &amp; contact</h2>\n' +
      '<p>We may update these Terms from time to time; the current version always lives on this page with its revision date. Continued use after changes take effect constitutes acceptance. Questions and legal notices: <strong>' + esc(email) + '</strong>.</p>\n';

    return htmlDoc('Terms & Conditions — ' + co, body);
  },
  outputLabel: 'Terms & conditions (HTML)',
  previewHtml: true,
  downloadName: 'terms-conditions',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   7. COOKIE POLICY GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const CookiePolicy = makeGen({
  fields: [
    { kind: 'text', id: 'company', label: 'Company name', half: true, placeholder: 'Acme Goods Ltd.' },
    { kind: 'text', id: 'website', label: 'Website', half: true, placeholder: 'https://acmegoods.com' },
    { kind: 'toggle', id: 'essential', label: 'Essential cookies (cart, session, security)', default: true },
    { kind: 'toggle', id: 'analytics', label: 'Analytics cookies (GA4, Plausible, etc.)', default: true },
    { kind: 'toggle', id: 'marketing', label: 'Marketing / advertising cookies (pixels, retargeting)' },
    { kind: 'list', id: 'cookies', label: 'Cookie inventory (optional)', placeholder: '_ga | Google Analytics | 2 years\n_gcl_au | Google Ads | 90 days\nsession | First party | Session', help: 'One per line: Name | Provider | Duration — rendered as a table.' },
  ],
  template: (v) => {
    const co = txt(v.company) || 'Our Company';
    const site = txt(v.website) || 'our website';
    const essential = bl(v.essential);
    const analytics = bl(v.analytics);
    const marketing = bl(v.marketing);
    const rows = ls(v.cookies).map((l) => {
      const parts = l.split('|').map((p) => p.trim());
      return { name: parts[0] || '—', provider: parts[1] || 'First party', life: parts[2] || 'Session' };
    });

    const cats = [
      essential ? ['Strictly necessary', 'Required for core features — sessions, shopping cart, security tokens, load balancing. These cannot be switched off because the site would not function without them.'] : '',
      analytics ? ['Analytics', 'Help us count visits and understand which pages and content perform, so we can improve the site. These cookies only fire after you consent (where consent is required).'] : '',
      marketing ? ['Marketing & advertising', 'Measure the performance of campaigns and, where you have consented, help show you relevant offers on other sites. They never fire before consent in the EU/UK.'] : '',
    ].filter(Boolean) as string[][];

    const table = rows.length
      ? '<h2>Cookie inventory</h2>\n<table>\n<tr><th>Name</th><th>Provider</th><th>Duration</th></tr>\n' +
        rows.map((r) => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.provider) + '</td><td>' + esc(r.life) + '</td></tr>').join('\n') +
        '\n</table>\n'
      : '';

    const body =
      '<h1>Cookie Policy</h1>\n' +
      '<p class="meta">' + esc(co) + ' · ' + esc(site) + '</p>\n' +
      '<p>This Cookie Policy explains how ' + esc(co) + ' uses cookies and similar technologies on ' + esc(site) +
      ', what each category does, and how you can control them. It complements our Privacy Policy, which covers the data those technologies collect.</p>\n' +

      '<h2>What cookies are</h2>\n' +
      '<p>Cookies are small text files a website stores in your browser. They remember your actions and preferences over time — keeping you signed in, remembering a cart, or telling us which pages are useful. Similar technologies (local storage, pixels, SDKs) work in comparable ways and are covered by this policy too.</p>\n' +

      '<h2>Categories we use</h2>\n' +
      cats.map((c) => '<h3>' + esc(c[0]) + '</h3>\n<p>' + esc(c[1]) + '</p>').join('\n') + '\n' +

      table +

      '<h2>Managing your choices</h2>\n' +
      '<p>You can accept or refuse non-essential cookies through our consent banner, change your mind at any time via the “Cookie settings” link in the footer, and clear existing cookies in your browser. Blocking all cookies in browser settings may break site features that depend on them.</p>\n' +

      '<h2>Your rights</h2>\n' +
      '<p>Under the GDPR and UK GDPR you can withdraw consent to non-essential cookies at any time. Under the CCPA/CPRA, opting out of advertising cookies is treated as opting out of “sharing” for cross-context behavioural advertising, and we honour recognised opt-out signals such as Global Privacy Control.</p>\n' +

      '<h2>Updates &amp; contact</h2>\n' +
      '<p>We re-audit our cookie usage regularly and update this policy when categories or specific cookies change. Questions about this policy: contact ' + esc(co) + ' through the details on our contact page.</p>\n';

    return htmlDoc('Cookie Policy — ' + co, body);
  },
  outputLabel: 'Cookie policy (HTML)',
  previewHtml: true,
  downloadName: 'cookie-policy',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   8. SCHEMA MARKUP GENERATOR (FAQ / LocalBusiness JSON-LD)
   ═══════════════════════════════════════════════════════════════ */

const SchemaMarkup = makeGen({
  fields: [
    {
      kind: 'select', id: 'type', label: 'Schema type', default: 'faq',
      options: [
        { value: 'faq', label: 'FAQPage — question & answer rich results' },
        { value: 'local', label: 'LocalBusiness — location, hours & contact' },
      ],
    },
    { kind: 'textarea', id: 'questions', label: 'FAQ questions (used when type = FAQ)', rows: 5, placeholder: 'Do you ship internationally?\nHow long does delivery take?', help: 'One question per line.' },
    { kind: 'textarea', id: 'answers', label: 'FAQ answers (same order as questions)', rows: 5, placeholder: 'Yes — we ship to 40+ countries.\n3–5 business days for EU, 7–10 elsewhere.', help: 'Line 1 answers question 1, and so on.' },
    { kind: 'text', id: 'bizName', label: 'Business name (used when type = LocalBusiness)', half: true, placeholder: 'Acme Dental Studio' },
    { kind: 'text', id: 'phone', label: 'Phone', half: true, placeholder: '+1 (217) 555-0142' },
    { kind: 'text', id: 'url', label: 'Website URL', half: true, placeholder: 'https://acmedental.com' },
    { kind: 'text', id: 'geo', label: 'Coordinates "lat, lng"', half: true, placeholder: '39.7817, -89.6501' },
    { kind: 'text', id: 'address', label: 'Street address', placeholder: '123 S Main St, Suite 4, Springfield, IL 62701', help: 'Full street line — search engines match this against maps data.' },
    { kind: 'list', id: 'hours', label: 'Opening hours', placeholder: 'Mo-Fr 09:00-17:00\nSa 10:00-14:00', help: 'Schema.org format, one range per line.' },
  ],
  template: (v) => {
    if (txt(v.type) !== 'local') {
      const qs = ls(v.questions);
      const as = ls(v.answers);
      const main = qs.map((q, i) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: as[i] ?? '' },
      }));
      const obj = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: main };
      return '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</script>';
    }
    const geoRaw = txt(v.geo);
    const geoParts = geoRaw.split(',').map((s) => s.trim());
    const hours = ls(v.hours);
    const obj2: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: txt(v.bizName) || 'My Business',
    };
    if (txt(v.url)) obj2.url = txt(v.url);
    if (txt(v.phone)) obj2.telephone = txt(v.phone);
    if (txt(v.address)) obj2.address = { '@type': 'PostalAddress', streetAddress: txt(v.address) };
    if (hours.length) obj2.openingHours = hours;
    if (geoParts.length === 2 && geoParts[0] && geoParts[1]) {
      obj2.geo = { '@type': 'GeoCoordinates', latitude: geoParts[0], longitude: geoParts[1] };
    }
    return '<script type="application/ld+json">\n' + JSON.stringify(obj2, null, 2) + '\n</script>';
  },
  outputLabel: 'JSON-LD markup',
  downloadName: 'schema-markup',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   9. PRESS RELEASE TEMPLATE GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const PressRelease = makeGen({
  fields: [
    { kind: 'text', id: 'company', label: 'Company', half: true, placeholder: 'Northlight Studio' },
    { kind: 'text', id: 'city', label: 'Dateline city', half: true, placeholder: 'Chicago, IL' },
    { kind: 'text', id: 'headline', label: 'Headline', placeholder: 'Northlight Studio Opens Second Chicago Location, Doubling Production Capacity', help: 'One concrete sentence — active verb, real subject.' },
    { kind: 'text', id: 'subhead', label: 'Subheadline', placeholder: 'Expansion adds 14 jobs and a dedicated post-production suite by Q3 2026' },
    { kind: 'textarea', id: 'body', label: 'Body paragraphs', rows: 6, placeholder: 'Lead with the most newsworthy fact in the first paragraph — who, what, when, where.\n\nAdd context and detail in the second paragraph. Blank line = new paragraph.', help: 'One paragraph per block, separated by a blank line.' },
    { kind: 'textarea', id: 'quote', label: 'Quote', rows: 3, placeholder: 'This expansion is a bet on Chicago’s creative talent — and our clients made it possible.', help: 'A real, speakable sentence from a real person.' },
    { kind: 'text', id: 'attribution', label: 'Quote attribution', half: true, placeholder: 'Maya Chen, Founder and CEO, Northlight Studio' },
    { kind: 'textarea', id: 'boilerplate', label: 'Boilerplate ("About …")', rows: 3, placeholder: 'About Northlight Studio: founded in 2016, Northlight is a full-service production company specialising in brand films and documentary work for clients across the Midwest.' },
    { kind: 'textarea', id: 'contact', label: 'Media contact', rows: 3, placeholder: 'Press contact: Jordan Alvarez\npress@northlight.co\n+1 (312) 555-0192' },
  ],
  template: (v) => {
    const co = txt(v.company) || 'Your Company';
    const city = txt(v.city).toUpperCase();
    const headline = txt(v.headline) || 'Company Announces News';
    const sub = txt(v.subhead);
    const paras = String(v.body ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const quote = txt(v.quote);
    const attr = txt(v.attribution);
    const boiler = ls(v.boilerplate);
    const contact = ls(v.contact);

    const bodyHtml = paras.map((p) => '<p>' + esc(p) + '</p>').join('\n');
    const quoteHtml = quote
      ? '<blockquote>\n  <p>“' + esc(quote) + '”</p>\n' + (attr ? '  <p class="attr">— ' + esc(attr) + '</p>\n' : '') + '</blockquote>\n'
      : '';
    const boilerHtml = boiler.length
      ? '<h2>About ' + esc(co) + '</h2>\n' + boiler.map((b) => '<p>' + esc(b) + '</p>').join('\n') + '\n'
      : '';
    const contactHtml = contact.length
      ? '<h2>Media contact</h2>\n<div class="contact">' + contact.map((c) => esc(c) + '<br />').join('') + '</div>\n'
      : '';

    const docBody =
      '<p class="release-tag">FOR IMMEDIATE RELEASE</p>\n' +
      '<h1>' + esc(headline) + '</h1>\n' +
      (sub ? '<p class="subhead">' + esc(sub) + '</p>\n' : '') +
      '<p class="dateline">' + esc(city || 'CITY') + ', ' + esc(todayStr()) + ' — </p>\n' +
      bodyHtml + '\n' +
      quoteHtml +
      boilerHtml +
      contactHtml +
      '<p class="end">###</p>';

    return htmlDoc(headline, docBody, PR_CSS);
  },
  outputLabel: 'Press release (HTML)',
  previewHtml: true,
  downloadName: 'press-release',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   10. CLIENT BRIEF GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const ClientBrief = makeGen({
  fields: [
    { kind: 'text', id: 'project', label: 'Project name', half: true, placeholder: 'Acme website redesign' },
    { kind: 'text', id: 'client', label: 'Client', half: true, placeholder: 'Acme Goods Ltd.' },
    { kind: 'text', id: 'industry', label: 'Industry', half: true, placeholder: 'Consumer goods / e-commerce' },
    { kind: 'text', id: 'audience', label: 'Primary audience', half: true, placeholder: 'First-time buyers, 25–40, mobile-first' },
    {
      kind: 'select', id: 'budget', label: 'Budget band', half: true, default: 'flexible',
      options: [
        { value: 'under-2.5k', label: 'Under $2,500' },
        { value: '2.5-10k', label: '$2,500 – $10,000' },
        { value: '10-25k', label: '$10,000 – $25,000' },
        { value: '25k-plus', label: '$25,000+' },
        { value: 'flexible', label: 'Flexible — to be discussed' },
      ],
    },
    { kind: 'text', id: 'timeline', label: 'Timeline', half: true, placeholder: 'e.g. 6–8 weeks, launch before May 1' },
    { kind: 'textarea', id: 'goals', label: 'Goals (what changes when this succeeds)', rows: 4, placeholder: 'Double online orders within 6 months.\nReduce support tickets caused by confusing checkout.' },
    { kind: 'list', id: 'scope', label: 'In-scope deliverables', placeholder: 'New responsive storefront (12 templates)\nCheckout flow redesign\nEmail capture integration' },
    { kind: 'list', id: 'metrics', label: 'Success metrics', placeholder: 'Conversion rate: 1.4% → 2.5%\nCheckout abandonment down 30%' },
  ],
  template: (v) => {
    const project = txt(v.project) || 'Untitled project';
    const client = txt(v.client) || '—';
    const industry = txt(v.industry) || '—';
    const audience = txt(v.audience) || '—';
    const budgetMap: Record<string, string> = {
      'under-2.5k': 'Under $2,500', '2.5-10k': '$2,500 – $10,000', '10-25k': '$10,000 – $25,000',
      '25k-plus': '$25,000+', flexible: 'Flexible — to be discussed',
    };
    const budget = budgetMap[txt(v.budget)] || 'Flexible — to be discussed';
    const timeline = txt(v.timeline) || '—';
    const goals = ls(v.goals);
    const scope = ls(v.scope);
    const metrics = ls(v.metrics);

    const ul = (arr: string[]) => arr.length ? '<ul>\n' + arr.map((x) => '<li>' + esc(x) + '</li>').join('\n') + '\n</ul>\n' : '<p class="meta">—</p>\n';

    const body =
      '<h1>Project Brief</h1>\n' +
      '<p class="meta">' + esc(project) + ' · prepared for ' + esc(client) + '</p>\n' +
      '<table>\n<tr><th>Client</th><td>' + esc(client) + '</td></tr>\n' +
      '<tr><th>Industry</th><td>' + esc(industry) + '</td></tr>\n' +
      '<tr><th>Audience</th><td>' + esc(audience) + '</td></tr>\n' +
      '<tr><th>Budget band</th><td>' + esc(budget) + '</td></tr>\n' +
      '<tr><th>Timeline</th><td>' + esc(timeline) + '</td></tr>\n</table>\n' +

      '<h2>Goals</h2>\n' +
      '<p>The business outcomes this project exists to deliver:</p>\n' + ul(goals) +

      '<h2>Audience</h2>\n' +
      '<p>' + esc(audience) + ' — every design, copy and prioritisation decision below should be defensible against this group’s needs and context.</p>\n' +

      '<h2>In scope</h2>\n' + ul(scope) +

      '<h2>Success metrics</h2>\n' +
      '<p>Agreed measures of success — vague goals produce vague reviews:</p>\n' + ul(metrics) +

      '<h2>Working agreement</h2>\n' +
      '<p>Anything not listed under “In scope” is a change request with its own conversation about time and cost. This brief is the reference document for acceptance decisions; material changes should be re-issued and acknowledged in writing.</p>\n';

    return htmlDoc('Project brief — ' + project, body);
  },
  outputLabel: 'Project brief (HTML)',
  previewHtml: true,
  downloadName: 'client-brief',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   11. PROJECT SCOPE BUILDER
   ═══════════════════════════════════════════════════════════════ */

const ProjectScope = makeGen({
  fields: [
    { kind: 'text', id: 'title', label: 'Project title', half: true, placeholder: 'Acme Goods — Storefront Build' },
    { kind: 'text', id: 'client', label: 'Client', half: true, placeholder: 'Acme Goods Ltd.' },
    { kind: 'list', id: 'deliverables', label: 'Deliverables (what gets handed over)', placeholder: 'Responsive storefront, 12 page templates\nContent entry for up to 50 products\nAnalytics + Search Console setup' },
    { kind: 'list', id: 'milestones', label: 'Milestones (in order)', placeholder: 'Kickoff & discovery — week 1\nDesign sign-off — week 3\nStaging handover — week 5\nLaunch — week 6' },
    { kind: 'list', id: 'exclusions', label: 'Exclusions (explicitly NOT included)', placeholder: 'Copywriting\nOngoing maintenance after 30 days\nPaid advertising management' },
    { kind: 'textarea', id: 'assumptions', label: 'Assumptions', rows: 4, placeholder: 'Client provides brand assets and product data by week 1.\nFeedback consolidated into one round per milestone (5 business days).' },
    { kind: 'list', id: 'signoffs', label: 'Sign-offs', placeholder: 'A. Rivera — Client Lead — ____________\nJ. Chen — Studio Director — ____________', help: 'Name — Role — Signature/Date lines.' },
  ],
  template: (v) => {
    const title = txt(v.title) || 'Untitled engagement';
    const client = txt(v.client) || '—';
    const deliverables = ls(v.deliverables);
    const milestones = ls(v.milestones);
    const exclusions = ls(v.exclusions);
    const assumptions = ls(v.assumptions);
    const signoffs = ls(v.signoffs);

    const ul = (arr: string[]) => arr.length ? '<ul>\n' + arr.map((x) => '<li>' + esc(x) + '</li>').join('\n') + '\n</ul>\n' : '<p class="meta">—</p>\n';

    const body =
      '<h1>Scope of Work</h1>\n' +
      '<p class="meta">' + esc(title) + ' · ' + esc(client) + '</p>\n' +
      '<p>This document defines what will be delivered, in what order, and — just as importantly — what falls outside this engagement. It is the reference for change requests and acceptance.</p>\n' +

      '<h2>Deliverables</h2>\n' + ul(deliverables) +

      '<h2>Milestones</h2>\n' + ul(milestones) +

      '<h2>Exclusions</h2>\n' +
      '<p>The following are <strong>not</strong> part of this engagement. Requests to add them trigger a written change order:</p>\n' + ul(exclusions) +

      '<h2>Assumptions</h2>\n' +
      '<p>This scope and timeline hold true as long as the following remain valid:</p>\n' + ul(assumptions) +

      '<h2>Change control</h2>\n' +
      '<p>Any deliverable, milestone or assumption that changes is handled as a change request: described in writing, priced, scheduled, and approved by both parties before work continues. Verbal agreements do not modify this scope.</p>\n' +

      '<h2>Sign-off</h2>\n' +
      '<table>\n<tr><th style="width:50%;">Name &amp; role</th><th>Signature / date</th></tr>\n' +
      (signoffs.length
        ? signoffs.map((s) => '<tr><td>' + esc(s.split('—')[0].trim() || s) + (s.includes('—') ? '<br /><span class="meta">' + esc(s.split('—').slice(1).join('—').trim()) + '</span>' : '') + '</td><td></td></tr>').join('\n')
        : '<tr><td>Client representative</td><td></td></tr>\n<tr><td>Provider representative</td><td></td></tr>') +
      '\n</table>\n';

    return htmlDoc('Scope of work — ' + title, body);
  },
  outputLabel: 'Scope document (HTML)',
  previewHtml: true,
  downloadName: 'project-scope',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   12. APP DESCRIPTION WRITER
   ═══════════════════════════════════════════════════════════════ */

const AppDescription = makeGen({
  fields: [
    { kind: 'text', id: 'name', label: 'App name', half: true, placeholder: 'Shiftly' },
    { kind: 'text', id: 'category', label: 'Category', half: true, placeholder: 'shift-planning app' },
    { kind: 'text', id: 'benefit', label: 'Core benefit (one sentence)', placeholder: 'Builds your team’s weekly schedule in under five minutes' },
    { kind: 'list', id: 'features', label: 'Key features', placeholder: 'Drag-and-drop shift builder\nAutomatic conflict detection\nPunch-clock with GPS check-in' },
    { kind: 'text', id: 'audience', label: 'Target audience', half: true, placeholder: 'Café, retail and restaurant managers' },
    {
      kind: 'select', id: 'tone', label: 'Tone', half: true, default: 'friendly',
      options: [
        { value: 'friendly', label: 'Friendly & warm' },
        { value: 'professional', label: 'Professional & confident' },
        { value: 'playful', label: 'Playful' },
        { value: 'bold', label: 'Bold & direct' },
      ],
    },
    { kind: 'text', id: 'cta', label: 'Closing call to action', placeholder: 'Download Shiftly free and publish your next schedule before your coffee cools.' },
  ],
  template: (v) => {
    const name = txt(v.name) || 'Your App';
    const cat = txt(v.category) || 'app';
    const benefit = txt(v.benefit) || 'saves you time every week';
    const feats = ls(v.features);
    const aud = txt(v.audience) || 'busy teams';
    const tone = txt(v.tone) || 'friendly';
    const cta = txt(v.cta) || 'Download today and see the difference.';

    const openers: Record<string, string> = { friendly: 'Meet', professional: 'Introducing', playful: 'Say hello to', bold: 'This is' };
    const closers: Record<string, string> = {
      friendly: 'Simple, dependable and easy to love — give it a try and make it yours.',
      professional: 'Built to a professional standard, with the details done properly.',
      playful: 'Warning: you may wonder how you ever managed without it.',
      bold: 'No fluff, no filler — just the fastest way to get it done.',
    };
    const art = /^[aeiou]/i.test(cat) ? 'an' : 'a';
    const benefitCap = benefit.charAt(0).toUpperCase() + benefit.slice(1);

    const out: string[] = [];
    out.push(name + ' — ' + benefit);
    out.push('');
    out.push((openers[tone] || 'Meet') + ' ' + name + ', ' + art + ' ' + cat + ' built for ' + aud + '. ' + benefitCap + ' — without the usual friction.');
    if (feats.length) {
      out.push('');
      out.push('KEY FEATURES');
      for (const f of feats) out.push('• ' + f);
    }
    out.push('');
    out.push('WHO IT IS FOR');
    out.push(name + ' is made for ' + aud + '. If ' + benefit + ' is on your wishlist, this is the ' + cat + ' you have been waiting for.');
    out.push('');
    out.push(closers[tone] || closers.friendly);
    out.push('');
    out.push(cta);
    return out.join('\n');
  },
  outputLabel: 'Store description',
  downloadName: 'app-description',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   13. APP REVIEW RESPONSE GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const ReviewResponse = makeGen({
  fields: [
    {
      kind: 'select', id: 'kind', label: 'Review type', default: 'praise',
      options: [
        { value: 'praise', label: '5★ praise' },
        { value: 'bug', label: '1★ bug report' },
        { value: 'crash', label: 'Crash report' },
        { value: 'feature', label: '3★ feature request' },
      ],
    },
    { kind: 'text', id: 'name', label: 'Reviewer name (optional)', half: true, placeholder: 'e.g. Sarah' },
    { kind: 'text', id: 'app', label: 'App name (optional)', half: true, placeholder: 'e.g. Shiftly' },
    { kind: 'textarea', id: 'note', label: 'The review (paste or summarize)', rows: 4, placeholder: 'Love the app but the widget stops updating after two days. Otherwise perfect!' },
  ],
  template: (v) => {
    const kind = txt(v.kind) || 'praise';
    const note = txt(v.note);
    const who = txt(v.name);
    const app = txt(v.app) || 'the app';
    const hi = who ? 'Hi ' + who + ',' : 'Hi there,';
    const gist = note ? (note.length > 100 ? note.slice(0, 97).trimEnd() + '…' : note) : '';

    const rule = '──────────────────────────────────────────────';
    const head = (n: number, t: string) => rule + '\nVARIANT ' + n + ' — ' + t + '\n' + rule;

    let out: string[] = [];
    if (kind === 'bug') {
      out = [
        head(1, 'APOLOGETIC & BRIEF'),
        hi + ' sorry about this — that should not happen. We have reproduced the issue and our team is on it. If you can, send your device model via Settings → Help; that detail speeds up the fix. Thanks for your patience, and for helping us improve ' + app + '.',
        '',
        head(2, 'DETAILED & SPECIFIC'),
        hi + ' thank you for the clear report, and we are sorry for the trouble.' + (gist ? ' What you describe — “' + gist + '” — is not the experience we intend.' : ' What you are describing is not the experience we intend.') + ' It is with our engineers now; the fix ships in the next update. In the meantime, reinstalling or clearing the app cache usually restores things — and our team in Settings → Help can walk you through it.',
        '',
        head(3, 'PERSONAL & HUMAN'),
        hi + ' you took time out of your day to tell us what broke, and that genuinely matters to a team our size. We read this aloud in standup (really). A fix is in progress — if anything else feels off before then, reply here or write to us from Settings → Help and a human will answer.',
      ];
    } else if (kind === 'crash') {
      out = [
        head(1, 'URGENT & BRIEF'),
        hi + ' crashes are our top priority, always. We are tracking this one right now — please update ' + app + ' when the next version lands, and if it still crashes afterwards, tell us from Settings → Help. Sorry for the disruption, and thank you for reporting it.',
        '',
        head(2, 'DIAGNOSTIC & SPECIFIC'),
        hi + ' thank you for the report — crashes are treated as build-blocking on our side.' + (gist ? ' The pattern you describe (“' + gist + '”) gives our engineers a strong starting point.' : '') + ' Two things that help us pin it down fastest: the device model and OS version, and the screen you were on when it happened. Send either here or via Settings → Help and we will chase it down.',
        '',
        head(3, 'HUMAN & REASSURING'),
        hi + ' nothing is more frustrating than losing what you were doing to a crash — we are sorry. This is exactly the kind of report that gets our full attention: it is already reproduced on our devices and a fix is in progress. Thank you for the patience, and for giving us the chance to make ' + app + ' better.',
      ];
    } else if (kind === 'feature') {
      out = [
        head(1, 'GRATEFUL & BRIEF'),
        hi + ' thanks for the thoughtful suggestion! This is exactly the kind of input that shapes our roadmap — it is logged with the team, and we will share news if it makes the cut. Keep the ideas coming.',
        '',
        head(2, 'PRODUCT-THINKING & SPECIFIC'),
        hi + ' this is a great suggestion, and the timing is interesting — it overlaps with direction we are already exploring.' + (gist ? ' Your point about “' + gist + '” in particular matches what other users have been asking for.' : '') + ' We cannot promise a date, but it is firmly on the roadmap discussion, and reviews like this are direct input into those decisions.',
        '',
        head(3, 'PERSONAL & HUMAN'),
        hi + ' three stars and a feature request is honestly one of our favorite kinds of reviews — it means you see the potential. We have added your idea to our candidate list for the next planning cycle, and we would love to hear more about how you would use it if you have a minute. Thanks for building ' + app + ' with us.',
      ];
    } else {
      out = [
        head(1, 'WARM & BRIEF'),
        hi + ' thank you for the five stars! Reviews like yours are the best part of building ' + app + '. If there is ever anything you would love to see next, we are one tap away in Settings → Help.',
        '',
        head(2, 'DETAILED & SPECIFIC'),
        hi + ' this made the whole team’s day — thank you.' + (gist ? ' So glad “' + gist + '” landed exactly as intended.' : '') + ' We read every review, and notes like this shape what we build next. Enjoy ' + app + ', and see you in the next update!',
        '',
        head(3, 'PERSONAL & HUMAN'),
        hi + ' five stars — you just made a small team of builders very happy. We put a lot of care into ' + app + ', and knowing it is working for you is why we keep going. Thanks for taking the time to write this; it genuinely helps others discover the app too.',
      ];
    }
    out.push('');
    out.push('NOTE: pick one variant, adjust one or two words to your voice, and post — future users read these as much as reviewers do.');
    return out.join('\n');
  },
  outputLabel: '3 reply variants',
  downloadName: 'review-responses',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   14. AD COPY GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const AdCopy = makeGen({
  fields: [
    { kind: 'text', id: 'product', label: 'Product / service', half: true, placeholder: 'Meal-prep delivery' },
    { kind: 'text', id: 'audience', label: 'Audience', half: true, placeholder: 'Busy parents' },
    { kind: 'textarea', id: 'benefit', label: 'Key benefit', rows: 2, placeholder: 'A week of healthy dinners without cooking or cleanup' },
    { kind: 'text', id: 'offer', label: 'Offer (optional)', half: true, placeholder: '$40 off your first two boxes' },
    {
      kind: 'select', id: 'platform', label: 'Platform', half: true, default: 'meta',
      options: [
        { value: 'meta', label: 'Facebook / Instagram' },
        { value: 'google', label: 'Google Search' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'tiktok', label: 'TikTok' },
      ],
    },
  ],
  template: (v) => {
    const product = txt(v.product) || 'our product';
    const aud = txt(v.audience) || 'busy people';
    const benefit = txt(v.benefit) || 'saves time and hassle';
    const offer = txt(v.offer);
    const platform = txt(v.platform) || 'meta';

    const ctas: Record<string, string[]> = {
      meta: ['Shop Now', 'Learn More', 'Sign Up'],
      google: ['Shop Now', 'Get a Quote', 'Call Today'],
      linkedin: ['Request Demo', 'Download', 'Register'],
      tiktok: ['Shop Now', 'Learn More', 'Download'],
    };
    const tips: Record<string, string> = {
      meta: 'Keep primary text under ~125 characters before the “See more” fold; the first 40 characters decide the stop.',
      google: 'Search ads: headlines ≤30 characters each, descriptions ≤90. Shorter, concrete claims win auctions.',
      linkedin: 'Lead with the professional outcome, not the product; LinkedIn readers respond to status and ROI.',
      tiktok: 'Write like a caption, not an ad — native-feeling copy outperforms polished brand lines.',
    };
    const c = ctas[platform] || ctas.meta;
    const decap = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
    const benefitLow = decap(benefit);

    const rule = '──────────────────────────────────────────────';
    const head = (n: number, t: string) => rule + '\nVARIATION ' + n + ' — ' + t + '\n' + rule;

    const out: string[] = [
      'AD COPY — 5 TEST VARIATIONS for ' + product.toUpperCase(),
      'Platform note: ' + tips[platform],
      '',
      head(1, 'BENEFIT-LED'),
      'Headline: ' + benefit.charAt(0).toUpperCase() + benefit.slice(1),
      'Primary text: Meet ' + product + ' — ' + benefitLow + '. Built for ' + aud + '.' + (offer ? ' ' + offer + '.' : ''),
      'CTA: ' + c[0],
      '',
      head(2, 'PROBLEM → SOLUTION'),
      'Headline: The smarter way for ' + aud,
      'Primary text: If ' + product + ' has been on your someday list, this is your sign. ' + benefit.charAt(0).toUpperCase() + benefit.slice(1) + ' — without the usual hassle.' + (offer ? ' ' + offer + '.' : ''),
      'CTA: ' + c[1],
      '',
      head(3, 'SOCIAL PROOF'),
      'Headline: ' + aud.charAt(0).toUpperCase() + aud.slice(1) + ' are switching to ' + product,
      'Primary text: Join the ' + aud + ' who already ' + benefitLow + ' with ' + product + '. See why they stay.' + (offer ? ' ' + offer + ' to start.' : ''),
      'CTA: ' + c[1],
      '',
      head(4, 'OFFER-LED'),
      'Headline: ' + (offer || 'Special launch offer inside'),
      'Primary text: For a limited time: ' + (offer || 'an introductory offer for new customers') + '. ' + product + ' gives ' + aud + ' ' + benefitLow + ' — claim it while it lasts.',
      'CTA: ' + c[0],
      '',
      head(5, 'CURIOSITY / BOLD CLAIM'),
      'Headline: There’s a reason ' + aud + ' keep ' + product + ' on hand',
      'Primary text: ' + benefit.charAt(0).toUpperCase() + benefit.slice(1) + '. That’s the reason. Try it once and see why word travels.' + (offer ? ' ' + offer + '.' : ''),
      'CTA: ' + c[2],
      '',
      'TESTING NOTE: run all five against the same audience and budget split, give each 1–2 weeks of data, then keep the winning angle and rewrite its weakest line.',
    ];
    return out.join('\n');
  },
  outputLabel: '5 ad variations',
  downloadName: 'ad-copy',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   15. CAPTION GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const Captions = makeGen({
  fields: [
    { kind: 'text', id: 'topic', label: 'Topic', placeholder: 'e.g. cold brew subscription', help: 'Specific beats broad — “cold brew subscription” outperforms “coffee”.' },
    {
      kind: 'select', id: 'tone', label: 'Tone', half: true, default: 'fun',
      options: [
        { value: 'fun', label: 'Fun & casual' },
        { value: 'professional', label: 'Professional' },
        { value: 'inspirational', label: 'Inspirational' },
        { value: 'luxury', label: 'Premium & polished' },
      ],
    },
    {
      kind: 'select', id: 'platform', label: 'Platform', half: true, default: 'instagram',
      options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'x', label: 'X (Twitter)' },
      ],
    },
    { kind: 'toggle', id: 'hashtags', label: 'Append hashtag suggestions', default: true },
  ],
  template: (v) => {
    const topic = txt(v.topic) || 'your topic';
    const tone = txt(v.tone) || 'fun';
    const platform = txt(v.platform) || 'instagram';
    const tags = bl(v.hashtags);

    const prefixes: Record<string, string> = {
      fun: 'Okay, real talk — ',
      professional: 'A quick observation — ',
      inspirational: 'Your reminder — ',
      luxury: 'Quietly exceptional — ',
    };
    const pfx = prefixes[tone] || '';

    const topicTags = topic
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => '#' + w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter((t) => t.length > 2);
    const staples: Record<string, string[]> = {
      instagram: ['#smallbusiness', '#instadaily', '#reels'],
      facebook: ['#smallbusiness', '#community'],
      tiktok: ['#fyp', '#learnontiktok'],
      linkedin: ['#professional', '#growth'],
      x: [],
    };
    const tagLine = (extra?: string) => {
      if (!tags) return '';
      const all = [...topicTags, ...(staples[platform] || [])];
      if (extra) all.unshift(extra);
      const seen = new Set<string>();
      const uniq = all.filter((t) => t.length > 2 && !seen.has(t) && seen.add(t));
      return uniq.slice(0, 8).join(' ');
    };

    const caps: { label: string; text: string; tag?: string }[] = [
      { label: 'THE QUESTION HOOK', text: pfx + 'what if ' + topic + ' didn’t have to be complicated? Here’s the three-step version we wish someone had told us first.' },
      { label: 'THE BOLD STATEMENT', text: topic.charAt(0).toUpperCase() + topic.slice(1) + ' is changing fast. The businesses that adapt early will own the next five years — here’s what we’re seeing.' },
      { label: 'BEHIND THE SCENES', text: 'Behind the scenes: this is what ' + topic + ' actually looks like on our side. Messy notes, strong opinions, and one rule — keep it useful.' },
      { label: 'SAVE-THIS VALUE POST', text: 'Save this post: everything we’ve learned about ' + topic + ', distilled into a checklist you can run this week.' },
      { label: 'THE TAG-A-FRIEND', text: 'Tag someone who needs ' + topic + ' in their life — you know exactly who we mean.' },
      { label: 'DIRECT CTA', text: pfx + 'ready to take ' + topic + ' seriously? Start with one small step today, and tell us how it goes in the comments.' },
    ];

    const rule = '──────────────────────────────────────────────';
    const out: string[] = ['6 CAPTIONS — ' + topic.toUpperCase() + ' (' + platform.toUpperCase() + ', ' + tone + ')', ''];
    caps.forEach((cap, i) => {
      out.push(rule);
      out.push((i + 1) + ' — ' + cap.label);
      out.push(rule);
      out.push(cap.text.charAt(0).toUpperCase() + cap.text.slice(1));
      const t = tagLine();
      if (t) out.push('Hashtags: ' + t);
      out.push('');
    });
    out.push('TIP: the first line is the hook — feeds truncate after one or two lines, so never bury the interesting part.');
    return out.join('\n');
  },
  outputLabel: '6 captions',
  downloadName: 'captions',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   16. CONTENT CALENDAR GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const ContentCalendar = makeGen({
  fields: [
    { kind: 'text', id: 'niche', label: 'Niche / topic', half: true, placeholder: 'home barista' },
    {
      kind: 'select', id: 'platform', label: 'Platform', half: true, default: 'instagram',
      options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'x', label: 'X (Twitter)' },
        { value: 'youtube', label: 'YouTube Shorts' },
      ],
    },
    {
      kind: 'select', id: 'frequency', label: 'Posting frequency', half: true, default: 'daily',
      options: [
        { value: 'daily', label: 'Every day — 30 posts' },
        { value: 'weekdays', label: 'Weekdays only — ~22 posts' },
        { value: 'three', label: '3× per week (Mon/Wed/Fri) — 13 posts' },
      ],
    },
    {
      kind: 'select', id: 'goal', label: 'Primary goal', half: true, default: 'engagement',
      options: [
        { value: 'awareness', label: 'Awareness — grow reach' },
        { value: 'engagement', label: 'Engagement — comments & saves' },
        { value: 'traffic', label: 'Traffic — clicks to site' },
        { value: 'sales', label: 'Sales — product focus' },
      ],
    },
  ],
  template: (v) => {
    const niche = txt(v.niche) || 'your niche';
    const platform = txt(v.platform) || 'instagram';
    const freq = txt(v.frequency) || 'daily';
    const goal = txt(v.goal) || 'engagement';

    const platformLabel: Record<string, string> = {
      instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn',
      facebook: 'Facebook', x: 'X (Twitter)', youtube: 'YouTube Shorts',
    };
    const goalLabel: Record<string, string> = {
      awareness: 'Awareness', engagement: 'Engagement', traffic: 'Traffic', sales: 'Sales',
    };
    const freqLabel: Record<string, string> = {
      daily: 'Every day', weekdays: 'Weekdays only', three: '3× per week',
    };

    const ideas = [
      'How to get started with ' + niche + ' (beginner roadmap)',
      '5 mistakes people make with ' + niche + ' — and the fix',
      'Myth vs. fact: what really works in ' + niche,
      'Behind the scenes: our ' + niche + ' process',
      'The question everyone asks us about ' + niche,
      'Checklist: the ' + niche + ' essentials we never skip',
      '3 tools we use every day for ' + niche,
      'Before & after: a real ' + niche + ' transformation',
      'The fastest win we know in ' + niche,
      'Trend watch: what is changing in ' + niche + ' right now',
      'Save this: a simple weekly ' + niche + ' routine',
      'Hot take: most ' + niche + ' advice is backwards',
      'A ' + niche + ' number that genuinely surprised us',
      'Mini-tutorial: ' + niche + ' in 60 seconds',
      'Recap: the best ' + niche + ' tip from this month',
    ];

    const formats: Record<string, string[]> = {
      instagram: ['Reel', 'Carousel', 'Story', 'Photo post'],
      tiktok: ['Short video', 'Talking head', 'Trend remix', 'Tutorial'],
      linkedin: ['Text post', 'Document post', 'Poll', 'Case study'],
      facebook: ['Reel', 'Link post', 'Photo album', 'Group prompt'],
      x: ['Thread', 'Single post', 'Quote repost', 'Poll'],
      youtube: ['Short', 'Explainer', 'Myth-bust', 'Vlog cut'],
    };
    const pillars: Record<string, string[]> = {
      awareness: ['Educate', 'Inspire', 'Behind-scenes', 'Trend', 'Promote'],
      engagement: ['Ask', 'Educate', 'Community', 'Fun', 'Promote'],
      traffic: ['Educate', 'Teaser', 'Value', 'Promote', 'Educate'],
      sales: ['Product', 'Proof', 'Offer', 'Educate', 'Objection'],
    };
    const pillarCta: Record<string, string> = {
      Educate: 'Save this for later',
      Inspire: 'Share it with someone who needs it',
      'Behind-scenes': 'Ask us anything in the comments',
      Trend: 'Stitch / reply with your take',
      Promote: 'Link in bio — details inside',
      Ask: 'Answer in the comments',
      Community: 'Tag a friend who gets it',
      Fun: 'Vote in the poll',
      Product: 'See it in the shop',
      Proof: 'Read the full story — link in bio',
      Offer: 'Claim it before it ends',
      Teaser: 'Read the rest — link in bio',
      Value: 'Save this checklist',
      Objection: 'Questions? DM us',
    };

    const allowed = (d: number): boolean => {
      if (freq === 'weekdays') return d % 7 !== 0 && d % 7 !== 6;
      if (freq === 'three') return d % 7 === 1 || d % 7 === 3 || d % 7 === 5;
      return true;
    };

    const fmts = formats[platform] || formats.instagram;
    const pl = pillars[goal] || pillars.engagement;
    const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 3).trimEnd() + '...');

    const rows: string[] = [];
    let i = 0;
    for (let d = 1; d <= 30; d++) {
      if (!allowed(d)) continue;
      const pillar = pl[i % pl.length];
      const format = fmts[(i * 2 + 1) % fmts.length];
      const idea = ideas[(i * 3 + 2) % ideas.length];
      const cta = pillarCta[pillar] || 'Follow for more';
      rows.push(
        ('Day ' + String(d).padStart(2, '0')).padEnd(9) +
        pillar.padEnd(14) +
        format.padEnd(15) +
        clip(idea, 44).padEnd(44) +
        cta
      );
      i++;
    }

    const header =
      'Day      Pillar         Format         Idea                                         Call to action';
    const divider = '──────────────────────────────────────────────────────────────────────────────────────';

    return [
      '30-DAY CONTENT CALENDAR',
      'Niche: ' + niche + '   |   Platform: ' + (platformLabel[platform] || platform) +
        '   |   Goal: ' + (goalLabel[goal] || goal) + '   |   Frequency: ' + (freqLabel[freq] || freq),
      'Week starts Monday (Day 1 = Monday) — shift day labels if your week starts differently.',
      '',
      header,
      divider,
      ...rows,
      divider,
      'Total scheduled posts: ' + rows.length,
      'Pillars rotate so the feed never reads as an ad channel — Promote days are capped on purpose.',
    ].join('\n');
  },
  outputLabel: '30-day calendar',
  downloadName: 'content-calendar',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   17. LINKEDIN HEADLINE GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const LinkedinHeadline = makeGen({
  fields: [
    { kind: 'text', id: 'role', label: 'Role / title', half: true, placeholder: 'Product Manager' },
    { kind: 'text', id: 'industry', label: 'Industry', half: true, placeholder: 'SaaS / fintech' },
    { kind: 'text', id: 'skill', label: 'Top skill (searchable)', half: true, placeholder: 'product strategy', help: 'The exact phrase recruiters or clients would type.' },
    { kind: 'text', id: 'value', label: 'Value proposition', half: true, placeholder: 'helping teams ship faster with less rework' },
    {
      kind: 'select', id: 'style', label: 'Lead style', default: 'professional',
      options: [
        { value: 'professional', label: 'Professional' },
        { value: 'results', label: 'Results-driven' },
        { value: 'bold', label: 'Bold' },
        { value: 'approachable', label: 'Approachable' },
        { value: 'hiring', label: 'Job-seeking' },
      ],
    },
  ],
  template: (v) => {
    const role = txt(v.role) || 'Product Manager';
    const ind = txt(v.industry) || 'tech';
    const skill = txt(v.skill) || 'product strategy';
    const val = txt(v.value) || 'helping teams ship faster';
    const style = txt(v.style) || 'professional';

    const t: Record<string, string> = {
      classic: role + ' | ' + ind + ' | ' + val,
      value: 'Helping ' + ind + ' teams ' + val,
      skill: role + ' · ' + skill + ' · ' + ind,
      bold: val.charAt(0).toUpperCase() + val.slice(1) + '. That is what I do as a ' + role + '.',
      warm: role + ' who loves ' + skill + ' — sharing what actually works in ' + ind + '.',
      seo: role + ' | ' + skill + ' | ' + ind + ' | ' + val,
    };
    const labels: Record<string, string> = {
      classic: 'Classic & clear', value: 'Value-first', skill: 'Skill spotlight',
      bold: 'Bold statement', warm: 'Approachable', seo: 'Keyword-optimized',
    };
    const orders: Record<string, string[]> = {
      professional: ['classic', 'value', 'seo', 'skill', 'bold', 'warm'],
      results: ['value', 'bold', 'classic', 'seo', 'skill', 'warm'],
      bold: ['bold', 'value', 'classic', 'warm', 'skill', 'seo'],
      approachable: ['warm', 'value', 'skill', 'classic', 'bold', 'seo'],
      hiring: ['skill', 'classic', 'value', 'seo', 'warm', 'bold'],
    };
    const styleLabel: Record<string, string> = {
      professional: 'Professional', results: 'Results-driven', bold: 'Bold',
      approachable: 'Approachable', hiring: 'Job-seeking',
    };
    const order = orders[style] || orders.professional;

    const out: string[] = [
      '6 LINKEDIN HEADLINES — ' + (styleLabel[style] || 'Professional') + ' lead',
      '',
    ];
    order.forEach((k, i) => {
      out.push((i + 1) + '. [' + labels[k] + ']');
      out.push('   ' + t[k]);
      out.push('');
    });
    if (style === 'hiring') {
      out.push('JOB-SEEKING BOOST: append “· Open to new opportunities” to your pick and enable the #OpenToWork frame — recruiters filter on both.');
      out.push('');
    }
    out.push('CHARACTER NOTES: the cap is 220 characters, and some views truncate around 120 — keep the role and skill keywords in the first half so they survive truncation.');
    return out.join('\n');
  },
  outputLabel: '6 headline variants',
  downloadName: 'linkedin-headlines',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   18. BUSINESS NAME GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const BusinessName = makeGen({
  fields: [
    { kind: 'text', id: 'keyword', label: 'Core keyword', placeholder: 'e.g. coffee, studio, logistics', help: 'One word works best — it drives the whole combinator.' },
    {
      kind: 'select', id: 'style', label: 'Lead style', default: 'modern',
      options: [
        { value: 'modern', label: 'Modern & brandable' },
        { value: 'classic', label: 'Classic & professional' },
        { value: 'compound', label: 'Descriptive compounds' },
        { value: 'playful', label: 'Playful & catchy' },
      ],
    },
    { kind: 'text', id: 'location', label: 'Location (optional)', half: true, placeholder: 'e.g. Austin' },
  ],
  template: (v) => {
    const kwRaw = txt(v.keyword) || 'studio';
    const style = txt(v.style) || 'modern';
    const loc = txt(v.location);

    const words = kwRaw.split(/\s+/).filter(Boolean);
    const base = (words[0] || 'nova').toLowerCase().replace(/[^a-z]/g, '') || 'nova';
    const Cap = base.charAt(0).toUpperCase() + base.slice(1);
    const locCap = loc ? loc.toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

    const groups: { name: string; names: string[] }[] = [
      { name: 'MODERN & BRANDABLE', names: [Cap + 'ly', Cap + 'ify', Cap + 'io', Cap + 'sy', Cap + 'ora'] },
      { name: 'CLASSIC & PROFESSIONAL', names: [Cap + ' & Co.', Cap + ' Group', Cap + ' Partners', Cap + ' Advisory'] },
      { name: 'DESCRIPTIVE COMPOUNDS', names: [Cap + 'Labs', Cap + 'Hub', Cap + 'Works', Cap + 'Forge', Cap + 'Craft', Cap + 'Nest'] },
      { name: 'PLAYFUL & CATCHY', names: ['Go' + Cap, 'Get' + Cap, 'Zen' + Cap, 'Hey' + Cap, 'Bright' + Cap] },
      locCap
        ? { name: 'LOCATION-FLAVORED', names: [locCap + ' ' + Cap, Cap + ' ' + locCap, Cap + ' of ' + locCap, locCap + ' ' + Cap + ' Co.'] }
        : { name: 'MINIMAL & MODERN', names: [Cap, base, 'The ' + Cap, Cap + ' Co.'] },
    ];

    const order: Record<string, string[]> = {
      modern: ['MODERN & BRANDABLE', 'DESCRIPTIVE COMPOUNDS', 'PLAYFUL & CATCHY', 'CLASSIC & PROFESSIONAL', locCap ? 'LOCATION-FLAVORED' : 'MINIMAL & MODERN'],
      classic: ['CLASSIC & PROFESSIONAL', 'DESCRIPTIVE COMPOUNDS', 'MINIMAL & MODERN', 'MODERN & BRANDABLE', locCap ? 'LOCATION-FLAVORED' : 'PLAYFUL & CATCHY'],
      compound: ['DESCRIPTIVE COMPOUNDS', 'MODERN & BRANDABLE', 'PLAYFUL & CATCHY', 'CLASSIC & PROFESSIONAL', locCap ? 'LOCATION-FLAVORED' : 'MINIMAL & MODERN'],
      playful: ['PLAYFUL & CATCHY', 'MODERN & BRANDABLE', 'DESCRIPTIVE COMPOUNDS', 'CLASSIC & PROFESSIONAL', locCap ? 'LOCATION-FLAVORED' : 'MINIMAL & MODERN'],
    };
    const ordered = (order[style] || order.modern)
      .map((name) => groups.find((g) => g.name === name))
      .filter(Boolean) as { name: string; names: string[] }[];

    const seen = new Set<string>();
    let count = 0;
    const out: string[] = [
      '~20 NAME IDEAS from the seed “' + kwRaw + '”' + (locCap ? ' + ' + locCap : ''),
      '',
    ];
    for (const g of ordered) {
      out.push('■ ' + g.name);
      for (const n of g.names) {
        if (seen.has(n)) continue;
        seen.add(n);
        count++;
        out.push('   • ' + n);
      }
      out.push('');
    }
    out.push('NEXT STEPS (' + count + ' candidates):');
    out.push('1. Shortlist 3–5 that are easy to say and spell after hearing once.');
    out.push('2. Check the .com (or a clean alternative TLD) and company registries.');
    out.push('3. Search the trademark register (USPTO / EUIPO / UKIPO) for the mark and close variants.');
    out.push('4. Say it out loud in a sentence — “I booked with ___” — if it stumbles, it is not the one.');
    return out.join('\n');
  },
  outputLabel: 'Name ideas',
  downloadName: 'business-names',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   19. BACKLINK ANCHOR TEXT GENERATOR
   ═══════════════════════════════════════════════════════════════ */

const AnchorText = makeGen({
  fields: [
    { kind: 'text', id: 'keyword', label: 'Target keyword', half: true, placeholder: 'email drip campaigns' },
    { kind: 'text', id: 'brand', label: 'Brand name', half: true, placeholder: 'Mailflow' },
    { kind: 'text', id: 'url', label: 'Target URL', placeholder: 'https://mailflow.com/guides/drip-campaigns' },
  ],
  template: (v) => {
    const kw = txt(v.keyword) || 'your keyword';
    const brand = txt(v.brand) || 'Your Brand';
    const url = txt(v.url) || 'https://example.com';
    const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const kwCap = kw.charAt(0).toUpperCase() + kw.slice(1);

    const buckets: { name: string; pct: string; why: string; items: string[] }[] = [
      {
        name: 'BRANDED',
        pct: '35%',
        why: 'Safest anchor class — builds entity trust and never reads as manipulation.',
        items: [brand, brand + ' team', 'go to ' + brand, host],
      },
      {
        name: 'NAKED URL',
        pct: '10%',
        why: 'Natural in citations, resource pages and author bios.',
        items: [url, host, 'www.' + host],
      },
      {
        name: 'GENERIC',
        pct: '5%',
        why: 'Keeps the profile human; low value, low risk.',
        items: ['click here', 'this guide', 'learn more', 'this resource'],
      },
      {
        name: 'PARTIAL MATCH',
        pct: '25%',
        why: 'Carries topical relevance while staying natural — your workhorse bucket.',
        items: ['guide to ' + kw, kw + ' tips', 'how to approach ' + kw, kw + ' strategies', 'more about ' + kw],
      },
      {
        name: 'EXACT MATCH',
        pct: '10%',
        why: 'Strongest relevance signal — keep it scarce or filters read it as a pattern.',
        items: [kw, kwCap],
      },
      {
        name: 'LONG-TAIL & QUESTION',
        pct: '15%',
        why: 'Mirrors how real writers actually reference content.',
        items: ['what is ' + kw, 'how does ' + kw + ' work', kw + ' explained simply', 'why ' + kw + ' matters'],
      },
    ];

    const out: string[] = [
      'ANCHOR TEXT PLAN — target: ' + kw,
      'URL: ' + url + '   |   Brand: ' + brand,
      '',
    ];
    buckets.forEach((b, i) => {
      out.push((i + 1) + '. ' + b.name + ' — ' + b.pct + ' of links');
      out.push('   Why: ' + b.why);
      for (const item of b.items) out.push('   • ' + item);
      out.push('');
    });
    out.push('HOW TO USE THIS PLAN:');
    out.push('• Treat the percentages as a target for your next 20–30 links, not a per-link rule.');
    out.push('• Natural profiles are top-heavy on branded and naked URLs — if your existing profile is exact-match heavy, prioritize branded links first.');
    out.push('• Vary word order and add surrounding context when you can influence it (“read our guide to ' + kw + '” beats a bare exact match).');
    return out.join('\n');
  },
  outputLabel: 'Anchor text plan',
  downloadName: 'anchor-text-plan',
  downloadExt: 'txt',
});

/* ═══════════════════════════════════════════════════════════════
   20. AUDIENCE PERSONA BUILDER
   ═══════════════════════════════════════════════════════════════ */

const PersonaBuilder = makeGen({
  fields: [
    { kind: 'text', id: 'name', label: 'Persona name', half: true, placeholder: 'Operations Olivia' },
    { kind: 'text', id: 'age', label: 'Age range', half: true, placeholder: '32–42' },
    { kind: 'text', id: 'role', label: 'Role / job title', half: true, placeholder: 'Operations manager' },
    { kind: 'text', id: 'industry', label: 'Industry', half: true, placeholder: 'Regional logistics' },
    { kind: 'text', id: 'budget', label: 'Budget & sensitivity', half: true, placeholder: '$5–15k/year; needs ROI proof in 90 days' },
    { kind: 'text', id: 'channels', label: 'Trusted channels', half: true, placeholder: 'LinkedIn, operator newsletters, peer Slack groups' },
    { kind: 'textarea', id: 'goals', label: 'Goals (what they want to achieve)', rows: 4, placeholder: 'Cut manual scheduling to under 2 hours a week.\nLook genuinely modern in front of the executive team.' },
    { kind: 'list', id: 'pains', label: 'Pain points', placeholder: 'Drowning in spreadsheets\nTools that ignore how dispatch actually works\nVendors who disappear after the sale' },
    { kind: 'textarea', id: 'triggers', label: 'Buying triggers', rows: 3, placeholder: 'A missed deadline that reaches a customer.\nA key operator quitting and taking tribal knowledge with them.' },
  ],
  template: (v) => {
    const name = txt(v.name) || 'Your Persona';
    const age = txt(v.age) || '—';
    const role = txt(v.role) || '—';
    const industry = txt(v.industry) || '—';
    const budget = txt(v.budget) || '—';
    const channels = txt(v.channels) || '—';
    const goals = ls(v.goals);
    const pains = ls(v.pains);
    const triggers = ls(v.triggers);

    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');

    const listHtml = (arr: string[]) => arr.length ? '<ul>' + arr.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<p class="meta">—</p>';
    const chips = channels
      .split(/[,;]/)
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => '<span class="chip">' + esc(c) + '</span>')
      .join('');

    const body =
      '<div class="persona-head">\n' +
      '  <div class="avatar">' + esc(initials) + '</div>\n' +
      '  <div>\n' +
      '    <h1 style="margin-bottom:4px;">' + esc(name) + '</h1>\n' +
      '    <p style="margin:0;">' + esc(role) + ' · ' + esc(industry) + '</p>\n' +
      '    <p style="margin:4px 0 0;"><span class="chip">Age ' + esc(age) + '</span><span class="chip">Budget: ' + esc(budget) + '</span></p>\n' +
      '  </div>\n</div>\n' +

      '<div class="grid2">\n' +
      '  <section><h2>Goals</h2><p class="meta">What pulls them forward</p>' + listHtml(goals) + '</section>\n' +
      '  <section><h2>Pain points</h2><p class="meta">What pushes them away from the status quo</p>' + listHtml(pains) + '</section>\n' +
      '</div>\n' +

      '<h2>Buying triggers</h2>\n' +
      '<p class="meta">Events that start an active search — market to the trigger, not the demographic:</p>\n' + listHtml(triggers) +

      '<h2>Trusted channels</h2>\n' +
      '<p>' + (chips || '<span class="meta">—</span>') + '</p>\n' +

      '<h2>How to win them</h2>\n' +
      '<ul>\n' +
      '  <li>Lead with outcomes, not features — tie every message to a goal above.</li>\n' +
      '  <li>Name a pain in the first line; recognition is what earns the next 10 seconds.</li>\n' +
      '  <li>Show proof from someone like them (same industry, same role) before any ask.</li>\n' +
      '  <li>Remove risk: free trial, pilot, or a 90-day success metric they can take upstairs.</li>\n' +
      '</ul>\n' +

      '<p class="meta">Persona sheet — review quarterly and date-stamp every update. A persona no one has refreshed in two years is fiction wearing a headshot.</p>';

    return htmlDoc('Persona — ' + name, body, PERSONA_CSS);
  },
  outputLabel: 'Persona sheet (HTML)',
  previewHtml: true,
  downloadName: 'audience-persona',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   21. LOGO COLOR PSYCHOLOGY TOOL
   ═══════════════════════════════════════════════════════════════ */

const LogoColors = makeGen({
  fields: [
    {
      kind: 'select', id: 'industry', label: 'Your industry', default: 'tech',
      options: [
        { value: 'tech', label: 'Technology & SaaS' },
        { value: 'finance', label: 'Finance & Insurance' },
        { value: 'health', label: 'Health & Wellness' },
        { value: 'food', label: 'Food & Restaurant' },
        { value: 'realestate', label: 'Real Estate & Property' },
        { value: 'creative', label: 'Creative & Agency' },
        { value: 'fitness', label: 'Fitness & Sport' },
        { value: 'education', label: 'Education & Learning' },
      ],
    },
    {
      kind: 'select', id: 'feeling', label: 'Feeling to trigger', default: 'trust',
      options: [
        { value: 'trust', label: 'Trust & stability' },
        { value: 'energy', label: 'Energy & excitement' },
        { value: 'calm', label: 'Calm & wellness' },
        { value: 'luxury', label: 'Premium & luxury' },
        { value: 'growth', label: 'Growth & innovation' },
        { value: 'friendly', label: 'Friendly & approachable' },
      ],
    },
  ],
  template: (v) => {
    const industry = txt(v.industry) || 'tech';
    const feeling = txt(v.feeling) || 'trust';
    const ind = INDUSTRY_NOTES[industry] || INDUSTRY_NOTES.tech;
    const palettes = PALETTES[feeling] || PALETTES.trust;
    const feelingLabel: Record<string, string> = {
      trust: 'Trust & stability', energy: 'Energy & excitement', calm: 'Calm & wellness',
      luxury: 'Premium & luxury', growth: 'Growth & innovation', friendly: 'Friendly & approachable',
    };

    const swatches = palettes
      .map((p) =>
        '<h2>' + esc(p.name) + '</h2>\n<p>' + esc(p.note) + '</p>\n<div class="swrow">\n' +
        p.chips
          .map(
            (c) =>
              '<div class="sw"><div class="box" style="background:' + c.hex + ';"></div>' +
              '<p class="nm">' + esc(c.name) + '</p><p class="hx">' + esc(c.hex) + ' · ' + esc(c.role) + '</p></div>'
          )
          .join('\n') +
        '\n</div>'
      )
      .join('\n');

    const body =
      '<h1>Logo color palettes for ' + esc(ind.label) + '</h1>\n' +
      '<p class="meta">Feeling target: ' + esc(feelingLabel[feeling] || feeling) + ' · 3 palettes × 4 roles · hex codes ready for your designer</p>\n' +
      swatches + '\n' +
      '<h2>Psychology in ' + esc(ind.label) + '</h2>\n' +
      '<p>' + esc(ind.note) + '</p>\n' +
      '<div class="dodont"><strong>Do:</strong><ul>' + ind.dos.map((d) => '<li>' + esc(d) + '</li>').join('') + '</ul></div>\n' +
      '<div class="dodont no"><strong>Avoid:</strong><ul>' + ind.donts.map((d) => '<li>' + esc(d) + '</li>').join('') + '</ul></div>\n' +
      '<h2>Applying it</h2>\n' +
      '<p>Use the 60/30/10 rule: dominant color ~60% of the composition, secondary ~30%, and the accent — reserved for calls-to-action and the moments you want noticed. Check every text/background pair against WCAG AA (4.5:1 for body text), and test the logo at 16 pixels before you commit.</p>';

    return htmlDoc('Logo colors — ' + ind.label, body, SWATCH_CSS);
  },
  outputLabel: 'Palettes & psychology',
  previewHtml: true,
  downloadName: 'logo-color-palettes',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   22. NAP CONSISTENCY CHECKER
   ═══════════════════════════════════════════════════════════════ */

const NapChecker = makeGen({
  fields: [
    { kind: 'text', id: 'name', label: 'Business name (exact, canonical spelling)', placeholder: 'e.g. Acme Dental Studio — pick one form and keep it everywhere' },
    { kind: 'list', id: 'address', label: 'Address lines', placeholder: '123 S Main St, Suite 4' },
    { kind: 'text', id: 'city', label: 'City', half: true, placeholder: 'Springfield' },
    { kind: 'text', id: 'state', label: 'State (2-letter code)', half: true, placeholder: 'IL' },
    { kind: 'text', id: 'zip', label: 'ZIP / postcode', half: true, placeholder: '62701' },
    { kind: 'text', id: 'phone', label: 'Primary phone', half: true, placeholder: '(217) 555-0142', help: 'Never a tracking number — it must match every listing.' },
    { kind: 'text', id: 'website', label: 'Website', placeholder: 'acmedental.com' },
  ],
  template: (v) => {
    const name = txt(v.name) || 'My Business';
    const addrLines = ls(v.address);
    const city = txt(v.city);
    const st = txt(v.state);
    const zip = txt(v.zip);
    const phoneFmt = formatPhone(txt(v.phone));
    const site = txt(v.website);
    const url = site ? (site.startsWith('http') ? site : 'https://' + site) : '';

    const addr = addrLines.join(', ');
    const cityLine = [city, [st, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');

    const napPlain = [name, addr, cityLine, phoneFmt, url].filter(Boolean).join('\n');

    const md =
      '<div itemscope itemtype="https://schema.org/LocalBusiness">\n' +
      '  <span itemprop="name">' + escapeHtml(name) + '</span><br />\n' +
      (addr
        ? '  <address itemprop="address" itemscope itemtype="https://schema.org/PostalAddress" style="font-style:normal;">\n' +
          '    <span itemprop="streetAddress">' + escapeHtml(addr) + '</span><br />\n' +
          (city ? '    <span itemprop="addressLocality">' + escapeHtml(city) + '</span>, ' : '') +
          (st ? '<span itemprop="addressRegion">' + escapeHtml(st) + '</span> ' : '') +
          (zip ? '<span itemprop="postalCode">' + escapeHtml(zip) + '</span>' : '') + '<br />\n' +
          '  </address><br />\n'
        : '') +
      (phoneFmt ? '  <span itemprop="telephone">' + escapeHtml(phoneFmt) + '</span><br />\n' : '') +
      (url ? '  <a itemprop="url" href="' + escapeHtml(url) + '">' + escapeHtml(url) + '</a>\n' : '') +
      '</div>';

    const checklist = [
      'Use the exact same business name everywhere — “Acme Dental” and “Acme Dental Studio” are two different entities to a search engine. Pick the legal or most common form and lock it.',
      'Standardize street suffixes: choose “St” or “Street” and never mix them across listings. USPS-standardized addresses also improve mail deliverability.',
      'Keep suite/unit formatting identical (“Suite 4” vs “Ste 4” vs “#4”) — minor variants add small confidence deductions that compound.',
      'One primary phone number everywhere. Call-tracking numbers on directories split your NAP signal and can cost you the maps pack.',
      'Fix the phone format too: this sheet normalizes to (XXX) XXX-XXXX for 10-digit US numbers — use the same rendering in every listing.',
      'Use the 2-letter state code consistently, and never abbreviate the city one place and spell it out another.',
      'Publish the canonical NAP in your site footer with LocalBusiness microdata (above) — it becomes the source of truth every citation should copy.',
      'Re-audit quarterly and within one week of any move or rebrand: update Google Business Profile first, then Apple Maps, Bing Places, Yelp and industry directories.',
    ];

    const body =
      '<h1>NAP Consistency Sheet</h1>\n' +
      '<p class="meta">' + esc(name) + ' · canonical data for citations, directories and schema</p>\n' +

      '<h2>Canonical NAP — copy this everywhere</h2>\n' +
      '<div class="napbox">' + napPlain.split('\n').map((l) => esc(l)).join('<br />') + '</div>\n' +

      '<h2>Copy-paste LocalBusiness microdata</h2>\n' +
      '<p class="meta">Paste into your site footer or contact page — view source to copy the raw HTML:</p>\n' +
      '<pre class="md">' + escapeHtml(md) + '</pre>\n' +

      '<h2>The 8-point consistency checklist</h2>\n' +
      '<ol class="check">\n' + checklist.map((c) => '<li>' + esc(c) + '</li>').join('\n') + '\n</ol>\n' +

      '<p class="meta">Why it matters: search engines cross-check your details across the web to build confidence in your entity. Consistent NAP is a confirmed local ranking signal — mismatched listings are among the most common findings on businesses stuck just outside the maps pack.</p>';

    return htmlDoc('NAP consistency — ' + name, body, NAP_CSS);
  },
  outputLabel: 'NAP sheet (HTML)',
  previewHtml: true,
  downloadName: 'nap-consistency',
  downloadExt: 'html',
});

/* ═══════════════════════════════════════════════════════════════
   BATCH EXPORT — slug + component + unique page copy per tool
   ═══════════════════════════════════════════════════════════════ */

export const batch: BatchTool[] = [
  {
    slug: 'meta-tag-generator',
    Component: MetaTags,
    doc: {
      longDescription:
        'Your title tag and meta description are the snippet searchers actually see — they decide the click long before your page loads. This generator turns a short form into a clean, copy-ready <head> block with canonical link, robots directives and the viewport tag done properly.',
      howTo: [
        'Type the page title and a 150–160 character description — the two lines Google shows on the results page.',
        'Add keywords, author and the canonical URL so every tag on the page agrees on a single address.',
        'Pick a robots directive: keep index, follow for normal pages and switch to noindex only for thank-you or internal screens.',
        'Copy the block into the <head> of your HTML or paste each value into your CMS SEO settings.',
      ],
      faqs: [
        {
          q: 'Does Google still use the keywords meta tag?',
          a: 'No — Google has ignored it since 2009, and Bing treats stuffing as a spam signal. Fill it in only if niche engines or internal site search still read it, and keep it to a handful of genuinely relevant terms.',
        },
        {
          q: 'What happens if my title runs past 60 characters?',
          a: 'Google rewrites or truncates the display title around 580–600 pixels, so carefully chosen words can vanish. Front-load the important phrase in the first 50 characters and let the brand name sit at the end.',
        },
        {
          q: 'When should I use noindex?',
          a: 'On pages that add no search value — cart pages, internal search results, confirmation screens, staging copies. Pair it with follow when you still want link equity to flow through the page’s outbound links.',
        },
      ],
    },
  },
  {
    slug: 'robots-txt-generator',
    Component: RobotsTxt,
    doc: {
      longDescription:
        'robots.txt is the first file well-behaved crawlers read, and one wrong Disallow line can deindex an entire section of your site. This generator writes it for you — an open policy, a full staging block, or a custom rule set — plus crawl-delay and a sitemap pointer.',
      howTo: [
        'Choose a default policy: allow everything for live sites, block everything for staging copies, or write custom rules.',
        'In custom mode, list the paths to hide — one per line, like /admin or /private — and they become Disallow entries.',
        'Set a crawl-delay only if a specific bot is hammering your server; most major crawlers ignore it anyway.',
        'Add your sitemap URL, download the file as robots.txt, and upload it to your site root.',
      ],
      faqs: [
        {
          q: 'Is robots.txt the right place to hide private pages?',
          a: 'No — it is a public file that tells anyone exactly which paths exist, and some scrapers ignore it entirely. Use authentication for anything sensitive; robots.txt controls crawling, not access.',
        },
        {
          q: 'Which crawlers actually respect Crawl-delay?',
          a: 'Bing, Yandex, DuckDuckGo and most smaller bots honour it; Google explicitly does not. To slow Google’s crawl rate you adjust settings in Search Console or fix the server responses that trigger throttling.',
        },
        {
          q: 'Should my sitemap URL live in robots.txt?',
          a: 'It is not required, but it is free discovery — bots from every engine read the file and will find your sitemap even without Search Console. Use the absolute URL, https included.',
        },
      ],
    },
  },
  {
    slug: 'sitemap-xml-generator',
    Component: SitemapXml,
    doc: {
      longDescription:
        'A sitemap.xml hands search engines your canonical URL list in the exact protocol they parse — no crawling required to discover new pages. Paste your URLs here and export a spec-compliant file with sensible changefreq and priority values on every entry.',
      howTo: [
        'Paste every indexable URL, one per line — homepage first, then sections, then individual pages or posts.',
        'Choose how often the typical page changes and how important it is relative to the rest of the site.',
        'Save the output as sitemap.xml and upload it to your site root so it serves at yoursite.com/sitemap.xml.',
        'Submit it in Google Search Console and Bing Webmaster Tools so indexing starts immediately.',
      ],
      faqs: [
        {
          q: 'Do changefreq and priority actually matter?',
          a: 'Google mostly ignores both — it infers recency from real signals — but they cost nothing and some smaller engines still read them. Honest values beat aggressive ones; claiming hourly updates on a static page helps nobody.',
        },
        {
          q: 'How many URLs can one sitemap hold?',
          a: 'The limit is 50,000 URLs or 50 MB uncompressed per file. Larger sites split URLs across multiple sitemaps referenced by a sitemap index file — if you are near that ceiling, your CMS probably should be generating these.',
        },
        {
          q: 'Should paginated or parameterised pages be listed?',
          a: 'Generally no — list canonical, indexable pages only. If a URL has a canonical tag pointing elsewhere or returns a redirect, it does not belong in the sitemap and will generate Search Console warnings.',
        },
      ],
    },
  },
  {
    slug: 'email-signature-generator',
    Component: EmailSignature,
    doc: {
      longDescription:
        'A plain-text sign-off wastes the most-viewed real estate in your entire email stream. This generator builds an HTML table signature — the only structure that survives Gmail, Outlook and Apple Mail — with your colors, role and contact links baked in as inline styles.',
      howTo: [
        'Fill in your name, role, company and the contact lines you want shown — any field left blank disappears from the design.',
        'Pick an accent color that matches your brand and choose a layout: accent bar, centered stack, or rule line.',
        'Download the file, open it in a browser, then select and copy the rendered signature.',
        'Paste it into Gmail’s or Outlook’s signature editor — the table and inline styles carry the design with it.',
      ],
      faqs: [
        {
          q: 'Why is the signature built from tables instead of divs?',
          a: 'Outlook desktop renders on Microsoft Word’s engine, which never learned flexbox or grid. Nested tables with inline styles are the only layout method that renders near-identically across Gmail, Outlook, and Apple Mail.',
        },
        {
          q: 'Why inline styles instead of a CSS block?',
          a: 'Most email clients strip <style> tags or ignore classes; inline style attributes are the only CSS guaranteed to arrive intact. That is also why the signature sticks to system fonts every client has.',
        },
        {
          q: 'Can I add a logo or social icons?',
          a: 'Yes, after pasting — insert <img> tags with absolute https URLs and fixed width/height attributes. Keep the whole signature under ~10 KB and host images on your own domain so filters do not block them.',
        },
      ],
    },
  },
  {
    slug: 'privacy-policy-generator',
    Component: PrivacyPolicy,
    doc: {
      longDescription:
        'Every site that touches visitor data needs a plain-language privacy policy, and regulators from the GDPR to the CCPA expect it to reflect what you actually collect. Answer a short form here and get a structured policy — with analytics, marketing and advertising clauses included only if you use them.',
      howTo: [
        'Enter your company name, website and a contact address for privacy requests.',
        'Toggle the tracking you genuinely use — analytics, marketing email, advertising — so the policy matches reality.',
        'Pick the jurisdiction whose rules should drive the rights section, and set the effective date.',
        'Download the HTML, read it once end to end, and publish it at a link in your site footer.',
      ],
      faqs: [
        {
          q: 'Is a generated policy legally sufficient?',
          a: 'It gives you a professionally structured starting point covering the clauses regulators look for, but it is not legal advice. If you handle sensitive data, sell in regulated industries or operate across many jurisdictions, have counsel review the final text.',
        },
        {
          q: 'Which jurisdiction should I choose?',
          a: 'The one where you are established, plus any that reaches you: serving EU or UK users triggers GDPR rights, and Californians invoke the CCPA regardless of where you are based. When unsure, the EU/UK wording is strictest and travels well.',
        },
        {
          q: 'Do I need a cookie banner too?',
          a: 'If the policy discloses non-essential cookies, EU/UK rules require consent before they fire — so yes, a consent banner is expected. The policy explains the details; the banner collects the consent the policy promises.',
        },
      ],
    },
  },
  {
    slug: 'terms-conditions-generator',
    Component: TermsConditions,
    doc: {
      longDescription:
        'Terms & Conditions set the rules of the road: who can use your site, what happens with payments, who owns content and where disputes land. This generator assembles a clear, sectioned agreement from your answers, adding account, payment and user-content clauses only when they apply.',
      howTo: [
        'Enter the company and website the agreement governs, plus a contact email for legal notices.',
        'Toggle the sections that apply — user accounts, paid products or subscriptions, and user-generated content.',
        'Name the governing law so the dispute clause names a real jurisdiction instead of a blank.',
        'Review, download, and link the terms from your footer, checkout flow and signup screens.',
      ],
      faqs: [
        {
          q: 'Where should the terms link appear?',
          a: 'In the footer on every page — and, more importantly, next to an unchecked checkbox at signup and checkout. Terms a user never actively accepted are far harder to enforce than terms agreed with a click.',
        },
        {
          q: 'What does the governing law clause actually do?',
          a: 'It pins which courts and which body of law interpret the contract — without it, a user could sue from their home jurisdiction. Name a place you can realistically litigate in, typically where your company is registered.',
        },
        {
          q: 'Do I need both terms and a privacy policy?',
          a: 'Yes — they cover different ground: the privacy policy explains data handling, the terms govern the commercial relationship. Generate the privacy policy as well and cross-link both in your footer.',
        },
      ],
    },
  },
  {
    slug: 'cookie-policy-generator',
    Component: CookiePolicy,
    doc: {
      longDescription:
        'Cookie policies have to do more than say “we use cookies” — GDPR and CCPA expect a table of what fires, who sets it, how long it lives and how to refuse it. Describe the categories you run and list individual cookies to get a policy that matches your consent banner.',
      howTo: [
        'Enter the company and site the policy covers.',
        'Toggle the categories you actually use — essential, analytics, marketing — and the matching sections appear.',
        'List known cookies one per line as Name | Provider | Duration, e.g. _ga | Google Analytics | 2 years.',
        'Download the HTML and link it next to your consent banner and in the footer.',
      ],
      faqs: [
        {
          q: 'Do I really have to list every cookie?',
          a: 'Regulators expect category transparency at minimum, and EU guidance increasingly favours naming individual cookies with providers and lifespans. If your tag manager lists them, paste them here; otherwise document the main ones per category.',
        },
        {
          q: 'What counts as strictly necessary?',
          a: 'Cookies without which the site literally breaks — session login, shopping cart, security tokens, load balancing. Analytics and advertising never qualify, which is why both need consent before they run.',
        },
        {
          q: 'How often should a cookie policy be updated?',
          a: 'Re-audit every six months and after adding any new tag or pixel — providers also change cookie lifespans, so stale durations are one of the most common audit findings.',
        },
      ],
    },
  },
  {
    slug: 'schema-markup-generator',
    Component: SchemaMarkup,
    doc: {
      longDescription:
        'JSON-LD structured markup is how pages earn rich results: FAQ dropdowns in search, business details in local panels. Choose FAQPage or LocalBusiness, fill the form, and get valid schema.org markup wrapped in its <script> tag — ready to paste and validate.',
      howTo: [
        'Pick the schema type: FAQPage for question-and-answer content, LocalBusiness for a physical location.',
        'For FAQ, list questions and matching answers in the same order — each pair becomes a Question object.',
        'For LocalBusiness, enter the name, address, phone, coordinates and opening hours in the formats shown.',
        'Paste the script block into the page HTML, then run it through Google’s Rich Results Test before deploying.',
      ],
      faqs: [
        {
          q: 'JSON-LD or microdata — which should I use?',
          a: 'JSON-LD is Google’s recommended format: one script block, no attributes woven through your HTML, and it can be injected by tag managers. Microdata still works but breaks easily when a theme changes.',
        },
        {
          q: 'Why don’t my FAQs show rich results after adding markup?',
          a: 'Eligibility is not a guarantee — Google decides when to display enhancements, and thin content or policy issues keep pages plain. Confirm the markup validates, wait for re-crawling, then check coverage in Search Console.',
        },
        {
          q: 'Can one page contain several schema types?',
          a: 'Yes — multiple JSON-LD blocks (Organization, FAQPage, BreadcrumbList) on one page are fine and common. Keep each block internally consistent, and make sure LocalBusiness data matches what visitors actually see.',
        },
      ],
    },
  },
  {
    slug: 'press-release-template-generator',
    Component: PressRelease,
    doc: {
      longDescription:
        'Editors read hundreds of releases a week and bin anything missing the expected format: headline, dateline, quote, boilerplate. Fill the form and get a properly structured release — FOR IMMEDIATE RELEASE masthead, inverted-pyramid body, styled quote and media contact — as clean HTML.',
      howTo: [
        'Write the headline first — one concrete, active sentence — then a subheadline that adds the context.',
        'Draft the body: most newsworthy fact in the first paragraph, details after, blank line between paragraphs.',
        'Add one strong quote from a named person, your boilerplate, and the media contact journalists should reach.',
        'Download the HTML and paste it into your email body or CMS — the formatting travels with it.',
      ],
      faqs: [
        {
          q: 'What belongs in the first paragraph?',
          a: 'The who, what, when, where and why in two sentences — editors often read nothing else. If the news is not visible by the end of the dateline sentence, the release will not get picked up.',
        },
        {
          q: 'How long should a press release be?',
          a: '400–500 words is the working ceiling: three to five short paragraphs plus the quote, ending with the boilerplate and the ### mark that tells editors the document is complete.',
        },
        {
          q: 'What does the ### at the end mean?',
          a: 'It is the traditional end-of-release marker, letting journalists confirm nothing was cut in transmission. Centered on its own line, it also signals where your formatting stops.',
        },
      ],
    },
  },
  {
    slug: 'client-brief-generator',
    Component: ClientBrief,
    doc: {
      longDescription:
        'Half of all project friction traces back to a vague brief — different unspoken assumptions about scope, audience and what “done” means. This generator walks you through the questions a professional brief always answers and formats them into a document you can hand to a team or a client.',
      howTo: [
        'Name the project and client, then set industry and budget band so expectations start calibrated.',
        'Describe the goals as plain business outcomes — what changes when this succeeds.',
        'List the audience, the in-scope deliverables and the metrics that will define success.',
        'Download the brief and walk through it with the client before any work starts.',
      ],
      faqs: [
        {
          q: 'Who should write the brief?',
          a: 'The person who owns the outcome — usually the client-side project lead — reviewed by the team executing it. A brief written by the agency alone is a wish list; a brief the client signs is a contract of expectations.',
        },
        {
          q: 'How detailed should the metrics be?',
          a: 'Specific enough to verify later: not “more traffic” but “organic sessions up 25% in six months”. Measurable metrics let everyone agree the project succeeded instead of arguing about it.',
        },
        {
          q: 'What if scope changes mid-project?',
          a: 'That is what the deliverables list is for — anything not listed becomes a change request with its own time and cost conversation. Reissue the brief with the additions and keep the sign-off trail.',
        },
      ],
    },
  },
  {
    slug: 'project-scope-builder',
    Component: ProjectScope,
    doc: {
      longDescription:
        'A scope document is the cheapest insurance a project can buy: it turns “build me a website” into deliverables, milestones and — critically — exclusions. Fill the form and get a sign-off-ready scope with assumptions stated up front, so change requests have something to be measured against.',
      howTo: [
        'Title the project and name the client exactly as they appear on the contract.',
        'List deliverables and milestones — every concrete thing you will hand over, in order.',
        'Write the exclusions and assumptions honestly; this is where scope creep is prevented, not in the deliverables list.',
        'Add sign-off lines, download the HTML, and get written approval before kickoff.',
      ],
      faqs: [
        {
          q: 'Why are exclusions the most valuable section?',
          a: 'Because disputes are almost never about what was delivered — they are about what the client assumed was included. A written “not included” list converts assumptions into a conversation you can point to later.',
        },
        {
          q: 'How granular should milestones be?',
          a: 'Fine enough that slippage becomes visible within a week, coarse enough that tracking them is not a job of its own. Two-to-three-week milestones with named deliverables suit most engagements.',
        },
        {
          q: 'Does the scope document replace a contract?',
          a: 'No — it complements one. The contract covers liability, payment terms and IP; the scope defines the work itself. Reference the scope from the contract so both documents govern together.',
        },
      ],
    },
  },
  {
    slug: 'app-description-writer',
    Component: AppDescription,
    doc: {
      longDescription:
        'Store listings convert in the first three lines — before a reader scrolls to features or screenshots. This generator assembles a store-ready description from your app’s core benefit, features and audience, with tone-matched phrasing and a scannable feature list.',
      howTo: [
        'Enter the app name, category and the single core benefit it delivers.',
        'List the features worth scanning — stores truncate paragraphs, but bullets get read.',
        'Describe the audience and pick a tone so the phrasing matches your brand.',
        'Copy the description into App Store Connect and Google Play, then trim to each store’s length limits.',
      ],
      faqs: [
        {
          q: 'How long should an app description be?',
          a: 'The first sentence must work alone — iOS shows roughly 170 characters before “more”, and Google Play weights the opening lines for search. Aim for a tight 300–600 character core with feature bullets below the fold.',
        },
        {
          q: 'Do keywords in the description help ranking?',
          a: 'On Google Play, yes — the description is indexed, so natural mentions of the benefit and category matter. Apple’s ranking uses the separate keyword field instead, so write the iOS description for humans and the keyword field for search.',
        },
        {
          q: 'Should the description mention version updates?',
          a: 'No — keep it evergreen; “What’s New” is the place for changelogs. Descriptions with version notes age badly and bury the pitch a new visitor needs to see.',
        },
      ],
    },
  },
  {
    slug: 'app-review-response-generator',
    Component: ReviewResponse,
    doc: {
      longDescription:
        'Store replies are public marketing: thousands of future users read how you answer the angry ones. Pick the review type, paste what the reviewer said, and get three polished reply variants — from brisk to personal — that de-escalate, inform and show everyone reading that you care.',
      howTo: [
        'Select the review type — praise, bug report, crash report or feature request.',
        'Paste or summarize the review in the note field so the replies reference real specifics.',
        'Add the reviewer’s and app’s names if you want the replies personalized.',
        'Pick the variant that fits your voice, tweak a word or two, and post it.',
      ],
      faqs: [
        {
          q: 'How fast should I respond to reviews?',
          a: 'Within 24–48 hours for critical reviews (crashes, payment issues) — the reply timestamp is visible to everyone. A fast, useful reply to a 1-star review measurably improves conversion; deletion is not an option on the stores anyway.',
        },
        {
          q: 'Should I argue with a factually wrong review?',
          a: 'Never in the public thread. State your side once, calmly, with evidence, then move the detail to email. Future readers judge your tone, not the verdict — winning the argument loses the audience.',
        },
        {
          q: 'Do responses actually affect my rating?',
          a: 'Indirectly, yes — well-handled negative reviews get edited upward surprisingly often, and Google Play surfaces your reply rate to developers. The direct effect is conversion: replies are among the most-read social proof on a listing.',
        },
      ],
    },
  },
  {
    slug: 'ad-copy-generator',
    Component: AdCopy,
    doc: {
      longDescription:
        'One angle never fits every reader — professionals test benefit-led, problem-led, proof-led and offer-led frames against each other. Describe the product once and get five complete ad variations, each a different persuasion angle with headline, primary text and a platform-appropriate CTA.',
      howTo: [
        'Describe the product, the audience and the single key benefit in plain words.',
        'Add the offer — discount, trial, free shipping — so the offer-led variation has teeth.',
        'Choose the platform so CTAs and length constraints match the format.',
        'Load all five into your ad platform as separate creatives and let data pick the winner.',
      ],
      faqs: [
        {
          q: 'How many ads should I run in one ad set?',
          a: 'Three to five creatives is the working sweet spot: enough variety for the algorithm to find a winner, enough budget per ad for its results to mean anything. Rotate the losing angle out every couple of weeks.',
        },
        {
          q: 'What makes a good ad headline?',
          a: 'Specificity plus outcome — numbers, timeframes and the benefit in the first three words. “Cut onboarding from 3 weeks to 3 days” beats “Streamline your workflow” because it makes a claim a reader can check.',
        },
        {
          q: 'Why test angles instead of rewriting one ad?',
          a: 'Angles test motivation — status, fear, curiosity, value — while rewrites only test phrasing. A winning angle with mediocre copy usually beats polished copy on the wrong angle, so find the motivation first.',
        },
      ],
    },
  },
  {
    slug: 'caption-generator',
    Component: Captions,
    doc: {
      longDescription:
        'The scroll stops for hooks, not hashtags — and every platform rewards a different rhythm. Give this generator a topic and tone and get six ready-to-post captions built on proven hook patterns, each finished with platform-appropriate hashtags you can keep or trim.',
      howTo: [
        'State the topic as specifically as you can — “cold brew subscription” beats “coffee”.',
        'Pick the tone that matches your brand voice and the platform you are posting on.',
        'Toggle hashtags on or off depending on the platform’s culture.',
        'Copy the captions and schedule — the first line is the hook, so test different ones against each other.',
      ],
      faqs: [
        {
          q: 'How many hashtags should a post use?',
          a: 'Instagram rewards 5–10 focused tags, TikTok 3–5, LinkedIn 3–5 professional tags, and X almost none. Relevance beats volume — ten niche tags outperform thirty generic ones on every platform.',
        },
        {
          q: 'Why does the first line matter so much?',
          a: 'Feeds truncate captions after one or two lines, so the hook decides whether “more” gets tapped. Never bury the interesting part under pleasantries.',
        },
        {
          q: 'Can I reuse one caption across platforms?',
          a: 'You can, but expectations differ — LinkedIn tolerates longer storytelling, TikTok wants immediacy, X wants compression. Generate per platform and adjust the CTA to how each app actually works.',
        },
      ],
    },
  },
  {
    slug: 'content-calendar-generator',
    Component: ContentCalendar,
    doc: {
      longDescription:
        'Consistency beats brilliance on social — accounts that post on a plan grow on every platform’s ranking system. This generator builds a 30-day calendar around your niche, platform and goal, rotating content pillars and formats so no two adjacent days feel the same.',
      howTo: [
        'Enter your niche and the platform the calendar is for.',
        'Pick a realistic posting frequency and the goal that matters most right now — awareness, engagement, traffic or sales.',
        'Read the table top to bottom: each row is a day, a pillar, a format, an idea and the call to action.',
        'Copy or download the plan, then swap any idea that does not fit your week — the structure survives edits.',
      ],
      faqs: [
        {
          q: 'What is a content pillar and why rotate them?',
          a: 'Pillars are recurring themes — educate, inspire, promote — that keep an account balanced. Rotation stops the feed from becoming an ad channel (the fastest way to lose followers) while still selling on the promo days.',
        },
        {
          q: 'Can I post the same idea on two platforms?',
          a: 'Yes, but change the format: a LinkedIn text post becomes a talking-head short on TikTok. Repurposing by format rather than copy-paste is how lean teams look omnipresent.',
        },
        {
          q: 'What if I miss a day?',
          a: 'Skip it and continue — the sequence is a guide, not a streak. One missed post costs nothing; scrambling to “catch up” with five posts in a day costs quality and reads as noise to the algorithm.',
        },
      ],
    },
  },
  {
    slug: 'linkedin-headline-generator',
    Component: LinkedinHeadline,
    doc: {
      longDescription:
        'Your LinkedIn headline follows you into every search result, comment and connection request — 220 characters of prime recruiting and selling real estate. Enter your role, industry, top skill and value proposition, and get six headline styles from conservative to bold, all keyword-rich.',
      howTo: [
        'Fill in your role, industry and the skill you most want to be found for.',
        'Write your value proposition as an outcome — what changes for the people you work with.',
        'Pick a headline style to lead the list: professional, results-driven, bold, approachable or job-seeking.',
        'Copy your favorite, keep the searchable keywords in place, and update your profile.',
      ],
      faqs: [
        {
          q: 'Should a headline include my job title?',
          a: 'Yes — recruiters search titles and skills, so the exact phrase they type (“Product Manager”, “SQL”) belongs in your headline. Style and personality come after the searchable words, not instead of them.',
        },
        {
          q: 'How often should I change my headline?',
          a: 'When your target changes: new role, new niche, new offer. Test a bolder variant for a month — profile views are measurable — and keep the version that pulls the right audience, not just more of them.',
        },
        {
          q: 'What does the 220-character limit force me to do?',
          a: 'Prioritize: searchable keywords first, one concrete outcome second, personality last if it fits. Some LinkedIn views truncate around 120 characters, so front-load what matters.',
        },
      ],
    },
  },
  {
    slug: 'business-name-generator',
    Component: BusinessName,
    doc: {
      longDescription:
        'Great names are made from patterns — suffix play, compounds, prefixes and placement — not lightning bolts. Type your niche keyword and this generator runs a small combinator across proven naming patterns, returning grouped candidates from modern-tech to classic-professional.',
      howTo: [
        'Enter the core keyword that describes your business — one word works best.',
        'Pick a naming style to lead the results: modern, classic, compound or playful.',
        'Add a location if local identity is part of the brand.',
        'Shortlist three to five, then check domain availability and trademark conflicts before falling in love.',
      ],
      faqs: [
        {
          q: 'What makes a business name “brandable”?',
          a: 'Easy to say, easy to spell after hearing it once, and no accidental meaning in your main markets. Two syllables with a strong vowel tend to travel best across languages and domain TLDs.',
        },
        {
          q: 'Should the name contain my exact niche keyword?',
          a: 'It helps instant comprehension and local SEO but caps your future — a name like that cannot pivot. A suggestive-but-abstract name plus a descriptive tagline usually ages better than a literal one.',
        },
        {
          q: 'How do I check a name is legally safe?',
          a: 'Search your national trademark register (USPTO, EUIPO, UKIPO) for the exact mark and close variants, then check company registries and domains. Do this before printing anything — renaming later costs multiples.',
        },
      ],
    },
  },
  {
    slug: 'backlink-anchor-text-generator',
    Component: AnchorText,
    doc: {
      longDescription:
        'Anchor text distribution is the quiet tell of a natural backlink profile — too many exact-match anchors and filters start reading your links as manipulation. Enter a keyword, brand and URL to get a percentage-based plan across six anchor buckets, with ready-made suggestions in each.',
      howTo: [
        'Enter the target keyword and the URL you are building links to.',
        'Add your brand name so the branded bucket generates real suggestions.',
        'Follow the distribution as a guideline across your next 20–30 links, not per link.',
        'Re-run the plan when you target a new page — each URL deserves its own anchor mix.',
      ],
      faqs: [
        {
          q: 'What distribution should I aim for?',
          a: 'The plan’s default — roughly a third branded, a quarter partial match, exact match kept under about 10% — mirrors profiles that rank without attracting manual review. Natural profiles are always top-heavy on branded and naked URLs.',
        },
        {
          q: 'Why keep exact-match anchors so low?',
          a: 'Exact-match anchors passing PageRank were the classic spam signal behind Penguin-era penalties. A handful is normal — dozens on a new site is a pattern, and disavow requests are a poor substitute for restraint.',
        },
        {
          q: 'Do internal links need anchor planning too?',
          a: 'Lighter planning, yes: internal exact-match anchors are fine and actually help topical mapping. The strict distribution matters for external links you do not fully control.',
        },
      ],
    },
  },
  {
    slug: 'audience-persona-builder',
    Component: PersonaBuilder,
    doc: {
      longDescription:
        'Personas turn “everyone” into someone — a named decision-maker with goals, pains, triggers and channels your team can design for. Fill the sheet and get a shareable one-page persona document that keeps copy, UX and sales conversations pointed at the same human.',
      howTo: [
        'Give the persona a name, age range, role and industry — realism beats aspiration.',
        'List their goals (what pulls them forward) and pains (what blocks the status quo) as separate lines.',
        'Describe the triggers that start a buying journey, the channels they trust, and their budget sensitivity.',
        'Download the sheet and pin it where every brief, ad and landing page decision gets made.',
      ],
      faqs: [
        {
          q: 'How many personas should a business have?',
          a: 'One primary persona and at most two secondary ones for most products. Beyond three, teams start designing for averages — and a persona that represents “some of everyone” represents no one.',
        },
        {
          q: 'What is the difference between a goal and a pain?',
          a: 'Goals pull people toward you; pains push them away from the status quo. Marketing that only speaks to goals attracts browsers — pairing each goal with its blocking pain is what creates urgency.',
        },
        {
          q: 'How do I keep personas honest?',
          a: 'Anchor every trait in evidence — interviews, sales calls, support tickets, analytics — and date-stamp the sheet. A persona nobody has updated in two years is fiction wearing a headshot.',
        },
      ],
    },
  },
  {
    slug: 'logo-color-psychology-tool',
    Component: LogoColors,
    doc: {
      longDescription:
        'Color does the emotional work of a logo before anyone reads the name — and the right palette depends on both your industry and the feeling you want to trigger. Pick both here and get three ready-to-use four-color palettes with hex codes, role assignments and the psychology behind them.',
      howTo: [
        'Choose your industry so the guidance reflects real category conventions.',
        'Pick the primary feeling you want customers to have in the first second.',
        'Review the three palettes — each has a primary, secondary, background and accent with named hex codes.',
        'Apply the 60/30/10 rule: dominant color roughly 60%, secondary 30%, accent saved for calls-to-action.',
      ],
      faqs: [
        {
          q: 'Should I follow my industry’s color conventions or break them?',
          a: 'Conventions exist because they work — blue banks, green health — and breaking them entirely spends trust you have not earned yet. A distinctive accent inside a conventional frame signals both fit and difference.',
        },
        {
          q: 'How do I check contrast and accessibility?',
          a: 'Test text/background pairs against WCAG AA (4.5:1 for body text) with any contrast checker, and never rely on color alone to convey meaning. A palette that fails accessibility fails commercially too.',
        },
        {
          q: 'How many colors should a brand actually use?',
          a: 'One primary, one secondary, one or two neutrals and a single accent covers 95% of needs. Every additional brand color dilutes recognition — consistency, not variety, builds memory.',
        },
      ],
    },
  },
  {
    slug: 'nap-consistency-checker',
    Component: NapChecker,
    doc: {
      longDescription:
        'Search engines cross-check your name, address and phone number across the web — mismatched NAP data quietly caps your local ranking no matter how good the rest of your SEO is. Enter your details once and get a canonical NAP block, LocalBusiness microdata, and an 8-point audit checklist.',
      howTo: [
        'Enter your business name exactly as it should appear everywhere — pick one spelling and stick to it.',
        'Add the address lines, city, state, ZIP and primary phone number (never a tracking number).',
        'Add your website so the canonical URL and the microdata block are generated.',
        'Download the sheet and audit your top listings — Google Business Profile first — against the checklist.',
      ],
      faqs: [
        {
          q: 'How much does NAP consistency actually affect local ranking?',
          a: 'Citation consistency is a confirmed local search signal, and it compounds: consistent NAP builds the entity confidence that maps-pack visibility depends on. Inconsistent listings are among the most common audit findings on businesses stuck just outside the maps pack.',
        },
        {
          q: 'Which listings should I fix first?',
          a: 'Google Business Profile, then Apple Maps, Bing Places, Yelp and the industry directories your customers actually read. Fix the source of truth — your website footer — first so every later citation copies the right data.',
        },
        {
          q: 'Is “Suite 4” vs “Ste 4” really a problem?',
          a: 'A minor variant alone will not sink you, but each inconsistency is a small confidence deduction — and USPS-standardizing the address also improves mail deliverability. Pick one form and standardize everywhere.',
        },
      ],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   PRIVATE HELPERS
   ═══════════════════════════════════════════════════════════════ */

type V = Record<string, string | string[] | boolean>;

function makeGen(config: GeneratorConfig): React.ComponentType {
  return function GenView() {
    return <GeneratorTool config={config} />;
  };
}

/** Trimmed string value from raw form values. */
function txt(v: string | string[] | boolean | undefined): string {
  return String(v ?? '').trim();
}

/** Boolean toggle value. */
function bl(v: string | string[] | boolean | undefined): boolean {
  return v === true || v === 'true';
}

/** Newline-separated list value → trimmed, non-empty lines. */
function ls(v: string | string[] | boolean | undefined): string[] {
  return String(v ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** escapeHtml — required before interpolating user input into any HTML template. */
function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const esc = escapeHtml;

/** Today formatted like "12 May 2026" for datelines and effective dates. */
function todayStr(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Normalize a phone string: 10 digits → (XXX) XXX-XXXX; 11 digits starting with 1 → +1 form. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  if (digits.length === 11 && digits.charAt(0) === '1') {
    return '+1 (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7);
  }
  return raw.trim();
}

const BASE_CSS = [
  '* { box-sizing: border-box; margin: 0; padding: 0; }',
  "body { font-family: Georgia, 'Times New Roman', serif; background: #f5f5f4; color: #1c1917; line-height: 1.7; padding: 28px 16px; }",
  '.doc { max-width: 780px; margin: 0 auto; background: #fff; padding: 44px 52px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,.07); }',
  'h1 { font-size: 26px; line-height: 1.25; margin: 0 0 8px; }',
  'h2 { font-size: 16px; text-transform: uppercase; letter-spacing: .07em; color: #57534e; margin: 26px 0 8px; }',
  'h3 { font-size: 15px; margin: 16px 0 6px; color: #292524; }',
  'p { margin: 0 0 12px; }',
  'ul, ol { margin: 0 0 14px 22px; }',
  'li { margin-bottom: 6px; }',
  'strong { color: #0a0a0a; }',
  'a { color: #4f46e5; }',
  '.meta { color: #78716c; font-size: 13px; }',
  'hr { border: none; border-top: 1px solid #e7e5e4; margin: 20px 0; }',
  '.hint { font-size: 12.5px; color: #78716c; font-family: Arial, Helvetica, sans-serif; }',
  'table { border-collapse: collapse; width: 100%; margin: 8px 0 18px; font-size: 14px; }',
  'th { text-align: left; border-bottom: 2px solid #d6d3d1; padding: 8px 10px; white-space: nowrap; }',
  'td { border-bottom: 1px solid #e7e5e4; padding: 8px 10px; vertical-align: top; }',
  '@media (max-width: 640px) { .doc { padding: 28px 22px; } }',
].join('\n');

/** Wrap a body fragment in a styled, printable standalone HTML document. */
function htmlDoc(title: string, body: string, extraCss?: string): string {
  return (
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
    '<title>' + escapeHtml(title) + '</title>\n<style>\n' + BASE_CSS + (extraCss ? '\n' + extraCss : '') +
    '\n</style>\n</head>\n<body>\n<main class="doc">\n' + body + '\n</main>\n</body>\n</html>\n'
  );
}

const PR_CSS = [
  '.release-tag { font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 3px; color: #57534e; }',
  '.subhead { font-size: 17px; font-style: italic; color: #44403c; margin-top: 2px; }',
  '.dateline { font-weight: bold; }',
  'blockquote { border-left: 3px solid #d6d3d1; margin: 14px 0 16px; padding: 4px 0 4px 18px; }',
  'blockquote .attr { font-size: 14px; color: #57534e; margin: 6px 0 0; }',
  '.contact { font-size: 14px; color: #44403c; }',
  '.end { text-align: center; letter-spacing: 6px; margin-top: 30px; color: #78716c; }',
].join('\n');

const PERSONA_CSS = [
  '.persona-head { display: flex; gap: 18px; align-items: center; border-bottom: 2px solid #1c1917; padding-bottom: 18px; margin-bottom: 20px; }',
  '.avatar { width: 64px; height: 64px; border-radius: 50%; background: #059669; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; flex: 0 0 auto; }',
  '.chip { display: inline-block; background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 999px; padding: 2px 10px; font-size: 12px; color: #57534e; margin: 2px 4px 2px 0; font-family: Arial, Helvetica, sans-serif; }',
  '.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; }',
  '@media (max-width: 640px) { .grid2 { grid-template-columns: 1fr; } }',
].join('\n');

const SWATCH_CSS = [
  '.swrow { display: flex; gap: 12px; margin: 10px 0 4px; flex-wrap: wrap; }',
  '.sw { flex: 1; min-width: 120px; }',
  '.sw .box { height: 64px; border-radius: 8px; border: 1px solid rgba(0,0,0,.12); }',
  '.sw .nm { font-size: 12.5px; font-weight: bold; margin: 6px 0 0; font-family: Arial, Helvetica, sans-serif; }',
  '.sw .hx { font-size: 11.5px; color: #78716c; font-family: "Courier New", monospace; }',
  '.dodont { border-left: 4px solid #16a34a; background: #f0fdf4; padding: 10px 14px; margin: 8px 0; border-radius: 0 8px 8px 0; }',
  '.dodont.no { border-color: #dc2626; background: #fef2f2; }',
  '.dodont ul { margin: 6px 0 0 20px; }',
].join('\n');

const NAP_CSS = [
  '.napbox { background: #0a0a0a; color: #e7e5e4; font-family: "Courier New", monospace; font-size: 14px; padding: 16px 18px; border-radius: 10px; line-height: 1.8; margin-bottom: 6px; }',
  'pre.md { background: #fafaf9; border: 1px solid #e7e5e4; padding: 14px 16px; border-radius: 10px; font-size: 12.5px; overflow: auto; font-family: "Courier New", monospace; white-space: pre; }',
  'ol.check { list-style: none; margin-left: 0; counter-reset: c; }',
  'ol.check li { counter-increment: c; position: relative; padding-left: 40px; margin-bottom: 10px; min-height: 28px; }',
  'ol.check li::before { content: counter(c); position: absolute; left: 0; top: 1px; width: 26px; height: 26px; border-radius: 50%; background: #0a0a0a; color: #fff; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; display: flex; align-items: center; justify-content: center; }',
].join('\n');

/* ── palette + industry knowledge for the logo color tool ─────── */

interface Chip { name: string; hex: string; role: string }
interface Palette { name: string; note: string; chips: Chip[] }

const PALETTES: Record<string, Palette[]> = {
  trust: [
    {
      name: 'Boardroom Navy',
      note: 'Deep navy is the closest thing color has to a signature on a contract: steady, institutional, hard to doubt.',
      chips: [
        { name: 'Midnight Navy', hex: '#1B2A4A', role: 'Primary' },
        { name: 'Slate Blue', hex: '#4A6FA5', role: 'Secondary' },
        { name: 'Mist Gray', hex: '#E4E8EE', role: 'Background' },
        { name: 'Signal Gold', hex: '#C9A227', role: 'Accent' },
      ],
    },
    {
      name: 'Deep Teal Trust',
      note: 'Teal blends blue reliability with a hint of green renewal — trustworthy without feeling corporate.',
      chips: [
        { name: 'Deep Teal', hex: '#0F766E', role: 'Primary' },
        { name: 'Fresh Teal', hex: '#14B8A6', role: 'Secondary' },
        { name: 'Ice Mint', hex: '#E6F7F3', role: 'Background' },
        { name: 'Charcoal Ink', hex: '#1F2937', role: 'Accent' },
      ],
    },
    {
      name: 'Ink & Steel',
      note: 'Near-black with cool steel tones reads precise and engineered — confidence through restraint.',
      chips: [
        { name: 'Graphite', hex: '#23282D', role: 'Primary' },
        { name: 'Steel Blue', hex: '#5B7C99', role: 'Secondary' },
        { name: 'Cloud', hex: '#F0F2F5', role: 'Background' },
        { name: 'Cobalt', hex: '#2563EB', role: 'Accent' },
      ],
    },
  ],
  energy: [
    {
      name: 'Racing Red',
      note: 'Red raises the pulse first and asks questions later — the fastest way to look fast.',
      chips: [
        { name: 'Crimson', hex: '#DC2626', role: 'Primary' },
        { name: 'Deep Red', hex: '#991B1B', role: 'Secondary' },
        { name: 'Warm Sand', hex: '#FDF3EE', role: 'Background' },
        { name: 'Charcoal', hex: '#111827', role: 'Accent' },
      ],
    },
    {
      name: 'Voltage Orange',
      note: 'Orange is energy with a smile: urgent but approachable, loud without alarm.',
      chips: [
        { name: 'Tangerine', hex: '#EA580C', role: 'Primary' },
        { name: 'Amber', hex: '#F59E0B', role: 'Secondary' },
        { name: 'Cream', hex: '#fffbeb', role: 'Background' },
        { name: 'Espresso', hex: '#292524', role: 'Accent' },
      ],
    },
    {
      name: 'Electric Mix',
      note: 'Hot coral against violet creates tension that reads as movement — built for brands that never sit still.',
      chips: [
        { name: 'Hot Coral', hex: '#FF4D5A', role: 'Primary' },
        { name: 'Voltage Violet', hex: '#7C3AED', role: 'Secondary' },
        { name: 'Pale Rose', hex: '#f0fdfa', role: 'Background' },
        { name: 'Ink', hex: '#18181B', role: 'Accent' },
      ],
    },
  ],
  calm: [
    {
      name: 'Sea Glass',
      note: 'Soft greens and blues lower the heart rate — the palette equivalent of a deep breath.',
      chips: [
        { name: 'Sea Green', hex: '#5FA8A0', role: 'Primary' },
        { name: 'Dusty Blue', hex: '#9DB4C8', role: 'Secondary' },
        { name: 'Pearl', hex: '#F4F7F6', role: 'Background' },
        { name: 'Deep Pine', hex: '#2F5D62', role: 'Accent' },
      ],
    },
    {
      name: 'Morning Mist',
      note: 'Muted, low-contrast tones that whisper instead of shout — wellness through absence of noise.',
      chips: [
        { name: 'Sage', hex: '#A8BCA1', role: 'Primary' },
        { name: 'Stone', hex: '#D8D3CB', role: 'Secondary' },
        { name: 'Linen White', hex: '#FAF8F5', role: 'Background' },
        { name: 'Moss', hex: '#5B7052', role: 'Accent' },
      ],
    },
    {
      name: 'Still Water',
      note: 'Cool aqua tones feel weightless — clarity you can almost float on.',
      chips: [
        { name: 'Still Aqua', hex: '#7FBFC9', role: 'Primary' },
        { name: 'Powder Blue', hex: '#C7DCE4', role: 'Secondary' },
        { name: 'Snow', hex: '#F7FAFC', role: 'Background' },
        { name: 'Deep Lake', hex: '#2B6777', role: 'Accent' },
      ],
    },
  ],
  luxury: [
    {
      name: 'Midnight & Gold',
      note: 'Black and gold is the oldest luxury pairing for a reason: scarce materials, unmistakable signal.',
      chips: [
        { name: 'Onyx', hex: '#0B0B0D', role: 'Primary' },
        { name: 'Champagne Gold', hex: '#C9A961', role: 'Secondary' },
        { name: 'Ivory', hex: '#FAF7F0', role: 'Background' },
        { name: 'Bronze', hex: '#8C6D3F', role: 'Accent' },
      ],
    },
    {
      name: 'Velvet Plum',
      note: 'Deep purple was literally priced by the gram in antiquity — the original status color.',
      chips: [
        { name: 'Royal Plum', hex: '#4A1D4E', role: 'Primary' },
        { name: 'Soft Mauve', hex: '#B58DB6', role: 'Secondary' },
        { name: 'Blush Cream', hex: '#F9F3F5', role: 'Background' },
        { name: 'Old Gold', hex: '#B08D3E', role: 'Accent' },
      ],
    },
    {
      name: 'Modern Monochrome',
      note: 'Quiet greys with one sharp black — luxury that lets the product do the talking.',
      chips: [
        { name: 'Jet', hex: '#111114', role: 'Primary' },
        { name: 'Titanium', hex: '#8E9196', role: 'Secondary' },
        { name: 'Porcelain', hex: '#F5F5F4', role: 'Background' },
        { name: 'Silver Spark', hex: '#C0C4CC', role: 'Accent' },
      ],
    },
  ],
  growth: [
    {
      name: 'Evergreen',
      note: 'Green is the color of return — literally for finance, figuratively for anything that compounds.',
      chips: [
        { name: 'Forest', hex: '#166534', role: 'Primary' },
        { name: 'Leaf', hex: '#4ADE80', role: 'Secondary' },
        { name: 'Mint Cream', hex: '#F0FDF4', role: 'Background' },
        { name: 'Slate', hex: '#334155', role: 'Accent' },
      ],
    },
    {
      name: 'Skyline Blue-Green',
      note: 'Where trust blue meets growth green — momentum without recklessness.',
      chips: [
        { name: 'Deep Sky', hex: '#0369A1', role: 'Primary' },
        { name: 'Teal Rise', hex: '#0D9488', role: 'Secondary' },
        { name: 'Ice', hex: '#F0F9FF', role: 'Background' },
        { name: 'Navy', hex: '#0F172A', role: 'Accent' },
      ],
    },
    {
      name: 'Spring Lime',
      note: 'Electric green reads as new, young and moving up — faster than its competitors, visibly.',
      chips: [
        { name: 'Lime Surge', hex: '#65A30D', role: 'Primary' },
        { name: 'Spring', hex: '#A3E635', role: 'Secondary' },
        { name: 'Cloud Mint', hex: '#F7FEE7', role: 'Background' },
        { name: 'Graphite', hex: '#1C1917', role: 'Accent' },
      ],
    },
  ],
  friendly: [
    {
      name: 'Warm Welcome',
      note: 'Soft coral and honey feel like a greeting, not a pitch — warmth measured in hex.',
      chips: [
        { name: 'Coral', hex: '#F97066', role: 'Primary' },
        { name: 'Honey', hex: '#FDB022', role: 'Secondary' },
        { name: 'Peach Cream', hex: '#FFF4EE', role: 'Background' },
        { name: 'Cocoa', hex: '#3F2A20', role: 'Accent' },
      ],
    },
    {
      name: 'Sunny Side',
      note: 'Yellow is optimism with the volume up — instant warmth that photographs well on any feed.',
      chips: [
        { name: 'Marigold', hex: '#F5B301', role: 'Primary' },
        { name: 'Sunshine', hex: '#FDE047', role: 'Secondary' },
        { name: 'Vanilla', hex: '#FFFBEA', role: 'Background' },
        { name: 'Charcoal', hex: '#1C1917', role: 'Accent' },
      ],
    },
    {
      name: 'Playful Pop',
      note: 'Bubblegum and sky blue keep things light and likeable — friendly on first contact.',
      chips: [
        { name: 'Bubblegum', hex: '#059669', role: 'Primary' },
        { name: 'Sky Blue', hex: '#38BDF8', role: 'Secondary' },
        { name: 'Cotton', hex: '#ecfdf5', role: 'Background' },
        { name: 'Navy', hex: '#1E293B', role: 'Accent' },
      ],
    },
  ],
};

const INDUSTRY_NOTES: Record<string, { label: string; note: string; dos: string[]; donts: string[] }> = {
  tech: {
    label: 'Technology & SaaS',
    note: 'Tech buyers scan for competence first and warmth second — blues and violets dominate the category because they photograph as intelligent without feeling cold.',
    dos: [
      'Lead with a confident blue, violet or near-black primary.',
      'Keep one bright accent reserved for buttons and links.',
      'Test the palette in both light and dark product UI.',
    ],
    donts: [
      'Rainbow gradients that fight your own product UI.',
      'Warm restaurant palettes (reds/yellows) — they read as food, not software.',
    ],
  },
  finance: {
    label: 'Finance & Insurance',
    note: 'Money is the ultimate trust product: customers forgive boring, never shady. Navy, forest and gold signal stewardship of other people’s assets.',
    dos: [
      'Anchor on navy, forest green or charcoal.',
      'Use gold sparingly — one accent, small doses.',
      'Prioritize WCAG contrast on numbers and disclosures.',
    ],
    donts: [
      'Neon or playful palettes that read speculative.',
      'Reds near balances or figures — red means loss in finance.',
    ],
  },
  health: {
    label: 'Health & Wellness',
    note: 'Care reads as soft blues and greens: clinical competence plus human warmth. Harsh saturation triggers alarm; pastels reassure.',
    dos: [
      'Soft blue or green primary with generous white space.',
      'A warm accent (peach, coral) for humanity.',
      'Large, calm typography alongside the palette.',
    ],
    donts: [
      'Alarming reds outside emergency contexts.',
      'High-contrast black blocks that feel institutional.',
    ],
  },
  food: {
    label: 'Food & Restaurant',
    note: 'Red and orange measurably stimulate appetite and urgency — the reason the biggest chains converged on them. Freshness codes green.',
    dos: [
      'Appetite-driving reds, oranges or warm yellows.',
      'Deep green for fresh/organic positioning.',
      'Rich darks that flatter food photography for premium brands.',
    ],
    donts: [
      'Cool blues around food — they suppress appetite.',
      'Grey-heavy palettes that make menus feel stale.',
    ],
  },
  realestate: {
    label: 'Real Estate & Property',
    note: 'Property buyers want stability and aspiration at once — grounded earth tones with a confident accent deliver both.',
    dos: [
      'Ground the brand in earth tones (sand, clay, forest).',
      'Navy or charcoal for the contract-side trust.',
      'One aspirational accent for listings and CTAs.',
    ],
    donts: [
      'Neon, playful palettes that read temporary.',
      'Cluttered multi-color marks — architecture is restraint.',
    ],
  },
  creative: {
    label: 'Creative & Agency',
    note: 'Agencies sell taste, so the palette is the portfolio: one bold signature color earns more attention than a safe spread of four.',
    dos: [
      'Commit to one unmistakable signature color.',
      'Pair with confident near-blacks for editorial feel.',
      'Let work samples carry most of the color.',
    ],
    donts: [
      'Defaulting to safe blue — invisible in this category.',
      'Trend-chasing gradients you will regret in a year.',
    ],
  },
  fitness: {
    label: 'Fitness & Sport',
    note: 'Performance colors are high-voltage: reds and oranges for intensity, black for strength, lime for energy. Calm palettes read as yoga — which may be exactly right for your niche.',
    dos: [
      'High-energy primary (red, orange, electric lime) for performance brands.',
      'Black as the strength anchor.',
      'Reserve calm blues/greens for recovery and wellness lines only.',
    ],
    donts: [
      'Pastel-heavy palettes for hard-training brands.',
      'Low-contrast greys that feel tired, not toned.',
    ],
  },
  education: {
    label: 'Education & Learning',
    note: 'Learning brands lean on blue trust plus optimistic yellow: focus and encouragement in one mark.',
    dos: [
      'Trust blue or deep green as the base.',
      'A warm yellow or orange accent for optimism and CTAs.',
      'Friendly, rounded typography to match the palette.',
    ],
    donts: [
      'Aggressive reds that signal alarm, not attention.',
      'Monochrome severity — education should feel inviting.',
    ],
  },
};
