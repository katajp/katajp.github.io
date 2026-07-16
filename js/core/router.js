/* ================================================================
   ROUTER — generic "switch to this panel" logic, decoupled from the
   actual nav bar buttons (those live in js/ui/navigation.js).
   ================================================================ */
const VALID_TABS=["chart","quiz","vocab","progress"];
function switchTab(tabName){
  if(!VALID_TABS.includes(tabName)) tabName="chart";
  document.querySelectorAll(".nav-btn").forEach(x=>{
    x.classList.remove("active");
    x.removeAttribute("aria-current");
  });
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  const btn=document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
  if(btn){btn.classList.add("active");btn.setAttribute("aria-current","page");}
  const panel=document.getElementById("panel-"+tabName);
  if(panel)panel.classList.add("active");
  if(tabName==="progress")refreshProgress();
  if(tabName==="quiz")renderQuizSetup();
  if(tabName==="vocab")renderVocabSetup();
  location.hash=tabName;
}
/* Listen for browser back/forward */
window.addEventListener("hashchange",()=>{
  const h=location.hash.slice(1);
  if(h)switchTab(h);
});
