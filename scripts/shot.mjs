// Capture screenshots of the page while scrolling through one era (or all of them).
//
//   node scripts/shot.mjs [--era y2010] [--steps 6] [--mobile] [--out shots] [--url http://localhost:5173]
//
// Writes <out>/<era>-<n>.png and prints browser console errors.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:5173' },
    era: { type: 'string' },
    steps: { type: 'string', default: '6' },
    out: { type: 'string', default: 'shots' },
    mobile: { type: 'boolean', default: false },
    wait: { type: 'string', default: '900' },
  },
});

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(args.out, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({
  viewport: args.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

await page.goto(`${args.url}/?nosmooth`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const ranges = await page.evaluate(() =>
  Array.from(document.querySelectorAll('section.era')).map((s) => {
    const r = s.getBoundingClientRect();
    return { id: s.dataset.era, top: r.top + scrollY, height: r.height };
  }),
);

const steps = Number(args.steps);
for (const r of ranges) {
  if (args.era && r.id !== args.era) continue;
  for (let i = 0; i < steps; i++) {
    const y = Math.round(r.top + (r.height * i) / steps);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(Number(args.wait));
    const file = `${args.out}/${r.id}${args.mobile ? '-m' : ''}-${i}.png`;
    await page.screenshot({ path: file });
    console.log(file, `y=${y}`);
  }
}
await browser.close();
