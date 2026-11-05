// One screenshot per scene at the given windows: node scripts/shots.mjs 768x1024 1024x768 ...
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';
const out = 'studio/captures/shots'; mkdirSync(out, { recursive: true });
const browser = await launch();
for (const arg of process.argv.slice(2)) {
  const [w, h] = arg.split('x').map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + '?nointro', { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const tops = await page.evaluate(() => [...document.querySelectorAll('main section')].map(s => [s.id, s.getBoundingClientRect().top + scrollY]));
  for (const [id, top] of tops) {
    const target = id === 'amore' ? 0 : id === 'restaurant' ? 1e6 : top + 20;
    const now = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, Math.min(target, 1e5) - now);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${out}/${w}x${h}-${id}.png` });
  }
  await page.close();
}
await browser.close();
