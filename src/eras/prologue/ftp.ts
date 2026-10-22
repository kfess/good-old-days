import { h, sleep } from '../../core/util';
import { zeus } from './pixel';

interface FileInfo {
  name: string;
  size: string;
  cgi?: boolean;
}

const FILES: FileInfo[] = [
  { name: 'index.html', size: '4,812' },
  { name: 'star_bg.gif', size: '1,206' },
  { name: 'construction.gif', size: '9,874' },
  { name: 'counter.cgi', size: '2,133', cgi: true },
];

/** Rental server "zeus" + a two-pane FTP client you can drag files across (and chmod 755). */
export function buildFtp(): HTMLElement {
  const el = h(`
    <div class="p-block p-ftp-wrap">
      <header class="p-sechead">
        <p class="p-kicker">Infra · 2001</p>
        <h3 class="p-h3">Servers were something you rented.</h3>
        <p class="p-lead">$9.95 a month. 50 MB. CGI allowed. Its name was zeus.</p>
      </header>
      <div class="p-ftp-grid">
        <figure class="p-zeus">
          ${zeus()}
          <figcaption><b>zeus</b><br>shared hosting<br>Apache/1.3 · Perl 5<br>PHP 4 · MySQL 3.23</figcaption>
        </figure>
        <div class="p-win p-ftp">
          <div class="p-win__title"><span>FTP — ftp.zeus-hosting.example</span><i>_</i><i>□</i><i>×</i></div>
          <div class="p-ftp__panes">
            <div class="p-pane p-pane--local">
              <div class="p-pane__path">C:\\homepage\\</div>
              <ul class="p-pane__list" role="listbox" aria-label="local files"></ul>
            </div>
            <div class="p-ftp__mid">
              <button type="button" class="p-btn p-up" title="Upload">→</button>
            </div>
            <div class="p-pane p-pane--remote">
              <div class="p-pane__path">/home/you/public_html/</div>
              <ul class="p-pane__list" aria-label="remote files"></ul>
            </div>
          </div>
          <div class="p-ftp__log" role="log" aria-live="polite"><div>220 ProFTPD 1.2.4 Server (zeus) [ftp.zeus-hosting.example]</div><div>230 User you logged in.</div></div>
          <p class="p-ftp__hint">Drag files across (or click the arrow). Don’t forget to chmod 755 your CGI.</p>
        </div>
        <div class="p-win p-browser">
          <div class="p-win__title"><span>http://www.zeus-hosting.example/~you/</span><i>×</i></div>
          <div class="p-browser__view"></div>
        </div>
      </div>
    </div>`);

  const localList = el.querySelector<HTMLElement>('.p-pane--local .p-pane__list')!;
  const remotePane = el.querySelector<HTMLElement>('.p-pane--remote')!;
  const remoteList = remotePane.querySelector<HTMLElement>('.p-pane__list')!;
  const log = el.querySelector<HTMLElement>('.p-ftp__log')!;
  const view = el.querySelector<HTMLElement>('.p-browser__view')!;
  const remote = new Map<string, { perm: 644 | 755 }>();
  let selected: string | null = null;
  let busy = false;

  const say = (text: string, cls = '') => {
    const d = document.createElement('div');
    d.textContent = text;
    if (cls) d.className = cls;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  };

  const renderLocal = () => {
    localList.innerHTML = FILES.map(
      (f) => `
      <li role="option" draggable="true" tabindex="0" data-name="${f.name}" aria-selected="${selected === f.name}"
          class="${selected === f.name ? 'is-sel' : ''}${remote.has(f.name) ? ' is-done' : ''}">
        <span class="p-ficon p-ficon--${f.name.split('.').pop()}"></span>${f.name}<span class="p-fsize">${f.size}</span>
      </li>`,
    ).join('');
  };

  const renderRemote = () => {
    if (!remote.size) {
      remoteList.innerHTML = `<li class="p-empty">(empty)</li>`;
    } else {
      remoteList.innerHTML = FILES.filter((f) => remote.has(f.name))
        .map((f) => {
          const perm = remote.get(f.name)!.perm;
          const mode = perm === 755 ? '-rwxr-xr-x' : '-rw-r--r--';
          return `
          <li data-name="${f.name}">
            <span class="p-ficon p-ficon--${f.name.split('.').pop()}"></span>${f.name}
            <span class="p-perm${f.cgi && perm !== 755 ? ' is-bad' : ''}">${mode}</span>
            ${f.cgi && perm !== 755 ? `<button type="button" class="p-btn p-chmod" data-name="${f.name}">chmod 755</button>` : ''}
          </li>`;
        })
        .join('');
    }
    renderPreview();
  };

  const renderPreview = () => {
    if (!remote.has('index.html')) {
      view.className = 'p-browser__view is-404';
      view.innerHTML = `<h5>Forbidden</h5><p>You don't have permission to access /~you/ on this server.</p><hr><address>Apache/1.3.20 Server at www.zeus-hosting.example Port 80</address>`;
      return;
    }
    const cgi = remote.get('counter.cgi');
    // an <img src="counter.cgi"> counter: missing or not executable (403), it's just a broken image
    const counter =
      cgi && cgi.perm === 755
        ? `<span class="p-mini-digits">000001</span>`
        : `<span class="p-broken" title="counter.cgi">counter</span>`;
    view.className = `p-browser__view is-ok${remote.has('star_bg.gif') ? ' has-bg' : ''}`;
    view.innerHTML = `
      <p class="p-mini-title">Welcome to My Homepage!</p>
      <p class="p-mini-uc">${remote.has('construction.gif') ? '<span class="p-mini-stripe">UNDER CONSTRUCTION</span>' : '<span class="p-broken">construction</span>'}</p>
      <p>You are visitor No. ${counter}</p>`;
  };

  const upload = async (name: string) => {
    if (busy || remote.has(name)) return;
    const f = FILES.find((x) => x.name === name);
    if (!f) return;
    busy = true;
    // text files go up in ASCII mode (CRLF → LF, or the CGI's #! line breaks); images in binary
    const ascii = !name.endsWith('.gif');
    say(ascii ? 'TYPE A' : 'TYPE I', 'p-cmd');
    say(ascii ? '200 Type set to A' : '200 Type set to I');
    say(`STOR ${name}`, 'p-cmd');
    say(`150 Opening ${ascii ? 'ASCII' : 'BINARY'} mode data connection for ${name}.`);
    await sleep(380);
    say('226 Transfer complete.', 'p-ok');
    say(`Transferred ${f.size} bytes.`);
    remote.set(name, { perm: 644 });
    selected = null;
    renderLocal();
    renderRemote();
    busy = false;
  };

  localList.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-name]');
    if (!li) return;
    selected = selected === li.dataset.name ? null : li.dataset.name!;
    renderLocal();
  });
  localList.addEventListener('dblclick', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-name]');
    if (li) upload(li.dataset.name!);
  });
  localList.addEventListener('keydown', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-name]');
    if (li && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      upload(li.dataset.name!);
    }
  });
  localList.addEventListener('dragstart', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-name]');
    if (!li || !e.dataTransfer) return;
    e.dataTransfer.setData('text/plain', li.dataset.name!);
    e.dataTransfer.effectAllowed = 'copy';
  });
  remotePane.addEventListener('dragover', (e) => {
    e.preventDefault();
    remotePane.classList.add('is-over');
  });
  remotePane.addEventListener('dragleave', () => remotePane.classList.remove('is-over'));
  remotePane.addEventListener('drop', (e) => {
    e.preventDefault();
    remotePane.classList.remove('is-over');
    const name = e.dataTransfer?.getData('text/plain');
    if (name) upload(name);
  });
  el.querySelector('.p-up')!.addEventListener('click', async () => {
    if (selected) return upload(selected);
    // nothing selected: upload the next file still missing
    const next = FILES.find((f) => !remote.has(f.name));
    if (next) upload(next.name);
  });
  remoteList.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.p-chmod');
    if (!btn) return;
    const name = btn.dataset.name!;
    say(`SITE CHMOD 755 ${name}`, 'p-cmd');
    await sleep(250);
    say('200 SITE CHMOD command successful', 'p-ok');
    remote.set(name, { perm: 755 });
    renderRemote();
  });

  renderLocal();
  renderRemote();
  return el;
}
