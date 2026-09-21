/* ============================================================
   js/geo3d.js — Constructor 3D compartido (boot + mapa 02)
   Proyecta MAPA_ESTADOS al plano mundo y extrude mallas.
============================================================ */
import * as THREE from "three";
import { norm } from "./core.js";

export const getMapa = () => (window.MAPA_ESTADOS || window.MEXICO_ESTADOS) || [];
const PL = (lon, lat) => [(lon + 180) * 2.7778, (90 - lat) * 2.7778];

function anillosGeoJSON(geometria){
  if (!geometria) return [];
  // Solo se usan los anillos exteriores. Los interiores son huecos del
  // polígono, no territorios independientes que deban extruirse.
  if (geometria.type === "Polygon") return [geometria.coordinates[0]].filter(Boolean);
  if (geometria.type === "MultiPolygon") return geometria.coordinates.map(p => p[0]).filter(Boolean);
  return [];
}

export function desdeGeoJSON(datos){
  return (datos.features || []).map(f => {
    const p = f.properties || {};
    return {
      n: p.NOMGEO || p.nombre || "Sin nombre",
      cveEnt: String(p.CVE_ENT || "").padStart(2, "0"),
      cveMun: String(p.CVE_MUN || "").padStart(3, "0"),
      cveGeo: String(p.CVEGEO || ""),
      g: anillosGeoJSON(f.geometry)
    };
  }).filter(f => f.g.length);
}

export async function cargarEstados(url = "geo/estados.geojson"){
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  window.MAPA_ESTADOS = desdeGeoJSON(await res.json());
  return window.MAPA_ESTADOS;
}

/* La carta usa la masa territorial principal. Así se evita que los polígonos
   insulares alejados alteren el encuadre y la lectura de los municipios. */
function anilloPrincipal(anillos){
  let mejor = null, mejorArea = -1;
  anillos.forEach(anillo => {
    if (anillo.length < 3) return;
    let minLon = 1e9, minLat = 1e9, maxLon = -1e9, maxLat = -1e9;
    anillo.forEach(([lon, lat]) => {
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    });
    const ancho = maxLon - minLon, alto = maxLat - minLat;
    if (ancho < .02 || alto < .02) return;
    const areaCaja = ancho * alto;
    if (areaCaja > mejorArea) { mejor = anillo; mejorArea = areaCaja; }
  });
  return mejor;
}

/* Layout global: centro + escala del plano */
export function layout(datos = getMapa()){
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  datos.forEach(s => {
    const r = anilloPrincipal(s.g); if (!r) return;
    r.forEach(([lon, lat]) => {
      const [x, y] = PL(lon, lat);
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    });
  });
  return { cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, K: .7,
           w: (maxx - minx) * .7, h: (maxy - miny) * .7 };
}

/* Construye mallas extruidas por anillo.
   opts: jobs(Set norm), depth(isJ)=>n, mat(isJ)=>Material, yOffset, edges, edgeColor */
export function construir(THREEx, opts = {}){
  const T = THREEx || THREE;
  const datos = opts.datos || getMapa();
  const L = opts.layout || layout(datos);
  const group = new T.Group(); const meshes = [];
  datos.forEach(s => {
    const name = s.n.trim();
    const isJ = opts.jobs ? opts.jobs.has(norm(name)) : false;
    const fuente = anilloPrincipal(s.g); if (!fuente) return;
    const ring = fuente.map(([lon, lat]) => {
      const [x, y] = PL(lon, lat);
      return [(x - L.cx) * L.K, (y - L.cy) * L.K];
    });
    let wx0 = 1e9, wz0 = 1e9, wx1 = -1e9, wz1 = -1e9;
    ring.forEach(([wx, wz]) => {
      wx0 = Math.min(wx0, wx); wx1 = Math.max(wx1, wx);
      wz0 = Math.min(wz0, wz); wz1 = Math.max(wz1, wz);
    });
    const datosMalla = {
      name, jobs: isJ, cveEnt: s.cveEnt || "", cveMun: s.cveMun || "", cveGeo: s.cveGeo || "",
      center: new T.Vector3((wx0 + wx1) / 2, (opts.yOffset || 0) + 1.2, (wz0 + wz1) / 2)
    };
    const shape = new T.Shape(ring.map(([wx, wz]) => new T.Vector2(wx, -wz)));
    const geo = new T.ExtrudeGeometry(shape, { depth: opts.depth ? opts.depth(isJ) : 1.5, bevelEnabled: false });
    const m = new T.Mesh(geo, opts.mat ? opts.mat(isJ) : new T.MeshStandardMaterial({ color: 0x3B82F6 }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = opts.yOffset || 0;
    if (opts.edges) {
      m.add(new T.LineSegments(new T.EdgesGeometry(geo),
        new T.LineBasicMaterial({ color: opts.edgeColor || 0x06B6D4, transparent: true, opacity: opts.edgeOpacity ?? .35 })));
    }
    m.userData = datosMalla;
    group.add(m); meshes.push(m);
  });
  return { group, meshes, L };
}
