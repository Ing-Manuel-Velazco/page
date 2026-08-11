/* ============================================================
   js/mapa.js — Sección 02: vista 3D por defecto (sin 2D)
   FIX: el modal de estado recibía userData.name y leía st.n →
   nunca mostraba trabajos. Ahora se unifica la forma del objeto.
============================================================ */
import * as THREE from "three";
import { $, norm, esc, accordion, RM } from "./core.js";
import { t, loc, fmtYM } from "./i18n.js";
import { EXPERIENCIAS } from "./data.js";
import { state, setFiltro, onFiltro } from "./state.js";
import { construir } from "./geo3d.js";
import { openModal } from "./core.js";

let renderer, scene, camera, ray, ptr, host, tip, mapview, mapstatus, target = null;
let meshes = [], group = null, hovered = null, hl = null, camAnim = null;
let theta = .65, phi = .95, radius = 95;
let dragging = false, lx = 0, ly = 0, moved = 0, touched = false;
let raf = null, built = false, GBcount = 0;

const cols = () => {
  const g = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  return { base: g("--bg2"), acc: g("--acc"), acc2: g("--acc2") };
};
const byName = n => meshes.find(m => norm(m.userData.name) === norm(n));

function statusListo(){
  mapstatus.textContent = `${t("exp.autofit")} · ${GBcount} ${t("exp.geoms")} · ${t("exp.zoomhint")}`;
}

function build(){
  const jobs = new Set(EXPERIENCIAS.map(e => norm(e.estado)));
  const C = cols();
  const b = construir(THREE, {
    jobs,
    depth: isJ => isJ ? 3.4 : 1.4,
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

function applyFilter(){
  if (!built) return;
  const C = cols();
  meshes.forEach(m => {
    const sel = state.key && norm(m.userData.name) === state.key;
    m.material.color.set(m.userData.jobs ? C.acc : C.base);
    m.material.emissive.set(sel ? C.acc2 : 0x000000);
    m.material.emissiveIntensity = sel ? .5 : 0;
  });
  hl = null;
}
export function resaltarEstado(nombre){
  if (!built) return;
  const C = cols();
  if (hl) {
    const sel = state.key && norm(hl.userData.name) === state.key;
    hl.material.emissive.set(sel ? C.acc2 : 0x000000);
    hl.material.emissiveIntensity = sel ? .5 : 0;
  }
  hl = nombre ? (byName(nombre) || null) : null;
  if (hl) { hl.material.emissive.set(C.acc2); hl.material.emissiveIntensity = .35; }
}

function cam(){
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta));
  camera.lookAt(target);
}
function loop(){
  raf = requestAnimationFrame(loop);
  if (camAnim) {
    const u = Math.min(1, (performance.now() - camAnim.t0) / camAnim.dur), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    target.lerpVectors(camAnim.fT, camAnim.tT, e);
    radius = camAnim.fR + (camAnim.tR - camAnim.fR) * e;
    if (u >= 1) camAnim = null;
  } else if (!dragging && !touched && !RM) theta += .0016;
  cam();
  renderer.render(scene, camera);
}
function flyTo(t2, r2, dur = 800){
  touched = true;
  if (RM || !target) { if (target) target.copy(t2); radius = r2; return; }
  camAnim = { t0: performance.now(), dur, fT: target.clone(), tT: t2, fR: radius, tR: r2 };
}
export function volarAEstado(nombre){
  const m = byName(nombre);
  if (m) flyTo(m.userData.center.clone(), 26);
}
export function zoomIn(){ touched = true; camAnim = null; radius = Math.max(18, radius * .8); }
export function zoomOut(){ touched = true; camAnim = null; radius = Math.min(190, radius * 1.25); }
export function resetView(){ flyTo(new THREE.Vector3(0, 0, 0), 95); }

function resize(){
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

function pick(e){
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(meshes, false)[0];
  return hit ? hit.object : null;
}
function setHover(m, e){
  if (hovered !== m) {
    if (hovered) { const C = cols(); hovered.material.color.set(hovered.userData.jobs ? C.acc : C.base); }
    hovered = m;
    if (m) m.material.color.set(cols().acc2);
  }
  if (m) showTip(e, m.userData.jobs ? `${m.userData.name} · ${t("exp.click")}` : m.userData.name);
  else hideTip();
}
function showTip(e, txt){
  const r = mapview.getBoundingClientRect();
  tip.textContent = txt; tip.classList.add("on");
  tip.style.left = Math.min(r.width - 10, (e.clientX - r.left) + 14) + "px";
  tip.style.top = Math.max(0, (e.clientY - r.top) - 30) + "px";
}
const hideTip = () => tip.classList.remove("on");

/* ---------- modal: trabajos del estado agrupados por municipio ---------- */
function openStateModal(st){
  /* FIX: tolera ambas formas ({n} del mapa o {name} de userData) */
  const nombre = String(st.n || st.name || "").trim();
  const jobs = EXPERIENCIAS.filter(e => norm(e.estado) === norm(nombre));
  const muns = {};
  jobs.forEach(e => { (muns[e.ciudad] || (muns[e.ciudad] = [])).push(e); });
  const keys = Object.keys(muns);

  const head = `<span class="modal-badge">${t("exp.estado")}</span><h3>${esc(nombre)}, ${esc(t("exp.paisname"))}</h3>
    <span class="iss">${jobs.length} ${t("exp.jobs1")} · ${keys.length} ${t("exp.mun")}</span>`;

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

  const foot = `${t("exp.detail")} · ${esc(nombre)}`;
  const box = openModal(head, body, foot);
  box.querySelectorAll(".job-card").forEach(jc =>
    accordion(jc, jc.querySelector(".job-h"), jc.querySelector(".job-b")));
}

export function initMapa(){
  host = $("#glview"); tip = $("#maptip"); mapview = $("#mapview"); mapstatus = $("#mapstatus");
  target = new THREE.Vector3(0, 0, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, .1, 600);
  scene.add(new THREE.AmbientLight(0xffffff, .8));
  const dl = new THREE.DirectionalLight(0xffffff, .9);
  dl.position.set(40, 60, 30); scene.add(dl);
  ray = new THREE.Raycaster(); ptr = new THREE.Vector2();

  build();

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
    } else setHover(pick(e), e);
  });
  el.addEventListener("pointerup", e => {
    if (!dragging) return;
    dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    if (moved < 5) {
      const m = pick(e);
      if (m && m.userData.jobs) {
        setFiltro("México", m.userData.name);
        openStateModal({ n: m.userData.name });   /* FIX: forma {n} */
      }
    }
  });
  el.addEventListener("pointercancel", () => { dragging = false; });
  el.addEventListener("pointerleave", () => setHover(null));
  el.addEventListener("wheel", e => {
    e.preventDefault(); touched = true; camAnim = null;
    radius = Math.min(190, Math.max(18, radius * (e.deltaY < 0 ? .9 : 1.1)));
  }, { passive: false });
  el.addEventListener("contextmenu", e => e.preventDefault());

  new ResizeObserver(resize).observe(host);
  addEventListener("jv:theme", applyFilter);
  addEventListener("jv:lang", () => { if (built) statusListo(); });

  onFiltro(() => {
    applyFilter();
    if (state.selEstado) { const m = byName(state.selEstado); if (m) flyTo(m.userData.center.clone(), 26); }
    else flyTo(new THREE.Vector3(0, 0, 0), 95);
  });

  resize();
  loop();
  statusListo();
}