// Stage: "Read" — shown a kana character, pick the matching romaji.
function renderReadStage(area,correct,opts){
  const d=document.createElement("div");d.className="q-char";d.textContent=correct.ch;
  // No click-to-hear here — must answer to hear (that's the point of this stage)
  area.appendChild(d);
  area.appendChild(buildOpts(opts,o=>o.rm,correct,"mc"));
}
