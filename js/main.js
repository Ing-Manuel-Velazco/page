/* ============================================================
   js/main.js — Punto de entrada (módulo ES)
   ============================================================ */
import { $, RM, initTheme, initBoot, initReveals, initScrollProgress, initNav,
         initModal, initAccordionResize, initProteccion } from "./core.js";
import { initMapa } from "./mapa.js";
import { initTrayectoria } from "./trayectoria.js";
import { initCerts } from "./certificados.js";
import { initVerificacion } from "./verificacion.js";

/* scroll al inicio, sin restauración del navegador */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.scrollTo(0, 0);
addEventListener("load", () => window.scrollTo(0, 0));

/* ---------- credencial: tilt 3D + fallback de foto ---------- */
function initCred(){
  const cred = $("#cred");
  if (cred && !RM) {
    cred.addEventListener("mousemove", e => {
      const r = cred.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      cred.style.transform = `rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(-py * 12).toFixed(2)}deg)`;
      cred.style.setProperty("--gx", (px * 100 + 50) + "%");
      cred.style.setProperty("--gy", (py * 100 + 50) + "%");
    });
    cred.addEventListener("mouseleave", () => { cred.style.transform = "rotateY(0deg) rotateX(0deg)"; });
  }
  const cimg = $("#credimg");
  if (cimg) cimg.addEventListener("error", function(){
    if (cimg.src.indexOf("foto.png") !== -1) cimg.src = "foto.jpg";
    else { cimg.style.display = "none"; $("#credmono").style.display = "grid"; }
  });
}

/* ---------- contacto ---------- */
function initContacto(){
  const btn = $("#copymail"), mail = "velazcoochoajosmanuel@gmail.com";
  btn.addEventListener("click", async () => {
    const s = btn.querySelector("span"), o = s.textContent;
    try { await navigator.clipboard.writeText(mail); s.textContent = "COPIADO ✓"; }
    catch { location.href = "mailto:" + mail; return; }
    setTimeout(() => s.textContent = o, 2200);
  });
  $("#yr").textContent = new Date().getFullYear();
}

/* ---------- arranque ---------- */
initTheme();
initModal();
initBoot();
initReveals();
initScrollProgress();
initNav();
initAccordionResize();
initProteccion();
initCred();
initMapa();
initTrayectoria();
initCerts();
initVerificacion();
initContacto();