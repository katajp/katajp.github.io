/* ================================================================
   APP-WIDE CONSTANTS
   ================================================================ */
const APP_VERSION = "v0.28";

const STAGES=[
  {id:"mc",name:"Read",desc:"kana → romaji"},
  {id:"rev",name:"Recall",desc:"romaji → kana"},
  {id:"type",name:"Type",desc:"type the romaji"},
  {id:"listen",name:"Listen",desc:"audio → kana"},
  {id:"match",name:"Match",desc:"drag & drop"},
  {id:"write",name:"Write",desc:"trace the character"}
];
const Q_PER_STAGE=20;

// Vocabulary practice stages (separate mini-engine from the kana quiz above)
const VOCAB_STAGES=[
  {id:"vstudy",name:"Study",desc:"learn the words"},
  {id:"vread",name:"Meaning",desc:"word → meaning"},
  {id:"vrecall",name:"Recall",desc:"meaning → word"},
  {id:"vlisten",name:"Listen",desc:"audio → word"}
];
const VOCAB_Q_PER_STAGE=10;
