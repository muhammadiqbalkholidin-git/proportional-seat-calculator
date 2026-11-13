// Membuat satu halaman HTML untuk setiap fitur di folder dist/, dengan judul, deskripsi,
// dan alamat kanonis masing-masing, supaya mesin pencari bisa mengindeks semua fitur.
// Dijalankan otomatis oleh Netlify (lihat netlify.toml):  node tools/build-pages.mjs
//
// Sejak v2.0.1, HTML awal setiap alamat:
//  - sudah berisi teks bahasa Indonesia (tidak menunggu JavaScript),
//  - langsung menampilkan halamannya sendiri dan menandai menu yang aktif,
//  - hanya memuat isi halamannya sendiri; isi halaman lain diambil dari /halaman.html
//    sebelum kode kalkulator dijalankan, sehingga perpindahan halaman tetap cepat.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://proportional-seat-calculator.netlify.app';
const html = readFileSync(join(root, 'index.html'), 'utf8');
const navJs = readFileSync(join(root, 'js/navigasi.js'), 'utf8');
const versi = (html.match(/\?v=([0-9.]+)/) || [])[1] || '';

function ambilKonstanta(nama) {
  const awal = navJs.indexOf('const ' + nama + '=');
  if (awal < 0) throw new Error('Konstanta tidak ditemukan di js/navigasi.js: ' + nama);
  const akhir = navJs.indexOf('};\n', awal);
  const ctx = {};
  vm.runInNewContext('var ' + navJs.slice(awal + 6, akhir + 2), ctx);
  return ctx[nama];
}
const PATHS = ambilKonstanta('PAGE_PATHS');
const META = ambilKonstanta('PAGE_META');
const sctx = {};
vm.runInNewContext(readFileSync(join(root, 'js/teks.js'), 'utf8').replace('const STRINGS=', 'var STRINGS='), sctx);
const TEKS = sctx.STRINGS.id;

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function ganti(teks, pola, isi, nama) {
  if (!pola.test(teks)) throw new Error('Pola tidak ditemukan: ' + nama);
  return teks.replace(pola, isi);
}

/* ---------- isi teks data-i18n langsung ke HTML (sama seperti setLang('id') di browser) ---------- */
const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'source']);
function isiTeks(h) {
  const titik = [...h.matchAll(/data-i18n="([^"]+)"/g)].map(m => ({ k: m[1], i: m.index }));
  for (let n = titik.length - 1; n >= 0; n--) {
    const { k, i } = titik[n];
    if (TEKS[k] === undefined) continue;
    const buka = h.lastIndexOf('<', i);
    const tag = h.slice(buka + 1).match(/^([a-zA-Z0-9]+)/)[1].toLowerCase();
    if (VOID.has(tag)) continue;
    const akhirBuka = h.indexOf('>', i) + 1;
    let kedalaman = 1, pos = akhirBuka;
    const re = new RegExp('<(/?)' + tag + '(?=[\\s>/])', 'gi');
    re.lastIndex = pos;
    let m;
    while ((m = re.exec(h))) {
      if (m[1]) { kedalaman--; if (kedalaman === 0) { pos = m.index; break; } }
      else kedalaman++;
    }
    if (kedalaman !== 0) throw new Error('Tag tidak seimbang untuk data-i18n=' + k);
    h = h.slice(0, akhirBuka) + TEKS[k] + h.slice(pos);
  }
  return h;
}

/* ---------- potong blok halaman ---------- */
function blokHalaman(h, id) {
  const awal = h.indexOf('<div id="page-' + id + '"');
  if (awal < 0) throw new Error('Halaman tidak ditemukan: ' + id);
  const akhir = h.indexOf('\n</div>\n', awal);
  return { awal, akhir: akhir + 7 };
}

let dasar = html.replace(/(href|src)="(css|js)\//g, '$1="/$2/');
dasar = isiTeks(dasar);
const ids = Object.keys(PATHS);

// /halaman.html: isi semua halaman, dipakai pemuat di setiap alamat
const semua = ids.map(id => { const b = blokHalaman(dasar, id); return dasar.slice(b.awal, b.akhir); }).join('\n');

// pemuat kode: isi halaman lain dulu, baru jalankan berkas js/ berurutan
const berkasJs = [...dasar.matchAll(/<script src="(\/js\/[^"]+)"><\/script>\n?/g)];
if (!berkasJs.length) throw new Error('Tag <script src="/js/..."> tidak ditemukan');
const daftarJs = JSON.stringify(berkasJs.map(m => m[1]));
const pemuat = `<script>
(function(){
  var js=${daftarJs};
  function jalankan(i){if(i>=js.length)return;var s=document.createElement('script');s.src=js[i];s.onload=s.onerror=function(){jalankan(i+1);};document.body.appendChild(s);}
  var kosong=[].slice.call(document.querySelectorAll('.page[data-lazy]'));
  if(!kosong.length){jalankan(0);return;}
  fetch('/halaman.html?v=${versi}').then(function(r){return r.text();}).then(function(t){
    var d=new DOMParser().parseFromString(t,'text/html');
    kosong.forEach(function(el){var src=d.getElementById(el.id);if(src)el.innerHTML=src.innerHTML;el.removeAttribute('data-lazy');});
  }).catch(function(){}).then(function(){jalankan(0);});
})();
</script>
`;

function ldHalaman(id, url, judul) {
  if (id === 'about') {
    return {
      '@context': 'https://schema.org', '@type': 'ProfilePage', url,
      mainEntity: {
        '@type': 'Person', name: 'Muhammad Iqbal Kholidin', jobTitle: 'Peneliti Pemilu',
        affiliation: { '@type': 'Organization', name: 'Perkumpulan untuk Pemilu dan Demokrasi (Perludem)', url: 'https://perludem.or.id' },
        sameAs: ['https://orcid.org/0009-0008-4313-7644', 'https://www.linkedin.com/in/muhammadiqbalkholidin/',
          'https://kolom.kompas.com/7927/muhammad-iqbal-kholidin', 'https://kolom.kompas.com/11042/muhammad-iqbal-kholidin',
          'https://github.com/muhammadiqbalkholidin-git'],
      },
    };
  }
  if (id === 'home') return null;
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: judul.split(' | ')[0], item: url },
    ],
  };
}

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist);

const halaman = [];
for (const [id, path] of Object.entries(PATHS)) {
  const [judul, deskripsi] = META[id].id;
  const url = SITE + path;
  let h = dasar;
  // halaman lain dikosongkan (diambil dari /halaman.html), halaman ini ditampilkan
  for (const lain of [...ids].reverse()) {
    const b = blokHalaman(h, lain);
    if (lain === id) {
      const blok = h.slice(b.awal, b.akhir).replace(/^<div id="page-([a-z]+)" class="page[^"]*">/, '<div id="page-$1" class="page show">');
      h = h.slice(0, b.awal) + blok + h.slice(b.akhir);
    } else {
      h = h.slice(0, b.awal) + `<div id="page-${lain}" class="page" data-lazy="1"></div>` + h.slice(b.akhir);
    }
  }
  // menu aktif
  h = h.replace(/(<a id="nb-[a-z]+") class="active"/g, '$1');
  h = h.replace(new RegExp('<a id="nb-' + id + '"'), `<a id="nb-${id}" class="active"`);
  if (['tutorial', 'meth', 'validasi'].includes(id)) h = h.replace('<div class="dd" id="ddGuide">', '<div class="dd active" id="ddGuide">');
  h = ganti(h, /<html lang="id">/, `<html lang="id" data-page="${id}">`, 'html');
  h = ganti(h, /<title>[^<]*<\/title>/, `<title>${esc(judul)}</title>`, 'title');
  h = ganti(h, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(deskripsi)}">`, 'description');
  h = ganti(h, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, 'canonical');
  h = ganti(h, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(judul)}">`, 'og:title');
  h = ganti(h, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(deskripsi)}">`, 'og:description');
  h = ganti(h, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`, 'og:url');
  const ld = ldHalaman(id, url, judul);
  if (ld) h = h.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
  // ganti tag script js/ dengan pemuat
  h = h.replace(berkasJs.map(m => m[0]).join(''), pemuat);
  if (h.includes('<script src="/js/')) throw new Error('Tag script js/ masih tersisa di ' + id);
  const folder = join(dist, path);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'index.html'), h);
  halaman.push(url);
}

writeFileSync(join(dist, 'halaman.html'),
  '<!DOCTYPE html>\n<html lang="id"><head><meta charset="UTF-8"><meta name="robots" content="noindex, nofollow"><title>Isi halaman</title></head><body>\n' + semua + '\n</body></html>\n');

// halaman 404
const logo = (dasar.match(/<span class="brand-logo">(<svg.*?<\/svg>)<\/span>/s) || [])[1] || '';
const tema = (dasar.match(/<script>\(function\(\)\{try\{var t=localStorage[\s\S]*?<\/script>/) || [''])[0];
writeFileSync(join(dist, '404.html'), `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Halaman tidak ditemukan | Kalkulator Kursi Pemilu Proporsional</title><meta name="robots" content="noindex">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
${tema}
<link rel="stylesheet" href="/css/style.css?v=${versi}"></head>
<body>
<header class="hdr"><div class="hdr-in"><a class="brand" href="/"><span class="brand-logo">${logo}</span><span class="brand-tx"><b>Kalkulator Kursi</b><small>Pemilu Proporsional · Iqbal Kholidin</small></span></a></div></header>
<div class="phero"><div class="phero-in"><span class="eyebrow">404</span><h1>Halaman tidak ditemukan</h1>
<p class="phero-sub">Alamat yang Anda buka tidak ada atau sudah dipindahkan. Kalkulator Satu Dapil kini berada di /satu-dapil/.<br>The page you opened does not exist or has moved. The Single-District Calculator is now at /satu-dapil/.</p>
<div class="home-ctas"><a class="btn-a" href="/" style="text-decoration:none">Beranda</a><a class="btn-w" href="/satu-dapil/" style="text-decoration:none">Kalkulator Satu Dapil</a></div></div></div>
</body></html>
`);

for (const f of ['favicon.svg', 'og-image.png', 'apple-touch-icon.png', 'robots.txt']) copyFileSync(join(root, f), join(dist, f));
for (const d of ['css', 'js']) cpSync(join(root, d), join(dist, d), { recursive: true });

const tanggal = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  halaman.map(u => `  <url><loc>${u}</loc><lastmod>${tanggal}</lastmod></url>`).join('\n') + '\n</urlset>\n');

console.log(`${halaman.length} halaman dibuat di dist/:\n` + halaman.join('\n'));
