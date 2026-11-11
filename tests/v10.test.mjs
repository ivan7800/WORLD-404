import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=new URL('../',import.meta.url);
const get=(name)=>readFileSync(new URL(name,root),'utf8');
test('lanzador Linux Mint presente y limita el servidor a loopback',()=>{
 assert.ok(existsSync(new URL('WORLD-404-LinuxMint.sh',root)));
 const srv=get('launchers/server.py');
 assert.match(srv,/127\.0\.0\.1/);assert.match(srv,/8765/);
});
test('lanzador Windows incluido, sin dependencias de Node ni Python',()=>{
 assert.match(get('WORLD-404-Windows.cmd'),/powershell\.exe/);
 const ps=get('launchers/server-windows.ps1');
 assert.match(ps,/TcpListener/);assert.match(ps,/Loopback/);assert.match(ps,/8765/);
 assert.match(ps,/StartsWith\(\$root/);
});
test('interfaz permite exportar e importar partidas',()=>{
 const html=get('index.html'),js=get('src/main.js');
 for(const id of ['export','import','savefile'])assert.ok(html.includes(`id="${id}"`));
 assert.match(js,/safeLoad\(await file\.text\(\)\)/);
 assert.match(js,/WORLD-404-partida\.json/);
});
test('versión del paquete y presentación consistentes',()=>{
 assert.equal(JSON.parse(get('package.json')).version,'1.9.0');
 assert.match(get('index.html'),/WORLD-404 · v1\.9/);
});
