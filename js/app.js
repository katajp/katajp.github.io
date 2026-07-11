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

/* Offline blocker */
function checkOffline(){
  const overlay=document.getElementById("offlineOverlay");
  if(overlay){
    overlay.style.display=navigator.onLine?"none":"flex";
  }
}
window.addEventListener("online", checkOffline);
window.addEventListener("offline", checkOffline);
checkOffline();

/* Version Migration */
const savedVer = localStorage.getItem("kp-version");
if(savedVer !== APP_VERSION) {
  localStorage.removeItem("kp-sessions");
  localStorage.removeItem("kp-vocab-sessions");
  localStorage.setItem("kp-version", APP_VERSION);
  console.log("Upgraded to " + APP_VERSION + ", cleared incompatible legacy sessions.");
  location.reload();
}
