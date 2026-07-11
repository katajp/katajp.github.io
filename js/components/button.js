/* ================================================================
   BUTTON component — small factory for the plain buttons used
   throughout the setup/session screens, to cut down on repeated
   document.createElement("button") boilerplate.
   ================================================================ */
function createButton(text,className,onClick){
  const b=document.createElement("button");
  b.className=className;
  b.textContent=text;
  if(onClick)b.onclick=onClick;
  return b;
}
