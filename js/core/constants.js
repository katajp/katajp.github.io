/* ================================================================
   APP-WIDE CONSTANTS
   ================================================================ */
const APP_VERSION = "0.35b";

const STAGES=[
  {id:"intro",name:"Intro",desc:"learn the character"},
  {id:"mc",name:"Read",desc:"kana → romaji"},
  {id:"rev",name:"Recall",desc:"romaji → kana"},
  {id:"type",name:"Type",desc:"type the romaji"},
  {id:"listen",name:"Listen",desc:"audio → kana"},
  {id:"match",name:"Match",desc:"drag & drop"},
  {id:"write",name:"Write",desc:"trace the character"},
  {id:"freewrite",name:"Free Write",desc:"write from memory"},
  {id:"test",name:"Test",desc:"mixed formats"}
];
const Q_PER_STAGE=20;

// Vocabulary practice stages (separate mini-engine from the kana quiz above)
const VOCAB_STAGES=[
  {id:"vintro",name:"Intro",desc:"learn the word"},
  {id:"vread",name:"Read",desc:"word → meaning"},
  {id:"vrecall",name:"Recall",desc:"meaning → word"},
  {id:"vtype",name:"Type",desc:"type meaning/reading"},
  {id:"vlisten",name:"Listen",desc:"audio → word"},
  {id:"vmatch",name:"Match",desc:"drag & drop"},
  {id:"vwrite",name:"Write",desc:"trace the character"},
  {id:"vtest",name:"Test",desc:"mixed formats"}
];
const VOCAB_Q_PER_STAGE=10;

// Helper functions for dynamic stage lengths
function getKanaStageQCount(stageIdx, poolLen){
  if(stageIdx>=STAGES.length) return Q_PER_STAGE;
  const id=STAGES[stageIdx].id;
  return id==="intro" ? poolLen : Q_PER_STAGE;
}
function getKanaTotalQ(poolLen){
  let t=0;for(let i=0;i<STAGES.length;i++) t+=getKanaStageQCount(i,poolLen);
  return t;
}
function getKanaGlobalQ(stageIdx, qIdx, poolLen){
  let g=0;for(let i=0;i<stageIdx;i++) g+=getKanaStageQCount(i,poolLen);
  return g+qIdx;
}

function getVocabStageQCount(stageIdx, poolLen){
  if(stageIdx>=VOCAB_STAGES.length) return VOCAB_Q_PER_STAGE;
  const id=VOCAB_STAGES[stageIdx].id;
  return id==="vintro" ? poolLen : VOCAB_Q_PER_STAGE;
}
function getVocabTotalQ(poolLen){
  let t=0;for(let i=0;i<VOCAB_STAGES.length;i++) t+=getVocabStageQCount(i,poolLen);
  return t;
}
function getVocabGlobalQ(stageIdx, qIdx, poolLen){
  let g=0;for(let i=0;i<stageIdx;i++) g+=getVocabStageQCount(i,poolLen);
  return g+qIdx;
}
