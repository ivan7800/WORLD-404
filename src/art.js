import {selectIncidence} from './variations.js';
/** WORLD-404 original pixel illustrations, deterministic and offline. */
const COLORS=[
 {sky:'#081b1a',mist:'#32746b',stone:'#183b38',edge:'#87c9a5',accent:'#d3a15f',danger:'#d36e6e'},
 {sky:'#11191c',mist:'#577078',stone:'#2b3f47',edge:'#b7d3c0',accent:'#e1c5a0',danger:'#d5797b'},
 {sky:'#1e161a',mist:'#795547',stone:'#523c37',edge:'#d2b58a',accent:'#e5bf73',danger:'#a95f69'},
 {sky:'#0e1422',mist:'#525b85',stone:'#29324c',edge:'#afbdd2',accent:'#b994ac',danger:'#e17881'},
 {sky:'#100f1b',mist:'#69536c',stone:'#372e45',edge:'#c6b7c9',accent:'#d69a76',danger:'#d75f73'}
];
function rng(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function polygon(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
function line(c,x,y,xx,yy,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function outline(c,x,y,w,h,color){c.strokeStyle=color;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);}
function atmosphere(c,p,r,w,h){
 rect(c,0,0,w,h,p.sky);for(let k=0;k<8;k++){const y=25+k*16;rect(c,0,y,w,10,p.mist);c.globalAlpha=.035+k*.008;}c.globalAlpha=1;
 ellipse(c,235,41,18,18,p.accent);ellipse(c,239,37,17,18,p.sky);
 for(let i=0;i<100;i++){const x=Math.floor(r()*w),y=Math.floor(r()*h);rect(c,x,y,1+(r()>.95?2:0),1,r()>.7?p.edge:p.mist);}
 polygon(c,[[0,92],[24,86],[46,92],[81,70],[119,88],[145,76],[195,94],[253,73],[320,90],[320,180],[0,180]],p.stone);
 for(let i=0;i<14;i++){const x=i*25+Math.floor(r()*9);rect(c,x,90-r()*18,2,90,p.mist);}
 rect(c,0,155,w,25,'#071010');for(let i=0;i<28;i++){rect(c,Math.floor(r()*w),155+Math.floor(r()*25),2+Math.floor(r()*16),1,p.mist);}
}
function lighthouse(c,p,r){
 polygon(c,[[175,146],[199,45],[220,45],[243,146]],'#101d20');polygon(c,[[187,146],[204,53],[211,53],[226,146]],p.stone);
 rect(c,194,38,29,10,'#0c181a');rect(c,198,27,21,13,p.edge);rect(c,201,30,15,8,p.accent);rect(c,196,24,25,3,'#071012');polygon(c,[[191,24],[208,16],[225,24]],'#0b1317');
 for(let y=59;y<142;y+=17){rect(c,199+(y-59)*-.12,y,22+(y-59)*.25,4,p.mist);}
 polygon(c,[[211,33],[320,15],[320,91]],p.accent);c.globalAlpha=.08;rect(c,211,33,109,58,p.accent);c.globalAlpha=1;
 for(let i=0;i<5;i++){const x=15+i*31;line(c,x,124,x+4,165,p.edge);ellipse(c,x,124,3,4,p.danger);}
}
function hospital(c,p){rect(c,74,43,188,115,'#0b1b20');rect(c,80,45,175,110,p.stone);rect(c,143,28,55,22,p.stone);rect(c,166,33,8,22,p.danger);rect(c,160,39,20,7,p.danger);
 for(let row=0;row<4;row++)for(let col=0;col<7;col++){let x=89+col*23,y=55+row*23;rect(c,x,y,12,16,'#0b171c');if((row*7+col)%5===0)rect(c,x+2,y+2,8,11,p.danger);else rect(c,x+2,y+2,8,2,p.mist);}rect(c,158,115,22,40,'#091115');rect(c,164,119,10,27,p.edge);line(c,52,161,284,161,p.edge);
}
function market(c,p){for(let i=0;i<5;i++){const x=25+i*57;rect(c,x,71,46,91,p.stone);polygon(c,[[x-6,74],[x+23,43+i%2*7],[x+53,74]],'#1a151a');rect(c,x+7,92,31,46,'#140f14');rect(c,x+17,98,9,23,p.mist);rect(c,x+2,143,43,2,p.accent);}for(let i=0;i<4;i++)ellipse(c,51+i*73,155,9,4,p.danger);}
function tunnels(c,p){polygon(c,[[0,160],[99,42],[220,42],[320,160]],'#090e18');polygon(c,[[18,160],[110,53],[209,53],[302,160]],p.stone);polygon(c,[[40,160],[123,65],[195,65],[278,160]],'#080e18');for(let i=0;i<6;i++){let t=i/6;let x=48+t*82,y=160-t*99;line(c,x,y,320-x,y,p.mist);}
 for(let i=0;i<6;i++){let y=80+i*16;line(c,143-(y-80)*1.3,y,175+(y-80)*1.3,y,p.edge);}ellipse(c,158,84,10,17,p.danger);ellipse(c,158,84,5,9,p.sky);}
function crypt(c,p){for(let i=0;i<7;i++){const x=23+i*47;polygon(c,[[x,155],[x+7,58+(i%3)*11],[x+21,55+(i%3)*11],[x+30,155]],'#201829');line(c,x+6,58+i%3*11,x+23,58+i%3*11,p.edge);}ellipse(c,167,93,65,54,'#0a0b15');ellipse(c,167,93,49,43,p.mist);ellipse(c,167,93,38,32,'#130e1a');ellipse(c,167,93,17,23,p.danger);ellipse(c,167,93,7,18,'#0b0a11');for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;line(c,167+Math.cos(a)*48,93+Math.sin(a)*43,167+Math.cos(a)*68,93+Math.sin(a)*59,p.edge);}}
// Layered set dressing: each district has its own readable silhouette and moving phenomena.
let effectsEnabled=true;
export function setVisualEffects(enabled){effectsEnabled=Boolean(enabled);}
export function visualEffectsEnabled(){return effectsEnabled;}
function atmosphericDetails(c,p,idx,frame,s){
 const motion=effectsEnabled?frame:0;
 // Decorative highlights are calculated, not sampled from a network or external texture.
 if(idx===0){
  // Flooded steps, signal cables and the red reflection beneath the lighthouse.
  for(let j=0;j<7;j++){const y=143+j*5;line(c,109-j*8,y,173+j*11,y,p.mist);}
  for(let j=0;j<10;j++){const x=195+j*9,y=163+j%3*4;line(c,x,y,x+4+(j%3)*4,y,p.accent);}
  line(c,15,37,119,76,p.edge);line(c,18,41,114,80,p.mist);
  for(let j=0;j<4;j++){const x=24+j*24;rect(c,x,67,2,9,'#d6bd8f');}
 } else if(idx===1){
  // Rusted ambulance, flickering emergency strip and backlit operating room.
  rect(c,19,132,66,21,'#b3afa0');polygon(c,[[21,132],[35,119],[66,119],[82,132]],'#6c8586');
  rect(c,43,122,15,9,'#071716');ellipse(c,33,155,8,8,'#080e13');ellipse(c,72,155,8,8,'#080e13');
  rect(c,46,115,13,3,p.danger);
  if((Math.floor(motion/9)%5)!==0)rect(c,160,39,20,5,'#d89891');
  for(let j=0;j<7;j++)line(c,114+j*15,155,106+j*17,168,'#526766');
 } else if(idx===2){
  // Fishing nets, hooks and numbered crates beneath the rooflines.
  for(let j=0;j<4;j++){const x=38+j*74;line(c,x,48,x+5,85,p.edge);line(c,x+5,85,x+8,89,p.accent);}
  for(let j=0;j<7;j++){const x=8+j*47;rect(c,x,151,26,10,'#765447');outline(c,x,151,26,10,'#b09165');line(c,x+4,154,x+22,157,'#382d2a');}
  for(let j=0;j<8;j++)line(c,12+j*9,108,34+j*9,140,p.mist);
 } else if(idx===3){
  // Receding maintenance lights and roots invading the tunnel walls.
  for(let j=0;j<5;j++){const x=118+j*16,y=64+j*11;ellipse(c,x,y,2,2,p.accent);}
  for(let j=0;j<7;j++){let x=11+j*43;line(c,x,26,x+14,51,p.mist);line(c,x+14,51,x+6,74,p.mist);}
  for(let j=0;j<5;j++){const x=136+j*9;line(c,x,144,x+Math.sin(motion*.12+j)*3,166,p.edge);}
 } else {
  // Reliquary candles, impossible concentric glyphs and hairline cracks.
  for(let j=0;j<8;j++){const x=26+j*37;rect(c,x,151,4,14,p.edge);ellipse(c,x+2,149+(effectsEnabled?Math.sin(motion*.07+j):0),2,3,p.accent);}
  for(let j=0;j<13;j++){const a=j*Math.PI*2/13;line(c,167+Math.cos(a)*70,93+Math.sin(a)*58,167+Math.cos(a)*76,93+Math.sin(a)*65,p.danger);}
 }
 // Rising tide stains the camera, making the world look increasingly submerged.
 const tide=Math.max(0,Math.min(100,Number(s.doom)||0));
 if(tide>=35){c.globalAlpha=Math.min(.28,(tide-24)/270);rect(c,0,168-Math.round(tide/7),320,20+Math.round(tide/7),p.mist);c.globalAlpha=1;}
 if(tide>=65){const levels=Math.floor((tide-60)/8)+1;for(let j=0;j<levels;j++){const y=154+j*5;line(c,8,y,305,y,p.danger);}}
 // Sanity distortions never interfere with controls or textual information.
 if(Number(s.sanity)<7){const distortions=7-Math.max(0,Number(s.sanity)||0);
  for(let j=0;j<distortions;j++){const y=25+j*21;line(c,8,y,315,y+(j%2?2:-2),p.danger);}
 }
 if(effectsEnabled){
  const r=rng(19371+idx*29);for(let j=0;j<23;j++){const x=r()*318,base=r()*146;const y=(base+motion*(.12+j%3*.07))%151;rect(c,x,y,1,1+(j%5===0?2:0),j%4===0?p.accent:p.edge);}
 }
}
const BACKGROUNDS=[lighthouse,hospital,market,tunnels,crypt];
function investigator(c,p){const x=47,y=127;ellipse(c,x+2,158,20,4,'#05090b');polygon(c,[[x-9,y-1],[x+8,y-1],[x+18,y+31],[x-20,y+31]],'#070d11');rect(c,x-11,y+9,3,20,p.edge);rect(c,x+9,y+9,3,20,p.edge);rect(c,x-6,y-18,15,18,'#bba78c');rect(c,x-9,y-22,20,6,'#0b1217');rect(c,x-16,y-21,32,3,'#0b1217');rect(c,x-5,y-9,5,2,'#151a17');rect(c,x+4,y-9,4,2,'#151a17');rect(c,x-3,y,8,9,p.danger);line(c,x-1,y+9,x+1,y+23,p.edge);}
function monster(c,p,i,frame){const x=247,y=124+Math.sin(frame*.085)*2;ellipse(c,x,154,42,7,'#070b0f');
 if(i===0){for(let j=0;j<7;j++){const a=(j/7)*Math.PI*2;line(c,x,y-10,x+Math.cos(a)*45,y-10+Math.sin(a)*45,p.mist,2);}polygon(c,[[x-21,y-22],[x+20,y-28],[x+26,y+22],[x-25,y+25]],'#4a746b');ellipse(c,x,y-12,14,18,p.edge);ellipse(c,x,y-12,9,11,p.danger);ellipse(c,x,y-12,4,8,p.sky);}
 else if(i===1){polygon(c,[[x-17,y-39],[x+18,y-39],[x+35,y+28],[x-30,y+28]],'#b6c2af');rect(c,x-21,y-44,40,8,p.edge);rect(c,x-5,y-54,9,31,p.edge);rect(c,x-12,y-45,26,25,'#1d252d');ellipse(c,x,y-32,6,11,p.danger);}
 else if(i===2){polygon(c,[[x-31,y+30],[x-22,y-40],[x+26,y-41],[x+34,y+30]],'#514246');rect(c,x-16,y-49,31,17,'#121218');ellipse(c,x,y-22,24,10,'#a68b6b');for(let j=0;j<8;j++)line(c,x-20+j*6,y-22,x-20+j*6,y-10,p.danger,2);}
 else if(i===3){for(let j=0;j<6;j++){const a=j*Math.PI/5;line(c,x,y-3,x+Math.cos(a)*38,y-32+Math.sin(a)*26,p.mist,3);}polygon(c,[[x-22,y-39],[x+19,y-39],[x+31,y+30],[x-29,y+30]],'#3e435b');ellipse(c,x,y-35,15,21,'#10121e');rect(c,x-9,y-31,18,2,p.danger);}
 else{for(let j=0;j<9;j++)line(c,x-25+j*6,y+27,x-56+j*13,y-52-j%3*11,p.mist,2);ellipse(c,x,y-12,37,39,'#251d2e');ellipse(c,x,y-17,25,31,p.danger);ellipse(c,x,y-17,13,20,p.sky);ellipse(c,x,y-17,5,16,p.edge);}}
function embellish(c,p,r,frame){for(let i=0;i<45;i++){const x=Math.floor(r()*320),y=Math.floor(r()*180);c.globalAlpha=.12+(.10*Math.sin(frame/10+i));rect(c,x,y,1+(i%3===0?2:0),1,p.edge);}c.globalAlpha=1;for(let j=0;j<10;j++)rect(c,0,j*18,320,1,'#080d0e');rect(c,0,0,320,5,'#050b0e');rect(c,0,175,320,5,'#050b0e');rect(c,0,0,5,180,'#050b0e');rect(c,315,0,5,180,'#050b0e');}
/** Canvas dimensions are 640x360; drawing uses a pixelated 320x180 logical grid. */
function drawLegacyArt(canvas,s,frame=0){if(!canvas?.getContext)return;const c=canvas.getContext('2d');if(!c)return;const idx=Math.max(0,Math.min(4,s.caseIndex||0));const p=COLORS[idx],r=rng(idx*391+771);c.save();c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;c.scale(canvas.width/320,canvas.height/180);atmosphere(c,p,r,320,180);BACKGROUNDS[idx](c,p,r);atmosphericDetails(c,p,idx,frame,s);investigator(c,p);if(['combat','encounter'].includes(s.phase)){if(s.phase==='combat'&&s.combat?.optional){const x=247,y=114;for(let j=0;j<11;j++){const a=j*Math.PI*2/11+frame*.02;line(c,x,y,x+Math.cos(a)*38,y+Math.sin(a)*35,p.danger,1);}ellipse(c,x,y,24,29,p.stone);ellipse(c,x,y,15,20,p.mist);ellipse(c,x,y,7,10,p.sky);for(let j=0;j<5;j++){const a=j*Math.PI*2/5+frame*.01;ellipse(c,x+Math.cos(a)*28,y+Math.sin(a)*26,3,3,p.accent);}}else monster(c,p,idx,frame);if(s.phase==='combat'){const x=243,y=119;for(let t=0;t<((s.combat?.stage===2)?7:3);t++){const ang=t*Math.PI*2/7+frame*.025;ellipse(c,x+Math.cos(ang)*34,y+Math.sin(ang)*35,2.4,3.5,p.danger);}if(s.combat?.affliction){rect(c,20,31,70,11,'#2f1017');c.fillStyle=p.danger;c.font='bold 7px monospace';c.fillText('HEMORRAGIA',24,39);}}}embellish(c,p,r,frame);rect(c,9,9,114,16,'#071113');outline(c,9,9,114,16,p.edge);c.fillStyle=p.edge;c.font='bold 7px monospace';c.fillText('SAN TELMO / 1987',16,19);rect(c,237,9,72,16,'#071113');outline(c,237,9,72,16,p.edge);c.fillStyle=p.accent;c.fillText(`ARCHIVO 0${idx+1}/05`,244,19);c.restore();}
function drawLegacyPortrait(canvas,s,frame=0){if(!canvas?.getContext)return;const c=canvas.getContext('2d');if(!c)return;const i=Math.max(0,Math.min(4,s.caseIndex||0));const p=COLORS[i];const r=rng(114+i*19);c.save();c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;c.scale(canvas.width/96,canvas.height/96);rect(c,0,0,96,96,p.sky);for(let k=0;k<14;k++)line(c,0,k*8,96,k*8,p.stone);ellipse(c,48,110,42,50,'#182c2d');polygon(c,[[24,56],[35,39],[63,39],[74,56],[73,96],[23,96]],'#152326');ellipse(c,48,42,24,30,'#b4a78c');polygon(c,[[22,30],[31,12],[55,10],[72,25],[66,35],[28,31]],'#10181b');ellipse(c,35,43,3,3,p.danger);ellipse(c,59,43,3,3,p.danger);line(c,40,61,57,61,'#503e3a');for(let k=0;k<25;k++){const x=r()*96,y=r()*96;rect(c,x,y,1,2,p.edge);}if(s.sanity<7){rect(c,31,43,32,1,p.danger);line(c,18,20,72,79,p.danger);}rect(c,0,0,96,2,p.edge);rect(c,0,94,96,2,p.edge);c.restore();}
export const ART_SCENE_COUNT=BACKGROUNDS.length;


/**
 * WORLD-404 v1.6: original monochrome/halftone art direction.
 * The v1.5 procedural painter is retained as a deterministic fallback for
 * platforms where image loading is disabled or assets have not yet loaded.
 * No mechanics or save data are changed by the appearance layer.
 */
export const WORLD404_ART_ASSETS = Object.freeze({
 scenes: Object.freeze([
  'assets/art/scene-faro.webp', 'assets/art/scene-hospital.webp',
  'assets/art/scene-lonja.webp', 'assets/art/scene-tuneles.webp',
  'assets/art/scene-cripta.webp'
 ]),
 portrait: 'assets/art/portrait-investigador.webp',
 cinematic: Object.freeze(['assets/art/cinematic-faro.webp','assets/art/cinematic-hospital.webp','assets/art/cinematic-lonja.webp',null,null]),
 eventScenes: Object.freeze(['assets/art/event-faro.webp','assets/art/event-hospital.webp','assets/art/event-lonja.webp','assets/art/event-tuneles.webp','assets/art/event-cripta.webp']),
 twists: Object.freeze(['faro','hospital','mercado','tuneles','cripta'].map(id=>Object.freeze([0,1,2].map(i=>`assets/art/variacion-${id}-${i}.webp`)))),
 bossScenes: Object.freeze(['faro','hospital','mercado','tuneles','cripta'].map(id=>`assets/art/enfrentamiento-${id}.webp`)),
 cinematicPortraits: Object.freeze(['assets/art/cinematic-portrait-investigador.webp','assets/art/cinematic-portrait-testigo.webp','assets/art/cinematic-portrait-ahogado.webp']),
 monsters: Object.freeze(Array.from({length:6},(_,i)=>`assets/art/criatura-${i+1}.webp`))
});
const pictureCache = new Map();
function getPicture(path){
 if(typeof Image==='undefined')return null;
 if(pictureCache.has(path))return pictureCache.get(path);
 const image = new Image();
 // Normal local assets only. No remote service or third-party resource.
 image.decoding='async';
 image.onload=()=>{
  if(typeof document!=='undefined')document.dispatchEvent(new Event('world404:art-ready'));
 };
 image.onerror=()=>{pictureCache.set(path,null);};
 pictureCache.set(path,image);
 image.src=path;
 return image;
}
function readyPicture(path){const picture=getPicture(path);return picture?.complete&&picture.naturalWidth>0?picture:null;}
function framedText(ctx,text,x,y,w,dim=false){
 ctx.fillStyle='#070706';ctx.fillRect(x,y,w,32);
 ctx.strokeStyle=dim?'#8a8474':'#f2ede1';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,w-2,30);
 ctx.fillStyle=dim?'#b7aa88':'#f2ede1';ctx.font='bold 17px monospace';ctx.fillText(text,x+13,y+22);
}
export function drawArt(canvas,state,frame=0){
 if(!canvas?.getContext)return;
 const idx=Math.max(0,Math.min(4,Number(state?.caseIndex)||0));
 const custom = state?.phase==='twist' ? readyPicture(WORLD404_ART_ASSETS.twists[idx][selectIncidence(state.runSeed??1987,idx)]) : state?.phase==='combat' ? readyPicture(WORLD404_ART_ASSETS.bossScenes[idx]) : null;
 const cinematic=(WORLD404_ART_ASSETS.cinematic[idx] && !['combat','encounter'].includes(state.phase)) ? readyPicture(WORLD404_ART_ASSETS.cinematic[idx]) : null;
 const background=custom||cinematic||readyPicture(WORLD404_ART_ASSETS.scenes[idx]);
 const ctx=canvas.getContext('2d');
 if(!ctx||!background||typeof ctx.drawImage!=='function'){
  drawLegacyArt(canvas,state,frame);return;
 }
 const w=canvas.width,h=canvas.height;
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);
 ctx.drawImage(background,0,0,w,h);
 if(cinematic){ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(0,0,w,37);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(0,h-32,w,32);}
 // Obscure scene center during combat to make room for the creature tableau.
 if(['combat','encounter'].includes(state.phase)&&!custom){
  ctx.fillStyle='rgba(0,0,0,.80)';ctx.fillRect(w*.58,39,w*.42,h-67);
  const monsterIndex = state.combat?.optional ? 5 : idx;
  const monster=readyPicture(WORLD404_ART_ASSETS.monsters[monsterIndex]);
  if(monster){
   const sway=effectsEnabled?Math.round(Math.sin(frame*.12)*2):0;
   const mw=Math.round(w*.34),mh=Math.round(h*.76);
   ctx.drawImage(monster,Math.round(w*.64)+sway,37,mw,mh);
   ctx.strokeStyle='#dfd6c4';ctx.lineWidth=2;
   ctx.strokeRect(Math.round(w*.64)+sway,37,mw,mh);
  }
  if(state.combat?.affliction){ctx.fillStyle='#bd5855';ctx.fillRect(14,67,137,25);ctx.fillStyle='#000';ctx.font='bold 17px monospace';ctx.fillText('HEMORRAGIA',20,85);}
  if(Number(state.combat?.stage)===2){ctx.fillStyle='#d05b58';ctx.fillRect(w-136,h-42,123,24);ctx.fillStyle='#100b0b';ctx.font='bold 16px monospace';ctx.fillText('FASE II',w-125,h-25);}
 }
 // High-contrast diegetic labels, drawn independently from the scene image.
 framedText(ctx,'SAN TELMO / 1987',9,9,228);
 framedText(ctx,`ARCHIVO 0${idx+1}/05`,w-180,9,170,true);
 if(effectsEnabled){
  const noise=rng(701+idx*37+Math.floor(frame/3));
  ctx.fillStyle='rgba(246,240,219,.32)';
  for(let n=0;n<54;n++){const x=Math.floor(noise()*w),y=Math.floor(noise()*h);ctx.fillRect(x,y,1,1+(n%8===0?2:0));}
  const tide=Number(state?.doom)||0;
  if(tide>=50){ctx.fillStyle='rgba(160,46,42,.20)';ctx.fillRect(0,h-Math.min(80,tide),w,Math.min(80,tide));}
  if((Number(state?.sanity)||0)<7){ctx.fillStyle='rgba(225,211,196,.20)';for(let j=0;j<4;j++){const y=(17+j*84+frame*2)%h;ctx.fillRect(0,y,w,2);}}
 }
 ctx.strokeStyle='#f0e9dd';ctx.lineWidth=3;ctx.strokeRect(2,2,w-4,h-4);
 ctx.restore();
}
export function drawPortrait(canvas,state,frame=0){
 if(!canvas?.getContext)return;
 const preferred=state?.phase==='combat' && state?.caseIndex===2 ? WORLD404_ART_ASSETS.cinematicPortraits[2] : state?.caseIndex===1 && ['event','scene','omen'].includes(state?.phase) ? WORLD404_ART_ASSETS.cinematicPortraits[1] : WORLD404_ART_ASSETS.cinematicPortraits[0];
 const portrait=readyPicture(preferred)||readyPicture(WORLD404_ART_ASSETS.portrait);
 const ctx=canvas.getContext('2d');
 if(!ctx||!portrait||typeof ctx.drawImage!=='function'){
  drawLegacyPortrait(canvas,state,frame);return;
 }
 const w=canvas.width,h=canvas.height;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#040404';ctx.fillRect(0,0,w,h);
 ctx.drawImage(portrait,0,0,w,h);
 if(Number(state?.sanity)<7){ctx.fillStyle='rgba(185,75,73,.7)';ctx.fillRect(0,h*.49+Math.sin(frame*.07)*2,w,2);}
 ctx.strokeStyle='#f0e9dd';ctx.lineWidth=3;ctx.strokeRect(2,2,w-4,h-4);ctx.restore();
}
