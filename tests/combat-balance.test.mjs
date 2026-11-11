import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES} from '../src/data.js';
import {initialState,startCombat,fight,safeLoad} from '../src/engine.js';

function seeded(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function simulate(caseIndex,seed,strategy){
 const s=initialState(seed);s.caseIndex=caseIndex;s.phase='encounter';
 startCombat(s);const rng=seeded(seed),actions=[];
 let rounds=0;
 while(s.phase==='combat'&&rounds<50){
  let action='attack';
  if(strategy==='tactical'){
   if(rounds===0)action='study';
   else if(s.combat?.momentum>=2)action='rupture';
   else if(s.combat?.affliction)action='recover';
   else if(s.sanity<=8&&s.combat?.focusUses<2)action='focus';
   else if(s.combat?.exposed)action='precise';
  }
  actions.push(action);fight(s,action,rng);rounds++;
  assert.ok(Number.isFinite(s.health)&&Number.isFinite(s.sanity)&&Number.isFinite(s.doom));
 }
 assert.notEqual(s.phase,'combat',`Combate bloqueado en ${CASES[caseIndex].id} con semilla ${seed}`);
 assert.ok(safeLoad(JSON.stringify(s)), 'Estado terminal serializable y restaurable');
 return {won:s.caseIndex===caseIndex+1,rounds,actions};
}
test('matriz determinista de combate: cinco jefes, dos estrategias y 20 semillas, sin bloqueos',()=>{
 const rows=[];
 for(let i=0;i<CASES.length;i++){
  for(const strategy of ['attack','tactical']){
   let won=0,turns=0;
   for(let seed=1;seed<=20;seed++){
    const result=simulate(i,seed*7919+i*101,strategy);
    won+=Number(result.won);turns+=result.rounds;
   }
   rows.push({case:CASES[i].id,strategy,wins:won,attempts:20,avgRounds:Number((turns/20).toFixed(2))});
  }
 }
 console.log('WORLD-404 COMBAT BALANCE (semillas reproducibles, encuentros aislados):',JSON.stringify(rows));
 assert.equal(rows.length,10);
});
