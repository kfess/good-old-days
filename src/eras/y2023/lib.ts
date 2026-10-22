import { reducedMotion } from '../../core/scroll';

/** Split text into LLM-ish tokens: words keep their leading space, CJK goes in 1–2 char chunks. */
export function tokenize(text: string): string[] {
  return text.match(/[　-鿿＀-￯]{1,2}|\s*[A-Za-z0-9'’]+|\s*[^\s]|\s+/gu) ?? [text];
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reducedMotion ? 0 : ms));

/** A run token: bump it to cancel every stream started with the previous value. */
export class Run {
  id = 0;
  next(): number {
    return ++this.id;
  }
  alive(id: number): boolean {
    return id === this.id;
  }
}

/**
 * Stream `text` into `el` token by token with a blinking cursor, like an LLM response.
 * Resolves early (silently) when `alive()` turns false.
 */
export async function streamInto(
  el: HTMLElement,
  text: string,
  opts: { tps?: number; keepCursor?: boolean; alive?: () => boolean } = {},
): Promise<void> {
  const alive = opts.alive ?? (() => true);
  if (reducedMotion) {
    el.append(text);
    return;
  }
  const cur = document.createElement('span');
  cur.className = 'ai-cursor';
  el.appendChild(cur);
  const tps = opts.tps ?? 30;
  for (const tok of tokenize(text)) {
    if (!alive()) break;
    const s = document.createElement('span');
    s.className = 'tok';
    s.textContent = tok;
    el.insertBefore(s, cur);
    await wait((1000 / tps) * (0.5 + Math.random()));
  }
  if (!opts.keepCursor) cur.remove();
}

/** Call `onShow` / `onHide` as `el` enters and leaves the viewport. */
export function whenVisible(el: Element, onShow: () => void, onHide: () => void = () => {}, margin = '0px'): void {
  new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? onShow() : onHide())),
    { rootMargin: margin },
  ).observe(el);
}

/** requestAnimationFrame loop that only runs while `el` is on screen. */
export function loopWhenVisible(el: Element, frame: (t: number) => void): void {
  let raf = 0;
  const tick = (t: number) => {
    frame(t);
    raf = requestAnimationFrame(tick);
  };
  whenVisible(
    el,
    () => {
      if (!raf) raf = requestAnimationFrame(tick);
    },
    () => {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  );
}

/** Size a canvas to its CSS box at device pixel ratio; returns the CSS size. */
export function fitCanvas(canvas: HTMLCanvasElement): { w: number; h: number; dpr: number } {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  return { w, h, dpr };
}
