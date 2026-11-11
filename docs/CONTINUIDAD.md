# WORLD-404 v2 — continuidad narrativa

Esta matriz describe **la campaña implementada** y las consecuencias derivadas nuevas, sin cambiar claves ni formato de guardados (v10).

| # | Expediente / ID | Hallazgo y nexo al siguiente | Elección permanente | Conexión v2 |
| --- | --- | --- | --- | --- |
| 01 | La luz que respira / `faro` | Lente: la luz llama desde el mar al hospital | Destruir páginas o preservar nombres | Farero y registros hospitalarios |
| 02 | Los pacientes sin sombra / `hospital` | Historia clínica 00 y fechas imposibles | Liberar paciente o registrar testimonio | La paciente acude a la lonja |
| 03 | La subasta de los ahogados / `mercado` | Moneda y remate de recuerdos | Rechazar el intercambio o aceptar | Ruta documental a los túneles |
| 04 | El coro bajo la piedra / `tuneles` | Partitura que describe la cripta | Rescatar coro o copiar coordenadas | Escalera y silencio hacia el altar |
| 05 | La última pleamar / `cripta` | Nombre humano del Heraldo, jefe de dos fases | Liberarlo o grabar el nombre | Epílogo contextual según elección |

## Estado y puertas de progreso
- `caseIndex` avanza tras derrotar al antagonista principal; `finishCase` registra una pista y crea interludio.
- `visited`: `<caseId>:<sceneIndex>`; dos lugares dan acceso a `availablePuzzle`.
- `linkedClues` desbloquea `prepareSeal` y abarata el combate en cuatro puntos de vida.
- `decisions` conserva una bifurcación moral por caso con `effect: 'mercy'|'truth'`.
- `routeChoices`: cautelosa consume suministro y debilita jefe; arriesgada gana suministros y aumenta Marea.
- `caseTwists`: exactamente una de tres variantes por expediente, calculada desde `runSeed` y registrada tras resolverla.
- `omens`, `sideStories`, `anomalies`, `echoes`, `worldVisits` y `contacts` conservan alternativas registradas.
- `aftermathForCase` deriva diez posibles secuelas únicamente de `decisions`; no añade campos al guardado ni modifica balance.

## Finales existentes
`sellado`: pistas de los cinco expedientes, Marea por debajo de 65, tres éxitos y tres claves. `rescate`: cuatro decisiones de protección, Marea por debajo de 90. `supervivencia`: completar el último expediente sin alcanzar los anteriores. `muerte`, `locura`, `marea`: derrotas según recursos. El epílogo v2 añade huellas de cada decisión, sin sustituir el desenlace.

## Pruebas pendientes
- Alcanzabilidad de todas las combinaciones morales con recursos limitados.
- Narrativa de testigos y escenas secundarias en partida manual.
- Matriz de estados de todos los finales en Chromium y Firefox.
