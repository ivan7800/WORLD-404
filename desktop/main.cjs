'use strict';
const {app, BrowserWindow, protocol, net, shell} = require('electron');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const {resolveAsset} = require('./paths.cjs');

// A persistent, secure custom origin keeps localStorage across launches.
protocol.registerSchemesAsPrivileged([
  {scheme: 'world404', privileges: {standard: true, secure: true, supportFetchAPI: true, stream: true}}
]);

const root = path.resolve(__dirname, '..');
let window;
app.whenReady().then(async () => {
  protocol.handle('world404', request => {
    const filePath = resolveAsset(root, request.url);
    if (!filePath) return new Response('Not found', {status: 404});
    return net.fetch(pathToFileURL(filePath).toString());
  });
  window = new BrowserWindow({
    width: 1300, height: 880, minWidth: 780, minHeight: 650,
    title: 'WORLD-404 — El Archivo de la Marea Negra',
    backgroundColor: '#080807',
    autoHideMenuBar: true,
    webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true}
  });
  window.webContents.setWindowOpenHandler(() => ({action: 'deny'}));
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('world404://game/')) event.preventDefault();
  });
  await window.loadURL('world404://game/index.html');
});
app.on('window-all-closed', () => app.quit());
