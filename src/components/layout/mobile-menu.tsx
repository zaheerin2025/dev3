'use client';

import * as React from 'react';
import { Mail, Phone, X } from 'lucide-react';
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
 * Full-screen mobile navigation overlay — editorial paper sheet with
 * serif display links, mono index numbers and hairline rules. Rendered
 * conditionally by the header; staggered fade-in via `.menu-fade`.
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
      className="menu-fade fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#fafaf7]"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-10 pt-4">
        {/* Top row — logo + close */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            ariaLabel="Developers3 — home"
            onClick={onClose}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3b2a8]"
          >
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-md bg-[#161613]"
            >
              <span className="text-sm text-[#ff4d00]" aria-hidden="true">✦</span>
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-[#161613]">
              Developers3
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-11 items-center justify-center rounded-md border border-[#d6d5cc] text-[#161613] transition-colors duration-200 hover:border-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3b2a8]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Big staggered serif links with hairline rules */}
        <nav aria-label="Mobile navigation" className="mt-10 flex flex-col">
          {MENU_LINKS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="menu-fade group flex items-baseline gap-4 border-t border-[#e6e5de] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3b2a8]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="font-mono text-xs text-[#ff4d00]" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-4xl font-medium text-[#161613] transition-colors duration-200 group-hover:italic group-hover:text-[#ff4d00]">
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
            Start Your Project
          </Link>
          {site.phoneDisplay || site.email ? (
            <div className="flex flex-col gap-3 text-sm font-medium text-[#6f6e66]">
              {site.phoneDisplay ? (
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-[#161613]"
                >
                  <Phone className="size-4 shrink-0 text-[#b3b2a8]" aria-hidden="true" />
                  {site.phoneDisplay}
                </a>
              ) : null}
              {site.email ? (
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-[#161613]"
                >
                  <Mail className="size-4 shrink-0 text-[#b3b2a8]" aria-hidden="true" />
                  {site.email}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
