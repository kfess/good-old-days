import { gsap, ScrollTrigger, reducedMotion } from '../core/scroll';
import { holdHudYear } from '../core/stage';
import { esc, h } from '../core/util';
import { brandName } from './brand';

export interface SceneCtx {
  /** the scene root (`.stage__scene`) */
  scene: HTMLElement;
  /** full-bleed layer for the technology's own animation */
  art: HTMLElement;
  /** the big era-styled logo */
  logo: HTMLElement;
  /** name + one-liner block */
  copy: HTMLElement;
  /**
   * Scene-local timeline. Build it with any durations: it is scrubbed by scroll and stretched
   * to fit the scene's `length`. Position 0 = scene fully entered, end = scene about to leave.
   */
  tl: gsap.core.Timeline;
}

export interface StageScene {
  /** "2010" or "2010.01"; the first four digits drive the giant background year */
  year: string;
  name: string;
  /** one-line caption under the name */
  line: string;
  /** small English line above the name */
  kicker?: string;
  /** big logo HTML, drawn in the era's style (see `logo()` + era CSS) */
  logo?: string;
  /** extra class on the scene for layout variants */
  className?: string;
  /** how many viewport heights of scrolling the scene's own animation takes (default 1.4) */
  length?: number;
  /** timeline progress (0–1) shown when motion is reduced; default 1, the end state (empty if the scene bows out) */
  still?: number;
  play?: (ctx: SceneCtx) => void;
}

/** The technology's name as the brand writes it (wordmark, brand typeface or substitute). */
function nameTag(name: string): string {
  const b = brandName(name);
  return `<h3 class="stage__name${b.cls ? ' ' + b.cls : ''}"${b.style ? ` style="${b.style}"` : ''}>${b.html}</h3>`;
}

const ENTER = 0.6;
const EXIT = 0.6;

/**
 * Full-screen "entrance" scenes for an era's headline technologies.
 * The block pins; each scene enters (logo from blur), plays its own scrubbed animation,
 * then dissolves into the next while the giant background year rolls.
 */
export function createStage(parent: HTMLElement, scenes: StageScene[]): HTMLElement {
  const odo = '<span class="stage__odo"><span class="stage__strip">0123456789</span></span>'.repeat(4);
  const el = h(`
    <div class="stage${reducedMotion ? ' stage--static' : ''}">
      <div class="stage__pin">
        <div class="stage__year" aria-hidden="true">${odo}</div>
        ${scenes
          .map(
            (s, i) => `
          <article class="stage__scene${s.className ? ' ' + s.className : ''}" data-i="${i}" aria-label="${esc(s.year)} ${esc(s.name)}">
            <div class="stage__art" aria-hidden="true"></div>
            <div class="stage__logo" aria-hidden="true"><div class="stage__logo-in">${s.logo ?? ''}</div></div>
            <div class="stage__copy">
              <p class="stage__kicker"><span class="stage__kyear">${esc(s.year)}</span>${s.kicker ? ` · ${esc(s.kicker)}` : ''}</p>
              ${nameTag(s.name)}
              <p class="stage__line">${esc(s.line)}</p>
            </div>
          </article>`,
          )
          .join('')}
        <ol class="stage__dots" aria-hidden="true">${scenes.map(() => '<li></li>').join('')}</ol>
      </div>
    </div>`);
  parent.appendChild(el);

  const pin = el.querySelector<HTMLElement>('.stage__pin')!;
  const sceneEls = Array.from(el.querySelectorAll<HTMLElement>('.stage__scene'));
  const strips = Array.from(el.querySelectorAll<HTMLElement>('.stage__strip'));
  const dots = Array.from(el.querySelectorAll<HTMLElement>('.stage__dots li'));

  let shown = -1;
  let pinned = false;
  const sceneYear = (i: number) => Number(scenes[i].year.slice(0, 4));
  const show = (i: number) => {
    if (i === shown) return;
    shown = i;
    if (pinned) holdHudYear(sceneYear(i));
    scenes[i].year
      .slice(0, 4)
      .split('')
      .forEach((d, k) => (strips[k].style.transform = `translateY(${-Number(d) * 10}%)`));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    sceneEls.forEach((s, k) => s.classList.toggle('is-current', k === i));
  };

  const subs = scenes.map((s, i) => {
    const sc = sceneEls[i];
    const tl = gsap.timeline({ paused: true });
    s.play?.({
      scene: sc,
      art: sc.querySelector('.stage__art')!,
      logo: sc.querySelector('.stage__logo')!,
      copy: sc.querySelector('.stage__copy')!,
      tl,
    });
    if (tl.duration() === 0) tl.to({}, { duration: 1 });
    return tl;
  });
  show(0);

  if (reducedMotion) {
    subs.forEach((tl, i) => tl.progress(scenes[i].still ?? 1));
    return el;
  }

  const master = gsap.timeline({ defaults: { ease: 'none' } });
  const intro = gsap.timeline({
    scrollTrigger: { trigger: pin, start: 'top 80%', end: 'top 5%', scrub: 0.6 },
  });
  const marks: number[] = [];
  let t = 0;
  let firstExit = Infinity;
  scenes.forEach((s, i) => {
    const sc = sceneEls[i];
    // the entrance scales an inner wrapper, so it never fights a scene's own tweens on `.stage__logo`
    const logoEl = sc.querySelector('.stage__logo-in')!;
    const copyKids = sc.querySelectorAll('.stage__copy > *');
    const len = s.length ?? 1.4;

    marks.push(t);
    // the first scene makes its entrance while the stage scrolls into view, before the pin
    const enter = i === 0 ? intro : master;
    const at = i === 0 ? 0 : t;
    enter.fromTo(sc, { autoAlpha: 0, scale: 0.92, filter: 'blur(18px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: ENTER, ease: 'power2.out' }, at);
    enter.fromTo(logoEl, { scale: 0.5, rotate: -8 }, { scale: 1, rotate: 0, duration: ENTER * 1.2, ease: 'back.out(1.6)' }, at);
    enter.fromTo(copyKids, { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: ENTER, ease: 'power3.out' }, at + 0.15);
    if (i > 0) t += ENTER;
    master.add(subs[i].tweenFromTo(0, subs[i].duration(), { duration: len, ease: 'none', immediateRender: false }), t);
    t += len;
    if (i < scenes.length - 1) {
      // explicit start values: a `.to` would record whatever state the scene was in when the master first
      // rendered (e.g. still hidden after a deep link or a rail jump) and restore that on the way back up
      master.fromTo(
        sc,
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)' },
        { autoAlpha: 0, scale: 1.18, filter: 'blur(16px)', duration: EXIT, ease: 'power2.in', immediateRender: false },
        t,
      );
      if (i === 0) firstExit = t + EXIT;
      t += EXIT * 0.5;
    }
  });
  master.to({}, { duration: 0.4 });

  const vhPerUnit = 0.7;
  let measuring = false;
  const sync = () => {
    // a refresh rewinds to 0 to measure: showing scene 0 then would roll the giant year back and forth
    if (measuring) return;
    const now = master.time();
    let i = 0;
    for (let k = 0; k < marks.length; k++) if (marks[k] <= now + 0.2) i = k;
    show(i);
    // the first scene also belongs to the intro scrub; after a jump past the stage both scrubs run at
    // once and the intro may render last, leaving the first scene on top of the last one. Past its exit,
    // the master (the slower scrub, so the last to render) has the final say.
    if (now >= firstExit && sceneEls[0].style.visibility !== 'hidden') gsap.set(sceneEls[0], { autoAlpha: 0 });
  };
  master.eventCallback('onUpdate', sync);
  // a refresh rewinds every animation to measure (firing onUpdate at time 0), then restores it with
  // events suppressed: hold still while it measures, then re-sync, or the dots and `is-current` stay on the first scene
  ScrollTrigger.addEventListener('refreshInit', () => (measuring = true));
  ScrollTrigger.addEventListener('refresh', () => {
    measuring = false;
    sync();
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      pin: true,
      start: 'top top',
      end: () => `+=${master.duration() * window.innerHeight * vhPerUnit}`,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        pinned = self.isActive;
        holdHudYear(pinned ? sceneYear(Math.max(0, shown)) : null);
      },
    },
  }).add(master);

  return el;
}

/** Typewriter tied to a scrubbed timeline: reveals `text` in `el` over `duration`. */
export function scrubType(tl: gsap.core.Timeline, el: HTMLElement, text: string, duration: number, at?: gsap.Position): void {
  const p = { n: 0 };
  tl.to(
    p,
    {
      n: text.length,
      duration,
      ease: 'none',
      onUpdate: () => {
        el.textContent = text.slice(0, Math.round(p.n));
      },
    },
    at,
  );
}
