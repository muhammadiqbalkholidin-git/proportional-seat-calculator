/* Indeks disproporsionalitas. */
/* ================================================================ INDEX PROPORSIONALITAS ================================================================ */
let idxData=[],idxCsvParsed=[],lastIdxCalc=null;

const idxDz=document.getElementById('idx-dropzone');
idxDz.addEventListener('dragover',e=>{e.preventDefault();idxDz.classList.add('drag');});
idxDz.addEventListener('dragleave',()=>idxDz.classList.remove('drag'));
idxDz.addEventListener('drop',e=>{e.preventDefault();idxDz.classList.remove('drag');const f=e.dataTransfer.files[0];if(f)handleIndexCSV(f);});

function handleIndexCSV(file){
  if(!file)return;
  if(!file.name.match(/\.csv$/i)){showIdxAlert(currentLang==='en'?'File must be .csv':'File harus .csv','err');return;}
  const r=new FileReader();r.onload=e=>parseIndexCSV(e.target.result.replace(/\r/g,''),file.name);r.readAsText(file,'UTF-8');
}
function parseIndexCSV(text,fname){
  const lines=text.split('\n').filter(l=>l.trim());
  if(lines.length<2){showIdxAlert(currentLang==='en'?'File too short':'File terlalu pendek','err');return;}
  const delim=lines[0].includes(';')?';':',';
  const header=lines[0].split(delim).map(h=>h.trim().toLowerCase().replace(/"/g,''));
  const pi=header.findIndex(h=>['partai','party','nama','name'].includes(h));
  const vi=header.findIndex(h=>['suara','votes','vote'].includes(h));
  const si=header.findIndex(h=>['kursi','seats','seat'].includes(h));
  if(pi<0||vi<0||si<0){showIdxAlert(currentLang==='en'?'CSV must have columns: party/partai, votes/suara, seats/kursi':'CSV harus memiliki kolom: partai, suara, kursi','err');return;}
  const rows=[],errs=[];
  lines.slice(1).forEach((line,idx)=>{
    if(!line.trim())return;
    const cols=line.split(delim).map(c=>c.trim().replace(/^"|"$/g,''));
    const name=cols[pi]||'';const votes=parseInt((cols[vi]||'').replace(/[\.,\s]/g,''))||0;const seats=parseInt((cols[si]||'').replace(/[\.,\s]/g,''));
    if(!name){errs.push(`Row ${idx+2}`);return;}
    if(votes<0){errs.push(`Row ${idx+2}`);return;}
    if(isNaN(seats)||seats<0){errs.push(`Row ${idx+2}`);return;}
    rows.push({name,votes,seats});
  });
  if(rows.length===0){showIdxAlert(currentLang==='en'?'No valid data found.':'Tidak ada data valid.','err');return;}
  idxCsvParsed=rows;
  showIdxAlert(errs.length>0?`${errs.length} ${currentLang==='en'?'rows skipped':'baris dilewati'}`:`${rows.length} ${currentLang==='en'?`parties loaded from "${fname}"`:`partai dibaca dari "${fname}"`}`,errs.length>0?'err':'ok');
  document.getElementById('idxPreviewLabel').textContent=currentLang==='en'?`Preview: ${rows.length} parties`:`Preview: ${rows.length} partai`;
  const h1=currentLang==='en'?'Party':'Partai',h2=currentLang==='en'?'Votes':'Suara',h3=currentLang==='en'?'Seats':'Kursi';
  let h=`<thead><tr><th>#</th><th>${h1}</th><th>${h2}</th><th>${h3}</th></tr></thead><tbody>`;
  rows.forEach((r,i)=>h+=`<tr><td>${i+1}</td><td>${r.name}</td><td>${fmtNum(r.votes)}</td><td>${r.seats}</td></tr>`);
  document.getElementById('idxPrevTbl').innerHTML=h+'</tbody>';
  document.getElementById('idxCsvPreview').classList.remove('hidden');document.getElementById('idxDropText').textContent=fname;
}
function showIdxAlert(msg,type){const el=document.getElementById('idxCsvAlert');el.className=`alert alert-${type==='err'?'err':'ok'}`;el.textContent=msg;el.classList.remove('hidden');}
function applyIndexCSV(){
  if(!idxCsvParsed.length)return;
  idxData=idxCsvParsed.map(r=>({id:uid(),name:r.name,votes:r.votes,seats:r.seats}));renderIndexParties();
  idxPresetActive=false;renderIdxPresetNote();
  document.getElementById('idxCsvPreview').classList.add('hidden');document.getElementById('idxCsvAlert').classList.add('hidden');
  document.getElementById('idxDropText').textContent=STRINGS[currentLang].csv_drop;document.getElementById('idxCsvFile').value='';
}
function cancelIndexCSV(){
  idxCsvParsed=[];document.getElementById('idxCsvPreview').classList.add('hidden');document.getElementById('idxCsvAlert').classList.add('hidden');
  document.getElementById('idxDropText').textContent=STRINGS[currentLang].csv_drop;document.getElementById('idxCsvFile').value='';
}
function downloadIndexTemplate(){
  const en=currentLang==='en';
  const csv=en?'party,votes,seats\nParty A,1000000,40\nParty B,800000,30\nParty C,500000,20\nParty D,200000,10\n':'partai,suara,kursi\nPartai A,1000000,40\nPartai B,800000,30\nPartai C,500000,20\nPartai D,200000,10\n';
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'template_indeks_proporsionalitas.csv');
}
function addIndexParty(name,votes,seats){idxData.push({id:uid(),name:name||'',votes:Number(votes)||0,seats:Number(seats)||0});renderIndexParties();}
function delIndexParty(id){idxData=idxData.filter(p=>p.id!==id);renderIndexParties();}
function renderIndexParties(){
  const el=document.getElementById('idx-plist');el.innerHTML='';const s=STRINGS[currentLang];
  const lP=s.idx_lbl_party||'Nama Partai',lV=s.idx_lbl_votes||'Suara',lS=s.idx_lbl_seats||'Kursi';
  if(idxData.length)el.appendChild(headRow([['fn',lP],['fv',lV],['fs',lS]]));
  idxData.forEach((p,i)=>{
    const d=document.createElement('div');d.className='idx-prow';
    const dot=document.createElement('div');dot.className='dot';dot.style.background=COLORS[i%COLORS.length];
    const nw=document.createElement('div');nw.className='fn';
    const ni=document.createElement('input');ni.type='text';ni.value=p.name;ni.placeholder=(currentLang==='en'?'Party ':'Partai ')+(i+1);
    ni.setAttribute('aria-label',lP);ni.addEventListener('input',()=>{idxData[i].name=ni.value;});nw.append(ni);
    const vw=document.createElement('div');vw.className='fv';
    const vi2=numInput(p.votes,v=>{idxData[i].votes=v;},'inp-votes');vi2.setAttribute('aria-label',lV);vw.append(vi2);
    const sw=document.createElement('div');sw.className='fs';
    const si2=numInput(p.seats,v=>{idxData[i].seats=v;},'inp-seats');si2.setAttribute('aria-label',lS);sw.append(si2);
    d.append(dot,nw,vw,sw,delButton(()=>delIndexParty(p.id)));el.appendChild(d);
  });
}
let idxPresetActive=false;
function loadIdxDPR(){
  idxData=DPR2024.map(([n,v])=>({id:uid(),name:n,votes:v,seats:DPR2024_SEATS[n]||0}));
  renderIndexParties();document.getElementById('idxResCard').classList.add('hidden');lastIdxCalc=null;
  idxPresetActive=true;renderIdxPresetNote();
}
function renderIdxPresetNote(){const el=document.getElementById('idxPresetNote');if(!el)return;el.innerHTML=idxPresetActive?T('idx_preset_note'):'';el.classList.toggle('hidden',!idxPresetActive);}
function resetIndex(){
  idxPresetActive=false;renderIdxPresetNote();
  idxData=[];const label=currentLang==='en'?'Party ':'Partai ';
  for(let i=1;i<=4;i++)idxData.push({id:uid(),name:label+i,votes:0,seats:0});
  renderIndexParties();document.getElementById('idxResCard').classList.add('hidden');lastIdxCalc=null;
}
let drawVoteSeatLater=null;
function idxFormulas(parties){
  const LHI=0.5*parties.reduce((a,p)=>a+Math.abs(p.votePercent-p.seatPercent),0);
  const LSI=Math.sqrt(0.5*parties.reduce((a,p)=>a+Math.pow(p.votePercent-p.seatPercent,2),0));
  const ENPP=1/parties.reduce((a,p)=>a+Math.pow(p.seatShare,2),0);
  return {LHI,LSI,ENPP};
}
function calculateIndex(silent){
  document.querySelectorAll('#idx-plist .idx-prow').forEach((row,i)=>{
    if(!idxData[i])return;
    idxData[i].name=row.querySelectorAll('input')[0].value;
    idxData[i].votes=parseNum(row.querySelectorAll('input')[1].value);
    idxData[i].seats=parseNum(row.querySelectorAll('input')[2].value);
  });
  const s=STRINGS[currentLang];const en=currentLang==='en';
  for(let p of idxData){
    if(!p.name.trim()){notify(en?'Party name cannot be empty.':'Nama partai tidak boleh kosong.');return;}
    if(p.votes<0){notify(en?'Votes cannot be negative.':'Suara tidak boleh negatif.');return;}
    if(p.seats<0){notify(en?'Seats cannot be negative.':'Kursi tidak boleh negatif.');return;}
  }
  const totalVotes=idxData.reduce((a,p)=>a+p.votes,0);
  const totalSeats=idxData.reduce((a,p)=>a+p.seats,0);
  if(totalVotes<=0){notify(en?'Total votes must be greater than 0.':'Total suara harus lebih dari 0.');return;}
  if(totalSeats<=0){notify(en?'Total seats must be greater than 0.':'Total kursi harus lebih dari 0.');return;}
  const n=idxData.length;
  const parties=idxData.map(p=>({name:p.name,votes:p.votes,seats:p.seats,voteShare:p.votes/totalVotes,seatShare:p.seats/totalSeats,votePercent:(p.votes/totalVotes)*100,seatPercent:(p.seats/totalSeats)*100,gap:((p.seats/totalSeats)*100)-((p.votes/totalVotes)*100)}));
  const {LHI,LSI,ENPP}=idxFormulas(parties);
  lastIdxCalc={parties,totalVotes,totalSeats,n,LHI,LSI,ENPP};
  const maxPosGap=[...parties].sort((a,b)=>b.gap-a.gap)[0];
  const maxNegGap=[...parties].sort((a,b)=>a.gap-b.gap)[0];
  const sumCards=`<div class="sum-cards"><div class="sum-card"><div class="sc-val">${fmtNum(totalVotes)}</div><div class="sc-lbl">${s.idx_sum_votes}</div></div><div class="sum-card"><div class="sc-val">${fmtNum(totalSeats)}</div><div class="sc-lbl">${s.idx_sum_seats}</div></div><div class="sum-card"><div class="sc-val">${n}</div><div class="sc-lbl">${s.idx_sum_parties}</div></div></div>`;
  const ptHead=`<thead><tr><th style="text-align:left">${s.idx_col_party}</th><th>${s.idx_col_votes}</th><th>${s.idx_col_seats}</th><th>${s.idx_col_vpct}</th><th>${s.idx_col_spct}</th><th>${s.idx_col_gap}</th></tr></thead>`;
  const ptBody=parties.map((p,i)=>`<tr><td class="tl"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${COLORS[i%COLORS.length]};margin-right:5px;vertical-align:middle"></span>${p.name}</td><td>${fmtNum(p.votes)}</td><td>${p.seats}</td><td>${fmtDec(p.votePercent,2)}%</td><td>${fmtDec(p.seatPercent,2)}%</td><td class="${p.gap>0?'gap-pos':p.gap<0?'gap-neg':''}">${p.gap>0?'+':''}${fmtDec(p.gap,2)}%</td></tr>`).join('');
  const partyTable=`<div class="ow" style="margin-bottom:18px"><table class="idx-tbl">${ptHead}<tbody>${ptBody}</tbody></table></div>`;
  const idxHead=`<thead><tr><th style="text-align:left">${s.idx_ind_col}</th><th>${s.idx_val_col}</th><th style="text-align:left">${s.idx_meaning_col}</th></tr></thead>`;
  const idxBody=`<tbody><tr><td class="tl"><strong>LHI</strong><br><span style="font-size:0.7rem;color:var(--muted)">Loosemore-Hanby Index</span></td><td><span class="idx-val">${fmtDec(LHI,2)}</span></td><td style="text-align:left;font-size:0.78rem">${s.idx_lhi_meaning}</td></tr><tr><td class="tl"><strong>LSI</strong><br><span style="font-size:0.7rem;color:var(--muted)">Least Squares / Gallagher Index</span></td><td><span class="idx-val">${fmtDec(LSI,2)}</span></td><td style="text-align:left;font-size:0.78rem">${s.idx_lsi_meaning}</td></tr><tr><td class="tl"><strong>ENPP</strong><br><span style="font-size:0.7rem;color:var(--muted)">Effective Number of Parliamentary Parties</span></td><td><span class="idx-val">${fmtDec(ENPP,2)}</span></td><td style="text-align:left;font-size:0.78rem">${s.idx_enpp_meaning}</td></tr></tbody>`;
  const idxTable=`<div class="ow" style="margin-bottom:18px"><table class="idx-res-tbl" style="width:100%;border-collapse:collapse">${idxHead}${idxBody}</table></div>`;
  let interpText=en?`Based on the input data, the LHI is <strong>${fmtDec(LHI,2)}</strong> and the LSI is <strong>${fmtDec(LSI,2)}</strong>. The ENPP is <strong>${fmtDec(ENPP,2)}</strong>. The party with the largest positive gap is <strong>${maxPosGap.name}</strong> (+${fmtDec(maxPosGap.gap,2)}%). The party with the largest negative gap is <strong>${maxNegGap.name}</strong> (${fmtDec(maxNegGap.gap,2)}%). Of the ${n} parties in the data, ${parties.filter(p=>p.seats>0).length} win seats.`:`Dari data ini, nilai LHI sebesar <strong>${fmtDec(LHI,2)}</strong> dan LSI sebesar <strong>${fmtDec(LSI,2)}</strong>, sedangkan jumlah efektif partai di parlemen (ENPP) sebesar <strong>${fmtDec(ENPP,2)}</strong>. Partai yang paling diuntungkan adalah <strong>${maxPosGap.name}</strong>, dengan persentase kursi ${fmtDec(maxPosGap.gap,2)} poin di atas persentase suaranya, sementara yang paling dirugikan adalah <strong>${maxNegGap.name}</strong>, dengan persentase kursi ${fmtDec(Math.abs(maxNegGap.gap),2)} poin di bawah persentase suaranya. Dari ${n} partai dalam data, ${parties.filter(p=>p.seats>0).length} partai memperoleh kursi.`;
  const dlBtn=`<div style="margin-bottom:12px"><button class="btn bg" onclick="downloadIndexResultsCSV()">${s.idx_dl_results}</button></div>`;
  document.getElementById('idxResDiv').innerHTML=dlBtn+sumCards+partyTable+idxTable+narrBox(interpText)+`<div class="ch-blk" style="margin-top:18px"><div class="ch-head"><h3>${T('ch_vs_title')}</h3><button class="btn bg" onclick="downloadCanvas('idxVsChart','persentase_suara_kursi_indeks.png')">${T('ch_dl')}</button></div><div class="ch-note">${T('ch_vs_note')}</div><div style="position:relative;height:360px"><canvas id="idxVsChart"></canvas></div></div>`+`<div class="ch-blk"><div class="ch-head"><h3>${T('ch_hemi_title')}</h3><button class="btn bg" onclick="downloadSVG('hemiIdx','komposisi_kursi_indeks.png')">${T('ch_dl')}</button></div><div class="ch-note">${T('ch_hemi_note')}</div><div id="hemiIdx"></div></div>`+`<div class="mnote">${s.idx_note}</div>`;
  drawVoteSeatLater=()=>{drawVoteSeat('idxVsChart',parties.map((p,i)=>({name:p.name,vp:p.votePercent,sp:p.seatPercent,color:COLORS[i%COLORS.length]})));document.getElementById('hemiIdx').innerHTML=hemicycleSVG(parties.map((p,i)=>({name:p.name,seats:p.seats,color:COLORS[i%COLORS.length]})));};
  document.getElementById('idxResCard').classList.remove('hidden');
  if(drawVoteSeatLater){drawVoteSeatLater();drawVoteSeatLater=null;}
  if(silent){switchIndexTab(document.getElementById('idxPanel1').classList.contains('hidden')?0:1);return;}
  switchIndexTab(0);document.getElementById('idxResCard').scrollIntoView({behavior:'smooth'});
}
function switchIndexTab(n){
  document.getElementById('idxPanel0').classList.toggle('hidden',n!==0);document.getElementById('idxPanel1').classList.toggle('hidden',n!==1);
  document.getElementById('idxTab0').classList.toggle('on',n===0);document.getElementById('idxTab1').classList.toggle('on',n===1);
  if(n===1)renderIndexTrace();
}
function downloadIndexResultsCSV(){
  if(!lastIdxCalc){notify(currentLang==='en'?'Please calculate first!':'Hitung dulu!');return;}
  const{parties,totalVotes,totalSeats,LHI,LSI,ENPP}=lastIdxCalc;const en=currentLang==='en';
  const rows=[];
  rows.push([en?'Party':'Partai',en?'Votes':'Suara',en?'Seats':'Kursi','Vote %','Seat %','Gap','|Gap|','Gap²','Seat Share²']);
  parties.forEach(p=>{rows.push([p.name,p.votes,p.seats,p.votePercent.toFixed(2),p.seatPercent.toFixed(2),p.gap.toFixed(2),Math.abs(p.gap).toFixed(2),Math.pow(p.gap,2).toFixed(6),Math.pow(p.seatShare,2).toFixed(6)]);});
  rows.push([]);rows.push([en?'Indicator':'Indikator',en?'Value':'Nilai',en?'Description':'Keterangan']);
  rows.push(['LHI',LHI.toFixed(2),'Loosemore-Hanby Index']);rows.push(['LSI',LSI.toFixed(2),'Least Squares Index / Gallagher Index']);rows.push(['ENPP',ENPP.toFixed(2),'Effective Number of Parliamentary Parties']);
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'hasil_indeks_proporsionalitas.csv');
}
function renderIndexTrace(){
  const el=document.getElementById('idxTraceDiv');
  if(!lastIdxCalc){el.innerHTML=`<div class="ibox">${currentLang==='en'?'Please calculate first.':'Hitung terlebih dahulu.'}</div>`;return;}
  const{parties,totalVotes,totalSeats,n,LHI,LSI,ENPP}=lastIdxCalc;const s=STRINGS[currentLang];
  const sumHtml=`<div class="idx-trace-summary"><strong>${s.idx_trace_total_votes}:</strong> ${fmtNum(totalVotes)} &nbsp;·&nbsp; <strong>${s.idx_trace_total_seats}:</strong> ${fmtNum(totalSeats)} &nbsp;·&nbsp; <strong>${s.idx_trace_num_parties}:</strong> ${n}</div>`;
  const tblHead=`<thead><tr><th style="text-align:left">${s.idx_trace_col_party}</th><th>${s.idx_trace_col_votes}</th><th>${s.idx_trace_col_seats}</th><th>${s.idx_trace_col_vpct}</th><th>${s.idx_trace_col_spct}</th><th>${s.idx_trace_col_gap}</th><th>${s.idx_trace_col_absgap}</th><th>${s.idx_trace_col_gap2}</th><th>${s.idx_trace_col_ss2}</th></tr></thead>`;
  const tblBody=parties.map((p,i)=>`<tr><td class="tl"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${COLORS[i%COLORS.length]};margin-right:4px;vertical-align:middle"></span>${p.name}</td><td>${fmtNum(p.votes)}</td><td>${p.seats}</td><td>${fmtDec(p.votePercent,2)}</td><td>${fmtDec(p.seatPercent,2)}</td><td class="${p.gap>0?'gap-pos':p.gap<0?'gap-neg':''}">${p.gap>0?'+':''}${fmtDec(p.gap,2)}</td><td>${fmtDec(Math.abs(p.gap),2)}</td><td>${fmtDec(Math.pow(p.gap,2),4)}</td><td>${fmtDec(Math.pow(p.seatShare,2),6)}</td></tr>`).join('');
  const tblHtml=`<div class="ow" style="margin-bottom:14px"><table class="trace-tbl">${tblHead}<tbody>${tblBody}</tbody></table></div>`;
  const fmlHtml=`<div style="font-size:0.72rem;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px">${s.idx_trace_formulas}</div><div class="idx-trace-formula">${s.idx_trace_lhi_formula}<br>${s.idx_trace_lsi_formula}<br>${s.idx_trace_enpp_formula}</div>`;
  const sumAbsGap=parties.reduce((a,p)=>a+Math.abs(p.gap),0);
  const sumGap2=parties.reduce((a,p)=>a+Math.pow(p.gap,2),0);
  const sumSS2=parties.reduce((a,p)=>a+Math.pow(p.seatShare,2),0);
  const calcHtml=`<div style="font-size:0.72rem;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:1.2px;margin:14px 0 6px">${s.idx_trace_calc}</div><div class="idx-trace-summary">Σ |Gap| = <strong>${fmtDec(sumAbsGap,4)}</strong><br><strong>LHI</strong> = 0.5 × ${fmtDec(sumAbsGap,4)} = <strong style="color:var(--blue)">${fmtDec(LHI,4)}</strong><br><br>Σ Gap² = <strong>${fmtDec(sumGap2,4)}</strong><br><strong>LSI</strong> = √(0.5 × ${fmtDec(sumGap2,4)}) = <strong style="color:var(--blue)">${fmtDec(LSI,4)}</strong><br><br>Σ Seat Share² = <strong>${fmtDec(sumSS2,6)}</strong><br><strong>ENPP</strong> = 1 / ${fmtDec(sumSS2,6)} = <strong style="color:var(--blue)">${fmtDec(ENPP,4)}</strong></div>`;
  const dlBtn=`<div style="margin-top:12px"><button class="btn bg" onclick="downloadIndexTraceCSV()">${s.idx_trace_dl}</button></div>`;
  el.innerHTML=sumHtml+tblHtml+fmlHtml+calcHtml+dlBtn;
}
function downloadIndexTraceCSV(){
  if(!lastIdxCalc){notify(currentLang==='en'?'Please calculate first!':'Hitung dulu!');return;}
  const{parties,totalVotes,totalSeats,n,LHI,LSI,ENPP}=lastIdxCalc;const s=STRINGS[currentLang];
  const rows=[];
  rows.push([s.idx_trace_total_votes,totalVotes]);rows.push([s.idx_trace_total_seats,totalSeats]);rows.push([s.idx_trace_num_parties,n]);rows.push([]);
  rows.push([s.idx_trace_col_party,s.idx_trace_col_votes,s.idx_trace_col_seats,s.idx_trace_col_vpct,s.idx_trace_col_spct,s.idx_trace_col_gap,s.idx_trace_col_absgap,s.idx_trace_col_gap2,s.idx_trace_col_ss2]);
  parties.forEach(p=>{rows.push([p.name,p.votes,p.seats,p.votePercent.toFixed(4),p.seatPercent.toFixed(4),p.gap.toFixed(4),Math.abs(p.gap).toFixed(4),Math.pow(p.gap,2).toFixed(6),Math.pow(p.seatShare,2).toFixed(6)]);});
  rows.push([]);rows.push([s.idx_trace_formulas]);rows.push([s.idx_trace_lhi_formula]);rows.push([s.idx_trace_lsi_formula]);rows.push([s.idx_trace_enpp_formula]);rows.push([]);
  rows.push(['LHI',LHI.toFixed(4),'Loosemore-Hanby Index']);rows.push(['LSI',LSI.toFixed(4),'Least Squares Index / Gallagher Index']);rows.push(['ENPP',ENPP.toFixed(4),'Effective Number of Parliamentary Parties']);
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'jejak_hitung_indeks_proporsionalitas.csv');
}

