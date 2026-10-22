import $ from 'jquery';
import { parodyBook } from '../../components/parody-book';
import { t } from '../../core/i18n';
import { reducedMotion, ScrollTrigger } from '../../core/scroll';
import { h } from '../../core/util';

const SLIDES = [
  { cls: 'w-scene--sky', title: 'Share your world.', sub: 'Photos, links and status updates — all in one place.' },
  { cls: 'w-scene--sunset', title: 'Follow your friends.', sub: 'Real-time updates, no refresh required.' },
  { cls: 'w-scene--night', title: 'Take it mobile.', sub: 'Now in your pocket, wherever you go.' },
];

const PHOTOS = ['Golden hour', 'Summer lake', 'Mountain trip', 'City lights', 'Forest walk', 'Desert road'];

const UPDATES = [
  ['kim', 'shared a photo in <a href="#">Summer lake</a>'],
  ['dev_dan', 'is trying out the new <a href="#">#html5</a> video tag'],
  ['lisa_k', 'just signed up for the private beta!'],
  ['marco', 'liked <a href="#">10 jQuery plugins you must see</a>'],
  ['ana', 'added 12 photos to <a href="#">Mountain trip</a>'],
  ['joe_web', 'is now following <a href="#">@kim</a>'],
];

const TAGS: [string, number][] = [
  ['ajax', 5],
  ['jquery', 5],
  ['web2.0', 4],
  ['html5', 4],
  ['css3', 3],
  ['mashup', 3],
  ['rss', 2],
  ['social', 3],
  ['beta', 2],
  ['rails', 2],
  ['widgets', 1],
  ['tagging', 2],
  ['folksonomy', 1],
  ['mobile', 3],
  ['cloud', 2],
  ['api', 1],
];

/** A loving recreation of a 2010 "Web 2.0" startup homepage, powered by real jQuery 1.12. */
export function buildShowcase(): HTMLElement {
  const el = h(`
    <div class="w-block w-show">
      <header class="w-sechead">
        <p class="w-kicker">Showcase · powered by real jQuery 1.x</p>
        <h3 class="w-h3">Add a plugin, and anything moved.</h3>
        <p class="w-lead">Sliders, Lightbox, accordions, Ajax. It all started with <code>$</code>.</p>
      </header>

      <div class="w-site">
        <div class="w-site__top">
          <div class="w-logo">Glossr<span class="w-beta"><span>beta</span></span></div>
          <nav class="w-nav" aria-label="demo navigation"><a href="#" class="is-on">Home</a><a href="#">Explore</a><a href="#">Blog</a><a href="#">About</a></nav>
          <a href="#" class="w-gbtn w-gbtn--green">Sign up — it's free!</a>
        </div>

        <div class="w-slider" aria-roledescription="carousel">
          <div class="w-slider__stage w-scene ${SLIDES[0].cls}"></div>
          <div class="w-slider__cap"><b>${SLIDES[0].title}</b><span>${SLIDES[0].sub}</span></div>
          <button type="button" class="w-slider__arrow w-slider__arrow--prev" aria-label="previous slide">‹</button>
          <button type="button" class="w-slider__arrow w-slider__arrow--next" aria-label="next slide">›</button>
          <div class="w-slider__dots">${SLIDES.map((_, i) => `<button type="button" aria-label="slide ${i + 1}" class="${i ? '' : 'is-on'}"></button>`).join('')}</div>
        </div>

        <div class="w-cols">
          <div class="w-col w-box">
            <ul class="w-tabs" role="tablist">
              <li class="is-on"><a href="#w-tab-1">Features</a></li>
              <li><a href="#w-tab-2">Pricing</a></li>
              <li><a href="#w-tab-3">FAQ</a></li>
            </ul>
            <div class="w-tabpanes">
              <div class="w-pane" id="w-tab-1">
                <ul class="w-checks">
                  <li>Unlimited photo uploads</li><li>RSS feeds for everything</li><li>Ajax-powered, no page reloads</li><li>Open API for mashups</li>
                </ul>
              </div>
              <div class="w-pane" id="w-tab-2" hidden>
                <div class="w-plans">
                  <div class="w-plan"><b>Free</b><span class="w-price">$0</span><small>forever</small></div>
                  <div class="w-plan w-plan--pro"><b>Pro</b><span class="w-price">$9</span><small>per month</small></div>
                </div>
              </div>
              <div class="w-pane" id="w-tab-3" hidden>
                <dl class="w-faq">
                  <dt>Is it really free?</dt><dd>Yes! Pro just gives you more space.</dd>
                  <dt>What is “Web 2.0”?</dt><dd>You, sharing things. With rounded corners.</dd>
                  <dt>Does it work on my phone?</dt><dd>There's an app for that.</dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="w-col w-box">
            <h4 class="w-boxtitle">Recent photos</h4>
            <div class="w-thumbs">
              ${PHOTOS.map((t, i) => `<a href="#" class="w-thumb" data-i="${i}" title="${t}"><span class="w-scene w-photo--${i}"></span></a>`).join('')}
            </div>
            <p class="w-hint">click a photo → Lightbox</p>
          </div>

          <div class="w-col w-box">
            <h4 class="w-boxtitle">Latest updates</h4>
            <ul class="w-updates"></ul>
            <button type="button" class="w-gbtn w-gbtn--blue w-more">Load more</button>
            <h4 class="w-boxtitle w-boxtitle--tags">Tags</h4>
            <p class="w-tags">${TAGS.map(([t, s]) => `<a href="#" class="w-tag w-tag--${s}">${t}</a>`).join(' ')}</p>
            <h4 class="w-boxtitle w-boxtitle--tags">Recommended reading</h4>
            <div class="w-read">
              ${parodyBook({
                title: 'Copying and Pasting from Stack Overflow',
                subtitle: 'Cutting corners to meet arbitrary management deadlines',
                band: '#b0193f',
                animal: 'goat',
              })}
              <small>Every developer’s real manual.<br />The meme came later (2016). The habit didn’t.</small>
            </div>
          </div>
        </div>
        <div class="w-site__foot">© 2010 Glossr Inc. · <a href="#">Blog</a> · <a href="#">API</a> · <a href="#">Jobs</a> · Valid XHTML 1.0 Strict</div>
      </div>

      <div class="w-code">
        <div class="w-code__bar"><a href="#">view plain</a><a href="#">copy to clipboard</a><a href="#">print</a><a href="#">?</a></div>
        <ol>
          <li><code><b>$</b>(document).<i>ready</i>(<em>function</em>(){</code></li>
          <li><code>  <b>$</b>(<s>'#slider'</s>).<i>nivoSlider</i>();</code></li>
          <li><code>  <b>$</b>(<s>'a[rel=lightbox]'</s>).<i>lightBox</i>();</code></li>
          <li><code>  <b>$</b>(<s>'.faq dt'</s>).<i>click</i>(<em>function</em>(){</code></li>
          <li><code>    <b>$</b>(<em>this</em>).<i>next</i>().<i>slideToggle</i>(<s>'fast'</s>);</code></li>
          <li><code>  });</code></li>
          <li><code>});</code></li>
          <li><code></code></li>
          <li><code><b>$</b>(document).<i>ready</i>(<em>function</em>(){</code></li>
          <li><code>  <u>${t("// don't touch this. it works.", '// ここ触るな。なぜか動いてる。')}</u></code></li>
          <li><code>  setTimeout(<em>function</em>(){</code></li>
          <li><code>    <b>$</b>(<s>'#tabs'</s>).<i>tabs</i>();</code></li>
          <li><code>  }, 0);</code></li>
          <li><code>});</code></li>
        </ol>
      </div>

      <div class="w-lb" hidden>
        <div class="w-lb__overlay"></div>
        <div class="w-lb__box">
          <div class="w-lb__img w-scene"></div>
          <div class="w-lb__loading"><span class="w-spinner"></span></div>
          <div class="w-lb__meta"><span class="w-lb__title"></span><span class="w-lb__count"></span><button type="button" class="w-lb__close" aria-label="close">×</button></div>
          <button type="button" class="w-lb__nav w-lb__nav--prev" aria-label="previous photo">‹ Prev</button>
          <button type="button" class="w-lb__nav w-lb__nav--next" aria-label="next photo">Next ›</button>
        </div>
      </div>
    </div>`);

  // h() builds inside a <template>; jQuery's show/hide needs a node owned by the live document
  document.adoptNode(el);

  // dead demo links stay put
  $(el).on('click', 'a[href="#"]', (e) => e.preventDefault());

  setupSlider(el);
  setupTabs(el);
  setupLightbox(el);
  setupUpdates(el);
  return el;
}

/* ---------- Nivo-style slider: "sliceDown" transition ---------- */
function setupSlider(el: HTMLElement): void {
  const $slider = $(el).find('.w-slider');
  const $stage = $slider.find('.w-slider__stage');
  const $cap = $slider.find('.w-slider__cap');
  const $dots = $slider.find('.w-slider__dots button');
  const SLICES = 12;
  let current = 0;
  let animating = false;
  let timer = 0;

  const go = (next: number) => {
    if (animating || next === current) return;
    animating = true;
    next = (next + SLIDES.length) % SLIDES.length;
    const w = $slider.width()!;
    const hgt = $slider.height()!;
    const sw = Math.ceil(w / SLICES);
    const scene = SLIDES[next].cls;
    $cap.stop(true).animate({ opacity: 0 }, 250);
    for (let i = 0; i < SLICES; i++) {
      // each slice is a window onto a full-size copy of the next scene
      $(`<div class="w-slice"><div class="w-scene ${scene}"></div></div>`)
        .css({ left: i * sw, width: sw, height: 0, opacity: 0 })
        .find('.w-scene')
        .css({ left: -i * sw, width: w, height: hgt })
        .end()
        .appendTo($slider)
        .delay(reducedMotion ? 0 : i * 55)
        .animate({ height: hgt, opacity: 1 }, reducedMotion ? 0 : 420, function (this: HTMLElement) {
          if (i !== SLICES - 1) return;
          $stage.attr('class', `w-slider__stage w-scene ${scene}`);
          $slider.find('.w-slice').remove();
          $cap.html(`<b>${SLIDES[next].title}</b><span>${SLIDES[next].sub}</span>`).animate({ opacity: 1 }, 300);
          current = next;
          $dots.removeClass('is-on').eq(next).addClass('is-on');
          animating = false;
        });
    }
  };

  const restart = () => {
    window.clearInterval(timer);
    if (!reducedMotion) timer = window.setInterval(() => go(current + 1), 4200);
  };

  $slider.find('.w-slider__arrow--prev').on('click', () => {
    go(current - 1);
    restart();
  });
  $slider.find('.w-slider__arrow--next').on('click', () => {
    go(current + 1);
    restart();
  });
  $dots.on('click', function (this: HTMLElement) {
    go($dots.index(this));
    restart();
  });
  ScrollTrigger.create({
    trigger: $slider[0],
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? restart() : window.clearInterval(timer)),
  });
}

/* ---------- jQuery UI-style tabs + slideToggle accordion ---------- */
function setupTabs(el: HTMLElement): void {
  const $box = $(el).find('.w-tabs').parent();
  $box.find('.w-tabs a').on('click', function (this: HTMLElement, e) {
    e.preventDefault();
    const $li = $(this).parent();
    if ($li.hasClass('is-on')) return;
    $li.addClass('is-on').siblings().removeClass('is-on');
    const target = $(this).attr('href')!;
    $box.find('.w-pane:visible').hide();
    $box.find(target).removeAttr('hidden').hide().fadeIn(300);
  });
  const $faq = $box.find('.w-faq');
  $faq.find('dd').hide().first().show();
  $faq.find('dt').first().addClass('is-open');
  $faq.find('dt').on('click', function (this: HTMLElement) {
    const $dt = $(this);
    $faq.find('dd').not($dt.next()).slideUp('fast');
    $faq.find('dt').not($dt).removeClass('is-open');
    $dt.toggleClass('is-open').next().slideToggle('fast');
  });
}

/* ---------- Lightbox: overlay fades, the box grows, the image fades in ---------- */
function setupLightbox(el: HTMLElement): void {
  const $lb = $(el).find('.w-lb');
  const $overlay = $lb.find('.w-lb__overlay');
  const $box = $lb.find('.w-lb__box');
  const $img = $lb.find('.w-lb__img');
  const $meta = $lb.find('.w-lb__meta');
  const $loading = $lb.find('.w-lb__loading');
  let index = 0;

  const size = () => {
    const w = Math.min(640, window.innerWidth - 40);
    return { w, h: Math.round(w * 0.66) };
  };

  const show = (i: number) => {
    index = (i + PHOTOS.length) % PHOTOS.length;
    const { w, h: hh } = size();
    $img.stop(true).hide().attr('class', `w-lb__img w-scene w-photo--${index}`);
    $meta.hide();
    $loading.show();
    const bw = w + 20;
    const bh = hh + 56;
    $box
      .stop(true)
      .animate({ width: bw, height: bh, marginLeft: -bw / 2, marginTop: -bh / 2 }, reducedMotion ? 0 : 400, () => {
        window.setTimeout(
          () => {
            $loading.hide();
            $img.fadeIn(reducedMotion ? 0 : 350);
            $lb.find('.w-lb__title').text(PHOTOS[index]);
            $lb.find('.w-lb__count').text(`Image ${index + 1} of ${PHOTOS.length}`);
            $meta.slideDown('fast');
          },
          reducedMotion ? 0 : 350,
        );
      });
  };

  const open = (i: number) => {
    $lb.removeAttr('hidden');
    $box.css({ width: 140, height: 140, marginLeft: -70, marginTop: -70 });
    $overlay.css('opacity', 0).animate({ opacity: 0.8 }, reducedMotion ? 0 : 300);
    $box.show();
    show(i);
  };

  const close = () => {
    $box.fadeOut(200);
    $overlay.animate({ opacity: 0 }, 300, () => $lb.attr('hidden', ''));
  };

  $(el)
    .find('.w-thumb')
    .on('click', function (this: HTMLElement, e) {
      e.preventDefault();
      open(Number($(this).data('i')));
    });
  $overlay.on('click', close);
  $lb.find('.w-lb__close').on('click', close);
  $lb.find('.w-lb__nav--prev').on('click', () => show(index - 1));
  $lb.find('.w-lb__nav--next').on('click', () => show(index + 1));
  $(document).on('keydown', (e) => {
    if ($lb.attr('hidden') !== undefined) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
}

/* ---------- "Load more" with the classic ajaxload spinner ---------- */
function setupUpdates(el: HTMLElement): void {
  const $list = $(el).find('.w-updates');
  const $more = $(el).find('.w-more');
  let shown = 0;

  // newest first: each older update is a few minutes further back
  const item = ([user, text]: string[], i: number) =>
    $(
      `<li><span class="w-avatar w-avatar--${user.length % 4}">${user[0].toUpperCase()}</span><p><a href="#">@${user}</a> ${text}<small>${2 + i * 7 + (user.length % 4)} minutes ago</small></p></li>`,
    );

  // stand-in for $.ajax({ url: '/updates.json' }) — same Deferred API, no network
  const fetchUpdates = (from: number) => {
    const d = $.Deferred<string[][]>();
    window.setTimeout(() => d.resolve(UPDATES.slice(from, from + 3)), reducedMotion ? 0 : 1300);
    return d.promise();
  };

  UPDATES.slice(0, 3).forEach((u, i) => $list.append(item(u, i)));
  shown = 3;

  $more.on('click', () => {
    if (shown >= UPDATES.length) return;
    const $spin = $('<li class="w-loading"><span class="w-spinner"></span> Loading...</li>')
      .appendTo($list)
      .hide()
      .fadeIn(150);
    $more.prop('disabled', true);
    fetchUpdates(shown).done((rows = []) => {
      $spin.remove();
      rows.forEach((u, i) =>
        item(u, shown + i)
          .appendTo($list)
          .hide()
          .delay(i * 120)
          .fadeIn(400),
      );
      shown += rows.length;
      $more.prop('disabled', shown >= UPDATES.length).text(shown >= UPDATES.length ? 'No more updates' : 'Load more');
    });
  });
}
