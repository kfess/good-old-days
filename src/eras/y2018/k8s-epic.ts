import { MOBILE_QUERY, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h } from '../../core/util';
import { drawK8sMark } from './k8s-logo';
import { visibleLoop } from './loop';

/*
 * The infra climax: one container becomes a planet-scale fleet.
 * Everything is a pure function of scroll progress `p` (so scrubbing back works),
 * plus ambient time for pulses; after the last beat the cluster becomes clickable.
 */

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/* ---------------- world model ---------------- */

const TILE = 18; // node tile size (world units)
const SLOT = 4; // pod slot pitch inside a tile (4×4 grid)
const POD = 3.1;
const BASE_NODES = 500;
const BASE_PODS = 10; // slots 0..9 before autoscaling
const FULL_PODS = 15; // slots 0..14 after the HPA
const ZONE_START = -2.6; // the failed availability zone begins at this angle (radians) and runs clockwise

interface KNode {
  x: number;
  y: number;
  ring: number;
  ang: number;
  /** 0 (inner) .. 1 (outer), used for ripples */
  dist: number;
  auto: boolean;
  zone: boolean;
  name: string;
}

function buildNodes(): KNode[] {
  const nodes: KNode[] = [];
  let ring = 0;
  while (nodes.length < BASE_NODES + 310) {
    const r = 150 + ring * 26;
    const n = Math.floor((2 * Math.PI * r) / 24);
    const off = hash(ring) * Math.PI;
    for (let k = 0; k < n; k++) {
      const ang = off + (k / n) * Math.PI * 2;
      const a = Math.atan2(Math.sin(ang), Math.cos(ang));
      const auto = nodes.length >= BASE_NODES;
      nodes.push({
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r,
        ring,
        ang: a,
        dist: 0,
        auto,
        zone: false,
        // node IPs live in the three /18 subnets Terraform created (10.0.0.0–10.0.191.255)
        name: `ip-10-0-${(ring * 7 + k) % 192}-${(k * 13 + 17) % 250}`,
      });
    }
    ring++;
  }
  const maxR = Math.hypot(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
  nodes.forEach((n) => (n.dist = (Math.hypot(n.x, n.y) - 150) / (maxR - 150)));
  // three AZs share the 500 base nodes; one AZ (a third of them, by angle) is the one that fails.
  // Node 0 (where the story starts) stays in a healthy AZ.
  const turn = (a: number) => (a - ZONE_START + Math.PI * 4) % (Math.PI * 2);
  nodes
    .map((n, i) => ({ n, i }))
    .filter(({ n, i }) => !n.auto && i !== 0)
    .sort((a, b) => turn(a.n.ang) - turn(b.n.ang))
    .slice(0, Math.floor(BASE_NODES / 3))
    .forEach(({ n }) => (n.zone = true));
  return nodes;
}

const NODES = buildNodes();
const NODE0 = 0;
const APPLY_TARGETS = [9, 22, 31];
const HEALTHY_BASE = NODES.map((n, i) => (!n.auto && !n.zone && i !== NODE0 ? i : -1)).filter((i) => i >= 0);

/** containers per pod: 1–3 (the very first pod holds the one container the story starts with) */
const containersOf = (node: number, slot: number) =>
  node === NODE0 && slot === 0 ? 1 : 1 + Math.floor(hash(node * 16 + slot + 0.5) * 3);
/** what `docker ps` counts on the first node once its pods are up */
const NODE0_CTRS = Array.from({ length: BASE_PODS }, (_, s) => containersOf(NODE0, s)).reduce((a, b) => a + b, 0);

/** pods that lived in the failed zone, and where the scheduler puts them */
interface Flight {
  from: number;
  slot: number;
  to: number;
  toSlot: number;
  t0: number;
}
const ZONE_FLIGHTS: Flight[] = [];
// a stride coprime with the pool size visits every healthy node once per round, so (node, slot) never collides
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const SPREAD = [37, 41, 43, 47, 53].find((m) => gcd(m, HEALTHY_BASE.length) === 1)!;
{
  let k = 0;
  NODES.forEach((n, i) => {
    if (!n.zone) return;
    for (let s = 0; s < BASE_PODS; s++) {
      const to = HEALTHY_BASE[(k * SPREAD) % HEALTHY_BASE.length];
      ZONE_FLIGHTS.push({
        from: i,
        slot: s,
        to,
        toSlot: BASE_PODS + Math.floor(k / HEALTHY_BASE.length),
        t0: 0.458 + hash(k) * 0.03,
      });
      k++;
    }
  });
}
const ZONE_NODES = NODES.filter((n) => n.zone);
const ZONE_COUNT = ZONE_NODES.length;
/** the zone label sits at the circular mean angle of the failed AZ */
const ZONE_MID = Math.atan2(
  ZONE_NODES.reduce((a, n) => a + Math.sin(n.ang), 0),
  ZONE_NODES.reduce((a, n) => a + Math.cos(n.ang), 0),
);
const RESCHEDULED = new Map<string, number>(); // "node:slot" → landing p
ZONE_FLIGHTS.forEach((f) => RESCHEDULED.set(`${f.to}:${f.toSlot}`, f.t0 + 0.022));

const SAT = [
  { name: 'etcd', x: -92, y: 18 },
  { name: 'scheduler', x: 92, y: 18 },
  { name: 'controller-manager', x: 0, y: -96 },
];
// up and to the right of the hub: the top-left belongs to the terminal
const ARGO = { x: 190, y: -165 };

// cloud regions that were live by the end of 2020 (AWS + GCP), at their real locations
const REGIONS: [string, number, number][] = [
  ['us-east-1', 38.9, -77.4],
  ['us-east-2', 40, -83],
  ['us-west-1', 37.4, -121.9],
  ['us-west-2', 45.8, -119.7],
  ['ca-central-1', 45.5, -73.6],
  ['sa-east-1', -23.5, -46.6],
  ['eu-west-1', 53.3, -6.3],
  ['eu-west-2', 51.5, -0.1],
  ['eu-west-3', 48.9, 2.35],
  ['eu-central-1', 50.1, 8.7],
  ['eu-north-1', 59.3, 18.1],
  ['eu-south-1', 45.5, 9.2],
  ['me-south-1', 26.1, 50.6],
  ['af-south-1', -33.9, 18.4],
  ['ap-south-1', 19.1, 72.9],
  ['ap-southeast-1', 1.35, 103.8],
  ['ap-southeast-2', -33.9, 151.2],
  ['ap-east-1', 22.3, 114.2],
  ['ap-northeast-1', 35.7, 139.7],
  ['ap-northeast-2', 37.6, 127],
  ['us-central1', 41.3, -95.9],
  ['us-east4', 39, -77.5],
  ['us-west2', 34.1, -118.2],
  ['us-west4', 36.2, -115.1],
  ['northamerica-northeast1', 45.5, -73.6],
  ['southamerica-east1', -23.5, -46.8],
  ['europe-west2', 51.5, -0.1],
  ['europe-west3', 50.1, 8.7],
  ['europe-west4', 53.4, 6.8],
  ['europe-north1', 60.6, 27.2],
  ['asia-south1', 19.1, 72.9],
  ['asia-southeast2', -6.2, 106.8],
  ['asia-east1', 24.1, 120.5],
  ['asia-northeast1', 35.7, 139.7],
  ['asia-northeast3', 37.6, 127],
  ['australia-southeast1', -33.9, 151.2],
];

/* ---------------- copy, per beat ---------------- */

interface Beat {
  at: number;
  title: string;
  sub: string;
  term: string[];
}
const BEATS: Beat[] = [
  {
    at: 0,
    title: 'One container.',
    sub: 'An image, a process, an isolated little world.',
    term: ['$ docker run -d -p 80:80 nginx', 'a3f9c2e1b7d4…'],
  },
  {
    at: 0.032,
    title: 'Then, a crowd.',
    sub: 'Containers, grouped into pods. Who keeps them all running?',
    term: ['$ docker ps -q | wc -l', String(NODE0_CTRS)],
  },
  {
    at: 0.085,
    title: 'The heart of the cluster.',
    sub: 'Every change, every watch, every heartbeat goes through the kube-apiserver.',
    term: ['PR #482 merged into master', 'Argo CD ▸ app/web  OutOfSync', 'Argo CD ▸ sync → kube-apiserver'],
  },
  {
    at: 0.24,
    title: 'Declare 5,000. Get 5,000.',
    sub: 'One line in Git. The control plane does the rest.',
    term: [
      '  kind: HorizontalPodAutoscaler',
      '- minReplicas: 3',
      '+ minReplicas: 5000',
      'Argo CD ▸ Synced · Progressing',
    ],
  },
  {
    at: 0.42,
    title: 'A whole zone went dark.',
    sub: 'The control plane noticed. Every lost pod was replaced on a healthy node. Uptime never moved.',
    term: [
      '$ kubectl get nodes | grep NotReady | wc -l',
      String(ZONE_COUNT),
      'node-controller ▸ evicting pods…',
      `replicaset-controller ▸ ${fmt(ZONE_COUNT * BASE_PODS)} pods recreated`,
    ],
  },
  {
    at: 0.56,
    title: 'Rolling update. Zero downtime.',
    sub: 'v1 to v2 across thousands of pods, while traffic keeps flowing.',
    term: ['- image: web:1.9.4', '+ image: web:2.0.0', 'Argo CD ▸ Synced · Healthy'],
  },
  {
    at: 0.68,
    title: 'Traffic spike? More pods. More nodes.',
    sub: 'The HPA adds pods. The Cluster Autoscaler adds machines.',
    term: [
      '$ kubectl get hpa web',
      'NAME   REFERENCE        TARGETS    MINPODS   MAXPODS   REPLICAS   AGE',
      'web    Deployment/web   165%/60%   5000      13725     5000       212d',
      'horizontal-pod-autoscaler ▸ New size: 10000; reason: cpu resource utilization (percentage of request) above target',
      'horizontal-pod-autoscaler ▸ New size: 13725; reason: cpu resource utilization (percentage of request) above target',
      'cluster-autoscaler ▸ scale-up: 500 → 915 nodes',
    ],
  },
  {
    at: 0.8,
    title: '“Everything at Google runs in a container.”',
    sub: '“We start over two billion containers a week.” — Google, 2014',
    term: [],
  },
  {
    at: 0.915,
    title: 'You declare. It reconciles. Forever.',
    sub: 'Click any node to kill it.',
    term: ['$ kubectl get pods -A -w'],
  },
];

/* ---------------- the component ---------------- */

export function createK8sEpic(parent: HTMLElement): void {
  const el = h(`
    <div class="kx">
      <div class="kx__pin">
        <canvas class="kx__canvas" aria-label="A Kubernetes cluster scaling from one container to thousands of pods"></canvas>
        <div class="kx__term" aria-hidden="true"><div class="kx__term-bar"><i></i><i></i><i></i><span>prod · us-east-1</span></div><pre class="kx__term-body"></pre></div>
        <div class="kx__copy">
          <p class="kx__kicker">Kubernetes · at scale</p>
          <h3 class="kx__title"></h3>
          <p class="kx__sub"></p>
        </div>
        <dl class="kx__stats">
          <div><dt>containers</dt><dd data-k="c">0</dd></div>
          <div><dt>pods</dt><dd data-k="p">0</dd></div>
          <div><dt>nodes</dt><dd data-k="n">0</dd></div>
          <div><dt>req / s</dt><dd data-k="r">0</dd></div>
          <div class="kx__uptime"><dt>uptime</dt><dd data-k="u">100.00%</dd></div>
        </dl>
      </div>
    </div>`);
  parent.appendChild(el);

  const pin = el.querySelector<HTMLElement>('.kx__pin')!;
  const canvas = el.querySelector<HTMLCanvasElement>('.kx__canvas')!;
  const ctx = canvas.getContext('2d')!;
  const glow = document.createElement('canvas');
  const gctx = glow.getContext('2d')!;
  const titleEl = el.querySelector<HTMLElement>('.kx__title')!;
  const subEl = el.querySelector<HTMLElement>('.kx__sub')!;
  const termEl = el.querySelector<HTMLElement>('.kx__term-body')!;
  const termBox = el.querySelector<HTMLElement>('.kx__term')!;
  const copyBox = el.querySelector<HTMLElement>('.kx__copy')!;
  const statsBox = el.querySelector<HTMLElement>('.kx__stats')!;
  const stat = (k: string) => el.querySelector<HTMLElement>(`[data-k="${k}"]`)!;
  const sC = stat('c');
  const sP = stat('p');
  const sN = stat('n');
  const sR = stat('r');

  let W = 0;
  let H = 0;
  let dpr = 1;
  const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

  /*
   * The cluster lives in the screen area the HTML leaves free: right of the terminal/copy column on
   * desktop, between the stats row and the copy on phones. `layT` is that target; `lay` eases toward it
   * so a beat whose copy is taller moves the disc smoothly instead of snapping.
   */
  type Box = { l: number; t: number; r: number; b: number };
  const lay = { cx: 0, cy: 0, fit: 0 };
  const layT = { cx: 0, cy: 0, fit: 0 };
  let avoid: Box[] = []; // HTML the canvas labels must stay off
  const rel = (e: HTMLElement): Box => {
    const a = e.getBoundingClientRect();
    const o = pin.getBoundingClientRect();
    return { l: a.left - o.left, t: a.top - o.top, r: a.right - o.left, b: a.bottom - o.top };
  };
  const measure = (snap: boolean) => {
    const stats = rel(statsBox);
    const quote = el.classList.contains('is-quote');
    if (isMobile()) {
      const y0 = stats.b + 14;
      // the quote beat centres the copy; keep the last layout rather than squeezing the disc around it
      const y1 = quote ? layT.cy * 2 - y0 : rel(copyBox).t - 12;
      layT.cx = W / 2;
      layT.cy = (y0 + y1) / 2;
      layT.fit = Math.max(80, Math.min(W * 0.46, (y1 - y0) / 2));
    } else {
      const left = rel(termBox).r + 28;
      const right = stats.r - 170;
      const y0 = 84;
      const y1 = H - 28;
      layT.cx = (left + right) / 2;
      layT.cy = (y0 + y1) / 2;
      // the tilted disc is an ellipse, so it may reach a little past the column edges at mid-height
      layT.fit = Math.max(120, Math.min((right - left) * 0.58, (y1 - y0) / 2));
    }
    avoid = [stats, rel(copyBox)];
    if (!termBox.classList.contains('is-empty')) avoid.push(rel(termBox));
    if (snap) Object.assign(lay, layT);
  };
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = pin.clientWidth;
    H = pin.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    glow.width = Math.max(1, Math.round(W / 4));
    glow.height = Math.max(1, Math.round(H / 4));
    measure(true);
  };
  resize();
  window.addEventListener('resize', resize);

  /* -------- interaction (after the last beat) -------- */
  const killed = new Map<number, number>(); // node → time of kill
  const extra: { from: number; slot: number; to: number; t0: number }[] = [];
  const extraTaken = new Set<number>();
  let screenPos: Float32Array = new Float32Array(NODES.length * 3);
  let toast = '';
  let toastAt = 0;

  /* -------- scroll progress -------- */
  let target = reducedMotion ? 0.97 : 0;
  let p = target;
  if (!reducedMotion) {
    ScrollTrigger.create({
      trigger: pin,
      pin: true,
      start: 'top top',
      end: () => `+=${window.innerHeight * 4.6}`,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => (target = self.progress),
    });
  }

  canvas.addEventListener('click', (e) => {
    if (p < 0.93) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    let best = -1;
    let bd = 900;
    for (let i = 0; i < NODES.length; i++) {
      if (screenPos[i * 3 + 2] <= 0 || killed.has(i)) continue;
      const d = (screenPos[i * 3] - mx) ** 2 + (screenPos[i * 3 + 1] - my) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (best < 0) return;
    const now = performance.now();
    killed.set(best, now);
    let moved = 0;
    for (let s = 0; s < FULL_PODS; s++) {
      let to = -1;
      for (let tries = 0; tries < 40; tries++) {
        const c = Math.floor(Math.random() * NODES.length);
        if (c !== best && !killed.has(c) && !extraTaken.has(c)) {
          to = c;
          break;
        }
      }
      if (to < 0) break;
      extraTaken.add(to);
      extra.push({ from: best, slot: s, to, t0: now + 450 + s * 40 });
      moved++;
    }
    toast = `${NODES[best].name}  NotReady → ${moved} pods replaced`;
    toastAt = now;
    el.classList.add('is-poked');
  });

  /* -------- per-frame -------- */
  let beatShown = -1;
  let lastStats = '';
  const termCache: string[] = [];

  const updateCopy = (now: number) => {
    let b = 0;
    for (let i = 0; i < BEATS.length; i++) if (p >= BEATS[i].at) b = i;
    if (b !== beatShown) {
      beatShown = b;
      titleEl.textContent = BEATS[b].title;
      subEl.textContent = BEATS[b].sub;
      el.dataset.beat = String(b);
      el.classList.toggle('is-quote', b === 7);
      el.classList.toggle('is-live', b === 8);
      termCache.length = 0;
      // the copy just changed size: re-fit after layout
      requestAnimationFrame(() => measure(false));
    }
    if (b === 8 && toast && now - toastAt < 4000) subEl.textContent = toast;
    else if (b === 8) subEl.textContent = BEATS[8].sub;
    // terminal lines type themselves in within the beat
    const beat = BEATS[b];
    const next = BEATS[b + 1]?.at ?? 1;
    const local = seg(p, beat.at, beat.at + (next - beat.at) * 0.55);
    const lines = beat.term;
    termBox.classList.toggle('is-empty', lines.length === 0);
    const total = lines.reduce((a, l) => a + l.length, 0);
    let budget = Math.round(local * total);
    const out: string[] = [];
    for (const l of lines) {
      if (budget <= 0) break;
      out.push(l.slice(0, budget));
      budget -= l.length;
    }
    const txt = out.join('\n');
    if (termCache[0] !== txt) {
      termCache[0] = txt;
      termEl.textContent = txt;
    }
  };

  const frame = (now: number) => {
    p += (target - p) * (reducedMotion ? 1 : 0.14);
    if (Math.abs(target - p) < 0.00005) p = target;
    const k = reducedMotion ? 1 : 0.08;
    lay.cx += (layT.cx - lay.cx) * k;
    lay.cy += (layT.cy - lay.cy) * k;
    lay.fit += (layT.fit - lay.fit) * k;
    updateCopy(now);
    draw(now);
  };

  /* -------- drawing -------- */

  const hits = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  /** a label on a dark backing pill, kept inside the canvas; returns its box */
  const pill = (
    c: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fs: number,
    fg: string,
    edge = 'rgba(120,150,240,0.35)',
  ): Box => {
    const w = c.measureText(text).width + fs * 1.1;
    const hgt = fs * 1.7;
    const l = clamp(x - w / 2, 8, W - w - 8);
    const t = y - hgt / 2;
    c.fillStyle = 'rgba(7,11,26,0.82)';
    c.strokeStyle = edge;
    c.lineWidth = 1;
    c.beginPath();
    c.roundRect(l, t, w, hgt, hgt / 2);
    c.fill();
    c.stroke();
    c.fillStyle = fg;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, l + w / 2, y + 0.5);
    c.textBaseline = 'alphabetic';
    return { l, t, r: l + w, b: t + hgt };
  };

  function draw(now: number) {
    const t = now / 1000;
    const c = ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // background
    const bg = c.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, Math.max(W, H) * 0.75);
    bg.addColorStop(0, '#0f1a3a');
    bg.addColorStop(0.55, '#0a1024');
    bg.addColorStop(1, '#070b18');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    const live = p >= 0.9;
    // ---- camera ----
    const fitBase = lay.fit;
    const zIn = seg(p, 0.035, 0.12); // container → control plane
    const zOut = seg(p, 0.24, 0.4); // control plane → fleet
    const zAuto = seg(p, 0.68, 0.78);
    let Rvis = Math.exp(lerp(Math.log(5), Math.log(26), ease(seg(p, 0.0, 0.07))));
    Rvis = Math.exp(lerp(Math.log(Rvis), Math.log(215), ease(zIn)));
    Rvis = lerp(Rvis, 375, ease(zOut));
    Rvis = lerp(Rvis, 455, ease(zAuto));
    const worldMix = ease(seg(p, 0.8, 0.85)) * (1 - ease(seg(p, 0.895, 0.935)));
    const n0 = NODES[NODE0];
    const pod0x = n0.x - 6;
    const pod0y = n0.y - 6;
    const focus = ease(seg(p, 0.06, 0.13));
    const camX = lerp(pod0x, 0, focus);
    const camY = lerp(pod0y, 0, focus);
    const tilt = 0.95 * ease(seg(p, 0.26, 0.4)) * (1 - worldMix);
    const rot = 0.55 * ease(seg(p, 0.26, 0.92)) + (p > 0.3 ? t * 0.025 : 0);
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    // world view: the whole cluster shrinks onto its region on a map
    const mapX = (lon: number) => W / 2 + (lon / 180) * W * 0.46;
    const mapY = (lat: number) => H * 0.5 - (lat / 90) * H * 0.62;
    const homeX = lerp(lay.cx, mapX(REGIONS[0][2]), worldMix);
    const tiltK = tilt / 0.95;
    // a tilted disc's near edge grows toward the viewer: lift it and pull back a little
    const homeY = lerp(lay.cy - tiltK * fitBase * 0.2, mapY(REGIONS[0][1]), worldMix);
    const scale = lerp((fitBase / Rvis) * (1 - 0.2 * tiltK), 16 / 520, worldMix);

    const F = 900;
    let sx = 0;
    let sy = 0;
    let ss = 0;
    const project = (wx: number, wy: number) => {
      const x = wx - camX;
      const y = wy - camY;
      const xr = x * cosR - y * sinR;
      const yr = x * sinR + y * cosR;
      const z = -yr * sinT; // near side (screen bottom) comes toward the viewer
      const s = F / (F + z * 1.4);
      sx = homeX + xr * s * scale;
      sy = homeY + yr * cosT * s * scale;
      ss = s * scale;
    };

    // ---- world map backdrop ----
    if (worldMix > 0.01) {
      c.globalAlpha = worldMix;
      c.strokeStyle = 'rgba(120,150,230,0.12)';
      c.lineWidth = 1;
      c.beginPath();
      for (let lon = -180; lon <= 180; lon += 30) {
        c.moveTo(mapX(lon), mapY(75));
        c.lineTo(mapX(lon), mapY(-60));
      }
      for (let lat = -60; lat <= 75; lat += 15) {
        c.moveTo(mapX(-180), mapY(lat));
        c.lineTo(mapX(180), mapY(lat));
      }
      c.stroke();
      // federation traffic between regions
      c.strokeStyle = 'rgba(80,140,255,0.35)';
      c.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = REGIONS[(i * 7) % REGIONS.length];
        const b = REGIONS[(i * 11 + 5) % REGIONS.length];
        const ax = mapX(a[2]);
        const ay = mapY(a[1]);
        const bx = mapX(b[2]);
        const by = mapY(b[1]);
        const mx = (ax + bx) / 2;
        const my = Math.min(ay, by) - Math.abs(ax - bx) * 0.18;
        c.moveTo(ax, ay);
        c.quadraticCurveTo(mx, my, bx, by);
      }
      c.stroke();
      // other clusters; a label is dropped if it would land on another label or on the HTML
      const placed: Box[] = [...avoid];
      c.font = `500 ${isMobile() ? 8 : 9}px Poppins, Inter, sans-serif`;
      REGIONS.forEach(([name, lat, lon], i) => {
        if (i === 0) return;
        const x = mapX(lon);
        const y = mapY(lat);
        const pulse = 0.6 + 0.4 * Math.sin(t * 2 + i);
        c.fillStyle = `rgba(70,130,255,${0.18 * pulse})`;
        c.beginPath();
        c.arc(x, y, 13, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(150,190,255,0.9)';
        for (let k = 0; k < 28; k++) {
          const a = (k / 28) * Math.PI * 2 + t * 0.4 + i;
          const rr = 4 + (k % 3) * 3;
          c.fillRect(x + Math.cos(a) * rr - 0.8, y + Math.sin(a) * rr * 0.8 - 0.8, 1.6, 1.6);
        }
        const fs = isMobile() ? 8 : 9;
        const w = c.measureText(name).width;
        const box = { l: x + 8, t: y - 9 - fs - 2, r: x + 12 + w, b: y - 9 + 3 };
        if (box.r < W - 6 && box.t > 0 && !placed.some((q) => hits(q, box))) {
          placed.push(box);
          c.fillStyle = 'rgba(160,180,230,0.6)';
          c.fillText(name, x + 10, y - 9);
        }
      });
      c.globalAlpha = 1;
    }

    // ---- nodes ----
    const nodeVis = (i: number): number => {
      const n = NODES[i];
      if (i === NODE0) return seg(p, 0.035, 0.06);
      if (n.ring === 0) return seg(p, 0.085 + hash(i) * 0.02, 0.105 + hash(i) * 0.02);
      if (n.auto) return seg(p, 0.69 + n.dist * 0.05, 0.71 + n.dist * 0.05);
      return seg(p, 0.245 + n.dist * 0.09, 0.26 + n.dist * 0.09);
    };
    // zone failure: red flash → dark → back (empty)
    const zoneState = (n: KNode) => {
      if (!n.zone) return 0;
      if (p < 0.438 || p > 0.535) return 0;
      return p < 0.452 ? 1 : 2;
    };

    if (screenPos.length !== NODES.length * 3) screenPos = new Float32Array(NODES.length * 3);
    const sp = screenPos;
    // batched paths
    const tilesOk = new Path2D();
    const tilesBad = new Path2D();
    const tilesDead = new Path2D();
    const watch = new Path2D();
    const showWatch = p > 0.1 && worldMix < 0.9;
    let nodeCount = 0;
    let hubX = 0;
    let hubY = 0;
    let hubS = 0;
    project(0, 0);
    hubX = sx;
    hubY = sy;
    hubS = ss;

    for (let i = 0; i < NODES.length; i++) {
      const n = NODES[i];
      const v = nodeVis(i);
      let ax = n.x;
      let ay = n.y;
      if (n.auto && v < 1) {
        const k = 1 + (1 - ease(v)) * 0.35;
        ax *= k;
        ay *= k;
      }
      project(ax, ay);
      sp[i * 3] = sx;
      sp[i * 3 + 1] = sy;
      sp[i * 3 + 2] = v;
      if (v <= 0) continue;
      const killedAt = live ? killed.get(i) : undefined;
      const dead = killedAt !== undefined && now - killedAt < 3200;
      const zs = zoneState(n);
      const half = (TILE / 2) * ss;
      const target2 = zs === 1 || (dead && now - killedAt! < 500) ? tilesBad : zs === 2 || dead ? tilesDead : tilesOk;
      if (half > 0.6) target2.rect(sx - half, sy - half * (1 - tilt * 0.35), half * 2, half * 2 * (1 - tilt * 0.35));
      if (zs === 0 && !dead) nodeCount += v >= 1 ? 1 : 0;
      if (showWatch && zs === 0 && !dead) {
        watch.moveTo(sx, sy);
        watch.lineTo(hubX, hubY);
      }
    }
    c.globalAlpha = 1 - worldMix * 0.2;
    c.lineWidth = 1;
    c.fillStyle = 'rgba(50,108,229,0.07)';
    c.strokeStyle = 'rgba(110,150,240,0.28)';
    c.fill(tilesOk);
    c.stroke(tilesOk);
    c.fillStyle = 'rgba(255,70,90,0.35)';
    c.strokeStyle = 'rgba(255,90,110,0.9)';
    c.fill(tilesBad);
    c.stroke(tilesBad);
    c.fillStyle = 'rgba(60,20,32,0.55)';
    c.strokeStyle = 'rgba(255,90,110,0.45)';
    c.fill(tilesDead);
    c.stroke(tilesDead);
    // the failed zone, labelled
    const zA = seg(p, 0.438, 0.446) * (1 - seg(p, 0.52, 0.535));
    if (zA > 0) {
      const mid = ZONE_MID;
      // just past the rim of the base fleet, so it never sits red-on-red over the failed tiles
      const lr = 372;
      project(Math.cos(mid) * lr, Math.sin(mid) * lr);
      c.globalAlpha = zA;
      const fs = isMobile() ? 11 : 13;
      c.font = `700 ${fs}px Poppins, Inter, sans-serif`;
      pill(
        c,
        p < 0.452 ? 'us-east-1b  ·  NotReady' : `us-east-1b  ·  ${ZONE_COUNT} nodes down`,
        sx,
        Math.max(sy, 96),
        fs,
        '#ff8094',
        'rgba(255,90,110,0.7)',
      );
      c.textAlign = 'left';
    }
    if (showWatch) {
      c.strokeStyle = `rgba(80,140,255,${0.035 + 0.03 * Math.sin(t * 3)})`;
      c.stroke(watch);
    }
    c.globalAlpha = 1;

    // ---- pods ----
    const v1 = new Path2D();
    const v2 = new Path2D();
    const flash = new Path2D();
    const pend = new Path2D();
    let podCount = 0;
    let ctrCount = 0;
    const detail = POD * (fitBase / Rvis) > 22 && worldMix < 0.01;
    const details: [number, number, number, number, boolean][] = [];

    const podAlpha = (i: number, s: number): number => {
      const n = NODES[i];
      // rescheduled-in pods (zone failure)
      const land = RESCHEDULED.get(`${i}:${s}`);
      if (land !== undefined) return p >= land ? 1 : 0;
      if (i === NODE0) {
        if (s >= BASE_PODS) return seg(p, 0.7 + s * 0.004, 0.71 + s * 0.004);
        if (s === 0) return 1;
        return seg(p, 0.03 + s * 0.004, 0.036 + s * 0.004);
      }
      const h0 = hash(i * 16 + s);
      if (n.auto)
        return s < FULL_PODS ? seg(p, 0.735 + n.dist * 0.03 + h0 * 0.02, 0.745 + n.dist * 0.03 + h0 * 0.02) : 0;
      if (n.zone) {
        if (s >= FULL_PODS) return 0;
        const before = s < BASE_PODS ? seg(p, 0.27 + n.dist * 0.1 + h0 * 0.03, 0.28 + n.dist * 0.1 + h0 * 0.03) : 0;
        const gone = p > 0.442 + h0 * 0.008 ? 0 : 1;
        const refill = seg(p, 0.7 + n.dist * 0.05 + h0 * 0.02, 0.71 + n.dist * 0.05 + h0 * 0.02);
        return p < 0.6 ? before * gone : refill;
      }
      if (s >= FULL_PODS) return 0;
      if (s < BASE_PODS) {
        if (n.ring === 0 && APPLY_TARGETS.includes(i) && s === 0) return seg(p, 0.205, 0.215);
        return seg(p, 0.27 + n.dist * 0.1 + h0 * 0.03, 0.28 + n.dist * 0.1 + h0 * 0.03);
      }
      return seg(p, 0.7 + n.dist * 0.05 + h0 * 0.02, 0.71 + n.dist * 0.05 + h0 * 0.02);
    };

    for (let i = 0; i < NODES.length; i++) {
      if (sp[i * 3 + 2] <= 0 && i !== NODE0) continue;
      const n = NODES[i];
      const killedAt = live ? killed.get(i) : undefined;
      if (killedAt !== undefined && now - killedAt > 350) continue;
      const switchAt = 0.575 + 0.085 * ((n.ang + Math.PI) / (Math.PI * 2));
      let ax = n.x;
      let ay = n.y;
      if (n.auto) {
        const v = nodeVis(i);
        const k = 1 + (1 - ease(v)) * 0.35;
        ax *= k;
        ay *= k;
      }
      for (let s = 0; s < 16; s++) {
        let a = podAlpha(i, s);
        if (live && s === 15) a = 0;
        if (a <= 0) continue;
        const px = ax - 6 + (s % 4) * SLOT;
        const py = ay - 6 + Math.floor(s / 4) * SLOT;
        project(px, py);
        const size = POD * ss * (0.4 + 0.6 * a);
        podCount += a >= 1 ? 1 : 0;
        ctrCount += a >= 1 ? containersOf(i, s) : 0;
        if (detail) {
          details.push([sx, sy, size, containersOf(i, s), p > switchAt]);
          continue;
        }
        const half = Math.max(0.6, size / 2);
        const dSw = p - switchAt;
        const target3 = a < 1 ? pend : dSw > 0 && dSw < 0.006 ? flash : dSw > 0 ? v2 : v1;
        target3.rect(sx - half, sy - half, half * 2, half * 2);
      }
    }
    // pods moved by clicks
    if (live) {
      for (const e of extra) {
        if (now < e.t0 + 700) continue;
        const n = NODES[e.to];
        project(n.x - 6 + 3 * SLOT, n.y - 6 + 3 * SLOT);
        const half = Math.max(0.6, (POD * ss) / 2);
        v2.rect(sx - half, sy - half, half * 2, half * 2);
        podCount++;
        ctrCount += containersOf(e.from, e.slot);
      }
    }

    c.globalCompositeOperation = 'lighter';
    c.fillStyle = '#3f7bff';
    c.fill(v1);
    c.fillStyle = '#2fd6b5';
    c.fill(v2);
    c.fillStyle = '#ffffff';
    c.fill(flash);
    c.fillStyle = 'rgba(255,214,102,0.9)';
    c.fill(pend);
    c.globalCompositeOperation = 'source-over';

    // close-up: pods drawn as outlines holding 1–3 container glyphs
    if (detail) {
      for (const [x, y, size, nC, isV2] of details) {
        const pad = size * 0.1;
        c.strokeStyle = 'rgba(160,190,255,0.8)';
        c.lineWidth = Math.max(1, size * 0.025);
        c.setLineDash([size * 0.06, size * 0.04]);
        c.strokeRect(x - size / 2, y - size / 2, size, size);
        c.setLineDash([]);
        const cw = (size - pad * 2 - (nC - 1) * pad * 0.6) / nC;
        for (let k = 0; k < nC; k++) {
          const cx = x - size / 2 + pad + k * (cw + pad * 0.6);
          const cy = y - size / 2 + pad;
          const chh = size - pad * 2;
          c.fillStyle = isV2 ? '#2fd6b5' : '#2f86ff';
          c.fillRect(cx, cy, cw, chh);
          c.fillStyle = 'rgba(255,255,255,0.18)';
          c.fillRect(cx, cy, cw, chh * 0.12);
          c.strokeStyle = 'rgba(0,20,60,0.45)';
          c.lineWidth = Math.max(1, cw * 0.05);
          c.beginPath();
          for (let r = 1; r < 5; r++) {
            const rx = cx + (cw * r) / 5;
            c.moveTo(rx, cy + chh * 0.18);
            c.lineTo(rx, cy + chh * 0.92);
          }
          c.stroke();
        }
      }
      if (seg(p, 0.035, 0.06) > 0) {
        project(n0.x, n0.y - TILE / 2 - 2.5);
        c.globalAlpha = seg(p, 0.035, 0.06);
        c.fillStyle = 'rgba(190,210,255,0.9)';
        c.font = `600 ${Math.min(22, Math.max(11, ss * 1.6))}px Poppins, Inter, sans-serif`;
        c.textAlign = 'center';
        c.fillText(NODES[0].name, sx, sy);
        c.textAlign = 'left';
        c.globalAlpha = 1;
      }
    }

    // ---- flights: pods rescheduled through the control plane ----
    const flights: { x0: number; y0: number; x1: number; y1: number; u: number }[] = [];
    for (const f of ZONE_FLIGHTS) {
      const u = seg(p, f.t0, f.t0 + 0.022);
      if (u <= 0 || u >= 1) continue;
      const a = NODES[f.from];
      const b = NODES[f.to];
      project(a.x - 6 + (f.slot % 4) * SLOT, a.y - 6 + Math.floor(f.slot / 4) * SLOT);
      const x0 = sx;
      const y0 = sy;
      project(b.x - 6 + (f.toSlot % 4) * SLOT, b.y - 6 + Math.floor(f.toSlot / 4) * SLOT);
      flights.push({ x0, y0, x1: sx, y1: sy, u });
    }
    if (live) {
      for (const e of extra) {
        const u = clamp((now - e.t0) / 700);
        if (u <= 0 || u >= 1) continue;
        const a = NODES[e.from];
        const b = NODES[e.to];
        project(a.x, a.y);
        const x0 = sx;
        const y0 = sy;
        project(b.x, b.y);
        flights.push({ x0, y0, x1: sx, y1: sy, u });
      }
    }
    if (flights.length) {
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round';
      for (const f of flights) {
        // quadratic through the API server: every reschedule is an API call
        const cx = hubX;
        const cy = hubY;
        const pt = (u: number) => {
          const m = 1 - u;
          return [m * m * f.x0 + 2 * m * u * cx + u * u * f.x1, m * m * f.y0 + 2 * m * u * cy + u * u * f.y1];
        };
        const e = ease(f.u);
        const [x, y] = pt(e);
        const [tx, ty] = pt(Math.max(0, e - 0.12));
        const g = c.createLinearGradient(tx, ty, x, y);
        g.addColorStop(0, 'rgba(255,214,102,0)');
        g.addColorStop(1, 'rgba(255,214,102,0.9)');
        c.strokeStyle = g;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(tx, ty);
        c.quadraticCurveTo(lerp(tx, x, 0.5) + (cx - x) * 0.04, lerp(ty, y, 0.5) + (cy - y) * 0.04, x, y);
        c.stroke();
        c.fillStyle = '#fff3c4';
        c.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
      c.globalCompositeOperation = 'source-over';
    }

    // ---- watch streams: pulses flowing into the API server ----
    if (showWatch) {
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(120,180,255,0.85)';
      const step = isMobile() ? 3 : 1;
      for (let i = 0; i < NODES.length; i += step) {
        if (sp[i * 3 + 2] < 1) continue;
        const u = (t * 0.45 + hash(i + 0.3)) % 1;
        const x = lerp(sp[i * 3], hubX, u);
        const y = lerp(sp[i * 3 + 1], hubY, u);
        const s2 = 1 + u * 1.2;
        c.fillRect(x - s2 / 2, y - s2 / 2, s2, s2);
      }
      c.globalCompositeOperation = 'source-over';
    }

    // ---- control plane ----
    const cpA = seg(p, 0.075, 0.12) * (1 - worldMix);
    if (cpA > 0) {
      c.globalAlpha = cpA;
      const beat = Math.exp(-((t % 0.95) / 0.12));
      const R = Math.max(18, 40 * hubS) * (1 + beat * 0.06);
      // shockwave rings: the heartbeat
      for (let k = 0; k < 3; k++) {
        const ph = (t / 0.95 + k / 3) % 1;
        c.strokeStyle = `rgba(90,150,255,${0.35 * (1 - ph)})`;
        c.lineWidth = 1.5;
        c.beginPath();
        c.ellipse(hubX, hubY, R * (1 + ph * 2.6), R * (1 + ph * 2.6) * (1 - tilt * 0.45), 0, 0, Math.PI * 2);
        c.stroke();
      }
      // satellites
      c.font = `500 ${Math.max(10, Math.min(13, 7 * hubS))}px Poppins, Inter, sans-serif`;
      c.textAlign = 'center';
      for (const s of SAT) {
        project(s.x, s.y);
        const r = Math.max(7, 13 * ss);
        c.strokeStyle = 'rgba(110,160,255,0.5)';
        c.lineWidth = 1.5;
        c.setLineDash([4, 5]);
        c.lineDashOffset = -t * 30;
        c.beginPath();
        c.moveTo(hubX, hubY);
        c.lineTo(sx, sy);
        c.stroke();
        c.setLineDash([]);
        const g = c.createRadialGradient(sx, sy, 0, sx, sy, r * 1.8);
        g.addColorStop(0, 'rgba(120,170,255,0.9)');
        g.addColorStop(0.5, 'rgba(50,108,229,0.45)');
        g.addColorStop(1, 'rgba(50,108,229,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(sx, sy, r * 1.8, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#0b1430';
        c.beginPath();
        c.arc(sx, sy, r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = 'rgba(140,180,255,0.9)';
        c.stroke();
        if (r > 9) {
          c.fillStyle = 'rgba(200,215,255,0.92)';
          c.fillText(s.name, sx, s.y < 0 ? sy - r - 8 : sy + r + 14);
        }
      }
      // Argo CD → API server
      if (p < 0.68) {
        project(ARGO.x, ARGO.y);
        const ax = sx;
        const ay = sy;
        const ar = Math.max(6, 10 * ss);
        c.fillStyle = 'rgba(239,123,77,0.25)';
        c.beginPath();
        c.arc(ax, ay, ar * 2, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ef7b4d';
        c.beginPath();
        c.arc(ax, ay, ar, 0, Math.PI * 2);
        c.fill();
        // on phones the label would sit on the stats row; the terminal already names Argo CD
        if (ar > 7 && !isMobile()) {
          c.fillStyle = 'rgba(255,220,200,0.95)';
          c.fillText('Argo CD', ax, ay - ar - 8);
        }
        c.strokeStyle = 'rgba(239,123,77,0.35)';
        c.setLineDash([3, 6]);
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(hubX, hubY);
        c.stroke();
        c.setLineDash([]);
      }
      // the hub
      const g = c.createRadialGradient(hubX, hubY, 0, hubX, hubY, R * 3.2);
      g.addColorStop(0, 'rgba(160,200,255,0.95)');
      g.addColorStop(0.25, 'rgba(70,130,255,0.7)');
      g.addColorStop(0.6, 'rgba(50,108,229,0.18)');
      g.addColorStop(1, 'rgba(50,108,229,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(hubX, hubY, R * 3.2, 0, Math.PI * 2);
      c.fill();
      // the official Kubernetes mark: the heptagon stays upright; the wheel turns one spoke
      // (2π/7) at a time and rests in the official pose, so every resting frame matches the logo
      const cycle = t / 2.6;
      const tick = Math.min(1, (cycle - Math.floor(cycle)) / 0.28);
      const spin = (Math.floor(cycle) + (1 - (1 - tick) ** 3)) * ((Math.PI * 2) / 7);
      drawK8sMark(c, hubX, hubY, R * 2.3, spin);
      // label
      const fs = Math.max(12, Math.min(22, R * 0.38));
      c.font = `700 ${fs}px Poppins, Inter, sans-serif`;
      c.fillStyle = '#ffffff';
      c.shadowColor = 'rgba(80,140,255,0.9)';
      c.shadowBlur = 14;
      c.fillText('kube-apiserver', hubX, hubY - R - 12);
      c.shadowBlur = 0;
      c.textAlign = 'left';
      c.globalAlpha = 1;
    }

    // ---- the GitOps request path (Argo CD → API → etcd → scheduler → kubelets) ----
    if (p > 0.12 && p < 0.23) {
      // a point on screen: project() leaves its result in sx/sy
      const at = (x: number, y: number): [number, number] => {
        project(x, y);
        return [sx, sy];
      };
      const legs: [number, number, () => [number, number], () => [number, number]][] = [
        [0.125, 0.145, () => at(ARGO.x, ARGO.y), () => [hubX, hubY]],
        [0.148, 0.16, () => [hubX, hubY], () => at(SAT[0].x, SAT[0].y)],
        [0.16, 0.17, () => at(SAT[0].x, SAT[0].y), () => [hubX, hubY]],
        [0.172, 0.182, () => [hubX, hubY], () => at(SAT[1].x, SAT[1].y)],
        [0.182, 0.19, () => at(SAT[1].x, SAT[1].y), () => [hubX, hubY]],
      ];
      APPLY_TARGETS.forEach((n) => legs.push([0.191, 0.204, () => [hubX, hubY], () => at(NODES[n].x, NODES[n].y)]));
      c.globalCompositeOperation = 'lighter';
      for (const [a, b, from, to] of legs) {
        const u = seg(p, a, b);
        if (u <= 0 || u >= 1) continue;
        const [x0, y0] = from();
        const [x1, y1] = to();
        const x = lerp(x0, x1, ease(u));
        const y = lerp(y0, y1, ease(u));
        const tail = c.createLinearGradient(
          lerp(x0, x1, Math.max(0, ease(u) - 0.25)),
          lerp(y0, y1, Math.max(0, ease(u) - 0.25)),
          x,
          y,
        );
        tail.addColorStop(0, 'rgba(255,190,120,0)');
        tail.addColorStop(1, 'rgba(255,190,120,1)');
        c.strokeStyle = tail;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(lerp(x0, x1, Math.max(0, ease(u) - 0.25)), lerp(y0, y1, Math.max(0, ease(u) - 0.25)));
        c.lineTo(x, y);
        c.stroke();
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(x, y, 3.5, 0, Math.PI * 2);
        c.fill();
      }
      c.globalCompositeOperation = 'source-over';
    }

    // ---- bloom: downsample + additive upscale ----
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, glow.width, glow.height);
    gctx.drawImage(canvas, 0, 0, glow.width, glow.height);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = 0.55;
    c.imageSmoothingEnabled = true;
    c.drawImage(glow, 0, 0, canvas.width, canvas.height);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    // ---- stats ----
    let nodesShown = nodeCount;
    let podsShown = podCount;
    let ctrsShown = ctrCount;
    let rps = 0;
    if (p > 0.2) rps = lerp(1200, 41000, seg(p, 0.24, 0.4));
    if (p > 0.68) rps = lerp(41000, 386000, ease(seg(p, 0.68, 0.74))) - lerp(0, 140000, seg(p, 0.76, 0.8));
    if (worldMix > 0) {
      const k = REGIONS.length;
      nodesShown = lerp(nodesShown, nodesShown * k, worldMix);
      podsShown = lerp(podsShown, podsShown * k, worldMix);
      ctrsShown = lerp(ctrsShown, ctrsShown * k, worldMix);
      rps = lerp(rps, rps * k, worldMix);
    }
    if (p < 0.035) ctrsShown = 1;
    const sStr = `${fmt(ctrsShown)}|${fmt(podsShown)}|${fmt(nodesShown)}|${fmt(rps)}`;
    if (sStr !== lastStats) {
      lastStats = sStr;
      sC.textContent = fmt(ctrsShown);
      sP.textContent = fmt(podsShown);
      sN.textContent = fmt(nodesShown);
      sR.textContent = rps >= 1e6 ? `${(rps / 1e6).toFixed(1)}M` : fmt(rps);
    }
    el.classList.toggle('is-alarm', p > 0.438 && p < 0.53);
  }

  if (reducedMotion) {
    const once = () => frame(performance.now());
    once();
    window.addEventListener('resize', once);
    return;
  }
  // keyed to the outer wrapper: the pinned element's own trigger would end one viewport in
  visibleLoop(el, (now) => frame(now));
}
