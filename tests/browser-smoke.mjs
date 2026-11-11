import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium,firefox} from 'playwright';

const base='http://127.0.0.1:8765';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
async function ready(){
 for(let i=0;i<60;i++){try{const r=await fetch(base+'/index.html');if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}
 throw Error('Servidor local no disponible');
}
async function smoke(browserType){
 const name=browserType.name(),browser=await browserType.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',acceptDownloads:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('dialog',d=>d.accept());
 const snap=async stage=>page.screenshot({path:`qa-screenshots/${name}-${stage}.png`,fullPage:true,animations:'disabled'});
 try{
  const response=await page.goto(base+'/',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  assert.equal(await page.locator('#main-menu').isVisible(),true,'initial menu');
  await snap('01-menu');
  assert.equal(await page.locator('#menu-continue').isDisabled(),true);
  await page.locator('#menu-new').click();
  assert.equal(await page.locator('#main-menu').isVisible(),false);
  await page.getByRole('button',{name:'ABRIR EL PRIMER EXPEDIENTE'}).click();
  assert.equal(await page.locator('#map').isVisible(),true);
  assert.ok((await page.locator('.map-legend li').count())>=5);
  await snap('02-mapa');
  await page.locator('#actions button').filter({hasText:'EXPLORAR ·'}).first().click();
  assert.equal(await page.locator('#title').isVisible(),true);
  await snap('03-investigacion');
  await page.locator('#actions button').first().click();
  await page.locator('.action-conclude summary').click();
  await page.locator('#actions button').filter({hasText:'CERRAR INVESTIGACIÓN'}).first().click();
  await page.locator('#actions button').first().click();
  assert.equal(await page.getByRole('button',{name:'ENFRENTARSE A LA CRIATURA'}).isVisible(),true);
  await page.getByRole('button',{name:'ENFRENTARSE A LA CRIATURA'}).click();
  assert.match(await page.locator('#story').innerText(),/INTENCIÓN ENEMIGA/);
  await snap('04-combate');
  await page.keyboard.press('h');assert.equal(await page.locator('#help').getAttribute('open'),'');
  await page.keyboard.press('j');assert.equal(await page.locator('#archive').getAttribute('open'),'');
  await page.keyboard.press('Escape');
  await page.keyboard.press('m');assert.equal(await page.locator('#main-menu').isVisible(),true);
  await page.locator('#menu-continue').click();
  const ending=await page.evaluate(async()=>{
   const mod=await import('/src/engine.js');
   const s=mod.initialState(404);
   for(let i=0;i<5;i++){s.phase='map';s.flags.push('repro');s.resolve++;mod.finishCase(s);}
   localStorage.setItem(mod.STORAGE,JSON.stringify(s));
   return s.ending;
  });
  assert.equal(ending,'sellado');
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#menu-continue').click();
  assert.match(await page.locator('#title').innerText(),/La ciudad que resistió/);
  await snap('05-final-simulado');
  await page.setViewportSize({width:390,height:844});
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#main-menu').isVisible(),true);
  await snap('06-menu-movil');
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  assert.ok(width.scroll<=width.viewport+5,`desbordamiento en móvil: ${JSON.stringify(width)}`);
  assert.deepEqual(errors,[],`Errores de consola ${name}`);
 }finally{await context.close();await browser.close();}
}
try{await mkdir('qa-screenshots',{recursive:true});await ready();for(const browser of [chromium,firefox])await smoke(browser);console.log('QA navegador: Chromium + Firefox; menú, mapa, investigación, combate, final sintético y móvil OK');}
finally{server.kill('SIGTERM');}
