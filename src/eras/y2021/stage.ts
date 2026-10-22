import { siGithubcopilot } from 'simple-icons';
import { logo } from '../../components/logo';
import { type StageScene, scrubType } from '../../components/stage';
import { MOBILE_QUERY } from '../../core/scroll';
import { esc } from '../../core/util';
import { VITE_COLOR } from './icons';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/** brand mark on a frosted glass tile with a clay-soft glow behind it */
const glass = (mark: string, c: string) =>
  `<span class="y21-gl" style="--c:${c}"><i></i><span class="y21-gl__tile">${mark}</span></span>`;

function park(tl: gsap.core.Timeline, el: HTMLElement, desk: [number, number], at = 0): void {
  tl.to(
    el,
    {
      xPercent: () => (mobile() ? 0 : desk[0]),
      yPercent: () => (mobile() ? -110 : desk[1]),
      scale: () => (mobile() ? 0.32 : 0.38),
      duration: 0.5,
      ease: 'power2.inOut',
    },
    at,
  );
}

/** deterministic pseudo-random in [0, 1) */
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------------- Vite ---------------- */

const SHARDS = 26;

const vite: StageScene = {
  year: '2021.02',
  name: 'Vite',
  kicker: 'Next generation frontend tooling',
  line: 'The waiting disappeared.',
  className: 'y21-scene y21-scene--vite',
  logo: glass(VITE_COLOR, '#646cff'),
  length: 1.6,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y21-term">
        <div class="y21-term__bar"><i></i><i></i><i></i><span>~/acme/web</span></div>
        <div class="y21-term__body">
          <p><span class="y21-term__p">❯</span> <span class="y21-vt__c1"></span></p>
          <div class="y21-vt__wp">
            <p class="y21-vt__dim">&gt; webpack serve --mode development</p>
            <p class="y21-vt__dim"><b class="y21-vt__pct">0%</b> building <b class="y21-vt__mods">0</b>/4412 modules</p>
            <div class="y21-vt__bar"><i class="y21-vt__fill"></i>${Array.from({ length: SHARDS }, (_, k) => `<b class="y21-vt__shard" style="left:${(k / SHARDS) * 100}%;width:${100 / SHARDS + 0.3}%"></b>`).join('')}</div>
            <p class="y21-vt__dim y21-vt__secs">elapsed <b>0.0</b>s</p>
          </div>
          <div class="y21-vt__vite">
            <p><span class="y21-term__p">❯</span> <span class="y21-vt__c2"></span></p>
            <p class="y21-vt__dim">&gt; vite</p>
            <p class="y21-vt__banner"><b>⚡ Vite</b> <span>dev server running at:</span></p>
            <p class="y21-vt__dim">  &gt; Local:    <u>http://localhost:3000/</u></p>
            <p class="y21-vt__dim">  &gt; Network:  <u>http://192.168.1.12:3000/</u></p>
            <p class="y21-vt__banner"><span>ready in <em>312ms.</em></span></p>
            <div class="y21-vt__hmr">
              <p><time>10:42:07 AM</time> <b>[vite]</b> hmr update /src/App.tsx</p>
              <p><time>10:42:09 AM</time> <b>[vite]</b> hmr update /src/App.tsx</p>
              <p><time>10:42:12 AM</time> <b>[vite]</b> hmr update /src/App.css</p>
            </div>
          </div>
        </div>
      </div>
      <div class="y21-prev">
        <div class="y21-prev__bar"><i></i><span>localhost:3000</span></div>
        <div class="y21-prev__page">
          <p class="y21-prev__h">Hello</p>
          <span class="y21-prev__btn">Get started</span>
          <span class="y21-prev__ms">⚡ 12ms</span>
        </div>
      </div>`;

    const q = <T extends Element = HTMLElement>(s: string) => art.querySelector<T & HTMLElement>(s)!;
    const mods = q('.y21-vt__mods');
    const pct = q('.y21-vt__pct');
    const secs = q('.y21-vt__secs b');
    const shards = Array.from(art.querySelectorAll<HTMLElement>('.y21-vt__shard'));
    const hmr = Array.from(art.querySelectorAll<HTMLElement>('.y21-vt__hmr p'));
    const head = q('.y21-prev__h');
    const page = q('.y21-prev__page');
    const ms = q('.y21-prev__ms');

    park(tl, mark, [-128, -66]);
    tl.from([q('.y21-term'), q('.y21-prev')], { opacity: 0, y: 40, stagger: 0.12, duration: 0.3 }, 0.2);

    // 1. the old way: a progress bar that never seems to finish
    scrubType(tl, q('.y21-vt__c1'), 'npm run dev', 0.25, 0.45);
    tl.from(q('.y21-vt__wp'), { opacity: 0, duration: 0.1 }, 0.75);
    const wp = { p: 0 };
    tl.to(
      wp,
      {
        p: 0.73,
        duration: 1,
        ease: 'power1.out',
        onUpdate: () => {
          q('.y21-vt__fill').style.transform = `scaleX(${wp.p})`;
          mods.textContent = String(Math.round(wp.p * 4412));
          pct.textContent = `${Math.round(wp.p * 100)}%`;
          secs.textContent = (wp.p * 52).toFixed(1);
        },
      },
      0.85,
    );
    tl.to(page, { opacity: 0.25, filter: 'grayscale(1)', duration: 0.2 }, 0.85);

    // 2. shatter
    tl.set(shards, { opacity: 1 }, 1.9);
    tl.to(q('.y21-vt__fill'), { opacity: 0, duration: 0.05 }, 1.9);
    tl.to(
      shards,
      {
        x: (i) => (rand(i) - 0.3) * 520,
        y: (i) => (rand(i + 40) - 0.5) * 360,
        rotate: (i) => (rand(i + 80) - 0.5) * 540,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: { each: 0.008, from: 'random' },
      },
      1.92,
    );
    tl.to(q('.y21-vt__wp'), { opacity: 0, height: 0, duration: 0.25, ease: 'power2.inOut' }, 2.1);

    // 3. the new way: ready before you can blink, and every save shows up instantly
    tl.from(q('.y21-vt__vite'), { opacity: 0, duration: 0.05 }, 2.2);
    scrubType(tl, q('.y21-vt__c2'), 'npm run dev', 0.18, 2.22);
    tl.from(
      art.querySelectorAll('.y21-vt__banner'),
      { opacity: 0, x: -20, duration: 0.12, stagger: 0.06, ease: 'power3.out' },
      2.38,
    );
    tl.from(art.querySelectorAll('.y21-vt__vite .y21-vt__dim'), { opacity: 0, duration: 0.1, stagger: 0.03 }, 2.42);
    tl.to(page, { opacity: 1, filter: 'grayscale(0)', duration: 0.15 }, 2.45);
    hmr.forEach((line, i) => {
      const at = 2.7 + i * 0.35;
      tl.from(line, { opacity: 0, x: -10, duration: 0.08 }, at);
      tl.fromTo(
        page,
        { boxShadow: '0 0 0 0px rgba(167,139,250,0)' },
        { boxShadow: '0 0 0 6px rgba(167,139,250,0.55)', duration: 0.06, yoyo: true, repeat: 1 },
        at,
      );
      tl.fromTo(ms, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.06 }, at);
      if (i === 2)
        tl.to(
          q('.y21-prev__btn'),
          { backgroundImage: 'linear-gradient(90deg, #a78bfa, #22d3ee)', color: '#0b0b12', duration: 0.05 },
          at,
        );
    });
    // heading text follows the playhead (reversible)
    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      head.textContent = t < 2.7 ? 'Hello' : t < 3.05 ? 'Hello, Vite' : 'Hello, 2021';
    });
    tl.to({}, { duration: 0.3 });
  },
};

/* ---------------- GitHub Copilot ---------------- */

const COPILOT_TYPED_1 = 'const copilot: StageScene = {';
const COPILOT_GHOST_1 = "  name: 'GitHub Copilot',\n  line: 'Gray text started writing what comes next.',";
const COPILOT_TYPED_2 = '  play({ art, tl }) {';
const COPILOT_GHOST_2 =
  '    const ghost = suggest(art, context);\n    tl.to(ghost, { opacity: 1 });\n    onTab(() => ghost.accept());\n  },\n};';

const copilot: StageScene = {
  year: '2021.06',
  name: 'GitHub Copilot',
  kicker: 'Your AI pair programmer',
  line: 'Gray text started writing what comes next.',
  className: 'y21-scene y21-scene--pilot',
  logo: glass(logo(siGithubcopilot, 'current'), '#a78bfa'),
  length: 1.6,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y21-ed">
        <div class="y21-ed__tabs"><span>scenes.ts</span><span class="y21-ed__pilot"><i></i> Copilot</span></div>
        <pre class="y21-ed__code"><code><span class="y21-ed__cm">// the scene you are looking at, written with Copilot</span>
<span class="y21-ed__t1"></span><span class="y21-ed__caret c1"></span>
<span class="y21-ed__g g1">${esc(COPILOT_GHOST_1)}</span>
<span class="y21-ed__t2"></span><span class="y21-ed__caret c2"></span>
<span class="y21-ed__g g2">${esc(COPILOT_GHOST_2)}</span></code></pre>
        <span class="y21-ed__tab">Tab ⇥</span>
      </div>`;

    const q = (s: string) => art.querySelector<HTMLElement>(s)!;
    const tab = q('.y21-ed__tab');

    park(tl, mark, [-130, -62]);
    tl.from(q('.y21-ed'), { opacity: 0, y: 40, duration: 0.3 }, 0.2);
    tl.set([q('.g1'), q('.g2'), q('.c2')], { opacity: 0 }, 0);

    const round = (typed: HTMLElement, text: string, ghost: HTMLElement, caretOn: HTMLElement, at: number) => {
      scrubType(tl, typed, text, 0.35, at);
      tl.to(ghost, { opacity: 1, duration: 0.12 }, at + 0.55);
      tl.fromTo(
        tab,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.1, ease: 'back.out(2)' },
        at + 0.75,
      );
      tl.to(
        tab,
        { scale: 0.88, background: '#a78bfa', color: '#0b0b12', duration: 0.05, yoyo: true, repeat: 1 },
        at + 0.95,
      );
      tl.to(ghost, { color: '#e6e6f0', duration: 0.08 }, at + 1.0);
      tl.to(tab, { opacity: 0, duration: 0.1 }, at + 1.12);
      tl.to(caretOn, { opacity: 0, duration: 0.01 }, at + 1.0);
    };
    round(q('.y21-ed__t1'), COPILOT_TYPED_1, q('.g1'), q('.c1'), 0.5);
    tl.to(q('.c2'), { opacity: 1, duration: 0.01 }, 1.62);
    round(q('.y21-ed__t2'), COPILOT_TYPED_2, q('.g2'), q('.c2'), 1.7);
    tl.to({}, { duration: 0.4 });
  },
};

/* ---------------- Stable Diffusion ---------------- */

const SD = 192;
const STEPS = 50;

/** paint the "final" image procedurally: a lighthouse on a cliff at sunset, oil-painting-ish */
function paintTarget(): Uint8ClampedArray {
  const c = document.createElement('canvas');
  c.width = c.height = SD;
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, SD * 0.62);
  sky.addColorStop(0, '#24184a');
  sky.addColorStop(0.55, '#c9566e');
  sky.addColorStop(1, '#ffb36b');
  g.fillStyle = sky;
  g.fillRect(0, 0, SD, SD);
  // sun + glow
  const sx = SD * 0.7;
  const sy = SD * 0.56;
  const glow = g.createRadialGradient(sx, sy, 2, sx, sy, SD * 0.4);
  glow.addColorStop(0, 'rgba(255,220,150,0.9)');
  glow.addColorStop(1, 'rgba(255,180,120,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, SD, SD);
  g.fillStyle = '#ffe2a6';
  g.beginPath();
  g.arc(sx, sy, SD * 0.075, 0, Math.PI * 2);
  g.fill();
  // sea
  const sea = g.createLinearGradient(0, SD * 0.62, 0, SD);
  sea.addColorStop(0, '#5b3a6e');
  sea.addColorStop(1, '#16142e');
  g.fillStyle = sea;
  g.fillRect(0, SD * 0.62, SD, SD);
  for (let i = 0; i < 14; i++) {
    g.fillStyle = `rgba(255,200,140,${0.5 - i * 0.03})`;
    const w = SD * (0.16 - i * 0.008);
    g.fillRect(sx - w / 2 + Math.sin(i) * 3, SD * 0.63 + i * 4.6, w, 1.6);
  }
  // cliff
  g.fillStyle = '#1d1226';
  g.beginPath();
  g.moveTo(0, SD * 0.42);
  g.lineTo(SD * 0.2, SD * 0.4);
  g.lineTo(SD * 0.34, SD * 0.5);
  g.lineTo(SD * 0.4, SD * 0.66);
  g.lineTo(SD * 0.48, SD * 0.78);
  g.lineTo(SD * 0.44, SD);
  g.lineTo(0, SD);
  g.closePath();
  g.fill();
  // beam
  const lx = SD * 0.17;
  const ly = SD * 0.2;
  const beam = g.createLinearGradient(lx, ly, SD, ly);
  beam.addColorStop(0, 'rgba(255,240,190,0.75)');
  beam.addColorStop(1, 'rgba(255,240,190,0)');
  g.fillStyle = beam;
  g.beginPath();
  g.moveTo(lx, ly);
  g.lineTo(SD, ly - SD * 0.12);
  g.lineTo(SD, ly + SD * 0.08);
  g.closePath();
  g.fill();
  // lighthouse: striped tower, lantern
  const base = SD * 0.4;
  for (let i = 0; i < 6; i++) {
    const y0 = ly + 6 + ((base - ly - 6) / 6) * i;
    const y1 = ly + 6 + ((base - ly - 6) / 6) * (i + 1);
    const w0 = 5 + i * 1.1;
    const w1 = 5 + (i + 1) * 1.1;
    g.fillStyle = i % 2 ? '#c8384a' : '#f3e9e0';
    g.beginPath();
    g.moveTo(lx - w0, y0);
    g.lineTo(lx + w0, y0);
    g.lineTo(lx + w1, y1);
    g.lineTo(lx - w1, y1);
    g.closePath();
    g.fill();
  }
  g.fillStyle = '#2a1a2e';
  g.fillRect(lx - 7, ly - 2, 14, 3);
  g.fillStyle = '#fff3c4';
  g.fillRect(lx - 4, ly - 8, 8, 7);
  g.fillStyle = '#2a1a2e';
  g.beginPath();
  g.moveTo(lx - 6, ly - 8);
  g.lineTo(lx, ly - 14);
  g.lineTo(lx + 6, ly - 8);
  g.fill();

  // brush strokes: smear pixels along short diagonal runs
  const img = g.getImageData(0, 0, SD, SD);
  const d = img.data;
  for (let i = 0; i < 2600; i++) {
    const x = Math.floor(rand(i) * SD);
    const y = Math.floor(rand(i + 9999) * SD);
    const o = (y * SD + x) * 4;
    const len = 3 + Math.floor(rand(i + 333) * 5);
    for (let k = 1; k < len; k++) {
      const xx = Math.min(SD - 1, x + k);
      const yy = Math.min(SD - 1, y + (k >> 1));
      const p = (yy * SD + xx) * 4;
      for (let ch = 0; ch < 3; ch++) d[p + ch] = d[p + ch] * 0.55 + d[o + ch] * 0.45;
    }
  }
  return d;
}

const sdMark = `<svg class="logo" viewBox="0 0 100 100" aria-hidden="true">${Array.from({ length: 81 }, (_, i) => {
  const x = (i % 9) * 11 + 6;
  const y = Math.floor(i / 9) * 11 + 6;
  const r = Math.max(0.4, 4.6 - Math.hypot(x - 50, y - 50) / 11 + (rand(i) - 0.5) * 1.6);
  return `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="currentColor" opacity="${(0.35 + rand(i + 7) * 0.65).toFixed(2)}"/>`;
}).join('')}</svg>`;

const diffusion: StageScene = {
  year: '2022.08',
  name: 'Stable Diffusion',
  kicker: 'Text to image',
  line: 'Pictures, born from words.',
  className: 'y21-scene y21-scene--sd',
  logo: glass(sdMark, '#f472b6'),
  length: 1.5,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y21-sd">
        <div class="y21-sd__prompt"><span>prompt</span><b class="y21-sd__text"></b></div>
        <div class="y21-sd__frame"><canvas width="${SD}" height="${SD}" aria-label="A lighthouse on a cliff at sunset, generated step by step from noise"></canvas></div>
        <div class="y21-sd__meta"><span class="y21-sd__step">step 0 / ${STEPS}</span><span>seed 1024 · CFG 7.5 · 512×512</span></div>
        <div class="y21-sd__bar"><i></i></div>
      </div>`;
    const canvas = art.querySelector('canvas')!;
    const g = canvas.getContext('2d')!;
    const stepEl = art.querySelector<HTMLElement>('.y21-sd__step')!;
    const barEl = art.querySelector<HTMLElement>('.y21-sd__bar i')!;

    let target: Uint8ClampedArray | null = null;
    let noise: Float32Array | null = null;
    const out = g.createImageData(SD, SD);
    const blocks = new Map<number, Uint8ClampedArray>();
    // coarse-to-fine: early steps only "know" the low frequencies of the image
    const pixelated = (size: number) => {
      if (blocks.has(size)) return blocks.get(size)!;
      const src = target!;
      const dst = new Uint8ClampedArray(src.length);
      for (let by = 0; by < SD; by += size)
        for (let bx = 0; bx < SD; bx += size) {
          let r = 0,
            gg = 0,
            b = 0,
            n = 0;
          for (let y = by; y < Math.min(SD, by + size); y++)
            for (let x = bx; x < Math.min(SD, bx + size); x++) {
              const o = (y * SD + x) * 4;
              r += src[o];
              gg += src[o + 1];
              b += src[o + 2];
              n++;
            }
          for (let y = by; y < Math.min(SD, by + size); y++)
            for (let x = bx; x < Math.min(SD, bx + size); x++) {
              const o = (y * SD + x) * 4;
              dst[o] = r / n;
              dst[o + 1] = gg / n;
              dst[o + 2] = b / n;
              dst[o + 3] = 255;
            }
        }
      blocks.set(size, dst);
      return dst;
    };
    let shownStep = -1;
    const draw = (step: number) => {
      if (step === shownStep) return;
      shownStep = step;
      target ??= paintTarget();
      if (!noise) {
        noise = new Float32Array(SD * SD * 3);
        for (let i = 0; i < noise.length; i++) noise[i] = rand(i * 1.37) * 255;
      }
      const s = step / STEPS;
      const a = s ** 1.3;
      const size = Math.max(1, Math.round(24 * (1 - s) ** 2.2));
      const src = pixelated(size);
      const d = out.data;
      for (let i = 0, j = 0; i < d.length; i += 4, j += 3) {
        d[i] = noise[j] * (1 - a) + src[i] * a;
        d[i + 1] = noise[j + 1] * (1 - a) + src[i + 1] * a;
        d[i + 2] = noise[j + 2] * (1 - a) + src[i + 2] * a;
        d[i + 3] = 255;
      }
      g.putImageData(out, 0, 0);
      stepEl.textContent = `step ${step} / ${STEPS}`;
      barEl.style.transform = `scaleX(${s})`;
    };
    draw(0);

    park(tl, mark, [-128, -64]);
    tl.from(art.querySelector('.y21-sd'), { opacity: 0, y: 40, duration: 0.3 }, 0.2);
    scrubType(
      tl,
      art.querySelector<HTMLElement>('.y21-sd__text')!,
      'a lighthouse on a cliff at sunset, oil painting',
      0.6,
      0.45,
    );
    const p = { s: 0 };
    tl.to(p, { s: STEPS, duration: 1.8, ease: 'power1.inOut', onUpdate: () => draw(Math.round(p.s)) }, 1.15);
    tl.to({}, { duration: 0.35 });
  },
};

export const STAGE_2021: StageScene[] = [vite, copilot, diffusion];
