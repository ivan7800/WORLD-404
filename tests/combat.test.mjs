import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,startCombat,fight,nextIntent,safeLoad} from '../src/engine.js';
function battle(i=0){const s=initialState();s.caseIndex=i;s.phase='encounter';startCombat(s);return s;}
test('cada jefe tiene patrones de tres acciones',()=>{for(let i=0;i<5;i++){const s=battle(i);assert.ok(nextIntent(s)?.name);s.combat.turn=2;assert.ok(nextIntent(s)?.kind);s.combat.turn=3;assert.ok(nextIntent(s)?.name);}});
test('estudiar revela debilidad y bloquea parte del golpe',()=>{const s=battle();fight(s,'study',()=>0);assert.equal(s.combat.exposed,true);assert.equal(s.health,20);});
test('ataque preciso consume punto débil',()=>{const s=battle();s.combat.exposed=true;fight(s,'precise',()=>0);assert.equal(s.combat.hp,7);assert.equal(s.combat.exposed,false);});
test('ataque mental afecta cordura',()=>{const s=battle();s.combat.turn=2;fight(s,'attack',()=>0);assert.equal(s.sanity,16);});
test('migración de v3 a v4',()=>{const s=initialState();s.version=3;delete s.combatWins;const loaded=safeLoad(JSON.stringify(s));assert.equal(loaded.version,10);assert.equal(loaded.combatWins,0);});
