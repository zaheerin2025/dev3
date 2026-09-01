import { NextResponse, type NextRequest } from 'next/server';

/**
 * Production security headers proxy (formerly middleware in Next 16+).
 * Runs on every request and adds standard security headers.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;

  // Prevent MIME-type sniffing (IE/Chrome may execute non-JS as JS).
  headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent the site from being embedded in iframes (clickjacking).
  headers.set('X-Frame-Options', 'DENY');

  // Modern browsers use CSP instead; setting to 0 disables the legacy XSS auditor
  // which can introduce its own vulnerabilities.
  headers.set('X-XSS-Protection', '0');

  // Control what information is sent in the Referer header.
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict access to sensitive browser APIs.
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Force HTTPS for 2 years (only effective on HTTPS connections).
  if (request.nextUrl.protocol === 'https:') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

/** Run proxy on all routes except static assets and Next.js internals. */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.svg, logo.svg, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|logo\\.svg|sitemap\\.xml|robots\\.txt).*)',
  ],
};
