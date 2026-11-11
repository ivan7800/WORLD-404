#!/usr/bin/env python3
"""WORLD-404 localhost-only launcher server (Python standard library)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError
import os
import subprocess
import sys
import threading
import time
import webbrowser

ROOT = Path(__file__).resolve().parent.parent
PORT = 8765
MARKER = 'WORLD-404'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        print('[WORLD-404] ' + fmt % args, flush=True)

class Server(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

def existing_world404():
    try:
        with urlopen(f'http://127.0.0.1:{PORT}/index.html', timeout=2) as response:
            data = response.read(12000).decode('utf-8', errors='replace')
            return MARKER in data
    except (OSError, URLError):
        return False

def open_browser(url):
    # Prefer desktop integration, but the user can always open the printed URL.
    for browser in ('xdg-open', 'gio'):
        try:
            cmd = [browser, url] if browser == 'xdg-open' else ['gio', 'open', url]
            result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=8)
            if result.returncode == 0:
                print('Navegador solicitado al escritorio.', flush=True)
                return
        except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
            pass
    try:
        if webbrowser.open(url):
            print('Navegador solicitado.', flush=True)
            return
    except Exception as exc:
        print('No se pudo abrir el navegador:', exc, flush=True)
    print('Abre manualmente esta dirección:', url, flush=True)

def main():
    if not (ROOT / 'index.html').is_file():
        print('ERROR: No encuentro index.html. Extrae el ZIP completo antes de iniciar.', file=sys.stderr)
        return 2

    print('WORLD-404 - Linux Mint (lanzador corregido)', flush=True)
    try:
        server = Server(('127.0.0.1', PORT), Handler)
    except OSError as exc:
        if existing_world404():
            url = f'http://127.0.0.1:{PORT}/'
            print('WORLD-404 ya está iniciado en este puerto.', flush=True)
            if '--no-browser' not in sys.argv:
                open_browser(url)
            return 0
        print(f'ERROR: no se puede abrir el puerto {PORT}: {exc}', file=sys.stderr)
        print('Cierra la aplicación que utiliza ese puerto y vuelve a intentarlo.', file=sys.stderr)
        print('Diagnóstico: ss -ltnp | grep :8765', file=sys.stderr)
        return 3

    with server:
        url = f'http://127.0.0.1:{PORT}/'
        print('Juego listo:', url, flush=True)
        print('Para salir, pulsa Ctrl+C o cierra esta terminal.', flush=True)
        if '--no-browser' not in sys.argv:
            threading.Thread(target=open_browser, args=(url,), daemon=True).start()
        try:
            server.serve_forever(poll_interval=0.2)
        except KeyboardInterrupt:
            print('\nWORLD-404 detenido.', flush=True)
    return 0

if __name__ == '__main__':
    sys.exit(main())
