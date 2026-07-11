/* ================================================================
   APP ENTRY POINT — runs once every script above has loaded.
   ================================================================ */
document.getElementById("versionBadge").textContent=APP_VERSION;
renderChart();
renderQuizSetup();
loadWriteChar();
initNavLabels();
/* Apply initial tab from URL hash, if any */
if(location.hash){
  const h=location.hash.slice(1);
  if(typeof VALID_TABS !== 'undefined' && VALID_TABS.includes(h)) {
    switchTab(h);
  }
}
