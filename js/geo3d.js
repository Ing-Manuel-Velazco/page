/* ============================================================
   js/geo3d.js — Constructor 3D compartido (boot + mapa 02)
   Proyecta MAPA_ESTADOS al plano mundo y extrude mallas.
============================================================ */
import * as THREE from "three";
import { norm } from "./core.js";

export const getMapa = () => (window.MAPA_ESTADOS || window.MEXICO_ESTADOS) || [];
const PL = (lon, lat) => [(lon + 180) * 2.7778, (90 - lat) * 2.7778];

/* Layout global: centro + escala del plano */
export function layout(){
  let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
  getMapa().forEach(s => s.g.forEach(r => {
    if (r.length < 3) return;
    let bx = 1e9, by = 1e9, bX = -1e9, bY = -1e9;
    r.forEach(([lon, lat]) => {
      const [x, y] = PL(lon, lat);
      if (x < bx) bx = x; if (x > bX) bX = x;
      if (y < by) by = y; if (y > bY) bY = y;
    });
    if ((bX - bx) < .02 && (bY - by) < .02) return;
    if (bx < minx) minx = bx; if (bX > maxx) maxx = bX;
    if (by < miny) miny = by; if (bY > maxy) maxy = bY;
  }));
  return { cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, K: .7,
           w: (maxx - minx) * .7, h: (maxy - miny) * .7 };
}

/* Construye mallas extruidas por anillo.
   opts: jobs(Set norm), depth(isJ)=>n, mat(isJ)=>Material, edges, edgeColor */
export function construir(THREEx, opts = {}){
  const T = THREEx || THREE;
  const L = layout();
  const group = new T.Group(); const meshes = [];
  getMapa().forEach(s => {
    const name = s.n.trim();
    const isJ = opts.jobs ? opts.jobs.has(norm(name)) : false;
    let bestA = -1, cen = [0, 0]; const rings = [];
    s.g.forEach(r => {
      if (r.length < 3) return;
      let dx0 = 1e9, dy0 = 1e9, dx1 = -1e9, dy1 = -1e9;
      r.forEach(([lon, lat]) => {
        if (lon < dx0) dx0 = lon; if (lon > dx1) dx1 = lon;
        if (lat < dy0) dy0 = lat; if (lat > dy1) dy1 = lat;
      });
      if ((dx1 - dx0) < .02 && (dy1 - dy0) < .02) return;
      const ring = r.map(([lon, lat]) => {
        const [x, y] = PL(lon, lat);
        return [(x - L.cx) * L.K, (y - L.cy) * L.K];
      });
      let wx0 = 1e9, wz0 = 1e9, wx1 = -1e9, wz1 = -1e9;
      ring.forEach(([wx, wz]) => {
        if (wx < wx0) wx0 = wx; if (wx > wx1) wx1 = wx;
        if (wz < wz0) wz0 = wz; if (wz > wz1) wz1 = wz;
      });
      const a = (wx1 - wx0) * (wz1 - wz0);
      if (a > bestA) { bestA = a; cen = [(wx0 + wx1) / 2, (wz0 + wz1) / 2]; }
      rings.push(ring);
    });
    rings.forEach(ring => {
      const shape = new T.Shape(ring.map(([wx, wz]) => new T.Vector2(wx, -wz)));
      const geo = new T.ExtrudeGeometry(shape, { depth: opts.depth ? opts.depth(isJ) : 1.5, bevelEnabled: false });
      const m = new T.Mesh(geo, opts.mat ? opts.mat(isJ) : new T.MeshStandardMaterial({ color: 0x3B82F6 }));
      m.rotation.x = -Math.PI / 2;
      if (opts.edges) {
        m.add(new T.LineSegments(new T.EdgesGeometry(geo),
          new T.LineBasicMaterial({ color: opts.edgeColor || 0x06B6D4, transparent: true, opacity: .35 })));
      }
      m.userData = { name, jobs: isJ, center: new T.Vector3(cen[0], 1.2, cen[1]) };
      group.add(m); meshes.push(m);
    });
  });
  return { group, meshes, L };
}