'use client';

import * as React from 'react';
import { ArrowRight, ChevronDown, Menu, Sparkle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { featuredServices, services } from '@/data';
import { Link } from '@/components/common/link';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ACCENT_TILE } from '@/lib/accent';
import { cn } from '@/lib/utils';

interface HeaderProps {
  path: string;
}

/** Same link set as the full-screen mobile menu — desktop and mobile stay in sync. */
const MAIN_NAV = [
  { label: 'Work', href: '/portfolio' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/';
  if (href === '/portfolio') return path.startsWith('/portfolio');
  if (href === '/tools') return path === '/tools' || path.startsWith('/tools/');
  if (href === '/blog') return path.startsWith('/blog');
  // Services hub stays active on /services and on ANY service detail page.
  if (href === '/services') return path === '/services' || (services.some((s) => s.slug === path.slice(1)) && path !== '/');
  return path === href;
}

/** Logo lockup — same as the one in the full-screen mobile menu. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5 transition-opacity hover:opacity-80', className)}
      ariaLabel="Developers3 — home"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-xl bg-[#161613]"
      >
        <Sparkle className="size-4.5 text-[#FF4D00]" fill="currentColor" />
      </span>
      <span className="font-display text-[22px] font-bold tracking-tight text-[#161613]">
        Developers3
      </span>
    </Link>
  );
}

/** Sans nav link styling — shared by every desktop item (readable, modern). */
const NAV_LINK_CLASS =
  'relative inline-flex h-20 items-center text-[15px] font-semibold transition-colors hover:text-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]';

/**
 * HEADER — clean paper bar: solid background (no backdrop blur — cheaper
 * paint), roomy 80px height, sans nav links, grotesk logotype, tangerine
 * active marker. Services opens the featured-services dropdown with the
 * 4-color accent ramp on the icon tiles.
 */
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
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#e6e5de] bg-[#fafaf7]">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left group — logo + availability status (relocated from the
              hero so the badge stays visible without adding hero height) */}
          <div className="flex items-center gap-7">
            <Logo />
            <p className="hidden items-center gap-2 text-[13px] font-semibold text-[#6f6e66] xl:inline-flex">
              <span
                className="size-2 rounded-full bg-[#0FA36B] animate-pulse-dot"
                aria-hidden="true"
              />
              Available for new projects
            </p>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            <DropdownMenu modal={false} open={megaOpen} onOpenChange={setMegaOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'group relative inline-flex h-20 items-center gap-1.5 text-[15px] font-semibold transition-colors hover:text-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]',
                    servicesActive || megaOpen ? 'text-[#161613]' : 'text-[#6f6e66]',
                  )}
                >
                  Services
                  <ChevronDown
                    className="size-4 text-[#b3b2a8] transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                  {(servicesActive || megaOpen) && (
                    <span
                      className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-6 rounded-full bg-[#FF4D00]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </DropdownMenuTrigger>

              {/* Services panel */}
              <DropdownMenuContent
                align="start"
                sideOffset={10}
                className="w-[560px] rounded-2xl border border-[#e6e5de] bg-white p-2.5 shadow-[0_24px_48px_-24px_rgba(22,22,19,0.35)]"
              >
                {/* Panel header row */}
                <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-2">
                  <span className="eyebrow inline-flex items-center gap-2">
                    <Sparkle className="size-3.5 text-[#FF4D00]" fill="currentColor" aria-hidden="true" />
                    Featured services
                  </span>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#161613] transition-colors hover:text-[#FF4D00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]"
                  >
                    All services
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>

                {/* Featured service rows */}
                <div className="flex flex-col">
                  {featuredServices.map((service, index) => {
                    const href = `/${service.slug}`;
                    const active = path === href;
                    return (
                      <Link
                        key={service.slug}
                        href={href}
                        className={cn(
                          'group flex min-h-[60px] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-[#f1f0ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]',
                          active && 'bg-[#f1f0ea]',
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span
                          className={cn(
                            'flex size-11 shrink-0 items-center justify-center rounded-xl',
                            ACCENT_TILE[index % ACCENT_TILE.length],
                          )}
                        >
                          <ServiceIconGlyph icon={service.icon} className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[17px] font-semibold text-[#161613]">
                            {service.name}
                          </span>
                          <span className="block truncate text-sm text-[#6f6e66]">{service.tagline}</span>
                        </span>
                        <ArrowRight
                          className="size-4 shrink-0 -translate-x-1 text-[#FF4D00] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom action row */}
                <div className="mt-1.5 border-t border-[#e6e5de] px-3 py-3.5">
                  <div className="flex items-center justify-end gap-2.5">
                    <Link href="/services" className="btn-secondary-pill-sm">
                      All services
                    </Link>
                    <Link href="/contact" className="btn-primary-pill-sm">
                      Free quote
                    </Link>
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
                    NAV_LINK_CLASS,
                    active ? 'text-[#161613]' : 'text-[#6f6e66]',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-6 rounded-full bg-[#FF4D00]"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link href="/contact" className="btn-primary-pill-sm">
              Start Your Project
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="flex size-11 items-center justify-center rounded-xl border border-[#d6d5cc] text-[#161613] transition-colors duration-200 hover:border-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Full-screen mobile navigation overlay — rendered OUTSIDE the sticky
          header so the fixed overlay is not clipped by the sticky bar. */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
