/* Kalkulator Satu Dapil: perhitungan, tabel hasil, jejak hitung, kursi kritis, dan ekspor. */
function renderTrace(){
  const el=document.getElementById('traceDiv');const s=STRINGS[currentLang];const en=currentLang==='en';
  if(!lastResults){el.innerHTML=`<div class="ibox">${s.trace_no_result}</div>`;return;}
  const seats=parseInt(document.getElementById('nSeats').value)||0;
  const thresh=parseFloat(document.getElementById('thresh').value)||0;
  const tot=pdata.reduce((a,p)=>a+p.votes,0);
  const elig=pdata.filter(p=>!isOut(p,tot,thresh)).map(p=>({name:p.name,votes:p.votes}));
  const MNAMES=getMNames();const MAX=30;
  const methodBtns=MNAMES.map((m,i)=>`<button class="btn ${i===traceMethodIndex?'bp':'bx'}" style="font-size:0.74rem;padding:5px 11px" onclick="traceMethodIndex=${i};renderTrace()">${m}</button>`).join('');
  let tableHTML='',traceInfo='';
  if(traceMethodIndex<=2){
    let rows;
    if(traceMethodIndex===0)rows=buildDivisorTrace(elig.map(p=>({...p})),seats,1);
    else if(traceMethodIndex===1)rows=buildDivisorTrace(elig.map(p=>({...p})),seats,1.4);
    else rows=buildDHondtTrace(elig.map(p=>({...p})),seats);
    const display=rows.slice(0,MAX);
    traceInfo=`<div style="font-size:0.75rem;color:#64748b;margin-bottom:9px">${s.trace_showing} <strong>${display.length}</strong> ${s.trace_of} <strong>${rows.length}</strong> ${s.trace_rows}</div>`;
    const cols=[s.th_seat_no,s.th_party,s.th_votes,s.th_prev,s.th_divisor,s.th_quotient];
    tableHTML=`<div class="ow"><table class="trace-tbl"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${display.map(r=>`<tr><td>${r.seat}</td><td class="tl">${r.party}</td><td style="text-align:right">${fmtNum(r.votes)}</td><td>${r.prev}</td><td>${fmtDec(Number.isInteger(r.divisor)?r.divisor:r.divisor,1)}</td><td class="trace-q">${r.quotient.toLocaleString(currentLang==='en'?'en-US':'id-ID',{maximumFractionDigits:2})}</td></tr>`).join('')}</tbody></table></div>`;
    lastTraceData={method:MNAMES[traceMethodIndex],cols,rows:rows.map(r=>[r.seat,r.party,r.votes,r.prev,Number.isInteger(r.divisor)?r.divisor:r.divisor.toFixed(1),r.quotient.toFixed(4)])};
    traceInfo=critDivisorHTML(elig,seats,traceMethodIndex)+traceInfo;
  } else {
    const{quota,rows}=traceMethodIndex===3?buildHareTrace(elig.map(p=>({...p})),seats):buildDroopTrace(elig.map(p=>({...p})),seats);
    const display=rows.slice(0,MAX);
    traceInfo=`<div style="font-size:0.75rem;color:#64748b;margin-bottom:9px">${s.trace_showing} <strong>${display.length}</strong> ${s.trace_of} <strong>${rows.length}</strong> ${s.trace_rows} &nbsp;·&nbsp; <strong>${en?'Quota':'Kuota'}:</strong> ${quota.toLocaleString(currentLang==='en'?'en-US':'id-ID',{maximumFractionDigits:4})}</div>`;
    const cols=[s.th_party,s.th_votes,s.th_quota,s.th_initial,s.th_remainder,s.th_additional,s.th_total_seats];
    tableHTML=`<div class="ow"><table class="trace-tbl"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${display.map(r=>`<tr><td class="tl">${r.party}</td><td style="text-align:right">${fmtNum(r.votes)}</td><td style="text-align:right">${quota.toLocaleString(currentLang==='en'?'en-US':'id-ID',{maximumFractionDigits:4})}</td><td>${r.initial}</td><td style="text-align:right">${fmtNum(traceMethodIndex===3?r.remainder.toFixed(6):r.remainder)}</td><td class="${r.additional>0?'trace-add':''}">${r.additional}</td><td class="trace-q">${r.total}</td></tr>`).join('')}</tbody></table></div>`;
    lastTraceData={method:MNAMES[traceMethodIndex],cols,rows:rows.map(r=>[r.party,r.votes,quota.toFixed(4),r.initial,traceMethodIndex===3?r.remainder.toFixed(6):r.remainder,r.additional,r.total])};
    traceInfo=critQuotaHTML(rows,traceMethodIndex,quota)+traceInfo;
  }
  el.innerHTML=`<div style="margin-bottom:14px"><div style="font-size:0.72rem;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">${s.trace_method_label}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${methodBtns}</div></div><div class="ibox" style="margin-bottom:11px"><strong>${MNAMES[traceMethodIndex]}</strong><br><span style="font-size:0.77rem;color:#475569">${s.trace_note}</span></div>${traceInfo}${tableHTML}<div class="mnote" style="margin-top:11px">${s.trace_tie}</div><div style="margin-top:11px"><button class="btn bg" onclick="downloadFullTrace()" style="font-size:0.78rem">${s.trace_dl}</button></div>`;
}
function fmtQ(x){return roundMode==='none'?fmtDec(x,4):fmtDec(x,2);}
function critDivisorHTML(elig,seats,mi){
  const L=mdLastSeat(elig,seats,mi);if(!L)return'';
  let h=T('crit_last',{n:L.last.seat,p:L.last.party,q:fmtQ(L.last.quotient),d:fmtDiv(L.last.divisor)});
  if(L.ch){
    h+=' '+T('crit_ch',{p:L.ch.party,q:fmtQ(L.ch.quotient),d:fmtDiv(L.ch.divisor)});
    h+=L.gap<=1e-9?' '+T('crit_tie'):' '+T('crit_extra',{p:L.ch.party,x:fmtNum(L.extra)});
  }
  return `<div class="crit-box">${h}</div>`;
}
function critQuotaHTML(rows,mi,quota){
  const sorted=[...rows].sort((a,b)=>b.remainder-a.remainder);
  const got=sorted.filter(r=>r.additional>0);const lastGot=got[got.length-1];const next=sorted.find(r=>r.additional===0);
  if(!lastGot||!next)return'';
  const f=v=>mi===3?`${fmtDec(v,4)} ${T('crit_quota_unit',{n:fmtNum(Math.round(v*quota))})}`:`${fmtNum(v)} ${T('sum_votes_word')}`;
  let h=T('crit_quota',{p:lastGot.party,r:f(lastGot.remainder),c:next.party,s:f(next.remainder)});
  if(Math.abs(lastGot.remainder-next.remainder)<1e-9)h+=' '+T('crit_tie');
  return `<div class="crit-box">${h}</div>`;
}
function downloadFullTrace(){
  if(!lastTraceData)return;
  const rows=[lastTraceData.cols,...lastTraceData.rows];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),`trace_${lastTraceData.method.replace(/[^a-zA-Z0-9]/g,'_')}.csv`);
}

function calculate(silent){
  const seats=parseInt(document.getElementById('nSeats').value)||0;
  const thresh=parseFloat(document.getElementById('thresh').value)||0;
  const en=currentLang==='en';
  if(seats<1){notify(T('err_seats'));return;}
  if(pdata.length<2){notify(T('err_min2'));return;}
  if(!validateNames(pdata))return;
  const tot=pdata.reduce((a,p)=>a+p.votes,0);
  if(tot<=0){notify(T('err_zero'));return;}
  const elig=pdata.filter(p=>!isOut(p,tot,thresh)).map(p=>({name:p.name,votes:p.votes}));
  if(elig.length===0){notify(T('err_noelig'));return;}
  const MNAMES=getMNames();
  const results=[sainteLague(elig.map(p=>({...p})),seats,1),sainteLague(elig.map(p=>({...p})),seats,1.4),dhondt(elig.map(p=>({...p})),seats),hare(elig.map(p=>({...p})),seats),droop(elig.map(p=>({...p})),seats)];
  lastResults=results;
  const s=STRINGS[currentLang];const tbl=document.getElementById('rtbl');
  /* peringatan nilai seri pada kursi terakhir */
  var ties=[findTieDivisor(elig,seats,results[0],1,'sl'),findTieDivisor(elig,seats,results[1],1.4,'sl'),findTieDivisor(elig,seats,results[2],1,'dh'),findTieQuota(elig,seats,'hare'),findTieQuota(elig,seats,'droop')];
  lastCalcCtx={seats,thresh,tot,elig,ties};
  document.getElementById('printMeta').innerHTML=printMetaHTML();
  document.getElementById('resWarn').innerHTML=ties.map((tp,i)=>tp?`<div class="warn-box">${T('tie_warn',{m:MNAMES[i],a:tp[0],b:tp[1]})}</div>`:'').join('');
  let h=`<thead><tr><th>${s.lbl_party}</th><th>${s.lbl_votes}</th><th>%</th>`;
  MNAMES.forEach(m=>h+=`<th>${m}</th>`);h+=`</tr></thead><tbody>`;
  let anyDiff=false;
  pdata.forEach((p,pi)=>{
    const pct=((p.votes/tot)*100).toFixed(2);const out=isOut(p,tot,thresh);
    h+=`<tr class="${out?'below':''}"><td><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${COLORS[pi%COLORS.length]};margin-right:7px;vertical-align:middle;${out?'opacity:.45':''}"></span>${p.name}${out?`<span class="bt-tag">${(lembaga==='manual'?s.bt_tag_dpr:s.bt_tag)}</span>`:''}</td>`;
    h+=`<td class="num">${fmtNum(p.votes)}</td><td class="num">${en?pct:pct.replace('.',',')}%</td>`;
    const base=out?0:(results[0][p.name]??0);
    results.forEach((r,ri)=>{
      const k=out?0:(r[p.name]??0);const d=k-base;let cls=k>0?'w':'';let extra='';
      if(ri>0&&d!==0){cls+=d>0?' d-up':' d-dn';extra=`<span class="dlt">${d>0?'+':''}${d}</span>`;anyDiff=true;}
      h+=`<td class="${cls}">${k}${extra}</td>`;
    });
    h+=`</tr>`;
  });
  h+=`<tr style="background:#1e3a8a;font-weight:700"><td colspan="3" style="color:#fff">${s.lbl_total}</td>`;
  results.forEach(r=>h+=`<td style="color:#fff">${Object.values(r).reduce((a,b)=>a+b,0)}</td>`);h+=`</tr></tbody>`;
  tbl.innerHTML=h;
  const hasBelow=pdata.some(p=>isOut(p,tot,thresh));
  document.getElementById('resLegend').innerHTML=`<span>${s.lg_seat}</span>`+(anyDiff?`<span><i class="lg-sw" style="background:#ecfdf5;border:1px solid #a7f3d0"></i>${s.lg_up}</span><span><i class="lg-sw" style="background:#fef2f2;border:1px solid #fecaca"></i>${s.lg_dn}</span>`:'')+(hasBelow?`<span><span class="bt-tag" style="margin-left:0">${(lembaga==='manual'?s.bt_tag_dpr:s.bt_tag)}</span>${(lembaga==='manual'?s.lg_bt_dpr:s.lg_bt)}</span>`:'');
  if(chartInst){chartInst.destroy();chartInst=null;}
  const ctx=document.getElementById('myChart').getContext('2d');
  lastCalcCtx={seats,thresh,tot,elig,ties};
  renderSingleNarr();
  renderSingleCharts();
  if(typeof Chart!=='undefined')chartInst=new Chart(ctx,{type:'bar',data:{labels:elig.map(p=>p.name),datasets:MNAMES.map((m,mi)=>({label:m,data:elig.map(p=>results[mi][p.name]||0),backgroundColor:METHOD_COLORS[mi],borderRadius:4,maxBarThickness:28}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#334155',boxWidth:12,boxHeight:12,font:{size:11,family:'Open Sans'}}}},scales:{x:{ticks:{color:'#475569'},grid:{display:false}},y:{ticks:{color:'#64748b'},grid:{color:'#f1f5f9'},beginAtZero:true}}}});
  const di=en?['Odd divisors. Most proportional.','First divisor 1.4. Slightly favours larger parties.',"Integer divisors. Most widely used.",'Quota = Total ÷ Seats.','Quota = ⌊Total÷(Seats+1)⌋+1.']:['Pembagi ganjil. Paling proporsional.','Pembagi pertama 1,4. Sedikit pro-besar.',"Pembagi bulat. Paling banyak dipakai.",'Kuota = Total ÷ Kursi.','Kuota = ⌊Total÷(Kursi+1)⌋+1.'];
  let dd='';results.forEach((r,i)=>{dd+=`<div class="ibox"><strong>${MNAMES[i]}</strong> · ${Object.values(r).reduce((a,b)=>a+b,0)} ${en?'seats':'kursi'} &nbsp;<span style="font-size:0.74rem;color:#64748b">${di[i]}</span><div style="margin-top:7px">${elig.map(p=>`<span class="badge">${p.name}: ${r[p.name]||0}</span>`).join('')}</div></div>`;});
  document.getElementById('detailDiv').innerHTML=dd;
  document.getElementById('resCard').classList.remove('hidden');
  if(silent){const tr=document.getElementById('t3');if(tr&&!tr.classList.contains('hidden'))renderTrace();return;}
  traceMethodIndex=0;switchTab(0);document.getElementById('resCard').scrollIntoView({behavior:'smooth'});
}
let lastCalcCtx=null;
function ctxLine(){
  const c=lastCalcCtx;const parts=[];
  parts.push(T('sum_dapil')+': '+(loadedDapil!==null?T('sum_data_dapil',{d:MD_DPR2024[loadedDapil][0]}):presetActive?T('sum_data_preset'):T('sum_data_user')));
  parts.push(T('cfg_lembaga')+': '+lembagaLabel());
  parts.push(T('cfg_seats')+': '+c.seats);
  if(lembaga==='table')parts.push(T('cfg_thresh')+': '+fmtDec(c.thresh,1)+'%');
  parts.push(T('cfg_round')+': '+roundLabel());
  return parts;
}
function printMetaHTML(){
  const d=new Date().toLocaleDateString(currentLang==='en'?'en-GB':'id-ID',{day:'numeric',month:'long',year:'numeric'});
  return `<div style="font-size:14pt;font-weight:700">${T('brand_name')}</div><div>${ctxLine().join(' · ')}</div><div>${T('sum_date')}: ${d} · https://proportional-seat-calculator.netlify.app/</div>`;
}
function copyText(txt,okKey){
  const done=()=>notify(T(okKey||'copied_ok'),'ok');
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(done,()=>{fallbackCopy(txt);done();});}
  else{fallbackCopy(txt);done();}
}
function summaryText(){
  const c=lastCalcCtx;const MN=getMNames();const r=lastResults[0];
  const L=[];L.push(T('sum_title'));L.push(...ctxLine());L.push('');
  L.push(T('sum_seats_sl'));
  c.elig.filter(p=>(r[p.name]||0)>0).sort((a,b)=>(r[b.name]||0)-(r[a.name]||0)||b.votes-a.votes).forEach(p=>L.push(`- ${p.name}: ${r[p.name]} ${T('sum_seat_word')} (${fmtNum(p.votes)} ${T('sum_votes_word')})`));
  const crit=mdLastSeat(c.elig,c.seats,0);
  if(crit){L.push('');L.push(T('sum_last',{p:crit.last.party,q:fmtQ(crit.last.quotient)}));
    if(crit.ch)L.push(crit.gap<=1e-9?T('sum_tie',{p:crit.ch.party}):T('sum_ch',{p:crit.ch.party,x:fmtNum(crit.extra)}));}
  const out=pdata.filter(p=>isOut(p,c.tot,c.thresh)).map(p=>p.name);
  if(out.length){L.push('');L.push(T('sum_out')+': '+out.join(', '));}
  const others=[1,2,3,4].map(i=>`${MN[i]}: `+c.elig.filter(p=>(lastResults[i][p.name]||0)>0).map(p=>`${p.name} ${lastResults[i][p.name]}`).join(', '));
  L.push('');L.push(T('sum_other'));others.forEach(o=>L.push('- '+o));
  if(c.ties.some(Boolean)){L.push('');L.push(T('sum_tie_note'));}
  if(loadedDapil!==null){L.push('');if(lembaga==='manual')L.push(T('sum_official')+': '+officialDapilText(loadedDapil));else L.push(T('sum_sim_rule'));L.push(T('sum_source_dapil'));}
  else if(presetActive){L.push('');L.push(T('sum_source_preset'));}
  L.push('');L.push(T('sum_footer'));
  return L.join('\n');
}
function copySummary(){if(!lastResults||!lastCalcCtx){notify(T('err_calc_first'));return;}copyText(summaryText());}
function texEsc(s){return String(s).replace(/\\/g,'\\textbackslash{}').replace(/([&%$#_{}])/g,'\\$1').replace(/~/g,'\\textasciitilde{}').replace(/\^/g,'\\textasciicircum{}');}
function latexTable(){
  const c=lastCalcCtx;const MN=getMNames();const s=STRINGS[currentLang];
  const L=[];L.push('% '+T('brand_name')+' (https://doi.org/10.5281/zenodo.24105963)');L.push('% '+ctxLine().join('; '));
  L.push('\\begin{table}[ht]');L.push('\\centering');L.push('\\begin{tabular}{lrr'+'r'.repeat(MN.length)+'}');L.push('\\hline');
  L.push([s.lbl_party,s.lbl_votes,'\\%',...MN].map((x,i)=>i===2?x:texEsc(x)).join(' & ')+' \\\\');L.push('\\hline');
  pdata.forEach(p=>{const out=isOut(p,c.tot,c.thresh);L.push([texEsc(p.name)+(out?'$^{*}$':''),fmtNum(p.votes),fmtDec(p.votes/c.tot*100,2),...lastResults.map(r=>out?0:(r[p.name]||0))].join(' & ')+' \\\\');});
  L.push('\\hline');L.push([texEsc(s.lbl_total),'','',...lastResults.map(r=>Object.values(r).reduce((a,b)=>a+b,0))].join(' & ')+' \\\\');L.push('\\hline');
  L.push('\\end{tabular}');
  L.push('\\caption{'+texEsc(T('tex_caption'))+'}');
  if(pdata.some(p=>isOut(p,c.tot,c.thresh)))L.push('% $^{*}$ '+T('tex_star'));
  L.push('\\end{table}');
  return L.join('\n');
}
function copyLatex(){if(!lastResults||!lastCalcCtx){notify(T('err_calc_first'));return;}copyText(latexTable());}
function printResult(){if(!lastResults){notify(T('err_calc_first'));return;}switchTab(0);document.getElementById('printMeta').innerHTML=printMetaHTML();setTimeout(()=>window.print(),100);}
function downloadCSV(){
  if(!lastResults){notify(currentLang==='en'?'Please calculate first!':'Hitung dulu!');return;}
  const tot=pdata.reduce((a,p)=>a+p.votes,0);const thresh=parseFloat(document.getElementById('thresh').value)||0;
  const MNAMES=getMNames();const s=STRINGS[currentLang];
  const rows=[[s.lbl_party,s.lbl_votes,'%',s.lbl_eligible,...MNAMES]];
  pdata.forEach(p=>{const out=isOut(p,tot,thresh);rows.push([p.name,p.votes,((p.votes/tot)*100).toFixed(2),currentLang==='en'?(out?'No':'Yes'):(out?'Tidak':'Ya'),...lastResults.map(r=>out?0:(r[p.name]??0))]);});
  rows.push([s.lbl_total,'','','',...lastResults.map(r=>Object.values(r).reduce((a,b)=>a+b,0))]);
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  triggerDownload(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'hasil_pemilu.csv');
}
