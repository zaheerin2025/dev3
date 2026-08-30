'use client';

import * as React from 'react';
import { Mail, Phone, Sparkle, X } from 'lucide-react';
import { site } from '@/lib/site';
import { Link } from '@/components/common/link';

const MENU_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/portfolio' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile navigation overlay. Rendered conditionally by the header;
 * staggered fade-in via the `.menu-fade` utility (see globals.css).
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Lock body scroll while the menu is open.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      className="menu-fade fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-10 pt-4">
        {/* Top row — logo + close */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            ariaLabel="Developers3 — home"
            onClick={onClose}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-600 to-orange-400 shadow-[0_4px_14px_rgba(236,72,153,0.35)]"
            >
              <Sparkle className="size-5 text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[#0a0a0a]">
              Developers<span className="text-gradient">3</span>
              <span aria-hidden="true" className="ml-0.5 inline-block size-1.5 rounded-full bg-yellow-300" />
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-11 items-center justify-center rounded-full border-2 border-[#0a0a0a] text-[#0a0a0a] transition-colors duration-200 hover:bg-[#0a0a0a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Big bold staggered links */}
        <nav aria-label="Mobile navigation" className="mt-12 flex flex-col gap-5">
          {MENU_LINKS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="menu-fade group inline-flex items-baseline gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="text-gradient text-sm font-bold" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-4xl font-bold text-[#0a0a0a] transition-colors duration-200 group-hover:text-pink-600">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom — CTA + contact row */}
        <div
          className="menu-fade mt-auto flex flex-col gap-6 pt-12"
          style={{ animationDelay: `${MENU_LINKS.length * 70}ms` }}
        >
          <Link href="/contact" onClick={onClose} className="btn-primary-pill-sm w-full">
            🚀 Start Your Project
          </Link>
          <div className="flex flex-col gap-3 text-sm font-medium text-gray-500">
            {site.phoneDisplay ? (
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-[#0a0a0a]"
              >
                <Phone className="size-4 shrink-0 text-pink-600" aria-hidden="true" />
                {site.phoneDisplay}
              </a>
            ) : null}
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2.5 transition-colors hover:text-[#0a0a0a]"
            >
              <Mail className="size-4 shrink-0 text-pink-600" aria-hidden="true" />
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
