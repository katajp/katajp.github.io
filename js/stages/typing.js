// Stage: "Type" — shown a kana character, type its romaji.
function renderTypingStage(area,fb,correct){
  const d=document.createElement("div");d.className="q-char";d.textContent=correct.ch;d.onclick=()=>speak(correct.ch);
  area.appendChild(d);
  const inp=document.createElement("input");inp.className="q-input";inp.placeholder="type romaji";
  area.appendChild(inp);
  const btn=document.createElement("button");btn.className="btn";btn.textContent="Check ✅";
  area.appendChild(btn);
  function sub(){
    if(answeredLock)return;answeredLock=true;
    const v=inp.value.trim().toLowerCase();const ok=v===correct.rm;
    inp.classList.add(ok?"correct":"wrong");inp.disabled=true;btn.disabled=true;
    if(ok){fb.textContent="Correct! 🎉";fb.className="feedback good";speak(correct.ch);}
    else{fb.innerHTML=`Wrong! <span style="font-family:var(--font-jp)">${correct.ch}</span> = <b>${correct.rm}</b>`;fb.className="feedback bad";setTimeout(()=>speak(correct.ch),300);}
    finishQ(ok,correct);
  }
  btn.onclick=sub;inp.onkeydown=e=>{if(e.key==="Enter")sub();};
  setTimeout(()=>inp.focus(),50);
}
