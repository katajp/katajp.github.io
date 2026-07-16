// Core quiz engine: renders the active quiz UI and dispatches each
// question to the right stage renderer (js/stages/*.js).

function renderQuizUI(){
  const el=document.getElementById("quizActive");
  el.innerHTML="";

  const s=activeSession;
  const stg=STAGES[Math.min(s.stageIdx,STAGES.length-1)];
  const totalQ=getKanaTotalQ(s.charCount);
  const globalQ=getKanaGlobalQ(s.stageIdx,s.questionIdx,s.charCount);
  const globalPct=Math.round(globalQ/totalQ*100);
  const currentStageTotal=getKanaStageQCount(s.stageIdx,s.charCount);

  // Top bar
  const top=document.createElement("div");top.className="card";
  top.innerHTML=`
    <div class="qa-top">
      <div class="qa-stage">${stg.name} — ${stg.desc}</div>
      <button class="qa-exit" id="exitBtn">✕ Exit</button>
    </div>
    <div class="qa-progress">
      <div class="qa-plabel"><span>Stage ${s.stageIdx+1}/${STAGES.length} — Question ${s.questionIdx}/${currentStageTotal}</span><span>${globalPct}%</span></div>
      <div class="qa-bar-out"><div class="qa-bar-in" style="width:${globalPct}%"></div></div>
    </div>
    <div class="qa-toast" id="qToast"></div>
    <div class="qa-score">
      <span>Score: <b id="qScore">${s.score}</b></span>
      <span>Streak: <b id="qStreak">${s.streak}</b></span>
    </div>`;
  el.appendChild(top);
  top.querySelector("#exitBtn").onclick=exitQuiz;

  // Stage navigator (compact "< Stage N >" indicator)
  const stageCard=document.createElement("div");stageCard.className="card";
  // Return to current stage button (shown when replaying a completed stage)
  if(savedRealStageIdx>=0 && s.stageIdx!==savedRealStageIdx){
    const retBtn=document.createElement("button");retBtn.className="btn";retBtn.style.cssText="margin-bottom:12px;background:var(--accent);";
    retBtn.textContent="↩ Return to current stage (Stage "+(savedRealStageIdx+1)+": "+STAGES[savedRealStageIdx].name+")";
    retBtn.onclick=()=>{
      s.stageIdx=savedRealStageIdx;s.questionIdx=savedRealQuestionIdx;savedRealStageIdx=-1;savedRealQuestionIdx=0;
      saveSessions();renderQuizUI();newQuizQuestion();
    };
    stageCard.appendChild(retBtn);
  }
  const viewIdx=Math.min(s.stageIdx,STAGES.length-1);
  const maxIdx=Math.min(savedRealStageIdx>=0?savedRealStageIdx:s.stageIdx,STAGES.length-1);
  const viewStage=STAGES[viewIdx];
  const allComplete=s.stageIdx>=STAGES.length&&savedRealStageIdx<0;
  const isRealCurrent=!allComplete&&savedRealStageIdx<0&&viewIdx===maxIdx;
  const done=s.stagesCompleted.includes(viewStage.id);
  let statusText,statusClass;
  if(allComplete){statusText="Completed";statusClass="done";}
  else if(isRealCurrent){statusText="In progress";statusClass="current";}
  else if(done){statusText="Replaying";statusClass="done";}
  else{statusText="Completed";statusClass="done";}
  const navigateStage=delta=>{
    const target=viewIdx+delta;
    if(target<0||target>maxIdx)return;
    if(target===maxIdx&&savedRealStageIdx>=0){
      s.stageIdx=savedRealStageIdx;s.questionIdx=savedRealQuestionIdx;savedRealStageIdx=-1;savedRealQuestionIdx=0;
    } else {
      if(savedRealStageIdx<0){savedRealStageIdx=Math.min(s.stageIdx,STAGES.length-1);savedRealQuestionIdx=s.questionIdx;}
      s.stageIdx=target;s.questionIdx=0;
    }
    saveSessions();renderQuizUI();newQuizQuestion();
  };
  const stageNav=document.createElement("div");stageNav.className="stage-nav";
  stageNav.innerHTML=`
    <button class="stage-nav-arrow" id="stagePrevBtn" ${viewIdx<=0?"disabled":""}>‹</button>
    <div class="stage-nav-info">
      <div class="stage-nav-num">Stage ${viewIdx+1}/${STAGES.length}</div>
      <div class="stage-nav-name">${viewStage.name} <span class="stage-nav-status ${statusClass}">${statusText}</span></div>
    </div>
    <button class="stage-nav-arrow" id="stageNextBtn" ${viewIdx>=maxIdx?"disabled":""}>›</button>`;
  stageNav.querySelector("#stagePrevBtn").onclick=()=>navigateStage(-1);
  stageNav.querySelector("#stageNextBtn").onclick=()=>navigateStage(1);
  stageCard.appendChild(stageNav);
  el.appendChild(stageCard);

  // Quiz area
  const qa=document.createElement("div");qa.className="card";
  qa.innerHTML='<div class="qa-area" id="qaArea"></div>';
  el.appendChild(qa);

  // Start question
  if(s.stageIdx<STAGES.length){
    newQuizQuestion();
  } else {
    // All complete
    document.getElementById("qaArea").innerHTML=`
      <div style="text-align:center;padding:30px 0;">
        <div style="font-size:48px;margin-bottom:12px;">🎉</div>
        <div style="font-size:20px;font-weight:800;margin-bottom:8px;">All Stages Complete!</div>
        <div style="color:var(--ink2);margin-bottom:16px;">Score: ${s.score} • You can redo any stage above.</div>
        <button class="start-btn" id="restartLevelBtn">🔄 Restart This Level</button>
      </div>`;
    const rlb=document.getElementById("restartLevelBtn");
    if(rlb)rlb.onclick=restartCurrentLevel;
  }
}


function newQuizQuestion(){
  clearInterval(timerHandle);
  const s=activeSession;
  if(s.stageIdx>=STAGES.length){renderQuizUI();return;}
  const stage=STAGES[s.stageIdx];
  const pool=activePool;
  const area=document.getElementById("qaArea");
  area.innerHTML="";
  answeredLock=false;

  if(stage.id==="intro"){
    const correct=pool[s.questionIdx % pool.length];
    
    // Generate 4 options
    const optPool=pool.length>=4?pool:ALL_KANA;
    let opts=[correct];
    while(opts.length<4){
      const c=optPool[Math.floor(Math.random()*optPool.length)];
      if(!opts.some(o=>o.rm===c.rm))opts.push(c);
    }
    shuffleArr(opts);

    const d=document.createElement("div");d.className="q-char";d.textContent=correct.ch;
    area.appendChild(d);
    
    const info=document.createElement("div");info.style.cssText="font-size:13px;color:var(--ink3);text-align:center;margin-bottom:12px;";
    info.textContent="Learn this character, then click the highlighted answer to continue:";
    area.appendChild(info);

    const w=document.createElement("div");w.className="q-grid";
    opts.forEach(opt=>{
      const b=document.createElement("div");b.className="q-opt";
      b.textContent=opt.rm;
      if(opt.rm===correct.rm){
        b.classList.add("correct");
        b.onclick=()=>{
          if(answeredLock)return;answeredLock=true;
          finishQ(true,correct);
        };
      } else {
        b.style.opacity="0.5";
      }
      w.appendChild(b);
    });
    area.appendChild(w);
    speak(correct.ch);
    return;
  }

  // Mixed Test stage selection
  if(stage.id==="test"){
    const formats=["mc", "rev", "type", "listen", "match", "write"];
    const randomFormat=coverageValuePick(formats,coverageState(s,"test-formats"));

    if(randomFormat==="match"){ renderMatchQ(pool); return; }
    if(randomFormat==="write"){ renderWriteQ(pool); return; }

    const correct=weightedPick(pool,coverageState(s,"test-prompts"));
    const optPool=pool.length>=4?pool:ALL_KANA;
    let opts=[correct];

    const confused=Object.entries(confusion[correct.ch]||{}).sort((a,b)=>b[1]-a[1]).map(([ch])=>ch);
    confused.forEach(ch=>{if(opts.length>=4)return;const f=optPool.find(o=>o.ch===ch);if(f&&!opts.some(o=>o.ch===f.ch))opts.push(f);});
    while(opts.length<4){const c=optPool[Math.floor(Math.random()*optPool.length)];const key=randomFormat==="rev"?c.ch:c.rm;if(!opts.some(o=>(randomFormat==="rev"?o.ch:o.rm)===key))opts.push(c);}
    shuffleArr(opts);

    const fb=document.createElement("div");fb.className="feedback";fb.id="qFb";

    if(randomFormat==="mc"){
      renderReadStage(area,correct,opts);
    } else if(randomFormat==="rev"){
      renderRecallStage(area,correct,opts);
    } else if(randomFormat==="type"){
      renderTypingStage(area,fb,correct);
    } else if(randomFormat==="listen"){
      renderListeningStage(area,correct,opts);
    }
    area.appendChild(fb);
    answeredLock=false;
    return;
  }

  // Individual stages 1-6
  if(stage.id==="match"){renderMatchQ(pool);return;}
  if(stage.id==="write"){renderWriteQ(pool);return;}

  const correct=weightedPick(pool,coverageState(s,stage.id+"-prompts"));
  const optPool=pool.length>=4?pool:ALL_KANA;
  let opts=[correct];

  const confused=Object.entries(confusion[correct.ch]||{}).sort((a,b)=>b[1]-a[1]).map(([ch])=>ch);
  confused.forEach(ch=>{if(opts.length>=4)return;const f=optPool.find(o=>o.ch===ch);if(f&&!opts.some(o=>o.ch===f.ch))opts.push(f);});
  while(opts.length<4){const c=optPool[Math.floor(Math.random()*optPool.length)];const key=stage.id==="rev"?c.ch:c.rm;if(!opts.some(o=>(stage.id==="rev"?o.ch:o.rm)===key))opts.push(c);}
  shuffleArr(opts);

  const fb=document.createElement("div");fb.className="feedback";fb.id="qFb";

  if(stage.id==="mc"){
    renderReadStage(area,correct,opts);
  } else if(stage.id==="rev"){
    renderRecallStage(area,correct,opts);
  } else if(stage.id==="type"){
    renderTypingStage(area,fb,correct);
  } else if(stage.id==="listen"){
    renderListeningStage(area,correct,opts);
  }
  area.appendChild(fb);
  answeredLock=false;
}

function buildOpts(opts,keyFn,correct,stageId){
  const w=document.createElement("div");w.className="q-grid";
  opts.forEach(o=>{
    const b=document.createElement("div");b.className="q-opt";b.textContent=keyFn(o);
    if(stageId==="rev"||stageId==="listen")b.style.fontFamily="var(--font-jp)";
    b.onclick=()=>{
      if(answeredLock)return;answeredLock=true;
      const ok=keyFn(o)===keyFn(correct);
      b.classList.add(ok?"correct":"wrong");
      const fb=document.getElementById("qFb");
      if(ok){
        // Correct: speak the character
        fb.textContent="Correct! 🎉";fb.className="feedback good";
        speak(correct.ch);
      } else {
        // Wrong: highlight correct, show what it should be, speak correct
        recordConfuse(correct.ch,o.ch);
        const t=[...w.children].find(c=>c.textContent===keyFn(correct));
        if(t)t.classList.add("correct");
        fb.innerHTML=`Wrong! <span style="font-family:var(--font-jp)">${correct.ch}</span> = <b>${correct.rm}</b>`;
        fb.className="feedback bad";
        // Speak the correct answer so user hears the right pronunciation
        setTimeout(()=>speak(correct.ch),300);
      }
      finishQ(ok,correct);
    };
    w.appendChild(b);
  });
  return w;
}

function finishQ(ok,correct){
  clearInterval(timerHandle);
  recordResult(correct.ch,ok);
  const s=activeSession;
  if(ok){
    s.questionIdx++;
    s.streak++;
    s.score+=10;
    const stageTotalQ=getKanaStageQCount(s.stageIdx,s.charCount);
    if(s.questionIdx>=stageTotalQ){
      // Stage complete
      if(!s.stagesCompleted.includes(STAGES[s.stageIdx].id))s.stagesCompleted.push(STAGES[s.stageIdx].id);
      const finished=STAGES[s.stageIdx].name;
      s.stageIdx++;s.questionIdx=0;
      saveSessions();
      // Toast
      const toast=document.getElementById("qToast");
      if(toast){
        toast.style.display="block";
        if(s.stageIdx<STAGES.length)
          toast.textContent=`"${finished}" complete! → "${STAGES[s.stageIdx].name}"`;
        else
          toast.textContent=`"${finished}" complete! All stages done! 🎉`;
        setTimeout(()=>{toast.style.display="none";},2200);
      }
      updateQuizProgress();
      if(s.stageIdx>=STAGES.length){
        setTimeout(()=>renderQuizUI(),1500);
        return;
      }
    }
  } else {
    s.streak=0;
    // Wrong → reduce progress by 1
    s.questionIdx=Math.max(0,s.questionIdx-1);
  }
  saveSessions();
  updateQuizProgress();
  setTimeout(newQuizQuestion,ok?800:1200);
}
