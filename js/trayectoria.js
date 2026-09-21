/* ============================================================
   js/trayectoria.js — Timeline geoespacial (sección 02)
   Búsqueda + crumbs + stats + timeline sincronizada con el mapa
============================================================ */
import { $, norm, esc, accordion } from "./core.js";
import { t, loc, allv, fmtYM, fmtCoords, getLang } from "./i18n.js?v=geo-20260921l";
import { EXPERIENCIAS } from "./data.js?v=geo-20260921g";
import { state, setFiltro, onFiltro } from "./state.js?v=geo-20260921g";
import { volarAMunicipio, resaltarEstado } from "./mapa.js?v=geo-20260921l";

const fmtMeses = m => {
  const y = Math.floor(m / 12), r = m % 12;
  const sy = y ? `${y} ${y !== 1 ? t("exp.años") : t("exp.año")}` : "";
  const sr = r ? `${r} ${r !== 1 ? t("exp.meses") : t("exp.mes")}` : "";
  return (sy + (sy && sr ? " " : "") + sr) || `0 ${t("exp.meses")}`;
};

function renderStats(){
  const total = EXPERIENCIAS.reduce((s, e) => s + meses(e.inicio, e.fin), 0);
  $("#xstats").innerHTML =
    `<span class="stat stat-total"><span>${t("exp.totalExperience")}</span><b>${fmtMeses(total)}</b></span>`;
}
const meses = (a, b) => {
  const [ay, am] = a.split("-").map(Number), [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am) + 1;
};

function getFilteredX(){
  let list = [...EXPERIENCIAS].sort((a, b) => b.fin.localeCompare(a.fin));
  if (state.selEstado) list = list.filter(e => norm(e.estado) === state.key);
  else if (state.selPais) list = list.filter(e => norm(e.pais) === norm(state.selPais));
  const q = norm($("#xsearch").value.trim());
  if (q) list = list.filter(e => {
    const hay = norm([allv(e.puesto), allv(e.empresa), e.sigla, e.estado, e.pais, e.ciudad,
      ...["es","en","pt"].flatMap(l => e.tools[l] || [])].join(" "));
    return hay.includes(q);
  });
  return list;
}

function renderCrumbs(){
  const c = $("#xcrumbs");
  const html =
    `<button class="crumb ${!state.selPais && !state.selEstado ? "act" : ""}" data-f="all">${t("exp.all")}</button>` +
    `<button class="crumb ${state.selPais && !state.selEstado ? "act" : ""}" data-f="pais">${t("exp.pais")}</button>` +
    `<button class="crumb ${state.selEstado ? "act" : ""}" data-f="estado">${t("exp.estado")}</button>`;
  c.innerHTML = html;
  c.querySelectorAll(".crumb").forEach(b => b.addEventListener("click", () => {
    const f = b.dataset.f;
    if (f === "pais") setFiltro("México", null);
    else if (f === "estado" && state.selEstado) setFiltro("México", null);
    else setFiltro(null, null);
  }));
}

function renderXList(){
  const list = getFilteredX();
  const L = $("#xlist"); L.innerHTML = "";
  if (!list.length) { L.innerHTML = `<p class="no-results">${t("exp.nomatch")}</p>`; return; }
  list.forEach((e, i) => {
    const item = document.createElement("article");
    item.className = "tl-item";
    item.style.animationDelay = (i * 70) + "ms";
    item.innerHTML = `
      <span class="tl-node" aria-hidden="true"><i></i></span>
      <div class="xp-card">
        <div class="xh">
          <div><h3>${esc(loc(e.puesto))}</h3><p class="org">${esc(loc(e.empresa))}${e.sigla ? ` <em>(${esc(e.sigla)})</em>` : ""}</p></div>
          <div class="xmeta"><time>${fmtYM(e.inicio)} — ${fmtYM(e.fin)}</time><span class="xdur">${esc(loc(e.dur))}</span><span class="xchev">▾</span></div>
        </div>
        <div class="xp-body"><div class="xp-body-in">
          <p class="xloc">⌖ ${esc(e.ciudad)}, ${esc(e.estado)}, ${esc(t("exp.paisname"))} · ${fmtCoords(e.coords)}</p>
          <ul>${loc(e.logros).map(l => `<li>${esc(l)}</li>`).join("")}</ul>
          <div class="chips">${loc(e.tools).map(x => `<span class="chip">${esc(x)}</span>`).join("")}</div>
          <button class="locbtn" type="button">${t("exp.vermap")}</button>
        </div></div>
      </div>`;
    const card = item.querySelector(".xp-card");
    accordion(card, card.querySelector(".xh"), card.querySelector(".xp-body"));
    card.addEventListener("mouseenter", () => resaltarEstado(e.estado));
    card.addEventListener("mouseleave", () => resaltarEstado(null));
    item.querySelector(".locbtn").addEventListener("click", ev => {
      ev.stopPropagation();
      volarAMunicipio(e.estado, e.ciudad);
      resaltarEstado(e.estado);
      setTimeout(() => resaltarEstado(null), 1600);
    });
    L.appendChild(item);
  });
}

export function initTrayectoria(){
  $("#xsearch").addEventListener("input", () => renderXList());
  onFiltro(() => { renderXList(); renderCrumbs(); });
  addEventListener("jv:lang", () => { renderStats(); renderCrumbs(); renderXList(); });
  renderStats(); renderCrumbs(); renderXList();
}
