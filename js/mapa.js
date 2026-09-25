/* ============================================================
   js/mapa.js — Sección 02: carta 3D de México (Three.js)
   PERF: el loop WebGL se PAUSA fuera del viewport y con la
   pestaña oculta; pixelRatio capped a 1.75.
============================================================ */
import * as THREE from "three";
import { $, norm, esc, accordion, RM } from "./core.js";
import { t, loc, fmtYM, getLang } from "./i18n.js?v=asset-obscure-20260924a";
import { EXPERIENCIAS } from "./data.js?v=geo-20260921g";
import { state, setFiltro, onFiltro } from "./state.js?v=geo-20260921g";
import { cargarEstados, construir, desdeGeoJSON, layout } from "./geo3d.js?v=geo-20260921h";

const DEF = { theta: .65, phi: .75, radius: 95 };
const MIN_RADIUS = 10;

let renderer, scene, camera, ray, ptr, host, tip, mapview, mapnotice, target = null;
let meshes = [], group = null, muniMeshes = [], muniGroup = null, muniState = null;
let hovered = null, hl = [], muniHighlight = null, camAnim = null;
let theta = DEF.theta, phi = DEF.phi, radius = DEF.radius;
let dragging = false, lx = 0, ly = 0, moved = 0, touched = false;
let raf = null, running = false, inView = false, docVisible = true;
let built = false, GBcount = 0;
let municipalitySheetToken = 0;
let activeTerritorialSheet = null;
const territorialSummaryCache = new Map();

const cols = () => {
  const g = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  return {
    base: g("--bg2"), acc: g("--acc"), acc2: g("--acc2"),
    munFill: g("--map-mun-fill"), munEdge: g("--map-mun-edge"),
    munHighlight: g("--map-mun-highlight"), munHighlightEdge: g("--map-mun-highlight-edge")
  };
};
const byName = n => meshes.find(m => norm(m.userData.name) === norm(n));
const mesesDeExperiencia = ({ inicio, fin }) => {
  const [ai, mi] = inicio.split("-").map(Number);
  const [af, mf] = fin.split("-").map(Number);
  return (af - ai) * 12 + mf - mi + 1;
};
const trabajosLateralesAbiertos = () => $("#xpmapgrid")?.classList.contains("show-work");

function cerrarTrabajosLateral(){
  $("#xpmapgrid")?.classList.remove("show-work");
}

function enfocarDetalleExperiencia(estado, municipio = ""){
  const grid = $("#xpmapgrid"), side = $("#xpside"), estadoMesh = byName(estado);
  if (!grid || !estadoMesh) return;

  cerrarPanelTrabajos();
  grid.classList.add("show-work");
  setFiltro("México", estadoMesh.userData.name);
  actualizarBotonTrabajos(estadoMesh);

  const municipioMesh = municipio
    ? muniMeshes.find(m => norm(m.userData.name) === norm(municipio))
    : null;
  if (municipioMesh) {
    resaltarMunicipio(municipioMesh);
    flyTo(municipioMesh.userData.center.clone(), 12, 760);
  } else {
    flyTo(estadoMesh.userData.center.clone(), 26, 700);
  }

  window.setTimeout(() => {
    if (!side) return;
    side.classList.remove("work-focus");
    void side.offsetWidth;
    side.classList.add("work-focus");
    side.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "nearest" });
  }, RM ? 0 : 390);
}

function statusListo(){
  const estados = new Set(EXPERIENCIAS.map(e => norm(e.estado))).size;
  const stateCount = $("#mapstates"), recordCount = $("#maprecords"), yearCount = $("#mapyears");
  if (stateCount) stateCount.textContent = estados;
  if (recordCount) recordCount.textContent = EXPERIENCIAS.length;
  if (yearCount) yearCount.textContent = Math.floor(EXPERIENCIAS.reduce((total, trabajo) => total + mesesDeExperiencia(trabajo), 0) / 12);
  if (muniState) {
    if (mapnotice) mapnotice.textContent = `${t("exp.municipalities")} · ${muniState.userData.name} · ${t("exp.resetMunicipalities")}`;
    return;
  }
  if (mapnotice) mapnotice.textContent = `${t("exp.inegi")} · ${estados} ${t("exp.states")} · ${EXPERIENCIAS.length} ${t("exp.records")} · ${t("exp.clickState")}`;
}

function build(){
  const jobs = new Set(EXPERIENCIAS.map(e => norm(e.estado)));
  const C = cols();
  const b = construir(THREE, {
    jobs,
    depth: () => .9,
    mat: isJ => new THREE.MeshStandardMaterial({
      color: isJ ? C.acc : C.base, roughness: .55, metalness: .18,
      transparent: true, opacity: isJ ? .97 : .88
    })
  });
  group = b.group; meshes = b.meshes; GBcount = b.meshes.length;
  scene.add(group);
  built = true;
  applyFilter();
}

function limpiarMunicipios({ cerrarFicha = true } = {}){
  if (muniGroup) {
    muniGroup.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    scene.remove(muniGroup);
  }
  muniGroup = null; muniMeshes = []; muniState = null; muniHighlight = null;
  if (cerrarFicha) cerrarFichaMunicipio();
  cerrarTrabajosLateral();
  actualizarBotonTrabajos();
}

async function mostrarMunicipios(estado, { mantenerFicha = false } = {}){
  const clave = estado?.userData?.cveEnt;
  if (!clave || !scene) return;
  if (muniState?.userData?.cveEnt === clave) { muniGroup.visible = true; actualizarBotonTrabajos(estado); statusListo(); return; }
  cerrarPanelTrabajos();
  limpiarMunicipios({ cerrarFicha: !mantenerFicha });
  if (mapnotice) mapnotice.textContent = `${t("exp.loadingMunicipalities")} · ${estado.userData.name}…`;
  try {
    const res = await fetch(`geo/municipios/municipio${Number(clave)}.geojson`);
    if (!res.ok) throw new Error(`municipios ${clave}`);
    const datos = desdeGeoJSON(await res.json());
    const C = cols();
    const b = construir(THREE, {
      datos, layout: layout(), depth: () => .46, yOffset: .98,
      mat: () => new THREE.MeshStandardMaterial({
        color: C.munFill, emissive: C.munEdge, emissiveIntensity: .16,
        transparent: true, opacity: .68, roughness: .62
      }),
      edges: true, edgeColor: C.munEdge, edgeOpacity: .98
    });
    muniGroup = b.group; muniMeshes = b.meshes; muniState = estado;
    muniMeshes.forEach(m => { m.userData.municipio = true; });
    scene.add(muniGroup); actualizarBotonTrabajos(estado); statusListo();
  } catch (err) {
    console.warn("[mapa] No se pudieron cargar municipios", err);
    if (mapnotice) mapnotice.textContent = t("exp.municipalitiesUnavailable");
  }
}

function pintarMunicipio(m){
  const C = cols(), destacado = m === muniHighlight;
  const fill = destacado ? C.munHighlight : C.munFill;
  const edge = destacado ? C.munHighlightEdge : C.munEdge;
  m.material.color.set(fill);
  m.material.emissive?.set(edge);
  m.material.emissiveIntensity = destacado ? .42 : .16;
  m.material.opacity = destacado ? .86 : .68;
  m.children.forEach(hijo => {
    if (hijo.material?.color) hijo.material.color.set(edge);
    if (hijo.material && "opacity" in hijo.material) hijo.material.opacity = destacado ? 1 : .98;
  });
}
function actualizarEstiloMunicipios(){ muniMeshes.forEach(pintarMunicipio); }
function resaltarMunicipio(m){
  muniHighlight = m || null;
  actualizarEstiloMunicipios();
}

function actualizarBotonTrabajos(estado = null){
  const boton = $("#mapworkbtn");
  if (!boton) return;
  const jobs = estado ? EXPERIENCIAS.filter(e => norm(e.estado) === norm(estado.userData.name)) : [];
  boton.hidden = !jobs.length;
  if (!jobs.length) cerrarTrabajosLateral();
  boton.textContent = trabajosLateralesAbiertos() ? t("exp.hideWork") : t("exp.viewWork");
}

function cerrarPanelTrabajos(){
  const panel = $("#mapjobs");
  if (!panel || panel.hidden) return;
  panel.classList.remove("on");
  window.setTimeout(() => {
    if (!panel.classList.contains("on")) { panel.hidden = true; panel.innerHTML = ""; }
  }, 340);
}

function cerrarFichaMunicipio(){
  municipalitySheetToken += 1;
  activeTerritorialSheet = null;
  const sheet = $("#municipalitysheet");
  if (!sheet) return;
  sheet.hidden = true;
  sheet.innerHTML = "";
}

const resumenCorto = texto => {
  const limpio = String(texto || "").replace(/\s+/g, " ").trim();
  if (!limpio) return "";
  const primeraFrase = limpio.match(/^.*?[.!?](?=\s|$)/)?.[0] || limpio;
  return primeraFrase.length > 280 ? `${primeraFrase.slice(0, 277).trimEnd()}…` : primeraFrase;
};

const resumenDeRespaldo = (nombre, estado) =>
  t("exp.municipalityFallback").replace("{name}", nombre).replace("{state}", estado);

const wikiTerms = {
  es: { municipality: "municipio", state: "estado de México", mexicoState: "Estado de México" },
  en: { municipality: "municipality Mexico", state: "state Mexico", mexicoState: "State of Mexico" },
  pt: { municipality: "município México", state: "estado México", mexicoState: "Estado do México" }
};

function consultaTerritorial({ tipo, nombre, estado = "" }, idioma = getLang()){
  const terms = wikiTerms[idioma] || wikiTerms.es;
  if (tipo === "state") return norm(nombre) === "mexico" ? terms.mexicoState : `${nombre} ${terms.state}`;
  return `${nombre} ${terms.municipality} ${estado}`;
}

function obtenerResenaTerritorial({ tipo, nombre, estado = "" }){
  const idioma = getLang();
  const key = `${idioma}|${tipo}|${norm(nombre)}|${norm(estado)}`;
  if (territorialSummaryCache.has(key)) return territorialSummaryCache.get(key);
  const request = (async () => {
    const params = new URLSearchParams({
      action: "query", generator: "search", gsrsearch: consultaTerritorial({ tipo, nombre, estado }, idioma),
      gsrnamespace: "0", gsrlimit: "1", prop: "extracts|info", exintro: "1",
      explaintext: "1", inprop: "url", format: "json", origin: "*"
    });
    const res = await fetch(`https://${idioma}.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error("Wikipedia no disponible");
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    const texto = resumenCorto(page?.extract);
    const url = String(page?.fullurl || "");
    if (!texto || !url.startsWith(`https://${idioma}.wikipedia.org/`)) throw new Error("Sin reseña territorial");
    return { texto, url };
  })().catch(() => null);
  territorialSummaryCache.set(key, request);
  return request;
}

function precargarResenaEstado(estado){
  if (!estado || estado.userData?.municipio) return;
  obtenerResenaTerritorial({ tipo: "state", nombre: estado.userData.name });
}

async function cargarResenaTerritorial({ tipo, nombre, estado, respaldo, sourceKey = "exp.moreAbout", token }){
  const sheet = $("#municipalitysheet");
  const descripcion = sheet?.querySelector(".municipality-sheet-description");
  const fuente = sheet?.querySelector(".municipality-sheet-editorial-source");
  const mostrarRespaldo = () => {
    if (token !== municipalitySheetToken || !descripcion || !fuente) return;
    descripcion.textContent = respaldo;
    fuente.hidden = true;
  };
  try {
    const result = await obtenerResenaTerritorial({ tipo, nombre, estado });
    if (!result) throw new Error("Sin reseña territorial");
    if (token !== municipalitySheetToken || !descripcion || !fuente) return;
    descripcion.textContent = result.texto;
    fuente.href = result.url;
    fuente.textContent = `${t("exp.sourceWikipedia")} · ${t(sourceKey)}`;
    fuente.hidden = false;
  } catch (_) {
    mostrarRespaldo();
  }
}

function cargarResenaMunicipio({ nombre, estado, token }){
  return cargarResenaTerritorial({
    tipo: "municipality", nombre, estado,
    respaldo: resumenDeRespaldo(nombre, estado),
    sourceKey: "exp.moreAbout",
    token
  });
}

const trabajosDeEstado = nombre => EXPERIENCIAS.filter(e => norm(e.estado) === norm(nombre));
const trabajosDeMunicipio = (estado, municipio) => EXPERIENCIAS.filter(e =>
  norm(e.estado) === norm(estado) && norm(e.ciudad) === norm(municipio));

function etiquetaExperiencias(total){
  return `${t("exp.viewExperience")} ${total} ${total === 1 ? t("exp.experience") : t("exp.experiences")} →`;
}

function resumenExperienciaEnFicha(jobs, { tipo, estado }){
  const visibles = jobs.slice(0, 2);
  const restantes = jobs.length - visibles.length;
  return `
    <div class="sheet-experience-summary">
      <span>${esc(tipo)}</span><b>${jobs.length} ${esc(jobs.length === 1 ? t("exp.experience") : t("exp.experiences"))}</b>
    </div>
    <div class="sheet-experience-list">
      ${visibles.map(e => `<div class="sheet-experience-item"><b>${esc(loc(e.puesto))}</b><span>${esc(loc(e.empresa))}${e.sigla ? ` · ${esc(e.sigla)}` : ""}</span><small>⌖ ${esc(e.ciudad)} · ${esc(loc(e.dur))}</small></div>`).join("")}
      ${restantes > 0 ? `<p class="sheet-experience-more">+${restantes} ${esc(t("exp.moreExperiences"))}</p>` : ""}
    </div>
    <button class="sheet-experience-cta" type="button">${esc(etiquetaExperiencias(jobs.length))}</button>
    <a class="municipality-sheet-territorial-source sheet-territorial-link" href="https://www.inegi.org.mx/app/ageeml/" target="_blank" rel="noopener noreferrer">${esc(t("exp.territorialLink"))}</a>`;
}

function abrirEstado(estado){
  const p = estado.userData;
  const sheet = $("#municipalitysheet");
  if (!sheet) return;
  const jobs = trabajosDeEstado(p.name);
  activeTerritorialSheet = { tipo: "state", mesh: estado };
  const token = ++municipalitySheetToken;
  sheet.hidden = false;
  if (jobs.length) {
    sheet.innerHTML = `
      <div class="municipality-sheet-head sheet-experience-head">
        <div><span class="municipality-sheet-kicker">${esc(t("exp.workState"))}</span><h3>${esc(p.name)}</h3></div>
        <button class="municipality-sheet-close" type="button" aria-label="${esc(t("exp.close"))}">×</button>
      </div>
      <div class="municipality-sheet-body sheet-experience-body">
        ${resumenExperienciaEnFicha(jobs, { tipo: t("exp.estado"), estado: p.name })}
      </div>
      <div class="municipality-sheet-foot">${esc(t("exp.inegi"))} · ${esc(t("exp.mgEdition"))}</div>`;
    sheet.querySelector(".municipality-sheet-close").addEventListener("click", cerrarFichaMunicipio);
    sheet.querySelector(".sheet-experience-cta").addEventListener("click", () => enfocarDetalleExperiencia(p.name));
    return;
  }
  sheet.innerHTML = `
    <div class="municipality-sheet-head">
      <div><span class="municipality-sheet-kicker">${esc(t("exp.stateInfo"))} · ${esc(t("exp.paisname"))}</span><h3>${esc(p.name)}</h3></div>
      <button class="municipality-sheet-close" type="button" aria-label="${esc(t("exp.close"))}">×</button>
    </div>
    <div class="municipality-sheet-body">
      <p class="municipality-sheet-key"><span>${esc(t("exp.ageeKey"))}</span><b>${esc(p.cveGeo || p.cveEnt)}</b></p>
      <div class="municipality-sheet-codes" aria-label="${esc(t("exp.officialCodes"))}">
        <span>${esc(t("exp.entityKey"))}<b>${esc(p.cveEnt)}</b></span>
        <span>${esc(t("exp.territorialLevel"))}<b>AGEE</b></span>
      </div>
      <p class="municipality-sheet-framework">${esc(t("exp.mgEdition"))}<span>${esc(t("exp.mgCut"))}</span></p>
      <a class="municipality-sheet-territorial-source" href="https://www.inegi.org.mx/app/ageeml/" target="_blank" rel="noopener noreferrer">${esc(t("exp.officialInegi"))}</a>
      <p class="municipality-sheet-description">${esc(t("exp.loadingSummary"))}</p>
      <a class="municipality-sheet-source municipality-sheet-editorial-source" href="https://es.wikipedia.org/" target="_blank" rel="noopener noreferrer" hidden></a>
    </div>
    <div class="municipality-sheet-foot">${esc(t("exp.stateFoot"))}</div>`;
  sheet.querySelector(".municipality-sheet-close").addEventListener("click", cerrarFichaMunicipio);
  cargarResenaTerritorial({
    tipo: "state", nombre: p.name,
    respaldo: t("exp.stateFallback").replace("{name}", p.name),
    sourceKey: "exp.moreAboutState",
    token
  });
}

function abrirPanelTrabajos({ kicker, title, sub = "", body, foot = "" }){
  const panel = $("#mapjobs");
  if (!panel) return;
  panel.hidden = false;
  panel.innerHTML = `
    <div class="map-jobs-head">
      <div><span class="map-jobs-kicker">${kicker}</span><h3>${title}</h3>${sub ? `<p class="map-jobs-sub">${sub}</p>` : ""}</div>
      <button class="map-jobs-close" type="button" aria-label="${esc(t("exp.close"))}">×</button>
    </div>
    ${body ? `<div class="map-jobs-body">${body}</div>` : ""}
    ${foot ? `<div class="map-jobs-foot">${foot}</div>` : ""}`;
  panel.querySelector(".map-jobs-close").addEventListener("click", cerrarPanelTrabajos);
  panel.querySelectorAll(".job-card").forEach(jc =>
    accordion(jc, jc.querySelector(".job-h"), jc.querySelector(".job-b")));
  requestAnimationFrame(() => panel.classList.add("on"));
}

function applyFilter(){
  if (!built) return;
  const C = cols();
  meshes.forEach(m => {
    const sel = state.key && norm(m.userData.name) === state.key;
    m.material.color.set(m.userData.jobs ? C.acc : C.base);
    m.material.emissive.set(sel ? C.acc2 : 0x000000);
    m.material.emissiveIntensity = sel ? .5 : 0;
  });
  hl = [];
}
export function resaltarEstado(nombre){
  if (!built) return;
  const C = cols();
  hl.forEach(m => {
    const sel = state.key && norm(m.userData.name) === state.key;
    m.material.emissive.set(sel ? C.acc2 : 0x000000);
    m.material.emissiveIntensity = sel ? .5 : 0;
  });
  hl = nombre ? meshes.filter(m => norm(m.userData.name) === norm(nombre)) : [];
  hl.forEach(m => { m.material.emissive.set(C.acc2); m.material.emissiveIntensity = .35; });
}

function cam(){
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta));
  camera.lookAt(target);
}
function loop(){
  if (!running) return;
  raf = requestAnimationFrame(loop);
  if (camAnim) {
    const u = Math.min(1, (performance.now() - camAnim.t0) / camAnim.dur);
    const e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    target.lerpVectors(camAnim.fT, camAnim.tT, e);
    radius = camAnim.fR + (camAnim.tR - camAnim.fR) * e;
    theta  = camAnim.fTh + (camAnim.tTh - camAnim.fTh) * e;
    phi    = camAnim.fPh + (camAnim.tPh - camAnim.fPh) * e;
    if (u >= 1) { const cb = camAnim.onDone || null; camAnim = null; if (cb) cb(); }
  } else if (!dragging && !touched && !RM) theta += .0016;
  cam();
  renderer.render(scene, camera);
}
function updateRun(){
  const want = inView && docVisible;
  if (want && !running) { running = true; raf = requestAnimationFrame(loop); }
  else if (!want && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
}
function flyTo(t2, r2, dur = 800, th2 = null, ph2 = null, onDone = null){
  touched = true;
  if (RM || !target) {
    if (target) target.copy(t2);
    radius = r2;
    if (th2 != null) theta = th2;
    if (ph2 != null) phi = ph2;
    if (onDone) onDone();
    if (!running) { cam(); renderer.render(scene, camera); }
    return;
  }
  camAnim = {
    t0: performance.now(), dur,
    fT: target.clone(), tT: t2,
    fR: radius, tR: r2,
    fTh: theta, tTh: th2 != null ? th2 : theta,
    fPh: phi,   tPh: ph2 != null ? ph2 : phi,
    onDone
  };
  if (!running) updateRun();
}
export async function volarAEstado(nombre){
  const m = byName(nombre);
  if (!m) return;
  flyTo(m.userData.center.clone(), 26);
  await mostrarMunicipios(m);
}
export async function volarAMunicipio(estadoNombre, municipioNombre){
  const estado = byName(estadoNombre);
  if (!estado) return;
  flyTo(estado.userData.center.clone(), 26, 420);
  await mostrarMunicipios(estado);
  const municipio = muniMeshes.find(m => norm(m.userData.name) === norm(municipioNombre));
  if (!municipio) return;
  resaltarMunicipio(municipio);
  flyTo(municipio.userData.center.clone(), 12, 820);
}
export function zoomIn(){ flyTo(target.clone(), Math.max(MIN_RADIUS, radius * .7), 260); }
export function zoomOut(){ flyTo(target.clone(), Math.min(190, radius * 1.28), 260); }
export function resetView(){ flyTo(new THREE.Vector3(0, 0, 0), DEF.radius, 800, DEF.theta, DEF.phi, () => { touched = false; }); }

function resize(){
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  if (!running) { cam(); renderer.render(scene, camera); }
}

function pick(e){
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects([...muniMeshes, ...meshes], false)[0];
  return hit ? hit.object : null;
}
function setHover(m, e){
  if (hovered !== m) {
    if (hovered) {
      const C = cols();
      if (hovered.userData.municipio) pintarMunicipio(hovered);
      else hovered.material.color.set(hovered.userData.jobs ? C.acc : C.base);
    }
    hovered = m;
    if (m) {
      const C = cols();
      m.material.color.set(m.userData.municipio ? C.munHighlightEdge : C.acc2);
      precargarResenaEstado(m);
    }
  }
  if (m) showTip(e, m.userData.municipio ? `${m.userData.name} · ${t("exp.municipality")}` : (m.userData.jobs ? `${m.userData.name} · ${t("exp.click")}` : m.userData.name));
  else hideTip();
}
function showTip(e, txt){
  const r = mapview.getBoundingClientRect();
  tip.textContent = txt; tip.classList.add("on");
  tip.style.left = Math.min(r.width - 10, (e.clientX - r.left) + 14) + "px";
  tip.style.top = Math.max(0, (e.clientY - r.top) - 30) + "px";
}
const hideTip = () => tip.classList.remove("on");

function abrirTrabajosExperiencia({ nombre, jobs, kicker, sub, foot }){
  const muns = {};
  jobs.forEach(e => { (muns[e.ciudad] || (muns[e.ciudad] = [])).push(e); });
  const keys = Object.keys(muns);

  const card = e => `
    <div class="job-card">
      <div class="job-h"><div><h4>${esc(loc(e.puesto))}</h4><p>${esc(loc(e.empresa))}${e.sigla ? ` (${esc(e.sigla)})` : ""}</p></div><span class="xchev">▾</span></div>
      <div class="job-b"><div class="job-b-in">
        <p class="xloc">⌖ ${esc(e.ciudad)}, ${esc(e.estado)} · ${fmtYM(e.inicio)} — ${fmtYM(e.fin)} · ${esc(loc(e.dur))}</p>
        <ul>${loc(e.logros).map(l => `<li>${esc(l)}</li>`).join("")}</ul>
        <div class="chips">${loc(e.tools).map(x => `<span class="chip">${esc(x)}</span>`).join("")}</div>
      </div></div>
    </div>`;

  const body = `<div class="jobs-list">` + (keys.length
    ? keys.map(mun => `
      <div class="mun-block">
        <p class="mun-title">⌖ ${esc(mun)} <span>${muns[mun].length} ${t("exp.jobs1")}</span></p>
        ${muns[mun].map(card).join("")}
      </div>`).join("")
    : `<p class="no-results">${t("exp.nomatch")}</p>`) + `</div>`;

  abrirPanelTrabajos({
    kicker: esc(kicker),
    title: esc(nombre),
    sub,
    body,
    foot
  });
}

function abrirTrabajosEstado(st){
  const nombre = String(st.n || st.name || "").trim();
  const jobs = trabajosDeEstado(nombre);
  const municipios = new Set(jobs.map(e => norm(e.ciudad))).size;
  abrirTrabajosExperiencia({
    nombre: `${nombre}, ${t("exp.paisname")}`,
    jobs,
    kicker: t("exp.workState"),
    sub: `${jobs.length} ${t("exp.jobs1")} · ${municipios} ${t("exp.mun")}`,
    foot: `${t("exp.detail")} · ${nombre}`
  });
}

function abrirTrabajosMunicipio(estado, municipio){
  const jobs = trabajosDeMunicipio(estado, municipio);
  abrirTrabajosExperiencia({
    nombre: `${municipio}, ${estado}`,
    jobs,
    kicker: t("exp.workMunicipality"),
    sub: `${jobs.length} ${t("exp.jobs1")}`,
    foot: `${t("exp.detail")} · ${municipio}`
  });
}

function abrirMunicipio(m){
  const p = m.userData;
  const estado = muniState?.userData?.name || "México";
  const sheet = $("#municipalitysheet");
  if (!sheet) return;
  const jobs = trabajosDeMunicipio(estado, p.name);
  cerrarPanelTrabajos();
  activeTerritorialSheet = { tipo: "municipality", mesh: m };
  const token = ++municipalitySheetToken;
  sheet.hidden = false;
  if (jobs.length) {
    sheet.innerHTML = `
      <div class="municipality-sheet-head sheet-experience-head">
        <div><span class="municipality-sheet-kicker">${esc(t("exp.workMunicipality"))} · ${esc(estado)}</span><h3>${esc(p.name)}</h3></div>
        <button class="municipality-sheet-close" type="button" aria-label="${esc(t("exp.close"))}">×</button>
      </div>
      <div class="municipality-sheet-body sheet-experience-body">
        ${resumenExperienciaEnFicha(jobs, { tipo: t("exp.municipality"), estado })}
      </div>
      <div class="municipality-sheet-foot">${esc(t("exp.inegi"))} · ${esc(t("exp.mgEdition"))}</div>`;
    sheet.querySelector(".municipality-sheet-close").addEventListener("click", cerrarFichaMunicipio);
    sheet.querySelector(".sheet-experience-cta").addEventListener("click", () => enfocarDetalleExperiencia(estado, p.name));
    return;
  }
  sheet.innerHTML = `
    <div class="municipality-sheet-head">
      <div><span class="municipality-sheet-kicker">${esc(t("exp.municipalityInfo"))} · ${esc(estado)}</span><h3>${esc(p.name)}</h3></div>
      <button class="municipality-sheet-close" type="button" aria-label="${esc(t("exp.close"))}">×</button>
    </div>
    <div class="municipality-sheet-body">
      <p class="municipality-sheet-key"><span>${esc(t("exp.agemKey"))}</span><b>${esc(p.cveGeo || p.cveMun)}</b></p>
      <div class="municipality-sheet-codes" aria-label="${esc(t("exp.officialCodes"))}">
        <span>${esc(t("exp.entityKey"))}<b>${esc(p.cveEnt)}</b></span>
        <span>${esc(t("exp.municipalKey"))}<b>${esc(p.cveMun)}</b></span>
      </div>
      <p class="municipality-sheet-framework">${esc(t("exp.mgEdition"))}<span>${esc(t("exp.mgCut"))}</span></p>
      <a class="municipality-sheet-territorial-source" href="https://www.inegi.org.mx/app/ageeml/" target="_blank" rel="noopener noreferrer">${esc(t("exp.officialInegi"))}</a>
      <p class="municipality-sheet-description">${esc(t("exp.loadingSummary"))}</p>
      <a class="municipality-sheet-source municipality-sheet-editorial-source" href="https://es.wikipedia.org/" target="_blank" rel="noopener noreferrer" hidden></a>
    </div>
    <div class="municipality-sheet-foot">${esc(t("exp.municipalityFoot"))}</div>`;
  sheet.querySelector(".municipality-sheet-close").addEventListener("click", cerrarFichaMunicipio);
  cargarResenaMunicipio({ nombre: p.name, estado, token });
}

export async function initMapa(){
  host = $("#glview"); tip = $("#maptip"); mapview = $("#mapview"); mapnotice = $("#mapnotice");
  target = new THREE.Vector3(0, 0, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, .1, 600);
  scene.add(new THREE.AmbientLight(0xffffff, .8));
  const dl = new THREE.DirectionalLight(0xffffff, .9);
  dl.position.set(40, 60, 30); scene.add(dl);
  ray = new THREE.Raycaster(); ptr = new THREE.Vector2();

  try { await cargarEstados(); }
  catch (err) { console.warn("[mapa] Se usa la geometría de respaldo", err); }
  build();
  addEventListener("jv:lang", () => {
    const active = activeTerritorialSheet;
    if (!active) return;
    if (active.tipo === "state") abrirEstado(active.mesh);
    else abrirMunicipio(active.mesh);
  });

  const el = renderer.domElement;
  el.addEventListener("pointerdown", e => {
    e.preventDefault(); dragging = true; touched = true; camAnim = null;
    moved = 0; lx = e.clientX; ly = e.clientY;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
  });
  el.addEventListener("pointermove", e => {
    if (dragging) {
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      theta -= dx * .005;
      phi = Math.min(1.25, Math.max(.25, phi - dy * .004));
      lx = e.clientX; ly = e.clientY;
      setHover(null);
      if (!running) { cam(); renderer.render(scene, camera); }
    } else setHover(pick(e), e);
  });
  el.addEventListener("pointerup", async e => {
    if (!dragging) return;
    dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    if (moved < 5) {
      const m = pick(e);
      if (!m) return;
      if (m.userData.municipio) { resaltarMunicipio(m); abrirMunicipio(m); return; }
      abrirEstado(m);
      flyTo(m.userData.center.clone(), 36, 700);
      await mostrarMunicipios(m, { mantenerFicha: true });
      if (m.userData.jobs) setFiltro("México", m.userData.name);
    }
  });
  el.addEventListener("pointercancel", () => { dragging = false; });
  el.addEventListener("pointerleave", () => setHover(null));
  el.addEventListener("wheel", e => {
    e.preventDefault(); touched = true; camAnim = null;
    radius = Math.min(190, Math.max(MIN_RADIUS, radius * (e.deltaY < 0 ? .84 : 1.12)));
    if (!running) { cam(); renderer.render(scene, camera); }
  }, { passive: false });
  el.addEventListener("contextmenu", e => e.preventDefault());

  const bIn = $("#zin"), bOut = $("#zout"), bRes = $("#zreset"), bWork = $("#mapworkbtn");
  if (bIn)  bIn.addEventListener("click", () => zoomIn());
  if (bOut) bOut.addEventListener("click", () => zoomOut());
  if (bRes) bRes.addEventListener("click", () => { cerrarPanelTrabajos(); limpiarMunicipios(); resetView(); statusListo(); });
  if (bWork) bWork.addEventListener("click", () => {
    if (!muniState?.userData?.jobs) return;
    if (trabajosLateralesAbiertos()) {
      cerrarTrabajosLateral();
      actualizarBotonTrabajos(muniState);
      return;
    }
    enfocarDetalleExperiencia(muniState.userData.name);
  });

  onFiltro(() => {
    applyFilter();
    if (state.selEstado) {
      const m = byName(state.selEstado);
      if (m) { flyTo(m.userData.center.clone(), 26); mostrarMunicipios(m); }
    }
    else flyTo(new THREE.Vector3(0, 0, 0), DEF.radius, 800, DEF.theta, DEF.phi);
    if (!running) { cam(); renderer.render(scene, camera); }
  });

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(es => { inView = es[0].isIntersecting; updateRun(); }, { threshold: 0 }).observe(mapview);
  document.addEventListener("visibilitychange", () => { docVisible = !document.hidden; updateRun(); });
  addEventListener("jv:theme", () => { applyFilter(); actualizarEstiloMunicipios(); if (!running) { cam(); renderer.render(scene, camera); } });
  addEventListener("jv:lang", () => { actualizarBotonTrabajos(muniState); if (built) statusListo(); });

  resize();
  updateRun();
  statusListo();
}

