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
function saveStats(){localStorage.setItem("kp-stats",JSON.stringify(stats));}
function saveConfusion(){localStorage.setItem("kp-confusion",JSON.stringify(confusion));}
function saveSessions(){localStorage.setItem("kp-sessions",JSON.stringify(sessions));}

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
function saveVocabStats(){localStorage.setItem("kp-vocab-stats",JSON.stringify(vocabStats));}
function saveVocabConfusion(){localStorage.setItem("kp-vocab-confusion",JSON.stringify(vocabConfusion));}
function saveVocabSessions(){localStorage.setItem("kp-vocab-sessions",JSON.stringify(vocabSessions));}

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
