// Teste r8 (14 oct. 2026): relevanță locală (FFF.search) în rezultate + „Biblioteca mea”.
// Rulare: node tests/fff-r8.test.mjs  (Playwright din /opt/node-tools, Chromium local, rețea blocată)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire('/opt/node-tools/package.json');
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.join(HERE, '..', 'index.html');
const AXE = process.env.FFF_AXE || '/tmp/claude-0/-home-claude/78529928-3825-51c3-b9bd-0e81655ab6bc/scratchpad/sweep/node_modules/axe-core/axe.min.js';
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };

const ITEMS = [
  {title: 'Machine learning for protein folding', authors: 'Ana Pop; John Smith', year: '2022', journal: 'Nature Methods', doi: '10.1000/ml1', url: 'https://example.org/1', abstract: 'Deep networks predict structures of proteins.'},
  {title: 'Învățare automată în medicină', authors: 'Ion Popescu', year: '2021', journal: 'Revista Medicală', doi: '', url: 'https://example.org/2', abstract: 'Aplicații clinice ale algoritmilor.'},
  {title: 'Quantum computing basics', authors: 'Marie Curie', year: '2020', journal: '', doi: '10.1000/qc2', url: 'https://example.org/3', abstract: 'Qubits and gates.'},
  {title: 'Photosynthesis in plants', authors: 'Chlorophyll Green', year: '2019', journal: 'Plant Science', doi: '10.1000/ph3', url: 'https://example.org/4', abstract: 'Light reactions and carbon fixation in leaves.'},
  {title: 'Plant growth under artificial light', authors: 'Flora Lamp', year: '2018', journal: 'Horticulture', doi: '10.1000/pg4', url: 'https://example.org/5', abstract: 'LED spectra influence growth.'}
];

const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
async function open(w = 1280, h = 800, ctxOpts = {}) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, acceptDownloads: true, locale: 'ro-RO', ...ctxOpts});
  const net = [];
  await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { const t = m.text(); if (/Content Security Policy|Refused to/i.test(t)) errs.push('csp: ' + t); });
  await page.goto(FILE);
  await page.waitForTimeout(600);
  return {ctx, page, errs, net};
}
const titles = (page) => page.$$eval('#rmGrid .mrc-title', (els) => els.map((e) => e.textContent.trim()));
const seed = (page) => page.evaluate((items) => { openResultsModal('test'); addResults('openalex', items.map((x) => Object.assign({}, x))); }, ITEMS);

{
  const {ctx, page, errs, net} = await open();
  check('kitul e prezent (FFF.search, bundle, label)', await page.evaluate(() => !!(window.FFF && FFF.search && FFF.bundle && FFF.label)));
  check('versiune 4.3.1 în meta și în #app-version', await page.evaluate(() => document.querySelector('meta[name=application-version]').content === '4.3.1' && /^v 4\.3\.1 · 2026-10-19$/.test(document.getElementById('app-version').textContent.trim())));

  // --- relevanță locală în filtrul intern ---
  await seed(page);
  check('5 rezultate afișate', (await titles(page)).length === 5);
  await page.fill('#rmSearch', 'plants light');
  await page.waitForTimeout(500);
  let t = await titles(page);
  check('„plants light” → cele mai relevante primele (Plant growth / Photosynthesis)', t.length >= 2 && /Plant growth|Photosynthesis/.test(t[0]) && /Plant growth|Photosynthesis/.test(t[1]), t);
  check('contorul arată ordonarea după relevanță', /·/.test(await page.textContent('#rmMatchCount')), await page.textContent('#rmMatchCount'));
  await page.fill('#rmSearch', 'photosinthesis');
  await page.waitForTimeout(500);
  t = await titles(page);
  check('greșeală de scriere („photosinthesis”) găsește „Photosynthesis” (fuzzy)', t.length === 1 && /Photosynthesis/.test(t[0]), t);
  await page.fill('#rmSearch', 'invatare automata');
  await page.waitForTimeout(500);
  t = await titles(page);
  check('fără diacritice („invatare automata”) găsește titlul românesc', t.length >= 1 && /Învățare/.test(t[0]), t);
  await page.fill('#rmSearch', 'qua');
  await page.waitForTimeout(500);
  t = await titles(page);
  check('potrivirea literală veche se păstrează („qua” → Quantum)', t.some((x) => /Quantum/.test(x)), t);
  await page.fill('#rmSearch', 'zzzzqqq');
  await page.waitForTimeout(500);
  check('fără potriviri → 0 rezultate', (await titles(page)).length === 0);
  await page.fill('#rmSearch', '');
  await page.waitForTimeout(500);
  check('golind filtrul revin toate cele 5', (await titles(page)).length === 5);

  // --- salvare în bibliotecă ---
  const btns = await page.$$('#rmGrid [data-act="libToggle"]');
  check('fiecare card are buton „Salvează”', btns.length === 5);
  await btns[3].click();
  check('buton trece pe „Salvat” (aria-pressed=true)', (await btns[3].getAttribute('aria-pressed')) === 'true' && /★/.test(await btns[3].textContent()));
  await btns[0].click();
  let lib = await page.evaluate(() => JSON.parse(localStorage.getItem('as_library') || '[]'));
  check('2 referințe în localStorage (as_library)', lib.length === 2 && lib[0].title.startsWith('Machine') && lib[1].title.startsWith('Photosynthesis'), lib.map((x) => x.title));
  check('contor în subsol = 2', (await page.textContent('#libCount')) === '2');
  await btns[0].click();
  lib = await page.evaluate(() => JSON.parse(localStorage.getItem('as_library') || '[]'));
  check('al doilea clic scoate din bibliotecă', lib.length === 1);
  await btns[0].click();   // re-salvează

  // --- Escape în bibliotecă nu închide rezultatele ---
  await page.click('#rmExport [data-act="openLib"]');
  check('dialogul bibliotecii e deschis', await page.evaluate(() => document.getElementById('libDlg').open));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape închide doar biblioteca, nu și rezultatele', await page.evaluate(() => !document.getElementById('libDlg').open && document.getElementById('resultsModal').classList.contains('open')));
  check('0 erori / 0 CSP / 0 rețea în acest flux', errs.length === 0 && net.length === 0, {errs, net});
  await ctx.close();
}

{
  // --- persistență + căutare în bibliotecă + export + ștergere ---
  const {ctx, page, errs, net} = await open();
  await seed(page);
  const btns = await page.$$('#rmGrid [data-act="libToggle"]');
  await btns[3].click(); await btns[0].click(); await btns[1].click();
  await page.evaluate(() => closeResultsModal());
  await page.reload(); await page.waitForTimeout(600);
  const p2 = page, e2 = errs, c2 = ctx;
  check('după reîncărcare contorul rămâne 3', (await p2.textContent('#libCount')) === '3');
  await p2.click('#libFootBtn');
  check('dialog deschis cu 3 elemente', (await p2.$$('#libList .lib-item')).length === 3);
  check('focus în câmpul de căutare', await p2.evaluate(() => document.activeElement && document.activeElement.id === 'libSearch'));
  await p2.fill('#libSearch', 'photosinthesis');
  check('căutare locală (fuzzy) în bibliotecă', (await p2.$$eval('#libList .lib-item-title', (e) => e.map((x) => x.textContent))).join('|') === 'Photosynthesis in plants');
  await p2.fill('#libSearch', 'invatare');
  check('căutare fără diacritice în bibliotecă', (await p2.$$eval('#libList .lib-item-title', (e) => e.map((x) => x.textContent))).some((x) => /Învățare/.test(x)));
  await p2.fill('#libSearch', 'zzzzqqq');
  check('fără potriviri: mesaj', /Nicio potrivire/.test(await p2.textContent('#libList')));
  await p2.fill('#libSearch', '');
  // export
  const [dl] = await Promise.all([p2.waitForEvent('download'), p2.click('[data-act="libExport"][data-a=\'["bib"]\']')]);
  const bib = fs.readFileSync(await dl.path(), 'utf8');
  check('export BibTeX al bibliotecii (3 intrări, DOI)', (bib.match(/^@/gm) || []).length === 3 && /10\.1000\/ph3/.test(bib) && dl.suggestedFilename() === 'academisearch-biblioteca.bib', bib.slice(0, 200));
  const [dl2] = await Promise.all([p2.waitForEvent('download'), p2.click('[data-act="libExport"][data-a=\'["csv"]\']')]);
  const csv = fs.readFileSync(await dl2.path(), 'utf8');
  check('export CSV (antet + 3 rânduri)', csv.replace(/^﻿/, '').trim().split(/\r?\n/).length === 4);
  // copie de siguranță prin kit
  const bundle = await p2.evaluate(() => { const o = FFF.bundle.build(); return o; });
  check('copia .fff.json (kit) include as_library', bundle && bundle.data && typeof bundle.data.as_library === 'string' && JSON.parse(bundle.data.as_library).length === 3);
  // accesibilitate: axe în dialog
  await p2.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  const ax = await p2.evaluate(async () => (await window.axe.run(document.getElementById('libDlg'), {resultTypes: ['violations']})).violations.map((v) => v.id + ':' + v.nodes.length));
  check('axe 0 violări în dialogul bibliotecii', ax.length === 0, ax);
  // eliminare + golire în două trepte
  await p2.fill('#libSearch', '');
  await p2.click('#libList .lib-rm');
  check('„Scoate” elimină un element', (await p2.$$('#libList .lib-item')).length === 2);
  await p2.click('#libClearBtn');
  check('golirea cere confirmare (încă 2 elemente)', (await p2.$$('#libList .lib-item')).length === 2 && /din nou/.test(await p2.textContent('#libClearBtn')));
  await p2.click('#libClearBtn');
  check('a doua apăsare golește', (await p2.$$('#libList .lib-item')).length === 0 && (await p2.evaluate(() => JSON.parse(localStorage.getItem('as_library')).length)) === 0);
  check('0 erori de pagină', e2.length === 0, e2);
  await c2.close();
}

{
  // --- 360 px: dialogul nu depășește pe orizontală ---
  const {ctx, page} = await open(360, 740);
  await page.click('#libFootBtn');
  const o = await page.evaluate(() => ({doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, dlg: document.getElementById('libDlg').getBoundingClientRect().width}));
  check('fără depășire orizontală la 360 px cu dialogul deschis', o.doc <= 1 && o.dlg <= 360, o);
  await ctx.close();
}
// --- fără kit: aplicația nu se rupe (FFF șters înainte de scripturi) ---
{
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, locale: 'ro-RO'});
  await ctx.route(/^https?:/, (r) => r.abort());
  await ctx.addInitScript(() => { Object.defineProperty(window, 'FFF', {get() { return undefined; }, set() {}, configurable: true}); });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(FILE); await page.waitForTimeout(600);
  await page.evaluate((items) => { openResultsModal('t'); addResults('openalex', items); }, ITEMS);
  await page.fill('#rmSearch', 'qua'); await page.waitForTimeout(400);
  const t = await titles(page);
  check('fără FFF.search filtrul literal merge ca înainte', t.length === 1 && /Quantum/.test(t[0]), {t, errs});
  check('fără kit: 0 pageerror', errs.length === 0, errs);
  await ctx.close();
}
await b.close();
console.log(`AcademiSearch fff-r8: ${ok} ok, ${bad} eșuate`);
process.exit(bad ? 1 : 0);
