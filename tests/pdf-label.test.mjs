// Test: eticheta filtrului „Cu PDF” precizează „link direct” în toate cele 8 limbi (PDF ≠ acces deschis).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const html = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
const labels = [...html.matchAll(/'modal\.tag\.pdf':'([^']*)'/g)].map((m) => m[1]);
let bad = 0;
const check = (n, c, x) => { if (c) console.log('  ok   ' + n); else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
check('8 limbi au eticheta', labels.length === 8, labels);
check('fiecare conține „PDF (…)”', labels.every((l) => /PDF \([^)]+\)|PDF-fel \([^)]+\)/.test(l)), labels);
check('butonul din HTML are textul românesc nou', /data-i18n="modal\.tag\.pdf">⬇ Cu PDF \(link direct\)<\/button>/.test(html));
console.log('\n' + (bad ? bad + ' eșuate' : 'toate ok'));
process.exit(bad ? 1 : 0);
