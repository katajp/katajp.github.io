/* ================================================================
   REVIEW MISTAKES — practice only the characters the user has
   previously gotten wrong (tracked via stats + confusion in storage.js)
   ================================================================ */

function getWeakChars(){
  const weakSet=new Set(Object.keys(confusion));
  Object.entries(stats).forEach(([ch,st])=>{
    if(st.seen>=2 && st.correct/st.seen<0.8) weakSet.add(ch);
  });
  return ALL_KANA.filter(k=>weakSet.has(k.ch));
}

function startReviewSession(){
  const pool=getWeakChars();
  if(!pool.length){
    alert("No mistakes to review yet — nice work! Take a quiz first and any characters you miss will show up here.");
    return;
  }
  const sess={
    label:"🔁 Review Mistakes — "+pool.length+" chars",
    selHira:[],
    selKata:[],
    isReview:true,
    reviewChars:pool.map(k=>k.ch),
    charCount:pool.length,
    stageIdx:0,
    questionIdx:0,
    score:0,
    streak:0,
    stagesCompleted:[],
    created:Date.now()
  };
  sessions.push(sess);
  saveSessions();
  activeSessionIdx=sessions.length-1;
  activeSession=sess;
  activePool=pool;
  enterQuiz();
}
