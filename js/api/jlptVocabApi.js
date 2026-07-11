/* ================================================================
   JLPT VOCAB API — optional, additional word bank pulled from the
   public jlpt-vocab-api project (https://github.com/wkei/jlpt-vocab-api,
   hosted at jlpt-vocab-api.vercel.app). Unlike Jotoba (js/api/dictionary.js),
   this source DOES tag every word with a JLPT level, which is exactly
   what's thin in the local N3/N2/N1 lists.

   This is purely additive and opt-in (see the "Load extra words online"
   toggle in js/stages/vocabulary.js): the curated local list in
   js/data/vocabulary.js remains the source of truth for categorized,
   Thai-translated practice. Extra words from this API have no Thai
   translation and are grouped into the "extra" category. Every call
   is wrapped so the app keeps working offline or if the API is down —
   it just falls back to the local list only.
   ================================================================ */
const JLPT_VOCAB_API_ENDPOINT="https://jlpt-vocab-api.vercel.app/api/words/all";

// Lookup of every online-extra word seen this session, keyed by written
// form, so "Review Mistakes" can find them even though they're not in
// the local js/data/vocabulary.js list.
const EXTRA_WORDS_INDEX={};

// "N3" -> 3 (the API numbers levels the same way JLPT does: N1 hardest ... N5 easiest)
function jlptLabelToApiLevel(levelLabel){
  return Number(String(levelLabel).replace("N",""));
}

// Fetches every word for one JLPT level from the API, caches the
// result for 30 days (shared cache helper in js/api/cache.js) so
// repeat visits don't re-hit the network, and maps it into the same
// shape used by js/data/vocabulary.js so it can drop straight into
// the existing quiz pool.
async function fetchJlptLevelWords(levelLabel){
  const cacheKey="jlptvocab:"+levelLabel;
  const cached=cacheGet(cacheKey);
  if(cached){cached.forEach(w=>{EXTRA_WORDS_INDEX[w.word]=w;});return cached;}

  try{
    const level=jlptLabelToApiLevel(levelLabel);
    const resp=await fetch(JLPT_VOCAB_API_ENDPOINT+"?level="+level);
    if(!resp.ok)throw new Error("JLPT vocab API request failed: "+resp.status);
    const data=await resp.json();
    const raw=Array.isArray(data)?data:(data.words||[]);
    const words=raw
      .filter(w=>w.word&&w.meaning)
      .map(w=>({
        word:w.word,
        reading:w.furigana||w.word,
        meaning:w.meaning,
        meaningTh:null,
        jlpt:levelLabel,
        category:"extra",
        source:"jlptvocab"
      }));
    words.forEach(w=>{EXTRA_WORDS_INDEX[w.word]=w;});
    cacheSet(cacheKey,words);
    return words;
  }catch(e){
    console.warn("JLPT vocab API lookup failed, staying with the local word list:",e);
    return [];
  }
}

// Fetches and merges extra words for several levels at once, skipping
// any word already present in the local list (by written form) so the
// same word never appears twice in one quiz pool.
async function fetchJlptExtraWords(levelLabels){
  const results=await Promise.all(levelLabels.map(fetchJlptLevelWords));
  const localWords=new Set(VOCABULARY.map(w=>w.word));
  const seen=new Set();
  const merged=[];
  results.flat().forEach(w=>{
    if(localWords.has(w.word)||seen.has(w.word))return;
    seen.add(w.word);
    merged.push(w);
  });
  return merged;
}
