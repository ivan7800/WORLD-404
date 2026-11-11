#!/usr/bin/env bash
# WORLD-404: ejecutar desde cualquier carpeta y mostrar errores en pantalla.
set -Eeuo pipefail
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd -- "$HERE"
if ! command -v python3 >/dev/null 2>&1; then
  printf '\nERROR: falta Python 3. Instálalo con: sudo apt install python3\n' >&2
  exit 127
fi
if [[ ! -f index.html || ! -f launchers/server.py ]]; then
  printf '\nERROR: archivos incompletos. Extrae TODO el ZIP y ejecútalo desde la carpeta WORLD-404.\n' >&2
  exit 2
fi
printf 'WORLD-404 - Iniciando en Linux Mint...\n'
exec python3 -u launchers/server.py "$@"
