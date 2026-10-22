import { t } from '../../core/i18n';
import { reducedMotion, ScrollTrigger } from '../../core/scroll';
import { esc, h, onceInView } from '../../core/util';
import { cone, envelope, star } from './pixel';

const GUESTS = t(
  [
    { name: 'Mike', date: '1999/08/14', msg: 'Cool page!! Link exchange? :-)' },
    { name: 'cyberkitty', date: '2000/02/29', msg: 'Love the snow. Added you to my webring ★' },
    { name: 'webmaster_jo', date: '2001/11/03', msg: 'How did you make the counter??' },
  ],
  [
    {
      name: 'まさひろ',
      date: '1999/08/14',
      msg: 'はじめまして！ネットサーフィンしてたら辿り着きました。相互リンクしませんか？(^^)',
    },
    { name: 'ねこみみ☆', date: '2000/02/29', msg: 'キリ番1000踏みました！記念カキコです♪ 雪かわいい〜' },
    { name: '通りすがり', date: '2001/11/03', msg: 'カウンターってどうやって付けるんですか？？' },
  ],
);

const SNOW = t([' Snow ON', ' Snow OFF'], [' 雪を降らせる', ' 雪を止める']);

/** A late-90s personal homepage: table layout, marquee, NEW!, counter, guestbook, snow, sparkles. */
export function buildHomepage(): HTMLElement {
  const nav = t(
    ["What's New", 'About Me', 'My Pets', 'Links', 'Guestbook', 'BBS'],
    ['更新履歴', 'プロフィール', 'ペット', 'リンク', 'ゲストブック', 'BBS'],
  )
    .map(
      (label, i) =>
        `<li>${star('p-bullet')}<a href="#">${label}</a>${i === 0 || i === 4 ? ' <span class="p-new">NEW!</span>' : ''}</li>`,
    )
    .join('');
  const DIGITS = '<b><i>0123456789</i></b>'.repeat(6);

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
                <marquee class="p-marquee" scrollamount="4">${t('★ Welcome!! ★ Thanks for visiting ★ Please sign my guestbook ★ Link free! ★ Since 1998 ★ Last updated: 2001/11/03 ★', '★ ようこそ！！ ★ 来てくれてありがとう ★ ゲストブックに足あと残してってね ★ リンクフリー！ ★ Since 1998 ★ 最終更新: 2001/11/03 ★')}</marquee>
              </td>
            </tr>
            <tr>
              <td class="p-nav" valign="top">
                <p class="p-nav__title">- MENU -</p>
                <ul>${nav}</ul>
                <div class="p-counter" title="click to reload">
                  ${t(
                    `<span>You are visitor No.</span>
                  <span class="p-digits">${DIGITS}</span>`,
                    // the count sits mid-sentence in Japanese
                    `<span>あなたは</span>
                  <span class="p-digits">${DIGITS}</span>
                  <span>人目の訪問者です</span>`,
                  )}
                </div>
                <div class="p-badges" aria-label="badges">
                  <span class="p-88"><b>BEST</b> VIEWED<br>800×600</span>
                  <span class="p-88 p-88--b"><b>HTML</b> 4.01<br>valid!</span>
                  <span class="p-88 p-88--c">MADE WITH<br><b>NOTEPAD</b></span>
                  <span class="p-88 p-88--d"><b>NO</b><br>FRAMES</span>
                </div>
              </td>
              <td class="p-main" valign="top">
                <h4 class="p-h4">${star('p-h4star')} ${t("What's New", '更新履歴')}</h4>
                <dl class="p-news">
                  <dt>2001/11/03</dt><dd>${t('Guestbook is back online!', 'ゲストブック復活しました！')} <span class="p-new">NEW!</span></dd>
                  <dt>2001/10/21</dt><dd>${t('Added 12 new links. Link me back!', 'リンク集に12サイト追加しました。相互リンク募集中です！')}</dd>
                  <dt>2001/09/01</dt><dd>${t('Moved to a new server (zeus). Update your bookmarks!', 'サーバー(zeus)に引っ越しました。ブックマークの変更お願いします！')}</dd>
                </dl>
                <div class="p-uc" role="note">
                  ${cone('p-cone')}
                  <div><b>UNDER CONSTRUCTION</b><span>${t('This page is still being built. Please come back soon!', 'このページは工事中です。完成までもうしばらくお待ちください m(_ _)m')}</span></div>
                  ${cone('p-cone')}
                </div>
                <h4 class="p-h4">${envelope('p-h4star')} ${t('Guestbook', 'ゲストブック')}</h4>
                <form class="p-gb">
                  <label>${t('Name', 'お名前')} <input name="name" maxlength="20" autocomplete="off" placeholder="${t('your name', 'ハンドルネーム')}"></label>
                  <label>${t('Comment', 'コメント')} <input name="msg" maxlength="60" autocomplete="off" placeholder="${t('say hi!', '足あと残してってね！')}"></label>
                  <button type="submit">${t('Sign Guestbook!', '記帳する')}</button>
                </form>
                <ul class="p-gb-list"></ul>
                <p class="p-ring">${t(
                  '&lt;&lt; <a href="#">Prev</a> | <a href="#">Random</a> | <a href="#">Next</a> &gt;&gt;<br><small>This site is a member of <u>The Homepage WebRing</u></small>',
                  '&lt;&lt; <a href="#">前へ</a> | <a href="#">ランダム</a> | <a href="#">次へ</a> &gt;&gt;<br><small>このサイトは「<u>ホームページ・ウェブリング</u>」に参加しています</small>',
                )}</p>
              </td>
            </tr>
          </tbody>
        </table>
        <label class="p-snow-toggle"><input type="checkbox" checked>${SNOW[0]}</label>
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
    const name = String(data.get('name') || '').trim() || t('anonymous', '名無しさん');
    const msg = String(data.get('msg') || '').trim() || t('Great site!!', 'いいサイトですね！！');
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
    toggle.parentElement!.lastChild!.textContent = toggle.checked ? SNOW[0] : SNOW[1];
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
