import { gsap, MOBILE_QUERY, reducedMotion, ScrollTrigger, scrollToEl } from '../../core/scroll';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

import { clawd } from '../../components/clawd';
import { hasAnalytics, openConsent } from '../../core/analytics';
import { h } from '../../core/util';

const CENTER_TRICKS = [
  'margin: 0 auto;',
  'vertical-align: middle;',
  'position: absolute; top: 50%;',
  'display: table-cell;',
];

/** The struggles we put up with, and loved. Each one was everyday reality in its year. */
const PAINS: [string, string, string][] = [
  ['1999', 'Slicing PSDs into table cells.', 'Pixel-perfect in exactly one browser.'],
  ['2001', 'View Source was the only tutorial.', 'Copy. Paste. Ship.'],
  ['2003', 'FTP straight to production.', 'Backup: index_old_final2.html'],
  ['2006', 'Debugging IE6 with alert().', 'OK. OK. OK. OK.'],
  ['2008', 'Rounded corners?', 'Four GIF images.'],
  ['2009', 'Clearfix.', 'Always clearfix.'],
  ['2010', '“It works on my machine.”', 'Closed: WORKSFORME.'],
  ['2011', 'Centering a div. Vertically.', ''],
  ['2012', 'Deploying on Friday at 5 p.m.', 'Weekend: cancelled.'],
  ['2013', 'SSH into prod at 2 a.m.', 'tail -f and pray.'],
  ['2014', '“Who wrote this garbage?” git blame.', 'It was me.'],
  ['2016', 'npm install.', 'Make coffee. Still installing.'],
  ['2017', 'A 400-line webpack.config.js.', 'Nobody dared touch it.'],
  ['2018', 'Day 1: I fully understand Kubernetes.', 'Day 30: I understand nothing.'],
  ['2019', 'YAML until midnight.', 'One space off.'],
  ['2020', 'Standup on Zoom.', '“You’re on mute.”'],
  ['2022', 'npm audit: 1,337 vulnerabilities.', 'npm audit fix --force. Everything broke.'],
];

/**
 * The last word after "What will you build next?": back to the 1999 starfield,
 * an honest confession, and the irony of how this page was made.
 */
export function buildCoda(): HTMLElement {
  const el = h(`
    <div class="coda-wrap">
    <div class="coda">
      <div class="coda__sticky">
        <div class="coda__sky" aria-hidden="true"></div>
        <div class="coda__miss">
          <p class="coda__k">But honestly?</p>
          <h2 class="coda__title">I miss the<br />good old days.</h2>
          <p class="coda__strong"><span>Strongly.</span></p>
        </div>
        <div class="coda__pains">
          <p class="coda__then">Back then:</p>
          <ol class="coda__list">${PAINS.map(([y, t, punch]) =>
            y === '2011'
              ? // the one line that never quite lands in the middle, whatever trick it tries
                `<li class="coda__center"><b>${y}</b><span class="coda__ctr"><span class="coda__ctr-t">${t}</span>${CENTER_TRICKS.map((c, i) => `<i style="--i:${i}">✗ ${c}</i>`).join('')}</span></li>`
              : `<li><b>${y}</b><span>${t}${punch ? ` <em>${punch}</em>` : ''}</span></li>`,
          ).join('')}</ol>
        </div>
        <div class="coda__joy" aria-hidden="true">
          <div class="coda__fb">
            <div class="coda__fb-tabs"><b>Console</b><span>HTML</span><span>CSS</span><span>Script</span><span>DOM</span><span>Net</span></div>
            <p class="coda__fb-in"><b>&gt;&gt;&gt;</b> <span class="coda__fb-typed">console.log("it works!")</span></p>
            <p class="coda__fb-out">it works!</p>
          </div>
          <p class="coda__joy-cap">That was all it took to make our day.</p>
        </div>
        <div class="coda__verdict">
          <p class="coda__loved"><span class="coda__l1">It was hard.</span><span class="coda__l2">We loved every minute of it.</span></p>
          <p class="coda__ours"><span class="coda__ours-t">Every line of code was ours.</span><i class="coda__ours-caret" aria-hidden="true"></i></p>
        </div>
        <div class="coda__irony">
          <p class="coda__i1">The irony?</p>
          <p class="coda__i2">I couldn’t build a page about the good old days <br /><em>without AI.</em></p>
          <p class="coda__i3">By hand, this page would have taken my entire life.<span class="coda__off"><span class="coda__off-t">(I’d still be centering the div.)</span><code class="coda__fix">display: grid; place-items: center;</code></span></p>
          <div class="coda__clawd">${clawd('', 'wave')}<p class="coda__bubble">Hi, I’m Claude.<br />I centered the div for you.</p></div>
          <div class="coda__bye">
          <p class="coda__counter">You are visitor <b>0000001</b></p>
          <button type="button" class="coda__again">↺ Back to 1999</button>
          <p class="coda__small">Made with AI, 2026. Best viewed in any browser.</p>
        </div>
        </div>

      </div>
    </div>
      <footer class="coda__footer"><p class="coda__legal">All product names, logos and brands are property of their respective owners, used here for identification only; no endorsement is implied. Kubernetes, Helm, Istio, Argo, Harbor and GraphQL are trademarks of The Linux Foundation. jQuery, jQuery UI, webpack, Express and Node.js are trademarks of the OpenJS Foundation. Vercel, Next.js and Turborepo are trademarks of Vercel, Inc. Docker is a trademark of Docker, Inc. Go is a trademark of Google LLC. npm is a trademark of npm, Inc. Tailwind CSS is a trademark of Tailwind Labs Inc. Go gopher by Renée French (CC BY 4.0). Git logo by Jason Long (CC BY 3.0). Yarn logo by the Yarn project (CC BY 4.0). PHP logo by Colin Viebrock (CC BY-SA 4.0). Rust logo by the Rust Foundation (CC BY). Claude and Claude Code are trademarks of Anthropic, PBC; the Claude Code mascot (Clawd) © Anthropic. GPT, ChatGPT and Codex are trademarks of OpenAI; Gemini and Google Chrome of Google LLC; Llama of Meta Platforms, Inc.; GitHub and Copilot of GitHub, Inc.; TypeScript and Visual Studio Code of Microsoft Corporation; Cursor of Anysphere, Inc.; Firefox of the Mozilla Foundation; Grok of xAI; DeepSeek, Qwen and Mistral of their respective companies. Icons via Simple Icons (CC0); where a brand licenses its logo, that licence applies: Vue.js logo by Evan You (CC BY-NC-SA 4.0), Angular logo by Google (CC BY 4.0), Sass logo by the Sass team (CC BY-NC-SA 3.0), HTML5 logo by W3C (CC BY 3.0), Jenkins logo (CC BY-SA 3.0), OpenTelemetry and WebGPU logos (CC BY 4.0), Apache Kafka, Fluentd and Rook logos (Apache 2.0), Backbone.js, Bootstrap, Deno, JavaScript, Storybook and GitHub Copilot icons (MIT).</p>${hasAnalytics ? '<button type="button" class="coda__consent">Analytics settings</button>' : ''}</footer>
    </div>`);
  const coda = el.querySelector<HTMLElement>('.coda')!;
  el.querySelector('.coda__again')!.addEventListener('click', () => scrollToEl(0));
  el.querySelector('.coda__consent')?.addEventListener('click', openConsent);

  if (reducedMotion) {
    coda.classList.add('is-static');
    return el;
  }

  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T & HTMLElement>(s)!;
  const OURS = 'Every line of code was ours.';
  const oursType = { n: 0 };
  q('.coda__ours-t').textContent = '';
  // a staggered fromTo only pre-renders its first target, so the rest would sit visible over the confession
  const pains = Array.from(q('.coda__list').children);
  gsap.set(pains, { opacity: 0, x: -40, clipPath: 'inset(-2em 100% -2em 0)' });
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    // starts while the coda is still rising, so the 1999 sky is already arriving as the finale scrolls away
    scrollTrigger: { trigger: coda, start: 'top 70%', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
  });
  // the rising edge of the 1999 sky is feathered until it settles at the top
  tl.fromTo(q('.coda__sticky'), { '--fade': '45vh' }, { '--fade': '0vh', duration: 1.4, ease: 'none' }, 0)
    .fromTo(q('.coda__sky'), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' }, 0)
    .fromTo(q('.coda__k'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.0)
    .fromTo(
      q('.coda__title'),
      // full-strength colour from the first letter: only the reveal steps, no fade, so it never looks washed out
      { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'steps(14)' },
      1.6,
    )
    .fromTo(
      q('.coda__strong'),
      { opacity: 0, scale: 2.6 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' },
      3.2,
    )
    .fromTo(q('.coda__miss'), { x: 0 }, { keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.35, ease: 'none' }, 3.45)
    // the confession makes way for what it was actually like
    .to(q('.coda__miss'), { y: '-8vh', opacity: 0, duration: 0.5, ease: 'power2.in' }, 4.4)
    .fromTo(q('.coda__then'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 5)
    .fromTo(
      pains,
      // the clip reaches past the row, so the 2011 line can wander and show its failed tricks
      { opacity: 0, x: -40, clipPath: 'inset(-2em 100% -2em 0)' },
      { opacity: 1, x: 0, clipPath: 'inset(-2em -60% -2em 0)', duration: 0.45, stagger: 0.55, ease: 'steps(8)' },
      5.3,
    )
    // the list is taller than the screen, so it scrolls up as lines arrive and the newest stays in view
    .fromTo(
      [q('.coda__then'), q('.coda__list')],
      { y: 0 },
      {
        y: () => -Math.max(0, q('.coda__list').scrollHeight - window.innerHeight * (mobile() ? 0.62 : 0.7)),
        duration: (PAINS.length - 1) * 0.55,
        ease: 'none',
      },
      5.3,
    )
    .to([q('.coda__list'), q('.coda__then')], { opacity: 0.06, duration: 0.6 }, 15.25)
    .fromTo(q('.coda__joy'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, 15.35)
    // the whole reward of an evening: one line in the Firebug console
    .fromTo(
      q('.coda__fb-typed'),
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'steps(24)' },
      15.6,
    )
    .fromTo(q('.coda__fb-out'), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 16.4)
    .fromTo(q('.coda__joy-cap'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 16.55)
    .to(q('.coda__joy'), { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 17.3)
    .fromTo(q('.coda__l1'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, 17.75)
    .fromTo(
      q('.coda__l2'),
      { opacity: 0, scale: 1.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' },
      18.35,
    )
    .to(q('.coda__loved'), { opacity: 0.55, duration: 0.5 }, 19.35)
    .fromTo(q('.coda__ours'), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 19.45)
    // typed out letter by letter, then held on screen before the irony arrives
    .to(
      oursType,
      {
        n: OURS.length,
        duration: 1.1,
        ease: 'none',
        onUpdate: () => {
          q('.coda__ours-t').textContent = OURS.slice(0, Math.round(oursType.n));
        },
      },
      19.5,
    )
    // …and then the irony
    .to([q('.coda__pains'), q('.coda__verdict')], { y: '-10vh', opacity: 0, duration: 0.8, ease: 'power2.in' }, 21.65)
    .fromTo(q('.coda__i1'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 22.35)
    .fromTo(q('.coda__i2'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 22.85)
    .fromTo(q('.coda__i3'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 23.45)
    .fromTo(
      q('.coda__clawd'),
      { opacity: 0, scale: 0, rotate: -40 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.4)' },
      24.25,
    )
    // …and the moment Claude says it, the wandering line snaps to dead centre (and un-snaps when scrolling back)
    .addLabel('centred', 24.6)
    .to(q('.coda__irony'), { y: () => (mobile() ? '-=2vh' : '-=4vh'), duration: 1, ease: 'power2.inOut' }, 25.25)
    .fromTo(q('.coda__bye'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, 25.65)
    .to({}, { duration: 0.8 });
  // decided from the timeline's own position, so it also holds after a direct jump (End key, reload)
  const centre = () => q('.coda__off').classList.toggle('is-centred', tl.time() >= tl.labels.centred);
  tl.eventCallback('onUpdate', centre);
  // a refresh restores the timeline without firing onUpdate (e.g. after jumping straight to the end)
  ScrollTrigger.addEventListener('refresh', centre);
  return el;
}
