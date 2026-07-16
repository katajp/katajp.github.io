// Stage: "Match" — drag & drop kana to their matching romaji reading.

function renderMatchQ(pool){
  // Use exactly the characters the user selected — don't pad up to a fixed
  // count. Only pad if the selection is too small to form a match (<2), and
  // cap if it's very large so the grid stays playable.
  const MIN_ITEMS=2, MAX_ITEMS=8;
  let chosenSource=[...pool];
  if(chosenSource.length<MIN_ITEMS){
    const extra=shuffleArr(ALL_KANA.filter(k=>!chosenSource.some(c=>c.ch===k.ch)));
    while(chosenSource.length<MIN_ITEMS && extra.length)chosenSource.push(extra.pop());
  }
  const count=Math.min(chosenSource.length,MAX_ITEMS);
  const stageId=STAGES[activeSession.stageIdx]?.id||"match";
  const chosen=coverageWeightedSample(chosenSource,count,coverageState(activeSession,stageId+"-groups"),item=>item.ch,weightOf);
  const left=shuffleArr(chosen.map((k,i)=>({...k,pair:i})));
  const right=shuffleArr(chosen.map((k,i)=>({...k,pair:i})));
  const area=document.getElementById("qaArea");
  area.innerHTML='<div class="feedback" id="qFb">Drag each kana onto its matching reading.</div>';
  const mw=document.createElement("div");mw.className="match-area";
  const cL=document.createElement("div");cL.className="match-col";
  const cR=document.createElement("div");cR.className="match-col";
  left.forEach(k=>{
    const chip=document.createElement("div");chip.className="mchip";chip.textContent=k.ch;chip.dataset.pair=k.pair;
    enableDrag(chip,chosen);cL.appendChild(chip);
  });
  right.forEach(k=>{
    const dz=document.createElement("div");dz.className="dropzone";dz.textContent=k.rm;dz.dataset.pair=k.pair;cR.appendChild(dz);
  });
  mw.appendChild(cL);mw.appendChild(cR);area.appendChild(mw);
  let matched=0;
  answeredLock=false;

  function enableDrag(chip,chosen){
    chip.addEventListener("pointerdown",e=>{
      if(chip.classList.contains("matched"))return;e.preventDefault();
      const ghost=document.createElement("div");ghost.className="drag-ghost";ghost.textContent=chip.textContent;
      document.body.appendChild(ghost);mg(e);
      function mg(ev){ghost.style.left=(ev.clientX-25)+"px";ghost.style.top=(ev.clientY-25)+"px";}
      function mv(ev){mg(ev);document.querySelectorAll(".dropzone").forEach(z=>z.classList.remove("hover"));
        const el=document.elementFromPoint(ev.clientX,ev.clientY);const dz=el&&el.closest(".dropzone");
        if(dz&&!dz.classList.contains("matched"))dz.classList.add("hover");}
      function up(ev){
        document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);ghost.remove();
        const el=document.elementFromPoint(ev.clientX,ev.clientY);const dz=el&&el.closest(".dropzone");
        document.querySelectorAll(".dropzone").forEach(z=>z.classList.remove("hover"));
        if(dz&&!dz.classList.contains("matched")){
          const ok=dz.dataset.pair===chip.dataset.pair;
          if(ok){
            chip.classList.add("matched");
            dz.classList.add("matched");
            matched++;
            speak(chip.textContent);
            if(matched===chosen.length){
              activeSession.score+=20; /* +10 added by finishQ = +30 total */
              const fb=document.getElementById("qFb");
              fb.textContent="All matched! 🎉";
              fb.className="feedback good";
              finishQ(true,{ch:chip.textContent});
            } else {
              recordResult(chip.textContent,true);
            }
          } else {
            /* Wrong drag — visual feedback only, don't penalize stats or progress.
               Confusion pairs are still tracked so distractors work in other stages. */
            recordConfuse(chip.textContent,dz.textContent);
            dz.style.background="var(--bad-bg)";
            setTimeout(()=>{if(!dz.classList.contains("matched"))dz.style.background="";},400);
          }
        }
      }
      document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);
    });
  }
}
