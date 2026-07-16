// Coverage-first adaptive weighting. Each item appears once per cycle
// before any item is repeated; weak items are moved earlier in the next
// cycle instead of being allowed to repeat immediately.

function coverageState(session,scope){
  if(!session)return {};
  if(!session.questionCoverage)session.questionCoverage={};
  if(!session.questionCoverage[scope])session.questionCoverage[scope]={};
  return session.questionCoverage[scope];
}

function coverageWeightedPick(pool,state,keyFn,weightFn){
  if(!pool.length)return null;
  const keys=pool.map(keyFn);
  const signature=[...keys].sort().join("\u001f");
  if(state.signature!==signature){state.signature=signature;state.used=[];state.recent=[];}
  if(!Array.isArray(state.used))state.used=[];
  if(!Array.isArray(state.recent))state.recent=[];

  let used=new Set(state.used);
  let available=pool.filter(item=>!used.has(keyFn(item)));
  if(!available.length){state.used=[];used=new Set();available=[...pool];}

  // Keep the last two prompts out of the candidate set when possible.
  const recent=new Set(state.recent);
  const fresh=available.filter(item=>!recent.has(keyFn(item)));
  const candidates=fresh.length?fresh:available;
  const weights=candidates.map(item=>Math.max(.05,Number(weightFn(item))||1));
  const total=weights.reduce((sum,w)=>sum+w,0);
  let cursor=Math.random()*total;
  let picked=candidates[candidates.length-1];
  for(let i=0;i<candidates.length;i++){cursor-=weights[i];if(cursor<=0){picked=candidates[i];break;}}

  const key=keyFn(picked);
  state.used.push(key);
  state.recent=[...state.recent,key].slice(-2);
  return picked;
}

function coverageWeightedSample(pool,count,state,keyFn,weightFn){
  const picked=[];
  const pickedKeys=new Set();
  let safety=0;
  while(picked.length<count&&picked.length<pool.length&&safety<pool.length*3){
    safety++;
    const item=coverageWeightedPick(pool,state,keyFn,weightFn);
    if(!item)break;
    const key=keyFn(item);
    if(pickedKeys.has(key))continue;
    pickedKeys.add(key);
    picked.push(item);
  }
  return picked;
}

function coverageValuePick(values,state){
  return coverageWeightedPick(values,state,value=>value,()=>1);
}

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
function weightedPick(pool,state={}){
  return coverageWeightedPick(pool,state,item=>item.ch,weightOf);
}
