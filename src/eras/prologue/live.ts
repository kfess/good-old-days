import { t } from '../../core/i18n';
import { h } from '../../core/util';

/*
 * The 2003 deploy from the other side: the live homepage and the server's logs while index.html is
 * overwritten in place. Anyone who loads the page mid-upload gets the bytes written so far (the access
 * log records the short count), and the counter CGI answers 500 until its upload is done and chmodded.
 */

const SIZE = 4812;
const OLD_SIZE = 4730;
const HOST = '/home/you/public_html';

/** The page, top to bottom: a truncated download shows only the first few. */
const PAGE = [
  '<p class="p-mini-title">Welcome to My Homepage!</p>',
  '<p class="p-mini-uc"><span class="p-mini-stripe">UNDER CONSTRUCTION</span></p>',
  t('<p>You are visitor No. {counter}</p>', '<p>あなたは {counter} 人目の訪問者です</p>'),
  t(
    '<p class="p-live__new"><b>2003/03/14</b> New photos from Kyoto! <span class="p-new">NEW!</span></p>',
    '<p class="p-live__new"><b>2003/03/14</b> 京都の写真をアップしました！ <span class="p-new">NEW!</span></p>',
  ),
  t(
    '<p class="p-live__new"><b>2003/02/11</b> Links page updated.</p>',
    '<p class="p-live__new"><b>2003/02/11</b> リンク集を更新しました。</p>',
  ),
  t(
    '<p class="p-live__foot">Link free! ★ Sign my guestbook ★ Best viewed in 800×600</p>',
    '<p class="p-live__foot">リンクフリー ★ ゲストブックに記帳してね ★ 800×600 推奨</p>',
  ),
];

export interface LiveSite {
  el: HTMLElement;
  /** back to the page as it was before the upload (each run or replay starts here) */
  reset(): void;
  /** index.html is being written: `p` of its bytes are on the server */
  index(p: number): void;
  /** counter.cgi is being replaced (`broken`) or is back and executable (`ok`) */
  counter(state: 'broken' | 'ok'): void;
}

export function createLiveSite(): LiveSite {
  const el = h(`
    <div class="p-live" aria-hidden="true">
      <div class="p-win p-browser p-live__site">
        <div class="p-win__title"><span>http://www.zeus-hosting.example/~you/</span><b class="p-live__tag">● LIVE</b><i>×</i></div>
        <div class="p-browser__view is-ok has-bg p-live__view"></div>
      </div>
      <div class="p-live__log"></div>
    </div>`);
  const view = el.querySelector<HTMLElement>('.p-live__view')!;
  const log = el.querySelector<HTMLElement>('.p-live__log')!;

  let counter = 61377;
  let cgiOk = true;
  let shown = 1;
  let halfLogged = false;
  let cgiLogged = false;

  const render = (lines: number) => {
    const digits = cgiOk
      ? `<span class="p-mini-digits">${String(counter).padStart(7, '0')}</span>`
      : '<span class="p-broken" title="counter.cgi">counter</span>';
    view.innerHTML = PAGE.slice(0, lines)
      .map((l) => l.replace('{counter}', digits))
      .join('');
    view.classList.toggle('is-cut', lines < PAGE.length);
  };

  const say = (text: string, cls = '') => {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  };
  const hit = (ip: string, time: string, path: string, status: number, bytes: number, cls = '') =>
    say(`${ip} - - [14/Mar/2003:23:41:${time} +0900] "GET /~you/${path} HTTP/1.1" ${status} ${bytes}`, cls);

  const live = (on: boolean) => el.classList.toggle('is-live', on);

  const reset = () => {
    counter = 61377;
    cgiOk = true;
    shown = PAGE.length;
    halfLogged = false;
    cgiLogged = false;
    live(false);
    log.innerHTML = '<div class="p-live__cmd">$ tail -f access_log error_log</div>';
    hit('198.51.100.7', '02', '', 200, OLD_SIZE);
    render(shown);
  };

  const index = (p: number) => {
    live(p < 1);
    // a visitor arrives with the file about half written: they get what's there, and the page ends there
    if (!halfLogged && p >= 0.45) {
      halfLogged = true;
      shown = Math.max(1, Math.floor(PAGE.length * p));
      render(shown);
      hit('203.0.113.42', '06', '', 200, Math.round(SIZE * p), 'p-live__bad');
      say(
        `  ↑ ${Math.round(SIZE * p).toLocaleString('en-US')} of ${SIZE.toLocaleString('en-US')} bytes. Half a page.`,
        'p-live__note',
      );
    }
    if (p >= 1) {
      shown = PAGE.length;
      render(shown);
    }
  };

  const setCounter = (state: 'broken' | 'ok') => {
    if (state === 'broken') {
      live(true);
      cgiOk = false;
      render(shown);
      if (!cgiLogged) {
        cgiLogged = true;
        hit('203.0.113.42', '10', 'counter.cgi', 500, 612, 'p-live__bad');
        say(
          `[Fri Mar 14 23:41:10 2003] [error] [client 203.0.113.42] Premature end of script headers: ${HOST}/counter.cgi`,
          'p-live__bad',
        );
      }
      return;
    }
    cgiOk = true;
    counter += 1;
    render(shown);
    hit('192.0.2.15', '14', '', 200, SIZE);
    hit('192.0.2.15', '14', 'counter.cgi', 200, 287);
    live(false);
  };

  reset();
  return { el, reset, index, counter: setCounter };
}
