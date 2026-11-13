// Uji hasil build (folder dist/), dijalankan Netlify setelah tools/build-pages.mjs.
// Memastikan HTML awal setiap alamat bisa dibaca mesin pencari tanpa JavaScript:
// teks sudah terisi, halaman yang benar tampil, dan isi tiap alamat berbeda.
//   node tools/build-pages.mjs && node tests/check-dist.mjs

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
let lulus = 0, gagal = 0;
function cek(judul, hasil, harapan) {
  const ok = JSON.stringify(hasil) === JSON.stringify(harapan);
  if (ok) { lulus++; console.log('  lulus  ' + judul); }
  else { gagal++; console.log('  GAGAL  ' + judul + '\n         hasil:   ' + JSON.stringify(hasil) + '\n         harapan: ' + JSON.stringify(harapan)); }
}
const navJs = readFileSync(join(root, 'js/navigasi.js'), 'utf8');
const a = navJs.indexOf('const PAGE_PATHS='), b = navJs.indexOf('};\n', a);
const c = {}; vm.runInNewContext('var ' + navJs.slice(a + 6, b + 2), c);
const PATHS = c.PAGE_PATHS;
const sc = {}; vm.runInNewContext(readFileSync(join(root, 'js/teks.js'), 'utf8').replace('const STRINGS=', 'var STRINGS='), sc);
const TEKS = sc.STRINGS.id;
const teksPolos = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

console.log('\nHTML awal setiap alamat (dist/)');
const sidik = {};
for (const [id, path] of Object.entries(PATHS)) {
  const f = join(dist, path, 'index.html');
  if (!existsSync(f)) { cek(path + ' ada', false, true); continue; }
  const h = readFileSync(f, 'utf8');
  cek(path + ' menampilkan halamannya sendiri', [...h.matchAll(/id="page-([a-z]+)" class="page show"/g)].map(m => m[1]), [id]);
  cek(path + ' hanya memuat isi halamannya sendiri', [...h.matchAll(/<div id="page-([a-z]+)" class="page" data-lazy="1"><\/div>/g)].length, Object.keys(PATHS).length - 1);
  cek(path + ' menandai menu yang benar', [...h.matchAll(/<a id="nb-([a-z]+)" class="active"/g)].map(m => m[1]), [id]);
  const awal = h.indexOf('<div id="page-' + id + '"'), akhir = h.indexOf('\n</div>\n', awal);
  const blok = h.slice(awal, akhir);
  const kosong = [...blok.matchAll(/data-i18n="([^"]+)"[^>]*><\/(?:span|p|h1|h2|h3|h4|div|li|td|small|b|strong|a|button|label|option|th)>/g)].map(m => m[1]).filter(k => TEKS[k]);
  cek(path + ' tidak punya teks kosong', kosong, []);
  cek(path + ' memakai alamat kanonis yang benar', h.includes(`<link rel="canonical" href="https://proportional-seat-calculator.netlify.app${path}">`), true);
  cek(path + ' memuat kode lewat pemuat, bukan tag script langsung', [h.includes("fetch('/halaman.html"), h.includes('<script src="/js/')], [true, false]);
  sidik[path] = createHash('md5').update(teksPolos(h)).digest('hex');
}
cek('Isi teks setiap alamat berbeda', new Set(Object.values(sidik)).size, Object.keys(PATHS).length);
const hal = existsSync(join(dist, 'halaman.html')) ? readFileSync(join(dist, 'halaman.html'), 'utf8') : '';
cek('halaman.html memuat semua halaman dan tidak diindeks', [Object.keys(PATHS).every(id => hal.includes('id="page-' + id + '"')), hal.includes('noindex')], [true, true]);
cek('Halaman 404 tersedia dan tidak diindeks', existsSync(join(dist, '404.html')) && readFileSync(join(dist, '404.html'), 'utf8').includes('noindex'), true);
const sm = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
cek('Sitemap memuat semua alamat dan tidak memuat halaman bantu', [Object.values(PATHS).every(p => sm.includes(`netlify.app${p}<`)), sm.includes('halaman.html') || sm.includes('404')], [true, false]);

console.log(`\n${lulus} lulus, ${gagal} gagal\n`);
process.exit(gagal ? 1 : 0);
