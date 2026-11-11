#!/usr/bin/env bash
set -Eeuo pipefail
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
APPDIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
mkdir -p -- "$APPDIR"
chmod u+x -- "$HERE/WORLD-404-LinuxMint.sh"
python3 - "$HERE" "$APPDIR/world-404.desktop" <<'PY'
from pathlib import Path
import sys
root, target = map(Path, sys.argv[1:3])
exe = root / 'WORLD-404-LinuxMint.sh'
def esc(value):
    return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"').replace('$','\\$').replace('`','\\`') + '"'
entry = ('[Desktop Entry]\nVersion=1.0\nType=Application\nName=WORLD-404\n'
         'Comment=El Archivo de la Marea Negra\n'
         'Exec=' + esc(exe) + '\n'
         'Path=' + str(root) + '\n'
         'Icon=' + str(root / 'build' / 'icon.png') + '\n'
         'Terminal=true\nCategories=Game;\nStartupNotify=false\n')
target.write_text(entry, encoding='utf-8')
print('Acceso directo instalado:', target)
print('Encontrarás WORLD-404 en el menú Juegos de Linux Mint.')
PY
chmod u+x -- "$APPDIR/world-404.desktop"
command -v update-desktop-database >/dev/null && update-desktop-database "$APPDIR" >/dev/null 2>&1 || true
