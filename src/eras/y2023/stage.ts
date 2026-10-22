import type { SimpleIcon } from 'simple-icons';
import {
  siBrave,
  siClaude,
  siGit,
  siGithub,
  siGoogledrive,
  siModelcontextprotocol,
  siPostgresql,
  siSqlite,
} from 'simple-icons';
import { logo } from '../../components/logo';
import { type StageScene, scrubType } from '../../components/stage';
import { MOBILE_QUERY } from '../../core/scroll';
import { esc } from '../../core/util';
import { tokenize } from './lib';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/** Soft orb + spinning rainbow ring around a mark: the 2023 way to draw a logo. */
function orb(mark: string, tone = '#d97757'): string {
  return `<span class="y23s-orb" style="--tone:${tone}"><i class="y23s-orb__haze"></i><i class="y23s-orb__ring"></i><span class="y23s-orb__mark">${mark}</span></span>`;
}

/** Original abstract mark for the GPT-4 scene: a speech bubble made of tokens. */
const TOKEN_MARK = `<svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.2L7 21v-3.5H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" opacity=".16"/><rect x="5" y="8" width="4.2" height="2.6" rx="1.3" fill="currentColor"/><rect x="10.2" y="8" width="2.8" height="2.6" rx="1.3" fill="currentColor" opacity=".7"/><rect x="14" y="8" width="5" height="2.6" rx="1.3" fill="currentColor" opacity=".45"/><rect x="5" y="12" width="6.5" height="2.6" rx="1.3" fill="currentColor" opacity=".7"/><rect x="12.5" y="12" width="3" height="2.6" rx="1.3" fill="currentColor"/></svg>`;

/** Original mark for the Cursor scene: a text caret with a spark (simple-icons only ships today's logo). */
const CARET_MARK = `<svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><rect x="7.5" y="3" width="9" height="2" rx="1" fill="currentColor"/><rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/><rect x="7.5" y="19" width="9" height="2" rx="1" fill="currentColor"/><path d="M19 2.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="currentColor" opacity=".7"/></svg>`;

/* ---------------- GPT-4: tokens, one at a time ---------------- */

const HAIKU =
  'Sure! A haiku about the web:\nTags became pages,\npages learned to move and speak —\nnow they answer back.';

const gpt4: StageScene = {
  year: '2023.03',
  name: 'GPT-4',
  kicker: 'ChatGPT · the OpenAI API',
  line: 'A model that passes a simulated bar exam, behind an API.',
  className: 'y23s y23s--gpt',
  logo: orb(TOKEN_MARK, '#10a37f'),
  length: 1.3,
  play({ art, logo: mark, tl }) {
    const toks = tokenize(HAIKU);
    art.innerHTML = `
      <div class="y23s-gpt">
        <div class="y23s-gpt__ask"><span>›</span> Write a haiku about the web.</div>
        <p class="y23s-gpt__out">${toks
          // a line's first word comes with its newline attached ("\nTags"): break, then keep the word
          .map(
            (t, i) =>
              `${t.includes('\n') ? '<br>' : ''}<span class="y23s-tok" style="--h:${(i * 47) % 360}">${esc(t.replace(/\s*\n/, ''))}</span>`,
          )
          .join('')}</p>
        <div class="y23s-meter"><b class="y23s-meter__n">0</b><span>tok/s</span><i class="y23s-meter__bar"><i></i></i><small class="y23s-meter__c">0 tokens</small></div>
      </div>`;
    const spans = Array.from(art.querySelectorAll<HTMLElement>('.y23s-tok'));
    const n = art.querySelector<HTMLElement>('.y23s-meter__n')!;
    const c = art.querySelector<HTMLElement>('.y23s-meter__c')!;
    const bar = art.querySelector<HTMLElement>('.y23s-meter__bar i')!;

    tl.to(
      mark,
      {
        xPercent: () => (mobile() ? 0 : -128),
        yPercent: () => (mobile() ? -150 : -78),
        scale: () => (mobile() ? 0.22 : 0.3),
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.y23s-gpt__ask'), { opacity: 0, y: 24, duration: 0.25 }, 0.3);
    const t0 = 0.6;
    const span = 1.5;
    spans.forEach((s, i) => {
      tl.fromTo(
        s,
        { opacity: 0, y: 18, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.12, ease: 'power2.out' },
        t0 + (i / spans.length) * span,
      );
    });
    const meter = { k: 0 };
    tl.to(
      meter,
      {
        k: 1,
        duration: span + 0.1,
        ease: 'none',
        onUpdate: () => {
          const done = Math.round(meter.k * spans.length);
          // a little jitter so it reads like a live meter
          const rate = meter.k > 0 && meter.k < 1 ? 19 + Math.sin(meter.k * 40) * 3 : meter.k >= 1 ? 20.4 : 0;
          n.textContent = rate.toFixed(1);
          c.textContent = `${done} tokens`;
          bar.style.transform = `scaleX(${Math.min(1, rate / 30)})`;
        },
      },
      t0,
    );
    tl.to(spans, { '--tint': 0, duration: 0.3 }, t0 + span + 0.1);
    tl.to({}, { duration: 0.3 });
  },
};

/* ---------------- Claude 3.5 Sonnet: the artifact appears next to the chat ---------------- */

const artifacts: StageScene = {
  year: '2024.06',
  name: 'Claude 3.5 Sonnet',
  kicker: 'Artifacts',
  line: 'Next to the chat, the result comes alive.',
  className: 'y23s y23s--art',
  logo: orb(logo(siClaude, 'current'), '#d97757'),
  length: 1.55,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y23s-chat">
        <div class="y23s-chat__me"><span class="y23s-chat__typed"></span></div>
        <div class="y23s-chat__ai"><span class="y23s-chat__av">✦</span><p>I'll build a focus timer for you.</p></div>
        <div class="y23s-chat__chip"><span class="y23s-chat__chipi">▤</span><span><b>Focus timer</b><small>Click to open component</small></span></div>
      </div>
      <div class="y23s-panel">
        <div class="y23s-panel__bar"><b>Focus timer</b><span class="y23s-tabs"><i>Code</i><i class="is-on">Preview</i></span></div>
        <pre class="y23s-panel__code"><code></code></pre>
        <div class="y23s-app">
          <p class="y23s-app__k">Pomodoro</p>
          <div class="y23s-app__ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="y23s-ring-bg"/><circle cx="50" cy="50" r="44" class="y23s-ring-fg"/></svg><b class="y23s-app__time">25:00</b></div>
          <div class="y23s-app__btns"><button type="button" class="y23s-app__go">Start</button><button type="button" class="y23s-app__reset">Reset</button></div>
          <div class="y23s-app__dots"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="y23s-sk">
        <span class="y23s-sk__say">Writing…</span>
        <span class="y23s-sk__mark">${logo(siClaude)}</span>
        ${'<i class="y23s-sk__block"></i>'.repeat(4)}
      </div>`;
    const typed = art.querySelector<HTMLElement>('.y23s-chat__typed')!;
    const panel = art.querySelector<HTMLElement>('.y23s-panel')!;
    const code = art.querySelector<HTMLElement>('.y23s-panel__code code')!;
    const pieces = art.querySelectorAll('.y23s-app > *');
    wireTimer(art);

    const src = `import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const TOTAL = 25 * 60;
const C = 2 * Math.PI * 44;

export default function FocusTimer() {
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => { if (left === 0) setRunning(false); }, [left]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className="grid place-items-center gap-4 p-8">
      <p className="text-xs uppercase tracking-widest">Pomodoro</p>
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" className="stroke-muted" />
          <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" className="stroke-primary"
            strokeDasharray={\`\${C * (left / TOTAL)} \${C}\`} />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-4xl tabular-nums">{mm}:{ss}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'}</Button>
        <Button variant="outline" onClick={() => { setRunning(false); setLeft(TOTAL); }}>Reset</Button>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={\`h-2 w-2 rounded-full \${i === 0 ? 'bg-primary' : 'bg-muted'}\`} />
        ))}
      </div>
    </div>
  );
}`;
    tl.to(
      mark,
      {
        xPercent: () => (mobile() ? 0 : -128),
        yPercent: () => (mobile() ? -150 : -78),
        scale: () => (mobile() ? 0.22 : 0.3),
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.y23s-chat__me'), { opacity: 0, y: 20, duration: 0.2 }, 0.3);
    scrubType(tl, typed, 'Build me a pomodoro timer. Make it calm.', 0.5, 0.35);
    tl.from(art.querySelector('.y23s-chat__ai'), { opacity: 0, y: 16, duration: 0.2 }, 0.95);
    tl.from(art.querySelector('.y23s-chat__chip'), { opacity: 0, y: 16, duration: 0.2 }, 1.1);
    tl.fromTo(
      panel,
      { clipPath: 'inset(0 0 0 100% round 20px)' },
      { clipPath: 'inset(0 0 0 0% round 20px)', duration: 0.45, ease: 'power3.inOut' },
      1.15,
    );
    scrubType(tl, code, src, 0.7, 1.45);
    // follow the cursor: the generated component is longer than the panel
    const pre = art.querySelector<HTMLElement>('.y23s-panel__code')!;
    tl.to({}, { duration: 0.75, ease: 'none', onUpdate: () => (pre.scrollTop = pre.scrollHeight) }, 1.45);
    tl.to(art.querySelector('.y23s-panel__code'), { opacity: 0, duration: 0.15 }, 2.2);
    tl.fromTo(
      pieces,
      { opacity: 0, y: 24, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.09, duration: 0.25, ease: 'back.out(1.8)' },
      2.25,
    );
    tl.fromTo(
      art.querySelector('.y23s-ring-fg'),
      { strokeDashoffset: 276 },
      { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' },
      2.45,
    );

    // the spark claude.ai turned while answering (2024) leaves the chat, arcs over to the artifact, then throws in each piece
    const sk = art.querySelector<HTMLElement>('.y23s-sk')!;
    const spark = art.querySelector<HTMLElement>('.y23s-sk__mark')!;
    const say = art.querySelector<HTMLElement>('.y23s-sk__say')!;
    const blocks = Array.from(art.querySelectorAll<HTMLElement>('.y23s-sk__block'));
    const hop = () => (mobile() ? 0 : -hopDistance(art));
    tl.fromTo(sk, { scale: 0, x: hop }, { scale: 1, duration: 0.22, ease: 'back.out(2.4)' }, 0.95);
    tl.fromTo(spark, { rotate: -90 }, { rotate: 0, duration: 0.22, ease: 'power2.out' }, 0.95);
    tl.fromTo(say, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.12 }, 1.05);
    tl.to(say, { opacity: 0, duration: 0.1 }, 1.3);
    tl.to(
      sk,
      {
        keyframes: [
          { x: () => hop() * 0.5, y: -70, duration: 0.14, ease: 'power2.out' },
          { x: 0, y: 0, duration: 0.14, ease: 'power2.in' },
        ],
      },
      1.3,
    );
    // it keeps turning while the code streams in
    tl.to(spark, { rotate: 720, duration: 1.2, ease: 'none' }, 1.3);
    blocks.forEach((b, i) => {
      const at = 2.12 + i * 0.09;
      tl.fromTo(b, { opacity: 0, x: 0, y: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.04 }, at);
      tl.to(
        b,
        {
          x: () => (mobile() ? 60 + i * 34 : 120 + i * 40),
          y: () => (mobile() ? -120 - i * 30 : -150 - i * 46),
          rotate: 180,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in',
        },
        at + 0.04,
      );
      tl.to(sk, { scale: 1.14, duration: 0.04, yoyo: true, repeat: 1 }, at);
    });
    tl.fromTo(
      say,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.12,
        immediateRender: false,
        onStart: () => (say.textContent = 'Done'),
        onReverseComplete: () => (say.textContent = 'Writing…'),
      },
      2.62,
    );
    tl.to({}, { duration: 0.35 });
  },
};

/** How far the spark travels: from the chat's right edge to its resting place by the artifact panel. */
function hopDistance(art: HTMLElement): number {
  const chat = art.querySelector<HTMLElement>('.y23s-chat')!;
  const sk = art.querySelector<HTMLElement>('.y23s-sk')!;
  return Math.max(0, sk.offsetLeft - (chat.offsetLeft + chat.offsetWidth) + 10);
}

/** The artifact really works: Start counts down, Reset puts it back. */
function wireTimer(root: HTMLElement): void {
  const time = root.querySelector<HTMLElement>('.y23s-app__time')!;
  const go = root.querySelector<HTMLButtonElement>('.y23s-app__go')!;
  const fg = root.querySelector<SVGCircleElement>('.y23s-ring-fg')!;
  let left = 25 * 60;
  let timer = 0;
  const paint = () => {
    time.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    fg.style.strokeDasharray = `${276 * (left / 1500)} 276`;
  };
  const stop = () => {
    clearInterval(timer);
    timer = 0;
    go.textContent = 'Start';
  };
  go.addEventListener('click', () => {
    if (timer) return stop();
    go.textContent = 'Pause';
    timer = window.setInterval(() => {
      left = Math.max(0, left - 1);
      paint();
      if (!left) stop();
    }, 1000);
  });
  root.querySelector('.y23s-app__reset')!.addEventListener('click', () => {
    stop();
    left = 25 * 60;
    paint();
  });
}

/* ---------------- Cursor: ⌘K, then the diff sweeps through ---------------- */

const OLD = [
  'function total(items) {',
  '  let sum = 0;',
  '  for (let i = 0; i < items.length; i++) {',
  '    sum += items[i].price * items[i].qty;',
  '  }',
  '  return sum;',
  '}',
];
const NEW = [
  'function total(items: Item[]): number {',
  '  return items.reduce((sum, i) => sum + i.price * i.qty, 0);',
  '}',
];

const cursor: StageScene = {
  year: '2023',
  name: 'Cursor',
  kicker: '⌘K · the AI code editor',
  line: 'The editor, rebuilt for AI.',
  className: 'y23s y23s--cur',
  logo: orb(CARET_MARK, '#8b5cf6'),
  length: 1.35,
  // the editor leaves at the end: hold the accepted edit
  still: 0.9,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y23s-ed">
        <div class="y23s-ed__bar"><i></i><i></i><i></i><span>cart.ts</span></div>
        <div class="y23s-ed__body">
          <div class="y23s-k"><span class="y23s-k__key">⌘K</span><span class="y23s-k__typed"></span><span class="y23s-k__go">Generate</span></div>
          <ol class="y23s-ed__code">
            ${OLD.map((l) => `<li class="y23s-old"><code>${esc(l)}</code></li>`).join('')}
            ${NEW.map((l) => `<li class="y23s-new"><code>${esc(l)}</code></li>`).join('')}
          </ol>
          <div class="y23s-accept"><span>Accept <kbd>⌘⏎</kbd></span><span class="y23s-accept__no">Reject</span></div>
          <i class="y23s-sweep"></i>
        </div>
      </div>`;
    const olds = art.querySelectorAll<HTMLElement>('.y23s-old');
    const news = art.querySelectorAll<HTMLElement>('.y23s-new');
    const k = art.querySelector<HTMLElement>('.y23s-k')!;
    const accept = art.querySelector<HTMLElement>('.y23s-accept')!;
    const sweep = art.querySelector<HTMLElement>('.y23s-sweep')!;

    tl.to(
      mark,
      {
        xPercent: () => (mobile() ? 0 : -128),
        yPercent: () => (mobile() ? -150 : -78),
        scale: () => (mobile() ? 0.22 : 0.3),
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.y23s-ed'), { opacity: 0, y: 40, duration: 0.3 }, 0.25);
    tl.set(news, { height: 0, opacity: 0 }, 0);
    // like Cursor's inline prompt, the ⌘K box opens above the code and pushes it down instead of covering line 1
    const list = art.querySelector<HTMLElement>('.y23s-ed__code')!;
    tl.fromTo(list, { marginTop: 0 }, { marginTop: () => k.offsetHeight - 10, duration: 0.15 }, 0.55);
    tl.fromTo(k, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.15 }, 0.55);
    scrubType(tl, art.querySelector<HTMLElement>('.y23s-k__typed')!, 'use reduce, add types', 0.4, 0.62);
    tl.to(art.querySelector('.y23s-k__go'), { scale: 0.9, duration: 0.05, yoyo: true, repeat: 1 }, 1.05);
    tl.to(k, { opacity: 0, y: -10, duration: 0.15 }, 1.15);
    tl.to(list, { marginTop: 0, duration: 0.15 }, 1.15);
    // the sweep paints old lines red and drops the new lines in, green
    tl.fromTo(sweep, { top: '0%', opacity: 1 }, { top: '100%', duration: 0.5, ease: 'none' }, 1.2);
    tl.to(olds, { backgroundColor: 'rgba(248, 81, 73, 0.16)', color: '#ffa198', stagger: 0.04, duration: 0.1 }, 1.2);
    tl.to(news, { height: 'auto', opacity: 1, stagger: 0.08, duration: 0.15, ease: 'power2.out' }, 1.45);
    tl.to(sweep, { opacity: 0, duration: 0.1 }, 1.7);
    tl.fromTo(accept, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.15 }, 1.72);
    tl.to(accept.firstElementChild, { scale: 0.92, duration: 0.05, yoyo: true, repeat: 1 }, 1.95);
    tl.to(olds, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.25, ease: 'power2.inOut' }, 2.05);
    tl.to(news, { backgroundColor: 'rgba(46, 160, 67, 0)', color: '#d6d0c4', duration: 0.3 }, 2.15);
    tl.to(accept, { opacity: 0, duration: 0.15 }, 2.1);
    // the dark editor bows out before the scene's blur exit, which would smear it into a grey slab on the light stage
    tl.to(art.querySelector('.y23s-ed'), { opacity: 0, y: -24, duration: 0.2, ease: 'power2.in' }, 2.5);
  },
};

/* ---------------- MCP: tools plug into the model ---------------- */

const FOLDER =
  '<svg class="logo" viewBox="0 0 24 24" role="img" aria-label="Filesystem" fill="#6b6862"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>';

/** reference servers that shipped with the protocol in Nov 2024 (all local stdio servers) */
const TOOLS: [SimpleIcon | string, string][] = [
  [siGithub, 'GitHub'],
  [siPostgresql, 'Postgres'],
  [siGoogledrive, 'Drive'],
  [FOLDER, 'Filesystem'],
  [siGit, 'Git'],
  [siSqlite, 'SQLite'],
  [siBrave, 'Brave Search'],
];

const mcp: StageScene = {
  year: '2024.11',
  name: 'MCP',
  kicker: 'Model Context Protocol',
  line: 'AI grew hands. One plug for every tool.',
  className: 'y23s y23s--mcp',
  logo: orb(logo(siModelcontextprotocol, 'current'), '#1f1e1d'),
  length: 1.35,
  play({ art, logo: mark, tl }) {
    const n = TOOLS.length;
    art.innerHTML = `
      <svg class="y23s-mcp__wires" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        ${TOOLS.map((_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return `<line class="y23s-wire" x1="0" y1="0" x2="${(Math.cos(a) * 78).toFixed(2)}" y2="${(Math.sin(a) * 78).toFixed(2)}" pathLength="1"/><circle class="y23s-pkt" r="1.6" cx="0" cy="0"/>`;
        }).join('')}
        <circle class="y23s-hubring" r="22" cx="0" cy="0" pathLength="1"/>
      </svg>
      ${TOOLS.map(
        ([icon, label], i) => `
        <div class="y23s-plug" style="--a:${(i / n) * 360 - 90}deg">
          <span class="y23s-plug__body">${logo(icon)}<b>${esc(label)}</b></span><i class="y23s-plug__pins"></i>
        </div>`,
      ).join('')}
      <pre class="y23s-mcp__cfg"><code>"mcpServers": {
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "&lt;token&gt;" }
  },
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres",
             "postgresql://localhost/app"]
  }
}</code></pre>`;
    const plugs = Array.from(art.querySelectorAll<HTMLElement>('.y23s-plug'));
    const wires = art.querySelectorAll<SVGLineElement>('.y23s-wire');
    const pkts = Array.from(art.querySelectorAll<SVGCircleElement>('.y23s-pkt'));

    // the logo becomes the hub at the center
    tl.to(mark, { scale: () => (mobile() ? 0.42 : 0.36), duration: 0.4, ease: 'power2.inOut' }, 0);
    tl.fromTo(
      art.querySelector('.y23s-hubring'),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.3 },
      0.25,
    );
    plugs.forEach((p, i) => {
      const at = 0.45 + i * 0.16;
      tl.fromTo(p, { '--r': 1, opacity: 0 }, { '--r': 0, opacity: 1, duration: 0.3, ease: 'power3.in' }, at);
      tl.fromTo(p, { '--click': 0 }, { '--click': 1, duration: 0.08, yoyo: true, repeat: 1 }, at + 0.3);
      tl.fromTo(wires[i], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.15 }, at + 0.3);
    });
    tl.from(art.querySelector('.y23s-mcp__cfg'), { opacity: 0, x: 30, duration: 0.25 }, 1.0);
    // packets run out to every tool and back
    const flow = { k: 0 };
    tl.to(
      flow,
      {
        k: 2,
        duration: 0.7,
        ease: 'none',
        onUpdate: () => {
          pkts.forEach((c, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const u = (flow.k + i * 0.13) % 1;
            const r = (u < 0.5 ? u * 2 : (1 - u) * 2) * 78;
            c.setAttribute('cx', (Math.cos(a) * r).toFixed(2));
            c.setAttribute('cy', (Math.sin(a) * r).toFixed(2));
            c.style.opacity = flow.k > 0 && flow.k < 2 ? '1' : '0';
          });
        },
      },
      1.65,
    );
    tl.to({}, { duration: 0.2 });
  },
};

export const STAGE_2023: StageScene[] = [gpt4, cursor, artifacts, mcp];
