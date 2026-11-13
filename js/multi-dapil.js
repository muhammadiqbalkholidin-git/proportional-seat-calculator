/* Kalkulator Multi-Dapil. */
/* ================================================================ MULTI-DAPIL ================================================================ */
let mdPresetActive=false;
function loadMdDPR(){
  mdRawData=[];
  MD_DPR2024.forEach(r=>{const [d,seats,...v]=r;v.forEach((votes,i)=>mdRawData.push({district:d,seats:seats,party:MD_DPR2024_PARTIES[i],votes:votes}));});
  mdCsvParsed=[];lastMdCalc=null;document.getElementById('mdThresh').value=4;
  document.getElementById('mdCsvPreview').classList.add('hidden');document.getElementById('mdResCard').classList.add('hidden');
  showMdAlert(T('md_preset_loaded'),'ok');
  mdPresetActive=true;renderMdPresetNote();
}
function renderMdPresetNote(){const el=document.getElementById('mdPresetNote');if(!el)return;el.innerHTML=mdPresetActive?T('md_preset_note'):'';el.classList.toggle('hidden',!mdPresetActive);}

let mdRawData=[],mdCsvParsed=[],lastMdCalc=null;

const mdDz=document.getElementById('md-dropzone');
mdDz.addEventListener('dragover',e=>{e.preventDefault();mdDz.classList.add('drag');});
mdDz.addEventListener('dragleave',()=>mdDz.classList.remove('drag'));
mdDz.addEventListener('drop',e=>{e.preventDefault();mdDz.classList.remove('drag');const f=e.dataTransfer.files[0];if(f)handleMdFile(f);});

function handleMdFile(file){
  if(!file)return;
  if(!file.name.match(/\.csv$/i)){showMdAlert(currentLang==='en'?'File must be .csv':'File harus .csv','err');return;}
  const r=new FileReader();r.onload=e=>parseMdCSV(e.target.result.replace(/\r/g,''),file.name);r.readAsText(file,'UTF-8');
}

// Helper: strict numeric parse for Multi-Dapil CSV
function strictParseVotes(raw){
  if(raw===undefined||raw===null)return{ok:false,val:0};
  const s=String(raw).trim();
  if(s==='')return{ok:true,val:0}; // empty = 0 allowed
  // Strip thousands separators (dots in ID format, commas in EN format) only if numeric otherwise
  const cleaned=s.replace(/[,\.]/g,'');
  if(!/^-?\d+$/.test(cleaned))return{ok:false,val:0};
  const n=parseInt(cleaned,10);
  if(n<0)return{ok:false,val:0};
  return{ok:true,val:n};
}
function strictParseSeats(raw){
  if(raw===undefined||raw===null)return{ok:false,val:0};
  const s=String(raw).trim();
  if(s==='')return{ok:false,val:0};
  const cleaned=s.replace(/[,\.]/g,'');
  if(!/^\d+$/.test(cleaned))return{ok:false,val:0};
  const n=parseInt(cleaned,10);
  if(n<=0)return{ok:false,val:0};
  return{ok:true,val:n};
}

function parseMdCSV(text,fname){
  const lines=text.split('\n').filter(l=>l.trim());
  if(lines.length<2){showMdAlert(currentLang==='en'?'File too short':'File terlalu pendek','err');return;}
  const delim=lines[0].includes(';')?';':',';
  const header=lines[0].split(delim).map(h=>h.trim().toLowerCase().replace(/"/g,''));
  const di=header.findIndex(h=>['dapil','district'].includes(h));
  const ki=header.findIndex(h=>['kursi','seats','seat'].includes(h));
  const pi=header.findIndex(h=>['partai','party'].includes(h));
  const vi=header.findIndex(h=>['suara','votes','vote'].includes(h));
  if(di<0||ki<0||pi<0||vi<0){
    showMdAlert(currentLang==='en'?'CSV must have columns: dapil/district, kursi/seats, partai/party, suara/votes':'CSV harus memiliki kolom: dapil, kursi, partai, suara','err');return;
  }
  const s=STRINGS[currentLang];
  const rows=[],errs=[];
  for(let idx=0;idx<lines.slice(1).length;idx++){
    const line=lines.slice(1)[idx];
    if(!line.trim())continue;
    const cols=line.split(delim).map(c=>c.trim().replace(/^"|"$/g,''));
    const rowNum=idx+2;
    const district=cols[di]||'';
    const party=cols[pi]||'';
    if(!district){errs.push(`Row ${rowNum}: empty district`);continue;}
    if(!party){errs.push(`Row ${rowNum}: empty party`);continue;}
    // Strict seat validation
    const seatParsed=strictParseSeats(cols[ki]);
    if(!seatParsed.ok){
      showMdAlert(`${s.md_err_invalid_seat} ${rowNum}.`,'err');
      mdCsvParsed=[];
      document.getElementById('mdCsvPreview').classList.add('hidden');
      return;
    }
    // Strict vote validation
    const voteParsed=strictParseVotes(cols[vi]);
    if(!voteParsed.ok){
      showMdAlert(`${s.md_err_invalid_vote} ${rowNum}.`,'err');
      mdCsvParsed=[];
      document.getElementById('mdCsvPreview').classList.add('hidden');
      return;
    }
    rows.push({district,seats:seatParsed.val,party,votes:voteParsed.val});
  }
  if(rows.length===0){showMdAlert(currentLang==='en'?'No valid data found.':'Tidak ada data valid.','err');return;}
  // validate seat consistency per district
  const distSeats={};let seatErr=false,seatErrDist='';
  rows.forEach(r=>{
    if(distSeats[r.district]===undefined)distSeats[r.district]=r.seats;
    else if(distSeats[r.district]!==r.seats){seatErr=true;seatErrDist=r.district;}
  });
  if(seatErr){showMdAlert(`${currentLang==='en'?'Inconsistent seat count in district:':'Jumlah kursi tidak konsisten di dapil:'} ${seatErrDist}`,'err');return;}
  // aggregate duplicate party per district
  const agg={};
  rows.forEach(r=>{
    const key=r.district+'|||'+r.party;
    if(!agg[key])agg[key]={district:r.district,seats:r.seats,party:r.party,votes:0};
    agg[key].votes+=r.votes;
  });
  const aggRows=Object.values(agg);
  mdCsvParsed=aggRows;
  const msgOk=errs.length>0?`${errs.length} ${currentLang==='en'?'rows skipped':'baris dilewati'}`:`${aggRows.length} ${currentLang==='en'?`rows loaded from "${fname}"`:`baris dibaca dari "${fname}"`}`;
  showMdAlert(msgOk,errs.length>0?'err':'ok');
  document.getElementById('mdPreviewLabel').textContent=currentLang==='en'?`Preview: ${aggRows.length} rows`:`Preview: ${aggRows.length} baris`;
  const h1=currentLang==='en'?'District':'Dapil',h2=currentLang==='en'?'Seats':'Kursi',h3=currentLang==='en'?'Party':'Partai',h4=currentLang==='en'?'Votes':'Suara';
  let h=`<thead><tr><th>${h1}</th><th>${h2}</th><th>${h3}</th><th>${h4}</th></tr></thead><tbody>`;
  aggRows.forEach(r=>h+=`<tr><td>${r.district}</td><td>${r.seats}</td><td>${r.party}</td><td>${fmtNum(r.votes)}</td></tr>`);
  document.getElementById('mdPrevTbl').innerHTML=h+'</tbody>';
  document.getElementById('mdCsvPreview').classList.remove('hidden');document.getElementById('mdDropText').textContent=fname;
}
function showMdAlert(msg,type){const el=document.getElementById('mdCsvAlert');el.className=`alert alert-${type==='err'?'err':'ok'}`;el.textContent=msg;el.classList.remove('hidden');}
function applyMdCSV(){
  if(!mdCsvParsed.length)return;
  mdRawData=[...mdCsvParsed];mdPresetActive=false;renderMdPresetNote();
  document.getElementById('mdCsvPreview').classList.add('hidden');document.getElementById('mdCsvAlert').classList.add('hidden');
  document.getElementById('mdDropText').textContent=STRINGS[currentLang].csv_drop;document.getElementById('mdCsvFile').value='';
  showMdAlert(currentLang==='en'?`${mdRawData.length} rows applied. Ready to calculate.`:`${mdRawData.length} baris diterapkan. Siap dihitung.`,'ok');
}
function cancelMdCSV(){
  mdCsvParsed=[];
  document.getElementById('mdCsvPreview').classList.add('hidden');document.getElementById('mdCsvAlert').classList.add('hidden');
  document.getElementById('mdDropText').textContent=STRINGS[currentLang].csv_drop;document.getElementById('mdCsvFile').value='';
}
function downloadMdTemplate(){
  const csv='dapil,kursi,partai,suara\nJabar 1,7,Partai A,100000\nJabar 1,7,Partai B,85000\nJabar 1,7,Partai C,20000\nJabar 2,10,Partai A,150000\nJabar 2,10,Partai B,90000\nJabar 2,10,Partai C,30000\n';
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'template_multi_dapil.csv');
}

function resetMultiDapil(){
  mdRawData=[];mdCsvParsed=[];lastMdCalc=null;mdPresetActive=false;renderMdPresetNote();
  document.getElementById('mdThresh').value=4;
  document.getElementById('mdCsvPreview').classList.add('hidden');
  document.getElementById('mdCsvAlert').classList.add('hidden');
  document.getElementById('mdResCard').classList.add('hidden');
  document.getElementById('mdDropText').textContent=STRINGS[currentLang].csv_drop;
  document.getElementById('mdCsvFile').value='';
  document.getElementById('mdNationalDiv').innerHTML='';
  document.getElementById('mdDistrictDiv').innerHTML='';
  document.getElementById('mdInfoDiv').innerHTML='';
  document.getElementById('mdThreshInfoBox').innerHTML='';
  document.getElementById('mdDistrictFilter').innerHTML='';
}

function renderMdThresholdInfo(){
  const el=document.getElementById('mdThreshInfoBox');
  if(!lastMdCalc){el.innerHTML='';return;}
  const s=STRINGS[currentLang];
  el.innerHTML=`<div class="md-thresh-box"><strong>${s.md_thresh_info_label}</strong> ${lastMdCalc.thresh}%<br><span style="font-size:0.77rem">${s.md_thresh_info_note}</span></div>`;
}

function calculateMultiDapil(){
  const s=STRINGS[currentLang];const en=currentLang==='en';
  if(!mdRawData.length){showMdAlert(s.md_err_no_data,'err');return;}
  const thresh=parseFloat(document.getElementById('mdThresh').value)||0;

  // Step 1: aggregate national votes per party
  const natVotes={};
  mdRawData.forEach(r=>{natVotes[r.party]=(natVotes[r.party]||0)+r.votes;});
  const totalNatVotes=Object.values(natVotes).reduce((a,b)=>a+b,0);
  if(totalNatVotes===0){showMdAlert(s.md_err_total_zero,'err');return;}

  // Step 2: determine eligibility
  const allParties=Object.keys(natVotes).sort((a,b)=>natVotes[b]-natVotes[a]);
  const eligible=new Set(allParties.filter(p=>(natVotes[p]/totalNatVotes)*100>=thresh));
  if(eligible.size===0){showMdAlert(s.md_err_no_pass,'err');return;}

  // Step 3: get districts
  const distMap={};
  mdRawData.forEach(r=>{
    if(!distMap[r.district])distMap[r.district]={seats:r.seats,parties:{}};
    distMap[r.district].parties[r.party]=(distMap[r.district].parties[r.party]||0)+r.votes;
  });
  const districts=Object.keys(distMap); // urutan sesuai data masukan (preset: urutan kode dapil KPU)

  // Validation A: district with seats but total votes = 0
  const zeroVoteDists=districts.filter(d=>{
    const totalDistVotes=Object.values(distMap[d].parties).reduce((a,b)=>a+b,0);
    return distMap[d].seats>0&&totalDistVotes===0;
  });
  if(zeroVoteDists.length>0){
    showMdAlert(`${s.md_err_dist_zero} ${zeroVoteDists.join(', ')}`,'err');return;
  }

  // Validation B: district with seats but zero eligible votes
  const zeroEligDists=districts.filter(d=>{
    const eligVotes=[...eligible].reduce((a,p)=>a+(distMap[d].parties[p]||0),0);
    return distMap[d].seats>0&&eligVotes===0;
  });
  if(zeroEligDists.length>0){
    showMdAlert(`${s.md_err_elig_zero} ${zeroEligDists.join(', ')}`,'err');return;
  }

  // Step 4: allocate per district per method
  const natSeats={sl:{},slmod:{},dh:{},hare:{},droop:{}};
  allParties.forEach(p=>{['sl','slmod','dh','hare','droop'].forEach(m=>natSeats[m][p]=0);});

  const distResults=[];
  const mdTies=[];
  districts.forEach(dist=>{
    const{seats,parties}=distMap[dist];
    const eligPts=allParties.filter(p=>eligible.has(p)).map(p=>({name:p,votes:parties[p]||0}));
    const distTotalVotes=Object.values(parties).reduce((a,b)=>a+b,0);

    let res_sl={},res_slm={},res_dh={},res_h={},res_dr={};
    if(eligPts.length>0&&seats>0){
      res_sl=sainteLague(eligPts.map(p=>({...p})),seats,1);
      res_slm=sainteLague(eligPts.map(p=>({...p})),seats,1.4);
      res_dh=dhondt(eligPts.map(p=>({...p})),seats);
      res_h=hare(eligPts.map(p=>({...p})),seats);
      res_dr=droop(eligPts.map(p=>({...p})),seats);
      [findTieDivisor(eligPts,seats,res_sl,1,'sl'),findTieDivisor(eligPts,seats,res_slm,1.4,'sl'),findTieDivisor(eligPts,seats,res_dh,1,'dh'),findTieQuota(eligPts,seats,'hare'),findTieQuota(eligPts,seats,'droop')]
        .forEach((tp,mi)=>{if(tp)mdTies.push({dist,mi,a:tp[0],b:tp[1]});});
    }

    allParties.forEach(p=>{
      const inElig=eligible.has(p);
      distResults.push({
        district:dist,distSeats:seats,party:p,
        votes:parties[p]||0,
        distVotePct:distTotalVotes>0?((parties[p]||0)/distTotalVotes*100):0,
        natThreshStatus:inElig,
        sl:inElig?(res_sl[p]||0):0,
        slmod:inElig?(res_slm[p]||0):0,
        dh:inElig?(res_dh[p]||0):0,
        hare:inElig?(res_h[p]||0):0,
        droop:inElig?(res_dr[p]||0):0,
      });
      if(inElig){
        natSeats.sl[p]+=(res_sl[p]||0);natSeats.slmod[p]+=(res_slm[p]||0);
        natSeats.dh[p]+=(res_dh[p]||0);natSeats.hare[p]+=(res_h[p]||0);natSeats.droop[p]+=(res_dr[p]||0);
      }
    });
  });

  lastMdCalc={allParties,natVotes,totalNatVotes,eligible,thresh,districts,distMap,distResults,natSeats,mdTies,official:mdOfficialMap(),
    totalDistSeats:districts.reduce((a,d)=>a+distMap[d].seats,0)};

  renderMdThresholdInfo();
  renderMdNational();
  renderMdDistrictFilter();
  renderMdDistrictTable();
  renderMdInfo();
  document.getElementById('mdResCard').classList.remove('hidden');
  switchMdTab(0);document.getElementById('mdResCard').scrollIntoView({behavior:'smooth'});
}

function switchMdTab(n){
  if(n===3)renderMdTrace();if(n===4)renderMdLast();if(n===5)renderMdSim();
  [0,1,2,3,4,5].forEach(i=>{
    document.getElementById('mdPanel'+i).classList.toggle('hidden',i!==n);
    document.getElementById('mdTab'+i).classList.toggle('on',i===n);
  });
}

function renderMdNational(){
  if(!lastMdCalc)return;
  const{allParties,natVotes,totalNatVotes,eligible,natSeats}=lastMdCalc;
  const s=STRINGS[currentLang];const MNAMES=getMNames();
  const off=lastMdCalc.official;const offNat={};if(off)Object.entries(off).forEach(([k,v])=>{const p=k.split('|')[1];offNat[p]=(offNat[p]||0)+v;});
  const MN0=getMNames();
  let h=(lastMdCalc.mdTies||[]).length?`<div class="warn-box">${T('md_tie_warn',{n:lastMdCalc.mdTies.length})}<ul style="margin:6px 0 0 18px">${lastMdCalc.mdTies.map(x=>`<li>${x.dist} · ${MN0[x.mi]} · ${x.a} ${currentLang==='en'?'and':'dan'} ${x.b}</li>`).join('')}</ul></div>`:'';
  h+=`<div style="margin-bottom:10px"><button class="btn bg" onclick="downloadMultiNationalCSV()" style="font-size:0.8rem">${s.md_dl_national}</button></div>`;
  h+=`<div class="ow"><table class="md-tbl" style="width:100%;border-collapse:collapse"><thead><tr>`;
  h+=`<th style="text-align:left">${s.md_col_party}</th><th>${s.md_col_nat_votes}</th><th>${s.md_col_nat_pct}</th><th>${s.md_col_thresh}</th>`;
  if(off)h+=`<th>${s.md_official}</th>`;
  MNAMES.forEach(m=>h+=`<th>${m}</th>`);
  h+=`</tr></thead><tbody>`;
  allParties.forEach((p,pi)=>{
    const pct=fmtDec(natVotes[p]/totalNatVotes*100,2);const pass=eligible.has(p);
    const sl=natSeats.sl[p]||0,slm=natSeats.slmod[p]||0,dh=natSeats.dh[p]||0,ha=natSeats.hare[p]||0,dr=natSeats.droop[p]||0;
    h+=`<tr><td class="tl"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${COLORS[pi%COLORS.length]};margin-right:5px;vertical-align:middle"></span>${p}</td>`;
    h+=`<td>${fmtNum(natVotes[p])}</td><td>${pct}%</td>`;
    h+=`<td class="${pass?'md-passed':'md-failed'}">${pass?s.md_passed:s.md_failed}</td>`;
    if(off)h+=`<td class="off-col">${offNat[p]||0}</td>`;
    [sl,slm,dh,ha,dr].forEach(v=>h+=offCell(v,off?(offNat[p]||0):null));h+=`</tr>`;
  });
  const en=currentLang==='en';
  h+=`<tr style="background:var(--btn-2);font-weight:700"><td colspan="${off?5:4}" style="color:#fff;text-align:left">${en?'TOTAL SEATS':'TOTAL KURSI'}</td>`;
  ['sl','slmod','dh','hare','droop'].forEach(m=>h+=`<td style="color:#fff">${Object.values(natSeats[m]).reduce((a,b)=>a+b,0)}</td>`);
  h+=`</tr></tbody></table></div>`;
  if(off)h+=`<div class="res-legend"><span>${s.md_off_legend}</span><span><i class="lg-sw" style="background:var(--good-soft);border:1px solid #a7f3d0"></i>${s.md_off_more}</span><span><i class="lg-sw" style="background:var(--bad-soft);border:1px solid var(--bad-line)"></i>${s.md_off_less}</span></div>`;
  h+=`<div id="mdNatExtra"></div>`;
  document.getElementById('mdNationalDiv').innerHTML=h;
  renderMdNatExtra();
}

function renderMdDistrictFilter(){
  if(!lastMdCalc)return;
  const{districts}=lastMdCalc;const s=STRINGS[currentLang];
  const sel=document.getElementById('mdDistrictFilter');
  sel.innerHTML=`<option value="all">${s.md_filter_all}</option>`+districts.map(d=>`<option value="${d}">${d}</option>`).join('');
}

function renderMdDistrictTable(){
  if(!lastMdCalc)return;
  const{distResults,allParties}=lastMdCalc;const s=STRINGS[currentLang];const MNAMES=getMNames();
  const filter=document.getElementById('mdDistrictFilter').value;
  const rows=filter==='all'?[...distResults]:[...distResults.filter(r=>r.district===filter)];
  const dIdx={};lastMdCalc.districts.forEach((d,i)=>dIdx[d]=i);
  rows.sort((a,b)=>dIdx[a.district]-dIdx[b.district]||b.votes-a.votes);
  let h=`<div style="margin-bottom:10px"><button class="btn bg" onclick="downloadMultiDistrictCSV()" style="font-size:0.8rem">${s.md_dl_district}</button></div>`;
  h+=`<div class="ow"><table class="md-tbl" style="width:100%;border-collapse:collapse"><thead><tr>`;
  const off=lastMdCalc.official;
  h+=`<th style="text-align:left">${s.md_col_dapil}</th><th>${s.md_col_seats}</th><th style="text-align:left">${s.md_col_party}</th><th>${s.md_col_votes}</th><th>${s.md_col_vpct}</th><th>${s.md_col_nat_thresh}</th>`;
  if(off)h+=`<th>${s.md_official}</th>`;
  MNAMES.forEach(m=>h+=`<th>${m}</th>`);h+=`</tr></thead><tbody>`;
  rows.forEach((r)=>{
    const pi=allParties.indexOf(r.party);const pass=r.natThreshStatus;
    h+=`<tr><td class="tl">${r.district}</td><td>${r.distSeats}</td>`;
    h+=`<td class="tl"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${COLORS[pi%COLORS.length]};margin-right:4px;vertical-align:middle"></span>${r.party}</td>`;
    h+=`<td>${fmtNum(r.votes)}</td><td>${fmtDec(r.distVotePct,2)}%</td>`;
    h+=`<td class="${pass?'md-passed':'md-failed'}">${pass?s.md_passed:s.md_failed}</td>`;
    const ov=off?(off[r.district+'|'+r.party]||0):null;
    if(off)h+=`<td class="off-col">${ov}</td>`;
    [r.sl,r.slmod,r.dh,r.hare,r.droop].forEach(v=>h+=offCell(v,ov));h+=`</tr>`;
  });
  h+=`</tbody></table></div>`;
  if(off){const changed=lastMdCalc.districts.filter(d=>lastMdCalc.distResults.some(r=>r.district===d&&MD_KEYS.some(k=>(r[k]||0)!==(off[d+'|'+r.party]||0))));
    h=`<div class="mnote" style="margin-bottom:10px">${T('md_changed_note',{n:changed.length,t:lastMdCalc.districts.length})}</div>`+h+`<div class="res-legend"><span>${s.md_off_legend}</span><span><i class="lg-sw" style="background:var(--good-soft);border:1px solid #a7f3d0"></i>${s.md_off_more}</span><span><i class="lg-sw" style="background:var(--bad-soft);border:1px solid var(--bad-line)"></i>${s.md_off_less}</span></div>`;}
  document.getElementById('mdDistrictDiv').innerHTML=h;
}

/* ===== v1.3: kursi resmi, jejak hitung per dapil, kursi terakhir, simulasi ambang ===== */
function offCell(v,ov){
  let cls=v>0?'md-w':'';let ex='';
  if(ov!==null&&ov!==undefined&&v!==ov){const d=v-ov;cls+=d>0?' d-up':' d-dn';ex=`<span class="dlt">${d>0?'+':''}${d}</span>`;}
  return `<td class="${cls}">${v}${ex}</td>`;
}
let mdSimMethod=0,mdSimThresh=null,mdSimChart=null;
const MD_ALLOC=[(p,k)=>sainteLague(p,k,1),(p,k)=>sainteLague(p,k,1.4),(p,k)=>dhondt(p,k),(p,k)=>hare(p,k),(p,k)=>droop(p,k)];
function mdSeatsAt(th,mi){
  const{allParties,natVotes,totalNatVotes,districts,distMap}=lastMdCalc;
  const el=allParties.filter(p=>natVotes[p]/totalNatVotes*100>=th);const out={};allParties.forEach(p=>out[p]=0);
  if(!el.length)return out;
  districts.forEach(d=>{const pts=el.map(p=>({name:p,votes:distMap[d].parties[p]||0}));if(distMap[d].seats>0&&pts.some(x=>x.votes>0)){const r=MD_ALLOC[mi](pts,distMap[d].seats);el.forEach(p=>out[p]+=r[p]||0);}});
  return out;
}
function renderMdSim(){
  const el=document.getElementById('mdSimDiv');if(!el||!lastMdCalc)return;
  const s=STRINGS[currentLang];const MN=getMNames();const{allParties,thresh}=lastMdCalc;
  if(mdSimThresh===null)mdSimThresh=thresh;
  const steps=[];for(let i=0;i<=20;i++)steps.push(i/2);
  const series=steps.map(x=>mdSeatsAt(x,mdSimMethod));
  const shown=allParties.filter(p=>series.some(r=>r[p]>0));
  const mbtn=MN.map((m,i)=>`<button class="btn ${i===mdSimMethod?'bp':'bx'}" style="font-size:0.74rem;padding:5px 11px" onclick="mdSimMethod=${i};renderMdSim()">${m}</button>`).join('');
  el.innerHTML=`<div class="mnote" style="margin-bottom:12px">${s.md_sim_intro}</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${mbtn}</div>
  <div class="sim-ctl"><label for="mdSimRange">${s.md_sim_label}</label><input type="range" id="mdSimRange" min="0" max="10" step="0.1" value="${mdSimThresh}" oninput="mdSimThresh=parseFloat(this.value);document.getElementById('mdSimVal').textContent=fmtDec(mdSimThresh,1)+'%';renderMdSimTable()"><strong id="mdSimVal">${fmtDec(mdSimThresh,1)}%</strong></div>
  <div style="position:relative;height:320px;margin:6px 0 16px"><canvas id="mdSimChart"></canvas></div>
  <div id="mdSimTable"></div>
  <div class="ch-blk" style="margin-top:20px"><div class="ch-head"><h3>${T('ch_scn_title')} (${MN[mdSimMethod]})</h3><button class="btn bg" onclick="downloadCanvas('mdScnChart','skenario_ambang_batas.png')">${T('ch_dl')}</button></div><div class="ch-note">${T('ch_scn_note')}</div><div style="position:relative;height:320px"><canvas id="mdScnChart"></canvas></div></div>`;
  if(mdSimChart){mdSimChart.destroy();mdSimChart=null;}
  if(typeof Chart!=='undefined'){
    mdSimChart=new Chart(document.getElementById('mdSimChart').getContext('2d'),{type:'line',
      data:{labels:steps.map(x=>fmtDec(x,1)+'%'),datasets:shown.map(p=>{const c=COLORS[allParties.indexOf(p)%COLORS.length];return{label:p,data:series.map(r=>r[p]),borderColor:c,backgroundColor:c,borderWidth:2,pointRadius:2,tension:0};})},
      options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10,color:CC('ink2'),font:{size:11,family:'Open Sans'}}}},
        scales:{x:{title:{display:true,text:s.md_sim_x,color:CC('muted')},ticks:{color:CC('ink2')},grid:{display:false}},y:{title:{display:true,text:s.md_sim_y,color:CC('muted')},beginAtZero:true,ticks:{color:CC('muted')},grid:{color:CC('grid')}}}}});
  }
  renderMdSimTable();
  renderMdScenario();
}
function renderMdSimTable(){
  const el=document.getElementById('mdSimTable');if(!el||!lastMdCalc)return;
  const s=STRINGS[currentLang];const{allParties,natVotes,totalNatVotes,thresh}=lastMdCalc;
  const cur=mdSeatsAt(mdSimThresh,mdSimMethod),base=mdSeatsAt(thresh,mdSimMethod);
  const rows=allParties.filter(p=>cur[p]>0||base[p]>0);
  let h=`<div class="ow"><table class="md-tbl"><thead><tr><th style="text-align:left">${s.md_col_party}</th><th>${s.md_col_nat_pct}</th><th>${T('md_sim_at',{t:fmtDec(thresh,1)})}</th><th>${T('md_sim_at',{t:fmtDec(mdSimThresh,1)})}</th><th>${s.md_sim_change}</th></tr></thead><tbody>`;
  rows.forEach(p=>{const d=cur[p]-base[p];h+=`<tr><td class="tl">${p}</td><td>${fmtDec(natVotes[p]/totalNatVotes*100,2)}%</td><td>${base[p]}</td><td class="md-w">${cur[p]}</td><td class="${d>0?'d-up':d<0?'d-dn':''}">${d>0?'+':''}${d}</td></tr>`;});
  const nCur=allParties.filter(p=>natVotes[p]/totalNatVotes*100>=mdSimThresh).length;
  const lost=allParties.filter(p=>natVotes[p]/totalNatVotes*100<mdSimThresh).reduce((a,p)=>a+natVotes[p],0);
  el.innerHTML=h+`</tbody></table></div>`+narrBox(narrMdSim(cur,base));
}
let mdTraceDist=null,mdTraceMethod=0,mdLastMethod=0;
function mdOfficialMap(){
  if(!mdPresetActive)return null;
  const m={};MD_DPR2024.forEach((r,i)=>{MD_DPR2024_PARTIES.forEach((p,j)=>{m[r[0]+'|'+p]=j<8?MD_DPR2024_RESMI[i][j]:0;});});
  return m;
}
const MD_KEYS=['sl','slmod','dh','hare','droop'];
function mdEligPts(dist){
  const{distMap,eligible,allParties}=lastMdCalc;
  return allParties.filter(p=>eligible.has(p)).map(p=>({name:p,votes:distMap[dist].parties[p]||0}));
}
/* urutan kursi untuk metode pembagi: mi 0=SL,1=SL modifikasi,2=D'Hondt */
function mdSeatOrder(pts,seats,mi){return mi===2?buildDHondtTrace(pts.map(p=>({...p})),seats):buildDivisorTrace(pts.map(p=>({...p})),seats,mi===1?1.4:1);}
function divisorAt(mi,k){return mi===2?k+1:(k===0?(mi===1?1.4:1):2*k+1);}
function fmtDiv(d){return Number.isInteger(d)?String(d):fmtDec(d,1);}
/* kursi terakhir dan penantang terdekat untuk metode pembagi */
function mdLastSeat(pts,seats,mi){
  const order=mdSeatOrder(pts,seats,mi);if(!order.length)return null;
  const last=order[order.length-1];const won={};order.forEach(r=>won[r.party]=(won[r.party]||0)+1);
  let ch=null;
  pts.forEach(p=>{const div=divisorAt(mi,won[p.name]||0);const q=qv(p.votes/div);if(p.name!==last.party&&(!ch||q>ch.quotient))ch={party:p.name,votes:p.votes,divisor:div,quotient:q};});
  if(!ch)return{last,ch:null,gap:null,extra:null,order};
  let extra=Math.max(0,Math.floor(last.quotient*ch.divisor-ch.votes)+1);
  while(extra>0&&qv((ch.votes+extra-1)/ch.divisor)>last.quotient)extra--;
  while(qv((ch.votes+extra)/ch.divisor)<=last.quotient)extra++;
  return{last,ch,gap:last.quotient-ch.quotient,extra,order};
}
function mdTraceSelectors(){
  const{districts}=lastMdCalc;const s=STRINGS[currentLang];const MN=getMNames();
  if(!mdTraceDist||!districts.includes(mdTraceDist))mdTraceDist=districts[0];
  const opts=districts.map(d=>`<option value="${d}"${d===mdTraceDist?' selected':''}>${d}</option>`).join('');
  const mbtn=MN.map((m,i)=>`<button class="btn ${i===mdTraceMethod?'bp':'bx'}" style="font-size:0.74rem;padding:5px 11px" onclick="mdTraceMethod=${i};renderMdTrace()">${m}</button>`).join('');
  return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px"><label style="font-size:0.8rem;font-weight:600;color:var(--ink-2)">${s.md_filter_label}</label><select onchange="mdTraceDist=this.value;renderMdTrace()">${opts}</select></div>
  <div style="font-size:0.72rem;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">${s.trace_method_label}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${mbtn}</div>`;
}
function divisionMatrixHTML(pts,seats,mi,order){
  const s=STRINGS[currentLang];
  const marks={};const cnt={};order.forEach(r=>{const k=cnt[r.party]||0;marks[r.party+'|'+k]=r.seat;cnt[r.party]=k+1;});
  const cols=[];for(let k=0;k<seats;k++)cols.push(divisorAt(mi,k));
  let h=`<div class="ow"><table class="trace-tbl div-tbl"><thead><tr><th class="tl">${s.th_party}</th><th>${s.th_votes}</th>${cols.map(d=>`<th>÷ ${fmtDiv(d)}</th>`).join('')}<th>${s.th_total_seats}</th></tr></thead><tbody>`;
  pts.forEach(p=>{
    h+=`<tr><td class="tl">${p.name}</td><td class="num">${fmtNum(p.votes)}</td>`;
    cols.forEach((d,k)=>{const sn=marks[p.name+'|'+k];h+=`<td class="num${sn?' win':''}" ${sn?`title="${s.th_seat_no} ${sn}"`:''}>${fmtNum(Math.round(p.votes/d))}${sn?`<span class="sn">${sn}</span>`:''}</td>`;});
    h+=`<td><strong>${cnt[p.name]||0}</strong></td></tr>`;
  });
  return h+`</tbody></table></div>`;
}
function renderMdTrace(){
  const el=document.getElementById('mdTraceDiv');if(!el||!lastMdCalc)return;
  const s=STRINGS[currentLang];const MN=getMNames();
  let h=mdTraceSelectors();
  const dist=mdTraceDist;const seats=lastMdCalc.distMap[dist].seats;const pts=mdEligPts(dist);
  const off=mdOfficialMap();
  h+=`<div class="mnote" style="margin-bottom:12px">${T('md_trace_intro',{d:dist,k:seats})}</div>`;
  if(mdTraceMethod<=2){
    const L=mdLastSeat(pts,seats,mdTraceMethod);const order=L?L.order:[];
    if(L&&L.ch){
      h+=`<div class="sum-cards" style="margin-bottom:14px">
        <div class="sum-card"><div class="sc-val" style="font-size:1rem">${L.last.party}</div><div class="sc-lbl">${s.md_last_seat} · ${fmtNum(Math.round(L.last.quotient))}</div></div>
        <div class="sum-card"><div class="sc-val" style="font-size:1rem">${L.ch.party}</div><div class="sc-lbl">${s.md_challenger} · ${fmtNum(Math.round(L.ch.quotient))}</div></div>
        <div class="sum-card"><div class="sc-val" style="font-size:1rem">${fmtNum(L.extra)}</div><div class="sc-lbl">${s.md_extra_votes}</div></div></div>
        <div class="mnote" style="margin:-4px 0 14px">${s.md_extra_note}</div>`;
    }
    h+=`<h3 class="sub-h">${s.md_seat_order}</h3><div class="ow" style="margin-bottom:16px"><table class="trace-tbl"><thead><tr><th>${s.th_seat_no}</th><th class="tl">${s.th_party}</th><th>${s.th_votes}</th><th>${s.th_divisor}</th><th>${s.th_quotient}</th></tr></thead><tbody>${order.map(r=>`<tr><td>${r.seat}</td><td class="tl">${r.party}</td><td class="num">${fmtNum(r.votes)}</td><td>${fmtDiv(r.divisor)}</td><td class="num">${fmtDec(r.quotient,2)}</td></tr>`).join('')}</tbody></table></div>`;
    h+=`<h3 class="sub-h">${s.md_div_table}</h3><div class="mnote" style="margin-bottom:8px">${s.md_div_note}</div>`+divisionMatrixHTML(pts,seats,mdTraceMethod,order);
  } else {
    const{quota,rows}=mdTraceMethod===3?buildHareTrace(pts.map(p=>({...p})),seats):buildDroopTrace(pts.map(p=>({...p})),seats);
    h+=`<div class="mnote" style="margin-bottom:8px"><strong>${s.th_quota}:</strong> ${mdTraceMethod===3?fmtDec(quota,2):fmtNum(quota)} · ${s.md_quota_note}</div>`;
    h+=`<div class="ow"><table class="trace-tbl"><thead><tr><th class="tl">${s.th_party}</th><th>${s.th_votes}</th><th>${s.th_initial}</th><th>${s.th_remainder}</th><th>${s.th_additional}</th><th>${s.th_total_seats}</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="tl">${r.party}</td><td class="num">${fmtNum(r.votes)}</td><td>${r.initial}</td><td class="num">${mdTraceMethod===3?fmtDec(r.remainder,4):fmtNum(r.remainder)}</td><td>${r.additional}</td><td><strong>${r.total}</strong></td></tr>`).join('')}</tbody></table></div>`;
  }
  if(off){const k=MD_KEYS[mdTraceMethod];const diff=lastMdCalc.distResults.filter(r=>r.district===dist&&(r[k]||0)!==(off[dist+'|'+r.party]||0));
    h+=`<div class="mnote" style="margin-top:12px">${diff.length?T('md_trace_diff',{m:MN[mdTraceMethod]})+' '+diff.map(r=>`${r.party} ${r[k]||0} (${s.md_official.toLowerCase()} ${off[dist+'|'+r.party]||0})`).join(', '):T('md_trace_same',{m:MN[mdTraceMethod]})}</div>`;}
  h+=`<div style="margin-top:12px"><button class="btn bg" onclick="downloadMdTraceCSV()">${s.md_dl_trace}</button></div>`;
  el.innerHTML=h;
}
function downloadMdTraceCSV(){
  if(!lastMdCalc)return;const MN=getMNames();const dist=mdTraceDist;const seats=lastMdCalc.distMap[dist].seats;const pts=mdEligPts(dist);
  let rows;
  if(mdTraceMethod<=2){
    const order=mdSeatOrder(pts,seats,mdTraceMethod);
    rows=[['dapil','metode','kursi_ke','partai','suara','pembagi','hasil_bagi']];
    order.forEach(r=>rows.push([dist,MN[mdTraceMethod],r.seat,r.party,r.votes,r.divisor,r.quotient.toFixed(4)]));
    rows.push([]);rows.push(['partai','suara'].concat(Array.from({length:seats},(_,k)=>'bagi_'+divisorAt(mdTraceMethod,k))));
    pts.forEach(p=>rows.push([p.name,p.votes].concat(Array.from({length:seats},(_,k)=>(p.votes/divisorAt(mdTraceMethod,k)).toFixed(4)))));
  } else {
    const{quota,rows:qr}=mdTraceMethod===3?buildHareTrace(pts.map(p=>({...p})),seats):buildDroopTrace(pts.map(p=>({...p})),seats);
    rows=[['dapil','metode','partai','suara','kuota','kursi_awal','sisa','kursi_tambahan','total_kursi']];
    qr.forEach(r=>rows.push([dist,MN[mdTraceMethod],r.party,r.votes,quota.toFixed(4),r.initial,mdTraceMethod===3?r.remainder.toFixed(6):r.remainder,r.additional,r.total]));
  }
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}),'jejak_hitung_'+dist.replace(/\s+/g,'_').toLowerCase()+'.csv');
}
function mdLastRows(){
  const{districts,distMap}=lastMdCalc;
  return districts.map(d=>{const L=mdLastSeat(mdEligPts(d),distMap[d].seats,mdLastMethod);return L&&L.ch?{dist:d,seats:distMap[d].seats,...L}:null;}).filter(Boolean).sort((a,b)=>a.extra-b.extra);
}
function renderMdLast(){
  const el=document.getElementById('mdLastDiv');if(!el||!lastMdCalc)return;
  const s=STRINGS[currentLang];const MN=getMNames();
  const mbtn=MN.slice(0,3).map((m,i)=>`<button class="btn ${i===mdLastMethod?'bp':'bx'}" style="font-size:0.74rem;padding:5px 11px" onclick="mdLastMethod=${i};renderMdLast()">${m}</button>`).join('');
  const rows=mdLastRows();
  let h=`<div class="mnote" style="margin-bottom:10px">${s.md_last_intro}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${mbtn}</div>`+narrBox(narrMdLast(rows))+`<div class="ch-blk" style="margin-top:16px"><div class="ch-head"><h3>${T('ch_last_title')}</h3><button class="btn bg" onclick="downloadCanvas('mdLastChart','selisih_kursi_terakhir.png')">${T('ch_dl')}</button></div><div class="ch-note">${T('ch_last_note')}</div><div style="position:relative;height:300px"><canvas id="mdLastChart"></canvas></div></div>`;
  h+=`<div style="margin-bottom:10px"><button class="btn bg" onclick="downloadMdLastCSV()">${s.md_dl_last}</button></div>`;
  h+=`<div class="ow"><table class="trace-tbl"><thead><tr><th>#</th><th class="tl">${s.md_col_dapil}</th><th>${s.md_col_seats}</th><th class="tl">${s.md_last_seat}</th><th>${s.th_quotient}</th><th class="tl">${s.md_challenger}</th><th>${s.th_quotient}</th><th>${s.md_extra_votes}</th></tr></thead><tbody>`;
  rows.forEach((r,i)=>{h+=`<tr><td>${i+1}</td><td class="tl"><a href="#" onclick="mdTraceDist='${r.dist.replace(/'/g,"\\'")}';mdTraceMethod=${mdLastMethod};switchMdTab(3);return false" style="color:var(--blue)">${r.dist}</a></td><td>${r.seats}</td><td class="tl">${r.last.party}</td><td class="num">${fmtNum(Math.round(r.last.quotient))}</td><td class="tl">${r.ch.party}</td><td class="num">${fmtNum(Math.round(r.ch.quotient))}</td><td class="num"><strong>${fmtNum(r.extra)}</strong></td></tr>`;});
  el.innerHTML=h+`</tbody></table></div><div class="mnote" style="margin-top:10px">${s.md_extra_note}</div>`;
  drawMdLastChart(rows);
}
function downloadMdLastCSV(){
  if(!lastMdCalc)return;const MN=getMNames();
  const rows=[['peringkat','dapil','kursi_dapil','metode','kursi_terakhir_partai','kursi_terakhir_hasil_bagi','penantang_terdekat','penantang_hasil_bagi','tambahan_suara_dibutuhkan']];
  mdLastRows().forEach((r,i)=>rows.push([i+1,r.dist,r.seats,MN[mdLastMethod],r.last.party,r.last.quotient.toFixed(4),r.ch.party,r.ch.quotient.toFixed(4),r.extra]));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}),'persaingan_kursi_terakhir.csv');
}

function renderMdInfo(){
  if(!lastMdCalc)return;
  const{allParties,natVotes,totalNatVotes,eligible,thresh,districts,totalDistSeats}=lastMdCalc;
  const s=STRINGS[currentLang];const MNAMES=getMNames();
  const passedList=[...eligible].join(', ');
  const failedList=allParties.filter(p=>!eligible.has(p)).join(', ')||'—';
  let h=`<div class="md-sum-cards">`;
  [[districts.length,s.md_info_districts],[totalDistSeats,s.md_info_seats],[allParties.length,s.md_info_parties],
   [fmtNum(totalNatVotes),s.md_info_nat_votes],[thresh+'%',s.md_info_thresh],
   [eligible.size,s.md_info_passed],[allParties.length-eligible.size,s.md_info_failed]]
  .forEach(([v,l])=>h+=`<div class="md-sum-card"><div class="sc-val">${v}</div><div class="sc-lbl">${l}</div></div>`);
  h+=`</div>`;
  h+=`<div class="ibox"><strong>${s.md_info_methods}:</strong> ${MNAMES.join(' · ')}<br>`;
  h+=`<strong>${s.md_info_passed}:</strong> ${passedList}<br><strong>${s.md_info_failed}:</strong> ${failedList}</div>`;
  h+=`<div class="mnote">${s.md_info_note}</div>`;
  document.getElementById('mdInfoDiv').innerHTML=h;
}

function downloadMultiNationalCSV(){
  if(!lastMdCalc)return;
  const{allParties,natVotes,totalNatVotes,eligible,natSeats}=lastMdCalc;const en=currentLang==='en';
  const rows=[['partai','total_suara_nasional','vote_percent_nasional','status_threshold','sainte_lague','sl_modifikasi','dhondt','hare','droop']];
  allParties.forEach(p=>{rows.push([p,natVotes[p],(natVotes[p]/totalNatVotes*100).toFixed(2),eligible.has(p)?(en?'Passed':'Lolos'):(en?'Did Not Pass':'Tidak Lolos'),natSeats.sl[p]||0,natSeats.slmod[p]||0,natSeats.dh[p]||0,natSeats.hare[p]||0,natSeats.droop[p]||0]);});
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'hasil_multi_dapil_ringkasan_nasional.csv');
}

function downloadMultiDistrictCSV(){
  if(!lastMdCalc)return;
  const{distResults,allParties}=lastMdCalc;const en=currentLang==='en';
  const rows=[['dapil','kursi_dapil','partai','suara','vote_percent_dapil','status_threshold_nasional','sainte_lague','sl_modifikasi','dhondt','hare','droop']];
  const dIdx={};lastMdCalc.districts.forEach((d,i)=>dIdx[d]=i);
  const sorted=[...distResults].sort((a,b)=>dIdx[a.district]-dIdx[b.district]||b.votes-a.votes);
  sorted.forEach(r=>rows.push([r.district,r.distSeats,r.party,r.votes,r.distVotePct.toFixed(2),r.natThreshStatus?(en?'Passed':'Lolos'):(en?'Did Not Pass':'Tidak Lolos'),r.sl,r.slmod,r.dh,r.hare,r.droop]));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'hasil_multi_dapil_detail_per_dapil.csv');
}

