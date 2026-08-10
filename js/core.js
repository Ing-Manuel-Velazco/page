/* ============================================================
   js/core.js — Shell y utilidades compartidas
   Tema · boot · reveals · nav · scroll · modal · acordeones · protección
   ============================================================ */
export const $  = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const NS = "http://www.w3.org/2000/svg";
export const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- utilidades de texto ---------- */
export const norm = s => (s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").trim();

export const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const MESN = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
export const fmtYM = ym => { const [y, m] = ym.split("-"); return `${MESN[+m - 1]} ${y}`; };
export const fmtCoords = c =>
  `${Math.abs(c[0]).toFixed(2)}° ${c[0] >= 0 ? "N" : "S"} · ${Math.abs(c[1]).toFixed(2)}° ${c[1] >= 0 ? "E" : "O"}`;

/* ---------- scramble (títulos) ---------- */
const CH = "▓▒░<>/#%&@01";
export function scramble(el, dur = 850){
  if (RM) return;
  const txt = el.textContent, n = txt.length, t0 = performance.now();
  const f = now => {
    const p = Math.min(1, (now - t0) / dur), k = Math.floor(p * n);
    let s = txt.slice(0, k);
    for (let i = k; i < n; i++) s += txt[i] === " " ? " " : CH[Math.random() * CH.length | 0];
    el.textContent = s;
    p < 1 ? requestAnimationFrame(f) : el.textContent = txt;
  };
  f(t0);
}

/* ---------- tema (emite jv:theme para que la escena 3D se recoloree) ---------- */
export function initTheme(){
  const root = document.documentElement, btn = $("#thm");
  let guardado = null;
  try { guardado = localStorage.getItem("theme"); } catch (_) {}
  root.dataset.theme = (guardado === "light" || guardado === "dark") ? guardado : "dark";
  btn.addEventListener("click", () => {
    const nuevo = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nuevo;
    try { localStorage.setItem("theme", nuevo); } catch (_) {}
    dispatchEvent(new CustomEvent("jv:theme", { detail: nuevo }));
  });
}

/* ---------- boot ---------- */
const MSGS = ["Inicializando sistema...", "Cargando perfil profesional...", "Verificando credenciales...", "Preparando experiencia...", "¡Bienvenido a mi portafolio digital!"];
export function initBoot(){
  const boot = $("#boot"), msg = $("#bootmsg");
  if (RM) { boot.remove(); document.body.classList.add("ready"); return; }
  let mi = 0, done = false;
  const finish = () => {
    if (done) return; done = true;
    document.body.classList.add("ready");
    boot.classList.add("exit");
    setTimeout(() => boot.remove(), 800);
  };
  const typeMsg = () => {
    if (mi >= MSGS.length) return;
    const t = MSGS[mi]; let ci = 0;
    const type = () => { if (ci <= t.length) { msg.textContent = t.slice(0, ci); ci++; setTimeout(type, 45); } };
    type(); mi++; setTimeout(typeMsg, 1100);
  };
  boot.classList.add("go"); typeMsg();
  setTimeout(finish, 3400);
  boot.addEventListener("click", finish);
}

/* ---------- reveals + scramble de títulos ---------- */
export function initReveals(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.classList.contains("scr")) scramble(e.target, 700);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$(".reveal,.panel").forEach(el => io.observe(el));
}

/* ---------- barra de progreso de scroll ---------- */
export function initScrollProgress(){
  const bar = $("#bar"); let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const d = document.documentElement, max = d.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max ? d.scrollTop / max : 0})`;
      tick = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

/* ---------- nav: sección activa + navegación interna ---------- */
export function navegarA(hash){
  const t = document.querySelector(hash); if (!t) return;
  const navH = $(".nav").offsetHeight; let y = 0;
  if (hash !== "#inicio") {
    const el = t.querySelector(".shead") || t;
    y = el.getBoundingClientRect().top + window.scrollY - (navH + 32);
    y = Math.max(0, y);
  }
  window.scrollTo({ top: y, behavior: RM ? "auto" : "smooth" });
}
export function initNav(){
  const nio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$(".nav ul a").forEach(a => a.classList.toggle("act", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  $$("main section[id]").forEach(s => nio.observe(s));

  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const hash = a.getAttribute("href");
    if (hash.length < 2 || !document.querySelector(hash)) return;
    e.preventDefault(); navegarA(hash); history.replaceState(null, "", hash);
  });
}

/* ---------- modal genérico (certificados + estados) ---------- */
let modal, mhead, imgview, mfoot;
export function initModal(){
  modal = $("#modal"); mhead = $("#mhead"); imgview = $("#imgview"); mfoot = $("#mfoot");
  $("#mclose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if ($("#vmodal").classList.contains("on")) return; /* lo gestiona verificacion.js */
    if (modal.classList.contains("on")) closeModal();
  });
}
export function openModal(headHTML, bodyHTML, footHTML){
  mhead.innerHTML = headHTML;
  imgview.innerHTML = bodyHTML;
  mfoot.innerHTML = footHTML;
  modal.classList.add("on");
  document.body.style.overflow = "hidden";
  return imgview;
}
export function closeModal(){
  modal.classList.remove("on");
  document.body.style.overflow = "";
  imgview.innerHTML = "";
}

/* ---------- acordeones con altura real (sin recortes) ---------- */
export function accordion(card, head, body){
  head.addEventListener("click", () => {
    const open = card.classList.toggle("open");
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  });
}
export function initAccordionResize(){
  addEventListener("resize", () => {
    $$(".open").forEach(c => {
      const b = c.querySelector(".xp-body,.job-b");
      if (b) b.style.maxHeight = b.scrollHeight + "px";
    });
  });
}

/* ---------- protección de contenido ---------- */
export function initProteccion(){
  const proteger = e => { if (e.target.closest("#certificados,#modal,#vmodal,#mapview")) e.preventDefault(); };
  document.addEventListener("contextmenu", proteger);
  document.addEventListener("dragstart", proteger);
  document.addEventListener("copy", proteger);
  addEventListener("keydown", e => {
    const protegido = $("#modal").classList.contains("on") || $("#vmodal").classList.contains("on");
    if (protegido && (e.ctrlKey || e.metaKey)) {
      const k = e.key.toLowerCase();
      if (["s","p","c","x","u","a"].includes(k) || (e.shiftKey && ["i","j","c","s"].includes(k))) e.preventDefault();
    }
  });
}