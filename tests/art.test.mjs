import test from 'node:test';
import assert from 'node:assert/strict';
import {drawArt,drawPortrait,ART_SCENE_COUNT} from '../src/art.js';
import {initialState} from '../src/engine.js';
function canvas(){const ops=[];const context={save(){},restore(){},clearRect(){},fillRect(...a){ops.push(a);},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},ellipse(){},scale(){},fillText(){}};return {canvas:{width:640,height:360,getContext(){return context;}},ops};}
test('cinco fondos originales disponibles',()=>assert.equal(ART_SCENE_COUNT,5));
test('cada expediente dibuja sin fallos',()=>{for(let i=0;i<5;i++){const {canvas:c,ops}=canvas();const s=initialState();s.caseIndex=i;drawArt(c,s);assert.ok(ops.length>130,`arte insuficiente: ${i}`);s.phase='combat';drawArt(c,s,4);}});
test('retrato reacciona a la cordura y dibuja sin errores',()=>{const {canvas:c,ops}=canvas();const s=initialState();s.sanity=2;drawPortrait(c,s);assert.ok(ops.length>20);});
test('el arte tolera canvas no disponibles',()=>{drawArt(null,initialState());drawPortrait(null,initialState());});
