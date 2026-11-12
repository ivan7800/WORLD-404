import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WORLD404_ART_ASSETS,drawArt,drawPortrait,setVisualEffects} from '../src/art.js';
import {initialState} from '../src/engine.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file = p => fs.readFileSync(path.join(root,p),'utf8');
function fakeCanvas(){
 const calls=[];const ctx={fillRect:(...args)=>calls.push(['rect',...args]),drawImage:(...args)=>calls.push(['image',...args]),save(){},restore(){},clearRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},ellipse(){},scale(){},fillText(){}};
 return {canvas:{width:640,height:360,getContext:()=>ctx},calls};
}
test('cinco escenarios y seis criaturas son originales y descargables sin servidor externo',()=>{
 assert.equal(WORLD404_ART_ASSETS.scenes.length,5);
 assert.equal(WORLD404_ART_ASSETS.monsters.length,6);
 for(const p of [...WORLD404_ART_ASSETS.scenes,...WORLD404_ART_ASSETS.monsters,WORLD404_ART_ASSETS.portrait]){
  assert.ok(p.startsWith('assets/art/'));
  assert.ok(fs.existsSync(path.join(root,p)),`no existe ${p}`);
  assert.ok(fs.statSync(path.join(root,p)).size>10000,`arte vacío ${p}`);
 }
});
test('el fallback sin soporte para imágenes mantiene los cinco escenarios y los estados del juego',()=>{
 const before=JSON.stringify(initialState(1987));
 for(let idx=0;idx<5;idx++){
  const state=initialState(1987);state.caseIndex=idx;
  const {canvas,calls}=fakeCanvas();drawArt(canvas,state,0);
  assert.ok(calls.length>100);drawPortrait(canvas,state,0);
 }
 assert.equal(JSON.stringify(initialState(1987)),before);
});
test('la hoja de estilo usa tinta monocroma y conserva puntos de foco y móvil',()=>{
 const css=file('styles.css');
 assert.match(css,/LA EDICI[ÓO]N DE TINTA/);
 assert.match(css,/--bg:#080807/);
 assert.match(css,/focus-visible/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(file('src/main.js'),/world404:art-ready/);
});
test('el empaquetado Electron incluye los recursos artísticos',()=>{
 const pkg=JSON.parse(file('package.json'));
 assert.equal(pkg.version,'2.2.0');
 assert.ok(pkg.build.files.includes('assets/**/*'));
 assert.match(file('index.html'),/v2\.2/);
 assert.match(file('desktop/paths.cjs'),/assets\\\/art/);
});
test('efectos opcionales siguen siendo reversibles en la capa visual',()=>{
 const state=initialState();state.sanity=3;state.doom=75;
 setVisualEffects(false);drawArt(fakeCanvas().canvas,state,5);
 setVisualEffects(true);drawArt(fakeCanvas().canvas,state,5);
 assert.equal(state.sanity,3);assert.equal(state.doom,75);
});
