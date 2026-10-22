/** Flat-design illustration helpers: long-shadow badges and flat servers (all original art). */
import type { SimpleIcon } from 'simple-icons';

export const FLAT = {
  turquoise: '#1abc9c',
  emerald: '#2ecc71',
  river: '#3498db',
  amethyst: '#9b59b6',
  asphalt: '#34495e',
  sunflower: '#f1c40f',
  carrot: '#e67e22',
  alizarin: '#e74c3c',
  clouds: '#ecf0f1',
  concrete: '#95a5a6',
} as const;

/**
 * Bootstrap's 2013 mark (a "B" in a rounded square, Bootstrap 3 docs), traced in a 24×24 box.
 * simple-icons now ships only the 2021 mark with curly braces, which would be an anachronism here.
 * The B is wound against the square and its counters with it, so the default nonzero fill cuts the B out.
 */
export const bootstrapB = {
  title: 'Bootstrap',
  slug: 'bootstrap',
  hex: '563D7C',
  source: 'https://getbootstrap.com/docs/3.3/',
  path: 'M4 0h16a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4zm3.2 5v14h6.3c2.8 0 4.5-1.4 4.5-3.8 0-1.8-1.1-3-2.8-3.3v-.1c1.3-.3 2.2-1.4 2.2-2.9C17.4 6.5 15.8 5 13.1 5zm2.6 2.1h2.6c1.4 0 2.2.7 2.2 1.8 0 1.2-.9 1.9-2.4 1.9H9.8zm0 5.6h2.9c1.6 0 2.5.7 2.5 2s-.9 2.1-2.5 2.1H9.8z',
  svg: '',
} as unknown as SimpleIcon;

type Shape =
  | { t: 'rect'; x: number; y: number; w: number; h: number; r?: number; detail?: boolean }
  | { t: 'circle'; cx: number; cy: number; r: number; detail?: boolean }
  | { t: 'path'; d: string };

const L = 140;
const K = Math.SQRT1_2;
let uid = 0;

/** The 45° shadow a shape casts toward the bottom-right corner. */
function shadow(s: Shape): string {
  if (s.t === 'rect') {
    const { x, y, w, h } = s;
    return `${x + w},${y} ${x + w + L},${y + L} ${x + w + L},${y + h + L} ${x + L},${y + h + L} ${x},${y + h}`;
  }
  if (s.t === 'circle') {
    const ax = s.cx + s.r * K, ay = s.cy - s.r * K;
    const bx = s.cx - s.r * K, by = s.cy + s.r * K;
    return `${ax},${ay} ${ax + L},${ay + L} ${bx + L},${by + L} ${bx},${by}`;
  }
  return '';
}

function shape(s: Shape, color: string): string {
  if (s.t === 'path') return `<path d="${s.d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  const fill = s.detail ? color : '#fff';
  if (s.t === 'rect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r ?? 1.5}" fill="${fill}"/>`;
  return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${fill}"/>`;
}

export const ICONS: Record<'laptop' | 'phone' | 'tablet' | 'cloud' | 'mail' | 'chart', Shape[]> = {
  laptop: [
    { t: 'rect', x: 26, y: 30, w: 48, h: 32, r: 2.5 },
    { t: 'rect', x: 18, y: 62, w: 64, h: 5, r: 2 },
    { t: 'rect', x: 30, y: 34, w: 40, h: 24, r: 1, detail: true },
  ],
  phone: [
    { t: 'rect', x: 37, y: 22, w: 26, h: 54, r: 4 },
    { t: 'rect', x: 40, y: 29, w: 20, h: 37, r: 1, detail: true },
    { t: 'circle', cx: 50, cy: 71, r: 2, detail: true },
  ],
  tablet: [
    { t: 'rect', x: 28, y: 22, w: 44, h: 56, r: 4 },
    { t: 'rect', x: 32, y: 28, w: 36, h: 42, r: 1, detail: true },
    { t: 'circle', cx: 50, cy: 74, r: 1.8, detail: true },
  ],
  cloud: [
    { t: 'circle', cx: 40, cy: 54, r: 11 },
    { t: 'circle', cx: 55, cy: 47, r: 15 },
    { t: 'circle', cx: 67, cy: 56, r: 9 },
    { t: 'rect', x: 34, y: 54, w: 36, h: 11, r: 5 },
  ],
  mail: [
    { t: 'rect', x: 26, y: 34, w: 48, h: 32, r: 2 },
    { t: 'path', d: 'M28 36 L50 53 L72 36' },
  ],
  chart: [
    { t: 'rect', x: 29, y: 52, w: 10, h: 18, r: 1 },
    { t: 'rect', x: 45, y: 40, w: 10, h: 30, r: 1 },
    { t: 'rect', x: 61, y: 30, w: 10, h: 40, r: 1 },
  ],
};

/** A round flat badge with a white glyph and the classic 2013 long shadow. */
export function badge(color: string, icon: keyof typeof ICONS, cls = ''): string {
  const id = `y12ls${uid++}`;
  const shapes = ICONS[icon];
  const shadows = shapes.filter((s) => s.t !== 'path' && !s.detail).map((s) => `<polygon points="${shadow(s)}"/>`).join('');
  return `<svg class="ls-badge ${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <circle cx="50" cy="50" r="50" fill="${color}"/>
    <g clip-path="url(#${id})" fill="rgba(0,0,0,.17)">${shadows}</g>
    ${shapes.map((s) => shape(s, color)).join('')}
  </svg>`;
}

/** A flat rack server, used for pets and cattle. */
export function server(color: string = FLAT.asphalt): string {
  const bays = [0, 1, 2]
    .map(
      (i) => `<rect x="12" y="${16 + i * 26}" width="56" height="20" rx="2" fill="rgba(255,255,255,.09)"/>
        <rect x="18" y="${24 + i * 26}" width="24" height="3" rx="1.5" fill="rgba(255,255,255,.32)"/>
        <circle class="led" style="animation-delay:${i * 0.37}s" cx="60" cy="${26 + i * 26}" r="2.6" fill="${FLAT.emerald}"/>`,
    )
    .join('');
  return `<svg class="srv" viewBox="0 0 80 100" aria-hidden="true"><rect x="6" y="8" width="68" height="86" rx="4" fill="${color}"/>${bays}</svg>`;
}
