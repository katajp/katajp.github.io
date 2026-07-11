// Generic helpers shared across the app.
// Depends on: js/data/hiragana.js, js/data/katakana.js (must load first)

function allRows(script){
  const d = script==="hiragana"? HIRA : KATA;
  return [...d.basic,...d.dakuten,...d.combo];
}
function allCharsFlat(script){
  return allRows(script).flatMap(r=>r.chars.map(([ch,rm])=>({ch,rm})));
}
/* Pre-computed flat arrays — avoid re-building on every call */
const ALL_HIRA = allCharsFlat("hiragana");
const ALL_KATA = allCharsFlat("katakana");
const ALL_KANA = [...ALL_HIRA,...ALL_KATA];

/* In-place Fisher-Yates shuffle (mutates the array) */
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* Escape HTML special chars to prevent XSS when injecting into innerHTML */
function escapeHtml(s){
  const d=document.createElement('div');
  d.textContent=s;
  return d.innerHTML;
}
