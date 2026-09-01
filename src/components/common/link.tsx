'use client';

import * as React from 'react';

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
  /** Convenience prop — maps to aria-label. */
  ariaLabel?: string;
}

/**
 * Internal link for the hash-based router. Always use this instead of raw
 * `href="#..."` anchors — in-page hash anchors would break routing.
 */
export function Link({ href, children, ariaLabel, ...rest }: LinkProps) {
  return (
    <a href={`#${href}`} aria-label={ariaLabel} {...rest}>
      {children}
    </a>
  );
}
