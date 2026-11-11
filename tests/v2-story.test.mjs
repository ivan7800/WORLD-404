import test from 'node:test';import assert from 'node:assert/strict';
import {CASES} from '../src/data.js';
import {AFTERMATH,aftermathForCase,epilogueLines} from '../src/aftermath.js';
import {initialState,finishCase,chooseDilemma} from '../src/engine.js';
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
