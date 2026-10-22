import { siBabel, siGraphql, siPrettier, siRedux, siRust, siWebassembly, siYarn } from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { gsap, reducedMotion, ScrollTrigger, scrollToEl } from '../../core/scroll';
import type { Era } from '../../core/types';
import { h } from '../../core/util';
import { mountApp } from './app';
import { mountBranch } from './branch';
import { mountInfra } from './infra';
import { mountIntro } from './intro';
import { ripples } from './ripple';
import { STAGE_2015, STAGE_2015_LATE } from './stage';
import './style.css';

const VSCODE = `<svg viewBox="0 0 24 24" aria-label="code"><path fill="#007acc" d="M8.6 16.6 4 12l4.6-4.6L7.2 6l-6 6 6 6zm6.8 0L20 12l-4.6-4.6L16.8 6l6 6-6 6z"/></svg>`;

/**
 * The lights go out. Huge type pins to the screen and each word flickers off like a tube light,
 * leaving only its outline; then the Material switch flips as the dark 2018 palette arrives.
 */
function mountBridge(parent: HTMLElement): void {
  const words = ['Then,', 'the', 'lights', 'went', 'out.'];
  const el = h(`
    <section class="y15-bridge">
      <svg class="y15-bridge__defs" width="0" height="0" aria-hidden="true" focusable="false">
        <!-- the outline is the glyph grown by 1.5px minus the glyph itself: only the silhouette,
             never the overlapping contours a variable font's text-stroke would trace -->
        <filter id="y15-ring" x="-5%" y="-5%" width="110%" height="110%">
          <feMorphology in="SourceGraphic" operator="dilate" radius="1.5" result="grown" />
          <feComposite in="grown" in2="SourceAlpha" operator="out" />
        </filter>
      </svg>
      <div class="y15-bridge__sticky">
        <div class="y15-bridge__inner">
          <label class="y15-switch">
            <input type="checkbox" aria-label="Dark theme">
            <span class="y15-switch__track"><span class="y15-switch__thumb"></span></span>
            <span class="y15-switch__label">Dark theme</span>
          </label>
          <h3 class="y15-bridge__title" aria-label="Then, the lights went out.">${words.map((w) => `<span class="y15-lw" data-w="${w}" aria-hidden="true">${w}</span>`).join(' ')}</h3>
          <p class="y15-bridge__jp">The screen went dark. Infrastructure moved behind the cluster.</p>
          <code class="y15-bridge__code">@media (prefers-color-scheme: dark)</code>
        </div>
      </div>
    </section>`);
  parent.appendChild(el);

  const input = el.querySelector<HTMLInputElement>('input')!;
  const lws = Array.from(el.querySelectorAll<HTMLElement>('.y15-lw'));
  // the theme here is the scroll position, so flipping the switch scrolls to where the lights go out
  // (or back to where they're still on). While that scroll runs, the switch keeps the side it was
  // flipped to instead of following the scroll back and forth.
  let heading: boolean | null = null;
  input.addEventListener('change', () => {
    heading = input.checked;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToEl(heading ? top + el.offsetHeight - window.innerHeight * 0.25 : top);
  });

  if (reducedMotion) {
    lws.forEach((w) => w.style.setProperty('--on', '0'));
  } else {
    // while pinned: each word flickers off in turn, like a row of tube lights
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
    });
    tl.set(lws, { '--on': 1 }, 0);
    lws.forEach((w, i) => {
      const t = 0.15 + i * 0.32;
      tl.to(w, { '--on': 0.12, duration: 0.03, ease: 'none' }, t)
        .to(w, { '--on': 0.85, duration: 0.03, ease: 'none' }, t + 0.05)
        .to(w, { '--on': 0.08, duration: 0.03, ease: 'none' }, t + 0.1)
        .to(w, { '--on': 0.55, duration: 0.02, ease: 'none' }, t + 0.14)
        .to(w, { '--on': 0, duration: 0.08, ease: 'power1.in' }, t + 0.18);
    });
    tl.from(
      [el.querySelector('.y15-bridge__jp'), el.querySelector('.y15-bridge__code')],
      { opacity: 0, y: 16, stagger: 0.08, duration: 0.2 },
      1.7,
    );
    tl.to({}, { duration: 0.25 });
  }

  // same range as the core's 2015 → 2018 palette blend (this section's bottom = 2018's top)
  ScrollTrigger.create({
    trigger: el,
    start: 'bottom bottom',
    end: 'bottom 25%',
    onUpdate: (self) => {
      // flip exactly where the blended background crosses mid-grey, so the text never vanishes
      const dark = self.progress > 0.45;
      el.classList.toggle('is-dark', dark);
      if (heading === null || heading === dark) {
        heading = null;
        input.checked = dark;
      }
    },
    onLeave: () => el.classList.add('is-dark'),
    onLeaveBack: () => {
      heading = null;
      input.checked = false;
      el.classList.remove('is-dark');
    },
  });
}

export const era: Era = {
  id: 'y2015',
  years: [2015, 2017],
  label: 'Components & Containers',
  theme: { bg: '#fafafa', fg: '#212121', accent: '#3f51b5', muted: '#757575' },
  hudFont: "'Roboto', sans-serif",
  servers: { value: 50, unit: 'containers' },
  render(section) {
    mountIntro(section);

    createStage(section, STAGE_2015);
    createCredits(
      section,
      [
        {
          year: '2015',
          name: 'VS Code',
          icon: VSCODE,
          line: 'Light and batteries-included. The beginning of the end of the editor wars.',
        },
        { year: '2015', name: 'Babel', icon: siBabel, line: 'Tomorrow’s JavaScript, in today’s browsers.' },
        { year: '2015', name: 'Redux', icon: siRedux, line: 'All state, in a single tree.' },
        { year: '2015', name: 'GraphQL', icon: siGraphql, line: 'Ask for exactly what you need.' },
        { year: '2015', name: 'Rust 1.0', icon: siRust, line: 'Fast and safe, at the same time.' },
        { year: '2016', name: 'Yarn', icon: siYarn, line: 'No more waiting on npm install.' },
        { year: '2016', name: 'Next.js', line: 'Server-side rendering for React.' },
        { year: '2017', name: 'Prettier', icon: siPrettier, line: 'No more arguing about formatting.' },
        { year: '2017', name: 'WebAssembly', icon: siWebassembly, line: 'Native speed, in the browser.' },
      ],
      'Also starring — 2015–2017',
    );

    mountBranch(section);
    mountApp(section);
    mountInfra(section);

    createThread(section, 'y2015');

    // webpack 2 shipped in 2017: after the 2016 blocks, just before the 2017 deploy
    createStage(section, STAGE_2015_LATE);

    const ship = h(`
      <section class="y15-panel y15-ship" data-hud-year="2017">
        <header class="y15-head">
          <p class="y15-kicker">Deploy, 2017</p>
          <h3 class="y15-title">docker build. docker push.</h3>
          <p class="y15-jp">Bake the image, push it to the registry. The orchestrator and Lambda do the rest.</p>
        </header>
        <div class="y15-ship__deploy"></div>
        <div class="y15-ship__stack"></div>
      </section>`);
    section.appendChild(ship);
    ripples(ship);
    const deploy = createDeploy(ship.querySelector<HTMLElement>('.y15-ship__deploy')!, {
      title: 'bash — docker',
      label: 'Deploy',
      steps: [
        // no .dockerignore yet: `COPY . .` (step 3) ships the Mac's node_modules, so npm install keeps its
        // macOS node-sass binary and the webpack build can't load it on Linux
        { kind: 'cmd', text: 'docker build -t acme/web:1.4.2 .' },
        { text: 'Sending build context to Docker daemon  187.6MB' },
        { text: 'Step 1/6 : FROM node:6' },
        { kind: 'progress', text: 'Step 4/6 : RUN npm install', delay: 1400 },
        { text: 'Step 5/6 : RUN npm run build' },
        {
          kind: 'err',
          text: 'Module build failed: Error: Missing binding /app/node_modules/node-sass/vendor/linux-x64-48/binding.node',
        },
        {
          kind: 'err',
          text: 'Node Sass could not find a binding for your current environment: Linux 64-bit with Node.js 6.x',
          delay: 600,
        },
        { kind: 'cmd', text: 'echo node_modules > .dockerignore && docker build -t acme/web:1.4.2 .' },
        { text: 'Sending build context to Docker daemon  4.096MB' },
        { kind: 'progress', text: 'Step 4/6 : RUN npm install', delay: 800 },
        { text: 'Successfully built 9f2c3a1b7e44' },
        { kind: 'cmd', text: 'docker push acme/web:1.4.2' },
        { text: 'The push refers to a repository [docker.io/acme/web]' },
        { kind: 'progress', text: 'Pushing layers', delay: 1000 },
        { kind: 'ok', text: '1.4.2: digest: sha256:4e1fa90c… size: 2412' },
        { kind: 'cmd', text: 'ecs-cli compose service up' },
        {
          kind: 'ok',
          text: 'INFO[0030] ECS Service has reached a stable state  desiredCount=50 runningCount=50 serviceName=ecscompose-service-web',
        },
        { kind: 'cmd', text: 'serverless deploy' },
        { text: 'Serverless: Uploading CloudFormation file to S3...' },
        { text: 'endpoints:' },
        { kind: 'ok', text: '  GET - https://a1b2c3d4e5.execute-api.us-east-1.amazonaws.com/dev/hello' },
      ],
    });
    deploy.querySelector('.deploy__btn')!.classList.add('rp');
    createStack(ship.querySelector<HTMLElement>('.y15-ship__stack')!, [
      { cat: 'Frontend', prev: 'AngularJS / Backbone.js', value: 'React + Redux' },
      { cat: 'Language', prev: 'ES5 + CoffeeScript', value: 'ES2015 + Babel' },
      { cat: 'CSS / UI', prev: 'Bootstrap + LESS', value: 'Material UI / CSS Modules' },
      { cat: 'Build', prev: 'Grunt / gulp', value: 'webpack + Babel' },
      { cat: 'Backend', prev: 'Node.js + Express', value: 'Node.js / Go / GraphQL' },
      { cat: 'Database', prev: 'MongoDB / Redis', value: 'PostgreSQL / DynamoDB' },
      { cat: 'Infra', prev: 'Chef + EC2 (Vagrant locally)', value: 'Docker / ECS / Lambda' },
      { cat: 'Dev', prev: 'Sublime Text + GitHub', value: 'Atom / VS Code' },
    ]);

    mountBridge(section);
  },
};
