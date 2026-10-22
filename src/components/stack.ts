import { reducedMotion } from '../core/scroll';
import { esc, h, onceInView } from '../core/util';

/** Fixed category order, so the same column changes value era after era. */
export const STACK_CATS = [
  'Frontend',
  'Language',
  'CSS / UI',
  'Build',
  'Backend',
  'Database',
  'Infra',
  'Dev',
  'AI',
] as const;
export type StackCat = (typeof STACK_CATS)[number];

export interface StackItem {
  cat: StackCat;
  value: string;
  /** what this replaced in the previous era (the board flips from it) */
  prev?: string;
}

/* ------------------------------------------------------------------ */
/* Topology: the same reading positions every era, a different shape.  */
/* ------------------------------------------------------------------ */

type Area = 'dev' | 'client' | 'mid' | 'server' | 'data' | 'infra' | 'ai';

interface Box {
  area: Area;
  role: string;
  note?: string;
  cats?: StackCat[];
  /** faint = shown but not part of the running system yet */
  faint?: boolean;
}

type Route = 'h' | 'v' | 'elbow' | 'arc' | 'arcDown';

interface Wire {
  id: string;
  from: Area;
  to: Area;
  route: Route;
  kind: 'req' | 'deploy' | 'ai' | 'mcp';
  label?: string;
  /** extra height for arcs, px */
  lift?: number;
}

interface Topology {
  year: string;
  /** CSS grid-template-areas rows (5 columns: dev · client · mid · server · data) */
  rows: string[];
  boxes: Box[];
  wires: Wire[];
  /** the request's trip: wire ids in order, `-` prefix = travel back */
  path: string[];
}

const CLIENT: StackCat[] = ['Frontend', 'CSS / UI', 'Language'];
const DEV: StackCat[] = ['Dev', 'Build'];
const MAIN_ROW = '"dev client mid server data"';
const INFRA_ROW = '". infra infra infra infra"';

const TOPOLOGY: Record<string, Topology> = {
  prologue: {
    year: '2005',
    rows: ['"dev client . server server"', INFRA_ROW],
    boxes: [
      { area: 'dev', role: 'Your PC', cats: DEV },
      { area: 'client', role: 'Browser', note: 'Internet Explorer 6 · Firefox', cats: CLIENT },
      {
        area: 'server',
        role: 'One shared server',
        note: 'Apache, PHP and MySQL in the same box',
        cats: ['Backend', 'Database'],
      },
      { area: 'infra', role: 'Runs on', cats: ['Infra'] },
    ],
    wires: [
      { id: 'web', from: 'client', to: 'server', route: 'h', kind: 'req', label: 'HTTP' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'FTP upload' },
    ],
    path: ['web', '-web'],
  },
  y2010: {
    year: '2011',
    rows: [MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'dev', role: 'Your laptop', cats: DEV },
      { area: 'client', role: 'Browser', note: 'Ajax via $.ajax', cats: CLIENT },
      { area: 'mid', role: 'Front door', note: 'Heroku routing mesh or Apache' },
      { area: 'server', role: 'App server', note: 'a Heroku dyno, or your own LAMP box', cats: ['Backend'] },
      { area: 'data', role: 'Database', cats: ['Database'] },
      { area: 'infra', role: 'Runs on', cats: ['Infra'] },
    ],
    wires: [
      { id: 'in', from: 'client', to: 'mid', route: 'h', kind: 'req', label: 'HTTP' },
      { id: 'route', from: 'mid', to: 'server', route: 'h', kind: 'req' },
      { id: 'sql', from: 'server', to: 'data', route: 'h', kind: 'req', label: 'SQL' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'git push heroku master' },
    ],
    path: ['in', 'route', 'sql', '-sql', '-route', '-in'],
  },
  y2012: {
    year: '2014',
    rows: [MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'dev', role: 'Your laptop', cats: DEV },
      { area: 'client', role: 'Single-page app', note: 'templates render in the browser', cats: CLIENT },
      { area: 'mid', role: 'nginx', note: 'reverse proxy' },
      { area: 'server', role: 'JSON API', note: '12 identical EC2 VMs', cats: ['Backend'] },
      { area: 'data', role: 'Data', cats: ['Database'] },
      { area: 'infra', role: 'Servers built by', cats: ['Infra'] },
    ],
    wires: [
      { id: 'in', from: 'client', to: 'mid', route: 'h', kind: 'req', label: 'XHR · JSON' },
      { id: 'route', from: 'mid', to: 'server', route: 'h', kind: 'req' },
      { id: 'q', from: 'server', to: 'data', route: 'h', kind: 'req', label: 'query' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'cap production deploy' },
    ],
    path: ['in', 'route', 'q', '-q', '-route', '-in'],
  },
  y2015: {
    year: '2017',
    rows: [MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'dev', role: 'Your laptop', cats: DEV },
      { area: 'client', role: 'Browser', note: 'one webpack bundle', cats: CLIENT },
      { area: 'mid', role: 'API gateway', note: 'one door, many services' },
      { area: 'server', role: 'Microservices', note: 'containers + Lambda functions', cats: ['Backend'] },
      { area: 'data', role: 'Data', note: 'a store per service', cats: ['Database'] },
      { area: 'infra', role: 'Runs on', cats: ['Infra'] },
    ],
    wires: [
      { id: 'in', from: 'client', to: 'mid', route: 'h', kind: 'req', label: 'REST / GraphQL' },
      { id: 'route', from: 'mid', to: 'server', route: 'h', kind: 'req' },
      { id: 'q', from: 'server', to: 'data', route: 'h', kind: 'req' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'docker push → ECR → ECS' },
    ],
    path: ['in', 'route', 'q', '-q', '-route', '-in'],
  },
  y2018: {
    year: '2020',
    rows: ['". . ai . ."', MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'ai', role: 'AI', note: 'a research demo, not in anyone’s stack yet', cats: ['AI'], faint: true },
      { area: 'dev', role: 'Your laptop', cats: DEV },
      { area: 'client', role: 'Browser', note: 'server-rendered, then hydrated', cats: CLIENT },
      { area: 'mid', role: 'Ingress', note: 'ingress-nginx · L7 routing into the cluster' },
      { area: 'server', role: 'Pods', note: 'Deployments on Kubernetes', cats: ['Backend'] },
      { area: 'data', role: 'Managed database', cats: ['Database'] },
      { area: 'infra', role: 'Cluster provisioned with', cats: ['Infra'] },
    ],
    wires: [
      { id: 'in', from: 'client', to: 'mid', route: 'h', kind: 'req', label: 'HTTPS' },
      { id: 'route', from: 'mid', to: 'server', route: 'h', kind: 'req' },
      { id: 'q', from: 'server', to: 'data', route: 'h', kind: 'req' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'Actions → registry → Argo CD' },
    ],
    path: ['in', 'route', 'q', '-q', '-route', '-in'],
  },
  y2021: {
    year: '2022',
    rows: ['"ai . . . ."', MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'ai', role: 'Pair programmer', note: 'ghost text in the editor', cats: ['AI'] },
      { area: 'dev', role: 'Your laptop', cats: DEV },
      { area: 'client', role: 'Browser', cats: CLIENT },
      { area: 'mid', role: 'Edge network', note: 'answers from the nearest city' },
      { area: 'server', role: 'Functions', note: 'edge + serverless, typed end to end', cats: ['Backend'] },
      { area: 'data', role: 'Serverless database', cats: ['Database'] },
      { area: 'infra', role: 'Runs on', cats: ['Infra'] },
    ],
    wires: [
      { id: 'pair', from: 'ai', to: 'dev', route: 'v', kind: 'ai', label: 'suggests code' },
      { id: 'in', from: 'client', to: 'mid', route: 'h', kind: 'req', label: 'HTTPS' },
      { id: 'route', from: 'mid', to: 'server', route: 'h', kind: 'req' },
      { id: 'q', from: 'server', to: 'data', route: 'h', kind: 'req' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'git push → preview URL' },
    ],
    path: ['in', 'route', 'q', '-q', '-route', '-in'],
  },
  y2023: {
    year: '2024',
    rows: ['". . . ai ."', MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'ai', role: 'LLM', note: 'called on every request', cats: ['AI'] },
      { area: 'dev', role: 'Your laptop', cats: DEV },
      { area: 'client', role: 'Browser', note: 'streams the answer in', cats: CLIENT },
      { area: 'mid', role: 'Edge / CDN', note: 'streams tokens through' },
      { area: 'server', role: 'App server', note: 'API routes', cats: ['Backend'] },
      { area: 'data', role: 'Retrieval', note: 'embeddings for RAG', cats: ['Database'] },
      { area: 'infra', role: 'Runs on', cats: ['Infra'] },
    ],
    wires: [
      { id: 'in', from: 'client', to: 'mid', route: 'h', kind: 'req', label: 'HTTPS · stream' },
      { id: 'route', from: 'mid', to: 'server', route: 'h', kind: 'req' },
      { id: 'rag', from: 'server', to: 'data', route: 'h', kind: 'req', label: 'retrieve' },
      { id: 'llm', from: 'server', to: 'ai', route: 'v', kind: 'ai', label: 'prompt → tokens' },
      { id: 'ship', from: 'dev', to: 'infra', route: 'elbow', kind: 'deploy', label: 'git push' },
    ],
    path: ['in', 'route', 'rag', '-rag', 'llm', '-llm', '-route', '-in'],
  },
  y2025: {
    year: '2026',
    rows: [MAIN_ROW, INFRA_ROW],
    boxes: [
      { area: 'dev', role: 'You', note: 'describe, review, approve', cats: DEV },
      { area: 'client', role: 'Browser', cats: CLIENT },
      { area: 'mid', role: 'The agent', note: 'operates every box through MCP', cats: ['AI'] },
      { area: 'server', role: 'Services', cats: ['Backend'] },
      { area: 'data', role: 'Data', cats: ['Database'] },
      { area: 'infra', role: 'Runs on', cats: ['Infra'] },
    ],
    wires: [
      { id: 'ask', from: 'dev', to: 'mid', route: 'arc', kind: 'ai', label: 'plain English', lift: 74 },
      { id: 'web', from: 'client', to: 'server', route: 'arc', kind: 'req', label: 'HTTPS', lift: 34 },
      { id: 'q', from: 'server', to: 'data', route: 'h', kind: 'req' },
      { id: 'mcp-ui', from: 'mid', to: 'client', route: 'h', kind: 'mcp', label: 'MCP' },
      { id: 'mcp-api', from: 'mid', to: 'server', route: 'h', kind: 'mcp', label: 'MCP' },
      { id: 'mcp-db', from: 'mid', to: 'data', route: 'arcDown', kind: 'mcp' },
      { id: 'mcp-ops', from: 'mid', to: 'infra', route: 'v', kind: 'mcp', label: 'PR → CI → Argo CD' },
    ],
    path: ['web', 'q', '-q', '-web'],
  },
};

const ORDER: Area[] = ['dev', 'ai', 'client', 'mid', 'server', 'data', 'infra'];

/* ------------------------------------------------------------------ */

const FLAP_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/.-';

/** Departure-board flip from `from` to `to`, one character cell at a time. Ends as plain text. */
function flap(el: HTMLElement, from: string, to: string, delay: number): Promise<void> {
  const n = Math.max(from.length, to.length);
  el.classList.add('is-flipping');
  // cells are grouped per word, so the board only ever wraps between words (never "MySQ|L")
  const target = to.padEnd(n, ' ');
  let html = '';
  let word = '';
  for (let i = 0; i < n; i++) {
    const cell = `<span class="flap__c">${esc(from[i] ?? ' ')}</span>`;
    if (target[i] === ' ') {
      html += (word ? `<span class="flap__w">${word}</span>` : '') + cell;
      word = '';
    } else word += cell;
  }
  html += word ? `<span class="flap__w">${word}</span>` : '';
  el.innerHTML = html;
  const cells = Array.from(el.querySelectorAll<HTMLElement>('.flap__c'));
  const jobs = cells.map(
    (cell, i) =>
      new Promise<void>((resolve) => {
        const target = to[i] ?? ' ';
        if ((from[i] ?? ' ') === target) return resolve();
        let spins = 3 + ((Math.random() * 4) | 0);
        const step = () => {
          cell.classList.remove('is-flip');
          void cell.offsetWidth; // restart the flip animation
          cell.classList.add('is-flip');
          if (spins-- > 0) {
            cell.textContent = FLAP_GLYPHS[(Math.random() * FLAP_GLYPHS.length) | 0];
            setTimeout(step, 50);
          } else {
            cell.textContent = target;
            resolve();
          }
        };
        setTimeout(step, delay + i * 22);
      }),
  );
  return Promise.all(jobs).then(() => {
    el.classList.remove('is-flipping');
    el.textContent = to;
  });
}

/* geometry ---------------------------------------------------------- */

interface R {
  l: number;
  r: number;
  t: number;
  b: number;
  cx: number;
  cy: number;
}

function wirePath(w: Wire, a: R, b: R): string {
  switch (w.route) {
    case 'h': {
      const rightward = a.cx < b.cx;
      const sx = rightward ? a.r : a.l;
      const ex = rightward ? b.l : b.r;
      const sy = a.cy;
      const ey = b.cy;
      const mx = (sx + ex) / 2;
      return `M${sx} ${sy} C${mx} ${sy} ${mx} ${ey} ${ex} ${ey}`;
    }
    case 'v': {
      const down = a.cy < b.cy;
      const sy = down ? a.b : a.t;
      const ey = down ? b.t : b.b;
      const my = (sy + ey) / 2;
      return `M${a.cx} ${sy} C${a.cx} ${my} ${b.cx} ${my} ${b.cx} ${ey}`;
    }
    case 'elbow': {
      // down out of the developer box, then right into the infra band
      const sx = a.cx;
      const sy = a.b;
      const ex = b.l;
      const ey = b.cy;
      return `M${sx} ${sy} C${sx} ${ey} ${sx + (ex - sx) * 0.2} ${ey} ${ex} ${ey}`;
    }
    case 'arc': {
      const top = Math.min(a.t, b.t) - (w.lift ?? 40);
      return `M${a.cx} ${a.t} C${a.cx} ${top} ${b.cx} ${top} ${b.cx} ${b.t}`;
    }
    case 'arcDown': {
      const bottom = Math.max(a.b, b.b) + (w.lift ?? 26);
      return `M${a.cx + 20} ${a.b} C${a.cx + 20} ${bottom} ${b.cx} ${bottom} ${b.cx} ${b.b}`;
    }
  }
}

/* ------------------------------------------------------------------ */

/**
 * "The stack of the day": the era's stack as the architecture people actually ran.
 * Same reading positions every era (developer · client · edge/gateway · server · data, infra below, AI above),
 * a different topology each time. Changed boxes flip from what they replaced; one request makes the round trip.
 */
export function createStack(parent: HTMLElement, items: StackItem[], title?: string): HTMLElement {
  const eraId = parent.closest<HTMLElement>('section.era')?.dataset.era ?? 'y2015';
  const topo = TOPOLOGY[eraId] ?? TOPOLOGY.y2015;
  const byCat = new Map(items.map((i) => [i.cat, i]));
  const isChanged = (it?: StackItem) => !!(it?.prev && it.prev !== it.value);
  const changed = items.filter(isChanged).length;

  const boxHtml = (bx: Box) => {
    const rows = (bx.cats ?? [])
      .map((cat) => {
        const it = byCat.get(cat);
        if (!it) return '';
        const ch = isChanged(it);
        return `<div class="sd__row${ch ? ' is-changed' : ''}" data-cat="${esc(cat)}">
            <dt>${esc(cat)}</dt>
            <dd><span class="sd__val" aria-label="${esc(it.value)}">${esc(ch ? it.prev! : it.value)}</span>${
              ch ? `<s class="sd__was">${esc(it.prev!)}</s>` : ''
            }</dd>
          </div>`;
      })
      .join('');
    const anyChanged = (bx.cats ?? []).some((c) => isChanged(byCat.get(c)));
    return `<div class="sd__box sd__box--${bx.area}${bx.faint ? ' is-faint' : ''}${anyChanged ? ' has-change' : ''}" data-area="${bx.area}" style="grid-area:${bx.area};--d:${ORDER.indexOf(bx.area)}">
        <p class="sd__role">${esc(bx.role)}</p>
        ${bx.note ? `<p class="sd__note">${esc(bx.note)}</p>` : ''}
        ${rows ? `<dl class="sd__rows">${rows}</dl>` : ''}
      </div>`;
  };

  const el = h(`
    <div class="stack sd sd--${eraId}" id="stack-${eraId}" data-hud-year="${Number.parseInt(topo.year, 10)}">
      <header class="stack__head">
        <p class="stack__title">${esc(title ?? `The stack of the day — ${topo.year}`)}</p>
        <p class="stack__meta">${
          changed ? `<b class="stack__count">0</b> of ${items.length} changed` : 'Where it all started'
        }</p>
      </header>
      <div class="sd__stage">
        <div class="sd__grid" style='grid-template-areas:${topo.rows.join(' ')}'>
          ${topo.boxes.map(boxHtml).join('')}
        </div>
        <svg class="sd__wires" aria-hidden="true">
          ${topo.wires
            .map(
              (w) =>
                `<path class="sd__wire sd__wire--${w.kind}" data-id="${w.id}"/>${
                  w.label
                    ? `<text class="sd__label sd__label--${w.kind}" data-for="${w.id}">${esc(w.label)}</text>`
                    : ''
                }`,
            )
            .join('')}
          <circle class="sd__packet" r="5" cx="-20" cy="-20"/>
        </svg>
      </div>
      <button type="button" class="sd__replay">▶ Send a request</button>
    </div>`);
  parent.appendChild(el);

  const stage = el.querySelector<HTMLElement>('.sd__stage')!;
  const svg = el.querySelector<SVGSVGElement>('.sd__wires')!;
  const packet = el.querySelector<SVGCircleElement>('.sd__packet')!;
  const count = el.querySelector<HTMLElement>('.stack__count');
  const replay = el.querySelector<HTMLButtonElement>('.sd__replay')!;
  const boxes = new Map(
    Array.from(el.querySelectorAll<HTMLElement>('.sd__box')).map((b) => [b.dataset.area as Area, b] as const),
  );
  const paths = new Map(
    Array.from(svg.querySelectorAll<SVGPathElement>('.sd__wire')).map((p) => [p.dataset.id!, p] as const),
  );

  /* draw the wires from the boxes' live positions */
  const wire = () => {
    const sr = stage.getBoundingClientRect();
    if (!sr.width) return;
    svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
    const rect = (a: Area): R | null => {
      const b = boxes.get(a);
      if (!b) return null;
      const r = b.getBoundingClientRect();
      const l = r.left - sr.left;
      const t = r.top - sr.top;
      return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
    };
    for (const w of topo.wires) {
      const p = paths.get(w.id)!;
      const a = rect(w.from);
      const b = rect(w.to);
      if (!a || !b) continue;
      p.setAttribute('d', wirePath(w, a, b));
      const len = p.getTotalLength();
      p.style.setProperty('--len', String(len));
      const label = svg.querySelector<SVGTextElement>(`[data-for="${w.id}"]`);
      if (label) {
        if (w.route === 'elbow') {
          // under the curve's horizontal run, ending at the infra band: the midpoint would sit on the dashes
          label.setAttribute('x', String(b.l - 8));
          label.setAttribute('y', String(b.cy + 20));
          label.style.textAnchor = 'end';
        } else {
          const m = p.getPointAtLength(len / 2);
          label.setAttribute('x', String(m.x));
          label.setAttribute('y', String(m.y - 8));
        }
      }
    }
  };
  new ResizeObserver(wire).observe(stage);
  document.fonts?.ready.then(wire);

  /* one request: along the main path and back */
  let running = false;
  const travel = async () => {
    if (running || !stage.offsetParent) return;
    running = true;
    el.classList.add('is-sending');
    for (const step of topo.path) {
      const back = step.startsWith('-');
      const p = paths.get(back ? step.slice(1) : step);
      if (!p?.getAttribute('d')) continue;
      const len = p.getTotalLength();
      const dur = Math.max(260, len * 1.6);
      const t0 = performance.now();
      p.classList.add('is-hot');
      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / dur);
          const pt = p.getPointAtLength(len * (back ? 1 - k : k));
          packet.setAttribute('cx', String(pt.x));
          packet.setAttribute('cy', String(pt.y));
          if (k < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      p.classList.remove('is-hot');
    }
    el.classList.remove('is-sending');
    running = false;
  };
  replay.addEventListener('click', () => {
    wire();
    travel();
  });

  const settle = () => {
    el.querySelectorAll<HTMLElement>('.sd__row').forEach((row) => {
      const it = byCat.get(row.dataset.cat as StackCat);
      if (it) row.querySelector<HTMLElement>('.sd__val')!.textContent = it.value;
      row.classList.add('is-flipped');
    });
    if (count) count.textContent = String(changed);
  };

  if (reducedMotion) {
    el.classList.add('is-in', 'is-drawn');
    settle();
    return el;
  }

  onceInView(
    el,
    () => {
      wire();
      el.classList.add('is-in');
      setTimeout(() => el.classList.add('is-drawn'), 450);
      let done = 0;
      const rows = Array.from(el.querySelectorAll<HTMLElement>('.sd__row.is-changed'));
      rows.forEach((row, i) => {
        const it = byCat.get(row.dataset.cat as StackCat)!;
        flap(row.querySelector<HTMLElement>('.sd__val')!, it.prev!, it.value, 300 + i * 90).then(() => {
          row.classList.add('is-flipped');
          if (count) count.textContent = String(++done);
        });
      });
      setTimeout(travel, 1100 + rows.length * 90);
    },
    // start early, so every flap has settled well before the diagram scrolls away
    'top 92%',
  );
  return el;
}
