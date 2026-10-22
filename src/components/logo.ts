import type { SimpleIcon } from 'simple-icons';
import { esc } from '../core/util';

/**
 * Render a brand mark.
 * - a simple-icons object → inline SVG in the brand color (or currentColor)
 * - a raw `<svg…>` string → used as-is
 * - any other string → a typographic wordmark (for brands simple-icons does not ship)
 */
export function logo(icon: SimpleIcon | string, color: 'brand' | 'current' = 'brand'): string {
  if (typeof icon !== 'string') {
    const fill = color === 'brand' ? `#${icon.hex}` : 'currentColor';
    return `<svg class="logo" viewBox="0 0 24 24" role="img" aria-label="${esc(icon.title)}" fill="${fill}"><path d="${icon.path}"/></svg>`;
  }
  if (icon.trim().startsWith('<svg')) return icon;
  return `<span class="logo logo--word" aria-hidden="true">${esc(icon)}</span>`;
}
