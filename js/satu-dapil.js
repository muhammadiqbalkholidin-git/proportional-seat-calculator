/* Kalkulator Satu Dapil: masukan data, impor CSV, pembantu umum, pembulatan, aturan ambang batas, dan preset. */
/* ================================================================ MAIN CALCULATOR ================================================================ */
const COLORS=['#1d4ed8','#dc2626','#059669','#d97706','#7c3aed','#db2777','#0891b2','#65a30d','#ea580c','#4f46e5','#0d9488','#be123c','#a16207','#9333ea','#0284c7','#15803d','#c2410c','#475569'];
const METHOD_COLORS=['#2552b8','#3b82f6','#93c5fd','#0d9488','#99f6e4'];
const MNAMES_ID=["Sainte-Laguë","SL Modifikasi","D'Hondt","Kuota Hare","Kuota Droop"];
const MNAMES_EN=["Sainte-Laguë","Modified SL","D'Hondt","Hare Quota","Droop Quota"];
const getMNames=()=>currentLang==='en'?MNAMES_EN:MNAMES_ID;
let pdata=[],chartInst=null,lastResults=null,csvParsed=[];
let traceMethodIndex=0,lastTraceData=null,presetActive=false,lembaga='table',loadedDapil=null;

function uid(){return '_'+Math.random().toString(36).slice(2);}

const dz=document.getElementById('dropzone');
dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag');});
dz.addEventListener('dragleave',()=>dz.classList.remove('drag'));
dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag');const f=e.dataTransfer.files[0];if(f)handleFile(f);});

function handleFile(file){
  if(!file)return;
  if(!file.name.match(/\.csv$/i)){showCsvAlert(currentLang==='en'?'File must be .csv':'File harus .csv','err');return;}
  const r=new FileReader();r.onload=e=>parseCSV(e.target.result.replace(/\r/g,''),file.name);r.readAsText(file,'UTF-8');
}
function parseCSV(text,fname){
  const lines=text.split('\n').filter(l=>l.trim());
  if(lines.length<2){showCsvAlert(currentLang==='en'?'File too short':'File terlalu pendek','err');return;}
  const delim=lines[0].includes(';')?';':',';
  const header=lines[0].split(delim).map(h=>h.trim().toLowerCase().replace(/"/g,''));
  const ni=Math.max(0,header.findIndex(h=>['nama','name','partai','party'].includes(h)));
  const vi=Math.max(1,header.findIndex(h=>['suara','votes','vote','jumlah','total'].includes(h)));
  const rows=[],errs=[];
  lines.slice(1).forEach((line,idx)=>{
    if(!line.trim())return;
    const cols=line.split(delim).map(c=>c.trim().replace(/^"|"$/g,''));
    const name=cols[ni]||'';const votes=parseInt((cols[vi]||'').replace(/[\.,]/g,''))||0;
    if(!name){errs.push(`Row ${idx+2}`);return;}
    if(votes<=0){errs.push(`Row ${idx+2}`);return;}
    rows.push({name,votes});
  });
  if(rows.length===0){showCsvAlert(currentLang==='en'?'No valid data.':'Tidak ada data valid.','err');return;}
  csvParsed=rows;const tot=rows.reduce((a,r)=>a+r.votes,0);
  showCsvAlert(errs.length>0?`${errs.length} ${currentLang==='en'?'rows skipped':'baris dilewati'}`:`${rows.length} ${currentLang==='en'?`parties loaded from "${fname}"`:`partai dibaca dari "${fname}"`}`,errs.length>0?'err':'ok');
  document.getElementById('previewLabel').textContent=currentLang==='en'?`Preview: ${rows.length} parties · Total: ${fmtNum(tot)} votes`:`Preview: ${rows.length} partai · Total: ${tot.toLocaleString('id')} suara`;
  const hN=currentLang==='en'?'Name':'Nama',hV=currentLang==='en'?'Votes':'Suara';
  let h=`<thead><tr><th>#</th><th>${hN}</th><th>${hV}</th><th>%</th></tr></thead><tbody>`;
  rows.forEach((r,i)=>h+=`<tr><td>${i+1}</td><td>${r.name}</td><td>${fmtNum(r.votes)}</td><td>${fmtDec(((r.votes/tot)*100),2)}%</td></tr>`);
  document.getElementById('prevTbl').innerHTML=h+'</tbody>';
  document.getElementById('csvPreview').classList.remove('hidden');document.getElementById('dropText').textContent=fname;
}
function showCsvAlert(msg,type){const el=document.getElementById('csvAlert');el.className=`alert alert-${type==='err'?'err':'ok'}`;el.textContent=msg;el.classList.remove('hidden');}
function applyCSV(){
  if(!csvParsed.length)return;
  pdata=csvParsed.map(r=>({id:uid(),name:r.name,votes:r.votes,pass:true}));render();
  presetActive=false;loadedDapil=null;renderPresetNote();
  document.getElementById('csvPreview').classList.add('hidden');document.getElementById('csvAlert').classList.add('hidden');
  document.getElementById('dropText').textContent=STRINGS[currentLang].csv_drop;document.getElementById('csvFile').value='';
}
function cancelCSV(){
  csvParsed=[];document.getElementById('csvPreview').classList.add('hidden');document.getElementById('csvAlert').classList.add('hidden');
  document.getElementById('dropText').textContent=STRINGS[currentLang].csv_drop;document.getElementById('csvFile').value='';
}
function downloadTemplate(){
  const csv=currentLang==='en'?'name,votes\nParty A,1000000\nParty B,800000\nParty C,600000\nParty D,400000\n':'nama,suara\nPartai A,1000000\nPartai B,800000\nPartai C,600000\nPartai D,400000\n';
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'template_pemilu.csv');
}
function addParty(name,votes){pdata.push({id:uid(),name:name||'',votes:Number(votes)||0,pass:true});render();}
function delParty(id){pdata=pdata.filter(p=>p.id!==id);render();}
function render(){
  const el=document.getElementById('plist');el.innerHTML='';const s=STRINGS[currentLang];
  const showPass=lembaga==='manual';
  if(pdata.length)el.appendChild(headRow(showPass?[['fn',s.lbl_party],['fv',s.lbl_votes],['fp',s.lbl_pass]]:[['fn',s.lbl_party],['fv',s.lbl_votes]]));
  pdata.forEach((p,i)=>{
    const d=document.createElement('div');d.className='prow';
    const dot=document.createElement('div');dot.className='dot';dot.style.background=COLORS[i%COLORS.length];
    const nw=document.createElement('div');nw.className='fn';
    const ni=document.createElement('input');ni.type='text';ni.className='inp-name';ni.value=p.name;ni.placeholder=(currentLang==='en'?'Party ':'Partai ')+(i+1);
    ni.setAttribute('aria-label',s.lbl_party);ni.addEventListener('input',()=>{pdata[i].name=ni.value;});nw.append(ni);
    const vw=document.createElement('div');vw.className='fv';
    const vi=numInput(p.votes,v=>{pdata[i].votes=v;},'inp-votes');vi.setAttribute('aria-label',s.lbl_votes);vw.append(vi);
    d.append(dot,nw,vw);
    if(showPass){const pw=document.createElement('div');pw.className='fp';const cb=document.createElement('input');cb.type='checkbox';cb.checked=p.pass!==false;cb.setAttribute('aria-label',s.lbl_pass+' '+(p.name||''));cb.addEventListener('change',()=>{pdata[i].pass=cb.checked;});pw.append(cb);d.append(pw);}
    d.append(delButton(()=>delParty(p.id)));el.appendChild(d);
  });
}

/* ===== v1.2 helpers ===== */
const ICON_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function T(k,vars){let s=(STRINGS[currentLang]&&STRINGS[currentLang][k])||k;if(vars)Object.keys(vars).forEach(v=>{s=s.split('{'+v+'}').join(vars[v]);});return s;}
let toastTimer=null;
function notify(msg,type){
  const el=document.getElementById('toast');if(!el)return;
  el.textContent=msg;el.className='show'+(type==='ok'?'':' err');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.className='';},3800);
}
function fmtNum(n){return Number(n||0).toLocaleString(currentLang==='en'?'en-US':'id-ID');}
function fmtDec(n,d){return Number(n||0).toLocaleString(currentLang==='en'?'en-US':'id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});}
function parseNum(str){const d=String(str||'').replace(/[^\d]/g,'');return d?parseInt(d,10):0;}
/* kolom angka dengan pemisah ribuan: tampil terformat, mentah saat diketik */
function numInput(value,onChange,cls){
  const el=document.createElement('input');el.type='text';el.inputMode='numeric';el.autocomplete='off';
  if(cls)el.className=cls;el.value=fmtNum(value);
  el.addEventListener('focus',()=>{el.value=parseNum(el.value)||'';});
  el.addEventListener('input',()=>{const v=parseNum(el.value);onChange(v);});
  el.addEventListener('blur',()=>{el.value=fmtNum(parseNum(el.value));});
  return el;
}
function delButton(onClick){const b=document.createElement('button');b.type='button';b.className='del-btn';b.title=currentLang==='en'?'Remove':'Hapus';b.setAttribute('aria-label',b.title);b.innerHTML=ICON_X;b.addEventListener('click',onClick);return b;}
function headRow(cols){
  const h=document.createElement('div');h.className='plist-head';
  h.innerHTML=cols.map(c=>`<span class="${c[0]}">${c[1]}</span>`).join('')+'<span class="fx"></span>';return h;
}
function validateNames(list){
  const seen={};
  for(const p of list){const n=(p.name||'').trim();if(!n){notify(T('err_name_empty'));return false;}const k=n.toLowerCase();if(seen[k]){notify(T('err_name_dup',{n}));return false;}seen[k]=1;}
  return true;
}
/* deteksi nilai seri pada kursi terakhir (pemenang kursi terakhir vs penantang terdekat) */
function divisorNext(r,name,d1,kind){const k=r[name];return kind==='dh'?k+1:(k===0?d1:2*k+1);}
function findTieDivisor(pts,seats,res,d1,kind){
  if(!pts.length||seats<1)return null;
  let lastQ=Infinity,lastP=null,bestQ=-Infinity,bestP=null;
  pts.forEach(p=>{
    const k=res[p.name]||0;
    if(k>0){const prevDiv=kind==='dh'?k:(k===1?d1:2*(k-1)+1);const q=qv(p.votes/prevDiv);if(q<lastQ){lastQ=q;lastP=p.name;}}
    const nq=qv(p.votes/divisorNext(res,p.name,d1,kind));if(nq>bestQ){bestQ=nq;bestP=p.name;}
  });
  if(lastP&&bestP&&lastP!==bestP&&Math.abs(lastQ-bestQ)<1e-9)return[lastP,bestP];
  return null;
}
function findTieQuota(pts,seats,kind){
  const tot=pts.reduce((a,p)=>a+p.votes,0);if(!tot)return null;
  const q=kind==='hare'?tot/seats:Math.floor(tot/(seats+1))+1;
  let used=0;const rem=pts.map(p=>{const f=Math.floor(p.votes/q);used+=f;return{n:p.name,r:kind==='hare'?p.votes/q-f:p.votes-f*q};});
  const left=seats-used;if(left<=0||left>=rem.length)return null;
  rem.sort((a,b)=>b.r-a.r);
  if(Math.abs(rem[left-1].r-rem[left].r)<1e-9)return[rem[left-1].n,rem[left].n];
  return null;
}

/* ===== v1.4: pembulatan hasil bagi (PKPU 6/2024 Pasal 13 ayat 2) ===== */
let roundMode='none';
function qv(x){
  if(roundMode==='round')return Math.round(x*100+1e-9)/100;
  if(roundMode==='trunc')return Math.floor(x*100+1e-7)/100;
  return x;
}
/* Satu Dapil dan Multi-Dapil punya pilihan pembulatan masing-masing */
let roundSingle='none',roundMulti='none';
function setRound(v,which){
  v=['none','round','trunc'].includes(v)?v:'none';
  if(which==='multi'){roundMulti=v;if(typeof lastMdCalc!=='undefined'&&lastMdCalc&&!document.getElementById('mdResCard').classList.contains('hidden'))calculateMultiDapil();}
  else{roundSingle=v;if(lastResults&&!document.getElementById('resCard').classList.contains('hidden'))calculate(true);}
}
function roundLabel(){return T(roundMode==='round'?'round_round':roundMode==='trunc'?'round_trunc':'round_none');}

/* ===== v1.4: mode lembaga ===== */
/* free: ambang dihitung dari suara di data ini; dpr: kelolosan ambang nasional dicentang per partai;
   dprdprov/dprdkab: semua partai ikut (UU 7/2017 Pasal 414 ayat 2) */
function isOut(p,tot,thresh){
  if(lembaga==='manual')return p.pass===false;
  if(lembaga==='none')return false;
  return tot>0&&(p.votes/tot)*100<thresh;
}
function setLembaga(v,keep){
  v=({free:'table',dpr:'manual',dprd:'none',dprdprov:'none',dprdkab:'none'})[v]||v;
  lembaga=['table','manual','none'].includes(v)?v:'table';
  const sel=document.getElementById('lembagaSel');if(sel)sel.value=lembaga;
  document.getElementById('threshWrap').classList.toggle('hidden',lembaga!=='table');
  renderPresetNote();renderLembagaNote();render();
  if(lastResults&&!document.getElementById('resCard').classList.contains('hidden'))calculate(true);
}
function renderLembagaNote(){const el=document.getElementById('lembagaNote');if(el)el.innerHTML=T('lembaga_note_'+lembaga);}
function lembagaLabel(){return T('lembaga_'+lembaga);}
function nationalEligible2024(){
  const tot={};let all=0;
  MD_DPR2024.forEach(r=>r.slice(2).forEach((v,i)=>{const p=MD_DPR2024_PARTIES[i];tot[p]=(tot[p]||0)+v;all+=v;}));
  return new Set(MD_DPR2024_PARTIES.filter(p=>tot[p]/all*100>=4));
}
function populateDapilSel(){
  const sel=document.getElementById('dapilSel');if(!sel||typeof MD_DPR2024==='undefined')return;
  const keep=sel.value;
  sel.innerHTML=`<option value="">${T('dapil_load_ph')}</option>`+MD_DPR2024.map((r,i)=>`<option value="${i}">${r[0]} (${r[1]} ${currentLang==='en'?'seats':'kursi'})</option>`).join('');
  sel.value=keep;
}
function loadDapil(i){
  const r=MD_DPR2024[i];if(!r)return;const el=nationalEligible2024();
  pdata=MD_DPR2024_PARTIES.map((p,j)=>({id:uid(),name:p,votes:r[j+2],pass:el.has(p)}));
  document.getElementById('nSeats').value=r[1];
  loadedDapil=i;presetActive=false;
  document.getElementById('resCard').classList.add('hidden');lastResults=null;
  renderPresetNote();
}
function officialDapilText(i){
  const o=MD_DPR2024_RESMI[i];const ps=MD_DPR2024_PARTIES.slice(0,8);
  return ps.map((p,j)=>o[j]?`${p} ${o[j]}`:'').filter(Boolean).join(', ');
}

function loadDPR(){
  const totN=DPR2024.reduce((a,r)=>a+r[1],0);
  pdata=DPR2024.map(([n,v])=>({id:uid(),name:n,votes:v,pass:v/totN*100>=4}));
  render();document.getElementById('nSeats').value=580;document.getElementById('thresh').value=4;
  document.getElementById('resCard').classList.add('hidden');lastResults=null;
  presetActive=true;loadedDapil=null;renderPresetNote();
}
function renderPresetNote(){
  const el=document.getElementById('presetNote');if(!el)return;
  let h='';
  if(loadedDapil!==null){h=T('dapil_note',{d:MD_DPR2024[loadedDapil][0],k:MD_DPR2024[loadedDapil][1],o:officialDapilText(loadedDapil)});if(lembaga!=='manual')h+=' '+T('dapil_sim_note',{r:lembagaLabel()})+` <button class="btn bg" style="font-size:0.74rem;padding:4px 10px;margin-left:4px" onclick="setLembaga('manual')">${T('dapil_apply_rule')}</button>`;}
  else if(presetActive)h=T('preset_note');
  el.innerHTML=h;el.classList.toggle('hidden',!h);
  const sel=document.getElementById('dapilSel');if(sel&&loadedDapil===null)sel.value='';
}
function loadBlank(){
  pdata=[];const label=currentLang==='en'?'Party ':'Partai ';
  for(let i=1;i<=4;i++)pdata.push({id:uid(),name:label+i,votes:0});
  render();document.getElementById('nSeats').value=10;document.getElementById('thresh').value=4;
  document.getElementById('resCard').classList.add('hidden');lastResults=null;
  presetActive=false;loadedDapil=null;renderPresetNote();
}

