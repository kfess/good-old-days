import { siAnsible, siVuedotjs } from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { sublimeText2 } from '../../components/marks';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { gsap, reducedMotion } from '../../core/scroll';
import type { Era } from '../../core/types';
import { h } from '../../core/util';
import { bootstrapB } from './art';
import { mountIntro } from './intro';
import { mountPets } from './pets';
import { mountResponsive } from './responsive';
import { STAGE_2012 } from './stage';
import { buildVim } from './vim';
import './style.css';

/** Flat cards slowly gaining elevation: the hand-off to Material Design (2014). */
function mountBridge(parent: HTMLElement): void {
  const cards: [string, string, string][] = [
    ['#1abc9c', '#009688', '1dp'],
    ['#3498db', '#2196f3', '4dp'],
    ['#9b59b6', '#673ab7', '8dp'],
    ['#e74c3c', '#e91e63', '16dp'],
  ];
  const el = h(`
    <section class="y12-bridge">
      <div class="y12-bridge__copy">
        <p class="y12-kicker">2014 · Material Design</p>
        <h3 class="y12-title y12-bridge__title">Then, paper<br />got depth.</h3>
        <p class="y12-jp">Paper depth and shadows return to the flat screen.</p>
      </div>
      <div class="y12-bridge__cards">
        ${cards.map(([, , dp]) => `<div class="y12-bridge__card"><i></i><span>${dp}</span></div>`).join('')}
      </div>
    </section>`);
  parent.appendChild(el);

  const nodes = el.querySelectorAll<HTMLElement>('.y12-bridge__card');
  const shadows = [
    '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24)',
    '0 6px 10px rgba(0,0,0,.14), 0 2px 4px rgba(0,0,0,.2)',
    '0 12px 20px rgba(0,0,0,.16), 0 6px 8px rgba(0,0,0,.18)',
    '0 24px 38px rgba(0,0,0,.18), 0 10px 14px rgba(0,0,0,.2)',
  ];
  // the headline gains Material elevation together with the cards
  const title = el.querySelector<HTMLElement>('.y12-bridge__title')!;
  if (!reducedMotion)
    gsap.fromTo(
      title,
      { textShadow: '0 0 0 rgba(0,0,0,0)', y: 0 },
      {
        textShadow: '0 1px 1px rgba(0,0,0,.14), 0 6px 10px rgba(0,0,0,.14), 0 18px 34px rgba(0,0,0,.18)',
        y: -10,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'center 40%', scrub: 0.6 },
      },
    );
  nodes.forEach((n, i) => {
    const swatch = n.querySelector('i')!;
    swatch.style.background = cards[i][0];
    if (reducedMotion) {
      n.style.boxShadow = shadows[i];
      swatch.style.background = cards[i][1];
      return;
    }
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'center 40%', scrub: 0.6 },
    });
    tl.fromTo(
      n,
      { boxShadow: '0 0 0 rgba(0,0,0,0)', y: 0, borderRadius: 0 },
      { boxShadow: shadows[i], y: -6 * (i + 1), borderRadius: 2, ease: 'none' },
      0,
    );
    tl.fromTo(swatch, { backgroundColor: cards[i][0] }, { backgroundColor: cards[i][1], ease: 'none' }, 0);
  });
}

const GOPHER = `<svg class="logo" viewBox="0 0 336 457" role="img" aria-label="Go gopher"><image href="${import.meta.env.BASE_URL}brand/gopher.svg" width="336" height="457"/></svg>`;

export const era: Era = {
  id: 'y2012',
  years: [2012, 2014],
  label: 'Flat & Responsive',
  theme: { bg: '#ecf0f1', fg: '#2c3e50', accent: '#1abc9c', muted: '#7f8c8d' },
  hudFont: "'Lato', 'Open Sans', sans-serif",
  servers: { value: 12, unit: 'VMs, provisioned by Chef' },
  render(section) {
    mountIntro(section);

    createStage(section, STAGE_2012);
    createCredits(
      section,
      [
        // no icon: the blue "TS" square only arrived with the 2020 branding
        { year: '2012', name: 'TypeScript', line: 'Types: insurance for JavaScript.' },
        // the gopher (Renée French, CC BY 4.0) predates Go 1.0; the slanted "GO" logo came in 2018
        { year: '2012', name: 'Go 1.0', icon: GOPHER, line: 'Simple, fast, concurrent.' },
        { year: '2012', name: 'Grunt', line: 'Minify and concat, left to tasks.' },
        { year: '2012', name: 'Sublime Text 2', icon: sublimeText2, line: '⌘D, ⌘D, ⌘D — multiple cursors.' },
        // the "A" was black until the Red Hat red of the 2020s
        {
          year: '2012',
          name: 'Ansible',
          icon: { ...siAnsible, hex: '1A1918' },
          line: 'Ship to every server over plain SSH.',
        },
        { year: '2013', name: 'Bootstrap 3', icon: bootstrapB, line: 'Mobile first. And every site looked the same.' },
        { year: '2013', name: 'gulp', line: 'Streams over config.' },
        { year: '2014', name: 'Vue.js', icon: siVuedotjs, line: 'The framework that felt just right.' },
        { year: '2014', name: 'Terraform', line: 'Write infra as code, then plan.' },
      ],
      'Also starring — 2012–2014',
    );

    mountResponsive(section);
    mountPets(section);

    createThread(section, 'y2012');

    const ship = h(`
      <section class="y12-panel y12-ship">
        <header class="y12-head">
          <p class="y12-kicker">Deploy, 2013</p>
          <h3 class="y12-title">vagrant up. cap deploy.</h3>
          <p class="y12-jp">Spin up the same VM locally. Ship to every server at once with Capistrano.</p>
        </header>
        <div class="y12-ship__deploy"></div>
        <div class="y12-ship__vim"></div>
        <div class="y12-ship__stack"></div>
      </section>`);
    section.appendChild(ship);
    ship.querySelector('.y12-ship__vim')!.appendChild(buildVim());
    createDeploy(ship.querySelector<HTMLElement>('.y12-ship__deploy')!, {
      title: 'Terminal — bash — 80×24',
      steps: [
        { kind: 'cmd', text: 'vagrant up' },
        { text: "Bringing machine 'default' up with 'virtualbox' provider..." },
        { text: "[default] Importing base box 'precise64'..." },
        { text: '[default] Forwarding ports...' },
        { text: '[default] -- 22 => 2222 (adapter 1)' },
        { text: '[default] -- 80 => 8080 (adapter 1)' },
        { text: '[default] Booting VM...' },
        { kind: 'progress', text: '[default] Running provisioner: chef_solo...', delay: 1300 },
        { kind: 'ok', text: '[2013-06-11T10:41:52+00:00] INFO: Chef Run complete in 38.204 seconds' },
        { kind: 'cmd', text: 'cap production deploy' },
        { text: "  * 2013-06-11 10:42:07 executing `deploy'" },
        { text: "  * 2013-06-11 10:42:07 executing `deploy:update'" },
        { text: "  * 2013-06-11 10:42:07 executing `deploy:update_code'" },
        { text: '    servers: ["web-001", "web-002", … "web-012"]' },
        { kind: 'progress', text: "  * 2013-06-11 10:42:40 executing `deploy:create_symlink'", delay: 900 },
        { text: "  * 2013-06-11 10:42:41 executing `deploy:restart'" },
        { kind: 'ok', text: '    command finished in 2841ms' },
      ],
    });
    createStack(ship.querySelector<HTMLElement>('.y12-ship__stack')!, [
      { cat: 'Frontend', prev: 'jQuery', value: 'AngularJS / Backbone.js' },
      { cat: 'Language', prev: 'JavaScript (ES3/ES5)', value: 'ES5 + CoffeeScript' },
      { cat: 'CSS / UI', prev: 'CSS3 + 960.gs', value: 'Bootstrap + LESS' },
      { cat: 'Build', prev: 'YUI Compressor', value: 'Grunt / gulp' },
      { cat: 'Backend', prev: 'Rails 3 / PHP', value: 'Node.js + Express' },
      { cat: 'Database', prev: 'PostgreSQL / MySQL + Memcached', value: 'MongoDB / Redis' },
      { cat: 'Infra', prev: 'EC2 / Heroku', value: 'Chef + EC2 (Vagrant locally)' },
      { cat: 'Dev', prev: 'TextMate / Eclipse + Git', value: 'Sublime Text + GitHub' },
    ]);

    mountBridge(section);
  },
};
