import { reducedMotion } from '../../core/scroll';
import { esc, h, onceInView, sleep } from '../../core/util';

const FALLBACK = 'Sorry, I didn’t understand that. 🤖';

const RULES: { match: RegExp; reply: string }[] = [
  { match: /price|pricing|cost|plan/i, reply: 'Our plans start at $29/month. Would you like to see the pricing page?' },
  {
    match: /sales|demo|contact/i,
    reply: 'Great! Please leave your email and our team will get back to you within 1–2 business days.',
  },
  { match: /^(hi|hello|hey)/i, reply: 'Hello! 👋 Please choose one of the options below.' },
  { match: /human|person/i, reply: 'Our support team is available Mon–Fri, 9am–5pm (PST).' },
];

const QUICK = ['Pricing', 'Talk to sales', 'Something else'];

/** A 2019 SaaS landing page in a browser frame: mesh gradient, CSS Grid magazine, neumorphism, dark mode, chatbot. */
export function createLook(parent: HTMLElement): void {
  const el = h(`
    <div class="look">
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
            <span class="look__links"><a>Product</a><a>Pricing</a><a>Docs</a></span>
            <label class="look__toggle">
              <input type="checkbox" class="look__dark" />
              <span class="look__switch" aria-hidden="true"><i></i></span>
              <span class="look__toggle-label">Dark</span>
            </label>
          </nav>
          <header class="look__hero">
            <h4>Ship faster.<br/>Scale without thinking.</h4>
            <p>The cloud-native platform for modern teams.</p>
            <div class="look__ctas"><a class="look__cta">Start free trial</a><a class="look__cta is-ghost">Talk to sales →</a></div>
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
              <h5>Autoscaling</h5><p>From zero to millions.</p>
            </article>
            <article class="look__card"><h5>99.99%</h5><p>uptime SLA</p></article>
            <article class="look__card is-neu"><span class="look__knob" aria-hidden="true"></span><h5>Soft UI</h5><p>Neumorphism, 2020.</p></article>
            <article class="look__card is-wide"><h5>“We moved to Kubernetes in a weekend.”</h5><p>— a very optimistic CTO</p></article>
          </div>
          <div class="look__bot">
            <div class="bot__win" hidden>
              <div class="bot__head"><span class="bot__avatar">🤖</span><div><b>CloudlyBot</b><small>Typically replies instantly</small></div><button type="button" class="bot__x" aria-label="close">×</button></div>
              <div class="bot__log" aria-live="polite"></div>
              <div class="bot__quick"></div>
              <form class="bot__form"><input class="bot__input" placeholder="Type a message…" aria-label="message"/><button type="submit">➤</button></form>
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
    const t = document.createElement('div');
    t.className = 'bot__msg is-bot is-typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    logEl.appendChild(t);
    logEl.scrollTop = logEl.scrollHeight;
    await sleep(700);
    t.remove();
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
    const rule = text === 'Something else' ? null : RULES.find((r) => r.match.test(text));
    if (rule) {
      misses = 0;
      say('bot', rule.reply);
    } else {
      misses++;
      say('bot', misses >= 2 ? `${FALLBACK}\nWould you like to talk to a human?` : FALLBACK);
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
      say('bot', 'Hi there 👋 I’m CloudlyBot. How can I help you today?');
      setQuick(QUICK);
    }
  };
  // the visitor takes over as soon as they touch the widget
  let auto = true;
  launcher.addEventListener('click', () => {
    auto = false;
    toggle(win.hidden);
  });

  // like every 2019 SaaS site: the widget pops itself open, then a short scripted chat shows its limits
  onceInView(
    el,
    async () => {
      await sleep(reducedMotion ? 0 : 1400);
      if (!auto) return;
      await toggle(true);
      for (const msg of [
        'Pricing',
        'Can I migrate my Postgres to Aurora with zero downtime?',
        'Can I talk to a human?',
      ]) {
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
