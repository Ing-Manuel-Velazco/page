/* ============================================================
   js/trayectoria.js — Timeline geoespacial (sección 02)
   Búsqueda + crumbs + stats + timeline sincronizada con el mapa
   (hover resalta el estado; "⌖ VER EN MAPA" vuela la cámara)
   ============================================================ */
import { $, norm, esc, fmtYM, fmtCoords, accordion } from "./core.js";
import { EXPERIENCIAS } from "./data.js";
import { state, setFiltro, onFiltro } from "./state.js";
import { volarAEstado, resaltarEstado } from "./mapa.js";

/* ---------- stats calculadas de la fuente de datos ---------- */
const meses = (a, b) => {
  const [ay, am] = a.split("-").map(Number), [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am) + 1;
};
const fmtMeses = m => {
  const y = Math.floor(m / 12), r = m % 12;
  const sy = y ? `${y} AÑO${y !== 1 ? "S" : ""}` : "";
  const sr = r ? `${r} MES${r !== 1 ? "ES" : ""}` : "";
  return (sy + (sy && sr ? " " : "") + sr) || "0 MESES";
};
function renderStats(){
  const total = EXPERIENCIAS.reduce((s, e) => s + meses(e.inicio, e.fin), 0);
  const est = new Set(EXPERIENCIAS.map(e => norm(e.estado))).size;
  $("#xstats").innerHTML =
    `<span class="stat"><b>${EXPERIENCIAS.length}</b> EXPERIENCIAS</span>` +
    `<span class="stat"><b>${est}</b> ESTADOS</span>` +
    `<span class="stat"><b>${fmtMeses(total)}</b> DE CAMPO</span>`;
}

/* ---------- filtros ---------- */
function getFilteredX(){
  let list = [...EXPERIENCIAS].sort((a, b) => b.fin.localeCompare(a.fin));
  if (state.selEstado) list = list.filter(e => norm(e.estado) === state.key);
  else if (state.selPais) list = list.filter(e => norm(e.pais) === norm(state.selPais));
  const q = norm($("#xsearch").value.trim());
  if (q) list = list.filter(e =>
    norm(`${e.puesto} ${e.empresa} ${e.sigla} ${e.estado} ${e.pais} ${e.tools.join(" ")}`).includes(q));
  return list;
}

function renderCrumbs(){
  const c = $("#xcrumbs");
  let html = `<button class="crumb ${!state.selPais && !state.selEstado ? "act" : ""}" data-f="all">TODOS</button>`;
  if (state.selPais) html += `<button class="crumb ${state.selPais && !state.selEstado ? "act" : ""}" data-f="pais">MÉXICO</button>`;
  if (state.selEstado) html += `<button class="crumb act" data-f="estado" title="Quitar filtro">⌖ ${esc(state.selEstado)} ✕</button>`;
  c.innerHTML = html;
  c.querySelectorAll(".crumb").forEach(b => b.addEventListener("click", () => {
    const f = b.dataset.f;
    if (f === "pais") setFiltro("México", null);
    else setFiltro(null, null);
  }));
}

/* ---------- timeline ---------- */
function renderXList(){
  const list = getFilteredX();
  const L = $("#xlist"); L.innerHTML = "";
  if (!list.length) { L.innerHTML = '<p class="no-results">Sin coincidencias.</p>'; return; }
  list.forEach((e, i) => {
    const item = document.createElement("article");
    item.className = "tl-item";
    item.style.animationDelay = (i * 70) + "ms";
    item.innerHTML = `
      <span class="tl-node" aria-hidden="true"><i></i></span>
      <div class="xp-card">
        <div class="xh">
          <div><h3>${esc(e.puesto)}</h3><p class="org">${esc(e.empresa)}${e.sigla ? ` <em>(${esc(e.sigla)})</em>` : ""}</p></div>
          <div class="xmeta"><time>${fmtYM(e.inicio)} — ${fmtYM(e.fin)}</time><span class="xdur">${esc(e.dur)}</span><span class="xchev">▾</span></div>
        </div>
        <div class="xp-body"><div class="xp-body-in">
          <p class="xloc">⌖ ${esc(e.ciudad)}, ${esc(e.estado)}, ${esc(e.pais)} · ${fmtCoords(e.coords)}</p>
          <ul>${e.logros.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
          <div class="chips">${e.tools.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
          <button class="locbtn" type="button">⌖ VER EN MAPA</button>
        </div></div>
      </div>`;
    const card = item.querySelector(".xp-card");
    accordion(card, card.querySelector(".xh"), card.querySelector(".xp-body"));
    card.addEventListener("mouseenter", () => resaltarEstado(e.estado));
    card.addEventListener("mouseleave", () => resaltarEstado(null));
    item.querySelector(".locbtn").addEventListener("click", ev => {
      ev.stopPropagation();
      volarAEstado(e.estado);
      resaltarEstado(e.estado);
      setTimeout(() => resaltarEstado(null), 1600);
    });
    L.appendChild(item);
  });
}

export function initTrayectoria(){
  $("#xsearch").addEventListener("input", () => renderXList());
  onFiltro(() => { renderXList(); renderCrumbs(); });
  renderStats();
  renderCrumbs();
  renderXList();
}