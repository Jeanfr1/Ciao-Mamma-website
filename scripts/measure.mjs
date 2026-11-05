// Density audit: how big each scene and image is at real browser windows (not screen sizes).
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';

const windows = [[1280, 650], [1440, 790], [1536, 730], [1920, 950], [390, 844]];
const out = process.argv[2] || 'studio/captures/measure';
mkdirSync(out, { recursive: true });
const browser = await launch();
for (const [w, h] of windows) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + (process.env.QUERY || ''), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  const data = await page.evaluate(() => {
    const H = innerHeight, W = innerWidth, sy = scrollY;
    const r = el => el.getBoundingClientRect();
    const scenes = [...document.querySelectorAll('main section')].map(s => {
      const b = r(s);
      const stage = s.querySelector('.hero-stage');
      return { id: s.id, screens: +(b.height / H).toFixed(2), stage: stage ? +(r(stage).height / H).toFixed(2) : undefined, top: Math.round(b.top + sy) };
    });
    const imgs = [...document.querySelectorAll('main img, main svg image')].map(i => {
      const b = r(i);
      const nat = i.naturalWidth || +i.getAttribute('width');
      const name = (i.currentSrc || i.getAttribute('href') || '').split('/').pop();
      return { name, cls: i.className?.baseVal ?? i.className, w: Math.round(b.width), h: Math.round(b.height), pctW: +(b.width / W * 100).toFixed(0), pctH: +(b.height / H * 100).toFixed(0), upscale: nat ? +(b.width / nat).toFixed(2) : null };
    });
    const type = [...document.querySelectorAll('h1, h2, .menu-words a, .taste-copy strong')].map(e => ({ t: e.textContent.trim().slice(0, 24), fs: parseFloat(getComputedStyle(e).fontSize), pctW: +(parseFloat(getComputedStyle(e).fontSize) / W * 100).toFixed(1), pctH: +(r(e).height / H * 100).toFixed(0) }));
    return { scenes, imgs, type, doc: +(document.documentElement.scrollHeight / H).toFixed(2), overflowX: document.documentElement.scrollWidth > W };
  });
  console.log(`\n=== ${w}x${h}  page ${data.doc} screens  overflowX=${data.overflowX}`);
  console.log('scenes', JSON.stringify(data.scenes));
  console.log('type', JSON.stringify(data.type));
  for (const i of data.imgs) console.log('  img', i.name.padEnd(28), String(i.cls).padEnd(22), `${i.w}x${i.h}`, `w${i.pctW}% h${i.pctH}%`, 'scale', i.upscale);
  if (w === 1440 || w === 390) {
    for (const s of data.scenes) {
      await page.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); }, s.id === 'amore' ? 0 : s.top + (s.id === 'speisekarte' ? 0 : Math.round(h * .1)));
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}/${w}-${s.id}.png` });
    }
  }
  await page.close();
}
await browser.close();
