/* ============================================================
   js/mapa3d.js — Carta 3D de México (Three.js) · vista única
   Extrusión de los 32 estados; estados con trabajos más altos.
   Arrastrar=rotar · rueda=zoom · hover=tooltip · clic=modal.
   Cámara con foco animado por estado y reset al encuadre general.
   ============================================================ */
import * as THREE from "three";
import { $, norm, RM } from "./core.js";
import { EXPERIENCIAS } from "./data.js";
import { state, onFiltro } from "./state.js";

const MAPA_ESTADOS = (window.MAPA_ESTADOS || window.MEXICO_ESTADOS) || [];
const P = (lon, lat) => [(lon + 180) * 2.7778, (90 - lat) * 2.7778];
const DEF = { theta: .65, phi: .95, radius: 95 };

let renderer, scene, camera, ray, ptr, host, tip, mapview, target = null;
let meshes = [], hovered = null, hl = null, camAnim = null;
let theta = DEF.theta, phi = DEF.phi, radius = DEF.radius;
let dragging = false, lx = 0, ly = 0, moved = 0, touched = false;
let raf = null, built = false;

const cols = () => {
  const g = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  return { base: g("--bg2"), acc: g("--acc"), acc2: g("--acc2") };
};
const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const byName = n => meshes.find(m => norm(m.userData.name) === norm(n));

/* ---------- tooltip ---------- */
function showTip(e, txt){
  const r = mapview.getBoundingClientRect();
  tip.textContent = txt; tip.classList.add("on");
  tip.style.left = Math.min(r.width - 10, (e.clientX - r.left) + 14) + "px";
  tip.style.top = Math.max(0, (e.clientY - r.top) - 30) + "px";
}
const hideTip = () => tip.classList.remove("on");

/* ---------- cámara ---------- */
function flyTo(t2, r2, dur = 800){
  touched = true;
  if (RM || !target) { if (target) target.copy(t2); radius = r2; return; }
  camAnim = { t0: performance.now(), dur, fT: target.clone(), tT: t2, fR: radius, tR: r2 };
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
    const u = Math.min(1, (performance.now() - camAnim.t0) / camAnim.dur), e = ease(u);
    target.lerpVectors(camAnim.fT, camAnim.tT, e);
    radius = camAnim.fR + (camAnim.tR - camAnim.fR) * e;
    if (u >= 1) camAnim = null;
  } else if (!dragging && !touched && !RM) theta += .0016;
  cam();
  renderer.render(scene, camera);
}
function resize(){
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

/* ---------- geometría extruida ---------- */
function build(){
  const jobs = new Set(EXPERIENCIAS.map(e => norm(e.estado)));
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  const states = [];
  MAPA_ESTADOS.forEach(s => {
    let bestA = -1, cen = null; const rings = [];
    s.g.forEach(r => {
      if (r.length < 3) return;
      let bx = 1e9, by = 1e9, bX = -1e9, bY = -1e9;
      r.forEach(([lon, lat]) => {
        const [x, y] = P(lon, lat);
        if (x < bx) bx = x; if (x > bX) bX = x;
        if (y < by) by = y; if (y > bY) bY = y;
      });
      if ((bX - bx) < .02 && (bY - by) < .02) return; /* descarta islotes mínimos */
      rings.push(r);
      const a = (bX - bx) * (bY - by);
      if (a > bestA) { bestA = a; cen = [(bx + bX) / 2, (by + bY) / 2]; }
      if (bx < minx) minx = bx; if (bX > maxx) maxx = bX;
      if (by < miny) miny = by; if (bY > maxy) maxy = bY;
    });
    if (rings.length) states.push({ s, rings, cen, isJ: jobs.has(norm(s.n)) });
  });
  const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, K = .7;
  const C = cols();
  states.forEach(({ s, rings, cen, isJ }) => {
    const center = new THREE.Vector3((cen[0] - cx) * K, 1.2, -(cen[1] - cy) * K);
    rings.forEach(r => {
      const shape = new THREE.Shape(r.map(([lon, lat]) => {
        const [x, y] = P(lon, lat);
        return new THREE.Vector2((x - cx) * K, (cy - y) * K);
      }));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: isJ ? 3.4 : 1.4, bevelEnabled: false });
      const mat = new THREE.MeshStandardMaterial({
        color: isJ ? C.acc : C.base, roughness: .55, metalness: .18,
        transparent: true, opacity: isJ ? .97 : .88
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.userData = { name: s.n.trim(), jobs: isJ, center };
      scene.add(mesh); meshes.push(mesh);
    });
  });
  built = true;
  applyFilter();
}

/* ---------- resaltado por filtro / hover / timeline ---------- */
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

/* ---------- API de cámara expuesta a mapa.js ---------- */
export function volarAEstado(nombre){
  const m = byName(nombre);
  if (m) flyTo(m.userData.center.clone(), 26);
}
export function zoomIn(){ touched = true; camAnim = null; radius = Math.max(18, radius * .8); }
export function zoomOut(){ touched = true; camAnim = null; radius = Math.min(190, radius * 1.25); }
export function resetView(){ flyTo(new THREE.Vector3(0, 0, 0), DEF.radius); }

/* ---------- interacción ---------- */
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
  if (m) showTip(e, m.userData.jobs ? `${m.userData.name} · clic para ver trabajos` : m.userData.name);
  else hideTip();
}

export function initGL(){
  host = $("#glview"); tip = $("#maptip"); mapview = $("#mapview");
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
      /* solo abre modal si el estado tiene trabajos registrados */
      if (m && m.userData.jobs) dispatchEvent(new CustomEvent("jv:estado", { detail: m.userData.name }));
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

  /* filtro ↔ cámara: vuela al estado filtrado; al limpiar, encuadre general */
  onFiltro(() => {
    applyFilter();
    if (state.selEstado) { const m = byName(state.selEstado); if (m) flyTo(m.userData.center.clone(), 26); }
    else flyTo(new THREE.Vector3(0, 0, 0), DEF.radius);
  });

  resize();
  loop();
}