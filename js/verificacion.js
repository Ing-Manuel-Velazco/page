/* ============================================================
   js/verificacion.js — Modal de verificación de titulación
============================================================ */
import { $ } from "./core.js";
import { t } from "./i18n.js?v=map-work-focus-20260924a";

const URL_TITULACION = "https://titulacion.ucol.mx/validar/186120e6-cf70-41bb-bc05-53019a2a3632";

const vmodal = $("#vmodal"), vload = $("#vload"), vfall = $("#vfall"),
      vstatus = $("#vstatus"), vshot = $("#vshot"), vmsg = $("#vmsg");
let vTimers = [];
const vClear = () => { vTimers.forEach(clearTimeout); vTimers = []; };

function abrirV(){
  vClear(); vfall.hidden = true;
  vshot.style.display = "none"; vshot.removeAttribute("src");
  vload.classList.remove("hide");
  vstatus.textContent = t("v.validating");
  vmodal.classList.add("on"); document.body.style.overflow = "hidden";
  const seq = [t("v.connecting"), t("v.validating"), t("v.showing")];
  seq.forEach((m, i) => vTimers.push(setTimeout(() => { vmsg.textContent = m; }, i * 700)));
  vTimers.push(setTimeout(() => { vshot.src = "verificacion.png"; }, seq.length * 700 + 200));
}
function closeV(){
  vmodal.classList.remove("on"); document.body.style.overflow = ""; vClear();
  setTimeout(() => { vshot.style.display = "none"; vshot.removeAttribute("src"); }, 300);
}

export function initVerificacion(){
  vshot.addEventListener("load", () => {
    vClear(); vload.classList.add("hide");
    vshot.style.display = "block";
    vstatus.textContent = t("v.done");
  });
  vshot.addEventListener("error", () => {
    if ((vshot.getAttribute("src") || "") === "verificacion.png") { vshot.src = "verificacion.jpg"; }
    else {
      vClear(); vload.classList.add("hide");
      vshot.style.display = "none"; vfall.hidden = false;
      vstatus.textContent = t("v.noshot");
    }
  });
  $("#verifybtn").addEventListener("click", abrirV);
  $("#vcopy").addEventListener("click", async e => {
    const b = e.currentTarget, o = b.textContent;
    try { await navigator.clipboard.writeText(URL_TITULACION); b.textContent = t("v.copied"); } catch (_) {}
    setTimeout(() => b.textContent = o, 2200);
  });
  $("#vclose").addEventListener("click", closeV);
  vmodal.addEventListener("click", e => { if (e.target === vmodal) closeV(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && vmodal.classList.contains("on")) closeV(); });
}

