'use client';

import * as React from 'react';
import { ArrowRight, ChevronDown, Clock, Mail, Menu, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { site } from '@/lib/site';
import { featuredServices, services } from '@/data';
import { Link } from '@/components/common/link';
import { ServiceIconGlyph } from '@/components/common/icon-map';

interface HeaderProps {
  path: string;
}

const MAIN_NAV = [
  { label: 'Tools', href: '/tools' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/';
  if (href === '/portfolio') return path.startsWith('/portfolio');
  if (href === '/tools') return path === '/tools' || path.startsWith('/tools/');
  if (href === '/blog') return path.startsWith('/blog');
  // Services hub stays active on /services and on ANY service detail page.
  if (href === '/services') return path === '/services' || (services.some((s) => s.slug === path.slice(1)) && path !== '/');
  return path === href;
}

function Logo({ dark }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
      ariaLabel="Developers3 — home"
    >
      <img src="/logo.svg" alt="" width={34} height={34} className="h-9 w-9" />
      <span className={cn('font-display text-lg font-bold tracking-tight', dark ? 'text-white' : 'text-foreground')}>
        Developers<span className="text-gradient">3</span>
      </span>
    </Link>
  );
}

export function Header({ path }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const servicesActive = isActive(path, '/services');

  // Close menus whenever the route changes (hash navigation keeps the SPA alive).
  React.useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav — editorial text links with active underline */}
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          <DropdownMenu modal={false} open={megaOpen} onOpenChange={setMegaOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'group relative inline-flex h-16 items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  servicesActive || megaOpen ? 'text-foreground' : 'text-foreground/65'
                )}
              >
                Services
                <ChevronDown
                  className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
                {(servicesActive || megaOpen) && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="w-[560px] rounded-2xl border-border bg-popover p-2 shadow-2xl"
            >
              {/* Panel header row */}
              <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Featured services
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  All services
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              {/* Featured service rows */}
              <div className="flex flex-col">
                {featuredServices.map((service) => {
                  const href = `/${service.slug}`;
                  const active = path === href;
                  return (
                    <Link
                      key={service.slug}
                      href={href}
                      className={cn(
                        'group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active && 'bg-accent text-accent-foreground'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="icon-tile h-10 w-10 shrink-0 !rounded-xl">
                        <ServiceIconGlyph icon={service.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-sm font-semibold text-foreground group-hover:text-blue-700',
                            active && 'text-blue-700'
                          )}
                        >
                          {service.name}
                        </span>
                        <span className="block text-xs text-muted-foreground line-clamp-1">
                          {service.tagline}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Bottom action row */}
              <div className="mt-1 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <a
                      href={site.phoneHref}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-xs font-medium text-foreground transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Call us at ${site.phoneDisplay}`}
                    >
                      <Phone className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      {site.phoneDisplay}
                    </a>
                    <span className="text-[11px] text-muted-foreground">Mon–Fri, 9–6 PT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/services">All services</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/contact">Free quote</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {MAIN_NAV.map((item) => {
            const active = isActive(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative inline-flex h-16 items-center text-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'text-foreground' : 'text-foreground/65'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button asChild className="min-h-[44px]">
            <Link href="/contact">Get Free Quote</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full max-w-xs flex-col gap-6 overflow-y-auto p-6">
            <SheetHeader className="p-0">
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile navigation" className="flex flex-col gap-0.5">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent/60',
                  path === '/' ? 'bg-accent/70 font-semibold text-foreground' : 'text-foreground'
                )}
              >
                Home
              </Link>
              <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Services
              </p>
              {featuredServices.map((service) => {
                const href = `/${service.slug}`;
                const active = path === href;
                return (
                  <Link
                    key={service.slug}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent/60',
                      active ? 'bg-accent/70 font-semibold text-foreground' : 'text-foreground/85'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="icon-tile h-9 w-9 shrink-0 !rounded-lg">
                      <ServiceIconGlyph icon={service.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-[15px] font-medium">{service.name}</span>
                  </Link>
                );
              })}
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-3 text-[15px] font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              >
                Browse all {services.length} services
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Company
              </p>
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-accent/60',
                    isActive(path, item.href) ? 'bg-accent/70 font-semibold text-foreground' : 'text-foreground/85'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
              <Button asChild className="min-h-[44px] w-full" onClick={() => setMobileOpen(false)}>
                <Link href="/contact">Get Free Quote</Link>
              </Button>
              <a
                href={site.phoneHref}
                onClick={() => setMobileOpen(false)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-blue-50"
              >
                <Phone className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {site.phoneDisplay}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-blue-50"
              >
                <Mail className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {site.email}
              </a>
              <span className="inline-flex items-center gap-2 px-3 text-xs text-muted-foreground">
                <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {site.hours}
              </span>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
