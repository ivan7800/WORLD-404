/** Consequences are derived from decisions, never new mandatory save fields. */
export const AFTERMATH={
 faro:{
  mercy:'La viuda del farero encuentra el muelle a oscuras. Ninguna luz llama ya a su esposo, pero el registro del naufragio está en blanco.',
  truth:'El viejo farero entrega al hospital una lista de nombres prohibidos. Una enfermera tacha todos salvo el tuyo.'
 },
 hospital:{
  mercy:'Una paciente liberada llega a la lonja sin proyectar sombra. Lleva cosido en la manga un número de lote de la subasta.',
  truth:'El último electrocardiograma se convierte en una curva de mareas. El subastador ya conoce el momento exacto de tu llegada.'
 },
 mercado:{
  mercy:'Los pescadores se niegan a transportar las últimas cajas. Bajo el suelo de la lonja, los golpes llevan el ritmo del coro.',
  truth:'Tu recuerdo comprado contiene un pasillo de defensa civil. En la pared hay una fecha que todavía no ha sucedido.'
 },
 tuneles:{
  mercy:'Tres voces rescatadas te enseñan el silencio que precede al cántico. La entrada de la cripta ya no parece completamente oculta.',
  truth:'La partitura muestra una escalera enterrada bajo el altar. Cada peldaño tiene grabada una palabra que no debes pronunciar.'
 },
 cripta:{
  mercy:'El Heraldo recupera durante un instante su antiguo rostro. En la playa, alguien reconoce por fin el nombre del desaparecido.',
  truth:'El sello conserva el nombre, pero los retratos municipales pierden un rostro. Tu archivo es ahora la única prueba que queda.'
 }
};
/** No random roll and no mutation; older saves without decisions remain supported. */
export function aftermathForCase(state,id){
 const branch=state.decisions?.find(d=>d?.caseId===id)?.effect;
 if(branch!=='mercy'&&branch!=='truth')return null;
 return AFTERMATH[id]?.[branch]||null;
}
export function epilogueLines(state){
 return Object.keys(AFTERMATH).flatMap(id=>{
  const line=aftermathForCase(state,id);
  return line?[line]:[];
 });
}
