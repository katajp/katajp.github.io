/* ================================================================
   TTS — browser's built-in Japanese voice (prefers Google's, if present)
   ================================================================
   No settings needed: this just asks the browser for its Japanese
   voices and prefers one made by Google (e.g. "Google 日本語" on
   Chrome/Android), falling back to whatever Japanese voice is
   available on the device.
   ================================================================ */
let _jaVoice=null;
let _voicesLoaded=false;

function loadJaVoice(){
  const voices=speechSynthesis.getVoices();
  if(!voices.length)return;
  _voicesLoaded=true;
  const jaVoices=voices.filter(v=>v.lang&&v.lang.startsWith('ja'));
  _jaVoice=jaVoices.find(v=>/google/i.test(v.name))||jaVoices[0]||null;
}
if(speechSynthesis.onvoiceschanged!==undefined) speechSynthesis.onvoiceschanged=loadJaVoice;
loadJaVoice();

function speak(t){
  try{
    speechSynthesis.cancel();
    if(!_voicesLoaded)loadJaVoice();
    const u=new SpeechSynthesisUtterance(t);
    u.lang='ja-JP'; u.rate=0.85;
    if(_jaVoice) u.voice=_jaVoice;
    speechSynthesis.speak(u);
  }catch(e){}
}

