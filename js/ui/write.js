// Standalone "Write" tab — full KanjiVG stroke-order tracing practice.

const wCanvas=document.getElementById('writeCanvas');
const wCtx=wCanvas.getContext('2d');
let wChar=null;        // {ch, rm}
let wStrokes=[];       // array of SVG path 'd' strings
let wStrokeIdx=0;      // current expected stroke index
let wSamplePoints=[];  // sampled points of current expected stroke
let wDrawing=false;
let wUserPoints=[];    // points drawn by user in current stroke
let wCompleted=false;
let wProgress=0;       // 0..1 how far along the current stroke the user has traced correctly
let wStrokeLen=0;      // arc length of current expected stroke (in 109-unit space)
const wSize=300;

// Sample points along an SVG path 'd' attribute
function sampleSvgPath(d,numPoints){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d',d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const len=path.getTotalLength();
  const pts=[];
  for(let i=0;i<=numPoints;i++){
    const p=path.getPointAtLength(len*i/numPoints);
    pts.push({x:p.x,y:p.y});
  }
  svg.remove();
  return {points:pts,length:len};
}

// Scale KanjiVG coords (109x109) to canvas size
function scaleX(x){return x*wSize/109;}
function scaleY(y){return y*wSize/109;}
function scalePoints(pts){return pts.map(p=>({x:scaleX(p.x),y:scaleY(p.y)}));}

// Draw grid lines on canvas
function drawGrid(){
  wCtx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--border').trim()||'rgba(0,0,0,0.08)';
  wCtx.lineWidth=1;
  wCtx.setLineDash([6,6]);
  // Center cross
  wCtx.beginPath();wCtx.moveTo(wSize/2,0);wCtx.lineTo(wSize/2,wSize);wCtx.stroke();
  wCtx.beginPath();wCtx.moveTo(0,wSize/2);wCtx.lineTo(wSize,wSize/2);wCtx.stroke();
  wCtx.setLineDash([]);
}

// Render the ghost SVG strokes behind the canvas
function renderGhostSVG(){
  const wrap=document.getElementById('writeCanvasWrap');
  // Remove old ghost
  const old=wrap.querySelector('svg.write-ghost');
  if(old)old.remove();

  if(!wStrokes.length)return;

  const ghostColor=getComputedStyle(document.body).getPropertyValue('--border2').trim()||'rgba(0,0,0,0.12)';
  const nextColor=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#e05545';
  const doneColor=getComputedStyle(document.body).getPropertyValue('--hira').trim()||'#2d8a6e';

  let svg=`<svg class="write-ghost" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109" preserveAspectRatio="xMidYMid meet">`;
  wStrokes.forEach((d,i)=>{
    let color,width,opacity;
    if(i<wStrokeIdx){
      // Completed stroke
      color=doneColor;width='3';opacity='0.3';
    } else if(i===wStrokeIdx && !wCompleted){
      // Current stroke to draw — highlighted
      color=nextColor;width='4';opacity='0.35';
    } else {
      // Future strokes
      color=ghostColor;width='3';opacity='0.6';
    }
    svg+=`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;

    // Progressive blue fill on the current stroke, following how far the user has traced it
    if(i===wStrokeIdx && !wCompleted && wStrokeLen>0 && wProgress>0){
      const dashOffset=wStrokeLen*(1-wProgress);
      svg+=`<path d="${d}" fill="none" stroke="${doneColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${wStrokeLen}" stroke-dashoffset="${dashOffset}"/>`;
    }
  });

  // Show stroke number for current
  if(wStrokeIdx<wStrokes.length && !wCompleted && wSamplePoints.length){
    const start=wSamplePoints[0];
    svg+=`<circle cx="${start.x/wSize*109}" cy="${start.y/wSize*109}" r="4" fill="${nextColor}" opacity="0.7"/>`;
    svg+=`<text x="${start.x/wSize*109+6}" y="${start.y/wSize*109-4}" font-size="8" fill="${nextColor}" font-weight="700">${wStrokeIdx+1}</text>`;
  }

  svg+=`</svg>`;
  wrap.insertAdjacentHTML('afterbegin',svg);
}

// Redraw canvas (completed strokes in blue + grid)
function redrawCanvas(){
  wCtx.clearRect(0,0,wSize,wSize);
  drawGrid();
}

// Draw a completed stroke on canvas in blue
function drawCompletedStroke(strokeD){
  const {points}=sampleSvgPath(strokeD,60);
  const scaled=scalePoints(points);
  if(!scaled.length)return;
  wCtx.strokeStyle='#2e8ee0';
  wCtx.lineWidth=6;
  wCtx.lineCap='round';
  wCtx.lineJoin='round';
  wCtx.beginPath();
  wCtx.moveTo(scaled[0].x,scaled[0].y);
  for(let i=1;i<scaled.length;i++) wCtx.lineTo(scaled[i].x,scaled[i].y);
  wCtx.stroke();
}

// Check if user's stroke matches the expected stroke
function validateStroke(userPts,expectedPts){
  if(userPts.length<5)return false;
  if(expectedPts.length<2)return false;

  // Check start point proximity
  const startDist=Math.hypot(userPts[0].x-expectedPts[0].x,userPts[0].y-expectedPts[0].y);
  if(startDist>45)return false; // too far from start

  // Check end point proximity
  const endUser=userPts[userPts.length-1];
  const endExp=expectedPts[expectedPts.length-1];
  const endDist=Math.hypot(endUser.x-endExp.x,endUser.y-endExp.y);
  if(endDist>50)return false; // too far from end

  // Check direction: the overall direction should roughly match
  const userDx=endUser.x-userPts[0].x;
  const userDy=endUser.y-userPts[0].y;
  const expDx=endExp.x-expectedPts[0].x;
  const expDy=endExp.y-expectedPts[0].y;
  const dot=userDx*expDx+userDy*expDy;
  if(dot<0)return false; // drawn in opposite direction

  // Check average distance of user points to path
  let totalDist=0;
  const sampleStep=Math.max(1,Math.floor(userPts.length/20));
  let sampleCount=0;
  for(let i=0;i<userPts.length;i+=sampleStep){
    const up=userPts[i];
    let minD=Infinity;
    for(let j=0;j<expectedPts.length;j++){
      const d=Math.hypot(up.x-expectedPts[j].x,up.y-expectedPts[j].y);
      if(d<minD)minD=d;
    }
    totalDist+=minD;
    sampleCount++;
  }
  const avgDist=totalDist/sampleCount;
  return avgDist<35; // tolerance
}

// Load character strokes
async function loadWriteChar(){
  const allSingles=[...allCharsFlat('hiragana'),...allCharsFlat('katakana')].filter(k=>k.ch.length===1);
  wChar=allSingles[Math.floor(Math.random()*allSingles.length)];
  wStrokeIdx=0;
  wCompleted=false;
  wStrokes=[];
  wSamplePoints=[];

  document.getElementById('writeCharInfo').textContent=wChar.ch+' — '+wChar.rm;
  document.getElementById('writeStrokeCount').textContent='Loading...';
  document.getElementById('writeHint').textContent='';
  redrawCanvas();
  renderGhostSVG();

  // Fetch KanjiVG using the shared loader (with CDN fallback and SVG repair).
  try{
    const {paths}=await fetchCharSvgPaths(wChar.ch);
    wStrokes=[...paths].map(p=>p.getAttribute('d')).filter(Boolean);

    if(wStrokes.length){
      prepareCurrentStroke();
    }
    document.getElementById('writeStrokeCount').textContent=`Stroke: 0/${wStrokes.length}`;
    renderGhostSVG();
  } catch(e){
    document.getElementById('writeStrokeCount').textContent='Stroke data unavailable';
  }
}

function prepareCurrentStroke(){
  if(wStrokeIdx>=wStrokes.length)return;
  const {points,length}=sampleSvgPath(wStrokes[wStrokeIdx],50);
  wSamplePoints=scalePoints(points);
  wStrokeLen=length;
  wProgress=0;
}

// Canvas pointer and touch events for full desktop & mobile compatibility
function getCanvasPos(e){
  const r=wCanvas.getBoundingClientRect();
  let clientX, clientY;
  if(e.touches && e.touches.length){
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if(e.changedTouches && e.changedTouches.length){
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {x:(clientX-r.left)*wSize/r.width, y:(clientY-r.top)*wSize/r.height};
}

function qHandleDown(e) {
  if(wCompleted)return;
  wDrawing=true;
  wUserPoints=[];
  wUserPoints.push(getCanvasPos(e));
}
function qHandleMove(e) {
  if(!wDrawing||wCompleted)return;
  const p=getCanvasPos(e);
  wUserPoints.push(p);

  if(wSamplePoints.length){
    let bestIdx=-1,bestD=Infinity;
    for(let i=0;i<wSamplePoints.length;i++){
      const d=Math.hypot(p.x-wSamplePoints[i].x,p.y-wSamplePoints[i].y);
      if(d<bestD){bestD=d;bestIdx=i;}
    }
    if(bestD<30){
      const frac=bestIdx/(wSamplePoints.length-1);
      if(frac>wProgress){
        wProgress=frac;
        renderGhostSVG();
      }
    }
  }
}
function qHandleUp(e) {
  if(!wDrawing)return;
  wDrawing=false;
  if(wCompleted||!wStrokes.length)return;
  const ok=validateStroke(wUserPoints,wSamplePoints);
  handleStrokeResult(ok);
}

wCanvas.addEventListener('mousedown', qHandleDown);
wCanvas.addEventListener('mousemove', qHandleMove);
wCanvas.addEventListener('mouseup', qHandleUp);
wCanvas.addEventListener('mouseleave', qHandleUp);

wCanvas.addEventListener('touchstart', e => { e.preventDefault(); qHandleDown(e); }, { passive: false });
wCanvas.addEventListener('touchmove', e => { e.preventDefault(); qHandleMove(e); }, { passive: false });
wCanvas.addEventListener('touchend', e => { e.preventDefault(); qHandleUp(e); }, { passive: false });
wCanvas.addEventListener('touchcancel', e => { e.preventDefault(); qHandleUp(e); }, { passive: false });

function handleStrokeResult(ok){
  if(ok){
    // Draw completed stroke in blue
    drawCompletedStroke(wStrokes[wStrokeIdx]);
    wStrokeIdx++;
    document.getElementById('writeStrokeCount').textContent=`Stroke: ${wStrokeIdx}/${wStrokes.length}`;
    document.getElementById('writeHint').textContent='';

    if(wStrokeIdx>=wStrokes.length){
      // All strokes done!
      wCompleted=true;
      document.getElementById('writeHint').innerHTML='<span class="write-success">✅ Complete! Well done!</span>';
      speak(wChar.ch);
      // Auto next after delay
      setTimeout(()=>{
        if(wCompleted) loadWriteChar();
      },2000);
    } else {
      prepareCurrentStroke();
    }
    // Redraw ghost to update highlighting
    renderGhostSVG();
  } else {
    // Wrong — clear the user's attempt and show hint
    redrawCanvas();
    // Re-draw all previously completed strokes
    for(let i=0;i<wStrokeIdx;i++) drawCompletedStroke(wStrokes[i]);
    wProgress=0;
    renderGhostSVG();
    document.getElementById('writeHint').textContent=`Try again — follow stroke ${wStrokeIdx+1} (highlighted in red)`;
  }
}

// Buttons
document.getElementById('writeNewBtn').onclick=loadWriteChar;
document.getElementById('writeClearBtn').onclick=()=>{
  wStrokeIdx=0;wCompleted=false;
  if(wStrokes.length)prepareCurrentStroke();
  redrawCanvas();renderGhostSVG();
  document.getElementById('writeStrokeCount').textContent=`Stroke: 0/${wStrokes.length}`;
  document.getElementById('writeHint').textContent='';
};
document.getElementById('writeSpeakBtn').onclick=()=>{if(wChar)speak(wChar.ch);};
document.getElementById('writeHintBtn').onclick=()=>{
  if(wCompleted||!wStrokes.length||wStrokeIdx>=wStrokes.length)return;
  // Flash-animate the current stroke
  const {points}=sampleSvgPath(wStrokes[wStrokeIdx],40);
  const scaled=scalePoints(points);
  if(!scaled.length)return;
  wCtx.strokeStyle='rgba(224,85,69,0.4)';
  wCtx.lineWidth=8;
  wCtx.lineCap='round';
  wCtx.lineJoin='round';
  wCtx.beginPath();
  wCtx.moveTo(scaled[0].x,scaled[0].y);
  for(let i=1;i<scaled.length;i++) wCtx.lineTo(scaled[i].x,scaled[i].y);
  wCtx.stroke();
  // Fade it out
  setTimeout(()=>{
    redrawCanvas();
    for(let i=0;i<wStrokeIdx;i++) drawCompletedStroke(wStrokes[i]);
  },800);
};
