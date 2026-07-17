// Stage: "Free Write" — draw from memory and match each real stroke at 70% or above.

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
  const area=document.getElementById("qaArea");
  area.innerHTML="";answeredLock=false;

  const prompt=document.createElement("div");prompt.className="q-romaji";prompt.textContent=correct.rm;area.appendChild(prompt);
  const info=document.createElement("div");info.className="freewrite-instruction";info.textContent=t('drawFromMemory');area.appendChild(info);

  const meter=document.createElement("div");meter.className="freewrite-meter";meter.setAttribute("role","progressbar");meter.setAttribute("aria-valuemin","0");
  const meterLabel=document.createElement("div");meterLabel.className="freewrite-meter-label";meterLabel.textContent=t('loadingStroke');
  const meterBars=document.createElement("div");meterBars.className="freewrite-meter-bars";meter.append(meterLabel,meterBars);area.appendChild(meter);

  const board=document.createElement("div");board.className="freewrite-board";
  const canvas=document.createElement("canvas");canvas.width=320;canvas.height=320;canvas.setAttribute("aria-label",t('blankWritingArea'));
  const answerLayer=document.createElementNS("http://www.w3.org/2000/svg","svg");answerLayer.classList.add("freewrite-answer-layer");answerLayer.setAttribute("viewBox","0 0 109 109");answerLayer.setAttribute("aria-hidden","true");
  board.append(canvas,answerLayer);area.appendChild(board);

  const verdict=document.createElement("div");verdict.className="freewrite-verdict";verdict.hidden=true;verdict.setAttribute("role","status");area.appendChild(verdict);
  const actions=document.createElement("div");actions.className="freewrite-controls";area.appendChild(actions);

  const ctx=canvas.getContext("2d"),size=canvas.width;
  let expectedStrokes=[],expectedSamples=[],userStrokes=[],currentStroke=[];
  let drawing=false,loading=true,checking=false,finished=false,attempt=1,maxAttempts=0;

  function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*size/r.width,y:(e.clientY-r.top)*size/r.height};}

  function renderMeter(results){
    meterBars.innerHTML="";
    expectedStrokes.forEach((_,index)=>{
      const bar=document.createElement("span");bar.className="freewrite-meter-bar";
      if(results)bar.classList.add(results[index].ok?"is-correct":"is-wrong");
      else if(index<userStrokes.length)bar.classList.add("is-drawn");
      meterBars.appendChild(bar);
    });
    meter.setAttribute("aria-valuemax",String(expectedStrokes.length));meter.setAttribute("aria-valuenow",String(userStrokes.length));
    meterLabel.textContent=`${t('attempt')} ${attempt}/${maxAttempts} — ${t('stroke')}: ${Math.min(userStrokes.length,expectedStrokes.length)}/${expectedStrokes.length}`;
  }

  // A stroke must cover and stay near at least 70% of its real SVG path.

  function start(e){if(loading||checking||finished||answeredLock)return;e.preventDefault();drawing=true;currentStroke=[position(e)];try{canvas.setPointerCapture(e.pointerId);}catch(err){}}
  function move(e){
    if(!drawing||checking||finished||answeredLock)return;e.preventDefault();
    const next=position(e),last=currentStroke[currentStroke.length-1];if(Math.hypot(next.x-last.x,next.y-last.y)<1.5)return;
    currentStroke.push(next);ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#171815';ctx.lineWidth=9;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(next.x,next.y);ctx.stroke();
  }
  function end(e){
    if(!drawing)return;drawing=false;try{canvas.releasePointerCapture(e.pointerId);}catch(err){}
    if(currentStroke.length>1){userStrokes.push(currentStroke);renderMeter();if(userStrokes.length===expectedStrokes.length)evaluateWriting();}
    currentStroke=[];
  }

  function resetAttempt(){
    ctx.clearRect(0,0,size,size);userStrokes=[];currentStroke=[];drawing=false;checking=false;answeredLock=false;
    board.classList.remove("is-correct","is-wrong","is-answer");answerLayer.classList.remove("is-correct");answerLayer.innerHTML="";verdict.hidden=true;renderMeter();
  }
  function showVerdict(ok,message){verdict.hidden=false;verdict.className=`freewrite-verdict ${ok?'is-correct':'is-wrong'}`;verdict.textContent=message;board.classList.add(ok?'is-correct':'is-wrong');}
  function animateAnswer(indexes,tone){
    answerLayer.innerHTML="";answerLayer.classList.toggle("is-correct",tone==='correct');board.classList.add("is-answer");
    indexes.forEach(index=>{const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d",expectedStrokes[index]);answerLayer.appendChild(path);});
    const paths=[...answerLayer.querySelectorAll("path")];
    return paths.reduce((chain,path)=>chain.then(()=>new Promise(resolve=>{
      const length=path.getTotalLength();path.style.strokeDasharray=String(length);path.style.strokeDashoffset=String(length);path.style.opacity="1";
      const duration=360+Math.min(length*2,440),started=performance.now();
      function tick(now){if(!path.isConnected){resolve();return;}const progress=Math.min((now-started)/duration,1);path.style.strokeDashoffset=String(length*(1-Math.pow(1-progress,3)));if(progress<1)requestAnimationFrame(tick);else setTimeout(resolve,140);}
      requestAnimationFrame(tick);
    })),Promise.resolve());
  }
  function showNext(ok,message){
    finished=true;checking=false;answeredLock=true;showVerdict(ok,message);actions.innerHTML="";
    const next=document.createElement("button");next.className="btn";next.textContent=t('nextQuestion');next.onclick=()=>finishQ(ok,correct);actions.appendChild(next);
  }
  function evaluateWriting(){
    if(checking||finished)return;checking=true;answeredLock=true;
    const results=expectedSamples.map((sample,index)=>scoreFreeWriteStroke(userStrokes[index]||[],sample));renderMeter(results);
    const ok=results.every(result=>result.ok);
    if(ok){
      meterLabel.textContent=t('revealingStrokes');animateAnswer(expectedStrokes.map((_,index)=>index),'correct').then(()=>{speak(correct.ch);showNext(true,t('freeWriteAnswerCorrect'));});
      return;
    }
    const failedIndex=results.findIndex(result=>!result.ok);attempt++;
    meterLabel.textContent=t('revealingStrokes');showVerdict(false,t('freeWriteTryAgain'));
    animateAnswer([failedIndex],'wrong').then(()=>{
      if(attempt>maxAttempts){
        meterLabel.textContent=t('revealingStrokes');animateAnswer(expectedStrokes.map((_,index)=>index),'wrong').then(()=>{speak(correct.ch);showNext(false,t('freeWriteAnswerWrong'));});
      }else setTimeout(resetAttempt,650);
    });
  }
  function showManualFallback(){
    loading=false;meterLabel.textContent=t('strokeFallback');actions.innerHTML="";
    const reveal=document.createElement("button");reveal.className="btn";reveal.textContent=t('revealAnswer');reveal.onclick=()=>{showNext(false,`${t('answerIs')}: ${correct.ch}`);};actions.appendChild(reveal);
  }

  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  (async()=>{
    try{
      const {paths}=await fetchCharSvgPaths(correct.ch);expectedStrokes=[...paths].map(path=>path.getAttribute('d')).filter(Boolean);if(!expectedStrokes.length)throw new Error('No stroke data');maxAttempts=expectedStrokes.length;
      expectedSamples=expectedStrokes.map(d=>sampleSvgPath(d,64).points.map(point=>({x:point.x*size/109,y:point.y*size/109})));loading=false;renderMeter();
    }catch(error){showManualFallback();}
  })();
}
