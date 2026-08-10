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

/* ---------- perfil: fallback de foto + flip de la ficha ---------- */
function initPerfil(){
  /* cadena de degradación: foto.png → foto.jpg → monograma JV */
  const cimg = $("#credimg");
  if (cimg) cimg.addEventListener("error", function(){
    if (cimg.src.indexOf("foto.png") !== -1) cimg.src = "foto.jpg";
    else { cimg.style.display = "none"; const m = $("#credmono"); if (m) m.style.display = "grid"; }
  });

  /* flip 3D accesible (clic, Enter o botón) */
  const card = $("#idcard"), btn = $("#flipbtn");
  if (!card || !btn) return;
  const flip = () => {
    const f = card.classList.toggle("flipped");
    btn.setAttribute("aria-pressed", String(f));
    btn.textContent = f ? "⇄ VER FRENTE" : "⇄ GIRAR FICHA";
  };
  card.addEventListener("click", flip);
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
  });
  btn.addEventListener("click", flip);
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
initPerfil();
initMapa();
initTrayectoria();
initCerts();
initVerificacion();
initContacto();