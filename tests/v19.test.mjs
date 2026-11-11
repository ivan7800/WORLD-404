import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {initialState,advance,visitLocation,investigateScene,availableTwist,startTwist,resolveTwist,startCombat,fight,safeLoad} from '../src/engine.js';
import {INCIDENCES,selectIncidence,incidenceFor} from '../src/variations.js';
import {nextObjective,combatAdvice,caseProgress} from '../src/guide.js';

function afterFirstScene(seed=0){const s=initialState(seed);advance(s);visitLocation(s,0);investigateScene(s,0,()=>0.99);return s;}
test('v1.9: cada caso tiene 3 incidentes con alternativas y consecuencias originales',()=>{
 assert.equal(Object.keys(INCIDENCES).length,5);
 for(const variants of Object.values(INCIDENCES)){
  assert.equal(variants.length,3);
  for(const v of variants){assert.ok(v.title&&v.scene);assert.equal(v.options.length,2);assert.ok(v.options.every(o=>o.tag&&o.result&&Number.isFinite(o.enemyHp)));}
 }
});
test('v1.9: semilla produce las 243 combinaciones independientes de incidente',()=>{
 const variants=new Set();for(let seed=0;seed<243;seed++)variants.add([0,1,2,3,4].map(i=>selectIncidence(seed,i)).join(''));
 assert.equal(variants.size,243);
});
test('v1.9: el incidente se desbloquea después de visitar un lugar y solo una vez',()=>{
 const s=initialState(200);advance(s);assert.equal(availableTwist(s),null);
 visitLocation(s,0);investigateScene(s,0,()=>0.99);
 assert.ok(availableTwist(s));const incident=incidenceFor(s);startTwist(s);assert.equal(s.phase,'twist');
 resolveTwist(s,0);assert.equal(s.phase,'map');assert.equal(s.caseTwists.length,1);
 assert.equal(availableTwist(s),null);assert.equal(s.notes.some(n=>n.startsWith(incident.title)),true);
});
test('v1.9: cerrar un incidente aumenta o reduce realmente la resistencia del jefe',()=>{
 const normal=initialState(0);normal.phase='encounter';startCombat(normal);
 const s=afterFirstScene(0);startTwist(s);resolveTwist(s,0);const modifier=s.caseTwists[0].enemyHp;
 s.phase='encounter';startCombat(s);assert.equal(s.combat.hp,Math.max(5,normal.combat.hp+modifier));
});
test('v1.9: guardados antiguos migran sin perder historial',()=>{
 const s=initialState(1987);delete s.runSeed;delete s.caseTwists;delete s.activeTwist;s.notes.push('Pista histórica');
 const loaded=safeLoad(JSON.stringify(s));assert.ok(loaded);assert.equal(loaded.notes.at(-1),'Pista histórica');assert.deepEqual(loaded.caseTwists,[]);
});
test('v1.9: guardado del incidente abierto se recupera y la variante no cambia',()=>{
 const s=afterFirstScene(242);const original=incidenceFor(s).title;startTwist(s);
 const restored=safeLoad(JSON.stringify(s));assert.ok(restored);assert.equal(restored.phase,'twist');assert.equal(incidenceFor(restored).title,original);
});
test('v1.9: partidas manipuladas con varias elecciones por expediente son rechazadas',()=>{
 const s=initialState(0);s.caseTwists=[{caseId:'faro',variant:0,choice:0,enemyHp:-3},{caseId:'faro',variant:1,choice:1,enemyHp:2}];
 assert.equal(safeLoad(JSON.stringify(s)),null);
});
test('v1.9: el estudio genera impulso y la ruptura interrumpe el ataque',()=>{
 const s=initialState(1);s.phase='encounter';startCombat(s);
 fight(s,'study',()=>0);assert.equal(s.combat.momentum,1);
 fight(s,'attack',()=>0);assert.equal(s.combat.momentum,2);
 const before=[s.health,s.sanity];const turn=s.combat.turn;
 fight(s,'rupture',()=>0);assert.equal(s.combat.momentum,0);assert.equal(s.combat.turn,turn+1);
 assert.deepEqual([s.health,s.sanity],before);
});
test('v1.9: no puedes ejecutar ruptura sin impulso',()=>{
 const s=initialState(1);s.phase='encounter';startCombat(s);const before=JSON.stringify(s);
 fight(s,'rupture',()=>0);assert.equal(JSON.stringify(s),before);
});
test('v1.9: círculo de sal consume impulso, reduce Marea y protege cordura',()=>{
 const s=initialState(1);s.phase='encounter';startCombat(s);s.combat.momentum=2;s.combat.turn=2;s.doom=18;
 fight(s,'ward',()=>0);assert.equal(s.combat.momentum,1);assert.equal(s.health,20);assert.equal(s.sanity,18);assert.equal(s.doom,19);
});
test('v1.9: partidas antiguas en combate migran el nuevo medidor',()=>{
 const s=initialState(12);s.phase='encounter';startCombat(s);delete s.combat.momentum;delete s.combat.ward;
 const restored=safeLoad(JSON.stringify(s));assert.ok(restored);assert.equal(restored.combat.momentum,0);
});
test('v1.9: guía explica siguiente paso sin mutar el juego',()=>{
 const s=initialState(4);const old=JSON.stringify(s);assert.match(nextObjective(s).title,/Abre/);advance(s);assert.match(nextObjective(s).description,/EXPLORAR/);assert.equal(caseProgress(s),0);
 assert.match(combatAdvice({combat:{momentum:2}}, {name:'Ruido de sal',kind:'mind'}),/RUPTURA/);assert.notEqual(JSON.stringify(s),old);
});
test('v1.9: UI dispone de ayuda, objetivos y acciones distinguibles',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 assert.match(html,/id="guide-title"/);assert.match(html,/id="help"/);
 assert.match(main,/CERRAR INVESTIGACIÓN/);assert.match(main,/INCIDENTE VARIABLE/);assert.match(main,/RUPTURA RITUAL/);
});
test('v1.9: veinte ilustraciones integradas y empaquetables',()=>{
 for(const id of Object.keys(INCIDENCES)){
  for(let v=0;v<3;v++)assert.equal(existsSync(new URL(`../assets/art/variacion-${id}-${v}.webp`,import.meta.url)),true);
  assert.equal(existsSync(new URL(`../assets/art/enfrentamiento-${id}.webp`,import.meta.url)),true);
 }
});
