import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require = createRequire(import.meta.url);
const {resolveAsset} = require('../desktop/paths.cjs');
const root = '/tmp/WORLD-404';
test('desktop paths allow only game assets', () => {
 assert.equal(resolveAsset(root, 'world404://game/'), `${root}/index.html`);
 assert.equal(resolveAsset(root, 'world404://game/src/main.js'), `${root}/src/main.js`);
 assert.equal(resolveAsset(root, 'world404://game/styles.css'), `${root}/styles.css`);
 assert.equal(resolveAsset(root, 'world404://game/assets/art/scene-faro.webp'), `${root}/assets/art/scene-faro.webp`);
});
test('desktop paths reject outside origin and invalid paths', () => {
 for(const url of ['https://game/index.html','world404://evil/src/main.js','world404://game/desktop/main.cjs','world404://game/package.json','world404://game/src/foo.txt','world404://game/src/%5cwindows.js','world404://game/src/%00bad.js','world404://game/assets/art/../../private.png','world404://game/assets/art/secret.txt','world404://game/assets/other/file.webp']) assert.equal(resolveAsset(root, url), null, url);
});
test('desktop release workflow produces Linux and Windows jobs', () => {
 const yml = readFileSync(new URL('../.github/workflows/build-desktop.yml', import.meta.url), 'utf8');
 assert.match(yml, /ubuntu-22\.04/); assert.match(yml, /windows-2022/); assert.match(yml, /upload-artifact@v4/);
});
test('browser sandbox stays enabled and Node integration disabled', () => {
 const main = readFileSync(new URL('../desktop/main.cjs', import.meta.url), 'utf8');
 assert.match(main, /contextIsolation: true/);assert.match(main, /nodeIntegration: false/);assert.match(main, /sandbox: true/);
});
