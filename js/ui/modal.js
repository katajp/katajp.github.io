// Character detail modal with animated KanjiVG stroke order.

/* ===== Character Detail Modal with KanjiVG stroke order ===== */
const _svgCache={};

function showCharDetail(ch,rm,script){
  // Remove existing modal
  const existing=document.querySelector('.char-modal-overlay');
  if(existing)existing.remove();

  const overlay=document.createElement('div');
  overlay.className='char-modal-overlay';
  overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};

  const modal=document.createElement('div');
  modal.className='char-modal';

  // Close button
  const closeBtn=document.createElement('button');
  closeBtn.className='char-modal-close';closeBtn.textContent='✕';
  closeBtn.onclick=()=>overlay.remove();
  modal.appendChild(closeBtn);

  // Character
  const charDiv=document.createElement('div');
  charDiv.className='char-modal-char';charDiv.textContent=ch;
  modal.appendChild(charDiv);

  // Romaji
  const rmDiv=document.createElement('div');
  rmDiv.className='char-modal-romaji'+(script==='katakana'?' kata-rm':'');
  rmDiv.textContent=rm;
  modal.appendChild(rmDiv);

  // Stroke order container
  const strokeDiv=document.createElement('div');
  strokeDiv.className='char-modal-stroke';
  strokeDiv.id='strokeContainer';
  strokeDiv.innerHTML='<div style="color:var(--ink3);font-size:13px;padding:20px;">Loading stroke order...</div>';
  modal.appendChild(strokeDiv);

  // Replay button
  const replayDiv=document.createElement('div');
  replayDiv.style.cssText='text-align:center;margin-bottom:12px;';
  const replayBtn=document.createElement('button');
  replayBtn.className='btn';replayBtn.style.cssText='background:var(--ink3);font-size:12px;padding:6px 16px;';
  replayBtn.textContent='🔄 Replay';
  replayBtn.onclick=()=>loadAndAnimateStrokes(ch,strokeDiv);
  replayDiv.appendChild(replayBtn);
  modal.appendChild(replayDiv);

  // Listen button
  const listenDiv=document.createElement('div');
  listenDiv.className='char-modal-listen';
  const listenBtn=document.createElement('button');
  listenBtn.textContent='🔊 Listen';
  listenBtn.onclick=()=>speak(ch);
  listenDiv.appendChild(listenBtn);
  modal.appendChild(listenDiv);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Load strokes from KanjiVG
  loadAndAnimateStrokes(ch,strokeDiv);

  // Auto-speak
  speak(ch);

  // Close on Escape
  function onKey(e){if(e.key==='Escape'){overlay.remove();document.removeEventListener('keydown',onKey);}}
  document.addEventListener('keydown',onKey);
}

async function fetchCharSvgPaths(ch){
  const code=ch.codePointAt(0).toString(16).padStart(5,'0');
  const url=`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  let svgText;
  if(_svgCache[code]){svgText=_svgCache[code];}
  else{const resp=await fetch(url);if(!resp.ok)throw new Error('Not found');svgText=await resp.text();_svgCache[code]=svgText;}
  const parser=new DOMParser();
  const doc=parser.parseFromString(svgText,'image/svg+xml');
  return {paths:doc.querySelectorAll('path[id*="-s"]'),nums:doc.querySelectorAll('g[id*="StrokeNumbers"] text'),
    vb:doc.querySelector('svg')?.getAttribute('viewBox')||'0 0 109 109'};
}

function buildStrokeSVG(paths,nums,vb,strokeColor,ghostColor,numColor,width){
  let h=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${width}" height="${width}" style="display:block;margin:0 auto;">`;
  paths.forEach(p=>{h+=`<path d="${p.getAttribute('d')}" fill="none" stroke="${ghostColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;});
  paths.forEach((p,i)=>{h+=`<path class="stroke-anim" data-idx="${i}" d="${p.getAttribute('d')}" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="opacity:0;"/>`;});
  nums.forEach(tn=>{h+=`<text transform="${tn.getAttribute('transform')||''}" font-size="8" fill="${numColor}" font-weight="700" font-family="var(--font)">${tn.textContent}</text>`;});
  h+=`</svg>`;return h;
}

async function loadAndAnimateStrokes(ch,container){
  const strokeColor=getComputedStyle(document.body).getPropertyValue('--hira').trim()||'#2d8a6e';
  const ghostColor=getComputedStyle(document.body).getPropertyValue('--border2').trim()||'rgba(0,0,0,0.12)';
  const numColor=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#e05545';

  try{
    const chars=[...ch]; // split into individual chars
    const svgWidth=chars.length>1?140:200;
    let html='<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">';

    for(const c of chars){
      const {paths,nums,vb}=await fetchCharSvgPaths(c);
      if(!paths.length)continue;
      html+=`<div style="text-align:center;"><div class="stroke-char-block">${buildStrokeSVG(paths,nums,vb,strokeColor,ghostColor,numColor,svgWidth)}</div>`;
      if(chars.length>1) html+=`<div style="font-family:var(--font-jp);font-size:18px;margin-top:4px;color:var(--ink);">${c}</div>`;
      html+=`</div>`;
    }
    html+='</div>';
    container.innerHTML=html;

    // Animate all blocks sequentially
    const blocks=container.querySelectorAll('.stroke-char-block');
    animateBlocksSequentially(blocks,0);

  } catch(e){
    container.innerHTML=`<div style="text-align:center;padding:16px;">
      <div style="font-family:var(--font-jp);font-size:120px;color:var(--ink);line-height:1;">${ch}</div>
      <div style="color:var(--ink3);font-size:12px;margin-top:8px;">Stroke order data unavailable</div>
    </div>`;
  }
}

function animateBlocksSequentially(blocks,idx){
  if(idx>=blocks.length){
    // Loop: restart after 2 seconds, but only if modal is still in the DOM
    setTimeout(()=>{
      if(!document.querySelector('.char-modal-overlay')) return; /* modal closed */
      blocks.forEach(b=>{b.querySelectorAll('.stroke-anim').forEach(p=>{p.style.opacity='0';p.style.strokeDashoffset=p.style.strokeDasharray;});});
      animateBlocksSequentially(blocks,0);
    },2000);
    return;
  }
  /* Stop if modal was closed mid-animation */
  if(!document.querySelector('.char-modal-overlay')) return;
  const paths=blocks[idx].querySelectorAll('.stroke-anim');
  animateStrokePaths(paths,0,()=>animateBlocksSequentially(blocks,idx+1));
}

function animateStrokePaths(paths,index,onComplete){
  if(index>=paths.length){if(onComplete)onComplete();return;}
  if(!document.querySelector('.char-modal-overlay')) return; /* modal closed */
  const path=paths[index];
  const length=path.getTotalLength();

  // Reset before animating
  path.style.opacity='1';
  path.style.strokeDasharray=length+'px';
  path.style.strokeDashoffset=length+'px';
  path.style.strokeWidth='4.5';

  const duration=350+Math.min(length*1.8,500);
  const start=performance.now();

  function tick(now){
    if(!document.querySelector('.char-modal-overlay')) return; /* modal closed */
    const elapsed=now-start;
    const progress=Math.min(elapsed/duration,1);
    // Smooth ease-in-out curve
    const eased=progress<0.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;
    path.style.strokeDashoffset=(length*(1-eased))+'px';

    if(progress<1){
      requestAnimationFrame(tick);
    } else {
      path.style.strokeDashoffset='0';
      path.style.strokeWidth='4';
      // Next stroke after small delay
      setTimeout(()=>animateStrokePaths(paths,index+1,onComplete),120);
    }
  }
  requestAnimationFrame(tick);
}

