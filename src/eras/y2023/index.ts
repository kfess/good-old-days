import { siMeta, siShadcnui, siVercel } from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { parodyBook } from '../../components/parody-book';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { t } from '../../core/i18n';
import { gsap, reducedMotion } from '../../core/scroll';
import type { Era } from '../../core/types';
import { esc, h, onceInView } from '../../core/util';
import { mountEmbeddings } from './embeddings';
import { loopWhenVisible, Run, streamInto, wait, whenVisible } from './lib';
import { STAGE_2023 } from './stage';
import './style.css';

/* ---------------- easter egg: the App Router ---------------- */

/** Real App Router conventions (Next.js 13.4+; Server Actions stable in 14): route groups, parallel + intercepting routes, special files. */
const APP_TREE: [string, string?][] = [
  ['app/'],
  ['├─ layout.tsx'],
  ['├─ page.tsx'],
  ['├─ (marketing)/about/page.tsx'],
  ['├─ @modal/default.tsx'],
  ['├─ @modal/(.)photo/[id]/page.tsx'],
  ['├─ photo/[id]/page.tsx'],
  ['├─ photo/[id]/loading.tsx'],
  ['├─ photo/[id]/error.tsx', '"use client"'],
  ['├─ photo/[id]/template.tsx'],
  ['├─ api/chat/route.ts'],
  ['└─ actions.ts', '"use server"'],
];

function appRouterCard(): HTMLElement {
  const files = APP_TREE.filter(([f]) => !f.endsWith('/')).length;
  const directives = APP_TREE.filter(([, tag]) => tag).length;
  const el = h(`
    <aside class="y23-ar" aria-label="A Next.js App Router file tree">
      <div class="y23-ar__card">
        <p class="y23-ar__k">Next.js 14 · App Router</p>
        <pre class="y23-ar__tree">${APP_TREE.map(
          ([f, tag]) => `<span>${esc(f)}${tag ? ` <em>${esc(tag)}</em>` : ''}</span>`,
        ).join('')}</pre>
        <p class="y23-ar__count"><b>${files}</b> files · <b>${directives}</b> directives · for <b>1</b> page</p>
      </div>
      <p class="y23-ar__punch">${t('I just wanted<br /><span>a page.</span>', 'ページを1枚<br /><span>作りたかっただけなのに。</span>')}</p>
    </aside>`);
  if (reducedMotion) {
    el.classList.add('is-in');
    return el;
  }
  onceInView(el, () => el.classList.add('is-in'), 'top 80%');
  return el;
}

/* ---------------- intro ---------------- */

function intro(section: HTMLElement): void {
  const el = h(`
    <header class="y23-intro">
      <div class="y23-orb" aria-hidden="true"><i></i><i></i><i></i><b>✦</b><b>✦</b><b>✦</b></div>
      <div class="y23-intro__chat">
        <p class="y23-intro__date">2022.11.30 →</p>
        <div class="y23-input y23-input--sent">
          <span class="y23-input__text">${t('Explain quantum computing in simple terms', '量子コンピュータをわかりやすく説明して')}</span>
          <span class="y23-send" aria-hidden="true">↑</span>
        </div>
        <div class="y23-reply">
          <span class="y23-avatar" aria-hidden="true">✦</span>
          <p class="y23-reply__text"><span class="y23-shimmer">Thinking…</span></p>
        </div>
      </div>
      <p class="y23-intro__years">2023 — 2024</p>
      <h2 class="y23-intro__title" aria-label="Just ask."><span class="y23-intro__stream" aria-hidden="true"></span></h2>
      <p class="y23-intro__sub">Ask, and an answer comes back.</p>
    </header>`);
  section.appendChild(el);

  const reply = el.querySelector<HTMLElement>('.y23-reply__text')!;
  const title = el.querySelector<HTMLElement>('.y23-intro__stream')!;
  onceInView(
    el,
    async () => {
      await wait(700);
      reply.innerHTML = '';
      await streamInto(
        reply,
        t(
          'Sure! A normal bit is a coin lying flat: heads or tails. A qubit is a coin still spinning, a bit of both until you look.',
          'もちろんです！普通のビットは、机に置いたコインのようなものです。表か裏のどちらかです。量子ビットは回っている最中のコインで、見るまでは表でもあり裏でもあります。',
        ),
        { tps: 22 },
      );
    },
    'top 55%',
  );
  // the headline streams on its own trigger so a fast scroll never lands on an empty title
  onceInView(
    title,
    async () => {
      await streamInto(title, 'Just ask.', { tps: 8, keepCursor: true });
      el.classList.add('is-done');
    },
    'top 88%',
  );
}

/* ---------------- showcase: tool use ---------------- */

const WEATHER = t(
  "It's 18°C and cloudy in Paris. Bring a light jacket.",
  'パリは18°Cでくもりです。薄手の上着があると安心です。',
);

function toolCard(): HTMLElement {
  const el = h(`
    <article class="y23-card y23-card--tool">
      <p class="y23-card__k">02 — Tool use</p>
      <h4 class="y23-card__h">AI started calling functions.</h4>
      <ol class="y23-tool">
        <li><span class="y23-tool__who">user</span><p>${t("What's the weather in Paris?", 'パリの天気は？')}</p></li>
        <li><span class="y23-tool__who y23-tool__who--call">tool_use</span><pre>get_weather({ "city": "Paris" })</pre></li>
        <li><span class="y23-tool__who y23-tool__who--res">tool_result</span><pre>{ "temp_c": 18, "sky": "cloudy" }</pre></li>
        <li><span class="y23-tool__who">assistant</span><p class="y23-tool__ans"></p></li>
      </ol>
    </article>`);
  const steps = Array.from(el.querySelectorAll('li'));
  const ans = el.querySelector<HTMLElement>('.y23-tool__ans')!;
  const run = new Run();
  const loop = async () => {
    const id = run.next();
    const alive = () => run.alive(id);
    while (alive()) {
      steps.forEach((s) => s.classList.remove('is-on'));
      ans.textContent = '';
      await wait(500);
      for (let i = 0; i < 3 && alive(); i++) {
        steps[i].classList.add('is-on');
        await wait(i === 1 ? 1100 : 800);
      }
      if (!alive()) return;
      steps[3].classList.add('is-on');
      await streamInto(ans, WEATHER, { tps: 24, alive });
      await wait(2600);
    }
  };
  if (reducedMotion) {
    steps.forEach((s) => s.classList.add('is-on'));
    ans.textContent = WEATHER;
  } else {
    whenVisible(el, loop, () => run.next());
  }
  return el;
}

/* ---------------- showcase: ✨ buttons ---------------- */

const MAGIC: Record<string, string> = t(
  {
    sum: 'Q3: faster, smaller, hooks everywhere.',
    fun: 'Q3 🚀 speed it up, slim it down, hook ALL the things 🎣',
    tr: 'T3: más rápido, más ligero y todo con hooks.',
  },
  // in Japanese the third button translates into English
  {
    sum: 'Q3: 速く、軽く、全部hooksに。',
    fun: 'Q3 🚀 爆速化・ダイエット・全部hooksでいくぞ 🎣',
    tr: 'Q3: faster pages, a smaller bundle, hooks everywhere.',
  },
);
const ORIGINAL = t(
  'Our Q3 roadmap focuses on improving page performance, reducing the JavaScript bundle size, and migrating the remaining class components to hooks.',
  'Q3のロードマップでは、ページ表示速度の改善、JavaScriptバンドルサイズの削減、残っているクラスコンポーネントのhooksへの移行に注力します。',
);

function magicCard(): HTMLElement {
  const el = h(`
    <article class="y23-card y23-card--magic">
      <p class="y23-card__k">03 — ✨</p>
      <h4 class="y23-card__h">A sparkle button in every app.</h4>
      <p class="y23-magic__text">${ORIGINAL}</p>
      <div class="y23-magic__btns">
        <button type="button" class="y23-ai-btn" data-m="sum">${t('✨ Summarize', '✨ 要約する')}</button>
        <button type="button" class="y23-ai-btn" data-m="fun">${t('✨ Make it fun', '✨ 楽しくする')}</button>
        <button type="button" class="y23-ai-btn" data-m="tr">${t('✨ Translate to Spanish', '✨ 英語に翻訳')}</button>
      </div>
    </article>`);
  const text = el.querySelector<HTMLElement>('.y23-magic__text')!;
  const run = new Run();
  el.querySelectorAll<HTMLButtonElement>('[data-m]').forEach((b) =>
    b.addEventListener('click', async () => {
      const id = run.next();
      text.innerHTML = `<span class="y23-shimmer">${t('Rewriting…', '書き直し中…')}</span>`;
      await wait(800);
      if (!run.alive(id)) return;
      text.textContent = '';
      await streamInto(text, MAGIC[b.dataset.m!], { tps: 24, alive: () => run.alive(id) });
    }),
  );
  return el;
}

/* ---------------- showcase: embeddings ---------------- */

function embCard(): HTMLElement {
  const el = h(`
    <article class="y23-card y23-card--emb">
      <p class="y23-card__k">01 — Embeddings</p>
      <h4 class="y23-card__h">Meaning became coordinates.</h4>
    </article>`);
  mountEmbeddings(el);
  return el;
}

/* ---------------- showcase: RAG ---------------- */

/** The Answer step as it was usually wired in 2023: beg for JSON, strip the fences, parse, and the model opens with "Sure!" anyway. */
const RAG_CODE = [
  t(
    "const reply = await llm(prompt + '\\nRespond ONLY with valid JSON. No prose. Please.');",
    "const reply = await llm(prompt + '\\nJSONのみで回答してください。説明は不要です。お願いします。');",
  ),
  t("// don't touch this. it works.", '// ここ触るな。なぜか動いてる。'),
  "const { answer, sources } = JSON.parse(reply.replace(/```json|```/g, ''));",
];
// V8's JSON.parse wording from mid-2022 on (Chrome, Node 20)
const RAG_ERR = t(
  `SyntaxError: Unexpected token 'S', "Sure! Here"... is not valid JSON`,
  `SyntaxError: Unexpected token 'も', "もちろんです！こちら"... is not valid JSON`,
);

function ragCard(): HTMLElement {
  const el = h(`
    <article class="y23-card y23-card--rag">
      <p class="y23-card__k">04 — RAG</p>
      <h4 class="y23-card__h">Look it up before answering.</h4>
      <div class="y23-rag">
        <div class="y23-rag__st"><div class="y23-rag__vis y23-rag__docs"><i></i><i></i><i></i></div><b>Docs</b><span>handbook.pdf · wiki · tickets</span></div>
        <div class="y23-rag__st"><div class="y23-rag__vis y23-rag__chunks">${'<i></i>'.repeat(8)}</div><b>Chunk</b><span>512 tokens each</span></div>
        <div class="y23-rag__st"><div class="y23-rag__vis y23-rag__vecs"><code>[0.12, −0.53, 0.88,</code><code> 0.07, −0.31, …]</code></div><b>Embed</b><span>1,536 dims</span></div>
        <div class="y23-rag__st"><div class="y23-rag__vis y23-rag__topk">${'<i></i>'.repeat(6)}</div><b>Retrieve</b><span>top-k = 3</span></div>
        <div class="y23-rag__st"><div class="y23-rag__vis y23-rag__ans"><p>${t('Refunds are available within 30 days.', '返金は購入から30日以内であれば可能です。')}<sup>[1]</sup><sup>[2]</sup></p></div><b>Answer</b><span>with citations</span></div>
      </div>
      <pre class="y23-rag__code"><code>${RAG_CODE.map((l) => `<span${l.startsWith('//') ? ' class="c"' : ''}>${esc(l)}</span>`).join('\n')}</code><samp>${esc(RAG_ERR)}</samp></pre>
    </article>`);
  const steps = Array.from(el.querySelectorAll('.y23-rag__st'));
  if (reducedMotion) {
    steps.forEach((s) => s.classList.add('is-on'));
    return el;
  }
  const run = new Run();
  whenVisible(
    el,
    async () => {
      const id = run.next();
      while (run.alive(id)) {
        steps.forEach((s) => s.classList.remove('is-on'));
        await wait(400);
        for (const s of steps) {
          if (!run.alive(id)) return;
          s.classList.add('is-on');
          await wait(850);
        }
        await wait(2400);
      }
    },
    () => run.next(),
  );
  return el;
}

/* ---------------- infra: GPUs ---------------- */

const TOKENS = t(
  [
    ' The',
    ' web',
    ' is',
    ' a',
    ' conversation',
    ' now',
    '.',
    ' Hello',
    '!',
    ' How',
    ' can',
    ' I',
    ' help',
    '?',
    ' Sure',
    ',',
    ' here',
    "'s",
    ' a',
    ' React',
    ' component',
    ' that',
    ' streams',
    ' tokens',
    ' from',
    ' the',
    ' GPU',
    '…',
  ],
  [
    ' Web',
    'は',
    'もう',
    '会話',
    'に',
    'なった',
    '。',
    'こんに',
    'ちは',
    '！',
    '何か',
    'お手',
    '伝い',
    'できる',
    'こと',
    'は',
    'あり',
    'ます',
    'か',
    '？',
    'もちろん',
    'です',
    '、',
    'GPU',
    'から',
    'トーク',
    'ン',
    'を',
    'ストリ',
    'ーミング',
    'する',
    'React',
    'コン',
    'ポー',
    'ネント',
    'は',
    'こちら',
    'です',
    '…',
  ],
);

function gpuPanel(section: HTMLElement): void {
  const rows = [0, 1, 2, 3]
    .map((r) => {
      const toks = TOKENS.slice(r * 3).concat(TOKENS.slice(0, r * 3));
      const line = toks.map((t, i) => `<span${(i + r) % 5 === 0 ? ' class="hot"' : ''}>${esc(t)}</span>`).join('');
      return `<div class="y23-gpu__row" style="--dur:${18 + r * 5}s"><div>${line}${line}</div></div>`;
    })
    .join('');
  let seed = 3;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const racks = Array.from({ length: 8 })
    .map(
      () =>
        `<div class="y23-rack">${Array.from({ length: 10 })
          .map(
            () =>
              `<div class="y23-rack__u">${Array.from({ length: 4 })
                .map(() => `<i style="--d:${(0.6 + rnd() * 1.8).toFixed(2)}s;--o:${(rnd() * 2).toFixed(2)}s"></i>`)
                .join('')}<span></span></div>`,
          )
          .join('')}</div>`,
    )
    .join('');

  const el = h(`
    <section class="y23-infra">
      <header class="y23-h">
        <p class="y23-kicker">Infrastructure</p>
        <h3 class="y23-h__title">The cloud learned to think.</h3>
        <p class="y23-h__jp">The unit of the cloud became the GPU.</p>
      </header>
      <div class="y23-gpu">
        <div class="y23-gpu__stream" aria-hidden="true">${rows}</div>
        <div class="y23-gpu__racks" aria-hidden="true">${racks}</div>
        <div class="y23-gpu__stats">
          <div><b class="y23-gpu__tps">0</b><span>tokens / sec</span></div>
          <div><b>100,000</b><span>GPUs in one cluster</span></div>
          <div><b>80 GB</b><span>HBM per accelerator</span></div>
        </div>
      </div>
    </section>`);
  section.appendChild(el);
  const tps = el.querySelector<HTMLElement>('.y23-gpu__tps')!;
  let v = 1_180_000;
  let last = 0;
  loopWhenVisible(el, (t) => {
    if (t - last < 90) return;
    last = t;
    v += Math.round((Math.random() - 0.35) * 24000);
    tps.textContent = v.toLocaleString('en-US');
  });
}

/* ---------------- bridge: chat → terminal ---------------- */

const ASK = t('Ask anything…', 'なんでも聞いてください…');

function bridge(section: HTMLElement): void {
  const el = h(`
    <div class="y23-bridge">
      <div class="y23-bridge__win">
        <div class="y23-bridge__bar"><i></i><i></i><i></i><span class="y23-bridge__title">Chat</span></div>
        <div class="y23-bridge__body">
          <div class="y23-msg y23-msg--user">${t('Can you just… do it for me?', 'もう…全部やってくれない？')}</div>
          <div class="y23-msg y23-msg--ai">${t('Sure. Give me a terminal.', 'いいですよ。ターミナルをください。')}</div>
        </div>
        <div class="y23-bridge__prompt"><span class="y23-bridge__ps">${ASK}</span><span class="y23-bridge__caret"></span></div>
      </div>
      <p class="y23-bridge__cap">After chat came the terminal.</p>
    </div>`);
  section.appendChild(el);
  const win = el.querySelector<HTMLElement>('.y23-bridge__win')!;
  const ps = el.querySelector<HTMLElement>('.y23-bridge__ps')!;
  const title = el.querySelector<HTMLElement>('.y23-bridge__title')!;
  if (reducedMotion) {
    el.classList.add('is-term');
    ps.textContent = '>';
    title.textContent = '~ — zsh';
    return;
  }
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 65%',
      end: 'bottom 45%',
      scrub: 0.6,
      onUpdate: (self) => {
        const term = self.progress > 0.55;
        el.classList.toggle('is-term', term);
        ps.textContent = term ? '>' : ASK;
        title.textContent = term ? '~ — zsh' : 'Chat';
      },
    },
  });
  tl.to(el.querySelectorAll('.y23-bridge__body .y23-msg'), { opacity: 0, y: -12, stagger: 0.1, duration: 0.3 }, 0)
    .to(win, { borderRadius: 8, backgroundColor: '#0c0c0c', color: '#e6e6e6', duration: 0.5 }, 0.2)
    .to(win, { width: () => Math.min(window.innerWidth - 32, 920), duration: 0.5 }, 0.2)
    .fromTo(el.querySelector('.y23-bridge__cap'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.45);
}

/* ---------------- era ---------------- */

export const era: Era = {
  id: 'y2023',
  years: [2023, 2024],
  label: 'Generative AI',
  theme: { bg: '#f5f3ee', fg: '#1f1e1d', accent: '#d97757', muted: '#6b6862' },
  hudFont: "'Geist', 'Inter', sans-serif",
  servers: { value: 100000, unit: 'GPUs' },
  render(section) {
    intro(section);

    createStage(section, STAGE_2023);
    createCredits(
      section,
      [
        // no logo yet in 2022: the README and the docs wrote it with emoji
        { year: '2022.10', name: '🦜️🔗 LangChain', line: 'Chain your prompts together.' },
        { year: '2023.03', name: 'Claude', line: 'Helpful, honest, harmless — by design.' },
        { year: '2023.03', name: 'shadcn/ui', icon: siShadcnui, line: 'Don’t install it. Copy it, and make it yours.' },
        { year: '2023.06', name: 'Vercel AI SDK', icon: siVercel, line: 'Streaming UI in a few lines.' },
        { year: '2023.07', name: 'Llama 2', icon: siMeta, line: 'The weights landed on your machine.' },
        { year: '2023.12', name: 'Gemini', line: 'Text and images, together from the start.' },
      ],
      'Also starring — 2023–2024',
    );

    const show = h(`
      <section class="y23-show">
        <header class="y23-h y23-h--book">
          <div>
            <p class="y23-kicker">Showcase</p>
            <h3 class="y23-h__title">Every interface learned to talk.</h3>
            <p class="y23-h__jp">Search by meaning, call tools, cite sources.</p>
          </div>
          <div class="y23-book">
            ${parodyBook({
              title: 'Copying and Pasting from ChatGPT',
              subtitle: 'Now with more confidence',
              band: '#10a37f',
              animal: 'robot',
              edition: '2nd Edition',
            })}
            <small>Same habit. New source.</small>
          </div>
        </header>
        <div class="y23-grid"></div>
      </section>`);
    section.appendChild(show);
    const grid = show.querySelector<HTMLElement>('.y23-grid')!;
    grid.append(embCard(), toolCard(), magicCard(), ragCard());

    gpuPanel(section);

    createThread(section, 'y2023');

    const ship = h(`
      <section class="y23-ship">
        <header class="y23-h">
          <p class="y23-kicker">Deploy</p>
          <h3 class="y23-h__title">One API key away.</h3>
          <p class="y23-h__jp">Add one key, and it’s an AI app.</p>
        </header>
      </section>`);
    section.appendChild(ship);
    createDeploy(ship, {
      label: '✨ Deploy',
      title: 'zsh — my-ai-app',
      steps: [
        { kind: 'cmd', text: 'vercel env add ANTHROPIC_API_KEY production' },
        { kind: 'out', text: "? What's the value of ANTHROPIC_API_KEY? ••••••••••••••••••••", delay: 400 },
        { kind: 'ok', text: '✓ Added Environment Variable ANTHROPIC_API_KEY to Project my-ai-app' },
        { kind: 'cmd', text: 'vercel deploy --prod' },
        { kind: 'out', text: '🔍 Inspect: https://vercel.com/you/my-ai-app/9xQ2…' },
        { kind: 'progress', text: 'Building', delay: 1400 },
        { kind: 'out', text: '├ λ /api/chat                    0 B          0 B' },
        { kind: 'ok', text: '✅ Production: https://my-ai-app.vercel.app [31s]' },
      ],
      doneLabel: '✨ Shipped',
    });
    ship.appendChild(appRouterCard());
    createStack(ship, [
      { cat: 'Frontend', prev: 'Next.js / Vite', value: 'Next.js App Router + shadcn/ui' },
      { cat: 'Language', prev: 'TypeScript + Zod', value: 'TypeScript + Python' },
      { cat: 'CSS / UI', prev: 'Tailwind CSS (JIT)', value: 'Tailwind + shadcn/ui' },
      { cat: 'Build', prev: 'Vite / esbuild', value: 'Vite / Turbopack' },
      { cat: 'Backend', prev: 'tRPC / Edge Functions', value: 'LLM APIs + Hono' },
      { cat: 'Database', prev: 'Supabase / PlanetScale', value: 'pgvector / Vector DB' },
      { cat: 'Infra', prev: 'Vercel / Cloudflare Workers', value: 'GPU cloud / Bedrock' },
      { cat: 'Dev', prev: 'VS Code + Copilot', value: 'Cursor' },
      { cat: 'AI', prev: 'GitHub Copilot', value: 'GPT-4 / Claude 3' },
    ]);

    bridge(section);
  },
};
