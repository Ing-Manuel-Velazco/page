/* ============================================================
   js/boot.js — Animación de inicio (SVG line + dots)
   Duración total: ~5.5s (coincide con la animación de la línea)
============================================================ */
import { $, t } from "./core.js";

export function initBoot(){
  const boot = $("#boot");
  if (!boot) return;

  const name = $("#bootname");
  const msg = $("#bootmsg");
  const bar = boot.querySelector(".boot-bar i");
  const dotsGroup = $("#bootdots");

  /* Mensajes de estado */
  const messages = [t("boot.m1"), t("boot.m2"), t("boot.m3"), t("boot.m4")];
  let step = 0;
  const interval = setInterval(() => {
    if (msg && messages[step]) msg.textContent = messages[step];
    step++;
    if (step >= messages.length) clearInterval(interval);
  }, 1200);

  /* Barra de progreso */
  if (bar) setTimeout(() => boot.classList.add("go"), 50);

  /* Puntos del SVG */
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
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", "2.8");
      c.setAttribute("class", "boot-dot");
      dotsGroup.appendChild(c);
      setTimeout(() => c.classList.add("on"), p.d * 1000 + 700);
    });
  }

  /* Skip (clic o Enter) */
  const skip = () => {
    boot.classList.add("dive");
    setTimeout(() => {
      boot.classList.add("exit");
      document.body.classList.add("ready");
    }, 600);
  };
  boot.addEventListener("click", skip);
  addEventListener("keydown", e => {
    if (e.key === "Enter" && !boot.classList.contains("exit")) skip();
  });

  /* Auto-exit tras 5.5s (coincide con la animación) */
  setTimeout(skip, 5500);
}
