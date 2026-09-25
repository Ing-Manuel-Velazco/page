/* ============================================================
   js/visitas.js — tarjeta pública de visitas agregadas
   No recopila IP, identidad, cookies ni ubicación exacta.
   La URL se completa en <html data-visits-endpoint="…"> tras
   publicar el Worker de Cloudflare.
============================================================ */
import { getLang, t } from "./i18n.js?v=asset-obscure-20260924a";

const ROOT = document.documentElement;
const CARD = document.getElementById("visitstats");
const LIST = document.getElementById("visitlist");
const GRID = document.getElementById("hero-grid");
const ENDPOINT = (ROOT.dataset.visitsEndpoint || "").trim().replace(/\/$/, "");
const READY = /^https:\/\//.test(ENDPOINT) && !/your-|example|pendiente/i.test(ENDPOINT);
let latest = [];
let countries = [];
let current = 0;
let carouselTimer = null;

const countryName = code => {
  try {
    const locale = { es: "es-MX", en: "en", pt: "pt-BR" }[getLang()] || "es-MX";
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code;
  } catch (_) { return code; }
};

function render(items, animate = false){
  if (!CARD || !LIST) return;
  countries = items.filter(v => /^[A-Z]{2}$/.test(v.country) && Number(v.visits) > 0);
  if (!countries.length) return;
  current %= countries.length;
  const item = countries[current];
  const row = document.createElement("div");
  row.className = `visit-row${animate ? " slide" : ""}`;
  const icon = document.createElement("img");
  icon.className = "visit-flag";
  icon.src = `https://flagcdn.com/w40/${item.country.toLowerCase()}.png`;
  icon.alt = "";
  icon.width = 25; icon.height = 18;
  const name = document.createElement("span"); name.className = "visit-country"; name.textContent = countryName(item.country);
  const count = document.createElement("span"); count.className = "visit-count";
  count.textContent = `${Number(item.visits).toLocaleString()} ${t("visits.count")}`;
  row.append(icon, name, count);
  LIST.replaceChildren(row);
  CARD.hidden = false;
  GRID?.classList.add("has-visits");
}

function iniciarCarrusel(){
  clearInterval(carouselTimer);
  if (countries.length < 2) return;
  carouselTimer = setInterval(() => {
    current = (current + 1) % countries.length;
    render(latest, true);
  }, 5000);
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
    iniciarCarrusel();
  } catch (_) { /* Sin UI de error para no distraer en la portada. */ }
}

export function initVisitas(){
  if (!READY || !CARD) return;
  registrarVisita();
  cargarResumen();
  addEventListener("jv:lang", () => render(latest));
  setInterval(cargarResumen, 10 * 60 * 1000);
}

