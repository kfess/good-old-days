/** Isometric SVG helpers for the 2015–2017 illustrations (all original art). */

const C = Math.cos(Math.PI / 6);

export const MD = {
  indigo: '#3f51b5',
  pink: '#ff4081',
  teal: '#009688',
  amber: '#ffc107',
  lightBlue: '#03a9f4',
  deepOrange: '#ff5722',
  purple: '#9c27b0',
  green: '#4caf50',
  blueGrey: '#607d8b',
  white: '#fafafa',
} as const;

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export type Pt = [number, number];

/** world (x right-down, y left-down, z up) → screen */
export function P(x: number, y: number, z: number, s: number): Pt {
  return [(x - y) * C * s, (x + y) * 0.5 * s - z * s];
}

const pts = (a: Pt[]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export interface Box {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  cls?: string;
  /** optional label drawn on the top face */
  label?: string;
}

/** Three visible faces of a box, as an SVG group. */
export function box(b: Box, s: number): string {
  const { x, y, z, w, d, h } = b;
  const top = [P(x, y, z + h, s), P(x + w, y, z + h, s), P(x + w, y + d, z + h, s), P(x, y + d, z + h, s)];
  const left = [P(x, y + d, z, s), P(x + w, y + d, z, s), P(x + w, y + d, z + h, s), P(x, y + d, z + h, s)];
  const right = [P(x + w, y, z, s), P(x + w, y + d, z, s), P(x + w, y + d, z + h, s), P(x + w, y, z + h, s)];
  const [lx, ly] = P(x + w / 2, y + d / 2, z + h, s);
  return `<g class="iso ${b.cls ?? ''}">
    <polygon points="${pts(left)}" fill="${shade(b.color, -0.12)}"/>
    <polygon points="${pts(right)}" fill="${shade(b.color, -0.3)}"/>
    <polygon points="${pts(top)}" fill="${shade(b.color, 0.12)}"/>
    ${b.label ? `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" class="iso__label">${b.label}</text>` : ''}
  </g>`;
}

/** Render boxes back-to-front and fit the viewBox around them. */
export function scene(boxes: Box[], s: number, pad = 12): { svg: string; viewBox: string } {
  const order = [...boxes].sort((a, b) => a.x + a.y + a.z * 0.01 - (b.x + b.y + b.z * 0.01) || a.z - b.z);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const b of boxes) {
    for (const [px, py] of [
      P(b.x, b.y, b.z + b.h, s),
      P(b.x + b.w, b.y, b.z, s),
      P(b.x, b.y + b.d, b.z, s),
      P(b.x + b.w, b.y + b.d, b.z, s),
      P(b.x + b.w, b.y + b.d, b.z + b.h, s),
      P(b.x, b.y, b.z, s),
    ]) {
      minX = Math.min(minX, px); maxX = Math.max(maxX, px);
      minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    }
  }
  return {
    svg: order.map((b) => box(b, s)).join(''),
    viewBox: `${(minX - pad).toFixed(0)} ${(minY - pad).toFixed(0)} ${(maxX - minX + pad * 2).toFixed(0)} ${(maxY - minY + pad * 2).toFixed(0)}`,
  };
}
