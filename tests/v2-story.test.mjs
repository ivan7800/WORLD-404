import test from 'node:test';import assert from 'node:assert/strict';
import {CASES} from '../src/data.js';
import {AFTERMATH,aftermathForCase,epilogueLines} from '../src/aftermath.js';
import {initialState,finishCase,chooseRoute,startCombat} from '../src/engine.js';
test('v2: cinco expedientes tienen dos consecuencias finales únicas',()=>{
 assert.deepEqual(CASES.map(c=>c.id),Object.keys(AFTERMATH));
 assert.equal(new Set(Object.values(AFTERMATH).flatMap(e=>Object.values(e))).size,10);
});
test('v2: la consecuencia enlaza decisiones y no altera un guardado existente',()=>{
 const s=initialState(14),original=JSON.stringify(s);
 assert.equal(aftermathForCase(s,'faro'),null);
 assert.equal(JSON.stringify(s),original);
 s.decisions.push({caseId:'faro',effect:'mercy',choice:0});
 const result=aftermathForCase(s,'faro');assert.match(result,/farero/);
 assert.deepEqual(epilogueLines(s),[result]);
});
test('v2: cierre de caso registra una huella narrativa en la bitácora',()=>{
 const s=initialState(5);s.decisions.push({caseId:'faro',effect:'truth',choice:1});s.phase='encounter';
 finishCase(s);assert.equal(s.caseIndex,1);
 assert.match(s.notes.at(-1),/CONSECUENCIA/);
 assert.ok(s.log.some(l=>l.includes('CONSECUENCIA:')));
});

test('v2: ruta cautelosa cambia la apertura del combate, no solo recursos',()=>{
 const s=initialState(88);s.phase='map';s.visited=['faro:0','faro:1'];
 chooseRoute(s,'cautious');assert.equal(s.routeChoices[0].choice,'cautious');
 s.phase='encounter';startCombat(s);
 assert.equal(s.combat.guard,true);assert.equal(s.combat.ward,1);
 assert.equal(s.combat.momentum,1);
});
test('v2: ruta arriesgada conserva contrapartida y no da guardia gratis',()=>{
 const s=initialState(89);s.phase='map';s.visited=['faro:0','faro:1'];const doom=s.doom;
 chooseRoute(s,'risky');assert.equal(s.doom,doom+5);assert.equal(s.supplies,4);
 s.phase='encounter';startCombat(s);assert.equal(s.combat.guard,false);
 assert.equal(s.combat.momentum,0);
});
