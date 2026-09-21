# Visitas por país — Cloudflare gratuito

Este directorio contiene el Worker y la configuración para contar **visitas agregadas por país**. No almacena IP, cookies, nombres, navegador, URL ni coordenadas.

## Publicación inicial

Antes del primer despliegue, Cloudflare solicita registrar una sola vez un subdominio gratuito `workers.dev`. Hazlo desde el enlace que muestra Wrangler o desde **Workers & Pages → Overview → workers.dev**. Ese nombre forma parte de la URL pública del Worker.

Desde este directorio, inicia sesión en Cloudflare y crea el almacén KV:

```powershell
npx wrangler login
npx wrangler kv namespace create VISITS
```

El segundo comando devuelve un `id`. Cópialo en `wrangler.toml`, reemplazando `REEMPLAZA_CON_EL_ID_DEL_NAMESPACE_KV`. En esta instalación ya quedó configurado el namespace creado para la cuenta vinculada.

`ALLOWED_ORIGINS` ya contiene el origen publicado `https://ing-manuel-velazco.github.io`. Conserva los orígenes `localhost` para las pruebas. No incluyas `/page/`: CORS usa solamente origen, es decir, protocolo y dominio.

Publica el Worker:

```powershell
npx wrangler deploy
```

Wrangler mostrará una URL similar a `https://jv-portfolio-visits.<subdominio>.workers.dev`. En esta instalación, el Worker ya se publicó como `jv-portfolio-visits`; falta activar el subdominio `workers.dev` para que esa URL pueda recibir solicitudes.

## Conectar la portada

En `index.html`, el atributo ya quedó conectado con:

```html
<html data-visits-endpoint="https://jv-portfolio-visits.cloudflare-visitas.workers.dev">
```

Al publicar el sitio, la portada empezará a registrar una visita por sesión de navegador y mostrará hasta seis países que tengan al menos tres visitas. El resumen se actualiza como máximo cada diez minutos para reducir lecturas.

## Límites y privacidad

- El Worker consulta el código de país que Cloudflare ya proporciona a la solicitud y solo guarda un contador por código, por ejemplo `jv:country:MX`.
- No se guardan identificadores personales.
- El mínimo de tres visitas evita mostrar un país de una visita aislada.
- Un refresco de navegador dentro de la misma sesión no intenta registrar una segunda visita.
- Si la cuota gratuita se agota, el Worker rechaza operaciones adicionales; el sitio y el resto del portafolio continúan funcionando.

