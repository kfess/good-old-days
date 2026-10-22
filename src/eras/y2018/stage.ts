import { siReact, siTailwindcss, siVuedotjs } from 'simple-icons';
import { logo } from '../../components/logo';
import { angularShield } from '../../components/marks';
import { type StageScene, scrubType } from '../../components/stage';
import { t } from '../../core/i18n';
import { MOBILE_QUERY } from '../../core/scroll';
import { esc } from '../../core/util';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/** brand mark floating in a soft gradient glow */
const glow = (icon: Parameters<typeof logo>[0], c: string) =>
  `<span class="y18-glow" style="--c:${c}"><i></i>${logo(icon)}</span>`;

/** move the big logo out of the way once the scene has entered */
function park(
  tl: gsap.core.Timeline,
  el: HTMLElement,
  desk: [number, number],
  mob: [number, number] = [0, -105],
  at = 0,
): void {
  tl.to(
    el,
    {
      xPercent: () => (mobile() ? mob[0] : desk[0]),
      yPercent: () => (mobile() ? mob[1] : desk[1]),
      scale: () => (mobile() ? 0.34 : 0.4),
      duration: 0.5,
      ease: 'power2.inOut',
    },
    at,
  );
}

/* ---------------- TypeScript ---------------- */

const ROUTES = [
  { name: 'React', icon: siReact },
  { name: 'Angular', icon: angularShield },
  { name: 'Vue', icon: siVuedotjs },
] as const;

const typescript: StageScene = {
  year: '2018',
  name: 'TypeScript',
  kicker: 'JavaScript that scales',
  line: 'The typo that shipped in JavaScript, caught before it ever ran.',
  className: 'y18-scene y18-scene--ts',
  // the square "TS" mark and #3178c6 came with the 2020 rebrand; 2018 TypeScript had only its name, in #007acc
  logo: glow('TS', '#007acc'),
  length: 1.4,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y18-ts__merge">
        <p class="y18-ts__lead">React, Angular, Vue →</p>
        <div class="y18-ts__routes">${ROUTES.map((r) => `<span>${logo(r.icon, 'current')}${r.name}</span>`).join('')}</div>
      </div>
      <div class="y18-ed">
        <div class="y18-ed__tabs"><span class="y18-ed__file">user<b class="y18-ed__ext">.js</b></span></div>
        <pre class="y18-ed__code"><code><span class="y18-ed__iface"></span><span class="k">async function</span> <span class="f">getUser</span>(<span class="sq" data-msg="Parameter 'id' implicitly has an 'any' type. ts(7006)">id</span><span class="t a1"></span>)<span class="t a2"></span> {
  <span class="k">const</span> res = <span class="k">await</span> fetch(<span class="s">\`/api/users/\${id}\`</span>);
  <span class="k">const</span> user<span class="t a3"></span> = <span class="k">await</span> res.json();
  <span class="k">return</span> user.name.<span class="sq y18-ed__typo" data-msg="Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'? ts(2551)">toUppercase</span>();
}</code></pre>
        <div class="y18-ed__tip"></div>
        <div class="y18-ed__console"><b>production · console</b>Uncaught (in promise) TypeError: user.name.toUppercase is not a function</div>
        <div class="y18-ed__status"><span class="y18-ed__count">0</span> <span class="y18-ed__label">problems</span></div>
      </div>`;

    const routes = Array.from(art.querySelectorAll<HTMLElement>('.y18-ts__routes span'));
    const ed = art.querySelector<HTMLElement>('.y18-ed')!;
    const ext = art.querySelector<HTMLElement>('.y18-ed__ext')!;
    const sqs = Array.from(art.querySelectorAll<HTMLElement>('.sq'));
    const [sqId, sqTypo] = sqs;
    const tip = art.querySelector<HTMLElement>('.y18-ed__tip')!;
    const consoleEl = art.querySelector<HTMLElement>('.y18-ed__console')!;
    const count = art.querySelector<HTMLElement>('.y18-ed__count')!;
    const label = art.querySelector<HTMLElement>('.y18-ed__label')!;
    const status = art.querySelector<HTMLElement>('.y18-ed__status')!;
    const typo = art.querySelector<HTMLElement>('.y18-ed__typo')!;
    sqs.forEach((s) => s.style.setProperty('--sq', '0'));

    // 1. every framework converges on TypeScript
    tl.from(art.querySelector('.y18-ts__merge'), { opacity: 0, y: 30, duration: 0.3 }, 0);
    tl.to(
      routes,
      {
        x: () => (mobile() ? 0 : window.innerWidth * 0.3),
        y: (i) => (mobile() ? 0 : (1 - i) * 30),
        scale: 0.6,
        opacity: 0,
        stagger: 0.06,
        duration: 0.45,
        ease: 'power2.in',
      },
      0.45,
    );
    tl.to(art.querySelector('.y18-ts__merge'), { opacity: 0, duration: 0.2 }, 0.9);
    park(tl, mark, [-128, -62], [0, -105], 0.85);

    // 2. plain JavaScript: the editor reports nothing, and the typo ships to production
    tl.from(ed, { opacity: 0, y: 40, duration: 0.3 }, 0.9);
    tl.fromTo(consoleEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.15 }, 1.15);
    tl.to(consoleEl, { opacity: 0, duration: 0.12 }, 1.6);

    // 3. rename to .ts (strict): only the untyped parameter is flagged
    scrubType(tl, ext, '.ts', 0.12, 1.65);
    tl.to(sqId, { '--sq': 1, duration: 0.1 }, 1.8);
    scrubType(tl, art.querySelector<HTMLElement>('.a1')!, ': number', 0.15, 2.05);
    tl.to(sqId, { '--sq': 0, duration: 0.1 }, 2.22);

    // 4. give the response a type, and the compiler finds the bug that shipped
    const iface = art.querySelector<HTMLElement>('.y18-ed__iface')!;
    scrubType(tl, iface, 'interface User { id: number; name: string }\n\n', 0.4, 2.3);
    scrubType(tl, art.querySelector<HTMLElement>('.a2')!, ': Promise<string>', 0.2, 2.72);
    scrubType(tl, art.querySelector<HTMLElement>('.a3')!, ': User', 0.12, 2.94);
    tl.to(sqTypo, { '--sq': 1, duration: 0.1 }, 3.08);
    tl.to(sqTypo, { '--sq': 0, duration: 0.1 }, 3.55);
    tl.to({}, { duration: 0.5 });

    // the counter, the tooltip text and the c→C fix follow the squiggles' state
    let wasFixed: boolean | null = null;
    tl.eventCallback('onUpdate', () => {
      const live = sqs.filter((s) => parseFloat(s.style.getPropertyValue('--sq') || '0') > 0.5);
      count.textContent = String(live.length);
      label.textContent = live.length === 1 ? 'problem' : 'problems';
      status.classList.toggle('is-clean', live.length === 0 && tl.time() > 2.2);
      status.classList.toggle('is-idle', live.length === 0 && tl.time() <= 2.2);
      tip.textContent = live.length ? (live[live.length - 1].dataset.msg ?? '') : '';
      const fixed = tl.time() > 3.45;
      if (fixed !== wasFixed) {
        wasFixed = fixed;
        typo.innerHTML = fixed ? 'toUpper<b class="y18-ed__fix">C</b>ase' : 'toUppercase';
      }
    });
  },
};

/* ---------------- React Hooks ---------------- */

const CLASS_LINES = [
  'class Counter extends React.Component {',
  '  constructor(props) {',
  '    super(props);',
  '    this.state = { count: 0 };',
  '    this.increment = this.increment.bind(this);',
  '  }',
  '  componentDidMount() {',
  '    document.title = `Clicked ${this.state.count} times`;',
  '  }',
  '  componentDidUpdate() {',
  '    document.title = `Clicked ${this.state.count} times`;',
  '  }',
  '  increment() {',
  '    this.setState({ count: this.state.count + 1 });',
  '  }',
  '  render() {',
  '    return <button onClick={this.increment}>Clicked {this.state.count} times</button>;',
  '  }',
  '}',
];

const HOOK_LINES = [
  'function Counter() {',
  '  const [count, setCount] = useState(0);',
  '  useEffect(() => { document.title = `Clicked ${count} times`; });',
  '  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;',
  '}',
];

const hooks: StageScene = {
  year: '2019.02',
  name: 'React Hooks',
  kicker: 'Goodbye, this',
  line: 'Classes became optional. Back to functions.',
  className: 'y18-scene y18-scene--hooks',
  logo: glow(siReact, '#61dafb'),
  length: 1.2,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <div class="y18-hk">
        <div class="y18-hk__bar"><span>Counter.jsx</span><b class="y18-hk__lines">${CLASS_LINES.length} lines</b></div>
        <div class="y18-hk__code">
          <div class="y18-hk__old">${CLASS_LINES.map((l) => `<div class="y18-hk__l">${esc(l) || '&nbsp;'}</div>`).join('')}</div>
          <div class="y18-hk__new">${HOOK_LINES.map(() => '<div class="y18-hk__l"></div>').join('')}</div>
        </div>
        <div class="y18-hk__out"><span class="y18-hk__btn">Clicked <b>0</b> times</span></div>
      </div>`;

    const box = art.querySelector<HTMLElement>('.y18-hk__code')!;
    const old = Array.from(art.querySelectorAll<HTMLElement>('.y18-hk__old .y18-hk__l'));
    const neu = Array.from(art.querySelectorAll<HTMLElement>('.y18-hk__new .y18-hk__l'));
    const lines = art.querySelector<HTMLElement>('.y18-hk__lines')!;
    const btnCount = art.querySelector<HTMLElement>('.y18-hk__btn b')!;

    tl.to(mark, { rotate: 360, duration: 3.4, ease: 'none' }, 0);
    park(tl, mark, [-118, -60]);
    tl.from(art.querySelector('.y18-hk'), { opacity: 0, y: 40, duration: 0.35 }, 0.2);

    // the class component flies apart, line by line
    const kill = old.map((_, i) => i).sort((a, b) => ((a * 7) % 19) - ((b * 7) % 19));
    kill.forEach((idx, k) => {
      const dir = idx % 2 ? 1 : -1;
      tl.to(
        old[idx],
        {
          x: () => dir * (mobile() ? 260 : 380 + (idx % 5) * 70),
          y: () => ((idx % 3) - 1) * 60,
          rotate: dir * (8 + (idx % 4) * 6),
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
        },
        0.85 + k * 0.03,
      );
    });
    // phones wrap the long lines, so measure the finished function rather than the still-empty lines
    const fullHeight = () => {
      const probe = art.querySelector<HTMLElement>('.y18-hk__new')!.cloneNode(true) as HTMLElement;
      probe.querySelectorAll('.y18-hk__l').forEach((l, i) => (l.textContent = HOOK_LINES[i]));
      probe.style.visibility = 'hidden';
      box.appendChild(probe);
      const hgt = probe.offsetHeight;
      probe.remove();
      return hgt + 8;
    };
    tl.to(box, { height: fullHeight, duration: 0.4, ease: 'power3.inOut' }, 1.35);
    const n = { v: CLASS_LINES.length };
    tl.to(
      n,
      {
        v: HOOK_LINES.length,
        duration: 0.5,
        ease: 'power1.inOut',
        onUpdate: () => (lines.textContent = `${Math.round(n.v)} lines`),
      },
      1.1,
    );

    // and comes back as a function
    HOOK_LINES.forEach((l, i) => scrubType(tl, neu[i], l, 0.18 + l.length / 300, 1.65 + i * 0.22));
    tl.from(art.querySelector('.y18-hk__out'), { height: 0, opacity: 0, duration: 0.25 }, 2.7);
    const c = { v: 0 };
    tl.to(
      c,
      { v: 3, duration: 0.6, ease: 'steps(3)', onUpdate: () => (btnCount.textContent = String(Math.round(c.v))) },
      2.9,
    );
    tl.to({}, { duration: 0.3 });
  },
};

/* ---------------- Tailwind CSS ---------------- */

interface Tok {
  line: number;
  cls: string;
  /** which preview node the class lands on */
  on: 'card' | 'av' | 'btn';
}

const TW_LINES: { open: string; close: string; toks: string[]; on: Tok['on'] }[] = [
  {
    open: '<div class="',
    close: '">',
    toks: ['flex', 'items-center', 'p-6', 'rounded-lg', 'bg-indigo-500', 'text-white', 'shadow-xl'],
    on: 'card',
  },
  {
    open: '  <img class="',
    close: '" />',
    toks: ['w-16', 'h-16', 'mr-4', 'rounded-full', 'border-4', 'border-white'],
    on: 'av',
  },
  {
    open: '  <button class="',
    close: '">',
    toks: ['ml-auto', 'rounded-full', 'bg-white', 'px-4', 'py-2', 'text-indigo-600'],
    on: 'btn',
  },
];

/** One developer's take on utility classes, a month apart. */
const TW_TAKES: [string, string][] = t(
  [
    ['May 2019', 'Ew. That’s just inline styles with extra steps. Who would write HTML this ugly?'],
    ['Jun 2019', '…okay. I’m never writing a CSS file again. (Still ugly, though.)'],
  ],
  [
    ['May 2019', 'インラインスタイルで書いてるだけやろ。こんな汚いHTML誰が書くねん'],
    ['Jun 2019', '……はい。もうこれでいいわ（汚いけど）'],
  ],
);

const tailwind: StageScene = {
  year: '2019.05',
  name: 'Tailwind CSS',
  kicker: 'Utility-first',
  line: 'The whole design, in the class attribute.',
  className: 'y18-scene y18-scene--tw',
  // v1 (2019) drew the wave in a teal gradient and sky blue arrived with v2 (2020.11): the mark stays
  // plain white rather than recoloured, and only the glow carries the v1 teal
  logo: glow(logo(siTailwindcss, 'current'), '#17b8ba'),
  length: 1.5,
  play({ art, logo: mark, tl }) {
    art.innerHTML = `
      <pre class="y18-tw__code"><code>${TW_LINES.map((_, i) => `<span class="y18-tw__line" data-l="${i}"></span>`).join('')}</code></pre>
      <div class="y18-tw__stage">
        <div class="y18-tw__el" data-n="card">
          <span class="y18-tw__av" data-n="av"></span>
          <span class="y18-tw__who"><b>Ada Lovelace</b><small>Staff Engineer</small></span>
          <span class="y18-tw__btn" data-n="btn">Follow</span>
        </div>
      </div>
      ${TW_TAKES.map(
        ([when, text], i) => `
      <figure class="y18-tw__take" data-t="${i}">
        <i class="y18-tw__face" aria-hidden="true"></i>
        <figcaption><b>${t('Frontend dev', 'フロントエンドエンジニア')}</b> <span>· ${esc(when)}</span></figcaption>
        <p>${esc(text)}</p>
      </figure>`,
      ).join('')}`;

    const toks: Tok[] = TW_LINES.flatMap((l, line) => l.toks.map((cls) => ({ line, cls, on: l.on })));
    const lineEls = Array.from(art.querySelectorAll<HTMLElement>('.y18-tw__line'));
    const nodes = {
      card: art.querySelector<HTMLElement>('[data-n="card"]')!,
      av: art.querySelector<HTMLElement>('[data-n="av"]')!,
      btn: art.querySelector<HTMLElement>('[data-n="btn"]')!,
    };
    const total = toks.reduce((s, t) => s + t.cls.length + 1, 0);

    // the glowing logo bows out instead of parking: the utility classes are the star of this scene
    park(tl, mark, [0, 78], [0, -105]);
    tl.to(mark, { opacity: 0, duration: 0.3 }, 0.2);
    tl.from(
      [art.querySelector('.y18-tw__code'), art.querySelector('.y18-tw__stage')],
      { opacity: 0, y: 40, stagger: 0.1, duration: 0.3 },
      0.25,
    );
    const p = { n: 0 };
    tl.to(
      p,
      {
        n: total,
        duration: 2.4,
        ease: 'none',
        onUpdate: () => {
          let left = Math.round(p.n);
          const typed: string[][] = TW_LINES.map(() => []);
          const on = { card: [] as string[], av: [] as string[], btn: [] as string[] };
          let partial = -1;
          for (const t of toks) {
            if (left <= 0) break;
            const take = Math.min(left, t.cls.length);
            typed[t.line].push(t.cls.slice(0, take));
            if (take === t.cls.length) on[t.on].push(`tw-${t.cls.replace(/[/.]/g, '_')}`);
            else partial = t.line;
            left -= t.cls.length + 1;
          }
          lineEls.forEach((el, i) => {
            const l = TW_LINES[i];
            const started = typed[i].length > 0 || i === 0;
            el.innerHTML = started
              ? `<span class="tg">${esc(l.open)}</span><span class="cl">${esc(typed[i].join(' '))}</span>${partial === i || (i === lastLine(typed) && p.n < total) ? '<i class="y18-tw__caret"></i>' : ''}<span class="tg">${esc(l.close)}</span>`
              : '';
          });
          (Object.keys(nodes) as Tok['on'][]).forEach((k) => {
            nodes[k].className = nodes[k].className
              .split(' ')
              .filter((c) => !c.startsWith('tw-'))
              .concat(on[k])
              .join(' ');
          });
        },
      },
      0.55,
    );
    // the reaction everyone had, and the reaction everyone had a month later
    const [ugh, fine] = Array.from(art.querySelectorAll<HTMLElement>('.y18-tw__take'));
    tl.fromTo(ugh, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2, ease: 'back.out(2)' }, 1.25);
    tl.to(ugh, { opacity: 0, y: -10, duration: 0.15 }, 2.95);
    tl.fromTo(fine, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.2, ease: 'back.out(2)' }, 3.05);
    tl.to({}, { duration: 0.45 });
  },
};

function lastLine(typed: string[][]): number {
  for (let i = typed.length - 1; i >= 0; i--) if (typed[i].length) return i;
  return 0;
}

export const STAGE_2018: StageScene[] = [typescript, hooks, tailwind];
