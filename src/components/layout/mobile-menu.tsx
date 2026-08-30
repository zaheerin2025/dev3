'use client';

import * as React from 'react';
import { Mail, Phone, Sparkle, X } from 'lucide-react';
import { site } from '@/lib/site';
import { Link } from '@/components/common/link';
import { ACCENT_TEXT } from '@/lib/accent';

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
 * Full-screen mobile navigation overlay — paper sheet with oversized
 * grotesk links and index numbers cycling through the accent ramp.
 * Rendered conditionally by the header; staggered fade-in via `.menu-fade`.
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
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]"
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-11 items-center justify-center rounded-xl border border-[#d6d5cc] text-[#161613] transition-colors duration-200 hover:border-[#161613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Big staggered grotesk links with hairline rules */}
        <nav aria-label="Mobile navigation" className="mt-10 flex flex-col">
          {MENU_LINKS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="menu-fade group flex items-center gap-4 border-t border-[#e6e5de] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span
                className={`${ACCENT_TEXT[index % ACCENT_TEXT.length]} font-mono text-sm font-bold`}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 font-display text-[2.5rem] font-bold leading-tight tracking-tight text-[#161613] transition-colors duration-200 group-hover:text-[#FF4D00]">
                {item.label}
              </span>
              <span
                className="size-2.5 rounded-full bg-[#e6e5de] transition-colors duration-200 group-hover:bg-[#FF4D00]"
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

        {/* Bottom — CTA + contact row */}
        <div
          className="menu-fade mt-auto flex flex-col gap-6 pt-12"
          style={{ animationDelay: `${MENU_LINKS.length * 70}ms` }}
        >
          <Link href="/contact" onClick={onClose} className="btn-primary-pill w-full">
            Start Your Project
          </Link>
          {site.phoneDisplay || site.email ? (
            <div className="flex flex-col gap-3 text-base font-medium text-[#6f6e66]">
              {site.phoneDisplay ? (
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-[#161613]"
                >
                  <Phone className="size-4.5 shrink-0 text-[#FF4D00]" aria-hidden="true" />
                  {site.phoneDisplay}
                </a>
              ) : null}
              {site.email ? (
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-[#161613]"
                >
                  <Mail className="size-4.5 shrink-0 text-[#FF4D00]" aria-hidden="true" />
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
