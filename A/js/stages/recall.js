// Stage: "Recall" — shown romaji, pick the matching kana character.
function renderRecallStage(area,correct,opts){
  const d=document.createElement("div");d.className="q-romaji";d.textContent=correct.rm;
  area.appendChild(d);
  area.appendChild(buildOpts(opts,o=>o.ch,correct,"rev"));
}
