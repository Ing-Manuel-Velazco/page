/* ============================================================
   js/certificados.js — 05 · Acreditaciones
   Stats + toolbar de filtros + tarjetas estilo credencial +
   modal de vista. Datos desde certificados/manifest.js.
   · Paginación SIN deslizamiento (scroll congelado), 8/página,
     altura estable entre páginas (placeholders ocultos).
   · FIX: si una imagen da 404 (p. ej. archivo no subido o nombre
     distinto en GitHub), la tarjeta NO se oculta: muestra un
     placeholder "SIN VISTA" y sigue visible y clicable.
============================================================ */
import { $, norm, esc, openModal } from "./core.js";
import { t } from "./i18n.js?v=asset-obscure-20260924a";
import { cargarMedia, liberarMedia } from "./media.js?v=asset-obscure-20260924a";

const CARPETA = "certificados";
const POR_PAGINA = 8;

const MESES = { "enero":"01","febrero":"02","marzo":"03","abril":"04","mayo":"05","junio":"06","julio":"07","agosto":"08","septiembre":"09","setiembre":"09","octubre":"10","noviembre":"11","diciembre":"12","ene":"01","feb":"02","mar":"03","abr":"04","may":"05","jun":"06","jul":"07","ago":"08","sep":"09","oct":"10","nov":"11","dic":"12","january":"01","february":"02","march":"03","april":"04","june":"06","july":"07","august":"08","october":"10","november":"11","december":"12" };
const cap1 = s => { s = (s || "").trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; };
function parseFecha(d){
  if (!d) return { codigo: "", texto: "" };
  const y = (d.match(/20\d{2}/) || [""])[0];
  const low = d.toLowerCase(); let mm = "";
  for (const k in MESES) { if (low.includes(k)) { mm = MESES[k]; break; } }
  return { codigo: y ? (mm ? y + "-" + mm : y) : "", texto: cap1(d) };
}
function parseArchivo(f){
  const base = f.replace(/\.(jpe?g|png)$/i, "").trim();
  const parts = (base.includes(",") ? base.split(/\s*,\s*/) : base.split(/\s*[-–—|]\s*/)).map(s => s.trim()).filter(Boolean);
  let inst = "", name = "", datePart = "", serial = "";
  if (parts.length >= 4) { inst = parts[0]; serial = parts[parts.length - 1]; datePart = parts[parts.length - 2]; name = parts.slice(1, parts.length - 2).join(", "); }
  else if (parts.length === 3) { inst = parts[0]; if (/\d{4}/.test(parts[2])) { datePart = parts[2]; name = parts[1]; } else name = parts[1] + ", " + parts[2]; }
  else if (parts.length === 2) { inst = parts[0]; name = parts[1]; }
  else name = parts[0] || base;
  const { codigo, texto } = parseFecha(datePart);
  return { institucion: inst.trim(), nombre: name.trim(), fecha: codigo, fechaTexto: texto, serial: serial.trim() };
}
const construirItem = item => {
  if (typeof item === "string") return { id: 0, ...parseArchivo(item), src: `${CARPETA}/${item}` };
  const { recurso, ...datos } = item;
  return { id: 0, ...datos, recurso };
};

const grid = $("#certgrid"), nores = $("#nores"), sugg = $("#sugg"),
      filters = $("#certfilters"), fyear = $("#fyear"), fiss = $("#fiss"), fsearch = $("#fsearch"),
      fclear = $("#fclear"), pagination = $("#pagination"), pgcount = $("#pgcount"), cstats = $("#cstats");

let CERTS = [], currentPage = 1;

/* ---------- stats del acervo ---------- */
function renderStats(){
  const years = CERTS.map(c => (c.fecha || "").slice(0, 4)).filter(Boolean).map(Number);
  const rango = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";
  const insts = new Set(CERTS.map(c => c.institucion).filter(Boolean)).size;
  cstats.innerHTML =
    `<span class="stat"><b>${CERTS.length}</b> ${t("cert.statsCerts")}</span>` +
    `<span class="stat"><b>${insts}</b> ${t("cert.statsInst")}</span>` +
    `<span class="stat"><b>${rango}</b> ${t("cert.statsYears")}</span>`;
}

/* ---------- filtros ---------- */
function buildFilters(){
  const cy = fyear.value, ci = fiss.value;
  fyear.innerHTML = `<option value="">${t("cert.allyears")}</option>`;
  fiss.innerHTML = `<option value="">${t("cert.alliss")}</option>`;
  [...new Set(CERTS.map(c => (c.fecha || "").slice(0, 4)).filter(Boolean))].sort().reverse().forEach(y => fyear.add(new Option(y, y)));
  const isss = [...new Set(CERTS.map(c => c.institucion).filter(Boolean))].sort();
  isss.forEach(i => fiss.add(new Option(i, i)));
  fyear.value = cy; fiss.value = ci;
  if (!isss.length) fiss.style.display = "none"; else fiss.style.display = "";
}
function updateClear(){
  fclear.hidden = !(fyear.value || fiss.value || fsearch.value.trim());
}

/* ---------- búsqueda con scoring ---------- */
const subseq = (w, t2) => { let i = 0; for (const ch of t2) { if (ch === w[i]) i++; if (i === w.length) return true; } return false; };
function scoreCert(c, words){
  const name = norm(c.nombre), iss = norm(c.institucion), yr = (c.fecha || "").slice(0, 4), ser = norm(c.serial);
  let total = 0;
  for (const w of words) {
    let s = 0;
    if (name.includes(w)) s += 6;
    else if (name.split(/\s+/).some(x => x.startsWith(w))) s += 4;
    if (iss.includes(w)) s += 4;
    if (yr === w) s += 3;
    if (ser.includes(w)) s += 2;
    if (!s && w.length >= 3 && (subseq(w, name) || subseq(w, iss))) s += 1;
    if (!s) return 0;
    total += s;
  }
  return total;
}
function getFiltered(){
  const y = fyear.value, iss = fiss.value;
  const words = norm(fsearch.value).split(/\s+/).filter(Boolean);
  let list = CERTS.filter(c => (!y || (c.fecha || "").startsWith(y)) && (!iss || c.institucion === iss));
  if (words.length) {
    list = list.map(c => ({ c, s: scoreCert(c, words) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.c);
  }
  return list;
}

/* ---------- placeholder si la imagen falta (404 en GitHub) ---------- */
function fallbackThumb(img, year){
  img.onerror = null;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 260'>` +
    `<rect width='400' height='260' fill='#0F1535'/>` +
    `<rect x='10' y='10' width='380' height='240' fill='none' stroke='#3B82F6' stroke-opacity='.35' stroke-width='2'/>` +
    `<path d='M200 96a34 34 0 1 1 0 68 34 34 0 0 1 0-68z' fill='none' stroke='#06B6D4' stroke-opacity='.6' stroke-width='2'/>` +
    `<text x='200' y='138' text-anchor='middle' font-family='monospace' font-size='15' fill='#94A3B8'>SIN VISTA</text>` +
    `<text x='200' y='196' text-anchor='middle' font-family='monospace' font-size='12' fill='#3B82F6'>${year || ""}</text>` +
    `</svg>`;
  img.src = "data:image/svg+xml," + encodeURIComponent(svg);
  img.classList.add("ld");
}

/* ---------- render con scroll congelado y altura estable ---------- */
function renderGrid(){
  const y = window.scrollY;
  const rootEl = document.documentElement;
  const sb = rootEl.style.scrollBehavior;
  rootEl.style.scrollBehavior = "auto";

  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / POR_PAGINA));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * POR_PAGINA;
  const items = filtered.slice(start, start + POR_PAGINA);
  grid.querySelectorAll("img").forEach(liberarMedia);
  grid.innerHTML = ""; pagination.innerHTML = ""; pgcount.textContent = "";
  nores.style.display = filtered.length ? "none" : "block";
  if (!filtered.length) { sugg.textContent = `${t("cert.try")} ${CERTS.slice(0, 3).map(c => c.nombre.split(" ")[0]).join(", ")}`; }
  items.forEach(c => {
    const year = (c.fecha || "").slice(0, 4);
    const card = document.createElement("div");
    card.className = "cert-card reveal in";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", c.nombre);
    card.innerHTML = `
      <div class="ct-top"><span class="ct-iss">${esc(c.institucion || "—")}</span><span class="ct-year">${year || "····"}</span></div>
      <div class="cert-thumb">
        <img alt="${esc(c.nombre)}" loading="lazy" decoding="async" draggable="false">
        <span class="ct-corners" aria-hidden="true"></span>
        <span class="ct-scan" aria-hidden="true"></span>
      </div>
      <h3>${esc(c.nombre)}</h3>
      <div class="ct-foot">
        ${c.serial ? `<span class="ct-ser">№ ${esc(c.serial)}</span>` : "<span></span>"}
        <button class="ct-view" type="button">⊕ ${t("cert.ver")}</button>
      </div>`;
    const img = card.querySelector(".cert-thumb img");
    img.addEventListener("load", () => img.classList.add("ld"));
    /* FIX: ante 404, placeholder visible en lugar de ocultar la tarjeta */
    img.addEventListener("error", () => fallbackThumb(img, year));
    cargarMedia(img, c.recurso).then(() => img.classList.add("ld")).catch(() => fallbackThumb(img, year));
    card.addEventListener("click", () => openModalCert(c));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModalCert(c); }
    });
    card.querySelector(".ct-view").addEventListener("click", e => { e.stopPropagation(); openModalCert(c); });
    grid.appendChild(card);
  });

  /* placeholders ocultos: misma altura en todas las páginas */
  for (let i = items.length; i < POR_PAGINA; i++) {
    const ph = document.createElement("div");
    ph.className = "cert-card";
    ph.setAttribute("aria-hidden", "true");
    ph.style.visibility = "hidden";
    ph.style.pointerEvents = "none";
    ph.style.minHeight = "320px";
    grid.appendChild(ph);
  }

  renderPagination(filtered.length, totalPages, start, items.length);

  window.scrollTo(0, y);
  rootEl.style.scrollBehavior = sb;
}

/* ---------- paginación (sin desplazar; re-focus accesible) ---------- */
function renderPagination(total, totalPages, start, shown){
  pgcount.textContent = `${t("cert.showing")} ${start + 1}–${start + shown} ${t("cert.de")} ${total}`;
  if (totalPages <= 1) return;
  let html = `<button class="pg-btn" data-p="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) { if (i === 3 || i === totalPages - 2) html += '<span class="pg-dots">…</span>'; continue; }
    html += `<button class="pg-btn ${i === currentPage ? "active" : ""}" data-p="${i}">${i}</button>`;
  }
  html += `<button class="pg-btn" data-p="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>›</button>`;
  pagination.innerHTML = html;
  pagination.querySelectorAll(".pg-btn").forEach(b => b.addEventListener("click", () => {
    const p = parseInt(b.dataset.p);
    if (p >= 1 && p <= totalPages && p !== currentPage) {
      currentPage = p;
      renderGrid();
      const nb = pagination.querySelector(`[data-p="${p}"]`);
      if (nb) nb.focus({ preventScroll: true });
    }
  }));
}

/* ---------- modal de vista ---------- */
function openModalCert(c){
  const year = (c.fecha || "").slice(0, 4);
  const head = `<span class="modal-badge">${t("cert.badge")}</span><h3>${esc(c.nombre)}</h3>
    ${c.institucion ? `<span class="iss">${esc(c.institucion)}</span>` : ""}
    ${(c.fechaTexto || year) ? `<time>${esc(c.fechaTexto || year)}</time>` : ""}`;
  const foot = `${t("cert.view")}${c.institucion ? " · " + esc(c.institucion) : ""}`;
  const box = openModal(head, `<img alt="${esc(c.nombre)}" decoding="async" draggable="false">`, foot);
  const image = box.querySelector("img");
  image.addEventListener("error", () => {
    box.innerHTML = `<div class="img-error">${t("cert.imgerr")}</div>`;
  });
  cargarMedia(image, c.recurso).catch(() => { box.innerHTML = `<div class="img-error">${t("cert.imgerr")}</div>`; });
}

/* ---------- init ---------- */
export function initCerts(){
  const m = window.MANIFEST_CERTS;
  if (!Array.isArray(m) || !m.length) {
    console.warn("[certificados] manifest.js ausente o vacío: galería no inicializada.");
    return;
  }
  CERTS = m.filter(x => x && x.archivo).map(construirItem)
           .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  CERTS.forEach((c, i) => c.id = i + 1);
  filters.style.display = "flex";
  buildFilters(); renderStats(); renderGrid(); updateClear();

  fyear.addEventListener("change", () => { currentPage = 1; renderGrid(); updateClear(); });
  fiss.addEventListener("change", () => { currentPage = 1; renderGrid(); updateClear(); });
  fsearch.addEventListener("input", () => { currentPage = 1; renderGrid(); updateClear(); });
  fclear.addEventListener("click", () => {
    fyear.value = ""; fiss.value = ""; fsearch.value = "";
    currentPage = 1; renderGrid(); updateClear();
  });
  addEventListener("jv:lang", () => { buildFilters(); renderStats(); renderGrid(); });
}

