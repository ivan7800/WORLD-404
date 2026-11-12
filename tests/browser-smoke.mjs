import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {chromium,firefox} from 'playwright';

const base='http://127.0.0.1:8765';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const endings={
 sellado:'La ciudad que resistió',
 rescate:'Los nombres que regresaron',
 supervivencia:'La verdad bajo el agua'
};

async function ready(){
 for(let i=0;i<60;i++){
  try{if((await fetch(base+'/index.html')).ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 throw Error('Servidor local no disponible');
}
async function checkAudio(page){
 await page.evaluate(()=>{
  // Inspect the final mix with the browser's real Web Audio nodes.
  const connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(destination,...ports){
   if(destination===this.context.destination&&this instanceof GainNode&&!window.mixProbe){
    window.mixProbe=this.context.createAnalyser();
    connect.call(this,window.mixProbe);
   }
   return connect.call(this,destination,...ports);
  };
  window.mixPeak=()=>{
   if(!window.mixProbe)return -1;
   const samples=new Float32Array(window.mixProbe.fftSize);
   window.mixProbe.getFloatTimeDomainData(samples);
   return samples.reduce((peak,sample)=>Math.max(peak,Math.abs(sample)),0);
  };
 });
 await page.locator('#audio').click();
 await page.waitForFunction(()=>document.querySelector('#audio').getAttribute('aria-pressed')==='true');
 await page.waitForFunction(()=>window.mixPeak()>.004);
 assert.equal(await page.locator('#audio').innerText(),'SONIDO: SÍ');
 await page.locator('#audio-options-open').click();
 const volume=(key,value)=>page.locator('#volume-'+key).fill(String(value));
 const quiet=async()=>{
  await page.waitForFunction(()=>window.mixPeak()>=0&&window.mixPeak()<.0005);
 };
 await volume('ambience',0);
 await volume('music',0);
 await quiet();
 await page.locator('#audio-preview').click();
 await page.waitForFunction(()=>window.mixPeak()>.004);
 await volume('effects',0);
 await quiet();
 await page.locator('#audio-preview').click();
 await page.waitForTimeout(160);
 assert.ok(await page.evaluate(()=>window.mixPeak()<.0005),'Capa de efectos silenciada');
 await volume('music',70);
 await page.waitForFunction(()=>window.mixPeak()>.004);
 await volume('master',0);
 await quiet();
 await volume('music',0);
 await volume('ambience',80);
 await volume('master',75);
 await page.waitForFunction(()=>window.mixPeak()>.004);
 await volume('music',37);
 await volume('effects',75);
 await page.locator('#audio-options-close').click();
 await page.locator('#audio').click();
 await quiet();
 assert.equal(await page.locator('#audio').innerText(),'SONIDO: NO');
 await page.reload();
 await page.locator('#menu-options').click();
 assert.equal(await page.locator('#volume-music').inputValue(),'37');
 await page.keyboard.press('Escape');
 await page.locator('#menu-continue').click();

 const measurements=await page.evaluate(async()=>{
  const {audioProfile,createSoundscape,playCue}=await import('/src/audio.js');
  async function measure(scene,cue){
   const sampleRate=22050;
   const ctx=new OfflineAudioContext(2,sampleRate,sampleRate);
   const music=ctx.createGain(),ambience=ctx.createGain();
   music.connect(ctx.destination);ambience.connect(ctx.destination);
   if(scene)createSoundscape(ctx,ambience,music,audioProfile(scene));
   if(cue)playCue(ctx,ctx.destination,cue);
   const buffer=await ctx.startRendering();
   const data=buffer.getChannelData(0);
   return data.reduce((sum,sample,index)=>({
    peak:Math.max(sum.peak,Math.abs(sample)),
    signature:sum.signature+Math.abs(sample)*(index+1)
   }),{peak:0,signature:0});
  }
  const zones=['faro','hospital','mercado','tuneles','cripta'].map(caseId=>({phase:'map',caseId}));
  return Promise.all([...zones,{phase:'combat',caseId:'cripta',stage:2,doom:83,sanity:3}]
   .map(scene=>measure(scene)).concat(['reveal','tape','hit','ritual','phase'].map(cue=>measure(null,cue))));
 });
 for(const {peak} of measurements)assert.ok(peak>.005&&peak<.85,'Señal audible sin recorte digital: '+peak);
 assert.equal(new Set(measurements.map(x=>x.signature.toFixed(2))).size,measurements.length);
 console.log('Mezcla Web Audio: salida real, controles, silencio y persistencia comprobados');
}
async function campaign(browser, name, route){
 const mobile=route==='rescate';
 const context=await browser.newContext({
  viewport:mobile?{width:390,height:844}:{width:1440,height:900},
  hasTouch:mobile,reducedMotion:'reduce',acceptDownloads:true
 });
 // Reproducible dice, normal health and inventory, and every state change through the UI.
 await context.addInitScript(()=>{Math.random=()=>0.91;});
 const page=await context.newPage();
 page.setDefaultTimeout(7000);
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 page.on('dialog',dialog=>dialog.accept());
 const actions=page.locator('#actions button');
 const action=text=>actions.filter({hasText:text}).first();
 const title=page.locator('#title');
 const snapshot=stage=>page.screenshot({path:`qa-screenshots/${name}-${route}-${stage}.png`,animations:'disabled'});
 const resume=async()=>{
  await page.reload();
  await page.locator('#menu-continue').click();
 };
 const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('world404-save-v10')));
 try{
  const response=await page.goto(base+'/');
  assert.equal(response.status(),200);
  assert.equal(await page.locator('#menu-continue').isDisabled(),true);
  await snapshot('01-menu');
  await page.locator('#menu-new').click();
  await action('ABRIR EL PRIMER EXPEDIENTE').click();
  assert.ok(await page.locator('#map').isVisible());
  if(route==='sellado'){
   await page.keyboard.press('h');assert.ok(await page.locator('#help').evaluate(el=>el.open));
   await page.keyboard.press('j');assert.ok(await page.locator('#archive').evaluate(el=>el.open));
   await page.keyboard.press('Escape');
   await page.keyboard.press('m');
   await page.locator('#menu-continue').click();
   await checkAudio(page);
  }
  for(let i=0;i<5;i++){
   const start=await save();
   assert.equal(start.caseIndex,i);
   for(let j=0;j<3;j++){
    await action('EXPLORAR ·').click();
    assert.match(await actions.first().innerText(),/\/6 de éxito/);
    if(i===0&&j===0&&route==='sellado')await snapshot('02-investigacion');
    await actions.first().click();
   }
   if(i===0&&route==='sellado'){
    assert.equal(await page.locator('.evidence-callout li').count(),3);
    await page.locator('.action-optional summary').click();
    await action('ESCUCHAR INTERFERENCIA DEL ARCHIVO').click();
    assert.deepEqual((await save()).echoes,['faro']);
    await resume();
    assert.deepEqual((await save()).echoes,['faro']);
   }
   if(route!=='supervivencia'){
    await action(['Interrumpir el pulso con la llave espiral','La secuencia de traslados al sótano',
     'La cicatriz que comparten los postores','Repitiendo las notas en orden inverso',
     'Ordenando las cinco pruebas por la fecha de desaparición'][i]).click();
   }
   await page.locator('.action-optional summary').click();
   await action('RUTA CAUTELOSA').click();
   await page.locator('.action-conclude summary').click();
   await action('CERRAR INVESTIGACIÓN').click();
   await actions.nth(route==='rescate'?0:1).click();
   if(route!=='supervivencia')await action('PREPARAR SELLO').click();
   await action('ENFRENTARSE A LA CRIATURA').click();
   if(i===0&&route==='sellado'){
    await snapshot('03-combate');
    await action('ESTUDIAR Y CUBRIRSE').click();
    const before=await save();
    await resume();
    assert.deepEqual(await save(),before);
   }
   let sawSecondPhase=false;
   for(let round=0;round<20;round++){
    const s=await save();
    if(s.phase!=='combat')break;
    sawSecondPhase ||= s.combat.stage===2;
    let choice='ATACAR ·';
    if(s.combat.momentum>=2)choice='RUPTURA RITUAL';
    else if(s.health<=8&&s.inventory.includes('medkit'))choice='BOTIQUÍN ·';
    else if(s.sanity<=7&&s.inventory.includes('tonic'))choice='TÓNICO ·';
    else if(s.combat.exposed)choice='ATAQUE PRECISO';
    await action(choice).click();
   }
   const result=await save();
   assert.equal(result.caseIndex,i+1,`${name} ${route}, expediente ${i+1}: ${result.ending||result.phase}`);
   if(i===4)assert.ok(sawSecondPhase,'Se juega la segunda fase del Heraldo');
   if(i<4){
    if(result.health<15&&result.supplies>=2&&!result.inventory.includes('medkit'))await action('COMPRAR BOTIQUÍN').click();
    if(result.sanity<11&&result.supplies>=4&&!result.inventory.includes('tonic'))await action('COMPRAR TÓNICO').click();
    await action('INVESTIGAR EL SIGUIENTE CASO').click();
   }
  }
  assert.equal((await save()).ending,route);
  assert.equal(await title.innerText(),endings[route]);
  await snapshot('04-final');
  if(route==='sellado'){
   const exported=page.waitForEvent('download');
   await page.locator('#export').click();
   const download=await exported;
   const data=await readFile(await download.path());
   const legacy=JSON.parse(data.toString());
   assert.equal(legacy.ending,'sellado');
   legacy.version=9;
   legacy.runSeed++;
   delete legacy.failedDeductions;
   await page.locator('#savefile').setInputFiles({name:'partida-v9.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
   await page.waitForFunction(seed=>JSON.parse(localStorage.getItem('world404-save-v10')).runSeed===seed,legacy.runSeed);
   assert.equal((await save()).version,10);
   await resume();
   assert.equal(await title.innerText(),endings.sellado);
  }
  const width=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(width<=5,`${name}, ${route}: desbordamiento de ${width}px`);
  assert.deepEqual(errors,[],`Errores de consola ${name}, ${route}`);
  console.log(`${name} · ${route} · campaña completa, cinco jefes y final`);
 }finally{await context.close();}
}
try{
 await mkdir('qa-screenshots',{recursive:true});
 await ready();
 const browserTypes=process.env.WORLD404_CHROMIUM_PATH?[chromium]:[chromium,firefox];
 for(const type of browserTypes){
  const browser=await type.launch({headless:true,executablePath:process.env.WORLD404_CHROMIUM_PATH});
  try{
   for(const route of Object.keys(endings))await campaign(browser,type.name(),route);
  }finally{await browser.close();}
 }
}finally{server.kill('SIGTERM');}
