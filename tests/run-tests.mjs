// Uji otomatis Kalkulator Kursi Pemilu Proporsional.
// Jalankan dari folder repositori:  node tests/run-tests.mjs
// Fungsi dan data diambil langsung dari berkas js/ yang dimuat index.html, jadi yang diuji adalah kode yang benar-benar tayang.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Kode aplikasi ada di folder js/, dimuat sesuai urutan tag <script> di index.html.
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const urutanJs = [...indexHtml.matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]);
// Cadangan untuk struktur lama (sebelum v1.4.1), ketika seluruh kode masih berada di dalam index.html.
const html = urutanJs.length ? urutanJs.map(f => readFileSync(join(root, f), 'utf8')).join('\n') : indexHtml;
const resmi = JSON.parse(readFileSync(join(root, 'tests/fixtures/dpr2024-kursi-resmi-per-dapil.json'), 'utf8'));

function ambilFungsi(nama) {
  const awal = html.indexOf('\nfunction ' + nama + '(');
  if (awal < 0) throw new Error('Fungsi tidak ditemukan di js/: ' + nama);
  const akhir = html.indexOf('\n}\n', awal);
  return html.slice(awal + 1, akhir + 2);
}
function ambilKonstanta(nama) {
  const awal = html.indexOf('const ' + nama + '=');
  if (awal < 0) throw new Error('Konstanta tidak ditemukan di js/: ' + nama);
  const akhir = html.indexOf(';\n', awal);
  return html.slice(awal, akhir + 1).replace(/^const /, 'var ');
}

const kode = [
  'var roundMode = "none"; var lembaga = "table"; var currentLang = "id";',
  ...['qv', 'isOut', 'sainteLague', 'dhondt', 'hare', 'droop', 'divisorNext', 'findTieDivisor', 'findTieQuota',
    'buildDivisorTrace', 'buildDHondtTrace', 'divisorAt', 'mdSeatOrder', 'mdLastSeat', 'fmtNum', 'fmtDec', 'nationalEligible2024', 'idxFormulas', 'raceData', 'buildHareTrace', 'buildDroopTrace', 'quotaRaceData', 'hemicycleLayout', 'voteSeatRows', 'runValidation'].map(ambilFungsi),
  ...['DPR2024', 'DPR2024_SEATS', 'MD_DPR2024_PARTIES', 'MD_DPR2024', 'MD_DPR2024_RESMI'].map(ambilKonstanta),
].join('\n');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(kode, ctx);
const { sainteLague, dhondt, hare, droop, findTieDivisor, findTieQuota, mdLastSeat, DPR2024, DPR2024_SEATS, MD_DPR2024_PARTIES, MD_DPR2024, MD_DPR2024_RESMI } = ctx;

let lulus = 0, gagal = 0;
function cek(judul, hasil, harapan) {
  const a = JSON.stringify(hasil), b = JSON.stringify(harapan);
  if (a === b) { lulus++; console.log('  lulus  ' + judul); }
  else { gagal++; console.log('  GAGAL  ' + judul + '\n         hasil:   ' + a + '\n         harapan: ' + b); }
}
const urut = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v > 0).sort(([x], [y]) => x.localeCompare(y)));

console.log('\n1. Contoh hitung manual (4 partai, 6 kursi)');
const P = [{ name: 'A', votes: 41000 }, { name: 'B', votes: 29000 }, { name: 'C', votes: 17000 }, { name: 'D', votes: 13000 }];
cek('Sainte-Laguë', sainteLague(P, 6, 1), { A: 2, B: 2, C: 1, D: 1 });
cek('SL Modifikasi (pembagi pertama 1,4)', sainteLague(P, 6, 1.4), { A: 2, B: 2, C: 1, D: 1 });
cek("D'Hondt", dhondt(P, 6), { A: 3, B: 2, C: 1, D: 0 });
cek('Kuota Hare', hare(P, 6), { A: 2, B: 2, C: 1, D: 1 });
cek('Kuota Droop', droop(P, 6), { A: 2, B: 2, C: 1, D: 1 });

console.log('\n2. Kasus pinggiran');
cek('Total suara nol tidak membagikan kursi', sainteLague([{ name: 'X', votes: 0 }, { name: 'Y', votes: 0 }], 3, 1), { X: 0, Y: 0 });
const seri = [{ name: 'X', votes: 100 }, { name: 'Y', votes: 100 }];
cek('Nilai seri pada kursi terakhir terdeteksi', findTieDivisor(seri, 1, sainteLague(seri, 1, 1), 1, 'sl'), ['X', 'Y']);
cek('Tidak ada seri pada contoh biasa', findTieDivisor(P, 6, sainteLague(P, 6, 1), 1, 'sl'), null);
cek('Kuota Hare tanpa seri', findTieQuota(P, 6, 'hare'), null);

console.log('\n3. Preset Kalkulator (Keputusan KPU 1205/2024)');
cek('18 partai', DPR2024.length, 18);
cek('Total suara sah 151.793.293', DPR2024.reduce((a, [, v]) => a + v, 0), 151793293);
cek('Total kursi resmi 580', Object.values(DPR2024_SEATS).reduce((a, b) => a + b, 0), 580);

console.log('\n4. Preset Multi-Dapil (Keputusan KPU 360/2024) dibandingkan kursi resmi (Keputusan KPU 1206/2024)');
cek('84 dapil', MD_DPR2024.length, 84);
cek('Urutan dapil sama dengan urutan kode KPU', MD_DPR2024.map(r => r[0]), resmi.dapil.map(d => d.nama));
cek('Total kursi 580', MD_DPR2024.reduce((a, r) => a + r[1], 0), 580);
cek('Total suara sah 151.796.631', MD_DPR2024.reduce((a, r) => a + r.slice(2).reduce((x, y) => x + y, 0), 0), 151796631);

const nasional = {};
MD_DPR2024.forEach(r => r.slice(2).forEach((v, i) => { nasional[MD_DPR2024_PARTIES[i]] = (nasional[MD_DPR2024_PARTIES[i]] || 0) + v; }));
const totalNas = Object.values(nasional).reduce((a, b) => a + b, 0);
const lolos = MD_DPR2024_PARTIES.filter(p => nasional[p] / totalNas * 100 >= 4);
cek('8 partai lolos ambang 4%', lolos.length, 8);

let dapilCocok = 0; const dapilBeda = []; const totalKursi = {};
MD_DPR2024.forEach((r, i) => {
  const [nama, kursi, ...suara] = r;
  const pts = MD_DPR2024_PARTIES.map((p, j) => ({ name: p, votes: suara[j] })).filter(x => lolos.includes(x.name));
  const hasil = urut(sainteLague(pts, kursi, 1));
  Object.entries(hasil).forEach(([p, k]) => { totalKursi[p] = (totalKursi[p] || 0) + k; });
  if (JSON.stringify(hasil) === JSON.stringify(urut(resmi.dapil[i].perolehan))) dapilCocok++;
  else dapilBeda.push(nama);
});
cek('Sainte-Laguë per dapil sama dengan kursi resmi di 84 dapil', { cocok: dapilCocok, beda: dapilBeda }, { cocok: 84, beda: [] });
cek('Total kursi nasional sama dengan penetapan resmi', urut(totalKursi), urut(DPR2024_SEATS));

console.log('\n5. Kursi resmi yang tertanam di halaman dan analisis kursi terakhir');
cek('Tabel kursi resmi di index.html sama dengan berkas acuan', MD_DPR2024_RESMI.map(r => r.join(',')), resmi.dapil.map(d => MD_DPR2024_PARTIES.slice(0, 8).map(p => d.perolehan[p] || 0).join(',')));
const aceh = MD_DPR2024[0];
const ptsAceh = MD_DPR2024_PARTIES.map((p, j) => ({ name: p, votes: aceh[j + 2] })).filter(x => lolos.includes(x.name));
const L = mdLastSeat(ptsAceh, aceh[1], 0);
cek('Aceh I: urutan kursi Sainte-Laguë', L.order.map(r => r.party), ['PKB', 'Golkar', 'PAN', 'NasDem', 'PDI-P', 'Demokrat', 'PKS']);
cek('Aceh I: kursi terakhir PKS, penantang terdekat PKB (÷3)', [L.last.party, Math.round(L.last.quotient), L.ch.party, L.ch.divisor], ['PKS', 119581, 'PKB', 3]);
cek('Aceh I: tambahan suara penantang 38.711', L.extra, 38711);

console.log('\n6. Sakelar pembulatan dua desimal (PKPU 6/2024 Pasal 13 ayat 2)');
const setMode = m => vm.runInContext('roundMode = ' + JSON.stringify(m), ctx);
setMode('round'); cek('Dibulatkan: 119.581,666 menjadi 119.581,67', ctx.qv(358745 / 3), 119581.67);
setMode('trunc'); cek('Dipotong: 119.581,666 menjadi 119.581,66', ctx.qv(358745 / 3), 119581.66);
for (const m of ['round', 'trunc']) {
  setMode(m);
  let sama = 0;
  MD_DPR2024.forEach((r, i) => {
    const pts = MD_DPR2024_PARTIES.map((p, j) => ({ name: p, votes: r[j + 2] })).filter(x => lolos.includes(x.name));
    if (JSON.stringify(urut(sainteLague(pts, r[1], 1))) === JSON.stringify(urut(resmi.dapil[i].perolehan))) sama++;
  });
  cek(`Mode ${m === 'round' ? 'dibulatkan' : 'dipotong'}: 84 dapil tetap sama dengan kursi resmi`, sama, 84);
}
setMode('none');

console.log('\n7. Aturan ambang batas');
const setL = m => vm.runInContext('lembaga = ' + JSON.stringify(m), ctx);
const kecil = { name: 'K', votes: 10, pass: false }, besar = { name: 'B', votes: 990, pass: true };
setL('table'); cek('Ambang dari suara tabel: partai di bawah 4% tidak ikut', [ctx.isOut(kecil, 1000, 4), ctx.isOut(besar, 1000, 4)], [true, false]);
setL('manual'); cek('Kelolosan per partai: hanya partai yang tidak dicentang yang tidak ikut', [ctx.isOut(kecil, 1000, 4), ctx.isOut({ ...kecil, pass: true }, 1000, 4)], [true, false]);
setL('none'); cek('Tanpa ambang batas: semua partai ikut', ctx.isOut(kecil, 1000, 4), false);
setL('table');

console.log('\n8. Halaman Validasi (fungsi yang sama dengan yang berjalan di browser)');
const grup = ctx.runValidation();
grup.forEach(g => g.items.forEach(i => cek(g.title.replace(/^\d+\. /, '') + ' | ' + i.name, i.ok, true)));

console.log('\n9. Halaman, menu, teks, dan mode tampilan (v2.0.0)');
{
  const navJs = readFileSync(join(root, 'js/navigasi.js'), 'utf8');
  const ambilObj = nama => { const a = navJs.indexOf('const ' + nama + '='); const b = navJs.indexOf('};\n', a); const c = {}; vm.runInNewContext('var ' + navJs.slice(a + 6, b + 2), c); return c[nama]; };
  const PATHS = ambilObj('PAGE_PATHS'), META = ambilObj('PAGE_META');
  cek('Beranda ada di alamat utama, Satu Dapil di /satu-dapil/', [PATHS.home, PATHS.calc], ['/', '/satu-dapil/']);
  const alamat = Object.values(PATHS);
  cek('Setiap halaman punya alamat yang berbeda', new Set(alamat).size, alamat.length);
  const ids = Object.keys(PATHS);
  cek('Setiap alamat punya elemen halaman di index.html', ids.filter(id => !indexHtml.includes('id="page-' + id + '"')), []);
  cek('Setiap halaman punya tombol menu', ids.filter(id => !indexHtml.includes('id="nb-' + id + '"')), []);
  cek('Setiap halaman punya judul dan deskripsi ID/EN', ids.filter(id => !(META[id] && META[id].id && META[id].en && META[id].id.length === 2 && META[id].en.length === 2)), []);
  const sc = {}; vm.runInNewContext(readFileSync(join(root, 'js/teks.js'), 'utf8').replace('const STRINGS=', 'var STRINGS='), sc);
  const kunci = [...new Set([...indexHtml.matchAll(/data-i18n(?:-title)?="([^"]+)"/g)].map(m => m[1]))];
  cek('Setiap teks di halaman tersedia dalam bahasa Indonesia', kunci.filter(k => sc.STRINGS.id[k] === undefined), []);
  cek('Setiap teks di halaman tersedia dalam bahasa Inggris', kunci.filter(k => sc.STRINGS.en[k] === undefined), []);
  const css = readFileSync(join(root, 'css/style.css'), 'utf8');
  const blok = sel => { const a = css.indexOf(sel + '{'); return a < 0 ? [] : [...css.slice(a, css.indexOf('}', a)).matchAll(/(--[a-z0-9-]+):/g)].map(m => m[1]).sort(); };
  const terang = blok(':root'), gelap = blok(':root[data-theme="dark"]');
  cek('Mode gelap mendefinisikan semua warna mode terang', terang.filter(v => !gelap.includes(v)), []);
  cek('Tag verifikasi Google Search Console tetap terpasang', indexHtml.includes('name="google-site-verification" content="TLq7FvQ8f8-oUe4l9dHdMwVho1fnSDwMET4ZLl99cEE"'), true);
}

console.log(`\n${lulus} lulus, ${gagal} gagal\n`);
process.exit(gagal ? 1 : 0);
