/* ============================================================
   js/visitas.js — tarjeta pública de visitas agregadas
   No recopila IP, identidad, cookies ni ubicación exacta.
   La URL se completa en <html data-visits-endpoint="…"> tras
   publicar el Worker de Cloudflare.
============================================================ */
import { getLang, t } from "./i18n.js?v=geo-20260921p";

const ROOT = document.documentElement;
const CARD = document.getElementById("visitstats");
const LIST = document.getElementById("visitlist");
const GRID = document.getElementById("hero-grid");
const ENDPOINT = (ROOT.dataset.visitsEndpoint || "").trim().replace(/\/$/, "");
const READY = /^https:\/\//.test(ENDPOINT) && !/your-|example|pendiente/i.test(ENDPOINT);
let latest = [];

const countryName = code => {
  try {
    const locale = { es: "es-MX", en: "en", pt: "pt-BR" }[getLang()] || "es-MX";
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code;
  } catch (_) { return code; }
};

const flag = code => /^[A-Z]{2}$/.test(code)
  ? String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : "◌";

function render(items){
  if (!CARD || !LIST) return;
  const visible = items.filter(v => /^[A-Z]{2}$/.test(v.country) && Number(v.visits) > 0).slice(0, 6);
  if (!visible.length) return;
  LIST.replaceChildren(...visible.map(item => {
    const row = document.createElement("div");
    row.className = "visit-row";
    const icon = document.createElement("span"); icon.className = "visit-flag"; icon.textContent = flag(item.country);
    const name = document.createElement("span"); name.className = "visit-country"; name.textContent = countryName(item.country);
    const count = document.createElement("span"); count.className = "visit-count";
    count.textContent = `${Number(item.visits).toLocaleString()} ${t("visits.count")}`;
    row.append(icon, name, count);
    return row;
  }));
  CARD.hidden = false;
  GRID?.classList.add("has-visits");
}

async function registrarVisita(){
  const key = `jv-visit-sent:${ENDPOINT}`;
  try { if (sessionStorage.getItem(key)) return; } catch (_) {}
  try {
    const res = await fetch(`${ENDPOINT}/event`, { method: "POST", mode: "cors", keepalive: true });
    if (res.ok) try { sessionStorage.setItem(key, "1"); } catch (_) {}
  } catch (_) { /* La tarjeta es opcional: el portafolio sigue funcionando. */ }
}

async function cargarResumen(){
  try {
    const res = await fetch(`${ENDPOINT}/summary`, { headers: { Accept: "application/json" } });
    if (!res.ok) return;
    const data = await res.json();
    latest = Array.isArray(data.countries) ? data.countries : [];
    render(latest);
  } catch (_) { /* Sin UI de error para no distraer en la portada. */ }
}

export function initVisitas(){
  if (!READY || !CARD) return;
  registrarVisita();
  cargarResumen();
  addEventListener("jv:lang", () => render(latest));
  setInterval(cargarResumen, 10 * 60 * 1000);
}

