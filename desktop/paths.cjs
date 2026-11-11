'use strict';
const path = require('node:path');
const {fileURLToPath} = require('node:url');

// Reject URL-encoded traversal, backslashes and anything outside shipped assets.
function resolveAsset(root, rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'world404:' || url.hostname !== 'game' || url.username || url.password || url.port) return null;
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return null; }
  if (pathname.includes('\\') || pathname.includes('\0')) return null;
  const parts = pathname.split('/');
  if (parts.some(part => part === '..' || part === '.')) return null;
  const rel = (pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, ''));
  if (!rel || !/^(index\.html|styles\.css|src\/[\w./-]+|assets\/art\/[\w.-]+)$/.test(rel)) return null;
  if (rel.startsWith('src/') && !/\.(js|json|css|png|svg|webp|ogg|mp3|wav)$/.test(rel)) return null;
  if (rel.startsWith('assets/art/') && !/\.(png|svg|webp)$/.test(rel)) return null;
  const base = path.resolve(root);
  const resolved = path.resolve(base, rel);
  if (resolved !== path.join(base, 'index.html') && !resolved.startsWith(base + path.sep)) return null;
  return resolved;
}
module.exports = { resolveAsset };
