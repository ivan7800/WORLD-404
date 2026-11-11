import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES} from '../src/data.js';
import {initialState,advance,visitLocation,investigateScene,buySupply,safeLoad} from '../src/engine.js';
test('cinco expedientes contienen quince ubicaciones',()=>assert.equal(CASES.reduce((n,c)=>n+c.locations.length,0),15));
test('investigar lugar guarda pista y no permite repetir',()=>{const s=initialState();advance(s);visitLocation(s,0);assert.equal(s.phase,'scene');investigateScene(s,0,()=>.99);assert.equal(s.phase,'map');assert.equal(s.notes.length,1);visitLocation(s,0);assert.equal(s.phase,'map');});
test('fallo de investigación produce consecuencias',()=>{const s=initialState();advance(s);visitLocation(s,0);investigateScene(s,0,()=>0);assert.equal(s.sanity,17);assert.equal(s.doom,4);});
test('compras consumen suministros',()=>{const s=initialState();s.phase='interlude';buySupply(s,'medkit');assert.equal(s.supplies,0);assert.equal(s.inventory.filter(x=>x==='medkit').length,2);});
test('migración desde guardado v0.1',()=>{const s=initialState();delete s.visited;delete s.notes;delete s.supplies;delete s.scene;s.version=1;const loaded=safeLoad(JSON.stringify(s));assert.equal(loaded.version,10);assert.deepEqual(loaded.visited,[]);});
