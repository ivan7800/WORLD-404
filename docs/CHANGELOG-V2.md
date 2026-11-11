# WORLD-404 v2 — cambios realizados

## Iteración 1 — Persistencia, integridad y empaquetado
- Copia de seguridad recuperable de la clave actual antes de cada sobrescritura válida; sin borrar claves históricas.
- Recuperación de backup y migraciones del motor v1–v10.
- Rechazo de cargas de más de 1 MB y de campos estructuralmente corruptos.
- Feedback explícito de guardado fallido e importación atómica con retorno al estado anterior si hay fallo.
- Workflow de Actions para sintaxis, tests y builds AppImage/EXE (estado según ejecución, no equivalencia con verificación manual).

## Iteración 2 — Navegación y legibilidad
- Nuevo menú modal accesible: Nueva partida, Continuar, Opciones, Ayuda, Cerrar.
- Menú disponible desde cabecera y atajo M; conserva H, J y Escape.
- Leyenda visible del mapa con barrios visitados, ubicación y testigos pendientes.
- Descripciones visibles de acciones con ayuda, no solo al pasar el ratón.
- Filtros en archivo de expedientes y textos de costes/efectos de acciones de combate.
- Política CSP restrictiva para la interfaz, sin conectividad de terceros.

## Iteración 3 — Continuidad narrativa
- Cinco puentes documentados entre los expedientes.
- Diez secuelas narrativas originales derivadas de las elecciones de rescate/investigación.
- Secuelas visibles en interludios y epílogos, sin cambiar la estructura del guardado.
- Nuevos tests de historia y de persistencia.
