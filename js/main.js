/* ============================================================
   js/main.js — Punto de entrada (módulo ES)
============================================================ */
import { $, RM, initTheme, initBoot, initReveals, initScrollProgress, initNav,
         initModal, initAccordionResize, initProteccion } from "./core.js";
import { initI18n, t } from "./i18n.js?v=geo-20260921p";
import { initMapa } from "./mapa.js?v=geo-20260921q";
import { initTrayectoria } from "./trayectoria.js?v=geo-20260921m";
import { initCerts } from "./certificados.js?v=geo-20260921m";
import { initVerificacion } from "./verificacion.js?v=geo-20260921m";
import { initVisitas } from "./visitas.js?v=hero-visits-20260922b";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.scrollTo(0, 0);
addEventListener("load", () => window.scrollTo(0, 0));

/* ---------- perfil ---------- */
function initPerfil(){
  const cimg = $("#credimg");
  const photo = cimg?.closest(".pf-photo");
  ["contextmenu", "dragstart", "copy"].forEach(tipo =>
    photo?.addEventListener(tipo, e => e.preventDefault()));
  if (cimg) cimg.addEventListener("error", function(){
    if (cimg.src.indexOf("foto.png") !== -1) cimg.src = "foto.jpg";
    else cimg.alt = "Fotografía no disponible";
  });
}

/* ---------- contacto ---------- */
function initContacto(){
  const mail = "velazcoochoajosemanuel@gmail.com";
  const tel  = "+52 814 359 7851";

  const copia = (btn, valor, fallback) => {
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const s = btn.querySelector("span") || btn;
      const o = s.textContent;
      try { await navigator.clipboard.writeText(valor); s.textContent = t("contact.copied"); }
      catch { if (fallback) { location.href = fallback; return; } }
      setTimeout(() => s.textContent = o, 2200);
    });
  };
  copia($("#copymail"), mail, "mailto:" + mail);
  copia($("#copytel"), tel.replace(/\s/g, ""), null);

  const form = $("#cform");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form);
    const nom = String(f.get("nombre") || "").trim();
    const cor = String(f.get("correo") || "").trim();
    const msg = String(f.get("mensaje") || "").trim();
    const ta = form.querySelector("textarea");
    if (!msg) { ta.focus(); return; }
    const subject = `${t("contact.subj")} ${nom || t("contact.web")}`;
    const body = `${msg}\n\n— ${nom || t("contact.sinname")}${cor ? " · " + cor : ""}\n${t("contact.from")}`;
    location.href = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

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
initI18n();
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
initVisitas();

