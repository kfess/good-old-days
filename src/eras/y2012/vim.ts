import { reducedMotion } from '../../core/scroll';
import { h, onceInView, sleep } from '../../core/util';

/**
 * Easter egg: the most-viewed way to lose an afternoon. A tiny terminal stuck in Vim plays once:
 * `:q` typed in insert mode lands in the buffer, then ESC, `:q` (E37), and finally `:q!`.
 */
export function buildVim(): HTMLElement {
  const el = h(`
    <figure class="y12-vim">
      <div class="y12-vim__win" aria-hidden="true">
        <div class="y12-vim__bar"><i></i><i></i><i></i><span>vim — 80×24</span></div>
        <pre class="y12-vim__buf"><span class="y12-vim__line"></span><span class="y12-vim__caret"></span>
<b>~</b>
<b>~</b>
<b>~</b></pre>
        <pre class="y12-vim__cmd"></pre>
      </div>
      <figcaption>“How do I exit Vim?” — asked on Stack Overflow in 2012. Millions of views since.</figcaption>
    </figure>`);

  const line = el.querySelector<HTMLElement>('.y12-vim__line')!;
  const cmd = el.querySelector<HTMLElement>('.y12-vim__cmd')!;
  const win = el.querySelector<HTMLElement>('.y12-vim__win')!;

  const type = async (target: HTMLElement, text: string, append = true) => {
    if (!append) target.textContent = '';
    for (const ch of text) {
      target.textContent += ch;
      await sleep(140);
    }
  };

  const play = async () => {
    line.textContent = 'server_name example.com;';
    cmd.className = 'y12-vim__cmd';
    cmd.textContent = '-- INSERT --';
    await sleep(900);
    // still in insert mode: the "command" becomes text
    await type(line, ':q');
    await sleep(900);
    cmd.textContent = '';
    await sleep(500);
    await type(cmd, ':q', false);
    await sleep(500);
    cmd.classList.add('is-err');
    cmd.textContent = 'E37: No write since last change (add ! to override)';
    await sleep(1600);
    cmd.classList.remove('is-err');
    await type(cmd, ':q!', false);
    await sleep(600);
    win.classList.add('is-out');
    cmd.textContent = '$ ';
  };

  if (reducedMotion) {
    line.textContent = 'server_name example.com;';
    win.classList.add('is-out');
    cmd.textContent = '$ ';
    return el;
  }
  onceInView(el, play, 'top 70%');
  return el;
}
