import {
  siAstro,
  siBun,
  siCloudflare,
  siCloudflarepages,
  siEsbuild,
  siFigma,
  siGithubcopilot,
  siLinear,
  siNextdotjs,
  siPlanetscale,
  siPnpm,
  siPrisma,
  siReact,
  siRemix,
  siSolid,
  siStorybook,
  siSupabase,
  siSvelte,
  siTailwindcss,
  siTrpc,
  siTypescript,
  siVercel,
} from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { logo } from '../../components/logo';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import { gsap, reducedMotion, scrollToEl } from '../../core/scroll';
import type { Era } from '../../core/types';
import { h, onceInView, sleep } from '../../core/util';
import { createBento } from './bento';
import { createGlobe } from './globe';
import { DENO, TURBOREPO, VITE, VITEST } from './icons';
import { STAGE_2021 } from './stage';
import './style.css';

const MARQUEE = [
  VITE,
  siReact,
  siNextdotjs,
  siSvelte,
  siAstro,
  siRemix,
  siSolid,
  siTailwindcss,
  siTypescript,
  siBun,
  DENO,
  siSupabase,
  siPrisma,
  siTrpc,
  siVercel,
  siCloudflare,
  siPnpm,
  TURBOREPO,
  siEsbuild,
  siGithubcopilot,
  siFigma,
  siLinear,
  siPlanetscale,
  VITEST,
  siStorybook,
];

export const era: Era = {
  id: 'y2021',
  years: [2021, 2022],
  label: 'Edge & DX',
  theme: { bg: '#07070c', fg: '#f2f2f7', accent: '#a78bfa', muted: '#8b8b99' },
  hudFont: "'Space Grotesk', 'Inter', sans-serif",
  servers: { value: 250, unit: 'edge locations' },
  render(section) {
    section.appendChild(
      h(`
      <header class="y21-intro">
        <div class="y21-aurora" aria-hidden="true"><i></i><i></i><i></i><b class="y21-noise"></b></div>
        <div class="y21-clay" aria-hidden="true">
          <span class="clay clay--sphere"></span>
          <span class="clay clay--torus"></span>
          <span class="clay clay--pill"></span>
          <span class="clay clay--cube"></span>
          <span class="clay clay--dot"></span>
          <span class="clay clay--dot2"></span>
        </div>
        <div class="y21-intro__copy">
          <p class="y21-years"><span>2021</span><i></i><span>2022</span></p>
          <h2 class="y21-catch">Faster than<br/>you can save.</h2>
          <p class="y21-sub">Changed before you finish saving.</p>
        </div>
      </header>`),
    );

    const stage = createStage(section, STAGE_2021);

    createCredits(
      section,
      [
        { year: '2021', name: 'Astro', line: 'JavaScript only on the islands that need it.' },
        {
          year: '2021',
          name: 'Cloudflare Pages',
          icon: siCloudflarepages,
          line: 'git push, and it’s on the edge worldwide.',
        },
        { year: '2021', name: 'SolidJS 1.0', icon: siSolid, line: 'Faster, without a virtual DOM.' },
        { year: '2021', name: 'Remix', icon: siRemix, line: 'Betting on web standards again.' },
        { year: '2021', name: 'Turborepo', icon: TURBOREPO, line: 'Monorepo builds, made instant by caching.' },
        { year: '2022', name: 'Bun', icon: siBun, line: 'Runtime, package manager, everything. Fast.' },
        { year: '2022', name: 'Next.js 13', icon: siNextdotjs, line: 'Redrew the line between server and client.' },
      ],
      'Also starring — 2021–2022',
    );

    const bentoWrap = h(`
      <div class="y21-block y21-bento">
        <div class="y21-head">
          <p class="y21-kicker">The look of 2021–22</p>
          <h3 class="y21-h">Bento, glass and glow.</h3>
          <p class="y21-p">Dark UI, glowing borders, frosted glass. ⌘K reaches everything.</p>
        </div>
      </div>`);

    const marquee = h(`
      <div class="y21-marquee">
        <p class="y21-marquee__label"><code>&lt;marquee&gt;</code> is back, in CSS.</p>
        <div class="y21-marquee__track">
          <div class="y21-marquee__row">${[...MARQUEE, ...MARQUEE].map((i) => `<span>${logo(i, 'current')}${i.title}</span>`).join('')}</div>
        </div>
      </div>`);

    // ---- infra: the edge ----
    const edge = h(`
      <div class="y21-block y21-edge">
        <div class="y21-head">
          <p class="y21-kicker">Edge network</p>
          <h3 class="y21-h">The edge is the new origin.</h3>
          <p class="y21-p">Every request gets answered by the nearest city.</p>
        </div>
        <div class="edge">
          <canvas class="edge__globe" aria-label="Globe: requests answered by the nearest edge location"></canvas>
          <div class="edge__panel">
            <div class="edge__seg" role="group" aria-label="Routing">
              <button type="button" data-mode="edge" class="is-on">Edge · 30 cities</button>
              <button type="button" data-mode="origin">Origin only · us-east-1</button>
            </div>
            <p class="edge__stat"><b class="edge__ms">—</b><span>avg. round trip</span></p>
            <p class="edge__desc">Tokyo to Virginia and back is far, even at light speed.</p>
            <p class="edge__haiku" aria-label="Incident postmortem haiku"><small>postmortem.txt</small>It’s not DNS<br />There’s no way it’s DNS<br />It was DNS</p>
          </div>
        </div>
      </div>`);

    const ship = h(`
      <div class="y21-block y21-ship">
        <div class="y21-head">
          <p class="y21-kicker">Preview deployments</p>
          <h3 class="y21-h">Every pull request<br/>gets its own live site.</h3>
          <p class="y21-p">Review the real thing, not just the diff. Merge, and it’s production.</p>
        </div>
        <div class="y21-ship__deploy"></div>
      </div>`);

    section.appendChild(bentoWrap);
    section.appendChild(marquee);
    section.appendChild(edge);
    createThread(section, 'y2021');
    section.appendChild(ship);

    const deploy = createDeploy(ship.querySelector<HTMLElement>('.y21-ship__deploy')!, {
      label: 'git push',
      title: 'zsh — acme/web — feat/new-hero',
      prompt: '→',
      doneLabel: 'Preview ready ✓',
      steps: [
        { kind: 'cmd', text: 'git push origin feat/new-hero' },
        { kind: 'out', text: "remote: Create a pull request for 'feat/new-hero' on GitHub by visiting:" },
        { kind: 'out', text: 'remote:      https://github.com/acme/web/pull/new/feat/new-hero' },
        { kind: 'out', text: 'Cloning github.com/acme/web (Branch: feat/new-hero, Commit: 3f9a2c1)' },
        { kind: 'out', text: 'Restored build cache · Installing with pnpm…' },
        { kind: 'progress', text: 'next build   ', delay: 1100 },
        { kind: 'out', text: 'info  - Compiled successfully' },
        { kind: 'ok', text: '✓ Preview: https://web-git-feat-new-hero-acme.vercel.app' },
        { kind: 'ok', text: '✓ Ready in 9s — open the PR and the preview link is already on it' },
      ],
    });

    createBento(bentoWrap, section, {
      save: () => scrollToEl(stage),
      deploy: () => {
        scrollToEl(ship);
        setTimeout(() => deploy.querySelector<HTMLButtonElement>('.deploy__btn')?.click(), 1000);
      },
      toggleAurora: () => section.classList.toggle('is-calm'),
    });

    const msEl = edge.querySelector<HTMLElement>('.edge__ms')!;
    const globe = createGlobe(edge.querySelector('canvas')!, {
      requests: true,
      onStats: (ms) => {
        msEl.textContent = `${ms}ms`;
      },
    });
    edge.querySelectorAll<HTMLButtonElement>('.edge__seg button').forEach((b) =>
      b.addEventListener('click', () => {
        edge.querySelectorAll('.edge__seg button').forEach((x) => x.classList.toggle('is-on', x === b));
        globe.setMode(b.dataset.mode as 'edge' | 'origin');
        msEl.textContent = '—';
      }),
    );

    const stackWrap = h(`<div class="y21-block y21-stack"></div>`);
    section.appendChild(stackWrap);
    createStack(stackWrap, [
      { cat: 'Frontend', prev: 'React Hooks / Next.js', value: 'Next.js / Vite' },
      { cat: 'Language', prev: 'TypeScript', value: 'TypeScript + Zod' },
      { cat: 'CSS / UI', prev: 'styled-components / Tailwind', value: 'Tailwind CSS (JIT)' },
      { cat: 'Build', prev: 'webpack 4 + Babel', value: 'Vite / esbuild' },
      { cat: 'Backend', prev: 'NestJS / GraphQL / Serverless', value: 'tRPC / Edge Functions' },
      { cat: 'Database', prev: 'Aurora / Firestore', value: 'Supabase / PlanetScale' },
      { cat: 'Infra', prev: 'Terraform + EKS / GKE', value: 'Vercel / Cloudflare Workers' },
      { cat: 'Dev', prev: 'VS Code + GitHub Actions', value: 'VS Code + Copilot' },
      { cat: 'AI', prev: 'GPT-3', value: 'GitHub Copilot' },
    ]);

    // ---- 2022.11.30: everything goes quiet ----
    const end = h(`
      <div class="y21-end">
        <div class="y21-end__inner">
          <p class="y21-end__date">2022.11.30</p>
          <p class="y21-end__what">ChatGPT launches.<small>A free research preview from OpenAI.</small></p>
          <div class="y21-end__box">
            <span class="y21-end__text"></span><span class="y21-end__caret" aria-hidden="true"></span>
            <span class="y21-end__send" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></span>
          </div>
        </div>
      </div>`);
    section.appendChild(end);
    const text = end.querySelector<HTMLElement>('.y21-end__text')!;
    if (!reducedMotion) {
      // the date looms, the box steps forward: the last quiet moment before everything changes
      gsap
        .timeline({ scrollTrigger: { trigger: end, start: 'top 80%', end: 'top top', scrub: 0.6 } })
        .fromTo(
          end.querySelector('.y21-end__date'),
          { opacity: 0, letterSpacing: '0.2em' },
          { opacity: 1, letterSpacing: '-0.04em', ease: 'power2.out' },
          0,
        )
        .fromTo(
          end.querySelector('.y21-end__what'),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, ease: 'power2.out' },
          0.12,
        )
        .fromTo(
          end.querySelector('.y21-end__box'),
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'power2.out' },
          0.2,
        );
    }
    onceInView(
      end.querySelector('.y21-end__box')!,
      async () => {
        await sleep(600);
        for (const ch of 'Explain quantum computing in simple terms') {
          text.textContent += ch;
          await sleep(55 + Math.random() * 60);
        }
        end.classList.add('is-ready');
      },
      'top 60%',
    );
  },
};
