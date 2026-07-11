/* ================================================================
   JOTOBA DICTIONARY API
   ================================================================
   Thin wrapper around Jotoba's public Japanese dictionary API
   (https://jotoba.de). Used to double-check readings and pull a
   real example sentence for vocabulary words. This is a nice-to-have
   enrichment layer, not a hard dependency — every call is wrapped so
   the app keeps working (using the local word list in
   js/data/vocabulary.js) if the network request fails or Jotoba is
   unreachable.
   ================================================================ */
const JOTOBA_ENDPOINT="https://jotoba.de/api/search/words";

// Looks up a word on Jotoba. Returns the raw API response's `words`
// array, or an empty array if the request fails for any reason.
async function jotobaSearch(query){
  const cacheKey="search:"+query;
  const cached=cacheGet(cacheKey);
  if(cached)return cached;

  try{
    const resp=await fetch(JOTOBA_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({query,language:"English",no_english:false})
    });
    if(!resp.ok)throw new Error("Jotoba request failed: "+resp.status);
    const data=await resp.json();
    const words=data.words||[];
    cacheSet(cacheKey,words);
    return words;
  }catch(e){
    console.warn("Jotoba lookup failed, falling back to local data:",e);
    return [];
  }
}

// Pulls one short example sentence (Japanese + English) for a word,
// if Jotoba has one indexed. Returns null if none is available.
function extractExampleSentence(jotobaWord){
  if(!jotobaWord||!jotobaWord.senses)return null;
  for(const sense of jotobaWord.senses){
    if(sense.example){
      return {
        jp: sense.example.sentence||null,
        en: sense.example.translation||null
      };
    }
  }
  return null;
}
