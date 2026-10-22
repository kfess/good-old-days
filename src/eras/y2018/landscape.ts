import type { SimpleIcon } from 'simple-icons';
import {
  siAnsible,
  siApachekafka,
  siArgo,
  siCeph,
  siCilium,
  siCncf,
  siConsul,
  siContainerd,
  siDatadog,
  siDocker,
  siElasticsearch,
  siEnvoyproxy,
  siEtcd,
  siFalco,
  siFluentd,
  siGithubactions,
  siGitlab,
  siGrafana,
  siHarbor,
  siHelm,
  siIstio,
  siJaeger,
  siJenkins,
  siKibana,
  siLinkerd,
  siMinio,
  siMongodb,
  siNginx,
  siOpentelemetry,
  siPagerduty,
  siPodman,
  siPostgresql,
  siPrometheus,
  siPulumi,
  siRabbitmq,
  siRancher,
  siRedhatopenshift,
  siRook,
  siSentry,
  siSpinnaker,
  siTerraform,
  siVault,
  siVitess,
} from 'simple-icons';
import { logo } from '../../components/logo';
import { gsap, reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h } from '../../core/util';
import { k8sMark } from './k8s-logo';

// only marks that looked like this in 2018–2020 (Redis, New Relic and Traefik have been redrawn since)
const ICONS: SimpleIcon[] = [
  siDocker,
  siHelm,
  siPrometheus,
  siGrafana,
  siIstio,
  siArgo,
  siEnvoyproxy,
  siJaeger,
  siFluentd,
  siLinkerd,
  siEtcd,
  siContainerd,
  siCncf,
  siHarbor,
  siVitess,
  siRook,
  siOpentelemetry,
  siFalco,
  siCilium,
  siSpinnaker,
  siJenkins,
  siGitlab,
  siConsul,
  siVault,
  siPodman,
  siRancher,
  siRedhatopenshift,
  siMinio,
  siCeph,
  siElasticsearch,
  siKibana,
  siDatadog,
  siSentry,
  siPagerduty,
  siPostgresql,
  siMongodb,
  siApachekafka,
  siRabbitmq,
  siNginx,
  siTerraform,
  siPulumi,
  siAnsible,
  siGithubactions,
];

const YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: registry.example.com/web:1.4.2
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          # don't touch this. it works.
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: web
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 15
---
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: web
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - http:
        paths:
          - path: /
            backend:
              serviceName: web
              servicePort: 80
---
`;

const TILES = 360;

/** "YAML engineer" wall + the CNCF-landscape-style logo explosion, scrubbed by scroll. */
export function createLandscape(parent: HTMLElement): void {
  const cols = [0, 1, 2, 3, 4]
    .map((i) => `<pre class="yaml__col" style="--d:${48 + i * 9}s; --o:${-i * 7}s">${YAML}${YAML}</pre>`)
    .join('');

  const tiles: string[] = [`<span class="land__tile is-k8s">${k8sMark()}</span>`];
  for (let i = 1; i < TILES; i++) {
    const icon = i % 3 === 0 || i < 30 ? ICONS[i % ICONS.length] : null;
    tiles.push(`<span class="land__tile${icon ? '' : ' is-blank'}">${icon ? logo(icon, 'current') : '<i></i>'}</span>`);
  }

  const el = h(`
    <div class="land">
      <div class="land__sticky">
        <div class="yaml" aria-hidden="true">${cols}</div>
        <div class="land__grid" aria-hidden="true">${tiles.join('')}</div>
        <div class="land__copy">
          <p class="land__kicker">apiVersion: apps/v1</p>
          <h3 class="land__title"><span class="land__t1">YAML engineer.</span><span class="land__t2">The landscape.</span></h3>
          <p class="land__sub"><span class="land__s1">Somehow, half the job became writing YAML.</span><span class="land__s2">The cloud native map no longer fit on one screen.</span></p>
          <p class="land__count"><b>1</b> <span>projects &amp; products</span></p>
        </div>
      </div>
    </div>`);
  parent.appendChild(el);

  const grid = el.querySelector<HTMLElement>('.land__grid')!;
  const tileEls = Array.from(grid.children) as HTMLElement[];
  const countEl = el.querySelector<HTMLElement>('.land__count b')!;

  // only as many whole rows as fit between the HUD and the bottom edge: no clipped or ragged rows
  const swap = (a: HTMLElement, b: HTMLElement) => {
    const marker = document.createComment('');
    grid.replaceChild(marker, a);
    grid.replaceChild(a, b);
    grid.replaceChild(b, marker);
  };
  const fit = () => {
    // undo the last centring swap, so the k8s tile is first again and always survives the cut
    const first = grid.firstElementChild as HTMLElement;
    if (first !== tileEls[0]) swap(first, tileEls[0]);
    tileEls.forEach((t) => t.classList.remove('is-out'));
    const cs = getComputedStyle(grid);
    const size = parseFloat(cs.gridAutoRows);
    const gap = parseFloat(cs.rowGap);
    const w = grid.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const hgt = grid.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const cols = Math.max(1, Math.floor((w + gap) / (size + gap)));
    const rows = Math.max(1, Math.floor((hgt + gap) / (size + gap)));
    const keep = Math.min(Math.floor(TILES / cols), rows) * cols;
    (Array.from(grid.children) as HTMLElement[]).forEach((t, i) => t.classList.toggle('is-out', i >= keep));
  };

  // reveal order: outward from the Kubernetes tile in the center of the grid
  let order: HTMLElement[] = tileEls;
  const computeOrder = () => {
    fit();
    const g = grid.getBoundingClientRect();
    const cx = g.width / 2;
    const cy = g.height / 2;
    const k8s = tileEls[0];
    const dist = (t: HTMLElement) => {
      const r = t.getBoundingClientRect();
      return Math.hypot(r.left - g.left + r.width / 2 - cx, r.top - g.top + r.height / 2 - cy);
    };
    const live = tileEls.filter((t) => !t.classList.contains('is-out'));
    // swap the k8s tile into the most central cell so the explosion starts from it
    const center = live.reduce((a, b) => (dist(a) < dist(b) ? a : b));
    if (center !== k8s) swap(center, k8s);
    order = live.sort((a, b) => dist(a) - dist(b));
  };

  let shown = 0;
  const show = (p: number) => {
    const n = Math.max(1, Math.round(p ** 1.6 * order.length));
    if (n === shown) return;
    order.forEach((t, i) => t.classList.toggle('is-on', i < n));
    shown = n;
    const total = p < 0.08 ? 1 : Math.round(p ** 1.4 * 1000);
    countEl.textContent = p > 0.97 ? '1,000+' : total.toLocaleString('en-US');
    el.classList.toggle('is-phase2', p > 0.42);
  };

  if (reducedMotion) {
    computeOrder();
    show(1);
    return;
  }

  ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onRefresh: () => {
      computeOrder();
      shown = 0;
    },
    onUpdate: (self) => show(gsap.utils.clamp(0, 1, (self.progress - 0.18) / 0.72)),
  });
  computeOrder();
  show(0);
}
