// Generic helpers shared across the app.
// Depends on: js/data/hiragana.js, js/data/katakana.js (must load first)

function allRows(script){
  const d = script==="hiragana"? HIRA : KATA;
  return [...d.basic,...d.dakuten,...d.combo];
}
function allCharsFlat(script){
  return allRows(script).flatMap(r=>r.chars.map(([ch,rm])=>({ch,rm})));
}
const ALL_KANA = [...allCharsFlat("hiragana"),...allCharsFlat("katakana")];

function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
