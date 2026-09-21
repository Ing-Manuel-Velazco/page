/*
  Worker de Cloudflare para el portafolio.
  Conserva exclusivamente contadores por país (ISO 3166-1 alpha-2).
  Nunca escribe IP, agente, URL visitada, cookie ni identificador personal.
*/

const PREFIX = "jv:country:";
const MINIMUM_PUBLIC_VISITS = 3;
const CACHE_SECONDS = 600;

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers }
});

function allowedOrigin(request, env){
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const configured = (env.ALLOWED_ORIGINS || "http://localhost:8000,http://127.0.0.1:8000")
    .split(",").map(v => v.trim()).filter(Boolean);
  return configured.includes(origin) ? origin : null;
}

function cors(origin){
  return origin ? {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "vary": "Origin"
  } : {};
}

function responseOptions(request, env){
  const origin = allowedOrigin(request, env);
  return new Response(null, { status: origin ? 204 : 403, headers: cors(origin) });
}

async function increment(namespace, key){
  // El portafolio tiene tráfico bajo. Una operación simple evita almacenar cualquier dato personal.
  const current = Number(await namespace.get(key)) || 0;
  await namespace.put(key, String(current + 1));
}

async function summary(namespace){
  const countries = [];
  let cursor;
  do {
    const page = await namespace.list({ prefix: PREFIX, cursor });
    for (const key of page.keys) {
      const country = key.name.slice(PREFIX.length);
      const visits = Number(await namespace.get(key.name)) || 0;
      if (/^[A-Z]{2}$/.test(country) && visits >= MINIMUM_PUBLIC_VISITS) countries.push({ country, visits });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  countries.sort((a, b) => b.visits - a.visits || a.country.localeCompare(b.country));
  return { countries, minimumPublicVisits: MINIMUM_PUBLIC_VISITS };
}

export default {
  async fetch(request, env, ctx){
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);

    if (request.method === "OPTIONS") return responseOptions(request, env);

    if (url.pathname === "/event" && request.method === "POST") {
      if (!origin) return json({ error: "Origin not allowed" }, 403);
      const country = /^[A-Z]{2}$/.test(request.cf?.country || "") ? request.cf.country : "";
      if (country) await increment(env.VISITS, `${PREFIX}${country}`);
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (url.pathname === "/summary" && request.method === "GET") {
      if (!origin) return json({ error: "Origin not allowed" }, 403);
      const cacheKey = new Request(url.toString(), request);
      const cached = await caches.default.match(cacheKey);
      if (cached) return cached;
      const response = json(await summary(env.VISITS), 200, {
        ...cors(origin), "cache-control": `public, max-age=${CACHE_SECONDS}`
      });
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
      return response;
    }

    return json({ error: "Not found" }, 404, cors(origin));
  }
};

