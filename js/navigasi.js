/* Bahasa, navigasi antarhalaman, alamat dan judul per halaman, serta jendela kutipan. */
let currentLang='id';

function setLang(lang){
  currentLang=lang;
  document.getElementById('lang-id').classList.toggle('on',lang==='id');
  document.getElementById('lang-en').classList.toggle('on',lang==='en');
  document.documentElement.lang=lang;
  syncThemeBtn();
  const s=STRINGS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(s[k]!==undefined)el.innerHTML=s[k];});
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{const k=el.getAttribute('data-i18n-title');if(s[k]!==undefined){el.title=s[k];el.setAttribute('aria-label',s[k]);}});
  const jCode=document.getElementById('tut-j-fmt-code');
  if(jCode) jCode.innerHTML=lang==='en'?'party,votes,seats<br>Party A,1000000,40<br>Party B,800000,30':'partai,suara,kursi<br>Partai A,1000000,40<br>Partai B,800000,30';
  render();renderIndexParties();
  const tabs=document.querySelectorAll('.tab');
  if(tabs[0])tabs[0].textContent=s.tab_table;if(tabs[1])tabs[1].textContent=s.tab_chart;
  if(tabs[2])tabs[2].textContent=s.tab_detail;if(tabs[3])tabs[3].textContent=s.tab_trace;
  const it0=document.getElementById('idxTab0'),it1=document.getElementById('idxTab1');
  if(it0)it0.textContent=s.idx_tab_results;if(it1)it1.textContent=s.idx_tab_trace;
  const mt0=document.getElementById('mdTab0'),mt1=document.getElementById('mdTab1'),mt2=document.getElementById('mdTab2');
  if(mt0){mt0.textContent=s.md_tab_national;mt1.textContent=s.md_tab_district;mt2.textContent=s.md_tab_info;}
  const mt3=document.getElementById('mdTab3'),mt4=document.getElementById('mdTab4'),mt5=document.getElementById('mdTab5');if(mt3){mt3.textContent=s.md_tab_trace;mt4.textContent=s.md_tab_last;mt5.textContent=s.md_tab_sim;}
  renderPresetNote();renderMdPresetNote();renderIdxPresetNote();
  if(typeof populateDapilSel==='function'){populateDapilSel();renderLembagaNote();}
  if(typeof currentPage!=='undefined'&&currentPage==='validasi')renderValidation();
  if(typeof applyPageMeta==='function')applyPageMeta(currentPage);
  if(lastResults&&!document.getElementById('resCard').classList.contains('hidden'))calculate(true);
  if(lastIdxCalc&&!document.getElementById('idxResCard').classList.contains('hidden'))calculateIndex(true);
  if(lastMdCalc){
    renderMdThresholdInfo();
    renderMdNational();
    renderMdDistrictFilter();
    renderMdDistrictTable();
    renderMdInfo();
    if(!document.getElementById('mdPanel3').classList.contains('hidden'))renderMdTrace();
    if(!document.getElementById('mdPanel4').classList.contains('hidden'))renderMdLast();
    if(!document.getElementById('mdPanel5').classList.contains('hidden'))renderMdSim();
  }
}

/* Setiap halaman punya alamat sendiri agar bisa ditemukan mesin pencari dan dibagikan langsung */
const PAGE_PATHS={home:'/',calc:'/satu-dapil/',multi:'/multi-dapil/',index:'/indeks/',tutorial:'/tutorial/',about:'/profil/',meth:'/metodologi/',validasi:'/validasi/'};
const PAGE_META={
  home:{id:['Kalkulator Kursi Pemilu Proporsional: Simulasi Sainte-Laguë, D\'Hondt, dan Indeks Disproporsionalitas','Alat gratis untuk mensimulasikan pembagian kursi pemilu proporsional dengan lima metode, dari satu dapil sampai 84 dapil DPR RI 2024, lengkap dengan indeks disproporsionalitas. Semua hitungan berjalan di browser.'],en:['Proportional Electoral Seat Calculator: Sainte-Laguë, D\'Hondt, and Disproportionality Simulator','A free tool to simulate proportional seat allocation with five methods, from a single district up to the 84 districts of the 2024 DPR RI, with disproportionality indices. Every calculation runs in your browser.']},
  validasi:{id:['Validasi Kalkulator Kursi: Uji terhadap Hasil Resmi Pemilu DPR 2024','Hasil uji Kalkulator Kursi Pemilu Proporsional, termasuk pencocokan Sainte-Laguë dengan kursi resmi di 84 dapil DPR RI 2024, sakelar pembulatan, mode lembaga, dan indeks disproporsionalitas.'],en:['Calculator Validation: Tests against the Official 2024 DPR Results','Test results of the Proportional Electoral Seat Calculator, including Sainte-Laguë checked against official seats in all 84 DPR RI 2024 districts, the rounding switch, legislative body modes, and disproportionality indices.']},
  calc:{id:['Kalkulator Sainte-Laguë Satu Dapil | Kalkulator Kursi Pemilu Proporsional','Hitung pembagian kursi pemilu untuk satu dapil dengan metode Sainte-Laguë, Sainte-Laguë Modifikasi, D\'Hondt, Kuota Hare, dan Kuota Droop, lengkap dengan jejak hitung setiap kursi.'],en:['Sainte-Laguë Single-District Calculator | Proportional Electoral Seat Calculator','Allocate seats in one district with Sainte-Laguë, Modified Sainte-Laguë, D\'Hondt, Hare, and Droop, with a step-by-step trace of every seat.']},
  multi:{id:['Simulasi Kursi DPR per Dapil dengan Sainte-Laguë | Kalkulator Multi-Dapil','Simulasikan perolehan kursi DPR RI 2024 di 84 dapil dengan ambang batas nasional, lihat urutan kursi dan tabel pembagian tiap dapil, persaingan kursi terakhir, dan simulasi ambang batas parlemen 0 sampai 10 persen.'],en:['DPR Seat Simulation by District with Sainte-Laguë | Multi-District Calculator','Simulate the 2024 DPR RI seat allocation across 84 districts with a national threshold, with seat order and division tables, last-seat races, and a 0 to 10 percent threshold simulation.']},
  index:{id:['Indeks Disproporsionalitas Pemilu: Gallagher, LHI, dan ENPP | Kalkulator Kursi Pemilu','Hitung indeks Gallagher (LSI), Loosemore-Hanby (LHI), dan jumlah efektif partai di parlemen (ENPP) dari data suara dan kursi, termasuk preset hasil Pemilu DPR RI 2024.'],en:['Election Disproportionality Index: Gallagher, LHI, and ENPP | Electoral Seat Calculator','Calculate the Gallagher index (LSI), Loosemore-Hanby index (LHI), and effective number of parliamentary parties (ENPP) from votes and seats, including a 2024 DPR RI preset.']},
  tutorial:{id:['Cara Menghitung Kursi Pemilu dengan Sainte-Laguë | Tutorial Kalkulator','Panduan langkah demi langkah menghitung pembagian kursi pemilu dengan kalkulator ini, mulai dari memasukkan data, membaca tabel hasil, sampai memeriksa jejak hitung.'],en:['How to Calculate Election Seats with Sainte-Laguë | Calculator Tutorial','A step-by-step guide to allocating election seats with this calculator, from entering data to reading results and checking the calculation trace.']},
  about:{id:['Muhammad Iqbal Kholidin | Pembuat Kalkulator Kursi Pemilu Proporsional','Profil Muhammad Iqbal Kholidin, peneliti pemilu yang membuat Kalkulator Kursi Pemilu Proporsional.'],en:['Muhammad Iqbal Kholidin | Creator of the Proportional Electoral Seat Calculator','Profile of Muhammad Iqbal Kholidin, electoral researcher and creator of the Proportional Electoral Seat Calculator.']},
  meth:{id:['Metode Sainte-Laguë, D\'Hondt, Hare, dan Droop | Metodologi Kalkulator Kursi','Penjelasan cara kerja metode Sainte-Laguë, Sainte-Laguë Modifikasi, D\'Hondt, Kuota Hare, dan Kuota Droop, indeks disproporsionalitas, dan perhitungan multi-dapil, beserta rujukan akademiknya.'],en:['Sainte-Laguë, D\'Hondt, Hare, and Droop Methods | Calculator Methodology','How the Sainte-Laguë, Modified Sainte-Laguë, D\'Hondt, Hare, and Droop methods work, plus disproportionality indices and multi-district allocation, with academic references.']}
};
let currentPage='home';
function applyPageMeta(id){
  const m=(PAGE_META[id]||PAGE_META.home)[currentLang]||(PAGE_META[id]||PAGE_META.home).id;
  document.title=m[0];
  const d=document.querySelector('meta[name="description"]');if(d)d.setAttribute('content',m[1]);
}
function goTo(id,opts){
  opts=opts||{};
  if(!document.getElementById('page-'+id))id='home';
  currentPage=id;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('show'));
  document.querySelectorAll('.mainnav [id^="nb-"]').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('show');
  const nb=document.getElementById('nb-'+id);if(nb)nb.classList.add('active');
  const dd=document.getElementById('ddGuide');if(dd){dd.classList.toggle('active',['tutorial','meth','validasi'].includes(id));dd.classList.remove('open');}
  closeMenu();
  applyPageMeta(id);
  if(id==='validasi')renderValidation();
  if(!opts.noPush&&location.protocol.startsWith('http')&&location.pathname!==PAGE_PATHS[id]){try{history.pushState({page:id},'',PAGE_PATHS[id]);}catch(e){}}
  if(!opts.noScroll)window.scrollTo({top:0,behavior:'smooth'});
}
window.addEventListener('popstate',e=>{const id=(e.state&&e.state.page)||pageFromPath();goTo(id,{noPush:true});});
function pageFromPath(){
  const tag=document.documentElement.getAttribute('data-page');
  const path=location.pathname.replace(/index\.html$/,'');
  const hit=Object.keys(PAGE_PATHS).find(k=>PAGE_PATHS[k]===path||PAGE_PATHS[k]===path+'/');
  return hit||tag||'home';
}
function scrollToSec(id){document.getElementById(id).scrollIntoView({behavior:'smooth'});}

function openCiteModal(){document.getElementById('citeModal').classList.add('show');}
function closeCiteModal(){document.getElementById('citeModal').classList.remove('show');}
document.getElementById('citeModal').addEventListener('click',function(e){if(e.target===this)closeCiteModal();});
function copyCitation(type){
  const text=type==='apa'?document.getElementById('citeApaText').textContent:document.getElementById('citeBibText').textContent;
  const msgId=type==='apa'?'citeApaMsg':'citeBibMsg';
  const doMsg=()=>{const m=document.getElementById(msgId);m.classList.add('show');setTimeout(()=>m.classList.remove('show'),2000);};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(doMsg).catch(()=>{fallbackCopy(text);doMsg();});}
  else{fallbackCopy(text);doMsg();}
}
function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}


/* ---------- mode terang/gelap ---------- */
function CC(n){const v=getComputedStyle(document.documentElement).getPropertyValue('--c-'+n).trim();return v||'#64748b';}
function isDark(){return document.documentElement.getAttribute('data-theme')==='dark';}
function syncThemeBtn(){
  const l=document.getElementById('themeLbl');if(!l||typeof STRINGS==='undefined')return;
  const s=STRINGS[currentLang];l.textContent=isDark()?s.theme_light:s.theme_dark;
  const b=document.getElementById('themeBtn');if(b)b.title=s.theme_title;
  if(window.Chart){Chart.defaults.color=CC('muted');Chart.defaults.borderColor=CC('grid');}
}
function toggleTheme(){
  const r=document.documentElement;const dark=!isDark();
  if(dark)r.setAttribute('data-theme','dark');else r.removeAttribute('data-theme');
  try{localStorage.setItem('kk-theme',dark?'dark':'light');}catch(e){}
  const mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute('content',dark?'#0b1220':'#1e3a8a');
  syncThemeBtn();
  /* gambar ulang grafik yang sedang tampil supaya warnanya ikut mode */
  try{if(lastResults&&!document.getElementById('resCard').classList.contains('hidden'))calculate(true);}catch(e){}
  try{if(lastIdxCalc&&!document.getElementById('idxResCard').classList.contains('hidden'))calculateIndex(true);}catch(e){}
  try{if(lastMdCalc){renderMdNational();if(!document.getElementById('mdPanel4').classList.contains('hidden'))renderMdLast();if(!document.getElementById('mdPanel5').classList.contains('hidden'))renderMdSim();}}catch(e){}
}
/* ---------- menu ---------- */
function toggleMenu(){const h=document.getElementById('hdr');const o=!h.classList.contains('open');h.classList.toggle('open',o);document.getElementById('burger').setAttribute('aria-expanded',o?'true':'false');}
function closeMenu(){const h=document.getElementById('hdr');if(h)h.classList.remove('open');const b=document.getElementById('burger');if(b)b.setAttribute('aria-expanded','false');}
function toggleGuide(e){e.stopPropagation();const d=document.getElementById('ddGuide');d.classList.toggle('open');}
document.addEventListener('click',e=>{const d=document.getElementById('ddGuide');if(d&&!d.contains(e.target))d.classList.remove('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=document.getElementById('ddGuide');if(d)d.classList.remove('open');closeMenu();}});
function startPreset(){goTo('multi');try{loadMdDPR();calculateMultiDapil();}catch(e){}}
