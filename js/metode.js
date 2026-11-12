/* Lima metode alokasi kursi dan pembentuk jejak hitungnya. */
/* ===== ALGORITHMS ===== */
function sainteLague(pts,seats,d1){
  const r={};pts.forEach(p=>r[p.name]=0);
  if(!pts.length||pts.reduce((a,p)=>a+p.votes,0)<=0)return r;
  for(let s=0;s<seats;s++){let best=-Infinity,win='';pts.forEach(p=>{const div=r[p.name]===0?d1:(2*r[p.name]+1);const q=qv(p.votes/div);if(q>best){best=q;win=p.name;}});r[win]++;}
  return r;
}
function dhondt(pts,seats){
  const r={};pts.forEach(p=>r[p.name]=0);
  if(!pts.length||pts.reduce((a,p)=>a+p.votes,0)<=0)return r;
  for(let s=0;s<seats;s++){let best=-Infinity,win='';pts.forEach(p=>{const q=qv(p.votes/(r[p.name]+1));if(q>best){best=q;win=p.name;}});r[win]++;}
  return r;
}
function hare(pts,seats){
  const tot=pts.reduce((a,p)=>a+p.votes,0),q=tot/seats,r={},rem={};let used=0;
  if(tot<=0){pts.forEach(p=>r[p.name]=0);return r;}
  pts.forEach(p=>{const v=p.votes/q;r[p.name]=Math.floor(v);rem[p.name]=v-Math.floor(v);used+=r[p.name];});
  [...pts].sort((a,b)=>rem[b.name]-rem[a.name]).slice(0,seats-used).forEach(p=>r[p.name]++);
  return r;
}
function droop(pts,seats){
  const tot=pts.reduce((a,p)=>a+p.votes,0),q=Math.floor(tot/(seats+1))+1,r={},rem={};let used=0;
  if(tot<=0){pts.forEach(p=>r[p.name]=0);return r;}
  pts.forEach(p=>{r[p.name]=Math.floor(p.votes/q);rem[p.name]=p.votes-r[p.name]*q;used+=r[p.name];});
  const left=seats-used;
  if(left>0)[...pts].sort((a,b)=>rem[b.name]-rem[a.name]).slice(0,left).forEach(p=>r[p.name]++);
  return r;
}

/* ===== TRACE ENGINE ===== */
function buildDivisorTrace(pts,seats,d1){
  const counts={};pts.forEach(p=>counts[p.name]=0);const rows=[];
  for(let s=0;s<seats;s++){
    let best=-Infinity,winner='';
    pts.forEach(p=>{const div=counts[p.name]===0?d1:(2*counts[p.name]+1);const q=qv(p.votes/div);if(q>best){best=q;winner=p.name;}});
    const wp=pts.find(p=>p.name===winner);const div=counts[winner]===0?d1:(2*counts[winner]+1);
    rows.push({seat:s+1,party:winner,votes:wp.votes,prev:counts[winner],divisor:div,quotient:best});counts[winner]++;
  }return rows;
}
function buildDHondtTrace(pts,seats){
  const counts={};pts.forEach(p=>counts[p.name]=0);const rows=[];
  for(let s=0;s<seats;s++){
    let best=-Infinity,winner='';
    pts.forEach(p=>{const q=qv(p.votes/(counts[p.name]+1));if(q>best){best=q;winner=p.name;}});
    const wp=pts.find(p=>p.name===winner);
    rows.push({seat:s+1,party:winner,votes:wp.votes,prev:counts[winner],divisor:counts[winner]+1,quotient:best});counts[winner]++;
  }return rows;
}
function buildHareTrace(pts,seats){
  const tot=pts.reduce((a,p)=>a+p.votes,0);const quota=tot/seats;const rows=[];let used=0;
  pts.forEach(p=>{const exact=p.votes/quota;const initial=Math.floor(exact);used+=initial;rows.push({party:p.name,votes:p.votes,quota,initial,remainder:exact-initial,additional:0});});
  const left=seats-used;
  [...rows].sort((a,b)=>b.remainder-a.remainder).slice(0,left).forEach(r=>{rows.find(x=>x.party===r.party).additional=1;});
  rows.forEach(r=>r.total=r.initial+r.additional);return{quota,rows};
}
function buildDroopTrace(pts,seats){
  const tot=pts.reduce((a,p)=>a+p.votes,0);const quota=Math.floor(tot/(seats+1))+1;const rows=[];let used=0;
  pts.forEach(p=>{const initial=Math.floor(p.votes/quota);const remainder=p.votes-initial*quota;used+=initial;rows.push({party:p.name,votes:p.votes,quota,initial,remainder,additional:0});});
  const left=seats-used;
  if(left>0)[...rows].sort((a,b)=>b.remainder-a.remainder).slice(0,left).forEach(r=>{rows.find(x=>x.party===r.party).additional=1;});
  rows.forEach(r=>r.total=r.initial+r.additional);return{quota,rows};
}

