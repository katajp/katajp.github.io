/* ================================================================
   VOCABULARY PRACTICE — full setup + session + question engine for
   the "📚 Vocab" tab. Mirrors the kana quiz engine (js/quiz/*.js) but
   works over words from js/data/vocabulary.js instead of characters,
   and can optionally enrich a question with a live example sentence
   from the Jotoba API (js/api/dictionary.js, js/api/vocabulary.js).
   ================================================================ */

let setupSelJlpt=new Set(["N5"]);
let setupSelCategories=new Set();
let setupIncludeOnlineExtra=true;
let vocabPoolLoading=false;

let activeVocabSession=null;
let activeVocabSessionIdx=-1;
let activeVocabPool=[];
let vocabAnsweredLock=false;
let savedVocabRealStageIdx=-1;
let savedVocabRealQuestionIdx=0;

/* ---------------- Setup screen ---------------- */
function renderVocabSetup(){
  const el=document.getElementById("vocabSetup");
  el.style.display="";
  document.getElementById("vocabActive").style.display="none";
  el.innerHTML="";

  // Review mistakes card
  const weak=getWeakVocab();
  if(weak.length){
    const rc=document.createElement("div");rc.className="card";
    rc.innerHTML=`
      <div class="card-title"><span class="ico">🔁</span> Review Mistakes</div>
      <div style="color:var(--ink2);font-size:13px;margin-bottom:12px;">${weak.length} word(s) you've gotten wrong before.</div>
      <div class="start-area" style="margin-top:0;">
        <button class="start-btn" id="vocabReviewBtn" style="background:linear-gradient(135deg,var(--kata),var(--accent));">🔁 Review Now</button>
      </div>`;
    rc.querySelector("#vocabReviewBtn").onclick=startVocabReviewSession;
    el.appendChild(rc);
  }

  // Saved sessions
  if(vocabSessions.length){
    const sc=document.createElement("div");sc.className="card";
    sc.innerHTML='<div class="card-title"><span class="ico">📁</span> Saved Vocab Sessions</div>';
    vocabSessions.forEach((sess,idx)=>{
      const totalQ=getVocabTotalQ(sess.wordCount);
      const answered=getVocabGlobalQ(sess.stageIdx,sess.questionIdx,sess.wordCount);
      const pct=Math.round(answered/totalQ*100);
      const completed=sess.stageIdx>=VOCAB_STAGES.length;
      const div=document.createElement("div");div.className="saved-card";
      div.innerHTML=`
        <div class="saved-info">
          <div class="saved-title">${sess.label||("Session "+(idx+1))}</div>
          <div class="saved-detail">${sess.wordCount} words • ${completed?"Completed":("Stage "+(sess.stageIdx+1)+"/"+VOCAB_STAGES.length+" — "+VOCAB_STAGES[Math.min(sess.stageIdx,VOCAB_STAGES.length-1)].name)}</div>
        </div>
        <div class="saved-progress">
          <div class="saved-pbar"><div class="saved-pbar-fill" style="width:${completed?100:pct}%"></div></div>
          <div class="saved-pct">${completed?100:pct}%</div>
        </div>
        <div class="saved-actions"></div>`;
      const acts=div.querySelector(".saved-actions");
      if(!completed){
        const rb=document.createElement("button");rb.className="resume-btn";rb.textContent="▶ Resume";
        rb.onclick=()=>startFromVocabSession(idx);acts.appendChild(rb);
      } else {
        const rb=document.createElement("button");rb.className="resume-btn";rb.textContent="🔄 Redo";
        rb.onclick=()=>{sess.stageIdx=0;sess.questionIdx=0;sess.score=0;sess.streak=0;
          sess.stagesCompleted=[];saveVocabSessions();startFromVocabSession(idx);};
        acts.appendChild(rb);
      }
      const db=document.createElement("button");db.className="delete-btn";db.textContent="✕";
      db.onclick=()=>{vocabSessions.splice(idx,1);saveVocabSessions();renderVocabSetup();};
      acts.appendChild(db);
      sc.appendChild(div);
    });
    el.appendChild(sc);
  }

  // New vocab quiz card
  const nc=document.createElement("div");nc.className="card";
  nc.innerHTML='<div class="card-title"><span class="ico">📚</span> New Vocabulary Quiz</div>';

  // JLPT level chips
  const jlptWrap=document.createElement("div");jlptWrap.className="qs-section";
  jlptWrap.innerHTML='<div class="qs-section-title"><span class="dot h"></span> JLPT Level</div>';
  const jlptRows=document.createElement("div");jlptRows.className="qs-rows";
  JLPT_LEVELS.forEach(lv=>{
    const chip=document.createElement("label");chip.className="qs-chip"+(setupSelJlpt.has(lv.id)?" sel":"");
    const chk=document.createElement("input");chk.type="checkbox";chk.checked=setupSelJlpt.has(lv.id);
    chk.onchange=()=>{if(chk.checked)setupSelJlpt.add(lv.id);else setupSelJlpt.delete(lv.id);chip.classList.toggle("sel",chk.checked);updateVocabSetupInfo();};
    const ico=document.createElement("div");ico.className="check-ico";ico.textContent="✓";
    const label=document.createElement("span");label.className="qs-chars";label.textContent=lv.label;
    chip.appendChild(chk);chip.appendChild(ico);chip.appendChild(label);
    jlptRows.appendChild(chip);
  });
  jlptWrap.appendChild(jlptRows);nc.appendChild(jlptWrap);

  // Category chips
  const catWrap=document.createElement("div");catWrap.className="qs-section";
  catWrap.innerHTML='<div class="qs-section-title"><span class="dot k"></span> Categories (leave all unchecked for every category)</div>';
  const catRows=document.createElement("div");catRows.className="qs-rows";
  VOCAB_CATEGORIES.forEach(cat=>{
    const chip=document.createElement("label");chip.className="qs-chip"+(setupSelCategories.has(cat.id)?" sel kata-chip":"");
    const chk=document.createElement("input");chk.type="checkbox";chk.checked=setupSelCategories.has(cat.id);
    chk.onchange=()=>{if(chk.checked)setupSelCategories.add(cat.id);else setupSelCategories.delete(cat.id);chip.classList.toggle("sel",chk.checked);chip.classList.toggle("kata-chip",chk.checked);updateVocabSetupInfo();};
    const ico=document.createElement("div");ico.className="check-ico";ico.textContent="✓";
    const label=document.createElement("span");label.className="qs-chars";label.textContent=cat.icon+" "+cat.label;
    chip.appendChild(chk);chip.appendChild(ico);chip.appendChild(label);
    catRows.appendChild(chip);
  });
  catWrap.appendChild(catRows);nc.appendChild(catWrap);

  // Online extra words toggle — supplements the curated local list
  // (thinnest at N3/N2/N1) with words fetched from a public JLPT word
  // API. Off by default: fully optional, and the app works offline
  // either way.
  const onlineWrap=document.createElement("div");onlineWrap.className="qs-section";
  const onlineChip=document.createElement("label");onlineChip.className="qs-chip"+(setupIncludeOnlineExtra?" sel kata-chip":"");
  const onlineChk=document.createElement("input");onlineChk.type="checkbox";onlineChk.checked=setupIncludeOnlineExtra;
  onlineChk.onchange=()=>{setupIncludeOnlineExtra=onlineChk.checked;onlineChip.classList.toggle("sel",onlineChk.checked);onlineChip.classList.toggle("kata-chip",onlineChk.checked);updateVocabSetupInfo();};
  const onlineIco=document.createElement("div");onlineIco.className="check-ico";onlineIco.textContent="✓";
  const onlineLabel=document.createElement("span");onlineLabel.className="qs-chars";onlineLabel.textContent="🌐 Also load extra words online for the selected level(s)";
  onlineChip.appendChild(onlineChk);onlineChip.appendChild(onlineIco);onlineChip.appendChild(onlineLabel);
  onlineWrap.appendChild(onlineChip);
  const onlineNote=document.createElement("div");onlineNote.style.cssText="font-size:11px;color:var(--ink3);margin-top:4px;";
  onlineNote.textContent="Pulls more N-level words from a public dictionary API (no Thai translation, cached locally after first load). Skipped automatically if you're offline.";
  onlineWrap.appendChild(onlineNote);
  nc.appendChild(onlineWrap);

  const info=document.createElement("div");info.className="start-info";info.id="vocabSetupInfo";
  nc.appendChild(info);

  const sa=document.createElement("div");sa.className="start-area";
  const sb=document.createElement("button");sb.className="start-btn";sb.id="vocabStartBtn";sb.textContent="🚀 Start Vocab Quiz";
  sb.onclick=startNewVocabQuiz;
  sa.appendChild(sb);nc.appendChild(sa);

  el.appendChild(nc);
  updateVocabSetupInfo();
}

function updateVocabSetupInfo(){
  const el=document.getElementById("vocabSetupInfo");
  if(!el)return;
  const pool=filterVocabulary(setupSelJlpt,setupSelCategories);
  const extraNote=setupIncludeOnlineExtra?" (+ more once loaded)":"";
  el.textContent=pool.length?`${pool.length} words selected${extraNote}`:"No words match this filter.";
  const btn=document.getElementById("vocabStartBtn");
  if(btn)btn.disabled=pool.length===0&&!setupIncludeOnlineExtra;
}

/* ---------------- Session lifecycle ---------------- */
async function startNewVocabQuiz(){
  if(vocabPoolLoading)return;
  let pool=filterVocabulary(setupSelJlpt,setupSelCategories);

  if(setupIncludeOnlineExtra){
    vocabPoolLoading=true;
    const btn=document.getElementById("vocabStartBtn");
    if(btn){btn.disabled=true;btn.textContent="⏳ Loading extra words…";}
    const levels=setupSelJlpt.size?[...setupSelJlpt]:JLPT_LEVELS.map(l=>l.id);
    const extra=await fetchJlptExtraWords(levels);
    // Category filter still applies: only fold in "extra" words when
    // the user hasn't restricted to specific categories, or has
    // explicitly included the "extra" category.
    if(!setupSelCategories.size||setupSelCategories.has("extra")){
      pool=pool.concat(extra);
    }
    vocabPoolLoading=false;
    if(btn){btn.disabled=pool.length===0;btn.textContent="🚀 Start Vocab Quiz";}
  }

  if(!pool.length)return;
  const parts=[];
  if(setupSelJlpt.size)parts.push([...setupSelJlpt].join("/"));
  if(setupSelCategories.size)parts.push([...setupSelCategories].join(", "));
  const label=(parts.join(" — ")||"All words")+" — "+pool.length+" words";

  const sess={
    label,selJlpt:[...setupSelJlpt],selCategories:[...setupSelCategories],
    wordCount:pool.length,stageIdx:0,questionIdx:0,score:0,streak:0,
    stagesCompleted:[],created:Date.now(),
    extraWords:setupIncludeOnlineExtra?pool.filter(w=>w.source==="jlptvocab"):undefined
  };
  vocabSessions.push(sess);saveVocabSessions();
  activeVocabSessionIdx=vocabSessions.length-1;activeVocabSession=sess;activeVocabPool=pool;
  enterVocabQuiz();
}

function startFromVocabSession(idx){
  const sess=vocabSessions[idx];
  activeVocabSessionIdx=idx;activeVocabSession=sess;
  if(sess.isReview){
    activeVocabPool=VOCABULARY.filter(w=>sess.reviewWords.includes(w.word));
    const foundWords=new Set(activeVocabPool.map(w=>w.word));
    sess.reviewWords.forEach(w=>{if(!foundWords.has(w)&&EXTRA_WORDS_INDEX[w])activeVocabPool.push(EXTRA_WORDS_INDEX[w]);});
    if(!activeVocabPool.length)activeVocabPool=VOCABULARY;
  } else {
    activeVocabPool=filterVocabulary(new Set(sess.selJlpt),new Set(sess.selCategories));
    if(sess.extraWords&&sess.extraWords.length)activeVocabPool=activeVocabPool.concat(sess.extraWords);
    if(!activeVocabPool.length)activeVocabPool=VOCABULARY;
  }
  enterVocabQuiz();
}

function enterVocabQuiz(){
  document.getElementById("vocabSetup").style.display="none";
  document.getElementById("vocabActive").style.display="";
  renderVocabQuizUI();
}

function restartCurrentVocabLevel(){
  const s=activeVocabSession;if(!s)return;
  s.stageIdx=0;s.questionIdx=0;s.score=0;s.streak=0;s.stagesCompleted=[];
  saveVocabSessions();renderVocabQuizUI();
}

function exitVocabQuiz(){
  activeVocabSession=null;activeVocabSessionIdx=-1;
  document.getElementById("vocabActive").style.display="none";
  renderVocabSetup();
}

function getWeakVocab(){
  const weakSet=new Set(Object.keys(vocabConfusion));
  Object.entries(vocabStats).forEach(([w,st])=>{if(st.seen>=2&&st.correct/st.seen<0.8)weakSet.add(w);});
  const local=VOCABULARY.filter(v=>weakSet.has(v.word));
  const foundWords=new Set(local.map(v=>v.word));
  const extra=[...weakSet]
    .filter(w=>!foundWords.has(w)&&EXTRA_WORDS_INDEX[w])
    .map(w=>EXTRA_WORDS_INDEX[w]);
  return local.concat(extra);
}
function startVocabReviewSession(){
  const pool=getWeakVocab();
  if(!pool.length){alert("No vocabulary mistakes to review yet — nice work!");return;}
  const sess={
    label:"🔁 Review Mistakes — "+pool.length+" words",
    isReview:true,reviewWords:pool.map(w=>w.word),wordCount:pool.length,
    stageIdx:0,questionIdx:0,score:0,streak:0,stagesCompleted:[],created:Date.now()
  };
  vocabSessions.push(sess);saveVocabSessions();
  activeVocabSessionIdx=vocabSessions.length-1;activeVocabSession=sess;activeVocabPool=pool;
  enterVocabQuiz();
}

/* ---------------- Quiz UI ---------------- */
function renderVocabQuizUI(){
  const el=document.getElementById("vocabActive");
  el.innerHTML="";
  const s=activeVocabSession;
  const stg=VOCAB_STAGES[Math.min(s.stageIdx,VOCAB_STAGES.length-1)];
  const totalQ=getVocabTotalQ(s.wordCount);
  const globalQ=getVocabGlobalQ(s.stageIdx,s.questionIdx,s.wordCount);
  const globalPct=Math.round(globalQ/totalQ*100);
  const currentStageTotal=getVocabStageQCount(s.stageIdx,s.wordCount);

  const top=document.createElement("div");top.className="card";
  top.innerHTML=`
    <div class="qa-top">
      <div class="qa-stage">${stg.name} — ${stg.desc}</div>
      <button class="qa-exit" id="vocabExitBtn">✕ Exit</button>
    </div>
    <div class="qa-progress">
      <div class="qa-plabel"><span>Stage ${s.stageIdx+1}/${VOCAB_STAGES.length} — Question ${s.questionIdx}/${currentStageTotal}</span><span>${globalPct}%</span></div>
      <div class="qa-bar-out"><div class="qa-bar-in" style="width:${globalPct}%"></div></div>
    </div>
    <div class="qa-toast" id="vocabToast"></div>
    <div class="qa-score"><span>Score: <b id="vqScore">${s.score}</b></span><span>Streak: <b id="vqStreak">${s.streak}</b></span></div>`;
  el.appendChild(top);
  top.querySelector("#vocabExitBtn").onclick=exitVocabQuiz;

  // Stage list
  const stageCard=document.createElement("div");stageCard.className="card";
  if(savedVocabRealStageIdx>=0 && s.stageIdx!==savedVocabRealStageIdx){
    const retBtn=document.createElement("button");retBtn.className="btn";retBtn.style.cssText="margin-bottom:12px;background:var(--accent);";
    retBtn.textContent="↩ Return to current stage (Stage "+(savedVocabRealStageIdx+1)+": "+VOCAB_STAGES[savedVocabRealStageIdx].name+")";
    retBtn.onclick=()=>{
      s.stageIdx=savedVocabRealStageIdx;s.questionIdx=savedVocabRealQuestionIdx;savedVocabRealStageIdx=-1;savedVocabRealQuestionIdx=0;
      saveVocabSessions();renderVocabQuizUI();newVocabQuestion();
    };
    stageCard.appendChild(retBtn);
  }
  const stageList=document.createElement("div");stageList.className="stage-list";
  VOCAB_STAGES.forEach((st,i)=>{
    const item=document.createElement("div");item.className="stage-item";
    const done=s.stagesCompleted.includes(st.id);
    const isRealCurrent=(savedVocabRealStageIdx>=0)?i===savedVocabRealStageIdx:i===s.stageIdx;
    const isViewing=i===s.stageIdx;
    let numClass=done?"done":(isRealCurrent||isViewing?"current":"");
    const statusText=done?(isViewing?"Replaying":"Completed"):(isRealCurrent||isViewing?"In progress":"Locked");
    item.innerHTML=`
      <div class="s-num ${numClass}">${done?"✓":(i+1)}</div>
      <div class="s-name">${st.name} <span style="color:var(--ink3);font-weight:500;font-size:12px;">${st.desc}</span></div>
      <div class="s-status ${done?"done":""}">${statusText}</div>`;
    if(done && i!==s.stageIdx){
      item.classList.add("clickable");
      item.onclick=()=>{
        if(savedVocabRealStageIdx<0){ savedVocabRealStageIdx=s.stageIdx; savedVocabRealQuestionIdx=s.questionIdx; }
        s.stageIdx=i;s.questionIdx=0;saveVocabSessions();renderVocabQuizUI();newVocabQuestion();
      };
    }
    stageList.appendChild(item);
  });
  stageCard.appendChild(stageList);
  el.appendChild(stageCard);

  const qa=document.createElement("div");qa.className="card";
  qa.innerHTML='<div class="qa-area" id="vqaArea"></div>';
  el.appendChild(qa);

  if(s.stageIdx<VOCAB_STAGES.length){
    newVocabQuestion();
  } else {
    document.getElementById("vqaArea").innerHTML=`
      <div style="text-align:center;padding:30px 0;">
        <div style="font-size:48px;margin-bottom:12px;">🎉</div>
        <div style="font-size:20px;font-weight:800;margin-bottom:8px;">All Vocab Stages Complete!</div>
        <div style="color:var(--ink2);margin-bottom:16px;">Score: ${s.score}</div>
        <button class="start-btn" id="vocabRestartBtn">🔄 Restart This Level</button>
      </div>`;
    document.getElementById("vocabRestartBtn").onclick=restartCurrentVocabLevel;
  }
}

function updateVocabQuizProgress(){
  const s=activeVocabSession;
  const stg=VOCAB_STAGES[Math.min(s.stageIdx,VOCAB_STAGES.length-1)];
  const totalQ=getVocabTotalQ(s.wordCount);
  const globalQ=getVocabGlobalQ(s.stageIdx,s.questionIdx,s.wordCount);
  const globalPct=Math.round(globalQ/totalQ*100);
  const currentStageTotal=getVocabStageQCount(s.stageIdx,s.wordCount);
  const plabel=document.querySelector("#vocabActive .qa-plabel");
  if(plabel)plabel.innerHTML=`<span>Stage ${s.stageIdx+1}/${VOCAB_STAGES.length} — Question ${s.questionIdx}/${currentStageTotal}</span><span>${globalPct}%</span>`;
  const bar=document.querySelector("#vocabActive .qa-bar-in");
  if(bar)bar.style.width=globalPct+"%";
  const stageEl=document.querySelector("#vocabActive .qa-stage");
  if(stageEl)stageEl.textContent=stg.name+" — "+stg.desc;
  document.getElementById("vqScore").textContent=s.score;
  document.getElementById("vqStreak").textContent=s.streak;
}

/* ---------------- Question logic ---------------- */
function weightedPickVocab(pool){
  const weightOfWord=w=>{
    const st=vocabStats[w.word];
    let wt;
    if(!st||st.seen===0)wt=3;
    else{const acc=st.correct/st.seen;wt=(acc>=.9&&st.seen>=4)?.4:(1-acc)*4+.6;}
    const cm=vocabConfusion[w.word];
    if(cm)wt+=Object.values(cm).reduce((a,b)=>a+b,0)*.8;
    return wt;
  };
  const ws=pool.map(weightOfWord);const tot=ws.reduce((a,b)=>a+b,0);
  let r=Math.random()*tot;
  for(let i=0;i<pool.length;i++){r-=ws[i];if(r<=0)return pool[i];}
  return pool[pool.length-1];
}

function newVocabQuestion(){
  const s=activeVocabSession;
  if(s.stageIdx>=VOCAB_STAGES.length){renderVocabQuizUI();return;}
  const stage=VOCAB_STAGES[s.stageIdx];
  const pool=activeVocabPool;

  let correct;
  if(stage.id==="vintro"){
    correct=pool[s.questionIdx % pool.length];
  } else {
    correct=weightedPickVocab(pool);
  }

  const area=document.getElementById("vqaArea");
  area.innerHTML="";

  if(stage.id==="vstudy"){
    renderVocabStudyStage(area,correct);
    vocabAnsweredLock=false;
    
    // Background enrichment for Study stage
    enrichWord(correct).then(info=>{
      if(info&&info.example&&info.example.jp){
        const ex=document.createElement("div");
        ex.style.cssText="font-size:12px;color:var(--ink3);text-align:center;max-width:320px;margin-top:12px;border-top:1px dashed var(--border);padding-top:12px;width:100%;";
        const jpDiv=document.createElement("div");
        jpDiv.style.fontFamily="var(--font-jp)";
        jpDiv.textContent=info.example.jp;
        ex.appendChild(jpDiv);
        if(info.example.en){
          const enDiv=document.createElement("div");
          enDiv.textContent=info.example.en;
          ex.appendChild(enDiv);
        }
        const card = area.querySelector(".study-card");
        if(card) card.appendChild(ex);
        else area.appendChild(ex);
      }
    });
    return;
  }

  // Mixed Vocab Test Stage
  if(stage.id==="vtest"){
    const formats=["vread", "vrecall", "vtype", "vlisten", "vmatch", "vwrite"];
    const randomFormat = formats[Math.floor(Math.random()*formats.length)];

    if(randomFormat==="vmatch"){ renderVocabMatchQ(pool); return; }
    if(randomFormat==="vwrite"){ renderVocabWriteQ(pool); return; }

    const optPool=pool.length>=4?pool:VOCABULARY;
    let opts=[correct];
    while(opts.length<4){
      const c=optPool[Math.floor(Math.random()*optPool.length)];
      const key=randomFormat==="vrecall"?c.word:c.meaning;
      if(!opts.some(o=>(randomFormat==="vrecall"?o.word:o.meaning)===key))opts.push(c);
    }
    shuffleArr(opts);

    const fb=document.createElement("div");fb.className="feedback";fb.id="vqFb";

    if(randomFormat==="vread"){
      const d=document.createElement("div");d.className="q-char";d.style.fontSize="42px";d.textContent=correct.word;
      area.appendChild(d);
      area.appendChild(buildVocabOpts(opts,o=>o.meaning,correct));
    } else if(randomFormat==="vrecall"){
      const d=document.createElement("div");d.className="q-romaji";d.style.fontSize="24px";d.textContent=correct.meaning;
      area.appendChild(d);
      area.appendChild(buildVocabOpts(opts,o=>o.word,correct));
    } else if(randomFormat==="vtype"){
      renderVocabTypeQ(area,fb,correct);
    } else if(randomFormat==="vlisten"){
      const sb=document.createElement("button");sb.className="speak-btn";sb.textContent="🔊";sb.onclick=()=>speak(correct.reading);
      area.appendChild(sb);speak(correct.reading);
      area.appendChild(buildVocabOpts(opts,o=>o.word,correct));
    }
    area.appendChild(fb);
    vocabAnsweredLock=false;
    return;
  }

  // Fallback for legacy sessions
  const optPool=pool.length>=4?pool:VOCABULARY;
  let opts=[correct];
  while(opts.length<4){
    const c=optPool[Math.floor(Math.random()*optPool.length)];
    const key=stage.id==="vrecall"?c.word:c.meaning;
    if(!opts.some(o=>(stage.id==="vrecall"?o.word:o.meaning)===key))opts.push(c);
  }
  shuffleArr(opts);

  const fb=document.createElement("div");fb.className="feedback";fb.id="vqFb";

  if(stage.id==="vintro"){
    // Stage 0: Show correct answer pre-highlighted in a 4-option grid
    const optPool=pool.length>=4?pool:VOCABULARY;
    let opts=[correct];
    while(opts.length<4){
      const c=optPool[Math.floor(Math.random()*optPool.length)];
      if(!opts.some(o=>o.meaning===c.meaning))opts.push(c);
    }
    shuffleArr(opts);

    const d=document.createElement("div");d.className="q-char";d.style.fontSize="42px";d.textContent=correct.word;
    area.appendChild(d);
    
    const info=document.createElement("div");info.style.cssText="font-size:13px;color:var(--ink3);text-align:center;margin-bottom:12px;";
    info.textContent="Learn this word, then click the highlighted answer to continue:";
    area.appendChild(info);

    const w=document.createElement("div");w.className="q-grid";
    opts.forEach(opt=>{
      const b=document.createElement("div");b.className="q-opt";
      b.innerHTML=`<div style="font-size:18px;font-weight:700;">${opt.meaning}</div><div style="font-size:14px;color:var(--ink2);margin-top:4px;">${opt.reading}</div>`;
      if(opt.word===correct.word){
        b.classList.add("correct");
        b.onclick=()=>{
          if(vocabAnsweredLock)return;vocabAnsweredLock=true;
          finishVocabQ(true,correct);
        };
      } else {
        b.style.opacity="0.5";
      }
      w.appendChild(b);
    });
    area.appendChild(w);
    speak(correct.reading);
    
    // Background enrichment for Intro stage
    enrichWord(correct).then(info=>{
      if(info&&info.example&&info.example.jp){
        const ex=document.createElement("div");
        ex.style.cssText="font-size:12px;color:var(--ink3);text-align:center;max-width:320px;margin-top:12px;border-top:1px dashed var(--border);padding-top:12px;width:100%;";
        const jpDiv=document.createElement("div");
        jpDiv.style.fontFamily="var(--font-jp)";
        jpDiv.textContent=info.example.jp;
        ex.appendChild(jpDiv);
        if(info.example.en){
          const enDiv=document.createElement("div");
          enDiv.textContent=info.example.en;
          ex.appendChild(enDiv);
        }
        area.appendChild(ex);
      }
    });
  } else if(stage.id==="vread"){
    const d=document.createElement("div");d.className="q-char";d.style.fontSize="42px";d.textContent=correct.word;
    area.appendChild(d);
    area.appendChild(buildVocabOpts(opts,o=>o.meaning,correct));
  } else if(stage.id==="vrecall"){
    const d=document.createElement("div");d.className="q-romaji";d.style.fontSize="24px";d.textContent=correct.meaning;
    area.appendChild(d);
    area.appendChild(buildVocabOpts(opts,o=>o.word,correct));
  } else if(stage.id==="vlisten"){
    const sb=document.createElement("button");sb.className="speak-btn";sb.textContent="🔊";sb.onclick=()=>speak(correct.reading);
    area.appendChild(sb);speak(correct.reading);
    area.appendChild(buildVocabOpts(opts,o=>o.word,correct));
  }
  area.appendChild(fb);
  vocabAnsweredLock=false;
}

function renderVocabTypeQ(area,fb,correct){
  const q=document.createElement("div");q.className="q-char";q.style.fontSize="42px";q.textContent=correct.word;
  const input=document.createElement("input");input.className="q-input";input.placeholder="type meaning or reading...";
  input.onkeydown=e=>{
    if(e.key==="Enter"){
      if(vocabAnsweredLock)return;
      const val=input.value.trim().toLowerCase();
      const ok=val===correct.reading.toLowerCase() || val===correct.meaning.toLowerCase() || val===correct.word.toLowerCase();
      vocabAnsweredLock=true;
      input.classList.add(ok?"correct":"wrong");
      if(ok){
        fb.textContent="Correct! 🎉";fb.className="feedback good";speak(correct.reading);
      } else {
        fb.innerHTML=`Wrong! <b>${correct.word}</b> = <b>${correct.meaning}</b>`;
        fb.className="feedback bad";
        setTimeout(()=>speak(correct.reading),300);
      }
      finishVocabQ(ok,correct);
    }
  };
  area.appendChild(q);area.appendChild(input);
  setTimeout(()=>input.focus(),100);
}

function renderVocabMatchQ(pool){
  const MIN_ITEMS=2, MAX_ITEMS=5;
  let chosenSource=[...pool];
  if(chosenSource.length<MIN_ITEMS){
    const extra=shuffleArr(VOCABULARY.filter(k=>!chosenSource.some(c=>c.word===k.word)));
    while(chosenSource.length<MIN_ITEMS && extra.length)chosenSource.push(extra.pop());
  }
  const count=Math.min(chosenSource.length,MAX_ITEMS);
  const chosen=shuffleArr([...chosenSource]).slice(0,count);
  const left=shuffleArr(chosen.map((k,i)=>({...k,pair:i})));
  const right=shuffleArr(chosen.map((k,i)=>({...k,pair:i})));
  const area=document.getElementById("vqaArea");
  area.innerHTML='<div class="feedback" id="vqFb">Drag each word to its matching meaning.</div>';
  const mw=document.createElement("div");mw.className="match-area";
  const cL=document.createElement("div");cL.className="match-col";
  const cR=document.createElement("div");cR.className="match-col";
  left.forEach(k=>{
    const chip=document.createElement("div");chip.className="mchip";chip.textContent=k.word;chip.dataset.pair=k.pair;
    chip.style.fontSize="16px";
    enableVocabDrag(chip,chosen);cL.appendChild(chip);
  });
  right.forEach(k=>{
    const dz=document.createElement("div");dz.className="dropzone";dz.textContent=k.meaning;dz.dataset.pair=k.pair;
    dz.style.fontSize="14px";
    cR.appendChild(dz);
  });
  mw.appendChild(cL);mw.appendChild(cR);area.appendChild(mw);
  let matched=0;
  vocabAnsweredLock=false;

  function enableVocabDrag(chip,chosen){
    chip.addEventListener("pointerdown",e=>{
      if(chip.classList.contains("matched"))return;e.preventDefault();
      try{
        chip.setPointerCapture(e.pointerId);
      }catch(err){}
      const ghost=document.createElement("div");ghost.className="drag-ghost";ghost.textContent=chip.textContent;
      ghost.style.fontSize="16px";
      document.body.appendChild(ghost);mg(e);
      function mg(ev){ghost.style.left=(ev.clientX-25)+"px";ghost.style.top=(ev.clientY-25)+"px";}
      function mv(ev){mg(ev);document.querySelectorAll(".dropzone").forEach(z=>z.classList.remove("hover"));
        const el=document.elementFromPoint(ev.clientX,ev.clientY);const dz=el&&el.closest(".dropzone");
        if(dz&&!dz.classList.contains("matched"))dz.classList.add("hover");}
      function up(ev){
        document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);ghost.remove();
        try{
          chip.releasePointerCapture(ev.pointerId);
        }catch(err){}
        const el=document.elementFromPoint(ev.clientX,ev.clientY);const dz=el&&el.closest(".dropzone");
        document.querySelectorAll(".dropzone").forEach(z=>z.classList.remove("hover"));
        if(dz&&!dz.classList.contains("matched")){
          const ok=dz.dataset.pair===chip.dataset.pair;
          if(ok){chip.classList.add("matched");dz.classList.add("matched");matched++;
            const foundWord = chosen.find(w=>w.word===chip.textContent);
            if(foundWord) speak(foundWord.reading);
            if(matched===chosen.length){
              activeVocabSession.score+=20;
              const fb=document.getElementById("vqFb");
              fb.textContent="All matched! 🎉";
              fb.className="feedback good";
              finishVocabQ(true,foundWord);
            } else {
              recordVocabResult(chip.textContent,true);
            }
          } else {
            recordVocabConfuse(chip.textContent,dz.textContent);
            dz.style.background="var(--bad-bg)";
            setTimeout(()=>{if(!dz.classList.contains("matched"))dz.style.background="";},400);
          }
        }
      }
      document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);
    });
  }
}

function renderVocabWriteQ(pool){
  const correct=weightedPickVocab(pool);
  const word=correct.word;
  let charIdx=0;

  const area=document.getElementById("vqaArea");
  area.innerHTML="";

  // Prompt
  const prompt=document.createElement("div");prompt.className="q-romaji";prompt.textContent=correct.meaning;
  area.appendChild(prompt);

  const info=document.createElement("div");info.style.cssText="font-size:13px;color:var(--ink3);margin-bottom:8px;text-align:center;";
  info.innerHTML=`Trace the characters: <span style="font-family:var(--font-jp);font-size:18px;color:var(--ink);font-weight:700;">${word}</span>`;
  area.appendChild(info);

  // Canvas
  const bg=document.createElement("div");bg.style.cssText="width:250px;height:250px;background:var(--bg2);border-radius:var(--r-l);box-shadow:var(--shadow-l);border:1px solid var(--border);position:relative;overflow:hidden;";
  const wrap=document.createElement("div");wrap.style.cssText="position:relative;width:250px;height:250px;";
  const canvas=document.createElement("canvas");canvas.width=250;canvas.height=250;
  canvas.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;touch-action:none;border-radius:var(--r-l);z-index:4;";
  wrap.appendChild(canvas);bg.appendChild(wrap);area.appendChild(bg);

  const strokeInfo=document.createElement("div");strokeInfo.style.cssText="font-size:13px;color:var(--ink3);font-weight:600;margin-top:8px;";
  strokeInfo.textContent=t('loading');area.appendChild(strokeInfo);

  const fb=document.createElement("div");fb.className="feedback";fb.id="vqFb";
  area.appendChild(fb);
  vocabAnsweredLock=false;

  const qSize=250;
  let qStrokes=[], qStrokeIdx=0, qSamplePts=[], qDrawing=false, qUserPts=[], qAttempts=0, qDone=false;

  function qScalePoints(pts){return pts.map(p=>({x:p.x*qSize/109,y:p.y*qSize/109}));}
  function qGetPos(e){
    const r=canvas.getBoundingClientRect();
    let clientX, clientY;
    if(e.touches && e.touches.length){
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if(e.changedTouches && e.changedTouches.length){
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return{x:(clientX-r.left)*qSize/r.width,y:(clientY-r.top)*qSize/r.height};
  }

  function qDrawGrid(){
    const ctx=canvas.getContext('2d');
    ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--border').trim()||'rgba(0,0,0,0.08)';
    ctx.lineWidth=1;ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(qSize/2,0);ctx.lineTo(qSize/2,qSize);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,qSize/2);ctx.lineTo(qSize,qSize/2);ctx.stroke();
    ctx.setLineDash([]);
  }

  function qRenderGhost(){
    const old=wrap.querySelector('svg');if(old)old.remove();
    if(!qStrokes.length)return;
    const ghost=getComputedStyle(document.body).getPropertyValue('--border2').trim()||'rgba(0,0,0,0.12)';
    const accent=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#e05545';
    const done=getComputedStyle(document.body).getPropertyValue('--hira').trim()||'#2d8a6e';
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3;display:block;">`;
    qStrokes.forEach((d,i)=>{
      let c=ghost,w='3',o='0.5';
      if(i<qStrokeIdx){c=done;o='0.3';}
      else if(i===qStrokeIdx&&!qDone){c=accent;w='4';o='0.5';}
      svg+=`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
    });
    svg+=`</svg>`;wrap.insertAdjacentHTML('afterbegin',svg);
  }

  function qRedraw(){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,qSize,qSize);qDrawGrid();}

  function qDrawCompleted(d){
    const {points}=sampleSvgPath(d,60);
    const scaled=qScalePoints(points);if(!scaled.length)return;
    const ctx=canvas.getContext('2d');
    ctx.strokeStyle='#2e8ee0';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(scaled[0].x,scaled[0].y);
    for(let i=1;i<scaled.length;i++)ctx.lineTo(scaled[i].x,scaled[i].y);
    ctx.stroke();
  }

  function qPrepareStroke(){
    if(qStrokeIdx>=qStrokes.length)return;
    const {points}=sampleSvgPath(qStrokes[qStrokeIdx],50);
    qSamplePts=qScalePoints(points);
  }

  async function loadNextChar(){
    if(charIdx>=word.length){
      qDone=true;
      fb.textContent=t('correct');fb.className="feedback good";
      speak(correct.reading);
      vocabAnsweredLock=true;
      finishVocabQ(true,correct);
      return;
    }
    const ch=word[charIdx];
    strokeInfo.textContent=`Loading stroke data for: ${ch}...`;
    try {
      const {paths}=await fetchCharSvgPaths(ch);
      qStrokes=[...paths].map(p=>p.getAttribute('d'));
      qStrokeIdx=0;
      qAttempts=0;
      if(qStrokes.length){
        qPrepareStroke();
        qRenderGhost();
        strokeInfo.innerHTML=`Character ${charIdx+1}/${word.length} (<span style="font-family:var(--font-jp);font-weight:700;">${ch}</span>) — Stroke: 0/${qStrokes.length}`;
      } else {
        charIdx++;
        loadNextChar();
      }
      qRedraw();
    } catch(e) {
      charIdx++;
      loadNextChar();
    }
  }

  function qHandleDown(e) {
    if(qDone||vocabAnsweredLock)return;
    qDrawing=true;qUserPts=[];qUserPts.push(qGetPos(e));
  }
  function qHandleMove(e) {
    if(!qDrawing||qDone||vocabAnsweredLock)return;
    const p=qGetPos(e);qUserPts.push(p);
    if(qUserPts.length>1){
      const prev=qUserPts[qUserPts.length-2];
      let minD=Infinity;for(const ep of qSamplePts){const d=Math.hypot(p.x-ep.x,p.y-ep.y);if(d<minD)minD=d;}
      const ctx=canvas.getContext('2d');
      ctx.strokeStyle=minD<25?'#2e8ee0':'rgba(220,80,80,0.4)';
      ctx.lineWidth=minD<25?5:4;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
  }
  function qHandleUp(e) {
    if(!qDrawing)return;qDrawing=false;
    qHandleEnd();
  }

  canvas.addEventListener('mousedown', qHandleDown);
  canvas.addEventListener('mousemove', qHandleMove);
  canvas.addEventListener('mouseup', qHandleUp);
  canvas.addEventListener('mouseleave', qHandleUp);

  canvas.addEventListener('touchstart', e => { e.preventDefault(); qHandleDown(e); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); qHandleMove(e); }, { passive: false });
  canvas.addEventListener('touchend', e => { e.preventDefault(); qHandleUp(e); }, { passive: false });
  canvas.addEventListener('touchcancel', e => { e.preventDefault(); qHandleUp(e); }, { passive: false });

  function qHandleEnd(){
    if(qDone||vocabAnsweredLock||!qStrokes.length)return;
    const ok=validateStroke(qUserPts,qSamplePts);
    if(ok){
      qDrawCompleted(qStrokes[qStrokeIdx]);qStrokeIdx++;
      const ch=word[charIdx];
      strokeInfo.innerHTML=`Character ${charIdx+1}/${word.length} (<span style="font-family:var(--font-jp);font-weight:700;">${ch}</span>) — Stroke: ${qStrokeIdx}/${qStrokes.length}`;
      if(qStrokeIdx>=qStrokes.length){
        charIdx++;
        setTimeout(loadNextChar, 500);
      } else {
        qPrepareStroke();
        qRenderGhost();
      }
    } else {
      qAttempts++;
      qRedraw();for(let i=0;i<qStrokeIdx;i++)qDrawCompleted(qStrokes[i]);
      if(qAttempts>=3){
        fb.innerHTML=`Wrong! <b>${correct.word}</b> = <b>${correct.reading}</b>`;
        fb.className="feedback bad";vocabAnsweredLock=true;
        setTimeout(()=>speak(correct.reading),300);
        finishVocabQ(false,correct);
      } else {
        const ch=word[charIdx];
        strokeInfo.innerHTML=`Try again — Character ${charIdx+1}/${word.length} (<span style="font-family:var(--font-jp);font-weight:700;">${ch}</span>) — Stroke ${qStrokeIdx+1} (${3-qAttempts} left)`;
      }
    }
  }

  loadNextChar();
}

function renderVocabStudyStage(area,correct){
  const card=document.createElement("div");
  card.className="study-card";
  
  // Word
  const wordDiv=document.createElement("div");
  wordDiv.className="study-word";
  wordDiv.textContent=correct.word;
  card.appendChild(wordDiv);
  
  // Reading
  const readDiv=document.createElement("div");
  readDiv.className="study-reading";
  readDiv.textContent=correct.reading;
  card.appendChild(readDiv);
  
  // Meaning
  const meanDiv=document.createElement("div");
  meanDiv.className="study-meaning";
  const thaiText = correct.meaningTh ? ` (${correct.meaningTh})` : "";
  meanDiv.textContent=correct.meaning + thaiText;
  card.appendChild(meanDiv);
  
  // Speak button
  const sb=document.createElement("button");
  sb.className="speak-btn";
  sb.textContent="🔊";
  sb.onclick=()=>speak(correct.reading);
  card.appendChild(sb);
  
  area.appendChild(card);
  
  // "Got it!" button
  const nextBtn=document.createElement("button");
  nextBtn.className="start-btn";
  nextBtn.style.marginTop="16px";
  nextBtn.textContent=lang==='en'?"Got it! ➔":"เข้าใจแล้ว! ➔";
  nextBtn.onclick=()=>{
    if(vocabAnsweredLock)return;
    vocabAnsweredLock=true;
    nextBtn.style.background="var(--good)";
    finishVocabQ(true,correct);
  };
  area.appendChild(nextBtn);
  
  // Speak audio immediately
  speak(correct.reading);
}

function buildVocabOpts(opts,keyFn,correct){
  const w=document.createElement("div");w.className="q-grid";
  opts.forEach(o=>{
    const b=document.createElement("div");b.className="q-opt";b.textContent=keyFn(o);
    b.onclick=()=>{
      if(vocabAnsweredLock)return;vocabAnsweredLock=true;
      /* Compare by object identity to handle duplicate meanings */
      const ok=o===correct;
      b.classList.add(ok?"correct":"wrong");
      const fb=document.getElementById("vqFb");
      if(ok){
        fb.textContent="Correct! 🎉";fb.className="feedback good";speak(correct.reading);
      } else {
        recordVocabConfuse(correct.word,o.word);
        const correctBtn=[...w.children].find(c=>{
          /* Find the button for the correct answer by matching the option index */
          const idx=[...w.children].indexOf(c);
          return opts[idx]===correct;
        });
        if(correctBtn)correctBtn.classList.add("correct");
        fb.innerHTML=`Wrong! <span style="font-family:var(--font-jp)">${correct.word}</span> = <b>${correct.meaning}</b>`;
        fb.className="feedback bad";
        setTimeout(()=>speak(correct.reading),300);
      }
      finishVocabQ(ok,correct);
    };
    w.appendChild(b);
  });
  return w;
}

function finishVocabQ(ok,correct){
  const s=activeVocabSession;
  const currentStageId = VOCAB_STAGES[s.stageIdx]?.id;
  /* Study stage doesn't record accuracy stats */
  if(currentStageId!=="vstudy"){
    recordVocabResult(correct.word,ok);
  }
  if(ok){
    s.questionIdx++;
    s.streak++;
    s.score+=10;
    const stageTotalQ=getVocabStageQCount(s.stageIdx,s.wordCount);
    if(s.questionIdx>=stageTotalQ){
      if(!s.stagesCompleted.includes(VOCAB_STAGES[s.stageIdx].id))s.stagesCompleted.push(VOCAB_STAGES[s.stageIdx].id);
      const finished=VOCAB_STAGES[s.stageIdx].name;
      s.stageIdx++;s.questionIdx=0;saveVocabSessions();
      const toast=document.getElementById("vocabToast");
      if(toast){
        toast.style.display="block";
        toast.textContent=s.stageIdx<VOCAB_STAGES.length?`"${finished}" complete! → "${VOCAB_STAGES[s.stageIdx].name}"`:`"${finished}" complete! All stages done! 🎉`;
        setTimeout(()=>{toast.style.display="none";},2200);
      }
      updateVocabQuizProgress();
      if(s.stageIdx>=VOCAB_STAGES.length){setTimeout(()=>renderVocabQuizUI(),1500);return;}
    }
  } else {
    s.streak=0;s.questionIdx=Math.max(0,s.questionIdx-1);
  }
  saveVocabSessions();
  updateVocabQuizProgress();
  setTimeout(newVocabQuestion,ok?800:1200);
}
