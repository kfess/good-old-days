import { siBackbonedotjs, siJquery } from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { gsap, reducedMotion } from '../../core/scroll';
import type { Era } from '../../core/types';
import { h } from '../../core/util';
import { buildCloud } from './cloud';
import { buildShowcase } from './showcase';
import { STAGE_2010 } from './stage';
import './style.css';

const GLYPHS = {
  bubble:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.5 21l4.3-2.4c1 .3 2.1.4 3.2.4 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 21s-7.5-4.6-9.6-9.2C1 8.7 2.9 5 6.5 5c2.1 0 3.5 1.2 4.5 2.6C12 6.2 13.4 5 15.5 5 19.1 5 21 8.7 19.6 11.8 17.5 16.4 12 21 12 21z"/></svg>',
  cloud:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M7 19h10.5a4.5 4.5 0 0 0 .6-9A6 6 0 0 0 6.6 9.2 5 5 0 0 0 7 19z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M8 5v14l11-7z"/></svg>',
};

function buildIntro(): HTMLElement {
  return h(`
    <div class="w-intro">
      <div class="w-sky" aria-hidden="true"></div>
      <div class="w-intro__inner">
        <div class="w-intro__text">
          <p class="w-years">2010 — 2011</p>
          <h2 class="w-title">Write less,<br>do more.<span class="w-burst" aria-hidden="true"><span>NEW!</span></span></h2>
          <p class="w-sub">The browser came alive.</p>
        </div>
        <div class="w-art" aria-hidden="true">
          <div class="w-orb"><span>$</span></div>
          <div class="w-icon w-icon--blue">${GLYPHS.bubble}</div>
          <div class="w-icon w-icon--pink">${GLYPHS.heart}</div>
          <div class="w-icon w-icon--green">${GLYPHS.play}</div>
          <div class="w-icon w-icon--purple">${GLYPHS.cloud}</div>
          <div class="w-floor"></div>
        </div>
      </div>
    </div>`);
}

/** The gloss slides off, the shadow drops, the corners square up: flat design is coming. */
function buildBridge(): HTMLElement {
  const el = h(`
    <div class="w-bridge">
      <div class="w-bridge__sticky">
        <div class="w-bridge__row">
          <div class="w-legal"><span class="w-legal__ink">Notes</span></div>
          <a href="#" class="w-flatten" tabindex="-1" aria-hidden="true"><i class="w-flatten__gloss"></i><span>Sign up — it's free!</span></a>
          <div class="w-leather"><span>Calendar</span></div>
        </div>
        <p class="w-bridge__line"><span class="w-bl w-bl--gloss">The gloss is<br />wearing off.</span><span class="w-bl w-bl--flat" aria-hidden="true">The gloss is<br />wearing off.</span></p>
        <p class="w-bridge__sub">2012 → Flat.</p>
      </div>
    </div>`);
  el.querySelector('a')!.addEventListener('click', (e) => e.preventDefault());
  if (reducedMotion) return el;

  const btn = el.querySelector<HTMLElement>('.w-flatten')!;
  const pad = el.querySelector<HTMLElement>('.w-legal')!;
  // the glossy row is already there as the bridge scrolls in, so the screen never sits empty
  gsap.from(el.querySelector('.w-bridge__row'), {
    opacity: 0,
    y: 60,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 20%', scrub: 0.6 },
  });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      onUpdate: (self) => {
        btn.classList.toggle('is-flat', self.progress > 0.5);
        pad.classList.toggle('is-flat', self.progress > 0.5);
      },
    },
  });
  tl.to(el.querySelector('.w-flatten__gloss'), { yPercent: -160, opacity: 0, duration: 1 }, 0)
    .to(
      btn,
      {
        '--gloss': 0,
        borderRadius: 3,
        boxShadow: '0 0px 0px rgba(0,0,0,0), inset 0 0px 0 rgba(255,255,255,0)',
        duration: 1,
      },
      0.3,
    )
    .to(
      el.querySelectorAll('.w-legal, .w-leather'),
      { '--tex': 0, borderRadius: 4, boxShadow: '0 0px 0px rgba(0,0,0,0)', duration: 1 },
      0.3,
    )
    .from(el.querySelector('.w-bridge__line'), { opacity: 0, y: 40, scale: 0.9, duration: 0.6 }, 0.7)
    .to(el.querySelector('.w-bl--gloss'), { opacity: 0, duration: 0.7 }, 1.3)
    .fromTo(el.querySelector('.w-bl--flat'), { opacity: 0 }, { opacity: 1, duration: 0.7 }, 1.3)
    .from(el.querySelector('.w-bridge__sub'), { opacity: 0, duration: 0.4 }, 1.2)
    .to({}, { duration: 0.6 });
  return el;
}

export const era: Era = {
  id: 'y2010',
  years: [2010, 2011],
  label: 'Web 2.0',
  theme: { bg: '#eef3f8', fg: '#222222', accent: '#ff7a00', muted: '#666666' },
  hudFont: "'Lucida Grande', 'Trebuchet MS', Verdana, sans-serif",
  servers: { value: 3, unit: 'EC2 instances' },
  render(section) {
    section.appendChild(buildIntro());

    createStage(section, STAGE_2010);
    createCredits(
      section,
      [
        { year: '2007', name: 'Heroku', icon: 'Heroku', line: 'git push, and you’re live. Rails’ favorite home.' },
        { year: '2010', name: 'npm', line: 'Any library, one command away.' },
        { year: '2010', name: 'Express', line: 'The minimalist framework for Node.' },
        { year: '2010', name: 'Socket.IO', line: 'Real-time came to the browser.' },
        { year: '2010.03', name: 'jQuery UI 1.8', icon: siJquery, line: 'Drag-and-drop, date pickers, all plugins.' },
        { year: '2010.05', name: 'Sass 3 (SCSS)', line: 'Plain CSS syntax, plus variables and nesting.' },
        { year: '2010.08', name: 'Rails 3', line: 'Standard issue for startups.' },
        { year: '2010.10', name: 'Backbone.js', icon: siBackbonedotjs, line: 'A backbone for jQuery spaghetti.' },
        { year: '2010.12', name: 'CoffeeScript 1.0', line: 'JavaScript without the curly braces.' },
        {
          year: '2011.08',
          name: 'Twitter Bootstrap',
          line: 'Twitter’s in-house toolkit, open-sourced.',
        },
      ],
      'Also starring — 2010–2011',
    );

    section.appendChild(buildShowcase());
    section.appendChild(buildCloud());

    createThread(section, 'y2010');

    const deployWrap = h(`
      <div class="w-block w-deploy-wrap" data-hud-year="2011">
        <header class="w-sechead">
          <p class="w-kicker">Deploy · 2011</p>
          <h3 class="w-h3">git push to production.</h3>
          <p class="w-lead">The day we closed the FTP client.</p>
        </header>
      </div>`);
    section.appendChild(deployWrap);
    createDeploy(deployWrap, {
      title: 'Terminal — bash — 80×24',
      steps: [
        { kind: 'cmd', text: 'git push heroku master' },
        { kind: 'out', text: 'Counting objects: 64, done.' },
        { kind: 'out', text: 'Delta compression using up to 2 threads.' },
        { kind: 'out', text: 'Compressing objects: 100% (52/52), done.' },
        { kind: 'progress', text: 'Writing objects:', delay: 1100 },
        { kind: 'out', text: 'Writing objects: 100% (64/64), 23.41 KiB, done.' },
        { kind: 'out', text: 'Total 64 (delta 6), reused 0 (delta 0)' },
        { kind: 'out', text: '' },
        { kind: 'out', text: '-----> Heroku receiving push' },
        { kind: 'out', text: '-----> Rails app detected' },
        { kind: 'out', text: '-----> Gemfile detected, running Bundler version 1.0.7' },
        { kind: 'out', text: '       Unresolved dependencies detected; Installing...' },
        { kind: 'out', text: '       Your bundle is complete! It was installed into ./.bundle/gems', delay: 500 },
        { kind: 'out', text: '       Compiled slug size is 5.2MB' },
        { kind: 'out', text: '-----> Launching... done', delay: 400 },
        { kind: 'ok', text: '       http://glossr.heroku.com deployed to Heroku' },
        { kind: 'out', text: '' },
        { kind: 'out', text: 'To git@heroku.com:glossr.git' },
        { kind: 'out', text: ' * [new branch]      master -> master' },
      ],
    });

    const stackWrap = h(`<div class="w-block w-stack-wrap"></div>`);
    section.appendChild(stackWrap);
    createStack(
      stackWrap,
      [
        { cat: 'Frontend', prev: 'Flash / DHTML', value: 'jQuery' },
        { cat: 'Language', prev: 'HTML4 + JavaScript', value: 'JavaScript (ES3/ES5)' },
        { cat: 'CSS / UI', prev: 'table + spacer.gif', value: 'CSS3 + 960.gs' },
        { cat: 'Build', prev: 'None (FTP)', value: 'YUI Compressor' },
        { cat: 'Backend', prev: 'PHP / Perl CGI', value: 'Rails 3 / PHP' },
        { cat: 'Database', prev: 'MySQL', value: 'PostgreSQL / MySQL + Memcached' },
        { cat: 'Infra', prev: 'Shared hosting', value: 'EC2 / Heroku' },
        { cat: 'Dev', prev: 'Dreamweaver / Notepad', value: 'TextMate / Eclipse + Git' },
      ],
      'The stack of the day — 2011',
    );

    section.appendChild(buildBridge());
  },
};
