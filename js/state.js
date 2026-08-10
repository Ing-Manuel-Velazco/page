/* ============================================================
   js/state.js — Filtro compartido país/estado (mapa ↔ lista ↔ crumbs)
   ============================================================ */
import { norm } from "./core.js";
import { EXPERIENCIAS } from "./data.js";

export const state = { selPais: null, selEstado: null, key: null };
const subs = new Set();

export const onFiltro = f => subs.add(f);

export function setFiltro(pais, estado){
  if (estado) {
    /* canonicaliza contra EXPERIENCIAS (evita espacios/variantes del dato geométrico) */
    const canon = EXPERIENCIAS.find(e => norm(e.estado) === norm(estado));
    state.selEstado = canon ? canon.estado : String(estado).trim();
    state.selPais   = canon ? canon.pais : (pais || "México");
  } else if (pais) {
    state.selPais = pais; state.selEstado = null;
  } else {
    state.selPais = null; state.selEstado = null;
  }
  state.key = state.selEstado ? norm(state.selEstado) : null;
  subs.forEach(f => f());
}