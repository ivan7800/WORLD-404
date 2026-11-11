import {CASES} from './data.js';
/** Derived, read-only archive data. Does not change the saved game state. */
export function archiveSummary(s){
 return CASES.map((c,index)=>{
  const locations=c.locations.map((place,i)=>({name:place.name,visited:s.visited.includes(c.id+':'+i)}));
  const decision=s.decisions.find(d=>d.caseId===c.id);
  const side=s.sideStories.find(d=>d.caseId===c.id);
  const anomaly=s.anomalies.find(d=>d.caseId===c.id);
  const current=index===s.caseIndex&&s.phase!=='ending';
  return {
   id:c.id,name:c.name,status:index<s.caseIndex?'CERRADO':current?'EN CURSO':'CLASIFICADO',
   locations,completed:locations.filter(l=>l.visited).length,
   evidence:s.linkedClues.includes(c.id),
   seal:s.preparedSeals?.includes(c.id)||false,
   decision:decision?decision.effect==='mercy'?'PROTECCIÓN':'REVELACIÓN':null,
   side:side?'REGISTRADA':null,anomaly:anomaly?'REGISTRADA':null,
   clues:s.clues.includes(c.clue),
   notes:s.notes.filter(note=>typeof note==='string'&&note.startsWith(c.name+':')).slice(-8)
  };
 });
}
export function endingReadiness(s){
 return {evidence:s.clues.length,resolve:s.resolve,successes:s.flags.length,doom:s.doom,mercy:s.decisions.filter(d=>d.effect==='mercy').length};
}
