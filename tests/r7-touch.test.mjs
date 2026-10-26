// Test: regulile r7 (ținte tactile, bara de căutare îngustă) restaurate; 8 limbi, 360 px. Rulare: node tests/r7-touch.test.mjs
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const FILE = 'file://' + path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
let enTitle = null;
for (const L of ['en', 'ro', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
  const ctx = await b.newContext({viewport: {width: 360, height: 740}});
  const net = []; await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(FILE); await page.waitForTimeout(800);
  await page.click(`.lang-sw-btn[data-l="${L}"]`); await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const cs = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
    const pill = cs('.fpill'), arr = cs('.toggle-arrow'), px = cs('#proxyOpt'), si = cs('.search-input'), foot = cs('.lib-btn-foot');
    return {pill: pill && parseFloat(pill.minHeight), arrow: arr && parseFloat(arr.minWidth), proxy: px && parseFloat(px.width), siMin: si && si.minWidth, siFs: si && parseFloat(si.fontSize), foot: foot && parseFloat(foot.minHeight),
      overflow: document.documentElement.scrollWidth - innerWidth, lang: document.documentElement.lang, btn: document.querySelector('.search-btn').textContent.trim(), raw: /undefined|\[object|\{\{/.test(document.body.innerText)};
  });
  console.log('— ' + L);
  check(L + ': .fpill min-height 26', r.pill === 26, r);
  check(L + ': .toggle-arrow min-width 28 (r7)', r.arrow === 28, r);
  check(L + ': #proxyOpt 20px', r.proxy === 20, r);
  check(L + ': .search-input min-width 0 și font 16 px la 360', r.siMin === '0px' && r.siFs === 16, r);
  check(L + ': .lib-btn-foot min-height 28', r.foot === 28, r);
  check(L + ': fără depășire orizontală la 360 px', r.overflow <= 0, r.overflow);
  check(L + ': html lang', r.lang === L, r.lang);
  if (L === 'en') enTitle = r.btn; else check(L + ': buton căutare tradus', r.btn !== enTitle, r.btn);
  check(L + ': fără chei brute', !r.raw);
  check(L + ': fără pageerror/rețea', errs.length === 0 && net.length === 0, {errs, net});
  await ctx.close();
}
await b.close(); console.log(`\n${ok} ok, ${bad} eșuate`); process.exit(bad ? 1 : 0);
