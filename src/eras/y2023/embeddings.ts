import { reducedMotion } from '../../core/scroll';
import { h } from '../../core/util';
import { fitCanvas, loopWhenVisible } from './lib';

interface Word {
  text: string;
  c: number;
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  phase: number;
}

const CLUSTERS = [
  { name: 'frontend', color: '#d97757', cx: 0.24, cy: 0.3, words: ['React', 'Vue', 'Svelte', 'Solid', 'Angular'] },
  { name: 'infra', color: '#3b82f6', cx: 0.76, cy: 0.28, words: ['Docker', 'Kubernetes', 'Helm', 'Pod', 'container'] },
  { name: 'pets', color: '#16a34a', cx: 0.26, cy: 0.76, words: ['cat', 'kitten', 'dog', 'puppy'] },
  { name: 'royalty', color: '#8b5cf6', cx: 0.74, cy: 0.74, words: ['king', 'queen', 'prince', 'princess'] },
];

// dx/dy nudge each query toward the words it really means (React for "UI library", dog for "good boy")
const QUERIES = [
  { label: '“UI library”', c: 0, dx: 0.075, dy: -0.04 },
  { label: '“deploy”', c: 1, dx: 0.04, dy: 0.06 },
  { label: '“good boy”', c: 2, dx: -0.06, dy: -0.06 },
  { label: '“monarch”', c: 3, dx: 0.05, dy: 0.03 },
];

// deterministic pseudo-random so the layout is stable between reloads
function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Animated 2D projection of an embedding space: similar words drift into clusters. */
export function mountEmbeddings(parent: HTMLElement): void {
  const el = h(`
    <div class="emb">
      <canvas class="emb__canvas" aria-label="Embedding space where words with similar meanings cluster"></canvas>
      <div class="emb__queries" role="group" aria-label="query">
        ${QUERIES.map((q, i) => `<button type="button" data-q="${i}">${q.label}</button>`).join('')}
      </div>
    </div>`);
  parent.appendChild(el);
  const canvas = el.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));

  const r = rand(7);
  const words: Word[] = [];
  CLUSTERS.forEach((cl, c) => {
    cl.words.forEach((text, i) => {
      const a = (i / cl.words.length) * Math.PI * 2 + r() * 0.5;
      const d = 0.08 + r() * 0.04;
      words.push({
        text,
        c,
        tx: cl.cx + Math.cos(a) * d * 1.1,
        ty: cl.cy + Math.sin(a) * d * 1.5,
        sx: 0.08 + r() * 0.84,
        sy: 0.1 + r() * 0.8,
        phase: r() * Math.PI * 2,
      });
    });
  });

  let q = 0;
  let qStart = 0;
  let manualUntil = 0;
  let born = -1;
  const select = (i: number, now: number) => {
    q = i;
    qStart = now;
    buttons.forEach((b, j) => b.classList.toggle('is-on', j === i));
  };
  buttons.forEach((b, i) =>
    b.addEventListener('click', () => {
      const now = performance.now();
      manualUntil = now + 9000;
      select(i, now);
    }),
  );
  select(0, 0);

  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

  const draw = (now: number) => {
    const { w, h: H, dpr } = fitCanvas(canvas);
    if (born < 0) born = now;
    if (now > manualUntil && now - qStart > 2800) select((q + 1) % QUERIES.length, now);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, H);

    // dotted grid
    ctx.fillStyle = 'rgba(31,30,29,0.08)';
    for (let x = 12; x < w; x += 24) for (let y = 12; y < H; y += 24) ctx.fillRect(x, y, 1.2, 1.2);

    const k = reducedMotion ? 1 : ease((now - born) / 1800);
    const pos = words.map((wd) => {
      const drift = reducedMotion ? 0 : 0.006;
      const x = wd.sx + (wd.tx - wd.sx) * k + Math.sin(now / 1400 + wd.phase) * drift;
      const y = wd.sy + (wd.ty - wd.sy) * k + Math.cos(now / 1700 + wd.phase) * drift;
      return { x: 24 + x * (w - 48), y: 20 + y * (H - 40) };
    });

    // cluster halos
    if (k > 0.6) {
      CLUSTERS.forEach((cl) => {
        const g = ctx.createRadialGradient(24 + cl.cx * (w - 48), 20 + cl.cy * (H - 40), 0, 24 + cl.cx * (w - 48), 20 + cl.cy * (H - 40), Math.min(w, H) * 0.22);
        g.addColorStop(0, cl.color + '22');
        g.addColorStop(1, cl.color + '00');
        ctx.fillStyle = g;
        ctx.globalAlpha = (k - 0.6) / 0.4;
        ctx.fillRect(0, 0, w, H);
        ctx.globalAlpha = 1;
      });
    }

    // words (their label boxes are kept so the query pill can avoid them); a narrow canvas squeezes
    // the clusters sideways, so phones get a smaller face to keep neighbours from running together
    const fs = w < 480 ? 11 : 13;
    ctx.font = `500 ${fs}px Geist, sans-serif`;
    const boxes = words.map((wd, i) => ({ x: pos[i].x - 4, y: pos[i].y - 10, w: ctx.measureText(wd.text).width + 12, h: 16 }));
    words.forEach((wd, i) => {
      const p = pos[i];
      const color = CLUSTERS[wd.c].color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(31,30,29,0.85)';
      ctx.fillText(wd.text, p.x + 7, p.y + 4);
    });
    // query point + nearest neighbours
    const cl = CLUSTERS[QUERIES[q].c];
    const qa = Math.min(1, (now - qStart) / 500);
    const qx = 24 + (cl.cx + QUERIES[q].dx) * (w - 48);
    const qy = 20 + (cl.cy + QUERIES[q].dy) * (H - 40);
    if (k > 0.95) {
      const near = pos
        .map((p, i) => ({ p, i, d: Math.hypot(p.x - qx, p.y - qy) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      ctx.save();
      ctx.globalAlpha = qa;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = cl.color;
      ctx.lineWidth = 1.2;
      ctx.font = '500 10px Geist Mono, monospace';
      near.forEach(({ p, d }) => {
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        const sim = (0.97 - d / Math.max(w, H)).toFixed(2);
        ctx.fillStyle = cl.color;
        ctx.fillText(sim, (qx + p.x) / 2 + 4, (qy + p.y) / 2 - 4);
      });
      ctx.setLineDash([]);
      // query marker
      ctx.fillStyle = '#1f1e1d';
      ctx.beginPath();
      ctx.arc(qx, qy, 5 + Math.sin(now / 200) * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `600 ${fs - 1}px Geist, sans-serif`;
      const label = `query ${QUERIES[q].label}`;
      const tw = ctx.measureText(label).width;
      // above, below, right, left or diagonal to the point: whichever covers the fewest words
      const lw = tw + 16;
      const spots: [number, number][] = [
        [qx - lw / 2, qy - 40], [qx - lw / 2, qy + 16], [qx + 14, qy - 11], [qx - lw - 14, qy - 11],
        [qx - 10, qy - 40], [qx - lw + 10, qy - 40], [qx - 10, qy + 16], [qx - lw + 10, qy + 16],
      ];
      const covered = ([x, y]: [number, number]) =>
        boxes.filter((b) => x < b.x + b.w && b.x < x + lw && y < b.y + b.h && b.y < y + 22).length +
        (x < 0 || y < 0 || x + lw > w || y + 22 > H ? 99 : 0);
      const [lx, ly] = spots.reduce((best, s) => (covered(s) < covered(best) ? s : best));
      ctx.fillStyle = '#1f1e1d';
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#f5f3ee';
      ctx.fillText(label, lx + 8, ly + 15);
      ctx.restore();
    }

  };

  if (reducedMotion) {
    requestAnimationFrame(() => draw(performance.now()));
    return;
  }
  loopWhenVisible(el, draw);
}
