/** Original procedural score and sound design. Every source runs locally in Web Audio. */
const ZONES = {
 faro:    {root:55,  noise:740, width:.65, wave:.16, chord:[1,1.5,2], character:'wind'},
 hospital:{root:61,  noise:360, width:.25, wave:.43, chord:[1,1.41,2], character:'electric'},
 mercado: {root:49,  noise:920, width:.72, wave:.31, chord:[1,1.33,1.78], character:'metal'},
 tuneles: {root:47,  noise:245, width:.38, wave:.52, chord:[1,1.5,1.89], character:'water'},
 cripta:  {root:42,  noise:180, width:.51, wave:.24, chord:[1,1.41,1.5], character:'choir'},
 archivo: {root:65,  noise:470, width:.31, wave:.12, chord:[1,1.5,1.68], character:'electric'}
};
const DISTRICTS = {faro:'faro',hospital:'hospital',puerto:'mercado',centro:'archivo',refugio:'tuneles'};
const PRESSURE_PHASES = new Set(['combat','encounter','anomaly','twist','omen']);
const REST_PHASES = new Set(['intro','interlude']);
export const DEFAULT_AUDIO = Object.freeze({master:75,ambience:80,music:58,effects:75});
export function normalizeAudio(value) {
 return Object.fromEntries(Object.entries(DEFAULT_AUDIO).map(([key, fallback])=>{
  const input=value?.[key];
  return [key,Number.isFinite(input)?Math.round(Math.max(0,Math.min(100,input))):fallback];
 }));
}

export function ambienceFrequency(phase='intro', district='') {
 return (ZONES[DISTRICTS[district]] || ZONES.archivo).root + (phase==='combat'?-8:0);
}

export function audioProfile({phase='intro',caseId,district,doom=0,sanity=18,maxSanity=18,stage=1,ending}={}) {
 const atRest=REST_PHASES.has(phase);
 const outcome=phase==='ending'?ending:null;
 const resolved=['sellado','rescate','supervivencia'].includes(outcome);
 const zone=atRest?'archivo':(DISTRICTS[district] || (Object.hasOwn(ZONES,caseId)?caseId:'cripta'));
 const tense=PRESSURE_PHASES.has(phase);
 const tide=doom>=70?2:doom>=35?1:0;
 const unstable=sanity/maxSanity<=.34;
 return {zone,tide,unstable,tense,stage:phase==='combat'?stage:1,atRest,outcome,resolved};
}

const noises = new WeakMap();
function noiseBuffer(ctx) {
 if(noises.has(ctx))return noises.get(ctx);
 const buffer=ctx.createBuffer(1,Math.round(ctx.sampleRate*3),ctx.sampleRate);
 const data=buffer.getChannelData(0);
 let seed=0x4041987;
 for(let i=0;i<data.length;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  data[i]=seed/2147483648-1;
 }
 noises.set(ctx,buffer);
 return buffer;
}

function filter(ctx,type,frequency,q=0.7) {
 const node=ctx.createBiquadFilter();
 node.type=type;
 node.frequency.value=frequency;
 node.Q.value=q;
 return node;
}

export function createSoundscape(ctx, ambience, music, profile) {
 const {zone,tide,unstable,tense,stage,atRest,outcome,resolved}=profile;
 const {root,noise,width,wave,chord,character}=ZONES[zone];
 const now=ctx.currentTime;
 const sources=[], nodes=[];
 const gain=(level,destination)=>{
  const node=ctx.createGain();
  node.gain.value=level;
  node.connect(destination);
  nodes.push(node);
  return node;
 };
 const oscillator=(type,frequency,destination)=>{
  const source=ctx.createOscillator();
  source.type=type;
  source.frequency.value=frequency;
  source.connect(destination);
  sources.push(source);
  return source;
 };
 const ambientLevel=gain(0,ambience);
 const musicLevel=gain(0,music);
 const wind=ctx.createBufferSource();
 wind.buffer=noiseBuffer(ctx);
 wind.loop=true;
 sources.push(wind);
 const air=filter(ctx,character==='water'?'lowpass':'bandpass',noise+tide*155,character==='metal'?2.7:.85);
 const pan=ctx.createStereoPanner();
 nodes.push(air,pan);
 wind.connect(air).connect(pan);
 const swell=gain(.065+tide*.016,ambientLevel);
 pan.connect(swell);
 oscillator('sine',wave,gain(.030,swell.gain));
 oscillator('sine',wave*.62,gain(width,pan.pan));

 const texture= {
  wind:['sine',root*6.02,.014,.32],
  electric:['triangle',100,.009,4.1],
  metal:['sine',root*13.91,.017,.27],
  water:['sine',root*2.03,.024,1.35],
  choir:['triangle',root*3.02,.016,.19]
 }[character];
 const [voice,frequency,volume,rate]=texture;
 const signature=gain(volume,ambientLevel);
 oscillator(voice,frequency,signature);
 oscillator('sine',rate,gain(volume*.87,signature.gain));

 const intervals=resolved?(outcome==='rescate'?[1,1.25,1.5]:outcome==='sellado'?[1,1.5,2]:[1,1.33,1.5]):
  unstable||stage===2?[1,1.06,1.41]:chord;
 intervals.forEach((interval,index)=>{
  const note=gain(index===0?.066:.025,musicLevel);
  const frequency=root*interval*(index===0?1:2)*(tense?.88:1);
  oscillator(index===0?'triangle':'sine',frequency,note);
  oscillator('sine',.11+index*.09,gain(index===0?.013:.016,note.gain));
 });
 if(tense||tide>0||(!resolved&&outcome)){
  const pulse=gain(.035,musicLevel);
  oscillator('triangle',root*1.38,pulse);
  oscillator('sine',.7+tide*.35+(stage===2?.75:0),gain(.032,pulse.gain));
 }
 for(const source of sources)source.start(now);
 ambientLevel.gain.linearRampToValueAtTime(atRest?.58:1,now+.45);
 musicLevel.gain.linearRampToValueAtTime(resolved?.85:tense?1:.66,now+.45);

 let stopped=false;
 return {stop(fade=.28){
  if(stopped)return;
  stopped=true;
  const time=ctx.currentTime;
  for(const level of [ambientLevel,musicLevel]){
   level.gain.cancelScheduledValues(time);
   if(fade>0)level.gain.setTargetAtTime(0,time,fade/6);
   else level.gain.setValueAtTime(0,time);
  }
  sources[0].onended=()=>{
   for(const source of sources)source.disconnect();
   for(const node of nodes)node.disconnect();
  };
  for(const source of sources)source.stop(time+fade);
 }};
}

// type, initial pitch, final pitch, start offset, duration, peak
const CUES = {
 click:[['sine',340,220,0,.075,.11]],
 page:[['noise',1300,740,0,.22,.23],['sine',122,93,.04,.13,.09]],
 reveal:[['sine',375,420,0,.21,.13],['triangle',565,610,.09,.34,.12]],
 deduction:[['triangle',310,325,0,.23,.12],['sine',460,490,.12,.27,.14],['sine',610,660,.25,.35,.13]],
 wrong:[['triangle',310,190,0,.22,.13],['sine',295,143,.12,.31,.13]],
 tape:[['noise',2400,330,0,.42,.21],['triangle',93,60,.06,.45,.13]],
 decision:[['sine',146,117,0,.35,.16],['noise',480,270,.10,.24,.18]],
 hit:[['noise',1020,280,0,.17,.35],['triangle',146,50,0,.21,.23]],
 guard:[['noise',620,400,0,.13,.23],['sine',190,138,.04,.15,.13]],
 ritual:[['triangle',175,280,0,.24,.18],['sine',490,215,.11,.34,.15],['noise',1080,280,.17,.22,.19]],
 heal:[['sine',315,378,0,.25,.15],['sine',480,555,.10,.31,.09]],
 threat:[['triangle',93,57,0,.46,.19],['noise',490,190,.07,.45,.23]],
 phase:[['triangle',70,47,0,.68,.24],['noise',1250,220,.07,.55,.28],['sine',195,132,.19,.41,.13]],
 close:[['sine',246,260,0,.25,.12],['triangle',370,392,.12,.35,.14],['sine',490,520,.25,.45,.10]],
 defeat:[['triangle',130,63,0,.68,.19],['sine',124,58,.12,.65,.14]]
};

export function playCue(ctx, destination, type='click') {
 const voices=Object.hasOwn(CUES,type)?CUES[type]:CUES.click;
 for(const [wave,from,to,offset,duration,peak] of voices){
  const start=ctx.currentTime+offset;
  const end=start+duration;
  const envelope=ctx.createGain();
  envelope.gain.setValueAtTime(0,start);
  envelope.gain.linearRampToValueAtTime(peak,start+.014);
  envelope.gain.exponentialRampToValueAtTime(.001,end);
  let source, tone;
  if(wave==='noise'){
   source=ctx.createBufferSource();
   source.buffer=noiseBuffer(ctx);
   tone=filter(ctx,'bandpass',from,1.2);
   source.connect(tone).connect(envelope);
  }else{
   source=ctx.createOscillator();
   source.type=wave;
   tone=source;
   source.connect(envelope);
  }
  tone.frequency.setValueAtTime(from,start);
  tone.frequency.exponentialRampToValueAtTime(to,end);
  envelope.connect(destination);
  source.onended=()=>{
   source.disconnect();
   if(tone!==source)tone.disconnect();
   envelope.disconnect();
  };
  source.start(start);
  source.stop(end+.014);
 }
}

let context, mixer, active, enabled=false, foreground=true;
let levels=DEFAULT_AUDIO, profile=audioProfile(), profileKey;
let activation=0;

function mix() {
 if(!mixer)return;
 const time=context.currentTime;
 for(const [key,node] of Object.entries(mixer)){
  const audible=key!=='master'||enabled&&foreground;
  node.gain.cancelScheduledValues(time);
  node.gain.setTargetAtTime(audible?levels[key]/100:0,time,.016);
 }
}

export function configureAudio(settings) {
 levels=normalizeAudio(settings);
 mix();
 return {...levels};
}

export function setAudioForeground(visible) {
 foreground=visible;
 mix();
}

export function isAudioEnabled(){return enabled;}

function updateSoundscape() {
 if(!enabled||!mixer)return;
 const key=JSON.stringify(profile);
 if(key===profileKey)return;
 active?.stop();
 active=createSoundscape(context,mixer.ambience,mixer.music,profile);
 profileKey=key;
}

export function setAmbience(scene, district) {
 profile=audioProfile(typeof scene==='string'?{phase:scene,district}:scene);
 updateSoundscape();
}

export async function toggleAudio() {
 const attempt=++activation;
 if(enabled){
  enabled=false;
  mix();
  active?.stop(.10);
  active=null;
  profileKey=null;
  return false;
 }
 try{
  if(!context){
   const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
   if(!Audio)return false;
   const audio=new Audio();
   const graph=Object.fromEntries(Object.keys(DEFAULT_AUDIO).map(key=>[key,audio.createGain()]));
   graph.master.gain.value=0;
   graph.master.connect(audio.destination);
   for(const key of ['ambience','music','effects'])graph[key].connect(graph.master);
   context=audio;
   mixer=graph;
  }
  await context.resume();
  if(attempt!==activation||context.state!=='running')return enabled;
  enabled=true;
  mix();
  updateSoundscape();
  return true;
 }catch{
  enabled=false;
  mix();
  return false;
 }
}

export function sound(type='click') {
 if(enabled&&foreground&&levels.master>0&&levels.effects>0)playCue(context,mixer.effects,type);
}

export function actionCue(before, after, fallback) {
 if(before.phase!==after.phase&&after.phase==='ending'){
  return ['sellado','rescate','supervivencia'].includes(after.ending)?'close':'defeat';
 }
 if(before.caseIndex<after.caseIndex)return 'close';
 if(before.stage===1&&after.combat?.stage===2)return 'phase';
 if(before.phase!=='combat'&&after.phase==='combat')return 'threat';
 if(after.linkedClues.length>before.linked)return 'deduction';
 if(after.failedDeductions.length>before.failed)return 'wrong';
 if(after.echoes.length>before.echoes)return 'tape';
 if(after.decisions.length>before.decisions)return 'decision';
 if(after.preparedSeals.length>before.seals)return 'ritual';
 if(before.phase==='scene'&&after.phase==='map')return after.notes.length>before.notes?'reveal':'wrong';
 if((before.phase!==after.phase&&after.phase==='scene')||before.district!==after.currentDistrict)return 'page';
 if(PRESSURE_PHASES.has(after.phase)&&before.phase!==after.phase)return 'threat';
 return fallback;
}
