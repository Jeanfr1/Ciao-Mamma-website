// Scroll film: frames every `step` screens, composed into one sheet per window (checks motion continuity).
import { launch, BASE } from './browser.mjs';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [w, h] = (process.argv[2] || '1440x790').split('x').map(Number);
const step = Number(process.argv[3] || .25);
const out = `studio/captures/film-${w}x${h}`;
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(BASE + '?nointro', { waitUntil: 'networkidle' });
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
let i = 0;
for (let y = 0; y <= total + 1; y += Math.round(h * step)) {
  // approach each stop with small wheel steps so scroll-linked code sees a real scroll
  await page.mouse.wheel(0, i === 0 ? 0 : Math.round(h * step));
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` });
  i++;
}
await browser.close();
execFileSync('python3', ['-c', `
import glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('${out}/*.png'));W=360;ims=[]
for f in fs:
    im=Image.open(f).convert('RGB');im=im.resize((W,int(im.height*W/im.width)));ImageDraw.Draw(im).text((6,4),f.split('/')[-1],fill=(255,255,0));ims.append(im)
cols=4;rows=(len(ims)+cols-1)//cols;H=ims[0].height
s=Image.new('RGB',(cols*W+(cols-1)*4,rows*H+(rows-1)*4),(255,255,255))
for k,im in enumerate(ims):s.paste(im,((k%cols)*(W+4),(k//cols)*(H+4)))
s.save('${out}.jpg',quality=80)
`]);
console.log(`${i} frames -> ${out}.jpg`);
