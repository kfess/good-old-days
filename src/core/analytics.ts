import '../styles/consent.css';
import { t } from './i18n';

/**
 * Google Analytics 4, only in builds made with VITE_GA_ID (set by the deploy workflow from the
 * GA_MEASUREMENT_ID repository variable), and only after the visitor says yes: until then gtag.js is
 * not even fetched, so no cookie is set. The answer is kept in localStorage; the footer can reopen it.
 * gtag's bootstrap lives here instead of an inline <script>, so the CSP never needs 'unsafe-inline';
 * vite.config.ts opens the CSP to Google's hosts only when the ID is set.
 */
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const id: string = import.meta.env.VITE_GA_ID ?? '';
const KEY = 'good-old-days:analytics';
type Choice = 'granted' | 'denied';

/** Whether this build measures at all (the footer only offers the setting when it does). */
export const hasAnalytics = !!id && !import.meta.env.DEV;

// storage can be missing or throw (private windows, blocked site data): then nothing is remembered
function stored(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function remember(choice: Choice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {}
}

let loaded = false;

function load(): void {
  if (loaded) return;
  loaded = true;
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

/** GA's own cookies (_ga, _ga_<id>), set on this host and its parent domains. */
function clearCookies(): void {
  const host = location.hostname;
  const domains = ['', host, ...host.split('.').map((_, i, p) => `.${p.slice(i).join('.')}`)];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const d of domains) {
      // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is missing from older Safari and Firefox
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

let banner: HTMLElement | null = null;

/** Ask (again). Not modal: the page keeps scrolling underneath, and nothing loads until "Allow". */
export function openConsent(): void {
  if (!hasAnalytics || banner) return;
  banner = document.createElement('section');
  banner.className = 'consent';
  banner.setAttribute('aria-label', 'Analytics consent');
  banner.innerHTML = `
    <p class="consent__text">${t(
      'May I count your visit? With your OK, this page uses Google Analytics, which sets cookies, to see how far people scroll. Nothing else is collected.',
      'アクセス数を数えてもいいですか？許可いただいた場合のみ、どこまでスクロールされたかを見るためにGoogle Analytics（Cookieを使います）を読み込みます。それ以外は何も集めません。',
    )}</p>
    <div class="consent__actions">
      <button type="button" class="consent__btn" data-choice="denied">${t('No thanks', '許可しない')}</button>
      <button type="button" class="consent__btn consent__btn--yes" data-choice="granted">${t('Allow', '許可する')}</button>
    </div>`;
  banner.addEventListener('click', (e) => {
    const choice = (e.target as HTMLElement).closest<HTMLElement>('[data-choice]')?.dataset.choice as
      | Choice
      | undefined;
    if (!choice) return;
    const was = stored();
    remember(choice);
    banner?.remove();
    banner = null;
    if (choice === 'granted') load();
    // gtag.js can't be unloaded: drop its cookies, and reload only if it was running on this page
    else if (was === 'granted') {
      clearCookies();
      if (loaded) location.reload();
    }
  });
  document.body.appendChild(banner);
}

export function initAnalytics(): void {
  if (!hasAnalytics) return;
  const choice = stored();
  if (choice === 'granted') load();
  else if (choice === null) openConsent();
}
