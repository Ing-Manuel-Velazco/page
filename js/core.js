/* ============================================================
   js/core.js — Shell y utilidades compartidas
   Tema · boot SVG (sin WebGL) · reveals · nav · scroll · modal ·
   acordeones · protección
============================================================ */
export const $  = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const NS = "http://www.w3.org/2000/svg";
export const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

export const norm = s => (s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").trim();

export const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const MESN = {
  es: ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"],
  en: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
  pt: ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"]
};
export const getLang = () => document.documentElement.lang || "es";
export const fmtYM = ym => { const [y, m] = ym.split("-"); return `${MESN[getLang()][+m - 1] || MESN.es[+m - 1]} ${y}`; };
export const fmtCoords = c => {
  const W = getLang() === "en" ? "W" : "O";
  return `${Math.abs(c[0]).toFixed(2)}° ${c[0] >= 0 ? "N" : "S"} · ${Math.abs(c[1]).toFixed(2)}° ${c[1] >= 0 ? "E" : W}`;
};

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

/* ---------- boot SVG (ligero, sin Three.js/WebGL) ---------- */
export function initBoot(){
  const boot = $("#boot");
  if (!boot) { document.body.classList.add("ready"); return; }
  if (RM) { boot.remove(); document.body.classList.add("ready"); return; }

  const msg = $("#bootmsg");
  const pct = $("#bootpct");
  const dotsGroup = $("#bootdots");
  let done = false;
  const timers = [];
  const intervals = [];

  const finish = () => {
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    removeEventListener("keydown", onKey);
    boot.removeEventListener("click", finish);
    document.body.classList.add("ready");
    boot.classList.add("dive");
    setTimeout(() => { boot.classList.add("exit"); }, 460);
    setTimeout(() => boot.remove(), 960);
  };
  const onKey = e => { if (e.key === "Enter") finish(); };

  boot.addEventListener("click", finish);
  addEventListener("keydown", onKey);

  setTimeout(() => boot.classList.add("go"), 50);

  const language = document.documentElement.lang || "es";
  const messages = {
    es: ["SINCRONIZANDO SEÑAL…", "TRAZANDO TERRITORIO…", "PREPARANDO PERFIL…", "LISTO ✓"],
    en: ["SYNCING SIGNAL…", "TRACING TERRITORY…", "PREPARING PROFILE…", "READY ✓"],
    pt: ["SINCRONIZANDO SINAL…", "TRAÇANDO TERRITÓRIO…", "PREPARANDO PERFIL…", "PRONTO ✓"]
  }[language] || [];
  messages.forEach((m, i) => timers.push(setTimeout(() => { if (msg) msg.textContent = m; }, i * 760)));
  let progress = 0;
  intervals.push(setInterval(() => {
    progress = Math.min(100, progress + 2);
    if (pct) pct.textContent = `${String(progress).padStart(2, "0")}%`;
  }, 62));

  const points = [
    {x:28,y:38,d:1.0},{x:44,y:28,d:1.25},{x:52,y:62,d:1.5},
    {x:100,y:58,d:1.8},{x:142,y:58,d:2.0},{x:188,y:58,d:2.2},
    {x:200,y:14,d:2.6},{x:232,y:18,d:2.9},{x:275,y:8,d:3.15},
    {x:320,y:8,d:3.35},{x:320,y:26,d:3.45},{x:340,y:22,d:3.7},
    {x:402,y:16,d:4.0},{x:400,y:24,d:4.1},{x:475,y:14,d:4.35},
    {x:500,y:34,d:4.5}
  ];
  if (dotsGroup) {
    points.forEach(p => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y);
      c.setAttribute("r", "2.8"); c.setAttribute("class", "boot-dot");
      dotsGroup.appendChild(c);
      timers.push(setTimeout(() => c.classList.add("on"), p.d * 520 + 360));
    });
  }

  timers.push(setTimeout(finish, 3600));
}

export function initReveals(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.classList.contains("scr")) scramble(e.target, 700);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$(".reveal,.panel").forEach(el => io.observe(el));
}

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

export function navegarA(hash){
  const tEl = document.querySelector(hash); if (!tEl) return;
  const navH = $(".nav").offsetHeight; let y = 0;
  if (hash !== "#inicio") {
    const el = tEl.querySelector(".shead") || tEl;
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

let modal, mhead, imgview, mfoot;
export function initModal(){
  modal = $("#modal"); mhead = $("#mhead"); imgview = $("#imgview"); mfoot = $("#mfoot");
  $("#mclose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if ($("#vmodal").classList.contains("on")) return;
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

