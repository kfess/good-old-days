import { gsap, reducedMotion } from '../../core/scroll';
import { esc, h, onceInView } from '../../core/util';
import { ripples } from './ripple';

/* ---------------- the Redux side ---------------- */

interface Card {
  id: number;
  title: string;
  sub: string;
  hue: number;
  liked: boolean;
}

interface State {
  drawer: boolean;
  loading: boolean;
  snack: boolean;
  cards: Card[];
}

type Action =
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'REFRESH_REQUEST' }
  | { type: 'REFRESH_SUCCESS' }
  | { type: 'ADD_CARD' }
  | { type: 'UNDO_ADD' }
  | { type: 'HIDE_SNACKBAR' }
  | { type: 'TOGGLE_LIKE'; id: number };

const TITLES = [
  ['Isometric city', 'Illustration · 2016'],
  ['Material palette', 'Design · 2015'],
  ['Pixel-perfect icons', 'Icons · 2016'],
  ['Night drive', 'Photography · 2017'],
  ['Long weekend', 'Travel · 2016'],
  ['Mid-century chairs', 'Interior · 2017'],
];

let nextId = 1;
const makeCard = (): Card => {
  const [title, sub] = TITLES[(nextId - 1) % TITLES.length];
  return { id: nextId, title, sub, hue: (nextId++ * 67) % 360, liked: false };
};

const initial: State = { drawer: false, loading: false, snack: false, cards: [makeCard(), makeCard(), makeCard()] };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'TOGGLE_DRAWER':
      return { ...s, drawer: !s.drawer };
    case 'REFRESH_REQUEST':
      return { ...s, loading: true, drawer: false };
    case 'REFRESH_SUCCESS':
      return { ...s, loading: false };
    case 'ADD_CARD':
      return { ...s, snack: true, cards: [makeCard(), ...s.cards].slice(0, 6) };
    case 'UNDO_ADD':
      return s.snack ? { ...s, snack: false, cards: s.cards.slice(1) } : s;
    case 'HIDE_SNACKBAR':
      return { ...s, snack: false };
    case 'TOGGLE_LIKE':
      return { ...s, cards: s.cards.map((c) => (c.id === a.id ? { ...c, liked: !c.liked } : c)) };
  }
}

/* ---------------- the component tree (what a virtual DOM would render) ---------------- */

interface VNode {
  key: string;
  depth: number;
  label: string;
}

function tree(s: State): VNode[] {
  const nodes: VNode[] = [
    { key: 'app', depth: 0, label: '<App>' },
    { key: 'bar', depth: 1, label: '<AppBar title="Feed">' },
    { key: 'menu', depth: 2, label: `<MenuIcon open={${s.drawer}} />` },
    { key: 'drawer', depth: 1, label: `<Drawer open={${s.drawer}} />` },
    { key: 'list', depth: 1, label: `<CardList loading={${s.loading}}>` },
  ];
  if (s.loading) nodes.push({ key: 'skel', depth: 2, label: '<Skeleton count={3} />' });
  else
    s.cards.forEach((c) =>
      nodes.push({ key: `card${c.id}`, depth: 2, label: `<Card key={${c.id}} liked={${c.liked}} />` }),
    );
  nodes.push({ key: 'fab', depth: 1, label: '<FloatingActionButton><ContentAdd /></FloatingActionButton>' });
  nodes.push({ key: 'snack', depth: 1, label: `<Snackbar open={${s.snack}} />` });
  return nodes;
}

/* ---------------- views ---------------- */

const photo = (hue: number) => `
  <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="160" height="90" fill="hsl(${hue} 60% 62%)"/>
    <circle cx="${40 + (hue % 80)}" cy="30" r="13" fill="hsl(${(hue + 40) % 360} 90% 80%)"/>
    <polygon points="0,90 40,48 70,72 104,36 160,82 160,90" fill="hsl(${hue} 45% 38%)"/>
    <polygon points="0,90 30,70 80,86 130,64 160,76 160,90" fill="hsl(${hue} 40% 26%)"/>
  </svg>`;

function cardHTML(c: Card): string {
  return `
    <article class="md-card" data-id="${c.id}">
      <div class="md-card__img is-blur">${photo(c.hue)}</div>
      <div class="md-card__body"><h5>${esc(c.title)}</h5><p>${esc(c.sub)}</p></div>
      <div class="md-card__actions">
        <button type="button" class="md-flat rp">Share</button>
        <button type="button" class="md-flat rp md-like${c.liked ? ' is-on' : ''}" data-like="${c.id}" aria-pressed="${c.liked}">♥ Like</button>
      </div>
    </article>`;
}

const SKELETON = Array.from(
  { length: 3 },
  () => `<div class="md-skel"><i class="a"></i><i class="b"></i><i class="c"></i></div>`,
).join('');

/**
 * "UI = f(state)": a Material Design app wired to a tiny Redux store. Every interaction
 * dispatches an action that travels around the one-way loop, and the component tree beside
 * it flashes only the nodes whose props changed — the virtual DOM diff, made visible.
 */
export function mountApp(parent: HTMLElement): void {
  const el = h(`
    <section class="y15-panel y15-app">
      <header class="y15-head">
        <p class="y15-kicker">Material Design × React × Redux</p>
        <h3 class="y15-title">UI = f(state)</h3>
        <p class="y15-jp">When state changes, only the changed parts re-render. Try it.</p>
      </header>
      <div class="y15-app__grid">
        <div class="md-phone">
          <div class="md-status"><span>12:30</span><i></i><i></i></div>
          <header class="md-bar">
            <button type="button" class="md-burger rp" aria-label="menu"><span></span><span></span><span></span></button>
            <h4>Feed</h4>
            <button type="button" class="md-iconbtn md-refresh rp" aria-label="refresh">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            </button>
          </header>
          <div class="md-content" data-lenis-prevent></div>
          <button type="button" class="md-fab rp" aria-label="add card"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
          <div class="md-scrim"></div>
          <aside class="md-drawer" aria-label="drawer">
            <div class="md-drawer__head"><i></i><b>Ada Lovelace</b><small>ada@example.com</small></div>
            <a class="rp">Inbox</a><a class="rp">Starred</a><a class="rp">Sent</a><a class="rp">Settings</a>
          </aside>
          <div class="md-snack" role="status"><span>Card added</span><button type="button" class="md-undo">Undo</button></div>
        </div>
        <div class="y15-app__side">
          <div class="y15-card y15-flow">
            <p class="y15-card__title">Redux · one-way data flow</p>
            <svg class="y15-flow__svg" viewBox="0 0 420 210" aria-hidden="true">
              <defs><marker id="y15arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#9e9e9e"/></marker></defs>
              <path class="flow-line" d="M110 40 H300" marker-end="url(#y15arrow)"/>
              <path class="flow-line" d="M350 66 V144" marker-end="url(#y15arrow)"/>
              <path class="flow-line" d="M300 170 H110" marker-end="url(#y15arrow)"/>
              <path class="flow-line" d="M60 144 V66" marker-end="url(#y15arrow)"/>
              <g class="flow-node" data-n="action"><rect x="10" y="16" width="100" height="48" rx="2"/><text x="60" y="45">Action</text></g>
              <g class="flow-node" data-n="reducer"><rect x="300" y="16" width="100" height="48" rx="2"/><text x="350" y="45">Reducer</text></g>
              <g class="flow-node" data-n="store"><rect x="300" y="146" width="100" height="48" rx="2"/><text x="350" y="175">Store</text></g>
              <g class="flow-node" data-n="view"><rect x="10" y="146" width="100" height="48" rx="2"/><text x="60" y="175">View</text></g>
              <circle class="flow-dot" r="7" cx="60" cy="40"/>
            </svg>
            <pre class="y15-flow__action"><code>store.dispatch(…)</code></pre>
          </div>
          <div class="y15-card y15-vdom">
            <p class="y15-card__title">Virtual DOM diff <span class="y15-vdom__stat"></span></p>
            <ul class="y15-vdom__tree"></ul>
          </div>
        </div>
      </div>
    </section>`);
  parent.appendChild(el);

  const phone = el.querySelector<HTMLElement>('.md-phone')!;
  const content = el.querySelector<HTMLElement>('.md-content')!;
  const treeEl = el.querySelector<HTMLElement>('.y15-vdom__tree')!;
  const stat = el.querySelector<HTMLElement>('.y15-vdom__stat')!;
  const actionOut = el.querySelector<HTMLElement>('.y15-flow__action code')!;
  const dot = el.querySelector<SVGCircleElement>('.flow-dot')!;
  const nodes = (n: string) => el.querySelector<SVGGElement>(`.flow-node[data-n="${n}"]`)!;
  ripples(el);

  let state = initial;
  let prevTree = new Map<string, string>();
  let snackTimer = 0;

  function renderPhone(prev: State | null): void {
    phone.classList.toggle('is-drawer', state.drawer);
    phone.classList.toggle('is-snack', state.snack);
    if (state.loading) {
      content.innerHTML = SKELETON;
      return;
    }
    // keyed reconciliation: keep existing card elements, create only the new ones
    const existing = new Map(
      Array.from(content.querySelectorAll<HTMLElement>('.md-card')).map((n) => [Number(n.dataset.id), n]),
    );
    const fresh = prev === null || prev.loading;
    if (fresh) content.innerHTML = '';
    const frag = document.createDocumentFragment();
    state.cards.forEach((c) => {
      let node = fresh ? undefined : existing.get(c.id);
      if (!node) {
        node = h<HTMLElement>(cardHTML(c));
        if (!fresh) node.classList.add('is-new');
        const img = node.querySelector('.md-card__img')!;
        setTimeout(() => img.classList.remove('is-blur'), reducedMotion ? 0 : 350 + Math.random() * 700);
      }
      const like = node.querySelector<HTMLElement>('.md-like')!;
      like.classList.toggle('is-on', c.liked);
      like.setAttribute('aria-pressed', String(c.liked));
      frag.appendChild(node);
    });
    content.replaceChildren(frag);
  }

  function renderTree(): number {
    const t = tree(state);
    const next = new Map(t.map((n) => [n.key, n.label]));
    let patches = 0;
    treeEl.innerHTML = t
      .map((n) => {
        const changed = prevTree.size > 0 && prevTree.get(n.key) !== n.label;
        if (changed) patches++;
        return `<li class="${changed ? 'is-patched' : ''}" style="--d:${n.depth}">${esc(n.label)}</li>`;
      })
      .join('');
    prevTree.forEach((_, k) => {
      if (!next.has(k)) patches++;
    });
    prevTree = next;
    stat.textContent = `${t.length} components · ${patches} DOM patch${patches === 1 ? '' : 'es'}`;
    return patches;
  }

  let flowTl: gsap.core.Timeline | null = null;
  function animateFlow(a: Action): void {
    actionOut.textContent = `store.dispatch({ type: '${a.type}'${'id' in a ? `, id: ${a.id}` : ''} })`;
    if (reducedMotion) return;
    flowTl?.kill();
    const pulse = (n: string) => () => {
      const g = nodes(n);
      g.classList.remove('is-hot');
      void g.getBoundingClientRect();
      g.classList.add('is-hot');
    };
    gsap.set(dot, { attr: { cx: 60, cy: 40 }, opacity: 1 });
    flowTl = gsap
      .timeline()
      .call(pulse('action'))
      .to(dot, { attr: { cx: 350 }, duration: 0.35, ease: 'power1.inOut' })
      .call(pulse('reducer'))
      .to(dot, { attr: { cy: 170 }, duration: 0.3, ease: 'power1.inOut' })
      .call(pulse('store'))
      .to(dot, { attr: { cx: 60 }, duration: 0.35, ease: 'power1.inOut' })
      .call(pulse('view'))
      .to(dot, { attr: { cy: 40 }, duration: 0.3, ease: 'power1.inOut' })
      .to(dot, { opacity: 0.35, duration: 0.3 });
  }

  function dispatch(a: Action): void {
    const prev = state;
    state = reducer(state, a);
    animateFlow(a);
    renderPhone(prev);
    renderTree();
    if (a.type === 'ADD_CARD') {
      clearTimeout(snackTimer);
      snackTimer = window.setTimeout(() => state.snack && dispatch({ type: 'HIDE_SNACKBAR' }), 2800);
    }
  }

  el.querySelector('.md-burger')!.addEventListener('click', () => dispatch({ type: 'TOGGLE_DRAWER' }));
  el.querySelector('.md-scrim')!.addEventListener('click', () => dispatch({ type: 'TOGGLE_DRAWER' }));
  el.querySelector('.md-drawer')!.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) dispatch({ type: 'TOGGLE_DRAWER' });
  });
  el.querySelector('.md-refresh')!.addEventListener('click', () => {
    if (state.loading) return;
    dispatch({ type: 'REFRESH_REQUEST' });
    setTimeout(() => dispatch({ type: 'REFRESH_SUCCESS' }), reducedMotion ? 0 : 1400);
  });
  el.querySelector('.md-fab')!.addEventListener('click', () => dispatch({ type: 'ADD_CARD' }));
  el.querySelector('.md-undo')!.addEventListener('click', () => dispatch({ type: 'UNDO_ADD' }));
  content.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-like]');
    if (b) dispatch({ type: 'TOGGLE_LIKE', id: Number(b.dataset.like) });
  });

  renderPhone(null);
  renderTree();
  const draw = el.querySelectorAll<SVGPathElement>('.flow-line');
  if (!reducedMotion) {
    draw.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    // first impression: lines draw themselves, then the feed loads with skeletons
    onceInView(
      el.querySelector('.y15-app__grid')!,
      () => {
        gsap.to(draw, { strokeDashoffset: 0, duration: 0.8, stagger: 0.25, ease: 'power2.inOut' });
        dispatch({ type: 'REFRESH_REQUEST' });
        setTimeout(() => dispatch({ type: 'REFRESH_SUCCESS' }), 1600);
      },
      'top 65%',
    );
  }
}
