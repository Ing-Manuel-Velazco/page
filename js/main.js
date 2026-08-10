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
  const cimg = $("#credimg");
  if (cimg) cimg.addEventListener("error", function(){
    if (cimg.src.indexOf("foto.png") !== -1) cimg.src = "foto.jpg";
    else { cimg.style.display = "none"; const m = $("#credmono"); if (m) m.style.display = "grid"; }
  });

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

/* ---------- contacto: copias, mailto-composer y hora local ---------- */
function initContacto(){
  const mail = "velazcoochoajosemanuel@gmail.com";
  const tel  = "+52 814 359 7851";

  const copia = (btn, valor, fallback) => {
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const s = btn.querySelector("span") || btn;
      const o = s.textContent;
      try { await navigator.clipboard.writeText(valor); s.textContent = "COPIADO ✓"; }
      catch { if (fallback) { location.href = fallback; return; } }
      setTimeout(() => s.textContent = o, 2200);
    });
  };
  copia($("#copymail"), mail, "mailto:" + mail);
  copia($("#copytel"), tel.replace(/\s/g, ""), null);

  /* formulario → mailto con asunto/cuerpo prellenados (sin backend) */
  const form = $("#cform");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form);
    const nom = String(f.get("nombre") || "").trim();
    const cor = String(f.get("correo") || "").trim();
    const msg = String(f.get("mensaje") || "").trim();
    const ta = form.querySelector("textarea");
    if (!msg) { ta.focus(); return; }
    const subject = `Proyecto · ${nom || "Contacto web"}`;
    const body = `${msg}\n\n— ${nom || "Sin nombre"}${cor ? " · " + cor : ""}\n(Enviado desde el portafolio web)`;
    location.href = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* hora local en Colima (America/Mexico_City) */
  const clk = $("#ctclock");
  if (clk) {
    const fmt = new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    const tick = () => { clk.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 1000);
  }

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