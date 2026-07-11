/* ================================================================
   APP ENTRY POINT — runs once every script above has loaded.
   ================================================================ */
document.getElementById("versionBadge").textContent=APP_VERSION;
renderChart();
renderQuizSetup();
loadWriteChar();
initNavLabels();
