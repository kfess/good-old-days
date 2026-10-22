import { gsap, reducedMotion } from '../../core/scroll';
import { h } from '../../core/util';
import { FLAT, badge } from './art';

/** Opening: the catchphrase and a cluster of long-shadow badges drifting in parallax. */
export function mountIntro(parent: HTMLElement): void {
  const el = h(`
    <header class="y12-intro">
      <div class="y12-intro__text">
        <p class="y12-intro__years">2012 <span>—</span> 2014</p>
        <h2 class="y12-intro__title">
          <span class="w w1">Flat.</span>
          <span class="w w2">Fluid.</span>
          <span class="w w3">Everywhere.</span>
        </h2>
        <p class="y12-intro__jp">Shed the gloss and shadows, and flowed into every screen.</p>
      </div>
      <div class="y12-intro__art" aria-hidden="true">
        <div class="b b1" data-depth="0.25">${badge(FLAT.turquoise, 'laptop')}</div>
        <div class="b b2" data-depth="0.6">${badge(FLAT.river, 'phone')}</div>
        <div class="b b3" data-depth="0.45">${badge(FLAT.amethyst, 'tablet')}</div>
        <div class="b b4" data-depth="0.8">${badge(FLAT.carrot, 'cloud')}</div>
        <div class="b b5" data-depth="0.35">${badge(FLAT.alizarin, 'mail')}</div>
        <div class="b b6" data-depth="0.7">${badge(FLAT.sunflower, 'chart')}</div>
      </div>
    </header>`);
  parent.appendChild(el);

  if (reducedMotion) return;

  const words = el.querySelectorAll('.y12-intro__title .w');
  const badges = el.querySelectorAll<HTMLElement>('.y12-intro__art .b');
  gsap.from(words, {
    yPercent: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 70%' },
  });
  gsap.from(badges, {
    scale: 0.3,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'back.out(1.8)',
    scrollTrigger: { trigger: el, start: 'top 70%' },
  });
  // gentler drift on phones, where the cluster sits right under the copy
  const drift = () => (window.matchMedia('(max-width: 759.98px)').matches ? 0.18 : 0.4);
  badges.forEach((b) => {
    const depth = Number(b.dataset.depth);
    gsap.to(b, {
      y: () => -window.innerHeight * depth * drift(),
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
}
