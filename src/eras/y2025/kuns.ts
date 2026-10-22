import type { SimpleIcon } from 'simple-icons';
import { claudeKun } from '../../components/claudekun';
import { reducedMotion } from '../../core/scroll';

const toImage = (svg: string): Promise<HTMLImageElement> => {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return img.decode().then(() => img);
};

/** A brand mark on a soft dark disc, as an orbit sprite. */
export function iconSprite(icon: SimpleIcon, color = `#${icon.hex}`): Promise<HTMLImageElement> {
  return toImage(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15.5" fill="#161616" stroke="${color}" stroke-opacity=".55"/><g transform="translate(7 7) scale(.75)"><path fill="${color}" d="${icon.path}"/></g></svg>`,
  );
}

/** A typographic mark (for labs without a public icon set), as an orbit sprite. */
export function textSprite(text: string, color = '#ffffff'): Promise<HTMLImageElement> {
  const size = text.length > 3 ? 7.4 : 10;
  return toImage(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15.5" fill="#161616" stroke="${color}" stroke-opacity=".55"/><text x="16" y="16" fill="${color}" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${size}" text-anchor="middle" dominant-baseline="central">${text}</text></svg>`,
  );
}

/** Claude-kun as a standalone image: the CSS classes become an inline <style>, since SVG-as-image can't see page CSS. */
export function kunSprite(): Promise<HTMLImageElement> {
  const inner = claudeKun('', 'happy').match(/<svg[^>]*>([\s\S]*)<\/svg>/)![1];
  const css = '.ck__body,.ck__arms,.ck__legs{fill:#d77757}.ck__eye{fill:#1a1a1a}';
  return toImage(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 -4 18 18" shape-rendering="crispEdges"><style>${css}</style>${inner}</svg>`,
  );
}

interface Kun {
  ring: number;
  a: number;
  speed: number;
  size: number;
}

const RINGS = [
  { r: 0.24, tilt: -0.32, squash: 0.34 },
  { r: 0.34, tilt: 0.18, squash: 0.3 },
  { r: 0.46, tilt: -0.08, squash: 0.26 },
];

/**
 * Hundreds of tiny marks (lab logos, a few Claude-kuns) orbiting the frontier on tilted rings.
 * `state.reveal` (0 → 1, scrubbed by the scene) spirals them out from the center.
 * Draws only while the canvas is on screen and its scene is the current one; centered on `center`.
 */
export function orbitMarks(
  canvas: HTMLCanvasElement,
  scene: HTMLElement,
  center: HTMLElement,
  sources: Promise<HTMLImageElement>[],
  count = 260,
): { state: { reveal: number } } {
  const state = { reveal: 0 };
  const ctx = canvas.getContext('2d')!;
  const kuns: Kun[] = Array.from({ length: count }, (_, i) => ({
    ring: i % RINGS.length,
    a: (i * 2.399963) % (Math.PI * 2),
    speed: (0.12 + (((i * 37) % 100) / 100) * 0.18) * (i % 2 ? 1 : 0.85),
    size: 9 + (((i * 53) % 100) / 100) * 13,
  }));
  let sprites: HTMLImageElement[] = [];
  Promise.all(sources).then((imgs) => (sprites = imgs));

  let w = 0;
  let h = 0;
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let visible = false;
  let raf = 0;
  let last = 0;
  const draw = (now: number) => {
    raf = visible ? requestAnimationFrame(draw) : 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (!w) resize();
    ctx.clearRect(0, 0, w, h);
    if (!sprites.length || state.reveal <= 0 || !scene.classList.contains('is-current')) return;
    // orbit whatever the logo is doing (it sits higher on phones)
    const c = center.getBoundingClientRect();
    const box = canvas.getBoundingClientRect();
    const cx = c.left + c.width / 2 - box.left;
    const cy = c.top + c.height / 2 - box.top;
    const unit = Math.min(w, h * 1.35);
    const shown = Math.round(kuns.length * Math.min(1, state.reveal * 1.15));
    for (let i = 0; i < shown; i++) {
      const k = kuns[i];
      if (!reducedMotion) k.a += k.speed * dt;
      const ring = RINGS[k.ring];
      const R = unit * ring.r * (0.35 + 0.65 * state.reveal);
      const ex = Math.cos(k.a) * R;
      const ey = Math.sin(k.a) * R * ring.squash;
      const x = cx + ex * Math.cos(ring.tilt) - ey * Math.sin(ring.tilt);
      const y = cy + ex * Math.sin(ring.tilt) + ey * Math.cos(ring.tilt);
      const depth = Math.sin(k.a); // > 0: in front of the logo
      const s = k.size * (0.78 + 0.32 * (depth + 1) * 0.5) * (unit / 1200 + 0.4);
      ctx.globalAlpha = Math.min(1, state.reveal * 1.4) * (0.45 + 0.55 * (depth + 1) * 0.5);
      ctx.drawImage(sprites[i % sprites.length], x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) {
      last = 0;
      raf = requestAnimationFrame(draw);
    }
  }).observe(canvas);
  window.addEventListener('resize', resize);

  return { state };
}
