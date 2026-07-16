// Quiz setup screen: saved sessions list + row/character selection.

let setupSelHira=new Set();
let setupSelKata=new Set();

function renderQuizSetup(){
  const el=document.getElementById("quizSetup");
  el.style.display="";
  document.getElementById("quizActive").style.display="none";
  el.innerHTML="";

  // Review mistakes card — only shown once the user has some wrong answers to review
  const weak=getWeakChars();
  if(weak.length){
    const rc=document.createElement("div");rc.className="card";
    rc.innerHTML=`
      <div class="card-title"><span class="ico">🔁</span> ${t('reviewMistakes')||'Review Mistakes'}</div>
      <div style="color:var(--ink2);font-size:13px;margin-bottom:12px;">
        ${weak.length} ${t('charsToReview')||"character(s) you've gotten wrong before."}
      </div>
      <div class="start-area" style="margin-top:0;">
        <button class="start-btn" id="reviewBtn" style="background:linear-gradient(135deg,var(--kata),var(--accent));">🔁 Review Now</button>
      </div>`;
    rc.querySelector("#reviewBtn").onclick=startReviewSession;
    el.appendChild(rc);
  }

  // Saved sessions
  if(sessions.length){
    const sc=document.createElement("div");sc.className="card";
    sc.innerHTML='<div class="card-title"><span class="ico">📁</span> Saved Sessions</div>';
    sessions.forEach((sess,idx)=>{
      const totalQ=getKanaTotalQ(sess.charCount);
      const answered=getKanaGlobalQ(sess.stageIdx,sess.questionIdx,sess.charCount);
      const pct=Math.round(answered/totalQ*100);
      const completed=sess.stageIdx>=STAGES.length;
      const div=document.createElement("div");div.className="saved-card";
      div.innerHTML=`
        <div class="saved-info">
          <div class="saved-title">${sess.label||("Session "+(idx+1))}</div>
          <div class="saved-detail">${sess.charCount} chars • ${completed?"Completed":("Stage "+(sess.stageIdx+1)+"/"+STAGES.length+" — "+STAGES[Math.min(sess.stageIdx,STAGES.length-1)].name)}</div>
        </div>
        <div class="saved-progress">
          <div class="saved-pbar"><div class="saved-pbar-fill" style="width:${completed?100:pct}%"></div></div>
          <div class="saved-pct">${completed?100:pct}%</div>
        </div>
        <div class="saved-actions"></div>`;
      const acts=div.querySelector(".saved-actions");
      if(!completed){
        const rb=document.createElement("button");rb.className="resume-btn";rb.textContent="▶ Resume";
        rb.onclick=()=>startFromSession(idx);acts.appendChild(rb);
      } else {
        const rb=document.createElement("button");rb.className="resume-btn";rb.textContent="🔄 Redo";
        rb.onclick=()=>{sess.stageIdx=0;sess.questionIdx=0;sess.score=0;sess.streak=0;
          sess.stagesCompleted=[];sess.questionCoverage={};saveSessions();startFromSession(idx);};
        acts.appendChild(rb);
      }
      const db=document.createElement("button");db.className="delete-btn";db.textContent="✕";
      db.onclick=()=>{sessions.splice(idx,1);saveSessions();renderQuizSetup();};
      acts.appendChild(db);
      sc.appendChild(div);
    });
    el.appendChild(sc);
  }

  // New quiz card
  const nc=document.createElement("div");nc.className="card";
  nc.innerHTML='<div class="card-title"><span class="ico">🆕</span> New Quiz</div>';

  // Hiragana section
  nc.appendChild(buildSetupSection("hiragana","Hiragana",HIRA,setupSelHira));
  // Katakana section
  nc.appendChild(buildSetupSection("katakana","Katakana",KATA,setupSelKata));

  // Selected count
  const info=document.createElement("div");info.className="start-info";info.id="setupInfo";
  updateSetupInfo(info);
  nc.appendChild(info);

  // Start button
  const sa=document.createElement("div");sa.className="start-area";
  const sb=document.createElement("button");sb.className="start-btn";sb.id="startBtn";sb.textContent="🚀 Start Quiz";
  sb.disabled=setupSelHira.size+setupSelKata.size===0;
  sb.onclick=startNewQuiz;
  sa.appendChild(sb);
  nc.appendChild(sa);

  el.appendChild(nc);
}

function buildSetupSection(script,title,data,selSet){
  const sec=document.createElement("div");sec.className="qs-section";
  const isK=script==="katakana";
  const dot=isK?"k":"h";

  // Title with select all / clear
  const hdr=document.createElement("div");hdr.style.cssText="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;";
  const ttl=document.createElement("div");ttl.className="qs-section-title";ttl.style.marginBottom="0";
  ttl.innerHTML=`<span class="dot ${dot}"></span> ${title}`;
  hdr.appendChild(ttl);

  const acts=document.createElement("div");acts.className="qs-actions";acts.style.marginBottom="0";
  const sa=document.createElement("button");sa.className="qs-action";sa.textContent="Select all";
  sa.onclick=()=>{getAllRowKeys(data).forEach(k=>selSet.add(k));renderQuizSetup();};
  const ca=document.createElement("button");ca.className="qs-action";ca.textContent="Clear";
  ca.onclick=()=>{selSet.clear();renderQuizSetup();};
  acts.appendChild(sa);acts.appendChild(ca);
  hdr.appendChild(acts);
  sec.appendChild(hdr);

  const sections=[["Basic",data.basic],["Dakuten",data.dakuten],["Combo",data.combo]];
  sections.forEach(([name,rows])=>{
    const slbl=document.createElement("div");slbl.style.cssText="font-size:11px;font-weight:600;color:var(--ink3);margin:8px 0 4px;";
    slbl.textContent=name;sec.appendChild(slbl);
    const wrap=document.createElement("div");wrap.className="qs-rows";
    rows.forEach(row=>{
      const key=script+":"+row.label;
      const chip=document.createElement("label");
      chip.className="qs-chip"+(selSet.has(key)?" sel":"")+(isK?" kata-chip":"");
      const chk=document.createElement("input");chk.type="checkbox";chk.checked=selSet.has(key);
      chk.onchange=()=>{
        if(chk.checked)selSet.add(key);else selSet.delete(key);
        chip.classList.toggle("sel",chk.checked);
        if(isK)chip.classList.toggle("kata-chip",true);
        updateSetupInfo(document.getElementById("setupInfo"));
        const btn=document.getElementById("startBtn");
        if(btn)btn.disabled=setupSelHira.size+setupSelKata.size===0;
      };
      const ico=document.createElement("div");ico.className="check-ico";ico.textContent="✓";
      const chars=document.createElement("span");chars.className="qs-chars";
      chars.textContent=row.chars.map(c=>c[0]).join(" ");
      const rm=document.createElement("span");rm.className="qs-rm";
      rm.textContent=row.chars.map(c=>c[1]).join(", ");
      chip.appendChild(chk);chip.appendChild(ico);chip.appendChild(chars);chip.appendChild(rm);
      wrap.appendChild(chip);
    });
    sec.appendChild(wrap);
  });
  return sec;
}

function getAllRowKeys(data){
  const keys=[];
  const script=data===HIRA?"hiragana":"katakana";
  [...data.basic,...data.dakuten,...data.combo].forEach(r=>keys.push(script+":"+r.label));
  return keys;
}

function updateSetupInfo(el){
  if(!el)return;
  const pool=buildPoolFromSelection(setupSelHira,setupSelKata);
  el.textContent=pool.length?`${pool.length} characters selected`:"Select at least one row to begin.";
}

function buildPoolFromSelection(hSel,kSel){
  const pool=[];
  function addFrom(data,script,sel){
    [...data.basic,...data.dakuten,...data.combo].forEach(row=>{
      const key=script+":"+row.label;
      if(sel.has(key)) row.chars.forEach(([ch,rm])=>pool.push({ch,rm}));
    });
  }
  addFrom(HIRA,"hiragana",hSel);
  addFrom(KATA,"katakana",kSel);
  return pool;
}
