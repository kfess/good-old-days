import { type StageScene, scrubType } from '../../components/stage';
import { MOBILE_QUERY } from '../../core/scroll';
import { phone, pixelArt, puzzle } from './pixel';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/* ---------------- pixel logos ---------------- */

/** 3×5 pixel glyphs for the few letters the logos need. */
const GLYPH: Record<string, string[]> = {
  p: ['...', '...', 'WWW', 'W.W', 'WWW', 'W..'],
  h: ['W..', 'W..', 'WWW', 'W.W', 'W.W', '...'],
  X: ['W.W', 'W.W', '.W.', 'W.W', 'W.W'],
  H: ['W.W', 'W.W', 'WWW', 'W.W', 'W.W'],
  R: ['WW.', 'W.W', 'WW.', 'W.W', 'W.W'],
};

type Grid = string[][];
const grid = (w: number, hgt: number, fill = '.'): Grid => Array.from({ length: hgt }, () => Array(w).fill(fill));
const stamp = (g: Grid, rows: string[], x: number, y: number, ch?: string) =>
  rows.forEach((r, dy) =>
    [...r].forEach((c, dx) => {
      if (c !== '.' && g[y + dy]) g[y + dy][x + dx] = ch ?? c;
    }),
  );
const text = (g: Grid, s: string, x: number, y: number) => [...s].forEach((c, i) => stamp(g, GLYPH[c], x + i * 4, y));
const rows = (g: Grid) => g.map((r) => r.join(''));

/** The php.net mark, in pixels: a purple oval with bold black lowercase "php". */
function phpLogo(): string {
  const w = 33;
  const hgt = 17;
  const g = grid(w, hgt);
  for (let y = 0; y < hgt; y++)
    for (let x = 0; x < w; x++) {
      const d = ((x - 16) / 16.4) ** 2 + ((y - 8) / 8.4) ** 2;
      if (d <= 1) g[y][x] = d > 0.8 ? 'K' : y < 5 && d > 0.35 ? 'L' : 'P';
    }
  const p = ['TTTT.', 'TT.TT', 'TT.TT', 'TT.TT', 'TTTT.', 'TT...', 'TT...'];
  const hh = ['TT...', 'TT...', 'TTTT.', 'TT.TT', 'TT.TT', 'TT.TT', 'TT.TT'];
  stamp(g, p, 7, 5);
  stamp(g, hh, 14, 3);
  stamp(g, p, 21, 5);
  return pixelArt(rows(g), { K: '#4f5b93', P: '#777bb4', L: '#8892bf', T: '#000000' }, 'p-logo', 'PHP');
}

/**
 * A Flash 5 timeline strip, in pixels: keyframe, motion tween, keyframe, with the red playhead.
 * Brand-free on purpose: the red "f" tile is Adobe's Flash Player icon from 2007 on, not Macromedia's.
 */
function flashLogo(): string {
  return pixelArt(
    [
      '.............RRR.....',
      '.............RRR.....',
      '..............R......',
      'KKKKKKKKKKKKKKRKKKKKK',
      'KTTTKTTTKTTTKTRTKTTTK',
      'KTTTKTTTKTTTKTRTKATTK',
      `KT${'A'.repeat(12)}RAAAATK`,
      'KTTTKTTTKTTTKTRTKATTK',
      'KTDTKTTTKTTTKTRTKTDTK',
      'KDDDKTTTKTTTKTRTKDDDK',
      'KKKKKKKKKKKKKKRKKKKKK',
      '..............R......',
    ],
    { K: '#3a3a3a', T: '#c9c6f5', A: '#000000', D: '#000000', R: '#e0242a' },
    'p-logo',
    'Flash 5 timeline',
  );
}

function xhrLogo(): string {
  const g = grid(19, 15, 'B');
  for (let x = 0; x < 19; x++) {
    g[0][x] = 'L';
    g[14][x] = 'D';
  }
  text(g, 'XHR', 4, 2);
  stamp(g, ['.........G..', 'GGGGGGGGGGGG', '.........G..'], 3, 8);
  stamp(g, ['..Y.........', 'YYYYYYYYYYYY', '..Y.........'], 4, 11);
  return pixelArt(
    rows(g),
    { B: '#1f4fd1', L: '#5c86ff', D: '#0d2a80', W: '#ffffff', G: '#66ff66', Y: '#ffff00' },
    'p-logo',
    'XMLHttpRequest',
  );
}

/* ---------------- scenes ---------------- */

const lamp: StageScene = {
  year: '1998.06',
  name: 'PHP 3 + MySQL',
  kicker: 'Server-side, at last',
  line: 'Servers started assembling the page.',
  className: 'p-scene p-scene--php',
  logo: phpLogo(),
  length: 1.0,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <div class="p-win p-php__code">
        <div class="p-win__bar"><span>index.php - Notepad</span><i>_</i><i>□</i><i>×</i></div>
        <pre class="p-win__body"><code class="p-php__typed"></code><i class="p-caret"></i></pre>
      </div>
      <div class="p-php__right">
        <p class="p-php__label">You are visitor</p>
        <div class="p-odo" aria-hidden="true">${'<span class="p-odo__cell"><span class="p-odo__strip">0123456789</span></span>'.repeat(7)}</div>
        <div class="p-php__sql"><span>mysql&gt;</span> SELECT n FROM hits; <b class="p-php__n">1998</b></div>
        <ol class="p-php__log"></ol>
      </div>`;
    const typed = art.querySelector<HTMLElement>('.p-php__typed')!;
    const strips = Array.from(art.querySelectorAll<HTMLElement>('.p-odo__strip'));
    const nEl = art.querySelector<HTMLElement>('.p-php__n')!;
    const log = art.querySelector<HTMLElement>('.p-php__log')!;
    const code =
      '<!-- don\'t touch this. it works. -->\n<?php\n  mysql_query("UPDATE hits SET n = n + 1");\n  $r = mysql_query("SELECT n FROM hits");\n?>\nYou are visitor #<?php echo mysql_result($r, 0); ?>';

    const paint = (n: number) => {
      const s = String(Math.floor(n)).padStart(7, '0');
      strips.forEach((st, i) => (st.style.transform = `translateY(${-Number(s[i]) * 10}%)`));
      nEl.textContent = s.replace(/^0+/, '');
      const reqs = Math.min(5, Math.floor((n - 1998) / 9000));
      if (log.childElementCount !== reqs) {
        log.innerHTML = Array.from(
          { length: reqs },
          (_, i) => `<li>GET /index.php <b>200</b> <span>${(0.31 + i * 0.07).toFixed(2)}s</span></li>`,
        ).join('');
      }
    };
    paint(1998);

    tl.to(
      logo,
      {
        xPercent: () => (mobile() ? 0 : -115),
        yPercent: () => (mobile() ? -112 : -62),
        scale: () => (mobile() ? 0.36 : 0.5),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelectorAll('.p-win, .p-php__right'), { opacity: 0, y: 30, stagger: 0.12, duration: 0.3 }, 0.3);
    scrubType(tl, typed, code, 0.9, 0.5);
    const hits = { n: 1998 };
    tl.to(hits, { n: 48213, duration: 1.4, ease: 'power2.in', onUpdate: () => paint(hits.n) }, 1.2);
    tl.to({}, { duration: 0.3 });
  },
};

const flash: StageScene = {
  year: '2000.08',
  name: 'Flash 5',
  kicker: 'Loading… please wait',
  line: 'Intros, games, everything. All Flash.',
  className: 'p-scene p-scene--flash',
  logo: flashLogo(),
  length: 1.2,
  play({ art, logo, tl }) {
    const FRAMES = 40;
    const ghosts = [0.15, 0.3, 0.45, 0.6, 0.75].map((p) => `<i class="p-fl__ghost" style="--p:${p}"></i>`).join('');
    art.innerHTML = `
      <div class="p-fl">
        <div class="p-fl__bar"><span>Flash 5 — Untitled-1.fla</span><b class="p-fl__frame">Frame 1</b><span>12.0 fps</span></div>
        <div class="p-fl__stage">
          <div class="p-fl__onion">${ghosts}</div>
          <i class="p-fl__shape"></i>
          <span class="p-fl__skip">Enter site &gt;&gt;</span>
        </div>
        <div class="p-fl__tl">
          <div class="p-fl__layer"><span>shape</span><div class="p-fl__cells">${Array.from({ length: FRAMES }, (_, i) => `<i class="${i === 0 || i === FRAMES - 1 ? 'is-key' : 'is-tween'}"></i>`).join('')}</div></div>
          <div class="p-fl__layer"><span>actions</span><div class="p-fl__cells">${Array.from({ length: FRAMES }, (_, i) => `<i class="${i === FRAMES - 1 ? 'is-key is-a' : ''}"></i>`).join('')}</div></div>
          <i class="p-fl__head"></i>
        </div>
        <pre class="p-fl__actions"><code class="p-fl__typed"></code></pre>
      </div>`;
    const shape = art.querySelector<HTMLElement>('.p-fl__shape')!;
    const head = art.querySelector<HTMLElement>('.p-fl__head')!;
    const frame = art.querySelector<HTMLElement>('.p-fl__frame')!;
    const onion = art.querySelector<HTMLElement>('.p-fl__onion')!;
    const skip = art.querySelector<HTMLElement>('.p-fl__skip')!;
    const typed = art.querySelector<HTMLElement>('.p-fl__typed')!;
    const ghostEls = Array.from(art.querySelectorAll<HTMLElement>('.p-fl__ghost'));

    tl.to(
      logo,
      {
        xPercent: () => (mobile() ? 0 : -115),
        yPercent: () => (mobile() ? -112 : -62),
        scale: () => (mobile() ? 0.36 : 0.5),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.p-fl'), { opacity: 0, y: 40, duration: 0.3 }, 0.3);
    const play = { p: 0 };
    tl.to(
      play,
      {
        p: 1,
        duration: 1.4,
        ease: 'none',
        onUpdate: () => {
          const p = play.p;
          head.style.left = `calc(var(--lab) + ${p} * (100% - var(--lab)))`;
          frame.textContent = `Frame ${1 + Math.round(p * (FRAMES - 1))}`;
          shape.style.setProperty('--p', String(p));
          onion.classList.toggle('is-on', p > 0.08);
          ghostEls.forEach((g) => g.classList.toggle('is-past', Number(g.style.getPropertyValue('--p')) < p));
        },
      },
      0.6,
    );
    // Flash 5 (2000) ActionScript: a frame action stops the timeline, the handler lives on the button instance
    tl.fromTo(skip, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' }, 2.0);
    scrubType(
      tl,
      typed,
      'Frame Actions — frame 40\n  stop();\nObject Actions — "Enter site" button\n  on (release) {\n    gotoAndPlay("main");\n  }',
      0.7,
      2.15,
    );
    tl.to({}, { duration: 0.3 });
  },
};

const ajax: StageScene = {
  year: '2005',
  name: 'Ajax',
  kicker: 'Asynchronous JavaScript + XML',
  line: 'The page changed without a reload.',
  className: 'p-scene p-scene--ajax',
  logo: xhrLogo(),
  length: 1.0,
  play({ art, logo, tl }) {
    const COLS = 9;
    const ROWS = 5;
    const tiles = Array.from({ length: COLS * ROWS }, (_, i) => `<i class="p-aj__tile t${(i * 7) % 5}"></i>`).join('');
    art.innerHTML = `
      <div class="p-aj">
        <div class="p-aj__bar">
          <span class="p-aj__btn">◀</span><span class="p-aj__btn">▶</span><span class="p-aj__btn p-aj__reload">⟳</span>
          <span class="p-aj__url">http://maps.example.com/</span>
          <span class="p-aj__reloads">reloads: <b>0</b></span>
        </div>
        <div class="p-aj__view"><div class="p-aj__map" style="--cols:${COLS}">${tiles}</div><i class="p-aj__pin"></i><i class="p-aj__hand"></i></div>
        <div class="p-aj__status"><code class="p-aj__typed"></code><span class="p-aj__rs">readyState <b>0</b></span></div>
      </div>
      <div class="p-aj__wire" aria-hidden="true"><i></i><i></i><i></i><span>XMLHttpRequest</span></div>`;
    const map = art.querySelector<HTMLElement>('.p-aj__map')!;
    const tileEls = Array.from(art.querySelectorAll<HTMLElement>('.p-aj__tile'));
    const rs = art.querySelector<HTMLElement>('.p-aj__rs b')!;
    const typed = art.querySelector<HTMLElement>('.p-aj__typed')!;
    const packets = Array.from(art.querySelectorAll<HTMLElement>('.p-aj__wire i'));
    // tiles near the start position are already loaded; the rest arrive while you drag
    const order = tileEls.map((_, i) => ({ i, d: i % COLS })).sort((a, b) => a.d - b.d);

    tl.to(
      logo,
      {
        xPercent: () => (mobile() ? 0 : -115),
        yPercent: () => (mobile() ? -112 : -62),
        scale: () => (mobile() ? 0.36 : 0.5),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.p-aj'), { opacity: 0, y: 40, duration: 0.3 }, 0.3);
    scrubType(tl, typed, "xhr.open('GET', '/tile?x=7&y=3', true);", 0.5, 0.5);
    const drag = { p: 0 };
    tl.to(
      drag,
      {
        p: 1,
        duration: 1.5,
        ease: 'power1.inOut',
        onUpdate: () => {
          const p = drag.p;
          map.style.setProperty('--p', String(p));
          const loaded = Math.floor(order.length * (0.34 + p * 0.66));
          order.forEach((o, k) => tileEls[o.i].classList.toggle('is-loaded', k < loaded));
          rs.textContent = String(Math.min(4, Math.floor((p * 12) % 5)));
          packets.forEach((pk, k) => (pk.style.left = `${((p * 6 + k / 3) % 1) * 100}%`));
        },
      },
      1.0,
    );
    tl.to({}, { duration: 0.3 });
  },
};

const iphone: StageScene = {
  year: '2007',
  name: 'iPhone',
  kicker: 'Pinch to zoom',
  line: 'A real browser, in your pocket.',
  className: 'p-scene p-scene--iphone',
  logo: phone('p-logo'),
  length: 1.2,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <div class="p-ip">
        <div class="p-ip__device"><i class="p-ip__speaker"></i><i class="p-ip__home"></i></div>
        <div class="p-ip__screen">
          <div class="p-ip__page">
            <div class="p-ip__marq">★ Welcome to my homepage! ★ Sign my guestbook! ★</div>
            <p class="p-ip__h">~*~ My Cool Page ~*~</p>
            <p class="p-ip__count">You are visitor <b>0048213</b></p>
            <div class="p-ip__flash">${puzzle('p-ip__puzzle')}<span>Flash: not supported</span></div>
            <p class="p-ip__links"><u>Links</u> · <u>Guestbook</u> · <u>Webring</u></p>
          </div>
        </div>
        <i class="p-ip__finger p-ip__finger--a"></i><i class="p-ip__finger p-ip__finger--b"></i>
      </div>`;
    const device = art.querySelector<HTMLElement>('.p-ip__device')!;
    const screen = art.querySelector<HTMLElement>('.p-ip__screen')!;
    const page = art.querySelector<HTMLElement>('.p-ip__page')!;
    const fingers = art.querySelectorAll<HTMLElement>('.p-ip__finger');
    const flashBox = art.querySelector<HTMLElement>('.p-ip__flash')!;

    const PAGE_W = 640;
    const state = { w: 1, z: 1 };
    const apply = () => {
      screen.style.setProperty('--w', String(state.w));
      const sw = screen.clientWidth;
      const s0 = sw / PAGE_W;
      const sc = s0 * state.z;
      // zoom around the page's upper middle, where the counter is
      page.style.transform = `translate(${sw / 2 - (PAGE_W / 2) * sc}px, ${120 * s0 - 120 * sc}px) scale(${sc})`;
    };
    apply();

    tl.to(
      logo,
      {
        xPercent: () => (mobile() ? 0 : -115),
        yPercent: () => (mobile() ? -112 : -62),
        scale: () => (mobile() ? 0.36 : 0.5),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    // the desktop page arrives full-size, then the phone closes in around it
    tl.from(screen, { opacity: 0, duration: 0.3 }, 0.3);
    tl.to(state, { w: 0, duration: 0.7, ease: 'power3.inOut', onUpdate: apply }, 0.7);
    tl.fromTo(device, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.inOut' }, 0.8);
    // pinch to zoom
    tl.fromTo(fingers, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.55);
    tl.to(fingers[0], { x: -38, y: -46, duration: 0.5, ease: 'power1.inOut' }, 1.65);
    tl.to(fingers[1], { x: 38, y: 46, duration: 0.5, ease: 'power1.inOut' }, 1.65);
    tl.to(state, { z: 1.9, duration: 0.5, ease: 'power1.inOut', onUpdate: apply }, 1.65);
    tl.to(fingers, { opacity: 0, duration: 0.15 }, 2.15);
    tl.fromTo(flashBox, { '--hl': 0 }, { '--hl': 1, duration: 0.3 }, 2.2);
    tl.to({}, { duration: 0.3 });
  },
};

export const STAGE_PROLOGUE: StageScene[] = [lamp, flash, ajax, iphone];
