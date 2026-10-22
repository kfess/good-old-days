import { esc, h, onceInView, sleep, typeInto } from '../core/util';

export interface DeployStep {
  text: string;
  /** cmd = typed with a prompt, out = plain output, ok/err = colored, progress = animated bar */
  kind?: 'cmd' | 'out' | 'ok' | 'err' | 'progress';
  /** pause after this line (ms); for `progress` it is how long the bar takes to fill */
  delay?: number;
  /** called as the line appears, to sync something else on the page with the log */
  onStart?: () => void;
  /** `progress` only: called with 0–1 as the bar fills */
  onProgress?: (p: number) => void;
}

export interface DeployOptions {
  /** button label, defaults to "Deploy" */
  label?: string;
  /** window title bar text */
  title?: string;
  /** prompt shown before cmd lines, defaults to "$" */
  prompt?: string;
  steps: DeployStep[];
  /** label shown on the button when the run completes */
  doneLabel?: string;
  /** called as each run (or replay) starts, before the first line */
  onRun?: () => void;
}

/** The recurring Deploy block: every era deploys the way that era deployed. It plays once on view; the button replays. */
export function createDeploy(parent: HTMLElement, opts: DeployOptions): HTMLElement {
  const el = h(`
    <div class="deploy">
      <button type="button" class="deploy__btn"><span class="deploy__label">${esc(opts.label ?? 'Deploy')}</span></button>
      <div class="deploy__win">
        <div class="deploy__bar"><i></i><i></i><i></i><span>${esc(opts.title ?? 'deploy')}</span></div>
        <div class="deploy__log" role="log" aria-live="polite"></div>
      </div>
    </div>`);
  parent.appendChild(el);

  const btn = el.querySelector<HTMLButtonElement>('.deploy__btn')!;
  const label = el.querySelector<HTMLElement>('.deploy__label')!;
  const log = el.querySelector<HTMLElement>('.deploy__log')!;
  const prompt = opts.prompt ?? '$';
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    el.classList.remove('is-done');
    el.classList.add('is-running');
    btn.disabled = true;
    log.innerHTML = '';
    log.classList.remove('is-scrolled');
    // typed a character at a time: let screen readers hear the finished log, not every keystroke
    log.setAttribute('aria-busy', 'true');
    opts.onRun?.();

    for (const step of opts.steps) {
      step.onStart?.();
      const kind = step.kind ?? 'out';
      const line = document.createElement('div');
      line.className = `deploy__line deploy__line--${kind}`;
      log.appendChild(line);
      if (kind === 'cmd') {
        line.innerHTML = `<span class="deploy__prompt">${esc(prompt)}</span> `;
        const t = document.createElement('span');
        line.appendChild(t);
        await typeInto(t, step.text, 32);
        await sleep(step.delay ?? 250);
      } else if (kind === 'progress') {
        line.innerHTML = `<span>${esc(step.text)}</span> <span class="deploy__meter"><i></i></span> <span class="deploy__pct">0%</span>`;
        const bar = line.querySelector<HTMLElement>('.deploy__meter i')!;
        const pct = line.querySelector<HTMLElement>('.deploy__pct')!;
        const total = step.delay ?? 1200;
        const t0 = performance.now();
        await new Promise<void>((resolve) => {
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / Math.max(1, total));
            bar.style.transform = `scaleX(${p})`;
            pct.textContent = `${Math.round(p * 100)}%`;
            step.onProgress?.(p);
            if (p < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
      } else {
        line.textContent = step.text;
        await sleep(step.delay ?? 180);
      }
      log.scrollTop = log.scrollHeight;
      log.classList.toggle('is-scrolled', log.scrollTop > 0);
    }

    log.setAttribute('aria-busy', 'false');
    label.textContent = opts.doneLabel ?? 'Deployed ✓';
    el.classList.remove('is-running');
    el.classList.add('is-done');
    btn.disabled = false;
    running = false;
  };

  btn.addEventListener('click', run);
  // never leave an empty terminal on screen: the first run starts by itself, the button replays it
  onceInView(el, run, 'top 65%');
  return el;
}
