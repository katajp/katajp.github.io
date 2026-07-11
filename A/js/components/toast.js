/* ================================================================
   TOAST component — small reusable helper for the "qa-toast" style
   banners used across the quiz/vocab stage-complete messages.
   ================================================================ */
function showToast(elId,message,durationMs=2200){
  const toast=document.getElementById(elId);
  if(!toast)return;
  toast.style.display="block";
  toast.textContent=message;
  setTimeout(()=>{toast.style.display="none";},durationMs);
}
