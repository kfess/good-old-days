import { reducedMotion, ScrollTrigger } from './scroll';

/** Build an element from an HTML string (first element of the fragment). */
export function h<T extends HTMLElement = HTMLElement>(html: string): T {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  // import into the live document: template content lives in an inert document, which breaks jQuery show/hide
  return document.importNode(t.content, true).firstElementChild as T;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, reducedMotion ? 0 : ms));

/** Run `cb` once, the first time `el` scrolls into view. */
export function onceInView(el: Element, cb: () => void, start = 'top 75%'): void {
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: cb });
}

/** Type `text` into `el` character by character. */
export async function typeInto(el: HTMLElement, text: string, cps = 40): Promise<void> {
  if (reducedMotion) {
    el.textContent += text;
    return;
  }
  for (const ch of text) {
    el.textContent += ch;
    await new Promise((r) => setTimeout(r, 1000 / cps));
  }
}
