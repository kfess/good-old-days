import { siDeno, siGithubactions, siHelm, siIstio, siSvelte } from 'simple-icons';
import { createCredits } from '../../components/credits';
import { createDeploy } from '../../components/deploy';
import { createStack } from '../../components/stack';
import { createStage } from '../../components/stage';
import { createThread } from '../../components/thread';
import type { Era } from '../../core/types';
import { h } from '../../core/util';
import { createGlobe } from '../y2021/globe';
import { createDunning } from './dunning';
import { ILLUST_2018 } from './illust';
import { createK8sEpic } from './k8s-epic';
import { k8sMark } from './k8s-logo';
import { createLandscape } from './landscape';
import { createLook } from './look';
import { STAGE_2018 } from './stage';
import { createTerraform } from './terraform';
import './style.css';

export const era: Era = {
  id: 'y2018',
  years: [2018, 2020],
  label: 'Cloud Native',
  theme: { bg: '#0b1020', fg: '#e8ecf6', accent: '#326ce5', muted: '#8a94b2' },
  hudFont: "'Poppins', 'Inter', sans-serif",
  servers: { value: 500, unit: 'nodes' },
  render(section) {
    section.appendChild(
      h(`
      <header class="y18-intro">
        <div class="y18-mesh" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="y18-intro__copy">
          <p class="y18-years">2018 — 2020</p>
          <h2 class="y18-catch">Cloud<br/>native.</h2>
          <p class="y18-sub">Servers became something you declare.</p>
        </div>
        <div class="y18-intro__art">${ILLUST_2018}</div>
      </header>`),
    );

    createStage(section, STAGE_2018);

    // ---- infrastructure as code: Terraform builds the cluster that Argo CD will deploy to ----
    createTerraform(section);

    // ---- the infra climax: one container → a planet-scale fleet ----
    createK8sEpic(section);
    // ---- …and what it actually felt like to learn it ----
    createDunning(section);

    const credits = createCredits(
      section,
      [
        {
          year: '2018',
          name: 'Managed Kubernetes',
          icon: k8sMark('logo'),
          line: 'EKS, GKE, AKS. K8s became the common language of the cloud.',
        },
        { year: '2018', name: 'Istio 1.0', icon: siIstio, line: 'A mesh woven between services.' },
        { year: '2019', name: 'GPT-2', line: 'A mysterious language model, released only in stages.' },
        { year: '2019', name: 'Svelte 3', icon: siSvelte, line: 'The framework vanishes at build time.' },
        { year: '2019', name: 'GitHub Actions', icon: siGithubactions, line: 'CI moved into the repository.' },
        { year: '2019', name: 'Helm 3', icon: siHelm, line: 'YAML, packaged and shipped.' },
        { year: '2020', name: 'Deno 1.0', icon: siDeno, line: 'Node’s creator, starting Node over.' },
        { year: '2020', name: 'GPT-3', line: '175 billion parameters. Nobody knew what it meant yet.' },
      ],
      'Also starring — 2018–2020',
    );
    credits.querySelectorAll('.credit').forEach((c) => {
      if (/GPT-/.test(c.querySelector('.credit__name')?.textContent ?? '')) c.classList.add('is-mystery');
    });

    createLandscape(section);

    const lookWrap = h(`<div class="y18-block y18-block--look"></div>`);
    section.appendChild(lookWrap);
    createLook(lookWrap);

    createThread(section, 'y2018');

    // ---- GitOps + deploy ----
    const ship = h(`
      <div class="y18-block y18-block--ship">
        <div class="y18-head">
          <p class="y18-kicker">GitOps · Argo CD</p>
          <h3 class="y18-h">Production doesn’t take commands. It takes commits.</h3>
          <p class="y18-p">Nobody runs kubectl against prod. Git is the source of truth; Argo CD makes the cluster match it.</p>
        </div>
        <ol class="gitops" aria-label="GitOps flow">
          <li><b>App repo</b><span>merge to master</span></li>
          <li><b>Actions</b><span>test · build · push</span></li>
          <li><b>Registry</b><span>api:2.4.1</span></li>
          <li><b>Config repo</b><span>PR #517 merged</span></li>
          <li><b>Argo CD</b><span>OutOfSync → Synced</span></li>
          <li><b>Cluster</b><span>Healthy</span></li>
        </ol>
        <div class="y18-ship"></div>
      </div>`);
    section.appendChild(ship);
    const deploy = createDeploy(ship.querySelector<HTMLElement>('.y18-ship')!, {
      label: 'git push',
      title: 'zsh — git — acme/k8s-config',
      prompt: '❯',
      doneLabel: 'Synced · Healthy ✓',
      steps: [
        { kind: 'cmd', text: 'git checkout -b api-2.4.1' },
        { kind: 'out', text: "Switched to a new branch 'api-2.4.1'" },
        { kind: 'cmd', text: 'git commit -am "api: bump image to 2.4.1"' },
        { kind: 'out', text: '[api-2.4.1 3f9c2a1] api: bump image to 2.4.1' },
        { kind: 'out', text: ' 1 file changed, 1 insertion(+), 1 deletion(-)' },
        { kind: 'cmd', text: 'git push -u origin api-2.4.1' },
        { kind: 'out', text: 'To github.com:acme/k8s-config.git' },
        { kind: 'out', text: ' * [new branch]      api-2.4.1 -> api-2.4.1' },
        { kind: 'out', text: 'CI ▸ kubeval ✓  conftest policy ✓', delay: 400 },
        { kind: 'out', text: 'GitHub ▸ PR #517 approved and merged into master', delay: 400 },
        { kind: 'out', text: 'Argo CD ▸ app/api   OutOfSync   (api:2.4.0 → api:2.4.1)', delay: 500 },
        { kind: 'progress', text: 'Argo CD ▸ syncing  ', delay: 1200 },
        { kind: 'out', text: 'Argo CD ▸ app/api   Synced   Progressing   (2/6 pods updated)', delay: 500 },
        { kind: 'out', text: 'Argo CD ▸ app/api   Synced   Progressing   (5/6 pods updated)', delay: 500 },
        { kind: 'ok', text: 'Argo CD ▸ app/api   Synced   Healthy ✓' },
        { kind: 'cmd', text: 'kubectl get deploy api   # read-only' },
        { kind: 'out', text: 'NAME   READY   UP-TO-DATE   AVAILABLE   AGE' },
        { kind: 'out', text: 'api    6/6     6            6           212d' },
      ],
    });
    followDeploy(ship.querySelector<HTMLElement>('.gitops')!, deploy);

    const stackWrap = h(`<div class="y18-block y18-block--stack"></div>`);
    section.appendChild(stackWrap);
    createStack(stackWrap, [
      { cat: 'Frontend', prev: 'React + Redux', value: 'React Hooks / Next.js' },
      { cat: 'Language', prev: 'ES2015 + Babel', value: 'TypeScript' },
      { cat: 'CSS / UI', prev: 'Material UI / CSS Modules', value: 'styled-components / Tailwind' },
      { cat: 'Build', prev: 'webpack + Babel', value: 'webpack 4 + Babel' },
      { cat: 'Backend', prev: 'Node.js / Go / GraphQL', value: 'NestJS / GraphQL / Serverless' },
      { cat: 'Database', prev: 'PostgreSQL / DynamoDB', value: 'Aurora / Firestore' },
      { cat: 'Infra', prev: 'Docker / ECS / Lambda', value: 'Terraform + EKS / GKE' },
      { cat: 'Dev', prev: 'Atom / VS Code', value: 'VS Code + GitHub Actions' },
      { cat: 'AI', value: 'GPT-3' },
    ]);

    // ---- bridge: the cluster recedes, an edge globe rises ----
    const bridge = h(`
      <div class="y18-bridge">
        <canvas class="y18-bridge__globe" aria-hidden="true"></canvas>
        <p class="y18-bridge__txt">Closer to the user.<span>Servers moved right next to users.</span></p>
      </div>`);
    section.appendChild(bridge);
    createGlobe(bridge.querySelector('canvas')!, { dotColor: '170,185,230', accent: '140,160,255', requests: true });
  },
};

/**
 * The GitOps flow follows the terminal: the image was already built (app repo → Actions → registry),
 * the typed commands are the config repo change, then Argo CD syncs and the cluster turns healthy.
 */
function followDeploy(flow: HTMLElement, deploy: HTMLElement): void {
  const steps = Array.from(flow.children) as HTMLElement[];
  const log = deploy.querySelector<HTMLElement>('.deploy__log')!;
  const stageOf = (text: string): number => {
    if (/Healthy|kubectl get|READY|6\/6/.test(text)) return 5;
    if (text.startsWith('Argo CD')) return 4;
    return 3;
  };
  new MutationObserver(() => {
    const lines = Array.from(log.children);
    if (!lines.length) return;
    flow.classList.add('is-driven');
    const at = Math.max(...lines.map((l) => stageOf(l.textContent ?? '')));
    steps.forEach((s, i) => {
      s.classList.toggle('is-done', i < at);
      s.classList.toggle('is-on', i === at);
    });
  }).observe(log, { childList: true, subtree: true, characterData: true });
}
