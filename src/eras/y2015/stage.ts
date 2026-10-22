import { type SimpleIcon, siJavascript, siWebpack } from 'simple-icons';
import { type StageScene, scrubType } from '../../components/stage';
import { MOBILE_QUERY } from '../../core/scroll';
import { esc } from '../../core/util';
import { k8sMark } from '../y2018/k8s-logo';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/** A brand mark printed on a sheet of Material paper: a white disc at 8dp. */
function paperDisc(icon: SimpleIcon, color = `#${icon.hex}`): string {
  return `<span class="y15-disc"><svg class="y15-disc__mark" viewBox="0 0 24 24" fill="${color}" aria-hidden="true"><path d="${icon.path}"/></svg></span>`;
}

/* ---------------- ES2015: the old code rearranges itself into the new syntax ---------------- */

type Pos = [row: number, col: number];
// [text, where it sits in ES5, where it lands in ES2015, kind]; null = removed / added
const TOKENS: [string, Pos | null, Pos | null, 'kw' | 'str' | 'id' | 'pn'][] = [
  ['var', [0, 0], null, 'kw'],
  ['const', null, [0, 0], 'kw'],
  ['greet', [0, 4], [0, 6], 'id'],
  ['=', [0, 10], [0, 12], 'pn'],
  ['function', [0, 12], null, 'kw'],
  ['(name)', [0, 21], [0, 14], 'id'],
  ['{', [0, 28], null, 'pn'],
  ['=>', null, [0, 21], 'kw'],
  ['return', [1, 2], null, 'kw'],
  ["'", [1, 9], null, 'str'],
  ['`', null, [1, 2], 'str'],
  ['Hello,', [1, 10], [1, 3], 'str'],
  ["'", [1, 17], null, 'str'],
  ['+', [1, 19], null, 'pn'],
  ['${', null, [1, 10], 'str'],
  ['name', [1, 21], [1, 12], 'id'],
  ['}', null, [1, 16], 'str'],
  ['+', [1, 26], null, 'pn'],
  ["'", [1, 28], null, 'str'],
  ['!', [1, 29], [1, 17], 'str'],
  ["'", [1, 30], null, 'str'],
  ['`', null, [1, 18], 'str'],
  [';', [1, 31], [1, 19], 'pn'],
  ['};', [2, 0], null, 'pn'],
];
const LH = 1.7;

const es2015: StageScene = {
  year: '2015.06',
  name: 'ES2015',
  kicker: 'ECMAScript 6',
  line: 'let, const, arrow functions. JavaScript grew up.',
  className: 'y15-scene y15-scene--es',
  logo: paperDisc(siJavascript),
  length: 1.4,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <div class="y15-es__card">
        <p class="y15-es__file"><span class="y15-es__tab is-old">app.es5.js</span><span class="y15-es__tab is-new">app.js</span></p>
        <div class="y15-es__code">
          ${TOKENS.map(([text, from, to, kind], i) => {
            const p = from ?? to!;
            return `<span class="y15-tok y15-tok--${kind}${from ? '' : ' is-add'}${to ? '' : ' is-del'}" data-i="${i}" style="left:${p[1]}ch;top:${p[0] * LH}em">${esc(text)}</span>`;
          }).join('')}
        </div>
      </div>
      <div class="y15-es__chips">${['const / let', '() =>', '`${template}`', 'class', 'import'].map((c) => `<span class="y15-chip">${esc(c)}</span>`).join('')}</div>`;
    const toks = Array.from(art.querySelectorAll<HTMLElement>('.y15-tok'));
    const dels = toks.filter((t) => t.classList.contains('is-del'));
    const adds = toks.filter((t) => t.classList.contains('is-add'));
    const keeps = toks.filter((t) => !t.classList.contains('is-del') && !t.classList.contains('is-add'));

    tl.to(
      logo,
      {
        xPercent: () => (mobile() ? 62 : 128),
        yPercent: () => (mobile() ? -128 : -18),
        scale: () => (mobile() ? 0.3 : 0.62),
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.y15-es__card'), { opacity: 0, y: 40, duration: 0.3, ease: 'power2.out' }, 0.15);
    tl.set(adds, { opacity: 0, scale: 0 }, 0);
    // the doomed tokens get struck through, then fall off the card
    tl.to(dels, { color: '#f44336', '--strike': 1, duration: 0.25, stagger: 0.015 }, 0.45);
    dels.forEach((d, k) =>
      tl.to(
        d,
        {
          y: () => (mobile() ? 90 : 160),
          x: (k % 2 ? 1 : -1) * (10 + (k % 5) * 8),
          rotate: (k % 2 ? 1 : -1) * (20 + k * 7),
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
        },
        0.85 + k * 0.012,
      ),
    );
    tl.to(art.querySelector('.is-old'), { opacity: 0.4, borderBottomColor: 'rgba(255,64,129,0)', duration: 0.2 }, 0.9);
    tl.to(art.querySelector('.is-new'), { opacity: 1, borderBottomColor: 'rgba(255,64,129,1)', duration: 0.2 }, 1.05);
    tl.to(art.querySelector('.y15-es__code'), { height: `${2 * LH}em`, duration: 0.45, ease: 'power3.inOut' }, 1.2);
    // survivors slide to their ES2015 positions
    keeps.forEach((k) => {
      const to = TOKENS[Number(k.dataset.i)][2]!;
      tl.to(k, { left: `${to[1]}ch`, top: `${to[0] * LH}em`, duration: 0.55, ease: 'power3.inOut' }, 1.05);
    });
    tl.to(adds, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(2.4)' }, 1.5);
    tl.to(adds, { backgroundColor: 'rgba(76,175,80,0)', duration: 0.4 }, 2.0);
    tl.from(
      art.querySelectorAll('.y15-chip'),
      { opacity: 0, y: 16, scale: 0.8, stagger: 0.08, duration: 0.25, ease: 'back.out(2)' },
      1.95,
    );
    tl.to({}, { duration: 0.35 });
  },
};

/* ---------------- webpack: a dependency graph collapses into one bundle.js ---------------- */

type Node = [name: string, x: number, y: number, parent: number, type: 'js' | 'jsx' | 'css' | 'svg' | 'npm'];
const GRAPH: Node[] = [
  ['index.js', 50, 4, -1, 'js'],
  ['App.jsx', 22, 30, 0, 'jsx'],
  ['store.js', 50, 30, 0, 'js'],
  ['polyfills.js', 78, 30, 0, 'js'],
  ['Header.jsx', 7, 58, 1, 'jsx'],
  ['Feed.jsx', 24, 64, 1, 'jsx'],
  ['react', 38, 56, 1, 'npm'],
  ['redux', 50, 62, 2, 'npm'],
  ['reducers.js', 63, 56, 2, 'js'],
  ['core-js', 78, 62, 3, 'npm'],
  ['whatwg-fetch', 93, 56, 3, 'npm'],
  ['logo.svg', 5, 90, 4, 'svg'],
  ['Button.jsx', 20, 94, 5, 'jsx'],
  ['feed.css', 34, 90, 5, 'css'],
  ['lodash', 54, 92, 8, 'npm'],
  ['moment', 70, 90, 8, 'npm'],
  ['react-dom', 88, 92, 0, 'npm'],
];
const TYPE_LABEL = { js: 'JS', jsx: 'JSX', css: 'CSS', svg: 'SVG', npm: 'npm' };

const webpack: StageScene = {
  year: '2017.01',
  name: 'webpack 2',
  kicker: 'ES modules · tree shaking',
  line: 'Every dependency, into one bundle.js.',
  className: 'y15-scene y15-scene--wp',
  logo: paperDisc(siWebpack, '#1c78c0'),
  length: 1.4,
  play({ art, logo, tl }) {
    const depth = (i: number): number => (GRAPH[i][3] < 0 ? 0 : 1 + depth(GRAPH[i][3]));
    art.innerHTML = `
      <div class="y15-wp__cmd"><code class="y15-wp__typed"></code></div>
      <div class="y15-wp__graph">
        <svg class="y15-wp__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${GRAPH.map(([, x, y, p], i) => (p < 0 ? '' : `<line data-i="${i}" x1="${GRAPH[p][1]}" y1="${GRAPH[p][2]}" x2="${x}" y2="${y}"/>`)).join('')}
        </svg>
        ${GRAPH.map(([name, x, y, , type], i) => `<span class="y15-node y15-node--${type}" data-d="${depth(i)}" style="left:${x}%;top:${y}%"><i>${TYPE_LABEL[type]}</i>${esc(name)}</span>`).join('')}
        <div class="y15-wp__bundle"><i>JS</i><b>bundle.js</b><span class="y15-wp__size">0 KB</span><em>minified · gzip</em></div>
      </div>
      <figure class="y15-heavy" aria-label="Heaviest objects in the universe: Sun, neutron star, black hole, node_modules">
        <figcaption>Heaviest objects in the universe</figcaption>
        <p><span>Sun</span><i style="--w:6%"></i></p>
        <p><span>Neutron star</span><i style="--w:16%"></i></p>
        <p><span>Black hole</span><i style="--w:38%"></i></p>
        <p class="is-nm"><span>node_modules</span><i style="--w:100%"></i></p>
      </figure>`;
    const nodes = Array.from(art.querySelectorAll<HTMLElement>('.y15-node'));
    const lines = Array.from(art.querySelectorAll<SVGLineElement>('.y15-wp__lines line'));
    const size = art.querySelector<HTMLElement>('.y15-wp__size')!;

    // on phones the parked logo would cover the command bar, so it bows out (the name stays on screen)
    tl.to(
      logo,
      {
        xPercent: () => (mobile() ? 62 : 150),
        yPercent: () => (mobile() ? -128 : 72),
        scale: () => (mobile() ? 0.3 : 0.34),
        opacity: () => (mobile() ? 0 : 1),
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.y15-wp__cmd'), { opacity: 0, y: 16, duration: 0.2 }, 0.1);
    scrubType(
      tl,
      art.querySelector<HTMLElement>('.y15-wp__typed')!,
      '$ webpack -p --config webpack.config.js',
      0.5,
      0.15,
    );
    // the graph grows level by level from the entry point
    for (let d = 0; d <= 3; d++) {
      const at = 0.3 + d * 0.22;
      tl.from(
        nodes.filter((n) => n.dataset.d === String(d)),
        { scale: 0, opacity: 0, duration: 0.25, stagger: 0.03, ease: 'back.out(2)' },
        at,
      );
      // edges into level d (the entry point at level 0 has none)
      const into = lines.filter((l) => depth(Number(l.dataset.i)) === d);
      if (into.length) tl.fromTo(into, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'none' }, at - 0.08);
    }
    // ...then everything is pulled into the middle and compressed
    const pull = 1.35;
    tl.to(
      nodes,
      {
        left: '50%',
        top: '50%',
        scale: 0.3,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
        stagger: { each: 0.012, from: 'edges' },
      },
      pull,
    );
    tl.to(lines, { attr: { x1: 50, y1: 50, x2: 50, y2: 50 }, opacity: 0, duration: 0.45, ease: 'power3.in' }, pull);
    tl.fromTo(
      art.querySelector('.y15-wp__bundle'),
      { scale: 0.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' },
      pull + 0.45,
    );
    const kb = { v: 0 };
    tl.to(
      kb,
      {
        v: 1240,
        duration: 0.3,
        ease: 'power1.out',
        onUpdate: () => (size.textContent = kb.v >= 1000 ? `${(kb.v / 1000).toFixed(2)} MB` : `${Math.round(kb.v)} KB`),
      },
      pull + 0.55,
    );
    tl.to(
      kb,
      { v: 312, duration: 0.3, ease: 'power2.inOut', onUpdate: () => (size.textContent = `${Math.round(kb.v)} KB`) },
      pull + 0.95,
    );
    tl.to(art.querySelector('.y15-wp__bundle em'), { opacity: 1, duration: 0.2 }, pull + 0.95);
    // easter egg: the meme scale of things
    tl.fromTo(art.querySelector('.y15-heavy'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 }, pull + 1.1);
    tl.fromTo(
      art.querySelectorAll('.y15-heavy i'),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.25, stagger: 0.07, ease: 'power2.out' },
      pull + 1.15,
    );
    tl.to({}, { duration: 0.3 });
  },
};

/* ---------------- Kubernetes 1.0: a teaser for 2018 ---------------- */

// Kubernetes 1.0 (July 2015): GCE clusters named their nodes "kubernetes-minion-*",
// `kubectl get nodes` printed a LABELS column, and `kubectl run` created a ReplicationController.
const MINIONS = ['kubernetes-minion-1b2x', 'kubernetes-minion-7f4q', 'kubernetes-minion-k9wd'];
// columns padded like kubectl's tabwriter: widest cell + 3 spaces
const T_NODES = [
  `${'NAME'.padEnd(MINIONS[0].length + 3)}${'LABELS'.padEnd(`kubernetes.io/hostname=${MINIONS[0]}`.length + 3)}STATUS`,
  ...MINIONS.map((m) => `${m}   kubernetes.io/hostname=${m}   Ready`),
];
const T_RUN = [
  'CONTROLLER   CONTAINER(S)   IMAGE(S)   SELECTOR       REPLICAS',
  'my-nginx     my-nginx       nginx      run=my-nginx   6',
];

const kubernetes: StageScene = {
  year: '2015.07',
  name: 'Kubernetes',
  kicker: 'v1.0 · Container orchestration',
  line: 'Containers got a conductor.',
  className: 'y15-scene y15-scene--k8s',
  logo: `<span class="y15-k8mark">${k8sMark('is-spin')}</span>`,
  length: 1.7,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <div class="y15-kt">
        <div class="y15-kt__grid" aria-hidden="true"></div>
        <div class="y15-kt__term">
          <p class="y15-kt__cmd">$ <span data-c="0"></span></p>
          ${T_NODES.map((l) => `<p class="y15-kt__out" data-o="0">${esc(l)}</p>`).join('')}
          <p class="y15-kt__cmd">$ <span data-c="1"></span></p>
          ${T_RUN.map((l) => `<p class="y15-kt__out" data-o="1">${esc(l)}</p>`).join('')}
        </div>
        <div class="y15-kt__nodes">
          ${MINIONS.map((m) => `<div class="y15-kt__node"><b>${m}</b><div class="y15-kt__pods"><i></i><i></i></div><span>Ready</span></div>`).join('')}
        </div>
        <p class="y15-kt__next">To be continued in <b>2018</b> →</p>
      </div>`;
    const panel = art.querySelector<HTMLElement>('.y15-kt')!;
    const nodes = Array.from(art.querySelectorAll<HTMLElement>('.y15-kt__node'));
    const pods = Array.from(art.querySelectorAll<HTMLElement>('.y15-kt__pods i'));

    // the logo moves into the dark panel's corner; the panel opens like a window onto 2018
    tl.to(
      logo,
      {
        x: () => -(window.innerWidth / 2 - window.innerWidth * (mobile() ? 0.2 : 0.16)),
        // the stage logo sits at 50% height on desktop, 40% on phones
        y: () => (mobile() ? -window.innerHeight * 0.2 : -(window.innerHeight / 2 - window.innerHeight * 0.24)),
        scale: () => (mobile() ? 0.3 : 0.42),
        duration: 0.45,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.fromTo(
      panel,
      { clipPath: 'inset(48% 48% 48% 48% round 28px)', opacity: 0 },
      { clipPath: 'inset(0% 0% 0% 0% round 28px)', opacity: 1, duration: 0.5, ease: 'power3.inOut' },
      0.05,
    );
    tl.to(logo, { '--glow': 1, duration: 0.3 }, 0.4);

    scrubType(tl, art.querySelector<HTMLElement>('[data-c="0"]')!, 'kubectl get nodes', 0.25, 0.55);
    tl.from(art.querySelectorAll('[data-o="0"]'), { opacity: 0, x: -8, stagger: 0.05, duration: 0.12 }, 0.82);
    nodes.forEach((n, i) =>
      tl.fromTo(
        n,
        { opacity: 0.15, '--lit': 0 },
        { opacity: 1, '--lit': 1, duration: 0.18, ease: 'power2.out' },
        0.88 + i * 0.12,
      ),
    );

    scrubType(
      tl,
      art.querySelector<HTMLElement>('[data-c="1"]')!,
      'kubectl run my-nginx --image=nginx --replicas=6 --port=80',
      0.45,
      1.3,
    );
    tl.from(art.querySelectorAll('[data-o="1"]'), { opacity: 0, x: -8, stagger: 0.05, duration: 0.12 }, 1.78);
    pods.forEach((p, k) =>
      tl.fromTo(
        p,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.14, ease: 'back.out(2.6)' },
        1.84 + k * 0.05,
      ),
    );

    tl.fromTo(
      art.querySelector('.y15-kt__next'),
      { opacity: 0, y: 18, letterSpacing: '0.3em' },
      { opacity: 1, y: 0, letterSpacing: '0.02em', duration: 0.35, ease: 'power3.out' },
      2.2,
    );
    tl.to({}, { duration: 0.45 });
  },
};

/** webpack 2 (2017) plays after the 2016 blocks, so the years only ever move forward. */
export const STAGE_2015: StageScene[] = [es2015, kubernetes];
export const STAGE_2015_LATE: StageScene[] = [webpack];
