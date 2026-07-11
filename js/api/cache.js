/* ================================================================
   API CACHE — simple localStorage cache so repeat lookups of the
   same word don't re-hit the Jotoba API every time.
   ================================================================ */
const API_CACHE_KEY="kp-jotoba-cache";
const API_CACHE_TTL_MS=1000*60*60*24*30; // 30 days — dictionary entries don't change

function _loadApiCache(){
  try{return JSON.parse(localStorage.getItem(API_CACHE_KEY)||"{}");}catch(e){return {};}
}
function _saveApiCache(cache){
  try{localStorage.setItem(API_CACHE_KEY,JSON.stringify(cache));}catch(e){/* storage full/unavailable — ignore, just skip caching */}
}

function cacheGet(key){
  const cache=_loadApiCache();
  const entry=cache[key];
  if(!entry)return null;
  if(Date.now()-entry.t>API_CACHE_TTL_MS){delete cache[key];_saveApiCache(cache);return null;}
  return entry.v;
}
function cacheSet(key,value){
  const cache=_loadApiCache();
  cache[key]={v:value,t:Date.now()};
  _saveApiCache(cache);
}
