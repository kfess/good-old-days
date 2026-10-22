import { t } from '../core/i18n';
import { reducedMotion } from '../core/scroll';
import { esc, h, onceInView, typeInto } from '../core/util';

/** The same small task — hide the menu — written the way each era wrote it. */
export const THREAD: Record<string, { how: string; code: string }> = {
  prologue: { how: 'DHTML', code: "document.all.menu.style.display = 'none';" },
  y2010: { how: 'jQuery', code: "$('#menu').slideUp('fast');" },
  y2012: { how: 'AngularJS', code: '<nav ng-hide="menu.hidden">' },
  y2015: { how: 'React', code: 'this.setState({ menuOpen: false });' },
  y2018: { how: 'Hooks + TypeScript', code: 'const [open, setOpen] = useState<boolean>(false);' },
  y2021: { how: 'Tailwind', code: "<nav className={open ? 'block' : 'hidden md:block'}>" },
  y2023: {
    how: 'ChatGPT',
    code: t('› How do I hide the menu on mobile?', '› スマホでメニュー隠すにはどうすればいい？'),
  },
  y2025: { how: 'Claude Code', code: t('$ claude "hide the menu on mobile"', '$ claude "スマホではメニュー隠して"') },
};

const ORDER = Object.keys(THREAD);

/**
 * Shown as a one-line diff: the previous era's way is struck out, then this era's way is typed in.
 */
export function createThread(parent: HTMLElement, eraId: string): HTMLElement {
  const cur = THREAD[eraId];
  const prevId = ORDER[ORDER.indexOf(eraId) - 1];
  const prev = prevId ? THREAD[prevId] : undefined;

  const el = h(`
    <div class="thread">
      <p class="thread__title">Hide the menu. <span>The ${esc(cur.how)} way.</span></p>
      <div class="thread__diff">
        ${
          prev
            ? `<div class="thread__line thread__line--del"><span class="thread__sign">−</span><code class="thread__src">${esc(prev.code)}</code><em>${esc(prev.how)}</em></div>`
            : ''
        }
        <div class="thread__line thread__line--add"><span class="thread__sign">+</span><code class="thread__src"><span class="thread__typed"></span><i class="thread__caret"></i></code><em>${esc(cur.how)}</em></div>
      </div>
    </div>`);
  parent.appendChild(el);

  const typed = el.querySelector<HTMLElement>('.thread__typed')!;
  if (reducedMotion) {
    typed.textContent = cur.code;
    el.classList.add('is-struck', 'is-done');
    return el;
  }
  onceInView(
    el,
    async () => {
      el.classList.add('is-struck');
      await new Promise((r) => setTimeout(r, prev ? 650 : 150));
      await typeInto(typed, cur.code, 34);
      el.classList.add('is-done');
    },
    'top 72%',
  );
  return el;
}
