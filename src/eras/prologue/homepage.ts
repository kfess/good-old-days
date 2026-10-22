import { reducedMotion, ScrollTrigger } from '../../core/scroll';
import { esc, h, onceInView } from '../../core/util';
import { cone, envelope, star } from './pixel';

const GUESTS = [
  { name: 'Mike', date: '1999/08/14', msg: 'Cool page!! Link exchange? :-)' },
  { name: 'cyberkitty', date: '2000/02/29', msg: 'Love the snow. Added you to my webring ★' },
  { name: 'webmaster_jo', date: '2001/11/03', msg: 'How did you make the counter??' },
];

/** A late-90s personal homepage: table layout, marquee, NEW!, counter, guestbook, snow, sparkles. */
export function buildHomepage(): HTMLElement {
  const nav = ["What's New", 'About Me', 'My Pets', 'Links', 'Guestbook', 'BBS']
    .map(
      (label, i) =>
        `<li>${star('p-bullet')}<a href="#">${label}</a>${i === 0 || i === 4 ? ' <span class="p-new">NEW!</span>' : ''}</li>`,
    )
    .join('');

  const el = h(`
    <div class="p-block p-home-wrap" data-hud-year="2001">
      <header class="p-sechead">
        <p class="p-kicker">Showcase · 2001</p>
        <h3 class="p-h3">Welcome to my homepage.</h3>
        <p class="p-lead">Built with tables. Decorated with GIFs.</p>
      </header>
      <div class="p-home">
        <canvas class="p-snow" aria-hidden="true"></canvas>
        <table class="p-table" border="0" cellpadding="0" cellspacing="0">
          <tbody>
            <tr>
              <td colspan="2" class="p-banner">
                <p class="p-wordart" aria-label="Welcome to My Homepage!"><span>Welcome to</span> <span>My Homepage!</span></p>
                <marquee class="p-marquee" scrollamount="4">★ Welcome!! ★ Thanks for visiting ★ Please sign my guestbook ★ Link free! ★ Since 1998 ★ Last updated: 2001/11/03 ★</marquee>
              </td>
            </tr>
            <tr>
              <td class="p-nav" valign="top">
                <p class="p-nav__title">- MENU -</p>
                <ul>${nav}</ul>
                <div class="p-counter" title="click to reload">
                  <span>You are visitor No.</span>
                  <span class="p-digits">${'<b><i>0123456789</i></b>'.repeat(6)}</span>
                </div>
                <div class="p-badges" aria-label="badges">
                  <span class="p-88"><b>BEST</b> VIEWED<br>800×600</span>
                  <span class="p-88 p-88--b"><b>HTML</b> 4.01<br>valid!</span>
                  <span class="p-88 p-88--c">MADE WITH<br><b>NOTEPAD</b></span>
                  <span class="p-88 p-88--d"><b>NO</b><br>FRAMES</span>
                </div>
              </td>
              <td class="p-main" valign="top">
                <h4 class="p-h4">${star('p-h4star')} What's New</h4>
                <dl class="p-news">
                  <dt>2001/11/03</dt><dd>Guestbook is back online! <span class="p-new">NEW!</span></dd>
                  <dt>2001/10/21</dt><dd>Added 12 new links. Link me back!</dd>
                  <dt>2001/09/01</dt><dd>Moved to a new server (zeus). Update your bookmarks!</dd>
                </dl>
                <div class="p-uc" role="note">
                  ${cone('p-cone')}
                  <div><b>UNDER CONSTRUCTION</b><span>This page is still being built. Please come back soon!</span></div>
                  ${cone('p-cone')}
                </div>
                <h4 class="p-h4">${envelope('p-h4star')} Guestbook</h4>
                <form class="p-gb">
                  <label>Name <input name="name" maxlength="20" autocomplete="off" placeholder="your name"></label>
                  <label>Comment <input name="msg" maxlength="60" autocomplete="off" placeholder="say hi!"></label>
                  <button type="submit">Sign Guestbook!</button>
                </form>
                <ul class="p-gb-list"></ul>
                <p class="p-ring">&lt;&lt; <a href="#">Prev</a> | <a href="#">Random</a> | <a href="#">Next</a> &gt;&gt;<br><small>This site is a member of <u>The Homepage WebRing</u></small></p>
              </td>
            </tr>
          </tbody>
        </table>
        <label class="p-snow-toggle"><input type="checkbox" checked> Snow ON</label>
      </div>
    </div>`);

  const home = el.querySelector<HTMLElement>('.p-home')!;
  home.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  // marquee stops on hover, like onmouseover="this.stop()"
  const marquee = el.querySelector('marquee') as (HTMLElement & { stop(): void; start(): void }) | null;
  marquee?.addEventListener('mouseenter', () => marquee.stop());
  marquee?.addEventListener('mouseleave', () => marquee.start());

  setupCounter(el);
  setupGuestbook(el);
  setupSnow(
    home,
    el.querySelector<HTMLCanvasElement>('.p-snow')!,
    el.querySelector<HTMLInputElement>('.p-snow-toggle input')!,
  );
  setupSparkles(home);
  return el;
}

function setupCounter(el: HTMLElement): void {
  const strips = Array.from(el.querySelectorAll<HTMLElement>('.p-digits i'));
  const counter = el.querySelector<HTMLElement>('.p-counter')!;
  let n = 1233;
  const show = () =>
    String(n)
      .padStart(6, '0')
      .split('')
      .forEach((d, i) => (strips[i].style.transform = `translateY(${-Number(d) * 10}%)`));
  show();
  onceInView(counter, () => {
    n++;
    show();
  });
  counter.addEventListener('click', () => {
    n++;
    show();
  });
}

function setupGuestbook(el: HTMLElement): void {
  const list = el.querySelector<HTMLElement>('.p-gb-list')!;
  const form = el.querySelector<HTMLFormElement>('.p-gb')!;
  const add = (g: { name: string; date: string; msg: string }, fresh = false) => {
    const li = document.createElement('li');
    if (fresh) li.className = 'is-fresh';
    li.innerHTML = `<b>${esc(g.name)}</b> <small>${esc(g.date)}</small><br>${esc(g.msg)}`;
    list.prepend(li);
  };
  // newest entry on top, as each new signature is
  GUESTS.forEach((g) => add(g));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim() || 'anonymous';
    const msg = String(data.get('msg') || '').trim() || 'Great site!!';
    // signed just after the page's last update (2001/11/03), so it stays the newest entry
    const day = String(4 + Math.floor(Math.random() * 26)).padStart(2, '0');
    add({ name, msg, date: `2001/11/${day}` }, true);
    form.reset();
  });
}

function setupSnow(home: HTMLElement, canvas: HTMLCanvasElement, toggle: HTMLInputElement): void {
  if (reducedMotion) {
    toggle.checked = false;
    toggle.closest('label')!.hidden = true;
    return;
  }
  const ctx = canvas.getContext('2d')!;
  const flakes = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    s: 1 + Math.floor(Math.random() * 3),
    v: 0.0006 + Math.random() * 0.0012,
    d: Math.random() * 6,
  }));
  let raf = 0;
  let visible = false;
  const size = () => {
    canvas.width = Math.round(home.clientWidth / 2);
    canvas.height = Math.round(home.clientHeight / 2);
  };
  const frame = (t: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    for (const f of flakes) {
      f.y += f.v;
      if (f.y > 1) {
        f.y = -0.02;
        f.x = Math.random();
      }
      const x = Math.round(f.x * canvas.width + Math.sin(t / 900 + f.d) * 6);
      ctx.fillRect(x, Math.round(f.y * canvas.height), f.s, f.s);
    }
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (visible && toggle.checked) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  toggle.addEventListener('change', () => {
    toggle.parentElement!.lastChild!.textContent = toggle.checked ? ' Snow ON' : ' Snow OFF';
    run();
  });
  new ResizeObserver(size).observe(home);
  ScrollTrigger.create({
    trigger: home,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      visible = self.isActive;
      run();
    },
  });
}

function setupSparkles(home: HTMLElement): void {
  if (reducedMotion) return;
  const glyphs = ['✦', '★', '·', '✧'];
  const colors = ['#ffff00', '#ff66ff', '#00ffff', '#ffffff'];
  let last = 0;
  home.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.timeStamp - last < 28) return;
    last = e.timeStamp;
    const r = home.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'p-spark';
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    s.style.left = `${e.clientX - r.left}px`;
    s.style.top = `${e.clientY - r.top}px`;
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    s.style.setProperty('--dx', `${(Math.random() - 0.5) * 30}px`);
    home.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  });
}
