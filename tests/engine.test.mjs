import test from 'node:test';import assert from 'node:assert/strict';import {initialState,advance,explore,startCombat,fight,finishCase,useItem,safeLoad,chooseDilemma} from '../src/engine.js';
test('campaña comienza con primer caso',()=>{const s=initialState();advance(s);assert.equal(s.phase,'map');});
test('investigación conduce a encuentro',()=>{const s=initialState();advance(s);explore(s,0,()=>.99);assert.equal(s.phase,'dilemma');chooseDilemma(s,0);assert.equal(s.phase,'encounter');assert.equal(s.flags.length,1);});
test('fallo penaliza cordura y aumenta marea',()=>{const s=initialState();advance(s);explore(s,0,()=>0);assert.equal(s.sanity,16);assert.equal(s.doom,7);});
test('combate permite derrotar enemigo',()=>{const s=initialState();advance(s);explore(s,0,()=>.99);chooseDilemma(s,0);startCombat(s);for(let i=0;i<5&&s.phase==='combat';i++)fight(s,'attack',()=>.99);assert.equal(s.caseIndex,1);assert.equal(s.phase,'interlude');});
test('campaña puede completarse con final',()=>{const s=initialState();for(let i=0;i<5;i++){s.phase='explore';s.flags.push('success');s.resolve++;finishCase(s);}assert.equal(s.phase,'ending');assert.equal(s.ending,'sellado');});
test('botiquín se consume',()=>{const s=initialState();s.health=10;useItem(s,'medkit');assert.equal(s.health,16);assert.ok(!s.inventory.includes('medkit'));});
test('guardado inválido no se carga',()=>{assert.equal(safeLoad('{'),null);assert.equal(safeLoad('{}'),null);assert.ok(safeLoad(JSON.stringify(initialState())));});
test('muerte finaliza combate',()=>{const s=initialState();s.caseIndex=4;s.health=1;s.phase='encounter';startCombat(s);s.combat.turn=3;fight(s,'attack',()=>.99);assert.equal(s.ending,'muerte');});
