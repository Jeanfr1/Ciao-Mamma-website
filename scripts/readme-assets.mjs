// README captures from the running site (npm run dev): banner, scroll GIF frames, desktop and phone shots.
// Then: python3 scripts/readme-compose.py
import { launch, BASE } from './browser.mjs';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = 'studio/readme';
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/frames`, { recursive: true });
const browser = await launch();
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

// 1) Banner: an HTML page set in the site's own fonts and assets
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 400 } });
  await page.goto(BASE + 'robots.txt');
  await page.setContent(`<!doctype html><html><head><base href="${BASE}"><style>
    @font-face{font-family:Barlow;src:url('fonts/BarlowCondensed-ExtraBoldItalic.woff');font-weight:800;font-style:italic}
    @font-face{font-family:Manrope;src:url('fonts/Manrope-SemiBold.woff');font-weight:600}
    body{margin:0;width:1280px;height:400px;background:#AC2E27;overflow:hidden;position:relative;font-family:Manrope}
    .logo{position:absolute;left:64px;top:40px;width:270px}
    h1{position:absolute;left:64px;top:132px;margin:0;font:800 italic 76px/.86 Barlow;letter-spacing:-.03em;text-transform:uppercase;color:#F3EAD6}
    p{position:absolute;left:66px;bottom:30px;margin:0;color:#F3EAD6cc;font-size:15px;letter-spacing:.02em}
    .pizza{position:absolute;right:-90px;top:120px;width:560px;transform:rotate(-6deg)}
    .slice{position:absolute;right:300px;top:-30px;width:330px;transform:rotate(-9deg)}
    .basil{position:absolute;right:610px;top:40px;width:70px;transform:rotate(-25deg)}
  </style></head><body>
    <img class="pizza" src="assets/pizza-secondary.webp"><img class="slice" src="assets/pizza-slice.webp"><img class="basil" src="assets/basil.webp">
    <img class="logo" src="assets/logo-creme.svg">
    <h1>Amore<br>auf den<br>ersten Biss.</h1>
    <p>Pizza · Pasta · Am Sandtorkai 38–40 · Hamburg HafenCity</p>
  </body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/banner.png` });
  await page.close();
}

// 2) Scroll film at 1440 x 900, top to bottom
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '?nointro', { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const n = 64;
  for (let i = 0; i < n; i++) {
    const y = Math.round(total * (i / (n - 1)) ** 1.08);
    const now = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, y - now);
    await page.waitForTimeout(350);
    await settle(page);
    await page.screenshot({ path: `${out}/frames/f_${String(i).padStart(4, '0')}.png` });
  }
  await page.close();
}

// 3) Desktop scenes (1440 x 790) and phone scenes (390 x 844)
for (const [w, h, tag] of [[1440, 790, 'desktop'], [390, 844, 'mobile']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'mobile' ? 2 : 1 });
  await page.goto(BASE + '?nointro', { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const tops = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('main section')].map(s => [s.id, s.getBoundingClientRect().top + scrollY])));
  const stops = { amore: 0, speisekarte: tops.speisekarte + (tag === 'mobile' ? 30 : 0), zutaten: tops.zutaten + (tag === 'mobile' ? -10 : h * .12), restaurant: 1e6 };
  for (const [id, y] of Object.entries(stops)) {
    const now = await page.evaluate(() => scrollY);
    const target = Math.min(y, await page.evaluate(() => document.documentElement.scrollHeight - innerHeight));
    await page.mouse.wheel(0, target - now);
    await page.waitForTimeout(1200);
    await settle(page);
    await page.screenshot({ path: `${out}/${tag}-${id}.png` });
  }
  if (tag === 'desktop') {
    await page.mouse.wheel(0, tops.speisekarte - await page.evaluate(() => scrollY));
    await page.waitForTimeout(900);
    await page.click('.word-pizza');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/desktop-dialog.png` });
  }
  await page.close();
}
await browser.close();
console.log('captures in', fileURLToPath(new URL('../' + out + '/', import.meta.url)));
