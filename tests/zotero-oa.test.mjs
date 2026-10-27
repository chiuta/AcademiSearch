// AcademiSearch 5.1.0 — export Zotero (RIS + COinS) și PDF-uri libere în bloc (Unpaywall, simulat). Rulare: node tests/zotero-oa.test.mjs
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const FILE = 'file://' + path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const ctx = await b.newContext({viewport: {width: 1100, height: 900}, acceptDownloads: true, serviceWorkers: 'block'});
const hosts = new Set(); const upCalls = [];
await ctx.route(/^https?:/, (r) => {
  const u = r.request().url(); hosts.add(new URL(u).host);
  if (u.startsWith('https://api.unpaywall.org/v2/')) {
    upCalls.push(u);
    const json = (o, s = 200) => r.fulfill({status: s, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(o)});
    if (u.includes('10.1%2F111') || u.includes('10.1/111')) return json({best_oa_location: {url_for_pdf: 'https://repo.example/a.pdf', url: 'https://repo.example/a'}});
    if (u.includes('10.1%2F222') || u.includes('10.1/222')) return json({best_oa_location: {url: 'https://repo.example/landing', url_for_pdf: null}, oa_locations: []});
    if (u.includes('10.1%2F333') || u.includes('10.1/333')) return json({best_oa_location: null, oa_locations: [{url_for_pdf: 'javascript:alert(1)'}, {url_for_pdf: 'https://repo.example/c.pdf'}]});
    return json({error: 'nf'}, 404);
  }
  return r.abort();
});
const page = await ctx.newPage(); const errs = [], dlgs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('dialog', (d) => { dlgs.push(d.message()); d.dismiss(); });
await page.goto(FILE); await page.waitForTimeout(800);
await page.evaluate(() => {
  openResultsModal('test');
  addResults('crossref', [
    {title: 'Articol cu PDF liber', authors: 'Ana Popescu; Ion Ionescu', year: '2020', journal: 'Rev & Co', doi: '10.1/111', url: 'https://doi.org/10.1/111'},
    {title: 'Articol doar pagina de aterizare', authors: 'Maria X', year: '2021', doi: '10.1/222', url: 'https://doi.org/10.1/222'},
    {title: 'Articol a doua locație', authors: 'Z Y', year: '2019', doi: '10.1/333', url: 'https://doi.org/10.1/333'},
    {title: 'Fără DOI', authors: 'Q', year: '2018', url: 'https://x.example/q'},
    {title: 'Are deja PDF', authors: 'W', year: '2017', doi: '10.1/444', url: 'https://x.example/w', pdf: 'https://x.example/w.pdf'}
  ]);
});
await page.waitForTimeout(300);
const coins = await page.evaluate(() => [...document.querySelectorAll('#rmGrid .Z3988')].map(s => s.getAttribute('title')));
check('COinS pe fiecare card (5)', coins.length === 5, coins.length);
const c0 = new URLSearchParams(coins[0]);
check('COinS: titlu, jurnal, an, DOI', c0.get('rft.atitle') === 'Articol cu PDF liber' && c0.get('rft.jtitle') === 'Rev & Co' && c0.get('rft.date') === '2020' && c0.get('rft_id') === 'info:doi/10.1/111', coins[0]);
check('COinS: autori separați la ;', c0.getAll('rft.au').join('|') === 'Ana Popescu|Ion Ionescu', c0.getAll('rft.au'));
check('COinS fără DOI folosește URL-ul', new URLSearchParams(coins[3]).get('rft_id') === 'https://x.example/q', coins[3]);
check('buton Zotero activ', await page.locator('#rmExport [data-exp="zotero"]').isEnabled());
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#rmExport [data-exp="zotero"]')]);
const fs = await import('node:fs'); const txt = fs.readFileSync(await dl.path(), 'utf8');
check('Zotero: fișier .ris', /\.ris$/.test(dl.suggestedFilename()), dl.suggestedFilename());
check('Zotero: conținut RIS (TY, TI, DO, ER)', /TY {2}- JOUR/.test(txt) && /TI {2}- Articol cu PDF liber/.test(txt) && /DO {2}- 10\.1\/111/.test(txt) && /ER {2}- /.test(txt));
check('mesaj Zotero cu instrucțiune de import', /Import/.test(await page.textContent('#rmExportMsg')));
// PDF-uri libere în bloc
await page.click('#rmOaBulk'); await page.waitForFunction(() => /găsite din|found out of/.test(document.getElementById('rmExportMsg').textContent), null, {timeout: 15000});
const pdfs = await page.evaluate(() => _allResults.map(r => r.item.pdf || null));
check('PDF găsit pentru 10.1/111', pdfs[0] === 'https://repo.example/a.pdf', pdfs);
check('doar url_for_pdf: pagina de aterizare nu devine PDF', pdfs[1] === null, pdfs);
check('a doua locație, doar http(s)', pdfs[2] === 'https://repo.example/c.pdf', pdfs);
check('fără DOI nu se interoghează', pdfs[3] === null && !upCalls.some(u => u.includes('x.example')));
check('cine are deja PDF nu se reinterogă', !upCalls.some(u => u.includes('444')), upCalls);
check('mesaj final 2 din 3', /2/.test(await page.textContent('#rmExportMsg')) && /3/.test(await page.textContent('#rmExportMsg')), await page.textContent('#rmExportMsg'));
check('cardurile arată butonul PDF', await page.locator('#rmGrid a.btn-gold').count() >= 3);
check('rețea: doar api.unpaywall.org', [...hosts].every(h => h === 'api.unpaywall.org'), [...hosts]);
// cheile noi în toate limbile
const keys = await page.evaluate(() => ['zot.btn','zot.tip','zot.done','zot.hint','oab.btn','oab.none','oab.prog','oab.done'].every(k => ['ro','en','fr','it','es','pt','hu','de'].every(l => TRANSLATIONS[l] && TRANSLATIONS[l][k])));
check('chei noi în toate cele 8 limbi', keys);
check('fără dialoguri native', dlgs.length === 0, dlgs);
check('fără erori JS', errs.length === 0, errs);
await b.close(); console.log(`\nAcademiSearch zotero-oa: ${ok} ok, ${bad} eșuate`); process.exit(bad ? 1 : 0);
