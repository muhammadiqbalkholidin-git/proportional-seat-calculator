# Kalkulator Kursi Pemilu Proporsional

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

## Riwayat Versi

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

### APA

```text
Kholidin, M. I. (2026). Kalkulator Kursi Pemilu Proporsional / Proportional Electoral Seat Calculator [Web application]. https://proportional-seat-calculator.netlify.app/
```

### BibTeX

```bibtex
@misc{kholidin2026seatcalculator,
  author = {Kholidin, Muhammad Iqbal},
  title = {Kalkulator Kursi Pemilu Proporsional / Proportional Electoral Seat Calculator},
  year = {2026},
  url = {https://proportional-seat-calculator.netlify.app/},
  note = {Web application}
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
