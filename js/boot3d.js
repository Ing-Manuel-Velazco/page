/* ============================================================
   js/boot3d.js — Cinemática 3D del boot
   México extruido + partículas + barrido de escaneo + fix GNSS
   + salida en picado (dive) + bloom con auto-ajuste de calidad.
============================================================ */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { norm } from "./core.js";
import { EXPERIENCIAS } from "./data.js";
import { construir } from "./geo3d.js";

const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function crearBoot3D(host, { onDive } = {}){
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (_) { return null; }
  host.appendChild(renderer.domElement);

  const css = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  const C = { acc: css("--acc") || "#3B82F6", acc2: css("--acc2") || "#06B6D4", bg: css("--bg") || "#0A0E27" };

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color(C.bg).getHex(), .012);
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 800);
  scene.add(new THREE.AmbientLight(0xffffff, .55));
  const dl = new THREE.DirectionalLight(0xffffff, .85); dl.position.set(30, 60, 20); scene.add(dl);

  /* terreno: estados con trabajos extruidos y emisivos */
  const jobs = new Set(EXPERIENCIAS.map(e => norm(e.estado)));
  const b = construir(THREE, {
    jobs, edges: true, edgeColor: C.acc2,
    depth: isJ => isJ ? 3.6 : 1.5,
    mat: isJ => isJ
      ? new THREE.MeshStandardMaterial({ color: C.acc, emissive: C.acc, emissiveIntensity: .5, roughness: .4, metalness: .2, transparent: true, opacity: .96 })
      : new THREE.MeshStandardMaterial({ color: C.bg, emissive: C.acc, emissiveIntensity: .1, roughness: .6, metalness: .25, transparent: true, opacity: .62 })
  });
  scene.add(b.group);
  const L = b.L;

  /* partículas ambientales */
  const N = 520, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - .5) * L.w;
    pos[i * 3 + 1] = Math.random() * 9;
    pos[i * 3 + 2] = (Math.random() - .5) * L.h;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(pgeo, new THREE.PointsMaterial({
    color: C.acc2, size: .32, transparent: true, opacity: .65,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(points);

  /* barra de escaneo */
  const scan = new THREE.Mesh(new THREE.BoxGeometry(1.1, .06, L.h * 1.05),
    new THREE.MeshBasicMaterial({ color: C.acc2, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
  scan.position.set(-L.w / 2, 2.6, 0); scan.visible = false; scene.add(scan);

  /* pulsos GNSS sobre estados con trabajos */
  const pulses = b.meshes.filter(m => m.userData.jobs).map(m => {
    const r = new THREE.Mesh(new THREE.RingGeometry(1, 1.18, 48),
      new THREE.MeshBasicMaterial({ color: C.acc2, transparent: true, opacity: .9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    r.rotation.x = -Math.PI / 2;
    r.position.copy(m.userData.center); r.position.y = 3.8;
    scene.add(r); return r;
  });

  /* composer + bloom */
  let composer = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), .85, .55, .22));
  } catch (_) { composer = null; }

  let pr = Math.min(devicePixelRatio, 1.75);
  function resize(){
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) composer.setSize(w, h);
  }
  resize(); addEventListener("resize", resize);

  const target = new THREE.Vector3(0, 1, 0);
  const job0 = b.meshes.find(m => m.userData.jobs);
  const diveDest = job0 ? job0.userData.center.clone() : new THREE.Vector3(0, 0, 0);
  let diveFrom = null;

  const CINEMA = 2300, DIVE = 560;
  let raf = null, aborted = false, onDone = null;
  let t0 = 0, prev = 0, frames = 0, slow = 0, degraded = false;

  function camCinema(u){
    const e = ease(u);
    const radius = lerp(125, 48, e);
    const phi = lerp(.42, 1.02, ease(Math.min(1, u * 1.12)));
    const theta = lerp(-1.0, .55, u) + Math.sin(u * Math.PI) * .18;
    const tx = u > .62 ? lerp(-L.w * .28, L.w * .28, (u - .62) / .38) : 0;
    target.set(tx, 1, 0);
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(target);
    const su = (u - .5) / .45;
    if (su > 0 && su < 1) { scan.visible = true; scan.position.x = lerp(-L.w / 2, L.w / 2, ease(su)); scan.material.opacity = .9 * Math.sin(su * Math.PI); }
    else scan.visible = false;
  }
  function camDive(v){
    if (!diveFrom) diveFrom = { r: 48, phi: 1.02, theta: .55, t: target.clone() };
    const e = ease(v);
    const radius = lerp(diveFrom.r, 3.2, e);
    const phi = lerp(diveFrom.phi, 1.32, e);
    const th = lerp(diveFrom.theta, .35, e);
    target.lerpVectors(diveFrom.t, diveDest, e);
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(th),
      Math.max(.6, radius * Math.cos(phi)),
      target.z + radius * Math.sin(phi) * Math.cos(th));
    camera.lookAt(target.x, 0, target.z);
  }
  const render = () => { composer ? composer.render() : renderer.render(scene, camera); };

  function frame(now){
    if (aborted) return;
    raf = requestAnimationFrame(frame);
    const dt = now - prev; prev = now;
    /* auto-ajuste: si FPS bajo → sin bloom, pixelRatio 1, sin partículas */
    if (!degraded && frames < 50) {
      frames++; if (dt > 28) slow++;
      if (frames === 50 && slow > 18) { degraded = true; composer = null; pr = 1; points.visible = false; resize(); }
    }
    const t = now - t0;
    if (t <= CINEMA) camCinema(t / CINEMA);
    else {
      if (!diveFrom) onDive && onDive();
      const v = Math.min(1, (t - CINEMA) / DIVE);
      camDive(v);
      if (v >= 1) { const cb = onDone; stop(); cb && cb(); return; }
    }
    const pu = (t % 1400) / 1400;
    pulses.forEach(r => { const s = 1 + pu * 2.6; r.scale.set(s, s, s); r.material.opacity = .85 * (1 - pu); });
    points.rotation.y = t * .00003;
    render();
  }

  function play(cb){
    onDone = cb; t0 = performance.now(); prev = t0;
    raf = requestAnimationFrame(frame);
  }
  function stop(){
    aborted = true;
    if (raf) cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    renderer.dispose();
    host.innerHTML = "";
  }
  return { play, stop };
}