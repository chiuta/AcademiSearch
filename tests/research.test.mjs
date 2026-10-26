// AcademiSearch 5.0.0 — dosare de cercetare, deduplicare între surse, rețea de citări (OpenAlex mock). Rulare: node tests/research.test.mjs
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
const hosts = new Set(); let oaCalls = 0;
const W = (id, t, y, doi, c) => ({id: 'https://openalex.org/' + id, display_name: t, publication_year: y, doi: doi ? 'https://doi.org/' + doi : null, cited_by_count: c, authorships: [{author: {display_name: 'Ana Popescu'}}]});
await ctx.route(/^https?:/, (r) => {
  const u = r.request().url(); hosts.add(new URL(u).host);
  if (!u.startsWith('https://api.openalex.org/')) return r.abort();
  oaCalls++;
  const json = (o, s = 200) => r.fulfill({status: s, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(o)});
  if (u.includes('/works/https://doi.org/10.1234/abc')) return json({...W('W100', 'Graph Centre Paper', 2020, '10.1234/abc', 7), referenced_works: ['https://openalex.org/W1', 'https://openalex.org/W2']});
  if (u.includes('/works/https://doi.org/')) return json({error: 'nf'}, 404);
  if (u.includes('filter=openalex:')) return json({results: [W('W1', 'Old Foundation', 2001, '10.1/old', 500), W('W2', 'Minor Ref', 2010, null, 3)]});
  if (u.includes('filter=cites:W100')) return json({meta: {count: 3}, results: [W('W7', 'Big Follower', 2022, '10.9/big', 90), W('W8', 'Small Follower', 2023, '10.9/small', 2), W('W9', '<img src=x onerror=alert(1)> Evil', 2024, null, 0)]});
  if (u.includes('search=Title%20only%20work') || u.includes('search=Title+only+work')) return json({results: [{...W('W300', 'Title only work', 2019, null, 1), referenced_works: []}]});
  if (u.includes('filter=cites:W300')) return json({meta: {count: 0}, results: []});
  return json({results: []});
});
const page = await ctx.newPage(); const errs = [], dlgs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('dialog', (d) => { dlgs.push(d.message()); d.dismiss(); });
await page.goto(FILE); await page.waitForTimeout(1000);

// --- deduplicare între surse
const dd = await page.evaluate(() => {
  openResultsModal('retele neuronale');
  addResults('crossref', [
    {title: 'Deep Learning for Graphs: A Survey', authors: 'Smith J, Doe K', year: '2021', doi: '10.1/abc', url: 'https://doi.org/10.1/abc'},
    {title: 'Alt articol complet diferit', authors: 'Ionescu A', year: '2020', url: 'https://x/1'}
  ]);
  addResults('openalex', [
    {title: 'Deep learning for graphs - a survey', authors: 'John Smith', year: '2021', url: 'https://openalex.org/W1', pdf: 'https://x.org/a.pdf', abstract: 'Rezumat lung de test.'},
    {title: 'Deep Learning for Graphs: A Survey', authors: 'Smith J', year: '2021', doi: 'https://doi.org/10.1/ABC', url: 'https://u/2'},
    {title: 'Deep learning for graphs a survey', authors: 'Brown T', year: '2021', url: 'https://u/3'},
    {title: 'Deep learning for graphs a survey', authors: 'Smith J', year: '2018', url: 'https://u/4'}
  ]);
  const rec = _allResults[0];
  return {n: _allResults.length, merged: _dupMerged, also: rec.item._also, pdf: rec.item.pdf, abs: rec.item.abstract, cards: document.querySelectorAll('#rmGrid .mrc').length, dup: document.getElementById('rmDup').textContent,
    cardTxt: document.querySelector('#rmGrid .mrc').textContent};
});
check('dedup: DOI + titlu/autor/an unesc dublurile (2 reale + 2 omonime diferite)', dd.n === 4 && dd.merged === 2, dd);
check('dedup: autor diferit și an diferit NU se unesc', dd.cards === 4, dd.cards);
check('dedup: câmpurile lipsă se completează (PDF, rezumat)', dd.pdf === 'https://x.org/a.pdf' && dd.abs === 'Rezumat lung de test.', dd);
check('dedup: cardul arată în ce alte surse apare', Array.isArray(dd.also) && dd.also.includes('openalex') && /OpenAlex/.test(dd.cardTxt), dd.cardTxt.slice(0, 200));
check('dedup: contor vizibil', /2/.test(dd.dup) && dd.dup.length > 5, dd.dup);

// --- dosare
await page.evaluate(() => { document.getElementById('rmCloseBtn').click(); localStorage.removeItem('academisearch.library'); localStorage.removeItem('academisearch.folders'); });
await page.reload(); await page.waitForTimeout(800);
await page.evaluate(() => { setLang('ro'); openLib(); });
await page.fill('#libNewFolder', 'Teza'); await page.click('[data-act=folderAdd]');
await page.fill('#libNewFolder', 'teza'); await page.click('[data-act=folderAdd]');
let st = await page.evaluate(() => ({list: _fold.list, active: _fold.active, msg: document.getElementById('libMsg').textContent}));
check('dosar creat și activ; nume duplicat (fără diferență de majuscule) respins', st.list.length === 1 && st.active === 'Teza' && /exist|există/i.test(st.msg), st);
await page.fill('#libNewFolder', 'Cursuri'); await page.press('#libNewFolder', 'Enter');
await page.evaluate(() => closeLib());
st = await page.evaluate(() => { openResultsModal('x'); addResults('crossref', [{title: 'Prima lucrare salvată', authors: 'A B', year: '2020', doi: '10.5/one', url: 'https://doi.org/10.5/one'}, {title: 'A doua lucrare salvată', authors: 'C D', year: '2021', url: 'https://x/2'}]);
  libToggle(Object.keys(_items)[0] * 1, null); closeLib && 0; return _lib.map(x => [x.title, x.f]); });
check('salvarea din rezultate merge în dosarul activ (Cursuri)', st.length === 1 && st[0][1] === 'Cursuri', st);
await page.evaluate(() => { document.getElementById('rmCloseBtn').click(); });
await page.evaluate(() => { _libFolder = null; _fold.active = ''; libToggle(Object.keys(_items)[1] * 1, null); });
await page.evaluate(() => openLib());
const counts = await page.evaluate(() => [...document.querySelectorAll('#libChips button')].map(b => b.textContent.trim()));
check('chips cu număr de intrări (Toate 2, Fără dosar 1, Teza 0, Cursuri 1)', counts.join('|') === 'Toate (2)|Fără dosar (1)|Teza (0)|Cursuri (1)', counts);
await page.click('#libChips button:nth-child(4)');
let vis = await page.evaluate(() => document.querySelectorAll('#libList .lib-item').length);
check('filtrare pe dosar', vis === 1, vis);
await page.click('#libChips button:nth-child(1)');
// mutare + notă
await page.selectOption('#libList .lib-item:first-child .lib-mv', 'Teza');
st = await page.evaluate(() => _lib.map(x => x.f));
check('mutarea unei referințe între dosare', st.includes('Teza'), st);
await page.fill('#libList .lib-item:first-child .lib-nt', 'De citit înainte de capitolul 2');
await page.press('#libList .lib-item:first-child .lib-nt', 'Tab');
st = await page.evaluate(() => JSON.parse(localStorage.getItem('academisearch.library')).map(x => x.note));
check('nota se salvează în localStorage', st.includes('De citit înainte de capitolul 2'), st);
// export dosar .md
await page.click('#libChips button:nth-child(3)'); // Teza
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=libExport][data-a=\'["md"]\']')]);
const fs = await import('node:fs'); const md = fs.readFileSync(await dl.path(), 'utf8');
check('export .md: titlu dosar, lucrare și notă', /^# Teza/.test(md) && /lucrare salvată/.test(md) && /De citit/.test(md), md);
check('export .md: nume de fișier cu dosarul', /teza/.test(dl.suggestedFilename()) && dl.suggestedFilename().endsWith('.md'), dl.suggestedFilename());
const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=libExport][data-a=\'["bib"]\']')]);
const bib = fs.readFileSync(await dl2.path(), 'utf8');
check('export BibTeX conține nota', /note = \{De citit/.test(bib), bib);
// ștergere dosar în doi pași
await page.click('#libFoldDel');
st = await page.evaluate(() => _fold.list.length); check('ștergerea dosarului cere confirmare (primul clic nu șterge)', st === 2, st);
await page.click('#libFoldDel');
st = await page.evaluate(() => ({l: _fold.list, lib: _lib.map(x => x.f), cur: _libFolder}));
check('ștergere dosar: referințele rămân, fără dosar', st.l.join() === 'Cursuri' && st.lib.every(f => f !== 'Teza') && st.lib.length === 2 && st.cur === null, st);
await page.reload(); await page.waitForTimeout(800);
st = await page.evaluate(() => ({l: _fold.list, n: _lib.length}));
check('dosarele persistă după reîncărcare', st.l.join() === 'Cursuri' && st.n === 2, st);
const keys = await page.evaluate(() => Object.keys(localStorage));
check('chei localStorage cu prefix academisearch.', keys.every(k => /^(fff\.)?academisearch\./.test(k)), keys);

// --- rețea de citări
oaCalls = 0;
await page.evaluate(() => { citeOpen('Graph Centre Paper', '10.1234/abc'); });
await page.waitForSelector('#citeGraph svg', {timeout: 15000});
const cg = await page.evaluate(() => ({nodes: document.querySelectorAll('#citeGraph a').length, ref: document.querySelectorAll('.cite-ref').length, by: document.querySelectorAll('.cite-by').length,
  msg: document.getElementById('citeMsg').textContent, lists: document.querySelectorAll('#citeLists li').length, imgs: document.querySelectorAll('#citeDlg img').length,
  firstRef: document.querySelector('#citeLists ul li .lib-item-title').textContent, aria: document.querySelector('.cite-svg').getAttribute('aria-label')}));
check('graf: 1 centru + 2 referințe + 3 citări', cg.nodes === 6 && cg.ref === 2 && cg.by === 3, cg);
check('referințele sunt sortate după citări (cea mai citată prima)', cg.firstRef === 'Old Foundation', cg.firstRef);
check('rezumat cu totaluri și titlu accesibil pe graf', /2/.test(cg.msg) && /3/.test(cg.msg) && /Graph Centre Paper/.test(cg.aria), cg);
check('titlu ostil din API nu e interpretat ca HTML', cg.imgs === 0 && dlgs.length === 0);
await page.click('#citeLists button[data-cite=c]'); // Big Follower
st = await page.evaluate(() => ({keys: _lib.map(x => x.k), f: _lib[0].f, act: _fold.active, msg: document.getElementById('citeMsg').textContent}));
check('„Salvează” din graf adaugă în bibliotecă (DOI normalizat, dosar activ)', st.keys[0] === 'doi:10.9/big' && st.f === st.act, st);
check('nodul salvat e marcat ca fiind în bibliotecă', await page.evaluate(() => document.querySelectorAll('#citeGraph .cite-lib').length) >= 1);
// fără DOI: căutare după titlu exact
await page.evaluate(() => citeOpen('Title only work', ''));
await page.waitForFunction(() => /0/.test(document.getElementById('citeMsg').textContent) && document.querySelector('#citeGraph svg'), null, {timeout: 15000});
check('fără DOI: lucrarea se găsește după titlu', true);
// negăsit
await page.evaluate(() => citeOpen('Lucrare inexistentă', '10.0000/none'));
await page.waitForFunction(() => document.getElementById('citeMsg').textContent.length > 5 && !document.querySelector('#citeGraph svg'), null, {timeout: 15000});
check('lucrare negăsită: mesaj, fără graf', await page.evaluate(() => document.getElementById('citeGraph').children.length === 0));
check('rețea: doar api.openalex.org', [...hosts].every(h => h === 'api.openalex.org'), [...hosts]);
await page.keyboard.press('Escape'); await page.waitForTimeout(100);
check('Esc închide dialogul de citări', await page.evaluate(() => !document.getElementById('citeDlg').open));
// i18n
const miss = await page.evaluate(() => { const o = []; for (const k in AX) for (const l of ['ro','en','fr','de','es','pt','it','hu']) if (!TRANSLATIONS[l][k]) o.push(l + ':' + k); return o; });
check('chei noi în toate cele 8 limbi', miss.length === 0, miss);
for (const L of ['en', 'de', 'hu']) {
  await page.evaluate((l) => { setLang(l); openLib(); }, L);
  const t = await page.evaluate(() => [document.getElementById('libFoldLbl').textContent, document.querySelector('[data-act=folderAdd]').textContent]);
  check('UI dosare tradus: ' + L + ' = ' + t[1], t[0].length > 3 && t[1].length > 3 && !/^(Creează dosar)$/.test(t[1]) || L === 'ro', t);
}
// 360 px: fără depășire orizontală cu dialogul deschis
await page.setViewportSize({width: 360, height: 740});
await page.evaluate(() => { setLang('en'); openLib(); });
const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
check('fără depășire orizontală la 360 px', ov <= 0, ov);
check('fără dialoguri native', dlgs.length === 0, dlgs);
check('fără erori JS', errs.length === 0, errs);
await b.close(); console.log(`\nAcademiSearch research: ${ok} ok, ${bad} eșuate`); process.exit(bad ? 1 : 0);
