import {STORAGE,V9_STORAGE,V8_STORAGE,V7_STORAGE,V6_STORAGE,V5_STORAGE,V4_STORAGE,V3_STORAGE,PREVIOUS_STORAGE,LEGACY_STORAGE,safeLoad} from './engine.js';

// Keep all historical keys intact: migrating never deletes the original.
export const SAVE_KEYS=[STORAGE,V9_STORAGE,V8_STORAGE,V7_STORAGE,V6_STORAGE,V5_STORAGE,V4_STORAGE,V3_STORAGE,PREVIOUS_STORAGE,LEGACY_STORAGE];
export const BACKUP_KEY=STORAGE+'-backup';

/** Restore first valid current, backup or historical campaign. No writes. */
export function loadProgress(storage,keys=SAVE_KEYS){
 if(!storage)return null;
 for(const key of [keys[0],BACKUP_KEY,...keys.slice(1)]){
  try {const raw=storage.getItem(key);if(!raw)continue;const state=safeLoad(raw);if(state)return {state,source:key};}
  catch { /* storage may be denied, blocked or corrupt */ }
 }
 return null;
}

/** Validate and create a recoverable snapshot BEFORE overwriting current data. */
export function saveProgress(storage,state,key=STORAGE){
 if(!storage)return false;
 let encoded;
 try {encoded=JSON.stringify(state);if(!safeLoad(encoded))return false;}catch{return false;}
 try {
  const previous=storage.getItem(key);
  if(previous&&previous!==encoded&&safeLoad(previous))storage.setItem(BACKUP_KEY,previous);
  storage.setItem(key,encoded);
  return true;
 }catch{return false;}
}
