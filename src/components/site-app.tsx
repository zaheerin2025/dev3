'use client';

import * as React from 'react';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { NotFoundView } from '@/views/not-found-view';
import { HomeView } from '@/views/home-view';
import { ServicesHubView } from '@/views/services-hub-view';
import { ServiceDetailView } from '@/views/service-detail-view';
import { PortfolioView } from '@/views/portfolio-view';
import { CaseStudyView } from '@/views/case-study-view';
import { PricingView } from '@/views/pricing-view';
import { AboutView } from '@/views/about-view';
import { ContactView } from '@/views/contact-view';
import { BlogView } from '@/views/blog-view';
import { BlogPostView } from '@/views/blog-post-view';
import { AdminView } from '@/views/admin-view';
import { LegalView } from '@/views/legal-view';
import { blogPosts, caseStudies, services } from '@/data';
import { pathFromLocation, useRouterStore } from '@/lib/router';
import { getRouteSeo, resolveRoute } from '@/lib/routes';
import { useSiteSettings } from '@/lib/use-site-settings';
import { site } from '@/lib/site';

const routeData = { services, caseStudies, blogPosts };

export function SiteApp() {
  const path = useRouterStore((s) => s.path);
  const setPath = useRouterStore((s) => s.setPath);
  const loadSettings = useSiteSettings((s) => s.load);

  // Load admin-editable site settings once (hero copy, contacts, pricing…).
  // Failures are ignored — views fall back to the static defaults.
  React.useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Hash → state sync (initial load + back/forward + link clicks)
  React.useEffect(() => {
    const applyHash = () => {
      setPath(pathFromLocation());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [setPath]);

  const match = React.useMemo(() => resolveRoute(path, routeData), [path]);

  // Per-view SEO: title, meta description, canonical
  React.useEffect(() => {
    const seo = getRouteSeo(match, routeData);
    document.title = seo.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', seo.description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', seo.title);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${site.url}${path === '/' ? '/' : path}`);
    // The admin panel must never be indexed.
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute('content', match.kind === 'admin' ? 'noindex, nofollow' : 'index, follow');
  }, [match, path]);

  let view: React.ReactNode;
  switch (match.kind) {
    case 'home':
      view = <HomeView />;
      break;
    case 'services-hub':
      view = <ServicesHubView />;
      break;
    case 'service':
      view = <ServiceDetailView slug={match.slug} />;
      break;
    case 'portfolio':
      view = <PortfolioView />;
      break;
    case 'case-study':
      view = <CaseStudyView slug={match.slug} />;
      break;
    case 'pricing':
      view = <PricingView />;
      break;
    case 'about':
      view = <AboutView />;
      break;
    case 'contact':
      view = <ContactView />;
      break;
    case 'blog':
      view = <BlogView />;
      break;
    case 'blog-post':
      view = <BlogPostView slug={match.slug} />;
      break;
    case 'admin':
      view = <AdminView />;
      break;
    case 'privacy':
      view = <LegalView kind="privacy" />;
      break;
    case 'terms':
      view = <LegalView kind="terms" />;
      break;
    default:
      view = <NotFoundView path={match.path} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('main-content')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <Header path={path} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {view}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
