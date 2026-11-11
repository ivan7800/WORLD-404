import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,travel,availableSideStory,startSideStory,resolveSideStory,visitLocation,investigateScene,availableRoute,chooseRoute,startCombat,safeLoad,STORAGE} from '../src/engine.js';
const rng=()=>0.999;
test('cinco historias opcionales originales disponibles en el barrio correspondiente',()=>{
 const targets=['puerto','hospital','centro','refugio','faro'];
 for(let i=0;i<5;i++){
  const s=initialState();s.caseIndex=i;advance(s);travel(s,targets[i],()=>0.999);
  assert.ok(availableSideStory(s));
  startSideStory(s);assert.equal(s.phase,'side-story');
  resolveSideStory(s,0,rng);assert.equal(s.phase,'map');assert.equal(s.sideStories.length,1);
  assert.equal(availableSideStory(s),null);
 }
});
test('éxito en una historia de conocimiento ayuda en combate del mismo expediente',()=>{
 const s=initialState();advance(s);travel(s,'puerto',()=>0.999);startSideStory(s);resolveSideStory(s,1,rng);
 assert.equal(s.resolve,1);assert.equal(s.sideStories[0].reward,'knowledge');
 s.phase='encounter';startCombat(s);assert.ok(s.combat.hp<s.combat.maxHp+1);
 const original=initialState();original.phase='encounter';startCombat(original);assert.ok(s.combat.hp<original.combat.hp);
});
test('fallo de historia tiene coste y no concede premio',()=>{
 const s=initialState();advance(s);travel(s,'puerto',()=>0.999);startSideStory(s);
 const doom=s.doom;resolveSideStory(s,1,()=>0);assert.equal(s.doom,doom+5);assert.equal(s.resolve,0);
});
test('rutas alternativas irrepetibles y con coste real',()=>{
 const s=initialState();advance(s);for(let i=0;i<2;i++){visitLocation(s,i);investigateScene(s,0,rng);}
 assert.ok(availableRoute(s));const before=s.supplies;chooseRoute(s,'cautious');
 assert.equal(s.supplies,before-1);assert.equal(availableRoute(s),false);
 const n=s.routeChoices.length;chooseRoute(s,'risky');assert.equal(s.routeChoices.length,n);
});
test('ruta cautelosa no consume suministros inexistentes',()=>{
 const s=initialState();advance(s);for(let i=0;i<2;i++){visitLocation(s,i);investigateScene(s,0,rng);}
 s.supplies=0;chooseRoute(s,'cautious');assert.equal(s.routeChoices.length,0);
});
test('guardado v7 migra a v8 preservando el progreso',()=>{
 const s=initialState();s.version=7;delete s.sideStories;delete s.routeChoices;s.linkedClues=['faro'];s.decisions=[{caseId:'faro',choice:0,effect:'mercy'}];
 const loaded=safeLoad(JSON.stringify(s));assert.equal(loaded.version,10);assert.deepEqual(loaded.sideStories,[]);assert.deepEqual(loaded.routeChoices,[]);assert.deepEqual(loaded.linkedClues,['faro']);assert.equal(loaded.decisions.length,1);assert.equal(STORAGE,'world404-save-v10');
});
test('continuar partida guardada dentro de historia opcional',()=>{
 const s=initialState();advance(s);travel(s,'puerto',()=>0.999);startSideStory(s);
 const t=safeLoad(JSON.stringify(s));assert.equal(t.phase,'side-story');resolveSideStory(t,0,rng);assert.equal(t.phase,'map');
});
