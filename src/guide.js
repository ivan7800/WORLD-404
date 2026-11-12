import {CASES} from './data.js';
export function caseProgress(s){const c=CASES[s.caseIndex];return c?s.visited.filter(v=>v.startsWith(c.id+':')).length:0;}
export function nextObjective(s){
 const c=CASES[s.caseIndex],progress=caseProgress(s);
 if(s.phase==='intro')return {title:'Abre tu primer expediente',description:'Inicia la historia. Después investiga lugares, conecta pistas y enfrenta a la criatura antes de avanzar.'};
 if(s.phase==='ending')return {title:'El expediente está cerrado',description:'Has llegado a uno de los finales. Inicia una nueva partida para descubrir incidentes y consecuencias diferentes.'};
 if(s.phase==='interlude')return {title:'Prepara tu siguiente expediente',description:'Descansa, compra suministros si te hacen falta y continúa cuando estés listo.'};
 if(s.phase==='combat')return {title:'Sobrevive al combate',description:'Observa la intención enemiga. Estudia para protegerte y descubrir debilidades; acumula impulso atacando para interrumpirlo.'};
 if(s.phase==='encounter')return {title:'Prepara el enfrentamiento',description:'Si resolviste la deducción, puedes usar un sello ritual. Enfréntate a la criatura para cerrar el expediente.'};
 if(['scene','event','twist','omen','anomaly','side-story','dilemma'].includes(s.phase))return {title:'Elige cómo responder',description:'Lee la escena y toma una decisión. Tu salud, cordura, suministros y la Marea pueden cambiar.'};
 if(progress===0)return {title:'Empieza a investigar '+c.name,description:'Pulsa EXPLORAR en una de las tres escenas. Los lugares y las conversaciones son actividades de investigación.'};
 if(progress===1)return {title:'Busca una segunda pista',description:'Explora otra escena para desbloquear la deducción. Puedes continuar ya, pero investigar mejora tus posibilidades.'};
 if(!s.linkedClues.includes(c.id)&&!s.failedDeductions.includes(c.id))return {title:'Conecta las pruebas del expediente',description:'Lee las pruebas reunidas antes de escoger una respuesta. Resolverlo correctamente te permitirá preparar un sello frente al jefe.'};
 if(!s.caseTwists?.some(t=>t.caseId===c.id))return {title:'Descubre el incidente de esta partida',description:'Elige INCIDENTE VARIABLE: su historia y recompensa cambian entre partidas y afectan al combate principal.'};
 return {title:'Investigación preparada: decide cuándo cerrarla',description:'Revisa el archivo [J], completa actividades opcionales si deseas, y pulsa CERRAR INVESTIGACIÓN cuando quieras enfrentarte a la amenaza.'};
}
export function combatAdvice(s,intent){
 if(!s.combat||!intent)return '';
 const combo=s.combat.momentum||0;
 const danger=intent.kind==='mind'?'MENTAL: daña la cordura. Estudiar o usar CÍRCULO DE SAL reduce el daño.':intent.kind==='heavy'?'FUERTE: puede provocar hemorragia. Estudia para cubrirte o interrumpe con RUPTURA.':'FÍSICO: estudia para reducir daño; ataca si puedes resistirlo.';
 return `PRÓXIMA ACCIÓN: ${intent.name.toUpperCase()}. ${danger}${intent.special?' '+intent.special:''} IMPULSO ${combo}/3${combo>=2?' · RUPTURA DISPONIBLE.':''}`;
}
