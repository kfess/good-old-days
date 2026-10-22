import type { SimpleIcon } from 'simple-icons';
import { gsap, reducedMotion } from '../core/scroll';
import { esc, h } from '../core/util';
import { logo } from './logo';
import { brandName, hasWordmark } from './brand';

export interface CreditItem {
  year: string;
  name: string;
  icon?: SimpleIcon | string;
  /** one-line caption */
  line?: string;
}

/** The name as the brand writes it; an official wordmark replaces both icon and name. */
function nameTag(name: string): string {
  const b = brandName(name);
  return `<span class="credit__name${b.cls ? ' ' + b.cls : ''}"${b.style ? ` style="${b.style}"` : ''}>${b.html}</span>`;
}

/** a wordmark fallback would just repeat the name, so only real marks are drawn */
const hasMark = (icon: CreditItem['icon']) => !!icon && (typeof icon !== 'string' || icon.trim().startsWith('<svg'));

/**
 * The era's supporting cast as big kinetic type: rows of logo + name slide in opposite
 * directions as the block scrolls past, like end credits run sideways.
 */
export function createCredits(parent: HTMLElement, items: CreditItem[], title?: string): HTMLElement {
  const rows: CreditItem[][] = [[], []];
  items.forEach((it, i) => rows[i % 2].push(it));

  const el = h(`
    <div class="credits">
      ${title ? `<p class="credits__title">${esc(title)}</p>` : ''}
      ${rows
        .map(
          (row) => `
        <div class="credits__row">
          ${row
            .map(
              (c) => `
            <div class="credit">
              ${!hasWordmark(c.name) && hasMark(c.icon) ? `<span class="credit__icon">${logo(c.icon!)}</span>` : ''}
              <div class="credit__text">
                ${nameTag(c.name)}
                <span class="credit__meta"><b>${esc(c.year)}</b>${c.line ? ` ${esc(c.line)}` : ''}</span>
              </div>
            </div>`,
            )
            .join('')}
        </div>`,
        )
        .join('')}
    </div>`);
  parent.appendChild(el);

  if (reducedMotion) return el;
  const rowEls = Array.from(el.querySelectorAll<HTMLElement>('.credits__row'));
  rowEls.forEach((row, i) => {
    const travel = () => Math.max(0, row.scrollWidth - el.clientWidth);
    gsap.fromTo(
      row,
      { x: () => (i % 2 ? -travel() : 0) },
      {
        x: () => (i % 2 ? 0 : -travel()),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
      },
    );
  });
  return el;
}
