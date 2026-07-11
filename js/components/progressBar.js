/* ================================================================
   PROGRESS BAR component — small reusable helper for the
   "qa-bar-out / qa-bar-in" style progress bars.
   ================================================================ */
function updateProgressBar(barSelector,labelSelector,labelText,pct){
  const bar=document.querySelector(barSelector);
  if(bar)bar.style.width=pct+"%";
  const label=document.querySelector(labelSelector);
  if(label)label.innerHTML=`<span>${labelText}</span><span>${pct}%</span>`;
}
