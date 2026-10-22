import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** breakpoint shared with CSS: below this width every horizontal track becomes vertical */
export const MOBILE_QUERY = '(max-width: 759.98px)';
export const DESKTOP_QUERY = '(min-width: 760px)';

let lenis: Lenis | null = null;

export function initScroll(): void {
  // `?nosmooth` keeps native scrolling (used by scripts/shot.mjs for deterministic captures)
  if (reducedMotion || new URLSearchParams(location.search).has('nosmooth')) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToEl(target: HTMLElement | number): void {
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else target.scrollIntoView();
}

/** Jump without animation (used to restore the reading position after a resize). */
export function jumpTo(y: number): void {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

export { gsap, ScrollTrigger };
