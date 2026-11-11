import {CASES} from './data.js';
import {aftermathForCase,epilogueLines} from './aftermath.js';
import {DISTRICTS, CONTACTS, EVENTS} from './world.js';
import {SIDE_STORIES} from './sidequests.js';
import {ANOMALIES} from './anomalies.js';
import {INCIDENCES,incidenceFor,selectIncidence} from './variations.js';
export const STORAGE='world404-save-v10';
export const V9_STORAGE='world404-save-v9';
export const V8_STORAGE='world404-save-v8';
export const V7_STORAGE='world404-save-v7';
export const V6_STORAGE='world404-save-v6';
export const V5_STORAGE='world404-save-v5';
export const V4_STORAGE='world404-save-v4';
export const V3_STORAGE='world404-save-v3';
export const PREVIOUS_STORAGE='world404-save-v2';
export const LEGACY_STORAGE='remake404-save-v1';
export function initialState(seed=Math.floor(Math.random()*2147483647)){return {version:10,runSeed:seed,caseTwists:[],activeTwist:null,omens:[],activeOmen:null,preparedSeals:[],anomalies:[],sideStories:[],routeChoices:[],linkedClues:[],wounds:0,decisions:[],echoes:[],resolve:0,visions:[],bossDefeated:false,combatWins:0,worldVisits:[],contacts:[],eventHistory:[],reputation:0,phase:'intro',visited:[],scene:null,notes:[],supplies:2,caseIndex:0,health:20,maxHealth:20,sanity:18,maxSanity:18,doom:0,reason:5,nerve:5,inventory:['medkit','talisman','knife','tonic'],clues:[],flags:[],combat:null,log:['1987. Has recibido una llave del archivo municipal.'],ending:null};}
export function currentCase(s){return CASES[s.caseIndex]||null;}
export function roll(sides=6,rng=Math.random){return Math.floor(rng()*sides)+1;}
export function log(s,message){s.log.unshift(message);s.log=s.log.slice(0,12);}
export function checkEnd(s){if(s.health<=0){s.health=0;s.phase='ending';s.ending='muerte';}else if(s.sanity<=0){s.sanity=0;s.phase='ending';s.ending='locura';}else if(s.doom>=100){s.phase='ending';s.ending='marea';}return s;}
export function availableLocations(s){const c=currentCase(s);return c?.locations||[];}
export function visitLocation(s,index){if(s.phase!=='explore'&&s.phase!=='map')return s;const c=currentCase(s),place=c?.locations?.[index];if(!place||s.visited.includes(c.id+':'+index))return s;s.scene=index;s.phase='scene';log(s,`Llegas a ${place.name}.`);return s;}
export function investigateScene(s,choice,rng=Math.random){if(s.phase!=='scene')return s;const c=currentCase(s),place=c?.locations?.[s.scene],option=place?.options?.[choice];if(!option)return s;const score=roll(6,rng)+s[option.stat],success=score>=option.difficulty+3;log(s,`${success?'HALLAZGO':'CONSECUENCIA'} (${score}): ${success?option.success:option.failure}`);if(success){s.notes.push(`${c.name}: ${place.name} — ${option.success}`);s.supplies=Math.min(8,s.supplies+(option.reward||0));s.doom=Math.max(0,s.doom-2);}else{s.sanity-=1;s.doom+=4;}s.visited.push(c.id+':'+s.scene);if(success&&s.visited.filter(v=>v.startsWith(c.id+':')).length===1){s.visions.push(c.id);log(s,REVELATIONS[c.id]);}s.scene=null;s.phase='map';return checkEnd(s);}
// Evidencias vinculadas: se desbloquean únicamente tras visitar dos lugares del mismo expediente.
export const CASE_PUZZLES={
 faro:{title:'La frecuencia del naufragio',prompt:'La lámpara y los nudos repiten una señal. ¿Qué debes hacer con la lente?',options:['Orientarla hacia el mar abierto','Interrumpir el pulso con la llave espiral','Destruir la radio del farero'],answer:1,success:'El faro deja de transmitir durante siete minutos. Obtienes la frecuencia del sello.',failure:'La lente proyecta nombres sobre el agua. Has atraído la atención del Vigía.'},
 hospital:{title:'La historia clínica imposible',prompt:'Las muestras miran al mar y las fechas avanzan hacia atrás. ¿Qué registro es fiable?',options:['El libro de ingresos del futuro','La secuencia de traslados al sótano','La lista de visitantes del vestíbulo'],answer:1,success:'Las transferencias dibujan el trayecto secreto hacia la lonja.',failure:'Una alarma suena desde la tercera planta y las paredes empiezan a latir.'},
 mercado:{title:'El lote que nadie compró',prompt:'El manifiesto y la moneda ritual apuntan a un mismo comprador. ¿Qué identifica la puja?',options:['La cicatriz que comparten los postores','La etiqueta del almacén','El sonido del teléfono'],answer:0,success:'Reconoces la marca de una sociedad que opera bajo los túneles.',failure:'Tu nombre aparece en el catálogo de personas desaparecidas.'},
 tuneles:{title:'La partitura de evacuación',prompt:'El plano y la música utilizan el mismo ritmo. ¿Cómo se abre la salida?',options:['Siguiendo el eco más intenso','Repitiendo las notas en orden inverso','Apagando todas las luces'],answer:1,success:'La compuerta se abre. Aparece una ruta hacia el rompeolas.',failure:'El coro te responde con tu propia voz, veinte años más vieja.'},
 cripta:{title:'El sello de cinco ausencias',prompt:'Las pruebas indican que la invocación depende de los recuerdos. ¿Cómo invertir el sello?',options:['Ofreciendo el último nombre','Ordenando las cinco pruebas por la fecha de desaparición','Rompiendo la primera piedra'],answer:1,success:'Comprendes el orden para cerrar la grieta sin otra víctima.',failure:'Un nombre desaparece de tu memoria. El Heraldo despierta.'}
};
export function availablePuzzle(s){const c=currentCase(s);if(!c||s.phase!=='map'||s.linkedClues?.includes(c.id))return null;return s.visited.filter(x=>x.startsWith(c.id+':')).length>=2?CASE_PUZZLES[c.id]:null;}
export function solvePuzzle(s,choice){const puzzle=availablePuzzle(s),c=currentCase(s);if(!puzzle||!Number.isInteger(choice)||choice<0||choice>=puzzle.options.length)return s;s.linkedClues.push(c.id);if(choice===puzzle.answer){s.resolve+=2;s.supplies=Math.min(8,s.supplies+1);s.notes.push(c.name+': '+puzzle.success);s.doom=Math.max(0,s.doom-4);log(s,'PRUEBA CONECTADA: '+puzzle.success);}else{s.doom+=7;s.sanity-=2;log(s,'ERROR DE DEDUCCIÓN: '+puzzle.failure);}return checkEnd(s);}
export function explore(s,choice,rng=Math.random){if(s.phase!=='explore'&&s.phase!=='map')return s;const c=currentCase(s);if(!c||!c.choices[choice])return s;const ch=c.choices[choice],r=roll(6,rng)+s[ch.stat],ok=r>=ch.threshold+3;log(s,`${ok?'ÉXITO':'FALLO'} (${r}): ${ok?ch.success:ch.failure}`);if(ok){s.flags.push(c.id+':success');s.doom=Math.max(0,s.doom-3);s[ch.stat]=Math.min(9,s[ch.stat]+1);}else{s.sanity-=2;s.doom+=7;}s.phase=s.decisions.some(d=>d.caseId===c.id)?'encounter':'dilemma';return checkEnd(s);}

// Decisiones permanentes: cada expediente ofrece una bifurcación narrativa original.
export const DILEMMAS={
 faro:{title:'La lámpara de los ausentes',description:'En el cuarto de ópticas, un libro registra el nombre de cada barco perdido. Una voz exige una decisión irreversible.',options:[{text:'Destruir las páginas malditas',result:'La lámpara se apaga, pero desaparecen los nombres de los náufragos.',effect:'mercy',sanity:2,doom:-4},{text:'Conservar los nombres como prueba',result:'El archivo conserva la memoria de los muertos, aunque la luz sigue llamando.',effect:'truth',doom:3,supplies:1}]},
 hospital:{title:'La paciente de la habitación 404',description:'Una mujer recuerda hechos que no han ocurrido. Pide que abras la salida antes de que la lleven abajo.',options:[{text:'Ayudarla a escapar',result:'La paciente huye y deja una advertencia para la cripta.',effect:'mercy',doom:3,resolve:1},{text:'Registrar su testimonio',result:'Anotas una cronología imposible: los hechos futuros figuran como recuerdos.',effect:'truth',sanity:-2,supplies:2}]},
 mercado:{title:'El precio del último recuerdo',description:'Un subastador ofrece devolverte un recuerdo de infancia a cambio de entregar el de un desconocido.',options:[{text:'Rechazar el intercambio',result:'Pierdes tu oportunidad, pero detienes la subasta de recuerdos.',effect:'mercy',sanity:2,doom:-3},{text:'Aceptar para conocer al comprador',result:'Descubres un nombre que conecta los cinco casos, a costa de un recuerdo ajeno.',effect:'truth',doom:4,resolve:1}]},
 tuneles:{title:'La puerta bajo la canción',description:'Los miembros del coro quedan atrapados tras una compuerta. La partitura puede abrirla o revelar las coordenadas del santuario.',options:[{text:'Abrir para liberar al coro',result:'Liberas tres supervivientes que te enseñan a resistir la voz de la Marea.',effect:'mercy',sanity:2,resolve:1},{text:'Copiar las coordenadas del santuario',result:'El archivo incorpora la localización exacta de la cripta abisal.',effect:'truth',doom:-5,supplies:1}]},
 cripta:{title:'El verdadero nombre del Heraldo',description:'La inscripción revela a quién fue el Heraldo. Sus recuerdos humanos apenas sobreviven.',options:[{text:'Pronunciar el nombre para liberarlo',result:'Una voz humana intenta contener a la criatura desde dentro.',effect:'mercy',resolve:2,doom:-5},{text:'Grabar el nombre en el sello',result:'El sello gana fuerza, pero condena el recuerdo de quien fue.',effect:'truth',resolve:1,supplies:2}]}
};
export function chooseDilemma(s,choice){
 if(s.phase!=='dilemma')return s;
 const c=currentCase(s),d=DILEMMAS[c?.id],option=d?.options?.[choice];
 if(!option||s.decisions.some(x=>x.caseId===c.id))return s;
 s.decisions.push({caseId:c.id,choice,effect:option.effect});
 s.sanity=Math.min(s.maxSanity,s.sanity+(option.sanity||0));
 s.doom=Math.max(0,Math.min(100,s.doom+(option.doom||0)));
 s.supplies=Math.min(8,s.supplies+(option.supplies||0));
 s.resolve+=option.resolve||0;
 s.notes.push(c.name+': '+option.result);
 log(s,option.result);s.phase='encounter';return checkEnd(s);
}
export function availableEcho(s){
 if(s.phase!=='map')return null;
 const c=currentCase(s);if(!c||!s.visions.includes(c.id)||s.echoes.includes(c.id))return null;
 return {title:'Interferencia del archivo',description:`La cinta del expediente ${c.name} empieza a hablar con una voz anterior a 1987. Puedes escucharla para interpretar el patrón, pero cada revelación acerca la Marea.`,options:['Escuchar y transcribir la cinta','Romper la cinta y proteger tu mente']};
}
export function resolveEcho(s,choice){
 if(!availableEcho(s)||![0,1].includes(choice))return s;
 const id=currentCase(s).id;s.echoes.push(id);
 if(choice===0){s.resolve++;s.doom+=3;s.notes.push('Interferencia: la Marea sigue el rastro de los recuerdos humanos.');log(s,'Transcribes la voz. Descubres una clave para reconocer el ritual.');}
 else{s.sanity=Math.min(s.maxSanity,s.sanity+2);log(s,'Destruyes la grabación. El silencio alivia tu mente.');}
 return checkEnd(s);
}
export const REVELATIONS={faro:'La lente transmite una señal hacia la cripta; no ilumina barcos, sino que los llama.',hospital:'Las historias clínicas de los desaparecidos llevan la firma de alguien que aún no ha nacido.',mercado:'El dinero de la subasta son recuerdos robados; uno de ellos te pertenece.',tuneles:'La canción del coro es un mapa: cada nota indica una puerta sellada.',cripta:'El Heraldo fue humano. El archivo contiene el nombre con el que puedes hacerlo recordar.'};
export const ENEMY_PATTERNS={
 faro:[{name:'Golpe de sal',kind:'strike',power:0},{name:'Luz hipnótica',kind:'mind',power:2},{name:'Embestida de vidrio',kind:'heavy',power:3}],
 hospital:[{name:'Bisturí oxidado',kind:'strike',power:1},{name:'Diagnóstico imposible',kind:'mind',power:3},{name:'Anestesia profunda',kind:'heavy',power:2}],
 mercado:[{name:'Martillo de subasta',kind:'heavy',power:2},{name:'Oferta de recuerdos',kind:'mind',power:2},{name:'Cobro de deuda',kind:'strike',power:1}],
 tuneles:[{name:'Nota disonante',kind:'mind',power:3},{name:'Zarpazo del coro',kind:'strike',power:1},{name:'Crescendo',kind:'heavy',power:3}],
 cripta:[{name:'Mandato abisal',kind:'mind',power:3},{name:'Marea de espinas',kind:'heavy',power:3},{name:'Garra de la pleamar',kind:'strike',power:2}]
};
export function nextIntent(s){const c=currentCase(s);if(!c||!s.combat)return null;const pattern=s.combat.optional?ANOMALIES[c.id].pattern:c.id==='cripta'&&s.combat.stage===2?FINAL_PATTERN:ENEMY_PATTERNS[c.id];return pattern[(s.combat.turn-1)%pattern.length];}
export const FINAL_PATTERN=[{name:'Eclipse del rompeolas',kind:'mind',power:4},{name:'Mandíbula de la fosa',kind:'heavy',power:4},{name:'Marea sin orillas',kind:'mind',power:5}];
// Preparación táctica: las pruebas conectadas sirven para debilitar a la amenaza.
// Una preparación por expediente; no permite generar recursos ni repetirse.
export function canPrepareSeal(s){
 const c=currentCase(s);
 return Boolean(c&&s.phase==='encounter'&&s.linkedClues.includes(c.id)&&
   !s.preparedSeals?.includes(c.id)&&s.supplies>=1);
}
export function prepareSeal(s){
 if(!canPrepareSeal(s))return s;
 const c=currentCase(s);s.preparedSeals??=[];
 s.preparedSeals.push(c.id);s.supplies--;
 s.doom=Math.max(0,s.doom-2);
 log(s,'SELLADO PREVENTIVO: trazas el signo de '+c.name+'. La criatura pierde resistencia.');
 return s;
}
// Incidentes con desenlace persistente: 3 variaciones por caso / 243 combinaciones narrativas.
export function availableTwist(s){
 const c=currentCase(s);
 return (s.phase==='map'||s.phase==='explore')&&c&&
   !s.caseTwists.some(x=>x.caseId===c.id)&&
   s.visited.some(x=>x.startsWith(c.id+':')) ? incidenceFor(s) : null;
}
export function startTwist(s){
 const incident=availableTwist(s);if(!incident)return s;
 s.activeTwist=currentCase(s).id;s.phase='twist';log(s,'INCIDENTE: '+incident.title);return s;
}
export function resolveTwist(s,choice){
 if(s.phase!=='twist'||s.activeTwist!==currentCase(s)?.id)return s;
 const incident=incidenceFor(s),option=incident?.options?.[choice],c=currentCase(s);
 if(!option||s.caseTwists.some(x=>x.caseId===c.id))return s;
 s.caseTwists.push({caseId:c.id,variant:selectIncidence(s.runSeed,s.caseIndex),choice,tag:option.tag,enemyHp:option.enemyHp||0});
 for(const stat of ['health','sanity'])if(option[stat])s[stat]=Math.max(0,Math.min(s[stat==='health'?'maxHealth':'maxSanity'],s[stat]+option[stat]));
 s.doom=Math.max(0,Math.min(100,s.doom+(option.doom||0)));
 s.supplies=Math.max(0,Math.min(8,s.supplies+(option.supplies||0)));
 s.resolve+=option.resolve||0;
 s.notes.push(incident.title+': '+option.result);log(s,option.result);
 s.activeTwist=null;s.phase='map';return checkEnd(s);
}
export function startCombat(s){if(s.phase!=='encounter')return s;const c=currentCase(s);const morale=s.decisions.filter(d=>d.effect==='mercy').length;const bonus=s.decisions.filter(d=>d.effect==='truth').length;const route=s.routeChoices?.find(r=>r.caseId===c.id);const side=s.sideStories?.find(q=>q.caseId===c.id&&q.success&&q.reward==='knowledge');const sealed=s.preparedSeals?.includes(c.id);const incidentEffect=s.caseTwists?.find(t=>t.caseId===c.id)?.enemyHp||0;const enemyHp=Math.max(5,c.hp+incidentEffect+bonus-morale+(route?.choice==='cautious'?-2:0)-(side?3:0)-(sealed?4:0));s.combat={hp:enemyHp,maxHp:enemyHp,guard:false,turn:1,stage:1,bleed:0,exposed:false,stagger:0,affliction:null,afflictionTurns:0,focusUses:0,momentum:0,ward:0};s.phase='combat';log(s,`¡${c.enemy} te cierra el paso!`);return s;}
export function fight(s,action,rng=Math.random){
 if(s.phase!=='combat')return s;
 const c=currentCase(s),b=s.combat,intent=nextIntent(s);
 if(action==='attack'||action==='precise'){
  const base=roll(6,rng)+(s.inventory.includes('knife')?2:0);
  const damage=action==='precise'?Math.max(1,base-2)+(b.exposed?5:0):base+(b.exposed?2:0);
  b.hp-=damage;b.exposed=false;b.momentum=Math.min(3,(b.momentum||0)+1);
  log(s,`${action==='precise'?'Ataque preciso':'Ataque'}: ${damage} de daño. Impulso ${b.momentum}/3.`);
 }else if(action==='rupture'){
  if((b.momentum||0)<2)return s;
  b.momentum-=2;
  const damage=roll(6,rng)+5+(b.exposed?3:0);b.hp-=damage;b.exposed=false;
  b.stagger=1;log(s,`RUPTURA RITUAL: ${damage} de daño. Interrumpes el ataque enemigo.`);
 }else if(action==='ward'){
  if((b.momentum||0)<1)return s;
  b.momentum--;b.guard=true;b.ward=1;
  s.doom=Math.max(0,s.doom-2);log(s,'CÍRCULO DE SAL: contienes 2 puntos de Marea y preparas una barrera mental.');
 }else if(action==='recover'){if(!b.affliction){s.sanity=Math.min(s.maxSanity,s.sanity+1);log(s,'Respiras profundamente, pero no sufres ninguna herida persistente.');}else{log(s,'Contienes la hemorragia con una venda improvisada.');b.affliction=null;b.afflictionTurns=0;}b.guard=true;
 }else if(action==='focus'){
  if((b.focusUses||0)<2){s.sanity=Math.min(s.maxSanity,s.sanity+2);b.focusUses=(b.focusUses||0)+1;log(s,'Recuperas 2 de cordura y preparas una defensa.');}
  else log(s,'No puedes recuperar más cordura concentrándote en este encuentro.');
  b.guard=true;
 }else if(action==='study'){
  b.exposed=true;b.guard=true;b.momentum=Math.min(3,(b.momentum||0)+1);log(s,'Estudias sus movimientos: punto débil descubierto. Tu siguiente golpe será más eficaz.');
 }else if(action==='medkit'||action==='tonic'){
  if(!s.inventory.includes(action))return s;
  if(action==='medkit'&&s.health>=s.maxHealth||action==='tonic'&&s.sanity>=s.maxSanity)return s;
  s.inventory.splice(s.inventory.indexOf(action),1);
  if(action==='medkit')s.health=Math.min(s.maxHealth,s.health+6);
  else s.sanity=Math.min(s.maxSanity,s.sanity+4);
  b.guard=true;log(s,'Usas '+(action==='medkit'?'un botiquín':'un tónico')+' durante el combate. La criatura reacciona.');
 }else if(action==='flee'){
  if(roll(6,rng)+s.nerve>=10){s.health-=2;s.doom+=14;s.combat=null;s.phase='map';log(s,'Escapas herido. La criatura sigue viva: debes volver a resolver el enfrentamiento.');return checkEnd(s);}
  log(s,'La huida fracasa.');
 }else return s;
 if(b.affliction==='hemorrhage'&&b.afflictionTurns>0){s.health-=1;b.afflictionTurns--;log(s,'La hemorragia te cuesta 1 de salud.');if(b.afflictionTurns===0)b.affliction=null;}
 if(b.hp<=0&&!b.optional&&c.id==='cripta'&&b.stage===1){b.stage=2;b.hp=16;b.maxHp=16;b.turn=1;b.exposed=false;s.sanity=Math.max(1,s.sanity-2);s.doom+=5;log(s,'SEGUNDA FASE: el Heraldo se rompe y emerge la Marea que vivía en su interior.');return checkEnd(s);}
 if(b.hp<=0&&b.optional){const a=ANOMALIES[c.id];const record=s.anomalies.find(x=>x.caseId===c.id&&x.method==='combat');if(record)record.success=true;s.combat=null;s.combatWins++;s.supplies=Math.min(8,s.supplies+2);s.resolve++;s.notes.push(a.title+': '+a.reward);log(s,'ANOMALÍA CONTENIDA: '+a.reward);s.phase='map';return checkEnd(s);}
 if(b.hp<=0){if(c.id==='cripta')s.bossDefeated=true;s.combatWins=(s.combatWins||0)+1;log(s,`La criatura cae. Recuperas: ${c.clue}.`);return finishCase(s);}
 if(b.stagger){b.stagger=0;b.ward=0;b.guard=false;b.turn++;log(s,'La criatura queda interrumpida: no actúa este turno.');return checkEnd(s);}
 if(intent.kind==='mind'){
  let loss=intent.power+(roll(3,rng)-1);if(b.guard){loss=Math.max(0,loss-(b.ward?6:3));b.guard=false;}
  b.ward=0;s.sanity-=loss;s.doom+=3;log(s,`${intent.name}: pierdes ${loss} de cordura.`);
 }else{
  let damage=Math.max(1,(b.optional?ANOMALIES[c.id].attack:c.attack)+roll(3,rng)-2+(intent.kind==='heavy'?intent.power:0));
  if(b.guard){damage=Math.max(0,damage-4);b.guard=false;}b.ward=0;
  if(s.inventory.includes('talisman')&&damage>0){damage=Math.max(0,damage-2);s.inventory.splice(s.inventory.indexOf('talisman'),1);log(s,'El talismán de coral absorbe parte del golpe.');}
  s.health-=damage;s.doom+=2;log(s,`${intent.name}: ${damage} de daño.`);if(intent.kind==='heavy'&&damage>=5&&b.turn%3===0){b.affliction='hemorrhage';b.afflictionTurns=2;log(s,'ESTADO: hemorragia. Usa VENDAR / DEFENDER para detenerla.');}
 }
 b.turn++;return checkEnd(s);
}
export function useItem(s,id){if(!s.inventory.includes(id)||s.phase==='ending'||s.phase==='combat')return s;if(id==='medkit'&&s.health<s.maxHealth){s.health=Math.min(s.maxHealth,s.health+6);}else if(id==='tonic'&&s.sanity<s.maxSanity){s.sanity=Math.min(s.maxSanity,s.sanity+4);}else return s;s.inventory.splice(s.inventory.indexOf(id),1);log(s,`Has utilizado ${id==='medkit'?'el botiquín':'el tónico'}.`);return s;}
export function finishCase(s){const c=currentCase(s);if(!c)return s;if(!s.clues.includes(c.clue))s.clues.push(c.clue);s.combat=null;s.caseIndex++;s.scene=null;s.currentDistrict=null;s.pendingEvent=null;s.health=Math.min(s.maxHealth,s.health+3);s.sanity=Math.min(s.maxSanity,s.sanity+2);s.doom+=8;log(s,`Expediente cerrado: ${c.name}.`);const aftermath=aftermathForCase(s,c.id);if(aftermath){s.notes.push(c.name+': CONSECUENCIA — '+aftermath);log(s,'CONSECUENCIA: '+aftermath);}if(s.caseIndex===CASES.length){s.phase='ending';s.ending=s.clues.length===CASES.length&&s.doom<65&&s.flags.length>=3&&s.resolve>=3?'sellado':s.decisions.filter(d=>d.effect==='mercy').length>=4&&s.doom<90?'rescate':'supervivencia';}else s.phase='interlude';return checkEnd(s);}
export function advance(s){if(s.phase==='intro'||s.phase==='interlude'){s.phase='map';log(s,`Abres el expediente ${s.caseIndex+1}: ${currentCase(s).name}.`);}return s;}
export function enterMap(s){if(s.phase==='explore'){s.phase='map';}return s;}
export function travel(s,districtId,rng=Math.random){
 if(s.phase!=='map'&&s.phase!=='explore')return s;
 if(s.phase==='explore')s.phase='map';
 const district=DISTRICTS.find(d=>d.id===districtId);if(!district)return s;
 const key=currentCase(s).id+':'+districtId;
 if(!s.worldVisits.includes(key)){s.worldVisits.push(key);s.doom=Math.min(100,s.doom+2);log(s,`Recorres ${district.name}. La marea avanza un 2 %. `);}
 s.currentDistrict=districtId;
 const event=EVENTS.find(ev=>ev.district===districtId&&!s.eventHistory.includes(currentCase(s).id+':'+ev.id));
 if(event&&rng()<0.65){s.pendingEvent=event.id;s.phase='event';log(s,`Suceso en ${district.name}: ${event.title}.`);}
 return checkEnd(s);
}
export function resolveEvent(s,choice,rng=Math.random){
 if(s.phase!=='event')return s;
 const ev=EVENTS.find(x=>x.id===s.pendingEvent),opt=ev?.options[choice];if(!opt)return s;
 const passed=roll(6,rng)+s[opt.stat]>=opt.difficulty+3;
 if(passed){s.supplies=Math.min(8,s.supplies+(opt.supplies||0));s.reputation+=opt.reputation||0;s.notes.push(ev.title+': '+opt.success);log(s,opt.success);}
 else{s.sanity-=opt.sanityLoss||1;s.doom+=opt.doom||4;log(s,opt.failure);}
 s.eventHistory.push(currentCase(s).id+':'+ev.id);s.pendingEvent=null;s.phase='map';return checkEnd(s);
}
export function talk(s,contactId,choice){
 if(s.phase!=='map'&&s.phase!=='explore')return s;
 const contact=CONTACTS.find(c=>c.id===contactId&&c.district===s.currentDistrict);if(!contact)return s;
 const key=currentCase(s).id+':'+contactId;if(s.contacts.includes(key))return s;
 const response=contact.options[choice];if(!response)return s;
 s.contacts.push(key);s.reputation+=response.reputation||0;s.doom=Math.max(0,s.doom+(response.doom||0));s.notes.push(contact.name+': '+response.result);log(s,response.result);return checkEnd(s);
}
// Rutas y encuentros opcionales sin cerrar expedientes ni duplicar recompensas.
export function availableSideStory(s){
 const c=currentCase(s);if(!c||s.phase!=='map'||s.sideStories?.some(x=>x.caseId===c.id))return null;
 const story=SIDE_STORIES[c.id];if(!story||s.currentDistrict!==story.district)return null;
 return story;
}
export function startSideStory(s){
 if(!availableSideStory(s))return s;s.phase='side-story';log(s,'HISTORIA OPCIONAL: '+SIDE_STORIES[currentCase(s).id].title);return s;
}
export function resolveSideStory(s,choice,rng=Math.random){
 if(s.phase!=='side-story')return s;
 const c=currentCase(s),story=SIDE_STORIES[c?.id],op=story?.choices?.[choice];if(!op)return s;
 const score=roll(6,rng)+s[op.stat],success=score>=op.difficulty+3;
 s.sideStories.push({caseId:c.id,choice,reward:op.reward,success});
 if(success){
  s.notes.push(story.title+': '+op.success);
  if(op.reward==='protect'){s.health=Math.min(s.maxHealth,s.health+3);s.sanity=Math.min(s.maxSanity,s.sanity+2);}
  else{s.resolve++;s.supplies=Math.min(8,s.supplies+1);}
  s.reputation++;log(s,'RELATO COMPLETADO: '+op.success);
 }else{s.health-=op.reward==='protect'?2:0;s.sanity-=2;s.doom+=5;log(s,'RELATO FALLIDO: '+op.failure);}
 s.phase='map';return checkEnd(s);
}
// Encuentros opcionales únicos por expediente. Nunca sustituyen al jefe principal.
export function availableAnomaly(s){
 const c=currentCase(s);
 if(!c||s.phase!=='map'||s.anomalies.some(x=>x.caseId===c.id))return null;
 if(s.visited.filter(x=>x.startsWith(c.id+':')).length<1)return null;
 return ANOMALIES[c.id]||null;
}
export function startAnomaly(s){
 const a=availableAnomaly(s);if(!a)return s;
 s.phase='anomaly';log(s,'ANOMALÍA: '+a.title);return s;
}
export function resolveAnomaly(s,choice,rng=Math.random){
 if(s.phase!=='anomaly'||![0,1].includes(choice))return s;
 const c=currentCase(s),a=ANOMALIES[c?.id];if(!a||s.anomalies.some(x=>x.caseId===c.id))return s;
 if(choice===1){
  s.anomalies.push({caseId:c.id,method:'combat',success:false});
  s.combat={hp:a.hp,maxHp:a.hp,guard:false,turn:1,stage:1,bleed:0,exposed:false,stagger:0,affliction:null,afflictionTurns:0,focusUses:0,momentum:0,ward:0,optional:true};
  s.phase='combat';log(s,'La criatura te ataca: '+a.enemy);return s;
 }
 const success=roll(6,rng)+s[a.stat]>=a.difficulty+3;
 s.anomalies.push({caseId:c.id,method:'ritual',success});
 if(success){s.resolve++;s.doom=Math.max(0,s.doom-3);s.notes.push(a.title+': '+a.success);log(s,'RITUAL COMPLETADO: '+a.success);}
 else{s.sanity-=2;s.doom+=6;log(s,'RITUAL FALLIDO: '+a.failure);}
 s.phase='map';return checkEnd(s);
}
export function availableRoute(s){
 const c=currentCase(s);return (s.phase==='map'||s.phase==='explore')&&c&&!s.routeChoices?.some(r=>r.caseId===c.id)&&s.visited.filter(v=>v.startsWith(c.id+':')).length>=2;
}
export function chooseRoute(s,choice){
 if(!availableRoute(s)||!['cautious','risky'].includes(choice)||(choice==='cautious'&&s.supplies<1))return s;
 const c=currentCase(s);s.routeChoices.push({caseId:c.id,choice});
 if(choice==='cautious'){s.doom=Math.max(0,s.doom-3);s.supplies=Math.max(0,s.supplies-1);log(s,'RUTA CAUTELOSA: gastas un suministro para preparar defensas contra la criatura.');}
 else{s.doom+=5;s.supplies=Math.min(8,s.supplies+2);log(s,'RUTA ARRIESGADA: atraviesas el sector prohibido y recuperas suministros, pero la Marea crece.');}
 return checkEnd(s);
}
// A save can be syntactically valid JSON but still crash map, dialogue or archive rendering.
function validateSaveFields(s){
 const stringArray=keys=>keys.every(k=>Array.isArray(s[k])&&s[k].length<=10000&&s[k].every(v=>typeof v==='string'&&v.length<=8192));
 if(!stringArray(['inventory','clues','flags','log','visited','notes','worldVisits','contacts','eventHistory','visions','linkedClues','preparedSeals']))return false;
 if(!['decisions','echoes','sideStories','anomalies','routeChoices','omens','caseTwists'].every(k=>Array.isArray(s[k])&&s[k].length<=1000&&s[k].every(x=>x&&typeof x==='object'&&!Array.isArray(x))))return false;
 if(s.currentDistrict!=null&&!DISTRICTS.some(d=>d.id===s.currentDistrict))return false;
 if(s.phase==='event'&&s.pendingEvent!=null&&!EVENTS.some(e=>e.id===s.pendingEvent))return false;
 if(s.ending!=null&&!['sellado','rescate','supervivencia','muerte','locura','marea'].includes(s.ending))return false;
 if(s.health<0||s.sanity<0||s.supplies<0||s.supplies>8||s.maxHealth>1000||s.maxSanity>1000)return false;
 if(s.phase==='combat'&&(!s.combat||!Number.isFinite(s.combat.maxHp)||s.combat.maxHp<1||!Number.isFinite(s.combat.momentum??0)))return false;
 return true;
}
export function safeLoad(raw){try{if(typeof raw!=='string'||raw.length>1024*1024)return null;const s=JSON.parse(raw);if(s?.version===1){s.version=2;s.visited=[];s.scene=null;s.notes=[];s.supplies=2;}if(s?.version===2){s.version=3;s.worldVisits=[];s.contacts=[];s.eventHistory=[];s.reputation=0;if(s.phase==='explore')s.phase='map';}if(s?.version===3){s.version=4;s.combatWins=0;}if(s?.version===4){s.version=5;s.visions=[];s.bossDefeated=false;}if(s?.version===5){s.version=6;s.decisions=[];s.echoes=[];s.resolve=0;if(s.phase==='dilemma')s.phase='map';}if(s?.version===6){s.version=7;s.linkedClues=[];s.wounds=0;}if(s?.version===7){s.version=8;s.sideStories=[];s.routeChoices=[];}if(s?.version===8){s.version=9;s.anomalies=[];}if(s?.version===9){s.version=10;}if(s?.version===10){s.omens??=[];s.activeOmen??=null;s.preparedSeals??=[];s.runSeed??=(1987+s.notes?.length*17+s.caseIndex*31);s.caseTwists??=[];s.activeTwist??=null;}if(!s||s.version!==10||!Number.isInteger(s.caseIndex)||s.caseIndex<0||s.caseIndex>CASES.length||!['intro','explore','map','event','scene','twist','omen','anomaly','side-story','dilemma','encounter','combat','interlude','ending'].includes(s.phase)||!Array.isArray(s.inventory)||!Array.isArray(s.clues)||!Array.isArray(s.flags)||!Array.isArray(s.log)||!Array.isArray(s.visited)||!Array.isArray(s.notes)||!Array.isArray(s.worldVisits)||!Array.isArray(s.contacts)||!Array.isArray(s.eventHistory)||!Number.isInteger(s.supplies)||!['health','sanity','doom','reason','nerve'].every(k=>Number.isFinite(s[k])))return null;if(!Array.isArray(s.preparedSeals)||s.preparedSeals.some(id=>typeof id!=='string'||!CASES.some(c=>c.id===id))||new Set(s.preparedSeals).size!==s.preparedSeals.length||!Array.isArray(s.omens)||s.omens.some(x=>!x||!CASES.some(c=>c.id===x.caseId)||![0,1].includes(x.choice))||!Array.isArray(s.anomalies)||!Array.isArray(s.sideStories)||!Array.isArray(s.routeChoices)||!Array.isArray(s.linkedClues)||!Array.isArray(s.visions)||typeof s.bossDefeated!=='boolean'||!Array.isArray(s.decisions)||!Array.isArray(s.echoes)||!Number.isFinite(s.resolve))return null;if(!Number.isFinite(s.maxHealth)||!Number.isFinite(s.maxSanity)||s.maxHealth<1||s.maxSanity<1||!Number.isFinite(s.nerve)||!Number.isFinite(s.reason)||!Number.isInteger(s.caseIndex)||!Array.isArray(s.sideStories)||!Array.isArray(s.anomalies)||!Array.isArray(s.routeChoices)||!Array.isArray(s.linkedClues)||!Array.isArray(s.visions)||!Array.isArray(s.decisions)||!Array.isArray(s.echoes)||typeof s.bossDefeated!=='boolean'||!Number.isFinite(s.resolve)||!Array.isArray(s.inventory)||s.inventory.some(x=>typeof x!=='string')||s.log.some(x=>typeof x!=='string')||s.notes.some(x=>typeof x!=='string')||s.visited.some(x=>typeof x!=='string')||s.caseIndex===CASES.length&&s.phase!=='ending'||s.phase==='combat'&&(!s.combat||!Number.isFinite(s.combat.hp)||!Number.isFinite(s.combat.turn)||s.combat.turn<1)||s.phase==='scene'&&(!currentCase(s)?.locations?.[s.scene])||s.phase==='event'&&!EVENTS.some(e=>e.id===s.pendingEvent)||s.phase==='anomaly'&&!ANOMALIES[currentCase(s)?.id]||s.phase==='side-story'&&!SIDE_STORIES[currentCase(s)?.id]||s.phase==='omen'&&(!OMENS[currentCase(s)?.id]||s.activeOmen!==currentCase(s)?.id)||s.phase==='twist'&&s.activeTwist!==currentCase(s)?.id)return null;if(!Number.isSafeInteger(s.runSeed)||s.runSeed<0||!Array.isArray(s.caseTwists)||s.caseTwists.length>5||s.caseTwists.some(t=>!t||!CASES.some(c=>c.id===t.caseId)||![0,1,2].includes(t.variant)||![0,1].includes(t.choice)||!Number.isFinite(t.enemyHp))||new Set(s.caseTwists.map(t=>t.caseId)).size!==s.caseTwists.length)return null;if(s.combat){s.combat.momentum??=0;s.combat.ward??=0;s.combat.stage??=1;s.combat.exposed??=false;s.combat.bleed??=0;s.combat.stagger??=0;s.combat.affliction??=null;s.combat.afflictionTurns??=0;s.combat.focusUses??=0;}if(!validateSaveFields(s))return null;return s;}catch{return null;}}


// WORLD-404 v1.4: secuencias narrativas únicas, originales y optativas.
// Cada presagio requiere una investigación previa y conserva sus consecuencias.
export const OMENS={
 faro:{title:'El vigía de la sexta luz',intro:'En la playa aparecen seis haces de luz. El faro solo tiene cinco ventanas. Una voz infantil pide que cuentes otra vez.',options:[{text:'Proteger al niño y apagar la luz',sanity:2,doom:-4,supplies:-1,tag:'rescate',result:'El niño deja de proyectar sombra. Conserva un pequeño faro de papel.'},{text:'Seguir el sexto haz hasta el rompeolas',sanity:-2,doom:4,resolve:1,tag:'revelacion',result:'Una cámara sumergida revela el mismo símbolo que aparece en el hospital.'}]},
 hospital:{title:'La ronda de las 03:04',intro:'Los relojes se detienen. Una enfermera sin rostro te ofrece la llave de un ala que oficialmente ardió en 1963.',options:[{text:'Liberar a los pacientes encerrados',health:-2,doom:-4,tag:'rescate',result:'Las camas se vacían y los registros dejan de sangrar.'},{text:'Robar el libro de admisiones',sanity:-2,resolve:2,doom:3,tag:'revelacion',result:'El libro registra tu ingreso para mañana.'}]},
 mercado:{title:'El remate de las voces',intro:'Un gramófono reproduce la conversación que mantendrás esta noche. El subastador exige una oferta antes de que termine.',options:[{text:'Romper la grabación y marcharte',doom:-3,sanity:1,tag:'rescate',result:'Las voces callan. Alguien, en la última fila, empieza a llorar.'},{text:'Comprar el disco con tus recuerdos',sanity:-3,resolve:2,tag:'revelacion',result:'Escuchas las instrucciones que alguien dejó para atravesar los túneles.'}]},
 tuneles:{title:'El tren que nunca llegó',intro:'Una vía enterrada vibra bajo el barro. Un tren sin ventanas se aproxima con una estación dibujada en el techo.',options:[{text:'Abrir los vagones para evacuar a los viajeros',health:-2,supplies:2,tag:'rescate',result:'Los pasajeros salen cubiertos de polvo de sal; uno te entrega una venda.'},{text:'Seguir el trazado hasta la cripta',doom:5,resolve:2,tag:'revelacion',result:'Encuentras la ruta más corta al corazón de la Marea.'}]},
 cripta:{title:'El sexto expediente',intro:'Un archivador imposible contiene fotografías de cinco sucesos y una sexta carpeta con tu nombre, escrita con tinta fresca.',options:[{text:'Quemar la carpeta y romper el ciclo',doom:-7,sanity:1,tag:'rescate',result:'La llama no da calor. Por primera vez, la cripta guarda silencio.'},{text:'Leer el expediente hasta el final',sanity:-4,resolve:3,doom:5,tag:'revelacion',result:'Aprendes el último verso del sello y olvidas la cara de tu infancia.'}]}
};
export function availableOmen(s){const c=currentCase(s);if(s.phase!=='map'||!c||!Array.isArray(s.omens)||s.omens.some(x=>x.caseId===c.id))return null;return s.visited.some(x=>x.startsWith(c.id+':'))?OMENS[c.id]:null;}
export function startOmen(s){const o=availableOmen(s);if(!o)return s;s.activeOmen=currentCase(s).id;s.phase='omen';log(s,'PRESAGIO: '+o.title);return s;}
export function resolveOmen(s,choice){if(s.phase!=='omen'||s.activeOmen!==currentCase(s)?.id||!Number.isInteger(choice))return s;const c=currentCase(s),o=OMENS[c.id],answer=o?.options[choice];if(!answer||s.omens.some(x=>x.caseId===c.id))return s;
 s.omens.push({caseId:c.id,choice,tag:answer.tag});for(const [key,max] of [['health','maxHealth'],['sanity','maxSanity']])if(answer[key])s[key]=Math.min(s[max],s[key]+answer[key]);s.doom=Math.max(0,s.doom+(answer.doom||0));s.supplies=Math.max(0,Math.min(8,s.supplies+(answer.supplies||0)));s.resolve+=answer.resolve||0;s.notes.push(c.name+': '+answer.result);log(s,answer.result);s.activeOmen=null;s.phase='map';return checkEnd(s);
}

export function buySupply(s,item){if(!['medkit','tonic'].includes(item)||s.phase!=='interlude'||s.supplies<2)return s;s.supplies-=2;s.inventory.push(item);log(s,'Has preparado suministros para la próxima investigación.');return s;}
