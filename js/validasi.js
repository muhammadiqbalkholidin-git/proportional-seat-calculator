/* Halaman Validasi: uji yang dijalankan di browser dan juga oleh tests/run-tests.mjs. */
/* ===== v1.4: halaman Validasi =====
   runValidation() memakai fungsi hitung yang sama dengan kalkulator dan juga dijalankan oleh tests/run-tests.mjs */
function runValidation(){
  const en=currentLang==='en';const L=(a,b)=>en?b:a;
  const saveR=roundMode,saveL=lembaga;
  const groups=[];
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const clean=o=>Object.fromEntries(Object.entries(o).filter(e=>e[1]>0).sort((x,y)=>x[0].localeCompare(y[0])));
  const show=o=>Object.entries(clean(o)).map(e=>e[0]+' '+e[1]).join(', ');
  try{
    roundMode='none';lembaga='table';
    const P=[{name:'A',votes:41000},{name:'B',votes:29000},{name:'C',votes:17000},{name:'D',votes:13000}];
    const g1={title:L('1. Contoh hitung tangan','1. Hand-calculated example'),desc:L('Empat partai (A 41.000, B 29.000, C 17.000, D 13.000 suara) memperebutkan 6 kursi. Angka harapan dihitung manual mengikuti rumus tiap metode di halaman Metodologi.','Four parties (A 41,000, B 29,000, C 17,000, D 13,000 votes) compete for 6 seats. The expected numbers were worked out by hand from each method\'s formula on the Methodology page.'),items:[]};
    [['Sainte-Laguë',sainteLague(P,6,1),{A:2,B:2,C:1,D:1}],[L('SL Modifikasi (pembagi pertama 1,4)','Modified SL (first divisor 1.4)'),sainteLague(P,6,1.4),{A:2,B:2,C:1,D:1}],["D'Hondt",dhondt(P,6),{A:3,B:2,C:1}],[L('Kuota Hare','Hare Quota'),hare(P,6),{A:2,B:2,C:1,D:1}],[L('Kuota Droop','Droop Quota'),droop(P,6),{A:2,B:2,C:1,D:1}]]
      .forEach(([n,h,e])=>g1.items.push({name:n,ok:same(clean(h),clean(e)),detail:L('Hasil ','Result ')+show(h)+L(', harapan ',', expected ')+show(e)}));
    groups.push(g1);

    const g2={title:L('2. Kasus pinggiran','2. Edge cases'),desc:L('Keadaan yang jarang terjadi tetapi bisa membuat kalkulator keliru bila tidak ditangani.','Rare situations that could make the calculator go wrong if not handled.'),items:[]};
    const z=sainteLague([{name:'X',votes:0},{name:'Y',votes:0}],3,1);
    g2.items.push({name:L('Total suara nol tidak membagikan kursi','Zero total votes allocate no seats'),ok:same(z,{X:0,Y:0}),detail:show(z)||L('tidak ada kursi','no seats')});
    const seri=[{name:'X',votes:100},{name:'Y',votes:100}];
    const t1=findTieDivisor(seri,1,sainteLague(seri,1,1),1,'sl');
    g2.items.push({name:L('Nilai seri pada kursi terakhir terdeteksi','A tie on the last seat is detected'),ok:same(t1,['X','Y']),detail:L('Seri antara ','Tie between ')+(t1||[]).join(L(' dan ',' and '))});
    g2.items.push({name:L('Contoh biasa tidak dianggap seri','An ordinary case is not flagged as a tie'),ok:findTieDivisor(P,6,sainteLague(P,6,1),1,'sl')===null&&findTieQuota(P,6,'hare')===null,detail:L('Tidak ada peringatan seri','No tie warning')});
    groups.push(g2);

    const g3={title:L('3. Data preset','3. Preset data'),desc:L('Angka yang tertanam di kalkulator dicocokkan dengan total resmi dalam keputusan KPU.','The numbers built into the calculator are checked against the official totals in the KPU decrees.'),items:[]};
    const totPreset=DPR2024.reduce((a,r)=>a+r[1],0);
    g3.items.push({name:L('Preset nasional berisi 18 partai dengan 151.793.293 suara sah (Keputusan KPU 1205/2024)','National preset has 18 parties with 151,793,293 valid votes (KPU Decree 1205/2024)'),ok:DPR2024.length===18&&totPreset===151793293,detail:DPR2024.length+L(' partai, ',' parties, ')+fmtNum(totPreset)});
    const totK=Object.values(DPR2024_SEATS).reduce((a,b)=>a+b,0);
    g3.items.push({name:L('Kursi resmi nasional berjumlah 580','Official national seats total 580'),ok:totK===580,detail:fmtNum(totK)});
    const totMd=MD_DPR2024.reduce((a,r)=>a+r.slice(2).reduce((x,y)=>x+y,0),0),seatMd=MD_DPR2024.reduce((a,r)=>a+r[1],0);
    g3.items.push({name:L('Data per dapil berisi 84 dapil, 580 kursi, 151.796.631 suara sah (Keputusan KPU 360/2024)','District data has 84 districts, 580 seats, 151,796,631 valid votes (KPU Decree 360/2024)'),ok:MD_DPR2024.length===84&&seatMd===580&&totMd===151796631,detail:MD_DPR2024.length+' dapil, '+seatMd+L(' kursi, ',' seats, ')+fmtNum(totMd)});
    const elig=nationalEligible2024();
    g3.items.push({name:L('Delapan partai lolos ambang batas nasional 4%','Eight parties pass the national 4% threshold'),ok:elig.size===8,detail:[...elig].join(', ')});
    groups.push(g3);

    const g4={title:L('4. Sainte-Laguë dibandingkan kursi resmi di 84 dapil','4. Sainte-Laguë against official seats in all 84 districts'),desc:L('Untuk setiap dapil, suara delapan partai yang lolos ambang batas dibagi dengan Sainte-Laguë, lalu hasilnya dicocokkan dengan Keputusan KPU Nomor 1206 Tahun 2024. Uji ini diulang untuk ketiga pilihan hasil bagi. Kolom terakhir memeriksa angka tambahan suara penantang terdekat dengan cara menambahkannya sungguhan ke data. Dengan tambahan sebesar itu penantang harus benar-benar merebut kursi terakhir, sedangkan dengan satu suara lebih sedikit nilainya paling jauh hanya menyamai pemegang kursi terakhir, yaitu keadaan seri yang penyelesaiannya diatur PKPU 6/2024 Pasal 13 ayat 3.','For each district, the votes of the eight parties that passed the threshold are divided with Sainte-Laguë and compared with KPU Decree No. 1206 of 2024. The test is repeated for all three quotient options. The last column checks the closest challenger\'s extra-vote figure by actually adding it to the data. With that many extra votes the challenger must actually take the last seat, while one vote fewer can at most draw level with the holder of the last seat, a tie resolved under KPU Regulation 6/2024 Article 13(3).'),items:[],table:[]};
    const ps8=MD_DPR2024_PARTIES.slice(0,8);
    const modeOk={none:0,round:0,trunc:0};let extraOk=0;let tieAny=0;
    MD_DPR2024.forEach((r,i)=>{
      const pts=MD_DPR2024_PARTIES.map((p,j)=>({name:p,votes:r[j+2]})).filter(x=>elig.has(x.name));
      const off={};ps8.forEach((p,j)=>{if(MD_DPR2024_RESMI[i][j])off[p]=MD_DPR2024_RESMI[i][j];});
      let res0=null;
      ['none','round','trunc'].forEach(m=>{roundMode=m;const h=sainteLague(pts,r[1],1);if(m==='none')res0=h;if(same(clean(h),clean(off)))modeOk[m]++;if(findTieDivisor(pts,r[1],h,1,'sl'))tieAny++;});
      roundMode='none';
      const c=mdLastSeat(pts,r[1],0);let ex=true;
      if(c&&c.ch){
        const bump=(n)=>sainteLague(pts.map(p=>p.name===c.ch.party?{name:p.name,votes:p.votes+n}:p),r[1],1);
        ex=(bump(c.extra)[c.ch.party]||0)>(res0[c.ch.party]||0)&&(c.ch.votes+c.extra)/c.ch.divisor>c.last.quotient&&(c.ch.votes+c.extra-1)/c.ch.divisor<=c.last.quotient;
      }
      if(ex)extraOk++;
      g4.table.push([r[0],r[1],show(res0),show(off),same(clean(res0),clean(off)),c&&c.ch?`${c.ch.party} +${fmtNum(c.extra)}`:'-',ex]);
    });
    g4.items.push({name:L('Hitungan murni, 84 dapil cocok','Exact values, 84 districts match'),ok:modeOk.none===84,detail:modeOk.none+' / 84'});
    g4.items.push({name:L('Dua desimal dibulatkan, 84 dapil cocok','Two decimals rounded, 84 districts match'),ok:modeOk.round===84,detail:modeOk.round+' / 84'});
    g4.items.push({name:L('Dua desimal dipotong, 84 dapil cocok','Two decimals truncated, 84 districts match'),ok:modeOk.trunc===84,detail:modeOk.trunc+' / 84'});
    g4.items.push({name:L('Tidak ada nilai seri pada kursi terakhir di ketiga pilihan','No last-seat tie under any of the three options'),ok:tieAny===0,detail:tieAny===0?L('Tidak ada seri','No ties'):tieAny+L(' kasus',' cases')});
    g4.items.push({name:L('Angka tambahan suara penantang terbukti tepat di 84 dapil','The challenger extra-vote figure is exact in all 84 districts'),ok:extraOk===84,detail:extraOk+' / 84'});
    const natCalc={};
    MD_DPR2024.forEach(r=>{const pts=MD_DPR2024_PARTIES.map((p,j)=>({name:p,votes:r[j+2]})).filter(x=>elig.has(x.name));const h=sainteLague(pts,r[1],1);Object.entries(h).forEach(([p,k])=>{natCalc[p]=(natCalc[p]||0)+k;});});
    g4.items.push({name:L('Jumlah kursi nasional sama dengan penetapan resmi','National seat totals match the official result'),ok:same(clean(natCalc),clean(DPR2024_SEATS)),detail:show(natCalc)});
    groups.push(g4);

    const g5={title:L('5. Sakelar pembulatan','5. Rounding switch'),desc:L('PKPU 6/2024 Pasal 13 ayat 2 menyatakan angka pecahan diperhitungkan sebagai dua angka desimal tanpa menegaskan apakah dibulatkan atau dipotong. Uji ini memastikan ketiga pilihan bekerja sesuai namanya.','KPU Regulation 6/2024 Article 13(2) says fractions are counted to two decimal places without saying whether they are rounded or truncated. This test checks that each option does what its name says.'),items:[]};
    const x=358745/3;
    roundMode='none';const a0=qv(x);roundMode='round';const a1=qv(x);roundMode='trunc';const a2=qv(x);roundMode='none';
    g5.items.push({name:L('Hitungan murni tidak mengubah 119.581,666…','Exact values leave 119,581.666… unchanged'),ok:a0===x,detail:String(a0)});
    g5.items.push({name:L('Dibulatkan menjadi 119.581,67','Rounded to 119,581.67'),ok:a1===119581.67,detail:String(a1)});
    g5.items.push({name:L('Dipotong menjadi 119.581,66','Truncated to 119,581.66'),ok:a2===119581.66,detail:String(a2)});
    const S=[{name:'X',votes:73},{name:'Y',votes:198}];
    const tie=m=>{roundMode=m;const r=findTieDivisor(S,13,sainteLague(S,13,1),1,'sl');roundMode='none';return r;};
    const tn=tie('none'),tr=tie('round'),tt=tie('trunc');
    g5.items.push({name:L('Pilihan pembulatan bisa memunculkan seri yang tidak ada pada hitungan murni, dan kalkulator menandainya','A rounding option can create a tie that exact values do not, and the calculator flags it'),ok:tn===null&&tr===null&&Array.isArray(tt),detail:L('Contoh buatan, 13 kursi. X 73 suara ÷ 7 = 10,4285… dan Y 198 suara ÷ 19 = 10,4210… Bila dipotong keduanya menjadi 10,42 sehingga seri, bila dibulatkan menjadi 10,43 dan 10,42 sehingga tidak seri.','Constructed example, 13 seats. X 73 votes ÷ 7 = 10.4285… and Y 198 votes ÷ 19 = 10.4210… Truncated, both become 10.42 and tie; rounded, they become 10.43 and 10.42 and do not.')});
    groups.push(g5);

    const g6={title:L('6. Aturan ambang batas','6. Threshold rules'),desc:L('Aturan ambang batas berbeda antara DPR RI dan DPRD. Uji ini memastikan kalkulator mengikutkan partai yang benar dalam pembagian kursi pada setiap aturan.','Threshold rules differ between DPR RI and DPRD. This test checks that the calculator includes the right parties in seat allocation under each rule.'),items:[]};
    const k={name:'K',votes:10,pass:false},b={name:'B',votes:990,pass:true};
    lembaga='table';g6.items.push({name:L('Ambang dihitung dari suara di tabel, partai di bawah ambang tidak ikut','Threshold computed from votes in the table, a party below it is excluded'),ok:isOut(k,1000,4)&&!isOut(b,1000,4),detail:'K 1%, B 99%'});
    lembaga='manual';g6.items.push({name:L('Kelolosan ditentukan per partai, partai yang tidak dicentang tidak ikut walau suaranya besar di dapil itu','Eligibility set per party, an unchecked party is excluded even with many votes in that district'),ok:isOut({name:'Z',votes:900,pass:false},1000,4)&&!isOut({...k,pass:true},1000,4),detail:L('Mengikuti centang, bukan persentase dapil','Follows the checkbox, not the district share')});
    lembaga='none';g6.items.push({name:L('Tanpa ambang batas, semua partai ikut','No threshold, all parties take part'),ok:!isOut(k,1000,4)&&!isOut({name:'Z',votes:1,pass:false},1000,4),detail:L('Sesuai UU 7/2017 Pasal 414 ayat 2','Per Law 7/2017 Article 414(2)')});
    const el8=nationalEligible2024();const r0=MD_DPR2024[0];const pts18=MD_DPR2024_PARTIES.map((p,j)=>({name:p,votes:r0[j+2],pass:el8.has(p)}));const tot0=pts18.reduce((a,p)=>a+p.votes,0);
    lembaga='manual';const inDpr=pts18.filter(p=>!isOut(p,tot0,4)).length;lembaga='none';const inDprd=pts18.filter(p=>!isOut(p,tot0,4)).length;
    g6.items.push({name:L('Data Dapil Aceh I, kelolosan per partai mengikutkan 8 partai dan tanpa ambang mengikutkan 18 partai','Aceh I data, eligibility per party includes 8 parties and no threshold includes 18'),ok:inDpr===8&&inDprd===18,detail:inDpr+' / '+inDprd});
    groups.push(g6);

    const g8={title:L('7. Data grafik','7. Chart data'),desc:L('Grafik dibangun dari fungsi tersendiri. Uji ini memastikan isi grafik Persaingan Kursi, diagram Komposisi Kursi, dan grafik Persentase Suara dan Kursi sama dengan hasil perhitungan kursi untuk kelima metode.','Charts are built by separate functions. This test checks that the Seat Race chart, the Seat Composition diagram and the Vote and Seat Shares chart match the seat calculation for all five methods.'),items:[]};
    let raceOk=0,lastOk=0,quotaOk=0;const ALLOC=[(p,k)=>sainteLague(p,k,1),(p,k)=>sainteLague(p,k,1.4),(p,k)=>dhondt(p,k),(p,k)=>hare(p,k),(p,k)=>droop(p,k)];
    ['none','round','trunc'].forEach(m=>{roundMode=m;MD_DPR2024.forEach((r,i)=>{
      const pts=MD_DPR2024_PARTIES.map((p,j)=>({name:p,votes:r[j+2]})).filter(x=>elig.has(x.name));
      [0,1,2].forEach(mi=>{const it=raceData(pts,r[1],mi);const cnt={};it.filter(x=>x.won).forEach(x=>cnt[x.party]=(cnt[x.party]||0)+1);
        if(same(clean(cnt),clean(ALLOC[mi](pts,r[1]))))raceOk++;
        const cr=mdLastSeat(pts,r[1],mi);const lastW=it[r[1]-1];if(cr&&lastW.party===cr.last.party&&Math.abs(lastW.q-cr.last.quotient)<1e-9)lastOk++;});
    });});roundMode='none';
    MD_DPR2024.forEach(r=>{const pts=MD_DPR2024_PARTIES.map((p,j)=>({name:p,votes:r[j+2]})).filter(x=>elig.has(x.name));
      [3,4].forEach(mi=>{const q=quotaRaceData(pts,r[1],mi);const cnt={};q.items.forEach(x=>cnt[x.party]=x.initial+(x.won?1:0));if(same(clean(cnt),clean(ALLOC[mi](pts,r[1]))))quotaOk++;});});
    g8.items.push({name:L('Grafik Persaingan Kursi untuk Sainte-Laguë, SL Modifikasi, dan D\'Hondt sama dengan hasil kursinya di 84 dapil, untuk ketiga pilihan hasil bagi','The Seat Race chart for Sainte-Laguë, Modified SL and D\'Hondt matches their seat results in all 84 districts, under all three quotient options'),ok:raceOk===756,detail:raceOk+' / 756'});
    g8.items.push({name:L('Batang terakhir di atas garis batas sama dengan kursi terakhir pada kotak kursi kritis','The last bar above the cut-off line matches the last seat in the critical-seat box'),ok:lastOk===756,detail:lastOk+' / 756'});
    g8.items.push({name:L('Grafik kursi sisa untuk Kuota Hare dan Kuota Droop sama dengan hasil kursinya di 84 dapil','The remainder chart for Hare and Droop matches their seat results in all 84 districts'),ok:quotaOk===168,detail:quotaOk+' / 168'});
    const hs=[1,3,7,10,50,120,580];const hOk=hs.every(n=>hemicycleLayout(n).pos.length===n);
    g8.items.push({name:L('Diagram komposisi kursi menggambar tepat satu titik untuk setiap kursi','The seat composition diagram draws exactly one dot per seat'),ok:hOk,detail:hs.join(', ')+L(' kursi',' seats')});
    const vs=voteSeatRows(P,sainteLague(P,6,1),100000,6);const sv=vs.reduce((a,r)=>a+r.vp,0),ss=vs.reduce((a,r)=>a+r.sp,0);
    g8.items.push({name:L('Persentase suara dan kursi pada grafik sebar masing-masing berjumlah 100%','Vote and seat shares in the scatter chart each add up to 100%'),ok:Math.abs(sv-100)<1e-9&&Math.abs(ss-100)<1e-9,detail:fmtDec(sv,2)+'% / '+fmtDec(ss,2)+'%'});
    groups.push(g8);

    const g7={title:L('8. Indeks disproporsionalitas','8. Disproportionality indices'),desc:L('Tiga partai dengan suara 50%, 30%, dan 20% memperoleh 6, 3, dan 1 dari 10 kursi. Nilai harapan dihitung manual dari rumus di halaman Metodologi.','Three parties with 50%, 30% and 20% of the vote win 6, 3 and 1 of 10 seats. Expected values were worked out by hand from the formulas on the Methodology page.'),items:[]};
    const ip=[[50,6],[30,3],[20,1]].map(([v,s])=>({votePercent:v,seatPercent:s*10,seatShare:s/10}));
    const I=idxFormulas(ip);const r4=v=>Math.round(v*10000)/10000;
    g7.items.push({name:'Loosemore-Hanby (LHI) = 10',ok:r4(I.LHI)===10,detail:fmtDec(I.LHI,4)});
    g7.items.push({name:'Gallagher (LSI) = 10',ok:r4(I.LSI)===10,detail:fmtDec(I.LSI,4)});
    g7.items.push({name:'ENPP = 1 ÷ 0,46 = 2,1739',ok:r4(I.ENPP)===2.1739,detail:fmtDec(I.ENPP,4)});
    groups.push(g7);
  }finally{roundMode=saveR;lembaga=saveL;}
  return groups;
}
function renderValidation(){
  const box=document.getElementById('valBody');if(!box)return;
  const en=currentLang==='en';const L=(a,b)=>en?b:a;
  let groups;try{groups=runValidation();}catch(e){box.innerHTML=`<div class="warn-box">${L('Uji gagal dijalankan: ','Tests failed to run: ')}${e.message}</div>`;return;}
  const all=groups.flatMap(g=>g.items);const pass=all.filter(i=>i.ok).length;
  const d=new Date().toLocaleString(en?'en-GB':'id-ID',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const sum=document.getElementById('valSummary');
  sum.classList.toggle('bad',pass!==all.length);
  sum.innerHTML=`<span class="vs-num">${pass} / ${all.length}</span><span>${pass===all.length?L('uji lulus. Semua hasil sesuai harapan.','tests passed. All results are as expected.'):L('uji lulus. Ada uji yang gagal, mohon laporkan lewat email.','tests passed. Some tests failed, please report this by email.')}<br><small>${L('Dijalankan','Run on')} ${d} · ${L('versi','version')} 2.0.0</small></span>`;
  const ok=v=>v?`<span class="val-ok">✓ ${L('Lulus','Pass')}</span>`:`<span class="val-bad">✗ ${L('Gagal','Fail')}</span>`;
  box.innerHTML=groups.map(g=>{
    let h=`<div class="val-grp"><h2>${g.title}</h2><div class="vg-desc">${g.desc}</div><div class="ow"><table class="val-tbl"><thead><tr><th>${L('Uji','Test')}</th><th>${L('Hasil','Result')}</th><th>${L('Rincian','Detail')}</th></tr></thead><tbody>`+
      g.items.map(i=>`<tr><td>${i.name}</td><td>${ok(i.ok)}</td><td>${i.detail}</td></tr>`).join('')+`</tbody></table></div>`;
    if(g.table){
      h+=`<details class="val-more"><summary>${L('Lihat rincian 84 dapil','Show all 84 districts')}</summary><div class="ow"><table class="val-tbl"><thead><tr><th>Dapil</th><th>${L('Kursi','Seats')}</th><th>${L('Hasil kalkulator','Calculator')}</th><th>${L('Kursi resmi','Official')}</th><th>${L('Cocok','Match')}</th><th>${L('Penantang terdekat','Closest challenger')}</th><th>${L('Uji tambahan suara','Extra-vote check')}</th></tr></thead><tbody>`+
        g.table.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${ok(r[4])}</td><td>${r[5]}</td><td>${ok(r[6])}</td></tr>`).join('')+`</tbody></table></div></details>`;
    }
    return h+'</div>';
  }).join('');
}
