/* ================================================================
   ROUTER — generic "switch to this panel" logic, decoupled from the
   actual nav bar buttons (those live in js/ui/navigation.js).
   ================================================================ */
function switchTab(tabName){
  document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  const btn=document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
  if(btn)btn.classList.add("active");
  const panel=document.getElementById("panel-"+tabName);
  if(panel)panel.classList.add("active");
  if(tabName==="progress")refreshProgress();
  if(tabName==="quiz")renderQuizSetup();
  if(tabName==="vocab")renderVocabSetup();
}
