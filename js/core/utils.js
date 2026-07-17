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

/* SVG stroke helpers used by Write, Free Write, and vocabulary writing. */
function sampleSvgPath(d,numPoints){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d',d);svg.appendChild(path);
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
  document.body.appendChild(svg);
  const length=path.getTotalLength(),points=[];
  for(let i=0;i<=numPoints;i++){
    const point=path.getPointAtLength(length*i/numPoints);
    points.push({x:point.x,y:point.y});
  }
  svg.remove();
  return{points,length};
}

function validateStroke(userPts,expectedPts){
  if(userPts.length<5||expectedPts.length<2)return false;
  const startDist=Math.hypot(userPts[0].x-expectedPts[0].x,userPts[0].y-expectedPts[0].y);
  if(startDist>45)return false;
  const endUser=userPts[userPts.length-1],endExpected=expectedPts[expectedPts.length-1];
  if(Math.hypot(endUser.x-endExpected.x,endUser.y-endExpected.y)>50)return false;
  const userDx=endUser.x-userPts[0].x,userDy=endUser.y-userPts[0].y;
  const expectedDx=endExpected.x-expectedPts[0].x,expectedDy=endExpected.y-expectedPts[0].y;
  if(userDx*expectedDx+userDy*expectedDy<0)return false;
  let totalDistance=0,sampleCount=0;
  const sampleStep=Math.max(1,Math.floor(userPts.length/20));
  for(let i=0;i<userPts.length;i+=sampleStep){
    let nearest=Infinity;
    for(const expected of expectedPts){
      nearest=Math.min(nearest,Math.hypot(userPts[i].x-expected.x,userPts[i].y-expected.y));
    }
    totalDistance+=nearest;sampleCount++;
  }
  return totalDistance/sampleCount<35;
}
