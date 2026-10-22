import { type SimpleIcon, siReact } from 'simple-icons';
import { angularShield, dockerWhale2013 } from '../../components/marks';
import { type StageScene, scrubType } from '../../components/stage';
import { t } from '../../core/i18n';
import { MOBILE_QUERY, reducedMotion } from '../../core/scroll';
import { bootstrapGrid, FLAT } from './art';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;
let uid = 0;

/**
 * A brand mark on a flat disc with the 2013 long shadow: the glyph is stamped 46 times
 * along the diagonal inside one translucent group, so the shadow reads as a single flat shape.
 */
export function longShadowBadge(icon: SimpleIcon, bg: string, fg = '#fff'): string {
  const id = `y12b${uid++}`;
  const copies = Array.from(
    { length: 46 },
    (_, k) => `<use href="#${id}p" transform="translate(${26 + k} ${26 + k}) scale(2)"/>`,
  ).join('');
  return `<svg class="y12-lsb" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <path id="${id}p" d="${icon.path}"/>
      <clipPath id="${id}c"><circle cx="50" cy="50" r="50"/></clipPath>
    </defs>
    <circle cx="50" cy="50" r="50" fill="${bg}"/>
    <g clip-path="url(#${id}c)"><g opacity=".2" fill="#000">${copies}</g></g>
    <use href="#${id}p" transform="translate(26 26) scale(2)" fill="${fg}"/>
  </svg>`;
}

/**
 * Park the big badge out of the way once the scene's own animation takes over.
 * Phones have no free corner (the code panels sit right under the HUD), so there it bows out instead.
 */
function dock(tl: gsap.core.Timeline, logo: HTMLElement, at = 0): void {
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
    at,
  );
}

/* ---------------- Bootstrap 2: an unstyled page gets "Bootstrapped" ---------------- */

/** flip a class on/off at a point of a scrubbed timeline (works in both scroll directions) */
function toggleAt(tl: gsap.core.Timeline, el: Element, cls: string, at: number): void {
  const o = { v: 0 };
  tl.fromTo(
    o,
    { v: 0 },
    { v: 1, duration: 0.02, immediateRender: false, onUpdate: () => el.classList.toggle(cls, o.v >= 0.5) },
    at,
  );
}

const bootstrap2: StageScene = {
  year: '2012.01',
  name: 'Bootstrap 2',
  // the 2.0 docs' masthead; "Sleek, intuitive, and powerful" only arrived with 2.1 (Aug 2012)
  kicker: 'Bootstrap, from Twitter',
  line: 'Even engineers could build a decent-looking site.',
  className: 'y12-scene y12-scene--bs',
  logo: longShadowBadge(bootstrapGrid, FLAT.amethyst),
  length: 1.2,
  play({ art, logo: tile, tl }) {
    const col = (n: number) => `
      <div class="y12-bs__span4">
        <h2>Heading ${n}</h2>
        <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo.</p>
        <a class="y12-bs__btn">View details »</a>
      </div>`;
    art.innerHTML = `
      <pre class="y12-bs__src"><code class="y12-bs__typed"></code><i class="y12-bs__caret"></i></pre>
      <div class="y12-bs">
        <div class="y12-bs__chrome"><i></i><i></i><i></i><span>index.html</span></div>
        <div class="y12-bs__page">
          <div class="y12-bs__grid" aria-hidden="true">${'<i></i>'.repeat(12)}</div>
          <div class="y12-bs__navbar"><b>Project name</b><a class="is-active">Home</a><a>About</a><a>Contact</a></div>
          <div class="y12-bs__container">
            <div class="y12-bs__hero">
              <h1>Hello, world!</h1>
              <p>This is a template for a simple marketing or informational website.</p>
              <a class="y12-bs__btn y12-bs__btn--primary y12-bs__btn--large">Learn more »</a>
            </div>
            <div class="y12-bs__row">${col(1)}${col(2)}${col(3)}</div>
          </div>
        </div>
      </div>`;
    const typed = art.querySelector<HTMLElement>('.y12-bs__typed')!;
    const page = art.querySelector<HTMLElement>('.y12-bs__page')!;
    const cols = art.querySelectorAll('.y12-bs__grid i');
    const code1 = '<link href="bootstrap.css" rel="stylesheet">';
    // the retype slips in the override every Bootstrap site grew sooner or later
    const code2 = [
      code1,
      '<style>',
      t("  /* don't touch this. it works. */", '  /* ここ触るな。なぜか動いてる。 */'),
      '  .navbar { z-index: 99999 !important; }',
      '</style>',
      '<div class="row">',
      '  <div class="span4">…</div>',
    ].join('\n');

    dock(tl, tile);
    tl.from(art.querySelector('.y12-bs'), { opacity: 0, y: 40, duration: 0.3 }, 0.3);
    tl.from(art.querySelector('.y12-bs__src'), { opacity: 0, y: 20, duration: 0.2 }, 0.35);
    scrubType(tl, typed, code1, 0.6, 0.5);
    toggleAt(tl, page, 'is-boot', 1.15);
    tl.fromTo(
      cols,
      { scaleY: 0 },
      { scaleY: 1, stagger: 0.03, duration: 0.3, ease: 'power2.out', transformOrigin: 'top' },
      1.3,
    );
    scrubType(tl, typed, code2, 0.7, 1.5);
    toggleAt(tl, page, 'is-grid', 1.65);
    tl.to(cols, { opacity: 0, duration: 0.3 }, 2.25);
    tl.to({}, { duration: 0.3 });
  },
};

/* ---------------- AngularJS: two-way binding, at billboard size ---------------- */

const angular: StageScene = {
  year: '2012',
  name: 'AngularJS',
  kicker: 'HTML enhanced for web apps',
  line: 'Type, and the view updates instantly.',
  className: 'y12-scene y12-scene--ng',
  logo: longShadowBadge(angularShield, FLAT.alizarin),
  length: 1.5,
  play({ art, logo, tl }) {
    art.innerHTML = `
      <pre class="y12-ng__src"><code>&lt;input <mark>ng-model="name"</mark>&gt;\n&lt;h1&gt;Hello, {{name}}!&lt;/h1&gt;</code></pre>
      <label class="y12-ng__input"><span class="y12-ng__val"></span><i class="y12-ng__caret"></i></label>
      <svg class="y12-ng__wire" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><line x1="5" y1="0" x2="5" y2="100"/></svg>
      <p class="y12-ng__digest">$digest</p>
      <h4 class="y12-ng__out">Hello, <span class="y12-ng__tpl">{{name}}</span><span class="y12-ng__name"></span>!</h4>`;
    const val = art.querySelector<HTMLElement>('.y12-ng__val')!;
    const out = art.querySelector<HTMLElement>('.y12-ng__name')!;
    const tpl = art.querySelector<HTMLElement>('.y12-ng__tpl')!;
    const digest = art.querySelector<HTMLElement>('.y12-ng__digest')!;

    // keystrokes: type "world", delete it, type "AngularJS"
    const seq: string[] = [''];
    const add = (s: string) => [...s].forEach((_, i) => seq.push(s.slice(0, i + 1)));
    add('world');
    for (let i = 'world'.length - 1; i >= 0; i--) seq.push('world'.slice(0, i));
    add('AngularJS');

    let last = -1;
    const render = (i: number) => {
      if (i === last) return;
      last = i;
      const s = seq[i];
      val.textContent = s;
      out.textContent = s;
      tpl.style.display = s ? 'none' : '';
      // re-trigger the $digest pulse on every keystroke
      digest.classList.remove('is-on');
      void digest.offsetWidth;
      if (i > 0) digest.classList.add('is-on');
    };
    render(0);

    dock(tl, logo, 0);
    tl.from(art.querySelector('.y12-ng__src'), { opacity: 0, y: 24, duration: 0.25 }, 0.2);
    tl.from(
      art.querySelector('.y12-ng__input'),
      { opacity: 0, scaleX: 0.6, transformOrigin: 'left center', duration: 0.3, ease: 'back.out(1.4)' },
      0.3,
    );
    tl.from(art.querySelector('.y12-ng__out'), { opacity: 0, y: 30, duration: 0.3 }, 0.45);
    tl.from(art.querySelector('.y12-ng__wire line'), { attr: { y2: 0 }, duration: 0.25 }, 0.55);
    tl.from(digest, { opacity: 0, duration: 0.25 }, 0.6);
    const p = { i: 0 };
    tl.to(p, { i: seq.length - 1, duration: 2.2, ease: 'none', onUpdate: () => render(Math.round(p.i)) }, 0.8);
    tl.to({}, { duration: 0.5 });
  },
};

/* ---------------- Docker: containers stack into a whale, which swims away ---------------- */

// the whale, one shipping container per '#'
const WHALE = [
  '.......##...',
  '......####..',
  '##...######.',
  '###.########',
  '.###########',
  '..#########.',
  '....######..',
];
const CW = 40;
const CH = 26;
const BOX_COLORS = [
  FLAT.alizarin,
  FLAT.sunflower,
  FLAT.emerald,
  FLAT.amethyst,
  FLAT.carrot,
  FLAT.river,
  FLAT.turquoise,
];

const docker: StageScene = {
  year: '2013',
  name: 'Docker',
  kicker: 'Pack, ship and run',
  line: '“Works on my machine,” shipped as-is.',
  className: 'y12-scene y12-scene--docker',
  logo: longShadowBadge(dockerWhale2013, FLAT.river),
  length: 1.8,
  play({ art, logo, tl }) {
    const cells: { c: number; r: number }[] = [];
    // stack from the bottom row up, like real cargo
    for (let r = WHALE.length - 1; r >= 0; r--) [...WHALE[r]].forEach((ch, c) => ch === '#' && cells.push({ c, r }));
    const W = WHALE[0].length * CW;
    const H = WHALE.length * CH;
    const boxes = cells
      .map(
        ({ c, r }) => `<g class="y12-box" data-r="${r}">
          <rect x="${c * CW + 2}" y="${r * CH + 2}" width="${CW - 4}" height="${CH - 4}" fill="${BOX_COLORS[(c * 3 + r * 5) % BOX_COLORS.length]}"/>
          <path d="M${c * CW + 12} ${r * CH + 6}v${CH - 12}M${c * CW + 20} ${r * CH + 6}v${CH - 12}M${c * CW + 28} ${r * CH + 6}v${CH - 12}" stroke="rgba(0,0,0,.16)" stroke-width="2"/>
        </g>`,
      )
      .join('');
    art.innerHTML = `
      <div class="y12-dk__cmd"><code class="y12-dk__typed"></code></div>
      <div class="y12-dk__sea">
        <svg class="y12-dk__whale" viewBox="-20 -60 ${W + 40} ${H + 80}" aria-hidden="true">
          <g class="y12-dk__spout" fill="#9ad3f5"><circle cx="${8.5 * CW}" cy="-14" r="6"/><circle cx="${8 * CW}" cy="-34" r="4.5"/><circle cx="${9 * CW}" cy="-36" r="4.5"/><circle cx="${8.5 * CW}" cy="-52" r="3.5"/></g>
          ${boxes}
          <g class="y12-dk__eye" opacity="0"><circle cx="${10.4 * CW}" cy="${3.6 * CH}" r="9" fill="#fff"/><circle cx="${10.6 * CW}" cy="${3.6 * CH}" r="4.5" fill="${FLAT.asphalt}"/></g>
        </svg>
        <svg class="y12-dk__waves" viewBox="0 0 800 80" preserveAspectRatio="none" aria-hidden="true">
          <path class="w1" d="M-400 30 Q-350 14 -300 30 T-200 30 T-100 30 T0 30 T100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30 V80 H-400Z" fill="#5dade2"/>
          <path class="w2" d="M-400 46 Q-350 30 -300 46 T-200 46 T-100 46 T0 46 T100 46 T200 46 T300 46 T400 46 T500 46 T600 46 T700 46 T800 46 T900 46 T1000 46 T1100 46 T1200 46 V80 H-400Z" fill="#2e86c1"/>
        </svg>
      </div>`;
    const whale = art.querySelector<SVGElement>('.y12-dk__whale')!;
    const boxEls = Array.from(art.querySelectorAll<SVGGElement>('.y12-box'));
    const rects = boxEls.map((b) => b.querySelector('rect')!);
    const ribs = boxEls.map((b) => b.querySelector('path')!);

    dock(tl, logo, 0);
    tl.from(art.querySelector('.y12-dk__cmd'), { opacity: 0, y: 20, duration: 0.2 }, 0.1);
    scrubType(tl, art.querySelector<HTMLElement>('.y12-dk__typed')!, '$ sudo docker run -d -p 80:80 whale', 0.5, 0.2);
    tl.from(art.querySelector('.y12-dk__waves'), { yPercent: 60, opacity: 0, duration: 0.3 }, 0.2);
    // containers drop in, bottom row first
    tl.from(boxEls, { y: -420, opacity: 0, duration: 0.28, ease: 'bounce.out', stagger: 0.022 }, 0.5);
    const merged = 0.5 + 0.28 + 0.022 * boxEls.length + 0.1;
    // the gaps close and the cargo becomes one animal
    tl.to(ribs, { opacity: 0, duration: 0.2 }, merged);
    rects.forEach((rect, i) =>
      tl.to(
        rect,
        {
          attr: { x: cells[i].c * CW, y: cells[i].r * CH, width: CW, height: CH },
          fill: cells[i].r >= 5 ? '#d6eaf8' : FLAT.river,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        merged + i * 0.004,
      ),
    );
    tl.to(art.querySelector('.y12-dk__eye'), { opacity: 1, duration: 0.15 }, merged + 0.4);
    tl.from(
      art.querySelectorAll('.y12-dk__spout circle'),
      { opacity: 0, y: 30, scale: 0, transformOrigin: '50% 100%', stagger: 0.06, duration: 0.25, ease: 'back.out(3)' },
      merged + 0.5,
    );
    // ...and swims off to the right, bobbing
    const swim = merged + 0.9;
    // (with reduced motion the scene is shown at its end state, so keep the whale in frame)
    if (!reducedMotion) {
      tl.to(whale, { xPercent: 160, duration: 0.9, ease: 'power2.in' }, swim);
      tl.to(whale, { y: -14, duration: 0.15, yoyo: true, repeat: 5, ease: 'sine.inOut' }, swim);
    }
    tl.to(art.querySelector('.w1'), { x: -100, duration: swim + 0.9, ease: 'none' }, 0);
    tl.to(art.querySelector('.w2'), { x: 100, duration: swim + 0.9, ease: 'none' }, 0);
    tl.to({}, { duration: 0.2 });
  },
};

/* ---------------- React: the page comes apart into components, then snaps back ---------------- */

const react: StageScene = {
  year: '2013',
  name: 'React',
  kicker: 'Rethinking best practices',
  line: 'Think of the UI as composable parts.',
  className: 'y12-scene y12-scene--react',
  logo: longShadowBadge(siReact, FLAT.asphalt, '#61dafb'),
  length: 1.6,
  play({ art, logo, tl }) {
    const jsx = `<App>\n  <Header />\n  <Hero />\n  <Feed>\n    <Post /> <Post /> <Post />\n  </Feed>\n  <Sidebar />\n</App>`;
    art.innerHTML = `
      <pre class="y12-rx__code"><code class="y12-rx__typed"></code></pre>
      <div class="y12-rx__page" style="--outline:0">
        <div class="y12-rx__c y12-rx__header" data-name="Header"><b>Flatly</b><i></i><i></i><i></i></div>
        <div class="y12-rx__c y12-rx__hero" data-name="Hero"><span>Big, bold, flat.</span><em>Get started</em></div>
        <div class="y12-rx__c y12-rx__feed" data-name="Feed">
          ${[FLAT.turquoise, FLAT.carrot, FLAT.amethyst].map((c) => `<div class="y12-rx__c y12-rx__post" data-name="Post"><i style="background:${c}"></i><span></span><span></span></div>`).join('')}
        </div>
        <div class="y12-rx__c y12-rx__side" data-name="Sidebar"><span></span><span></span><span></span><span></span></div>
      </div>`;
    const comps = Array.from(art.querySelectorAll<HTMLElement>('.y12-rx__page > .y12-rx__c'));
    const posts = Array.from(art.querySelectorAll<HTMLElement>('.y12-rx__post'));
    const page = art.querySelector<HTMLElement>('.y12-rx__page')!;
    // exploded-view offsets (header up, sidebar right, feed down, posts fan out); kept short enough
    // that nothing flies under the HUD or off the right edge, and halved on phones
    const burst: [number, number, number][] = [
      [-30, -22, -3],
      [-70, -6, 2],
      [-20, 60, -2],
      [28, 18, 4],
    ];
    const k = () => (mobile() ? 0.45 : 1);

    dock(tl, logo, 0);
    tl.from(page, { opacity: 0, y: 40, duration: 0.3 }, 0.15);
    tl.from(art.querySelector('.y12-rx__code'), { opacity: 0, x: -30, duration: 0.25 }, 0.3);
    scrubType(tl, art.querySelector<HTMLElement>('.y12-rx__typed')!, jsx, 1.1, 0.45);
    tl.to(page, { '--outline': 1, duration: 0.2 }, 0.6);
    comps.forEach((c, i) => {
      tl.to(
        c,
        {
          x: () => burst[i][0] * k(),
          y: () => burst[i][1] * k(),
          rotate: burst[i][2],
          duration: 0.45,
          ease: 'power3.out',
        },
        0.85 + i * 0.05,
      );
    });
    // posts drop below the <Feed> tag instead of rising into it
    posts.forEach((p, i) =>
      tl.to(
        p,
        {
          y: () => (22 + i * 6) * k(),
          x: () => (i - 1) * 18 * k(),
          rotate: (i - 1) * 3,
          duration: 0.4,
          ease: 'power3.out',
        },
        1.05,
      ),
    );
    const snap = 1.85;
    tl.to([...comps, ...posts], { x: 0, y: 0, rotate: 0, duration: 0.4, ease: 'back.inOut(1.6)', stagger: 0.03 }, snap);
    tl.to(page, { '--outline': 0, duration: 0.25 }, snap + 0.45);
    tl.to({}, { duration: 0.4 });
  },
};

export const STAGE_2012: StageScene[] = [bootstrap2, angular, docker, react];
