import { visibleLoop } from '../y2018/loop';

type V3 = [number, number, number];

const POPS: [string, number, number][] = [
  ['Tokyo', 35.7, 139.7], ['Seoul', 37.6, 127], ['Hong Kong', 22.3, 114.2], ['Singapore', 1.35, 103.8],
  ['Jakarta', -6.2, 106.8], ['Sydney', -33.9, 151.2], ['Auckland', -36.8, 174.8], ['Mumbai', 19.1, 72.9],
  ['Delhi', 28.6, 77.2], ['Dubai', 25.2, 55.3], ['Cairo', 30, 31.2], ['Nairobi', -1.3, 36.8],
  ['Johannesburg', -26.2, 28], ['Lagos', 6.5, 3.4], ['Frankfurt', 50.1, 8.7], ['Stockholm', 59.3, 18.1],
  ['Paris', 48.9, 2.35], ['London', 51.5, -0.1], ['Madrid', 40.4, -3.7], ['São Paulo', -23.5, -46.6],
  ['Buenos Aires', -34.6, -58.4], ['Santiago', -33.4, -70.6], ['Mexico City', 19.4, -99.1], ['Miami', 25.8, -80.2],
  ['New York', 40.7, -74], ['Toronto', 43.7, -79.4], ['Chicago', 41.9, -87.6], ['Los Angeles', 34, -118.2],
  ['San Francisco', 37.8, -122.4], ['Seattle', 47.6, -122.3],
];
const ORIGIN: [string, number, number] = ['us-east-1', 39, -77.5];

const toV = (lat: number, lon: number): V3 => {
  const p = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
};
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const angle = (a: V3, b: V3) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))));

function slerp(a: V3, b: V3, t: number): V3 {
  const w = angle(a, b);
  if (w < 1e-4) return a;
  const s = Math.sin(w);
  const k1 = Math.sin((1 - t) * w) / s;
  const k2 = Math.sin(t * w) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

interface Req {
  from: V3;
  to: V3;
  t: number;
  dur: number;
  ms: number;
}

export interface GlobeOptions {
  /** animate user requests flying to an edge location (or the origin) */
  requests?: boolean;
  dotColor?: string;
  accent?: string;
  /** called with the rolling average latency (ms) */
  onStats?: (avgMs: number) => void;
}

/** Dotted, rotating globe drawn on a 2D canvas. */
export function createGlobe(canvas: HTMLCanvasElement, opts: GlobeOptions = {}) {
  const ctx = canvas.getContext('2d')!;
  const dotColor = opts.dotColor ?? '139,139,153';
  const accent = opts.accent ?? '167,139,250';
  const N = 1400;
  const pts: V3[] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    pts.push([Math.cos(ga * i) * r, y, Math.sin(ga * i) * r]);
  }
  const pops = POPS.map((p) => toV(p[1], p[2]));
  const origin = toV(ORIGIN[1], ORIGIN[2]);

  let mode: 'edge' | 'origin' = 'edge';
  let rot = -1.2;
  const tilt = 0.38;
  const reqs: Req[] = [];
  const pulses: { at: V3; t: number }[] = [];
  const lat: number[] = [];
  let spawn = 0;
  let w = 0;
  let hgt = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    hgt = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(hgt * dpr);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const project = (v: V3): V3 => {
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const x = v[0] * cr + v[2] * sr;
    const z0 = -v[0] * sr + v[2] * cr;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const y = v[1] * ct - z0 * st;
    const z = v[1] * st + z0 * ct;
    return [x, y, z];
  };

  const spawnReq = () => {
    const base = pops[Math.floor(Math.random() * pops.length)];
    const jitter = toV((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
    const from = slerp(base, jitter, 0.18);
    const n = Math.hypot(...from);
    const f: V3 = [from[0] / n, from[1] / n, from[2] / n];
    const to = mode === 'edge' ? pops.reduce((a, b) => (angle(f, a) < angle(f, b) ? a : b)) : origin;
    const km = angle(f, to) * 6371;
    const ms = Math.round(km / 100 + 4 + Math.random() * 6);
    reqs.push({ from: f, to, t: 0, dur: 500 + ms * 9, ms });
    lat.push(ms);
    if (lat.length > 24) lat.shift();
    opts.onStats?.(Math.round(lat.reduce((a, b) => a + b, 0) / lat.length));
  };

  const frame = (_: number, dt: number) => {
    rot += dt * 0.00009;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hgt);
    const R = Math.min(w, hgt) * 0.42;
    const cx = w / 2;
    const cy = hgt / 2;

    const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
    g.addColorStop(0, `rgba(${accent},0.22)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
    ctx.fill();

    for (const p of pts) {
      const [x, y, z] = project(p);
      if (z < -0.15) continue;
      ctx.fillStyle = `rgba(${dotColor},${(0.16 + Math.max(0, z) * 0.8).toFixed(3)})`;
      ctx.fillRect(cx + x * R - 1, cy - y * R - 1, 2.1, 2.1);
    }

    const drawNode = (v: V3, size: number, a: number) => {
      const [x, y, z] = project(v);
      if (z < 0) return;
      ctx.fillStyle = `rgba(${accent},${a * (0.4 + z * 0.6)})`;
      ctx.beginPath();
      ctx.arc(cx + x * R, cy - y * R, size, 0, Math.PI * 2);
      ctx.fill();
    };
    if (mode === 'edge') pops.forEach((p) => drawNode(p, 3.4, 1));
    drawNode(origin, mode === 'origin' ? 5 : 3, 1);

    if (opts.requests) {
      spawn += dt;
      if (spawn > 220) {
        spawn = 0;
        spawnReq();
      }
      for (let i = reqs.length - 1; i >= 0; i--) {
        const r = reqs[i];
        r.t += dt / r.dur;
        if (r.t >= 1) {
          pulses.push({ at: r.to, t: 0 });
          reqs.splice(i, 1);
          continue;
        }
        const lift = 0.06 + angle(r.from, r.to) * 0.18;
        ctx.strokeStyle = `rgba(${accent},0.9)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        for (let s = Math.max(0, r.t - 0.3); s <= r.t; s += 0.03) {
          const v = slerp(r.from, r.to, s);
          const k = 1 + lift * Math.sin(Math.PI * s);
          const [x, y, z] = project([v[0] * k, v[1] * k, v[2] * k]);
          if (z < 0) {
            started = false;
            continue;
          }
          if (!started) ctx.moveTo(cx + x * R, cy - y * R);
          else ctx.lineTo(cx + x * R, cy - y * R);
          started = true;
        }
        ctx.stroke();
        const [fx, fy, fz] = project(r.from);
        if (fz > 0 && r.t < 0.3) {
          ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - r.t / 0.3)})`;
          ctx.fillRect(cx + fx * R - 1.5, cy - fy * R - 1.5, 3, 3);
        }
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += dt / 700;
        if (p.t >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const [x, y, z] = project(p.at);
        if (z < 0) continue;
        ctx.strokeStyle = `rgba(${accent},${1 - p.t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + x * R, cy - y * R, 3 + p.t * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  frame(0, 16);
  visibleLoop(canvas, frame);

  return {
    setMode(m: 'edge' | 'origin') {
      mode = m;
      reqs.length = 0;
      lat.length = 0;
    },
  };
}
