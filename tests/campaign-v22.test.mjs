import test from 'node:test';
import assert from 'node:assert/strict';
import {
 initialState, advance, visitLocation, investigateScene, collectedEvidence, availablePuzzle,
 solvePuzzle, canPrepareSeal, availableEcho, resolveEcho, safeLoad, startCombat, fight
} from '../src/engine.js';
import {saveProgress, loadProgress} from '../src/save-store.js';

test('las pruebas sobreviven a tiradas fallidas y un error de deducción no autoriza un sello',()=>{
 const s=initialState(404);
 advance(s);
 for(let i=0;i<2;i++){visitLocation(s,i);investigateScene(s,0,()=>0);}
 assert.equal(collectedEvidence(s).length,2);
 assert.ok(availablePuzzle(s));
 solvePuzzle(s,0);
 const restored=safeLoad(JSON.stringify(s));
 assert.deepEqual(restored.failedDeductions,['faro']);
 assert.equal(availablePuzzle(restored),null);
 restored.phase='encounter';
 assert.equal(canPrepareSeal(restored),false);
});

test('las dos decisiones de la cinta sobreviven al guardado y no se repiten',()=>{
 for(const choice of [0,1]){
  const storage=new Map();
  const disk={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
  const s=initialState(404);
  advance(s);
  visitLocation(s,0);investigateScene(s,0,()=>0);
  visitLocation(s,1);investigateScene(s,0,()=>0.99);
  assert.ok(availableEcho(s));
  resolveEcho(s,choice);
  assert.equal(saveProgress(disk,s),true);
  const restored=loadProgress(disk).state;
  assert.deepEqual(restored.echoes,['faro']);
  assert.equal(availableEcho(restored),null);
 }
});

test('cubrirse con la concentración agotada mitiga el daño y consume turno',()=>{
 const s=initialState(404);
 s.phase='encounter';
 startCombat(s);
 s.inventory=[];
 s.combat.focusUses=2;
 fight(s,'guard',()=>0);
 assert.equal(s.combat.turn,2);
 assert.equal(s.health,s.maxHealth);
 assert.equal(s.combat.focusUses,2);
});
