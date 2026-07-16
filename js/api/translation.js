/* ================================================================
   ENGLISH -> THAI TRANSLATION
   Uses MyMemory's public REST API for vocabulary entries that do not
   already have a curated Thai meaning. Results share the app's
   30-day localStorage cache and gracefully fall back to English.
   ================================================================ */
const THAI_TRANSLATION_ENDPOINT="https://api.mymemory.translated.net/get";

async function translateEnglishToThai(text){
  const source=String(text||"").trim();
  if(!source)return null;
  const cacheKey="translate:en-th:"+source.toLowerCase();
  const cached=cacheGet(cacheKey);
  if(cached)return cached;

  try{
    const url=THAI_TRANSLATION_ENDPOINT+"?q="+encodeURIComponent(source)+"&langpair=en%7Cth&mt=1";
    const resp=await fetch(url,{headers:{Accept:"application/json"}});
    if(!resp.ok)throw new Error("Translation request failed: "+resp.status);
    const data=await resp.json();
    const translated=String(data?.responseData?.translatedText||"").trim();
    if(!translated||translated.toLowerCase()===source.toLowerCase()||/mymemory warning/i.test(translated))return null;
    cacheSet(cacheKey,translated);
    return translated;
  }catch(e){
    console.warn("Thai translation unavailable; using English meaning:",e);
    return null;
  }
}

function vocabMeaning(entry){
  if(!entry)return "";
  return lang==="th"?(entry.meaningTh||entry.meaningThApi||entry.meaning):entry.meaning;
}

async function ensureThaiMeanings(entries){
  if(lang!=="th")return entries;
  const unique=[...new Set((entries||[]).filter(Boolean))];
  await Promise.all(unique.map(async entry=>{
    if(entry.meaningTh||entry.meaningThApi||!entry.meaning)return;
    const translated=await translateEnglishToThai(entry.meaning);
    if(translated)entry.meaningThApi=translated;
  }));
  return entries;
}
