/* ============================================================
   js/data.js — Experiencias profesionales (fuente única)
   Campos traducibles como {es,en,pt}; canónicos planos.
============================================================ */
export const EXPERIENCIAS = [
  { inicio: "2025-10", fin: "2025-11",
    dur: { es: "1 mes", en: "1 month", pt: "1 mês" },
    pais: "México", estado: "Jalisco", ciudad: "Guadalajara", coords: [20.67, -103.35],
    puesto: { es: "Cadista / Dibujante CAD", en: "CAD Draftsman", pt: "Desenhista / Cadista CAD" },
    empresa: { es: "Secretaría de la Defensa Nacional", en: "National Defense Secretariat", pt: "Secretaria de Defesa Nacional" },
    sigla: "SEDENA",
    logros: {
      es: ["Generé planos técnicos y modelos de superficie para proyectos de infraestructura.", "Realicé cálculos volumétricos y análisis de nivelación, apoyando la interpretación geométrica del terreno."],
      en: ["Produced technical drawings and surface models for infrastructure projects.", "Performed volume calculations and leveling analysis, supporting geometric interpretation of terrain."],
      pt: ["Elaborei desenhos técnicos e modelos de superfície para projetos de infraestrutura.", "Realizei cálculos volumétricos e análises de nivelamento, apoiando a interpretação geométrica do terreno."]
    },
    tools: { es: ["AutoCAD Civil 3D", "Modelado de superficies", "Cálculo volumétrico"], en: ["AutoCAD Civil 3D", "Surface modeling", "Volume calculation"], pt: ["AutoCAD Civil 3D", "Modelagem de superfícies", "Cálculo volumétrico"] } },

  { inicio: "2021-12", fin: "2024-11",
    dur: { es: "3 años", en: "3 years", pt: "3 anos" },
    pais: "México", estado: "Colima", ciudad: "Colima", coords: [19.24, -103.72],
    puesto: { es: "Becario de Investigación", en: "Research Fellow", pt: "Bolsista de Pesquisa" },
    empresa: { es: "Sistema Nacional de Investigadores", en: "National System of Researchers", pt: "Sistema Nacional de Pesquisadores" },
    sigla: "CONAHCYT",
    logros: {
      es: ["Propuse y validé una metodología estatal para la ubicación óptima de estaciones de monitoreo de calidad del aire.", "Levantamiento de datos geográficos en campo.", "Desarrollé cartografía temática y bases de datos geoespaciales.", "Colaboré en análisis geoambientales e informes técnicos para el perfil epidemi-toxicológico de Colima · Proyecto Nº 321542."],
      en: ["Proposed and validated a statewide methodology for optimal placement of air-quality monitoring stations.", "Field collection of geographic data.", "Developed thematic cartography and geospatial databases.", "Collaborated on geo-environmental analyses and technical reports for the epi-toxicological profile of Colima · Project No. 321542."],
      pt: ["Propus e validei uma metodologia estadual para a localização ideal de estações de monitoramento da qualidade do ar.", "Levantamento de dados geográficos em campo.", "Desenvolvi cartografia temática e bancos de datos geoespaciais.", "Colaborei em análises geoambientais e relatórios técnicos para o perfil epidemi-toxicológico de Colima · Projeto Nº 321542."]
    },
    tools: { es: ["ArcGIS Pro", "Cartografía temática", "Geodatabases", "Análisis espacial"], en: ["ArcGIS Pro", "Thematic cartography", "Geodatabases", "Spatial analysis"], pt: ["ArcGIS Pro", "Cartografia temática", "Geodatabases", "Análise espacial"] } },

  { inicio: "2023-01", fin: "2023-09",
    dur: { es: "9 meses", en: "9 months", pt: "9 meses" },
    pais: "México", estado: "Colima", ciudad: "Colima", coords: [19.24, -103.72],
    puesto: { es: "Supervisor de Obras", en: "Works Supervisor", pt: "Supervisor de Obras" },
    empresa: { es: "Corporativo de Estudios Técnicos y de Ingeniería Civil", en: "Technical Studies & Civil Engineering Corporation", pt: "Corporativo de Estudos Técnicos e Engenharia Civil" },
    sigla: "CRETEC",
    logros: {
      es: ["Supervisé movimientos de tierra y cálculo de volúmenes en proyectos de gran escala.", "Generé planos técnicos y modelos de superficie para documentación y control de obra.", "Coordiné equipos en campo en el Aeropuerto Internacional de Colima."],
      en: ["Supervised earthworks and volume calculations on large-scale projects.", "Produced technical drawings and surface models for works documentation and control.", "Coordinated field teams at Colima International Airport."],
      pt: ["Supervisionei movimentação de terras e cálculo de volumes em projetos de grande escala.", "Elaborei desenhos técnicos e modelos de superfície para documentação e controle de obra.", "Coordenei equipes de campo no Aeroporto Internacional de Colima."]
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