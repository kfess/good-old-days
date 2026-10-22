import { gsap, reducedMotion } from '../../core/scroll';
import { h, onceInView } from '../../core/util';
import { FLAT, ICONS, badge } from './art';

type FlatColor = keyof typeof FLAT;

const PINS: [string, FlatColor, keyof typeof ICONS, number][] = [
  ['Free PSD: iOS 7 UI kit', 'river', 'phone', 210],
  ['Long shadow icon set', 'turquoise', 'chart', 150],
  ['Minimal workspace', 'concrete', 'laptop', 250],
  ['Parallax inspiration', 'amethyst', 'cloud', 180],
  ['Ghost buttons, done right', 'alizarin', 'mail', 140],
  ['Flat UI color palette', 'emerald', 'tablet', 220],
  ['Retina-ready wallpapers', 'asphalt', 'laptop', 170],
  ['One-page portfolio themes', 'carrot', 'chart', 230],
  ['Hipster logo pack', 'sunflower', 'mail', 160],
];

const pin = ([title, color, icon, height]: (typeof PINS)[number], i: number) => `
  <article class="lm-pin">
    <div class="lm-pin__img" style="height:${height}px;background:${FLAT[color]}">${badge('rgba(0,0,0,.12)', icon)}</div>
    <h5>${title}</h5>
    <p>♥ ${(37 * (i + 3)) % 400} · ${(13 * (i + 2)) % 90} repins</p>
  </article>`;

const PRESETS = [
  { w: 1024, label: 'Desktop' },
  { w: 768, label: 'Tablet' },
  { w: 360, label: 'Phone' },
];

/** Bootstrap 3 grid tier for a viewport width */
const tier = (w: number) => (w >= 1200 ? 'lg' : w >= 992 ? 'md' : w >= 768 ? 'sm' : 'xs');

/**
 * A 2013 one-page startup site inside a resizable browser frame. Container queries play the
 * part of media queries: nav collapses to a hamburger with an off-canvas menu, columns reflow,
 * the hero parallaxes as the inner page scrolls, and the Pinterest grid loads forever.
 */
export function mountResponsive(parent: HTMLElement): void {
  const el = h(`
    <section class="y12-panel y12-rd">
      <header class="y12-head">
        <p class="y12-kicker">Responsive Web Design</p>
        <h3 class="y12-title">One site. Every screen.</h3>
        <p class="y12-jp">One media query, and the same page flows into any screen.</p>
      </header>
      <div class="rd__controls" role="group" aria-label="Screen width">
        ${PRESETS.map((p) => `<button type="button" data-w="${p.w}">${p.label}<small>${p.w}</small></button>`).join('')}
        <output class="rd__readout"></output>
      </div>
      <div class="rd__stage">
        <div class="rd__frame">
          <div class="rd__bar"><i></i><i></i><i></i><span>lumen.io</span></div>
          <div class="rd__body">
            <nav class="lm-off" aria-label="lumen menu">
              <b>lumen</b><a>Features</a><a>Pricing</a><a>Blog</a><a>Contact</a>
            </nav>
            <div class="rd__site" data-lenis-prevent tabindex="0" aria-label="A 2013-style site (scrollable)">
              <header class="lm-nav">
                <b class="lm-logo">lumen</b>
                <ul class="lm-links"><li>Features</li><li>Pricing</li><li>Blog</li><li>Contact</li></ul>
                <button type="button" class="lm-burger" aria-label="menu"><span></span><span></span><span></span></button>
              </header>
              <section class="lm-hero">
                <div class="lm-layer lm-sky" data-speed="0.1"></div>
                <div class="lm-layer lm-sun" data-speed="0.55"></div>
                <svg class="lm-layer lm-mtn lm-mtn--back" data-speed="0.4" viewBox="0 0 400 120" preserveAspectRatio="none"><polygon points="0,120 0,70 60,30 120,75 190,20 260,70 330,35 400,80 400,120" /></svg>
                <svg class="lm-layer lm-mtn lm-mtn--mid" data-speed="0.25" viewBox="0 0 400 120" preserveAspectRatio="none"><polygon points="0,120 0,90 80,50 150,95 230,45 310,92 400,60 400,120" /></svg>
                <svg class="lm-layer lm-mtn lm-mtn--front" data-speed="0.08" viewBox="0 0 400 120" preserveAspectRatio="none"><polygon points="0,120 0,105 100,80 200,108 290,85 400,104 400,120" /></svg>
                <div class="lm-hero__copy">
                  <h4>Beautifully simple.</h4>
                  <p>The flat, responsive, retina-ready way to share your work.</p>
                  <div class="lm-hero__cta"><a class="lm-btn lm-btn--solid">Get started</a><a class="lm-btn lm-btn--ghost">Learn more</a></div>
                </div>
              </section>
              <section class="lm-features">
                <div>${badge(FLAT.turquoise, 'phone')}<h5>Responsive</h5><p>Looks great on every device.</p></div>
                <div>${badge(FLAT.river, 'cloud')}<h5>Cloud sync</h5><p>Your stuff, everywhere.</p></div>
                <div>${badge(FLAT.amethyst, 'chart')}<h5>Analytics</h5><p>Know what works.</p></div>
              </section>
              <section class="lm-pins">
                <h5 class="lm-pins__title">From the community</h5>
                <div class="lm-masonry">${PINS.map(pin).join('')}</div>
                <p class="lm-loader"><i></i>Loading more pins…</p>
              </section>
              <footer class="lm-foot">© 2013 Lumen · Built with Bootstrap 3</footer>
            </div>
          </div>
          <button type="button" class="rd__handle" aria-label="Drag to resize"><i></i></button>
        </div>
      </div>
    </section>`);
  parent.appendChild(el);

  const stage = el.querySelector<HTMLElement>('.rd__stage')!;
  const frame = el.querySelector<HTMLElement>('.rd__frame')!;
  const body = el.querySelector<HTMLElement>('.rd__body')!;
  const site = el.querySelector<HTMLElement>('.rd__site')!;
  const readout = el.querySelector<HTMLElement>('.rd__readout')!;
  const handle = el.querySelector<HTMLElement>('.rd__handle')!;
  const masonry = el.querySelector<HTMLElement>('.lm-masonry')!;
  const loader = el.querySelector<HTMLElement>('.lm-loader')!;
  const presetBtns = el.querySelectorAll<HTMLButtonElement>('.rd__controls button');
  const layers = Array.from(el.querySelectorAll<HTMLElement>('.lm-layer'));

  const state = { w: 1024 };
  const maxW = () => stage.clientWidth;
  let demo: gsap.core.Timeline | null = null;

  function apply(): void {
    const w = Math.round(Math.max(300, Math.min(state.w, maxW())));
    frame.style.width = `${w}px`;
    readout.textContent = `${w}px · .col-${tier(w)}-*`;
    presetBtns.forEach((b) => b.classList.toggle('is-active', Math.abs(Number(b.dataset.w) - w) < 4));
    if (w > 640) setMenu(false);
  }

  function setMenu(open: boolean): void {
    body.classList.toggle('is-open', open);
  }

  function stopDemo(): void {
    demo?.kill();
    demo = null;
  }

  presetBtns.forEach((b) =>
    b.addEventListener('click', () => {
      stopDemo();
      gsap.to(state, { w: Number(b.dataset.w), duration: 0.8, ease: 'power3.inOut', onUpdate: apply });
    }),
  );

  handle.addEventListener('pointerdown', (e) => {
    stopDemo();
    handle.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const w0 = frame.offsetWidth;
    const move = (ev: PointerEvent) => {
      state.w = w0 + (ev.clientX - x0) * 2;
      apply();
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  });

  el.querySelector('.lm-burger')!.addEventListener('click', () => {
    stopDemo();
    setMenu(!body.classList.contains('is-open'));
  });
  el.querySelector('.lm-off')!.addEventListener('click', () => setMenu(false));

  // parallax hero + infinite Pinterest grid, both driven by the inner page's own scroll
  let loading = false;
  let page = 0;
  site.addEventListener(
    'scroll',
    () => {
      const st = site.scrollTop;
      layers.forEach((l) => (l.style.transform = `translate3d(0, ${st * Number(l.dataset.speed)}px, 0)`));
      if (!loading && page < 4 && st + site.clientHeight > site.scrollHeight - 120) {
        loading = true;
        loader.classList.add('is-loading');
        setTimeout(() => {
          page++;
          const shuffled = PINS.map((_, i) => PINS[(i * 4 + page * 3) % PINS.length]);
          masonry.insertAdjacentHTML('beforeend', shuffled.slice(0, 6).map((p, i) => pin(p, i + page * 6)).join(''));
          masonry.querySelectorAll('.lm-pin:not(.is-shown)').forEach((n, i) => {
            (n as HTMLElement).style.animationDelay = `${i * 0.07}s`;
            n.classList.add('is-shown', 'bounceIn');
          });
          loader.classList.remove('is-loading');
          if (page >= 4) loader.textContent = 'You’ve reached the end. Time to go outside.';
          loading = false;
        }, reducedMotion ? 0 : 900);
      }
    },
    { passive: true },
  );
  masonry.querySelectorAll('.lm-pin').forEach((n) => n.classList.add('is-shown'));

  new ResizeObserver(apply).observe(stage);
  state.w = Math.min(1024, maxW());
  apply();

  // a one-time guided tour: desktop → tablet → phone (with the off-canvas menu) → desktop
  if (!reducedMotion) {
    onceInView(el.querySelector('.rd__stage')!, () => {
      if (maxW() < 800) return;
      demo = gsap
        .timeline({ delay: 0.6, onUpdate: apply })
        .to(state, { w: 768, duration: 1, ease: 'power3.inOut', onUpdate: apply })
        .to(state, { w: 360, duration: 1, ease: 'power3.inOut', onUpdate: apply }, '+=0.9')
        .call(() => setMenu(true), [], '+=0.5')
        .call(() => setMenu(false), [], '+=1.3')
        .to(state, { w: Math.min(1024, maxW()), duration: 1.1, ease: 'power3.inOut', onUpdate: apply }, '+=0.6');
    }, 'top 60%');
  }
}
