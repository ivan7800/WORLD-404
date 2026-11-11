# WORLD-404 — Biblia visual y de dirección artística

**Proyecto:** WORLD-404: *El Archivo de la Marea Negra*  
**Edición:** v1.6 — «La edición de tinta»  
**Estado:** guía de producción y primera implementación visual, **no certificación de acabado final**  
**Idioma:** español  
**Género:** investigación, supervivencia y horror cósmico por turnos  
**Ambientación:** San Telmo, costa española ficticia, 1987

> **Premisa artística:** una fotocopia maldita de un archivo municipal que lentamente deja de ser papel y empieza a comportarse como algo vivo.

## 1. Identidad y límites

El juego utiliza los recursos generales del horror en tinta monocroma, tramado y aventura narrativa para crear **una identidad propia**. Su emblema, ciudad, expedientes, criaturas, nombres, fondos y textos son originales. El referente tonal es el horror ilustrado y el manga de horror, pero **no se reproducen recursos, interfaces exactas ni personajes** de *World of Horror*.

Tres palabras guían cada decisión visual: **ARCHIVO / PLEAMAR / CONTAGIO**.

- ARCHIVO: sellos, fichas, carpetas, fechas, rejillas, etiquetas de pruebas.
- PLEAMAR: mareas oscuras, sal, algas, cables mojados, puertos, barcos y piedra erosionada.
- CONTAGIO: cada hallazgo corrompe discretamente los marcos, las caras y las señales de la ciudad.

### Regla de oro

**Nunca sacrificar la lectura de una decisión, un estado o un botón en favor del efecto de horror.** La disonancia debe producirla el escenario; la información de juego debe permanecer inequívoca.

## 2. Sistema cromático

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#080807` | Negro de carbón de la interfaz |
| `--panel` | `#0D0D0C` | Superficies de archivos |
| `--ink` | `#F5F0E6` | Tinta clara y texto principal |
| `--line` | `#BDB5A7` | Límites y separadores |
| `--muted` | `#ACA598` | Metadatos secundarios |
| `--gold` | `#C8BD85` | Selección e información importante |
| `--red` | `#C65B56` | Riesgo, sangrado, corrupción |
| `--focus` | `#F4E6A9` | Enfoque de teclado visible |

**Proporción orientativa:** 68 % negro, 23 % marfil/gris, 7 % acento ocre, **hasta** 2 % rojo. El rojo no puede utilizarse como único indicador de peligro: combinar con un texto o pictograma.

La ilustración usa cuatro escalones de luminancia; priorizar masas negras grandes y siluetas legibles. **Evitar** degradados suaves y nieblas de saturación alta.

## 3. Lenguaje gráfico

**Técnica:** tinta raspada, hatching, líneas rotas, tramado de imprenta, ruido de fotocopia y bloques pixelados. Componer primero en escala de grises y añadir el acento solo después.

**Composición:** proporción 16:9; primer plano de contraste alto; figura humana pequeña frente a arquitectura imponente; punto de interés excéntrico; horizonte irregular; cielo invadido por una anomalía casi subliminal. Cada escena debe funcionar sin texto.

**Objetivos de producción:** arte base a 640×360 o 1280×720, escalado sin interpolación cuando se quiera una textura deliberadamente pixelada. Personajes 320×320 como mínimo; sprites de criaturas 320×340 o superior. Evitar ampliar imágenes pequeñas sin revisar la lectura final.

**Marcos:** doble línea irregular o caja rígida de archivo. Sombras rectangulares, sin efectos de neón ni bordes redondeados.

**Tipografía:** títulos de serif pesada/desgastada; HUD, estadísticas, opciones y expedientes en monoespaciada robusta. Mantener el texto narrativo en una tipografía de lectura larga, no pixelada.

## 4. Componentes de interfaz

| Componente | Diseño | Comportamiento |
|---|---|---|
| Cabecera | Sello de archivo, título desgastado y horrores en segundo plano | Acciones secundarias agrupadas, sin tapar el título |
| HUD | Seis celdas enmarcadas | Salud y cordura expresadas numéricamente, peligro en rojo |
| Ilustración | Escena en tinta 16:9 | No ocupa zonas pulsables |
| Dossier | Retrato de investigador, datos clasificados | Siempre coherente con el mismo personaje |
| Expedientes | Lista de cinco archivos | Activo en ocre, completado en marfil |
| Decisiones | Dos o más tarjetas rectangulares | Foco bien visible y área táctil amplia |
| Combate | Enemigo ocupa el lateral del escenario | La intención del enemigo sigue apareciendo en texto |
| Bitácora | Tira de papel mecanografiado | Registra decisiones sin sobrescribir su significado |
| Mapa | Plano de barrios fotocopiado | Los puntos activos nunca dependen únicamente del color |
| Inventario | Etiquetas de objetos y recursos | El botón «USAR» mantiene su funcionalidad |

### Accesibilidad

- Conservar `:focus-visible` y objetivos táctiles de unos 44 píxeles cuando sea posible.
- Permitir reducir o eliminar animaciones desde el control existente.
- Mantener el texto de decisiones en HTML real, nunca fusionarlo con las ilustraciones.
- No realizar flashes ni estroboscopios; los efectos atmosféricos no pueden cubrir controles.
- Comprobar pantallas de 390 px y 1440 px de ancho.

## 5. Los cinco expedientes

| Expediente | Lugar | Imagen dominante | Motivos / horror específico |
|---|---|---|---|
| 01 — La luz que respira | Faro de San Telmo | Faro en una costa imposible, haz de luz como tejido | Órbita negra, espumas como dientes, silueta que observa |
| 02 — Los pacientes sin sombra | Hospital | Fachada institucional tomada por la oscuridad | Ventanas vacías, cruces, batas, radiografías sin persona |
| 03 — La subasta de los ahogados | Lonja y puerto | Grúas como esqueletos ante el mar | Redes, anzuelos, sal, bidones, cuerpos de agua |
| 04 — El coro bajo la piedra | Túneles | Galería de mampostería que parece una garganta | Arcos repetidos, marcas rituales, perspectiva imposible |
| 05 — La última pleamar | Cripta | Altar sumergido y geometría litúrgica fracturada | Velas, salitre, ojos concéntricos, memoria perdida |

Cada expediente debe disponer, en una iteración posterior, de **seis ilustraciones narrativas adicionales**: presentación, hallazgo, interlocutor, anomalía, enfrentamiento y desenlace. La v1.6 integra **un fondo específico por expediente**; esta cuota ampliada es un objetivo, no un recurso ya producido.

## 6. Reglas para personajes y enemigos

**Personajes:** retratos de busto; luz lateral extrema; expresiones contenidas y asimetría facial sutil. Los testigos nunca sonríen directamente al espectador. Fotocopia y tinta con desgaste localizado. Prohibidas las poses genéricas de fantasía heroica.

**Criaturas:** primero una silueta única, luego una anomalía anatómica dominante, después 2–3 pistas secundarias. No llenar la pantalla de tentáculos indistinguibles. Cada monstruo debe poder reconocerse en miniatura por su contorno.

**Sistema de revelación:** el enemigo no aparece en su máxima forma en el primer encuentro. Mostrar primero una silueta parcial, después el retrato completo y finalmente las deformaciones del combate. En la edición v1.6 el arte aparece como panel ilustrado; la revelación progresiva detallada es un requisito futuro.

La edición inicial incluye seis ilustraciones de criaturas, suficientes para cubrir cinco antagonistas principales y una variante opcional, **no** todo el bestiario final.

## 7. Animación y sonido

- Animación sutil: polvo de película, salpique de tinta, oscilación mínima de criatura.
- Intensidad dependiente de la Marea y de la cordura, pero siempre reducida si el usuario desactiva los efectos.
- Enemigo en turno: microdesplazamiento, impacto puntual, cambio de marcador de intención.
- Sonido: crujidos de cinta magnética, subgraves, radio en onda corta, corrosión marítima, campanas lejanas, respiración contenida.
- No reutilizar grabaciones ni pistas de obras comerciales.

## 8. Comportamiento y estados del juego

El sistema visual **no debe modificar** el estado de campaña, la IA de combate, la fórmula de recursos ni la estructura de guardado. Las ilustraciones se seleccionan por `caseIndex` y por la fase del motor (`combat`/`encounter`), con un recurso suplente procedimental si una imagen falla.

El combate siempre requiere controles HTML accesibles fuera del Canvas. La imagen nunca es el único modo de transmitir daño, sangrado, fase del jefe o estado de la Marea.

## 9. Arquitectura de recursos (v1.6)

```text
assets/art/
  cabecera.webp
  scene-faro.webp
  scene-hospital.webp
  scene-lonja.webp
  scene-tuneles.webp
  scene-cripta.webp
  portrait-investigador.webp
  portrait-{doctora,pescador,sacerdote,archivista}.webp
  criatura-{1..6}.webp
src/art.js               # selección de imágenes y fallback procedimental
styles.css               # tokens + tema de tinta
src/main.js              # actualización tras carga de recursos
build/icon.png           # icono acorde al nuevo tema
build/icon.ico
```

**Carga:** local y sin solicitudes a servicios de terceros. `src/art.js` mantiene las escenas de Canvas anteriores como plan B. La carga de las imágenes activa un repintado sin reiniciar la partida. Los nuevos recursos están incluidos en el manifiesto Electron.

## 10. Proceso de producción para cada nueva ilustración

1. Aprobar una silueta monocroma y su lectura a resolución reducida.
2. Preparar perspectiva, focos y masas negras.
3. Texturizar mediante tramado y erosión, sin perder el sujeto.
4. Aplicar la paleta de cuatro niveles y validar contraste.
5. Integrar en `assets/art` con nombre estable y revisar a escala 1× y 2×.
6. Comprobar lectura junto al texto, comportamiento móvil, peso y carga offline.
7. Hacer revisión de originalidad y coherencia narrativa antes de publicar.

## 11. Criterios de aceptación del estilo

- [x] Guía visual centralizada y paleta explícita.
- [x] Revisión de cabecera, HUD, botones, paneles y mapa mediante CSS.
- [x] Cinco escenarios ilustrados en la nueva dirección de arte.
- [x] Seis dibujos de criaturas integrados en combate.
- [x] Retrato de investigador ilustrado.
- [x] Efectos opcionales sin tocar datos de campaña.
- [x] Recursos locales incluidos para Electron y lanzadores web.
- [x] Comprobación automatizada de rutas y tamaños de recursos.
- [ ] Prueba visual completada en Chromium, Linux Mint y Windows reales.
- [ ] Todas las escenas secundarias con ilustración individual.
- [ ] Retratos vinculados dinámicamente a cada interlocutor.
- [ ] Animación dedicada por enemigo / jefe.
- [ ] Auditoría de legibilidad por resolución y bajo contraste.
- [ ] Partidas manuales completas y validación estética en todas las fases.

## 12. Estado técnico y límites

Se ha trabajado sobre el **código original WORLD-404 v1.5**, sin modificar esa copia. La edición v1.6 modifica la capa visual, incorpora imágenes originales producidas para el proyecto y conserva guardados, mecánicas y lanzadores de Windows y Linux Mint. Se ejecutan las pruebas existentes y las pruebas de recursos visuales. Los navegadores administrados del entorno de comprobación bloquean `localhost` y `file://`, por lo que no se presenta una captura de Chromium como si hubiera sido verificada.

**Nota de propiedad intelectual:** usar como inspiración conceptos generales de horror en tinta y aventuras retro no implica reutilizar arte, música o interfaces ajenas. Los recursos aportados a esta edición se generaron como nuevos conceptos para WORLD-404 a partir de las referencias aprobadas por el usuario.
