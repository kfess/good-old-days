/**
 * Google Analytics 4, only in builds made with VITE_GA_ID (set by the deploy workflow from the
 * GA_MEASUREMENT_ID repository variable).
 * gtag's bootstrap lives here instead of an inline <script>, so the CSP never needs 'unsafe-inline';
 * vite.config.ts opens the CSP to Google's hosts only when the ID is set.
 */
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const id = import.meta.env.VITE_GA_ID;

export function initAnalytics(): void {
  if (!id || import.meta.env.DEV) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // biome-ignore lint/complexity/noArguments: gtag.js only reads `arguments` objects from the queue
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}
