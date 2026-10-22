import { ScrollTrigger, reducedMotion, scrollToEl } from '../../core/scroll';
import { esc, h } from '../../core/util';
import { visibleLoop } from '../y2018/loop';

export interface BentoActions {
  save: () => void;
  deploy: () => void;
  toggleAurora: () => void;
}

/** Bento grid of 2021 UI tropes, with a real ⌘K palette and a clay three.js object. */
export function createBento(parent: HTMLElement, section: HTMLElement, actions: BentoActions): void {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? '⌘' : 'Ctrl';
  const el = h(`
    <div class="bento">
      <div class="bento__tile bento__3d">
        <canvas aria-label="A clay-style 3D knot"></canvas>
        <p class="bento__label">Clay 3D <span>three.js</span></p>
      </div>
      <button type="button" class="bento__tile bento__k">
        <span class="bento__keys"><kbd>${mod}</kbd><kbd>K</kbd></span>
        <span class="bento__label">Command palette <span>Try it</span></span>
      </button>
      <div class="bento__tile bento__hmr">
        <b>12<small>ms</small></b>
        <p class="bento__label">Hot Module Replacement</p>
      </div>
      <div class="bento__tile bento__glow">
        <span class="bento__glowbtn">Get started <i>→</i></span>
        <p class="bento__label">Glowing borders</p>
      </div>
      <div class="bento__tile bento__glass">
        <span class="bento__orb" aria-hidden="true"></span>
        <div class="bento__frost"><b>Glass</b><span>backdrop-filter: blur(24px)</span></div>
      </div>
      <div class="bento__tile bento__turbo">
        <pre class="bento__tree">acme/
├─ apps/
│  ├─ web     <i>next.js</i>
│  └─ docs    <i>astro</i>
└─ packages/
   ├─ ui      <i>react</i>
   └─ config</pre>
        <div class="bento__col">
        <pre class="bento__out">$ pnpm turbo run build
• Packages in scope: config, docs, ui, web
• Running build in 4 packages
<span>ui:build: cache hit, replaying output</span>
<span>web:build: cache hit, replaying output</span>
<span>docs:build: cache hit, replaying output</span>

 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    <b>212ms</b> <em>&gt;&gt;&gt; FULL TURBO</em></pre>
        <p class="bento__quip">“There are only two hard things in Computer Science: cache invalidation and naming things.” <cite>— Phil Karlton</cite> <span>…and off-by-one errors.</span></p>
        </div>
      </div>
    </div>`);
  parent.appendChild(el);

  // ---- ⌘K command palette ----
  const commands: { label: string; hint: string; run: () => void }[] = [
    { label: 'Save file', hint: 'Trigger HMR', run: actions.save },
    { label: 'Deploy preview', hint: 'git push', run: actions.deploy },
    { label: 'Toggle aurora background', hint: 'Appearance', run: actions.toggleAurora },
    { label: 'Go to 2018 — Cloud Native', hint: 'Navigate', run: () => goto('section.era--y2018') },
    { label: 'Go to 2010 — Web 2.0', hint: 'Navigate', run: () => goto('section.era--y2010') },
    { label: 'Go to the very beginning', hint: 'Navigate', run: () => scrollToEl(0) },
    { label: 'Copy “npm create vite@latest”', hint: 'Clipboard', run: () => copy('npm create vite@latest') },
  ];
  function goto(sel: string) {
    const t = document.querySelector<HTMLElement>(sel);
    if (t) scrollToEl(t);
  }
  function copy(text: string) {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
  }

  const pal = h(`
    <div class="cmdk" hidden>
      <div class="cmdk__backdrop"></div>
      <div class="cmdk__box" role="dialog" aria-modal="true" aria-label="Command palette">
        <input class="cmdk__input" placeholder="Type a command or search…" aria-label="Command" autocomplete="off" />
        <ul class="cmdk__list" role="listbox"></ul>
        <div class="cmdk__foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> run</span><span><kbd>esc</kbd> close</span></div>
      </div>
    </div>`);
  section.appendChild(pal);
  const input = pal.querySelector<HTMLInputElement>('.cmdk__input')!;
  const list = pal.querySelector<HTMLElement>('.cmdk__list')!;
  let items = commands;
  let sel = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    items = commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    list.innerHTML = items.length
      ? items
          .map(
            (c, i) =>
              `<li role="option" aria-selected="${i === sel}" data-i="${i}" class="${i === sel ? 'is-sel' : ''}"><span>${esc(c.label)}</span><small>${esc(c.hint)}</small></li>`,
          )
          .join('')
      : '<li class="cmdk__empty">No results.</li>';
  };
  const open = () => {
    pal.hidden = false;
    input.value = '';
    sel = 0;
    render();
    requestAnimationFrame(() => input.focus());
  };
  const close = () => {
    pal.hidden = true;
  };
  const exec = (i: number) => {
    const c = items[i];
    if (!c) return;
    close();
    c.run();
  };

  el.querySelector('.bento__k')!.addEventListener('click', open);
  pal.querySelector('.cmdk__backdrop')!.addEventListener('click', close);
  input.addEventListener('input', () => {
    sel = 0;
    render();
  });
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-i]');
    if (li) exec(Number(li.dataset.i));
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(1, items.length);
      render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      exec(sel);
    }
  });
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && document.documentElement.dataset.era === 'y2021') {
      e.preventDefault();
      if (pal.hidden) open();
      else close();
    } else if (e.key === 'Escape' && !pal.hidden) {
      close();
    }
  });

  // ---- clay 3D (three.js loaded only when the grid gets close) ----
  const tile = el.querySelector<HTMLElement>('.bento__3d')!;
  const canvas = tile.querySelector('canvas')!;
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom+=600',
    once: true,
    onEnter: () => {
      void initClay(tile, canvas);
    },
  });
}

async function initClay(tile: HTMLElement, canvas: HTMLCanvasElement): Promise<void> {
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x3b1d7a, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xf472b6, 30, 20);
  rim.position.set(-4, -2, 2);
  scene.add(rim);

  const clay = (color: number) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) });
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.36, 240, 36), clay(0xa78bfa));
  scene.add(knot);
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 48), clay(0x22d3ee));
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 48, 48), clay(0xf9a8d4));
  scene.add(s1, s2);

  let px = 0;
  let py = 0;
  tile.addEventListener('pointermove', (e) => {
    const r = tile.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    py = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  const resize = () => {
    const w = tile.clientWidth;
    const hgt = tile.clientHeight;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(tile);

  let t = 0;
  const frame = (_: number, dt: number) => {
    t += dt * 0.001;
    knot.rotation.x += (py * 0.5 + t * 0.25 - knot.rotation.x) * 0.05;
    knot.rotation.y = t * 0.4 + px * 0.6;
    s1.position.set(Math.cos(t * 0.9) * 2, Math.sin(t * 0.9) * 0.9, Math.sin(t * 0.9) * 1.2);
    s2.position.set(Math.cos(t * 1.3 + 2) * 1.7, Math.sin(t * 1.3 + 2) * -1.1, Math.cos(t * 1.3) * 1.1);
    renderer.render(scene, camera);
  };
  frame(0, 16);
  if (!reducedMotion) visibleLoop(tile, frame);
  tile.classList.add('is-ready');
}
