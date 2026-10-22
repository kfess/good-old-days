import '../styles/lang.css';

/*
 * English, or Japanese where the joke lands harder in Japanese: the people in each era (threads,
 * chats, code comments, commit messages) talk the way Japanese engineers did. Headings, real error
 * messages and real UI stay as they were. Picked from `?lang=`, then the reader's last choice, then
 * the browser.
 */
export type Lang = 'en' | 'ja';

const KEY = 'god-lang';
/** where the reader was when they switched, so the reload puts them back there */
const PLACE_KEY = 'god-lang-place';

function detect(): Lang {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ja') return q;
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'en' || v === 'ja') return v;
  } catch {
    // storage blocked: fall through to the browser's language
  }
  return navigator.languages?.some((l) => l.toLowerCase().startsWith('ja')) ? 'ja' : 'en';
}

export const lang: Lang = detect();
document.documentElement.lang = lang;

/** `t('English', '日本語')`: the value for the current language (strings, arrays or whole objects). */
export function t<T>(en: T, ja: T): T {
  return lang === 'ja' ? ja : en;
}

function setLang(next: Lang): void {
  if (next === lang) return;
  try {
    localStorage.setItem(KEY, next);
    const mid = window.innerHeight / 2;
    const s = Array.from(document.querySelectorAll<HTMLElement>('section.era')).find((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    if (s) {
      const r = s.getBoundingClientRect();
      sessionStorage.setItem(PLACE_KEY, JSON.stringify({ era: s.dataset.era, f: (mid - r.top) / r.height }));
    }
  } catch {
    // without storage the switch still works through the URL; the reader just starts at the top
  }
  const url = new URL(location.href);
  url.searchParams.set('lang', next);
  location.replace(url);
}

/** The scroll position to return to after a language switch, once pins have their final size. */
export function placeAfterSwitch(): number | null {
  try {
    const raw = sessionStorage.getItem(PLACE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PLACE_KEY);
    const { era, f } = JSON.parse(raw) as { era: string; f: number };
    const s = document.querySelector<HTMLElement>(`section.era[data-era="${CSS.escape(era)}"]`);
    if (!s) return null;
    const r = s.getBoundingClientRect();
    return window.scrollY + r.top + f * r.height - window.innerHeight / 2;
  } catch {
    return null;
  }
}

/** The EN / 日本語 switch, bottom right, quiet until hovered. */
export function mountLangSwitch(): void {
  const el = document.createElement('div');
  el.className = 'lang';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'Language');
  el.innerHTML = (
    [
      ['en', 'EN'],
      ['ja', '日本語'],
    ] as const
  )
    .map(
      ([l, label]) =>
        `<button type="button" lang="${l}" data-lang="${l}" aria-pressed="${l === lang}">${label}</button>`,
    )
    .join('');
  el.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (b) setLang(b.dataset.lang as Lang);
  });
  document.body.appendChild(el);
}
