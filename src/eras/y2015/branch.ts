import { siReact, siVuedotjs } from 'simple-icons';
import { logo } from '../../components/logo';
import { angularShield } from '../../components/marks';
import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { esc, h } from '../../core/util';

type Framework = 'react' | 'angular' | 'vue';

const ROUTES: Record<
  Framework,
  { name: string; icon: typeof siReact; color: string; line: string; code: string; x: number }
> = {
  react: {
    name: 'React 15',
    icon: siReact,
    color: '#00b8d9',
    line: 'JSX felt weird. Then you couldn’t live without it.',
    code: `class Hello extends React.Component {
  render() {
    // don't touch this. it works.
    return <h1>Hello, {this.props.name}</h1>;
  }
}`,
    x: 100,
  },
  angular: {
    name: 'Angular 2',
    icon: angularShield,
    color: '#dd0031',
    line: 'TypeScript by default, years before everyone else.',
    code: `@Component({
  selector: 'app-hello',
  template: '<h1>Hello, {{name}}</h1>'
})
export class HelloComponent { name = 'Angular'; }`,
    x: 300,
  },
  vue: {
    name: 'Vue 2',
    icon: siVuedotjs,
    color: '#41b883',
    line: 'The comfort of <template>, just light enough.',
    code: `<template>
  <h1>Hello, {{ name }}</h1>
</template>
<script>
export default { data: () => ({ name: 'Vue' }) }
</script>`,
    x: 500,
  },
};

const KEYS = Object.keys(ROUTES) as Framework[];

/**
 * The 2016 fork in the road, shown rather than picked: as you scroll, React, Angular 2 and Vue 2
 * take their turn, then all three roads stay lit. (2018 merges them into TypeScript.)
 */
export function mountBranch(parent: HTMLElement): void {
  const el = h(`
    <section class="y15-panel y15-branch" data-hud-year="2016">
      <div class="y15-branch__pin">
        <header class="y15-head">
          <p class="y15-kicker">2016 · Three roads</p>
          <h3 class="y15-title">React, Angular, or Vue?</h3>
          <p class="y15-jp">Back then, everyone picked one.</p>
        </header>
        <svg class="y15-branch__map" aria-hidden="true">
          ${KEYS.map((k) => `<path data-route="${k}" pathLength="1" style="--fw:${ROUTES[k].color}"/>`).join('')}
        </svg>
        <div class="y15-branch__btns">
          ${KEYS.map(
            (k) => `<div class="y15-pick" data-fw="${k}" style="--fw:${ROUTES[k].color}">
              <span class="y15-pick__icon">${logo(ROUTES[k].icon)}</span><span>${ROUTES[k].name}</span>
            </div>`,
          ).join('')}
        </div>
        <div class="y15-route">
          ${KEYS.map(
            (k) => `
            <div class="y15-route__card" data-fw="${k}" style="--fw:${ROUTES[k].color}">
              <div class="y15-route__head"><span class="y15-route__icon">${logo(ROUTES[k].icon)}</span><div><b>${ROUTES[k].name}</b><p>${esc(ROUTES[k].line)}</p></div></div>
              <pre><code>${esc(ROUTES[k].code)}</code></pre>
            </div>`,
          ).join('')}
          <p class="y15-route__next">→ 2018 · Every road merges into TypeScript.</p>
        </div>
        <p class="y15-fatigue" aria-live="off">New JavaScript frameworks released since you opened this page: <b>0</b> <span class="y15-fatigue__sigh">…and I still haven’t caught up with the last one.</span></p>
      </div>
    </section>`);
  parent.appendChild(el);

  const pin = el.querySelector<HTMLElement>('.y15-branch__pin')!;
  const paths = Array.from(el.querySelectorAll<SVGPathElement>('.y15-branch__map path'));
  const chips = Array.from(el.querySelectorAll<HTMLElement>('.y15-pick'));
  const cards = Array.from(el.querySelectorAll<HTMLElement>('.y15-route__card'));
  const next = el.querySelector<HTMLElement>('.y15-route__next')!;
  const map = el.querySelector<SVGSVGElement>('.y15-branch__map')!;

  // easter egg: JavaScript fatigue, measured from when the page was opened; ticks only while on screen
  const fatigue = el.querySelector<HTMLElement>('.y15-fatigue b')!;
  const tick = () => (fatigue.textContent = String(1 + Math.floor(performance.now() / 20000)));
  tick();
  let timer = 0;
  new IntersectionObserver(([e]) => {
    window.clearInterval(timer);
    if (e.isIntersecting) {
      tick();
      timer = window.setInterval(tick, 1000);
    }
  }).observe(el);

  // the roads are drawn in the SVG's own pixel space, from the trunk (top centre) to the
  // top centre of each chip as actually laid out, so they always land on their chip
  const layout = () => {
    const box = map.getBoundingClientRect();
    if (!box.width) return;
    map.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const x0 = box.width / 2;
    chips.forEach((chip, i) => {
      const r = chip.getBoundingClientRect();
      const x = r.left + r.width / 2 - box.left;
      const y = r.top - box.top;
      paths[i].setAttribute('d', `M${x0} 0 C${x0} ${y * 0.55} ${x} ${y * 0.4} ${x} ${y}`);
    });
  };
  layout();
  window.addEventListener('resize', layout);
  ScrollTrigger.addEventListener('refresh', layout);
  document.fonts?.ready.then(layout);

  if (reducedMotion) {
    el.classList.add('is-static', 'is-all');
    chips.forEach((c) => c.classList.add('is-on'));
    paths.forEach((p) => p.classList.add('is-on'));
    return;
  }

  // pathLength="1": the draw-on animation doesn't depend on the measured geometry
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(cards, { autoAlpha: 0, y: 30 });
  gsap.set(next, { autoAlpha: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: pin, pin: true, start: 'top top', end: '+=240%', scrub: 0.6, anticipatePin: 1 },
  });
  KEYS.forEach((_, i) => {
    const at = i * 1.2;
    // the outgoing card is gone before the next one arrives, so their text never overprints
    const fadeIn = i > 0 ? at + 0.3 : at + 0.15;
    tl.add(() => chips.forEach((c, k) => c.classList.toggle('is-on', k === i)), at)
      .to(paths[i], { strokeDashoffset: 0, duration: 0.6 }, at)
      .to(cards[i], { autoAlpha: 1, y: 0, duration: 0.4 }, fadeIn);
    if (i > 0) tl.to(cards[i - 1], { autoAlpha: 0, y: -30, duration: 0.28, ease: 'power2.in' }, at);
  });
  // all three roads stay lit; the last card steps aside for the merge line
  tl.add(() => {
    chips.forEach((c) => c.classList.add('is-on'));
    el.classList.add('is-all');
  }, 3.7)
    .to(cards[2], { autoAlpha: 0, y: -30, duration: 0.4 }, 3.7)
    .to(next, { autoAlpha: 1, duration: 0.5 }, 3.9)
    .to({}, { duration: 0.6 });
  // scrubbing backwards must undo the class toggles too
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    const all = t >= 3.7;
    el.classList.toggle('is-all', all);
    chips.forEach((c, k) => c.classList.toggle('is-on', all || (t >= k * 1.2 && t < (k + 1) * 1.2)));
    paths.forEach((p, k) => p.classList.toggle('is-on', t >= k * 1.2));
  });
}
