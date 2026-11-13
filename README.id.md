# Kalkulator Kursi Pemilu Proporsional

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24105963.svg)](https://doi.org/10.5281/zenodo.24105963)

**Kalkulator Kursi Pemilu Proporsional** adalah aplikasi web independen berbasis browser untuk melakukan simulasi alokasi kursi dalam sistem pemilu proporsional dan menghitung indeks proporsionalitas berdasarkan data suara dan kursi.

Aplikasi ini memungkinkan pengguna membandingkan bagaimana berbagai formula representasi proporsional mengonversi suara menjadi kursi, memeriksa proses perhitungan secara transparan, serta menghitung indikator proporsionalitas seperti Loosemore-Hanby Index, Least Squares Index / Gallagher Index, dan Effective Number of Parliamentary Parties.

Aplikasi:
https://proportional-seat-calculator.netlify.app/

Dikembangkan secara independen oleh **Muhammad Iqbal Kholidin**.

---

## Gambaran Umum

Sistem pemilu menentukan bagaimana suara pemilih diterjemahkan menjadi representasi politik. Formula alokasi kursi yang berbeda dapat menghasilkan distribusi kursi yang berbeda, meskipun menggunakan data suara, jumlah kursi, dan ambang batas yang sama.

Aplikasi ini dikembangkan untuk mendukung:

* penelitian sistem pemilu;
* pemahaman publik tentang representasi proporsional;
* diskusi kebijakan berbasis bukti;
* pembelajaran tentang formula alokasi kursi;
* simulasi transparan terhadap alternatif aturan pemilu;
* analisis komparatif konversi suara menjadi kursi.

Seluruh perhitungan berjalan secara lokal di browser pengguna. Data yang dimasukkan pengguna tidak dikirim ke server eksternal.

---

## Fitur Utama

### Kalkulator Alokasi Kursi Proporsional

Kalkulator utama mensimulasikan alokasi kursi menggunakan lima metode representasi proporsional:

1. **Sainte-Laguë**
2. **Sainte-Laguë Modifikasi**
3. **D’Hondt**
4. **Kuota Hare**
5. **Kuota Droop**

Pengguna dapat:

* memasukkan data suara partai secara manual;
* mengimpor data suara dari CSV;
* menentukan jumlah total kursi;
* menentukan ambang batas elektoral;
* menggunakan preset DPR 2024;
* membandingkan hasil alokasi kursi dari lima metode;
* melihat hasil dalam bentuk tabel;
* melihat hasil dalam bentuk grafik;
* memeriksa jejak hitung;
* mengunduh hasil dalam format CSV;
* mengunduh grafik dalam format PNG;
* mengunduh jejak hitung lengkap dalam format CSV.

---

### Kalkulator Indeks Proporsionalitas

Aplikasi ini juga menyediakan halaman khusus untuk menghitung indeks proporsionalitas berdasarkan relasi antara persentase suara dan persentase kursi.

Indikator yang dihitung:

1. **Loosemore-Hanby Index (LHI)**
   Mengukur total deviasi absolut antara persentase suara dan persentase kursi.

2. **Least Squares Index (LSI) / Gallagher Index**
   Mengukur disproporsionalitas suara-kursi dengan memberi bobot lebih besar pada deviasi yang besar.

3. **Effective Number of Parliamentary Parties (ENPP)**
   Mengukur jumlah efektif partai parlemen berdasarkan distribusi kursi.

Pengguna dapat:

* memasukkan data suara dan kursi partai secara manual;
* mengimpor data suara-kursi dari CSV;
* melihat persentase suara, persentase kursi, dan selisih suara-kursi;
* menghitung LHI, LSI, dan ENPP;
* memeriksa jejak hitung indeks;
* mengunduh hasil indeks dalam format CSV;
* mengunduh jejak hitung indeks dalam format CSV.

Seluruh hasil indeks dihitung berdasarkan data yang dimasukkan pengguna dan tidak merepresentasikan hasil resmi pemilihan umum mana pun.

---

### Kalkulator Multi-Dapil

Versi 1.1.0 menambahkan **Kalkulator Multi-Dapil** untuk mensimulasikan alokasi kursi proporsional di banyak daerah pemilihan dengan menerapkan ambang batas parlemen nasional.

Kalkulator Multi-Dapil:

* mengimpor data suara berbasis dapil dari CSV;
* mendukung header CSV Bahasa Indonesia dan Bahasa Inggris;
* menghitung total suara nasional per partai;
* menerapkan ambang batas parlemen nasional sebelum alokasi kursi per dapil;
* mengalokasikan kursi secara terpisah di setiap dapil menggunakan lima metode:
  * Sainte-Laguë;
  * Sainte-Laguë Modifikasi;
  * D’Hondt;
  * Kuota Hare;
  * Kuota Droop;
* memberikan 0 kursi di seluruh dapil kepada partai yang tidak lolos ambang batas nasional;
* menyediakan tabel Ringkasan Nasional;
* menyediakan tabel Detail Per Dapil dengan filter dapil;
* menyediakan download CSV untuk hasil nasional dan hasil per dapil;
* menyertakan validasi untuk dapil yang memiliki total suara 0;
* menyertakan validasi untuk dapil yang tidak memiliki suara dari partai yang lolos ambang batas nasional;
* menyediakan tombol reset dan tombol sitasi pada halaman Multi-Dapil.

Urutan perhitungan menjadi penting: ambang batas nasional diterapkan terlebih dahulu, lalu alokasi kursi per dapil dilakukan hanya terhadap partai yang lolos ambang batas.

---

## Dukungan Bahasa

Aplikasi ini mendukung dua bahasa antarmuka:

* Bahasa Indonesia
* Bahasa Inggris

Pengguna dapat mengganti bahasa melalui menu navigasi.

---

## Format Input CSV

### Kalkulator Alokasi Kursi

Kalkulator utama menerima file CSV dengan kolom berikut:

```csv
nama,suara
PDIP,25511655
Golkar,23687039
Gerindra,20321826
```

Parser mendukung file CSV yang dipisahkan dengan koma maupun titik koma.

---

### Kalkulator Indeks Proporsionalitas

Kalkulator indeks proporsionalitas menerima header Bahasa Indonesia:

```csv
partai,suara,kursi
Partai A,1000000,40
Partai B,800000,30
Partai C,500000,20
Partai D,200000,10
```

Header Bahasa Inggris juga didukung:

```csv
party,votes,seats
Party A,1000000,40
Party B,800000,30
Party C,500000,20
Party D,200000,10
```

---

### Kalkulator Multi-Dapil

Kalkulator Multi-Dapil menerima file CSV dengan header Bahasa Indonesia berikut:

```csv
dapil,kursi,partai,suara
Jabar 1,7,Partai A,100000
Jabar 1,7,Partai B,85000
Jabar 2,10,Partai A,150000
Jabar 2,10,Partai B,90000
```

Header Bahasa Inggris juga didukung:

```csv
district,seats,party,votes
District 1,7,Party A,100000
District 1,7,Party B,85000
District 2,10,Party A,150000
District 2,10,Party B,90000
```

Kolom wajib:

* `dapil` / `district`: nama daerah pemilihan;
* `kursi` / `seats`: jumlah kursi di dapil;
* `partai` / `party`: nama partai;
* `suara` / `votes`: suara partai di dapil tersebut.

Nilai suara dan kursi harus berupa angka. Dapil yang memiliki kursi tetapi total suara 0 akan ditolak karena alokasi kursi tidak bermakna secara matematis dalam kondisi tersebut.

---

## Metodologi

### 1. Sainte-Laguë

Sainte-Laguë adalah metode divisor yang mengalokasikan kursi dengan membagi jumlah suara setiap partai menggunakan deret pembagi bilangan ganjil.

```text
Pembagi = 1, 3, 5, 7, 9, ...
```

Kursi diberikan kepada partai dengan nilai quotient tertinggi sampai seluruh kursi habis dialokasikan.

Sainte-Laguë sering dianggap lebih proporsional dibanding D’Hondt karena relatif tidak terlalu menguntungkan partai besar.

---

### 2. Sainte-Laguë Modifikasi

Sainte-Laguë Modifikasi menggunakan deret pembagi yang sama dengan Sainte-Laguë, tetapi pembagi pertama diubah dari 1 menjadi 1,4.

```text
Pembagi = 1.4, 3, 5, 7, 9, ...
```

Modifikasi ini sedikit meningkatkan hambatan bagi partai kecil untuk memperoleh kursi pertama.

---

### 3. D’Hondt

D’Hondt adalah metode divisor yang menggunakan pembagi bilangan bulat berurutan.

```text
Pembagi = 1, 2, 3, 4, 5, ...
```

Dibandingkan Sainte-Laguë, metode D’Hondt cenderung memberikan hasil yang lebih menguntungkan bagi partai besar.

---

### 4. Kuota Hare

Kuota Hare adalah metode berbasis kuota. Metode ini terlebih dahulu menghitung kuota dengan membagi total suara sah dengan jumlah kursi.

```text
Kuota = Total Suara / Jumlah Kursi
```

Setiap partai memperoleh kursi awal berdasarkan jumlah kuota penuh yang dimiliki. Kursi yang tersisa dialokasikan kepada partai dengan sisa suara terbesar.

---

### 5. Kuota Droop

Kuota Droop adalah metode berbasis kuota yang juga digunakan dalam berbagai sistem alokasi proporsional.

```text
Kuota = floor(Total Suara / (Jumlah Kursi + 1)) + 1
```

Seperti Kuota Hare, kursi pertama dialokasikan berdasarkan kuota penuh, sedangkan kursi tersisa diberikan berdasarkan sisa terbesar.

---

## Metodologi Indeks Proporsionalitas

### Loosemore-Hanby Index

Loosemore-Hanby Index mengukur disproporsionalitas secara agregat dengan menjumlahkan selisih absolut antara persentase suara dan persentase kursi, lalu membaginya dua.

```text
LHI = 0.5 × Σ |Vote % − Seat %|
```

Semakin rendah nilai LHI, semakin kecil selisih agregat antara persentase suara dan persentase kursi.

---

### Least Squares Index / Gallagher Index

Least Squares Index, yang juga dikenal sebagai Gallagher Index, mengukur disproporsionalitas dengan menguadratkan setiap deviasi suara-kursi, menjumlahkan seluruh deviasi kuadrat, membaginya dua, lalu mengambil akar kuadratnya.

```text
LSI = √(0.5 × Σ (Vote % − Seat %)²)
```

Karena menggunakan kuadrat deviasi, LSI memberi bobot lebih besar pada selisih suara-kursi yang besar.

---

### Effective Number of Parliamentary Parties

Effective Number of Parliamentary Parties mengukur jumlah efektif partai di parlemen berdasarkan distribusi kursi.

```text
ENPP = 1 / Σ Seat Share²
```

ENPP menggunakan proporsi kursi dalam bentuk desimal, bukan persentase.

---

## Metodologi Multi-Dapil

Kalkulator Multi-Dapil dirancang untuk simulasi ketika alokasi kursi dilakukan secara terpisah di banyak daerah pemilihan, sementara ambang batas parlemen diterapkan secara nasional.

Urutan perhitungannya adalah sebagai berikut:

1. Membaca seluruh data suara berbasis dapil.
2. Menjumlahkan suara nasional per partai.
3. Menghitung persentase suara nasional setiap partai.
4. Menentukan partai yang lolos ambang batas nasional.
5. Mengalokasikan kursi secara terpisah di setiap dapil hanya untuk partai yang lolos ambang batas nasional.
6. Memberikan 0 kursi kepada partai yang tidak lolos ambang batas nasional di seluruh dapil.
7. Menjumlahkan hasil kursi per dapil menjadi total nasional.

Urutan ini menghindari kekeliruan metodologis yang umum terjadi, yaitu mengalokasikan kursi per dapil terlebih dahulu lalu menerapkan ambang batas nasional setelahnya. Dalam alat ini, ambang batas dihitung terlebih dahulu di tingkat nasional, kemudian alokasi kursi per dapil dilakukan hanya terhadap partai yang memenuhi syarat.

Di setiap dapil, kalkulator menerapkan formula alokasi yang dipilih dengan hanya menggunakan suara partai yang lolos ambang batas nasional. Partai yang tidak lolos tetap ditampilkan dalam tabel keluaran untuk transparansi, tetapi perolehan kursinya ditetapkan 0.

Kalkulator Multi-Dapil menyertakan validasi untuk menghentikan perhitungan ketika:

* sebuah dapil memiliki kursi tetapi total suara 0;
* sebuah dapil memiliki kursi tetapi tidak memiliki suara dari partai yang lolos ambang batas nasional;
* nilai suara atau kursi dalam CSV yang diunggah tidak valid.

Validasi ini membantu mencegah keluaran yang tidak sah secara matematis atau menyesatkan.

---

## Transparansi Perhitungan

Aplikasi ini menyediakan fitur jejak hitung untuk kalkulator alokasi kursi dan kalkulator indeks proporsionalitas.

Fitur jejak hitung dirancang agar proses perhitungan dapat diperiksa ulang dengan menampilkan:

* partai yang lolos setelah penyaringan ambang batas;
* urutan quotient pada metode divisor;
* perhitungan kuota pada metode kuota;
* alokasi kursi awal;
* alokasi kursi berdasarkan sisa suara terbesar;
* persentase suara;
* persentase kursi;
* selisih suara-kursi;
* komponen LHI;
* komponen LSI;
* komponen ENPP.

Dengan demikian, aplikasi ini tidak hanya berguna untuk simulasi cepat, tetapi juga untuk pembelajaran, verifikasi, dan analisis kebijakan.

---

## Kegunaan

Aplikasi ini ditujukan untuk:

* simulasi sistem pemilu;
* penelitian akademik;
* pendidikan pemilih dan literasi publik;
* diskusi kebijakan;
* jurnalisme dan komunikasi publik;
* pembelajaran di kelas;
* advokasi dan analisis reformasi pemilu;
* studi komparatif formula alokasi kursi.

Aplikasi ini merupakan alat independen untuk pendidikan dan riset. Aplikasi ini tidak berafiliasi dengan lembaga penyelenggara pemilu mana pun dan tidak menghasilkan hasil resmi pemilihan umum.

---

## Batasan

Kalkulator ini dirancang untuk simulasi berbasis formula. Aplikasi ini tidak secara otomatis memasukkan seluruh aturan institusional, hukum, atau administratif yang mungkin berlaku dalam sistem pemilu tertentu.

Pengguna perlu memeriksa apakah terdapat aturan tambahan dalam konteks yang dianalisis, seperti:

* aturan alokasi berbasis daerah pemilihan;
* mekanisme kompensasi bertingkat;
* kursi khusus atau kursi afirmasi;
* aturan pembulatan yang ditentukan undang-undang;
* aturan koalisi atau penggabungan suara;
* alokasi kursi berbasis kandidat;
* overhang seats atau leveling seats;
* ketentuan representasi khusus.

Karena itu, hasil aplikasi perlu dipahami sebagai simulasi berbasis formula berdasarkan data yang dimasukkan pengguna.

---

## Privasi dan Pengelolaan Data

Aplikasi ini berjalan secara client-side. Seluruh perhitungan dilakukan di browser pengguna.

Aplikasi ini tidak:

* mengunggah data input pengguna ke server;
* menyimpan data input pengguna secara eksternal;
* mewajibkan login;
* menggunakan database;
* memproses data pribadi melalui sistem backend.

---

## Teknologi

Aplikasi ini dibangun sebagai aplikasi web statis menggunakan:

* HTML
* CSS
* JavaScript
* Chart.js

Aplikasi dapat dihosting melalui platform hosting statis seperti Netlify.

Struktur berkasnya sebagai berikut. `index.html` berisi kerangka halaman, `css/style.css` berisi seluruh tampilan, dan kode aplikasi dipecah per bagian di folder `js/`, yang dimuat berurutan oleh `index.html`:

| Berkas | Isi |
|---|---|
| `js/teks.js` | Teks antarmuka bahasa Indonesia dan Inggris |
| `js/navigasi.js` | Bahasa, navigasi, alamat dan judul per halaman, menu, mode terang/gelap, jendela kutipan |
| `js/data-dpr2024.js` | Data Keputusan KPU Nomor 360, 1205, dan 1206 Tahun 2024 |
| `js/metode.js` | Lima metode alokasi kursi dan jejak hitungnya |
| `js/satu-dapil.js` | Masukan Kalkulator Satu Dapil, pembulatan, aturan ambang batas, preset |
| `js/satu-dapil-hasil.js` | Perhitungan, tabel hasil, jejak hitung, kursi kritis, ekspor |
| `js/grafik-ringkasan.js` | Grafik dan paragraf ringkasan hasil |
| `js/multi-dapil.js` | Kalkulator Multi-Dapil |
| `js/indeks.js` | Indeks disproporsionalitas |
| `js/validasi.js` | Halaman Validasi |
| `js/init.js` | Inisialisasi, dimuat paling akhir |

---

## Penggunaan Lokal

Karena aplikasi ini berbasis HTML statis, aplikasi dapat dibuka secara lokal melalui browser.

Penggunaan dasar:

```bash
git clone <repository-url>
cd <repository-folder>
open index.html
```

Alternatifnya, pengguna dapat menjalankan server statis lokal:

```bash
python3 -m http.server 8000
```

Lalu membuka:

```text
http://localhost:8000
```

---

## Uji Otomatis

Folder `tests` berisi uji yang memastikan hitungan kalkulator tetap benar setiap kali kode diubah. Uji ini mengambil fungsi alokasi dan data preset langsung dari berkas `js/` yang dimuat `index.html`, lalu memeriksa contoh hitung manual untuk kelima metode, kasus pinggiran seperti total suara nol dan nilai seri, jumlah suara dan kursi pada preset, mencocokkan hasil Sainte-Laguë di 84 dapil DPR RI 2024 dengan perolehan kursi resmi menurut Keputusan KPU Nomor 1206 Tahun 2024 untuk ketiga pilihan pembulatan, serta memeriksa mode lembaga dan indeks disproporsionalitas. Pengecekan yang sama dipakai di halaman Validasi pada situs.

Untuk menjalankannya di komputer sendiri, cukup pasang Node.js lalu jalankan perintah berikut dari folder repositori:

```
node tests/run-tests.mjs
```

Uji yang sama juga berjalan otomatis di GitHub setiap kali ada perubahan yang diunggah, melalui berkas `.github/workflows/tests.yml`.

Situs di Netlify dibangun dari repositori ini sesuai `netlify.toml`: uji dijalankan lebih dulu, lalu `tools/build-pages.mjs` membuat satu halaman untuk setiap fitur (Beranda di `/`, lalu misalnya `/satu-dapil/`, `/multi-dapil/`, dan `/indeks/`) beserta `sitemap.xml`. Kalau uji gagal, situs tidak diperbarui.

## Riwayat Versi

### v2.0.0 — Tampilan Baru dan Halaman Beranda

* halaman **Beranda** baru di alamat utama situs yang merangkum ketiga kalkulator, cara kerja, dan hasil uji Validasi; Kalkulator Satu Dapil pindah ke alamat `/satu-dapil/`;
* tampilan baru di semua halaman: kepala halaman bergradasi biru, kartu putih, tabel dan tombol yang lebih rapi, serta logo kalkulator di kepala dan kaki halaman;
* **mode terang dan gelap** yang mengikuti pengaturan perangkat pada kunjungan pertama dan mengingat pilihan pengguna; grafik dan gambar PNG yang diunduh ikut menyesuaikan;
* menu baru: Beranda, Satu Dapil, Multi-Dapil, Indeks, Panduan (Tutorial, Metodologi, Validasi), dan Profil, dengan menu khusus untuk layar ponsel;
* halaman Profil diperbarui dengan biografi, bidang kajian, pengalaman, publikasi terpilih beserta tautannya, ilustrasi wajah, serta tautan ORCID dan kolom Kompas;
* Tutorial mendapat Bagian Q tentang Beranda, menu, dan mode gelap; Metodologi Bagian 1 menjelaskan bahwa perubahan ini hanya menyangkut tampilan;
* uji otomatis ditambah pemeriksaan alamat halaman, tombol menu, kelengkapan teks dua bahasa, kelengkapan warna mode gelap, dan tag verifikasi Google Search Console;
* hitungan tidak berubah; kesamaannya diperiksa dengan membandingkan 60 keluaran perhitungan versi lama dan baru dalam bahasa Indonesia dan Inggris.

### v1.4.2 — Perbaikan Kecil

* angka Hasil Bagi dan kuota di tabel Jejak Hitung kini selalu mengikuti bahasa yang dipilih di kalkulator, tidak lagi bergantung pada bahasa pengaturan browser;
* teks bawaan footer yang terbaca sebelum halaman selesai dimuat dan oleh mesin pencari diperbarui ke versi yang benar.

### v1.4.1 — Modularisasi Kode

* `index.html` yang semula memuat seluruh tampilan dan kode dipecah menjadi `css/style.css` dan sebelas berkas di folder `js/`, sehingga kode lebih mudah dirawat dan dikembangkan;
* tidak ada perubahan pada tampilan, hitungan, maupun fitur; kesamaannya diperiksa dengan membandingkan 66 keluaran versi lama dan baru (tabel hasil, ringkasan, jejak hitung, grafik, Multi-Dapil, Indeks, Validasi, dan halaman bacaan) dalam bahasa Indonesia dan Inggris;
* uji otomatis dan pembuat halaman per fitur disesuaikan dengan struktur berkas yang baru.

### v1.4.0 — Aturan, Pembulatan, dan Validasi

* Kalkulator Satu Dapil kini punya pilihan aturan ambang batas yang dinamai sesuai cara kerjanya, yaitu ambang dihitung dari suara di tabel, kelolosan ditentukan per partai (seperti ambang batas nasional DPR RI 2024), dan tanpa ambang batas (seperti DPRD menurut UU 7/2017 Pasal 414 ayat 2, atau DPR tanpa ambang batas parlemen); memuat data tidak pernah mengubah aturan yang dipilih, dan data DPR yang dihitung dengan aturan lain ditandai sebagai simulasi dengan tombol untuk beralih ke aturan Pemilu DPR RI 2024;
* menu baru Muat dapil DPR RI 2024 yang mengisi suara, jumlah kursi, dan kelolosan ambang batas untuk setiap dapil dari 84 dapil, lengkap dengan kursi resmi sebagai pembanding;
* pilihan hasil bagi yang diatur terpisah untuk Kalkulator Satu Dapil dan Multi-Dapil, dengan tiga cara (hitungan murni, dua desimal dibulatkan, dua desimal dipotong), karena PKPU 6/2024 Pasal 13 ayat 2 tidak menegaskan cara yang dipakai; ketiganya menghasilkan kursi resmi di semua dapil 2024;
* tab Jejak Hitung kini merangkum kursi kritis, yaitu kursi terakhir, penantang terdekat, dan tambahan suara yang dibutuhkannya, atau sisa terbesar terakhir dan berikutnya untuk metode kuota;
* peringatan nilai seri kini merujuk PKPU 6/2024 Pasal 13 ayat 3;
* tombol baru Salin Ringkasan, Salin Tabel LaTeX, dan Cetak / Simpan PDF, serta tautan ke format kutipan lain di Zenodo;
* grafik baru, yaitu Persaingan Kursi (hasil bagi yang diurutkan, atau sisa suara untuk metode kuota, dengan garis batas kursi), diagram Komposisi Kursi setengah lingkaran, grafik sebar Persentase Suara dan Kursi dengan garis proporsional, Komposisi Kursi per Skenario Ambang Batas pada 0, 2, 4, 5, dan 7 persen, serta grafik garis Selisih Kursi Terakhir; ringkasan dan grafik bisa mengikuti kelima metode;
* setiap hasil kini dilengkapi paragraf Ringkasan hasil yang disusun otomatis (Satu Dapil, ringkasan nasional, kursi terakhir, dan simulasi ambang batas di Multi-Dapil, serta Indeks);
* halaman baru Validasi (`/validasi/`) yang menjalankan ulang semua uji di browser, termasuk 84 dapil;
* Tutorial dan Metodologi diperbarui untuk fitur v1.3 dan v1.4;
* uji otomatis bertambah menjadi 64 pengecekan, termasuk pemeriksaan data grafik untuk kelima metode.

### v1.3.0 — Analisis Multi-Dapil

* nama menu menjadi Kalkulator Satu Dapil dan Kalkulator Multi-Dapil, dengan kalimat penjelas di setiap halaman;
* hasil Multi-Dapil kini memuat kolom Resmi untuk preset DPR 2024, dengan penanda sel yang berbeda dari perolehan kursi resmi;
* tab baru Urutan Kursi & Pembagian yang menampilkan siapa mendapat kursi ke-1 sampai ke-n di setiap dapil beserta tabel pembagiannya, dan bisa diunduh sebagai CSV;
* tab baru Kursi Terakhir yang mengurutkan dapil berdasarkan ketatnya persaingan kursi terakhir;
* tab baru Simulasi Ambang Batas dengan slider 0 sampai 10 persen, grafik, dan tabel perubahan kursi;
* peringatan nilai seri di Kalkulator Multi-Dapil;
* urutan dapil mengikuti kode dapil KPU;
* format angka mengikuti bahasa yang dipilih di semua halaman;
* uji otomatis di folder `tests/` (23 pengecekan) yang berjalan setiap kali ada unggahan;
* penyempurnaan bahasa antarmuka.

### v1.2.0 — Koreksi Data dan Penyegaran Tampilan

Data dan logika:

* Preset DPR RI 2024 kini memakai suara sah final 18 partai dari Keputusan KPU Nomor 1205 Tahun 2024 (25 Agustus 2024), total 151.793.293 suara; Partai Ummat ditambahkan dan PKP (peserta 2019) dihapus;
* catatan sumber di bawah preset menjelaskan bahwa preset memakai satu kolam suara nasional dan mencantumkan perolehan kursi resmi berbasis dapil sebagai pembanding;
* peringatan ketika kursi terakhir pada salah satu metode ditentukan oleh nilai seri;
* validasi nama partai kosong dan nama partai ganda;
* fungsi alokasi mengembalikan nol kursi bila total suara nol;
* dialog `alert()` diganti notifikasi di dalam halaman.

Tampilan:

* emoji dihapus dari judul, tab, dan tombol;
* satu skema warna dan satu gaya header di semua halaman;
* daftar partai berbentuk tabel dengan satu baris judul dan pemisah ribuan pada kolom suara;
* tabel hasil menandai metode yang memberi kursi lebih banyak atau lebih sedikit dibanding Sainte-Laguë, dan partai di bawah ambang batas ditampilkan abu;
* impor CSV dilipat secara bawaan;
* favicon, meta description, gambar Open Graph, dan baris versi di footer;
* perbaikan tata letak untuk layar kecil;
* preset DPR RI 2024 untuk Kalkulator Multi-Dapil (84 dapil, Keputusan KPU Nomor 360 Tahun 2024; hasilnya sama persis dengan penetapan kursi resmi) dan untuk halaman Indeks Proporsionalitas (Keputusan KPU Nomor 1205 Tahun 2024);
* perbaikan pembacaan angka suara berformat ribuan di halaman Indeks.

### v1.1.0 — Pembaruan Kalkulator Multi-Dapil

Rilis ini menambahkan Kalkulator Multi-Dapil dan memperkuat validasi untuk simulasi berbasis daerah pemilihan.

Ditambahkan:

* Kalkulator Multi-Dapil;
* import CSV dan template CSV untuk data berbasis dapil;
* perhitungan ambang batas parlemen nasional sebelum alokasi kursi per dapil;
* alokasi kursi per dapil menggunakan Sainte-Laguë, Sainte-Laguë Modifikasi, D’Hondt, Kuota Hare, dan Kuota Droop;
* keluaran Ringkasan Nasional;
* keluaran Detail Per Dapil dengan filter dapil;
* download CSV untuk hasil Multi-Dapil;
* kotak informasi ambang batas;
* tombol reset dan tombol sitasi pada halaman Multi-Dapil.

Diperbaiki:

* validasi untuk dapil yang memiliki kursi tetapi total suara 0;
* validasi untuk dapil yang tidak memiliki suara dari partai yang lolos ambang batas nasional;
* validasi nilai suara dan kursi pada import CSV Multi-Dapil;
* render ulang bahasa untuk panel hasil Multi-Dapil.

---

## Sitasi

Jika menggunakan aplikasi ini dalam tulisan akademik, analisis kebijakan, bahan ajar, jurnalisme, presentasi, atau dokumentasi publik, mohon sitasi sebagai berikut.

DOI di atas selalu mengarah ke versi terbaru. Setiap rilis juga punya DOI sendiri di Zenodo; versi 2.0.0 adalah 10.5281/zenodo.24187298, versi 1.4.1 adalah 10.5281/zenodo.24156876, versi 1.4.0 adalah 10.5281/zenodo.24130643, dan versi 1.3.0 adalah 10.5281/zenodo.24105964.

### APA

```text
Kholidin, M. I. (2026). Kalkulator Kursi Pemilu Proporsional / Proportional Electoral Seat Calculator [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.24105963
```

### BibTeX

```bibtex
@software{kholidin2026seatcalculator,
  author = {Kholidin, Muhammad Iqbal},
  title = {Kalkulator Kursi Pemilu Proporsional / Proportional Electoral Seat Calculator},
  year = {2026},
  publisher = {Zenodo},
  doi = {10.5281/zenodo.24105963},
  url = {https://proportional-seat-calculator.netlify.app/}
}
```

---

## Pengembang

**Muhammad Iqbal Kholidin**
Peneliti Pemilu · Analis Kebijakan

LinkedIn:
https://www.linkedin.com/in/muhammadiqbalkholidin/

Email:
[muhammadiqbalkholidin@gmail.com](mailto:muhammadiqbalkholidin@gmail.com)

---

## Lisensi dan Hak Cipta

© 2026 Muhammad Iqbal Kholidin. All Rights Reserved.

Repositori ini dapat dilihat secara publik untuk keperluan dokumentasi, transparansi, dan portofolio. Repositori ini bukan proyek sumber terbuka kecuali jika lisensi sumber terbuka terpisah ditambahkan di kemudian hari.

Kode sumber tidak boleh digunakan ulang, dimodifikasi, didistribusikan, dipublikasikan kembali, disublisensikan, dijual, atau digunakan untuk membuat karya turunan tanpa izin tertulis sebelumnya dari pengembang.

Untuk permintaan izin, hubungi Muhammad Iqbal Kholidin melalui [muhammadiqbalkholidin@gmail.com](mailto:muhammadiqbalkholidin@gmail.com).

---

## Disclaimer

Alat ini disediakan untuk keperluan riset, pendidikan, dan diskusi publik. Alat ini tidak boleh diperlakukan sebagai sistem hasil resmi pemilihan umum. Seluruh keluaran bergantung pada data yang dimasukkan pengguna dan formula yang dipilih di dalam aplikasi.
