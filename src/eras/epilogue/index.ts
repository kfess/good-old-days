import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import type { Era } from '../../core/types';
import { h } from '../../core/util';
import { fitCanvas, loopWhenVisible } from '../y2023/lib';
import { AUTOPILOT, buildWall, onBlack } from './autopilot';
import { buildCoda } from './coda';
import './style.css';

/* Base size every miniature is designed at; the stage scales them with transforms. */
const BW = 480;
const BH = 300;

const MINIS: { year: string; log: string; html: string }[] = [
  {
    year: '1999',
    log: '<marquee>, hit counter, webring',
    html: `<div class="m99">
      <p class="m99__mq"><span>★ Welcome to my homepage!! ★ Sign my guestbook ★ Best viewed in 800×600 ★ </span></p>
      <h4 class="m99__h">~*~ My Cool Page ~*~</h4>
      <p class="m99__c">You are visitor <span>0</span><span>0</span><span>1</span><span>9</span><span>9</span><span>9</span></p>
      <div class="m99__uc">UNDER CONSTRUCTION</div>
      <p class="m99__links"><u>Links</u> | <u>Guestbook</u> | <u>Webring »</u></p>
    </div>`,
  },
  {
    year: '2010',
    log: 'Lightbox, glossy buttons, beta badge',
    html: `<div class="m10">
      <div class="m10__head"><b>Snapr</b><span class="m10__beta">beta</span></div>
      <div class="m10__thumbs"><i></i><i></i><i></i><i></i></div>
      <div class="m10__overlay"><div class="m10__box"><div class="m10__img"></div><p>Image 2 of 4 <b>×</b></p></div></div>
      <span class="m10__btn">Sign up free!</span>
    </div>`,
  },
  {
    year: '2013',
    log: 'flat UI, long shadows, ghost buttons',
    html: `<div class="m13">
      <div class="m13__icon"><span>✓</span></div>
      <h4>Flat is the new black.</h4>
      <p>Responsive · Retina-ready · Parallax</p>
      <span class="m13__ghost">Learn more</span>
    </div>`,
  },
  {
    year: '2016',
    log: 'paper, ink, floating action button',
    html: `<div class="m16">
      <div class="m16__bar"><span>☰</span> Inbox</div>
      <div class="m16__card"><b>Material</b><p>Paper, ink and elevation.</p><span class="m16__ripple"></span></div>
      <div class="m16__card m16__card--2"><b>React</b><p>UI = f(state)</p></div>
      <span class="m16__fab">+</span>
    </div>`,
  },
  {
    year: '2019',
    log: 'pods, replicas, self-healing',
    html: `<div class="m19">
      <p class="m19__h"><span>deployment/web</span><b>12/12 ready</b></p>
      <div class="m19__pods">${'<i></i>'.repeat(12)}</div>
      <code>$ kubectl get pods -w</code>
    </div>`,
  },
  {
    year: '2022',
    log: 'glass, bento, ⌘K',
    html: `<div class="m22">
      <div class="m22__aurora"></div>
      <div class="m22__grid"><div class="m22__k">⌘K</div><div>Edge</div><div>Deploy preview</div><div class="m22__w">Ship faster.</div></div>
    </div>`,
  },
  {
    year: '2024',
    log: 'streaming tokens, ✨',
    html: `<div class="m24">
      <div class="m24__u">Rebuild the web.</div>
      <div class="m24__a"><span class="m24__av">✦</span><p>Sure — starting with <code>&lt;marquee&gt;</code> and a hit counter<i></i></p></div>
      <div class="m24__in">Ask anything… <span>✨</span></div>
    </div>`,
  },
  {
    year: '2025',
    log: 'agents, in a terminal',
    html: `<div class="m25">
      <p><b>&gt;</b> rebuild everything</p>
      <p><em>⏺</em> Write(1999/index.html)</p>
      <p><em>⏺</em> Write(2010/lightbox.js)</p>
      <p><em>⏺</em> Bash(argocd app sync 2019)</p>
      <p class="m25__ok">✓ 27 years rebuilt</p>
    </div>`,
  },
];

interface Slot {
  x: number;
  y: number;
  s: number;
}

function layout(stage: HTMLElement): { slots: Slot[]; center: Slot; W: number; H: number } {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const portrait = W < 760;
  const cols = portrait ? 2 : 4;
  const rows = portrait ? 4 : 2;
  const gap = portrait ? 10 : 18;
  const areaW = W * (portrait ? 0.92 : 0.86);
  const areaH = H * (portrait ? 0.6 : 0.56);
  const s = Math.min((areaW - gap * (cols - 1)) / cols / BW, (areaH - gap * (rows - 1)) / rows / BH);
  const gw = cols * BW * s + gap * (cols - 1);
  const gh = rows * BH * s + gap * (rows - 1);
  const ox = (W - gw) / 2;
  const oy = (H - gh) / 2;
  const slots = MINIS.map((_, i) => ({
    x: ox + (i % cols) * (BW * s + gap),
    y: oy + Math.floor(i / cols) * (BH * s + gap),
    s,
  }));
  const cs = Math.min((W * (portrait ? 0.9 : 0.62)) / BW, (H * 0.56) / BH, 2.2);
  return { slots, center: { x: (W - BW * cs) / 2, y: (H - BH * cs) / 2, s: cs }, W, H };
}

/* ---------------- particles ---------------- */

interface Particle {
  /** the tool on the wall the particle leaves from */
  tool: number;
  u: number;
  v: number;
  // unit sphere target
  sx: number;
  sy: number;
  sz: number;
  delay: number;
  swirl: number;
  color: string;
  size: number;
}

function makeParticles(n: number): Particle[] {
  const out: Particle[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let k = 0; k < n; k++) {
    const y = 1 - (k / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * k;
    // shuffle which tool each sphere point comes from so colors mix on the surface
    const tool = (k * 7 + ((k * 2654435761) >>> 28)) % AUTOPILOT.length;
    out.push({
      tool,
      u: Math.random(),
      v: Math.random(),
      sx: Math.cos(th) * r,
      sy: y,
      sz: Math.sin(th) * r,
      delay: Math.random() * 0.35,
      swirl: (Math.random() - 0.5) * 2,
      color: onBlack(AUTOPILOT[tool][0].hex),
      size: Math.random() < 0.08 ? 2.8 : 1.7,
    });
  }
  return out;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/* ---------------- era ---------------- */

export const era: Era = {
  id: 'epilogue',
  years: [2026, 2026],
  label: 'Now',
  theme: { bg: '#000000', fg: '#ffffff', accent: '#ffffff', muted: '#9a9a9a' },
  hudFont: "'Geist', 'Inter', sans-serif",
  servers: { value: '∞', unit: 'what will you build?' },
  render(section) {
    const el = h(`
      <div class="fin">
        <div class="fin__pin">
          <div class="fin__stage">
            ${MINIS.map(
              (m, i) =>
                `<div class="fin__mini fin__mini--${m.year}" data-i="${i}"><span class="fin__tag">${m.year}</span>${m.html}</div>`,
            ).join('')}
          </div>
          ${buildWall()}
          <canvas class="fin__canvas" aria-hidden="true"></canvas>
          <p class="fin__log" aria-hidden="true"></p>
          <div class="fin__end">
            <h2 class="fin__title">What will you<br />build next?<span class="fin__caret" aria-hidden="true"></span></h2>
          </div>
        </div>
      </div>`);
    section.appendChild(el);
    section.appendChild(buildCoda());

    const pin = el.querySelector<HTMLElement>('.fin__pin')!;
    const stage = el.querySelector<HTMLElement>('.fin__stage')!;
    const minis = Array.from(el.querySelectorAll<HTMLElement>('.fin__mini'));
    const canvas = el.querySelector<HTMLCanvasElement>('.fin__canvas')!;
    const log = el.querySelector<HTMLElement>('.fin__log')!;
    const end = el.querySelector<HTMLElement>('.fin__end')!;
    const wall = el.querySelector<HTMLElement>('.fin__wall')!;
    const tools = Array.from(el.querySelectorAll<HTMLElement>('.fin__tool'));

    if (reducedMotion) {
      el.classList.add('is-static');
      const L = layout(stage);
      minis.forEach((m, i) => gsap.set(m, { x: L.slots[i].x, y: L.slots[i].y, scale: L.slots[i].s, opacity: 1 }));
      return;
    }

    const STEP = 0.62;
    const MOSAIC_END = (MINIS.length - 1) * STEP + 0.72;
    // autopilot: the mosaic steps back and one agent drives every tool, faster and faster
    const AUTO_START = MOSAIC_END + 0.5;
    const AUTO_LIT = AUTO_START + 0.35;
    const AUTO_END = AUTO_LIT + 2.4;
    const litAt = (k: number) => AUTO_LIT + (AUTO_END - AUTO_LIT) * Math.sqrt(k / AUTOPILOT.length);
    const DISSOLVE_START = AUTO_END + 0.6;
    const DISSOLVE_END = DISSOLVE_START + 2.8;
    const TOTAL = DISSOLVE_END + 1.6;
    const state = { p: 0, q: 0 };

    let lastLog = '';
    let lastLit = -1;
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      // the scrub smooths time after the last scroll event, so sync the log on every tick
      onUpdate: () => updateLog(),
      scrollTrigger: {
        trigger: pin,
        pin: true,
        start: 'top top',
        // ~76vh of scrolling per timeline unit
        end: () => `+=${Math.round(TOTAL * 76)}%`,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // the first miniature fades in while the section scrolls into view, so the pin never opens on an empty screen
    gsap.fromTo(
      minis[0],
      { opacity: 0 },
      { opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: true } },
    );
    minis.forEach((m, i) => {
      const t0 = i * STEP;
      tl.fromTo(
        m,
        {
          x: () => layout(stage).center.x,
          y: () => layout(stage).center.y + (i === 0 ? 0 : 40),
          scale: () => layout(stage).center.s * (i === 0 ? 1 : 0.92),
          // the first one's opacity belongs to the pre-pin fade above
          ...(i === 0 ? {} : { opacity: 0 }),
        },
        {
          y: () => layout(stage).center.y,
          scale: () => layout(stage).center.s,
          ...(i === 0 ? {} : { opacity: 1 }),
          duration: 0.22,
          ease: 'power2.out',
          immediateRender: true,
        },
        t0,
      ).to(
        m,
        {
          x: () => layout(stage).slots[i].x,
          y: () => layout(stage).slots[i].y,
          scale: () => layout(stage).slots[i].s,
          duration: 0.32,
        },
        t0 + 0.4,
      );
    });
    tl.to(minis, { opacity: 0.05, duration: 0.35, ease: 'power1.out' }, AUTO_START - 0.1)
      .fromTo(
        wall,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
        AUTO_START,
      )
      .to(minis, { opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power1.in' }, DISSOLVE_START + 0.05)
      .to(wall, { opacity: 0, duration: 0.7, ease: 'power1.in' }, DISSOLVE_START + 0.15)
      .to(state, { p: 1, duration: DISSOLVE_END - DISSOLVE_START, ease: 'none' }, DISSOLVE_START)
      .to(state, { q: 1, duration: TOTAL - DISSOLVE_END, ease: 'none' }, DISSOLVE_END)
      .fromTo(end, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, DISSOLVE_END + 0.2);

    /** how many tools the agent has lit by timeline time `t` */
    function lit(t: number): number {
      let n = 0;
      while (n < AUTOPILOT.length && litAt(n) <= t) n++;
      return n;
    }

    function updateLog() {
      const t = tl.time();
      let text = '';
      if (t < MOSAIC_END - 0.1) {
        const i = Math.min(MINIS.length - 1, Math.max(0, Math.floor((t + 0.1) / STEP)));
        text = `⏺ Write(${MINIS[i].year}/index.html) — ${MINIS[i].log}`;
      } else if (t < AUTO_LIT) {
        text = '✓ 27 years rebuilt in 4.2s';
      } else if (t < AUTO_END + 0.15) {
        const n = lit(t);
        text = n > 0 ? `⏺ ${AUTOPILOT[n - 1][1]}` : '';
      } else if (t < DISSOLVE_START) {
        text = `✓ ${AUTOPILOT.length} tools, one prompt. Nobody touched a keyboard.`;
      } else if (t < DISSOLVE_END - 0.4) {
        text = '⏺ Compressing 27 years into one prompt…';
      }
      const n = lit(t);
      if (n !== lastLit) {
        lastLit = n;
        tools.forEach((el, k) => {
          el.classList.toggle('is-lit', k < n);
          el.classList.toggle('is-new', k === n - 1 && t < AUTO_END);
        });
      }
      if (text !== lastLog) {
        lastLog = text;
        log.textContent = text;
        log.classList.toggle('is-on', text !== '');
      }
    }
    updateLog();
    // a refresh restores the timeline's position without firing onUpdate
    ScrollTrigger.addEventListener('refresh', updateLog);

    /* particles */
    const ctx = canvas.getContext('2d')!;
    const small = window.matchMedia('(max-width: 759.98px)').matches;
    const parts = makeParticles(small ? 2200 : 5200);

    // where each tool sits in the pin, measured once the wall is still and again after a resize
    let centers: { x: number; y: number; s: number }[] = [];
    let measuredAt = '';
    const measure = (W: number, H: number) => {
      if (measuredAt === `${W}x${H}`) return;
      measuredAt = `${W}x${H}`;
      const box = pin.getBoundingClientRect();
      centers = tools.map((t) => {
        const r = t.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, s: r.width };
      });
    };

    loopWhenVisible(pin, (now) => {
      const { w: W, h: H, dpr } = fitCanvas(canvas);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const p = state.p;
      if (p <= 0) return;
      measure(W, H);
      const rot = now / 9000 + p * 1.6;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const tilt = 0.32;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const R = Math.min(W, H) * (small ? 0.34 : 0.3) * (1 + state.q * 0.08);
      const cx = W / 2;
      const cy = H * 0.47;
      const fade = 1 - state.q * 0.45;

      // luminous core
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
      glow.addColorStop(0, `rgba(255, 220, 200, ${0.3 * p * fade})`);
      glow.addColorStop(0.45, `rgba(217, 119, 87, ${0.12 * p * fade})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      for (const pt of parts) {
        // each particle leaves from a spot on its tool's mark
        const c = centers[pt.tool];
        const x0 = c.x + (pt.u - 0.5) * c.s;
        const y0 = c.y + (pt.v - 0.5) * c.s;
        // rotate sphere target
        const x1 = pt.sx * cr + pt.sz * sr;
        const z1 = -pt.sx * sr + pt.sz * cr;
        const y2 = pt.sy * ct - z1 * st;
        const z2 = pt.sy * st + z1 * ct;
        const persp = 2.8 / (2.8 - z2);
        const tx = cx + x1 * R * persp;
        const ty = cy + y2 * R * persp;
        const k = easeInOut(Math.min(1, Math.max(0, (p - pt.delay) / 0.65)));
        const bend = Math.sin(k * Math.PI) * 90 * pt.swirl;
        const x = x0 + (tx - x0) * k + bend;
        const y = y0 + (ty - y0) * k - bend * 0.4;
        const depthA = 0.35 + 0.65 * ((z2 + 1) / 2);
        ctx.globalAlpha = (k < 1 ? 0.9 : 0.75 * depthA) * fade;
        ctx.fillStyle = pt.color;
        const sz = pt.size * (k < 1 ? 1 : persp);
        ctx.fillRect(x, y, sz, sz);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    });
  },
};
