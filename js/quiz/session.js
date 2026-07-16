// Quiz session lifecycle: start, resume, restart, exit.

let activeSession=null;
let activeSessionIdx=-1;
let activePool=[];
let timerHandle=null;
let answeredLock=false;
let savedRealStageIdx=-1; // tracks real progress when replaying a completed stage
let savedRealQuestionIdx=0;

function startNewQuiz(){
  const pool=buildPoolFromSelection(setupSelHira,setupSelKata);
  if(!pool.length)return;

  // Build label
  const parts=[];
  if(setupSelHira.size)parts.push("Hira("+setupSelHira.size+")");
  if(setupSelKata.size)parts.push("Kata("+setupSelKata.size+")");
  const label=parts.join(" + ")+" — "+pool.length+" chars";

  const sess={
    label,
    selHira:[...setupSelHira],
    selKata:[...setupSelKata],
    charCount:pool.length,
    stageIdx:0,
    questionIdx:0,
    score:0,
    streak:0,
    stagesCompleted:[],
    questionCoverage:{},
    created:Date.now()
  };
  sessions.push(sess);
  saveSessions();
  activeSessionIdx=sessions.length-1;
  activeSession=sess;
  activePool=pool;
  enterQuiz();
}

function startFromSession(idx){
  const sess=sessions[idx];
  activeSessionIdx=idx;
  activeSession=sess;
  if(!sess.questionCoverage)sess.questionCoverage={};
  if(sess.isReview){
    activePool=ALL_KANA.filter(k=>sess.reviewChars.includes(k.ch));
    if(!activePool.length){activePool=ALL_KANA;}
  } else {
    activePool=buildPoolFromSelection(new Set(sess.selHira),new Set(sess.selKata));
    if(!activePool.length){activePool=ALL_KANA;}
  }
  enterQuiz();
}

function enterQuiz(){
  document.getElementById("quizSetup").style.display="none";
  document.getElementById("quizActive").style.display="";
  savedRealStageIdx=-1;
  savedRealQuestionIdx=0;
  renderQuizUI();
}

function restartCurrentLevel(){
  const s=activeSession;
  if(!s)return;
  s.stageIdx=0;s.questionIdx=0;s.score=0;s.streak=0;s.stagesCompleted=[];s.questionCoverage={};
  saveSessions();
  savedRealStageIdx=-1;
  savedRealQuestionIdx=0;
  renderQuizUI();
}

function exitQuiz(){
  clearInterval(timerHandle);
  activeSession=null;activeSessionIdx=-1;
  document.getElementById("quizActive").style.display="none";
  renderQuizSetup();
}
