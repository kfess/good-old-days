import { reducedMotion } from '../../core/scroll';

/** Material ink ripple for every `.rp` element under `root`. */
export function ripples(root: HTMLElement): void {
  root.addEventListener('pointerdown', (e) => {
    const host = (e.target as HTMLElement).closest<HTMLElement>('.rp');
    if (!host || reducedMotion) return;
    const r = host.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const ink = document.createElement('span');
    ink.className = 'ink';
    ink.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    host.appendChild(ink);
    ink.addEventListener('animationend', () => ink.remove());
  });
}
