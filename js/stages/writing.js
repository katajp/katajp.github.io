// Stage: "Write" — in-quiz KanjiVG stroke tracing.

function renderWriteQ(pool){
  const singles=pool.filter(k=>k.ch.length===1);
  if(!singles.length){finishQ(true,pool[0]);return;}
  const correct=weightedPick(singles);

  const area=document.getElementById("qaArea");
  area.innerHTML="";

  // Show romaji as prompt
  const prompt=document.createElement("div");prompt.className="q-romaji";prompt.textContent=correct.rm;
  area.appendChild(prompt);

  // Info text
  const info=document.createElement("div");info.style.cssText="font-size:13px;color:var(--ink3);margin-bottom:8px;";
  info.textContent=t('writeQ');area.appendChild(info);

  // Canvas container
  const bg=document.createElement("div");bg.style.cssText="width:250px;height:250px;background:var(--bg2);border-radius:var(--r-l);box-shadow:var(--shadow-l);border:1px solid var(--border);position:relative;overflow:hidden;";
  const wrap=document.createElement("div");wrap.style.cssText="position:relative;width:250px;height:250px;";
  const canvas=document.createElement("canvas");canvas.width=250;canvas.height=250;
  canvas.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;touch-action:none;border-radius:var(--r-l);z-index:4;";
  wrap.appendChild(canvas);bg.appendChild(wrap);area.appendChild(bg);

  const strokeInfo=document.createElement("div");strokeInfo.style.cssText="font-size:13px;color:var(--ink3);font-weight:600;margin-top:8px;";
  strokeInfo.textContent=t('loading');area.appendChild(strokeInfo);

  const fb=document.createElement("div");fb.className="feedback";fb.id="qFb";
  area.appendChild(fb);
  answeredLock=false;

  // Load strokes and setup writing
  const qSize=250;
  let qStrokes=[], qStrokeIdx=0, qSamplePts=[], qDrawing=false, qUserPts=[], qAttempts=0, qDone=false;

  function qScalePoints(pts){return pts.map(p=>({x:p.x*qSize/109,y:p.y*qSize/109}));}
  function qGetPos(e){
    const r=canvas.getBoundingClientRect();
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
    return{x:(clientX-r.left)*qSize/r.width,y:(clientY-r.top)*qSize/r.height};
  }

  function qDrawGrid(){
    const ctx=canvas.getContext('2d');
    ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--border').trim()||'rgba(0,0,0,0.08)';
    ctx.lineWidth=1;ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(qSize/2,0);ctx.lineTo(qSize/2,qSize);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,qSize/2);ctx.lineTo(qSize,qSize/2);ctx.stroke();
    ctx.setLineDash([]);
  }

  function qRenderGhost(){
    const old=wrap.querySelector('svg');if(old)old.remove();
    if(!qStrokes.length)return;
    const ghost=getComputedStyle(document.body).getPropertyValue('--border2').trim()||'rgba(0,0,0,0.12)';
    const accent=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#e05545';
    const done=getComputedStyle(document.body).getPropertyValue('--hira').trim()||'#2d8a6e';
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:3;display:block;">`;
    qStrokes.forEach((d,i)=>{
      let c=ghost,w='3',o='0.5';
      if(i<qStrokeIdx){c=done;o='0.3';}
      else if(i===qStrokeIdx&&!qDone){c=accent;w='4';o='0.5';}
      svg+=`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
    });
    svg+=`</svg>`;wrap.insertAdjacentHTML('afterbegin',svg);
  }

  function qRedraw(){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,qSize,qSize);qDrawGrid();}

  function qDrawCompleted(d){
    const {points}=sampleSvgPath(d,60);
    const scaled=qScalePoints(points);if(!scaled.length)return;
    const ctx=canvas.getContext('2d');
    ctx.strokeStyle='#2e8ee0';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(scaled[0].x,scaled[0].y);
    for(let i=1;i<scaled.length;i++)ctx.lineTo(scaled[i].x,scaled[i].y);
    ctx.stroke();
  }

  function qPrepareStroke(){
    if(qStrokeIdx>=qStrokes.length)return;
    const {points}=sampleSvgPath(qStrokes[qStrokeIdx],50);
    qSamplePts=qScalePoints(points);
  }

  function qHandleDown(e) {
    if(qDone||answeredLock)return;
    qDrawing=true;qUserPts=[];qUserPts.push(qGetPos(e));
  }
  function qHandleMove(e) {
    if(!qDrawing||qDone||answeredLock)return;
    const p=qGetPos(e);qUserPts.push(p);
    if(qUserPts.length>1){
      const prev=qUserPts[qUserPts.length-2];
      let minD=Infinity;for(const ep of qSamplePts){const d=Math.hypot(p.x-ep.x,p.y-ep.y);if(d<minD)minD=d;}
      const ctx=canvas.getContext('2d');
      ctx.strokeStyle=minD<25?'#2e8ee0':'rgba(220,80,80,0.4)';
      ctx.lineWidth=minD<25?5:4;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
  }
  function qHandleUp(e) {
    if(!qDrawing)return;qDrawing=false;
    qHandleEnd();
  }

  canvas.addEventListener('mousedown', qHandleDown);
  canvas.addEventListener('mousemove', qHandleMove);
  canvas.addEventListener('mouseup', qHandleUp);
  canvas.addEventListener('mouseleave', qHandleUp);

  canvas.addEventListener('touchstart', e => { e.preventDefault(); qHandleDown(e); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); qHandleMove(e); }, { passive: false });
  canvas.addEventListener('touchend', e => { e.preventDefault(); qHandleUp(e); }, { passive: false });
  canvas.addEventListener('touchcancel', e => { e.preventDefault(); qHandleUp(e); }, { passive: false });

  function qHandleEnd(){
    if(qDone||answeredLock||!qStrokes.length)return;
    const ok=validateStroke(qUserPts,qSamplePts);
    if(ok){
      qDrawCompleted(qStrokes[qStrokeIdx]);qStrokeIdx++;
      strokeInfo.textContent=`${t('stroke')}: ${qStrokeIdx}/${qStrokes.length}`;
      if(qStrokeIdx>=qStrokes.length){
        qDone=true;fb.textContent=t('correct');fb.className="feedback good";speak(correct.ch);
        answeredLock=true;finishQ(true,correct);
      } else {qPrepareStroke();qRenderGhost();}
    } else {
      qAttempts++;
      qRedraw();for(let i=0;i<qStrokeIdx;i++)qDrawCompleted(qStrokes[i]);
      if(qAttempts>=3){
        fb.innerHTML=`${t('wrong')} <span style="font-family:var(--font-jp)">${correct.ch}</span> = <b>${correct.rm}</b>`;
        fb.className="feedback bad";answeredLock=true;
        setTimeout(()=>speak(correct.ch),300);finishQ(false,correct);
      } else {
        strokeInfo.textContent=`${t('tryAgain')} — ${t('stroke')} ${qStrokeIdx+1} (${3-qAttempts} left)`;
      }
    }
  }

  // Init
  (async()=>{
    const code=correct.ch.codePointAt(0).toString(16).padStart(5,'0');
    try{
      const {paths}=await fetchCharSvgPaths(correct.ch);
      qStrokes=[...paths].map(p=>p.getAttribute('d'));
      if(qStrokes.length){qPrepareStroke();qRenderGhost();}
      strokeInfo.textContent=`${t('stroke')}: 0/${qStrokes.length}`;
      qRedraw();
    }catch(e){strokeInfo.textContent='Stroke data unavailable';finishQ(true,correct);}
  })();
}

