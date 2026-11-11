import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,safeLoad,advance} from '../src/engine.js';
import {loadProgress,saveProgress,SAVE_KEYS,BACKUP_KEY} from '../src/save-store.js';

function fakeStorage(){
 const items=new Map();
 return {items,getItem:key=>items.get(key)??null,setItem:(key,val)=>items.set(key,String(val))};
}
test('v2: guardado válido tiene copia previa recuperable',()=>{
 const storage=fakeStorage(),s=initialState(1987);
 assert.equal(saveProgress(storage,s),true);
 advance(s);
 assert.equal(saveProgress(storage,s),true);
 assert.equal(safeLoad(storage.getItem(BACKUP_KEY)).phase,'intro');
 assert.equal(loadProgress(storage).state.phase,'map');
});
test('v2: carga desde copia si el guardado principal está corrupto',()=>{
 const storage=fakeStorage(),s=initialState(4);
 assert.equal(saveProgress(storage,s),true);
 storage.setItem(SAVE_KEYS[0],'{incorrecto');
 const restored=loadProgress(storage);
 assert.equal(restored, null); // no backup exists yet
 storage.setItem(BACKUP_KEY,JSON.stringify(s));
 assert.equal(loadProgress(storage).source,BACKUP_KEY);
});
test('v2: importaciones malformadas o sobredimensionadas no se aceptan',()=>{
 const s=initialState();
 assert.equal(safeLoad(' '.repeat(1024*1024+1)),null);
 s.currentDistrict='ruta-inventada';
 assert.equal(safeLoad(JSON.stringify(s)),null);
 s.currentDistrict=null;s.decisions=[null];
 assert.equal(safeLoad(JSON.stringify(s)),null);
});
test('v2: cambios inválidos no pisan un guardado existente',()=>{
 const storage=fakeStorage(),s=initialState(5);
 assert.equal(saveProgress(storage,s),true);const original=storage.getItem(SAVE_KEYS[0]);
 s.health=-100;
 assert.equal(saveProgress(storage,s),false);
 assert.equal(storage.getItem(SAVE_KEYS[0]),original);
});
test('v2: fallos de cuota no producen falsos positivos',()=>{
 const storage={getItem:()=>null,setItem:()=>{throw Error('QuotaExceededError')}};
 assert.equal(saveProgress(storage,initialState()),false);
});
test('v2: migración mantiene guardados antiguos y nuevas partidas',()=>{
 const storage=fakeStorage(),s=initialState(17);
 s.version=9;delete s.omens;delete s.preparedSeals;
 storage.setItem(SAVE_KEYS[1],JSON.stringify(s));
 assert.equal(loadProgress(storage).state.version,10);
 assert.equal(loadProgress(storage).source,SAVE_KEYS[1]);
});
