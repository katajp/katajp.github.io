/* ================================================================
   STORAGE — kana stats, confusion tracking, saved quiz sessions
   ================================================================ */
let stats={};   // {char: {seen, correct}}
let confusion={};// {char: {wrongChar: count}}
let sessions=[]; // saved quiz sessions

function loadStorage(){
  try{stats=JSON.parse(localStorage.getItem("kp-stats")||"{}");}catch(e){stats={};}
  try{confusion=JSON.parse(localStorage.getItem("kp-confusion")||"{}");}catch(e){confusion={};}
  try{sessions=JSON.parse(localStorage.getItem("kp-sessions")||"[]");}catch(e){sessions=[];}
}

/* Debounced saves to prevent blocking main thread on every answer */
let saveStatsTimer=null;
function saveStats(){
  if(saveStatsTimer)clearTimeout(saveStatsTimer);
  saveStatsTimer=setTimeout(()=>{
    localStorage.setItem("kp-stats",JSON.stringify(stats));
    saveStatsTimer=null;
  },300);
}

let saveConfusionTimer=null;
function saveConfusion(){
  if(saveConfusionTimer)clearTimeout(saveConfusionTimer);
  saveConfusionTimer=setTimeout(()=>{
    localStorage.setItem("kp-confusion",JSON.stringify(confusion));
    saveConfusionTimer=null;
  },300);
}

let saveSessionsTimer=null;
function saveSessions(){
  if(saveSessionsTimer)clearTimeout(saveSessionsTimer);
  saveSessionsTimer=setTimeout(()=>{
    localStorage.setItem("kp-sessions",JSON.stringify(sessions));
    saveSessionsTimer=null;
  },300);
}

function recordResult(ch,correct){
  if(!stats[ch])stats[ch]={seen:0,correct:0};
  stats[ch].seen++;
  if(correct)stats[ch].correct++;
  saveStats();
}
function recordConfuse(correctCh,pickedCh){
  if(correctCh===pickedCh)return;
  if(!confusion[correctCh])confusion[correctCh]={};
  confusion[correctCh][pickedCh]=(confusion[correctCh][pickedCh]||0)+1;
  saveConfusion();
}

loadStorage();

/* ---- Vocabulary tracking (separate from kana stats above) ---- */
let vocabStats={};      // {word: {seen, correct}}
let vocabConfusion={};  // {word: {wrongWord: count}}
let vocabSessions=[];   // saved vocabulary quiz sessions

function loadVocabStorage(){
  try{vocabStats=JSON.parse(localStorage.getItem("kp-vocab-stats")||"{}");}catch(e){vocabStats={};}
  try{vocabConfusion=JSON.parse(localStorage.getItem("kp-vocab-confusion")||"{}");}catch(e){vocabConfusion={};}
  try{vocabSessions=JSON.parse(localStorage.getItem("kp-vocab-sessions")||"[]");}catch(e){vocabSessions=[];}
}

let saveVocabStatsTimer=null;
function saveVocabStats(){
  if(saveVocabStatsTimer)clearTimeout(saveVocabStatsTimer);
  saveVocabStatsTimer=setTimeout(()=>{
    localStorage.setItem("kp-vocab-stats",JSON.stringify(vocabStats));
    saveVocabStatsTimer=null;
  },300);
}

let saveVocabConfusionTimer=null;
function saveVocabConfusion(){
  if(saveVocabConfusionTimer)clearTimeout(saveVocabConfusionTimer);
  saveVocabConfusionTimer=setTimeout(()=>{
    localStorage.setItem("kp-vocab-confusion",JSON.stringify(vocabConfusion));
    saveVocabConfusionTimer=null;
  },300);
}

let saveVocabSessionsTimer=null;
function saveVocabSessions(){
  if(saveVocabSessionsTimer)clearTimeout(saveVocabSessionsTimer);
  saveVocabSessionsTimer=setTimeout(()=>{
    localStorage.setItem("kp-vocab-sessions",JSON.stringify(vocabSessions));
    saveVocabSessionsTimer=null;
  },300);
}

function recordVocabResult(word,correct){
  if(!vocabStats[word])vocabStats[word]={seen:0,correct:0};
  vocabStats[word].seen++;
  if(correct)vocabStats[word].correct++;
  saveVocabStats();
}
function recordVocabConfuse(correctWord,pickedWord){
  if(correctWord===pickedWord)return;
  if(!vocabConfusion[correctWord])vocabConfusion[correctWord]={};
  vocabConfusion[correctWord][pickedWord]=(vocabConfusion[correctWord][pickedWord]||0)+1;
  saveVocabConfusion();
}

loadVocabStorage();

/* Sync immediately before unloading to guarantee no data loss */
window.addEventListener("beforeunload",()=>{
  if(saveStatsTimer){localStorage.setItem("kp-stats",JSON.stringify(stats));}
  if(saveConfusionTimer){localStorage.setItem("kp-confusion",JSON.stringify(confusion));}
  if(saveSessionsTimer){localStorage.setItem("kp-sessions",JSON.stringify(sessions));}
  if(saveVocabStatsTimer){localStorage.setItem("kp-vocab-stats",JSON.stringify(vocabStats));}
  if(saveVocabConfusionTimer){localStorage.setItem("kp-vocab-confusion",JSON.stringify(vocabConfusion));}
  if(saveVocabSessionsTimer){localStorage.setItem("kp-vocab-sessions",JSON.stringify(vocabSessions));}
});
