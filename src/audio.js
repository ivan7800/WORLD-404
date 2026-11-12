/** WORLD-404 original, offline procedural soundscape (no samples or network). */
let context=null,enabled=false,active=null;
const TONES={intro:52,map:68,explore:68,scene:82,event:92,twist:39,omen:54,anomaly:46,encounter:48,combat:45,interlude:74,ending:39};
const DISTRICT_OFFSETS={faro:13,hospital:-6,puerto:4,centro:9,refugio:-10};
export function ambienceFrequency(phase='intro',district=''){
 return (TONES[phase]??52)+(DISTRICT_OFFSETS[district]??0);
}
export function isAudioEnabled(){return enabled;}
function dispose(){
 if(!active)return;
 for(const source of active.sources){try{source.stop();}catch{}try{source.disconnect();}catch{}}
 for(const node of active.nodes){try{node.disconnect();}catch{}}
 active=null;
}
export function toggleAudio(){
 enabled=!enabled;
 if(enabled&&!context){const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(C)try{context=new C();}catch{enabled=false;}else enabled=false;}
 if(enabled&&context?.state==='suspended')context.resume().catch(()=>{});
 if(!enabled)dispose();
 return enabled;
}
function noiseBuffer(ctx){
 const length=Math.round(ctx.sampleRate*2),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
 let seed=0x4041987;for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/2147483648-1)*.22;}
 return buffer;
}
export function setAmbience(phase='intro',district=''){
 if(!enabled||!context){dispose();return;}
 const freq=ambienceFrequency(phase,district),key=phase+':'+district;
 if(active?.key===key)return;
 dispose();
 const master=context.createGain();master.gain.value=.26;master.connect(context.destination);
 const low=context.createOscillator(),lowGain=context.createGain();
 low.type='triangle';low.frequency.value=freq;lowGain.gain.value=.037;
 low.connect(lowGain).connect(master);
 const second=context.createOscillator(),secondGain=context.createGain();
 second.type=phase==='combat'?'sawtooth':'sine';second.frequency.value=freq*(phase==='combat'?1.498:1.005);
 secondGain.gain.value=phase==='combat'?.013:.008;
 second.connect(secondGain).connect(master);
 const drift=context.createOscillator(),driftGain=context.createGain();
 drift.frequency.value=phase==='combat'?1.1:.19;driftGain.gain.value=phase==='combat'?.014:.006;
 drift.connect(driftGain).connect(lowGain.gain);
 const noise=context.createBufferSource(),filter=context.createBiquadFilter(),noiseGain=context.createGain();
 noise.buffer=noiseBuffer(context);noise.loop=true;
 filter.type='lowpass';filter.frequency.value=phase==='combat'?430:phase==='scene'?230:130;
 noiseGain.gain.value=phase==='combat'?.095:.07;
 noise.connect(filter).connect(noiseGain).connect(master);
 low.start();second.start();drift.start();noise.start();
 active={key,sources:[low,second,drift,noise],nodes:[master,lowGain,secondGain,driftGain,filter,noiseGain]};
}
export function sound(type='click'){
 if(!enabled||!context)return;
 const o=context.createOscillator(),g=context.createGain(),now=context.currentTime;
 o.type=type==='hit'?'sawtooth':type==='reveal'?'triangle':'sine';
 o.frequency.setValueAtTime(type==='hit'?115:type==='reveal'?460:280,now);
 o.frequency.exponentialRampToValueAtTime(type==='hit'?57:type==='reveal'?96:170,now+.19);
 g.gain.setValueAtTime(type==='reveal'?.022:.025,now);
 g.gain.exponentialRampToValueAtTime(.001,now+.22);
 o.connect(g).connect(context.destination);o.start(now);o.stop(now+.23);
 o.onended=()=>{o.disconnect();g.disconnect();};
}
