// Progress tab — overview stats, per-row accuracy, weak characters.

function refreshProgress(){
  let seenT=0,correctT=0;
  Object.values(stats).forEach(st=>{seenT+=st.seen;correctT+=st.correct;});
  document.getElementById("pAccuracy").textContent=seenT?Math.round(correctT/seenT*100)+"%":"-";
  document.getElementById("pSeenCount").textContent=Object.keys(stats).length+" "+t("characters");
  document.getElementById("pTotalQ").textContent=seenT||"-";

  function renderCh(id,script){
    const el=document.getElementById(id);el.innerHTML="";
    const data=script==="hiragana"?HIRA:KATA;
    [...data.basic,...data.dakuten,...data.combo].forEach(row=>{
      let seen=0,correct=0;
      row.chars.forEach(([ch])=>{const st=stats[ch];if(st){seen+=st.seen;correct+=st.correct;}});
      const pct=seen?Math.round(correct/seen*100):0;
      const r=document.createElement("div");r.className="chart-row";
      r.innerHTML=`<div class="lbl">${row.label}</div><div class="chart-bar-o"><div class="chart-bar-i" style="width:${seen?pct:0}%"></div></div><div class="pct">${seen?pct+"%":"-"}</div>`;
      el.appendChild(r);
    });
  }
  renderCh("progChartHira","hiragana");
  renderCh("progChartKata","katakana");

  // Vocabulary overview
  let vSeenT=0,vCorrectT=0;
  Object.values(vocabStats).forEach(st=>{vSeenT+=st.seen;vCorrectT+=st.correct;});
  const vAcc=document.getElementById("pVocabAccuracy");
  if(vAcc)vAcc.textContent=vSeenT?Math.round(vCorrectT/vSeenT*100)+"%":"-";
  const vSeen=document.getElementById("pVocabSeenCount");
  if(vSeen)vSeen.textContent=Object.keys(vocabStats).length+" "+t("words");

  // Weak chars
  const weak=Object.entries(stats).filter(([ch,st])=>st.seen>=3&&st.correct/st.seen<.7)
    .sort((a,b)=>(a[1].correct/a[1].seen)-(b[1].correct/b[1].seen));
  const wl=document.getElementById("weakList");
  if(!weak.length){wl.textContent=t("lookingGood");}
  else{
    wl.innerHTML="";
    weak.forEach(([ch,st])=>{
      const c=confusion[ch];let cw="";
      if(c){const top=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];if(top)cw=" ↔ "+top[0];}
      const span=document.createElement("span");span.className="weak-item";
      span.innerHTML=ch+" <b>"+Math.round(st.correct/st.seen*100)+"%</b>"+cw;
      wl.appendChild(span);
    });
  }
}

document.getElementById("resetAllBtn").onclick=()=>{
  if(!confirmDialog("Reset all progress, confusion data, and saved sessions (kana + vocabulary)?"))return;
  stats={};confusion={};sessions=[];
  vocabStats={};vocabConfusion={};vocabSessions=[];
  saveStats();saveConfusion();saveSessions();
  saveVocabStats();saveVocabConfusion();saveVocabSessions();
  /* Also clear API caches */
  try{
    const keysToRemove=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&(k.startsWith('kp-')||k.startsWith('jlptvocab:')||k.startsWith('search:')))keysToRemove.push(k);
    }
    keysToRemove.forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  refreshProgress();
  renderQuizSetup();
};
