// Browser QA for site/: density gates (no "super zoom"), layout, interactions, motion fallbacks.
// Local: npm run dev (port 4431) then npm run qa.  Live: QA_BASE=https://<domain>/ npm run qa
import { launch, BASE } from './browser.mjs';

const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const browser = await launch();

async function open(w, h, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', javaScriptEnabled: opts.js !== false, hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('request failed: ' + r.url()));
  for (let attempt = 0; ; attempt++) {
    try { await page.goto(BASE + (opts.query ?? '?nointro'), { waitUntil: 'networkidle' }); break; }
    catch (e) { if (attempt > 1 || !/ERR_INTERNET|ERR_NETWORK|ERR_CONNECTION/.test(e.message)) throw e; await page.waitForTimeout(1500); }
  }
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  return { ctx, page, errors };
}
const scrollTo = async (page, y) => { const now = await page.evaluate(() => scrollY); await page.mouse.wheel(0, y - now); await page.waitForTimeout(500); };

// ---------- Density gates at real desktop browser windows ----------
for (const [w, h] of [[1280, 650], [1440, 790], [1536, 730], [1920, 950], [1024, 768]]) {
  const { ctx, page, errors } = await open(w, h);
  const m = await page.evaluate(() => {
    const H = innerHeight, W = innerWidth, r = e => e.getBoundingClientRect();
    const seam = parseFloat(getComputedStyle(document.querySelector('.menu-scene')).marginTop) * -1;
    const scenes = Object.fromEntries([...document.querySelectorAll('main section')].map(s => [s.id, (r(s).height - (s.id === 'amore' ? 0 : seam)) / H]));
    const stage = r(document.querySelector('.hero-stage')).height / H;
    const title = r(document.querySelector('.poster-title'));
    const lines = [...document.querySelectorAll('.poster-title .line>span')].map(e => r(e));
    const blockers = ['.hero-main-pizza img', '.hero-slice img', '.hero-secondary img', '#travelling-pizza img'].map(s => document.querySelector(s)).filter(e => e && getComputedStyle(e.closest('#travelling-stage') || e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden').map(e => r(e));
    // a pizza box may graze a line's corner (transparent PNG margin), but must not cover the words' centre band
    const covered = lines.some(l => blockers.some(b => b.left < l.right - l.width * .12 && b.right > l.left + l.width * .12 && b.top < l.bottom - l.height * .35 && b.bottom > l.top + l.height * .35));
    const fonts = [...document.querySelectorAll('h1, .menu-words .word, .taste-copy strong, #venue-title')].map(e => parseFloat(getComputedStyle(e).fontSize) / W);
    return { scenes, stage, titleBottom: title.bottom / H, covered, maxFont: Math.max(...fonts), overflow: document.documentElement.scrollWidth > W };
  });
  const tag = `${w}x${h}`;
  check(`${tag} hero = 1 screen`, m.stage <= 1.001, m.stage.toFixed(2));
  check(`${tag} body scenes <= 0.85 screen`, m.scenes.speisekarte <= .85 && m.scenes.zutaten <= .85, `menu ${m.scenes.speisekarte.toFixed(2)} taste ${m.scenes.zutaten.toFixed(2)}`);
  check(`${tag} closing <= 1 screen`, m.scenes.restaurant <= 1.0, m.scenes.restaurant.toFixed(2));
  check(`${tag} title visible, not under a pizza`, !m.covered && m.titleBottom < .75);
  check(`${tag} display type <= 8.5 % of width`, m.maxFont <= .085, (m.maxFont * 100).toFixed(1) + ' %');
  check(`${tag} no horizontal overflow`, !m.overflow);
  // scroll through: the shared pizza lands on the table, ingredients spread, the room is uncovered
  const end = await page.evaluate(() => document.documentElement.scrollHeight);
  let maxScale = 1;
  for (let y = 0; y < end; y += Math.round(h * .3)) {
    await scrollTo(page, y);
    maxScale = Math.max(maxScale, await page.evaluate(() => parseFloat(document.getElementById('restaurant').style.getPropertyValue('--venue-scale') || 1)));
  }
  await page.waitForTimeout(800);
  const img = await page.evaluate(() => {
    const filePx = i => { const hit = (i.getAttribute('srcset') || '').split(',').map(x => x.trim().split(/\s+/)).find(([u]) => i.currentSrc.endsWith(u.replace(/^\.?\//, ''))); return hit ? parseInt(hit[1]) : i.naturalWidth; };
    const all = [...document.querySelectorAll('main img')].filter(i => !/\.svg$/.test(i.currentSrc) && !i.classList.contains('venue-ambient'));
    const ups = all.filter(i => i.complete && i.naturalWidth).map(i => ({ n: i.currentSrc.split('/').pop(), k: +(i.getBoundingClientRect().width * devicePixelRatio / filePx(i)).toFixed(2) })).filter(x => x.k > 1.05);
    const v = document.querySelector('.venue-photo img'), b = v.getBoundingClientRect();
    return { ups, unloaded: all.filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')), venueWhole: Math.abs(1512 / 1838 - b.width / b.height) < .02 };
  });
  check(`${tag} no image shown above its pixels`, !img.ups.length, JSON.stringify(img.ups));
  check(`${tag} all images loaded after a scroll`, !img.unloaded.length, img.unloaded.join(', '));
  check(`${tag} real interior shown whole (no cover crop)`, img.venueWhole);
  const menuTop = await page.evaluate(() => document.getElementById('speisekarte').getBoundingClientRect().top + scrollY);
  await scrollTo(page, menuTop);
  const landed = await page.evaluate(() => { const a = document.getElementById('travelling-pizza').getBoundingClientRect(), b = document.querySelector('.menu-pizza').getBoundingClientRect(); return Math.hypot(a.left - b.left, a.top - b.top) < 4 && Math.abs(a.width - b.width) < 4; });
  check(`${tag} shared pizza lands on the table`, landed);
  check(`${tag} scroll scale <= 1.02`, maxScale <= 1.0201, maxScale.toFixed(3));
  check(`${tag} no console/network errors`, !errors.length, errors.join(' | '));
  await ctx.close();
}

// ---------- Phones and tablets ----------
for (const [w, h] of [[320, 640], [360, 740], [390, 844], [430, 932], [768, 1024], [820, 1180]]) {
  const { ctx, page, errors } = await open(w, h, { touch: true });
  const end = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < end; y += Math.round(h * .4)) await page.evaluate(y => scrollTo(0, y), y), await page.waitForTimeout(250);
  await page.waitForTimeout(900);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => {
    const W = innerWidth, r = e => e.getBoundingClientRect();
    const out = [...document.querySelectorAll('h1 .line>span, h2, .menu-words .word, .contact-block a, .taste-copy p, .menu-link')].filter(e => { const b = r(e); return b.width && (b.left < -1 || b.right > W + 1); }).map(e => e.textContent.trim().slice(0, 20));
    const small = [...document.querySelectorAll('main a, main button, main summary, #motion-toggle')].filter(e => { const b = r(e); return b.width && b.height && getComputedStyle(e).visibility !== 'hidden' && (b.height < 43.5 || b.width < 43.5); }).map(e => (e.textContent.trim() || e.getAttribute('aria-label') || e.className).slice(0, 18));
    return { overflow: document.documentElement.scrollWidth > W, out, small, shared: document.documentElement.classList.contains('shared-pizza-active') };
  });
  check(`${w}x${h} no horizontal overflow`, !m.overflow);
  check(`${w}x${h} text inside the screen`, !m.out.length, m.out.join(', '));
  check(`${w}x${h} no fixed pizza below 900 px`, !m.shared);
  check(`${w}x${h} touch targets >= 44 px`, !m.small.length, m.small.join(', '));
  if (w < 900) {
    await page.click('.mobile-menu summary');
    const opened = await page.evaluate(() => document.querySelector('.mobile-menu').open);
    await page.click('.mobile-menu nav a[href="#restaurant"]');
    const closed = await page.evaluate(() => !document.querySelector('.mobile-menu').open);
    check(`${w}x${h} mobile menu opens and closes on choice`, opened && closed);
  }
  check(`${w}x${h} no console/network errors`, !errors.length, errors.join(' | '));
  await ctx.close();
}

// ---------- Dialog, keyboard and focus ----------
{
  const { ctx, page } = await open(1440, 790);
  const menuTop = await page.evaluate(() => document.getElementById('speisekarte').getBoundingClientRect().top + scrollY);
  await scrollTo(page, menuTop);
  await page.waitForTimeout(900);
  await page.click('.word-pasta');
  const d = await page.evaluate(() => ({ open: document.getElementById('menu-dialog').open, title: document.getElementById('dialog-title').textContent, focus: document.activeElement.id, note: document.querySelector('.menu-note').textContent }));
  check('dialog opens on Pasta with Pasta tab focused', d.open && d.title === 'Pasta' && d.focus === 'tab-pasta');
  await page.keyboard.press('ArrowRight');
  const k1 = await page.evaluate(() => [document.getElementById('dialog-title').textContent, document.activeElement.id]);
  await page.keyboard.press('End');
  const k2 = await page.evaluate(() => document.activeElement.id);
  await page.keyboard.press('Home');
  const k3 = await page.evaluate(() => document.activeElement.id);
  check('tabs: arrows / Home / End', k1[0] === 'Pizza' && k1[1] === 'tab-pizza' && k2 === 'tab-pasta' && k3 === 'tab-pizza', `${k1} ${k2} ${k3}`);
  check('dialog says the full menu and prices come by phone', /vollständige aktuelle Speisekarte und Preise/.test(d.note));
  await page.keyboard.press('Escape');
  const back = await page.evaluate(() => ({ open: document.getElementById('menu-dialog').open, focus: document.activeElement.classList.contains('word-pasta') }));
  check('Escape closes and returns focus', !back.open && back.focus);
  const links = await page.evaluate(() => ({ tel: [...document.querySelectorAll('a[href^="tel:"]')].every(a => a.getAttribute('href') === 'tel:+494032513764'), maps: [...document.querySelectorAll('a[href*="google.com/maps"]')].every(a => a.target === '_blank' && /noopener/.test(a.rel) && /Sandtorkai\+38-40/.test(a.href)), robots: document.querySelector('meta[name=robots]')?.content }));
  check('call links all dial 040 325 137 64', links.tel);
  check('route links open the correct address in a new tab', links.maps);
  check('preview is noindex', /noindex/.test(links.robots || ''));
  const words = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[alt]')].map(e => e.alt).join(' '));
  check('no production notes in visible copy or alt text', !/\b(KI|generiert|konzept|campaign|mockup|kit|original|bearbeitet|placeholder|TODO)\b/i.test(words));
  await ctx.close();
}

// ---------- Motion controls and fallbacks ----------
{
  const { ctx, page } = await open(1440, 790);
  await page.click('#motion-toggle');
  const off = await page.evaluate(() => ({ off: document.documentElement.classList.contains('motion-off'), stored: localStorage.getItem('ciao-mamma.motion.paused'), runway: document.getElementById('amore').getBoundingClientRect().height / innerHeight, local: getComputedStyle(document.querySelector('.hero-main-pizza')).visibility }));
  check('pause button stops motion and remembers it', off.off && off.stored === '1' && off.local === 'visible');
  check('paused: no empty pinned runway', off.runway <= 1.01, off.runway.toFixed(2));
  await page.reload({ waitUntil: 'networkidle' });
  check('pause survives a reload', await page.evaluate(() => document.documentElement.classList.contains('motion-off')));
  await page.click('#motion-toggle');
  check('resume', await page.evaluate(() => document.documentElement.classList.contains('js-motion') && localStorage.getItem('ciao-mamma.motion.paused') === '0'));
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 790, { reduced: true });
  const m = await page.evaluate(() => ({ off: document.documentElement.classList.contains('motion-off'), runway: document.getElementById('amore').getBoundingClientRect().height / innerHeight, hidden: [...document.querySelectorAll('[data-reveal], .stamp>span, .word, #venue-title .line>span')].filter(e => getComputedStyle(e).opacity !== '1').length, disabled: document.getElementById('motion-toggle').disabled }));
  check('reduced motion: static page, all text visible', m.off && m.runway <= 1.01 && !m.hidden && m.disabled, JSON.stringify(m));
  await ctx.close();
}
{
  const { ctx, page } = await open(1440, 790, { js: false, query: '' });
  const m = await page.evaluate(() => ({ h: document.getElementById('amore').getBoundingClientRect().height / innerHeight, hidden: [...document.querySelectorAll('h1, h2, .word, .contact-block a')].filter(e => getComputedStyle(e).opacity !== '1').length, toggle: getComputedStyle(document.getElementById('motion-toggle')).display }));
  check('no JavaScript: readable page, call and map links, no pause button', m.h <= 1.01 && !m.hidden && m.toggle === 'none', JSON.stringify(m));
  await ctx.close();
}
{
  // the opening plays once and the page is quiet afterwards
  const { ctx, page } = await open(1440, 790, { query: '' });
  await page.waitForTimeout(2300);
  const m = await page.evaluate(() => ({ running: document.getAnimations().filter(a => a.playState === 'running').length, title: getComputedStyle(document.querySelector('.poster-title .line>span')).opacity }));
  check('opening finishes and leaves no running animation', m.running === 0 && m.title === '1', JSON.stringify(m));
  await ctx.close();
}

await browser.close();
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
