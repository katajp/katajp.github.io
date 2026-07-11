/* ================================================================
   VOCABULARY PRACTICE — full setup + session + question engine for
   the "📚 Vocab" tab. Mirrors the kana quiz engine (js/quiz/*.js) but
   works over words from js/data/vocabulary.js instead of characters,
   and can optionally enrich a question with a live example sentence
   from the Jotoba API (js/api/dictionary.js, js/api/vocabulary.js).
   ================================================================ */

let setupSelJlpt=new Set(["N5"]);
let setupSelCategories=new Set();
let setupIncludeOnlineExtra=false;
let vocabPoolLoading=false;

let activeVocabSession=null;
let activeVocabSessionIdx=-1;
let activeVocabPool=[];
let vocabAnsweredLock=false;

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
      const totalQ=VOCAB_STAGES.length*VOCAB_Q_PER_STAGE;
      const answered=(sess.stageIdx*VOCAB_Q_PER_STAGE)+sess.questionIdx;
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
  const totalQ=VOCAB_STAGES.length*VOCAB_Q_PER_STAGE;
  const globalQ=s.stageIdx*VOCAB_Q_PER_STAGE+s.questionIdx;
  const globalPct=Math.round(globalQ/totalQ*100);

  const top=document.createElement("div");top.className="card";
  top.innerHTML=`
    <div class="qa-top">
      <div class="qa-stage">${stg.name} — ${stg.desc}</div>
      <button class="qa-exit" id="vocabExitBtn">✕ Exit</button>
    </div>
    <div class="qa-progress">
      <div class="qa-plabel"><span>Stage ${s.stageIdx+1}/${VOCAB_STAGES.length} — Question ${s.questionIdx}/${VOCAB_Q_PER_STAGE}</span><span>${globalPct}%</span></div>
      <div class="qa-bar-out"><div class="qa-bar-in" style="width:${globalPct}%"></div></div>
    </div>
    <div class="qa-toast" id="vocabToast"></div>
    <div class="qa-score"><span>Score: <b id="vqScore">${s.score}</b></span><span>Streak: <b id="vqStreak">${s.streak}</b></span></div>`;
  el.appendChild(top);
  top.querySelector("#vocabExitBtn").onclick=exitVocabQuiz;

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
  const totalQ=VOCAB_STAGES.length*VOCAB_Q_PER_STAGE;
  const globalQ=s.stageIdx*VOCAB_Q_PER_STAGE+s.questionIdx;
  const globalPct=Math.round(globalQ/totalQ*100);
  const plabel=document.querySelector("#vocabActive .qa-plabel");
  if(plabel)plabel.innerHTML=`<span>Stage ${s.stageIdx+1}/${VOCAB_STAGES.length} — Question ${s.questionIdx}/${VOCAB_Q_PER_STAGE}</span><span>${globalPct}%</span>`;
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
  const correct=weightedPickVocab(pool);
  const optPool=pool.length>=4?pool:VOCABULARY;
  let opts=[correct];
  while(opts.length<4){
    const c=optPool[Math.floor(Math.random()*optPool.length)];
    const key=stage.id==="vrecall"?c.word:c.meaning;
    if(!opts.some(o=>(stage.id==="vrecall"?o.word:o.meaning)===key))opts.push(c);
  }
  shuffleArr(opts);

  const area=document.getElementById("vqaArea");
  area.innerHTML="";
  const fb=document.createElement("div");fb.className="feedback";fb.id="vqFb";

  if(stage.id==="vread"){
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

  // Background enrichment — show an example sentence if Jotoba has one,
  // without blocking or delaying the question itself.
  enrichWord(correct).then(info=>{
    if(info&&info.example&&info.example.jp){
      const ex=document.createElement("div");
      ex.style.cssText="font-size:12px;color:var(--ink3);text-align:center;max-width:320px;";
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
  recordVocabResult(correct.word,ok);
  const s=activeVocabSession;
  if(ok){
    s.score+=10;s.streak++;s.questionIdx++;
    if(s.questionIdx>=VOCAB_Q_PER_STAGE){
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
