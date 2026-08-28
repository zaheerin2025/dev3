// Lightweight GA4 event tracking. Events flow to gtag when GA is configured,
// and always into dataLayer so tag managers can pick them up.

export type AnalyticsEventName =
  | 'generate_lead'
  | 'whatsapp_click'
  | 'call_click'
  | 'email_click'
  | 'newsletter_signup'
  | 'cta_click'
  | 'portfolio_filter'
  | 'faq_open';

export function trackEvent(event: AnalyticsEventName | string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
  if (typeof w.gtag === 'function') {
    w.gtag('event', event, params);
  }
}
