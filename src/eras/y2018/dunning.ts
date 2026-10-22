import { gsap, reducedMotion, MOBILE_QUERY } from '../../core/scroll';
import { h } from '../../core/util';

/** The internet's favourite chart, applied to Kubernetes. A dot walks the curve as you scroll. */
const CURVE: [number, number][] = [
  [40, 330], [90, 330], [120, 40], [190, 40],
  [260, 40], [290, 300], [380, 300],
  [480, 300], [560, 170], [700, 130],
  [780, 110], [860, 104], [960, 100],
];

/**
 * Each quote is anchored to the feature it names (the peak, the valley floor...), found on the curve
 * by x, and offset so the card sits beside the line rather than on it.
 */
const BEATS: { x: number; when: string; say: string; place: string; pos: 'peak' | 'valley' | 'slope' | 'plateau' }[] = [
  { x: 190, when: 'Day 1', say: 'I fully understand Kubernetes.', place: 'Mount Stupid', pos: 'peak' },
  { x: 380, when: 'Week 3', say: 'I understand nothing.', place: 'Valley of Despair', pos: 'valley' },
  { x: 620, when: 'Year 2', say: 'I understand it a little.', place: 'Slope of Enlightenment', pos: 'slope' },
  { x: 958, when: 'Year 5', say: 'It depends.', place: 'Plateau', pos: 'plateau' },
];

/** the walk is done by this share of the scroll; the rest holds the final beat on screen */
const WALK_END = 0.82;

export function createDunning(section: HTMLElement): void {
  const el = h(`
    <div class="dk">
      <div class="dk__sticky">
        <header class="dk__head">
          <p class="dk__kicker">Meanwhile, in every engineer’s head</p>
          <h3 class="dk__title">Learning Kubernetes.</h3>
        </header>
        <div class="dk__chart">
          <svg preserveAspectRatio="xMidYMid meet" aria-hidden="true"></svg>
          ${BEATS.map(
            (b, i) => `
            <figure class="dk__beat dk__beat--${b.pos}" data-i="${i}">
              <figcaption><b>${b.when}</b> · ${b.place}</figcaption>
              <blockquote>“${b.say}”</blockquote>
            </figure>`,
          ).join('')}
        </div>
      </div>
    </div>`);
  section.appendChild(el);

  const chart = el.querySelector<HTMLElement>('.dk__chart')!;
  const svg = el.querySelector('svg')!;
  const beats = Array.from(el.querySelectorAll<HTMLElement>('.dk__beat'));
  const mq = window.matchMedia(MOBILE_QUERY);

  let curve: SVGPathElement;
  let dot: SVGCircleElement;
  let len = 0;
  const at: number[] = [];
  let last = 0;

  // phones are narrow: the same curve, stretched taller, so it isn't a thin line across the screen
  const build = () => {
    const ky = mq.matches ? 1.9 : 1;
    const H = 380 * ky;
    const y = (v: number) => v * ky;
    const pts = CURVE.map(([px, py]) => `${px} ${y(py)}`);
    const d = `M ${pts[0]} C ${pts.slice(1, 4).join(', ')} C ${pts.slice(4, 7).join(', ')} C ${pts.slice(7, 10).join(', ')} C ${pts.slice(10, 13).join(', ')}`;
    const fs = mq.matches ? 26 : 14;
    svg.setAttribute('viewBox', `0 0 1000 ${H}`);
    chart.style.aspectRatio = `1000 / ${H}`;
    svg.innerHTML = `
      <line class="dk__axis" x1="40" y1="${H - 30}" x2="980" y2="${H - 30}" />
      <line class="dk__axis" x1="40" y1="${H - 30}" x2="40" y2="20" />
      <text class="dk__axis-label" x="980" y="${H - 30 + fs * 1.5}" text-anchor="end" style="font-size:${fs}px">experience →</text>
      <text class="dk__axis-label" x="${-(H - 30) / 2}" y="${fs * 1.85}" transform="rotate(-90)" text-anchor="middle" style="font-size:${fs}px">confidence →</text>
      <path class="dk__ghost" d="${d}" />
      <path class="dk__curve" d="${d}" />
      <circle class="dk__dot" r="${mq.matches ? 16 : 9}" cx="40" cy="${y(330)}" />`;
    curve = svg.querySelector<SVGPathElement>('.dk__curve')!;
    dot = svg.querySelector<SVGCircleElement>('.dk__dot')!;
    len = curve.getTotalLength();
    curve.style.strokeDasharray = String(len);
    // where along the curve each feature is: first point at or past its x
    BEATS.forEach((b, i) => {
      let lo = 0;
      for (let s = 0; s <= 400; s++) {
        const pt = curve.getPointAtLength((len * s) / 400);
        if (pt.x >= b.x) {
          lo = s / 400;
          break;
        }
        lo = s / 400;
      }
      // Mount Stupid is the summit, not the first time the climb reaches its x
      if (b.pos === 'peak') {
        let best = 0;
        let bestY = Infinity;
        for (let s = 0; s <= 200; s++) {
          const pt = curve.getPointAtLength((len * s) / 400);
          if (pt.y < bestY) {
            bestY = pt.y;
            best = s / 400;
          }
        }
        lo = best;
      }
      at[i] = lo;
      const pt = curve.getPointAtLength(len * lo);
      let ax = pt.x;
      let ay = pt.y;
      // the valley's card floats up between its walls, where the gap is wider than the card
      if (b.pos === 'valley') {
        const level = y(190);
        let down = 0;
        let up = 1000;
        let prevY = 0;
        for (let s = 0; s <= 400; s++) {
          const q = curve.getPointAtLength((len * s) / 400);
          if (s && prevY < level && q.y >= level) down = q.x;
          if (s && prevY > level && q.y <= level && q.x > pt.x) up = Math.min(up, q.x);
          prevY = q.y;
        }
        ax = (down + up) / 2;
        ay = level;
      }
      beats[i].style.left = `${(ax / 1000) * 100}%`;
      beats[i].style.top = `${(ay / H) * 100}%`;
    });
    place(last);
  };

  const place = (p: number) => {
    last = p;
    if (!curve) return;
    const pt = curve.getPointAtLength(len * p);
    dot.setAttribute('cx', String(pt.x));
    dot.setAttribute('cy', String(pt.y));
    curve.style.strokeDashoffset = String(len * (1 - p));
    let current = -1;
    beats.forEach((b, i) => {
      // a quote arrives just before the dot does
      const on = p >= at[i] - 0.03;
      b.classList.toggle('is-on', on);
      if (on) current = i;
    });
    // phones only have room for the latest quote
    beats.forEach((b, i) => b.classList.toggle('is-current', i === current));
  };

  build();
  mq.addEventListener('change', build);

  if (reducedMotion) {
    place(1);
    el.classList.add('is-static');
    return;
  }
  place(0);
  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: () => place(Math.min(1, state.p / WALK_END)),
    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  });
}
