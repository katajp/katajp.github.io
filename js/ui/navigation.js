/* ================================================================
   NAVIGATION — wires the top nav bar buttons to the router.
   ================================================================ */
document.querySelectorAll(".nav-btn").forEach(t=>{
  t.onclick=()=>switchTab(t.dataset.tab);
});
