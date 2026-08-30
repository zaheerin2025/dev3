'use client';

import * as React from 'react';
import { ArrowRight, ChevronDown, Clock, Menu, Phone, Sparkle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { site } from '@/lib/site';
import { featuredServices, services } from '@/data';
import { Link } from '@/components/common/link';
import { ServiceIconGlyph } from '@/components/common/icon-map';
import { MobileMenu } from '@/components/layout/mobile-menu';
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

/** Colorful icon tiles for the services dropdown (cycle per row) —
 *  fresh warm-green ramp: emerald / lime / amber / teal / orange. */
const SERVICE_TILE_GRADIENTS = [
  'from-emerald-500 to-teal-500',
  'from-lime-500 to-emerald-600',
  'from-amber-400 to-orange-500',
  'from-teal-500 to-emerald-600',
  'from-orange-500 to-amber-500',
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

/** Colorful logo lockup — same as the one in the full-screen mobile menu. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5 transition-opacity hover:opacity-80', className)}
      ariaLabel="Developers3 — home"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_14px_rgba(5,150,105,0.35)]"
      >
        <Sparkle className="size-5 text-white" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-[#0a0a0a]">
        Developers<span className="text-gradient">3</span>
        <span aria-hidden="true" className="ml-0.5 inline-block size-1.5 rounded-full bg-yellow-300" />
      </span>
    </Link>
  );
}

/**
 * COLORFUL HEADER — sticky white bar with a 2px ink edge, Sparkle logo,
 * bold editorial nav with emerald hover, neo-brutalist services dropdown,
 * gradient pill CTA and the full-screen mobile menu overlay.
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
      <header className="sticky top-0 z-50 w-full border-b-2 border-[#0a0a0a] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav — bold ink links with purple hover + gradient active dot */}
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          <DropdownMenu modal={false} open={megaOpen} onOpenChange={setMegaOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'group relative inline-flex h-16 items-center gap-1 text-[15px] font-bold transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  servicesActive || megaOpen ? 'text-emerald-600' : 'text-[#0a0a0a]'
                )}
              >
                Services
                <ChevronDown
                  className="size-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
                {(servicesActive || megaOpen) && (
                  <span
                    className="absolute inset-x-0 bottom-3 mx-auto h-1 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            </DropdownMenuTrigger>

            {/* Neo-brutalist services panel — 2px ink border + hard offset shadow */}
            <DropdownMenuContent
              align="start"
              sideOffset={12}
              className="w-[540px] rounded-2xl border-2 border-[#0a0a0a] bg-white p-2 shadow-[8px_8px_0_#0a0a0a]"
            >
              {/* Panel header row */}
              <div className="flex items-center justify-between gap-3 px-3 pb-1.5 pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                  <Sparkle className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  Featured services
                </span>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  All services
                  <ArrowRight className="size-3.5" aria-hidden="true" />
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
                        'group flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                        active && 'bg-emerald-50'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                          SERVICE_TILE_GRADIENTS[index % SERVICE_TILE_GRADIENTS.length]
                        )}
                      >
                        <ServiceIconGlyph icon={service.icon} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-sm font-bold text-[#0a0a0a] transition-colors group-hover:text-emerald-600',
                            active && 'text-emerald-600'
                          )}
                        >
                          {service.name}
                        </span>
                        <span className="block truncate text-xs text-gray-500">{service.tagline}</span>
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 -translate-x-1 text-emerald-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Bottom action row */}
              <div className="mt-1 border-t-2 border-dashed border-gray-200 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <a
                      href={site.phoneHref}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-xs font-bold text-[#0a0a0a] transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      aria-label={`Call us at ${site.phoneDisplay}`}
                    >
                      <Phone className="size-4 text-emerald-600" aria-hidden="true" />
                      {site.phoneDisplay}
                    </a>
                    <span className="text-[11px] font-medium text-gray-500">{site.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/services" className="btn-secondary-pill-sm">
                      All services
                    </Link>
                    <Link href="/contact" className="btn-primary-pill-sm">
                      Free quote
                    </Link>
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
                  'relative inline-flex h-16 items-center text-[15px] font-bold transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  active ? 'text-emerald-600' : 'text-[#0a0a0a]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-0 bottom-3 mx-auto h-1 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
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
            🚀 Start Your Project
          </Link>
        </div>

        {/* Mobile hamburger — matches the round ink button inside the overlay */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="flex size-11 items-center justify-center rounded-full border-2 border-[#0a0a0a] text-[#0a0a0a] transition-colors duration-200 hover:bg-[#0a0a0a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>
      </header>

      {/* Full-screen colorful mobile navigation overlay — rendered OUTSIDE the
          sticky header because its backdrop-filter would otherwise become the
          containing block for this fixed-position overlay. */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
