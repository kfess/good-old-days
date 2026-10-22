import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h } from '../../core/util';
import { MD } from './isometric';
import { ripples } from './ripple';

/*
 * Microservices are not just split-up containers: they call each other over the network.
 * One POST /orders goes through a Netflix-OSS-style stack: the Zuul gateway routes it (one-to-one) to
 * orders, a Spring Boot service that calls users, inventory and payments over REST (payments behind a
 * Hystrix circuit breaker), emits a Kafka event, and is traced Zipkin-style.
 */

interface Node {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  color: string;
}

const NODES: Node[] = [
  { id: 'client', label: 'Client', sub: 'browser', x: 20, y: 170, color: MD.blueGrey },
  { id: 'gw', label: 'API gateway', sub: 'Zuul', x: 170, y: 170, color: MD.indigo },
  { id: 'eureka', label: 'Registry', sub: 'Eureka', x: 170, y: 30, color: MD.purple },
  { id: 'users', label: 'users', sub: 'Node.js', x: 380, y: 40, color: MD.teal },
  { id: 'orders', label: 'orders', sub: 'Spring Boot', x: 380, y: 170, color: MD.deepOrange },
  { id: 'kafka', label: 'Kafka', sub: 'order.created', x: 380, y: 300, color: MD.amber },
  { id: 'inventory', label: 'inventory', sub: 'Go', x: 600, y: 105, color: MD.lightBlue },
  { id: 'payments', label: 'payments', sub: 'Java', x: 600, y: 235, color: MD.pink },
  { id: 'notify', label: 'notifications', sub: 'Python', x: 600, y: 330, color: MD.green },
];
const W = 124;
const H = 46;
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

// edge endpoints sit on the sides of the node cards
const right = (n: Node) => [n.x + W, n.y + H / 2] as const;
const left = (n: Node) => [n.x, n.y + H / 2] as const;
const bottom = (n: Node) => [n.x + W / 2, n.y + H] as const;
const top = (n: Node) => [n.x + W / 2, n.y] as const;

function curve(a: readonly [number, number], b: readonly [number, number]): string {
  const mx = (a[0] + b[0]) / 2;
  return `M${a[0]} ${a[1]} C${mx} ${a[1]} ${mx} ${b[1]} ${b[0]} ${b[1]}`;
}

const EDGES: {
  id: string;
  d: string;
  label: string;
  lx: number;
  ly: number;
  kind: 'http' | 'event' | 'lookup';
  anchor: 'start' | 'middle' | 'end';
}[] = [
  {
    id: 'c-gw',
    d: curve(right(byId.client), left(byId.gw)),
    label: 'POST /orders',
    lx: 157,
    ly: 160,
    kind: 'http',
    anchor: 'middle',
  },
  {
    id: 'gw-orders',
    d: curve(right(byId.gw), left(byId.orders)),
    label: 'POST /orders',
    lx: 374,
    ly: 186,
    kind: 'http',
    anchor: 'end',
  },
  {
    id: 'o-users',
    d: `M${top(byId.orders)[0]} ${top(byId.orders)[1]} L${bottom(byId.users)[0]} ${bottom(byId.users)[1]}`,
    label: 'GET /users/42',
    lx: 450,
    ly: 136,
    kind: 'http',
    anchor: 'start',
  },
  {
    id: 'o-inv',
    d: curve(right(byId.orders), left(byId.inventory)),
    label: 'POST /reservations',
    lx: 594,
    ly: 116,
    kind: 'http',
    anchor: 'end',
  },
  {
    id: 'o-pay',
    d: curve(right(byId.orders), left(byId.payments)),
    label: 'POST /charges',
    lx: 552,
    ly: 282,
    kind: 'http',
    anchor: 'middle',
  },
  {
    id: 'o-kafka',
    d: `M${bottom(byId.orders)[0]} ${bottom(byId.orders)[1]} L${top(byId.kafka)[0]} ${top(byId.kafka)[1]}`,
    label: 'publish',
    lx: 470,
    ly: 262,
    kind: 'event',
    anchor: 'middle',
  },
  {
    id: 'k-notify',
    d: curve(right(byId.kafka), left(byId.notify)),
    label: 'consume',
    lx: 548,
    ly: 312,
    kind: 'event',
    anchor: 'middle',
  },
  {
    id: 'gw-eureka',
    d: `M${top(byId.gw)[0]} ${top(byId.gw)[1]} L${bottom(byId.eureka)[0]} ${bottom(byId.eureka)[1]}`,
    label: 'lookup',
    lx: 238,
    ly: 128,
    kind: 'lookup',
    anchor: 'middle',
  },
];

interface Span {
  name: string;
  op: string;
  start: number;
  end: number;
  depth: number;
  state?: 'error' | 'fallback' | 'async';
}

// Normal request: Zuul routes it to orders; orders makes the downstream calls. Children always sit inside their parent.
const TRACE_OK: Span[] = [
  { name: 'gateway', op: 'POST /orders', start: 0, end: 182, depth: 0 },
  { name: 'orders', op: 'POST /orders', start: 6, end: 176, depth: 1 },
  { name: 'users', op: 'GET /users/42', start: 12, end: 28, depth: 2 },
  { name: 'inventory', op: 'POST /reservations', start: 34, end: 70, depth: 2 },
  { name: 'payments', op: 'POST /charges', start: 74, end: 168, depth: 2 },
  { name: 'notifications', op: 'consume order.created', start: 190, end: 212, depth: 1, state: 'async' },
];

// Before the breaker opens: each payments call waits out the 800 ms Hystrix timeout, then orders falls back.
// orders still answers before Zuul's own 1000 ms read timeout, but every request now costs ~0.9 s.
const TRACE_SLOW: Span[] = [
  { name: 'gateway', op: 'POST /orders', start: 0, end: 886, depth: 0 },
  { name: 'orders', op: 'POST /orders', start: 6, end: 880, depth: 1 },
  { name: 'users', op: 'GET /users/42', start: 12, end: 28, depth: 2 },
  { name: 'inventory', op: 'POST /reservations', start: 34, end: 70, depth: 2 },
  { name: 'payments', op: 'POST /charges → timeout', start: 74, end: 874, depth: 2, state: 'error' },
  { name: 'orders · fallback', op: 'queue the charge', start: 874, end: 876, depth: 2, state: 'fallback' },
];

// Circuit open: orders never calls payments; the fallback runs inside orders in ~1 ms.
const TRACE_OPEN: Span[] = [
  { name: 'gateway', op: 'POST /orders', start: 0, end: 66, depth: 0 },
  { name: 'orders', op: 'POST /orders', start: 6, end: 60, depth: 1 },
  { name: 'users', op: 'GET /users/42', start: 12, end: 26, depth: 2 },
  { name: 'inventory', op: 'POST /reservations', start: 28, end: 52, depth: 2 },
  { name: 'orders · fallback', op: 'circuit open → queue the charge', start: 54, end: 55, depth: 2, state: 'fallback' },
];

const SCALE = 220; // ms shown across the waterfall

function traceRows(spans: Span[]): string {
  return spans
    .map((s) => {
      const left = (s.start / SCALE) * 100;
      const width = Math.min(100 - left, Math.max(0.6, ((s.end - s.start) / SCALE) * 100));
      const clipped = s.end > SCALE ? ' is-clipped' : '';
      return `
      <div class="y15-trace__row${s.state ? ` is-${s.state}` : ''}${clipped}" style="--d:${s.depth}">
        <span class="y15-trace__name">${s.name}<small>${s.op}</small></span>
        <span class="y15-trace__track"><i style="left:${left}%;width:${width}%"></i></span>
        <span class="y15-trace__ms">${(s.end - s.start).toLocaleString('en-US')} ms</span>
      </div>`;
    })
    .join('');
}

export function mountMesh(parent: HTMLElement): void {
  const nodes = NODES.map(
    (n) => `
    <g class="y15-mesh__node" data-node="${n.id}" transform="translate(${n.x} ${n.y})">
      <rect class="y15-mesh__card" width="${W}" height="${H}" rx="3"/>
      <rect width="4" height="${H}" fill="${n.color}"/>
      <text x="14" y="20" class="y15-mesh__label">${n.label}</text>
      <text x="14" y="36" class="y15-mesh__sub">${n.sub}</text>
    </g>`,
  ).join('');
  const edges = EDGES.map((e) => `<path id="y15-e-${e.id}" class="y15-mesh__edge is-${e.kind}" d="${e.d}"/>`).join('');
  // labels go above the node cards so a card never hides one
  const labels = EDGES.map(
    (e) => `<text class="y15-mesh__elabel" x="${e.lx}" y="${e.ly}" text-anchor="${e.anchor}">${e.label}</text>`,
  ).join('');
  const pay = byId.payments;

  const el = h(`
    <div class="y15-card y15-mesh">
      <p class="y15-card__title">Services talk <span class="y15-mesh__status">REST · events · a circuit breaker</span></p>
      <div class="y15-mesh__grid">
        <svg class="y15-mesh__svg" viewBox="0 0 744 390" role="img" aria-label="One request travelling through a gateway, five services, Kafka and a circuit breaker">
          <defs>
            <filter id="y15-dp" x="-10%" y="-20%" width="120%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-opacity="0.22"/></filter>
          </defs>
          <g class="y15-mesh__edges">${edges}</g>
          <g class="y15-mesh__nodes">${nodes}</g>
          <g class="y15-mesh__elabels">${labels}</g>
          <g class="y15-mesh__breaker is-closed" transform="translate(${pay.x - 92} ${pay.y - 30})">
            <rect width="84" height="22" rx="11"/>
            <text x="42" y="15" text-anchor="middle">Hystrix · <tspan class="y15-mesh__bstate">CLOSED</tspan></text>
          </g>
          <g class="y15-mesh__packets"></g>
        </svg>
        <div class="y15-trace">
          <p class="y15-trace__title"><b>Trace</b> <span class="y15-trace__req">POST /orders</span> <em class="y15-trace__res"></em></p>
          <div class="y15-trace__axis"><span>0</span><span>110 ms</span><span>220 ms</span></div>
          <div class="y15-trace__rows">${traceRows(TRACE_OK)}</div>
          <p class="y15-trace__note"></p>
        </div>
      </div>
      <div class="y15-mesh__foot">
        <button type="button" class="y15-raised rp" data-run="ok">Send POST /orders</button>
        <button type="button" class="y15-raised y15-raised--pink rp" data-run="fail">Slow down payments</button>
      </div>
    </div>`);
  parent.appendChild(el);
  ripples(el);

  const svg = el.querySelector<SVGSVGElement>('.y15-mesh__svg')!;
  const packets = el.querySelector<SVGGElement>('.y15-mesh__packets')!;
  const rows = el.querySelector<HTMLElement>('.y15-trace__rows')!;
  const res = el.querySelector<HTMLElement>('.y15-trace__res')!;
  const note = el.querySelector<HTMLElement>('.y15-trace__note')!;
  const breaker = el.querySelector<SVGGElement>('.y15-mesh__breaker')!;
  const bstate = el.querySelector<SVGTSpanElement>('.y15-mesh__bstate')!;
  const payNode = svg.querySelector<SVGGElement>('[data-node="payments"]')!;
  const status = el.querySelector<HTMLElement>('.y15-mesh__status')!;
  const path = (id: string) => svg.querySelector<SVGPathElement>(`#y15-e-${id}`)!;

  const COLORS = { req: MD.indigo, res: MD.green, event: MD.amber, err: '#e53935' };

  /** Add a packet that travels along an edge (or back along it) to the timeline. */
  function travel(tl: gsap.core.Timeline, edge: string, color: string, at: number, dur = 0.45, back = false): void {
    const p = path(edge);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '6');
    dot.setAttribute('fill', color);
    dot.setAttribute('opacity', '0');
    packets.appendChild(dot);
    const len = p.getTotalLength();
    const t = { v: 0 };
    tl.set(dot, { opacity: 1 }, at)
      .to(
        t,
        {
          v: 1,
          duration: dur,
          ease: 'power1.inOut',
          onUpdate: () => {
            const pt = p.getPointAtLength((back ? 1 - t.v : t.v) * len);
            dot.setAttribute('cx', String(pt.x));
            dot.setAttribute('cy', String(pt.y));
          },
        },
        at,
      )
      .set(dot, { opacity: 0 }, at + dur);
  }

  function setTrace(spans: Span[], resText: string, noteText: string): void {
    rows.innerHTML = traceRows(spans);
    res.textContent = resText;
    note.textContent = noteText;
  }

  let current: gsap.core.Timeline | null = null;

  function normal(): gsap.core.Timeline {
    packets.innerHTML = '';
    setTrace(TRACE_OK, '', '');
    payNode.classList.remove('is-slow');
    breaker.classList.replace('is-open', 'is-closed');
    bstate.textContent = 'CLOSED';
    status.textContent = 'REST · events · a circuit breaker';
    const bars = Array.from(rows.querySelectorAll<HTMLElement>('.y15-trace__track i'));
    gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' });
    const tl = gsap.timeline();
    const bar = (i: number, at: number, dur: number) => tl.to(bars[i], { scaleX: 1, duration: dur, ease: 'none' }, at);
    travel(tl, 'gw-eureka', MD.purple, 0, 0.35, true);
    travel(tl, 'c-gw', COLORS.req, 0.1);
    bar(0, 0.55, 3.0);
    travel(tl, 'gw-orders', COLORS.req, 0.55, 0.4);
    bar(1, 0.75, 2.7);
    travel(tl, 'o-users', COLORS.req, 0.95, 0.3);
    travel(tl, 'o-users', COLORS.res, 1.25, 0.3, true);
    bar(2, 0.95, 0.6);
    travel(tl, 'o-inv', COLORS.req, 1.6, 0.35);
    travel(tl, 'o-inv', COLORS.res, 1.95, 0.3, true);
    bar(3, 1.6, 0.65);
    travel(tl, 'o-pay', COLORS.req, 2.3, 0.35);
    travel(tl, 'o-pay', COLORS.res, 2.65, 0.3, true);
    bar(4, 2.3, 0.65);
    travel(tl, 'gw-orders', COLORS.res, 3.0, 0.4, true);
    travel(tl, 'c-gw', COLORS.res, 3.45, 0.4, true);
    tl.call(() => (res.textContent = '201 Created · 182 ms'), [], 3.85);
    // the event is consumed after the response went out: async, off the request path
    travel(tl, 'o-kafka', COLORS.event, 3.1, 0.35);
    travel(tl, 'k-notify', COLORS.event, 3.9, 0.45);
    bar(5, 3.9, 0.45);
    tl.call(() => (note.textContent = 'notifications ran after the response — async, via Kafka.'), [], 4.4);
    return tl;
  }

  function failure(): gsap.core.Timeline {
    packets.innerHTML = '';
    setTrace(
      TRACE_SLOW,
      '202 Accepted · 886 ms',
      'hystrix.command.payments.execution.isolation.thread.timeoutInMilliseconds=800 — every call waits it out before falling back, and orders’ threads pile up.',
    );
    payNode.classList.add('is-slow');
    status.textContent = 'payments p99: 4.2 s';
    const tl = gsap.timeline();
    // a burst of calls to payments time out (Hystrix timeout configured to 800 ms) and pile up
    for (let k = 0; k < 6; k++) {
      travel(tl, 'o-pay', COLORS.req, k * 0.22, 0.5);
      travel(tl, 'o-pay', COLORS.err, k * 0.22 + 0.55, 0.25, true);
    }
    const err = { v: 0 };
    tl.to(
      err,
      {
        v: 62,
        duration: 1.6,
        ease: 'power1.in',
        onUpdate: () =>
          (status.textContent = `payments error rate ${Math.round(err.v)}% · threshold 50% over 20+ req / 10 s`),
      },
      0.2,
    );
    tl.call(
      () => {
        breaker.classList.replace('is-closed', 'is-open');
        bstate.textContent = 'OPEN';
        setTrace(TRACE_OPEN, '', '');
        res.textContent = '';
      },
      [],
      1.9,
    );
    // the next request fails fast to the fallback inside orders; payments is never called, nothing piles up
    travel(tl, 'c-gw', COLORS.req, 2.2, 0.35);
    travel(tl, 'gw-orders', COLORS.req, 2.55, 0.35);
    travel(tl, 'o-users', COLORS.req, 2.9, 0.25);
    travel(tl, 'o-users', COLORS.res, 3.15, 0.25, true);
    // users, then inventory — in sequence, as the trace shows
    travel(tl, 'o-inv', COLORS.req, 3.4, 0.25);
    travel(tl, 'o-inv', COLORS.res, 3.65, 0.25, true);
    travel(tl, 'gw-orders', COLORS.res, 3.95, 0.3, true);
    travel(tl, 'c-gw', COLORS.res, 4.25, 0.35, true);
    tl.call(
      () => {
        res.textContent = '202 Accepted · 66 ms';
        note.textContent =
          'Circuit open: orders skips payments and runs its fallback (charge queued) in ~1 ms. No timeouts pile up upstream.';
      },
      [],
      4.6,
    );
    return tl;
  }

  function run(kind: 'ok' | 'fail'): void {
    current?.kill();
    current = kind === 'ok' ? normal() : failure();
    if (reducedMotion) current.progress(1);
  }

  el.querySelectorAll<HTMLButtonElement>('[data-run]').forEach((b) =>
    b.addEventListener('click', () => run(b.dataset.run as 'ok' | 'fail')),
  );

  if (reducedMotion) {
    run('ok');
    return;
  }
  // first view: a normal request, then the failure story
  let played = false;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      if (played) return;
      played = true;
      run('ok');
      current!.eventCallback('onComplete', () => setTimeout(() => run('fail'), 1600));
    },
  });
}
