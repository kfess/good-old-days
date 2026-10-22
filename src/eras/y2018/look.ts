import { t } from '../../core/i18n';
import { reducedMotion } from '../../core/scroll';
import { esc, h, onceInView, sleep } from '../../core/util';

const FALLBACK = t('Sorry, I didn’t understand that. 🤖', '申し訳ございません。よくわかりませんでした🤖');
const HANDOFF = t('Would you like to talk to a human?', '有人チャットに切り替えますか？');

const RULES: { match: RegExp; reply: string }[] = t(
  [
    {
      match: /price|pricing|cost|plan/i,
      reply: 'Our plans start at $29/month. Would you like to see the pricing page?',
    },
    {
      match: /sales|demo|contact/i,
      reply: 'Great! Please leave your email and our team will get back to you within 1–2 business days.',
    },
    { match: /^(hi|hello|hey)/i, reply: 'Hello! 👋 Please choose one of the options below.' },
    { match: /human|person/i, reply: 'Our support team is available Mon–Fri, 9am–5pm (PST).' },
  ],
  // the same bot, as a Japanese SaaS would have scripted it
  [
    {
      match: /料金|価格|プラン/,
      reply: '料金プランは月額3,980円からご用意しております。料金ページをご覧になりますか？',
    },
    {
      match: /営業|デモ|問い合わせ|相談/,
      reply: 'ありがとうございます！メールアドレスをご入力いただければ、担当者より1〜2営業日以内にご連絡いたします。',
    },
    { match: /^(こんにちは|はじめまして|どうも)/, reply: 'こんにちは！👋 以下のメニューからお選びください。' },
    {
      match: /人と話|人間|オペレーター|有人/,
      reply: 'オペレーター対応時間は平日10:00〜18:00（土日祝・年末年始を除く）です。',
    },
  ],
);

const QUICK = t(['Pricing', 'Talk to sales', 'Something else'], ['料金について', '営業担当と話したい', 'その他']);
/** the "Something else" chip: never matches a rule, whatever the language */
const OTHER = QUICK[2];

/** A 2019 SaaS landing page in a browser frame: mesh gradient, CSS Grid magazine, neumorphism, dark mode, chatbot. */
export function createLook(parent: HTMLElement): void {
  const el = h(`
    <div class="look" data-hud-year="2019">
      <div class="look__copy">
        <p class="look__kicker">The look of 2019</p>
        <h3 class="look__title">Dark mode, blobs, and a chatbot.</h3>
        <p class="look__sub">A dark mode toggle, a slanted gradient, and a chatbot in the corner.</p>
      </div>
      <div class="look__browser">
        <div class="look__chrome"><i></i><i></i><i></i><span>https://cloudly.example</span></div>
        <div class="look__page">
          <div class="look__mesh" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <nav class="look__nav">
            <b class="look__brand">◆ cloudly</b>
            <span class="look__links">${t('<a>Product</a><a>Pricing</a><a>Docs</a>', '<a>プロダクト</a><a>料金</a><a>ドキュメント</a>')}</span>
            <label class="look__toggle">
              <input type="checkbox" class="look__dark" />
              <span class="look__switch" aria-hidden="true"><i></i></span>
              <span class="look__toggle-label">${t('Dark', 'ダーク')}</span>
            </label>
          </nav>
          <header class="look__hero">
            <h4>Ship faster.<br/>Scale without thinking.</h4>
            <p>${t('The cloud-native platform for modern teams.', 'モダンなチームのための、クラウドネイティブ・プラットフォーム。')}</p>
            <div class="look__ctas"><a class="look__cta">${t('Start free trial', '無料で試す')}</a><a class="look__cta is-ghost">${t('Talk to sales →', '営業に問い合わせる →')}</a></div>
          </header>
          <div class="look__grid">
            <article class="look__card is-feature">
              <svg viewBox="0 0 200 120" aria-hidden="true">
                <circle cx="150" cy="40" r="26" fill="#ffb4a2"/>
                <rect x="20" y="70" width="160" height="34" rx="17" fill="#7c5cff" opacity=".25"/>
                <path d="M60 104 q8 -50 26 -54 q20 4 22 54 z" fill="#7c5cff"/>
                <circle cx="86" cy="40" r="11" fill="#5b3a29"/>
                <path d="M90 64 q30 -10 48 -26" stroke="#7c5cff" stroke-width="9" stroke-linecap="round" fill="none"/>
                <path d="M118 104 q4 -30 30 -30 q22 6 18 30 z" fill="#ff7a59"/>
              </svg>
              <h5>${t('Autoscaling', 'オートスケール')}</h5><p>${t('From zero to millions.', 'ゼロから数百万まで。')}</p>
            </article>
            <article class="look__card"><h5>99.99%</h5><p>${t('uptime SLA', '稼働率SLA')}</p></article>
            <article class="look__card is-neu"><span class="look__knob" aria-hidden="true"></span><h5>Soft UI</h5><p>${t('Neumorphism, 2020.', 'ニューモーフィズム、2020年。')}</p></article>
            <article class="look__card is-wide"><h5>${t('“We moved to Kubernetes in a weekend.”', '「週末でKubernetesに移行しました」')}</h5><p>${t('— a very optimistic CTO', '— ちょっと楽観的なCTO')}</p></article>
          </div>
          <div class="look__bot">
            <div class="bot__win" hidden>
              <div class="bot__head"><span class="bot__avatar">🤖</span><div><b>CloudlyBot</b><small>${t('Typically replies instantly', '通常すぐに返信します')}</small></div><button type="button" class="bot__x" aria-label="close">×</button></div>
              <div class="bot__log" aria-live="polite"></div>
              <div class="bot__quick"></div>
              <form class="bot__form"><input class="bot__input" placeholder="${t('Type a message…', 'メッセージを入力…')}" aria-label="message"/><button type="submit">➤</button></form>
            </div>
            <button type="button" class="bot__launcher" aria-label="Open chat">💬<span class="bot__badge">1</span></button>
          </div>
        </div>
      </div>
      <p class="look__note">Chatbots still only had scripted answers.</p>
    </div>`);
  parent.appendChild(el);

  const page = el.querySelector<HTMLElement>('.look__page')!;
  el.querySelector<HTMLInputElement>('.look__dark')!.addEventListener('change', (e) => {
    page.classList.toggle('is-dark', (e.target as HTMLInputElement).checked);
  });

  // ---- rule-based chatbot ----
  const win = el.querySelector<HTMLElement>('.bot__win')!;
  const logEl = el.querySelector<HTMLElement>('.bot__log')!;
  const quick = el.querySelector<HTMLElement>('.bot__quick')!;
  const form = el.querySelector<HTMLFormElement>('.bot__form')!;
  const input = el.querySelector<HTMLInputElement>('.bot__input')!;
  const launcher = el.querySelector<HTMLButtonElement>('.bot__launcher')!;
  let misses = 0;
  let greeted = false;

  const say = (who: 'bot' | 'me', text: string) => {
    const b = document.createElement('div');
    b.className = `bot__msg is-${who}`;
    b.innerHTML = esc(text).replace(/\n/g, '<br>');
    logEl.appendChild(b);
    logEl.scrollTop = logEl.scrollHeight;
  };
  const typing = async () => {
    const dots = document.createElement('div');
    dots.className = 'bot__msg is-bot is-typing';
    dots.innerHTML = '<i></i><i></i><i></i>';
    logEl.appendChild(dots);
    logEl.scrollTop = logEl.scrollHeight;
    await sleep(700);
    dots.remove();
  };
  const setQuick = (opts: string[]) => {
    quick.innerHTML = opts.map((o) => `<button type="button">${esc(o)}</button>`).join('');
    // the chips change the log's height: keep the latest message in view
    requestAnimationFrame(() => (logEl.scrollTop = logEl.scrollHeight));
  };
  const answer = async (text: string) => {
    say('me', text);
    setQuick([]);
    await typing();
    const rule = text === OTHER ? null : RULES.find((r) => r.match.test(text));
    if (rule) {
      misses = 0;
      say('bot', rule.reply);
    } else {
      misses++;
      say('bot', misses >= 2 ? `${FALLBACK}\n${HANDOFF}` : FALLBACK);
    }
    setQuick(QUICK);
  };

  const toggle = async (show: boolean) => {
    win.hidden = !show;
    launcher.classList.toggle('is-open', show);
    launcher.querySelector('.bot__badge')?.remove();
    if (show && !greeted) {
      greeted = true;
      await typing();
      say(
        'bot',
        t(
          'Hi there 👋 I’m CloudlyBot. How can I help you today?',
          'こんにちは👋 CloudlyBotです。本日はどのようなご用件でしょうか？',
        ),
      );
      setQuick(QUICK);
    }
  };
  // the visitor takes over as soon as they touch the widget
  let auto = true;
  launcher.addEventListener('click', () => {
    auto = false;
    // hidden is typed boolean | 'until-found'; toggle() only ever sets a boolean
    toggle(win.hidden !== false);
  });

  // like every 2019 SaaS site: the widget pops itself open, then a short scripted chat shows its limits
  onceInView(
    el,
    async () => {
      await sleep(reducedMotion ? 0 : 1400);
      if (!auto) return;
      await toggle(true);
      for (const msg of t(
        ['Pricing', 'Can I migrate my Postgres to Aurora with zero downtime?', 'Can I talk to a human?'],
        ['料金について', 'PostgresからAuroraにダウンタイムなしで移行できますか？', '人と話せますか？'],
      )) {
        await sleep(reducedMotion ? 0 : 1600);
        if (!auto) return;
        await answer(msg);
      }
    },
    'top 45%',
  );
  el.querySelector('.bot__x')!.addEventListener('click', () => {
    auto = false;
    toggle(false);
  });
  quick.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    auto = false;
    answer(b.textContent ?? '');
  });
  input.addEventListener('focus', () => (auto = false));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    auto = false;
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    answer(v);
  });
}
