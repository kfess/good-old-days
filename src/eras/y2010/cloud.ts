import $ from 'jquery';
import { t } from '../../core/i18n';
import { reducedMotion } from '../../core/scroll';
import { h } from '../../core/util';

// all 32-bit: in 2010 the m1.small and c1.medium types only ran 32-bit AMIs
const AMIS = [
  { id: 'ami-1a2b3c4d', name: 'Ubuntu 10.04 LTS (Lucid Lynx)', arch: '32-bit', store: 'EBS' },
  { id: 'ami-7f418316', name: 'Basic 32-bit Amazon Linux AMI 2010.11.1 Beta', arch: '32-bit', store: 'EBS' },
  { id: 'ami-48aa4921', name: 'Fedora 8 (Basic)', arch: '32-bit', store: 'instance store' },
];

/** Renting servers by the hour: an instance launch wizard next to the LAMP stack. */
export function buildCloud(): HTMLElement {
  const el = h(`
    <div class="w-block w-cloud" data-hud-year="2011">
      <header class="w-sechead">
        <p class="w-kicker">Infra · 2011</p>
        <h3 class="w-h3">Servers became something you rent by the hour.</h3>
        <p class="w-lead">m1.small, $0.085 an hour. Three of them in one click.</p>
      </header>
      <div class="w-cloud__grid">
        <div class="w-wizard">
          <div class="w-wizard__title">Request Instances Wizard<button type="button" class="w-wizard__x" aria-label="close" tabindex="-1">×</button></div>
          <ol class="w-steps"><li class="is-on">Choose an AMI</li><li>Instance Details</li><li>Key Pair</li><li>Firewall</li><li>Review</li></ol>
          <div class="w-wizard__body">
            <table class="w-amis">
              <tbody>
                ${AMIS.map((a, i) => `<tr class="${i ? '' : 'is-sel'}"><td><input type="radio" name="w-ami" ${i ? '' : 'checked'} aria-label="${a.name}"></td><td><b>${a.name}</b><br><small>${a.id} · ${a.arch} · ${a.store}</small></td></tr>`).join('')}
              </tbody>
            </table>
            <div class="w-wizard__row">
              <label>Instance type
                <select class="w-type"><option>m1.small (1.7 GB, 1 ECU)</option><option>c1.medium (1.7 GB, 5 ECU)</option></select>
              </label>
              <label>Count <input class="w-count" type="number" value="3" min="1" max="5"></label>
              <button type="button" class="w-gbtn w-gbtn--orange w-launch">Launch</button>
            </div>
          </div>
          <table class="w-instances">
            <thead><tr><th>Instance</th><th>Type</th><th>State</th><th>Public DNS</th></tr></thead>
            <tbody><tr class="w-noinst"><td colspan="4">You have no running instances.</td></tr></tbody>
          </table>
        </div>
        <figure class="w-lamp" aria-label="LAMP stack">
          <div class="w-lamp__layer w-lamp__layer--p"><b>P</b><span>PHP / Perl / Python</span></div>
          <div class="w-lamp__layer w-lamp__layer--m"><b>M</b><span>MySQL</span></div>
          <div class="w-lamp__layer w-lamp__layer--a"><b>A</b><span>Apache 2.2</span></div>
          <div class="w-lamp__layer w-lamp__layer--l"><b>L</b><span>Linux</span></div>
          <figcaption>${t('The LAMP stack — on a credit card, by the hour.', 'LAMP スタックを、クレジットカードで時間貸し。')}</figcaption>
        </figure>
      </div>
    </div>`);

  document.adoptNode(el);
  const $el = $(el);
  $el.find('.w-amis tr').on('click', function (this: HTMLElement) {
    $(this).addClass('is-sel').siblings().removeClass('is-sel');
    $(this).find('input').prop('checked', true);
  });

  let launched = 0;
  $el.find('.w-launch').on('click', function (this: HTMLButtonElement) {
    const count = Math.max(1, Math.min(5, Number($el.find('.w-count').val()) || 1));
    const type = String($el.find('.w-type').val()).split(' ')[0];
    $el.find('.w-noinst').remove();
    $el.find('.w-steps li').removeClass('is-on').last().addClass('is-on');
    for (let i = 0; i < count; i++) {
      launched++;
      const id = `i-${(0x3f2a91c4 + launched * 0x1d3b).toString(16).slice(-8)}`;
      const ip = `ec2-174-129-${((20 + launched * 7) % 254) + 1}-${((100 + launched * 13) % 254) + 1}.compute-1.amazonaws.com`;
      const $row = $(
        `<tr><td><code>${id}</code></td><td>${type}</td><td><span class="w-state w-state--pending">pending</span></td><td class="w-dns">—</td></tr>`,
      );
      $row.appendTo($el.find('.w-instances tbody')).hide().fadeIn(300);
      window.setTimeout(
        () => {
          $row.find('.w-state').removeClass('w-state--pending').addClass('w-state--running').text('running');
          $row.find('.w-dns').text(ip).hide().fadeIn(300);
        },
        reducedMotion ? 0 : 1400 + i * 650,
      );
    }
  });
  return el;
}
