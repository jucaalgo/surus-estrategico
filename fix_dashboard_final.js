/**
 * fix_dashboard_final.js
 * Corrige mojibake en dashboard/index.html
 * Ejecutar: node fix_dashboard_final.js
 */
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, 'public', 'dashboard', 'index.html');

let h = fs.readFileSync(f, 'utf8');
console.log('Leido:', Buffer.byteLength(h, 'utf8'), 'bytes');
console.log('Titulo:', h.slice(h.indexOf('<title>'), h.indexOf('</title>') + 8));

// ---- PASO 1: Multi-byte patterns (3+ chars) ----
// Em dash: U+00E2+U+20AC+U+201D/U+201C -> U+2014
h = h.split('\u00e2\u20ac\u201d').join('\u2014');
h = h.split('\u00e2\u20ac\u201c').join('\u2014');
// Euro: U+00E2+U+201A+U+00AC -> U+20AC
h = h.split('\u00e2\u201a\u00ac').join('\u20ac');
// Arrow: U+00E2+U+2020 -> U+2192 (â† -> →)
h = h.split('\u00e2\u2020').join('\u2192');

// ---- PASO 2: Double-encoded accent pairs ----
const accentPairs = [
  ['\u00c3\u00a1', '\u00e1'], ['\u00c3\u00a9', '\u00e9'],
  ['\u00c3\u00ad', '\u00ed'], ['\u00c3\u00b3', '\u00f3'],
  ['\u00c3\u00ba', '\u00fa'], ['\u00c3\u00b1', '\u00f1'],
  ['\u00c3\u00bc', '\u00fc'], // ü
  ['\u00c3\u00a4', '\u00e4'], // ä
  ['\u00c3\u00b6', '\u00f6'], // ö
  ['\u00c3\u0081', '\u00c1'], ['\u00c3\u0089', '\u00c9'],
  ['\u00c3\u008d', '\u00cd'], ['\u00c3\u0093', '\u00d3'],
  ['\u00c3\u009a', '\u00da'], ['\u00c3\u0091', '\u00d1'],
  ['\u00c3\u009c', '\u00dc'], // Ü
  ['\u00c3\u0097', '\u00d7'], // × (multiplication)
  ['\u00c2\u00b7', '\u00b7'], // · (punto medio)
  ['\u00c2\u00aa', '\u00aa'], // ª
  ['\u00c2\u00b3', '\u00b3'], // ³
  ['\u00c5\u00a1', '\u0161'], // š
  ['\u00c5\u00a0', '\u0160'], // Š
];

let count = 0;
for (const [from, to] of accentPairs) {
  const n = h.split(from).length - 1;
  if (n > 0) { h = h.split(from).join(to); count += n; }
}

// ---- PASO 3: Special cases ----
// Ãœ -> Ü (U+00C3+U+0153) for DÜRR, GÜDEL
h = h.split('\u00c3\u0153').join('\u00dc');
// Control char U+0081
h = h.split('\u0081').join('');

// ---- PASO 4: Verify ----
console.log('Titulo final:', h.slice(h.indexOf('<title>'), h.indexOf('</title>') + 8));
console.log('Reemplazos:', count);

// Stats
const checks = ['á','é','í','ó','ú','ñ','ü','ä','ö','€','—','·','Ü','×','→','Š'];
const stats = {};
for (const c of checks) {
  const n = h.split(c).length - 1;
  if (n > 0) stats[c] = n;
}
console.log('Stats:', JSON.stringify(stats));

// Broken chars check
const badCPs = [0xC2, 0xC3, 0xC5, 0xE2, 0xAC, 0xAD, 0xB3, 0xA1, 0xA9, 0xBA, 0xBC, 0x81, 0x153, 0x201A, 0x201D, 0x2020, 0xFFFD, 0x2018];
let badRemaining = {};
for (let i = 0; i < h.length; i++) {
  const cp = h.charCodeAt(i);
  if (badCPs.includes(cp)) {
    if (!badRemaining[cp]) badRemaining[cp] = 0;
    badRemaining[cp]++;
  }
}
const badKeys = Object.keys(badRemaining);
if (badKeys.length === 0) {
  console.log('NO quedan caracteres rotos!');
} else {
  console.log('Quedan rotos:', JSON.stringify(badRemaining));
  for (let i = 0; i < h.length; i++) {
    const cp = h.charCodeAt(i);
    if (badCPs.includes(cp)) {
      console.log('  U+' + cp.toString(16) + ' ctx:', JSON.stringify(h.slice(Math.max(0,i-5),i+10)));
      break;
    }
  }
}

fs.writeFileSync(f, h, 'utf8');
console.log('OK');
