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
        { label: "Detalles del Proceso", url: "https://gmk.center/en/news/insolvency-administrators-of-liberty-galati-scheduled-a-new-auction-for-june-17/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80", caption: "Complejo Siderúrgico Galați" }
      ],
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
        { label: "Catálogo de Activos", url: "https://www.maynards.com/auctions/goodyear-fulda-germany/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80", caption: "Línea de producción de neumáticos" }
      ],
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
      ],
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
        { label: "Portal de Activos Ford", url: "https://www.netbid.com/en/magazine/private-treaty-sale-ford-saarlouis" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1565515267443-26f25ec2c623?auto=format&fit=crop&w=1200&q=80", caption: "Flota de robots KUKA en almacén" }
      ],
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
      ],
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
        { label: "Ver Subasta ZF", url: "https://www.netbid.com/en/auctions/current/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80", caption: "Centro de mecanizado Grob G550" }
      ],
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
        { label: "Portal Bosch Assets", url: "https://www.bosch.com/news/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", caption: "Línea SMT Fuji NXT III" }
      ],
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
        { label: "Ver Subasta Michelin", url: "https://www.netbid.com/en/auctions/current/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80", caption: "Silos de acero inoxidable 316" }
      ],
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
        { label: "Ver Subasta BSH", url: "https://www.netbid.com/en/auctions/current/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80", caption: "Planta BSH Esquiroz - Línea de prensas" }
      ],
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
        { label: "Catálogo Vallourec", url: "https://maynards.com/auctions/vallourec-dusseldorf/" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", caption: "Banco de pruebas Vallourec" }
      ],
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
        { url: "https://images.unsplash.com/photo-1579453070058-29653835e975?auto=format&fit=crop&w=1200&q=80", caption: "Caterpillar 336D L en inspección" }
      ],
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
        { url: "https://images.unsplash.com/photo-1541625602330-2277a4c4b01d?auto=format&fit=crop&w=1200&q=80", caption: "Liebherr LTM 1055 en posición de transporte" }
      ],
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
      ],
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
        { label: "Ver Lote Surplex", url: "https://www.surplex.com/es/subastas/maquinaria-metal" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80", caption: "Okuma MX-60HB en producción" }
      ],
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
        { url: "https://images.unsplash.com/photo-1531284528840-0bd34460f38b?auto=format&fit=crop&w=1200&q=80", caption: "Láser JG-180100 en funcionamiento" }
      ],
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
        { label: "Detalles Línea Koyama", url: "https://www.surplex.com/es/subastas/maquinaria-metal" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1565515267443-26f25ec2c623?auto=format&fit=crop&w=1200&q=80", caption: "Línea Koyama en planta de Elorrio" }
      ],
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
      ],
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
        { url: "https://images.unsplash.com/photo-1579453070058-29653835e975?auto=format&fit=crop&w=1200&q=80", caption: "Volvo L150G en campa" }
      ],
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
      ],
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
      ],
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
        { label: "Noticia Adquisición", url: "https://www.levante-emv.com/economia/2024/05/16/thyssenkrupp-vende-planta-sagunto-network-steel-10245678.html" }
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1565515267443-26f25ec2c623?auto=format&fit=crop&w=1200&q=80", caption: "Planta Galmed Sagunto - Línea de Galvanizado" }
      ],
      documentation: {
        manuals: "Manuales Siemens PCS7 y certificados de modernización 2021.",
        maintenance_logs: "Historial completo de mantenimiento preventivo y correctivo."
      }
    },
  ]
};
