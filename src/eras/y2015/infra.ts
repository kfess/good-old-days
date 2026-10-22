import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h, onceInView } from '../../core/util';
import { mountDeathStar } from './deathstar';
import { type Box, MD, P, scene } from './isometric';
import { mountMesh } from './mesh';
import { ripples } from './ripple';

const S = 24;
const SERVICES: [string, string, number, number][] = [
  ['auth', MD.indigo, 0, 0],
  ['users', MD.teal, 3.2, 0],
  ['orders', MD.deepOrange, 6.4, 0],
  ['search', MD.amber, 0, 3.2],
  ['payments', MD.pink, 3.2, 3.2],
  ['mail', MD.lightBlue, 6.4, 3.2],
];

/** One SVG holding both states: the monolith, and the services (+ their container replicas). */
function splitScene(): string {
  const mono: Box[] = [{ x: 0, y: 0, z: 0, w: 8.6, d: 5.4, h: 3.4, color: MD.blueGrey, label: 'monolith.war' }];
  const svc: Box[] = [];
  SERVICES.forEach(([, color, x, y]) => {
    svc.push({ x, y, z: 0, w: 2.2, d: 2.2, h: 1.2, color, cls: 'svc' });
    for (let k = 0; k < 2; k++) {
      svc.push({ x: x + 0.3, y: y + 0.3, z: 1.35 + k * 0.75, w: 1.6, d: 1.6, h: 0.6, color, cls: 'rep' });
    }
  });
  const all = scene([...mono, ...svc], S, 20);
  const monoSvg = scene(mono, S).svg;
  const svcSvg = scene(svc, S).svg;
  // crack lines across the monolith's top face
  const c = (pts: [number, number][]) =>
    pts
      .map(([x, y]) =>
        P(x, y, 3.4, S)
          .map((v) => v.toFixed(1))
          .join(','),
      )
      .join(' ');
  const cracks = [
    c([
      [3, 0],
      [3.1, 1.8],
      [2.9, 3.4],
      [3.1, 5.4],
    ]),
    c([
      [6.2, 0],
      [6.4, 2],
      [6.1, 3.6],
      [6.3, 5.4],
    ]),
    c([
      [0, 2.9],
      [2.6, 2.7],
      [5, 3],
      [8.6, 2.8],
    ]),
  ];
  // service names float above their stacks, drawn last so no block covers them
  const labels = SERVICES.map(([name, , x, y]) => {
    const [lx, ly] = P(x + 1.1, y + 1.1, 3.1, S);
    return `<text class="svc svc-label" x="${lx.toFixed(1)}" y="${(ly - 6).toFixed(1)}" text-anchor="middle">${name}</text>`;
  }).join('');
  return `<svg class="y15-split__svg" viewBox="${all.viewBox}" aria-hidden="true">
    <g class="g-svc">${svcSvg}${labels}</g>
    <g class="g-mono">${monoSvg}${cracks.map((p) => `<polyline class="crack" points="${p}"/>`).join('')}</g>
  </svg>`;
}

function mountSplit(parent: HTMLElement): void {
  const el = h(`
    <div class="y15-card y15-split">
      <p class="y15-card__title">Microservices <span class="y15-split__count">1 app · 1 server</span></p>
      ${splitScene()}
      <button type="button" class="y15-raised rp y15-split__btn">Split the monolith</button>
    </div>`);
  parent.appendChild(el);
  ripples(el);

  const btn = el.querySelector<HTMLButtonElement>('.y15-split__btn')!;
  const count = el.querySelector<HTMLElement>('.y15-split__count')!;
  const mono = el.querySelector('.g-mono')!;
  const cracks = el.querySelectorAll<SVGPolylineElement>('.crack');
  const svc = el.querySelectorAll('.svc');
  const reps = el.querySelectorAll('.rep');
  let split = false;

  gsap.set([...svc, ...reps], { opacity: 0 });
  cracks.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  });

  function run(): void {
    if (split) return;
    split = true;
    btn.disabled = true;
    const n = { v: 1 };
    gsap
      .timeline()
      .to(cracks, { strokeDashoffset: 0, duration: reducedMotion ? 0 : 0.5, stagger: 0.12 })
      .to(mono, { opacity: 0, y: 20, duration: reducedMotion ? 0 : 0.4 }, '+=0.15')
      .fromTo(
        svc,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: reducedMotion ? 0 : 0.5, stagger: 0.08, ease: 'back.out(2)' },
        '-=0.1',
      )
      .fromTo(
        reps,
        { opacity: 0, y: -90 },
        { opacity: 1, y: 0, duration: reducedMotion ? 0 : 0.45, stagger: 0.06, ease: 'bounce.out' },
      )
      .to(
        n,
        {
          v: 50,
          duration: reducedMotion ? 0 : 1,
          ease: 'power2.out',
          onUpdate: () => (count.textContent = `6 services · ${Math.round(n.v)} containers`),
        },
        '<',
      );
  }
  btn.addEventListener('click', run);
  if (!reducedMotion) onceInView(el, () => setTimeout(run, 900), 'top 55%');
}

/** AWS Lambda: twelve functions that only exist (and bill) while a request is running. */
function mountLambda(parent: HTMLElement): void {
  const names = [
    'resize',
    'thumbnail',
    'auth',
    'webhook',
    'cron',
    'search',
    'notify',
    'export',
    'ocr',
    'feed',
    'pdf',
    'ping',
  ];
  const el = h(`
    <div class="y15-card y15-lambda">
      <p class="y15-card__title">Serverless <span>billed per 100 ms</span></p>
      <div class="y15-lambda__grid">
        ${names.map((n) => `<div class="y15-fn"><b>λ</b><span>${n}</span><small></small></div>`).join('')}
      </div>
      <div class="y15-lambda__foot">
        <span>invocations <b class="y15-lambda__n">0</b></span>
        <span>idle servers <b>0</b></span>
        <button type="button" class="y15-raised y15-raised--pink rp">Send request</button>
      </div>
    </div>`);
  parent.appendChild(el);
  ripples(el);

  const fns = Array.from(el.querySelectorAll<HTMLElement>('.y15-fn'));
  const out = el.querySelector<HTMLElement>('.y15-lambda__n')!;
  let n = 0;

  function invoke(): void {
    const idle = fns.filter((f) => !f.classList.contains('is-hot'));
    const f = idle[Math.floor(Math.random() * idle.length)];
    if (!f) return;
    const ms = 40 + Math.floor(Math.random() * 260);
    f.querySelector('small')!.textContent = `${ms} ms`;
    f.classList.add('is-hot');
    out.textContent = String(++n);
    setTimeout(() => f.classList.remove('is-hot'), 500 + ms * 3);
  }

  el.querySelector('button')!.addEventListener('click', invoke);

  if (reducedMotion) return;
  let timer = 0;
  const tick = () => {
    invoke();
    timer = window.setTimeout(tick, 350 + Math.random() * 900);
  };
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      clearTimeout(timer);
      if (self.isActive) tick();
    },
  });
}

export function mountInfra(parent: HTMLElement): void {
  const el = h(`
    <section class="y15-panel y15-infra">
      <header class="y15-head">
        <p class="y15-kicker">Infrastructure</p>
        <h3 class="y15-title">The monolith cracked.<br>The servers disappeared.</h3>
        <p class="y15-jp">Apps split into small services that call each other over the network. Functions existed only while called.</p>
      </header>
      <div class="y15-infra__grid"></div>
    </section>`);
  parent.appendChild(el);
  const grid = el.querySelector<HTMLElement>('.y15-infra__grid')!;
  mountSplit(grid);
  mountLambda(grid);
  mountMesh(el);
  mountDeathStar(el);
}
