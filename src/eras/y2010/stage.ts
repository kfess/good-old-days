import { siHtml5 } from 'simple-icons';
import { logo } from '../../components/logo';
import { type StageScene, scrubType } from '../../components/stage';
import { MOBILE_QUERY } from '../../core/scroll';

const mobile = () => window.matchMedia(MOBILE_QUERY).matches;

/** jQuery's default easing, so the slideDown moves exactly like it did. */
const swing = (p: number) => 0.5 - Math.cos(p * Math.PI) / 2;

const jquery: StageScene = {
  year: '2010.01',
  name: 'jQuery 1.4',
  kicker: 'v1.4 · Write less, do more.',
  line: "$('.everything') — and the web moved.",
  className: 'w-scene w-scene--jq',
  logo: '<span class="w-dollar">$</span>',
  length: 1.2,
  play({ art, logo: dollar, tl }) {
    art.innerHTML = `
      <div class="w-jq__code"><code class="w-jq__typed"></code><i class="w-caret"></i></div>
      <div class="w-jq__page">
        <div class="w-jq__inner">
          <div class="w-jq__bar"><b>Glossr</b><span class="w-jq__beta">beta</span><nav><i>Home</i><i>Explore</i><i>Upload</i></nav></div>
          <div class="w-jq__hero">
            <div class="w-jq__heroimg"></div>
            <div>
              <p class="w-jq__h">Share your world.</p>
              <p class="w-jq__p">Photos, friends, and a tag cloud. Now with Ajax.</p>
              <span class="w-jq__btn">Sign up — it's free!</span>
            </div>
          </div>
          <div class="w-jq__grid">${'<span class="w-jq__thumb"><i class="w-jq__badge">NEW</i></span>'.repeat(6)}</div>
        </div>
      </div>`;
    const typed = art.querySelector<HTMLElement>('.w-jq__typed')!;
    const page = art.querySelector<HTMLElement>('.w-jq__page')!;
    const badges = art.querySelectorAll('.w-jq__badge');
    const code1 = "$('#page').slideDown('slow');";
    const code2 = "$('#page').slideDown('slow')\n  .find('.badge').fadeIn();";

    tl.to(
      dollar,
      {
        xPercent: () => (mobile() ? 0 : -95),
        yPercent: () => (mobile() ? -88 : -40),
        scale: () => (mobile() ? 0.4 : 0.62),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.w-jq__code'), { opacity: 0, y: 20, duration: 0.2 }, 0.35);
    scrubType(tl, typed, code1, 0.7, 0.45);
    tl.fromTo(page, { height: 0 }, { height: () => (mobile() ? '34vh' : '70vh'), duration: 1, ease: swing }, 1.25);
    scrubType(tl, typed, code2, 0.5, 2.35);
    tl.from(badges, { opacity: 0, scale: 0.4, stagger: 0.06, duration: 0.3, ease: 'back.out(2)' }, 2.9);
    tl.to({}, { duration: 0.5 });
  },
};

const css3: StageScene = {
  // dated by the W3C HTML5 logo it wears (unveiled 18 Jan 2011); the vendor-prefixed CSS is the 2010–11 reality
  year: '2011.01',
  name: 'HTML5 & CSS3',
  kicker: 'No plugins, no images',
  line: 'Rounded corners, shadows, gradients. No images.',
  className: 'w-scene w-scene--css',
  logo: `<span class="w-tile">${logo(siHtml5, 'current')}</span>`,
  length: 1.0,
  play({ art, logo: tile, tl }) {
    // 2010: every new property shipped behind a vendor prefix (and a different gradient syntax per engine)
    const rules: [string, string][] = [
      ['-webkit-border-radius', '18px'],
      ['   -moz-border-radius', '18px'],
      ['background', '-webkit-gradient(linear, 0 0, 0 100%, from(#ffb347), to(#ff7a00))'],
      ['background', '-moz-linear-gradient(top, #ffb347, #ff7a00)'],
      ['-webkit-box-shadow', '0 12px 30px rgba(0,0,0,.25)'],
      ['text-shadow', '0 1px 0 #8c3c00'],
      ['-webkit-transform', 'rotate(-4deg)'],
    ];
    art.innerHTML = `
      <div class="w-css__box"><span>Download now</span></div>
      <pre class="w-css__code"><code>.button {\n${rules.map((_, i) => `  <span data-r="${i}"></span>`).join('\n')}\n}</code></pre>`;
    const box = art.querySelector<HTMLElement>('.w-css__box')!;
    const lines = Array.from(art.querySelectorAll<HTMLElement>('[data-r]'));

    tl.to(
      tile,
      {
        xPercent: () => (mobile() ? 0 : 90),
        yPercent: () => (mobile() ? -95 : -55),
        scale: () => (mobile() ? 0.35 : 0.45),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from([box, art.querySelector('.w-css__code')], { opacity: 0, y: 30, stagger: 0.1, duration: 0.3 }, 0.3);
    // what each line does to the button (the -moz- twins add nothing visible in a WebKit-like preview)
    const styles: (gsap.TweenVars | null)[] = [
      { borderRadius: 18 },
      null,
      { backgroundImage: 'linear-gradient(#ffb347, #ff7a00)', color: '#fff' },
      null,
      { boxShadow: '0 12px 30px rgba(0,0,0,.25)' },
      { textShadow: '0 1px 0 rgba(140,60,0,.6)' },
      { rotate: -4 },
    ];
    rules.forEach(([prop, val], i) => {
      const at = 0.7 + i * 0.32;
      scrubType(tl, lines[i], `${prop}: ${val};`, 0.22, at);
      const st = styles[i];
      if (st) tl.to(box, { ...st, duration: 0.2, ease: 'power2.out' }, at + 0.18);
    });
    tl.to({}, { duration: 0.4 });
  },
};

const node: StageScene = {
  year: '2010.08',
  name: 'Node.js',
  kicker: 'v0.2 · Evented I/O for V8',
  line: 'JavaScript on the server. And it never waits.',
  className: 'w-scene w-scene--node',
  // the hexagon mark arrived with the July 2011 rebrand; 2010 Node.js was just the word
  logo: `<span class="w-tile w-tile--node">${logo('node')}</span>`,
  length: 1.1,
  play({ art, logo: tile, tl }) {
    const THREADS = 6;
    const REQS = 14;
    art.innerHTML = `
      <div class="w-jq__code w-node__code"><code class="w-jq__typed"></code><i class="w-caret"></i></div>
      <div class="w-node">
        <section class="w-node__col w-node__col--apache">
          <header><b>Thread per request</b><span>MaxClients 6</span></header>
          <ol class="w-node__threads">${Array.from({ length: THREADS }, (_, i) => `<li><span>thread ${i + 1}</span><i class="w-node__bar"></i><em>blocked</em></li>`).join('')}</ol>
          <p class="w-node__queue">queued: <b>0</b></p>
          <p class="w-node__mem">RAM <i><b></b></i> <span>0 MB</span></p>
        </section>
        <section class="w-node__col w-node__col--node">
          <header><b>Event loop</b><span>1 thread</span></header>
          <div class="w-node__loop">
            <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="78" class="w-node__ring"/><circle cx="100" cy="100" r="78" class="w-node__spin"/></svg>
            <div class="w-node__dots">${Array.from({ length: REQS }, (_, i) => `<i style="--a:${(i / REQS) * 360}deg"></i>`).join('')}</div>
            <p class="w-node__served"><b>0</b><span>requests served</span></p>
          </div>
        </section>
      </div>`;
    const typed = art.querySelector<HTMLElement>('.w-jq__typed')!;
    const bars = Array.from(art.querySelectorAll<HTMLElement>('.w-node__threads li'));
    const queue = art.querySelector<HTMLElement>('.w-node__queue b')!;
    const memBar = art.querySelector<HTMLElement>('.w-node__mem b')!;
    const memTxt = art.querySelector<HTMLElement>('.w-node__mem span')!;
    const spin = art.querySelector<SVGElement>('.w-node__spin')!;
    const dots = Array.from(art.querySelectorAll<HTMLElement>('.w-node__dots i'));
    const served = art.querySelector<HTMLElement>('.w-node__served b')!;
    const code = "http.createServer(function (req, res) {\n  res.end('Hello World\\n');\n}).listen(8124);";

    tl.to(
      tile,
      {
        xPercent: () => (mobile() ? 0 : -95),
        yPercent: () => (mobile() ? -88 : -40),
        scale: () => (mobile() ? 0.4 : 0.62),
        duration: 0.5,
        ease: 'power2.inOut',
      },
      0,
    );
    tl.from(art.querySelector('.w-node__code'), { opacity: 0, y: 20, duration: 0.2 }, 0.35);
    scrubType(tl, typed, code, 0.8, 0.45);
    tl.from(art.querySelectorAll('.w-node__col'), { opacity: 0, y: 40, stagger: 0.12, duration: 0.3 }, 0.6);
    const load = { p: 0 };
    tl.to(
      load,
      {
        p: 1,
        duration: 1.6,
        ease: 'none',
        onUpdate: () => {
          const p = load.p;
          const incoming = Math.round(p * 600);
          // Apache: each request holds a worker while it waits on I/O; with all MaxClients busy,
          // everyone else waits in line. RAM tops out at MaxClients × one worker (~32 MB with mod_php).
          const busy = Math.min(THREADS, incoming);
          bars.forEach((b, i) => {
            const on = i < busy;
            b.classList.toggle('is-busy', on);
            b.style.setProperty('--f', String(on ? 0.25 + 0.75 * ((p * 3 + i * 0.17) % 1) : 0));
          });
          queue.textContent = String(Math.max(0, incoming - THREADS));
          memBar.style.transform = `scaleX(${busy / THREADS})`;
          memTxt.textContent = `${busy * 32} MB`;
          // Node: one loop spins, requests come in and are answered without waiting
          spin.style.strokeDashoffset = String(-p * 4200);
          dots.forEach((d, i) => d.classList.toggle('is-on', (p * 40 + i) % 5 < 1.6));
          served.textContent = incoming.toLocaleString('en-US');
        },
      },
      1.1,
    );
    tl.to({}, { duration: 0.3 });
  },
};

export const STAGE_2010: StageScene[] = [jquery, node, css3];
