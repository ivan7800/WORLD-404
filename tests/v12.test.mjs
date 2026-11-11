import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,visitLocation,investigateScene,availableAnomaly,startAnomaly,resolveAnomaly, fight, safeLoad, nextIntent, STORAGE} from '../src/engine.js';
import {ANOMALIES} from '../src/anomalies.js';
const high=()=>.999;
function ready(i=0){const s=initialState();s.caseIndex=i;advance(s);visitLocation(s,0);investigateScene(s,0,high);return s;}
test('cinco anomalías originales desbloqueadas tras investigar',()=>{for(let i=0;i<5;i++){const s=ready(i);assert.equal(availableAnomaly(s),ANOMALIES[Object.keys(ANOMALIES)[i]]);}});
test('ritual correcto: recompensa única y bloqueo de repetición',()=>{const s=ready();startAnomaly(s);resolveAnomaly(s,0,high);assert.equal(s.anomalies.length,1);assert.equal(s.resolve,1);assert.equal(availableAnomaly(s),null);});
test('ritual fallido: pérdida de cordura y peligro',()=>{const s=ready();startAnomaly(s);const sanity=s.sanity,doom=s.doom;resolveAnomaly(s,0,()=>0);assert.equal(s.sanity,sanity-2);assert.equal(s.doom,doom+6);});
test('combate opcional usa nombre, patrón y salud específicos',()=>{const s=ready();startAnomaly(s);resolveAnomaly(s,1);assert.equal(s.phase,'combat');assert.equal(s.combat.optional,true);assert.equal(s.combat.hp,ANOMALIES.faro.hp);assert.deepEqual(nextIntent(s),ANOMALIES.faro.pattern[0]);});
test('vencer encuentro opcional no finaliza expediente',()=>{const s=ready();startAnomaly(s);resolveAnomaly(s,1);s.combat.hp=1;const idx=s.caseIndex;fight(s,'attack',high);assert.equal(s.phase,'map');assert.equal(s.caseIndex,idx);assert.equal(s.anomalies[0].success,true);assert.equal(s.supplies>=2,true);});
test('migración v8 a v9 mantiene decisiones',()=>{const s=ready();s.version=8;delete s.anomalies;s.decisions=[{caseId:'faro',effect:'mercy',choice:0}];const loaded=safeLoad(JSON.stringify(s));assert.equal(loaded.version,10);assert.deepEqual(loaded.anomalies,[]);assert.equal(loaded.decisions.length,1);assert.equal(STORAGE,'world404-save-v10');});
test('partida en combate opcional se reanuda',()=>{const s=ready();startAnomaly(s);resolveAnomaly(s,1);const loaded=safeLoad(JSON.stringify(s));assert.equal(loaded.phase,'combat');assert.equal(loaded.combat.optional,true);assert.equal(nextIntent(loaded).name,ANOMALIES.faro.pattern[0].name);});
