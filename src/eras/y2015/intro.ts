import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h } from '../../core/util';
import { type Box, MD, scene } from './iso';

const WORDS = ['component.', 'container.', 'function.', 'microservice.'];

/** Components stacked on a page, a column of containers and a server tower, in isometric. */
function illustration(): string {
  const boxes: Box[] = [{ x: 0, y: 0, z: 0, w: 10, d: 10, h: 0.5, color: MD.white, cls: 'plate' }];
  const colors = [MD.indigo, MD.pink, MD.teal, MD.amber, MD.lightBlue, MD.deepOrange, MD.purple, MD.green, MD.indigo];
  const heights = [2.4, 1.2, 1.8, 1, 3, 1.4, 1.6, 2.2, 1];
  let i = 0;
  for (const gx of [0.8, 3.9, 7]) {
    for (const gy of [0.8, 3.9, 7]) {
      boxes.push({ x: gx, y: gy, z: 0.5, w: 2.2, d: 2.2, h: heights[i], color: colors[i], cls: 'drop' });
      i++;
    }
  }
  for (let k = 0; k < 4; k++) {
    boxes.push({
      x: 12,
      y: 1,
      z: k * 1.25,
      w: 1.6,
      d: 4.2,
      h: 1.15,
      color: [MD.lightBlue, MD.teal, MD.blueGrey, MD.deepOrange][k],
      cls: 'drop stackbox',
    });
  }
  boxes.push({ x: 12, y: 7, z: 0, w: 2.6, d: 2.6, h: 5.5, color: MD.blueGrey, cls: 'drop' });
  const { svg, viewBox } = scene(boxes, 26);
  return `<svg class="y15-iso" viewBox="${viewBox}" aria-hidden="true">${svg}</svg>`;
}

export function mountIntro(parent: HTMLElement): void {
  const el = h(`
    <header class="y15-intro">
      <div class="y15-intro__text">
        <p class="y15-intro__years">2015 — 2017</p>
        <h2 class="y15-intro__title">Everything is a<br><span class="y15-typed">component.</span><i class="y15-caret" aria-hidden="true"></i></h2>
        <p class="y15-intro__jp">Screens and servers alike became small parts, composed.</p>
      </div>
      <div class="y15-intro__art">${illustration()}</div>
    </header>`);
  parent.appendChild(el);

  if (reducedMotion) return;

  const drops = el.querySelectorAll('.drop');
  gsap.from(drops, {
    y: -120,
    opacity: 0,
    duration: 0.7,
    stagger: 0.06,
    ease: 'bounce.out',
    scrollTrigger: { trigger: el, start: 'top 65%' },
  });
  gsap.to(el.querySelector('.y15-iso'), {
    y: -60,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
  });

  // typed.js-style headline: backspace and retype the last word while on screen
  const typed = el.querySelector<HTMLElement>('.y15-typed')!;
  let running = false;
  let gen = 0;
  let word = 0;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  async function loop(): Promise<void> {
    const me = ++gen;
    const alive = () => running && me === gen;
    while (alive()) {
      await sleep(1800);
      if (!alive()) break;
      const cur = WORDS[word];
      for (let n = cur.length; n >= 0 && alive(); n--) {
        typed.textContent = cur.slice(0, n);
        await sleep(45);
      }
      word = (word + 1) % WORDS.length;
      const next = WORDS[word];
      for (let n = 1; n <= next.length && alive(); n++) {
        typed.textContent = next.slice(0, n);
        await sleep(85);
      }
    }
    // leave the true catchphrase behind when the visitor scrolls away
    if (me === gen) {
      typed.textContent = WORDS[0];
      word = 0;
    }
  }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    end: 'bottom 20%',
    onToggle: (self) => {
      running = self.isActive;
      if (running) loop();
    },
  });
}
