<?php
/* proxy.php — sirve la verificación oficial sin headers de framing.
   URL fija (no es proxy abierto) para uso seguro. */
if (isset($_GET['ping'])) { header("Content-Type: text/plain"); exit("ok"); }
$url = "https://titulacion.ucol.mx/validar/186120e6-cf70-41bb-bc05-53019a2a3632";
$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_TIMEOUT        => 20,
  CURLOPT_USERAGENT      => "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
]);
$body = curl_exec($ch);
$ct   = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);
if (!$body) { http_response_code(502); exit("No se pudo contactar al servidor oficial."); }
header("Content-Type: " . ($ct ?: "text/html; charset=utf-8"));
header("Cache-Control: public, max-age=3600");
/* NO reenviamos X-Frame-Options/CSP; inyectamos <base> para recursos relativos */
echo preg_replace('/<head([^>]*)>/i', '<head$1><base href="https://titulacion.ucol.mx/">', $body, 1);