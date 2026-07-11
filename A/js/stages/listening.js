// Stage: "Listen" — hear the audio, pick the matching kana character.
function renderListeningStage(area,correct,opts){
  const sb=document.createElement("button");sb.className="speak-btn";sb.textContent="🔊";sb.onclick=()=>speak(correct.ch);
  area.appendChild(sb);speak(correct.ch);
  area.appendChild(buildOpts(opts,o=>o.ch,correct,"listen"));
}
