/* ============================================================
   js/i18n.js — Motor de internacionalización ES/EN/PT
   t(key) textos UI · loc(valor) campos de datos {es,en,pt}
   applyI18n() traduce el DOM · setLang() persiste y avisa (jv:lang)
============================================================ */
export const LANGS = ["es", "en", "pt"];
let lang = "es";
try { const g = localStorage.getItem("lang"); if (LANGS.includes(g)) lang = g; } catch (_) {}

export const getLang = () => lang;

export const loc = v => (v && typeof v === "object") ? (v[lang] || v.es || "") : (v ?? "");
export const allv = v => (v && typeof v === "object") ? LANGS.map(l => v[l] || "").join(" ") : (v ?? "");

const MESN = {
  es: ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"],
  en: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
  pt: ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"]
};
export const fmtYM = ym => { const [y, m] = ym.split("-"); return `${MESN[lang][+m - 1]} ${y}`; };
export const fmtCoords = c => {
  const W = lang === "en" ? "W" : "O", E = "E";
  return `${Math.abs(c[0]).toFixed(2)}° ${c[0] >= 0 ? "N" : "S"} · ${Math.abs(c[1]).toFixed(2)}° ${c[1] >= 0 ? E : W}`;
};

export const DICT = {
es: {
"doc.title":"José Manuel Velazco Ochoa · Ingeniero Topógrafo Geomático",
"nav.perfil":"PERFIL","nav.experiencia":"EXPERIENCIA","nav.educacion":"EDUCACIÓN","nav.habilidades":"HABILIDADES","nav.certificados":"CERTIFICADOS","nav.contacto":"CONTACTO",
"nav.tema":"Cambiar tema","lang.label":"Idioma",
"boot.sr":"Cargando portafolio profesional…","boot.role":"Ingeniero Topógrafo Geomático",
"boot.welcome":"Bienvenido · Preparando tu experiencia profesional...","boot.skip":"Clic · Enter — omitir",
"boot.m1":"INICIALIZANDO SISTEMA…","boot.m2":"CALIBRANDO GNSS…","boot.m3":"CARGANDO PERFIL…","boot.m4":"LISTO ✓",
"hero.tag":"PORTAFOLIO PROFESIONAL · CV 2026","hero.role":"INGENIERO TOPÓGRAFO GEOMÁTICO",
"hero.pill1":"DISPONIBLE PARA PROYECTOS","hero.pill2":"⌖ COLIMA, MÉXICO","hero.pill3":"CÉDULA 15282631",
"hero.cta1":"VER TRAYECTORIA ↓","hero.cta2":"ESTABLECER CONTACTO",
"mq.1":"ARCGIS PRO","mq.2":"AUTOCAD CIVIL 3D","mq.3":"PYTHON","mq.4":"TELEDETECCIÓN","mq.5":"GNSS","mq.6":"FOTOGRAMETRÍA","mq.7":"CARTOGRAFÍA TEMÁTICA","mq.8":"ANÁLISIS ESPACIAL","mq.9":"GEODESIA","mq.10":"MONITOREO AMBIENTAL",
"sec.perfil":"01 · PERFIL","perfil.h2":"QUIÉN SOY",
"perfil.quote":"Transformo el terreno en información que genera confianza.",
"perfil.bio":"Soy <strong>José Manuel Velazco Ochoa</strong>, <strong>Ingeniero Topógrafo Geomático titulado</strong> por la <strong>Universidad de Colima</strong>. Estoy disponible para <strong>proyectos nacionales e internacionales</strong>. Integro levantamientos con <strong>estación total, GNSS y dron RTK</strong>, procesamiento en <strong>SIG</strong> y <strong>automatización en Python</strong> para entregar <strong>información confiable</strong> que apoye cada decisión en campo.",
"perfil.p1t":"MEDIR","perfil.p1":"Levantamientos en campo con estación total, GNSS y dron RTK: el dato nace en el terreno, con precisión verificable.",
"perfil.p2t":"ANALIZAR","perfil.p2":"Procesamiento en SIG, cartografía temática y automatización con Python para convertir datos en información útil.",
"perfil.p3t":"DECIDIR","perfil.p3":"Una buena decisión comienza con datos precisos: entrego información clara para que cada proyecto inicie sobre una base sólida.",
"cred.top":"⌖ GEOMÁTICA · MX","cred.cedula":"CÉDULA","cred.nac":"NAC.","cred.orig":"ORIGEN","cred.stamp":"TITULADO ✓","cred.back":"⌖ FICHA TÉCNICA","cred.nativo":"NATIVO",
"cred.flip":"⇄ GIRAR FICHA","cred.flipback":"⇄ VER FRENTE","cred.hint":"CLIC O ENTER SOBRE LA FICHA PARA GIRARLA",
"sec.exp":"02 · TRAYECTORIA","exp.h2":"EXPERIENCIA DE CAMPO","exp.maptitle":"⌖ CARTA 3D · MÉXICO",
"exp.zoomin":"Acercar","exp.zoomout":"Alejar","exp.reset":"Restablecer",
"exp.searchph":"🔍 Buscar puesto, empresa, herramienta o lugar...","exp.status":"CARGANDO ESCENA 3D…",
"exp.autofit":"ENCUADRE AUTOMÁTICO","exp.geoms":"GEOMETRÍAS","exp.states":"ESTADOS DESTACADOS","exp.records":"EXPERIENCIAS","exp.yearsExperience":"AÑOS DE EXPERIENCIA","exp.zoomhint":"ZOOM P/ MARCADORES",
"exp.inegi":"INEGI 2025","exp.clickState":"CLIC EN UN ESTADO PARA VER MUNICIPIOS","exp.viewWork":"VER TRABAJOS","exp.hideWork":"OCULTAR TRABAJOS","exp.close":"Cerrar",
"exp.municipalities":"MUNICIPIOS","exp.loadingMunicipalities":"CARGANDO MUNICIPIOS","exp.resetMunicipalities":"USA ⟲ PARA VISTA NACIONAL","exp.municipalitiesUnavailable":"NO SE PUDO CARGAR LA CAPA MUNICIPAL","exp.municipality":"MUNICIPIO","exp.municipalityInfo":"FICHA TERRITORIAL","exp.stateInfo":"FICHA ESTATAL","exp.geoKey":"CLAVE GEOESTADÍSTICA","exp.agemKey":"CLAVE AGEM","exp.ageeKey":"CLAVE AGEE","exp.officialCodes":"CLAVES OFICIALES INEGI","exp.entityKey":"ENTIDAD","exp.municipalKey":"MUNICIPIO","exp.territorialLevel":"NIVEL","exp.mgEdition":"MARCO GEOESTADÍSTICO 2025","exp.mgCut":"BASE JULIO 2025","exp.officialInegi":"VER CATÁLOGO OFICIAL INEGI ↗","exp.loadingSummary":"CONSULTANDO RESEÑA…","exp.moreAbout":"VER MÁS SOBRE ESTE MUNICIPIO ↗","exp.moreAboutState":"VER MÁS SOBRE ESTE ESTADO ↗","exp.sourceWikipedia":"Fuente: Wikipedia","exp.sourceInegi":"Fuente: INEGI","exp.municipalityFallback":"{name} es un municipio de {state}, México. Su clave geoestadística permite identificarlo dentro del Marco Geoestadístico Integrado 2025.","exp.stateFallback":"{name} es una entidad federativa de México, identificada en el Marco Geoestadístico 2025 mediante su clave estatal.","exp.municipalityFoot":"Consulta territorial · DATOS DE INEGI 2025","exp.stateFoot":"Consulta estatal · DATOS DE INEGI 2025",
"exp.all":"TODOS","exp.pais":"PAÍS","exp.vermap":"⌖ VER EN MAPA","exp.nomatch":"Sin coincidencias.",
"exp.reg":"REGISTRO","exp.regs":"REGISTROS","exp.de":"DE",
"exp.statExp":"EXPERIENCIAS","exp.statEst":"ESTADOS","exp.statCampo":"DE CAMPO","exp.totalExperience":"EXPERIENCIA ACUMULADA",
"exp.año":"AÑO","exp.años":"AÑOS","exp.mes":"MES","exp.meses":"MESES",
"exp.estado":"ESTADO","exp.jobs1":"trabajo(s) registrado(s)","exp.mun":"municipio(s) con registro","exp.detail":"Haz clic en un trabajo para ver su detalle","exp.click":"clic para ver trabajos","exp.paisname":"México",
"sec.edu":"03 · FORMACIÓN","edu.h2":"EDUCACIÓN","edu.uni":"UNIVERSIDAD DE COLIMA · COLIMA, MÉXICO",
"edu.tit":"TITULADO","edu.ced":"CÉDULA Nº 15282631","edu.verify":"VERIFICAR TITULACIÓN",
"edu.tesisTag":"PRÁCTICA PROFESIONAL · PROYECTO APLICADO",
"edu.tesisQ":"Análisis geoespacial para la identificación de sitios óptimos para estaciones de monitoreo de calidad del aire en el estado de Colima.",
"edu.tesisP":"Trabajo derivado del Proyecto CONAHCYT Nº 321542, con aplicación directa en políticas ambientales estatales.",
"sec.skills":"04 · ARSENAL TÉCNICO","skills.h2":"HERRAMIENTAS Y COMPETENCIAS",
"sk.sig":"Software SIG","sk.an":"Análisis Espacial","sk.geo":"Geodesia y GNSS","sk.topo":"Topografía y CAD","sk.campo":"Equipo de Campo","sk.idi":"Idiomas",
"sk.b2":"PYTHON · AUTOMATIZACIÓN","sk.b3":"ANÁLISIS TERRITORIAL","sk.b4":"TELEDETECCIÓN","sk.b5":"POSTPROCESO GEODÉSICO","sk.b7":"MODELADO DIGITAL","sk.b8":"LEVANTAMIENTO Y PRECISIÓN",
"sk.es":"ESPAÑOL · NATIVO","sk.en":"INGLÉS · B1","sk.pt":"PORTUGUÉS · B1",
"chip.multi":"Multicriterio","chip.suelo":"Cambio de uso de suelo","chip.islas":"Islas de calor","chip.heat":"Heat maps",
"chip.efem":"Efemérides precisas","chip.atx":"Antenas .atx","chip.redes":"Ajuste de redes",
"chip.mde":"MDE","chip.curvas":"Curvas de nivel","chip.vol":"Volúmenes",
"chip.estot":"Estación Total","chip.nivel":"Nivel Fijo",
"sec.cert":"05 · ACREDITACIONES","cert.h2":"CERTIFICADOS","cert.allyears":"Todos los años","cert.alliss":"Todas las instituciones",
"cert.ph":"🔍 Buscar por nombre, institución o año...","cert.noresults":"Sin resultados para tu búsqueda.","cert.showing":"Mostrando","cert.de":"de","cert.try":"Prueba:","cert.badge":"CERTIFICADO","cert.view":"Vista de consulta","cert.imgerr":"No se pudo cargar la imagen.",
"cert.statsCerts":"CERTIFICADOS","cert.statsInst":"INSTITUCIONES","cert.statsYears":"AÑOS","cert.clear":"LIMPIAR FILTROS","cert.ver":"VER",
"v.badge":"VERIFICACIÓN OFICIAL","v.h3":"Título Profesional · Universidad de Colima","v.iss":"Ingeniero Topógrafo Geomático · Cédula Nº 15282631",
"v.ready":"Vista previa disponible","v.official":"Consultar página oficial ↗","v.connecting":"Preparando vista previa…","v.validating":"La validación se realiza en el portal oficial","v.showing":"Mostrando captura de referencia…","v.done":"Vista previa · consulta oficial disponible ↗",
"v.noshot":"Captura local no disponible","v.fallH":"Captura local no encontrada",
"v.fallP":"Guarda tu captura como verificacion.png (o verificacion.jpg) junto al index.html para mostrarla aquí. Mientras tanto, la fuente oficial sigue disponible:",
"v.open":"ABRIR VERIFICACIÓN OFICIAL ↗","v.copy":"COPIAR ENLACE","v.copied":"ENLACE COPIADO ✓","v.foot":"Fuente oficial: Universidad de Colima ·",
"sec.award":"06 · DISTINCIÓN","award.h2":"PONENCIA ACADÉMICA","award.tag":"UNIVERSIDAD DE COLIMA · MAYO 2023",
"award.title":"\"Análisis espacial para identificar sitios óptimos del territorio para la instalación de estaciones de medición de la calidad del aire\"",
"award.p":"Presentación de los resultados de la investigación aplicada con CONAHCYT ante audiencia académica y técnica.",
"sec.contact":"07 · CONECTEMOS","contact.h2":"UBIQUEMOS TU PRÓXIMO <span>PROYECTO</span>",
"contact.lead":"¿Necesitas levantar, modelar o analizar un territorio? Estoy a un mensaje de distancia — sin fronteras.",
"contact.head":"ESCRÍBEME",
"contact.nombre":"NOMBRE","contact.correo":"CORREO","contact.mensaje":"MENSAJE *",
"contact.phName":"Tu nombre","contact.phMail":"tucorreo@ejemplo.com","contact.phMsg":"Ubicación, alcance, plazos… cuéntame sobre tu proyecto.",
"contact.submit":"ABRIR EN TU CORREO ✉",
"contact.mail":"CORREO","contact.tel":"TELÉFONO","contact.linkedin":"LINKEDIN","contact.copy":"COPIAR","contact.open":"ABRIR ↗",
"contact.avail":"DISPONIBLE PARA PROYECTOS","contact.clock":"HORA LOCAL",
"contact.subj":"Proyecto ·","contact.web":"Contacto web","contact.from":"(Enviado desde el portafolio web)","contact.sinname":"Sin nombre",
"foot.role":"INGENIERO TOPÓGRAFO GEOMÁTICO","foot.made":"HECHO EN COLIMA, MX ⌖"
},
en: {
"doc.title":"José Manuel Velazco Ochoa · Geomatics Topographic Engineer",
"nav.perfil":"PROFILE","nav.experiencia":"EXPERIENCE","nav.educacion":"EDUCATION","nav.habilidades":"SKILLS","nav.certificados":"CERTIFICATES","nav.contacto":"CONTACT",
"nav.tema":"Toggle theme","lang.label":"Language",
"boot.sr":"Loading professional portfolio…","boot.role":"Geomatics Topographic Engineer",
"boot.welcome":"Welcome · Preparing your professional experience...","boot.skip":"Click · Enter — skip",
"boot.m1":"INITIALIZING SYSTEM…","boot.m2":"CALIBRATING GNSS…","boot.m3":"LOADING PROFILE…","boot.m4":"READY ✓",
"hero.tag":"PROFESSIONAL PORTFOLIO · CV 2026","hero.role":"GEOMATICS TOPOGRAPHIC ENGINEER",
"hero.pill1":"AVAILABLE FOR PROJECTS","hero.pill2":"⌖ COLIMA, MEXICO","hero.pill3":"LICENSE NO. 15282631",
"hero.cta1":"VIEW CAREER ↓","hero.cta2":"GET IN TOUCH",
"mq.1":"ARCGIS PRO","mq.2":"AUTOCAD CIVIL 3D","mq.3":"PYTHON","mq.4":"REMOTE SENSING","mq.5":"GNSS","mq.6":"PHOTOGRAMMETRY","mq.7":"THEMATIC CARTOGRAPHY","mq.8":"SPATIAL ANALYSIS","mq.9":"GEODESY","mq.10":"ENVIRONMENTAL MONITORING",
"sec.perfil":"01 · PROFILE","perfil.h2":"WHO I AM",
"perfil.quote":"I turn terrain into information that builds trust.",
"perfil.bio":"I am <strong>José Manuel Velazco Ochoa</strong>, a <strong>licensed Geomatics Topographic Engineer</strong> from the <strong>University of Colima</strong>. I am available for <strong>national and international projects</strong>. I integrate <strong>total-station, GNSS and RTK-drone surveys</strong>, <strong>GIS</strong> processing and <strong>Python automation</strong> to deliver <strong>reliable information</strong> for every field decision.",
"perfil.p1t":"MEASURE","perfil.p1":"Field surveys with total station, GNSS and RTK drone: data is born in the field, with verifiable precision.",
"perfil.p2t":"ANALYZE","perfil.p2":"GIS processing, thematic cartography and Python automation to turn data into useful information.",
"perfil.p3t":"DECIDE","perfil.p3":"A good decision starts with accurate data: I deliver clear information so every project begins on solid ground.",
"cred.top":"⌖ GEOMATICS · MX","cred.cedula":"LICENSE","cred.nac":"BORN","cred.orig":"ORIGIN","cred.stamp":"LICENSED ✓","cred.back":"⌖ TECHNICAL SHEET","cred.nativo":"NATIVE",
"cred.flip":"⇄ FLIP CARD","cred.flipback":"⇄ VIEW FRONT","cred.hint":"CLICK OR ENTER ON THE CARD TO FLIP IT",
"sec.exp":"02 · CAREER","exp.h2":"FIELD EXPERIENCE","exp.maptitle":"⌖ 3D MAP · MEXICO",
"exp.zoomin":"Zoom in","exp.zoomout":"Zoom out","exp.reset":"Reset",
"exp.searchph":"🔍 Search role, company, tool or place...","exp.status":"LOADING 3D SCENE…",
"exp.autofit":"AUTO FRAMING","exp.geoms":"GEOMETRIES","exp.states":"HIGHLIGHTED STATES","exp.records":"EXPERIENCES","exp.yearsExperience":"YEARS OF EXPERIENCE","exp.zoomhint":"ZOOM FOR MARKERS",
"exp.inegi":"INEGI 2025","exp.clickState":"CLICK A STATE TO VIEW MUNICIPALITIES","exp.viewWork":"VIEW WORK","exp.hideWork":"HIDE WORK","exp.close":"Close",
"exp.municipalities":"MUNICIPALITIES","exp.loadingMunicipalities":"LOADING MUNICIPALITIES","exp.resetMunicipalities":"USE ⟲ FOR NATIONAL VIEW","exp.municipalitiesUnavailable":"MUNICIPAL LAYER COULD NOT BE LOADED","exp.municipality":"MUNICIPALITY","exp.municipalityInfo":"TERRITORIAL PROFILE","exp.stateInfo":"STATE PROFILE","exp.geoKey":"GEO-STATISTICAL CODE","exp.agemKey":"AGEM CODE","exp.ageeKey":"AGEE CODE","exp.officialCodes":"OFFICIAL INEGI CODES","exp.entityKey":"STATE","exp.municipalKey":"MUNICIPALITY","exp.territorialLevel":"LEVEL","exp.mgEdition":"GEO-STATISTICAL FRAMEWORK 2025","exp.mgCut":"JULY 2025 BASE","exp.officialInegi":"VIEW OFFICIAL INEGI CATALOG ↗","exp.loadingSummary":"LOADING SUMMARY…","exp.moreAbout":"LEARN MORE ABOUT THIS MUNICIPALITY ↗","exp.moreAboutState":"LEARN MORE ABOUT THIS STATE ↗","exp.sourceWikipedia":"Source: Wikipedia","exp.sourceInegi":"Source: INEGI","exp.municipalityFallback":"{name} is a municipality in {state}, Mexico. Its geo-statistical code identifies it within the 2025 Integrated Geo-statistical Framework.","exp.stateFallback":"{name} is a Mexican state identified in the 2025 Geo-statistical Framework by its state code.","exp.municipalityFoot":"Territorial reference · INEGI 2025 data","exp.stateFoot":"State reference · INEGI 2025 data",
"exp.all":"ALL","exp.pais":"COUNTRY","exp.vermap":"⌖ VIEW ON MAP","exp.nomatch":"No matches.",
"exp.reg":"RECORD","exp.regs":"RECORDS","exp.de":"OF",
"exp.statExp":"EXPERIENCES","exp.statEst":"STATES","exp.statCampo":"IN THE FIELD","exp.totalExperience":"TOTAL EXPERIENCE",
"exp.año":"YEAR","exp.años":"YEARS","exp.mes":"MONTH","exp.meses":"MONTHS",
"exp.estado":"STATE","exp.jobs1":"registered job(s)","exp.mun":"municipality(ies) with records","exp.detail":"Click a job to see its details","exp.click":"click to view jobs","exp.paisname":"Mexico",
"sec.edu":"03 · EDUCATION","edu.h2":"EDUCATION","edu.uni":"UNIVERSITY OF COLIMA · COLIMA, MEXICO",
"edu.tit":"LICENSED","edu.ced":"LICENSE NO. 15282631","edu.verify":"VERIFY DEGREE",
"edu.tesisTag":"PROFESSIONAL PRACTICE · APPLIED PROJECT",
"edu.tesisQ":"Geospatial analysis to identify optimal sites for air-quality monitoring stations in the state of Colima.",
"edu.tesisP":"Work derived from CONAHCYT Project No. 321542, with direct application in state environmental policy.",
"sec.skills":"04 · TECHNICAL ARSENAL","skills.h2":"TOOLS & COMPETENCIES",
"sk.sig":"GIS Software","sk.an":"Spatial Analysis","sk.geo":"Geodesy & GNSS","sk.topo":"Surveying & CAD","sk.campo":"Field Equipment","sk.idi":"Languages",
"sk.b2":"PYTHON · AUTOMATION","sk.b3":"TERRITORIAL ANALYSIS","sk.b4":"REMOTE SENSING","sk.b5":"GEODETIC POST-PROCESSING","sk.b7":"DIGITAL MODELING","sk.b8":"SURVEYING & PRECISION",
"sk.es":"SPANISH · NATIVE","sk.en":"ENGLISH · B1","sk.pt":"PORTUGUESE · B1",
"chip.multi":"Multi-criteria","chip.suelo":"Land use change","chip.islas":"Heat islands","chip.heat":"Heat maps",
"chip.efem":"Precise ephemeris","chip.atx":".atx antennas","chip.redes":"Network adjustment",
"chip.mde":"DEM","chip.curvas":"Contour lines","chip.vol":"Volumes",
"chip.estot":"Total Station","chip.nivel":"Fixed Level",
"sec.cert":"05 · CREDENTIALS","cert.h2":"CERTIFICATES","cert.allyears":"All years","cert.alliss":"All institutions",
"cert.ph":"🔍 Search by name, institution or year...","cert.noresults":"No results for your search.","cert.showing":"Showing","cert.de":"of","cert.try":"Try:","cert.badge":"CERTIFICATE","cert.view":"Reference view","cert.imgerr":"Image could not be loaded.",
"cert.statsCerts":"CERTIFICATES","cert.statsInst":"INSTITUTIONS","cert.statsYears":"YEARS","cert.clear":"CLEAR FILTERS","cert.ver":"VIEW",
"v.badge":"OFFICIAL VERIFICATION","v.h3":"Professional Degree · University of Colima","v.iss":"Geomatics Topographic Engineer · License No. 15282631",
"v.ready":"Preview available","v.official":"Visit official page ↗","v.connecting":"Preparing preview…","v.validating":"Validation is performed on the official portal","v.showing":"Showing reference screenshot…","v.done":"Preview · official lookup available ↗",
"v.noshot":"Local snapshot unavailable","v.fallH":"Local snapshot not found",
"v.fallP":"Save your screenshot as verificacion.png (or verificacion.jpg) next to index.html to display it here. Meanwhile, the official source remains available:",
"v.open":"OPEN OFFICIAL VERIFICATION ↗","v.copy":"COPY LINK","v.copied":"LINK COPIED ✓","v.foot":"Official source: University of Colima ·",
"sec.award":"06 · DISTINCTION","award.h2":"ACADEMIC TALK","award.tag":"UNIVERSITY OF COLIMA · MAY 2023",
"award.title":"\"Spatial analysis to identify optimal territorial sites for installing air-quality measurement stations\"",
"award.p":"Presentation of the applied CONAHCYT research results before an academic and technical audience.",
"sec.contact":"07 · LET'S CONNECT","contact.h2":"LET'S LOCATE YOUR NEXT <span>PROJECT</span>",
"contact.lead":"Need to survey, model or analyze a territory? I'm one message away — no borders.",
"contact.head":"WRITE ME",
"contact.nombre":"NAME","contact.correo":"EMAIL","contact.mensaje":"MESSAGE *",
"contact.phName":"Your name","contact.phMail":"yourmail@example.com","contact.phMsg":"Location, scope, deadlines… tell me about your project.",
"contact.submit":"OPEN IN YOUR MAIL ✉",
"contact.mail":"EMAIL","contact.tel":"PHONE","contact.linkedin":"LINKEDIN","contact.copy":"COPY","contact.open":"OPEN ↗",
"contact.avail":"AVAILABLE FOR PROJECTS","contact.clock":"LOCAL TIME",
"contact.subj":"Project ·","contact.web":"Web contact","contact.from":"(Sent from the web portfolio)","contact.sinname":"No name",
"foot.role":"GEOMATICS TOPOGRAPHIC ENGINEER","foot.made":"MADE IN COLIMA, MX ⌖"
},
pt: {
"doc.title":"José Manuel Velazco Ochoa · Engenheiro Topógrafo Geomático",
"nav.perfil":"PERFIL","nav.experiencia":"EXPERIÊNCIA","nav.educacion":"EDUCAÇÃO","nav.habilidades":"HABILIDADES","nav.certificados":"CERTIFICADOS","nav.contacto":"CONTATO",
"nav.tema":"Alterar tema","lang.label":"Idioma",
"boot.sr":"Carregando portfólio profissional…","boot.role":"Engenheiro Topógrafo Geomático",
"boot.welcome":"Bem-vindo · Preparando sua experiência profissional...","boot.skip":"Clique · Enter — pular",
"boot.m1":"INICIALIZANDO SISTEMA…","boot.m2":"CALIBRANDO GNSS…","boot.m3":"CARREGANDO PERFIL…","boot.m4":"PRONTO ✓",
"hero.tag":"PORTFÓLIO PROFISSIONAL · CV 2026","hero.role":"ENGENHEIRO TOPÓGRAFO GEOMÁTICO",
"hero.pill1":"DISPONÍVEL PARA PROJETOS","hero.pill2":"⌖ COLIMA, MÉXICO","hero.pill3":"CÉDULA 15282631",
"hero.cta1":"VER TRAJETÓRIA ↓","hero.cta2":"ENTRAR EM CONTATO",
"mq.1":"ARCGIS PRO","mq.2":"AUTOCAD CIVIL 3D","mq.3":"PYTHON","mq.4":"SENSORIAMENTO REMOTO","mq.5":"GNSS","mq.6":"FOTOGRAMETRIA","mq.7":"CARTOGRAFIA TEMÁTICA","mq.8":"ANÁLISE ESPACIAL","mq.9":"GEODÉSIA","mq.10":"MONITORAMENTO AMBIENTAL",
"sec.perfil":"01 · PERFIL","perfil.h2":"QUEM SOU",
"perfil.quote":"Transformo o terreno em informação que gera confiança.",
"perfil.bio":"Sou <strong>José Manuel Velazco Ochoa</strong>, <strong>Engenheiro Topógrafo Geomático formado</strong> pela <strong>Universidade de Colima</strong>. Estou disponível para <strong>projetos nacionais e internacionais</strong>. Integro levantamentos com <strong>estação total, GNSS e drone RTK</strong>, processamento em <strong>SIG</strong> e <strong>automação em Python</strong> para entregar <strong>informação confiável</strong> em cada decisão de campo.",
"perfil.p1t":"MEDIR","perfil.p1":"Levantamentos de campo com estação total, GNSS e drone RTK: o dado nasce no terreno, com precisão verificável.",
"perfil.p2t":"ANALISAR","perfil.p2":"Processamento em SIG, cartografia temática e automação com Python para transformar dados em informação útil.",
"perfil.p3t":"DECIDIR","perfil.p3":"Uma boa decisão começa com dados precisos: entrego informação clara para que cada projeto comece sobre uma base sólida.",
"cred.top":"⌖ GEOMÁTICA · MX","cred.cedula":"CÉDULA","cred.nac":"NASC.","cred.orig":"ORIGEM","cred.stamp":"TITULADO ✓","cred.back":"⌖ FICHA TÉCNICA","cred.nativo":"NATIVO",
"cred.flip":"⇄ VIRAR FICHA","cred.flipback":"⇄ VER FRENTE","cred.hint":"CLIQUE OU ENTER NA FICHA PARA VIRÁ-LA",
"sec.exp":"02 · TRAJETÓRIA","exp.h2":"EXPERIÊNCIA DE CAMPO","exp.maptitle":"⌖ MAPA 3D · MÉXICO",
"exp.zoomin":"Aproximar","exp.zoomout":"Afastar","exp.reset":"Restaurar",
"exp.searchph":"🔍 Buscar cargo, empresa, ferramenta ou lugar...","exp.status":"CARREGANDO CENA 3D…",
"exp.autofit":"ENQUADRAMENTO AUTOMÁTICO","exp.geoms":"GEOMETRIAS","exp.states":"ESTADOS DESTACADOS","exp.records":"EXPERIÊNCIAS","exp.yearsExperience":"ANOS DE EXPERIÊNCIA","exp.zoomhint":"ZOOM P/ MARCADORES",
"exp.inegi":"INEGI 2025","exp.clickState":"CLIQUE EM UM ESTADO PARA VER MUNICÍPIOS","exp.viewWork":"VER TRABALHOS","exp.hideWork":"OCULTAR TRABALHOS","exp.close":"Fechar",
"exp.municipalities":"MUNICÍPIOS","exp.loadingMunicipalities":"CARREGANDO MUNICÍPIOS","exp.resetMunicipalities":"USE ⟲ PARA A VISTA NACIONAL","exp.municipalitiesUnavailable":"NÃO FOI POSSÍVEL CARREGAR A CAMADA MUNICIPAL","exp.municipality":"MUNICÍPIO","exp.municipalityInfo":"FICHA TERRITORIAL","exp.stateInfo":"FICHA ESTADUAL","exp.geoKey":"CHAVE GEOESTATÍSTICA","exp.agemKey":"CHAVE AGEM","exp.ageeKey":"CHAVE AGEE","exp.officialCodes":"CHAVES OFICIAIS INEGI","exp.entityKey":"ENTIDADE","exp.municipalKey":"MUNICÍPIO","exp.territorialLevel":"NÍVEL","exp.mgEdition":"MARCO GEOESTATÍSTICO 2025","exp.mgCut":"BASE JULHO 2025","exp.officialInegi":"VER CATÁLOGO OFICIAL INEGI ↗","exp.loadingSummary":"CONSULTANDO RESUMO…","exp.moreAbout":"VER MAIS SOBRE ESTE MUNICÍPIO ↗","exp.moreAboutState":"VER MAIS SOBRE ESTE ESTADO ↗","exp.sourceWikipedia":"Fonte: Wikipedia","exp.sourceInegi":"Fonte: INEGI","exp.municipalityFallback":"{name} é um município de {state}, México. Sua chave geoestatística permite identificá-lo no Marco Geoestatístico Integrado 2025.","exp.stateFallback":"{name} é uma entidade federativa do México, identificada no Marco Geoestatístico 2025 pela sua chave estadual.","exp.municipalityFoot":"Referência territorial · DADOS DO INEGI 2025","exp.stateFoot":"Consulta estadual · DADOS DO INEGI 2025",
"exp.all":"TODOS","exp.pais":"PAÍS","exp.vermap":"⌖ VER NO MAPA","exp.nomatch":"Sem coincidências.",
"exp.reg":"REGISTRO","exp.regs":"REGISTROS","exp.de":"DE",
"exp.statExp":"EXPERIÊNCIAS","exp.statEst":"ESTADOS","exp.statCampo":"DE CAMPO","exp.totalExperience":"EXPERIÊNCIA ACUMULADA",
"exp.año":"ANO","exp.años":"ANOS","exp.mes":"MÊS","exp.meses":"MESES",
"exp.estado":"ESTADO","exp.jobs1":"trabalho(s) registrado(s)","exp.mun":"munícipio(s) com registro","exp.detail":"Clique em um trabalho para ver os detalhes","exp.click":"clique para ver trabalhos","exp.paisname":"México",
"sec.edu":"03 · FORMAÇÃO","edu.h2":"EDUCAÇÃO","edu.uni":"UNIVERSIDADE DE COLIMA · COLIMA, MÉXICO",
"edu.tit":"TITULADO","edu.ced":"CÉDULA Nº 15282631","edu.verify":"VERIFICAR TITULAÇÃO",
"edu.tesisTag":"PRÁTICA PROFISSIONAL · PROJETO APLICADO",
"edu.tesisQ":"Análise geoespacial para identificar locais ideais para estações de monitoramento da qualidade do ar no estado de Colima.",
"edu.tesisP":"Trabalho derivado do Projeto CONAHCYT Nº 321542, com aplicação direta em políticas ambientais estaduais.",
"sec.skills":"04 · ARSENAL TÉCNICO","skills.h2":"FERRAMENTAS E COMPETÊNCIAS",
"sk.sig":"Software SIG","sk.an":"Análise Espacial","sk.geo":"Geodésia e GNSS","sk.topo":"Topografia e CAD","sk.campo":"Equipamento de Campo","sk.idi":"Idiomas",
"sk.b2":"PYTHON · AUTOMATIZAÇÃO","sk.b3":"ANÁLISE TERRITORIAL","sk.b4":"SENSORIAMENTO REMOTO","sk.b5":"PÓS-PROCESSAMENTO GEODÉSICO","sk.b7":"MODELAGEM DIGITAL","sk.b8":"LEVANTAMENTO E PRECISÃO",
"sk.es":"ESPANHOL · NATIVO","sk.en":"INGLÊS · B1","sk.pt":"PORTUGUÊS · B1",
"chip.multi":"Multicritério","chip.suelo":"Mudança de uso do solo","chip.islas":"Ilhas de calor","chip.heat":"Mapas de calor",
"chip.efem":"Efemérides precisas","chip.atx":"Antenas .atx","chip.redes":"Ajustamento de redes",
"chip.mde":"MDE","chip.curvas":"Curvas de nível","chip.vol":"Volumes",
"chip.estot":"Estação Total","chip.nivel":"Nível fixo",
"sec.cert":"05 · CERTIFICAÇÕES","cert.h2":"CERTIFICADOS","cert.allyears":"Todos os anos","cert.alliss":"Todas as instituições",
"cert.ph":"🔍 Buscar por nome, instituição ou ano...","cert.noresults":"Sem resultados para sua busca.","cert.showing":"Mostrando","cert.de":"de","cert.try":"Tente:","cert.badge":"CERTIFICADO","cert.view":"Vista de consulta","cert.imgerr":"Não foi possível carregar a imagem.",
"cert.statsCerts":"CERTIFICADOS","cert.statsInst":"INSTITUIÇÕES","cert.statsYears":"ANOS","cert.clear":"LIMPAR FILTROS","cert.ver":"VER",
"v.badge":"VERIFICAÇÃO OFICIAL","v.h3":"Título Profissional · Universidade de Colima","v.iss":"Engenheiro Topógrafo Geomático · Cédula Nº 15282631",
"v.ready":"Visualização disponível","v.official":"Consultar página oficial ↗","v.connecting":"Preparando visualização…","v.validating":"A validação é realizada no portal oficial","v.showing":"Mostrando captura de referência…","v.done":"Visualização · consulta oficial disponível ↗",
"v.noshot":"Captura local indisponível","v.fallH":"Captura local não encontrada",
"v.fallP":"Salve sua captura como verificacion.png (ou verificacion.jpg) junto ao index.html para exibi-la aqui. Enquanto isso, a fonte oficial continua disponível:",
"v.open":"ABRIR VERIFICAÇÃO OFICIAL ↗","v.copy":"COPIAR LINK","v.copied":"LINK COPIADO ✓","v.foot":"Fonte oficial: Universidade de Colima ·",
"sec.award":"06 · DISTINÇÃO","award.h2":"PALESTRA ACADÊMICA","award.tag":"UNIVERSIDADE DE COLIMA · MAIO 2023",
"award.title":"\"Análise espacial para identificar locais ideais do território para a instalação de estações de medição da qualidade do ar\"",
"award.p":"Apresentação dos resultados da pesquisa aplicada com CONAHCYT perante audiência acadêmica e técnica.",
"sec.contact":"07 · VAMOS CONECTAR","contact.h2":"VAMOS LOCALIZAR SEU PRÓXIMO <span>PROJETO</span>",
"contact.lead":"Precisa levantar, modelar ou analisar um território? Estou a uma mensagem de distância — sem fronteiras.",
"contact.head":"ESCREVA-ME",
"contact.nombre":"NOME","contact.correo":"E-MAIL","contact.mensaje":"MENSAGEM *",
"contact.phName":"Seu nome","contact.phMail":"seumail@exemplo.com","contact.phMsg":"Localização, escopo, prazos… conte-me sobre seu projeto.",
"contact.submit":"ABRIR NO SEU E-MAIL ✉",
"contact.mail":"E-MAIL","contact.tel":"TELEFONE","contact.linkedin":"LINKEDIN","contact.copy":"COPIAR","contact.open":"ABRIR ↗",
"contact.avail":"DISPONÍVEL PARA PROJETOS","contact.clock":"HORA LOCAL",
"contact.subj":"Projeto ·","contact.web":"Contato web","contact.from":"(Enviado pelo portfólio web)","contact.sinname":"Sem nome",
"foot.role":"ENGENHEIRO TOPÓGRAFO GEOMÁTICO","foot.made":"FEITO EM COLIMA, MX ⌖"
}};

export function t(key){
  const d = DICT[lang] || DICT.es;
  return (d && d[key] != null) ? d[key] : (DICT.es[key] != null ? DICT.es[key] : key);
}

export function applyI18n(){
  document.documentElement.lang = lang;
  document.title = t("doc.title");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
}

export function setLang(l){
  if (!LANGS.includes(l) || l === lang) return;
  lang = l;
  try { localStorage.setItem("lang", l); } catch (_) {}
  applyI18n();
  dispatchEvent(new CustomEvent("jv:lang", { detail: l }));
}

export function initI18n(){
  applyI18n();
  const wrap = document.getElementById("langswitch");
  if (!wrap) return;
  const sync = () => wrap.querySelectorAll("button").forEach(b => {
    const on = b.dataset.lang === lang;
    b.classList.toggle("act", on); b.setAttribute("aria-pressed", String(on));
  });
  wrap.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { setLang(b.dataset.lang); sync(); }));
  sync();
}
