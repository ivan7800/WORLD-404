import {checkChance,collectedEvidence} from './engine.js';
import {archiveSummary,endingReadiness} from './journal.js';
import {epilogueLines,aftermathForCase} from './aftermath.js';
import {loadProgress,saveProgress} from './save-store.js';
import {DISTRICTS,CONTACTS,EVENTS} from './world.js';
import {CASES,ITEMS} from './data.js';import {initialState,currentCase,advance,explore,startCombat,fight,nextIntent,useItem,safeLoad,STORAGE,V9_STORAGE,V8_STORAGE,V7_STORAGE,V6_STORAGE,V5_STORAGE,V4_STORAGE,V3_STORAGE,LEGACY_STORAGE,visitLocation,investigateScene,buySupply,PREVIOUS_STORAGE,travel,resolveEvent,talk} from './engine.js';import {DILEMMAS,chooseDilemma,availableEcho,resolveEcho,availablePuzzle,solvePuzzle} from './engine.js';import {availableSideStory,startSideStory,resolveSideStory,availableRoute,chooseRoute} from './engine.js';
import {SIDE_STORIES} from './sidequests.js';
import {ANOMALIES} from './anomalies.js';
import {availableAnomaly,startAnomaly,resolveAnomaly} from './engine.js';
import {OMENS,availableOmen,startOmen,resolveOmen} from './engine.js';
import {canPrepareSeal,prepareSeal,availableTwist,startTwist,resolveTwist} from './engine.js';
import {incidenceFor,selectIncidence,INCIDENCES} from './variations.js';
function incidenceForCase(t){return INCIDENCES[t.caseId]?.[t.variant]||null;}
import {nextObjective,combatAdvice,caseProgress} from './guide.js';
import {drawArt,drawPortrait,setVisualEffects,WORLD404_ART_ASSETS} from './art.js';import {toggleAudio,sound,setAmbience} from './audio.js';
const $=id=>document.getElementById(id);
const storage=(()=>{try{return localStorage;}catch{return null;}})();
const loadedProgress=loadProgress(storage);
let s=loadedProgress?.state||initialState(),hasCampaign=Boolean(loadedProgress);
function persist(){return saveProgress(storage,s);}
function act(fn, noise='click') {
 const phase = s.phase;
 const previous = document.activeElement;
 const label = previous?.textContent;
 fn();
 hasCampaign = true;
 sound(noise);
 const saved = persist();
 render();
 const status = $('save-status');
 status.hidden = saved;
 status.textContent = saved ? '' : 'No se pudo guardar el progreso. Exporta la partida antes de cerrar el juego.';
 if (previous && !previous.isConnected) {
  const buttons = [...$('actions').querySelectorAll('button')].filter(b => b.offsetParent !== null && !b.disabled);
  const same = phase === s.phase && buttons.find(b => b.textContent === label);
  if (same) same.focus({preventScroll:true});
  else $('title').focus({preventScroll:phase===s.phase});
 }
}
function checkLabel(option, difficulty) {
 return `${option.stat==='reason'?'Razón':'Voluntad'} · ${checkChance(s[option.stat],difficulty)}/6 de éxito`;
}
const SECTION_ORDER=['primary','investigate','optional','travel','conclude'];
function actionType(label){
 if(label.startsWith('CERRAR INVESTIGACIÓN'))return 'conclude';
 if(label.startsWith('IR A ·'))return 'travel';
 if(label.startsWith('EXPLORAR ·')||label.startsWith('HABLAR ·'))return 'investigate';
 if(/^(PRESAGIO|ANOMALÍA OPCIONAL|HISTORIA OPCIONAL|RUTA |ESCUCHAR INTERFERENCIA|DESTRUIR LA GRABACIÓN|CONSULTAR NOTAS)/.test(label))return 'optional';
 return 'primary';
}
let actionContainers={};let archiveFilter='all';
function groupActions(type){
 if(actionContainers[type])return actionContainers[type];
 const labels={primary:'CONTINUAR LA HISTORIA',investigate:'INVESTIGACIÓN Y TESTIGOS',optional:'ACTIVIDADES OPCIONALES',travel:'DESPLAZARSE POR SAN TELMO',conclude:'⚠ CERRAR INVESTIGACIÓN · PUNTO DE NO RETORNO'};
 const collapsible=type==='travel'||type==='optional'||type==='conclude';
 const group=document.createElement(collapsible?'details':'section');group.className='action-group action-'+type;
 if(collapsible){const summary=document.createElement('summary');summary.textContent=labels[type];group.append(summary);}
 else{const heading=document.createElement('h3');heading.textContent=labels[type];group.append(heading);}
 const content=document.createElement('div');content.className='action-buttons';group.append(content);
 const root=$('actions');const index=SECTION_ORDER.indexOf(type);
 const next=SECTION_ORDER.slice(index+1).map(k=>actionContainers[k]?.group).find(Boolean);
 if(next)root.insertBefore(group,next);else root.append(group);
 actionContainers[type]={group,content};return actionContainers[type];
}
function button(label,fn,help=''){
 const b=document.createElement('button');b.type='button';b.textContent=label;if(help){b.title=help;b.setAttribute('aria-description',help);}
 b.addEventListener('click',()=>{if(label.startsWith('CERRAR INVESTIGACIÓN')&&s.phase!=='encounter'&&(caseProgress(s)<2||availablePuzzle(s))&&!confirm('Quedan pruebas por revisar. ¿Cerrar la investigación de todos modos?'))return;fn();});
 const entry=document.createElement('div');entry.className='action-entry';entry.append(b);if(help){const hint=document.createElement('small');hint.className='action-hint';hint.textContent=help;entry.append(hint);}groupActions(actionType(label)).content.append(entry);return b;
}
function renderGuide(){
 const info=nextObjective(s);const title=$('guide-title'),text=$('guide-text'),progress=$('guide-progress');
 if(!title||!text)return;title.textContent=info.title;text.textContent=info.description;
 const c=currentCase(s);progress.textContent=c?`EXPEDIENTE ${s.caseIndex+1}/5 · ESCENAS ${caseProgress(s)}/3 · MAREA ${s.doom}%`:`ARCHIVO COMPLETADO · MAREA ${s.doom}%`;
 const combat=$('combat-advice');combat.hidden=s.phase!=='combat';
 if(s.phase==='combat')combat.textContent=combatAdvice(s,nextIntent(s));
}
function render(){const c=currentCase(s);$('stats').replaceChildren();for(const [label,value,css] of [['SALUD',`${s.health}/${s.maxHealth}`,s.health<8?'danger':''],['CORDURA',`${s.sanity}/${s.maxSanity}`,s.sanity<7?'danger':''],['MAREA',`${s.doom}%`,s.doom>=60?'danger':''],['RAZÓN',s.reason,''],['VOLUNTAD',s.nerve,''],['SUMINISTROS',s.supplies,'']]){const el=document.createElement('div');el.className='stat '+css;el.innerHTML=`${label} <strong>${value}</strong>`;$('stats').append(el);}$('cases').replaceChildren();CASES.forEach((item,i)=>{const e=document.createElement('div');e.className='case '+(i<s.caseIndex?'done':i===s.caseIndex?'active':'');e.textContent=`${i<s.caseIndex?'✓':i===s.caseIndex?'▸':'○'} ${item.name}`;$('cases').append(e);});$('inventory').replaceChildren();if(!s.inventory.length)$('inventory').textContent='Vacío';s.inventory.forEach((id,i)=>{const el=document.createElement('div');el.className='item';el.textContent=ITEMS[id]?.name||id;if(['medkit','tonic'].includes(id)&&s.phase!=='ending'&&s.phase!=='combat'){const b=document.createElement('button');b.textContent='USAR';b.style.marginLeft='8px';b.addEventListener('click',()=>act(()=>useItem(s,id)));el.append(b);}$('inventory').append(el);});$('log').replaceChildren();s.log.slice(0,6).forEach(entry=>{const e=document.createElement('div');e.className='log-entry';e.textContent=entry;$('log').append(e);});$('actions').replaceChildren();actionContainers={};renderGuide();renderArchive();renderSceneExtra(s,c);$('chapter').textContent=s.phase==='ending'?'FIN DEL ARCHIVO':s.phase==='intro'?'PRÓLOGO · 12 DE NOVIEMBRE DE 1987':`EXPEDIENTE ${s.caseIndex+1} DE ${CASES.length} · ${c?.location||''}`;
if(s.phase==='intro'){$('title').textContent='El mar ha empezado a recordar';$('story').textContent='San Telmo, costa atlántica. Una carta sin remitente te cita en el archivo municipal. Dentro hay cinco expedientes sellados y una advertencia: «Cuando llegue la última pleamar, nadie recordará que esta ciudad existió».\n\nInvestiga, administra tu salud y cordura y evita que la Marea alcance el 100 %.';button('ABRIR EL PRIMER EXPEDIENTE',()=>act(()=>advance(s)));}else if(s.phase==='explore'||s.phase==='map'){$('title').textContent=c.name;$('story').textContent=c.intro+(s.visions.includes(c.id)?'\n\nREVELACIÓN: '+({'faro':'La luz es una llamada.','hospital':'Las fechas clínicas no pertenecen a este siglo.','mercado':'La subasta vende memorias.','tuneles':'La canción oculta un mapa.','cripta':'El Heraldo conserva un nombre humano.'}[c.id]):'')+'\n\nExplora lugares para conseguir pruebas y suministros. Después decide cómo cerrar la investigación. Cada visita tiene consecuencias.';DISTRICTS.forEach(d=>button('IR A · '+d.name,()=>act(()=>travel(s,d.id))));if(s.currentDistrict){const d=DISTRICTS.find(x=>x.id===s.currentDistrict);$('story').textContent+='\n\nUBICACIÓN: '+d.name+' — '+d.description;CONTACTS.filter(x=>x.district===d.id&&!s.contacts.includes(c.id+':'+x.id)).forEach(person=>person.options.forEach((op,i)=>button('HABLAR · '+person.name+' · '+op.text,()=>act(()=>talk(s,person.id,i)))));}c.locations.forEach((place,i)=>{const done=s.visited.includes(c.id+':'+i);if(!done)button('EXPLORAR · '+place.name,()=>act(()=>visitLocation(s,i)));});if(availableTwist(s))button('INCIDENTE VARIABLE · '+availableTwist(s).title,()=>act(()=>startTwist(s),'click'));if(availableOmen(s))button('PRESAGIO · '+availableOmen(s).title,()=>act(()=>startOmen(s)));if(availableAnomaly(s))button('ANOMALÍA OPCIONAL · '+availableAnomaly(s).title,()=>act(()=>startAnomaly(s)));if(availableSideStory(s))button('HISTORIA OPCIONAL · '+availableSideStory(s).title,()=>act(()=>startSideStory(s)));if(availableRoute(s)){if(s.supplies>0)button('RUTA CAUTELOSA · -1 suministro / -2 PV jefe / guardia + 1 impulso',()=>act(()=>chooseRoute(s,'cautious')));button('RUTA ARRIESGADA · +2 suministros / +5 % Marea',()=>act(()=>chooseRoute(s,'risky')));}if(availablePuzzle(s)){const puzzle=availablePuzzle(s);const panel=document.createElement('div');panel.className='evidence-callout';const heading=document.createElement('p');heading.textContent=puzzle.title+' — '+puzzle.prompt;panel.append(heading);
 const list=document.createElement('ul');
 for(const clue of collectedEvidence(s)){const item=document.createElement('li');item.textContent=clue.place+' — '+clue.text;list.append(item);}
 panel.append(list);groupActions('primary').content.append(panel);puzzle.options.forEach((option,i)=>button('DEDUCIR · '+option,()=>act(()=>solvePuzzle(s,i),'click')));}
 if(availableEcho(s)){button('ESCUCHAR INTERFERENCIA DEL ARCHIVO',()=>act(()=>resolveEcho(s,0)));button('DESTRUIR LA GRABACIÓN',()=>act(()=>resolveEcho(s,1)));}if(s.visited.filter(v=>v.startsWith(c.id+':')).length)button('CONSULTAR NOTAS ('+s.notes.length+')',()=>{alert(s.notes.slice(-12).join('\n\n')||'No hay pruebas adicionales.');});c.choices.forEach((ch,i)=>button('CERRAR INVESTIGACIÓN · '+ch.text+` [${checkLabel(ch,ch.threshold)}]`,()=>act(()=>explore(s,i))));}else if(s.phase==='event'){const ev=EVENTS.find(x=>x.id===s.pendingEvent);$('title').textContent=ev.title;$('story').textContent=ev.description;ev.options.forEach((op,i)=>button(op.text+' ['+(op.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>resolveEvent(s,i))));}else if(s.phase==='scene'){const place=c.locations[s.scene];$('title').textContent=place.name;$('story').textContent=place.description+'\n\nLa ciudad parece observarte. Elige cómo actuar.';place.options.forEach((op,i)=>button(op.text+' ['+checkLabel(op,op.difficulty)+']',()=>act(()=>investigateScene(s,i),'reveal')));}else if(s.phase==='twist'){const twist=incidenceFor(s);$('title').textContent=twist.title;$('story').textContent=twist.scene+'\n\nEste acontecimiento es distinto según la partida. Tu elección modificará los próximos combates.';twist.options.forEach((op,i)=>button(op.text,()=>act(()=>resolveTwist(s,i))));}else if(s.phase==='omen'){const o=OMENS[c.id];$('title').textContent=o.title;$('story').textContent=o.intro+'\n\nLa decisión quedará registrada en el archivo.';o.options.forEach((op,i)=>button(op.text,()=>act(()=>resolveOmen(s,i))));}else if(s.phase==='anomaly'){const a=ANOMALIES[c.id];$('title').textContent=a.title;$('story').textContent=a.description+'\n\nPuedes intentar un ritual arriesgado o combatir con esta criatura. Solo tendrás una oportunidad.';button('INTENTAR RITUAL ['+(a.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>resolveAnomaly(s,0)));button('COMBATIR · '+a.enemy,()=>act(()=>resolveAnomaly(s,1),'hit'));}else if(s.phase==='side-story'){const story=SIDE_STORIES[c.id];$('title').textContent=story.title;$('story').textContent=story.intro+'\n\nUna historia opcional: si la resuelves correctamente, sus consecuencias persistirán.';story.choices.forEach((op,i)=>button(op.text+' ['+(op.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>resolveSideStory(s,i))));}else if(s.phase==='dilemma'){const d=DILEMMAS[c.id];$('title').textContent=d.title;$('story').textContent=d.description+'\n\nTu elección quedará registrada y afectará al destino de San Telmo.';d.options.forEach((op,i)=>button(op.text,()=>act(()=>chooseDilemma(s,i))));}else if(s.phase==='encounter'){$('title').textContent='Algo ha respondido';$('story').textContent=s.log[0]+'\n\nAl salir, el pasillo se oscurece. Una figura imposible te bloquea el camino. Prepara el encuentro antes de entrar en combate. Una vez dentro podrás intentar huir.';if(canPrepareSeal(s))button('PREPARAR SELLO · 1 SUMINISTRO · DEBILITAR CRIATURA',()=>act(()=>prepareSeal(s)));button('ENFRENTARSE A LA CRIATURA',()=>act(()=>startCombat(s),'hit'));}else if(s.phase==='combat'){$('title').textContent=s.combat.optional?ANOMALIES[c.id].enemy:c.enemy;const intent=nextIntent(s);$('story').textContent=`ENEMIGO: ${s.combat.hp}/${s.combat.maxHp} PV · FASE ${s.combat.stage||1} · TURNO ${s.combat.turn}\n\nINTENCIÓN ENEMIGA: ${intent.name.toUpperCase()} (${intent.kind==='mind'?'ATAQUE MENTAL':intent.kind==='heavy'?'ATAQUE FUERTE':'ATAQUE FÍSICO'})\n\n${s.combat.affliction?'ESTADO ALTERADO: HEMORRAGIA ('+s.combat.afflictionTurns+' turnos). Puedes vendarte.\n\n':''}${s.combat.exposed?'PUNTO DÉBIL IDENTIFICADO: el ataque preciso obtiene bonificación.':'Estudiar al enemigo revela un punto débil.'}\nIMPULSO: ${s.combat.momentum||0}/3 · con 2 puedes ejecutar RUPTURA RITUAL para interrumpir un ataque.\n\nAnticipa sus patrones y administra tus recursos.`;button('ATACAR · 1D6 (+NAVAJA) · +1 IMPULSO',()=>act(()=>fight(s,'attack'),'hit'),'Daño normal; acumula un impulso hasta un máximo de tres.');
button('ATAQUE PRECISO · 1D6-2 · +5 SI ESTUDIADO',()=>act(()=>fight(s,'precise'),'hit'),'Obtiene una bonificación si antes has estudiado a la criatura.');
button('ESTUDIAR Y CUBRIRSE · +1 impulso',()=>act(()=>fight(s,'study')),'Revela debilidad y reduce el daño del siguiente ataque.');
if(s.combat.focusUses<2||s.combat.focusUses==null)button('CONCENTRARSE Y CUBRIRSE · +2 CORDURA',()=>act(()=>fight(s,'focus')),'Dos usos por combate. Reduce el daño de la próxima acción enemiga.');
else button('CUBRIRSE',()=>act(()=>fight(s,'guard')),'Reduce el daño de la próxima acción enemiga.');
if(s.combat.affliction)button('VENDAR Y CUBRIRSE',()=>act(()=>fight(s,'recover')),'Detiene la hemorragia y reduce el daño de la próxima acción enemiga.');
if((s.combat.momentum||0)>=2)button('RUPTURA RITUAL · 2 impulsos · INTERRUMPE',()=>act(()=>fight(s,'rupture'),'hit'),'Ataque fuerte que cancela el próximo movimiento del enemigo.');
if((s.combat.momentum||0)>=1)button('CÍRCULO DE SAL · 1 IMPULSO · -2 MAREA',()=>act(()=>fight(s,'ward')),'Reduce la Marea y bloquea especialmente bien el daño mental.');if(s.inventory.includes('medkit')&&s.health<s.maxHealth)button('BOTIQUÍN · +6 SALUD · CONSUME TURNO',()=>act(()=>fight(s,'medkit')));if(s.inventory.includes('tonic')&&s.sanity<s.maxSanity)button('TÓNICO · +4 CORDURA · CONSUME TURNO',()=>act(()=>fight(s,'tonic')));button('INTENTAR HUIR · VOLUNTAD + D6 ≥ 10 · -2 SALUD / +14 MAREA',()=>act(()=>fight(s,'flee')),'Si funciona, regresas al mapa. La criatura sigue viva.');}else if(s.phase==='interlude'){$('title').textContent='Preparativos en el archivo';$('story').textContent=`Has reunido ${s.clues.length} pistas y ${s.resolve} claves del ritual. Decisiones registradas: ${s.decisions.length}.  La ciudad cambia mientras investigas. Una noche más, las olas golpean el muelle como si quisieran entrar.\n\nRecuperas 3 de salud y 2 de cordura al cerrar un expediente, pero la Marea aumenta.`;if(s.supplies>=2){button('COMPRAR BOTIQUÍN (2 SUM.)',()=>act(()=>buySupply(s,'medkit')));button('COMPRAR TÓNICO (2 SUM.)',()=>act(()=>buySupply(s,'tonic')));}{const last=CASES[s.caseIndex-1];const aftermath=last&&aftermathForCase(s,last.id);if(aftermath)$('story').textContent+='\n\nCONSECUENCIA DEL EXPEDIENTE ANTERIOR: '+aftermath;}button('INVESTIGAR EL SIGUIENTE CASO',()=>act(()=>advance(s)));}else{const endings={sellado:['La ciudad que resistió','Reconstruyes el ritual con las cinco pruebas y consigues sellar la grieta. San Telmo sobrevivirá, aunque las sirenas volverán a sonar en sueños.'],rescate:['Los nombres que regresaron','Rompes el ciclo sin borrar a las víctimas. Algunos desaparecidos regresan al puerto al amanecer, aunque no todos recuerdan dónde estuvieron.'],supervivencia:['La verdad bajo el agua','Detienes la invocación, pero el precio ha sido demasiado alto. San Telmo permanece en los mapas; algunos de sus habitantes, no.'],muerte:['Expediente sin resolver','Tu cuerpo aparece en la playa tres días después. La carta original vuelve a estar sobre la mesa del archivo.'],locura:['La voz del oleaje','Dejas de distinguir tus recuerdos de los de la ciudad. Ahora eres una de las voces que llaman desde el fondo.'],marea:['La última pleamar','La Marea alcanza el 100 %. El océano reclama San Telmo. Al amanecer, nadie encuentra su nombre en ningún mapa.']};[$('title').textContent,$('story').textContent]=endings[s.ending]||endings.marea; {const epilogue=epilogueLines(s);if(epilogue.length)$('story').textContent+='\n\nHUELLAS DE SAN TELMO\n'+epilogue.join('\n');} if(s.caseTwists?.length){const lines=s.caseTwists.slice(-3).map(t=>{const incident=incidenceForCase(t);return incident?`• ${incident.title}: ${incident.options[t.choice].result}`:''}).filter(Boolean);$('story').textContent+='\n\nHUELLAS DE TU PARTIDA\n'+lines.join('\n');}button('VOLVER A EMPEZAR',()=>{if(confirm('¿Comenzar una nueva partida?'))act(()=>{s=initialState();});});}drawArt($('art'),s);drawPortrait($('portrait'),s);renderMap();setAmbience(s.phase,s.currentDistrict);}
const menu=$('main-menu');
function openMenu(){if(!menu||menu.open)return;$('menu-continue').disabled=!hasCampaign;menu.showModal();}
$('menu-open').addEventListener('click',openMenu);
$('menu-close').addEventListener('click',()=>menu.close());
$('menu-continue').addEventListener('click',()=>menu.close());
$('menu-new').addEventListener('click',()=>{if(hasCampaign&&!confirm('¿Comenzar una nueva partida? Se conserva una copia previa si hay espacio.'))return;s=initialState();hasCampaign=true;if(!persist())alert('No se puede guardar aquí. Exporta tu partida para conservarla.');render();menu.close();});
$('menu-options').addEventListener('click',()=>{menu.close();$('effects').focus();$('effects').scrollIntoView({block:'center'});});
$('menu-help').addEventListener('click',()=>{menu.close();$('help').open=true;$('help').scrollIntoView({block:'center'});});
$('save').addEventListener('click',()=>{const ok=persist();if(ok){hasCampaign=true;$('save-status').hidden=true;}sound();$('save').textContent=ok?'GUARDADO ✓':'ERROR AL GUARDAR';if(!ok)alert('El navegador no pudo guardar. Exporta tu partida en JSON.');setTimeout(()=>$('save').textContent='GUARDAR',1800);});// Partidas portables: el origen localhost es estable en el puerto 8765, y la copia JSON
// permite mover el progreso entre Windows, Linux Mint o navegadores diferentes.
$('export').addEventListener('click',()=>{
  persist();
  const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='WORLD-404-partida.json';document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('import').addEventListener('click',()=>$('savefile').click());
$('savefile').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(file.size>1024*1024){alert('Partida demasiado grande. Máximo 1 MB.');return;}
  try{
    const imported=safeLoad(await file.text());
    if(!imported){alert('Partida no válida o incompatible. No se han cambiado tus datos.');return;}
    if(!confirm('¿Importar la partida? Sustituirá el progreso local actual.'))return;
    const previous=s;s=imported;if(!persist()){s=previous;alert('No se pudo guardar la partida importada. La partida anterior permanece activa.');return;}hasCampaign=true;$('save-status').hidden=true;render();alert('Partida importada correctamente.');
  }catch{alert('No se ha podido leer la partida.');}
});
// Client-side accessibility preference, independent from saved campaign progress.
const effectsPref=(()=>{try{return localStorage.getItem('world404:effects')!=='off';}catch{return true;}})();
setVisualEffects(effectsPref&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
$('effects').textContent='EFECTOS: '+(effectsPref?'SÍ':'NO');
$('effects').setAttribute('aria-pressed',String(effectsPref));
$('effects').addEventListener('click',()=>{
 const enabled=$('effects').getAttribute('aria-pressed')!=='true';
 $('effects').setAttribute('aria-pressed',String(enabled));
 $('effects').textContent='EFECTOS: '+(enabled?'SÍ':'NO');
 setVisualEffects(enabled&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 document.body.classList.toggle('reduced-effects',!enabled);
 try{localStorage.setItem('world404:effects',enabled?'on':'off');}catch{}
 drawArt($('art'),s);drawPortrait($('portrait'),s);
});
$('help-open').addEventListener('click',()=>{$('help').open=true;$('help').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('new').addEventListener('click',()=>{if(confirm('¿Comenzar una partida nueva? Se intentará conservar una copia previa.'))act(()=>{s=initialState();hasCampaign=true;});});$('audio').addEventListener('click',()=>{$('audio').textContent='SONIDO: '+(toggleAudio()?'SÍ':'NO');setAmbience(s.phase,s.currentDistrict);sound();});render();if(typeof menu?.showModal==='function')openMenu();

function renderMap(){
 const root=$('map');if(!root)return;root.replaceChildren();
 const active=s.phase==='map'||s.phase==='explore';root.hidden=!active;if(!active)return;
 const title=document.createElement('h3');title.textContent='PLANO DE SAN TELMO · 1987';root.append(title);
 const board=document.createElement('div');board.className='map-board';root.append(board);
 const streets=document.createElement('div');streets.className='map-streets';board.append(streets);
 const legend=document.createElement('ul');legend.className='map-legend';
 const c=currentCase(s);
 for(const d of DISTRICTS){
  const visited=s.worldVisits.includes(c.id+':'+d.id);
  const witnesses=CONTACTS.filter(x=>x.district===d.id&&!s.contacts.includes(c.id+':'+x.id));
  const status=s.currentDistrict===d.id?'UBICACIÓN ACTUAL':visited?'VISITADA':'SIN EXPLORAR';
  const description=d.description+(witnesses.length?' · '+witnesses.length+' TESTIGOS PENDIENTES':' · SIN TESTIGOS PENDIENTES');
  const b=document.createElement('button');b.className='map-pin'+(s.currentDistrict===d.id?' selected':'');
  b.style.left=d.x+'%';b.style.top=d.y+'%';b.textContent=d.name;b.title=description;b.setAttribute('aria-label',d.name+'. '+status+'. '+description);
  b.addEventListener('click',()=>act(()=>travel(s,d.id)));board.append(b);
  const li=document.createElement('li');li.textContent=status+' · '+d.name+' — '+description;legend.append(li);
 }
 const info=document.createElement('p');info.className='map-caption';info.textContent='Selecciona un barrio. La primera visita añade 2 % de Marea; puede producirse un suceso. Todos los barrios son accesibles.';
 root.append(info,legend);
}

// Animate only the illustrated scene; gameplay remains deterministic and turn-based.
if(typeof window!=='undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){let frame=0;let last=0;function tick(t){if(!document.hidden&&t-last>180){last=t;frame++;drawArt($('art'),s,frame);drawPortrait($('portrait'),s,frame);}requestAnimationFrame(tick);}requestAnimationFrame(tick);}

// Redraw once self-contained local artwork has finished loading (including reduced-motion mode).
if(typeof document!=='undefined')document.addEventListener('world404:art-ready',()=>{drawArt($('art'),s);drawPortrait($('portrait'),s);});

/** Presentation-only narrative panels. All game actions still route through the engine. */
function renderSceneExtra(state,activeCase){
 const host=$('scene-extra');if(!host)return;host.replaceChildren();
 const idx=Math.max(0,Math.min(4,Number(state.caseIndex)||0));
 const variant=selectIncidence(state.runSeed??1987,idx);const picture=state.phase==='twist' ? WORLD404_ART_ASSETS.twists[idx][variant] : state.phase==='combat' ? WORLD404_ART_ASSETS.bossScenes[idx] : WORLD404_ART_ASSETS.eventScenes[idx];
 const labelMap={twist:'INCIDENTE VARIABLE',event:'INTERFERENCIA REGISTRADA',scene:'DOCUMENTO RECUPERADO',omen:'PRESAGIO / ALERTA',anomaly:'ANOMALÍA DETECTADA','side-story':'ARCHIVO COMPLEMENTARIO',dilemma:'DECISIÓN IRREVERSIBLE',combat:'ENFRENTAMIENTO',encounter:'CONTACTO NO HUMANO',interlude:'ARCHIVO / DESCANSO',ending:'CIERRE DE EXPEDIENTE'};
 const label=labelMap[state.phase];
 if(!label)return;
 const section=document.createElement('section');section.className='illustrated-event phase-'+state.phase;
 const figure=document.createElement('div');figure.className='event-image';
 const img=document.createElement('img');img.src=picture;img.alt='Ilustración original de '+(activeCase?.location||'San Telmo');img.loading='lazy';img.decoding='async';
 figure.append(img);
 const info=document.createElement('div');info.className='event-dossier';
 const headline=document.createElement('strong');headline.textContent=label;
 const sub=document.createElement('span');sub.textContent='SAN TELMO // '+String(idx+1).padStart(2,'0')+' — 1987';
 info.append(headline,sub);
 if(state.phase==='twist'){const tag=document.createElement('small');tag.textContent='EVENTO NO LINEAL · CONSECUENCIAS PERSISTENTES';info.append(tag);}
 if(state.phase==='combat'&&state.combat){
  const hp=Math.max(0,Number(state.combat.hp)||0),max=Math.max(1,Number(state.combat.maxHp)||1);
  const bar=document.createElement('div');bar.className='enemy-bar';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','Salud de la criatura');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(max));bar.setAttribute('aria-valuenow',String(hp));
  const fill=document.createElement('span');fill.style.width=Math.max(0,Math.min(100,hp/max*100))+'%';bar.append(fill);
  const val=document.createElement('small');val.textContent='RESISTENCIA '+hp+' / '+max;info.append(bar,val);
 }
 section.append(figure,info);host.append(section);
}


/** Diegetic evidence dossier; all text is inserted via textContent. */
function renderArchive(){
 const root=$('archive-body');if(!root)return;root.replaceChildren();
 const filter=document.createElement('select');filter.className='archive-filter';filter.setAttribute('aria-label','Filtrar expedientes');for(const [value,label] of [['all','TODOS'],['active','EN CURSO'],['pending','NO CERRADOS'],['closed','CERRADOS']]){const option=document.createElement('option');option.value=value;option.textContent=label;filter.append(option);}filter.value=archiveFilter;filter.addEventListener('change',()=>{archiveFilter=filter.value;renderArchive();});root.append(filter);
  const ready=endingReadiness(s);
 const headline=document.createElement('p');headline.className='archive-summary';
 headline.textContent=`PISTAS ${ready.evidence}/5 · CLAVES ${ready.resolve} · DECISIONES DE RESCATE ${ready.mercy} · MAREA ${ready.doom}%`;
 root.append(headline);
 for(const caseFile of archiveSummary(s)){
   if(archiveFilter==='active'&&caseFile.status!=='EN CURSO'||archiveFilter==='pending'&&caseFile.status==='CERRADO'||archiveFilter==='closed'&&caseFile.status!=='CERRADO')continue;
  const section=document.createElement('section');section.className='archive-case';
  const header=document.createElement('h4');header.textContent=caseFile.name+' · '+caseFile.status;
  section.append(header);
  const progress=document.createElement('p');progress.textContent=`Lugares ${caseFile.completed}/${caseFile.locations.length} · Deducción: ${caseFile.evidence?'RESUELTA':caseFile.deductionFailed?'FALLIDA':'PENDIENTE'} · Sello: ${caseFile.seal?'PREPARADO':'—'}`;
  section.append(progress);
  const places=document.createElement('ul');
  for(const loc of caseFile.locations){const li=document.createElement('li');li.textContent=(loc.visited?'✓ ':'○ ')+loc.name;places.append(li);}
  section.append(places);
  for(const clue of caseFile.traces){
   const trace=document.createElement('p');trace.textContent=clue.place+' — '+clue.text;section.append(trace);
  }
  const twist=s.caseTwists?.find(t=>t.caseId===caseFile.id);if(twist){const incident=incidenceForCase(twist);const entry=document.createElement('p');entry.textContent='INCIDENTE VARIABLE: '+(incident?.title||'Registrado')+' · '+(incident?.options[twist.choice]?.result||'');section.append(entry);}
  if(caseFile.decision||caseFile.side||caseFile.anomaly){const detail=document.createElement('p');detail.textContent=['Decisión: '+(caseFile.decision||'pendiente'),caseFile.side?'Historia secundaria registrada':null,caseFile.anomaly?'Anomalía registrada':null].filter(Boolean).join(' · ');section.append(detail);}
  for(const note of caseFile.notes){const noteEl=document.createElement('blockquote');noteEl.textContent=note;section.append(noteEl);}
  root.append(section);
 }
}
document.addEventListener('keydown',event=>{
 if(event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
 const target=event.target;
 if(target instanceof HTMLElement && (target.matches('input,textarea,select')||target.isContentEditable))return;
 if(event.key.toLowerCase()==='m'){openMenu();return;}
 if(menu.open)return;
  if(event.key.toLowerCase()==='h'){$('help').open=!$('help').open;}
 if(event.key.toLowerCase()==='j'){$('archive').open=!$('archive').open;}
 if(event.key==='Escape'){$('archive').open=false;$('help').open=false;}
});
