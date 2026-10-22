import { reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h } from '../../core/util';
import { MD } from './isometric';

/*
 * A year after the split: the six services above become a few hundred, drawn the way those call
 * graphs were drawn (services on a ring, every dependency a chord through the middle). With enough
 * services the middle goes solid, and people called the picture a Death Star. Scroll grows it.
 * Canvas rather than SVG: hundreds of curves are redrawn on every scroll step.
 */

const N = 320;
const FIRST = ['gateway', 'registry', 'users', 'orders', 'kafka', 'inventory', 'payments', 'notifications'];
const COLORS = [MD.indigo, MD.purple, MD.teal, MD.deepOrange, MD.amber, MD.lightBlue, MD.pink, MD.green];

/** A small seeded generator, so the graph is the same on every visit. */
function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

interface Graph {
  /** angle on the ring for each service, in creation order */
  angle: number[];
  /** [from, to] pairs in creation order: an edge appears with its `from` service */
  edges: [number, number][];
}

function build(): Graph {
  const r = rand(2015);
  // golden-angle steps: every new service lands in the widest gap left on the ring, so it fills evenly
  const angle = Array.from({ length: N }, (_, i) => i * Math.PI * (3 - Math.sqrt(5)) - Math.PI / 2);
  const edges: [number, number][] = [
    [0, 1],
    [0, 3],
    [3, 2],
    [3, 5],
    [3, 6],
    [3, 4],
    [4, 7],
  ];
  for (let i = FIRST.length; i < N; i++) {
    const k = 1 + (r() < 0.6 ? 1 : 0) + (r() < 0.3 ? 1 : 0);
    // earlier services are called more: the old ones turn into hubs
    for (let j = 0; j < k; j++) edges.push([i, Math.floor(i * r() ** 2.2)]);
  }
  return { angle, edges };
}

export function mountDeathStar(parent: HTMLElement): void {
  const el = h(`
    <div class="y15-card y15-star">
      <p class="y15-card__title">A year later <span class="y15-star__count">8 services</span></p>
      <div class="y15-star__grid">
        <div class="y15-star__copy">
          <p class="y15-star__big">Every team got its own service.</p>
          <p class="y15-star__text">Then every feature needed a dozen of them. Drawn as a call graph, it looked like the Death Star, and that is what people called it.</p>
        </div>
        <canvas class="y15-star__canvas" role="img" aria-label="A call graph of about 300 services, so many dependencies that the middle of the circle turns solid"></canvas>
      </div>
    </div>`);
  parent.appendChild(el);

  const canvas = el.querySelector<HTMLCanvasElement>('.y15-star__canvas')!;
  const count = el.querySelector<HTMLElement>('.y15-star__count')!;
  const ctx = canvas.getContext('2d')!;
  const g = build();
  let progress = reducedMotion ? 1 : 0;

  const draw = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = canvas.clientWidth;
    if (!size) return;
    if (canvas.width !== Math.round(size * dpr)) {
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    }
    const s = canvas.width;
    const c = s / 2;
    const R = s * 0.4;
    // slow at first, so the first handful can be read, then the ring fills
    const n = Math.round(FIRST.length + (N - FIRST.length) * progress ** 1.6);
    const pos = (i: number) => [c + Math.cos(g.angle[i]) * R, c + Math.sin(g.angle[i]) * R] as const;

    ctx.clearRect(0, 0, s, s);
    ctx.lineWidth = Math.max(0.75, dpr);
    // early on each line is easy to see; as hundreds pile up each gets fainter, and together the core goes dark
    ctx.strokeStyle = `rgba(48, 63, 159, ${(0.6 - 0.36 * Math.min(1, n / 160)).toFixed(3)})`;
    ctx.beginPath();
    for (const [a, b] of g.edges) {
      if (a >= n) continue;
      const [x1, y1] = pos(a);
      const [x2, y2] = pos(b);
      // a chord bowed towards the centre
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(c + ((x1 + x2) / 2 - c) * 0.15, c + ((y1 + y2) / 2 - c) * 0.15, x2, y2);
    }
    ctx.stroke();

    for (let i = 0; i < n; i++) {
      const [x, y] = pos(i);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.beginPath();
      ctx.arc(x, y, (i < FIRST.length ? 4.5 : 2.2) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // the first services are named while there are still few enough to read
    const labels = 1 - Math.min(1, (n - FIRST.length) / 40);
    if (labels > 0) {
      ctx.globalAlpha = labels;
      ctx.fillStyle = '#37474f';
      ctx.font = `500 ${12 * dpr}px Roboto, sans-serif`;
      FIRST.forEach((name, i) => {
        const a = g.angle[i];
        ctx.textAlign = Math.cos(a) > 0.2 ? 'left' : Math.cos(a) < -0.2 ? 'right' : 'center';
        ctx.textBaseline = Math.sin(a) > 0.2 ? 'top' : Math.sin(a) < -0.2 ? 'bottom' : 'middle';
        ctx.fillText(name, c + Math.cos(a) * (R + 10 * dpr), c + Math.sin(a) * (R + 10 * dpr));
      });
      ctx.globalAlpha = 1;
    }
    count.textContent = `${n} services`;
  };

  new ResizeObserver(draw).observe(canvas);
  if (reducedMotion) return;
  ScrollTrigger.create({
    trigger: el,
    // complete by the time the card is centred, and it stays complete as it scrolls away
    start: 'top 85%',
    end: 'center 55%',
    onUpdate: (self) => {
      progress = self.progress;
      draw();
    },
  });
}
