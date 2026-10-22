import { siReact, siVuedotjs } from 'simple-icons';
import { logo } from '../../components/logo';
import { angularShield } from '../../components/marks';
import { t } from '../../core/i18n';
import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { esc, h } from '../../core/util';

type Framework = 'react' | 'angular' | 'vue';

const ROUTES: Record<
  Framework,
  { name: string; icon: typeof siReact; color: string; line: string; code: string; x: number }
> = {
  react: {
    name: 'React 15',
    icon: siReact,
    color: '#00b8d9',
    line: 'JSX felt weird. Then you couldn’t live without it.',
    code: `class Hello extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}`,
    x: 100,
  },
  angular: {
    name: 'Angular 2',
    icon: angularShield,
    color: '#dd0031',
    line: 'TypeScript by default, years before everyone else.',
    code: `@Component({
  selector: 'app-hello',
  template: '<h1>Hello, {{name}}</h1>'
})
export class HelloComponent { name = 'Angular'; }`,
    x: 300,
  },
  vue: {
    name: 'Vue 2',
    icon: siVuedotjs,
    color: '#41b883',
    line: 'The comfort of <template>, just light enough.',
    code: `<template>
  <h1>Hello, {{ name }}</h1>
</template>
<script>
export default { data: () => ({ name: 'Vue' }) }
</script>`,
    x: 500,
  },
};

const KEYS = Object.keys(ROUTES) as Framework[];

type Reply = { who: string; text: string; score: number; d: number };

/** The argument every 2016 forum had, more or less word for word. `d` is the reply depth. */
const THREAD: Reply[] = t(
  [
    { who: 'react_fan', text: 'React. It’s just JavaScript.', score: 214, d: 0 },
    {
      who: 'separation_of_concerns',
      text: 'JSX puts HTML in your JavaScript. Whatever happened to separation of concerns?',
      score: 187,
      d: 1,
    },
    { who: 'react_fan', text: 'Components are the separation of concerns.', score: 96, d: 2 },
    {
      who: 'ng2_or_bust',
      text: 'Angular 2. TypeScript, DI, a CLI. Real apps need a real framework.',
      score: 142,
      d: 0,
    },
    { who: 'angularjs_veteran', text: 'Angular 2 isn’t even AngularJS. They rewrote everything.', score: 201, d: 1 },
    { who: 'vue_curious', text: 'Vue. Read the docs in an afternoon, shipped by the evening.', score: 133, d: 0 },
    { who: 'enterprise_architect', text: 'Vue is a toy for small projects.', score: 38, d: 1 },
    { who: 'perf_nerd', text: 'The virtual DOM is pure overhead. Look at the benchmarks.', score: 57, d: 0 },
    { who: 'old_timer', text: 'Just use jQuery.', score: -23, d: 0 },
    { who: 'tired_dev', text: 'By the time you’ve decided, there’ll be a fourth one.', score: 312, d: 0 },
  ],
  // the same fight on Japanese Twitter, Qiita and はてブ
  [
    { who: 'react_shinja', text: 'React一択。ただのJavaScriptだし', score: 214, d: 0 },
    { who: 'jsx_muri', text: 'JSXが生理的に無理。HTMLとJS混ぜるとか関心の分離どこいった', score: 187, d: 1 },
    { who: 'react_shinja', text: 'コンポーネント単位で分離してるんだが？', score: 96, d: 2 },
    {
      who: 'sier_naka_no_hito',
      text: '業務ならAngular 2。TypeScript、DI、CLI全部入り。大規模ならこれしかない',
      score: 142,
      d: 0,
    },
    { who: 'angularjs_higaisha', text: 'AngularJSから互換性ゼロで作り直したの、まだ許してない', score: 201, d: 1 },
    {
      who: 'vue_hajimemashita',
      text: 'Vueでいいよ。公式ドキュメントが日本語だし、午後読んで夕方には動いてた',
      score: 133,
      d: 0,
    },
    { who: 'sier_naka_no_hito', text: 'Vueって小規模向けのおもちゃって聞いたけど', score: 38, d: 1 },
    { who: 'bench_ojisan', text: '仮想DOMが速いって信じてる人まだいるの？ベンチ見てから言って', score: 57, d: 0 },
    { who: 'jquery_de_ii', text: 'jQueryで十分', score: -23, d: 0 },
    {
      who: 'tsukareta',
      text: 'またフロントエンド宗教戦争か。自分は思考停止しました',
      score: 312,
      d: 0,
    },
  ],
);

/**
 * The 2016 fork in the road, shown rather than picked: as you scroll, React, Angular 2 and Vue 2
 * take their turn, then all three roads stay lit. Then the internet argues about it until the
 * question is closed as opinion-based. (2018 merges them into TypeScript.)
 */
export function mountBranch(parent: HTMLElement): void {
  const el = h(`
    <section class="y15-panel y15-branch" data-hud-year="2016">
      <div class="y15-branch__pin">
        <header class="y15-head">
          <p class="y15-kicker">2016 · Three roads</p>
          <h3 class="y15-title">React, Angular, or Vue?</h3>
          <p class="y15-jp">Back then, everyone picked one.</p>
        </header>
        <svg class="y15-branch__map" aria-hidden="true">
          ${KEYS.map((k) => `<path data-route="${k}" pathLength="1" style="--fw:${ROUTES[k].color}"/>`).join('')}
        </svg>
        <div class="y15-branch__btns">
          ${KEYS.map(
            (k) => `<div class="y15-pick" data-fw="${k}" style="--fw:${ROUTES[k].color}">
              <span class="y15-pick__icon">${logo(ROUTES[k].icon)}</span><span>${ROUTES[k].name}</span>
            </div>`,
          ).join('')}
        </div>
        <div class="y15-route">
          ${KEYS.map(
            (k) => `
            <div class="y15-route__card" data-fw="${k}" style="--fw:${ROUTES[k].color}">
              <div class="y15-route__head"><span class="y15-route__icon">${logo(ROUTES[k].icon)}</span><div><b>${ROUTES[k].name}</b><p>${esc(ROUTES[k].line)}</p></div></div>
              <pre><code>${esc(ROUTES[k].code)}</code></pre>
            </div>`,
          ).join('')}
          <div class="y15-war">
            <div class="y15-war__q">
              <b class="y15-war__title">${t('Which is better: React, Angular or Vue?', 'React、Angular、Vue どれを選ぶべき？')}</b>
              <div class="y15-war__meta">
                <div>
                  <p class="y15-war__ask">${t(
                    'Starting a new project. Which one should I learn?',
                    '新規案件でフロントのフレームワークを選定中です。どれを勉強するのがいいでしょうか。',
                  )}</p>
                  <p class="y15-war__tags"><span>javascript</span><span>reactjs</span><span>angular2</span><span>vue.js</span></p>
                </div>
                <p class="y15-war__closed">${t(
                  '<b>closed as primarily opinion-based</b> Answers to this question tend to be based on opinions rather than facts.',
                  '<b>「主に意見に基づく」質問としてクローズ済み</b> この質問への回答は、事実ではなく意見に基づくものになりがちです。',
                )}</p>
              </div>
            </div>
            <div class="y15-war__clip">
              <ol class="y15-war__list">
                ${THREAD.map(
                  (c) => `<li class="y15-war__c${c.score < 0 ? ' is-neg' : ''}" style="--d:${c.d}">
                    <span class="y15-war__vote">▲<b>${c.score}</b></span>
                    <div><span class="y15-war__who">${c.who}</span><p>${esc(c.text)}</p></div>
                  </li>`,
                ).join('')}
              </ol>
            </div>
          </div>
          <p class="y15-route__next">→ 2018 · Every road merges into TypeScript.</p>
        </div>
        <p class="y15-fatigue" aria-live="off">${t(
          'New JavaScript frameworks released since you opened this page: <b>0</b> <span class="y15-fatigue__sigh">…and I still haven’t caught up with the last one.</span>',
          'このページを開いてから出た新しいJSフレームワーク: <b>0</b> <span class="y15-fatigue__sigh">……前のやつもまだ触れてない</span>',
        )}</p>
      </div>
    </section>`);
  parent.appendChild(el);

  const pin = el.querySelector<HTMLElement>('.y15-branch__pin')!;
  const paths = Array.from(el.querySelectorAll<SVGPathElement>('.y15-branch__map path'));
  const chips = Array.from(el.querySelectorAll<HTMLElement>('.y15-pick'));
  const cards = Array.from(el.querySelectorAll<HTMLElement>('.y15-route__card'));
  const next = el.querySelector<HTMLElement>('.y15-route__next')!;
  const war = el.querySelector<HTMLElement>('.y15-war')!;
  const clip = el.querySelector<HTMLElement>('.y15-war__clip')!;
  const list = el.querySelector<HTMLElement>('.y15-war__list')!;
  const comments = Array.from(el.querySelectorAll<HTMLElement>('.y15-war__c'));
  const scores = comments.map((c) => c.querySelector('b')!);
  const closed = el.querySelector<HTMLElement>('.y15-war__closed')!;
  const map = el.querySelector<SVGSVGElement>('.y15-branch__map')!;

  // easter egg: JavaScript fatigue, measured from when the page was opened; ticks only while on screen
  const fatigue = el.querySelector<HTMLElement>('.y15-fatigue b')!;
  const tick = () => {
    const n = String(1 + Math.floor(performance.now() / 8000));
    if (n === fatigue.textContent) return;
    fatigue.textContent = n;
    if (reducedMotion) return;
    fatigue.classList.remove('is-bump');
    void fatigue.offsetWidth; // restart the animation
    fatigue.classList.add('is-bump');
  };
  tick();
  let timer = 0;
  new IntersectionObserver(([e]) => {
    window.clearInterval(timer);
    if (e.isIntersecting) {
      tick();
      timer = window.setInterval(tick, 1000);
    }
  }).observe(el);

  // the roads are drawn in the SVG's own pixel space, from the trunk (top centre) to the
  // top centre of each chip as actually laid out, so they always land on their chip
  const layout = () => {
    const box = map.getBoundingClientRect();
    if (!box.width) return;
    map.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const x0 = box.width / 2;
    chips.forEach((chip, i) => {
      const r = chip.getBoundingClientRect();
      const x = r.left + r.width / 2 - box.left;
      const y = r.top - box.top;
      paths[i].setAttribute('d', `M${x0} 0 C${x0} ${y * 0.55} ${x} ${y * 0.4} ${x} ${y}`);
    });
  };
  layout();
  window.addEventListener('resize', layout);
  ScrollTrigger.addEventListener('refresh', layout);
  document.fonts?.ready.then(layout);

  if (reducedMotion) {
    el.classList.add('is-static', 'is-all');
    war.classList.add('is-closed');
    chips.forEach((c) => c.classList.add('is-on'));
    paths.forEach((p) => p.classList.add('is-on'));
    return;
  }

  // pathLength="1": the draw-on animation doesn't depend on the measured geometry
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(cards, { autoAlpha: 0, y: 30 });
  gsap.set([next, war, closed], { autoAlpha: 0 });
  gsap.set(comments, { autoAlpha: 0, x: -16 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: pin,
      pin: true,
      start: 'top top',
      end: '+=520%',
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  KEYS.forEach((_, i) => {
    const at = i * 1.2;
    // the outgoing card is gone before the next one arrives, so their text never overprints
    const fadeIn = i > 0 ? at + 0.3 : at + 0.15;
    tl.add(() => chips.forEach((c, k) => c.classList.toggle('is-on', k === i)), at)
      .to(paths[i], { strokeDashoffset: 0, duration: 0.6 }, at)
      .to(cards[i], { autoAlpha: 1, y: 0, duration: 0.4 }, fadeIn);
    if (i > 0) tl.to(cards[i - 1], { autoAlpha: 0, y: -30, duration: 0.28, ease: 'power2.in' }, at);
  });
  // all three roads stay lit; the last card steps aside for the argument
  tl.add(() => {
    chips.forEach((c) => c.classList.add('is-on'));
    el.classList.add('is-all');
  }, 3.7)
    .to(cards[2], { autoAlpha: 0, y: -30, duration: 0.4 }, 3.7)
    .fromTo(war, { y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 3.9);

  // the replies pile in, each scrolling the thread so the newest sits at the bottom, votes ticking up
  const shift = (i: number) => {
    const c = comments[i];
    return Math.min(0, clip.clientHeight - (c.offsetTop + c.offsetHeight));
  };
  const commentAt = (i: number) => 4.3 + i * 0.42;
  comments.forEach((c, i) => {
    tl.to(list, { y: () => shift(i), duration: 0.3 }, commentAt(i)).to(
      c,
      { autoAlpha: 1, x: 0, duration: 0.25 },
      commentAt(i) + 0.05,
    );
  });
  const closeAt = commentAt(THREAD.length) + 0.4;

  // the moderator arrives; then the answer nobody argued for
  tl.fromTo(closed, { scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, closeAt)
    .to(war, { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power2.in' }, closeAt + 0.9)
    .to(next, { autoAlpha: 1, duration: 0.5 }, closeAt + 1.2)
    .to({}, { duration: 0.6 });
  // scrubbing backwards must undo the class toggles too
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    const all = t >= 3.7;
    el.classList.toggle('is-all', all);
    war.classList.toggle('is-closed', t >= closeAt);
    // votes are read straight off the playhead, so a jump in the scroll never strands a count
    scores.forEach((b, i) => {
      const p = gsap.utils.clamp(0, 1, (t - commentAt(i) - 0.1) / 0.9);
      b.textContent = String(Math.round(THREAD[i].score * (1 - (1 - p) ** 2)));
    });
    chips.forEach((c, k) => c.classList.toggle('is-on', all || (t >= k * 1.2 && t < (k + 1) * 1.2)));
    paths.forEach((p, k) => p.classList.toggle('is-on', t >= k * 1.2));
  });
}
