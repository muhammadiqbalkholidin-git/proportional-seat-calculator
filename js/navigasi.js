/* Bahasa, navigasi antarhalaman, alamat dan judul per halaman, serta jendela kutipan. */
let currentLang='id';

function setLang(lang){
  currentLang=lang;
  document.getElementById('lang-id').classList.toggle('on',lang==='id');
  document.getElementById('lang-en').classList.toggle('on',lang==='en');
  document.documentElement.lang=lang;
  const s=STRINGS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(s[k]!==undefined)el.innerHTML=s[k];});
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
const PAGE_PATHS={calc:'/',multi:'/multi-dapil/',index:'/indeks/',tutorial:'/tutorial/',about:'/profil/',meth:'/metodologi/',validasi:'/validasi/'};
const PAGE_META={
  validasi:{id:['Validasi Kalkulator Kursi: Uji terhadap Hasil Resmi Pemilu DPR 2024','Hasil uji Kalkulator Kursi Pemilu Proporsional, termasuk pencocokan Sainte-Laguë dengan kursi resmi di 84 dapil DPR RI 2024, sakelar pembulatan, mode lembaga, dan indeks disproporsionalitas.'],en:['Calculator Validation: Tests against the Official 2024 DPR Results','Test results of the Proportional Electoral Seat Calculator, including Sainte-Laguë checked against official seats in all 84 DPR RI 2024 districts, the rounding switch, legislative body modes, and disproportionality indices.']},
  calc:{id:['Kalkulator Sainte-Laguë Satu Dapil | Kalkulator Kursi Pemilu Proporsional','Hitung pembagian kursi pemilu untuk satu dapil dengan metode Sainte-Laguë, Sainte-Laguë Modifikasi, D\'Hondt, Kuota Hare, dan Kuota Droop, lengkap dengan jejak hitung setiap kursi.'],en:['Sainte-Laguë Single-District Calculator | Proportional Electoral Seat Calculator','Allocate seats in one district with Sainte-Laguë, Modified Sainte-Laguë, D\'Hondt, Hare, and Droop, with a step-by-step trace of every seat.']},
  multi:{id:['Simulasi Kursi DPR per Dapil dengan Sainte-Laguë | Kalkulator Multi-Dapil','Simulasikan perolehan kursi DPR RI 2024 di 84 dapil dengan ambang batas nasional, lihat urutan kursi dan tabel pembagian tiap dapil, persaingan kursi terakhir, dan simulasi ambang batas parlemen 0 sampai 10 persen.'],en:['DPR Seat Simulation by District with Sainte-Laguë | Multi-District Calculator','Simulate the 2024 DPR RI seat allocation across 84 districts with a national threshold, with seat order and division tables, last-seat races, and a 0 to 10 percent threshold simulation.']},
  index:{id:['Indeks Disproporsionalitas Pemilu: Gallagher, LHI, dan ENPP | Kalkulator Kursi Pemilu','Hitung indeks Gallagher (LSI), Loosemore-Hanby (LHI), dan jumlah efektif partai di parlemen (ENPP) dari data suara dan kursi, termasuk preset hasil Pemilu DPR RI 2024.'],en:['Election Disproportionality Index: Gallagher, LHI, and ENPP | Electoral Seat Calculator','Calculate the Gallagher index (LSI), Loosemore-Hanby index (LHI), and effective number of parliamentary parties (ENPP) from votes and seats, including a 2024 DPR RI preset.']},
  tutorial:{id:['Cara Menghitung Kursi Pemilu dengan Sainte-Laguë | Tutorial Kalkulator','Panduan langkah demi langkah menghitung pembagian kursi pemilu dengan kalkulator ini, mulai dari memasukkan data, membaca tabel hasil, sampai memeriksa jejak hitung.'],en:['How to Calculate Election Seats with Sainte-Laguë | Calculator Tutorial','A step-by-step guide to allocating election seats with this calculator, from entering data to reading results and checking the calculation trace.']},
  about:{id:['Muhammad Iqbal Kholidin | Pembuat Kalkulator Kursi Pemilu Proporsional','Profil Muhammad Iqbal Kholidin, peneliti pemilu yang membuat Kalkulator Kursi Pemilu Proporsional.'],en:['Muhammad Iqbal Kholidin | Creator of the Proportional Electoral Seat Calculator','Profile of Muhammad Iqbal Kholidin, electoral researcher and creator of the Proportional Electoral Seat Calculator.']},
  meth:{id:['Metode Sainte-Laguë, D\'Hondt, Hare, dan Droop | Metodologi Kalkulator Kursi','Penjelasan cara kerja metode Sainte-Laguë, Sainte-Laguë Modifikasi, D\'Hondt, Kuota Hare, dan Kuota Droop, indeks disproporsionalitas, dan perhitungan multi-dapil, beserta rujukan akademiknya.'],en:['Sainte-Laguë, D\'Hondt, Hare, and Droop Methods | Calculator Methodology','How the Sainte-Laguë, Modified Sainte-Laguë, D\'Hondt, Hare, and Droop methods work, plus disproportionality indices and multi-district allocation, with academic references.']}
};
let currentPage='calc';
function applyPageMeta(id){
  const m=(PAGE_META[id]||PAGE_META.calc)[currentLang]||PAGE_META[id].id;
  document.title=m[0];
  const d=document.querySelector('meta[name="description"]');if(d)d.setAttribute('content',m[1]);
}
function goTo(id,opts){
  opts=opts||{};
  if(!document.getElementById('page-'+id))id='calc';
  currentPage=id;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('show'));
  document.querySelectorAll('.nav-links button').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('show');
  document.getElementById('nb-'+id).classList.add('active');
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
  return hit||tag||'calc';
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

