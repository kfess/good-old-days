import type { SimpleIcon } from 'simple-icons';
import {
  siClaude,
  siCursor,
  siDeepseek,
  siGithubcopilot,
  siGooglegemini,
  siMeta,
  siMistralai,
  siQwen,
} from 'simple-icons';
import { claudeKun, claudeKunCrowd } from '../../components/claudekun';
import { type StageScene, scrubType } from '../../components/stage';
import { MOBILE_QUERY } from '../../core/scroll';
import { esc } from '../../core/util';
import { iconSprite, kunSprite, orbitMarks, textSprite } from './kuns';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/* ---------------- ASCII logos ---------------- */

const RAMP = ' .:-=+*#%@';
const NOISE = '!<>-_\\/[]{}=+*^?#%$01';
const COLS = 44;
const ROWS = 26; // ≈ COLS × 0.6: a monospace cell is ~0.6 as wide as it is tall

type Draw = (ctx: CanvasRenderingContext2D, s: number) => void;

/** Rasterize `draw` into a square canvas and sample it into monospace characters. */
function asciiArt(draw: Draw, cols = COLS, rows = ROWS): string {
  const S = 264;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = ctx.strokeStyle = '#fff';
  draw(ctx, S);
  const px = ctx.getImageData(0, 0, S, S).data;
  const cw = S / cols;
  const ch = S / rows;
  let out = '';
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      let sum = 0;
      let n = 0;
      for (let y = Math.floor(r * ch); y < Math.floor((r + 1) * ch); y += 2) {
        for (let x = Math.floor(k * cw); x < Math.floor((k + 1) * cw); x += 2) {
          sum += px[(y * S + x) * 4 + 3];
          n++;
        }
      }
      const v = sum / (n * 255);
      out += RAMP[Math.min(RAMP.length - 1, Math.round(v * (RAMP.length - 1)))];
    }
    out += '\n';
  }
  return out;
}

const drawIcon =
  (icon: SimpleIcon, pad = 0.12): Draw =>
  (ctx, s) => {
    const k = (s * (1 - pad * 2)) / 24;
    ctx.translate(s * pad, s * pad);
    ctx.scale(k, k);
    ctx.fill(new Path2D(icon.path));
  };

/** A thick sine wave: the vibe. */
const drawWave: Draw = (ctx, s) => {
  ctx.lineWidth = s * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = s * 0.1; x <= s * 0.9; x += 2)
    ctx.lineTo(x, s / 2 + Math.sin(((x - s * 0.1) / (s * 0.8)) * Math.PI * 2) * s * 0.2);
  ctx.stroke();
};

/** One trunk fanning out into five branches. */
const drawFan: Draw = (ctx, s) => {
  ctx.lineWidth = s * 0.045;
  ctx.lineCap = 'round';
  const o = { x: s * 0.16, y: s / 2 };
  for (let i = 0; i < 5; i++) {
    const y = s * (0.14 + i * 0.18);
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.bezierCurveTo(s * 0.45, o.y, s * 0.45, y, s * 0.78, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.82, y, s * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(o.x, o.y, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
};

const hash = (i: number) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Characters resolve out of noise as `k` goes 0 → 1. */
function decode(pre: HTMLElement, art: string, k: number): void {
  let out = '';
  for (let i = 0; i < art.length; i++) {
    const ch = art[i];
    if (ch === '\n' || ch === ' ' || hash(i) < k) out += ch;
    else out += NOISE[(i * 7 + Math.floor(k * 40)) % NOISE.length];
  }
  pre.textContent = out;
}

/** The logo slot for an ASCII mark; the art is filled in (and decoded) by the scene. */
const asciiSlot = (tone = 'var(--accent)') =>
  `<pre class="y25s-ascii" style="--tone:${tone}" aria-hidden="true"></pre>`;

function mountAscii(logoEl: HTMLElement, draw: Draw, tl: gsap.core.Timeline, dur = 0.45): void {
  const pre = logoEl.querySelector<HTMLElement>('.y25s-ascii')!;
  const art = asciiArt(draw);
  decode(pre, art, 0);
  const p = { k: 0 };
  tl.to(p, { k: 1.01, duration: dur, ease: 'power1.out', onUpdate: () => decode(pre, art, p.k) }, 0);
}

const toCorner = (tl: gsap.core.Timeline, el: HTMLElement, at = 0.35) =>
  tl.to(
    el,
    {
      xPercent: () => (mobile() ? 0 : -128),
      yPercent: () => (mobile() ? -150 : -78),
      scale: () => (mobile() ? 0.22 : 0.3),
      duration: 0.45,
      ease: 'power2.inOut',
    },
    at,
  );

/** A scrubbed log: each line shows once the proxy passes its time. Reversible by construction. */
function scrubLog(
  tl: gsap.core.Timeline,
  lines: HTMLElement[],
  times: number[],
  end: number,
  onTime?: (t: number) => void,
): void {
  const p = { t: 0 };
  tl.to(
    p,
    {
      t: end,
      duration: end,
      ease: 'none',
      onUpdate: () => {
        lines.forEach((l, i) => l.classList.toggle('is-on', p.t >= times[i]));
        onTime?.(p.t);
      },
    },
    0,
  );
}

/* ---------------- Claude Code: one sentence rewrites the scene ---------------- */

const CC_LOG: [number, string][] = [
  [1.0, '<span class="y25-dot">⏺</span> <b>Read</b>(scene.css)'],
  [1.1, '<span class="y25-gut">⎿</span> <span class="y25-dim">Read 64 lines</span>'],
  [1.25, '<span class="y25-dot">⏺</span> <b>Update</b>(scene.css)'],
  [1.32, '<span class="y25-gut">⎿</span> <span class="y25-dim">Updated scene.css with 1 addition</span>'],
  [1.4, '<span class="y25-gut"></span> <span class="y25-add">+ background: #ffe600;</span>'],
  [1.55, '<span class="y25-dot">⏺</span> <b>Update</b>(scene.css)'],
  [1.62, '<span class="y25-gut">⎿</span> <span class="y25-dim">Updated scene.css with 1 addition</span>'],
  [
    1.7,
    '<span class="y25-gut"></span> <span class="y25-add">+ font: 900 1em "Arial Black"; text-transform: uppercase;</span>',
  ],
  [1.85, '<span class="y25-dot">⏺</span> <b>Update</b>(scene.css)'],
  [1.92, '<span class="y25-gut">⎿</span> <span class="y25-dim">Updated scene.css with 1 addition</span>'],
  [2.0, '<span class="y25-gut"></span> <span class="y25-add">+ border: 6px solid #000; rotate: -2deg;</span>'],
  [2.2, '<span class="y25-acc">✻</span> Done. This scene is brutalist now.'],
  // easter egg: the agent's famous reflex, before it does anything
  [2.55, '<span class="y25-txt">⏺</span> You’re absolutely right! Reverting the brutalist styles.'],
  [2.68, '<span class="y25-dot">⏺</span> <b>Update</b>(scene.css)'],
  [2.75, '<span class="y25-gut">⎿</span> <span class="y25-dim">Updated scene.css with 3 removals</span>'],
];

const claudeCode: StageScene = {
  year: '2025.02',
  name: 'Claude Code',
  kicker: 'an agent in your terminal',
  line: 'A colleague moved into the terminal. One sentence rewrites the screen.',
  className: 'y25s y25s--cc',
  logo: asciiSlot('#d97757'),
  length: 2.1,
  play({ scene, art, logo, tl }) {
    art.innerHTML = `
      <div class="y25s-prompt"><span class="y25-acc">&gt;</span> <span class="y25s-prompt__t"></span><i class="y25-caret"></i></div>
      <div class="y25s-log">${CC_LOG.map(([, html]) => `<p>${html}</p>`).join('')}</div>
      <div class="y25s-ck"><span class="y25s-ck__say"><span class="a">On it.</span><span class="b">BRUTAL.</span></span>${claudeKun('', 'busy')}</div>`;
    mountAscii(logo, drawIcon(siClaude), tl);
    toCorner(tl, logo);
    const typed = art.querySelector<HTMLElement>('.y25s-prompt__t')!;
    const lines = Array.from(art.querySelectorAll<HTMLElement>('.y25s-log p'));
    tl.from(art.querySelector('.y25s-prompt'), { opacity: 0, y: 20, duration: 0.2 }, 0.3);
    scrubType(tl, typed, 'make this scene brutalist', 0.45, 0.45);
    tl.from(art.querySelector('.y25s-log'), { opacity: 0, y: 20, duration: 0.15 }, 0.9);
    tl.fromTo(
      art.querySelector('.y25s-ck'),
      { scale: 0, rotate: -25 },
      { scale: 1, rotate: 0, duration: 0.2, ease: 'back.out(2.4)' },
      0.95,
    );
    tl.to(typed, { opacity: 0, duration: 0.05 }, 2.2);
    tl.set(typed, { opacity: 1 }, 2.26);
    scrubType(tl, typed, 'actually, undo that', 0.25, 2.26);
    // the reply and the revert land early enough to be read, then the scene holds before moving on
    scrubLog(
      tl,
      lines,
      CC_LOG.map(([t]) => t),
      3.1,
      (t) => {
        scene.classList.toggle('is-b1', t >= 1.45 && t < 2.75);
        scene.classList.toggle('is-b2', t >= 1.75 && t < 2.75);
        scene.classList.toggle('is-b3', t >= 2.05 && t < 2.75);
        // the top bar repaints with the scene, so it doesn't sit on the yellow as a dark band
        document.documentElement.classList.toggle('y25-brutal', t >= 1.45 && t < 2.75);
      },
    );
  },
};

/* ---------------- Vibe coding: prompt → accept all → an app ---------------- */

const FILES: [string, number][] = [
  ['app/page.tsx', 86],
  ['components/HabitRow.tsx', 41],
  ['components/StreakRing.tsx', 38],
  ['lib/store.ts', 27],
  ['app/globals.css', 54],
  ['package.json', 3],
];

const HABITS: [string, string, number][] = [
  ['💧', 'Drink water', 5],
  ['📖', 'Read 20 min', 4],
  ['🚶', 'Walk outside', 3],
  ['🧘', 'Stretch', 5],
];

const vibe: StageScene = {
  year: '2025.02',
  name: 'Vibe coding',
  kicker: 'forget that the code even exists',
  line: 'Don’t read the code. Feel the vibe. Accept all.',
  className: 'y25s y25s--vibe',
  logo: asciiSlot('#e879a6'),
  length: 1.35,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <div class="y25s-vibe__left">
        <div class="y25s-prompt"><span class="y25-acc">&gt;</span> <span class="y25s-prompt__t"></span></div>
        <ul class="y25s-files">${FILES.map(([f, n]) => `<li><span class="y25-add">+</span> ${esc(f)} <span class="y25-ok">+${n}</span></li>`).join('')}</ul>
        <button type="button" class="y25s-accept" tabindex="-1">Accept all <kbd>⌘⏎</kbd></button>
      </div>
      <div class="y25s-app">
        <div class="y25s-app__head"><b>Habits</b><span>Today</span></div>
        <div class="y25s-app__ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="42" class="y25s-app__arc"/></svg><span><b>3</b>/4</span></div>
        ${HABITS.map(
          ([e, n, d]) =>
            `<div class="y25s-app__row"><span class="y25s-app__e">${e}</span><b>${esc(n)}</b><span class="y25s-app__dots">${'<i class="on"></i>'.repeat(d)}${'<i></i>'.repeat(5 - d)}</span></div>`,
        ).join('')}
        <span class="y25s-app__fab">+</span>
      </div>
      <p class="y25s-vibe__t"><span class="y25s-vibe__s">0.0</span>s</p>`;
    mountAscii(logo, drawWave, tl);
    toCorner(tl, logo);
    const typed = art.querySelector<HTMLElement>('.y25s-prompt__t')!;
    const files = art.querySelectorAll('.y25s-files li');
    const accept = art.querySelector<HTMLElement>('.y25s-accept')!;
    const parts = art.querySelectorAll('.y25s-app > *');
    const secs = art.querySelector<HTMLElement>('.y25s-vibe__s')!;

    tl.from(art.querySelector('.y25s-prompt'), { opacity: 0, y: 20, duration: 0.2 }, 0.3);
    scrubType(tl, typed, 'build me a habit tracker. make it feel nice.', 0.5, 0.4);
    tl.from(files, { opacity: 0, x: -20, stagger: 0.06, duration: 0.12 }, 0.95);
    tl.fromTo(accept, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, 1.35);
    tl.to(accept, { scale: 0.92, duration: 0.05, yoyo: true, repeat: 1 }, 1.55);
    tl.fromTo(
      art.querySelector('.y25s-app'),
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.15 },
      1.62,
    );
    tl.fromTo(
      parts,
      { opacity: 0, x: () => (mobile() ? 0 : -260), y: () => (mobile() ? 40 : 0), rotate: -6 },
      { opacity: 1, x: 0, y: 0, rotate: 0, stagger: 0.06, duration: 0.22, ease: 'power3.out' },
      1.65,
    );
    tl.fromTo(
      art.querySelector('.y25s-app__arc'),
      { strokeDashoffset: 264 },
      { strokeDashoffset: 66, duration: 0.3, ease: 'power2.out' },
      2.0,
    );
    const clock = { s: 0 };
    tl.fromTo(art.querySelector('.y25s-vibe__t'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 1.6);
    tl.to(
      clock,
      { s: 4.2, duration: 0.6, ease: 'none', onUpdate: () => (secs.textContent = clock.s.toFixed(1)) },
      1.62,
    );
    tl.to({}, { duration: 0.25 });
  },
};

/* ---------------- Parallel agents: fan out, work, merge ---------------- */

type Tool = 'claude' | 'codex' | 'gemini' | 'copilot' | 'cursor';

const TASKS: [string, string, Tool][] = [
  ['checkout', 'refactor the checkout flow', 'claude'],
  ['tests', 'raise coverage to 90%', 'codex'],
  ['a11y', 'fix contrast + focus order', 'gemini'],
  ['i18n', 'extract strings, add ja/de', 'claude'],
  ['db', 'migrate orders → partitions', 'copilot'],
  ['perf', 'cut LCP under 1.5s', 'cursor'],
  ['docs', 'regenerate the API docs', 'codex'],
  ['deps', 'upgrade 48 packages', 'claude'],
];

/** Each agent shows up with its own tool: Claude-kun for Claude Code, a mark for the rest. */
const TOOLS: Record<Tool, { name: string; badge: () => string }> = {
  claude: { name: 'Claude Code', badge: () => claudeKun('', 'busy') },
  codex: { name: 'Codex', badge: () => '<span class="y25s-tool y25s-tool--codex">&gt;_</span>' },
  gemini: { name: 'Gemini CLI', badge: () => `<span class="y25s-tool">${mark(siGooglegemini, '#a78bfa')}</span>` },
  copilot: { name: 'Copilot agent', badge: () => `<span class="y25s-tool">${mark(siGithubcopilot, '#e6e6e6')}</span>` },
  cursor: { name: 'Cursor agent', badge: () => `<span class="y25s-tool">${mark(siCursor, '#e6e6e6')}</span>` },
};

const parallel: StageScene = {
  year: '2025',
  name: 'Parallel agents',
  kicker: 'Claude Code · Codex · Gemini CLI · Copilot · Cursor',
  line: 'You ask once. Eight agents, five vendors, get to work.',
  className: 'y25s y25s--par',
  logo: asciiSlot('#7ee787'),
  length: 1.4,
  // every pane done, the crowd still marching
  still: 0.68,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <div class="y25s-par">
        <div class="y25s-main"><p><span class="y25-acc">&gt;</span> ship the Q4 cleanup — split it up</p><p class="y25s-main__done"><span class="y25-ok">✓</span> 8 branches merged → <b>PR #128</b> · all checks green</p></div>
        ${TASKS.map(
          ([id, task, tool], i) => `
          <div class="y25s-pane y25s-pane--${tool}" style="--i:${i}">
            <span class="y25s-pane__ck">${TOOLS[tool].badge()}</span>
            <p class="y25s-pane__h"><span class="y25s-spin">⠋</span><b>${TOOLS[tool].name}</b> <span class="y25-dim">wt/${esc(id)}</span></p>
            <p class="y25s-pane__t">${esc(task)}</p>
            <p class="y25s-pane__l"><span class="y25-dot">⏺</span> Edit · Bash · Read</p>
            <i class="y25s-pane__bar"><i></i></i>
          </div>`,
        ).join('')}
      </div>
      <div class="y25s-crowd"><div class="y25s-crowd__row">${claudeKunCrowd(40, '', 'busy')}</div><p class="y25s-crowd__n"><b>×40</b> and counting</p></div>
      <div class="y25s-mainck">${claudeKun('', 'wave')}</div>`;
    mountAscii(logo, drawFan, tl);
    toCorner(tl, logo);
    const panes = Array.from(art.querySelectorAll<HTMLElement>('.y25s-pane'));
    const bars = panes.map((p) => p.querySelector<HTMLElement>('.y25s-pane__bar i')!);
    const spins = panes.map((p) => p.querySelector<HTMLElement>('.y25s-spin')!);
    const main = art.querySelector<HTMLElement>('.y25s-main')!;
    const FR = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';

    tl.fromTo(main, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2 }, 0.3);
    // fan out from the main pane
    tl.fromTo(
      panes,
      {
        opacity: 0,
        scale: 0.2,
        x: (i: number) => paneOffset(panes[i], main).x,
        y: (i: number) => paneOffset(panes[i], main).y,
      },
      { opacity: 1, scale: 1, x: 0, y: 0, stagger: 0.04, duration: 0.35, ease: 'power3.out' },
      0.55,
    );
    // the main pane steps aside entirely: a ghost of it would show through the gaps between panes
    tl.to(main, { opacity: 0, duration: 0.2 }, 0.55);
    const work = { k: 0 };
    tl.to(
      work,
      {
        k: 1,
        duration: 0.9,
        ease: 'none',
        onUpdate: () => {
          panes.forEach((p, i) => {
            const rate = 0.75 + hash(i + 3) * 0.6;
            const v = Math.min(1, work.k * rate * 1.25);
            bars[i].style.transform = `scaleX(${v})`;
            const done = v >= 1;
            p.classList.toggle('is-done', done);
            spins[i].textContent = done ? '✓' : FR[Math.floor(work.k * 60 + i) % FR.length];
          });
        },
      },
      0.95,
    );
    // merge back
    tl.to(
      panes,
      {
        opacity: 0,
        scale: 0.2,
        x: (i: number) => paneOffset(panes[i], main).x,
        y: (i: number) => paneOffset(panes[i], main).y,
        stagger: 0.03,
        duration: 0.3,
        ease: 'power3.in',
      },
      1.95,
    );
    // the crowd: dozens of Claude-kuns march across while the panes work, then head home
    const crowd = art.querySelector<HTMLElement>('.y25s-crowd')!;
    const row = art.querySelector<HTMLElement>('.y25s-crowd__row')!;
    const kuns = Array.from(row.children) as HTMLElement[];
    tl.fromTo(crowd, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.95);
    tl.fromTo(
      kuns,
      { scale: 0, y: 20 },
      { scale: 1, y: 0, stagger: 0.008, duration: 0.12, ease: 'back.out(2.2)' },
      0.95,
    );
    tl.fromTo(
      row,
      { x: () => -row.scrollWidth * 0.45 },
      { x: () => crowd.clientWidth - row.scrollWidth * 0.55, duration: 1.0, ease: 'none' },
      0.95,
    );
    tl.to(
      kuns,
      { scale: 0, y: -30, opacity: 0, stagger: { each: 0.006, from: 'center' }, duration: 0.14, ease: 'power2.in' },
      1.95,
    );
    tl.to(crowd, { opacity: 0, duration: 0.1 }, 2.15);
    tl.to(main, { opacity: 1, scale: 1.08, duration: 0.2 }, 2.2);
    tl.fromTo(
      art.querySelector('.y25s-mainck'),
      { scale: 0, rotate: -30 },
      { scale: 1, rotate: 0, duration: 0.2, ease: 'back.out(2.6)' },
      2.25,
    );
    tl.fromTo(
      art.querySelector('.y25s-main__done'),
      { opacity: 0, height: 0 },
      { opacity: 1, height: 'auto', duration: 0.15 },
      2.25,
    );
    tl.to({}, { duration: 0.25 });
  },
};

/** Distance from a pane's resting place to the main pane's center (layout units, untransformed). */
function paneOffset(pane: HTMLElement, main: HTMLElement): { x: number; y: number } {
  const a = { x: pane.offsetLeft + pane.offsetWidth / 2, y: pane.offsetTop + pane.offsetHeight / 2 };
  const b = { x: main.offsetLeft + main.offsetWidth / 2, y: main.offsetTop + main.offsetHeight / 2 };
  return { x: b.x - a.x, y: b.y - a.y };
}

/* ---------------- The frontier: many labs, one race ---------------- */

const FIELD = ' .·:+*';

/** An original "frontier" mark: a bright core inside a tilted ring. */
const drawFrontier: Draw = (ctx, s) => {
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = s * 0.045;
  ctx.beginPath();
  ctx.ellipse(s / 2, s / 2, s * 0.44, s * 0.15, -0.35, 0, Math.PI * 2);
  ctx.stroke();
};

/** Typographic marks for labs without a public icon: just the name, never a copy of their logo. */
const wordmark = (text: string) => `<span class="y25s-lab__word">${esc(text)}</span>`;
const mark = (icon: SimpleIcon, color = `#${icon.hex}`) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${color}" d="${icon.path}"/></svg>`;

const LABS: { model: string; lab: string; mark: string }[] = [
  { model: 'Claude', lab: 'Anthropic', mark: mark(siClaude) },
  { model: 'GPT', lab: 'OpenAI', mark: wordmark('OpenAI') },
  { model: 'Gemini', lab: 'Google', mark: mark(siGooglegemini, '#a78bfa') },
  { model: 'Llama', lab: 'Meta', mark: mark(siMeta, '#3b8bff') },
  { model: 'DeepSeek', lab: 'DeepSeek', mark: mark(siDeepseek) },
  { model: 'Mistral', lab: 'Mistral AI', mark: mark(siMistralai) },
  { model: 'Grok', lab: 'xAI', mark: wordmark('xAI') },
  { model: 'Qwen', lab: 'Alibaba', mark: mark(siQwen, '#8b7bff') },
];

const frontier: StageScene = {
  year: '2026',
  name: 'The frontier',
  kicker: 'many labs · one race',
  line: 'Many labs. One race. Every model you can name, a few months apart.',
  className: 'y25s y25s--c5',
  logo: asciiSlot('#ffffff'),
  length: 1.3,
  play({ scene, art, logo, tl }) {
    let field = '';
    for (let r = 0; r < 90; r++) {
      for (let c = 0; c < 280; c++) {
        const v = hash(r * 997 + c);
        field += v > 0.93 ? FIELD[2 + Math.floor(hash(r + c * 31) * 4)] : v > 0.6 ? '.' : ' ';
      }
      field += '\n';
    }
    art.innerHTML = `
      <div class="y25s-glow"></div>
      <pre class="y25s-field" aria-hidden="true">${field}</pre>
      <i class="y25s-horizon"></i>
      <canvas class="y25s-orbit" aria-hidden="true"></canvas>
      <div class="y25s-labs">${LABS.map(
        (l, i) =>
          `<div class="y25s-lab" style="--i:${i}"><span class="y25s-lab__mark">${l.mark}</span><span class="y25s-lab__t"><b>${esc(l.model)}</b><small>${esc(l.lab)}</small></span></div>`,
      ).join('')}</div>`;
    mountAscii(logo, drawFrontier, tl, 0.6);
    const fieldEl = art.querySelector<HTMLElement>('.y25s-field')!;
    tl.fromTo(fieldEl, { '--r': 0 }, { '--r': 130, duration: 1.4, ease: 'power2.inOut' }, 0.2);
    tl.fromTo(
      art.querySelector('.y25s-glow'),
      { scale: 0.2, opacity: 0 },
      { scale: 1.6, opacity: 1, duration: 1.4, ease: 'power2.out' },
      0.2,
    );
    tl.fromTo(
      art.querySelector('.y25s-horizon'),
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.9, ease: 'power3.out' },
      0.7,
    );
    tl.to(logo, { scale: 1.12, filter: 'brightness(1.6)', duration: 1, ease: 'sine.inOut' }, 0.6);

    // the labs arrive one by one from far out and settle on a ring around the core
    const labs = Array.from(art.querySelectorAll<HTMLElement>('.y25s-lab'));
    const place = (i: number) => {
      const a = (i / labs.length) * Math.PI * 2 - Math.PI / 2;
      const rx = mobile() ? window.innerWidth * 0.36 : Math.min(window.innerWidth * 0.36, 540);
      const ry = mobile() ? window.innerHeight * 0.17 : Math.min(window.innerHeight * 0.21, 190);
      return { x: Math.cos(a) * rx, y: Math.sin(a) * ry };
    };
    tl.fromTo(
      labs,
      { x: (i: number) => place(i).x * 2.6, y: (i: number) => place(i).y * 2.6, opacity: 0, scale: 0.5 },
      {
        x: (i: number) => place(i).x,
        y: (i: number) => place(i).y,
        opacity: 1,
        scale: 1,
        stagger: 0.09,
        duration: 0.45,
        ease: 'power3.out',
      },
      0.45,
    );

    // and the field fills with hundreds of tiny marks from every lab (a few Claude-kuns among them)
    const sprites = [
      iconSprite(siClaude),
      textSprite('OpenAI'),
      iconSprite(siGooglegemini, '#a78bfa'),
      iconSprite(siMeta, '#3b8bff'),
      kunSprite(),
      iconSprite(siDeepseek),
      iconSprite(siMistralai),
      textSprite('xAI'),
      iconSprite(siQwen, '#8b7bff'),
    ];
    const orbit = orbitMarks(art.querySelector<HTMLCanvasElement>('.y25s-orbit')!, scene, logo, sprites, 240);
    tl.fromTo(orbit.state, { reveal: 0 }, { reveal: 1, duration: 1.1, ease: 'power2.out' }, 0.6);
    tl.to({}, { duration: 0.3 });
  },
};

export const STAGE_2025: StageScene[] = [claudeCode, vibe, parallel, frontier];
