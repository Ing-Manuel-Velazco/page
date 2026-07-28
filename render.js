/**
 * render.js
 * ------------------------------------------------------------------
 * Lee content.json (o su respaldo embebido) y construye cada sección
 * de la página. Para cambiar textos, fechas, foto, experiencia,
 * educación, etc. edita únicamente content.json — este archivo no
 * debería necesitar cambios salvo que agregues una sección nueva.
 * ------------------------------------------------------------------
 */

'use strict';

/** Iconos de línea (stroke) usados en las tarjetas de habilidades duras. */
const ICONS = Object.freeze({
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z"/>',
  terreno: '<path d="M4 20l6-14 4 8 3-5 3 11"/>',
  mapa: '<path d="M4 4h16v14H8l-4 4V4z"/>',
  capas: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  dron: '<circle cx="12" cy="12" r="2"/><path d="M12 10V6M12 14v4M10 12H6M14 12h4"/><circle cx="6" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
  hoja: '<path d="M5 21c0-9 6-16 15-16 0 9-6 16-15 16z"/><path d="M5 21c2.5-5 6-8.5 11-11"/>',
  infraestructura: '<path d="M10 3L4 21M14 3l6 18M9 14h6"/>',
  pin: '<path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/>',
  carpeta: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/>',
  graduacion: '<path d="M12 3l10 5-10 5L2 8l10-5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/>',
  satelite: '<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 9L4 4M15 9l5-5M9 15l-5 5M15 15l5 5"/>',
  codigo: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>'
});
window.__portafolioIcons = ICONS;

/** Paleta de tintes para íconos de estadísticas/especialidades (estilo dashboard). */
const TINTS = Object.freeze({
  blue:'#3B82F6', violet:'#8B5CF6', teal:'#14B8A6', pink:'#EC4899', cyan:'#22D3EE',
  green:'#22C55E', red:'#EF4444', yellow:'#EAB308', orange:'#F97316', purple:'#A855F7', slate:'#94A3B8'
});

function hexToRgba(hex, alpha){
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Devuelve los estilos inline (fondo tenue + trazo de color) para un ícono con tinte. */
function tintStyles(colorName){
  const hex = TINTS[colorName] || TINTS.blue;
  return {
    wrap: `background:${hexToRgba(hex, 0.16)};`,
    icon: `stroke:${hex};`
  };
}

/**
 * Glifos originales (no son los logotipos reales de cada marca, son abstracciones
 * propias inspiradas en cada herramienta) para el carrusel de tecnologías. Cada
 * uno trae su propio color de marca de referencia, mostrado sobre una placa clara
 * a modo de "badge", como en cualquier sección de stack tecnológico.
 */
const TECH_LOGOS = Object.freeze({
  arcgis:       { color:'#2C7FE0', svg:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.2 2.2 3.4 5 3.4 8s-1.2 5.8-3.4 8c-2.2-2.2-3.4-5-3.4-8s1.2-5.8 3.4-8z"/>' },
  qgis:         { color:'#3FA23F', svg:'<circle cx="11" cy="11" r="7.5"/><path d="M16 16l4.5 4.5"/>' },
  python:       { color:'#3776AB', svg:'<path d="M12 2c-3 0-3.4 1.3-3.4 2.9v2h6.8v1H6.4C4.6 7.9 3 9 3 12.4c0 3.4 1.4 4.5 3.4 4.5h1.9v-2.6c0-2.2 1.9-4.1 4.1-4.1h3.9c1.6 0 2.9-1.3 2.9-2.9V4.9C19.2 3.3 17.8 2 15.6 2H12z" fill="#3776AB" stroke="none"/><path d="M12 22c3 0 3.4-1.3 3.4-2.9v-2H8.6v-1h9c1.8 0 3.4-1.1 3.4-4.5 0-3.4-1.4-4.5-3.4-4.5h-1.9v2.6c0 2.2-1.9 4.1-4.1 4.1H7.7c-1.6 0-2.9 1.3-2.9 2.9v2.2C4.8 20.7 6.2 22 8.4 22H12z" fill="#FFD43B" stroke="none"/>' },
  civil3d:      { color:'#E4342B', svg:'<rect x="3" y="3" width="18" height="18" rx="4" fill="#E4342B" stroke="none"/><path d="M8 17V7l4 10V7l4 10" stroke="#fff" fill="none" stroke-width="1.6"/>' },
  leica:        { color:'#D8232A', svg:'<circle cx="12" cy="12" r="9" fill="#D8232A" stroke="none"/><path d="M8.5 9.5a3.5 5 0 1 1 0 5M15.5 9.5a3.5 5 0 1 0 0 5" stroke="#fff" fill="none" stroke-width="1.4"/>' },
  globalmapper: { color:'#2E8B57', svg:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2 2 3 5.3 3 8.5s-1 6.5-3 8.5c-2-2-3-5.3-3-8.5s1-6.5 3-8.5z"/><path d="M12 12l6-6" stroke-width="1.2"/>' },
  gnss:         { color:'#64748B', svg:'<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 9L4 4M15 9l5-5M9 15l-5 5M15 15l5 5"/><circle cx="12" cy="12" r="10" stroke-dasharray="2 3" stroke-width="1"/>' },
  metashape:    { color:'#0EA5A5', svg:'<path d="M12 4l7 4v8l-7 4-7-4V8l7-4z"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M12 4v8M5 8l7 4M19 8l-7 4"/>' }
});

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

/** Escapa texto antes de insertarlo como HTML, para evitar inyección. */
function esc(value){
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}
window.__escHtml = esc;

/**
 * Busca un elemento por id. Si no existe, avisa en consola en vez de
 * lanzar una excepción — así un id renombrado o faltante rompe solo
 * esa sección, no toda la página.
 */
function byId(id){
  const el = document.getElementById(id);
  if(!el) console.warn(`[render.js] No se encontró #${id} en el DOM; se omite esa parte.`);
  return el;
}

function setText(id, value){
  const el = byId(id);
  if(el) el.textContent = value ?? '';
}

function setHTML(id, html){
  const el = byId(id);
  if(el) el.innerHTML = html ?? '';
}

/** Anuncia el estado de carga a lectores de pantalla (WCAG 4.1.3). */
function announceStatus(message){
  const region = document.getElementById('statusRegion');
  if(region) region.textContent = message;
}

/* ------------------------------------------------------------------ */
/* Carga de datos                                                      */
/* ------------------------------------------------------------------ */

function loadInlineContent(){
  const el = document.getElementById('content-data');
  if(!el) return null;
  try{
    return JSON.parse(el.textContent);
  }catch(err){
    console.error('[render.js] La copia de respaldo embebida no es JSON válido:', err);
    return null;
  }
}

/**
 * Carga content.json desde la red y, si falla o no es posible (por
 * ejemplo al abrir el archivo con doble clic, protocolo file://),
 * recurre a la copia de respaldo embebida en index.html.
 */
async function loadContent(){
  if(location.protocol === 'file:'){
    const inline = loadInlineContent();
    if(inline) return inline;
    throw new Error('No se pudo cargar el contenido ni la copia de respaldo.');
  }

  try{
    const res = await fetch('content.json', { cache: 'no-store' });
    if(!res.ok) throw new Error(`content.json respondió ${res.status}`);
    return await res.json();
  }catch(err){
    console.warn('[render.js] No se pudo leer content.json en vivo, usando respaldo embebido:', err);
    const inline = loadInlineContent();
    if(inline) return inline;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Secciones                                                           */
/* ------------------------------------------------------------------ */

function renderPerfil(data){
  const p = data.perfil;
  document.title = `${p.nombre} ${p.apellidos} — ${p.rol}`;

  document.querySelectorAll('.js-photo').forEach(img=>{
    img.src = p.foto;
    img.decoding = 'async';
  });

  setText('sideNombre', p.nombre);
  setText('sideApellidos', p.apellidos);
  setText('sideRolEtiqueta', p.rol_etiqueta || '');
  setText('sideRolTitulo', p.rol_titulo || p.rol);
  setText('footerName', `${p.nombre} ${p.apellidos}`);

  if(p.tagline) setText('sideTagline', p.tagline);

  const availEl = byId('sideAvailability');
  if(availEl){
    availEl.classList.toggle('is-on', !!p.disponible);
    const label = availEl.querySelector('.availability-label');
    if(label) label.textContent = p.disponibilidad_texto || (p.disponible ? 'Disponible' : 'No disponible');
  }

  // Botones sociales (íconos): LinkedIn siempre visible; GitHub y CV solo si hay dato.
  const liBtn = byId('socialLinkedin');
  if(liBtn) liBtn.href = p.linkedin;

  const ghBtn = byId('socialGithub');
  if(ghBtn){
    if(p.github){ ghBtn.href = p.github; ghBtn.hidden = false; }
    else{ ghBtn.hidden = true; }
  }

  const cvBtn = byId('socialCv');
  if(cvBtn){
    if(p.cv){ cvBtn.href = p.cv; cvBtn.hidden = false; }
    else{ cvBtn.hidden = true; }
  }

  const mailBtn = byId('socialEmail');
  if(mailBtn) mailBtn.href = `mailto:${p.email}`;

  setText('footerEmailText', p.email);
  const emailBtn = byId('footerEmail');
  if(emailBtn){
    emailBtn.dataset.copy = p.email;
    emailBtn.setAttribute('aria-label', `Copiar correo electrónico: ${p.email}`);
  }

  setText('footerPhoneText', p.telefono_display);
  const phoneBtn = byId('footerPhone');
  if(phoneBtn){
    phoneBtn.dataset.copy = p.telefono_display;
    phoneBtn.dataset.wa = p.telefono_link;
    phoneBtn.setAttribute('aria-label', `Copiar teléfono y abrir WhatsApp: ${p.telefono_display}`);
  }
}

function renderAcerca(data){
  const a = data.acerca;
  setText('acercaLead', a.lead);

  // Tarjetas de estadísticas (el conteo se anima al entrar al viewport, ver script principal)
  setHTML('statsGrid', a.estadisticas.map(s => {
    const t = tintStyles(s.color);
    return `
    <div class="stat-card">
      <div class="stat-icon" style="${t.wrap}"><svg viewBox="0 0 24 24" style="${t.icon}" aria-hidden="true">${ICONS[s.icono] || ICONS.grid}</svg></div>
      <div class="stat-number" data-count-to="${s.numero}"><span class="num">0</span><span class="suffix">${esc(s.sufijo || '')}</span></div>
      <div class="stat-label">${esc(s.etiqueta)}</div>
    </div>`;
  }).join(''));

  // Carrusel horizontal de tecnologías (badges tipo "stack" con color de marca de referencia)
  setHTML('techCarousel', a.tecnologias.map(t => {
    const logo = TECH_LOGOS[t.logo] || { color:'#3B82F6', svg: ICONS.grid };
    return `
    <div class="tech-card">
      <div class="tech-icon"><svg viewBox="0 0 24 24" style="stroke:${logo.color};color:${logo.color};" aria-hidden="true">${logo.svg}</svg></div>
      <div class="tech-name">${esc(t.nombre)}</div>
    </div>`;
  }).join(''));

  // Información personal como tarjetas
  setHTML('infoGrid', a.info_personal.map(i => `
    <div class="info-card">
      <div class="info-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i.icono] || ICONS.grid}</svg></div>
      <div>
        <div class="info-label">${esc(i.etiqueta)}</div>
        <div class="info-value">${esc(i.valor)}</div>
      </div>
    </div>
  `).join(''));

  // Especialidades
  setHTML('specGrid', a.especialidades.map(e => {
    const t = tintStyles(e.color);
    return `
    <div class="spec-card">
      <div class="spec-icon" style="${t.wrap}"><svg viewBox="0 0 24 24" style="${t.icon}" aria-hidden="true">${ICONS[e.icono] || ICONS.grid}</svg></div>
      <div class="spec-name">${esc(e.nombre)}</div>
    </div>`;
  }).join(''));

  // Idiomas: barra moderna animada al entrar al viewport (ver script principal)
  setHTML('langBlock', a.idiomas.map(l => `
    <div class="lang-item">
      <div class="lang-item-head">
        <span class="lang-item-name">${esc(l.nombre)}</span>
        <span class="lang-item-level">${esc(l.nivel)}</span>
      </div>
      <div class="lang-track"><div class="lang-fill" data-fill-to="${l.porcentaje}"></div></div>
    </div>
  `).join(''));

  // Frase de cierre
  if(a.frase) setText('acercaFrase', a.frase);
}

function renderEducacion(data){
  setHTML('eduContainer', data.educacion.map(e => `
    <div class="edu-card">
      <div class="edu-top">
        <div>
          <div class="edu-degree">${esc(e.titulo)}</div>
          <div class="edu-school">${esc(e.escuela)}</div>
        </div>
        <div class="edu-meta">
          <div class="edu-years">${esc(e.periodo)}</div>
          ${e.verificar_url ? `<a class="verify-btn" href="${esc(e.verificar_url)}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
            Verificar
            <span class="sr-only"> (abre en una pestaña nueva)</span>
          </a>` : ''}
        </div>
      </div>
      <p>${esc(e.descripcion)}</p>
      ${e.cedula ? `<div class="cedula">${esc(e.cedula)}</div>` : ''}
    </div>
  `).join(''));
}

function renderExperiencia(data){
  const timeline = byId('timeline');
  if(!timeline) return;

  // Se ordena siempre por fecha de inicio (más reciente primero),
  // sin importar el orden en que aparezcan en content.json.
  const stations = data.experiencia.slice().sort((a, b) => {
    if(a.inicio !== b.inicio) return b.inicio.localeCompare(a.inicio);
    return (b.fin || '').localeCompare(a.fin || '');
  });

  timeline.innerHTML = stations.map((e, i) => {
    const num = String(stations.length - i).padStart(2, '0');
    return `
    <div class="station">
      <div class="station-code">EST-${num} · ${esc(e.etiqueta_fecha)}</div>
      <div class="station-head"><div class="station-role">${esc(e.puesto)}</div><div class="station-org">${esc(e.organizacion)}</div></div>
      <ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>`;
  }).join('');
}

function renderHabilidades(data){
  const h = data.habilidades;

  setHTML('skillsGrid', h.duras.map(card => `
    <div class="skill-card">
      <div class="skill-card-head">
        <div class="skill-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[card.icono] || ICONS.grid}</svg></div>
        <h3>${esc(card.titulo)}</h3>
      </div>
      <ul>${card.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
  `).join(''));

  setHTML('softGrid', h.blandas.map(s => `
    <div class="soft-card"><strong>${esc(s.titulo)}</strong><span>${esc(s.descripcion)}</span></div>
  `).join(''));
}

function renderCertificados(data){
  const c = data.certificados;
  const mid = Math.ceil(c.lista.length / 2);
  const cols = [c.lista.slice(0, mid), c.lista.slice(mid)];

  setHTML('certGrid', cols.map(col =>
    '<div>' + col.map(item =>
      `<div class="cert-row"><span>${esc(item.nombre)}</span><span class="cert-meta">${esc(item.meta)}</span></div>`
    ).join('') + '</div>'
  ).join(''));

  if(c.premio){
    setHTML('awardBox', `<span class="tag">${esc(c.premio.etiqueta)}</span><p>${esc(c.premio.texto)}</p>`);
  }
}

function renderPortafolio(data){
  const categorias = data.portafolio;

  // Expone las categorías completas (con sus proyectos) para que el script
  // de interacción (abrir/cerrar carpeta) las use sin tener que re-parsear HTML.
  window.__portafolioCategorias = categorias;

  setHTML('folderList', categorias.map((cat, i) => `
    <div class="folder-row" data-index="${i}" tabindex="0" role="button"
         aria-label="Ver proyectos de ${esc(cat.titulo)}" aria-expanded="false">
      <div class="folder-main">
        <div class="folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[cat.icono] || ICONS.grid}</svg></div>
        <div class="folder-text">
          <div class="folder-num">${esc(cat.numero)}</div>
          <div class="folder-title">${esc(cat.titulo)}</div>
          <div class="folder-desc">${esc(cat.descripcion)}</div>
        </div>
      </div>
      <div class="folder-preview">
        ${cat.proyectos.slice(0, 4).map(p => `
          <div class="folder-thumb ${p.proximamente ? 'is-soon' : ''}">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[cat.icono] || ICONS.grid}</svg>
          </div>
        `).join('')}
        <svg class="folder-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      </div>
    </div>
  `).join(''));
}

/* ------------------------------------------------------------------ */
/* Orquestación: cada sección aislada — si una falla, no tumba al resto */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  ['perfil', renderPerfil],
  ['acerca de mí', renderAcerca],
  ['educación', renderEducacion],
  ['experiencia', renderExperiencia],
  ['habilidades', renderHabilidades],
  ['certificados', renderCertificados],
  ['portafolio', renderPortafolio]
];

async function renderAll(){
  let data;
  try{
    data = await loadContent();
  }catch(err){
    console.error('[render.js] No se pudo obtener el contenido:', err);
    setText('acercaLead',
      'No se pudo cargar el contenido. Revisa que content.json exista y tenga un formato válido, ' +
      'o usa un servidor local para probar cambios recientes (ver README).');
    announceStatus('Hubo un problema al cargar el contenido de la página.');
    return;
  }

  let failures = 0;
  for(const [label, fn] of SECTIONS){
    try{
      fn(data);
    }catch(err){
      failures++;
      console.error(`[render.js] Falló la sección "${label}":`, err);
    }
  }

  announceStatus(failures === 0
    ? 'Contenido cargado.'
    : `Contenido cargado con ${failures} sección(es) incompleta(s); revisa la consola para más detalle.`);

  document.dispatchEvent(new CustomEvent('content-ready', { detail: { failures } }));
}

renderAll();
