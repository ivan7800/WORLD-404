import {archiveSummary,endingReadiness} from './journal.js';
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
const $=id=>document.getElementById(id);let s=safeLoad(localStorage.getItem(STORAGE))||safeLoad(localStorage.getItem(V9_STORAGE))||safeLoad(localStorage.getItem(V8_STORAGE))||safeLoad(localStorage.getItem(V7_STORAGE))||safeLoad(localStorage.getItem(V6_STORAGE))||safeLoad(localStorage.getItem(V5_STORAGE))||safeLoad(localStorage.getItem(V4_STORAGE))||safeLoad(localStorage.getItem(V3_STORAGE))||safeLoad(localStorage.getItem(PREVIOUS_STORAGE))||safeLoad(localStorage.getItem(LEGACY_STORAGE))||initialState();function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(s));}catch{}}function act(fn,noise='click'){fn();sound(noise);persist();render();}const SECTION_ORDER=['primary','investigate','optional','travel','conclude'];
function actionType(label){
 if(label.startsWith('CERRAR INVESTIGACIÓN'))return 'conclude';
 if(label.startsWith('IR A ·'))return 'travel';
 if(label.startsWith('EXPLORAR ·')||label.startsWith('HABLAR ·'))return 'investigate';
 if(/^(PRESAGIO|ANOMALÍA OPCIONAL|HISTORIA OPCIONAL|RUTA |ESCUCHAR INTERFERENCIA|DESTRUIR LA GRABACIÓN|CONSULTAR NOTAS)/.test(label))return 'optional';
 return 'primary';
}
let actionContainers={};
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
 const b=document.createElement('button');b.textContent=label;if(help)b.title=help;
 b.addEventListener('click',()=>{if(label.startsWith('CERRAR INVESTIGACIÓN')&&caseProgress(s)<2&&!confirm('Estás a punto de cerrar el expediente sin investigar dos lugares. ¿Continuar de todos modos?'))return;fn();});
 groupActions(actionType(label)).content.append(b);return b;
}
function renderGuide(){
 const info=nextObjective(s);const title=$('guide-title'),text=$('guide-text'),progress=$('guide-progress');
 if(!title||!text)return;title.textContent=info.title;text.textContent=info.description;
 const c=currentCase(s);progress.textContent=c?`EXPEDIENTE ${s.caseIndex+1}/5 · ESCENAS ${caseProgress(s)}/3 · MAREA ${s.doom}%`:`ARCHIVO COMPLETADO · MAREA ${s.doom}%`;
 const combat=$('combat-advice');combat.hidden=s.phase!=='combat';
 if(s.phase==='combat')combat.textContent=combatAdvice(s,nextIntent(s));
}
function render(){const c=currentCase(s);$('stats').replaceChildren();for(const [label,value,css] of [['SALUD',`${s.health}/${s.maxHealth}`,s.health<8?'danger':''],['CORDURA',`${s.sanity}/${s.maxSanity}`,s.sanity<7?'danger':''],['MAREA',`${s.doom}%`,s.doom>=60?'danger':''],['RAZÓN',s.reason,''],['VOLUNTAD',s.nerve,''],['SUMINISTROS',s.supplies,'']]){const el=document.createElement('div');el.className='stat '+css;el.innerHTML=`${label} <strong>${value}</strong>`;$('stats').append(el);}$('cases').replaceChildren();CASES.forEach((item,i)=>{const e=document.createElement('div');e.className='case '+(i<s.caseIndex?'done':i===s.caseIndex?'active':'');e.textContent=`${i<s.caseIndex?'✓':i===s.caseIndex?'▸':'○'} ${item.name}`;$('cases').append(e);});$('inventory').replaceChildren();if(!s.inventory.length)$('inventory').textContent='Vacío';s.inventory.forEach((id,i)=>{const el=document.createElement('div');el.className='item';el.textContent=ITEMS[id]?.name||id;if(['medkit','tonic'].includes(id)&&s.phase!=='ending'&&s.phase!=='combat'){const b=document.createElement('button');b.textContent='USAR';b.style.marginLeft='8px';b.addEventListener('click',()=>act(()=>useItem(s,id)));el.append(b);}$('inventory').append(el);});$('log').replaceChildren();s.log.slice(0,6).forEach(entry=>{const e=document.createElement('div');e.className='log-entry';e.textContent=entry;$('log').append(e);});$('actions').replaceChildren();actionContainers={};renderGuide();renderArchive();renderSceneExtra(s,c);$('chapter').textContent=s.phase==='ending'?'FIN DEL ARCHIVO':s.phase==='intro'?'PRÓLOGO · 12 DE NOVIEMBRE DE 1987':`EXPEDIENTE ${s.caseIndex+1} DE ${CASES.length} · ${c?.location||''}`;
if(s.phase==='intro'){$('title').textContent='El mar ha empezado a recordar';$('story').textContent='San Telmo, costa atlántica. Una carta sin remitente te cita en el archivo municipal. Dentro hay cinco expedientes sellados y una advertencia: «Cuando llegue la última pleamar, nadie recordará que esta ciudad existió».\n\nInvestiga, administra tu salud y cordura y evita que la Marea alcance el 100 %.';button('ABRIR EL PRIMER EXPEDIENTE',()=>act(()=>advance(s)));}else if(s.phase==='explore'||s.phase==='map'){$('title').textContent=c.name;$('story').textContent=c.intro+(s.visions.includes(c.id)?'\n\nREVELACIÓN: '+({'faro':'La luz es una llamada.','hospital':'Las fechas clínicas no pertenecen a este siglo.','mercado':'La subasta vende memorias.','tuneles':'La canción oculta un mapa.','cripta':'El Heraldo conserva un nombre humano.'}[c.id]):'')+'\n\nExplora lugares para conseguir pruebas y suministros. Después decide cómo cerrar la investigación. Cada visita tiene consecuencias.';DISTRICTS.forEach(d=>button('IR A · '+d.name,()=>act(()=>travel(s,d.id))));if(s.currentDistrict){const d=DISTRICTS.find(x=>x.id===s.currentDistrict);$('story').textContent+='\n\nUBICACIÓN: '+d.name+' — '+d.description;CONTACTS.filter(x=>x.district===d.id&&!s.contacts.includes(c.id+':'+x.id)).forEach(person=>person.options.forEach((op,i)=>button('HABLAR · '+person.name+' · '+op.text,()=>act(()=>talk(s,person.id,i)))));}c.locations.forEach((place,i)=>{const done=s.visited.includes(c.id+':'+i);if(!done)button('EXPLORAR · '+place.name,()=>act(()=>visitLocation(s,i)));});if(availableTwist(s))button('INCIDENTE VARIABLE · '+availableTwist(s).title,()=>act(()=>startTwist(s),'click'));if(availableOmen(s))button('PRESAGIO · '+availableOmen(s).title,()=>act(()=>startOmen(s)));if(availableAnomaly(s))button('ANOMALÍA OPCIONAL · '+availableAnomaly(s).title,()=>act(()=>startAnomaly(s)));if(availableSideStory(s))button('HISTORIA OPCIONAL · '+availableSideStory(s).title,()=>act(()=>startSideStory(s)));if(availableRoute(s)){if(s.supplies>0)button('RUTA CAUTELOSA · gastar 1 suministro / debilitar amenaza',()=>act(()=>chooseRoute(s,'cautious')));button('RUTA ARRIESGADA · ganar 2 suministros / subir Marea',()=>act(()=>chooseRoute(s,'risky')));}if(availablePuzzle(s)){const puzzle=availablePuzzle(s);const panel=document.createElement('div');panel.className='evidence-callout';panel.textContent='◈ DEDUCCIÓN DISPONIBLE · '+puzzle.title+' — '+puzzle.prompt;$('actions').append(panel);puzzle.options.forEach((option,i)=>button('DEDUCIR · '+option,()=>act(()=>solvePuzzle(s,i),'click')));}
 if(availableEcho(s)){button('ESCUCHAR INTERFERENCIA DEL ARCHIVO',()=>act(()=>resolveEcho(s,0)));button('DESTRUIR LA GRABACIÓN',()=>act(()=>resolveEcho(s,1)));}if(s.visited.filter(v=>v.startsWith(c.id+':')).length)button('CONSULTAR NOTAS ('+s.notes.length+')',()=>{alert(s.notes.slice(-12).join('\n\n')||'No hay pruebas adicionales.');});c.choices.forEach((ch,i)=>button('CERRAR INVESTIGACIÓN · '+ch.text+` [${ch.stat==='reason'?'RAZÓN':'VOLUNTAD'}]`,()=>act(()=>explore(s,i))));}else if(s.phase==='event'){const ev=EVENTS.find(x=>x.id===s.pendingEvent);$('title').textContent=ev.title;$('story').textContent=ev.description;ev.options.forEach((op,i)=>button(op.text+' ['+(op.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>resolveEvent(s,i))));}else if(s.phase==='scene'){const place=c.locations[s.scene];$('title').textContent=place.name;$('story').textContent=place.description+'\n\nLa ciudad parece observarte. Elige cómo actuar.';place.options.forEach((op,i)=>button(op.text+' ['+(op.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>investigateScene(s,i))));}else if(s.phase==='twist'){const twist=incidenceFor(s);$('title').textContent=twist.title;$('story').textContent=twist.scene+'\n\nEste acontecimiento es distinto según la partida. Tu elección modificará los próximos combates.';twist.options.forEach((op,i)=>button(op.text,()=>act(()=>resolveTwist(s,i))));}else if(s.phase==='omen'){const o=OMENS[c.id];$('title').textContent=o.title;$('story').textContent=o.intro+'\n\nLa decisión quedará registrada en el archivo.';o.options.forEach((op,i)=>button(op.text,()=>act(()=>resolveOmen(s,i))));}else if(s.phase==='anomaly'){const a=ANOMALIES[c.id];$('title').textContent=a.title;$('story').textContent=a.description+'\n\nPuedes intentar un ritual arriesgado o combatir con esta criatura. Solo tendrás una oportunidad.';button('INTENTAR RITUAL ['+(a.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>resolveAnomaly(s,0)));button('COMBATIR · '+a.enemy,()=>act(()=>resolveAnomaly(s,1),'hit'));}else if(s.phase==='side-story'){const story=SIDE_STORIES[c.id];$('title').textContent=story.title;$('story').textContent=story.intro+'\n\nUna historia opcional: si la resuelves correctamente, sus consecuencias persistirán.';story.choices.forEach((op,i)=>button(op.text+' ['+(op.stat==='reason'?'RAZÓN':'VOLUNTAD')+']',()=>act(()=>resolveSideStory(s,i))));}else if(s.phase==='dilemma'){const d=DILEMMAS[c.id];$('title').textContent=d.title;$('story').textContent=d.description+'\n\nTu elección quedará registrada y afectará al destino de San Telmo.';d.options.forEach((op,i)=>button(op.text,()=>act(()=>chooseDilemma(s,i))));}else if(s.phase==='encounter'){$('title').textContent='Algo ha respondido';$('story').textContent=s.log[0]+'\n\nAl salir, el pasillo se oscurece. Una figura imposible te bloquea el camino. Debes enfrentarte a ella o intentar escapar.';if(canPrepareSeal(s))button('PREPARAR SELLO · 1 SUMINISTRO · DEBILITAR CRIATURA',()=>act(()=>prepareSeal(s)));button('ENFRENTARSE A LA CRIATURA',()=>act(()=>startCombat(s),'hit'));}else if(s.phase==='combat'){$('title').textContent=s.combat.optional?ANOMALIES[c.id].enemy:c.enemy;const intent=nextIntent(s);$('story').textContent=`ENEMIGO: ${s.combat.hp}/${s.combat.maxHp} PV · FASE ${s.combat.stage||1} · TURNO ${s.combat.turn}\n\nINTENCIÓN ENEMIGA: ${intent.name.toUpperCase()} (${intent.kind==='mind'?'ATAQUE MENTAL':intent.kind==='heavy'?'ATAQUE FUERTE':'ATAQUE FÍSICO'})\n\n${s.combat.affliction?'ESTADO ALTERADO: HEMORRAGIA ('+s.combat.afflictionTurns+' turnos). Puedes vendarte.\n\n':''}${s.combat.exposed?'PUNTO DÉBIL IDENTIFICADO: el ataque preciso obtiene bonificación.':'Estudiar al enemigo revela un punto débil.'}\nIMPULSO: ${s.combat.momentum||0}/3 · con 2 puedes ejecutar RUPTURA RITUAL para interrumpir un ataque.\n\nAnticipa sus patrones y administra tus recursos.`;button('ATACAR · daño + 1 impulso',()=>act(()=>fight(s,'attack'),'hit'),'Daño normal; acumula un impulso hasta un máximo de tres.');
button('ATAQUE PRECISO · mejor con debilidad',()=>act(()=>fight(s,'precise'),'hit'),'Obtiene una bonificación si antes has estudiado a la criatura.');
button('ESTUDIAR Y CUBRIRSE · +1 impulso',()=>act(()=>fight(s,'study')),'Revela debilidad y reduce el daño del siguiente ataque.');
button('CONCENTRARSE Y CUBRIRSE',()=>act(()=>fight(s,'focus')),'Recupera dos de cordura como máximo dos veces por combate.');
button('VENDAR Y CUBRIRSE',()=>act(()=>fight(s,'recover')),'Detiene hemorragia o recupera un punto de cordura.');
if((s.combat.momentum||0)>=2)button('RUPTURA RITUAL · 2 impulsos · INTERRUMPE',()=>act(()=>fight(s,'rupture'),'hit'),'Ataque fuerte que cancela el próximo movimiento del enemigo.');
if((s.combat.momentum||0)>=1)button('CÍRCULO DE SAL · 1 impulso',()=>act(()=>fight(s,'ward')),'Reduce la Marea y bloquea especialmente bien el daño mental.');if(s.inventory.includes('medkit')&&s.health<s.maxHealth)button('BOTIQUÍN · CONSUME TURNO',()=>act(()=>fight(s,'medkit')));if(s.inventory.includes('tonic')&&s.sanity<s.maxSanity)button('TÓNICO · CONSUME TURNO',()=>act(()=>fight(s,'tonic')));button('INTENTAR HUIR',()=>act(()=>fight(s,'flee')));}else if(s.phase==='interlude'){$('title').textContent='Preparativos en el archivo';$('story').textContent=`Has reunido ${s.clues.length} pistas y ${s.resolve} claves del ritual. Decisiones registradas: ${s.decisions.length}.  La ciudad cambia mientras investigas. Una noche más, las olas golpean el muelle como si quisieran entrar.\n\nRecuperas 3 de salud y 2 de cordura al cerrar un expediente, pero la Marea aumenta.`;button('COMPRAR BOTIQUÍN (2 SUM.)',()=>act(()=>buySupply(s,'medkit')));button('COMPRAR TÓNICO (2 SUM.)',()=>act(()=>buySupply(s,'tonic')));button('INVESTIGAR EL SIGUIENTE CASO',()=>act(()=>advance(s)));}else{const endings={sellado:['La ciudad que resistió','Reconstruyes el ritual con las cinco pruebas y consigues sellar la grieta. San Telmo sobrevivirá, aunque las sirenas volverán a sonar en sueños.'],rescate:['Los nombres que regresaron','Rompes el ciclo sin borrar a las víctimas. Algunos desaparecidos regresan al puerto al amanecer, aunque no todos recuerdan dónde estuvieron.'],supervivencia:['La verdad bajo el agua','Detienes la invocación, pero el precio ha sido demasiado alto. San Telmo permanece en los mapas; algunos de sus habitantes, no.'],muerte:['Expediente sin resolver','Tu cuerpo aparece en la playa tres días después. La carta original vuelve a estar sobre la mesa del archivo.'],locura:['La voz del oleaje','Dejas de distinguir tus recuerdos de los de la ciudad. Ahora eres una de las voces que llaman desde el fondo.'],marea:['La última pleamar','La Marea alcanza el 100 %. El océano reclama San Telmo. Al amanecer, nadie encuentra su nombre en ningún mapa.']};[$('title').textContent,$('story').textContent]=endings[s.ending]||endings.marea; if(s.caseTwists?.length){const lines=s.caseTwists.slice(-3).map(t=>{const incident=incidenceForCase(t);return incident?`• ${incident.title}: ${incident.options[t.choice].result}`:''}).filter(Boolean);$('story').textContent+='\n\nHUELLAS DE TU PARTIDA\n'+lines.join('\n');}button('VOLVER A EMPEZAR',()=>{if(confirm('¿Comenzar una nueva partida?'))act(()=>{s=initialState();});});}drawArt($('art'),s);drawPortrait($('portrait'),s);renderMap();setAmbience(s.phase,s.currentDistrict);}
$('save').addEventListener('click',()=>{persist();sound();$('save').textContent='GUARDADO ✓';setTimeout(()=>$('save').textContent='GUARDAR',1200);});// Partidas portables: el origen localhost es estable en el puerto 8765, y la copia JSON
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
    s=imported;persist();render();alert('Partida importada correctamente.');
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
$('new').addEventListener('click',()=>{if(confirm('¿Borrar el progreso y empezar de nuevo?'))act(()=>{s=initialState();});});$('audio').addEventListener('click',()=>{$('audio').textContent='SONIDO: '+(toggleAudio()?'SÍ':'NO');setAmbience(s.phase,s.currentDistrict);sound();});persist();render();

function renderMap(){const root=$('map');if(!root)return;root.replaceChildren();const active=s.phase==='map'||s.phase==='explore';root.hidden=!active;if(!active)return;const title=document.createElement('h3');title.textContent='PLANO DE SAN TELMO · 1987';root.append(title);const board=document.createElement('div');board.className='map-board';root.append(board);const streets=document.createElement('div');streets.className='map-streets';board.append(streets);for(const d of DISTRICTS){const b=document.createElement('button');b.className='map-pin'+(s.currentDistrict===d.id?' selected':'');b.style.left=d.x+'%';b.style.top=d.y+'%';b.textContent=d.name;b.title=d.description;b.disabled=!active;b.addEventListener('click',()=>act(()=>travel(s,d.id)));board.append(b);}const info=document.createElement('p');info.className='map-caption';info.textContent='Selecciona un barrio. Cada nuevo desplazamiento aumenta ligeramente la Marea; algunos lugares desencadenan encuentros.';root.append(info);}

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
 const ready=endingReadiness(s);
 const headline=document.createElement('p');headline.className='archive-summary';
 headline.textContent=`PISTAS ${ready.evidence}/5 · CLAVES ${ready.resolve} · DECISIONES DE RESCATE ${ready.mercy} · MAREA ${ready.doom}%`;
 root.append(headline);
 for(const caseFile of archiveSummary(s)){
  const section=document.createElement('section');section.className='archive-case';
  const header=document.createElement('h4');header.textContent=caseFile.name+' · '+caseFile.status;
  section.append(header);
  const progress=document.createElement('p');progress.textContent=`Lugares ${caseFile.completed}/${caseFile.locations.length} · Deducción: ${caseFile.evidence?'REGISTRADA':'PENDIENTE'} · Sello: ${caseFile.seal?'PREPARADO':'—'}`;
  section.append(progress);
  const places=document.createElement('ul');
  for(const loc of caseFile.locations){const li=document.createElement('li');li.textContent=(loc.visited?'✓ ':'○ ')+loc.name;places.append(li);}
  section.append(places);
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
 if(event.key.toLowerCase()==='h'){$('help').open=!$('help').open;}
 if(event.key.toLowerCase()==='j'){$('archive').open=!$('archive').open;}
 if(event.key==='Escape'){$('archive').open=false;$('help').open=false;}
});
