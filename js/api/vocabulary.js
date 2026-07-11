/* ================================================================
   VOCABULARY ENRICHMENT — merges the local seed word list
   (js/data/vocabulary.js) with live data from Jotoba when available.
   ================================================================
   This never blocks the UI: callers should render the question with
   the local word data immediately, then call enrichWord() in the
   background and patch in the extra info (example sentence) if/when
   it resolves.
   ================================================================ */

async function enrichWord(vocabEntry){
  try{
    const results=await jotobaSearch(vocabEntry.word);
    if(!results.length)return null;
    // Prefer an exact reading match if Jotoba returned multiple entries
    const match=results.find(w=>w.reading&&w.reading.kana===vocabEntry.reading)||results[0];
    const example=extractExampleSentence(match);
    return {
      confirmedReading: match.reading?match.reading.kana:null,
      example
    };
  }catch(e){
    console.warn("Vocabulary enrichment failed:",e);
    return null;
  }
}

function filterVocabulary(selJlpt,selCategories){
  return VOCABULARY.filter(w=>
    (!selJlpt.size||selJlpt.has(w.jlpt)) &&
    (!selCategories.size||selCategories.has(w.category))
  );
}
