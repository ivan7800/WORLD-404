# WORLD-404 v1.9 — El Archivo Cambiante

Actualización del código real de la v1.8. Se conservan los cinco casos, los finales, los guardados y los lanzadores para Windows/Linux Mint.

## Cambios

- Guía contextual permanente, ayuda H y archivo J. Acciones agrupadas en historia, investigación, actividades opcionales y viajes (colapsados). Las opciones **CERRAR INVESTIGACIÓN** se distinguen claramente de las investigaciones.
- **15 incidentes originales**, de los cuales aparecen 5 por partida (3 posibles en cada expediente). Semilla persistente y consecuencias sobre salud, cordura, suministros, Marea, investigación y resistencia del jefe. Son 243 combinaciones de incidentes, sin contar decisiones.
- Combate táctico: impulso acumulable (máx. 3), **RUPTURA RITUAL** que cuesta 2 puntos e interrumpe un ataque, y **CÍRCULO DE SAL** que cuesta 1 y refuerza la defensa mental. Indicaciones de ataque enemigo en pantalla.
- **20 composiciones originales nuevas** derivadas de los propios recursos artísticos del juego: 15 ilustraciones de incidentes y 5 fondos de encuentros. Conservan el tratamiento de tinta y trama.
- Migración de partidas v10 sin cambiar la clave de almacenamiento; no se sobrescriben los archivos originales.

## Controles

- H: ayuda. J: archivo de pistas. Escape: cerrar paneles.
- En el mapa, empieza por EXPLORAR; visita al menos dos lugares y DEDUCE. Las actividades opcionales están separadas de las acciones principales.
- El guardado de campaña incluye la semilla para que el mismo incidente no cambie cada vez que abras la aplicación. Nueva partida genera una nueva semilla.

## Ejecución

Linux Mint: `bash WORLD-404-LinuxMint.sh` · Windows: doble clic en `WORLD-404-Windows.cmd`.
También: `python3 -m http.server 8000` y abrir `http://127.0.0.1:8000`.

## Compilación nativa

`npm install && npm run dist:linux` o `npm run dist:win`, según sistema operativo. El ZIP no contiene `.exe` ni AppImage compilados.

## Comprobación

`npm run check && npm test`. No se afirma compatibilidad visual con sistemas reales sin comprobarla.
