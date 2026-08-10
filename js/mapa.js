/* ============================================================
   js/mapa.js — Sección 02: vista 3D por defecto (sin 2D)
   · Modal de estado CORREGIDO y agrupado por MUNICIPIOS
   · Sincronía de filtros y controles de cámara (+ / − / ⟲)
   ============================================================ */
import { $, norm, esc, fmtYM, openModal, accordion } from "./core.js";
import { EXPERIENCIAS } from "./data.js";
import { setFiltro } from "./state.js";

const MAPA_ESTADOS = (window.MAPA_ESTADOS || window.MEXICO_ESTADOS) || [];
const mapstatus = $("#mapstatus");

let glMod = null, ready = false;

/* API para trayectoria.js (no-ops hasta que la escena 3D esté lista) */
export function volarAEstado(n){ if (ready) glMod.volarAEstado(n); }
export function resaltarEstado(n){ if (ready) glMod.resaltarEstado(n); }

/* ---------- modal: trabajos del estado agrupados por municipio ----------
   FIX: el cruce ahora es SOLO por estado (antes comparaba país vs capital
   y jamás coincidía → la ventana salía vacía).                        */
function openStateModal(st){
  const nombre = String(st.n).trim();
  const jobs = EXPERIENCIAS.filter(e => norm(e.estado) === norm(st.n));

  /* municipios con al menos un trabajo; si no hay, no se muestran */
  const muns = {};
  jobs.forEach(e => { (muns[e.ciudad] || (muns[e.ciudad] = [])).push(e); });
  const keys = Object.keys(muns);

  const head = `<span class="modal-badge">ESTADO</span><h3>${esc(nombre)}, México</h3>
    <span class="iss">${jobs.length} trabajo(s) · ${keys.length} municipio(s) con registro</span>`;

  const card = e => `
    <div class="job-card">
      <div class="job-h"><div><h4>${esc(e.puesto)}</h4><p>${esc(e.empresa)}${e.sigla ? ` (${esc(e.sigla)})` : ""}</p></div><span class="xchev">▾</span></div>
      <div class="job-b"><div class="job-b-in">
        <p class="xloc">⌖ ${esc(e.ciudad)}, ${esc(e.estado)} · ${fmtYM(e.inicio)} — ${fmtYM(e.fin)} · ${esc(e.dur)}</p>
        <ul>${e.logros.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
        <div class="chips">${e.tools.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      </div></div>
    </div>`;

  const body = `<div class="jobs-list">` + (keys.length
    ? keys.map(mun => `
      <div class="mun-block">
        <p class="mun-title">⌖ ${esc(mun)} <span>${muns[mun].length} trabajo(s)</span></p>
        ${muns[mun].map(card).join("")}
      </div>`).join("")
    : `<p class="no-results">Sin trabajos registrados en ${esc(nombre)}.</p>`) + `</div>`;

  const foot = `Haz clic en un trabajo para ver su detalle · ${esc(nombre)}`;
  const box = openModal(head, body, foot);
  box.querySelectorAll(".job-card").forEach(jc =>
    accordion(jc, jc.querySelector(".job-h"), jc.querySelector(".job-b")));
}

export function initMapa(){
  /* clic en estado con trabajos (evento emitido por mapa3d.js) */
  addEventListener("jv:estado", e => {
    const st = MAPA_ESTADOS.find(s => s.n.trim() === e.detail);
    if (st) { setFiltro("México", st.n); openStateModal(st); }
  });

  /* controles de cámara 3D */
  $("#zin").addEventListener("click", () => { if (ready) glMod.zoomIn(); });
  $("#zout").addEventListener("click", () => { if (ready) glMod.zoomOut(); });
  $("#zreset").addEventListener("click", () => { if (ready) glMod.resetView(); });

  /* escena 3D por defecto (import diferido; degrada sin CDN) */
  mapstatus.textContent = "CARGANDO ESCENA 3D…";
  import("./mapa3d.js").then(m => {
    glMod = m; ready = true;
    m.initGL();
    mapstatus.textContent = "VISTA 3D · ARRASTRA ROTAR · RUEDA ZOOM · CLIC EN ESTADO";
  }).catch(() => {
    mapstatus.textContent = "3D NO DISPONIBLE · REQUIERE CONEXIÓN AL CDN (HTTP/HTTPS)";
  });
}