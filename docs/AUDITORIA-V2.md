# Auditoría WORLD-404 v2.0 — primera iteración

## Base reproducible
- Repositorio: `ivan7800/WORLD-404`
- Rama base: `main`, commit `b865d7023491735d833f6a4b1d50588f1a3fc095`.
- Proyecto: JavaScript ESM sin framework, Electron 35, electron-builder 26, licencia MIT; versión de paquete 1.9.0.
- Inspección: contenidos del árbol GitHub y ficheros del motor, interfaz, seguridad de rutas, guía y tests por conector autorizado.
- **Limitación:** el entorno de ejecución local no resuelve `github.com` (fallo de DNS). No pudo clonarse ni ejecutarse aquí la batería completa de tests antes de modificar. Los resultados CI del PR son la referencia verificable cuando terminen.

## Hallazgos confirmados (antes de cambios)
| Prioridad | Evidencia | Afecta | Intervención |
| --- | --- | --- | --- |
| Alta | `tests/desktop.test.mjs` requiere `.github/workflows/build-desktop.yml`, que no estaba en el árbol de `main` | release de escritorio | incorporar build y tests en Actions |
| Alta | `src/main.js` sobrescribía la clave activa y presentaba «GUARDADO ✓» sin comprobar errores de almacenamiento | persistencia | copias previas, validación y feedback |
| Alta | `safeLoad` aceptaba algunos JSON formalmente válidos con objetos anómalos en arrays de decisiones o distritos inexistentes | importación | límites y validación estructural |
| Media | pantalla inicial sin menú explícito Continuar/Opciones/Ayuda | onboarding | menú nativo accesible |
| Media | mapa de botones con información de barrio solo en `title` (hover) | accesibilidad táctil | leyenda de estados visible |
| Media | archivo de pruebas sin filtros | investigación | filtro por estado |
| Media | etiquetas de combate describen algunas opciones solo en `title` | táctil y teclado | costes y ayuda visibles |
| Baja | el repositorio usa los recursos originales del archivo de tinta; piezas por incidente y cinco combates existen | estilo | se preservan, sin sustituciones masivas |

## Riesgos y pendientes por validar
- Partida real de principio a fin en Chromium y Firefox y capturas genuinas de menú, mapa, combate y final.
- Ejecutar artefactos AppImage y EXE en Linux Mint/Windows reales; las compilaciones de CI no equivalen a una prueba manual de arranque.
- Balance y duración de campaña; no hay playtest medido.
- Ausencia de `package-lock.json` dificulta builds idénticos entre fechas.
- Auditoría visual y narrativa de cada escena secundaria con partidas humanas.

## Reproducción
```bash
npm run check
npm test
npm install --no-audit --no-fund
npm run dist:linux  # Linux Mint / runner Ubuntu
# en Windows:
npm run dist:win
```
En el PR se debe consultar Actions antes de declarar aprobado el build.
