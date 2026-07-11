/* ================================================================
   TIMER component — optional countdown timer, ready for a future
   timed-quiz-mode feature. Not currently wired into any stage.
   ================================================================ */
function createCountdownTimer(seconds,onTick,onDone){
  let remaining=seconds;
  const handle=setInterval(()=>{
    remaining--;
    if(onTick)onTick(remaining);
    if(remaining<=0){
      clearInterval(handle);
      if(onDone)onDone();
    }
  },1000);
  return handle; // caller can clearInterval(handle) to cancel early
}
