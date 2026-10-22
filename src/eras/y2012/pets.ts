import { Flip } from 'gsap/Flip';
import { gsap, reducedMotion } from '../../core/scroll';
import { h, onceInView } from '../../core/util';
import { FLAT, server } from './art';

gsap.registerPlugin(Flip);

const PETS = ['zeus', 'athena', 'apollo'];
const RECIPE = `# cookbooks/web/recipes/default.rb
package 'nginx'

service 'nginx' do
  action [:enable, :start]
end

template '/etc/nginx/sites-enabled/app' do
  source 'app.conf.erb'
  notifies :reload, 'service[nginx]'
end`;

const pad = (n: number) => `web-${String(n).padStart(3, '0')}`;

/**
 * "Pets vs Cattle": three hand-raised servers with names become twelve numbered,
 * identical, replaceable ones. Click a head of cattle to terminate it — a new one takes its place.
 */
function mountHerd(parent: HTMLElement): void {
  const el = h(`
    <div class="y12-herd is-pets">
      <div class="y12-herd__copy">
        <p class="y12-herd__label"><span class="pets">Pets</span><span class="vs">→</span><span class="cattle">Cattle</span></p>
        <p class="y12-herd__line y12-herd__line--pets">Named them. Raised them by hand.<small>uptime 847 days · don’t touch zeus</small></p>
        <p class="y12-herd__line y12-herd__line--cattle">Numbered them. Replaced them when they broke.<small>click a server to terminate it</small></p>
        <button type="button" class="y12-btn y12-herd__go">knife ec2 server create ×12</button>
        <div class="y12-herd__stats"><span>replaced <b class="y12-herd__count">0</b></span><span>avg. recovery <b>42s</b></span></div>
      </div>
      <div class="y12-herd__grid">
        ${PETS.map((n) => `<div class="y12-srv is-pet" data-flip-id="${n}"><span class="y12-srv__heart">♥</span>${server()}<span class="y12-srv__tag">${n}</span></div>`).join('')}
      </div>
    </div>`);
  parent.appendChild(el);

  const grid = el.querySelector<HTMLElement>('.y12-herd__grid')!;
  const go = el.querySelector<HTMLButtonElement>('.y12-herd__go')!;
  const count = el.querySelector<HTMLElement>('.y12-herd__count')!;
  let cattle = false;
  let replaced = 0;

  function toCattle(): void {
    if (cattle) return;
    cattle = true;
    go.disabled = true;
    const state = Flip.getState(grid.querySelectorAll('.y12-srv'));
    el.classList.remove('is-pets');
    el.classList.add('is-cattle');
    grid.querySelectorAll<HTMLElement>('.y12-srv').forEach((s, i) => {
      s.classList.remove('is-pet');
      s.querySelector('.y12-srv__tag')!.textContent = pad(i + 1);
    });
    for (let i = PETS.length; i < 12; i++) {
      grid.insertAdjacentHTML(
        'beforeend',
        `<button type="button" class="y12-srv" data-flip-id="c${i}">${server(FLAT.concrete)}<span class="y12-srv__tag">${pad(i + 1)}</span></button>`,
      );
    }
    // the original pets turn grey and become buttons like the rest of the herd
    grid.querySelectorAll<HTMLElement>('.y12-srv').forEach((s) => {
      s.querySelector('.srv rect')!.setAttribute('fill', FLAT.concrete);
      s.setAttribute('role', 'button');
      s.tabIndex = 0;
    });
    Flip.from(state, {
      duration: reducedMotion ? 0 : 0.9,
      ease: 'power3.inOut',
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.04, delay: 0.4 },
        ),
    });
  }

  go.addEventListener('click', toCattle);
  grid.addEventListener('click', (e) => {
    const s = (e.target as HTMLElement).closest<HTMLElement>('.y12-srv');
    if (!cattle || !s || s.classList.contains('is-dying')) return;
    s.classList.add('is-dying');
    replaced++;
    count.textContent = String(replaced);
    setTimeout(
      () => {
        s.classList.remove('is-dying');
        s.classList.add('is-new');
        setTimeout(() => s.classList.remove('is-new'), 900);
      },
      reducedMotion ? 0 : 700,
    );
  });

  if (!reducedMotion) onceInView(el, () => setTimeout(toCattle, 1600), 'top 45%');
}

export function mountPets(parent: HTMLElement): void {
  const el = h(`
    <section class="y12-panel y12-pets">
      <header class="y12-head">
        <p class="y12-kicker">Infrastructure as Code</p>
        <h3 class="y12-title">Servers were pets.<br>Then they became cattle.</h3>
        <p class="y12-jp">The same environment locally with Vagrant, on dozens of servers with Chef.</p>
      </header>
      <div class="y12-pets__grid">
        <div class="y12-pets__herd"></div>
        <div class="y12-pets__recipe"><div class="y12-file">recipes/default.rb</div><pre><code></code></pre></div>
      </div>
    </section>`);
  parent.appendChild(el);
  el.querySelector('.y12-pets__recipe code')!.textContent = RECIPE;
  mountHerd(el.querySelector('.y12-pets__herd')!);
}
