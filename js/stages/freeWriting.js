// Stage: "Free Write" — validate one stroke at a time and keep the real
// stroke visible as the learner continues with the remaining strokes.

function scoreFreeWriteStroke(user,expected){
  if(user.length<3||expected.length<3)return{ok:false,score:0};
  const nearestDistance=(point,points)=>Math.min(...points.map(other=>Math.hypot(point.x-other.x,point.y-other.y)));
  const sample=(points,max)=>points.filter((_,index)=>index%Math.max(1,Math.floor(points.length/max))===0);
  const userSample=sample(user,32),expectedSample=sample(expected,48),tolerance=34;
  const precision=userSample.filter(point=>nearestDistance(point,expectedSample)<=tolerance).length/userSample.length;
  const coverage=expectedSample.filter(point=>nearestDistance(point,userSample)<=tolerance).length/expectedSample.length;
  const userStart=user[0],userEnd=user[user.length-1],expectedStart=expected[0],expectedEnd=expected[expected.length-1];
  const start=Math.hypot(userStart.x-expectedStart.x,userStart.y-expectedStart.y)<=58;
  const end=Math.hypot(userEnd.x-expectedEnd.x,userEnd.y-expectedEnd.y)<=62;
  const ux=userEnd.x-userStart.x,uy=userEnd.y-userStart.y,ex=expectedEnd.x-expectedStart.x,ey=expectedEnd.y-expectedStart.y;
  const direction=(ux*ex+uy*ey)/(Math.hypot(ux,uy)*Math.hypot(ex,ey)||1);
  const score=Math.round((coverage*.48+precision*.30+((start?1:0)+(end?1:0))*.06+Math.max(0,direction)*.10)*100);
  return{ok:score>=70&&coverage>=.70&&precision>=.70&&start&&end&&direction>.10,score};
}

function renderFreeWriteQ(pool){
  const singles=pool.filter(k=>k.ch.length===1);
  if(!singles.length){finishQ(true,pool[0]);return;}
  const stageId=STAGES[activeSession.stageIdx]?.id||"freewrite";
  const correct=weightedPick(singles,coverageState(activeSession,stageId+"-prompts"));
  const area=document.getElementById("qaArea");area.innerHTML="";answeredLock=false;

  const prompt=document.createElement("div");prompt.className="q-romaji";prompt.textContent=correct.rm;area.appendChild(prompt);
  const info=document.createElement("div");info.className="freewrite-instruction";info.textContent=t('drawFromMemory');area.appendChild(info);

  const meter=document.createElement("div");meter.className="freewrite-meter";meter.setAttribute("role","progressbar");meter.setAttribute("aria-valuemin","0");
  const meterLabel=document.createElement("div");meterLabel.className="freewrite-meter-label";meterLabel.textContent=t('loadingStroke');
  const meterBars=document.createElement("div");meterBars.className="freewrite-meter-bars";meter.append(meterLabel,meterBars);area.appendChild(meter);

  const board=document.createElement("div");board.className="freewrite-board";
  const canvas=document.createElement("canvas");canvas.width=320;canvas.height=320;canvas.setAttribute("aria-label",t('blankWritingArea'));
  const answerLayer=document.createElementNS("http://www.w3.org/2000/svg","svg");answerLayer.classList.add("freewrite-answer-layer");answerLayer.setAttribute("viewBox","0 0 109 109");answerLayer.setAttribute("aria-hidden","true");
  board.append(canvas,answerLayer,createStrokeCredit());area.appendChild(board);

  const verdict=document.createElement("div");verdict.className="freewrite-verdict";verdict.hidden=true;verdict.setAttribute("role","status");area.appendChild(verdict);
  const actions=document.createElement("div");actions.className="freewrite-controls";area.appendChild(actions);

  const ctx=canvas.getContext("2d"),size=canvas.width;
  let expectedStrokes=[],expectedSamples=[],results=[],currentStroke=[];
  let strokeIndex=0,drawing=false,loading=true,checking=false,finished=false;

  function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*size/r.width,y:(e.clientY-r.top)*size/r.height};}
  function renderMeter(){
    meterBars.innerHTML="";
    expectedStrokes.forEach((_,index)=>{
      const bar=document.createElement("span");bar.className="freewrite-meter-bar";
      if(results[index]===true)bar.classList.add("is-correct");
      else if(results[index]===false)bar.classList.add("is-wrong");
      meterBars.appendChild(bar);
    });
    meter.setAttribute("aria-valuemax",String(expectedStrokes.length));meter.setAttribute("aria-valuenow",String(results.length));
    meterLabel.textContent=`${t('stroke')}: ${results.length}/${expectedStrokes.length}`;
  }

  function start(e){
    if(loading||checking||finished||answeredLock)return;
    e.preventDefault();drawing=true;currentStroke=[position(e)];
    try{canvas.setPointerCapture(e.pointerId);}catch(error){}
  }
  function move(e){
    if(!drawing||checking||finished||answeredLock)return;e.preventDefault();
    const next=position(e),last=currentStroke[currentStroke.length-1];if(Math.hypot(next.x-last.x,next.y-last.y)<1.5)return;
    currentStroke.push(next);ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#d7dce2';ctx.lineWidth=9;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(next.x,next.y);ctx.stroke();
  }
  function end(e){
    if(!drawing)return;drawing=false;
    try{canvas.releasePointerCapture(e.pointerId);}catch(error){}
    if(currentStroke.length>1)checkCurrentStroke();
    else currentStroke=[];
  }

  function revealStroke(index,animate){
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d",expectedStrokes[index]);path.dataset.stroke=String(index);answerLayer.appendChild(path);
    if(!animate){path.style.opacity="1";path.style.strokeDasharray="none";path.style.strokeDashoffset="0";return Promise.resolve();}
    return new Promise(resolve=>{
      const length=path.getTotalLength();path.style.strokeDasharray=String(length);path.style.strokeDashoffset=String(length);path.style.opacity="1";
      const duration=360+Math.min(length*2,440),started=performance.now();
      function tick(now){
        if(!path.isConnected){resolve();return;}
        const progress=Math.min((now-started)/duration,1);
        // Start fully hidden (offset = length), then reveal the path from its
        // real start point to its end point (offset = 0).
        path.style.strokeDashoffset=String(length*Math.pow(1-progress,3));
        if(progress<1)requestAnimationFrame(tick);else{path.style.strokeDashoffset="0";resolve();}
      }
      requestAnimationFrame(tick);
    });
  }

  function showNext(){
    finished=true;checking=false;answeredLock=true;board.classList.add("is-answer");
    const ok=results.every(Boolean);board.classList.add(ok?"is-correct":"is-wrong");
    verdict.hidden=false;verdict.className=`freewrite-verdict ${ok?'is-correct':'is-wrong'}`;
    verdict.textContent=ok?t('freeWriteAnswerCorrect'):t('freeWriteAnswerWrong');
    actions.innerHTML="";const next=document.createElement("button");next.className="btn";next.textContent=t('nextQuestion');next.onclick=()=>finishQ(ok,correct);actions.appendChild(next);speak(correct.ch);
  }

  function checkCurrentStroke(){
    if(checking||finished)return;checking=true;answeredLock=true;
    const result=scoreFreeWriteStroke(currentStroke,expectedSamples[strokeIndex]);results[strokeIndex]=result.ok;
    currentStroke=[];ctx.clearRect(0,0,size,size);renderMeter();
    // Both successful strokes and corrections follow the real stroke path.
    revealStroke(strokeIndex,true).then(()=>{
      strokeIndex++;
      if(strokeIndex>=expectedStrokes.length)showNext();
      else{checking=false;answeredLock=false;}
    });
  }

  async function loadStrokeData(){
    loading=true;actions.innerHTML="";meterLabel.textContent=t('loadingStroke');
    try{
      const {paths}=await fetchCharSvgPaths(correct.ch);expectedStrokes=[...paths].map(path=>path.getAttribute('d')).filter(Boolean);if(!expectedStrokes.length)throw new Error('No stroke data');
      expectedSamples=expectedStrokes.map(d=>sampleSvgPath(d,64).points.map(point=>({x:point.x*size/109,y:point.y*size/109})));loading=false;renderMeter();
    }catch(error){
      loading=true;meterLabel.textContent=t('strokeUnavailable');actions.innerHTML="";
      const retry=document.createElement("button");retry.className="btn";retry.textContent=t('retryStrokeLoad');retry.onclick=loadStrokeData;actions.appendChild(retry);
    }
  }

  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  loadStrokeData();
}
