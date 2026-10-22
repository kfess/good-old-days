import { ScrollTrigger } from '../../core/scroll';

/** Run `frame` on every animation frame, but only while `el` is on screen. */
export function visibleLoop(el: HTMLElement, frame: (t: number, dt: number) => void): void {
  let raf = 0;
  let last = 0;
  const tick = (t: number) => {
    const dt = last ? Math.min(64, t - last) : 16;
    last = t;
    frame(t, dt);
    raf = requestAnimationFrame(tick);
  };
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    // measured after the pins (including one inside `el`), or the range ends where the unpinned box did
    refreshPriority: -1,
    onToggle: (self) => {
      cancelAnimationFrame(raf);
      if (self.isActive) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    },
  });
}
