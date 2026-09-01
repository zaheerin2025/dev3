'use client';

import * as React from 'react';
import { navigate } from '@/lib/router';

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
  /** Convenience prop — maps to aria-label. */
  ariaLabel?: string;
}

/**
 * Clean internal link component.
 * Intercepts clicks for fast client-side navigation without full reloads,
 * while outputting standard SEO-friendly URLs (`href="/services"`).
 */
export function Link({ href, children, ariaLabel, onClick, ...rest }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Don't intercept if modifier keys pressed or external link
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return;
    }

    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} aria-label={ariaLabel} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
