/* ============================================================
   js/data.js — Experiencias profesionales (fuente única)
   Campos traducibles como {es,en,pt}; canónicos planos.
   Actualizado según CV v2 (JOSE_MANUEL_VELAZCO_OCHOA_CV_ES_2.pdf):
   · SEDENA: fin 2025-10; logros re-redactados (tono de apoyo).
   · CONAHCYT: 2 logros re-redactados.
   · CRETEC: "Auxiliar de Supervisor de Obras"; empresa + S.A. de C.V.;
     ciudad Cuauhtémoc, Colima; 2 logros re-redactados.
============================================================ */
export const EXPERIENCIAS = [
  { inicio: "2025-10", fin: "2025-10",
    dur: { es: "1 mes", en: "1 month", pt: "1 mês" },
    pais: "México", estado: "Jalisco", ciudad: "Guadalajara", coords: [20.67, -103.35],
    puesto: { es: "Cadista / Dibujante CAD", en: "CAD Draftsman", pt: "Desenhista / Cadista CAD" },
    empresa: { es: "Secretaría de la Defensa Nacional", en: "National Defense Secretariat", pt: "Secretaria de Defesa Nacional" },
    sigla: "SEDENA",
    logros: {
      es: ["Apoyé en la elaboración y actualización de planos técnicos mediante herramientas CAD.", "Participé en cálculos volumétricos y análisis de nivelación como apoyo a trabajos relacionados con el terreno."],
      en: ["Supported the preparation and updating of technical drawings using CAD tools.", "Took part in volume calculations and leveling analysis as support for terrain-related work."],
      pt: ["Apoiei na elaboração e atualização de desenhos técnicos por meio de ferramentas CAD.", "Participei de cálculos volumétricos e análises de nivelamento como apoio a trabalhos relacionados ao terreno."]
    },
    tools: { es: ["AutoCAD Civil 3D", "Modelado de superficies", "Cálculo volumétrico"], en: ["AutoCAD Civil 3D", "Surface modeling", "Volume calculation"], pt: ["AutoCAD Civil 3D", "Modelagem de superfícies", "Cálculo volumétrico"] } },

  { inicio: "2021-12", fin: "2024-11",
    dur: { es: "3 años", en: "3 years", pt: "3 anos" },
    pais: "México", estado: "Colima", ciudad: "Colima", coords: [19.24, -103.72],
    puesto: { es: "Becario de Investigación", en: "Research Fellow", pt: "Bolsista de Pesquisa" },
    empresa: { es: "Sistema Nacional de Investigadores", en: "National System of Researchers", pt: "Sistema Nacional de Pesquisadores" },
    sigla: "CONAHCYT",
    logros: {
      es: ["Desarrollé y validé una metodología para la ubicación óptima de estaciones de monitoreo de calidad del aire, mediante análisis geoespacial y datos territoriales.", "Realicé levantamientos de datos geográficos, cartografía temática y bases de datos geoespaciales para análisis geoambientales e informes técnicos del estado de Colima."],
      en: ["Developed and validated a methodology for the optimal placement of air-quality monitoring stations through geospatial analysis and territorial data.", "Carried out geographic data surveys, thematic cartography and geospatial databases for geo-environmental analyses and technical reports of the state of Colima."],
      pt: ["Desenvolvi e validei uma metodologia para a localização ideal de estaciones de monitoramento da qualidade do ar, por meio de análise geoespacial e dados territoriais.", "Realizei levantamentos de dados geográficos, cartografia temática e bancos de dados geoespaciais para análises geoambientais e relatórios técnicos do estado de Colima."]
    },
    tools: { es: ["ArcGIS Pro", "Cartografía temática", "Geodatabases", "Análisis espacial"], en: ["ArcGIS Pro", "Thematic cartography", "Geodatabases", "Spatial analysis"], pt: ["ArcGIS Pro", "Cartografia temática", "Geodatabases", "Análise espacial"] } },

  { inicio: "2023-01", fin: "2023-09",
    dur: { es: "9 meses", en: "9 months", pt: "9 meses" },
    pais: "México", estado: "Colima", ciudad: "Cuauhtémoc", coords: [19.25, -103.63],
    puesto: { es: "Auxiliar de Supervisor de Obras", en: "Assistant Works Supervisor", pt: "Auxiliar de Supervisor de Obras" },
    empresa: { es: "Corporativo de Estudios Técnicos y de Ingeniería Civil S.A. de C.V.", en: "Technical Studies & Civil Engineering Corporation, S.A. de C.V.", pt: "Corporativo de Estudos Técnicos e Engenharia Civil S.A. de C.V." },
    sigla: "CRETEC",
    logros: {
      es: ["Apoyé en la supervisión y seguimiento de movimientos de tierra, incluyendo el control y cálculo de volúmenes.", "Apoyé en actividades de supervisión en campo, levantamientos topográficos y elaboración de planos y modelos de superficie para el seguimiento de obra."],
      en: ["Supported the supervision and follow-up of earthworks, including control and volume calculation.", "Assisted in field supervision activities, topographic surveys and the preparation of drawings and surface models for works follow-up."],
      pt: ["Apoiei na supervisão e no acompanhamento de movimentos de terra, incluindo controle e cálculo de volumes.", "Apoiei atividades de supervisão em campo, levantamentos topográficos e elaboração de desenhos e modelos de superfície para o acompanhamento da obra."]
    },
    tools: { es: ["Civil 3D", "Estación total", "GPS", "Coordinación de campo"], en: ["Civil 3D", "Total station", "GPS", "Field coordination"], pt: ["Civil 3D", "Estação total", "GPS", "Coordenação de campo"] } },

  { inicio: "2021-01", fin: "2021-07",
    dur: { es: "7 meses", en: "7 months", pt: "7 meses" },
    pais: "México", estado: "Colima", ciudad: "Colima", coords: [19.24, -103.72],
    puesto: { es: "Auxiliar de Topógrafo", en: "Surveyor Assistant", pt: "Auxiliar de Topógrafo" },
    empresa: { es: "Meridiano Topografía", en: "Meridiano Topography", pt: "Meridiano Topografia" },
    sigla: "",
    logros: {
      es: ["Ejecuté levantamientos planimétricos y altimétricos.", "Operé equipos topográficos para captura y análisis de información georreferenciada."],
      en: ["Carried out planimetric and altimetric surveys.", "Operated surveying equipment for capture and analysis of georeferenced information."],
      pt: ["Executei levantamentos planimétricos e altimétricos.", "Operei equipamentos topográficos para captura e análise de informação georreferenciada."]
    },
    tools: { es: ["Estación total", "Nivel fijo", "Levantamientos planimétricos"], en: ["Total station", "Fixed level", "Planimetric surveys"], pt: ["Estação total", "Nível fixo", "Levantamentos planimétricos"] } }
];
