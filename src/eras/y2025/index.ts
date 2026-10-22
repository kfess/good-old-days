import {
  siAnthropic,
  siClaude,
  siDeepseek,
  siGithubcopilot,
  siGooglegemini,
  siMeta,
  siQwen,
  siTailwindcss,
  siTypescript,
  siWebgpu,
} from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { logo } from '../../components/logo';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { t } from '../../core/i18n';
import { DESKTOP_QUERY, gsap, MOBILE_QUERY, reducedMotion, ScrollTrigger } from '../../core/scroll';
import type { Era } from '../../core/types';
import { h, onceInView } from '../../core/util';
import { Run, wait } from '../y2023/lib';
import { mountAsciiGlobe } from './ascii-globe';
import { STAGE_2025 } from './stage';
import './style.css';

/* ---------------- intro ---------------- */

function intro(section: HTMLElement): void {
  const el = h(`
    <header class="y25-intro">
      <div class="y25-intro__text">
        <p class="y25-intro__ps"><span class="y25-dim">~/good-old-days</span> <span class="y25-acc">$</span> claude</p>
        <p class="y25-intro__years">// 2025 — 2026</p>
        <h2 class="y25-intro__title">It builds<br />itself.</h2>
        <p class="y25-intro__sub">Say it, and it’s already built.</p>
      </div>
      <pre class="y25-ascii" aria-hidden="true"></pre>
    </header>`);
  section.appendChild(el);
  const pre = el.querySelector<HTMLElement>('.y25-ascii')!;
  const small = window.matchMedia(MOBILE_QUERY).matches;
  mountAsciiGlobe(pre, small ? 52 : 84, small ? 22 : 34);
}

/* ---------------- agent session (scroll-driven) ---------------- */

interface Line {
  html: string;
  todo?: number;
  pipe?: number;
  dark?: boolean;
}

const SESSION: Line[] = [
  {
    html: `<span class="y25-user">${t('&gt; add dark mode to the todo app, then ship it', '&gt; TODOアプリにダークモード追加して、そのままリリースまでお願い')}</span>`,
  },
  {
    html: `<span class="y25-dot">⏺</span> ${t("I'll add a theme toggle, run the tests, open a PR, merge it and let CD roll it out.", 'テーマ切り替えを追加して、テスト実行、PR作成、マージまで行い、CDでリリースします。')}`,
  },
  { html: '<span class="y25-dot">⏺</span> <b>Read</b>(src/theme.ts)' },
  { html: '<span class="y25-gut">⎿</span><span class="y25-dim">Read 48 lines</span>', todo: 0 },
  {
    html: `<span class="y25-txt">⏺</span> ${t("Line 14: `// don't touch this. it works.` — git blame: you, 2019. Keep it?", '14行目: `// ここ触るな。なぜか動いてる。` — git blame: あなた, 2019年。残しますか？')}`,
  },
  { html: `<span class="y25-user">${t('&gt; keep it.', '&gt; 残して。')}</span>` },
  { html: '<span class="y25-dot">⏺</span> <b>Update</b>(src/theme.ts)' },
  {
    html: '<span class="y25-gut">⎿</span><span class="y25-dim">Updated src/theme.ts with 4 additions and 1 removal</span>',
  },
  {
    html: '<span class="y25-gut"></span><span class="y25-add">+ import { createContext, useContext } from \'react\';</span>',
  },
  {
    html: '<span class="y25-gut"></span><span class="y25-add">+ export const dark = { bg: \'#0c0c0c\', fg: \'#e6e6e6\' };</span>',
  },
  {
    html: '<span class="y25-gut"></span><span class="y25-add">+ export const ThemeContext = createContext(light);</span>',
  },
  {
    html: '<span class="y25-gut"></span><span class="y25-add">+ export const useTheme = () =&gt; useContext(ThemeContext);</span>',
  },
  { html: '<span class="y25-gut"></span><span class="y25-del">- export const theme = light;</span>' },
  { html: '<span class="y25-dot">⏺</span> <b>Write</b>(src/components/ThemeToggle.tsx)' },
  { html: '<span class="y25-gut">⎿</span><span class="y25-dim">Wrote 31 lines</span>', todo: 1, dark: true },
  { html: '<span class="y25-dot">⏺</span> <b>Bash</b>(npm test)' },
  {
    html: '<span class="y25-gut">⎿</span><span class="y25-ok">✓ 128 passed</span> <span class="y25-dim">(2.1s)</span>',
    todo: 2,
  },
  { html: '<span class="y25-dot">⏺</span> <b>Bash</b>(gh pr create --fill)' },
  {
    html: '<span class="y25-gut">⎿</span><span class="y25-dim">https://github.com/you/todo-app/pull/42</span>',
    todo: 3,
    pipe: 0,
  },
  { html: '<span class="y25-dot">⏺</span> <b>Bash</b>(gh pr checks 42 --watch)' },
  { html: '<span class="y25-gut">⎿</span><span class="y25-ok">✓ build   ✓ test   ✓ e2e</span>', pipe: 1 },
  { html: '<span class="y25-dot">⏺</span> <b>Bash</b>(gh pr merge 42 --squash)' },
  { html: '<span class="y25-gut">⎿</span><span class="y25-ok">✓ Squashed and merged pull request #42</span>', pipe: 2 },
  { html: '<span class="y25-dot">⏺</span> <b>Bash</b>(argocd app wait todo-app --health)' },
  {
    html: '<span class="y25-gut">⎿</span><span class="y25-dim">image todo-app:1.8.0 · Synced · Healthy</span>',
    pipe: 3,
  },
  { html: '<span class="y25-dot">⏺</span> <b>Bash</b>(kubectl rollout status deploy/todo-app)' },
  {
    html: '<span class="y25-gut">⎿</span><span class="y25-dim">deployment "todo-app" successfully rolled out</span>',
    pipe: 4,
  },
  {
    html: `<span class="y25-dot">⏺</span> ${t('Live in production. Dark mode is out.', '本番にリリースしました。ダークモード公開済みです。')}`,
    todo: 4,
  },
  {
    html: `<span class="y25-acc">✻</span> ${t('Done in 3m 12s. Anything else?', '3分12秒で完了しました。他にありますか？')}`,
  },
];

const TODOS = t(
  [
    'Read the theme setup',
    'Add a dark theme + toggle',
    'Run the test suite',
    'Open a pull request',
    'Ship it to production',
  ],
  ['テーマ設定を読む', 'ダークテーマと切り替えを追加', 'テストを実行', 'PRを作成', '本番にリリース'],
);
const PIPE = ['PR #42', 'CI', 'Merge', 'Argo CD', 'Kubernetes'];

function session(section: HTMLElement): void {
  const el = h(`
    <section class="y25-session">
      <div class="y25-session__pin">
        <header class="y25-h">
          <p class="y25-kicker">// agent session</p>
          <h3 class="y25-h__title">One prompt. Every layer.</h3>
          <p class="y25-h__jp">One sentence, from screen to cloud.</p>
        </header>
        <div class="y25-sess">
          <div class="y25-term">
            <div class="y25-term__bar"><i></i><i></i><i></i><span>claude — ~/todo-app</span></div>
            <div class="y25-term__body">
              ${SESSION.map((l) => `<div class="y25-l">${l.html}</div>`).join('')}
              <div class="y25-l y25-working"><span class="y25-spin">✻</span> Working…</div>
            </div>
          </div>
          <aside class="y25-side">
            <div class="y25-box">
              <p class="y25-box__t">Todos</p>
              <ul class="y25-todos">${TODOS.map((todo) => `<li><span class="y25-check">☐</span>${todo}</li>`).join('')}</ul>
            </div>
            <div class="y25-box">
              <p class="y25-box__t">localhost:3000</p>
              <div class="y25-app">
                <div class="y25-app__bar"><b>Todos</b><span class="y25-app__toggle" aria-hidden="true"></span></div>
                <ul><li><i></i>Write the plan</li><li class="is-done"><i></i>Ship dark mode</li><li><i></i>Celebrate</li></ul>
              </div>
            </div>
            <div class="y25-box">
              <p class="y25-box__t">Pipeline</p>
              <ol class="y25-pipe">${PIPE.map((p) => `<li><span></span>${p}</li>`).join('')}</ol>
            </div>
          </aside>
        </div>
      </div>
    </section>`);
  section.appendChild(el);

  const lines = Array.from(el.querySelectorAll<HTMLElement>('.y25-l:not(.y25-working)'));
  const working = el.querySelector<HTMLElement>('.y25-working')!;
  const body = el.querySelector<HTMLElement>('.y25-term__body')!;
  const todos = Array.from(el.querySelectorAll<HTMLElement>('.y25-todos li'));
  const pipes = Array.from(el.querySelectorAll<HTMLElement>('.y25-pipe li'));
  const app = el.querySelector<HTMLElement>('.y25-app')!;

  let shown = -1;
  const show = (n: number) => {
    if (n === shown) return;
    shown = n;
    lines.forEach((l, i) => l.classList.toggle('is-on', i < n));
    const done = SESSION.slice(0, n);
    todos.forEach((t, i) => {
      const ok = done.some((l) => l.todo === i);
      t.classList.toggle('is-done', ok);
      t.querySelector('.y25-check')!.textContent = ok ? '☒' : '☐';
    });
    pipes.forEach((p, i) =>
      p.classList.toggle(
        'is-done',
        done.some((l) => l.pipe === i),
      ),
    );
    app.classList.toggle(
      'is-dark',
      done.some((l) => l.dark),
    );
    working.classList.toggle('is-on', n > 0 && n < SESSION.length);
    body.scrollTop = body.scrollHeight;
  };

  if (reducedMotion) {
    show(SESSION.length);
    return;
  }

  const mm = gsap.matchMedia();
  mm.add(DESKTOP_QUERY, () => {
    show(0);
    ScrollTrigger.create({
      trigger: el.querySelector('.y25-session__pin'),
      pin: true,
      start: 'top top',
      end: '+=160%',
      scrub: true,
      // the transcript completes a little before the pin releases, so "Done" can be read
      onUpdate: (self) => show(Math.min(SESSION.length, Math.round((self.progress / 0.85) * SESSION.length))),
    });
  });
  mm.add(MOBILE_QUERY, () => {
    show(0);
    const run = new Run();
    onceInView(
      el.querySelector('.y25-term')!,
      async () => {
        const id = run.next();
        for (let i = 1; i <= SESSION.length && run.alive(id); i++) {
          show(i);
          await wait(420);
        }
      },
      'top 70%',
    );
    return () => run.next();
  });
}

/* ---------------- bridge ---------------- */

function bridge(section: HTMLElement): void {
  const el = h(`
    <div class="y25-bridge">
      <p class="y25-bridge__line"><span class="y25-acc">&gt;</span> <span class="y25-bridge__typed"></span><span class="y25-caret"></span></p>
      <p class="y25-bridge__out"><span class="y25-dot">⏺</span> ${t('Starting with the &lt;marquee&gt;…', 'まずは&lt;marquee&gt;から…')}</p>
    </div>`);
  section.appendChild(el);
  const typed = el.querySelector<HTMLElement>('.y25-bridge__typed')!;
  const text = t('rebuild everything since 1999.', '1999年から全部作り直して。');
  if (reducedMotion) {
    typed.textContent = text;
    el.classList.add('is-done');
    return;
  }
  onceInView(
    el,
    async () => {
      for (const ch of text) {
        typed.textContent += ch;
        await wait(45);
      }
      await wait(500);
      el.classList.add('is-done');
    },
    'top 70%',
  );
}

/* ---------------- era ---------------- */

export const era: Era = {
  id: 'y2025',
  years: [2025, 2026],
  label: 'Agents',
  theme: { bg: '#0c0c0c', fg: '#e6e6e6', accent: '#d97757', muted: '#8a8a8a' },
  hudFont: "'Geist Mono', 'JetBrains Mono', monospace",
  servers: { value: '∞', unit: 'agents, in parallel' },
  render(section) {
    intro(section);

    createStage(section, STAGE_2025);
    createCredits(
      section,
      [
        { year: '2025.01', name: 'DeepSeek-R1', icon: siDeepseek, line: 'Open weights, reasoning and all.' },
        { year: '2025.01', name: 'Tailwind CSS v4', icon: siTailwindcss, line: 'The config file disappeared.' },
        { year: '2025.02', name: 'Grok 3', line: 'xAI joins the frontier.' },
        {
          year: '2025.03',
          name: 'Gemini 2.5 Pro',
          icon: siGooglegemini,
          line: 'Google’s model that thinks before it answers.',
        },
        { year: '2025.04', name: 'OpenAI o3', line: 'Reasoning, with tools, in one model.' },
        { year: '2025.04', name: 'Llama 4', icon: siMeta, line: 'Open weights, now mixture-of-experts.' },
        { year: '2025.04', name: 'Qwen3', icon: siQwen, line: 'Open models from Alibaba, thinking on demand.' },
        { year: '2025.04', name: 'Codex CLI', line: 'Another colleague moves into the terminal.' },
        { year: '2025.05', name: 'Claude 4', icon: siClaude, line: 'Works on its own, for hours.' },
        {
          year: '2025.05',
          name: 'Copilot coding agent',
          icon: logo(siGithubcopilot, 'current'),
          line: 'Assign an issue. Get a pull request.',
        },
        {
          year: '2025.06',
          name: 'Gemini CLI',
          icon: siGooglegemini,
          line: 'Google’s open-source agent, in the terminal.',
        },
        { year: '2025.08', name: 'GPT-5', line: 'Thinking became automatic: it decides when to reason.' },
        {
          year: '2025.09',
          name: 'WebGPU',
          icon: logo(siWebgpu, 'current'),
          line: 'With Safari 26, the GPU in every major browser engine.',
        },
        {
          year: '2025.09',
          name: 'Claude Agent SDK',
          icon: logo(siAnthropic, 'current'),
          line: 'The harness behind Claude Code, yours to build on.',
        },
        {
          year: '2025.10',
          name: 'Agent Skills',
          icon: logo(siAnthropic, 'current'),
          line: 'Agents, assembled from parts.',
        },
        { year: '2025.11', name: 'Gemini 3', icon: siGooglegemini, line: 'The next generation from Google.' },
        {
          year: '2026.07',
          name: 'TypeScript native',
          icon: siTypescript,
          line: 'TypeScript 7: the compiler, ported to Go. Builds ~10× faster.',
        },
        { year: '2026.09', name: 'GPT-6 Astra', line: 'The first model OpenAI rated “Critical” for cyber.' },
      ],
      'Also starring — 2025–2026',
    );

    session(section);

    createThread(section, 'y2025');

    const ship = h(`
      <section class="y25-ship">
        <header class="y25-h">
          <p class="y25-kicker">// deploy</p>
          <h3 class="y25-h__title">Just say ship it.</h3>
          <p class="y25-h__jp">Deploying takes one sentence, too.</p>
        </header>
      </section>`);
    section.appendChild(ship);
    createDeploy(ship, {
      label: '> ship it',
      title: 'claude — ~/todo-app',
      steps: [
        { kind: 'cmd', text: 'claude "ship it"' },
        {
          kind: 'out',
          text: t(
            '⏺ Running the tests, opening a PR, then shipping it through CD.',
            '⏺ テストを実行して、PRを作成し、CDでリリースします。',
          ),
          delay: 400,
        },
        { kind: 'out', text: '⏺ Bash(npm test)  ⎿ ✓ 128 passed' },
        { kind: 'out', text: '⏺ Bash(gh pr create --fill)  ⎿ https://github.com/you/todo-app/pull/43' },
        { kind: 'out', text: '  GitHub ▸ PR #43 · +4,812 −2,397 across 63 files' },
        { kind: 'progress', text: '⏺ Bash(gh pr checks 43 --watch)', delay: 1300 },
        // easter egg: the bigger the diff, the shorter the review
        { kind: 'out', text: '  GitHub ▸ @sam approved: “LGTM 👍”', delay: 500 },
        {
          kind: 'out',
          text: t(
            '  (last week, PR #41 changed 10 lines and got 20 comments)',
            '  (先週、10行だけのPR #41には20件コメントがついた)',
          ),
          delay: 500,
        },
        { kind: 'out', text: '⏺ Bash(gh pr merge 43 --squash)  ⎿ ✓ Squashed and merged pull request #43' },
        { kind: 'progress', text: '  CI ▸ build & push image todo-app:1.9.0', delay: 1000 },
        { kind: 'out', text: '  CI ▸ config repo: image tag bumped to 1.9.0' },
        { kind: 'progress', text: '  Argo CD ▸ todo-app OutOfSync → syncing', delay: 1100 },
        { kind: 'out', text: '⏺ Bash(argocd app wait todo-app --health)  ⎿ Synced · Healthy' },
        { kind: 'ok', text: '✓ Live in production · zero downtime rollout' },
        { kind: 'out', text: t('✻ Shipped. Anything else?', '✻ リリースしました。他にありますか？') },
      ],
      doneLabel: '✓ shipped',
    });
    createStack(ship, [
      { cat: 'Frontend', prev: 'Next.js App Router + shadcn/ui', value: 'AI-generated UI' },
      { cat: 'Language', prev: 'TypeScript + Python', value: 'TypeScript + plain English' },
      { cat: 'CSS / UI', prev: 'Tailwind + shadcn/ui', value: 'Tailwind v4' },
      { cat: 'Build', prev: 'Vite / Turbopack', value: 'Vite (Rolldown) / Bun' },
      { cat: 'Backend', prev: 'LLM APIs + Hono', value: 'MCP servers + Agent SDK' },
      { cat: 'Database', prev: 'pgvector / Vector DB', value: 'Postgres + vector search' },
      { cat: 'Infra', prev: 'GPU cloud / Bedrock', value: 'Agents on the cloud' },
      { cat: 'Dev', prev: 'Cursor', value: 'Claude Code' },
      { cat: 'AI', prev: 'GPT-4 / Claude 3', value: 'Claude / GPT-5 agents' },
    ]);

    bridge(section);
  },
};
