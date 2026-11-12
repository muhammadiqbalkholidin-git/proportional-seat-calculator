// Membuat satu halaman HTML untuk setiap fitur di folder dist/, dengan judul, deskripsi,
// dan alamat kanonis masing-masing, supaya mesin pencari bisa mengindeks semua fitur.
// Dijalankan otomatis oleh Netlify (lihat netlify.toml):  node tools/build-pages.mjs

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://proportional-seat-calculator.netlify.app';
const html = readFileSync(join(root, 'index.html'), 'utf8');
const navJs = readFileSync(join(root, 'js/navigasi.js'), 'utf8');

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

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function ganti(teks, pola, isi, nama) {
  if (!pola.test(teks)) throw new Error('Pola tidak ditemukan: ' + nama);
  return teks.replace(pola, isi);
}

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist);

const halaman = [];
for (const [id, path] of Object.entries(PATHS)) {
  const [judul, deskripsi] = META[id].id;
  const url = SITE + path;
  let h = html;
  // Halaman ada di subfolder (misalnya /multi-dapil/), jadi alamat CSS dan JS dibuat absolut.
  h = h.replace(/(href|src)="(css|js)\//g, '$1="/$2/');
  h = ganti(h, /<html lang="id">/, `<html lang="id" data-page="${id}">`, 'html');
  h = ganti(h, /<title>[^<]*<\/title>/, `<title>${esc(judul)}</title>`, 'title');
  h = ganti(h, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(deskripsi)}">`, 'description');
  h = ganti(h, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, 'canonical');
  h = ganti(h, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(judul)}">`, 'og:title');
  h = ganti(h, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(deskripsi)}">`, 'og:description');
  h = ganti(h, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`, 'og:url');
  const folder = join(dist, path);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'index.html'), h);
  halaman.push(url);
}

for (const f of ['favicon.svg', 'og-image.png', 'apple-touch-icon.png', 'robots.txt']) copyFileSync(join(root, f), join(dist, f));
for (const d of ['css', 'js']) cpSync(join(root, d), join(dist, d), { recursive: true });

const tanggal = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  halaman.map(u => `  <url><loc>${u}</loc><lastmod>${tanggal}</lastmod></url>`).join('\n') + '\n</urlset>\n');

console.log(`${halaman.length} halaman dibuat di dist/:\n` + halaman.join('\n'));
