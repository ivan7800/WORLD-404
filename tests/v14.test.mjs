import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,visitLocation,investigateScene,availableOmen,startOmen,resolveOmen,safeLoad,startAnomaly,availableAnomaly} from '../src/engine.js';
import {CASES} from '../src/data.js';
const lucky=()=>0.99;
function ready(i=0){const s=initialState();s.caseIndex=i;advance(s);visitLocation(s,0);investigateScene(s,0,lucky);return s;}
test('los cinco expedientes ofrecen un presagio tras investigar',()=>{for(let i=0;i<CASES.length;i++){const s=ready(i);assert.ok(availableOmen(s));assert.equal(s.phase,'map');}});
test('presagio se resuelve una única vez y vuelve al mapa',()=>{const s=ready();startOmen(s);assert.equal(s.phase,'omen');resolveOmen(s,0);assert.equal(s.phase,'map');assert.equal(s.omens.length,1);const before=JSON.stringify(s);resolveOmen(s,1);assert.equal(JSON.stringify(s),before);assert.equal(availableOmen(s),null);});
test('segunda ruta proporciona claves pero causa coste mental',()=>{const s=ready(2);const old=s.sanity;startOmen(s);resolveOmen(s,1);assert.ok(s.resolve>0);assert.ok(s.sanity<old);assert.equal(s.omens[0].tag,'revelacion');});
test('una decisión del presagio sobrevive al guardado y al recargado',()=>{const s=ready(1);startOmen(s);const mid=safeLoad(JSON.stringify(s));assert.equal(mid.phase,'omen');resolveOmen(mid,0);const loaded=safeLoad(JSON.stringify(mid));assert.equal(loaded.omens.length,1);assert.equal(loaded.phase,'map');});
test('las partidas de v1.3 sin campos de presagios migran automáticamente',()=>{const s=ready();delete s.omens;delete s.activeOmen;const saved=safeLoad(JSON.stringify(s));assert.deepEqual(saved.omens,[]);assert.equal(saved.activeOmen,null);});
test('los guardados de la fase anomalía son válidos',()=>{const s=ready();assert.ok(availableAnomaly(s));startAnomaly(s);assert.equal(s.phase,'anomaly');const save=safeLoad(JSON.stringify(s));assert.ok(save);assert.equal(save.phase,'anomaly');});
test('rechaza guardados de presagios sin identificador correcto',()=>{const s=ready();startOmen(s);s.activeOmen='otro';assert.equal(safeLoad(JSON.stringify(s)),null);});
