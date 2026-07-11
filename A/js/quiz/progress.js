// Updates the in-quiz progress bar / score / streak display (not the Progress tab).

function updateQuizProgress(){
  const s=activeSession;
  const stg=STAGES[Math.min(s.stageIdx,STAGES.length-1)];
  const totalQ=STAGES.length*Q_PER_STAGE;
  const globalQ=s.stageIdx*Q_PER_STAGE+s.questionIdx;
  const globalPct=Math.round(globalQ/totalQ*100);

  const plabel=document.querySelector(".qa-plabel");
  if(plabel)plabel.innerHTML=`<span>Stage ${s.stageIdx+1}/${STAGES.length} — Question ${s.questionIdx}/${Q_PER_STAGE}</span><span>${globalPct}%</span>`;
  const bar=document.querySelector(".qa-bar-in");
  if(bar)bar.style.width=globalPct+"%";
  const stageEl=document.querySelector(".qa-stage");
  if(stageEl)stageEl.textContent=stg.name+" — "+stg.desc;
  document.getElementById("qScore").textContent=s.score;
  document.getElementById("qStreak").textContent=s.streak;
}

