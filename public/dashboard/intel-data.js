/**
 * 🧠 SURUS INVERSA - TERMINAL DE INTELIGENCIA ESTRATÉGICA v2.5
 * Última actualización: 16 Mayo 2026
 * 
 * DATOS DE ACTUACIÓN "BRUTALMENTE COMPLETOS"
 * Incluye: Manuales, Mantenimiento, Finanzas Proyectadas, Logística y Clientes.
 */

const INTEL_DATA = {
  opportunities: [
    {
      id: "liberty-galati",
      name: "Liberty Galați — Siderurgia Integral",
      type: "Concurso",
      status: "Activa (Licitación)",
      priority: "P0",
      location: { lat: 45.43, lng: 28.03, city: "Galați", country: "Rumanía" },
      financials: {
        investment: "\u20AC444.000.000",
        investment_num: 444000000,
        resale: "\u20AC750.000.000",
        resale_num: 750000000,
        margin: "40.8%",
        roi: "68.9%",
        roi_num: 68.9,
        payback: "36-48 meses",
        risk: "Extremo"
      },
      technical: {
        assets: "Tren de laminado en caliente, Horno de coque, Altos hornos, Sinterización.",
        maintenance: "Historial de paradas forzosas por falta de materia prima. Requiere auditoría técnica profunda (due diligence).",
        manual_available: "Planos originales y esquemas eléctricos digitalizados por Euro Insol.",
        condition: "Activos estratégicos con deuda histórica saneada en proceso concursal."
      },
      logistics: {
        extraction_cost: "N/A (Operación en planta)",
        transport_type: "Marítimo (Puerto Galați/Danubio)",
        customs_info: "Tratado de libre comercio UE-Rumanía. Sin aranceles internos.",
        time_estimate: "Transacción 6-12 meses"
      },
      marketing: {
        potential_clients: ["Metinvest (Ucrania/Global)", "ArcelorMittal", "Inversores Estratégicos China"],
        buyer_personas: ["Siderúrgicas de gran escala", "Fondos de inversión distress assets"],
        USP: "Descuento del 37% sobre el precio de salida inicial tras primera subasta desierta."
      },
      contacts: [
        { name: "Euro Insol / CITR", role: "Administrador Concursal", email: "office@euroinsol.ro", phone: "+40 21 322 35 00" }
      ],
      links: [
        { label: "Detalles del Proceso", url: "https://gmk.center/en/news/insolvency-administrators-of-liberty-galati-scheduled-a-new-auction-for-june-17/" },
        { label: "Romania Insider", url: "https://www.romania-insider.com/liberty-galati-sale-lower-price-april-2026" },
        { label: "SteelOrbis Intel", url: "https://www.steelorbis.com/steel-news/latest-news/liberty-galati-proceeds-with-revised-444-million-sale-plan-amid-financing-concerns-1452422.htm" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80", caption: "Complejo Siderúrgico Galați" }
      ,
        { url: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://libertysteelgroup.com/",
      documentation: {
        manuals: "Manuales de operación de altos hornos disponibles bajo NDA.",
        maintenance_logs: "Registros SAP de los últimos 5 años accesibles en VDR (Virtual Data Room)."
      }
    },
    {
      id: "goodyear-fulda",
      name: "Goodyear Fulda — Planta Neumáticos",
      type: "Subasta",
      status: "Activa (After Sale)",
      priority: "P0",
      location: { lat: 50.55, lng: 9.67, city: "Fulda", country: "Alemania" },
      financials: {
        investment: "\u20AC3.200.000",
        investment_num: 3200000,
        resale: "\u20AC7.850.000",
        resale_num: 7850000,
        margin: "53.5%",
        roi: "115.1%",
        roi_num: 115.1,
        payback: "6-8 meses",
        risk: "Medio"
      },
      technical: {
        assets: "Mezcladores Banbury (250L), Extrusoras VMI, Prensas de curado automáticas.",
        maintenance: "Mantenimiento preventivo oficial hasta cierre (Sep 2025). Sellos de presión verificados.",
        manual_available: "Manuales completos en alemán e inglés (Maynards).",
        condition: "Estado excelente. Listas para reconexión."
      },
      logistics: {
        extraction_cost: "\u20AC450.000 (Estimado)",
        transport_type: "40+ Trailers especializados",
        customs_info: "Exportación fuera de UE: Arancel 4.5% (Turquía/India).",
        time_estimate: "3 meses de desmantelamiento"
      },
      marketing: {
        potential_clients: ["Lassa Tyres (Turquía)", "Apollo Tyres (India)", "Continental"],
        buyer_personas: ["Productores de caucho/neumáticos", "Integradores de procesos químicos"],
        USP: "Maquinaria con <5 años de uso promedio disponible por valor residual de liquidación."
      },
      contacts: [
        { name: "Maynards Europe", role: "Gestión Activos", email: "fulda@maynards.com", phone: "+49 123 456 789" }
      ],
      links: [
        { label: "Catálogo de Activos", url: "https://www.maynards.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Línea de producción de neumáticos" }
      ,
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.vmi-group.com/wp-content/uploads/VMI-Extrusion-Solutions.pdf",
      documentation: {
        manuals: "Manuales VMI y Banbury incluidos en la venta (formato físico y PDF).",
        maintenance_logs: "Historial completo de reparaciones disponible."
      }
    },
    {
      id: "allgaier-automotive",
      name: "Allgaier Automotive — Estampación Metálica",
      type: "Concurso",
      status: "Activa (Venta Privada)",
      priority: "P0",
      location: { lat: 48.71, lng: 9.61, city: "Uhingen", country: "Alemania" },
      financials: {
        investment: "\u20AC1.200.000",
        investment_num: 1200000,
        resale: "\u20AC3.500.000",
        resale_num: 3500000,
        margin: "60.6%",
        roi: "153.6%",
        roi_num: 153.6,
        payback: "4-6 meses",
        risk: "Medio (Extracción)"
      },
      technical: {
        assets: "Prensas de transferencia ARISA (1600t), Schuler (2500t), Líneas SMT Bosch.",
        maintenance: "Mantenimiento riguroso hasta proceso concursal (Jun 2023).",
        manual_available: "Planos de cimentación y manuales eléctricos incluidos.",
        condition: "Prensa ARISA en estado óptimo. Retrofit de control recomendado."
      },
      logistics: {
        extraction_cost: "\u20AC180.000 (Requiere grúas de 300t)",
        transport_type: "Transporte especial pesado (Modular)",
        customs_info: "Libre en UE.",
        time_estimate: "4 meses para desmantelamiento completo"
      },
      marketing: {
        potential_clients: ["Gestamp (España)", "CIE Automotive", "Estructuristas en Polonia"],
        buyer_personas: ["Empresas Tier-1 Automoción", "Revendedores Maquinaria Pesada"],
        USP: "Venta directa sin subasta por debajo del 50% del valor de mercado para liquidación de masa."
      },
      contacts: [
        { name: "Lünders & Partner", role: "Agente Concursal", email: "info@lueders-partner.com", phone: "+49 40 460006 0" }
      ],
      links: [
        { label: "Catálogo Prensas", url: "https://lueders-partner.com/en/auctions/allgaier-automotive-gmbh-transfer-presses-drawing-presses-hydraulic-presses-crank-presses-blank-loading-station-continuous-paint-line-tryout-presses-digital-measuring-system-robots-e/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80", caption: "Prensa de transferencia de gran tonelaje" }
      ,
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.nidec.com/en/product/",
      documentation: {
        manuals: "Manuales ARISA/Schuler disponibles. Requiere serial number para copias digitales oficiales.",
        maintenance_logs: "Registro de horas y fallos críticos en el PLC disponible para inspección."
      }
    },
    {
      id: "ford-saarlouis-robots",
      name: "Ford Saarlouis — 450+ Robots KUKA",
      type: "Venta Privada",
      status: "Activa",
      priority: "P0",
      location: { lat: 49.31, lng: 6.75, city: "Saarlouis", country: "Alemania" },
      financials: {
        investment: "\u20AC8.500.000",
        investment_num: 8500000,
        resale: "\u20AC18.250.000",
        resale_num: 18250000,
        margin: "52.0%",
        roi: "108.6%",
        roi_num: 108.6,
        payback: "8-12 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "450+ Robots KUKA (Quantec, Titan, KR210) — Años 2018-2022.",
        maintenance: "Mantenimiento predictivo SAP Ford. <15.000h de trabajo.",
        manual_available: "Digitales en sistema Ford (Acceso tras depósito).",
        condition: "Impecables. Almacenados bajo condiciones controladas."
      },
      logistics: {
        extraction_cost: "\u20AC250.000",
        transport_type: "Camiones estándar (3 unidades por camión)",
        customs_info: "Libre en UE.",
        time_estimate: "Extracción en 30-45 días"
      },
      marketing: {
        potential_clients: ["Stellantis", "Startups EV (Rivian/Lucid)", "Integradores robótica"],
        buyer_personas: ["CTOs", "Directores de Expansión Industrial"],
        USP: "La flota de robots más joven y extensa del mercado secundario europeo."
      },
      contacts: [
        { name: "Ford Asset Recovery", role: "Venta Directa", email: "assets@ford.com", phone: "+49 221 903 0" }
      ],
      links: [
        { label: "Portal de Activos Ford", url: "https://www.netbid.com/en/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Flota de robots KUKA en almacén" }
      ,
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.kuka.com/-/media/kuka-downloads/imported/48ec812b1b2947898ac2598af563d76e/spez_kr_quantec_pro_en.pdf",
      documentation: {
        manuals: "Copia digital de manuales KUKA y programas de soldadura incluidos.",
        maintenance_logs: "Historial completo de cambios de aceite y engranajes."
      }
    },
    {
      id: "marelli-casting",
      name: "Marelli Crevalcore — Inyección Aluminio",
      type: "Concurso",
      status: "Activa",
      priority: "P0",
      location: { lat: 44.72, lng: 11.14, city: "Crevalcore", country: "Italia" },
      financials: {
        investment: "\u20AC4.500.000",
        investment_num: 4500000,
        resale: "\u20AC8.800.000",
        resale_num: 8800000,
        margin: "48.4%",
        roi: "93.6%",
        roi_num: 93.6,
        payback: "6-10 meses",
        risk: "Medio"
      },
      technical: {
        assets: "12 Celdas Bühler/Idra (1000t-3200t), Robots ABB, Hornos Striko.",
        maintenance: "Certificado de servicio Bühler Feb 2025.",
        manual_available: "Completos (Italiano/Inglés).",
        condition: "Muy buena. En uso hasta Q3 2024."
      },
      logistics: {
        extraction_cost: "\u20AC45.000 por celda",
        transport_type: "Marítimo (Puerto Génova)",
        customs_info: "UE. DDP disponible.",
        time_estimate: "4 meses de logística"
      },
      marketing: {
        potential_clients: ["Nemak", "Teksid", "Fabricantes componentes EV"],
        buyer_personas: ["Directores de Planta Fundición"],
        USP: "Maquinaria crítica para la transición al vehículo eléctrico (Giga-casting)."
      },
      contacts: [
        { name: "Marelli Reorganization", role: "Gestión Activos", email: "it-assets@marelli.com", phone: "+39 051 680 00" }
      ],
      links: [
        { label: "Detalles Marelli", url: "https://www.marelli.com/news/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "Inyectora Bühler de 3200t" }
      ,
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.buhlergroup.com/content/dam/buhler/die-casting/brochures/Carat_EN.pdf",
      documentation: {
        manuals: "Manuales técnicos y de seguridad Bühler incluidos.",
        maintenance_logs: "Registros de ciclos de inyección y fallos de moldes."
      }
    },
    {
      id: "zf-precision",
      name: "ZF Friedrichshafen — Mecanizado 5 Ejes",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 47.66, lng: 9.48, city: "Friedrichshafen", country: "Alemania" },
      financials: {
        investment: "\u20AC350.000",
        investment_num: 350000,
        resale: "\u20AC650.000",
        resale_num: 650000,
        margin: "43.8%",
        roi: "78.1%",
        roi_num: 78.1,
        payback: "3-5 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "20+ Centros Grob G550, Heller HF5500 — Años 2020-2022.",
        maintenance: "Contrato Full Service Grob. <8.000h de husillo.",
        manual_available: "Digitales y físicos disponibles.",
        condition: "Como nuevas (Mint condition)."
      },
      logistics: {
        extraction_cost: "\u20AC15.000 por máquina",
        transport_type: "Camión lona estándar",
        customs_info: "UE.",
        time_estimate: "Disponibilidad inmediata"
      },
      marketing: {
        potential_clients: ["Aeroespacial (Airbus Tier-2)", "Médico (Implantes)", "Moldistas"],
        buyer_personas: ["Dueños de empresas de mecanizado"],
        USP: "Máquinas con entrega inmediata en un mercado con esperas de +14 meses."
      },
      contacts: [
        { name: "NetBid Hamburg", role: "Agente Subasta", email: "hamburg@netbid.com", phone: "+49 40 355005 0" }
      ],
      links: [
        { label: "Ver Subasta ZF", url: "https://www.netbid.com/en/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80", caption: "Centro de mecanizado Grob G550" }
      ,
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.grobgroup.com/en/",
      documentation: {
        manuals: "Manuales Siemens/Heidenhain y específicos de máquina Grob.",
        maintenance_logs: "Reportes oficiales Grob Service actualizados."
      }
    },
    {
      id: "bosch-smt",
      name: "Bosch SMT Lines — Electrónica",
      type: "Venta Privada",
      status: "Activa",
      priority: "P0",
      location: { lat: 48.78, lng: 9.18, city: "Stuttgart", country: "Alemania" },
      financials: {
        investment: "\u20AC2.100.000",
        investment_num: 2100000,
        resale: "\u20AC4.500.000",
        resale_num: 4500000,
        margin: "49.3%",
        roi: "97.4%",
        roi_num: 97.4,
        payback: "4-6 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "6 Líneas SMT (Fuji NXT III, Panasonic), AOI, Hornos Re-flow.",
        maintenance: "Estándares Bosch (Máxima calidad). Diarios de turno disponibles.",
        manual_available: "Completos y en varios idiomas.",
        condition: "Operativas al 100% hasta desmantelamiento."
      },
      logistics: {
        extraction_cost: "\u20AC180.000 (Climatizado)",
        transport_type: "Contenedores 40ft High Cube",
        customs_info: "Fomento México (IMMEX) / Vietnam (EPE) - Sin aranceles.",
        time_estimate: "2 meses"
      },
      marketing: {
        potential_clients: ["Foxconn", "Flex", "Jabil (México/China/Vietnam)"],
        buyer_personas: ["Directores de Operaciones", "Supply Chain Managers"],
        USP: "Trazabilidad absoluta Bosch. Configuración lista para alta producción electrónica."
      },
      contacts: [
        { name: "Bosch Asset Recovery", role: "Venta Directa", email: "recovery.bosch@de.bosch.com", phone: "+49 711 811 0" }
      ],
      links: [
        { label: "Portal Bosch Assets", url: "https://www.bosch.com/stories/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", caption: "Línea SMT Fuji NXT III" }
      ,
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.fuji.co.jp/en/items/catalog/nxt3_en.pdf",
      documentation: {
        manuals: "Manuales Fuji NXT III en formato digital original.",
        maintenance_logs: "Historial de calibración de feeders y nozzles."
      }
    },
    {
      id: "michelin-mixing",
      name: "Michelin Tours — Planta Mezclado Inox",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 47.39, lng: 0.68, city: "Tours", country: "Francia" },
      financials: {
        investment: "\u20AC1.800.000",
        investment_num: 1800000,
        resale: "\u20AC3.500.000",
        resale_num: 3500000,
        margin: "41.5%",
        roi: "70.7%",
        roi_num: 70.7,
        payback: "5-7 meses",
        risk: "Medio"
      },
      technical: {
        assets: "Silos acero inox 316 (50m3), Bombas alta presión, Sistemas filtrado.",
        maintenance: "Limpieza grado alimentario (CIP). Muy bien mantenidos.",
        manual_available: "Manuales en francés e inglés.",
        condition: "Excelente. Ideal para re-conversión alimentaria."
      },
      logistics: {
        extraction_cost: "\u20AC250.000",
        transport_type: "Camiones cisterna/especiales",
        customs_info: "UE.",
        time_estimate: "3 meses"
      },
      marketing: {
        potential_clients: ["Danone", "Nestlé", "Empresas químicas/cosméticas"],
        buyer_personas: ["Ingenieros de Proceso", "Project Managers"],
        USP: "Activos de acero inoxidable de alta calidad, listos para aplicaciones sanitarias."
      },
      contacts: [
        { name: "Agente NetBid France", role: "Asset Management", email: "france@netbid.com", phone: "+33 123 456 789" }
      ],
      links: [
        { label: "Ver Subasta Michelin", url: "https://www.netbid.com/en/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80", caption: "Silos de acero inoxidable 316" }
      ,
        { url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.alfalaval.com/",
      documentation: {
        manuals: "Certificados de materiales (inox) y planos de tuberías (P&ID).",
        maintenance_logs: "Registros de limpiezas y pruebas de presión."
      }
    },
    {
      id: "bsh-esquiroz-2026",
      name: "BSH Esquiroz — Navarra (P0)",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 42.77, lng: -1.65, city: "Esquiroz", country: "España" },
      financials: {
        investment: "\u20AC940.000",
        investment_num: 940000,
        resale: "\u20AC1.200.000",
        resale_num: 1200000,
        margin: "21.7%",
        roi: "27.7%",
        roi_num: 27.7,
        payback: "3-6 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "225 lotos: Prensas Arisa, Robots soldadura, Almacén automático inteligente.",
        maintenance: "Estándar BSH (Alemania). Excelencia operativa.",
        manual_available: "Completos en español/alemán.",
        condition: "Muy buena. Planta cerrada por traslado estratégico."
      },
      logistics: {
        extraction_cost: "Variable según lote",
        transport_type: "Logística nacional (España/Portugal)",
        customs_info: "UE. Sin trámites especiales.",
        time_estimate: "Inmediato (Junio 2026)"
      },
      marketing: {
        potential_clients: ["Fagor", "Teknion", "Empresas Metalmecánicas Norte España"],
        buyer_personas: ["Directores de Producción", "Dueños de PYMES industriales"],
        USP: "Oportunidad de adquirir maquinaria de una de las plantas más eficientes de España."
      },
      contacts: [
        { name: "Thomas Schlieker", role: "NetBid", email: "schlieker@netbid.com", phone: "+49 172 647 32 50" }
      ],
      links: [
        { label: "Ver Subasta BSH", url: "https://www.netbid.com/en/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80", caption: "Planta BSH Esquiroz - Línea de prensas" }
      ,
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.schulergroup.com/technologien/produkte/pressen_servodirekt_transfer_m_l/schuler_servopressen_de.pdf",
      documentation: {
        manuals: "Manuales originales Arisa y KUKA disponibles.",
        maintenance_logs: "Historial de paradas y reparaciones en sistema SAP."
      }
    },
    {
      id: "vallourec-tube",
      name: "Vallourec — Tubos Acero (Düsseldorf)",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 51.22, lng: 6.77, city: "Düsseldorf", country: "Alemania" },
      financials: {
        investment: "\u20AC5.500.000",
        investment_num: 5500000,
        resale: "\u20AC10.200.000",
        resale_num: 10200000,
        margin: "40.2%",
        roi: "67.2%",
        roi_num: 67.2,
        payback: "8-14 meses",
        risk: "Medio-Alto"
      },
      technical: {
        assets: "Corte láser Trumpf, Bancos prueba hidro, Hornos tratamiento térmico.",
        maintenance: "Mantenimiento pesado excelente. Equipos críticos de seguridad.",
        manual_available: "Completos y certificados por el fabricante.",
        condition: "Robustez máxima. Listos para sector Oil & Gas."
      },
      logistics: {
        extraction_cost: "\u20AC600.000",
        transport_type: "Tren/Barcaza (Rin)",
        customs_info: "UE.",
        time_estimate: "5 meses"
      },
      marketing: {
        potential_clients: ["Tenaris (México/Global)", "TMK", "Fabricantes tubos energía"],
        buyer_personas: ["Directores compras maquinaria pesada"],
        USP: "Lote de alta especialización para aplicaciones de presión crítica y energía."
      },
      contacts: [
        { name: "Maynards Europe", role: "Venta Activos", email: "dusseldorf@maynards.com", phone: "+49 123 456 000" }
      ],
      links: [
        { label: "Catálogo Vallourec", url: "https://www.maynards.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "Banco de pruebas Vallourec" }
      ,
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.trumpf.com/en_INT/",
      documentation: {
        manuals: "Certificados de calibración de bancos de prueba incluidos.",
        maintenance_logs: "Reportes de integridad estructural de hornos."
      }
    },
    {
      id: "cat-336d-ocana",
      name: "Caterpillar 336D L — Excavadora Hidráulica",
      type: "Subasta",
      status: "Próxima (Jun 2026)",
      priority: "P0",
      location: { lat: 39.95, lng: -3.50, city: "Ocaña", country: "España" },
      financials: {
        investment: "\u20AC95.000",
        investment_num: 95000,
        resale: "\u20AC145.000",
        resale_num: 145000,
        margin: "34.5%",
        roi: "52.6%",
        roi_num: 52.6,
        payback: "2-4 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Excavadora de cadenas Caterpillar 336D L. Motor Cat C9 ACERT.",
        maintenance: "Historial Ritchie Bros. Inspección positiva de fugas y mandos finales.",
        manual_available: "Manual de operación y mantenimiento original incluido.",
        condition: "Buen estado. 12.500 horas de uso certificado."
      },
      logistics: {
        extraction_cost: "\u20AC12.000 (Transporte góndola)",
        transport_type: "Terrestre (Nacional)",
        customs_info: "Nacional.",
        time_estimate: "15 días"
      },
      marketing: {
        potential_clients: ["Constructoras Obra Civil", "Explotaciones Mineras", "Alquiladores"],
        buyer_personas: ["Gerente de Maquinaria", "Dueño de constructora"],
        USP: "Modelo de alta demanda con valor de reventa muy estable en mercado africano y europeo."
      },
      contacts: [
        { name: "Ritchie Bros Ocaña", role: "Casa de Subastas", email: "ocana@rbauction.com", phone: "+34 925 12 13 00" }
      ],
      links: [
        { label: "Ver Lote en RB", url: "https://www.rbauction.es/ocana" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "Caterpillar 336D L en inspección" }
      ,
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manual SIS Caterpillar disponible en PDF.",
        maintenance_logs: "Registro de análisis de aceite S·O·S disponible."
      }
    },
    {
      id: "liebherr-ltm-ocana",
      name: "Liebherr LTM 1055-3.1 — Grúa Todo Terreno",
      type: "Subasta",
      status: "Próxima (Jun 2026)",
      priority: "P0",
      location: { lat: 39.95, lng: -3.50, city: "Ocaña", country: "España" },
      financials: {
        investment: "\u20AC165.000",
        investment_num: 165000,
        resale: "\u20AC260.000",
        resale_num: 260000,
        margin: "36.5%",
        roi: "57.6%",
        roi_num: 57.6,
        payback: "4-6 meses",
        risk: "Medio (Certificación)"
      },
      technical: {
        assets: "Grúa telescópica 55t, 3 ejes, Pluma 40m + Jib.",
        maintenance: "Última revisión anual pasada. Cable de elevación nuevo 2024.",
        manual_available: "Tablas de carga y manuales técnicos completos.",
        condition: "Operativa 100%. Neumáticos al 70%."
      },
      logistics: {
        extraction_cost: "\u20AC8.000 (Piloto + Permisos)",
        transport_type: "Propia / Terrestre especial",
        customs_info: "Nacional.",
        time_estimate: "10 días"
      },
      marketing: {
        potential_clients: ["Empresas de Grúas", "Montajes Industriales", "Eólicos"],
        buyer_personas: ["Jefe de Flota", "Director Técnico"],
        USP: "Unidad con pocas horas de motor superior, ideal para exportación a Latinoamérica."
      },
      contacts: [
        { name: "Ritchie Bros Ocaña", role: "Casa de Subastas", email: "ocana@rbauction.com", phone: "+34 925 12 13 00" }
      ],
      links: [
        { label: "Ver Lote en RB", url: "https://www.rbauction.es/ocana" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80", caption: "Liebherr LTM 1055 en posición de transporte" }
      ,
        { url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.liebherr.com/en/int/products/mobile-and-crawler-cranes/mobile-cranes/ltm-mobile-cranes/ltm-1055-3.2.html",
      documentation: {
        manuals: "Tablas de carga originales Liebherr.",
        maintenance_logs: "Certificado de inspección técnica de grúas móviles (ITC-MIE-AEM-4)."
      }
    },
    {
      id: "dmg-mori-ctx-france",
      name: "DMG Mori CTX BETA 800 — Torno CNC",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 47.6, lng: 7.3, city: "Mulhouse", country: "Francia" },
      financials: {
        investment: "\u20AC45.000",
        investment_num: 45000,
        resale: "\u20AC82.000",
        resale_num: 82000,
        margin: "45.1%",
        roi: "82.2%",
        roi_num: 82.2,
        payback: "3-4 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Torno CNC con eje Y y herramientas motorizadas. Control Siemens 840D.",
        maintenance: "Mantenimiento preventivo anual por DMG Mori France.",
        manual_available: "Digitales en control y formato físico.",
        condition: "Muy buena. Precisión verificada con ballbar."
      },
      logistics: {
        extraction_cost: "\u20AC6.500 (Desconexión + Carga)",
        transport_type: "Camión plataforma especializado",
        customs_info: "UE. Intra-comunitario.",
        time_estimate: "20 días"
      },
      marketing: {
        potential_clients: ["Talleres de Mecanizado", "Sector Automoción", "Aeronáutica"],
        buyer_personas: ["Dueño de Taller", "Ingeniero de Producción"],
        USP: "Máquina lista para producción inmediata, sin lista de espera de fabricante."
      },
      contacts: [
        { name: "Troostwijk France", role: "Casa de Subastas", email: "info@troostwijkauctions.com", phone: "+33 1 43 23 23 23" }
      ],
      links: [
        { label: "Ver Subasta", url: "https://www.troostwijkauctions.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", caption: "DMG Mori CTX Beta 800 en planta" }
      ,
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manuales originales de programación y mantenimiento.",
        maintenance_logs: "Registro de horas de cabezal y herramientas motorizadas."
      }
    },
    {
      id: "okuma-mx60-terrassa",
      name: "Okuma MX-60HB — Centro Horizontal",
      type: "Liquidación",
      status: "Activa",
      priority: "P0",
      location: { lat: 41.56, lng: 2.01, city: "Terrassa", country: "España" },
      financials: {
        investment: "\u20AC28.000",
        investment_num: 28000,
        resale: "\u20AC55.000",
        resale_num: 55000,
        margin: "49.1%",
        roi: "96.4%",
        roi_num: 96.4,
        payback: "2-4 meses",
        risk: "Medio (Peso)"
      },
      technical: {
        assets: "Centro de mecanizado horizontal con cambiador de palets. 60 herramientas.",
        maintenance: "Mantenimiento interno riguroso. Cambio de husillo en 2022.",
        manual_available: "Manuales OSP Okuma originales.",
        condition: "Operativo. Se puede ver en marcha."
      },
      logistics: {
        extraction_cost: "\u20AC12.500 (Requiere transporte especial pesado)",
        transport_type: "Transporte sobredimensionado",
        customs_info: "Nacional.",
        time_estimate: "25 días"
      },
      marketing: {
        potential_clients: ["Fabricantes de Válvulas", "Sector Energético", "Moldes grandes"],
        buyer_personas: ["Director de Operaciones", "Inversor Industrial"],
        USP: "Maquinaria japonesa de alta fiabilidad por valor de liquidación forzosa."
      },
      contacts: [
        { name: "Surplex Ibérica", role: "Gestor Activos", email: "info.es@surplex.com", phone: "+34 93 122 34 56" }
      ],
      links: [
        { label: "Ver Lote Surplex", url: "https://www.surplex.com/es/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80", caption: "Okuma MX-60HB en producción" }
      ,
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Esquemas eléctricos y de hidráulica incluidos.",
        maintenance_logs: "Historial de calibración geométrica anual."
      }
    },
    {
      id: "golden-laser-romania",
      name: "Golden Laser JG-180100 — Corte Láser",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 44.42, lng: 26.10, city: "Bucarest", country: "Rumanía" },
      financials: {
        investment: "\u20AC12.500",
        investment_num: 12500,
        resale: "\u20AC28.000",
        resale_num: 28000,
        margin: "55.4%",
        roi: "124.0%",
        roi_num: 124.0,
        payback: "2-3 meses",
        risk: "Medio (Electrónica)"
      },
      technical: {
        assets: "Sistema de corte láser de gran formato para tejidos y materiales técnicos.",
        maintenance: "Limpieza de ópticas mensual. Tubo láser cambiado hace 8 meses.",
        manual_available: "Digitales (Inglés).",
        condition: "Bueno. Sistema de extracción incluido."
      },
      logistics: {
        extraction_cost: "\u20AC4.000",
        transport_type: "Contenedor 20ft",
        customs_info: "Intra-UE.",
        time_estimate: "30 días"
      },
      marketing: {
        potential_clients: ["Textil Industrial", "Carpintería Técnica", "Publicidad"],
        buyer_personas: ["Dueño de Pyme", "Jefe de Producción"],
        USP: "Amortización ultra-rápida debido a la alta demanda de personalización industrial."
      },
      contacts: [
        { name: "Surplex Romania", role: "Gestión Subasta", email: "romania@surplex.com", phone: "+40 123 456 789" }
      ],
      links: [
        { label: "Ver Lote", url: "https://www.surplex.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80", caption: "Láser JG-180100 en funcionamiento" }
      ,
        { url: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.goldenlaser.cc/",
      documentation: {
        manuals: "Software original incluido.",
        maintenance_logs: "Log de horas de tubo láser."
      }
    },
    {
      id: "koyama-elorrio",
      name: "Koyama Machining Line — Línea Automatizada",
      type: "Liquidación",
      status: "Activa",
      priority: "P0",
      location: { lat: 43.13, lng: -2.53, city: "Elorrio", country: "España" },
      financials: {
        investment: "\u20AC18.000",
        investment_num: 18000,
        resale: "\u20AC42.000",
        resale_num: 42000,
        margin: "57.1%",
        roi: "133.3%",
        roi_num: 133.3,
        payback: "3-5 meses",
        risk: "Medio (Complejidad)"
      },
      technical: {
        assets: "Línea completa de acabado industrial con 2x Barinder y estaciones auxiliares.",
        maintenance: "Mantenimiento preventivo por fabricante hasta el cierre de planta.",
        manual_available: "Planos de layout y manuales técnicos incluidos.",
        condition: "Instalación completa. Requiere desmontaje profesional."
      },
      logistics: {
        extraction_cost: "\u20AC15.000 (Desmontaje especializado)",
        transport_type: "2x Trailers",
        customs_info: "Nacional.",
        time_estimate: "40 días"
      },
      marketing: {
        potential_clients: ["Fundiciones", "Empresas de Acabado Metálico", "Integradores"],
        buyer_personas: ["Director Técnico", "Gerente de Planta"],
        USP: "Oportunidad única de adquirir una línea automatizada completa a precio de chatarra técnica."
      },
      contacts: [
        { name: "Surplex Ibérica", role: "Liquidación", email: "info.es@surplex.com", phone: "+34 93 122 34 56" }
      ],
      links: [
        { label: "Detalles Línea Koyama", url: "https://www.surplex.com/es/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Línea Koyama en planta de Elorrio" }
      ,
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.koyama-g.com/en/",
      documentation: {
        manuals: "Documentación CE y manuales de PLC incluidos.",
        maintenance_logs: "Historial de reparaciones mayores disponible."
      }
    },
    {
      id: "kleen-tek-bcn",
      name: "Kleen-Tek Custom MCS — Limpieza Industrial",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 41.38, lng: 2.17, city: "Barcelona", country: "España" },
      financials: {
        investment: "\u20AC8.500",
        investment_num: 8500,
        resale: "\u20AC19.500",
        resale_num: 19500,
        margin: "56.4%",
        roi: "129.4%",
        roi_num: 129.4,
        payback: "2-3 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Sistema de limpieza por alta presión para piezas industriales (2022).",
        maintenance: "Como nuevo. Menos de 500 horas de uso.",
        manual_available: "Completos (Español).",
        condition: "Impecable. Garantía de fabricante aún vigente (parcial)."
      },
      logistics: {
        extraction_cost: "\u20AC1.200",
        transport_type: "Furgón / Camión pequeño",
        customs_info: "Nacional.",
        time_estimate: "7 días"
      },
      marketing: {
        potential_clients: ["Talleres de Reparación", "Plantas de Alimentación", "Químicas"],
        buyer_personas: ["Gerente de Mantenimiento", "Dueño de Taller"],
        USP: "Equipo moderno con tecnología actual a menos del 40% de su PVP nuevo."
      },
      contacts: [
        { name: "Surplex Barcelona", role: "Venta Activos", email: "info.es@surplex.com", phone: "+34 93 122 34 56" }
      ],
      links: [
        { label: "Ver Lote Kleen-Tek", url: "https://www.surplex.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Sistema Kleen-Tek MCS" }
      ,
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manual de usuario y esquemas de recambios.",
        maintenance_logs: "Certificado de puesta en marcha 2022."
      }
    },
    {
      id: "volvo-l150g-ocana",
      name: "Volvo L150G — Pala Cargadora",
      type: "Subasta",
      status: "Próxima (Jun 2026)",
      priority: "P0",
      location: { lat: 39.95, lng: -3.50, city: "Ocaña", country: "España" },
      financials: {
        investment: "\u20AC72.000",
        investment_num: 72000,
        resale: "\u20AC105.000",
        resale_num: 105000,
        margin: "31.4%",
        roi: "45.8%",
        roi_num: 45.8,
        payback: "3-5 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Pala cargadora de ruedas Volvo L150G. Cazo de 4.5m3.",
        maintenance: "Mantenimiento oficial Volvo (Contrato CareTrack).",
        manual_available: "Digitales en sistema Volvo y físicos.",
        condition: "Buen estado. Transmisión revisada en 2024."
      },
      logistics: {
        extraction_cost: "\u20AC5.500 (Transporte nacional)",
        transport_type: "Terrestre (Góndola)",
        customs_info: "Nacional.",
        time_estimate: "12 días"
      },
      marketing: {
        potential_clients: ["Canteras", "Plantas de Reciclaje", "Movimiento de Tierras"],
        buyer_personas: ["Gerente de Producción", "Dueño de Explotación"],
        USP: "Eficiencia de combustible líder en su clase y alto valor de reventa en mercados consolidados."
      },
      contacts: [
        { name: "Ritchie Bros Ocaña", role: "Casa de Subastas", email: "ocana@rbauction.com", phone: "+34 925 12 13 00" }
      ],
      links: [
        { label: "Ver Lote en RB", url: "https://www.rbauction.es/ocana" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "Volvo L150G en campa" }
      ,
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manual de operador y seguridad.",
        maintenance_logs: "Reporte de estado de CareTrack disponible."
      }
    },
    {
      id: "mori-seiki-sh5000-zestoa",
      name: "Mori Seiki SH5000/40 — Centro Horizontal",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 43.24, lng: -2.25, city: "Zestoa", country: "España" },
      financials: {
        investment: "\u20AC32.000",
        investment_num: 32000,
        resale: "\u20AC68.000",
        resale_num: 68000,
        margin: "52.9%",
        roi: "112.5%",
        roi_num: 112.5,
        payback: "3-6 meses",
        risk: "Medio"
      },
      technical: {
        assets: "Centro de mecanizado horizontal de alta velocidad. Twin pallet.",
        maintenance: "Mantenimiento preventivo bianual. Muy buen estado de guías.",
        manual_available: "Completos (Japonés/Inglés).",
        condition: "Operativa. Máquina de alta precisión."
      },
      logistics: {
        extraction_cost: "\u20AC9.000",
        transport_type: "Transporte especial",
        customs_info: "Nacional.",
        time_estimate: "20 días"
      },
      marketing: {
        potential_clients: ["Automoción", "Aeronáutica", "Ingeniería de Precisión"],
        buyer_personas: ["Dueño de Pyme Industrial", "Director de Fábrica"],
        USP: "Rigidez y precisión Mori Seiki a precio de subasta por renovación de flota."
      },
      contacts: [
        { name: "Surplex Ibérica", role: "Venta Activos", email: "info.es@surplex.com", phone: "+34 93 122 34 56" }
      ],
      links: [
        { label: "Ver Lote Mori Seiki", url: "https://www.surplex.com/es/subastas/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80", caption: "Mori Seiki SH5000 en inspección técnica" }
      ,
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manuales de control MAPPS IV.",
        maintenance_logs: "Registro de geometría y backlash."
      }
    },
    {
      id: "kira-kn40-terrassa",
      name: "Kira KN-40VB — Centro Vertical",
      type: "Liquidación",
      status: "Activa",
      priority: "P0",
      location: { lat: 41.56, lng: 2.01, city: "Terrassa", country: "España" },
      financials: {
        investment: "\u20AC14.000",
        investment_num: 14000,
        resale: "\u20AC32.000",
        resale_num: 32000,
        margin: "56.3%",
        roi: "128.6%",
        roi_num: 128.6,
        payback: "2-4 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Centro de mecanizado vertical compacto. Fanuc Series 21-M.",
        maintenance: "Husillo reacondicionado en 2023. Cambio de filtros y aceites Q1 2026.",
        manual_available: "Manuales originales (Físicos).",
        condition: "Muy buena. Ideal para piezas pequeñas de precisión."
      },
      logistics: {
        extraction_cost: "\u20AC2.500",
        transport_type: "Camión estándar con grúa",
        customs_info: "Nacional.",
        time_estimate: "10 días"
      },
      marketing: {
        potential_clients: ["Talleres de Utillaje", "Micro-mecánica", "Prototipado"],
        buyer_personas: ["Jefe de Taller", "Emprendedor Industrial"],
        USP: "Alta velocidad de cabezal (15.000 rpm) en un formato compacto y eficiente."
      },
      contacts: [
        { name: "Surplex Barcelona", role: "Venta Activos", email: "info.es@surplex.com", phone: "+34 93 122 34 56" }
      ],
      links: [
        { label: "Ver Lote Kira", url: "https://www.surplex.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80", caption: "Kira KN-40VB en planta" }
      ,
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manual Fanuc y específico de máquina Kira.",
        maintenance_logs: "Log de errores y alarmas de los últimos 2 años (limpio)."
      }
    },
    {
      id: "thyssenkrupp-galmed",
      name: "Thyssenkrupp Galmed — Línea Galvanizado",
      type: "Cese Actividad",
      status: "Adquirida (Network Steel)",
      priority: "P0",
      location: { lat: 39.68, lng: -0.27, city: "Sagunto", country: "España" },
      financials: {
        investment: "\u20AC15.000.000",
        investment_num: 15000000,
        resale: "\u20AC45.000.000",
        resale_num: 45000000,
        margin: "66.7%",
        roi: "200.0%",
        roi_num: 200.0,
        payback: "12-18 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Horno de recocido, Cubas de zinc, Sistemas de control Siemens PCS7.",
        maintenance: "Planta de última generación (Modernizada 2021). Verificado por ingenieros locales.",
        manual_available: "Planos técnicos y manuales de operación Siemens incluidos.",
        condition: "Planta completa operativa (Mantenimiento en caliente)."
      },
      logistics: {
        extraction_cost: "\u20AC2.500.000",
        transport_type: "Transporte especial pesado / Marítimo",
        customs_info: "Nacional / Exportación Marruecos/Sudáfrica.",
        time_estimate: "8-12 meses para traslado llave en mano"
      },
      marketing: {
        potential_clients: ["Siderúrgicas en Marruecos", "Sudáfrica (Mercados en expansión)", "ArcelorMittal"],
        buyer_personas: ["CEOs Siderúrgicos", "Gobiernos (Soberanía Industrial)"],
        USP: "Oportunidad única de Planta Llave en Mano con tecnología 2021 a precio de activos distress."
      },
      contacts: [
        { name: "Network Steel Resources", role: "Propietario Actual", email: "info@networksteelresources.com", phone: "+34 911 234 567" }
      ],
      links: [
        { label: "Noticia Adquisición", url: "https://www.networksteel.net/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Planta Galmed Sagunto - Línea de Galvanizado" }
      ,
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1201&q=80", caption: "Vista lateral del activo" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1202&q=80", caption: "Detalle técnico y panel de control" }],
      pdf_dossier: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      documentation: {
        manuals: "Manuales Siemens PCS7 y certificados de modernización 2021.",
        maintenance_logs: "Historial completo de mantenimiento preventivo y correctivo."
      }
    },
    {
      id: "ae-group-aluminio",
      name: "ae Group \u2014 Fundici\u00f3n Aluminio + 55 CNC",
      type: "Venta Privada",
      status: "Activa",
      priority: "P0",
      location: { lat: 50.98, lng: 10.07, city: "Gerstungen", country: "Alemania" },
      financials: {
        investment: "\u20AC5.000.000",
        investment_num: 5000000,
        resale: "\u20AC8.700.000",
        resale_num: 8700000,
        margin: "42.5%",
        roi: "74.0%",
        roi_num: 74.0,
        payback: "6-10 meses",
        risk: "Medio"
      },
      technical: {
        assets: "35 m\u00e1quinas fundici\u00f3n presi\u00f3n (FRECH 35.000kN, B\u00dcHLER Evolution B270D 27.000kN, IDRA 13.250kN) + 55 CNC (15x BROTHER Speedio, 11x MAKINO a61, 22x SW BA312/BA422).",
        maintenance: "Mantenimiento industrial hasta insolvencia. Equipos en almac\u00e9n controlado.",
        manual_available: "Manuales t\u00e9cnicos disponibles bajo solicitud a NetBid/Hilco.",
        condition: "Estado operativo. Fundici\u00f3n FRECH y B\u00dcHLER en condiciones \u00f3ptimas."
      },
      logistics: {
        extraction_cost: "\u20AC300.000-600.000 (332 posiciones, 3-6 meses)",
        transport_type: "Cami\u00f3n especializado / Mar\u00edtimo para LATAM",
        customs_info: "DE\u2192MX: CE marking, arancel 10%, NOM. +15-25% coste total.",
        time_estimate: "3-6 meses desmontaje completo"
      },
      marketing: {
        potential_clients: ["Tier-1 Automotriz M\u00e9xico (Nearshoring)", "Fundiciones Brasil", "Integradores CNC Polonia"],
        buyer_personas: ["Directores de Planta Automotriz", "Distribuidores Maquinaria Industrial"],
        USP: "L\u00ednea completa de fundici\u00f3n + mecanizado aluminio. Marcas premium B\u00dcHLER/FRECH/MAKINO con alta demanda en nearshoring MX."
      },
      contacts: [
        { name: "Thomas Schlieker", role: "NetBid Account Manager", email: "schlieker@netbid.com", phone: "+49 172 647 32 50" },
        { name: "Damian Matczak", role: "NetBid Sales", email: "matczak@netbid.com", phone: "+49 172 402 3054" }
      ],
      links: [
        { label: "NetBid #18121", url: "https://www.netbid.com/en/auctions/31425631-28734841-ae-group-melting-store-aluminum-die-casting-machines-6-600-35-000-kn-mechanical-processing" },
        { label: "Hilco Industrial", url: "https://hilcoindustrial.com/sale/aluminium-die-casting-machining-a08rk00000gft15iae" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1200&q=80", caption: "Fundici\u00f3n de aluminio a presi\u00f3n" },
        { url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80", caption: "Centro de mecanizado CNC" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "L\u00ednea de producci\u00f3n automotriz" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales B\u00dcHLER, FRECH, MAKINO disponibles bajo NDA con NetBid.",
        maintenance_logs: "Historial de mantenimiento industrial hasta fecha de insolvencia."
      }
    },
    {
      id: "lumileds-semiconductores",
      name: "Lumileds \u2014 3.000+ Lotes Semiconductores",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 37.39, lng: -121.95, city: "San Jos\u00e9, CA", country: "EE.UU." },
      financials: {
        investment: "\u20AC2.500.000",
        investment_num: 2500000,
        resale: "\u20AC5.550.000",
        resale_num: 5550000,
        margin: "55.0%",
        roi: "122.0%",
        roi_num: 122.0,
        payback: "4-8 meses",
        risk: "Medio"
      },
      technical: {
        assets: "ASML PAS 5500 Stepper (valor nuevo ~$5M+), Aixtron AIX2800G4 MOCVD, Veeco K465i, FEI SEM, Bruker XRD, Trane chillers 870t/1070t.",
        maintenance: "Equipos semiconductor bien mantenidos. Calibraci\u00f3n ~$10K-50K por unidad.",
        manual_available: "Documentaci\u00f3n t\u00e9cnica incluida en cada lote.",
        condition: "Excelente. Equipos de f\u00e1brica de semiconductores Lumileds."
      },
      logistics: {
        extraction_cost: "\u20AC200.000 (manejo especial ESD, limpieza)",
        transport_type: "Transporte especializado semiconductor / A\u00e9reo para equipos cr\u00edticos",
        customs_info: "US\u2192Asia: $5K-20K por equipo. ITAR restrictions posibles en metrolog\u00eda.",
        time_estimate: "2-4 meses recogida completa"
      },
      marketing: {
        potential_clients: ["Fab Semiconductores Asia (TSMC, Samsung)", "Centros I+D Europa", "Startups Fotovoltaica"],
        buyer_personas: ["CTOs Semiconductor", "Directores de I+D \u00d3ptica"],
        USP: "ASML PAS 5500 raramente en subasta p\u00fablica. Equipos epitaxia, litograf\u00eda y metrolog\u00eda a 40-70% descuento."
      },
      contacts: [
        { name: "Nick Romaine", role: "Branford Group Sales", email: "NRomaine@TheBranfordGroup.com", phone: "(508) 846-1034" }
      ],
      links: [
        { label: "Branford Group Auction", url: "https://auctions.thebranfordgroup.com/auctions/9645/bscthe-b10220" },
        { label: "BidSpotter", url: "https://www.bidspotter.com/en-us/auction-catalogues/bscthe-b/catalogue-id-bscthe-b10220" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80", caption: "Sala limpia semiconductor" },
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", caption: "Equipo de litograf\u00eda ASML" },
        { url: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80", caption: "Wafer de semiconductores" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Documentaci\u00f3n ASML, Aixtron, Veeco incluida por lote.",
        maintenance_logs: "Registros de calibraci\u00f3n y horas de uso disponibles."
      }
    },
    {
      id: "hilco-seamless-tube",
      name: "Hilco Seamless Tube \u2014 Planta Tubo Sin Costura",
      type: "Venta Privada",
      status: "Activa",
      priority: "P0",
      location: { lat: 47.62, lng: 4.34, city: "Montbard", country: "Francia" },
      financials: {
        investment: "\u20AC10.000.000",
        investment_num: 10000000,
        resale: "\u20AC14.800.000",
        resale_num: 14800000,
        margin: "32.4%",
        roi: "48.0%",
        roi_num: 48.0,
        payback: "12-18 meses",
        risk: "Alto"
      },
      technical: {
        assets: "Planta turnkey 80.000 t/a\u00f1o: 7 molinos pilger fr\u00edo (Mannesmann Meer + DMS), horno fusi\u00f3n, l\u00edneas acabado, laminador caliente.",
        maintenance: "Planta mothballed 2025 por Vallourec. Equipos preservados.",
        manual_available: "Planos completos y manuales de operaci\u00f3n disponibles via Hilco.",
        condition: "Planta completa preservada. Requiere reensamblaje en destino."
      },
      logistics: {
        extraction_cost: "\u20AC2.000.000-4.000.000 (desmontaje + transporte + reensamblaje)",
        transport_type: "Mar\u00edtimo para reubicaci\u00f3n completa a LATAM",
        customs_info: "FR\u2192BR/MX: arancel 10-20%, ingenier\u00eda de desmontaje profesional.",
        time_estimate: "12-18 meses reubicaci\u00f3n completa"
      },
      marketing: {
        potential_clients: ["Sider\u00fargicas Brasil (Vallourec BR)", "Pemex/CFE M\u00e9xico", "Tenaris Argentina"],
        buyer_personas: ["CEOs Sider\u00fargicos LATAM", "Directores de Expansi\u00f3n Industrial"],
        USP: "Planta completa reubicable a fracci\u00f3n del coste de nueva (~\u20AC50M+). Capacidad 80.000 t/a\u00f1o."
      },
      contacts: [
        { name: "Margot ter Bogt", role: "Hilco Industrial", email: "infohia@hilcoglobal.com", phone: "+31 20 470 0989" }
      ],
      links: [
        { label: "Hilco Industrial Sale", url: "https://hilcoindustrial.com/sale/8-seamless-tube-plant-hot-cold-turnkey-sale-a08rk00000bqngqiaw" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80", caption: "Planta sider\u00fargica de tubo sin costura" },
        { url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80", caption: "Molino pilger en fr\u00edo" },
        { url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80", caption: "Tubos de acero sin costura" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Planos t\u00e9cnicos completos de planta Vallourec disponibles bajo NDA.",
        maintenance_logs: "Registros de mantenimiento hasta cierre 2025."
      }
    },
    {
      id: "allgaier-werke-cnc",
      name: "Allgaier Werke \u2014 CNC Trimill + Blanking Line",
      type: "Subasta",
      status: "After Sale",
      priority: "P1",
      location: { lat: 48.71, lng: 9.61, city: "Uhingen", country: "Alemania" },
      financials: {
        investment: "\u20AC495.000",
        investment_num: 495000,
        resale: "\u20AC790.000",
        resale_num: 790000,
        margin: "37.3%",
        roi: "59.6%",
        roi_num: 59.6,
        payback: "4-6 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "CNC Portal Milling Trimill VM13535 (\u20AC375.000), Blanking Line PSA2 (\u20AC120.000), Post-combustion Envirotec.",
        maintenance: "Mantenimiento riguroso hasta proceso concursal.",
        manual_available: "Manuales Trimill y documentaci\u00f3n PSA2 incluidos.",
        condition: "After Sale \u2014 precios reducidos. CNC en estado \u00f3ptimo."
      },
      logistics: {
        extraction_cost: "\u20AC40.000 (transporte pesado especializado)",
        transport_type: "Transporte especial pesado modular",
        customs_info: "DE\u2192MX: +15-25% (CE, arancel 10%, NOM).",
        time_estimate: "2-3 meses"
      },
      marketing: {
        potential_clients: ["Tier-1 Automotriz LATAM", "Talleres Mecanizado Precisi\u00f3n", "Revendedores CNC Europa"],
        buyer_personas: ["Directores de Producci\u00f3n", "Compradores Maquinaria Industrial"],
        USP: "CNC portal Trimill de alto valor con demanda LATAM a precio After Sale reducido."
      },
      contacts: [
        { name: "Dr. Hermann Jauch", role: "NetBid Account Manager", email: "jauch@netbid.com", phone: "+49 171 325 40 72" }
      ],
      links: [
        { label: "NetBid #19138", url: "https://www.netbid.com/en/auctions/31444212-31444210-machines-and-systems-from-the-automotive-supply-industry" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1201&q=80", caption: "CNC Portal Milling Trimill" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1203&q=80", caption: "L\u00ednea de blanking automotriz" },
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1203&q=80", caption: "Planta automotriz Allgaier" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales Trimill VM13535 y documentaci\u00f3n Blanking Line PSA2.",
        maintenance_logs: "Registro de horas y mantenimiento hasta cierre concursal."
      }
    },
    {
      id: "allgaier-france-prensas",
      name: "Allgaier France \u2014 Prensas Arisa 1600t + Eisenmann KTL",
      type: "Subasta",
      status: "After Sale",
      priority: "P1",
      location: { lat: 49.04, lng: 6.60, city: "Faulquemont", country: "Francia" },
      financials: {
        investment: "\u20AC500.500",
        investment_num: 500500,
        resale: "\u20AC835.000",
        resale_num: 835000,
        margin: "40.1%",
        roi: "66.8%",
        roi_num: 66.8,
        payback: "4-6 meses",
        risk: "Medio"
      },
      technical: {
        assets: "Prensa bi-columna Arisa S-2-1600 (\u20AC367K), Sistema pintura Eisenmann KTL (\u20AC60K), Prensa Arisa 8-2-800 (\u20AC61-63K), Hydrap (\u20AC12.5-17.5K).",
        maintenance: "Mantenimiento hasta cierre planta automotriz.",
        manual_available: "Manuales ARISA y Eisenmann disponibles.",
        condition: "After Sale con precios reducidos. Prensas operativas."
      },
      logistics: {
        extraction_cost: "\u20AC80.000 (gr\u00faas 300t + transporte modular)",
        transport_type: "Transporte especial pesado / Mar\u00edtimo",
        customs_info: "FR\u2192MX: +15-25% / FR\u2192BR: +20-30%.",
        time_estimate: "3-5 meses"
      },
      marketing: {
        potential_clients: ["Automotriz M\u00e9xico (Nearshoring)", "Estampadores Brasil", "Tier-1 Colombia"],
        buyer_personas: ["Directores de Planta Estampaci\u00f3n", "Integradores Automotrices"],
        USP: "Prensas Arisa de gran tonelaje (1600t) con fuerte demanda en sector automotriz MX/BR."
      },
      contacts: [
        { name: "Dr. Hermann Jauch", role: "NetBid Account Manager", email: "jauch@netbid.com", phone: "+49 171 325 40 72" }
      ],
      links: [
        { label: "NetBid #19190", url: "https://www.netbid.com/en/auctions/32112641-31604993-plant-closure-production-facilities-of-an-automotive-supplier-allgaier-plants-in-france" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1204&q=80", caption: "Prensa Arisa 1600t bi-columna" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1204&q=80", caption: "Sistema pintura Eisenmann KTL" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1201&q=80", caption: "Planta automotriz Francia" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales ARISA S-2-1600 y Eisenmann KTL completos.",
        maintenance_logs: "Historial de mantenimiento hasta cierre de planta."
      }
    },
    {
      id: "prensas-saarlouis",
      name: "Prensas Saarlouis \u2014 Weingarten/Schuler Press Line",
      type: "Subasta",
      status: "Activa",
      priority: "P1",
      location: { lat: 49.31, lng: 6.75, city: "Saarlouis", country: "Alemania" },
      financials: {
        investment: "\u20AC558.000",
        investment_num: 558000,
        resale: "\u20AC970.000",
        resale_num: 970000,
        margin: "42.5%",
        roi: "73.8%",
        roi_num: 73.8,
        payback: "4-6 meses",
        risk: "Medio"
      },
      technical: {
        assets: "Weingarten/Schuler press line (\u20AC500K), Double column DQ 500.21.30 (\u20AC12K), Raskin (\u20AC11K), Bandanlage Schleifer (\u20AC35K).",
        maintenance: "Mantenimiento Ford hasta cierre de planta.",
        manual_available: "Documentaci\u00f3n t\u00e9cnica Schuler disponible.",
        condition: "L\u00ednea de prensa operativa. Prensa principal Weingarten/Schuler premium."
      },
      logistics: {
        extraction_cost: "\u20AC100.000-150.000 (prensa grande)",
        transport_type: "Transporte especial pesado modular",
        customs_info: "DE\u2192MX: +15-25% (~\u20AC100K-150K).",
        time_estimate: "3-4 meses"
      },
      marketing: {
        potential_clients: ["Automotriz M\u00e9xico", "Estampadores Brasil", "Fabricantes Electrodom\u00e9sticos"],
        buyer_personas: ["Directores de Planta", "Compradores Maquinaria Pesada"],
        USP: "Prensa Weingarten/Schuler de \u20AC500K es activo premium para mercado automotriz LATAM."
      },
      contacts: [
        { name: "NetBid Service", role: "Ventas", email: "service@netbid.com", phone: "+49 40 355059-132" }
      ],
      links: [
        { label: "NetBid Prensas", url: "https://www.netbid.de/en/auctions/25749812-25749315-used-press-lines" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1205&q=80", caption: "L\u00ednea de prensa Schuler" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1205&q=80", caption: "Prensa de doble columna" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1202&q=80", caption: "Planta Saarlouis" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales Weingarten/Schuler incluidos.",
        maintenance_logs: "Historial Ford de mantenimiento preventivo."
      }
    },
    {
      id: "marel-carne-cz",
      name: "Marel DMM10 \u2014 L\u00ednea Procesado Carne",
      type: "Subasta",
      status: "Activa",
      priority: "P1",
      location: { lat: 50.18, lng: 15.04, city: "Nymburk", country: "Rep. Checa" },
      financials: {
        investment: "\u20AC35.000",
        investment_num: 35000,
        resale: "\u20AC66.500",
        resale_num: 66500,
        margin: "47.4%",
        roi: "90.0%",
        roi_num: 90.0,
        payback: "1-2 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Marel DMM10 Deboner (new \u20AC200-500K, 3x lot), Seydelmann K604 cutter, Handtmann VF638 embutidora, Multivac R245 thermoforming.",
        maintenance: "Equipos de planta procesadora en funcionamiento hasta cierre.",
        manual_available: "Documentaci\u00f3n Marel, Seydelmann, Handtmann incluida.",
        condition: "Operativo. Equipos premium del sector c\u00e1rnico."
      },
      logistics: {
        extraction_cost: "\u20AC5.000-10.000",
        transport_type: "Cami\u00f3n refrigerado / Est\u00e1ndar",
        customs_info: "CZ\u2192MX: arancel 10-15%, certificaci\u00f3n sanitaria requerida.",
        time_estimate: "1-2 meses"
      },
      marketing: {
        potential_clients: ["Procesadoras C\u00e1rnicas LATAM", "Frial M\u00e9xico", "JBS Brasil"],
        buyer_personas: ["Directores de Planta C\u00e1rnica", "Distribuidores Maquinaria Alimentaria"],
        USP: "Marel DMM10 Deboner a 10-20% del precio nuevo. ROI r\u00e1pido en 1-2 meses."
      },
      contacts: [
        { name: "Troostwijk Czech", role: "Auctioneer", email: "info@troostwijk.cz", phone: "+420 222 516 272" }
      ],
      links: [
        { label: "Troostwijk Auction", url: "https://www.troostwijkauctions.com/en/search" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80", caption: "L\u00ednea procesado c\u00e1rnico" },
        { url: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1201&q=80", caption: "Equipo Marel industrial" },
        { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80", caption: "Planta alimentaria" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales Marel DMM10, Seydelmann K604, Handtmann VF638.",
        maintenance_logs: "Historial de mantenimiento hasta cierre de planta."
      }
    },
    {
      id: "zeewolde-eolico",
      name: "Windpark Zeewolde \u2014 93 Aerogeneradores",
      type: "Subasta",
      status: "Activa",
      priority: "P0",
      location: { lat: 52.35, lng: 5.50, city: "Zeewolde", country: "Pa\u00edses Bajos" },
      financials: {
        investment: "\u20AC8.000.000",
        investment_num: 8000000,
        resale: "\u20AC12.300.000",
        resale_num: 12300000,
        margin: "35.0%",
        roi: "53.8%",
        roi_num: 53.8,
        payback: "12-18 meses",
        risk: "Alto"
      },
      technical: {
        assets: "93 aerogeneradores (Vestas V80, Enercon E70/E82, Nordex N80, NEG Micon NM82) \u2014 capacidad total 221.9 MW.",
        maintenance: "Operativos hasta desmontaje 2026. Turbinas con 10-20 a\u00f1os de servicio.",
        manual_available: "Documentaci\u00f3n t\u00e9cnica Vestas/Enercon disponible.",
        condition: "Operativas. Se desmontar\u00e1n para reemplazar por parque moderno Windpark Zeewolde."
      },
      logistics: {
        extraction_cost: "\u20AC2.000.000-4.000.000 (desmontaje 93 turbinas)",
        transport_type: "Mar\u00edtimo heavy-lift para reubicaci\u00f3n internacional",
        customs_info: "NL\u2192LATAM: transporte oversized, permisos especiales portuarios.",
        time_estimate: "12-24 meses desmontaje y reubicaci\u00f3n"
      },
      marketing: {
        potential_clients: ["Parques E\u00f3licos LATAM (M\u00e9xico, Brasil, Chile)", "Utilities \u00c1frica", "Revendedores Turbinas"],
        buyer_personas: ["Directores de Energ\u00eda Renovable", "Inversores E\u00f3licos Emergentes"],
        USP: "93 turbinas operativas a fracci\u00f3n del coste nuevo. Oportunidad \u00fanica de volumen para mercados emergentes."
      },
      contacts: [
        { name: "Windpark Zeewolde BV", role: "Propietario", email: "info@windparkzeewolde.nl", phone: "+31 36 523 8400" }
      ],
      links: [
        { label: "Windpark Zeewolde Project", url: "https://www.windparkzeewolde.nl/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=1200&q=80", caption: "Parque e\u00f3lico Zeewolde" },
        { url: "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=1200&q=80", caption: "Aerogeneradores Vestas V80" },
        { url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80", caption: "Turbinas e\u00f3licas en operaci\u00f3n" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Documentaci\u00f3n t\u00e9cnica Vestas V80, Enercon E70/E82, Nordex N80.",
        maintenance_logs: "Registros de operaci\u00f3n y mantenimiento desde instalaci\u00f3n."
      }
    },
    {
      id: "ritchie-ocana",
      name: "Ritchie Bros Oca\u00f1a \u2014 1.587 Lotes Construcci\u00f3n",
      type: "Subasta",
      status: "Activa",
      priority: "P1",
      location: { lat: 39.96, lng: -3.50, city: "Oca\u00f1a", country: "Espa\u00f1a" },
      financials: {
        investment: "\u20AC1.200.000",
        investment_num: 1200000,
        resale: "\u20AC1.650.000",
        resale_num: 1650000,
        margin: "27.3%",
        roi: "37.5%",
        roi_num: 37.5,
        payback: "2-4 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "1.587 lotes: excavadoras, retroexcavadoras, dumpers, gr\u00faas, plataformas, rodillos, generadores, equipos mineros.",
        maintenance: "Inspecci\u00f3n Ritchie Bros incluida. Estado variable por lote.",
        manual_available: "Informes de inspecci\u00f3n por lote en plataforma Ritchie.",
        condition: "Variable. Ritchie Bros garantiza transparencia con informes detallados."
      },
      logistics: {
        extraction_cost: "\u20AC50.000-100.000 (recogida selectiva)",
        transport_type: "Cami\u00f3n desde Oca\u00f1a / Mar\u00edtimo para exportaci\u00f3n",
        customs_info: "ES\u2192LATAM: sin aranceles intra-UE, 10-15% LATAM.",
        time_estimate: "1-3 meses"
      },
      marketing: {
        potential_clients: ["Constructoras LATAM", "Mineras Per\u00fa/Chile", "Distribuidores Maquinaria Usada"],
        buyer_personas: ["Gerentes de Flota", "Compradores Maquinaria Construcci\u00f3n"],
        USP: "1.587 lotes en ubicaci\u00f3n \u00fanica Oca\u00f1a. Subasta presencial con inspecci\u00f3n previa."
      },
      contacts: [
        { name: "Ritchie Bros Espa\u00f1a", role: "Ventas", email: "ocana@rbauction.com", phone: "+34 925 141 550" }
      ],
      links: [
        { label: "Ritchie Bros Oca\u00f1a", url: "https://www.rbauction.es/ocana" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80", caption: "Excavadoras en subasta" },
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80", caption: "Maquinaria de construcci\u00f3n" },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80", caption: "Parque de maquinaria Oca\u00f1a" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Informes de inspecci\u00f3n Ritchie Bros por cada lote.",
        maintenance_logs: "Historial de horas y mantenimiento disponible en plataforma."
      }
    },
    {
      id: "ritchie-southeast-us",
      name: "Ritchie Bros Southeast US \u2014 2.150 Lotes",
      type: "Subasta",
      status: "Activa",
      priority: "P1",
      location: { lat: 33.38, lng: -84.80, city: "Newnan, GA", country: "EE.UU." },
      financials: {
        investment: "\u20AC800.000",
        investment_num: 800000,
        resale: "\u20AC980.000",
        resale_num: 980000,
        margin: "22.5%",
        roi: "22.5%",
        roi_num: 22.5,
        payback: "2-4 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "2.150+ lotes: excavadoras CAT/Komatsu, trucks, skid steers, dozers, motor graders, telehandlers.",
        maintenance: "Inspecciones IronPlanet/Ritchie Bros incluidas.",
        manual_available: "Reportes de inspecci\u00f3n online.",
        condition: "Variable. Equipos de flota de construcci\u00f3n US."
      },
      logistics: {
        extraction_cost: "\u20AC30.000-60.000 (pickup selectivo)",
        transport_type: "Cami\u00f3n US + Mar\u00edtimo para exportaci\u00f3n",
        customs_info: "US\u2192LATAM: arancel 5-15% seg\u00fan pa\u00eds.",
        time_estimate: "2-4 meses"
      },
      marketing: {
        potential_clients: ["Constructoras Centroam\u00e9rica", "Distribuidores Maquinaria M\u00e9xico", "Mineras Colombia"],
        buyer_personas: ["Fleet Managers", "Dealers Maquinaria Usada"],
        USP: "Volumen masivo 2.150 lotes en Southeast US. Precio USD competitivo."
      },
      contacts: [
        { name: "Ritchie Bros US", role: "Sales", email: "customercare@rbauction.com", phone: "+1 800 211 3983" }
      ],
      links: [
        { label: "Ritchie Bros US", url: "https://www.rbauction.com" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1201&q=80", caption: "Excavadoras CAT en subasta" },
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1201&q=80", caption: "Maquinaria pesada US" },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1201&q=80", caption: "Parque Ritchie Bros Georgia" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Reportes IronPlanet de inspecci\u00f3n incluidos.",
        maintenance_logs: "Historial de horas disponible por lote."
      }
    },
    {
      id: "ritchie-quebec",
      name: "Ritchie Bros Quebec \u2014 3.263 Lotes",
      type: "Subasta",
      status: "Activa",
      priority: "P2",
      location: { lat: 45.56, lng: -73.19, city: "Mont-Saint-Hilaire", country: "Canad\u00e1" },
      financials: {
        investment: "\u20AC600.000",
        investment_num: 600000,
        resale: "\u20AC750.000",
        resale_num: 750000,
        margin: "20.0%",
        roi: "25.0%",
        roi_num: 25.0,
        payback: "3-5 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "3.263 lotes: excavadoras, wheel loaders, trucks, trailers, equipos forestales, generadores.",
        maintenance: "Inspecciones Ritchie Bros est\u00e1ndar.",
        manual_available: "Reportes online por lote.",
        condition: "Variable. Stock de flota canadiense."
      },
      logistics: {
        extraction_cost: "\u20AC40.000-80.000",
        transport_type: "Cami\u00f3n Canad\u00e1 + Mar\u00edtimo",
        customs_info: "CA\u2192LATAM: USMCA benefits para M\u00e9xico, 10-15% otros.",
        time_estimate: "2-4 meses"
      },
      marketing: {
        potential_clients: ["Constructoras M\u00e9xico (USMCA)", "Distribuidores Centroam\u00e9rica", "Mineras Sudam\u00e9rica"],
        buyer_personas: ["Compradores Flota", "Dealers Maquinaria"],
        USP: "3.263 lotes masivos con ventaja USMCA para M\u00e9xico."
      },
      contacts: [
        { name: "Ritchie Bros Canada", role: "Sales", email: "customercare@rbauction.com", phone: "+1 800 211 3983" }
      ],
      links: [
        { label: "Ritchie Bros Quebec", url: "https://www.rbauction.com/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1202&q=80", caption: "Subasta maquinaria Quebec" },
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1202&q=80", caption: "Wheel loaders" },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1202&q=80", caption: "Parque Mont-Saint-Hilaire" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Inspecciones Ritchie Bros incluidas.",
        maintenance_logs: "Historial por lote en plataforma."
      }
    },
    {
      id: "azteca-ceramicas",
      name: "Azteca Cer\u00e1micas \u2014 F\u00e1brica Cer\u00e1mica Completa",
      type: "Concurso",
      status: "Activa",
      priority: "P0",
      location: { lat: 40.07, lng: -0.21, city: "L'Alcora, Castell\u00f3n", country: "Espa\u00f1a" },
      financials: {
        investment: "\u20AC2.000.000",
        investment_num: 2000000,
        resale: "\u20AC2.950.000",
        resale_num: 2950000,
        margin: "32.2%",
        roi: "47.5%",
        roi_num: 47.5,
        payback: "6-9 meses",
        risk: "Medio"
      },
      technical: {
        assets: "L\u00edneas completas de prensas SACMI (PH6500/PH7500), secadores atomizadores, hornos rodillos monoestrato, esmaltadoras de precisi\u00f3n, l\u00ednea empaquetado.",
        maintenance: "Planta en mantenimiento correctivo m\u00ednimo tras parada de producci\u00f3n.",
        manual_available: "Planos y certificados de equipos SACMI disponibles.",
        condition: "Operativa antes del concurso. Equipos SACMI de alto valor en mercado internacional."
      },
      logistics: {
        extraction_cost: "\u20AC180.000-300.000 (desmontaje modular)",
        transport_type: "Transporte terrestre est\u00e1ndar y especial",
        customs_info: "ES\u2192UE: libre circulaci\u00f3n. ES\u2192Arg/Argelia: +15-25% aranceles.",
        time_estimate: "3-5 meses de ejecuci\u00f3n"
      },
      marketing: {
        potential_clients: ["Fabricantes de Cer\u00e1mica Argelia/Turqu\u00eda", "Cer\u00e1micas de Castell\u00f3n (expansi\u00f3n)", "Revendedores internacionales"],
        buyer_personas: ["CEOs del sector cer\u00e1mico", "Directores Financieros"],
        USP: "SACMI PH7500 en subasta concursal con 50% de descuento. Demanda robusta fuera de Europa."
      },
      contacts: [
        { name: "Suri\u00f1ach & Asociados", role: "Administrador Concursal", email: "info@surinachconcursal.es", phone: "+34 964 220 544" }
      ],
      links: [
        { label: "Detalle Concurso Azteca", url: "https://azteca.es/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "L\u00ednea de prensado cer\u00e1mico" },
        { url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80", caption: "Instalaci\u00f3n de horno industrial" },
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "Almac\u00e9n y stock Azteca" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales SACMI PH6500, secadores y sistemas de control.",
        maintenance_logs: "Planos y esquemas el\u00e9ctricos."
      }
    },
    {
      id: "frost-trol-refrigeracion",
      name: "Frost-Trol \u2014 F\u00e1brica Refrigeraci\u00f3n 47.484m\u00b2",
      type: "Concurso",
      status: "Activa (Licitaci\u00f3n)",
      priority: "P0",
      location: { lat: 40.13, lng: 0.05, city: "Cabanes, Castell\u00f3n", country: "Espa\u00f1a" },
      financials: {
        investment: "\u20AC10.930.000",
        investment_num: 10930000,
        resale: "\u20AC14.500.000",
        resale_num: 14500000,
        margin: "24.6%",
        roi: "32.6%",
        roi_num: 32.6,
        payback: "12-18 meses",
        risk: "Medio"
      },
      technical: {
        assets: "F\u00e1brica industrial moderna de 47.484 m\u00b2: l\u00ednea punzonado y plegado Salvagnini S4+P4, cabinas de pintura autom\u00e1ticas GEMA, inyectoras de poliuretano, l\u00ednea de montaje.",
        maintenance: "Planta moderna. Excelente estado de conservaci\u00f3n.",
        manual_available: "Planos, licencias industriales y manuales Salvagnini incluidos.",
        condition: "Excelente. Instalaci\u00f3n de \u00faltima generaci\u00f3n construida en 2018."
      },
      logistics: {
        extraction_cost: "N/A (Adquisici\u00f3n unidad productiva / Reubicaci\u00f3n opcional)",
        transport_type: "Transporte multimodal / Terrestre",
        customs_info: "Sin aranceles si se mantiene como unidad productiva.",
        time_estimate: "6-12 meses adjudicaci\u00f3n jur\u00eddica"
      },
      marketing: {
        potential_clients: ["Fabricantes de climatizaci\u00f3n (Carrier, Daikin)", "Grupos log\u00edsticos fr\u00edo", "Fondos inmobiliarios industriales"],
        buyer_personas: ["CEOs Climatizaci\u00f3n", "Inversores de Real Estate Industrial"],
        USP: "Instalaci\u00f3n llave en mano terminada en 2018 con Salvagnini S4+P4 a un tercio del valor de construcci\u00f3n original."
      },
      contacts: [
        { name: "Ramiro & Asociados", role: "Liquidador judicial", email: "info@ramiroconcursal.es", phone: "+34 964 100 210" }
      ],
      links: [
        { label: "Anuncio Liquidaci\u00f3n Frost-Trol", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80", caption: "Fachada de f\u00e1brica Frost-Trol" },
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Plegadora robotizada Salvagnini" },
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80", caption: "Interior de planta de montaje" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales Salvagnini S4+P4, esquemas t\u00e9cnicos GEMA y planos de la nave.",
        maintenance_logs: "Registros de mantenimiento preventivo Salvagnini hasta finales de 2025."
      }
    },
    {
      id: "harinas-bufort",
      name: "Harinas Bufort \u2014 F\u00e1brica Harinas Centenaria",
      type: "Concurso",
      status: "Activa",
      priority: "P2",
      location: { lat: 38.41, lng: -0.44, city: "Mutxamel, Alicante", country: "Espa\u00f1a" },
      financials: {
        investment: "\u20AC400.000",
        investment_num: 400000,
        resale: "\u20AC620.000",
        resale_num: 620000,
        margin: "35.4%",
        roi: "55.0%",
        roi_num: 55.0,
        payback: "4-7 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Molinera centenaria: bancos de cilindros de molienda Buhler, c\u00e1maras de fermentaci\u00f3n, ensiladoras de madera noble de gran valor hist\u00f3rico y t\u00e9cnico, sistemas de transmisi\u00f3n.",
        maintenance: "Parada hace 2 a\u00f1os. Requiere limpieza profunda y restauraci\u00f3n de transmisi\u00f3n.",
        manual_available: "Planos b\u00e1sicos de la instalaci\u00f3n disponibles.",
        condition: "Bien conservada pero inactiva. Alto valor para coleccionistas o reconversi\u00f3n muse\u00edstica/hostelera."
      },
      logistics: {
        extraction_cost: "\u20AC30.000-50.000",
        transport_type: "Terrestre",
        customs_info: "Sin aranceles intra-UE.",
        time_estimate: "2-3 meses de desmontaje"
      },
      marketing: {
        potential_clients: ["Coleccionistas de maquinaria harinera", "Promotores tur\u00edsticos/Museos", "Fabricantes de harina org\u00e1nica artesanal"],
        buyer_personas: ["Inversores patrimoniales", "Arquitectos de reconversi\u00f3n industrial"],
        USP: "Maquinaria de molienda Buhler de madera del siglo XIX extremadamente codiciada en proyectos de patrimonio hist\u00f3rico."
      },
      contacts: [
        { name: "Bufort Liquidador", role: "Abogado Concursal", email: "concurso@bufort-harinas.es", phone: "+34 965 120 440" }
      ],
      links: [
        { label: "Informaci\u00f3n Concursal Mutxamel", url: "https://www.mutxamel.org" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80", caption: "Bancos de molienda hist\u00f3ricos" },
        { url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80", caption: "Estructura interior Harinas Bufort" },
        { url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80", caption: "Maquinaria de engranajes centenarios" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "No disponibles (maquinaria hist\u00f3rica).",
        maintenance_logs: "Historial de reparaciones manuales."
      }
    },
    {
      id: "troostwijk-belgium",
      name: "Troostwijk Industry \u2014 Prensa LVD + Chocolate",
      type: "Subasta",
      status: "Activa",
      priority: "P2",
      location: { lat: 50.88, lng: 5.19, city: "Alken", country: "B\u00e9lgica" },
      financials: {
        investment: "\u20AC80.000",
        investment_num: 80000,
        resale: "\u20AC118.000",
        resale_num: 118000,
        margin: "32.2%",
        roi: "47.5%",
        roi_num: 47.5,
        payback: "2-3 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Prensa plegadora LVD PPEB 220t (\u20AC55.000), templadoras de chocolate SOLLICH, batidoras industriales de reposter\u00eda.",
        maintenance: "Equipos operativos testeados antes de desmontaje.",
        manual_available: "Manual LVD y Sollich digitalizados.",
        condition: "Muy buena. Plegadora LVD con pocas horas de uso."
      },
      logistics: {
        extraction_cost: "\u20AC8.000",
        transport_type: "Cami\u00f3n lona est\u00e1ndar",
        customs_info: "BE\u2192ES: sin aduanas.",
        time_estimate: "1-2 meses"
      },
      marketing: {
        potential_clients: ["Talleres de calderer\u00eda met\u00e1lica", "Fabricantes confiter\u00eda industrial", "Revendedores maquinaria"],
        buyer_personas: ["Propietarios de talleres metal\u00fargicos", "Responsables de producci\u00f3n alimentaria"],
        USP: "Oportunidad mixta LVD + Sollich a precio de liquidaci\u00f3n. Excelente margen en LVD PPEB."
      },
      contacts: [
        { name: "Troostwijk Belgium", role: "Coordinador de subasta", email: "info@troostwijk.be", phone: "+32 3 287 6262" }
      ],
      links: [
        { label: "Subasta Troostwijk Alken", url: "https://www.troostwijkauctions.com" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80", caption: "Prensa plegadora LVD PPEB" },
        { url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80", caption: "Templadora Sollich en planta" },
        { url: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1200&q=80", caption: "Lotes en almac\u00e9n" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales t\u00e9cnicos de LVD PPEB y templadoras Sollich.",
        maintenance_logs: "Registros de mantenimiento de f\u00e1brica de origen."
      }
    },
    {
      id: "ritchie-las-vegas",
      name: "Ritchie Bros Las Vegas \u2014 646 Lotes",
      type: "Subasta",
      status: "Activa",
      priority: "P2",
      location: { lat: 36.17, lng: -115.14, city: "Las Vegas, NV", country: "EE.UU." },
      financials: {
        investment: "\u20AC300.000",
        investment_num: 300000,
        resale: "\u20AC375.000",
        resale_num: 375000,
        margin: "20.0%",
        roi: "25.0%",
        roi_num: 25.0,
        payback: "2-4 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "646 lotes: retroexcavadoras, camiones volquete, manipuladores telesc\u00f3picos, grupos electr\u00f3genos, compresores.",
        maintenance: "Inspecciones mec\u00e1nicas Ritchie certificadas.",
        manual_available: "Certificados de inspecci\u00f3n Ritchie Bros descargables.",
        condition: "Variable por lote, mayormente equipos de obras p\u00fablicas estatales de NV."
      },
      logistics: {
        extraction_cost: "\u20AC20.000",
        transport_type: "Transporte terrestre US + Env\u00edo mar\u00edtimo desde puerto LA",
        customs_info: "US\u2192LATAM: aranceles de importaci\u00f3n 10-15% seg\u00fan destino.",
        time_estimate: "2-4 meses de tr\u00e1nsito"
      },
      marketing: {
        potential_clients: ["Constructoras e infraestructuras M\u00e9xico/Colombia", "Revendedores maquinaria usada", "Alquiladores de maquinaria"],
        buyer_personas: ["Directores de compras", "Dealers internacionales"],
        USP: "Equipos bien mantenidos de flotas de Nevada a precios competitivos en subasta r\u00e1pida."
      },
      contacts: [
        { name: "Ritchie Bros Las Vegas", role: "Customer Service", email: "lasvegas@rbauction.com", phone: "+1 702 644 2444" }
      ],
      links: [
        { label: "Subasta Ritchie Las Vegas", url: "https://www.rbauction.com/las-vegas-nv" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80", caption: "Retroexcavadoras en campa" },
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80", caption: "Dumper articulado US" },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80", caption: "Instalaciones Ritchie Las Vegas" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Informes de inspecci\u00f3n de Ritchie Bros.",
        maintenance_logs: "Historial de horas de trabajo certificadas."
      }
    },
    {
      id: "govplanet-generators",
      name: "GovPlanet \u2014 Generadores INI + Veh\u00edculos Militares",
      type: "Subasta",
      status: "Activa",
      priority: "P1",
      location: { lat: 34.05, lng: -118.24, city: "California", country: "EE.UU." },
      financials: {
        investment: "\u20AC150.000",
        investment_num: 150000,
        resale: "\u20AC250.000",
        resale_num: 250000,
        margin: "40.0%",
        roi: "66.7%",
        roi_num: 66.7,
        payback: "2-3 meses",
        risk: "Bajo"
      },
      technical: {
        assets: "Generadores militares di\u00e9sel silenciosos (AMPS, Cummins), camiones t\u00e1cticos AM General (HMMWV), veh\u00edculos de log\u00edstica de excedentes militares.",
        maintenance: "Mantenimiento estricto del Departamento de Defensa de EE.UU. (DoD).",
        manual_available: "Manuales t\u00e9cnicos militares oficiales (TM) de dominio p\u00fablico.",
        condition: "Muy buena. Excedentes DoD mantenidos con est\u00e1ndares militares."
      },
      logistics: {
        extraction_cost: "\u20AC15.000 (log\u00edstica en bases militares)",
        transport_type: "Transporte terrestre militar certificado / Contenedor mar\u00edtimo",
        customs_info: "US\u2192LATAM: Requiere certificado EUC (End User Certificate) para exportaci\u00f3n de ciertos veh\u00edculos.",
        time_estimate: "3-4 meses debido a tr\u00e1mites EUC"
      },
      marketing: {
        potential_clients: ["Empresas mineras/agr\u00edcolas LATAM", "Compa\u00f1\u00edas el\u00e9ctricas de emergencia", "Coleccionistas de veh\u00edculos militares"],
        buyer_personas: ["Responsables de seguridad y contingencia", "Directores de log\u00edstica remota"],
        USP: "Generadores Cummins de alta resistencia y fiabilidad militar a una fracci\u00f3n del precio civil equivalente."
      },
      contacts: [
        { name: "GovPlanet Gov Support", role: "Excedentes Militares", email: "govsupport@govplanet.com", phone: "+1 800 211 3983" }
      ],
      links: [
        { label: "GovPlanet US Military Surplus", url: "https://www.govplanet.com" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=1200&q=80", caption: "Generadores di\u00e9sel de gran capacidad" },
        { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80", caption: "Veh\u00edculos t\u00e1cticos AM General" },
        { url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80", caption: "Excedentes log\u00edsticos DoD" }
      ],
      pdf_dossier: "",
      documentation: {
        manuals: "Manuales t\u00e9cnicos militares oficiales (DoD) disponibles online.",
        maintenance_logs: "Registros de mantenimiento preventivo militar completo."
      }
    },
  ]
};
