# WORLD-404 v1.9 — El Archivo Cambiante

Consulta `README-v1.9.md` para las novedades, instrucciones de juego, instalación y comprobación.

# WORLD-404 v1.5 — Atmósfera audiovisual y controles accesibles

**El Archivo de la Marea Negra** es un videojuego original de horror cósmico ambientado en San Telmo (1987). Incluye cinco expedientes, exploración, quince escenas investigables, deducciones, combates por turnos, sucesos sobrenaturales, dilemas, historias opcionales, inventario, cuatro rutas de desenlace y guardados locales.

## Novedades v1.5

- Escenografía procedimental ampliada: faro inundado, ambulancia del hospital, redes y cajas portuarias, raíces de los túneles y cirios de la cripta.
- Las ilustraciones ahora responden al aumento de la Marea y a la pérdida de cordura; partículas opcionales con movimiento reducido accesible.
- Nueva banda ambiental original mediante Web Audio: capas de drones, batidos, ruido filtrado y variaciones por distrito y estado de combate. No se utilizan grabaciones externas ni material de terceros.
- Botón EFECTOS para desactivar efectos animados y respetar `prefers-reduced-motion` sin afectar a la lógica ni al guardado de la partida.
- Se mantienen los lanzadores y scripts de compilación; `.exe` y AppImage siguen requiriendo compilación externa y prueba real.

## Histórico de equilibrio v1.3–v1.4

- Botiquín y tónico consumen un turno en combate y provocan la respuesta del enemigo, en vez de poder utilizarse gratis desde el inventario.
- La concentración restaura cordura solo dos veces por combate, evitando un bucle de recursos infinitos.
- Guardados v10 con migración desde v9; validación adicional de estados corruptos para impedir fallos de interfaz.
- Prueba automatizada de principio a fin que atraviesa los cinco expedientes y ambas fases del jefe final.

## Funcionalidad heredada de v1.2

- Cinco anomalías opcionales originales (una por expediente), cada una con narrativa y enemigo propio.
- Resolución por ritual de atributo o combate por turnos; recompensas y consecuencias persistentes.
- Patrones de combate diferenciados que no sustituyen ni cierran el jefe principal.
- Guardado v10 con migración desde v9 y anteriores; partidas en combate opcional recuperables.
- Se mantienen los lanzadores web de Windows y Linux Mint y las configuraciones de compilación Electron.

## Qué contiene esta entrega

1. **Juego web listo para usar** con los lanzadores existentes `WORLD-404-Windows.cmd` y `WORLD-404-LinuxMint.sh`. Requiere navegador moderno. El lanzador Windows usa PowerShell, el de Linux usa Python 3.
2. **Proyecto de escritorio Electron** con ventana propia y origen privado `world404://game/`. No necesita un servidor HTTP, navegador externo ni conexión a Internet una vez empaquetado.
3. **Compilación reproducible** desde GitHub Actions para Windows x64 (`.exe` portable) y Linux Mint x64 (`.AppImage`) mediante el flujo `.github/workflows/build-desktop.yml`.
4. Iconos originales de la aplicación, pruebas unitarias y controles de seguridad en la navegación local.

**Importante**: este ZIP contiene el **código para compilar los ejecutables**, no binarios `.exe` o `.AppImage` ya construidos. En este entorno no están instaladas las dependencias Electron ni hay un sistema Windows disponible. Los ejecutables se obtienen cuando se ejecuta con éxito el flujo de GitHub Actions, o compilando en cada sistema con Node.js instalado.

## Ejecutar ya, sin compilar

### Linux Mint

Extrae el ZIP. Desde `WORLD-404/`:

```bash
chmod +x WORLD-404-LinuxMint.sh INSTALAR-ACCESO-DIRECTO-LinuxMint.sh
./WORLD-404-LinuxMint.sh
# Opcional: acceso directo al menú
./INSTALAR-ACCESO-DIRECTO-LinuxMint.sh
```

### Windows 10/11

Extrae la carpeta y abre `WORLD-404-Windows.cmd` con doble clic. Se abrirá `http://127.0.0.1:8765/`. Cierra la consola al terminar. No necesita Python ni Node.

## Obtener los ejecutables de escritorio sin compilar localmente

1. Sube **el contenido de `WORLD-404/`** a la raíz de un repositorio de GitHub, manteniendo `.github/workflows/build-desktop.yml`.
2. En GitHub abre **Actions → WORLD-404 desktop builds → Run workflow**.
3. Al finalizar correctamente, abre el workflow y descarga los archivos bajo **Artifacts**: `world404-windows-portable` (contendrá el EXE) y `world404-linux-appimage` (contendrá la AppImage).
4. En Linux Mint, otorga permiso de ejecución a la AppImage: `chmod +x WORLD-404-*.AppImage` y ábrela. En Windows, abre el EXE portable.

Estos artefactos son generados por tu propio repositorio; **no están firmados digitalmente**. Windows SmartScreen puede solicitar confirmación. El empaquetado requiere conexión a Internet durante la compilación para descargar Electron y dependencias.

### Compilar en tu equipo (Node.js 22 recomendado)

```bash
npm install --no-audit --no-fund
npm run check
npm test
npm run desktop       # abrir aplicación escritorio durante desarrollo
npm run dist:linux    # Linux x64: genera dist/*.AppImage
# O en Windows:
npm run dist:win      # Windows x64: genera dist/*.exe
```

La ejecución normal de los binarios ya generados es offline.

## Guardados al cambiar de edición

- Los lanzadores web guardan en `localStorage` de `http://127.0.0.1:8765/`.
- La app Electron guarda en un perfil aislado para `world404://game/`.
- **Los guardados no se transfieren automáticamente entre orígenes.** Abre la edición antigua, pulsa **EXPORTAR PARTIDA**, luego abre la nueva edición y pulsa **IMPORTAR PARTIDA**. Confirma que el progreso se ha recuperado antes de borrar nada.
- Las partidas de las versiones anteriores pueden migrarse mediante la importación; conserva siempre una copia exportada.

## Pruebas y limitaciones

```bash
npm run check
npm test
```

Las pruebas cubren el motor, el arte procedimental, la migración, los lanzadores y el encaminamiento de recursos locales de Electron. **No equivalen** a probar el EXE en Windows ni la AppImage en Linux Mint; realiza ambas pruebas después de compilar, además de un recorrido completo por los cinco expedientes. El juego continúa siendo una versión candidata, no una campaña comercial validada mediante testeo externo.

### Seguridad

- Electron utiliza `contextIsolation`, `sandbox`, `nodeIntegration: false` y bloqueo de ventanas externas.
- El esquema `world404://game` solo sirve los recursos del juego permitidos, no archivos arbitrarios.
- Los lanzadores web sirven el juego exclusivamente por loopback.
- Sin telemetría, backend ni enlaces a servidores externos.

## Estructura

- `src/`: motor, narrativa, ilustraciones Canvas, sonido, interfaz.
- `desktop/`: ventana Electron y resolución segura de recursos.
- `.github/workflows/build-desktop.yml`: pipeline multiplataforma.
- `build/`: iconos originales de aplicación.
- `tests/`: pruebas automatizadas.
- `launchers/`: servidores locales para lanzadores de navegador.

Licencia MIT. Gráficos y código originales. No se ha ejecutado REA en esta entrega; se han consultado las pautas de su documentación para inspeccionar la estructura JavaScript y preservar evidencias.


## v1.4 — Presagios

Cada expediente incorpora un presagio opcional tras investigar al menos una localización. Cada uno presenta dos decisiones con efectos en salud, cordura, Marea, suministros o claves del ritual. Las decisiones se guardan y no se pueden repetir. Se conserva el formato de guardado v10 para compatibilidad con la v1.3. Además, se corrige la validación de partidas guardadas durante una anomalía.

## Verificación específica de la v1.5

- `npm run check`: sintaxis de módulos y de Electron comprobada.
- `npm test`: 84/84 pruebas de Node.js correctas, incluyendo seis pruebas nuevas de arte/sonido/accesibilidad.
- La aplicación web respondió `HTTP 200` en `127.0.0.1:8765`.
- Chromium headless agotó el tiempo disponible en el entorno de pruebas, por lo que **no** se ha comprobado una partida manual ni las animaciones en navegadores reales.
- El ZIP contiene los scripts de compilación para Windows/Linux, **no** los binarios `.exe` o `.AppImage` compilados.

En equipos poco potentes, pulsa `EFECTOS: NO`; el progreso del juego permanece intacto. El botón `SONIDO` requiere interacción del usuario por las políticas habituales de audio del navegador.

## WORLD-404 v1.6 — Edición de tinta

Rediseño visual original basado en la biblia de dirección artística de `BIBLIA-VISUAL.md` y la lámina `BIBLIA-VISUAL-LAMINA.png`.

- Paleta de tinta monocroma, papel envejecido, ocre y alerta roja.
- Cinco ilustraciones de los expedientes en `assets/art/`.
- Retrato de investigador y criaturas ilustradas para el combate.
- Rediseño completo del encabezado, HUD, botones, expedientes, mapa y paneles.
- Arte de respaldo por Canvas para entornos que no puedan cargar imágenes.
- Conservados los guardados de v1.5, mecánicas, sonidos, capítulos y lanzadores.

**Pruebas**: `npm run check && npm test`. La prueba HTTP de la edición web responde con 200 en este entorno; el navegador Chromium administrado bloquea el acceso a recursos locales y no ha permitido validación visual. El `exe` y la AppImage deben compilarse aún mediante el workflow existente; los lanzadores de scripts siguen incluidos.


## WORLD-404 v1.7 — Horror ilustrado integral

La presentación usa ilustraciones originales recortadas de los conceptos gráficos aprobados para faro, hospital y lonja. Se conservan las ilustraciones procedurales y el conjunto de escenarios de tinta anteriores para túneles y cripta. Los eventos, anomalías, decisiones y combates cuentan ahora con un panel ilustrado contextual; en combate aparece una barra de salud accesible. Los controles son botones HTML reales y la lógica y formato de guardado del motor no han cambiado. Los nuevos recursos son locales y se incluyen en el empaquetado Electron.

**Pendientes reales:** revisar los botones con una partida manual y verificar el resultado en Windows y Linux Mint. Los recursos visuales son ilustraciones fijas, no animaciones completas, y el ejecutable nativo debe construirse por separado.


## WORLD-404 v1.8 — Archivo vivo

- `J`: abrir o cerrar el archivo de pruebas, con el progreso de los cinco expedientes.
- Durante el encuentro principal, si resolviste la deducción del expediente, puedes preparar un sello. Cuesta 1 suministro, reduce la Marea 2 puntos y debilita al enemigo en 4 PV; solo una vez por expediente.
- La nueva pantalla de archivo muestra las localizaciones descubiertas, deducciones, rutas y notas. No revela localizaciones no investigadas en forma de pista narrativa.
- Se conserva la clave de guardado de la v1.7 para que las partidas sigan funcionando; el campo opcional `preparedSeals` se migra automáticamente.
- Los scripts Windows y Linux Mint y el proyecto Electron siguen incluidos. Los ejecutables independientes deben compilarse; no se entregan como binarios.
