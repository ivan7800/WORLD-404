# WORLD-404 v2 — matriz QA y procedimientos

## Resultados comprobados
- GitHub Actions PR #1, ejecución inicial de la rama: `npm run check` sin errores de sintaxis.
- Primera suite con seis tests nuevos de persistencia: **120 pruebas, 119 correctas, 1 fallida** (ver run `42939316914`).
- Causa de ese fallo identificada en `tests/v13.test.mjs`: compatibilidad con un `pendingEvent` histórico fuera de la fase `event`. La iteración siguiente ajusta el validador; consultar el último workflow para confirmar que el caso quedó resuelto.
- Otras afirmaciones de plataforma requieren evidencia posterior, no se presuponen aprobadas.

## Matriz
| Área | Comprobación automatizada | Navegador real | Windows 11 | Linux Mint |
| --- | --- | --- | --- | --- |
| Motor, cinco expedientes y finales | tests Node existentes | Pendiente | Pendiente | Pendiente |
| Guardado, carga, backup, importación | `tests/save-store.test.mjs` | Pendiente | Pendiente | Pendiente |
| UI menú, mapa, archivo, botones | código y pruebas estructurales | Pendiente | Pendiente | Pendiente |
| Arte, rutas y ficheros WebP | `tests/art.test.mjs` | Pendiente | Pendiente | Pendiente |
| Seguridad Electron y rutas | `tests/desktop.test.mjs` | No aplica | Pendiente | Pendiente |
| EXE portable / AppImage | jobs GitHub Actions | No aplica | Pendiente | Pendiente |
| Audio, teclado, táctil, movimiento reducido | no automatizado visualmente | Pendiente | Pendiente | Pendiente |
| FPS, memoria, carga | sin medidas | Pendiente | Pendiente | Pendiente |

## Comandos reproducibles
```bash
npm run check
npm test
node --test tests/save-store.test.mjs tests/v2-story.test.mjs
python3 -m http.server 8765
```
Abrir `http://localhost:8765`, ensayar partida completa, revisar consola y registrar capturas. En Linux Mint ejecutar `bash WORLD-404-LinuxMint.sh`; en Windows usar `WORLD-404-Windows.cmd`. Para los empaquetados, revisar la sección Actions del PR.

## Pruebas manuales obligatorias
Menú inicial (Nueva/Continuar/Opciones/Ayuda), teclas H/J/M/Escape, tres investigaciones y deducción por caso, testimonios, rutas y sucesos, combate y estados, huida, desmayo, finales, exportación e importación, copia tras error de cuota, zoom 200 %, 390/1440 px, audio apagado, reduced-motion, offline, Firefox/Chromium, EXE/AppImage.

La prueba visual no fue realizada: no existe una sesión de navegador con el repositorio local en este entorno.
