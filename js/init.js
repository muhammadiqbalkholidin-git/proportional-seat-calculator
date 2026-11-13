/* Inisialisasi halaman. Harus dimuat paling akhir. */
/* ================================================================ INIT ================================================================ */
loadDPR();
(function(){
  const label='Partai ';
  for(let i=1;i<=4;i++) idxData.push({id:uid(),name:label+i,votes:0,seats:0});
  renderIndexParties();
})();
/* setiap fungsi hitung memakai pilihan pembulatan kalkulatornya sendiri */
function withRound(names,get){names.forEach(n=>{const f=window[n];if(typeof f!=='function')return;window[n]=function(...a){const s=roundMode;roundMode=get();try{return f.apply(this,a);}finally{roundMode=s;}};});}
withRound(['calculate','renderTrace','downloadFullTrace','downloadCSV','copySummary','copyLatex','printResult','renderSingleCharts','renderSingleNarr'],()=>roundSingle);
withRound(['calculateMultiDapil','renderMdNational','renderMdNatExtra','renderMdDistrictTable','renderMdTrace','downloadMdTraceCSV','renderMdLast','downloadMdLastCSV','renderMdSim','renderMdSimTable','renderMdScenario','downloadMultiNationalCSV','downloadMultiDistrictCSV','renderMdInfo'],()=>roundMulti);
populateDapilSel();
if(window.Chart){Chart.defaults.color=CC('muted');Chart.defaults.borderColor=CC('grid');}
setLang(currentLang);
goTo(pageFromPath(),{noPush:true,noScroll:true});
try{history.replaceState({page:currentPage},'',location.href);}catch(e){}
