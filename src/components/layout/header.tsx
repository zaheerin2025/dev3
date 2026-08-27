'use client';

import * as React from 'react';
import { ChevronDown, Clock, Mail, Menu, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { site } from '@/lib/site';
import { services } from '@/data';
import { Link } from '@/components/common/link';
import { ServiceIconGlyph } from '@/components/common/icon-map';

interface HeaderProps {
  path: string;
}

const MAIN_NAV = [
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/';
  if (href === '/portfolio') return path.startsWith('/portfolio');
  if (href === '/blog') return path.startsWith('/blog');
  if (href === '/services') return path === '/services' || (services.some((s) => s.slug === path.slice(1)) && path !== '/');
  return path === href;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" ariaLabel="Developers3 — home">
      <img src="/logo.svg" alt="" width={34} height={34} className="h-9 w-9" />
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        Developers<span className="text-emerald-600">3</span>
      </span>
    </Link>
  );
}

export function Header({ path }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive(path, '/services') ? 'text-emerald-700' : 'text-foreground/80'
                )}
              >
                Services
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[560px] p-2">
              <div className="grid grid-cols-2 gap-1">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/${service.slug}`}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <ServiceIconGlyph icon={service.icon} className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{service.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{service.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-2 border-t border-border pt-2">
                <Link
                  href="/services"
                  className="flex items-center justify-center rounded-lg p-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-accent"
                >
                  View all services →
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive(path, item.href) ? 'text-emerald-700' : 'text-foreground/80'
              )}
              aria-current={isActive(path, item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
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
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent',
                  path === '/' ? 'text-emerald-700' : 'text-foreground'
                )}
              >
                Home
              </Link>
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Services
              </p>
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/${service.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-accent',
                    path === `/${service.slug}` ? 'text-emerald-700' : 'text-foreground/85'
                  )}
                >
                  {service.name}
                </Link>
              ))}
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-[15px] font-semibold text-emerald-700 transition-colors hover:bg-accent"
              >
                All services →
              </Link>
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Company
              </p>
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-accent',
                    isActive(path, item.href) ? 'text-emerald-700' : 'text-foreground/85'
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
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent"
              >
                <Phone className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {site.phoneDisplay}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent"
              >
                <Mail className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {site.email}
              </a>
              <span className="inline-flex items-center gap-2 px-3 text-xs text-muted-foreground">
                <Clock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {site.hours}
              </span>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
