// Adaptive weighting: prioritizes chars the user gets wrong / confuses.

function confuseWeight(ch){
  const m=confusion[ch];if(!m)return 0;
  return Object.values(m).reduce((a,b)=>a+b,0);
}
function weightOf(k){
  const st=stats[k.ch];
  let w;
  if(!st||st.seen===0)w=3;
  else{const acc=st.correct/st.seen;w=(acc>=.9&&st.seen>=4)?.4:(1-acc)*4+.6;}
  w+=confuseWeight(k.ch)*.8;
  return w;
}
function weightedPick(pool){
  const ws=pool.map(weightOf);const tot=ws.reduce((a,b)=>a+b,0);
  let r=Math.random()*tot;
  for(let i=0;i<pool.length;i++){r-=ws[i];if(r<=0)return pool[i];}
  return pool[pool.length-1];
}

