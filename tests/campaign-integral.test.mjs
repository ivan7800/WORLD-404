import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES} from '../src/data.js';
import {initialState,advance,visitLocation,investigateScene,availablePuzzle,solvePuzzle,explore,chooseDilemma,startCombat,fight,finishCase,safeLoad,checkEnd} from '../src/engine.js';
import {saveProgress,loadProgress,BACKUP_KEY} from '../src/save-store.js';

function memoryStorage(){
 const values=new Map();
 return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),values};
}
function persist(state,storage){
 assert.equal(saveProgress(storage,state),true,'El guardado tiene que ser válido');
 const restored=loadProgress(storage);
 assert.ok(restored);
 assert.deepEqual(restored.state,state,'Debe restaurarse exactamente el estado de la campaña');
 return restored.state;
}
test('campaña integral: cinco expedientes, quince localizaciones, deducción, combates y sellado con guardados sucesivos',()=>{
 let s=initialState(20261111);
 const storage=memoryStorage();
 for(let i=0;i<CASES.length;i++){
  advance(s);
  assert.equal(s.phase,'map');
  assert.equal(s.caseIndex,i);
  const c=CASES[i];
  for(let j=0;j<3;j++){
   visitLocation(s,j);assert.equal(s.phase,'scene');
   investigateScene(s,j%2,()=>0.99);assert.equal(s.phase,'map');
   s=persist(s,storage);
  }
  assert.ok(availablePuzzle(s));
  solvePuzzle(s,availablePuzzle(s).answer);
  s=persist(s,storage);
  explore(s,0,()=>0.99);
  assert.equal(s.phase,'dilemma');
  chooseDilemma(s,i%2);
  assert.equal(s.phase,'encounter');
  startCombat(s);assert.equal(s.phase,'combat');
  // Reserva mayor para cubrir la ruta de QA sin convertirla en una simulación de balance.
  s.maxHealth=100;s.health=100;s.maxSanity=100;s.sanity=100;
  let turns=0;
  while(s.phase==='combat'&&turns++<25)fight(s,'attack',()=>0.99);
  assert.ok(turns<25,'El combate debe terminar sin bloqueo');
  assert.equal(s.caseIndex,i+1);
  s=persist(s,storage);
 }
 assert.equal(s.phase,'ending');
 assert.equal(s.ending,'sellado');
 assert.equal(s.clues.length,5);
 assert.ok(s.bossDefeated);
});
test('15 escenas ofrecen dos acciones realmente distintas',()=>{
 for(const c of CASES){
  assert.equal(c.locations.length,3);
  for(const location of c.locations){
   assert.equal(location.options.length,2);
   assert.notEqual(location.options[0].text,location.options[1].text);
   assert.notEqual(location.options[0].success,location.options[1].success);
  }
 }
});
test('cada jefe tiene una lectura táctica única, no repetible, que sobrevive al guardado',()=>{
 const signatures=[];
 for(let i=0;i<CASES.length;i++){
  const s=initialState(100+i);s.caseIndex=i;s.phase='encounter';startCombat(s);
  fight(s,'study',()=>0);
  assert.equal(s.combat.caseInsightUsed,true);
  const prefix=['FARO:','HOSPITAL:','LONJA:','TÚNELES:','CRIPTA:'][i];
  assert.ok(s.log.some(line=>line.startsWith(prefix)),prefix);
  signatures.push(prefix);
  const saved=safeLoad(JSON.stringify(s));
  assert.equal(saved.combat.caseInsightUsed,true);
  // El segundo estudio no debe conceder el efecto otra vez.
  const before=s.log.filter(line=>line.startsWith(prefix)).length;
  fight(s,'study',()=>0);
  assert.equal(s.log.filter(line=>line.startsWith(prefix)).length,before);
 }
 assert.equal(new Set(signatures).size,5);
});
test('concentración agotada y vendaje sin herida no permiten generar defensa gratis',()=>{
 const s=initialState();s.phase='encounter';startCombat(s);
 s.combat.focusUses=2;
 const turn=s.combat.turn;
 fight(s,'focus',()=>0);
 assert.equal(s.combat.turn,turn);assert.equal(s.combat.guard,false);
 fight(s,'recover',()=>0);
 assert.equal(s.combat.turn,turn);assert.equal(s.combat.guard,false);
});
test('los tres cierres narrativos y las tres derrotas tienen salida determinista',()=>{
 for(const [kind,setup] of Object.entries({
  sellado:s=>{s.flags=['faro:success','hospital:success','mercado:success'];s.resolve=5;s.doom=0;},
  rescate:s=>{s.decisions=CASES.slice(0,4).map(c=>({caseId:c.id,effect:'mercy',choice:0}));s.doom=0;},
  supervivencia:s=>{s.doom=0;}
 })){
  const s=initialState();s.caseIndex=4;s.phase='encounter';s.clues=CASES.slice(0,4).map(c=>c.clue);
  setup(s);finishCase(s);assert.equal(s.phase,'ending');assert.equal(s.ending,kind);
  assert.equal(safeLoad(JSON.stringify(s)).ending,kind);
 }
 for(const [field,value,expected] of [['health',0,'muerte'],['sanity',0,'locura'],['doom',100,'marea']]){
  const s=initialState();s[field]=value;checkEnd(s);
  assert.equal(s.ending,expected);assert.equal(safeLoad(JSON.stringify(s)).ending,expected);
 }
});
test('migración v9 y recuperación desde backup sin alterar copias anteriores',()=>{
 const store=memoryStorage(),v9=initialState(99);v9.version=9;
 delete v9.caseTwists;delete v9.activeTwist;delete v9.omens;delete v9.activeOmen;
 store.setItem('world404-save-v9',JSON.stringify(v9));
 const recovered=loadProgress(store);
 assert.equal(recovered.state.version,10);
 assert.equal(recovered.source,'world404-save-v9');
 assert.equal(store.getItem('world404-save-v9'),JSON.stringify(v9));
 const first=initialState(11),second=initialState(12);
 assert.equal(saveProgress(store,first),true);
 assert.equal(saveProgress(store,second),true);
 assert.equal(safeLoad(store.getItem(BACKUP_KEY)).runSeed,11);
 store.setItem('world404-save-v10','{corrupto');
 assert.equal(loadProgress(store).state.runSeed,11);
});
