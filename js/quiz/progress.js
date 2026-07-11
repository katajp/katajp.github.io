// Updates the in-quiz progress bar / score / streak display (not the Progress tab).

function updateQuizProgress(){
  const s=activeSession;
  const stg=STAGES[Math.min(s.stageIdx,STAGES.length-1)];
  const totalQ=getKanaTotalQ(s.charCount);
  const globalQ=getKanaGlobalQ(s.stageIdx,s.questionIdx,s.charCount);
  const globalPct=Math.round(globalQ/totalQ*100);
  const currentStageTotal=getKanaStageQCount(s.stageIdx,s.charCount);

  const plabel=document.querySelector(".qa-plabel");
  if(plabel)plabel.innerHTML=`<span>Stage ${s.stageIdx+1}/${STAGES.length} — Question ${s.questionIdx}/${currentStageTotal}</span><span>${globalPct}%</span>`;
  const bar=document.querySelector(".qa-bar-in");
  if(bar)bar.style.width=globalPct+"%";
  const stageEl=document.querySelector(".qa-stage");
  if(stageEl)stageEl.textContent=stg.name+" — "+stg.desc;
  document.getElementById("qScore").textContent=s.score;
  document.getElementById("qStreak").textContent=s.streak;
}

