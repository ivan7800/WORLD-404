import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {drawArt,setVisualEffects,visualEffectsEnabled,ART_SCENE_COUNT} from '../src/art.js';
import {ambienceFrequency,isAudioEnabled,setAmbience,sound,toggleAudio} from '../src/audio.js';
import {initialState} from '../src/engine.js';
const text=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
function fakeCanvas(){let count=0;const methods=['save','restore','clearRect','strokeRect','beginPath','moveTo','lineTo','closePath','fill','stroke','ellipse','scale','fillText'];const ctx={fillRect(){count++;}};for(const method of methods)ctx[method]=()=>{};return {canvas:{width:640,height:360,getContext(){return ctx;}},getCount:()=>count};}
test('atmósfera original disponible en cinco expedientes',()=>assert.equal(ART_SCENE_COUNT,5));
test('filtros atmosféricos cambian sin modificar el estado de la partida',()=>{const state=initialState();const before=JSON.stringify(state);for(let i=0;i<5;i++){state.caseIndex=i;state.doom=81;state.sanity=3;const c=fakeCanvas();drawArt(c.canvas,state,25);assert.ok(c.getCount()>100); }assert.equal(state.doom,81);assert.equal(state.sanity,3);assert.equal(JSON.stringify({...state,caseIndex:0,doom:state.doom,sanity:state.sanity}),JSON.stringify({...JSON.parse(before),doom:81,sanity:3}));});
test('desactivar efectos no impide dibujar y recupera el valor predeterminado',()=>{setVisualEffects(false);assert.equal(visualEffectsEnabled(),false);const c=fakeCanvas();drawArt(c.canvas,initialState(),99);assert.ok(c.getCount()>100);setVisualEffects(true);assert.equal(visualEffectsEnabled(),true);});
test('paisajes sonoros asignan tonalidades distintas a distritos y combate',()=>{assert.notEqual(ambienceFrequency('combat','faro'),ambienceFrequency('explore','faro'));assert.notEqual(ambienceFrequency('explore','faro'),ambienceFrequency('explore','hospital'));});
test('audio se degrada sin excepciones cuando no hay Web Audio',()=>{assert.equal(isAudioEnabled(),false);setAmbience('combat','faro');sound('hit');const enabled=toggleAudio();assert.equal(enabled,true);setAmbience('scene','puerto');toggleAudio();assert.equal(isAudioEnabled(),false);});
test('control de efectos accesible y persistencia de preferencias',()=>{assert.match(text('index.html'),/id="effects" aria-pressed="true"/);assert.match(text('src/main.js'),/world404:effects/);assert.match(text('styles.css'),/prefers-reduced-motion/);});
