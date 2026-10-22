import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Content Security Policy for the built page. GitHub Pages can't send headers, so it ships as a
 * <meta> tag (which can't express frame-ancestors). Build only: the dev server injects its own
 * client and styles for HMR. Google Analytics' hosts are allowed only when the build has a GA ID.
 */
function cspFor(analytics: boolean): string {
  const ga = (...hosts: string[]) => (analytics ? ` ${hosts.join(' ')}` : '');
  return [
    "default-src 'self'",
    `script-src 'self'${ga('https://*.googletagmanager.com')}`,
    // stylesheets: the bundle and Google Fonts; style="" attributes are everywhere in the markup
    "style-src 'self' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    'font-src https://fonts.gstatic.com',
    // data: for the favicon, CSS-embedded SVGs and the canvas sprites built from SVG strings
    `img-src 'self' data:${ga('https://*.google-analytics.com', 'https://*.googletagmanager.com')}`,
    `connect-src 'self'${ga('https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com')}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

const csp = (content: string): Plugin => ({
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content }, injectTo: 'head-prepend' },
  ],
});

export default defineConfig(({ mode }) => {
  const { VITE_GA_ID } = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    // relative asset paths: dist/ works from any folder or static host
    base: './',
    plugins: [csp(cspFor(!!VITE_GA_ID))],
    build: {
      // both chunks pass Vite's 500 kB default: the main bundle, and three.js (lazily loaded on its own)
      chunkSizeWarningLimit: 800,
    },
  };
});
