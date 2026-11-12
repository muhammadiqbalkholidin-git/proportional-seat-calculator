/* Grafik dan paragraf ringkasan hasil untuk Satu Dapil dan Multi-Dapil. */
/* ===== v1.4: grafik tambahan dan ringkasan hasil ===== */
const CH={};
let narrMethod=0,chartMethod=0,mdNatMethod=0;
function mkChart(id,cfg){
  if(CH[id]){CH[id].destroy();delete CH[id];}
  const c=document.getElementById(id);if(!c||typeof Chart==='undefined')return null;
  CH[id]=new Chart(c.getContext('2d'),cfg);return CH[id];
}
function downloadCanvas(id,file){
  const canvas=document.getElementById(id);if(!canvas||!CH[id]){notify(T('err_calc_first'));return;}
  const tmp=document.createElement('canvas');tmp.width=canvas.width;tmp.height=canvas.height;
  const c2=tmp.getContext('2d');c2.fillStyle='#ffffff';c2.fillRect(0,0,tmp.width,tmp.height);c2.drawImage(canvas,0,0);
  tmp.toBlob(b=>triggerDownload(b,file),'image/png');
}
function downloadSVG(boxId,file){
  const box=document.getElementById(boxId);const svg=box&&box.querySelector('svg');if(!svg){notify(T('err_calc_first'));return;}
  const vb=svg.viewBox.baseVal;const sc=3;const w=vb.width*sc;
  const lg=[...box.querySelectorAll('.hemi-lg span')].map(s=>({c:s.querySelector('i').style.background,t:s.textContent.trim()}));
  const rows=Math.ceil(lg.length/3);const h=vb.height*sc+rows*22*sc/1.5+20;
  const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(img,0,0,w,vb.height*sc);
    g.font=`${13*sc/1.5}px Open Sans, sans-serif`;g.textBaseline='middle';
    lg.forEach((it,i)=>{const col=i%3,row=Math.floor(i/3);const x=20+col*(w-40)/3,y=vb.height*sc+10+row*22*sc/1.5+11*sc/1.5;g.fillStyle=it.c;g.beginPath();g.arc(x+6,y,6,0,7);g.fill();g.fillStyle='#334155';g.fillText(it.t,x+18,y);});
    c.toBlob(b=>triggerDownload(b,file),'image/png');};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
}
function joinList(a){
  const and=T('narr_and');
  if(a.length<=1)return a.join('');if(a.length===2)return a[0]+' '+and+' '+a[1];
  return a.slice(0,-1).join(', ')+', '+and+' '+a[a.length-1];
}
function narrBox(html){return `<div class="interp-box narr"><div class="narr-t">${T('res_narr_title')}</div>${html}</div>`;}
function methodButtons(cur,fn){return getMNames().map((m,i)=>`<button class="btn ${i===cur?'bp':'bx'}" onclick="${fn}(${i})">${m}</button>`).join('');}
function partyColor(name,list){const i=list.findIndex(x=>(x.name||x)===name);return COLORS[(i<0?0:i)%COLORS.length];}

/* Hasil bagi metode divisor yang diurutkan, dipakai grafik Persaingan Kursi (mi: 0 SL, 1 SL Modifikasi, 2 D'Hondt) */
function raceData(pts,seats,mi){
  mi=mi||0;const items=[];
  const dv=k=>mi===2?k+1:(k===0&&mi===1?1.4:2*k+1);
  pts.forEach((p,pi)=>{for(let k=0;k<seats;k++){const div=dv(k);items.push({party:p.name,pi,div,q:qv(p.votes/div)});}});
  items.sort((a,b)=>b.q-a.q||a.pi-b.pi||a.div-b.div);
  items.forEach((it,i)=>{it.rank=i+1;it.won=i<seats;});
  return items;
}
/* Sisa suara metode kuota yang diurutkan (mi: 3 Hare, 4 Droop) */
function quotaRaceData(pts,seats,mi){
  const{quota,rows}=mi===3?buildHareTrace(pts.map(p=>({...p})),seats):buildDroopTrace(pts.map(p=>({...p})),seats);
  const items=rows.map(r=>({party:r.party,rem:mi===3?r.remainder*quota:r.remainder,won:r.additional>0,initial:r.initial}));
  items.sort((a,b)=>b.rem-a.rem);
  return{quota,items,cut:items.filter(x=>x.won).length};
}
function voteSeatRows(parties,seatMap,totVotes,totSeats){
  return parties.map(p=>({name:p.name,vp:totVotes>0?p.votes/totVotes*100:0,sp:totSeats>0?(seatMap[p.name]||0)/totSeats*100:0}));
}
/* Posisi titik diagram kursi setengah lingkaran */
function hemicycleLayout(n){
  if(n<=0)return{pos:[],rows:0};
  const rows=Math.max(1,Math.ceil(Math.sqrt(n/2.2)));
  const radii=[];for(let i=0;i<rows;i++)radii.push(rows===1?1:0.45+0.55*i/(rows-1));
  const sum=radii.reduce((a,b)=>a+b,0);
  let per=radii.map(r=>Math.max(1,Math.floor(n*r/sum)));
  let left=n-per.reduce((a,b)=>a+b,0);
  for(let i=rows-1;left>0;i=(i-1+rows)%rows){per[i]++;left--;}
  while(left<0){for(let i=0;i<rows&&left<0;i++)if(per[i]>1){per[i]--;left++;}}
  const pos=[];
  radii.forEach((r,i)=>{const m=per[i];for(let j=0;j<m;j++){const a=m===1?Math.PI/2:Math.PI*(1-j/(m-1));pos.push({x:r*Math.cos(a),y:r*Math.sin(a),a});}});
  pos.sort((p,q)=>q.a-p.a||Math.hypot(p.x,p.y)-Math.hypot(q.x,q.y));
  return{pos,rows};
}
function hemicycleSVG(parts){
  const list=parts.filter(p=>p.seats>0);const n=list.reduce((a,p)=>a+p.seats,0);
  if(!n)return'';
  const{pos,rows}=hemicycleLayout(n);
  const W=500,H=270,cx=250,cy=255,R=235;
  const dot=Math.max(2,Math.min(16,(R*0.55/rows)*0.42,R*Math.PI/(pos.filter(p=>Math.abs(Math.hypot(p.x,p.y)-1)<1e-9).length||1)*0.42));
  const cols=[];list.forEach(p=>{for(let i=0;i<p.seats;i++)cols.push(p.color);});
  const circles=pos.map((p,i)=>`<circle cx="${(cx+p.x*R).toFixed(1)}" cy="${(cy-p.y*R).toFixed(1)}" r="${dot.toFixed(1)}" fill="${cols[i]}"/>`).join('');
  const txt=`<text x="${cx}" y="${cy-8}" text-anchor="middle" font-family="Open Sans, sans-serif" font-size="30" font-weight="700" fill="#0f172a">${fmtNum(n)}</text><text x="${cx}" y="${cy+12}" text-anchor="middle" font-family="Open Sans, sans-serif" font-size="13" fill="#64748b">${T('cfg_seats').toLowerCase()}</text>`;
  const lg=list.map(p=>`<span><i style="background:${p.color}"></i>${p.name} ${p.seats}</span>`).join('');
  return `<svg class="hemi" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${T('ch_hemi_title')}">${circles}${txt}</svg><div class="hemi-lg">${lg}</div>`;
}
const cutLinePlugin={id:'cutLine',afterDraw(ch,args,o){
  if(!o||o.cut==null)return;const y=ch.scales.y;const a=ch.chartArea;
  if(o.cut<=0||o.cut>=ch.data.labels.length)return;
  const yy=(y.getPixelForValue(o.cut-1)+y.getPixelForValue(o.cut))/2;const g=ch.ctx;
  g.save();g.strokeStyle='#dc2626';g.setLineDash([6,4]);g.lineWidth=1.5;g.beginPath();g.moveTo(a.left,yy);g.lineTo(a.right,yy);g.stroke();
  g.setLineDash([]);g.fillStyle='#dc2626';g.font='600 11px Open Sans, sans-serif';g.textAlign='right';g.fillText(o.label,a.right-4,yy-4);g.restore();
}};
const pointLabelPlugin={id:'pointLabel',afterDatasetsDraw(ch){
  const ds=ch.data.datasets[0];if(!ds||!ds.labels)return;const meta=ch.getDatasetMeta(0);const g=ch.ctx;
  g.save();g.font='600 11px Open Sans, sans-serif';g.fillStyle='#334155';g.textBaseline='middle';
  meta.data.forEach((pt,i)=>{const r=ds.data[i];if(r.x<2&&r.y===0)return;g.fillText(ds.labels[i],pt.x+8,pt.y);});g.restore();
}};
function drawVoteSeat(id,rows){
  const mx=Math.max(5,...rows.map(r=>Math.max(r.vp,r.sp)))*1.1;const top=Math.ceil(mx/5)*5;
  return mkChart(id,{type:'scatter',data:{datasets:[
    {label:T('ch_vs_y'),data:rows.map(r=>({x:+r.vp.toFixed(2),y:+r.sp.toFixed(2)})),labels:rows.map(r=>r.name),pointBackgroundColor:rows.map((r,i)=>r.color||COLORS[i%COLORS.length]),pointRadius:6,pointHoverRadius:8},
    {type:'line',label:T('ch_vs_line'),data:[{x:0,y:0},{x:top,y:top}],borderColor:'#94a3b8',borderDash:[6,4],borderWidth:1.5,pointRadius:0,fill:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},
      tooltip:{filter:it=>it.datasetIndex===0,callbacks:{label:c=>`${c.dataset.labels[c.dataIndex]}: ${T('ch_vs_x').toLowerCase()} ${fmtDec(c.parsed.x,2)}%, ${T('ch_vs_y').toLowerCase()} ${fmtDec(c.parsed.y,2)}%`}}},
      scales:{x:{min:0,max:top,title:{display:true,text:T('ch_vs_x')+' (%)',color:'#64748b'},ticks:{color:'#64748b'},grid:{color:'#f1f5f9'}},y:{min:0,max:top,title:{display:true,text:T('ch_vs_y')+' (%)',color:'#64748b'},ticks:{color:'#64748b'},grid:{color:'#f1f5f9'}}}},
    plugins:[pointLabelPlugin]});
}

/* ---------- Satu Dapil ---------- */
function setNarrMethod(i){narrMethod=i;renderSingleNarr();}
function setChartMethod(i){chartMethod=i;renderSingleCharts();}
function renderSingleNarr(){
  const el=document.getElementById('resNarr');if(!el||!lastResults)return;
  el.innerHTML=`<div class="mpick" style="margin-top:16px"><span>${T('narr_pick')}</span><div class="mpick-btns">${methodButtons(narrMethod,'setNarrMethod')}</div></div>`+narrBox(narrSingle(narrMethod));
}
function renderSingleCharts(){
  const c=lastCalcCtx;if(!c||!lastResults)return;
  const mi=chartMethod;const MN=getMNames();
  document.getElementById('chartMethodBtns').innerHTML=methodButtons(mi,'setChartMethod');
  const colorOf=name=>partyColor(name,pdata);
  if(mi<3){
    const items=raceData(c.elig,c.seats,mi);const n=c.seats;
    const from=n<=15?0:n-10,to=Math.min(items.length,n+5);const shown=items.slice(from,to);
    document.getElementById('raceTitle').textContent=T('ch_race_title_div',{m:MN[mi]});
    document.getElementById('raceNote').textContent=T('ch_race_note')+(from>0?' '+T('ch_race_partial',{a:from+1,b:n,c:to-n}):'');
    document.getElementById('raceWrap').style.height=Math.max(220,shown.length*24+70)+'px';
    mkChart('raceChart',{type:'bar',data:{labels:shown.map(it=>`${it.rank}. ${it.party} ÷${fmtDiv(it.div)}`),datasets:[{data:shown.map(it=>it.q),backgroundColor:shown.map(it=>colorOf(it.party)+(it.won?'':'55')),borderRadius:3,barThickness:16}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},cutLine:{cut:n-from,label:T('ch_race_cut')},tooltip:{callbacks:{label:x=>`${T('ch_race_axis')}: ${fmtQ(x.parsed.x)}`}}},
        scales:{x:{beginAtZero:true,title:{display:true,text:T('ch_race_axis'),color:'#64748b'},ticks:{color:'#64748b',callback:v=>fmtNum(v)},grid:{color:'#f1f5f9'}},y:{ticks:{color:'#334155',font:{size:11}},grid:{display:false}}}},
      plugins:[cutLinePlugin]});
  }else{
    const{items,cut}=quotaRaceData(c.elig,c.seats,mi);const shown=items.slice(0,Math.min(items.length,Math.max(cut+5,8)));
    document.getElementById('raceTitle').textContent=T('ch_race_title_quota',{m:MN[mi]});
    document.getElementById('raceNote').textContent=T('ch_race_note_quota');
    document.getElementById('raceWrap').style.height=Math.max(220,shown.length*24+70)+'px';
    mkChart('raceChart',{type:'bar',data:{labels:shown.map((it,i)=>`${i+1}. ${it.party}`),datasets:[{data:shown.map(it=>Math.round(it.rem)),backgroundColor:shown.map(it=>colorOf(it.party)+(it.won?'':'55')),borderRadius:3,barThickness:16}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},cutLine:{cut,label:T('ch_race_cut')},tooltip:{callbacks:{label:x=>`${T('ch_race_axis_quota')}: ${fmtNum(x.parsed.x)}`}}},
        scales:{x:{beginAtZero:true,title:{display:true,text:T('ch_race_axis_quota'),color:'#64748b'},ticks:{color:'#64748b',callback:v=>fmtNum(v)},grid:{color:'#f1f5f9'}},y:{ticks:{color:'#334155',font:{size:11}},grid:{display:false}}}},
      plugins:[cutLinePlugin]});
  }
  document.getElementById('hemiSingle').innerHTML=hemicycleSVG(pdata.map(p=>({name:p.name,seats:lastResults[mi][p.name]||0,color:colorOf(p.name)})));
  drawVoteSeat('vsChart',voteSeatRows(pdata,lastResults[mi],c.tot,c.seats).map(r=>({...r,color:colorOf(r.name)})));
}
function seatGroupsText(res,elig){
  const L=(a,b)=>currentLang==='en'?b:a;
  const g={};elig.forEach(p=>{const k=res[p.name]||0;if(k>0)(g[k]=g[k]||[]).push(p.name);});
  const ks=Object.keys(g).map(Number).sort((a,b)=>b-a);
  const parts=ks.map(k=>{const ps=g[k];const w=k+' '+L('kursi',k===1?'seat':'seats');
    return ps.length===1?`<strong>${ps[0]}</strong> ${L('memperoleh','won')} ${w}`:`${joinList(ps.map(x=>'<strong>'+x+'</strong>'))} ${L('masing-masing memperoleh','won')} ${w}${currentLang==='en'?' each':''}`;});
  if(parts.length<=1)return parts.join('');
  if(parts.length===2)return parts[0]+L(', sedangkan ',', while ')+parts[1];
  const ent=ks.map(k=>{const ps=g[k];return `${joinList(ps.map(x=>'<strong>'+x+'</strong>'))} (${k} ${L('kursi',k===1?'seat':'seats')}${ps.length>1?L(', masing-masing',' each'):''})`;});
  return L('kursi terbanyak diraih ','the most seats go to ')+ent[0]+L(', disusul ',', followed by ')+joinList(ent.slice(1));
}
function methodDiffText(results,elig,base){
  base=base||0;const L=(a,b)=>currentLang==='en'?b:a;const MN=getMNames();const en=currentLang==='en';
  const groups={};const same=[];
  for(let i=0;i<5;i++){if(i===base)continue;
    const up=[],dn=[];elig.forEach(p=>{const d=(results[i][p.name]||0)-(results[base][p.name]||0);if(d>0)up.push([p.name,d]);if(d<0)dn.push([p.name,-d]);});
    if(!up.length&&!dn.length){same.push(MN[i]);continue;}
    const key=JSON.stringify([up,dn]);(groups[key]=groups[key]||{up,dn,ms:[]}).ms.push(MN[i]);
  }
  const keys=Object.keys(groups);
  if(!keys.length)return L('Kelima metode menghasilkan pembagian kursi yang sama, sehingga pilihan metode tidak mengubah hasil di sini.','All five methods give the same allocation, so the choice of method makes no difference here.');
  const f=(arr,sg)=>joinList(arr.map(([n,d])=>en?`<strong>${n}</strong>${d>1?` (${sg}${d})`:''}`:(d>1?`${d} kursi <strong>${n}</strong>`:`<strong>${n}</strong>`)));
  const seg=keys.map(k=>{const g=groups[k];const pl=g.ms.length>1;
    if(en){const a=[];if(g.up.length)a.push(`more seats to ${f(g.up,'+')}`);if(g.dn.length)a.push(`fewer to ${f(g.dn,'−')}`);return `${joinList(g.ms)} give${pl?'':'s'} ${a.join(' and ')}`;}
    const a=[];if(g.up.length)a.push('menambah kursi '+f(g.up));if(g.dn.length)a.push('mengurangi kursi '+f(g.dn));return `${joinList(g.ms)} ${a.join(' dan ')}`;});
  let s=L(`Dibanding ${MN[base]}, `,`Compared with ${MN[base]}, `)+seg.join('; ');
  if(same.length)s+=L(', sedangkan ',', while ')+joinList(same)+L(' memberi hasil yang sama',same.length>1?' give the same result':' gives the same result');
  return s+'.';
}
function narrSingle(mi){
  mi=mi||0;const c=lastCalcCtx;if(!c||!lastResults)return'';
  const L=(a,b)=>currentLang==='en'?b:a;const S=[];const MN=getMNames();const res=lastResults[mi];
  const N=pdata.length,n=c.elig.length;
  if(loadedDapil!==null)S.push(L(`Perhitungan ini memakai suara sah Dapil <strong>${MD_DPR2024[loadedDapil][0]}</strong> pada Pemilu DPR RI 2024.`,`This calculation uses valid votes from the <strong>${MD_DPR2024[loadedDapil][0]}</strong> district in the 2024 DPR RI election.`));
  if(lembaga==='none')S.push(L(`Tanpa ambang batas, seluruh ${N} partai ikut pembagian ${fmtNum(c.seats)} kursi.`,`With no threshold, all ${N} parties take part in allocating ${fmtNum(c.seats)} seats.`));
  else if(lembaga==='manual')S.push(L(`Dengan kelolosan yang ditentukan per partai, ${n} dari ${N} partai ditandai lolos dan ikut pembagian ${fmtNum(c.seats)} kursi.`,`With eligibility set per party, ${n} of ${N} parties are marked as passing and take part in allocating ${fmtNum(c.seats)} seats.`));
  else S.push(L(`Dengan ambang batas ${fmtDec(c.thresh,1)}% dari total suara di tabel, ${n} dari ${N} partai ikut pembagian ${fmtNum(c.seats)} kursi.`,`With a threshold of ${fmtDec(c.thresh,1)}% of the votes in the table, ${n} of ${N} parties take part in allocating ${fmtNum(c.seats)} seats.`));
  S.push(L(`Menurut ${MN[mi]}, `,`Under ${MN[mi]}, `)+seatGroupsText(res,c.elig)+'.');
  const out=pdata.filter(p=>isOut(p,c.tot,c.thresh));
  if(out.length){const v=out.reduce((a,p)=>a+p.votes,0);S.push(L(`Suara ${out.length} partai yang tidak ikut pembagian kursi berjumlah ${fmtNum(v)}, atau ${fmtDec(v/c.tot*100,2)}% dari total suara, dan tidak terkonversi menjadi kursi.`,`The ${fmtNum(v)} votes of the ${out.length} parties outside seat allocation, ${fmtDec(v/c.tot*100,2)}% of the total, are not converted into seats.`));}
  if(mi<3){
    const cr=mdLastSeat(c.elig,c.seats,mi);
    if(cr&&cr.ch)S.push(cr.gap<=1e-9?L(`Kursi terakhir seri antara <strong>${cr.last.party}</strong> dan <strong>${cr.ch.party}</strong>, sehingga penyelesaiannya mengikuti PKPU 6/2024 Pasal 13 ayat 3.`,`The last seat is tied between <strong>${cr.last.party}</strong> and <strong>${cr.ch.party}</strong>, so it is resolved under KPU Regulation 6/2024 Article 13(3).`)
      :L(`Kursi terakhir jatuh ke <strong>${cr.last.party}</strong>, dan penantang terdekatnya, <strong>${cr.ch.party}</strong>, membutuhkan tambahan ${fmtNum(cr.extra)} suara untuk merebut kursi itu.`,`The last seat goes to <strong>${cr.last.party}</strong>, and its closest challenger, <strong>${cr.ch.party}</strong>, would need ${fmtNum(cr.extra)} more votes to take it.`));
  }else{
    const{items,cut}=quotaRaceData(c.elig,c.seats,mi);
    if(cut>0&&items[cut]){const a=items[cut-1],b=items[cut];
      S.push(Math.abs(a.rem-b.rem)<1e-9?L(`Kursi sisa terakhir seri antara <strong>${a.party}</strong> dan <strong>${b.party}</strong>.`,`The last remainder seat is tied between <strong>${a.party}</strong> and <strong>${b.party}</strong>.`)
        :L(`Sebanyak ${cut} kursi dibagikan lewat sisa suara terbesar. Kursi sisa terakhir jatuh ke <strong>${a.party}</strong> dengan sisa sekitar ${fmtNum(Math.round(a.rem))} suara, sedangkan sisa terbesar berikutnya milik <strong>${b.party}</strong> dengan sekitar ${fmtNum(Math.round(b.rem))} suara.`,`${cut} seat(s) are allocated by largest remainder. The last remainder seat goes to <strong>${a.party}</strong> with a remainder of about ${fmtNum(Math.round(a.rem))} votes, while the next largest remainder belongs to <strong>${b.party}</strong> with about ${fmtNum(Math.round(b.rem))} votes.`));}
    else if(cut===0)S.push(L('Semua kursi terbagi habis lewat kuota penuh, sehingga tidak ada kursi yang dibagikan lewat sisa suara.','All seats are filled by full quotas, so no seat is allocated by remainder.'));
  }
  S.push(methodDiffText(lastResults,c.elig,mi));
  if(loadedDapil!==null&&lembaga==='manual'){
    const o=MD_DPR2024_RESMI[loadedDapil];const diff=MD_DPR2024_PARTIES.filter((p,j)=>(res[p]||0)!==(j<8?o[j]:0));
    S.push(diff.length?L(`Hasil ${MN[mi]} ini berbeda dengan kursi resmi yang ditetapkan KPU untuk ${joinList(diff)}.`,`This ${MN[mi]} result differs from the official KPU seats for ${joinList(diff)}.`)
      :L(`Hasil ${MN[mi]} ini sama dengan kursi resmi yang ditetapkan dalam Keputusan KPU Nomor 1206 Tahun 2024.`,`This ${MN[mi]} result matches the official seats set in KPU Decree No. 1206 of 2024.`));
  }
  return S.join(' ');
}

/* ---------- Multi-Dapil ---------- */
function setMdNatMethod(i){mdNatMethod=i;renderMdNatExtra();}
function renderMdNatExtra(){
  const el=document.getElementById('mdNatExtra');if(!el||!lastMdCalc)return;
  const{allParties,natVotes,totalNatVotes,natSeats}=lastMdCalc;const mi=mdNatMethod;const seats=natSeats[MD_KEYS[mi]];
  const ts=Object.values(seats).reduce((a,b)=>a+b,0);
  el.innerHTML=`<div class="mpick" style="margin-top:16px"><span>${T('narr_pick')}</span><div class="mpick-btns">${methodButtons(mi,'setMdNatMethod')}</div></div>`+narrBox(narrMdNational(mi))+
    `<div class="ch-blk" style="margin-top:18px"><div class="ch-head"><h3>${T('ch_hemi_title')} (${getMNames()[mi]})</h3><button class="btn bg" onclick="downloadSVG('hemiMd','komposisi_kursi_nasional.png')">${T('ch_dl')}</button></div><div class="ch-note">${T('ch_hemi_note')}</div><div id="hemiMd"></div></div>`+
    `<div class="ch-blk"><div class="ch-head"><h3>${T('ch_vs_title')} (${getMNames()[mi]})</h3><button class="btn bg" onclick="downloadCanvas('mdVsChart','persentase_suara_kursi_nasional.png')">${T('ch_dl')}</button></div><div class="ch-note">${T('ch_vs_note')}</div><div style="position:relative;height:380px"><canvas id="mdVsChart"></canvas></div></div>`;
  document.getElementById('hemiMd').innerHTML=hemicycleSVG(allParties.map((p,i)=>({name:p,seats:seats[p]||0,color:COLORS[i%COLORS.length]})));
  drawVoteSeat('mdVsChart',voteSeatRows(allParties.map(p=>({name:p,votes:natVotes[p]})),seats,totalNatVotes,ts).map((r,i)=>({...r,color:COLORS[i%COLORS.length]})));
}
function narrMdNational(mi){
  mi=mi||0;const m=lastMdCalc;if(!m)return'';const L=(a,b)=>currentLang==='en'?b:a;const S=[];const MN=getMNames();
  const{allParties,natVotes,totalNatVotes,eligible,natSeats,thresh,districts,totalDistSeats}=m;
  S.push(L(`Dengan ambang batas nasional ${fmtDec(thresh,1)}%, ${eligible.size} dari ${allParties.length} partai lolos dan ikut pembagian ${fmtNum(totalDistSeats)} kursi di ${districts.length} dapil.`,`With a national threshold of ${fmtDec(thresh,1)}%, ${eligible.size} of ${allParties.length} parties pass and take part in allocating ${fmtNum(totalDistSeats)} seats across ${districts.length} districts.`));
  const fail=allParties.filter(p=>!eligible.has(p));
  if(fail.length){const v=fail.reduce((a,p)=>a+natVotes[p],0);S.push(L(`Suara ${fail.length} partai yang tidak lolos berjumlah ${fmtNum(v)}, atau ${fmtDec(v/totalNatVotes*100,2)}% dari suara sah nasional, dan tidak terkonversi menjadi kursi.`,`The ${fmtNum(v)} votes of the ${fail.length} parties that fail, ${fmtDec(v/totalNatVotes*100,2)}% of national valid votes, are not converted into seats.`));}
  const sl=natSeats[MD_KEYS[mi]];const tot=Object.values(sl).reduce((a,b)=>a+b,0);
  const rk=allParties.filter(p=>(sl[p]||0)>0).sort((a,b)=>sl[b]-sl[a]);
  if(rk.length){const p0=rk[0];
    let s=L(`Menurut ${MN[mi]}, kursi terbanyak diraih <strong>${p0}</strong> dengan ${sl[p0]} kursi, atau ${fmtDec(sl[p0]/tot*100,2)}% kursi dari ${fmtDec(natVotes[p0]/totalNatVotes*100,2)}% suara`,`Under ${MN[mi]}, <strong>${p0}</strong> wins the most seats with ${sl[p0]}, or ${fmtDec(sl[p0]/tot*100,2)}% of seats from ${fmtDec(natVotes[p0]/totalNatVotes*100,2)}% of votes`);
    const nx=rk.slice(1,3).map(p=>`<strong>${p}</strong> (${sl[p]} ${L('kursi','seats')})`);
    if(nx.length)s+=L(', disusul ',', followed by ')+joinList(nx);S.push(s+'.');}
  const rows=allParties.map(p=>({name:p,votes:natVotes[p],gap:(sl[p]||0)/tot*100-natVotes[p]/totalNatVotes*100}));
  const el=rows.filter(r=>eligible.has(r.name));
  if(el.length>1){const pos=[...el].sort((a,b)=>b.gap-a.gap)[0],neg=[...el].sort((a,b)=>a.gap-b.gap)[0];
    S.push(L(`Di antara partai yang lolos, yang paling diuntungkan adalah <strong>${pos.name}</strong> dengan persentase kursi ${fmtDec(pos.gap,2)} poin di atas persentase suaranya, sedangkan yang paling dirugikan adalah <strong>${neg.name}</strong> dengan ${fmtDec(Math.abs(neg.gap),2)} poin di bawah.`,`Among the parties that pass, <strong>${pos.name}</strong> gains most, with a seat share ${fmtDec(pos.gap,2)} points above its vote share, while <strong>${neg.name}</strong> loses most, ${fmtDec(Math.abs(neg.gap),2)} points below.`));}
  const I=idxFormulas(rows.map(r=>({votePercent:r.votes/totalNatVotes*100,seatPercent:(sl[r.name]||0)/tot*100,seatShare:(sl[r.name]||0)/tot})));
  S.push(L(`Indeks Gallagher untuk hasil ini sebesar ${fmtDec(I.LSI,2)} dan jumlah efektif partai di parlemen sebesar ${fmtDec(I.ENPP,2)}.`,`The Gallagher index for this result is ${fmtDec(I.LSI,2)} and the effective number of parliamentary parties is ${fmtDec(I.ENPP,2)}.`));
  if(m.official){const offNat={};Object.entries(m.official).forEach(([k,v])=>{const p=k.split('|')[1];offNat[p]=(offNat[p]||0)+v;});
    const diff=allParties.filter(p=>(sl[p]||0)!==(offNat[p]||0));
    S.push(diff.length?L(`Dengan pengaturan ini, hasil ${MN[mi]} berbeda dari penetapan kursi resmi KPU untuk ${joinList(diff)}.`,`With these settings, the ${MN[mi]} result differs from the official KPU allocation for ${joinList(diff)}.`)
      :L(`Dengan pengaturan ini, hasil ${MN[mi]} sama dengan penetapan kursi resmi KPU dalam Keputusan KPU Nomor 1206 Tahun 2024.`,`With these settings, the ${MN[mi]} result matches the official KPU allocation in KPU Decree No. 1206 of 2024.`));}
  return S.join(' ');
}
function narrMdSim(cur,base){
  const m=lastMdCalc;const L=(a,b)=>currentLang==='en'?b:a;const S=[];const MN=getMNames();
  const{allParties,natVotes,totalNatVotes,thresh}=m;
  const nCur=allParties.filter(p=>natVotes[p]/totalNatVotes*100>=mdSimThresh).length;
  const lost=allParties.filter(p=>natVotes[p]/totalNatVotes*100<mdSimThresh).reduce((a,p)=>a+natVotes[p],0);
  S.push(L(`Dengan metode ${MN[mdSimMethod]} dan ambang batas ${fmtDec(mdSimThresh,1)}%, ${nCur} partai lolos, sedangkan suara partai yang tidak lolos berjumlah ${fmtNum(lost)}, atau ${fmtDec(lost/totalNatVotes*100,2)}% dari suara sah nasional.`,`With ${MN[mdSimMethod]} and a ${fmtDec(mdSimThresh,1)}% threshold, ${nCur} parties pass, while the votes of parties that fail total ${fmtNum(lost)}, or ${fmtDec(lost/totalNatVotes*100,2)}% of national valid votes.`));
  if(Math.abs(mdSimThresh-thresh)<1e-9){S.push(L('Geser penggeser untuk melihat bagaimana perolehan kursi berubah bila ambang batas dinaikkan atau diturunkan.','Move the slider to see how seats change as the threshold goes up or down.'));return S.join(' ');}
  const ch=allParties.map(p=>[p,cur[p]-base[p]]).filter(x=>x[1]!==0);
  const nb=allParties.filter(p=>natVotes[p]/totalNatVotes*100>=thresh).length;
  S.push(nb===nCur?L(`Dibanding ambang ${fmtDec(thresh,1)}% yang sedang dipakai, jumlah partai yang lolos tetap ${nCur}.`,`Compared with the ${fmtDec(thresh,1)}% threshold in use, the number of parties that pass stays at ${nCur}.`):L(`Dibanding ambang ${fmtDec(thresh,1)}% yang sedang dipakai, jumlah partai yang lolos berubah dari ${nb} menjadi ${nCur}.`,`Compared with the ${fmtDec(thresh,1)}% threshold in use, the number of parties that pass changes from ${nb} to ${nCur}.`));
  const up=ch.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),dn=ch.filter(x=>x[1]<0).sort((a,b)=>a[1]-b[1]);
  const f=a=>joinList(a.slice(0,3).map(([p,d])=>`<strong>${p}</strong> (${d>0?'+':''}${d})`));
  if(up.length||dn.length){const seg=[];if(up.length)seg.push(L('yang bertambah, ','gains, ')+f(up));if(dn.length)seg.push(L('yang berkurang, ','losses, ')+f(dn));S.push(L('Perubahan kursi terbesar dialami ','The largest seat changes are for ')+seg.join(L('; dan ','; and '))+'.');}
  else S.push(L('Perolehan kursi setiap partai tidak berubah.','No party\'s seat total changes.'));
  return S.join(' ');
}
function narrMdLast(rows){
  if(!rows.length)return'';const L=(a,b)=>currentLang==='en'?b:a;const MN=getMNames();
  const a=rows[0],z=rows[rows.length-1];
  const n1=rows.filter(r=>r.extra<1000).length,n10=rows.filter(r=>r.extra<10000).length;
  return L(`Dengan metode ${MN[mdLastMethod]}, persaingan kursi terakhir paling ketat terjadi di Dapil <strong>${a.dist}</strong>, di mana <strong>${a.ch.party}</strong> hanya membutuhkan tambahan ${fmtNum(a.extra)} suara untuk merebut kursi terakhir dari <strong>${a.last.party}</strong>. Dari ${rows.length} dapil, ada ${n1} dapil yang selisihnya di bawah 1.000 suara dan ${n10} dapil di bawah 10.000 suara. Persaingan paling longgar ada di Dapil <strong>${z.dist}</strong>, yang membutuhkan tambahan ${fmtNum(z.extra)} suara.`,
    `Under ${MN[mdLastMethod]}, the tightest last-seat race is in <strong>${a.dist}</strong>, where <strong>${a.ch.party}</strong> needs only ${fmtNum(a.extra)} more votes to take the last seat from <strong>${a.last.party}</strong>. Of ${rows.length} districts, ${n1} have a margin below 1,000 votes and ${n10} below 10,000 votes. The loosest race is in <strong>${z.dist}</strong>, which would take ${fmtNum(z.extra)} more votes.`);
}
function drawMdLastChart(rows){
  mkChart('mdLastChart',{type:'line',data:{labels:rows.map((r,i)=>i+1),datasets:[{data:rows.map(r=>Math.max(1,r.extra)),borderColor:'#1d4ed8',backgroundColor:'#1d4ed8',borderWidth:2,pointRadius:2.5,tension:0,dists:rows.map(r=>r.dist)}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:it=>it[0].dataset.dists[it[0].dataIndex],label:c=>`${T('ch_last_y')}: ${fmtNum(c.parsed.y)}`}}},
      scales:{x:{title:{display:true,text:T('ch_last_x'),color:'#64748b'},ticks:{color:'#64748b',maxTicksLimit:12},grid:{display:false}},
        y:{type:'logarithmic',title:{display:true,text:T('ch_last_y'),color:'#64748b'},ticks:{color:'#64748b',callback:v=>[100,1000,10000,100000,1000000].includes(v)?fmtNum(v):''},grid:{color:'#f1f5f9'}}}}});
}
const SCN_THRESH=[0,2,4,5,7];
function scenarioShares(th,mi){
  const r=mdSeatsAt(th,mi);const tot=Object.values(r).reduce((a,b)=>a+b,0);const out={};
  Object.keys(r).forEach(p=>out[p]=tot?r[p]/tot*100:0);return{seats:r,share:out,tot};
}
function renderMdScenario(){
  if(!lastMdCalc||!document.getElementById('mdScnChart'))return;
  const{allParties,thresh}=lastMdCalc;
  const th=[...new Set([...SCN_THRESH,thresh])].sort((a,b)=>a-b);
  const res=th.map(x=>scenarioShares(x,mdSimMethod));
  const shown=allParties.filter(p=>res.some(r=>r.seats[p]>0));
  mkChart('mdScnChart',{type:'bar',data:{labels:th.map(x=>T('ch_scn_label',{t:fmtDec(x,1)})+(x===thresh?' *':'')),
      datasets:shown.map(p=>({label:p,data:res.map(r=>+r.share[p].toFixed(2)),seatN:res.map(r=>r.seats[p]),backgroundColor:COLORS[allParties.indexOf(p)%COLORS.length],borderWidth:0.5,borderColor:'#fff'}))},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:11,boxHeight:11,color:'#334155',font:{size:11,family:'Open Sans'}}},
      tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.dataset.seatN[c.dataIndex]} ${currentLang==='en'?'seats':'kursi'} (${fmtDec(c.parsed.x,2)}%)`}}},
      scales:{x:{stacked:true,min:0,max:100,title:{display:true,text:T('ch_scn_axis')+' (%)',color:'#64748b'},ticks:{color:'#64748b',callback:v=>v+'%'},grid:{color:'#f1f5f9'}},y:{stacked:true,ticks:{color:'#334155'},grid:{display:false}}}}});
}
function downloadPNG(){
  if(!chartInst){notify(currentLang==='en'?'Please calculate first!':'Hitung dulu!');return;}
  switchTab(1);
  setTimeout(()=>{
    const canvas=document.getElementById('myChart');const tmp=document.createElement('canvas');tmp.width=canvas.width;tmp.height=canvas.height;
    const ctx2=tmp.getContext('2d');ctx2.fillStyle='#ffffff';ctx2.fillRect(0,0,tmp.width,tmp.height);ctx2.drawImage(canvas,0,0);
    const url=tmp.toDataURL('image/png');const arr=atob(url.split(',')[1]);const u8=new Uint8Array(arr.length);
    for(let i=0;i<arr.length;i++)u8[i]=arr.charCodeAt(i);triggerDownload(new Blob([u8],{type:'image/png'}),'grafik_pemilu.png');
  },300);
}
function triggerDownload(blob,filename){
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function switchTab(n){
  [0,1,2,3].forEach(i=>{document.getElementById('t'+i).classList.toggle('hidden',i!==n);document.querySelectorAll('.tab')[i].classList.toggle('on',i===n);});
  if(n===3)renderTrace();
}
