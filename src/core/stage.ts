import { gsap, ScrollTrigger, jumpTo, reducedMotion, scrollToEl } from './scroll';
import type { Era, EraTheme } from './types';

const root = document.documentElement;

function applyTheme(t: EraTheme): void {
  root.style.setProperty('--bg', t.bg);
  root.style.setProperty('--fg', t.fg);
  root.style.setProperty('--accent', t.accent);
  root.style.setProperty('--muted', t.muted);
}

// Steep in the middle: light↔dark boundaries spend as little time as possible in muddy mid-greys
const themeEase = gsap.parseEase('expo.inOut');

/*
 * Era boundaries cross-fade two fixed background layers (opacity only, compositor-cheap) instead of
 * rewriting the colour variables every frame, which forced a style recalc of the whole page.
 * The variables themselves flip once, at the midpoint, so text never sits on a matching mid-grey.
 */
const bgBase = document.getElementById('stage-bg')!;
const bgFade = document.createElement('i');
bgFade.className = 'stage-bg__fade';
bgBase.appendChild(bgFade);

let sideTheme: EraTheme | null = null;
function setSide(t: EraTheme): void {
  if (sideTheme === t) return;
  sideTheme = t;
  applyTheme(t);
}

function blend(a: EraTheme, b: EraTheme, p: number): void {
  bgBase.style.background = a.bg;
  bgFade.style.background = b.bg;
  bgFade.style.opacity = String(themeEase(p));
  setSide(p < 0.5 ? a : b);
}

function settle(t: EraTheme): void {
  bgBase.style.background = t.bg;
  bgFade.style.opacity = '0';
  setSide(t);
}

/* ---------------- HUD ---------------- */

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="hud__left">
    <div class="hud__year" aria-hidden="true">${'<span class="odo"><span class="odo__strip">0123456789</span></span>'.repeat(4)}</div>
    <div class="hud__era"></div>
  </div>
  <div class="hud__servers">
    <span class="hud__srv-label">SERVERS</span>
    <b class="hud__srv-val">0</b>
    <span class="hud__srv-unit"></span>
  </div>
  <nav class="hud__rail" aria-label="Eras"></nav>
`;
const odoStrips = Array.from(hud.querySelectorAll<HTMLElement>('.odo__strip'));
const eraLabel = hud.querySelector<HTMLElement>('.hud__era')!;
const srvVal = hud.querySelector<HTMLElement>('.hud__srv-val')!;
const srvUnit = hud.querySelector<HTMLElement>('.hud__srv-unit')!;
const rail = hud.querySelector<HTMLElement>('.hud__rail')!;

let shownYear = -1;
// the year the era's scroll progress points at, and a year a pinned stage scene is holding instead
let progressYear = 0;
let heldYear: number | null = null;
function setYear(year: number): void {
  if (year === shownYear) return;
  shownYear = year;
  String(year)
    .padStart(4, '0')
    .split('')
    .forEach((d, i) => {
      odoStrips[i].style.transform = `translateY(${-Number(d) * 10}%)`;
    });
}

/**
 * While a stage scene is pinned, the HUD shows that scene's year (the giant background year), so the
 * two odometers never disagree; `null` hands the HUD back to the era's scroll progress.
 */
export function holdHudYear(year: number | null): void {
  heldYear = year;
  setYear(year ?? progressYear);
}

const srvState = { n: 0 };
function setServers(s: Era['servers']): void {
  srvUnit.textContent = s.unit;
  gsap.killTweensOf(srvState);
  if (s.value === '∞' || reducedMotion) {
    srvState.n = s.value === '∞' ? 0 : s.value;
    srvVal.textContent = s.value.toLocaleString('en-US');
    return;
  }
  gsap.to(srvState, {
    n: s.value,
    duration: 1.2,
    ease: 'power2.out',
    onUpdate: () => {
      srvVal.textContent = Math.round(srvState.n).toLocaleString('en-US');
    },
  });
}

let activeId = '';
function activate(era: Era): void {
  if (era.id === activeId) return;
  activeId = era.id;
  root.dataset.era = era.id;
  root.style.setProperty('--hud-font', era.hudFont);
  eraLabel.textContent = era.label;
  setServers(era.servers);
  rail.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.era === era.id);
    if (b.dataset.era === era.id) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
}

export function setHudVisible(visible: boolean): void {
  hud.classList.toggle('is-hidden', !visible);
  // hidden behind the prologue's intro: keep the rail out of the tab order too
  rail.inert = !visible;
}

/* ---------------- mounting ---------------- */

export function mountEras(app: HTMLElement, eras: Era[]): void {
  document.body.appendChild(hud);
  settle(eras[0].theme);

  const sections = eras.map((era) => {
    const section = document.createElement('section');
    section.className = `era era--${era.id}`;
    section.dataset.era = era.id;
    const [y0, y1] = era.years;
    const span = y0 === y1 ? `${y0}` : `${y0}–${y1}`;
    section.setAttribute('aria-label', `${span} ${era.label}`);
    app.appendChild(section);
    era.render(section);

    const tick = document.createElement('button');
    tick.type = 'button';
    tick.dataset.era = era.id;
    tick.innerHTML = `<span>${era.id === 'prologue' ? '–' + era.years[1] : era.years[0]}</span>`;
    tick.title = era.label;
    tick.setAttribute('aria-label', era.id === 'prologue' ? era.label : `${span}: ${era.label}`);
    tick.addEventListener('click', () => scrollToEl(section));
    rail.appendChild(tick);
    return section;
  });

  const hudTriggers: ScrollTrigger[] = [];
  const blendTriggers: (ScrollTrigger | null)[] = [];

  eras.forEach((era, i) => {
    const section = sections[i];

    // HUD: era label, fonts, server meter and the rolling year
    hudTriggers[i] = ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      // measured after every pin inside the sections, or the pin spacing isn't counted and the HUD
      // runs ahead going down / sticks on the later era going back up
      refreshPriority: -1,
      onEnter: () => activate(era),
      onEnterBack: () => activate(era),
      onUpdate: (self) => {
        const [from, to] = era.years;
        progressYear = Math.min(to, from + Math.floor(self.progress * (to - from + 1)));
        if (heldYear === null) setYear(progressYear);
      },
    });

    // Colors: blend from the previous era while the boundary crosses the viewport
    blendTriggers[i] = null;
    if (i > 0) {
      const prev = eras[i - 1].theme;
      blendTriggers[i] = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'top 25%',
        refreshPriority: -1,
        onUpdate: (self) => blend(prev, era.theme, self.progress),
        onLeave: () => settle(era.theme),
        onLeaveBack: () => settle(prev),
      });
    }
  });

  activate(eras[0]);
  progressYear = eras[0].years[0];
  setYear(progressYear);

  // Fonts and images change layout sizes; recompute pin/scrub positions once they settle
  // (sort first: eras that create triggers lazily must still be measured in page order)
  const refresh = () => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  document.fonts?.ready.then(refresh);
  // sections that grow after the first measurement (lazy content, fonts, images) shift every pin below
  // them; re-measure once the page height settles so pins engage and release without a jump
  let lastH = 0;
  let pending = 0;
  new ResizeObserver(() => {
    const hNow = app.scrollHeight;
    if (Math.abs(hNow - lastH) < 2) return;
    lastH = hNow;
    clearTimeout(pending);
    pending = window.setTimeout(refresh, 250);
  }).observe(app);
  /*
   * The callbacks above only fire on transitions. A refresh that briefly scrolls the page elsewhere
   * (see keepPlaceOnResize) can leave them on the wrong era, so derive the HUD and colours from the
   * scroll position itself after every refresh.
   */
  const syncToScroll = () => {
    const y = ScrollTrigger.isScrolling() ? -1 : window.scrollY;
    if (y < 0) return;
    const i = hudTriggers.findIndex((t) => y >= t.start && y < t.end);
    if (i >= 0) {
      activate(eras[i]);
      const [from, to] = eras[i].years;
      progressYear = Math.min(to, from + Math.floor(hudTriggers[i].progress * (to - from + 1)));
      if (heldYear === null) setYear(progressYear);
    }
    let theme = eras[0].theme;
    blendTriggers.forEach((t, k) => {
      if (!t || y < t.start) return;
      if (y < t.end) blend(eras[k - 1].theme, eras[k].theme, t.progress);
      theme = eras[k].theme;
    });
    const open = blendTriggers.some((t) => t && y >= t.start && y < t.end);
    if (!open) settle(theme);
  };
  keepPlaceOnResize(sections, syncToScroll);
  window.addEventListener('load', () => {
    refresh();
    // deep links (e.g. #stack-y2018) only land correctly once pins have their final size
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target) requestAnimationFrame(() => window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 120));
  });
}

/**
 * Pins are sized in viewport heights, so a resize or a rotation changes the page height under the
 * reader, and a refresh that crosses the mobile breakpoint (eras rebuilding their triggers in
 * gsap.matchMedia) can even leave the page at the top. Remember where in which section the middle of
 * the screen was, and go back there after each refresh that the resize causes.
 */
function keepPlaceOnResize(sections: HTMLElement[], resync: () => void): void {
  // touch browsers resize the height whenever the toolbar slides: only a width change (rotation) counts there
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let w = window.innerWidth;
  let hgt = window.innerHeight;
  let anchor: { el: HTMLElement; f: number } | null = null;
  let lastResize = 0;

  window.addEventListener('resize', () => {
    const changed = window.innerWidth !== w || (!coarse && window.innerHeight !== hgt);
    w = window.innerWidth;
    hgt = window.innerHeight;
    if (!changed) return;
    lastResize = performance.now();
    if (anchor) return; // keep the spot from before the first resize of a drag
    const mid = window.innerHeight / 2;
    const el = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    if (el) {
      const r = el.getBoundingClientRect();
      anchor = { el, f: (mid - r.top) / r.height };
    }
  });

  ScrollTrigger.addEventListener('refresh', () => {
    if (!anchor) return resync();
    const r = anchor.el.getBoundingClientRect();
    const y = window.scrollY + r.top + anchor.f * r.height - window.innerHeight / 2;
    if (Math.abs(y - window.scrollY) > 2) jumpTo(y);
    ScrollTrigger.update();
    resync();
    // ScrollTrigger's own resize refresh runs 200ms after the last resize event; later refreshes are not ours
    if (performance.now() - lastResize > 250) anchor = null;
  });
}
