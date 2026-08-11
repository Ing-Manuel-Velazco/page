/* ============================================================
   js/main.js — Punto de entrada (módulo ES)
============================================================ */
import { $, RM, initTheme, initBoot, initReveals, initScrollProgress, initNav,
         initModal, initAccordionResize, initProteccion } from "./core.js";
import { initI18n, t } from "./i18n.js";
import { initMapa } from "./mapa.js";
import { initTrayectoria } from "./trayectoria.js";
import { initCerts } from "./certificados.js";
import { initVerificacion } from "./verificacion.js";

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.scrollTo(0, 0);
addEventListener("load", () => window.scrollTo(0, 0));

/* ---------- perfil ---------- */
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
    btn.textContent = f ? t("cred.flipback") : t("cred.flip");
  };
  card.addEventListener("click", flip);
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
  });
  btn.addEventListener("click", flip);
  addEventListener("jv:lang", () => {
    btn.textContent = card.classList.contains("flipped") ? t("cred.flipback") : t("cred.flip");
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