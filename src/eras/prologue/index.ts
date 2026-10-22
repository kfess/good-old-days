import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { gsap, reducedMotion, ScrollTrigger, scrollToEl } from '../../core/scroll';
import { setHudVisible } from '../../core/stage';
import type { Era } from '../../core/types';
import { h } from '../../core/util';
import { buildFtp } from './ftp';
import { buildHomepage } from './homepage';
import { createLiveSite } from './live';
import { crt, phone, puzzle } from './pixel';
import { STAGE_PROLOGUE } from './stage';
import './style.css';

function buildIntro(): HTMLElement {
  const el = h(`
    <div class="p-intro">
      <div class="p-intro__inner">
        <p class="p-years">1995 — 2009</p>
        <div class="p-intro__art">${crt()}</div>
        <h2 class="p-title">Welcome to<br />my homepage!</h2>
        <p class="p-sub">When we hand-built our “homepages.”</p>
        <div class="p-loader" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="p-loader__label">LOADING<span class="p-dots"><i>.</i><i>.</i><i>.</i></span></span>
          <span class="p-loader__bar"><i></i></span>
          <span class="p-loader__pct">0%</span>
        </div>
        <button type="button" class="p-skip">ENTER ▶</button>
      </div>
      <p class="p-intro__note">Best viewed at 800×600 · 256 colors · sound ON</p>
    </div>`);

  // the loader crawls to 99% … and stays there
  const bar = el.querySelector<HTMLElement>('.p-loader__bar i')!;
  const pct = el.querySelector<HTMLElement>('.p-loader__pct')!;
  const loader = el.querySelector<HTMLElement>('.p-loader')!;
  let p = reducedMotion ? 99 : 0;
  const paint = () => {
    bar.style.transform = `scaleX(${p / 100})`;
    pct.textContent = `${p}%`;
    loader.setAttribute('aria-valuenow', String(p));
  };
  paint();
  const timer = setInterval(() => {
    p = Math.min(99, p + 1 + Math.floor(Math.random() * 9));
    paint();
    if (p >= 99) clearInterval(timer);
  }, 140);
  return el;
}

function buildBridge(): HTMLElement {
  const el = h(`
    <div class="p-bridge">
      <div class="p-bridge__stage">
        <div class="p-plugin">
          ${puzzle('p-plugin__icon')}
          <p>Click here to download the plugin.</p>
        </div>
        <div class="p-phone">${phone('p-phone__icon')}</div>
      </div>
      <p class="p-bridge__line">Flash never made it<br />onto the iPhone.</p>
      <p class="p-bridge__sub">2007 → 2010</p>
    </div>`);
  return el;
}

// runs once the bridge is in the document: pinning needs a parent to wrap it in a spacer
function animateBridge(el: HTMLElement): void {
  if (!reducedMotion) {
    // plugin box and phone arrive while the bridge scrolls in …
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.6 } })
      .from(el.querySelector('.p-plugin'), { opacity: 0, y: 40, duration: 1 })
      .from(el.querySelector('.p-phone'), { opacity: 0, x: 120, duration: 1 }, '<0.4');
    // … then it holds mid-screen until the punchline has fully typed out
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=90%', scrub: 0.8, pin: true } })
      .to(el.querySelector('.p-plugin'), { opacity: 0.15, filter: 'grayscale(1) blur(2px)', scale: 0.92, duration: 1 })
      .to(el.querySelector('.p-phone'), { scale: 1.12, duration: 1 }, '<')
      .fromTo(
        el.querySelector('.p-bridge__line'),
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'steps(18)' },
        '<0.3',
      )
      .from(el.querySelector('.p-bridge__sub'), { opacity: 0, duration: 0.5 })
      .to({}, { duration: 0.6 });
  }
}

export const era: Era = {
  id: 'prologue',
  years: [1995, 2009],
  label: 'Before 2010',
  theme: { bg: '#000033', fg: '#ffffff', accent: '#ffff00', muted: '#9999cc' },
  hudFont: "'Press Start 2P', 'DotGothic16', monospace",
  servers: { value: 1, unit: 'physical server "zeus"' },
  render(section) {
    section.appendChild(h(`<div class="p-stars" aria-hidden="true"><i></i></div>`));

    const intro = buildIntro();
    section.appendChild(intro);

    createStage(section, STAGE_PROLOGUE);
    createCredits(
      section,
      [
        { year: '1993', name: 'Perl CGI', line: 'Message boards lived in cgi-bin.' },
        { year: '2004', name: 'Ruby on Rails', line: 'A blog in 15 minutes.' },
        { year: '2004', name: 'Firefox', line: 'Tabs and pop-up blocking, for everyone.' },
        { year: '2005', name: 'Git', line: 'Distributed version control, born for Linux.' },
        { year: '2006', name: 'jQuery', line: 'And then, $ took over.' },
        { year: '2006', name: 'Amazon EC2', line: 'Servers, rented with a credit card.' },
        { year: '2008', name: 'GitHub', line: 'Code went social.' },
        { year: '2008', name: 'Google Chrome', line: 'With V8, JavaScript got serious.' },
      ],
      'Also starring — before 2010',
    );

    section.appendChild(buildHomepage());
    section.appendChild(buildFtp());

    createThread(section, 'prologue');

    const deployWrap = h(`
      <div class="p-block p-deploy-wrap" data-hud-year="2003">
        <header class="p-sechead">
          <p class="p-kicker">Deploy · 2003</p>
          <h3 class="p-h3">Upload = production release.</h3>
          <p class="p-lead">Backups? Append _old to the filename.</p>
        </header>
        <div class="p-deploy-grid"><div class="p-deploy-term"></div></div>
        <p class="p-lead p-live__caption">No staging, no rollback. Whoever loaded the page in those three seconds got half of it.</p>
      </div>`);
    section.appendChild(deployWrap);
    const live = createLiveSite();
    deployWrap.querySelector('.p-deploy-grid')!.appendChild(live.el);
    createDeploy(deployWrap.querySelector<HTMLElement>('.p-deploy-term')!, {
      label: 'Upload!',
      doneLabel: 'Uploaded ✓',
      title: 'C:\\WINDOWS\\system32\\cmd.exe - ftp',
      prompt: 'ftp>',
      onRun: live.reset,
      steps: [
        { kind: 'out', text: 'C:\\homepage>ftp ftp.zeus-hosting.example' },
        { kind: 'out', text: 'Connected to ftp.zeus-hosting.example.' },
        { kind: 'out', text: '220 ProFTPD 1.2.4 Server (zeus) [ftp.zeus-hosting.example]' },
        { kind: 'out', text: 'User (ftp.zeus-hosting.example:(none)): you' },
        { kind: 'out', text: '331 Password required for you.' },
        { kind: 'out', text: 'Password:' },
        { kind: 'out', text: '230 User you logged in.' },
        { kind: 'cmd', text: 'cd public_html' },
        { kind: 'out', text: '250 CWD command successful.' },
        { kind: 'cmd', text: 'put index.html' },
        { kind: 'out', text: '200 PORT command successful.' },
        { kind: 'out', text: '150 Opening ASCII mode data connection for index.html.' },
        // overwritten in place, at the 1.5 KB/s the log reports: the live page is half there for a while
        { kind: 'progress', text: 'index.html', delay: 3200, onProgress: live.index },
        { kind: 'out', text: '226 Transfer complete.', onStart: () => live.index(1) },
        { kind: 'out', text: 'ftp: 4812 bytes sent in 3.21Seconds 1.50Kbytes/sec.' },
        { kind: 'cmd', text: 'put counter.cgi' },
        { kind: 'out', text: '200 PORT command successful.' },
        { kind: 'out', text: '150 Opening ASCII mode data connection for counter.cgi.' },
        { kind: 'progress', text: 'counter.cgi', delay: 980, onStart: () => live.counter('broken') },
        { kind: 'out', text: '226 Transfer complete.' },
        { kind: 'out', text: 'ftp: 2133 bytes sent in 0.98Seconds 2.18Kbytes/sec.' },
        { kind: 'cmd', text: 'quote site chmod 755 counter.cgi' },
        { kind: 'ok', text: '200 SITE CHMOD command successful', onStart: () => live.counter('ok') },
        { kind: 'cmd', text: 'bye' },
        { kind: 'out', text: '221 Goodbye.' },
      ],
    });

    const stackWrap = h(`<div class="p-block p-stack-wrap"></div>`);
    section.appendChild(stackWrap);
    createStack(
      stackWrap,
      [
        { cat: 'Frontend', value: 'Flash / DHTML' },
        { cat: 'Language', value: 'HTML4 + JavaScript' },
        { cat: 'CSS / UI', value: 'table + spacer.gif' },
        { cat: 'Build', value: 'None (FTP)' },
        { cat: 'Backend', value: 'PHP / Perl CGI' },
        { cat: 'Database', value: 'MySQL' },
        { cat: 'Infra', value: 'Shared hosting' },
        { cat: 'Dev', value: 'Dreamweaver / Notepad' },
      ],
      'The stack of the day — 2005',
    );

    const bridge = buildBridge();
    section.appendChild(bridge);
    animateBridge(bridge);

    // HUD stays hidden behind the "Flash intro" until you skip or scroll
    setHudVisible(false);
    ScrollTrigger.create({
      trigger: intro,
      start: 'top top',
      end: '30% top',
      onLeave: () => setHudVisible(true),
      onEnterBack: () => setHudVisible(false),
    });
    intro.querySelector('.p-skip')!.addEventListener('click', () => {
      setHudVisible(true);
      scrollToEl(intro.nextElementSibling as HTMLElement);
    });
  },
};
